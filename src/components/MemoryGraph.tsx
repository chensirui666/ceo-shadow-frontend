import type { MemoryEdge, MemoryNode } from '../memoryState.ts'

type MemoryGraphProps = {
  edges: MemoryEdge[]
  nodes: MemoryNode[]
  summary: string
}

type Position = { x: number; y: number }

const positions: Record<string, Position> = {
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
  'user-analysis': { x: 700, y: 175 },
  'user-context': { x: 196, y: 375 },
  'user-followup': { x: 784, y: 395 },
}

const fallbackPosition = (id: string): Position => {
  const hash = [...id].reduce((value, character) => (value * 31 + character.charCodeAt(0)) % 997, 0)
  return { x: 154 + hash % 692, y: 106 + (hash * 7) % 346 }
}

const positionFor = (id: string): Position => positions[id] ?? fallbackPosition(id)

const radiusFor = (tier: MemoryNode['tier']): number => (
  tier === 'core' ? 16 : tier === 'connection' ? 10 : 6
)

export default function MemoryGraph({ edges, nodes, summary }: MemoryGraphProps) {
  return (
    <section aria-label={summary} className="memory-graph">
      <svg aria-hidden="true" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1000 560">
        {edges.map((edge) => {
          const from = positionFor(edge.from)
          const to = positionFor(edge.to)
          return <line className="memory-edge" key={`${edge.from}-${edge.to}`} x1={from.x} x2={to.x} y1={from.y} y2={to.y} />
        })}
        {nodes.map((node) => {
          const position = positionFor(node.id)
          return (
            <g className={`memory-node memory-node-${node.source} memory-node-${node.tier}`} key={node.id} transform={`translate(${position.x} ${position.y})`}>
              <circle r={radiusFor(node.tier)} />
              {node.tier === 'core' && <text x={23} y={5}>{node.title}</text>}
            </g>
          )
        })}
      </svg>
    </section>
  )
}
