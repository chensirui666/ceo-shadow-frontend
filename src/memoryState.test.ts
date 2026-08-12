import assert from 'node:assert/strict'
import test from 'node:test'

const memoryState = await import('./memoryState.ts')

test('visibleMemoryGraph filters by layer, source, keyword, and visible edge endpoints', () => {
  const graph = {
    nodes: [
      { id: 'a', layer: 'context', source: 'dingtalk', title: '产品节奏', summary: '本周发布', position: { x: 320, y: 180 }, visual: { color: '#789abc' } },
      { id: 'b', layer: 'context', source: 'file', title: '发布计划', summary: '产品节奏说明', position: { x: 180, y: 300 } },
      { id: 'c', layer: 'user', source: 'dingtalk', title: '工作偏好', summary: '优先产品', position: { x: 500, y: 180 } },
    ],
    edges: [{ from: 'a', to: 'b' }, { from: 'a', to: 'c' }],
  } satisfies import('./memoryState.ts').MemoryGraphData

  assert.deepEqual(memoryState.visibleMemoryGraph(graph, { layer: 'context', source: 'all', keyword: '节奏' }), {
    nodes: [graph.nodes[0], graph.nodes[1]],
    edges: [graph.edges[0]],
  })
  assert.deepEqual(memoryState.visibleMemoryGraph(graph, { layer: 'context', source: 'dingtalk', keyword: '节奏' }), {
    nodes: [graph.nodes[0]],
    edges: [],
  })
})

test('every graph node owns its server-provided canvas coordinate', () => {
  assert.equal(
    memoryState.initialMemoryGraph.nodes.every((node) => Number.isFinite(node.position.x) && Number.isFinite(node.position.y)),
    true,
  )
})

test('English Memory nodes use English titles and summaries', () => {
  const graph = memoryState.localizedMemoryGraph(memoryState.initialMemoryGraph, 'en')
  const content = graph.nodes.flatMap((node) => [node.title, node.summary]).join(' ')

  assert.equal(graph.nodes[0].title, 'Weekly product cadence')
  assert.doesNotMatch(content, /[\p{Script=Han}]/u)
})

test('the context layer starts with 50 connected work-memory nodes', () => {
  const context = memoryState.initialMemoryGraph.nodes.filter((node) => node.layer === 'context')
  const contextIds = new Set(context.map((node) => node.id))

  assert.equal(context.length, 50)
  assert.equal(memoryState.initialMemoryGraph.edges.filter((edge) => contextIds.has(edge.from) && contextIds.has(edge.to)).length, 60)
})

test('context nodes start on stable radial layers ordered by connection density', () => {
  const context = memoryState.initialMemoryGraph.nodes.filter((node) => node.layer === 'context')
  const degrees = context.reduce<Record<string, number>>((result, node) => ({ ...result, [node.id]: 0 }), {})
  memoryState.initialMemoryGraph.edges.forEach((edge) => {
    if (degrees[edge.from] !== undefined) degrees[edge.from] += 1
    if (degrees[edge.to] !== undefined) degrees[edge.to] += 1
  })
  const averageRadius = (degree: number) => {
    const matching = context.filter((node) => degrees[node.id] === degree)
    return matching.reduce((total, node) => total + Math.hypot(node.position.x - 800, node.position.y - 450), 0) / matching.length
  }

  assert.ok(averageRadius(3) < averageRadius(2))
  assert.ok(averageRadius(2) < averageRadius(1))
  const centroid = context.reduce((result, node) => ({
    x: result.x + node.position.x / context.length,
    y: result.y + node.position.y / context.length,
  }), { x: 0, y: 0 })

  assert.ok(Math.abs(centroid.x - 800) < 12)
  assert.ok(Math.abs(centroid.y - 450) < 12)
})

test('material tasks preserve the graph on failure and add the matching source on completion', () => {
  const processingTask = memoryState.startMaterialTask('file', 'brief.pdf', 32)
  assert.equal(processingTask.status, 'processing')
  assert.equal(memoryState.resolveMaterialTask(memoryState.initialMemoryGraph, processingTask), memoryState.initialMemoryGraph)

  const emptyTask = memoryState.finishMaterialTask(memoryState.startMaterialTask('file', 'empty.pdf', 0))
  assert.equal(emptyTask.status, 'failed')
  assert.equal(memoryState.resolveMaterialTask(memoryState.initialMemoryGraph, emptyTask), memoryState.initialMemoryGraph)

  const uploaded = memoryState.resolveMaterialTask(
    memoryState.initialMemoryGraph,
    memoryState.finishMaterialTask(memoryState.startMaterialTask('file', 'brief.pdf', 32)),
  )
  const migrated = memoryState.resolveMaterialTask(
    memoryState.initialMemoryGraph,
    memoryState.finishMaterialTask(memoryState.startMaterialTask('migration', 'work.md', 32)),
  )

  assert.equal(uploaded.nodes.at(-1)?.source, 'file')
  assert.equal(uploaded.nodes.at(-1)?.layer, 'context')
  assert.equal(migrated.nodes.at(-1)?.source, 'conversation')
  assert.equal(migrated.nodes.at(-1)?.layer, 'context')
})

test('the user layer has a source-filter empty state without removing that source from context', () => {
  assert.equal(memoryState.visibleMemoryGraph(memoryState.initialMemoryGraph, { layer: 'context', source: 'teams', keyword: '' }).nodes.length > 0, true)
  assert.deepEqual(memoryState.visibleMemoryGraph(memoryState.initialMemoryGraph, { layer: 'user', source: 'teams', keyword: '' }), {
    nodes: [],
    edges: [],
  })
})
