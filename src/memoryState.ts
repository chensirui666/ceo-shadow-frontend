export const memoryLayers = ['context', 'user'] as const
export const memorySources = ['all', 'dingtalk', 'feishu', 'teams', 'file', 'conversation'] as const

export type MemoryLayer = typeof memoryLayers[number]
export type MemorySource = typeof memorySources[number]
export type MemoryNodeSource = Exclude<MemorySource, 'all'>
export type MaterialKind = 'file' | 'migration'
export type MaterialStatus = 'processing' | 'completed' | 'failed'
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

export type MemoryEdge = { from: string; to: string }
export type MemoryGraphData = { nodes: MemoryNode[]; edges: MemoryEdge[] }
export type MemoryQuery = { layer: MemoryLayer; source: MemorySource; keyword: string }
export type MaterialTask = {
  kind: MaterialKind
  fileName: string
  status: MaterialStatus
  outcome: Exclude<MaterialStatus, 'processing'>
}

export const initialMemoryGraph: MemoryGraphData = {
  nodes: [
    { id: 'context-brief', layer: 'context', source: 'dingtalk', title: '本周产品节奏', summary: '需要推进发布准备与关键判断。', position: { x: 485, y: 275 }, visual: { color: '#82957d' } },
    { id: 'context-roadmap', layer: 'context', source: 'feishu', title: '产品路线图', summary: '已确认的阶段目标与优先级。', position: { x: 310, y: 164 }, visual: { color: '#839eb3' } },
    { id: 'context-team', layer: 'context', source: 'teams', title: '协作分工', summary: '团队当前的职责与配合方式。', position: { x: 680, y: 156 }, visual: { color: '#9990a8' } },
    { id: 'context-research', layer: 'context', source: 'file', title: '用户研究摘要', summary: '访谈结论与待验证的问题。', position: { x: 150, y: 300 }, visual: { color: '#b59663' } },
    { id: 'context-followup', layer: 'context', source: 'conversation', title: '项目跟进', summary: '工作对话中形成的下一步。', position: { x: 760, y: 332 }, visual: { color: '#bc8d86' } },
    { id: 'context-release', layer: 'context', source: 'dingtalk', title: '发布准备', summary: '需要同步的发布事项。', position: { x: 414, y: 430 }, visual: { color: '#82957d' } },
    { id: 'context-planning', layer: 'context', source: 'feishu', title: '季度规划', summary: '正在讨论的工作重点。', position: { x: 305, y: 355 }, visual: { color: '#839eb3' } },
    { id: 'context-review', layer: 'context', source: 'teams', title: '评审记录', summary: '跨团队评审中的明确结论。', position: { x: 870, y: 205 }, visual: { color: '#9990a8' } },
    { id: 'context-briefing', layer: 'context', source: 'file', title: '项目背景', summary: '工作资料中的项目上下文。', position: { x: 126, y: 146 }, visual: { color: '#b59663' } },
    { id: 'context-decisions', layer: 'context', source: 'conversation', title: '已确认决策', summary: '日常沟通里明确的选择。', position: { x: 740, y: 465 }, visual: { color: '#bc8d86' } },
    { id: 'user-direction', layer: 'user', source: 'dingtalk', title: '产品判断优先', summary: '优先确认用户价值与关键取舍。', position: { x: 478, y: 266 }, visual: { color: '#82957d' } },
    { id: 'user-collaboration', layer: 'user', source: 'feishu', title: '协作方式', summary: '偏好清晰的结论与下一步。', position: { x: 295, y: 164 }, visual: { color: '#839eb3' } },
    { id: 'user-context', layer: 'user', source: 'file', title: '工作背景', summary: '长期有效的项目与职责。', position: { x: 196, y: 375 }, visual: { color: '#b59663' } },
    { id: 'user-followup', layer: 'user', source: 'conversation', title: '跟进偏好', summary: '将讨论沉淀为可执行事项。', position: { x: 784, y: 395 }, visual: { color: '#bc8d86' } },
  ],
  edges: [
    { from: 'context-brief', to: 'context-roadmap' },
    { from: 'context-brief', to: 'context-team' },
    { from: 'context-roadmap', to: 'context-research' },
    { from: 'context-roadmap', to: 'context-planning' },
    { from: 'context-team', to: 'context-followup' },
    { from: 'context-team', to: 'context-review' },
    { from: 'context-research', to: 'context-briefing' },
    { from: 'context-followup', to: 'context-decisions' },
    { from: 'context-brief', to: 'context-release' },
    { from: 'user-direction', to: 'user-collaboration' },
    { from: 'user-collaboration', to: 'user-context' },
    { from: 'user-collaboration', to: 'user-followup' },
  ],
}

export const visibleMemoryGraph = (graph: MemoryGraphData, query: MemoryQuery): MemoryGraphData => {
  const keyword = query.keyword.trim().toLocaleLowerCase()
  const nodes = graph.nodes.filter((node) => node.layer === query.layer
    && (query.source === 'all' || node.source === query.source)
    && (!keyword || `${node.title} ${node.summary}`.toLocaleLowerCase().includes(keyword)))
  const visibleIds = new Set(nodes.map((node) => node.id))

  return {
    nodes,
    edges: graph.edges.filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to)),
  }
}

export const startMaterialTask = (kind: MaterialKind, fileName: string, size: number): MaterialTask => ({
  kind,
  fileName,
  status: 'processing',
  outcome: size === 0 ? 'failed' : 'completed',
})

export const finishMaterialTask = (task: MaterialTask): MaterialTask => ({ ...task, status: task.outcome })

const materialSource = (kind: MaterialKind): MemoryNodeSource => kind === 'file' ? 'file' : 'conversation'

const nextFixturePosition = (nodes: MemoryNode[]): MemoryPosition => {
  const last = nodes.at(-1)?.position ?? { x: 0, y: 0 }
  return { x: last.x + 72, y: last.y + 72 }
}

export const resolveMaterialTask = (graph: MemoryGraphData, task: MaterialTask): MemoryGraphData => {
  if (task.status !== 'completed') return graph

  const source = materialSource(task.kind)
  const id = `context-${source}-${graph.nodes.filter((node) => node.id.startsWith(`context-${source}-`)).length + 1}`
  const node: MemoryNode = {
    id,
    layer: 'context',
    source,
    title: task.kind === 'file' ? '新增工作资料' : '整理后的工作对话',
    summary: task.kind === 'file' ? '用户主动补充的工作资料。' : '由用户迁移的工作相关内容。',
    position: nextFixturePosition(graph.nodes),
    visual: { color: source === 'file' ? '#b59663' : '#bc8d86' },
  }

  return {
    nodes: [...graph.nodes, node],
    edges: [...graph.edges, { from: 'context-brief', to: id }],
  }
}
