# Memory Force Canvas Design

## Goal

Render Memory as a compact, live graph driven by the backend's node and edge records. The UI must not contain business-node IDs, labels, positions, or relationship rules.

## Data Contract

The graph boundary consumes a response shaped as follows:

```ts
type MemoryGraphNode = {
  id: string
  title: string
  summary?: string
  layer: 'context' | 'user'
  source?: string
  visual?: { color?: string }
  position: { x: number; y: number }
}

type MemoryGraphEdge = { id?: string; from: string; to: string }
```

The backend is authoritative for initial and persisted positions. The frontend renders a neutral fallback colour only when `visual.color` and an applicable source colour are absent. Every node uses its supplied title and summary; the canvas stays compact and reveals those fields on hover or selection rather than relying on a named-node exception.

## Canvas Behaviour

- React Flow supplies the canvas, viewport controls and grid.
- All node fills are opaque. Node diameters derive only from the complete graph's degree: degree 0–1/2/3/4+ maps to 16/22/30/38px.
- On drag, the active node and its direct visible neighbours form a local D3-force simulation. All other nodes are pinned, so second-hop nodes do not move.
- A link's equilibrium centre distance equals its two node radii plus a 72px gap. It may stretch while dragging and settles after release. Collision uses each node's actual radius plus the same visual breathing room.
- The simulation ticks through `requestAnimationFrame`, stops once cool, and is disabled for `prefers-reduced-motion`.

## Position Persistence

The dragged node is pinned to the pointer. On release, the locally simulated nodes settle and one batched callback emits only changed `{ id, position }` records. The host's backend client can persist that payload; this demo does not invent an endpoint or simulate network success.

## Scope and Verification

The existing fixture may remain as API-shaped demo input, but rendering code must not refer to fixture IDs. Add focused tests for compact degree buckets, backend-provided initial coordinates, generic visual fallback, local one-hop simulation inputs, and the emitted changed-position batch. Verify with the existing test suite, TypeScript, production build, and desktop/mobile drag checks.
