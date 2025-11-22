'use client'

import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // Or any other theme you prefer
import styles from './style.module.scss';
import toast from 'react-hot-toast'; // Import toast for user feedback

interface CodeViewerProps {
  reactCode: string;
  vanillaCode: string;
}

export default function CodeViewer({ reactCode, vanillaCode }: CodeViewerProps) {
  const reactCodeRef = useRef<HTMLElement>(null);
  const vanillaCodeRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<'react' | 'vanilla'>('react');
  const [copied, setCopied] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [vanillaIframeUrl, setVanillaIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (reactCodeRef.current) {
      hljs.highlightElement(reactCodeRef.current);
    }
  }, [reactCode]);

  useEffect(() => {
    if (vanillaCodeRef.current) {
      hljs.highlightElement(vanillaCodeRef.current);
    }
  }, [vanillaCode]);

  useEffect(() => {
    if (activeTab === 'vanilla' && showIframe && vanillaCode) {
      const htmlContent = generateVanillaHtml(vanillaCode);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setVanillaIframeUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      if (vanillaIframeUrl) {
        URL.revokeObjectURL(vanillaIframeUrl);
        setVanillaIframeUrl(null);
      }
    }
  }, [activeTab, showIframe, vanillaCode]);

  const generateVanillaHtml = (code: string) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Vanilla Three.js Scene</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script type="module">
        ${code}
    </script>
</body>
</html>`;
  };

  const handleCopy = async () => {
    const codeToCopy = activeTab === 'react' ? reactCode : vanillaCode;
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy code: ', err);
      toast.error('Failed to copy code.');
    }
  };

  const handleOpenInNewWindow = () => {
    if (vanillaIframeUrl) {
      window.open(vanillaIframeUrl, '_blank');
    }
  };

  return (
    <div className={styles.codeViewerContainer}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'react' ? styles.active : ''}`}
          onClick={() => { setActiveTab('react'); setShowIframe(false); }}
        >
          React Three.js Code (Current Window)
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'vanilla' ? styles.active : ''}`}
          onClick={() => { setActiveTab('vanilla'); setShowIframe(false); }}
        >
          Vanilla Three.js Code (Converted)
        </button>
      </div>

      <div className={styles.codeContent}>
        {activeTab === 'react' && (
          <pre>
            <code ref={reactCodeRef} className="language-javascript">
              {reactCode}
            </code>
          </pre>
        )}
        {activeTab === 'vanilla' && !showIframe && (
          <pre>
            <code ref={vanillaCodeRef} className="language-javascript">
              {vanillaCode}
            </code>
          </pre>
        )}
        {activeTab === 'vanilla' && showIframe && vanillaIframeUrl && (
          <div className={styles.iframeWrapper}>
            <iframe
              src={vanillaIframeUrl}
              title="Vanilla Three.js Preview"
              className={styles.vanillaIframe}
            />
          </div>
        )}
      </div>

      <div>
      {activeTab === 'vanilla' && (
          <>
            <button
              className={`${styles.tabButton} ${showIframe ? styles.active : ''}`}
              onClick={() => setShowIframe(true)}
            >
              Preview
            </button>
            <button
              className={`${styles.tabButton} ${!showIframe ? styles.active : ''}`}
              onClick={() => setShowIframe(false)}
            >
              Code
            </button>
            {showIframe && (
              <button onClick={handleOpenInNewWindow} className={styles.openInNewWindowButton}>
                Open in New Window
              </button>
            )}
          </>
        )}
        <button onClick={handleCopy} className={styles.copyButton}>
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
    </div>
  );
}