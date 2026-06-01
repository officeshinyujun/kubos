'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditStore';

export default function SelectionModeBar() {
  const { editorMode, selectionMode, setSelectionMode } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editorMode !== 'edit') return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === '1') {
        e.preventDefault();
        setSelectionMode('vertex');
      } else if (e.key === '2') {
        e.preventDefault();
        setSelectionMode('edge');
      } else if (e.key === '3') {
        e.preventDefault();
        setSelectionMode('face');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorMode, setSelectionMode]);

  if (editorMode !== 'edit') return null;

  const modes = [
    { key: 'vertex' as const, label: 'Vertex', shortcut: '1' },
    { key: 'edge' as const, label: 'Edge', shortcut: '2' },
    { key: 'face' as const, label: 'Face', shortcut: '3' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        padding: '4px 8px',
        background: '#1a1a1a',
        borderRadius: '6px',
      }}
    >
      {modes.map(({ key, label, shortcut }) => (
        <button
          key={key}
          onClick={() => setSelectionMode(key)}
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: selectionMode === key ? 600 : 400,
            backgroundColor: selectionMode === key ? '#ff6b4a' : '#2a2a2a',
            color: selectionMode === key ? '#fff' : '#aaa',
          }}
          title={`${label} (${shortcut})`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
