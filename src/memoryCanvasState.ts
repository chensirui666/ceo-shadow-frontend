import type { MemoryEdge, MemoryPosition } from './memoryState.ts'

export type { MemoryPosition }

type RadialLayoutNode = { id: string; source: string }

const radialCenter = { x: 800, y: 450 }
const radialHorizontalStretch = 1.25
const radialLayer = (degree: number, isCore: boolean) => isCore ? 72 : degree >= 3 ? 195 : degree === 2 ? 330 : 460
const sourceAngle = (source: string, sources: string[]) => -Math.PI / 2 + sources.indexOf(source) * (2 * Math.PI / sources.length)
const hash = (value: string) => [...value].reduce((result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0, 2166136261)
const jitter = (id: string, suffix: string, range: number) => ((hash(`${id}-${suffix}`) / 0xffffffff) - .5) * range
const normalizeAngle = (angle: number) => (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)

const averageHopCount = (id: string, adjacency: Map<string, string[]>) => {
  const distances = new Map([[id, 0]])
  const queue = [id]
  while (queue.length) {
    const current = queue.shift() as string
    for (const neighbor of adjacency.get(current) ?? []) {
      if (distances.has(neighbor)) continue
      distances.set(neighbor, (distances.get(current) ?? 0) + 1)
      queue.push(neighbor)
    }
  }
  return [...distances.values()].reduce((total, distance) => total + distance, 0) / Math.max(distances.size, 1)
}

export const radialMemoryPositions = (nodes: RadialLayoutNode[], edges: MemoryEdge[]): Record<string, MemoryPosition> => {
  const nodeIds = new Set(nodes.map(({ id }) => id))
  const degrees = nodeDegrees(edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to)))
  const adjacency = new Map(nodes.map(({ id }) => [id, [] as string[]]))
  edges.forEach(({ from, to }) => {
    if (!nodeIds.has(from) || !nodeIds.has(to)) return
    adjacency.get(from)?.push(to)
    adjacency.get(to)?.push(from)
  })
  const coreIds = new Set(nodes
    .filter((node) => (degrees[node.id] ?? 0) >= 3)
    .sort((left, right) => averageHopCount(left.id, adjacency) - averageHopCount(right.id, adjacency) || left.id.localeCompare(right.id))
    .slice(0, 5)
    .map(({ id }) => id))
  const sources = [...new Set(nodes.map((node) => node.source))].sort()
  const sortedNodes = [...nodes].sort((left, right) => {
    const degreeDifference = (degrees[right.id] ?? 0) - (degrees[left.id] ?? 0)
    return degreeDifference || averageHopCount(left.id, adjacency) - averageHopCount(right.id, adjacency) || left.source.localeCompare(right.source) || left.id.localeCompare(right.id)
  })
  const visitOrder = new Map<string, number>()
  const queue = [...sortedNodes.filter((node) => coreIds.has(node.id))]
  while (queue.length) {
    const current = queue.shift() as RadialLayoutNode
    if (visitOrder.has(current.id)) continue
    visitOrder.set(current.id, visitOrder.size)
    const neighbors = (adjacency.get(current.id) ?? [])
      .map((id) => nodes.find((node) => node.id === id) as RadialLayoutNode)
      .sort((left, right) => (degrees[right.id] ?? 0) - (degrees[left.id] ?? 0) || left.source.localeCompare(right.source) || left.id.localeCompare(right.id))
    queue.push(...neighbors)
  }
  sortedNodes.forEach((node) => visitOrder.set(node.id, visitOrder.get(node.id) ?? visitOrder.size))

  const center = sortedNodes.at(0)
  const rings = new Map<number, RadialLayoutNode[]>()
  nodes.filter((node) => node.id !== center?.id).forEach((node) => {
    const degree = degrees[node.id] ?? 0
    const radius = radialLayer(degree, coreIds.has(node.id))
    const ring = rings.get(radius) ?? []
    ring.push(node)
    rings.set(radius, ring)
  })
  const angles = new Map<string, number>([...(center ? [[center.id, -Math.PI / 2] as const] : [])])
  rings.forEach((ring) => ring
    .sort((left, right) => (visitOrder.get(left.id) ?? 0) - (visitOrder.get(right.id) ?? 0))
    .forEach((node, index) => angles.set(node.id, index * 2 * Math.PI / ring.length)))

  for (let pass = 0; pass < 5; pass += 1) {
    rings.forEach((ring) => {
      ring.sort((left, right) => {
        const averageAngle = (node: RadialLayoutNode) => {
          const neighbors = adjacency.get(node.id) ?? []
          if (!neighbors.length) return angles.get(node.id) ?? 0
          const vector = neighbors.reduce((result, id) => ({
            x: result.x + Math.cos(angles.get(id) ?? 0),
            y: result.y + Math.sin(angles.get(id) ?? 0),
          }), { x: 0, y: 0 })
          const preferredSourceAngle = sourceAngle(node.source, sources)
          vector.x += Math.cos(preferredSourceAngle) * .45
          vector.y += Math.sin(preferredSourceAngle) * .45
          return normalizeAngle(Math.atan2(vector.y, vector.x))
        }
        return averageAngle(left) - averageAngle(right) || left.source.localeCompare(right.source) || left.id.localeCompare(right.id)
      })
      ring.forEach((node, index) => angles.set(node.id, index * 2 * Math.PI / ring.length))
    })
  }

  const positions = nodes.map((node) => {
    if (node.id === center?.id) return [node.id, radialCenter] as const
    const degree = degrees[node.id] ?? 0
    const radius = radialLayer(degree, coreIds.has(node.id)) + jitter(node.id, 'radius', degree <= 1 ? 14 : 10)
    const angle = (angles.get(node.id) ?? 0) + jitter(node.id, 'angle', .09)
    return [node.id, {
      x: radialCenter.x + Math.cos(angle) * radius * radialHorizontalStretch,
      y: radialCenter.y + Math.sin(angle) * radius,
    }] as const
  })
  const centroid = positions.reduce((result, [, position]) => ({
    x: result.x + position.x / positions.length,
    y: result.y + position.y / positions.length,
  }), { x: 0, y: 0 })

  return Object.fromEntries(positions.map(([id, position]) => [id, {
    x: Math.round(position.x + radialCenter.x - centroid.x),
    y: Math.round(position.y + radialCenter.y - centroid.y),
  }]))
}

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

export const edgeVisualState = (edge: MemoryEdge, activeNodeId: string | null) => !activeNodeId
  ? 'default'
  : edge.from === activeNodeId || edge.to === activeNodeId
    ? 'active'
    : 'muted'

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
