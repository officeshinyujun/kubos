# Blender-style Modeling Adoption Plan for `kubos`

## Goal

Bring the most useful Blender-style modeling workflows into this project's existing browser-based 3D editor, but make them easier to learn and safer to use than raw Blender. The target outcome is not "Blender in the browser". It is a focused **box-modeling oriented editor** built on the current `@react-three/fiber` + Zustand architecture.

## Current repo baseline

### Existing strengths

- `app/work/page.tsx` already provides a real editor shell with dual viewports.
- `stores/useSceneStore.ts` already owns scene mutations, object lifecycle, and scene-level undo/redo.
- `stores/useEditStore.ts` already owns selection, orbit enablement, active camera, and transform mode.
- `components/Work/SharedScene.tsx` centralizes rendering for meshes, lights, cameras, and GLTF.
- `components/Work/model/index.tsx` + `EdgeBox` already provide clickable selection plus primitive-specific resize affordances.
- `components/Work/sideBar/index.tsx` and `components/Work/EditPanel/index.tsx` already provide the outliner/property-inspector pattern.
- `hooks/useArrowMoveControl.ts` already proves keyboard-driven transforms and grid snapping are acceptable UX in this codebase.

### Hard limitation today

The editor currently supports **object-level editing**, not **mesh topology editing**.

That means the current system can:

- add primitives
- select scene objects
- move / rotate some objects
- resize primitives
- edit light/camera parameters

But it cannot yet:

- select vertices / edges / faces
- enter a true Edit Mode for meshes
- extrude / inset / bevel / loop cut mesh topology
- keep mesh-edit history separate from object transforms

## Product direction

### What to copy from Blender

Import the **interaction model**, not the full feature surface:

1. **Object Mode vs Edit Mode**
2. **Move / Rotate / Scale** as universal tools
3. **Selection submodes** in Edit Mode: vertex / edge / face
4. **Snapping, pivot, and orientation** as explicit controls
5. A short list of modeling operations:
   - Extrude
   - Inset
   - Loop Cut
   - Bevel
   - Knife later, not first

### What to copy from beginner-friendly editors like Blockbench

1. **Mode-based simplification**
2. **Visible toolbar first, hotkeys second**
3. **Big, obvious controls with numeric fallback**
4. **Hideable side panels / focus mode**
5. **Preset keymaps** later if adoption grows

### What not to copy initially

Avoid the parts of Blender that explode complexity early:

- advanced mesh operators beyond the core four
- UV editing as part of the first rollout
- modifier stacks
- boolean-heavy workflows
- custom transform orientations beyond a tiny starter set
- animation and rigging overlap
- dense menu hierarchies

## Recommendation: define the first release narrowly

The first successful version should be:

> A novice-friendly browser box-modeling editor for low-complexity mesh editing.

That means the first version should optimize for:

- cubes and other primitive starts
- blockout and hard-surface basics
- clear mode switching
- predictable undo/redo
- obvious selection feedback
- low UI clutter

It should not try to compete with Blender's full breadth.

## Architecture proposal

### 1. Keep scene/object state and mesh-edit state separate

Do **not** force topology editing into the current primitive-only `ModelType` shape.

Create a dedicated editable mesh representation, for example:

- `EditableMesh`
  - vertices
  - edges
  - faces
  - normals or derived normal strategy
  - selection state references
  - optional derived preview/cache

Then extend mesh scene objects so a mesh can be either:

- primitive-backed (`box`, `sphere`, etc.)
- editable-topology-backed (`editableMesh`)

#### Required transition rule

When a user converts a primitive into an editable mesh:

1. the scene object keeps the same stable object identity
2. the primitive render source is replaced by editable topology as the new source of truth
3. object-level transform fields (`locate`, `rotate`, `scale`) remain on the scene object
4. primitive-only parameters are either:
   - removed after conversion, or
   - kept as legacy metadata but never used again for rendering/editing

Recommendation: after conversion, store both only temporarily for migration/debug visibility, but render exclusively from `editableMesh`. Do not try to keep primitive params and editable topology co-authoritative.

This matters because Blender-style operations mutate topology, not just object transform.

### 2. Add a true editor mode system

