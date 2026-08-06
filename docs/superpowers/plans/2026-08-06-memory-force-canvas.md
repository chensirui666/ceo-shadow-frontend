# Memory Force Canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Memory into a compact, backend-shaped canvas with opaque nodes, a grid, and a full-visible-graph force drag that persists only final positions.

**Architecture:** `MemoryNode` owns the backend-provided position and optional visual colour. `MemoryWorkspace` keeps the graph response and exposes one batched position-change callback. `MemoryGraph` remains the React Flow adapter and owns one transient D3-force simulation over all currently visible nodes while a node is being dragged.

**Tech Stack:** React 19, TypeScript, `@xyflow/react`, `d3-force`, Node test runner, Vite.

## Global Constraints

- Backend records, not component code, supply node IDs, labels, summaries, colours and coordinates.
- The backend-provided coordinate is the only initialization source; do not retain an ID-to-coordinate map or hash layout fallback.
- Degree 0–1/2/3/4+ maps to exactly 16/22/30/38px, calculated from complete graph edges.
- Every currently visible node takes part in force motion; the active node is pinned to the pointer and links remain limited to visible backend edges.
- A link equilibrium distance is the two node radii plus 72px. Persist only the final changed positions after the simulation cools.
- Respect `prefers-reduced-motion` by not starting automatic force animation.
- Keep the current fixture solely as API-shaped demo data because this checkout has no graph endpoint.

---

### Task 1: Make the graph model backend-shaped

**Files:**
- Modify: `src/memoryState.ts`
- Modify: `src/memoryState.test.ts`
- Modify: `src/memoryCanvasState.ts`
- Modify: `src/memoryCanvasState.test.ts`

**Interfaces:**
- Produces `MemoryPosition`, `MemoryNode.position`, and optional `MemoryNode.visual.color`.
- Produces `forceParticipantIds(nodes): Set<string>` and `changedPositions(before, after, ids): Record<string, MemoryPosition>`.
- Removes `initialMemoryPosition` and `MemoryNodeTier`.

- [ ] **Step 1: Write failing tests for data-owned coordinates and compact buckets**

```ts
assert.deepEqual([0, 1, 2, 3, 4, 9].map(memoryCanvasState.nodeDiameterForDegree), [16, 16, 22, 30, 38, 38])
assert.deepEqual(
  memoryCanvasState.changedPositions(
    { a: { x: 10, y: 10 }, b: { x: 20, y: 20 } },
    { a: { x: 10, y: 10 }, b: { x: 31, y: 17 } },
    new Set(['a', 'b']),
  ),
  { b: { x: 31, y: 17 } },
)
```

Update the graph fixture assertion so one node contains `{ position: { x: 320, y: 180 }, visual: { color: '#789abc' } }` and `visibleMemoryGraph` returns it unchanged.

- [ ] **Step 2: Run the focused tests and verify the old expectations fail**

Run: `node --test src/memoryCanvasState.test.ts src/memoryState.test.ts`

Expected: FAIL because sizes and graph node shape still use the old client-owned canvas model.

- [ ] **Step 3: Implement the smallest generic model change**

```ts
export type MemoryPosition = { x: number; y: number }
export type MemoryNode = {
  id: string
  layer: MemoryLayer
  source: string
  title: string
  summary: string
  position: MemoryPosition
  visual?: { color?: string }
}

export const forceParticipantIds = (nodes: Array<{ id: string }>) => new Set(nodes.map(({ id }) => id))
```

Move the fixture coordinates onto its records, remove tier-specific fields, and give its fixture records visual colours.

- [ ] **Step 4: Run the focused tests and TypeScript check**

Run: `node --test src/memoryCanvasState.test.ts src/memoryState.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit the model-only change**

```bash
git add src/memoryState.ts src/memoryState.test.ts src/memoryCanvasState.ts src/memoryCanvasState.test.ts
git commit -m "feat: model memory graph positions from data"
```

### Task 2: Replace the static graph with a force-driven canvas

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/components/MemoryGraph.tsx`
- Modify: `src/components/MemoryWorkspace.tsx`
- Test: `src/memoryCanvasState.test.ts`

**Interfaces:**
- `MemoryWorkspace` accepts optional `initialGraph?: MemoryGraphData` and `onPositionsCommit?: (positions: Record<string, MemoryPosition>) => void`.
- `MemoryGraph` accepts `onPositionsChange(positions)` and emits one final changed-position batch after a drag settles.
- `MemoryGraph` uses React Flow for the canvas and `d3-force` over all currently visible nodes.

