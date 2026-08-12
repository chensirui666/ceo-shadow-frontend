import assert from 'node:assert/strict'
import test from 'node:test'

const memoryCanvasState = await import('./memoryCanvasState.ts')

test('node diameters use compact total-edge-count buckets', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4, 9].map(memoryCanvasState.nodeDiameterForDegree),
    [16, 16, 22, 30, 38, 38],
  )
})

test('force drag participants include every visible node', () => {
  assert.deepEqual(
    memoryCanvasState.forceParticipantIds([{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]),
    new Set(['a', 'b', 'c', 'd']),
  )
})

test('edge gradients anchor each end to its node color', () => {
  assert.deepEqual(
    memoryCanvasState.edgeGradientColors('#82957d', '#839eb3'),
    { sourceColor: '#82957d', targetColor: '#839eb3' },
  )
  assert.deepEqual(
    memoryCanvasState.edgeGradientColors(undefined, '#839eb3'),
    { sourceColor: '#969189', targetColor: '#839eb3' },
  )
})

test('deterministic radial layout keeps denser nodes closer to the center without a perfect ring', () => {
  const nodes = [
    { id: 'a', source: 'dingtalk' },
    { id: 'b', source: 'feishu' },
    { id: 'c', source: 'teams' },
    { id: 'd', source: 'file' },
    { id: 'e', source: 'conversation' },
    { id: 'f', source: 'dingtalk' },
    { id: 'g', source: 'feishu' },
  ]
  const edges = [
    { from: 'a', to: 'b' },
    { from: 'a', to: 'c' },
    { from: 'a', to: 'd' },
    { from: 'b', to: 'c' },
    { from: 'd', to: 'e' },
    { from: 'e', to: 'f' },
  ]
  const positions = memoryCanvasState.radialMemoryPositions(nodes, edges)
  const radius = (id: string) => Math.hypot(positions[id].x - 800, positions[id].y - 450)

  assert.deepEqual(positions, memoryCanvasState.radialMemoryPositions(nodes, edges))
  assert.ok(radius('a') < radius('d'))
  assert.ok(radius('d') < radius('f'))
  assert.notEqual(radius('f'), radius('g'))
})

test('edge emphasis keeps the graph quiet until a connected node is active', () => {
  const edge = { from: 'source', to: 'target' }

  assert.equal(memoryCanvasState.edgeVisualState(edge, null), 'default')
  assert.equal(memoryCanvasState.edgeVisualState(edge, 'source'), 'active')
  assert.equal(memoryCanvasState.edgeVisualState(edge, 'target'), 'active')
  assert.equal(memoryCanvasState.edgeVisualState(edge, 'other'), 'muted')
})

test('force links preserve a 72px node-edge gap', () => {
  assert.equal(memoryCanvasState.forceLinkDistance(15, 11), 98)
})

test('force links keep a uniform constraint strength', () => {
  assert.equal(memoryCanvasState.forceLinkStrength, 1)
})

test('force links use extra iterations to settle spacing precisely', () => {
  assert.equal(memoryCanvasState.forceLinkIterations, 4)
})

test('only changed local positions are emitted for persistence', () => {
  assert.deepEqual(
    memoryCanvasState.changedPositions(
      { a: { x: 10, y: 10 }, b: { x: 20, y: 20 }, c: { x: 30, y: 30 } },
      { a: { x: 10, y: 10 }, b: { x: 31, y: 17 }, c: { x: 30, y: 30 } },
      new Set(['a', 'b']),
    ),
    { b: { x: 31, y: 17 } },
  )
})

test('current canvas coordinates survive a server confirmation in the same visit', () => {
  assert.deepEqual(
    memoryCanvasState.displayPosition({ x: 527, y: 283 }, { x: 485, y: 275 }),
    { x: 527, y: 283 },
  )
  assert.deepEqual(
    memoryCanvasState.displayPosition(undefined, { x: 485, y: 275 }),
    { x: 485, y: 275 },
  )
})