`useEditStore.ts` should evolve from only transform mode into a broader editor mode model.

Recommended additions:

- `editorMode: 'object' | 'edit'`
- `selectionMode: 'object' | 'vertex' | 'edge' | 'face'`
- `activeTool: 'select' | 'move' | 'rotate' | 'scale' | 'extrude' | 'inset' | 'loopCut' | 'bevel'`
- `snapEnabled: boolean`
- `snapIncrement: number`
- `pivotMode: 'median' | 'individualOrigins' | 'cursor'`
- `orientationMode: 'global' | 'local'`

This gives one place for viewport, toolbar, inspector, and keyboard behavior to stay in sync.

### 3. Unify undo/redo into a command-based history

Right now undo is split between:

- `useSceneStore.ts`
- `useStackStore.ts`

That split will become brittle as soon as topology editing arrives.

Replace it with a single history model based on editor commands:

- `AddObjectCommand`
- `TransformObjectCommand`
- `EnterEditModeCommand`
- `ExtrudeFacesCommand`
- `InsetFacesCommand`
- `BevelEdgesCommand`
- `LoopCutCommand`

Each command should define:

- apply
- revert
- merge policy for repeated drags if needed

This is the most important technical prerequisite for reliable modeling UX.

### 4. Promote meshes to a first-class transform target

Lights/cameras already show the preferred pattern: render object → allow selection → wire `TransformControls` → update store.

Meshes should follow the same path:

- object mode uses transform gizmos for meshes too
- `EdgeBox` becomes either:
  - a temporary beginner affordance, or
  - a "quick resize" tool for primitive-only mode

Recommendation: keep `EdgeBox` for primitive quick edits, but do not make it the foundation of the modeling system.

Important clarification: meshes do **not** currently have a general gizmo path in this repo. `Model` supports click selection, and `EdgeBox` supports primitive resize/move-like affordances, but there is no existing mesh `TransformControls` implementation to extend directly.

### 5. Add a dedicated mesh editing layer in rendering

`SharedScene.tsx` should stay the scene dispatcher, but editable meshes need their own renderer path, for example:

- `EditableMeshRenderer`
  - builds `BufferGeometry`
  - renders vertex/edge/face selection overlays
  - handles edit-mode picking
  - exposes active tool interactions

This prevents `Model` from turning into an overgrown primitive + topology hybrid.

## UX plan: make it easier than Blender

### Principle 1: visible tools before shortcuts

Every core modeling action should exist in a visible toolbar before relying on hotkeys.

Use hotkeys as acceleration, not discoverability.

### Principle 2: only two top-level modes at first

Start with:

- **Object**
- **Edit**

Do not add Paint / UV / Animate / Shader authoring into the modeling workflow itself.

### Principle 3: one small modeling toolbar

Recommended initial toolbar:

- Select
- Move
- Rotate
- Scale
- Extrude
- Inset
- Loop Cut
- Bevel
- Snap toggle
- Pivot selector
- Orientation selector

### Principle 4: selection modes should be explicit buttons

In Edit Mode, show visible toggles for:

- Vertex
- Edge
- Face

Support `1 / 2 / 3` hotkeys later, but keep the buttons visible.

### Principle 5: property inspector should become context-aware

Extend `EditPanel` so it changes based on mode:

- Object Mode: position / rotation / scale / object metadata
- Edit Mode + face selection: extrude amount, inset thickness, bevel width, segment count where relevant

### Principle 6: novice-safe defaults

Use strict defaults so users succeed without understanding 3D jargon:

- snap on by default in early modeling flows
- global orientation by default
- median pivot by default
- selected element highlighting with high contrast
- single primary tool active at a time

### Principle 7: focus mode

Add a "Focus Model" toggle to collapse side UI while editing.

This copies the useful part of Blender/Blockbench focus patterns without adding full workspace management.

## Feature rollout plan

## Phase 0 — foundation cleanup

### Objective

Stabilize editor state so modeling features do not get bolted onto inconsistent foundations.

### Scope

1. Merge undo/redo into one history system
2. Expand `useEditStore.ts` into a real mode/tool store
3. Add mesh transform gizmo support in object mode
4. Normalize selection ownership so sidebar and viewport use the same rules
5. Define a typed editable-mesh data model

