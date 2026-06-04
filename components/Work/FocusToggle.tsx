'use client'

import { useEffect } from 'react';
import s from './FocusToggle.module.scss';

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
      className={`${s.focusButton} ${isFocused ? s.focusButtonActive : ''}`}
    >
      {isFocused ? '◀ 패널 보기' : '▶ 집중 모드'}
    </button>
  );
}
