// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';
import { undo, redo } from '@/stores/useSceneStore';
import { useEditorStore } from '@/stores/useEditStore';
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
      else {
        const editorMode = useEditorStore.getState().editorMode;
        const setActiveTool = useEditorStore.getState().setActiveTool;

        if (editorMode === 'edit') {
          if (e.key === 'g' || e.key === 'G') {
            e.preventDefault();
            setActiveTool('move');
          }
          else if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveTool('rotate');
          }
          else if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveTool('scale');
          }
          else if (e.key === 'e' || e.key === 'E') {
            e.preventDefault();
            setActiveTool('extrude');
          }
          else if (e.key === 'i' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveTool('inset');
          }
          else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            setActiveTool('bevel');
          }
          else if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            setActiveTool('loopCut');
          }

          if (e.key === 'x' || e.key === 'X' || e.key === 'Delete') {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('mesh-delete-selection'));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};
