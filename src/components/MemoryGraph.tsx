import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyNodeChanges, Controls, Handle, Position, ReactFlow } from '@xyflow/react'
import type { Edge, Node, NodeProps, NodeTypes, OnNodesChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { initialMemoryPosition, moveDirectNeighbours, nodeDegrees, nodeDiameterForDegree } from '../memoryCanvasState.ts'
import type { MemoryPosition } from '../memoryCanvasState.ts'
import type { MemoryEdge, MemoryNode } from '../memoryState.ts'

type MemoryFlowNode = Node<MemoryNode & { diameter: number }, 'memory'>

type MemoryGraphProps = {
  allEdges: MemoryEdge[]
  edges: MemoryEdge[]
  moveVisibleNeighbours: (draggedId: string, delta: MemoryPosition) => void
  nodes: MemoryNode[]
  positions: Record<string, MemoryPosition>
  setNodePosition: (id: string, position: MemoryPosition) => void
  summary: string
}

const MemoryCanvasNode = memo(({ data }: NodeProps<MemoryFlowNode>) => (
  <div
    aria-label={data.title}
    className={`memory-flow-node memory-flow-node-${data.source} memory-flow-node-${data.tier}`}
    style={{ height: data.diameter, width: data.diameter }}
  >
    <Handle className="memory-flow-handle" isConnectable={false} position={Position.Top} type="target" />
    <Handle className="memory-flow-handle" isConnectable={false} position={Position.Top} type="source" />
    {data.tier === 'core' && <span className="memory-flow-label">{data.title}</span>}
  </div>
))

const nodeTypes: NodeTypes = { memory: MemoryCanvasNode }

const createFlowNodes = (
  nodes: MemoryNode[],
  degrees: Record<string, number>,
  positions: Record<string, MemoryPosition>,
  current: MemoryFlowNode[] = [],
): MemoryFlowNode[] => {
  const previous = new Map(current.map((node) => [node.id, node]))
  return nodes.map((node) => {
    const existing = previous.get(node.id)
    const diameter = nodeDiameterForDegree(degrees[node.id] ?? 0)
    return {
      ...existing,
      ariaLabel: node.title,
      data: { ...node, diameter },
      id: node.id,
      position: positions[node.id] ?? existing?.position ?? initialMemoryPosition(node.id),
      selectable: false,
      style: { height: diameter, width: diameter },
      type: 'memory',
    }
  })
}

export default function MemoryGraph({ allEdges, edges, moveVisibleNeighbours, nodes, positions, setNodePosition, summary }: MemoryGraphProps) {
  const previousPosition = useRef<MemoryPosition | null>(null)
  const degrees = useMemo(() => nodeDegrees(allEdges), [allEdges])
  const [flowNodes, setFlowNodes] = useState<MemoryFlowNode[]>(() => createFlowNodes(nodes, degrees, positions))
  useEffect(() => {
    setFlowNodes((current) => createFlowNodes(nodes, degrees, positions, current))
  }, [degrees, nodes, positions])
  const flowEdges = useMemo<Edge[]>(() => edges.map((edge) => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    type: 'straight',
  })), [edges])

  const onNodesChange = useCallback<OnNodesChange<MemoryFlowNode>>((changes) => {
    setFlowNodes((current) => applyNodeChanges(changes, current))
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) setNodePosition(change.id, change.position)
    })
  }, [setNodePosition])

  return (
    <section aria-label={summary} className="memory-graph">
      <ReactFlow
        aria-label={summary}
        className="memory-flow"
        edges={flowEdges}
        edgesFocusable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        maxZoom={2}
        minZoom={0.4}
        nodeOrigin={[0.5, 0.5]}
        nodes={flowNodes}
        nodesConnectable={false}
        nodeTypes={nodeTypes}
        onNodeDrag={(_, node) => {
          const previous = previousPosition.current
          if (!previous) return
          setFlowNodes((current) => {
            const nextPositions = moveDirectNeighbours(
              Object.fromEntries(current.map((item) => [item.id, item.position])),
              edges,
              node.id,
              { x: node.position.x - previous.x, y: node.position.y - previous.y },
            )
            return current.map((item) => nextPositions[item.id] === item.position ? item : { ...item, position: nextPositions[item.id] })
          })
          moveVisibleNeighbours(node.id, { x: node.position.x - previous.x, y: node.position.y - previous.y })
          previousPosition.current = node.position
        }}
        onNodeDragStart={(_, node) => { previousPosition.current = node.position }}
        onNodeDragStop={() => { previousPosition.current = null }}
        onNodesChange={onNodesChange}
        zoomOnScroll
      >
        <Controls aria-label="Canvas controls" showInteractive={false} />
      </ReactFlow>
    </section>
  )
}
