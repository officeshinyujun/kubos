'use client'

import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // Or any other theme you prefer
import styles from './style.module.scss';

interface CodeViewerProps {
  reactCode: string;
  vanillaCode: string;
}

export default function CodeViewer({ reactCode, vanillaCode }: CodeViewerProps) {
  const reactCodeRef = useRef<HTMLElement>(null);
  const vanillaCodeRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<'react' | 'vanilla'>('react'); // Removed 'demo'

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

  return (
    <div className={styles.codeViewerContainer}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'react' ? styles.active : ''}`}
          onClick={() => setActiveTab('react')}
        >
          React Three.js Code (Current Window)
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'vanilla' ? styles.active : ''}`}
          onClick={() => setActiveTab('vanilla')}
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
        {activeTab === 'vanilla' && (
          <pre>
            <code ref={vanillaCodeRef} className="language-javascript">
              {vanillaCode}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
}