### Deliverable

An editor that still behaves like today, but has the internal primitives needed for topology editing.

### QA scenario

1. Add a cube from the current bottom bar.
2. Select it from both viewport and sidebar.
3. Move, rotate, and scale it using the unified object-mode controls.
4. Trigger undo/redo repeatedly from keyboard and UI entry points if present.
5. Verify the object returns to the exact previous transform states without diverging between viewport state and store state.

Expected result:

- one history system owns all object transforms
- selection state remains stable
- no behavior depends on `useStackStore.ts`

## Phase 1 — object mode polish

### Objective

Make current object editing feel coherent before introducing edit topology.

### Scope

1. Add mesh `TransformControls`
2. Add scale mode to the current transform system
3. Add visible snap toggle + increment control
4. Add pivot/orientation controls with small initial option sets
5. Refine outliner selection behavior
6. Add multi-select only if cheap; otherwise defer

### Deliverable

A strong object-mode workflow that already feels more like a lightweight DCC editor.

### QA scenario

1. Create two mesh objects and one light.
2. Select each in object mode.
3. Use gizmos to move/rotate/scale all supported object types.
4. Toggle snapping on/off and change increment.
5. Toggle pivot/orientation settings across the supported starter options.

Expected result:

- meshes now behave like first-class transform targets
- snapping visibly affects gizmo movement
- pivot/orientation controls update editor behavior consistently
- lights/cameras/meshes share one coherent transform model

## Phase 2 — true Edit Mode MVP

### Objective

Introduce topology-aware editing for one mesh class first.

### Scope

1. Editable mesh conversion from cube primitive
2. Edit Mode toggle
3. Vertex / edge / face sub-selection
4. Face extrude
5. Inset faces
6. Edge bevel
7. Loop cut on quad-friendly topology only

### Constraints

- Restrict support to simple manifold polygon meshes first
- Allow failure/disable states when topology is unsupported
- Prefer visible limitations to silent corruption

### Deliverable

Users can start from a cube and perform a basic Blender-like box-modeling workflow in the browser.

### QA scenario

1. Create a cube primitive.
2. Convert it to editable topology.
3. Enter Edit Mode.
4. Switch among vertex / edge / face selection modes.
5. Select faces and perform extrude, inset, bevel, and loop cut.
6. Undo and redo each topology change individually.
7. Return to object mode and confirm the edited mesh still renders correctly.

Expected result:

- converted mesh keeps its object identity
- editable topology, not primitive params, drives rendering
- each operation produces visible and reversible topology changes
- unsupported topologies fail with explicit disabled UI or warning states

## Phase 3 — easy-mode UX layer

### Objective

Make the new modeling power feel approachable instead of intimidating.

### Scope

1. Toolbar-first modeling flow
2. Context tooltips with short verbs
3. Bottom-bar evolution from object creation palette into create + tools palette
4. EditPanel mode-aware controls
5. Focus mode toggle
6. Tutorial expansion using `app/tutorial/fsm.ts` and `app/tutorial/steps.ts`

### Deliverable

New users can learn the workflow inside the product without prior Blender fluency.

### QA scenario

1. Start from a clean session with no prior app knowledge.
2. Follow tutorial/onboarding prompts only.
3. Create a cube, enter Edit Mode, and extrude one face.
4. Toggle focus mode and return to full UI.
5. Complete the flow without needing hidden hotkeys.

Expected result:

- the visible toolbar is enough to finish the beginner workflow
- tutorial steps match real UI locations and states
- focus mode reduces clutter without hiding required actions

## Phase 4 — advanced operations, selectively

### Only add after usage proves demand

- Knife tool
- multi-object edit helpers
- mirror workflow
- basic booleans if robust enough
- preset keymaps (Blender / Maya style)
- import existing meshes into editable topology where feasible

### QA scenario

Each advanced feature must ship only with:

1. a clearly defined scope boundary
2. explicit unsupported cases
3. undo/redo coverage
4. one tutorial or help entry if exposed in beginner-facing UI

## Concrete file-by-file implementation direction

### State and domain

