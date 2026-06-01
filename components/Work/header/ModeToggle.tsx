'use client'

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditStore';
import { useSceneStore } from '@/stores/useSceneStore';
import s from './style.module.scss';
import type { SceneObject } from '@/types/model/modelType';

const findObject = (objects: SceneObject[], id: string): SceneObject | null => {
  for (const obj of objects) {
    if (obj.name === id) return obj;
    if (obj.type === 'group') {
      const found = findObject(obj.children, id);
      if (found) return found;
    }
  }

  return null;
};

export default function ModeToggle() {
  const { editorMode, setEditorMode, selectedObjectId } = useEditorStore();
  const objects = useSceneStore((state) => state.objects);

  const selectedObject = selectedObjectId ? findObject(objects, selectedObjectId) : null;
  const canEdit = selectedObject?.type === 'mesh' || selectedObject?.type === 'editableMesh';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      e.preventDefault();

      if (editorMode === 'object' && canEdit) {
        setEditorMode('edit');
        return;
      }

      if (editorMode === 'edit') {
        setEditorMode('object');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canEdit, editorMode, setEditorMode]);

  return (
    <div className={s.modeToggle}>
      <button
        onClick={() => setEditorMode('object')}
        className={`${s.modeButton} ${editorMode === 'object' ? s.activeObject : ''}`}
      >
        Object
      </button>
      <button
        onClick={() => canEdit && setEditorMode('edit')}
        disabled={!canEdit}
        className={`${s.modeButton} ${editorMode === 'edit' ? s.activeEdit : ''}`}
      >
        Edit
      </button>
    </div>
  );
}
