'use client';

import s from './style.module.scss';
import WorkHeader from '@/components/Work/header';
import WorkSideBar from '@/components/Work/sideBar';
import WorkWindow from '@/components/Work/window';
import WorkBottomBar from '@/components/Work/bottomBar';
import { useEffect } from 'react';
import { useSceneStore } from '@/stores/useSceneStore';
import { useEditorStore } from '@/stores/useEditStore';
import toast from 'react-hot-toast';

export default function WorkList() {
  const { undo, redo } = useSceneStore();
  const { clearSelection } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC to clear selection
      if (event.key === 'Escape') {
        clearSelection();
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      
      // Cmd+Z or Ctrl+Z for undo
      if (isCmdOrCtrl && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        toast('Undo', { position: 'bottom-center', duration: 1000 });
      }
      // Cmd+Shift+Z or Cmd+Y (Mac) / Ctrl+Y or Ctrl+Shift+Z (Windows/Linux) for redo
      else if (
        (isCmdOrCtrl && event.shiftKey && event.key === 'z') ||
        (isMac && event.metaKey && event.key === 'y') ||
        (!isMac && event.ctrlKey && event.key === 'y')
      ) {
        event.preventDefault();
        redo();
        toast('Redo', { position: 'bottom-center', duration: 1000 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, clearSelection]);

  return (
    <div className={s.container}>
      <WorkHeader/>
      <div className={s.contents}>
        <div className={s.three}>
          <div className={s.window}>
            <WorkWindow/>
          </div>
          <div className={s.add}>
            <WorkBottomBar/>
          </div>
        </div>
        <WorkSideBar/>
      </div>
    </div>
  );
}