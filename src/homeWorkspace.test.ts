import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: { port: 24680 }, middlewareMode: true } })
after(() => vite.close())

test('Home renders a readable loading state before its snapshot resolves', async () => {
  const { default: HomeWorkspace } = await vite.ssrLoadModule('/src/components/HomeWorkspace.tsx')
  const html = renderToStaticMarkup(createElement(HomeWorkspace, { locale: 'zh', onOpenSettings: () => {} }))
  assert.match(html, /正在加载最近事件…/)
})
