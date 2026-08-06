# Memory Canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Memory SVG with a draggable React Flow canvas whose node diameter is determined by its total direct-edge count and whose direct neighbours follow a node drag.

**Architecture:** Keep the existing Memory domain model and filtering unchanged. Add one pure canvas-state module for degree buckets and neighbour movement, then adapt `MemoryGraph` to React Flow while `MemoryWorkspace` owns ephemeral node positions.

**Tech Stack:** React 19, TypeScript, `@xyflow/react`, existing Node test runner, Vite.

## Global Constraints

- Add only `@xyflow/react`; do not add a force-layout or persistence library.
- Node diameter uses the complete graph, never the filtered edge list: degree 1/2/3/4+ maps to 24/36/48/60px.
- A node drag moves only directly connected visible nodes by the same pointer delta; second-hop nodes never move.
- Canvas positions are session-only; source colours, filters, search, empty states and reduced-motion support remain unchanged.
- This checkout has no `.git` directory, so do not attempt commits.

---

### Task 1: Define and test the canvas interaction rules

**Files:**
- Create: `src/memoryCanvasState.ts`
- Create: `src/memoryCanvasState.test.ts`

**Interfaces:**
- Produces `nodeDiameterForDegree(degree: number): number`.
- Produces `nodeDegrees(edges: MemoryEdge[]): Record<string, number>`.
- Produces `moveDirectNeighbours(positions, edges, draggedId, delta): Record<string, MemoryPosition>`.

- [ ] **Step 1: Write the failing tests**

```ts
assert.deepEqual([0, 1, 2, 3, 4].map(nodeDiameterForDegree), [24, 24, 36, 48, 60])
assert.deepEqual(
  moveDirectNeighbours(
    { a: { x: 10, y: 10 }, b: { x: 20, y: 20 }, c: { x: 30, y: 30 }, d: { x: 40, y: 40 } },
    [{ from: 'a', to: 'b' }, { from: 'a', to: 'c' }, { from: 'c', to: 'd' }],
    'a',
    { x: 8, y: -4 },
  ),
  { a: { x: 10, y: 10 }, b: { x: 28, y: 16 }, c: { x: 38, y: 26 }, d: { x: 40, y: 40 } },
)
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/memoryCanvasState.test.ts`

Expected: failure because `memoryCanvasState.ts` does not exist.

- [ ] **Step 3: Implement the pure helpers**

```ts
export const nodeDiameterForDegree = (degree: number) => degree >= 4 ? 60 : [24, 24, 36, 48][Math.max(0, degree)]

export const moveDirectNeighbours = (positions, edges, draggedId, delta) => {
  const neighbours = new Set(edges.flatMap(({ from, to }) => from === draggedId ? [to] : to === draggedId ? [from] : []))
  return Object.fromEntries(Object.entries(positions).map(([id, position]) => [id, neighbours.has(id) ? { x: position.x + delta.x, y: position.y + delta.y } : position]))
}
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test src/memoryCanvasState.test.ts`

Expected: PASS.

### Task 2: Swap the static renderer for React Flow

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/components/MemoryGraph.tsx`
- Modify: `src/components/MemoryWorkspace.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes the Task 1 helpers and existing `MemoryNode`/`MemoryEdge` data.
- `MemoryGraph` receives complete edges, visible graph data, node positions, `setNodePosition(id, position)` and `moveVisibleNeighbours(id, delta)` callbacks. `MemoryWorkspace` implements both callbacks with functional state updates.

- [ ] **Step 1: Add the mature canvas dependency**

Run: `npm install @xyflow/react`

Expected: `package.json` and lockfile include the package; no other packages change.

- [ ] **Step 2: Convert visible Memory data into custom React Flow nodes**

```ts
const degree = nodeDegrees(allEdges)[node.id] ?? 0
return {
  id: node.id,
  type: 'memory',
  position: positions[node.id] ?? initialPositionFor(node.id),
  data: { ...node, diameter: nodeDiameterForDegree(degree) },
}
```

Use a custom node component for the coloured circle and the core-node label. Give it invisible source and target handles at the circle centre so edges stay centre-to-centre, and keep all canvas nodes focusable with their title as an accessible label.

- [ ] **Step 3: Configure canvas controls and one-hop drag behaviour**

```ts
onNodeDragStart={(_, node) => { previousPosition.current = node.position }}
onNodeDrag={(_, node) => {
  const previous = previousPosition.current
  moveVisibleNeighbours(node.id, {
    x: node.position.x - previous.x,
    y: node.position.y - previous.y,
  })
  previousPosition.current = node.position
}}
```

Use `onNodesChange` with React Flow's `applyNodeChanges` so controlled nodes retain its measured dimensions, then call `setNodePosition` for position changes on the dragged node. The two callbacks must use `setState(current => next)` so high-frequency drag events never overwrite an earlier neighbour update.

Enable pointer-drag panning on the pane, wheel zoom, `Controls`, and `fitView`. Do not expose connection editing, node creation, minimap, force layout, or persistence.

- [ ] **Step 4: Adapt styling without changing the Memory visual language**

Import React Flow’s base stylesheet from the component. Replace SVG-specific selectors with custom node, edge and control overrides that preserve the existing source colours, labels, reduced-motion rule and compact 390px layout.

- [ ] **Step 5: Run static verification**

Run: `npm test && npm run typecheck && npm run build`

Expected: all tests, TypeScript checking and Vite build pass.

### Task 3: Exercise the actual canvas interactions

**Files:**
- No source files expected unless verification reveals a defect.

- [ ] **Step 1: Run the app and open Memory**

Run: `npm run dev -- --host 127.0.0.1`

- [ ] **Step 2: Verify canvas interaction**

At desktop and 390px viewport: drag blank canvas, zoom and reset view, drag a node, and assert only its immediate neighbours moved. Confirm node diameters follow 1/2/3/4+ buckets and the search/source filters still show the correct empty state.

- [ ] **Step 3: Record the final checks**

Run: `npm test && npm run typecheck && npm run build`

Expected: all commands pass and browser console has no errors.
