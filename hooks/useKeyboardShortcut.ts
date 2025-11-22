// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';
import { undo, redo } from '@/stores/useSceneStore';
import toast from 'react-hot-toast';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        toast('Undo', { position: 'bottom-center', duration: 1000 });
      }
      // Cmd+Y or Cmd+Shift+Z for redo
      else if (
        (e.metaKey && e.key === 'y') || 
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        redo();
        toast('Redo', { position: 'bottom-center', duration: 1000 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};