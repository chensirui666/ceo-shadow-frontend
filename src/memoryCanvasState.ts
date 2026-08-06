import type { MemoryEdge } from './memoryState.ts'

export type MemoryPosition = { x: number; y: number }

const initialPositions: Record<string, MemoryPosition> = {
  'context-brief': { x: 485, y: 275 },
  'context-roadmap': { x: 310, y: 164 },
  'context-team': { x: 680, y: 156 },
  'context-research': { x: 150, y: 300 },
  'context-followup': { x: 760, y: 332 },
  'context-release': { x: 414, y: 430 },
  'context-planning': { x: 305, y: 355 },
  'context-review': { x: 870, y: 205 },
  'context-briefing': { x: 126, y: 146 },
  'context-decisions': { x: 740, y: 465 },
  'user-direction': { x: 478, y: 266 },
  'user-collaboration': { x: 295, y: 164 },
  'user-context': { x: 196, y: 375 },
  'user-followup': { x: 784, y: 395 },
}

export const initialMemoryPosition = (id: string): MemoryPosition => {
  const preset = initialPositions[id]
  if (preset) return preset

  const hash = [...id].reduce((value, character) => (value * 31 + character.charCodeAt(0)) % 997, 0)
  return { x: 154 + hash % 692, y: 106 + (hash * 7) % 346 }
}

export const nodeDiameterForDegree = (degree: number): number => degree >= 4 ? 60 : [24, 24, 36, 48][Math.max(0, degree)]

export const nodeDegrees = (edges: MemoryEdge[]): Record<string, number> => edges.reduce<Record<string, number>>((degrees, edge) => ({
  ...degrees,
  [edge.from]: (degrees[edge.from] ?? 0) + 1,
  [edge.to]: (degrees[edge.to] ?? 0) + 1,
}), {})

export const moveDirectNeighbours = (
  positions: Record<string, MemoryPosition>,
  edges: MemoryEdge[],
  draggedId: string,
  delta: MemoryPosition,
): Record<string, MemoryPosition> => {
  const neighbours = new Set(edges.flatMap(({ from, to }) => from === draggedId ? [to] : to === draggedId ? [from] : []))
  return Object.fromEntries(Object.entries(positions).map(([id, position]) => [id, neighbours.has(id)
    ? { x: position.x + delta.x, y: position.y + delta.y }
    : position]))
}
