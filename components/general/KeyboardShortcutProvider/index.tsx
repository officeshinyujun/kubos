"use client";

import React from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcut';

interface KeyboardShortcutProviderProps {
  children: React.ReactNode;
}

const KeyboardShortcutProvider: React.FC<KeyboardShortcutProviderProps> = ({ children }) => {
  useKeyboardShortcuts();
  return <>{children}</>;
};

export default KeyboardShortcutProvider;
