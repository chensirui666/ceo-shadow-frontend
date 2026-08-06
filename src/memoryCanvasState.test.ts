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
