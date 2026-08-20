import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: false, middlewareMode: true } })
after(() => vite.close())

test('Memory graph does not render the React Flow attribution', async () => {
  const [{ default: MemoryGraph }, memoryState] = await Promise.all([
    vite.ssrLoadModule('/src/components/MemoryGraph.tsx'),
    vite.ssrLoadModule('/src/memoryState.ts'),
  ])
  const visible = memoryState.visibleMemoryGraph(memoryState.initialMemoryGraph, { layer: 'context', source: 'all', keyword: '' })
  const html = renderToStaticMarkup(createElement(MemoryGraph, {
    allEdges: memoryState.initialMemoryGraph.edges,
    edges: visible.edges,
    nodes: visible.nodes,
    onPositionsChange: () => {},
    summary: 'Memory graph',
  }))

  assert.doesNotMatch(html, /React Flow/)
})
