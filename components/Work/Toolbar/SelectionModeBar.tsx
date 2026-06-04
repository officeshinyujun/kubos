'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditStore';
import { useSceneStore } from '@/stores/useSceneStore';
import s from './style.module.scss';

export default function SelectionModeBar() {
  const { selectionMode, setSelectionMode, selectedObjectId } = useEditorStore();
  const { objects } = useSceneStore();

  const selectedObject = objects.find(o => o.name === selectedObjectId);
  const isEditableMesh = selectedObject?.type === 'editableMesh';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditableMesh) return;
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
  }, [isEditableMesh, setSelectionMode]);

  if (!isEditableMesh) return null;

  const modes = [
    { key: 'vertex' as const, label: 'Vertex', shortcut: '1' },
    { key: 'edge' as const, label: 'Edge', shortcut: '2' },
    { key: 'face' as const, label: 'Face', shortcut: '3' },
  ];

  return (
    <div className={s.container}>
      {modes.map(({ key, label, shortcut }) => (
        <button
          key={key}
          onClick={() => setSelectionMode(key)}
          className={`${s.modeButton} ${selectionMode === key ? s.modeButtonActive : ''}`}
          title={`${label} (${shortcut})`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
