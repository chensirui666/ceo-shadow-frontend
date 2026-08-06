import assert from 'node:assert/strict'
import test from 'node:test'

const memoryState = await import('./memoryState.ts')

test('visibleMemoryGraph filters by layer, source, keyword, and visible edge endpoints', () => {
  const graph = {
    nodes: [
      { id: 'a', layer: 'context', source: 'dingtalk', title: '产品节奏', summary: '本周发布', tier: 'core' },
      { id: 'b', layer: 'context', source: 'file', title: '发布计划', summary: '产品节奏说明', tier: 'leaf' },
      { id: 'c', layer: 'user', source: 'dingtalk', title: '工作偏好', summary: '优先产品', tier: 'core' },
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
