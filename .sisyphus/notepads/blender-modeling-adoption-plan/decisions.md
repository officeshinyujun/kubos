## 2026-06-01
- Kept `ModeToggle` local to `components/Work/header` and used inline styles to minimize surface area for a small header control.
- Reused `useEditorStore` mode switching as-is and derived edit availability from scene object type rather than introducing new store state.
- Kept the bottom bar change self-contained in `components/Work/bottomBar/index.tsx` and used the existing `useEditorStore` API to drive edit-mode tool selection.
