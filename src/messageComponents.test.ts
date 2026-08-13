import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const { createDemoMessageSnapshot } = await import('./messageState.ts')
const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: { port: 24684 }, middlewareMode: true } })
after(() => vite.close())

test('MessageList renders six status tabs, fixed columns, and confirmation actions without fake search', async () => {
  const { default: MessageList } = await vite.ssrLoadModule('/src/components/MessageList.tsx')
  const snapshot = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const html = renderToStaticMarkup(createElement(MessageList, {
    messages: snapshot.messages,
    status: 'all',
    onConfirm: () => {}, onFeedback: () => {}, onOpen: () => {}, onSkip: () => {}, onStatusChange: () => {},
  }))

  assert.match(html, /消息/)
  for (const label of ['全部', '待处理', '处理中', '待确认', '已处理', '已跳过', '处理失败', '状态与时间', '对象／来源／类别', '用户问题', 'Friday 的处理', '操作']) assert.match(html, new RegExp(label))
  assert.match(html, /确认/)
  assert.match(html, /跳过/)
  assert.doesNotMatch(html, /搜索/)
})

test('MessageDetail reads in decision order and offers result feedback plus a collapsed material section', async () => {
  const { default: MessageDetail } = await vite.ssrLoadModule('/src/components/MessageDetail.tsx')
  const message = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z')).messages.find((item) => item.status === 'processed')!
  const html = renderToStaticMarkup(createElement(MessageDetail, { message, onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {} }))

  const ordered = ['用户问题', '判断依据', '回答／处理结果', '关联 Task', '反馈', '处理依据与材料']
  assert.ok(ordered.every((label, index) => index === 0 || html.indexOf(ordered[index - 1]) < html.indexOf(label)))
  assert.match(html, /点赞/)
  assert.match(html, /点踩/)
  assert.match(html, /反馈原因/)
  assert.match(html, /提交反馈/)
  assert.match(html, /<details/)
  for (const label of ['操作', 'Message 信息', 'Task 汇总', '活动时间线']) assert.match(html, new RegExp(label))
  assert.doesNotMatch(html, /思维链|技术日志/)
})
