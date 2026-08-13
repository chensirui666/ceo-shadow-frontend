import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: { port: 24685 }, middlewareMode: true } })
after(() => vite.close())

test('MessageWorkspace starts with the selected locale loading state', async () => {
  const { default: MessageWorkspace } = await vite.ssrLoadModule('/src/components/MessageWorkspace.tsx')
  const { translations } = await vite.ssrLoadModule('/src/content/translations.ts')
  const html = renderToStaticMarkup(createElement(MessageWorkspace, { copy: translations.en.workspace.message, service: { load: async () => ({ messages: [] }), confirm: async () => ({ messages: [] }), skip: async () => ({ messages: [] }), submitFeedback: async () => ({ messages: [] }) } }))

  assert.match(html, /Loading messages/)
  assert.doesNotMatch(html, /正在加载消息/)
})

test('MessageWorkspace content has a readable empty state and switches to the selected detail', async () => {
  const [{ MessageWorkspaceContent }, { createDemoMessageSnapshot }, { translations }] = await Promise.all([
    vite.ssrLoadModule('/src/components/MessageWorkspace.tsx'), vite.ssrLoadModule('/src/messageState.ts'), vite.ssrLoadModule('/src/content/translations.ts'),
  ])
  const handlers = { onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onOpen: () => {}, onSkip: () => {}, onStatusChange: () => {} }
  const empty = renderToStaticMarkup(createElement(MessageWorkspaceContent, { ...handlers, copy: translations.zh.workspace.message, selectedId: null, snapshot: { messages: [] }, status: 'all' }))
  const message = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z')).messages[0]
  const detail = renderToStaticMarkup(createElement(MessageWorkspaceContent, { ...handlers, copy: translations.zh.workspace.message, selectedId: message.id, snapshot: { messages: [message] }, status: 'all' }))

  assert.match(empty, /还没有需要处理的消息/)
  assert.match(detail, new RegExp(message.question))
  assert.match(detail, /返回 Message/)
})