- `stores/useEditStore.ts`
  - extend with editor mode, selection mode, active tool, snap/pivot/orientation
- `stores/useSceneStore.ts`
  - move toward command-based history and editable mesh mutation entry points
- `stores/useStackStore.ts`
  - remove or absorb into unified history
- `types/model/modelType.ts`
  - add editable mesh variants
- `types/model/modelDefinitions.ts`
  - split primitive definitions from editable mesh definitions

### Rendering and interaction

- `components/Work/SharedScene.tsx`
  - dispatch editable meshes to a dedicated renderer
- `components/Work/model/index.tsx`
  - keep primitive rendering lean; do not overload it with all edit-mode logic
- `components/Work/model/EdgeBox/index.tsx`
  - reposition as primitive-resize helper, not general modeling core
- new `components/Work/model/EditableMeshRenderer/*`
  - selection overlays
  - topology picking
  - tool interactions

### Workspace UI

- `components/Work/bottomBar/index.tsx`
  - evolve from create palette to create/tools strip or split create vs tools
- `components/Work/sideBar/index.tsx`
  - keep structure/properties tabs; add stronger mode awareness
- `components/Work/EditPanel/index.tsx`
  - make controls conditional on object mode vs edit mode
- optional new `components/Work/Toolbar/*`
  - safest place for Blender-inspired visible tool controls

### Input

- `hooks/useArrowMoveControl.ts`
  - either narrow to nudge behavior only or absorb into a central interaction system
- `hooks/useKeyboardShortcut.ts`
  - evolve into a proper editor keymap registry

## Suggested initial command set

For MVP, support only these actions as first-class commands:

- select object
- enter object mode
- enter edit mode
- set selection mode (vertex/edge/face)
- move object
- rotate object
- scale object
- extrude face
- inset face
- bevel edge
- loop cut
- delete selection
- undo
- redo

If a feature cannot fit into this command model cleanly, it is probably too early for MVP.

## Success criteria

The effort is successful when all of the following are true:

1. A user can create a cube and understand how to start editing it within 30 seconds.
2. A user can switch between object and edit mode without confusion.
3. A user can select faces and perform extrude/inset/bevel/loop cut without reading Blender docs.
4. Undo/redo reliably reverts both transforms and topology edits.
5. The UI exposes the main path visually; hotkeys are optional accelerators.
6. The codebase keeps scene rendering, editor state, and mesh topology concerns separated.

## Biggest risks and mitigations

### Risk 1: trying to model topology inside primitive-only data structures

Mitigation: introduce editable mesh data types early.

### Risk 2: fragmented history causes broken undo

Mitigation: unify history before shipping Edit Mode.

### Risk 3: Blender mimicry becomes too complex for novices

Mitigation: visible toolbar, progressive disclosure, fewer modes, fewer operations.

### Risk 4: picking and topology overlay logic becomes unstable

Mitigation: limit MVP to simple quad-friendly meshes and face-first workflows.

### Risk 5: current UI surfaces get overloaded

Mitigation: add a dedicated toolbar instead of stuffing every action into the inspector.

## Recommended immediate next build steps

1. Design the `EditableMesh` TypeScript domain model.
2. Replace split undo systems with one command history.
3. Add mesh `TransformControls` in object mode.
4. Add `editorMode`, `selectionMode`, and `activeTool` to `useEditStore.ts`.
5. Create a dedicated toolbar component for visible modeling tools.
6. Prototype cube-only Edit Mode with face selection and extrude.
7. Add tutorial steps for object mode → edit mode → extrude.

## Verification strategy

Before implementation of each phase is considered complete:

1. run the phase QA scenario end-to-end
2. verify state changes at the store layer where relevant
3. verify undo/redo across both viewport interaction and panel-driven interaction
4. verify no primitive-backed mesh accidentally renders from stale primitive params after editable conversion
5. verify tutorial/highlight selectors still match the live UI when onboarding is touched

## Final recommendation

Do **not** start by porting Blender feature-for-feature.

Start by making this project excellent at one narrow promise:

> "Simple Blender-style box modeling in the browser, with much easier onboarding."

That promise fits the current architecture, matches the repo's existing editor patterns, and gives a realistic path to something users can actually learn.
