import type { MemoryEdge, MemoryPosition } from './memoryState.ts'

export type { MemoryPosition }

export const displayPosition = (current: MemoryPosition | undefined, initial: MemoryPosition): MemoryPosition => current ?? initial

export const nodeDiameterForDegree = (degree: number): number => degree >= 4 ? 38 : [16, 16, 22, 30][Math.max(0, degree)]

export const nodeDegrees = (edges: MemoryEdge[]): Record<string, number> => edges.reduce<Record<string, number>>((degrees, edge) => ({
  ...degrees,
  [edge.from]: (degrees[edge.from] ?? 0) + 1,
  [edge.to]: (degrees[edge.to] ?? 0) + 1,
}), {})

export const directNodeIds = (edges: MemoryEdge[], draggedId: string): Set<string> => new Set(
  edges.flatMap(({ from, to }) => from === draggedId ? [to] : to === draggedId ? [from] : []),
)

export const moveDirectNeighbours = (
  positions: Record<string, MemoryPosition>,
  edges: MemoryEdge[],
  draggedId: string,
  delta: MemoryPosition,
): Record<string, MemoryPosition> => {
  const neighbours = directNodeIds(edges, draggedId)
  return Object.fromEntries(Object.entries(positions).map(([id, position]) => [id, neighbours.has(id)
    ? { x: position.x + delta.x, y: position.y + delta.y }
    : position]))
}

export const changedPositions = (
  before: Record<string, MemoryPosition>,
  after: Record<string, MemoryPosition>,
  ids: Set<string>,
): Record<string, MemoryPosition> => Object.fromEntries(
  [...ids].flatMap((id) => before[id]?.x === after[id]?.x && before[id]?.y === after[id]?.y ? [] : [[id, after[id]]]),
)
