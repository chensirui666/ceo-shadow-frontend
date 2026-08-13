import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement, isValidElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const { createDemoMessageSnapshot } = await import('./messageState.ts')
const { translations } = await import('./content/translations.ts')
const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: { port: 24684 }, middlewareMode: true } })
after(() => vite.close())

const text = (node: unknown): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(text).join('')
  return isValidElement(node) ? text((node as any).props.children) : ''
}

const find = (node: unknown, predicate: (element: any) => boolean): any => {
  if (Array.isArray(node)) {
    for (const child of node) { const found = find(child, predicate); if (found) return found }
  }
  if (isValidElement(node)) {
    const element = node as any
    if (predicate(element)) return element
    return find(element.props.children, predicate)
  }
}

test('MessageList renders six status tabs, fixed columns, and confirmation actions without fake search', async () => {
  const { default: MessageList } = await vite.ssrLoadModule('/src/components/MessageList.tsx')
  const snapshot = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const html = renderToStaticMarkup(createElement(MessageList, {
    messages: snapshot.messages,
    copy: translations.zh.workspace.message,
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
  const html = renderToStaticMarkup(createElement(MessageDetail, { copy: translations.zh.workspace.message, message, onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {} }))

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

test('Message interactions filter, open, decide, and submit only a non-blank downvote reason', async () => {
  const [{ default: MessageList }, { default: MessageDetail }, { MessageFeedbackControls }] = await Promise.all([
    vite.ssrLoadModule('/src/components/MessageList.tsx'), vite.ssrLoadModule('/src/components/MessageDetail.tsx'), vite.ssrLoadModule('/src/components/MessageFeedbackControls.tsx'),
  ])
  const snapshot = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const calls: string[] = []
  const list = MessageList({ copy: translations.zh.workspace.message, messages: snapshot.messages, status: 'all', onConfirm: (id: string) => calls.push(`confirm:${id}`), onFeedback: () => {}, onOpen: (id: string) => calls.push(`open:${id}`), onSkip: (id: string) => calls.push(`skip:${id}`), onStatusChange: (status: string) => calls.push(`filter:${status}`) })
  const pending = snapshot.messages.find((message) => message.status === 'pending')!
  const confirmation = snapshot.messages.find((message) => message.status === 'needs-confirmation')!
  const stopped = { value: 0 }

  find(list, (element) => element.type === 'button' && text(element) === '待处理 1').props.onClick()
  find(list, (element) => element.type === 'button' && element.props.className === 'message-list-open' && element.props.title.includes(pending.question)).props.onClick()
  find(list, (element) => element.type === 'button' && text(element) === '确认').props.onClick({ stopPropagation: () => { stopped.value++ } })
  find(list, (element) => element.type === 'button' && text(element) === '跳过').props.onClick({ stopPropagation: () => { stopped.value++ } })
  assert.deepEqual(calls, [`filter:pending`, `open:${pending.id}`, `confirm:${confirmation.id}`, `skip:${confirmation.id}`])
  assert.equal(stopped.value, 2)

  const feedback: Array<{ rating: string; reason: string }> = []
  const controls = MessageFeedbackControls({ copy: translations.zh.workspace.message.feedbackControls, id: confirmation.id, onFeedback: (_id: string, value: { rating: string; reason: string }) => feedback.push(value), stopPropagation: true })
  const form = find(controls, (element) => element.type === 'form')
  const submit = (reason: string) => form.props.onSubmit({ currentTarget: { elements: { namedItem: () => ({ value: reason }) }, reset: () => {} }, preventDefault: () => {} })
  submit('   ')
  submit('需要先确认排期。')
  assert.deepEqual(feedback, [{ rating: 'down', reason: '需要先确认排期。' }])
  assert.equal(find(controls, (element) => element.type === 'input').props.required, true)

  const pendingHtml = renderToStaticMarkup(createElement(MessageDetail, { copy: translations.zh.workspace.message, message: pending, onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {} }))
  assert.doesNotMatch(pendingHtml, /点赞|点踩/)
})

test('English Message chrome does not leak static Chinese copy', async () => {
  const [{ default: MessageList }, { default: MessageDetail }] = await Promise.all([
    vite.ssrLoadModule('/src/components/MessageList.tsx'), vite.ssrLoadModule('/src/components/MessageDetail.tsx'),
  ])
  const snapshot = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const list = renderToStaticMarkup(createElement(MessageList, {
    copy: translations.en.workspace.message, messages: snapshot.messages, status: 'all',
    onConfirm: () => {}, onFeedback: () => {}, onOpen: () => {}, onSkip: () => {}, onStatusChange: () => {},
  }))
  const detail = renderToStaticMarkup(createElement(MessageDetail, {
    copy: translations.en.workspace.message, message: snapshot.messages.find((message) => message.status === 'processed'),
    onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {},
  }))

  for (const label of ['Message', 'All', 'Needs confirmation', 'Status and time', 'Question', 'Actions', 'Quick overview', 'Back to Message', 'Reasoning', 'Handling result', 'Message information', 'Activity timeline']) assert.match(`${list}${detail}`, new RegExp(label))
  assert.match(`${list}${detail}`, /Friday(?:'|&#x27;)s handling/)
  assert.doesNotMatch(`${list}${detail}`, /<h1[^>]*>消息<|aria-label="消息状态"|>全部 6<|>状态与时间<|>对象／来源／类别<|>用户问题<|>Friday 的处理<|>快捷概览<|>返回消息<|>判断依据<|>回答／处理结果<|>反馈原因<|>提交反馈<|>处理依据与材料<|>Message 信息<|>活动时间线</)
})
