'use client'

import { useEffect } from 'react';

interface FocusToggleProps {
  onToggle: (focused: boolean) => void;
  isFocused: boolean;
}

export default function FocusToggle({ onToggle, isFocused }: FocusToggleProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        onToggle(!isFocused);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle, isFocused]);

  return (
    <button
      onClick={() => onToggle(!isFocused)}
      title="Focus Mode (Shift+Space)"
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 10,
        padding: '4px 8px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '11px',
        backgroundColor: isFocused ? '#ff6b4a' : '#2a2a2a',
        color: isFocused ? '#fff' : '#aaa',
        opacity: 0.8,
      }}
    >
      {isFocused ? '◀ 패널 보기' : '▶ 집중 모드'}
    </button>
  );
}
