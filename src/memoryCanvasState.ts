import type { MemoryEdge, MemoryPosition } from './memoryState.ts'

export type { MemoryPosition }

export const displayPosition = (current: MemoryPosition | undefined, initial: MemoryPosition): MemoryPosition => current ?? initial

export const nodeDiameterForDegree = (degree: number): number => degree >= 4 ? 38 : [16, 16, 22, 30][Math.max(0, degree)]

export const nodeDegrees = (edges: MemoryEdge[]): Record<string, number> => edges.reduce<Record<string, number>>((degrees, edge) => ({
  ...degrees,
  [edge.from]: (degrees[edge.from] ?? 0) + 1,
  [edge.to]: (degrees[edge.to] ?? 0) + 1,
}), {})

export const forceParticipantIds = (nodes: Array<{ id: string }>): Set<string> => new Set(nodes.map(({ id }) => id))

export const edgeGradientColors = (sourceColor?: string, targetColor?: string) => ({
  sourceColor: sourceColor ?? '#969189',
  targetColor: targetColor ?? '#969189',
})

export const forceLinkDistance = (sourceRadius: number, targetRadius: number): number => sourceRadius + targetRadius + 72
export const forceLinkStrength = 1
export const forceLinkIterations = 4

export const changedPositions = (
  before: Record<string, MemoryPosition>,
  after: Record<string, MemoryPosition>,
  ids: Set<string>,
): Record<string, MemoryPosition> => Object.fromEntries(
  [...ids].flatMap((id) => before[id]?.x === after[id]?.x && before[id]?.y === after[id]?.y ? [] : [[id, after[id]]]),
)
