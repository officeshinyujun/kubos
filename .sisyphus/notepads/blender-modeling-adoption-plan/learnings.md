## 2026-06-01
- Work header toggles are currently simple client-side controls, so a self-contained toggle component fits cleanly without changing the store API.
- Selected objects may live inside nested groups, so editability checks should recurse through `children` instead of assuming a flat scene list.
- The new selection mode bar can safely own its own keydown listener because it only needs `editorMode` and `setSelectionMode`, and it can stay hidden outside edit mode.
- The bottom bar can switch palettes cleanly by branching on `editorMode` inside the component, while keeping the object-creation palette unchanged in the object-mode branch.
- Keyboard shortcuts for modeling tools can read Zustand state via `useEditorStore.getState()` inside the global handler, which keeps the hook independent from React render timing and avoids extra subscriptions.
