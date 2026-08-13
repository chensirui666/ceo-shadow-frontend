import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: { port: 24685 }, middlewareMode: true } })
after(() => vite.close())

test('MessageWorkspace starts with a readable loading state', async () => {
  const { default: MessageWorkspace } = await vite.ssrLoadModule('/src/components/MessageWorkspace.tsx')
  const html = renderToStaticMarkup(createElement(MessageWorkspace, { service: { load: async () => ({ messages: [] }), confirm: async () => ({ messages: [] }), skip: async () => ({ messages: [] }), submitFeedback: async () => ({ messages: [] }) } }))

  assert.match(html, /正在加载消息/)
})
