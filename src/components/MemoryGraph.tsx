import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { applyNodeChanges, Background, BackgroundVariant, BaseEdge, Controls, getStraightPath, Handle, Position, ReactFlow } from '@xyflow/react'
import type { Edge, EdgeProps, EdgeTypes, Node, NodeProps, NodeTypes, OnNodesChange } from '@xyflow/react'
import { forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force'
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force'
import '@xyflow/react/dist/style.css'
import { changedPositions, displayPosition, edgeGradientColors, edgeVisualState, forceLinkDistance, forceLinkIterations, forceLinkStrength, forceParticipantIds, nodeDegrees, nodeDiameterForDegree } from '../memoryCanvasState.ts'
import type { MemoryPosition } from '../memoryCanvasState.ts'
import type { MemoryEdge, MemoryNode } from '../memoryState.ts'

type MemoryFlowNode = Node<MemoryNode & { diameter: number; onActiveChange: (id: string | null) => void }, 'memory'>
type MemoryFlowEdge = Edge<{ sourceColor: string; targetColor: string; visualState: ReturnType<typeof edgeVisualState> }, 'memory'>
type ForceNode = SimulationNodeDatum & { id: string; radius: number }
type ForceLink = SimulationLinkDatum<ForceNode> & { source: ForceNode | string; target: ForceNode | string }
type DragState = {
  forceNodes: ForceNode[]
  frame: number | null
  initialPositions: Record<string, MemoryPosition>
  participantIds: Set<string>
  reducedMotion: boolean
  released: boolean
  root: ForceNode
  simulation: ReturnType<typeof forceSimulation<ForceNode>>
}

type MemoryGraphProps = {
  allEdges: MemoryEdge[]
  edges: MemoryEdge[]
  nodes: MemoryNode[]
  onPositionsChange: (positions: Record<string, MemoryPosition>) => void
  summary: string
}

const MemoryCanvasNode = memo(({ data, id }: NodeProps<MemoryFlowNode>) => (
  <div
    aria-label={data.summary ? `${data.title}: ${data.summary}` : data.title}
    className="memory-flow-node"
    onMouseEnter={() => data.onActiveChange(id)}
    onMouseLeave={() => data.onActiveChange(null)}
    style={{ backgroundColor: data.visual?.color ?? 'var(--memory-node-fallback)', height: data.diameter, width: data.diameter }}
  >
    <Handle className="memory-flow-handle" isConnectable={false} position={Position.Top} type="target" />
    <Handle className="memory-flow-handle" isConnectable={false} position={Position.Top} type="source" />
    <span className="memory-flow-tooltip" role="tooltip"><strong>{data.title}</strong><small>{data.summary}</small></span>
  </div>
))

const MemoryGradientEdge = ({ data, id, sourceX, sourceY, targetX, targetY }: EdgeProps<MemoryFlowEdge>) => {
  const gradientId = useId()
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  const visualState = data?.visualState ?? 'default'
  const opacity = visualState === 'active' ? .88 : visualState === 'muted' ? .06 : .24
  const strokeWidth = visualState === 'active' ? 2.1 : 1.2
  return (
    <>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id={gradientId} x1={sourceX} x2={targetX} y1={sourceY} y2={targetY}>
          <stop offset="0%" stopColor={data?.sourceColor ?? '#969189'} />
          <stop offset="100%" stopColor={data?.targetColor ?? '#969189'} />
        </linearGradient>
      </defs>
      <BaseEdge id={id} path={path} style={{ opacity, stroke: `url(#${gradientId})`, strokeWidth }} />
    </>
  )
}

const nodeTypes: NodeTypes = { memory: MemoryCanvasNode }
const edgeTypes: EdgeTypes = { memory: MemoryGradientEdge }

const createFlowNodes = (
  nodes: MemoryNode[],
  degrees: Record<string, number>,
  onActiveChange: (id: string | null) => void,
  current: MemoryFlowNode[] = [],
): MemoryFlowNode[] => {
  const previous = new Map(current.map((node) => [node.id, node]))
  return nodes.map((node) => {
    const existing = previous.get(node.id)
    const diameter = nodeDiameterForDegree(degrees[node.id] ?? 0)
    return {
      ...existing,
      ariaLabel: node.title,
      data: { ...node, diameter, onActiveChange },
      id: node.id,
      position: displayPosition(existing?.position, node.position),
      selectable: false,
      style: { height: diameter, width: diameter },
      type: 'memory',
    }
  })
}

const reducedMotionPreferred = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function MemoryGraph({ allEdges, edges, nodes, onPositionsChange, summary }: MemoryGraphProps) {
  const dragState = useRef<DragState | null>(null)
  const degrees = useMemo(() => nodeDegrees(allEdges), [allEdges])
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const onActiveChange = useCallback((id: string | null) => setActiveNodeId(id), [])
  const [flowNodes, setFlowNodes] = useState<MemoryFlowNode[]>(() => createFlowNodes(nodes, degrees, onActiveChange))
  useEffect(() => {
    setFlowNodes((current) => createFlowNodes(nodes, degrees, onActiveChange, current))
  }, [degrees, nodes, onActiveChange])
  useEffect(() => () => {
    const current = dragState.current
    if (!current) return
    current.simulation.stop()
    if (current.frame !== null) window.cancelAnimationFrame(current.frame)
  }, [])

  const flowEdges = useMemo<MemoryFlowEdge[]>(() => {
    const nodeById = new Map(nodes.map((node) => [node.id, node]))
    return edges.map((edge) => ({
      data: {
        ...edgeGradientColors(nodeById.get(edge.from)?.visual?.color, nodeById.get(edge.to)?.visual?.color),
        visualState: edgeVisualState(edge, activeNodeId),
      },
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      type: 'memory',
    }))
  }, [activeNodeId, edges, nodes])

  const updateForcePositions = useCallback((state: DragState) => {
    if (state.frame !== null) return
    state.frame = window.requestAnimationFrame(() => {
      state.frame = null
      const positions = Object.fromEntries(state.forceNodes.map((node) => [node.id, { x: node.x ?? 0, y: node.y ?? 0 }]))
      setFlowNodes((current) => current.map((node) => positions[node.id]
        ? { ...node, position: positions[node.id] }
        : node))
    })
  }, [])

  const finishDrag = useCallback((state: DragState) => {
    state.simulation.stop()
    if (state.frame !== null) window.cancelAnimationFrame(state.frame)
    const finalPositions = Object.fromEntries(state.forceNodes.map((node) => [node.id, { x: node.x ?? 0, y: node.y ?? 0 }]))
    setFlowNodes((current) => current.map((node) => finalPositions[node.id]
      ? { ...node, position: finalPositions[node.id] }
      : node))
    onPositionsChange(changedPositions(state.initialPositions, finalPositions, state.participantIds))
    if (dragState.current === state) dragState.current = null
  }, [onPositionsChange])

  const onNodesChange = useCallback<OnNodesChange<MemoryFlowNode>>((changes) => {
    setFlowNodes((current) => applyNodeChanges(changes, current))
  }, [])

  return (
    <section aria-label={summary} className="memory-graph">
      <ReactFlow
        aria-label={summary}
        className="memory-flow"
        edges={flowEdges}
        edgesFocusable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: .08 }}
        maxZoom={2}
        minZoom={0.4}
        nodeOrigin={[0.5, 0.5]}
        nodes={flowNodes}
        nodesConnectable={false}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        onNodeDrag={(_, node) => {
          const state = dragState.current
          if (!state) return
          if (state.reducedMotion) return
          state.root.fx = node.position.x
          state.root.fy = node.position.y
          state.root.x = node.position.x
          state.root.y = node.position.y
          state.simulation.alphaTarget(.25).restart()
        }}
        onNodeDragStart={(_, node) => {
          dragState.current?.simulation.stop()
          const participantIds = forceParticipantIds(flowNodes)
          const forceNodes: ForceNode[] = flowNodes.map((item) => ({
            id: item.id,
            radius: item.data.diameter / 2,
            x: item.position.x,
            y: item.position.y,
          }))
          const root = forceNodes.find((item) => item.id === node.id)
          if (!root) return
          const forceNodeById = new Map(forceNodes.map((item) => [item.id, item]))
          const forceEdges = edges.flatMap((edge) => {
            const source = forceNodeById.get(edge.from)
            const target = forceNodeById.get(edge.to)
            return source && target ? [{ source, target }] : []
          }) as ForceLink[]
          const simulation = forceSimulation<ForceNode>(forceNodes)
            .force('link', forceLink<ForceNode, ForceLink>(forceEdges).distance((edge) => {
              const source = typeof edge.source === 'string' ? forceNodeById.get(edge.source) : edge.source
              const target = typeof edge.target === 'string' ? forceNodeById.get(edge.target) : edge.target
              return source && target ? forceLinkDistance(source.radius, target.radius) : 72
            }).strength(forceLinkStrength).iterations(forceLinkIterations))
            .force('charge', forceManyBody().strength(-90))
            .force('collide', forceCollide<ForceNode>((item) => item.radius + 10).strength(.85))
            .alphaDecay(.08)
          const state: DragState = {
            forceNodes,
            frame: null,
            initialPositions: Object.fromEntries(flowNodes.map((item) => [item.id, item.position])),
            participantIds,
            reducedMotion: reducedMotionPreferred(),
            released: false,
            root,
            simulation,
          }
          if (!state.reducedMotion) {
            root.fx = node.position.x
            root.fy = node.position.y
            simulation.on('tick', () => updateForcePositions(state))
            simulation.on('end', () => {
              if (state.released) finishDrag(state)
            })
          }
          dragState.current = state
        }}
        onNodeDragStop={(_, node) => {
          const state = dragState.current
          if (!state) return
          if (state.reducedMotion) {
            const finalPositions = Object.fromEntries(flowNodes.map((item) => [item.id, item.position]))
            onPositionsChange(changedPositions(state.initialPositions, finalPositions, state.participantIds))
            dragState.current = null
            return
          }
          state.released = true
          state.root.fx = node.position.x
          state.root.fy = node.position.y
          state.root.x = node.position.x
          state.root.y = node.position.y
          state.simulation.alphaTarget(0).restart()
        }}
        onNodesChange={onNodesChange}
        zoomOnScroll
      >
        <Background color="#e4e0d7" gap={20} size={1} variant={BackgroundVariant.Lines} />
        <Controls aria-label="Canvas controls" showInteractive={false} />
      </ReactFlow>
    </section>
  )
}