- [ ] **Step 1: Add the canvas and force dependencies and ensure their types are resolvable**

Run: `npm install @xyflow/react d3-force && npm install -D @types/d3-force`

Expected: only `@xyflow/react`, `d3-force`, and D3-force TypeScript definitions are added to the lockfile and package manifests.

- [ ] **Step 2: Replace the static SVG with data-owned React Flow nodes**

```tsx
export default function MemoryWorkspace({ initialGraph = initialMemoryGraph, locale, onPositionsCommit }: Props) {
  const [graph, setGraph] = useState(initialGraph)
  const applyPositions = useCallback((positions: Record<string, MemoryPosition>) => {
    setGraph((current) => ({
      ...current,
      nodes: current.nodes.map((node) => positions[node.id] ? { ...node, position: positions[node.id] } : node),
    }))
    onPositionsCommit?.(positions)
  }, [onPositionsCommit])
}
```

Remove the SVG position table and hash fallback from `MemoryGraph`. Each React Flow node uses the matching record's `position` and a diameter derived from complete-graph degree. Existing mock upload behaviour continues to return full API-shaped nodes with a position.

- [ ] **Step 3: Drive only the active star with D3-force**

```ts
const participantIds = forceParticipantIds(flowNodes)
const simulation = forceSimulation(forceNodes)
  .force('link', forceLink(forceEdges).id((item) => item.id).distance((edge) => edge.source.radius + edge.target.radius + 72))
  .force('charge', forceManyBody().strength(-90))
  .force('collide', forceCollide((item) => item.radius + 10).strength(.85))
  .alphaDecay(.08)
```

Pin the dragged force node to the pointer on every `onNodeDrag`. On each simulation tick, copy only force-node positions into React Flow in one `requestAnimationFrame`. On `end`, compare the force node positions to their drag-start values with `changedPositions`, call `onPositionsChange` once, and stop the simulation. Pin the root to its release position so the local group cannot drift after a drag.

When reduced motion is preferred, emit the dragged node's final position in `onNodeDragStop`; do not start a simulation.

- [ ] **Step 4: Keep node rendering generic**

```tsx
<div
  aria-label={data.summary ? `${data.title}: ${data.summary}` : data.title}
  className="memory-flow-node"
  style={{ backgroundColor: data.visual?.color ?? 'var(--memory-node-fallback)', height: data.diameter, width: data.diameter }}
>
  <span className="memory-flow-tooltip"><strong>{data.title}</strong><small>{data.summary}</small></span>
</div>
```

Remove tier classes and the core-only label. Preserve invisible handles, selection disabling, filters, pan, zoom, and fit controls. Add React Flow's `Background` with the line variant and a 20px gap.

- [ ] **Step 5: Verify graph data and force-input helpers**

Run: `npm test && npm run typecheck`

Expected: all tests PASS and TypeScript recognises the D3 callback types without casts to `any`.

- [ ] **Step 6: Commit the interactive canvas change**

```bash
git add package.json package-lock.json src/components/MemoryGraph.tsx src/components/MemoryWorkspace.tsx src/memoryCanvasState.test.ts
git commit -m "feat: add force-driven memory canvas"
```

### Task 3: Make the compact force canvas visually legible

**Files:**
- Modify: `src/index.css`
- Test: browser verification only

**Interfaces:**
- `.memory-flow-node` is opaque at every degree.
- `.memory-flow-tooltip` exposes every backend record's meaning on hover or keyboard focus.

- [ ] **Step 1: Remove tier opacity and resize visual treatment**

```css
.memory-flow-node { border: 1.5px solid #fffefd; opacity: 1; }
.memory-flow-tooltip { opacity: 0; pointer-events: none; }
.memory-flow-node:hover .memory-flow-tooltip,
.memory-flow .react-flow__node:focus-visible .memory-flow-tooltip { opacity: 1; }
```

Delete the leaf/connection opacity selectors and the core-label selector. Keep the existing reduced-motion CSS, existing canvas height, and controls.

- [ ] **Step 2: Build and interact with the actual page**

Run: `npm run build`

At desktop and 390px width: confirm grid visibility, fully opaque 16–38px nodes, tooltip title/summary, canvas pan/zoom/fit, full-visible-graph fluid motion, stretch-and-settle edges, and one drag-end position batch.

Expected: Vite build succeeds and the browser console has no errors or warnings.

- [ ] **Step 3: Commit the style and verification result**

```bash
git add src/index.css
git commit -m "style: compact memory canvas nodes"
```
