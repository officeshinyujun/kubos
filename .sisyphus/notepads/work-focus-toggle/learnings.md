## Learnings

- `app/work/page.tsx` already owns the viewport/sidebar split, so focus mode can stay local to the page with a simple `useState` flag.
- The viewport container (`.three`) needs `position: relative` so an absolute-positioned toggle can live inside it without affecting layout.
- The project lint target is enough to verify the touched TSX files when LSP diagnostics are unavailable in the workspace.
