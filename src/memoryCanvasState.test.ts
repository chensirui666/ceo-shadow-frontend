import assert from 'node:assert/strict'
import test from 'node:test'

const memoryCanvasState = await import('./memoryCanvasState.ts')

test('node diameters use stable total-edge-count buckets', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4, 9].map(memoryCanvasState.nodeDiameterForDegree),
    [24, 24, 36, 48, 60, 60],
  )

  assert.deepEqual(
    memoryCanvasState.nodeDegrees([
      { from: 'a', to: 'b' },
      { from: 'a', to: 'c' },
      { from: 'a', to: 'd' },
      { from: 'a', to: 'e' },
      { from: 'b', to: 'c' },
    ]),
    { a: 4, b: 2, c: 2, d: 1, e: 1 },
  )
})

test('dragging a node moves only its direct neighbours', () => {
  assert.deepEqual(
    memoryCanvasState.moveDirectNeighbours(
      { a: { x: 10, y: 10 }, b: { x: 20, y: 20 }, c: { x: 30, y: 30 }, d: { x: 40, y: 40 } },
      [{ from: 'a', to: 'b' }, { from: 'a', to: 'c' }, { from: 'c', to: 'd' }],
      'a',
      { x: 8, y: -4 },
    ),
    { a: { x: 10, y: 10 }, b: { x: 28, y: 16 }, c: { x: 38, y: 26 }, d: { x: 40, y: 40 } },
  )
})

test('new Memory nodes receive a stable canvas position', () => {
  assert.deepEqual(memoryCanvasState.initialMemoryPosition('context-brief'), { x: 485, y: 275 })
  assert.deepEqual(memoryCanvasState.initialMemoryPosition('context-file-3'), memoryCanvasState.initialMemoryPosition('context-file-3'))
})
