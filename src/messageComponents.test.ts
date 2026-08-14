import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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

const findAll = (node: unknown, predicate: (element: any) => boolean): any[] => {
  if (Array.isArray(node)) return node.flatMap((child) => findAll(child, predicate))
  if (!isValidElement(node)) return []
  const element = node as any
  return [...(predicate(element) ? [element] : []), ...findAll(element.props.children, predicate)]
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

test('MessageList gives each Message a sender identity, source mark, category tag, compact time, and status signal', async () => {
  const { default: MessageList } = await vite.ssrLoadModule('/src/components/MessageList.tsx')
  const snapshot = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const html = renderToStaticMarkup(createElement(MessageList, {
    messages: snapshot.messages,
    copy: translations.en.workspace.message,
    status: 'all',
    onConfirm: () => {}, onFeedback: () => {}, onOpen: () => {}, onSkip: () => {}, onStatusChange: () => {},
  }))

  assert.match(html, /class="message-list-avatar"/)
  assert.match(html, /images\.unsplash\.com/)
  assert.match(html, /message-list-source-icon/)
  assert.match(html, /message-list-category/)
  assert.match(html, /message-list-status-needs-confirmation/)
  assert.match(html, /message-list-time/)
  assert.match(html, /Aug 13/)
  assert.doesNotMatch(html, />Aug 13, 2026/)
})

test('MessageList keeps icon-based confirmation, skip, and feedback actions', async () => {
  const { default: MessageList } = await vite.ssrLoadModule('/src/components/MessageList.tsx')
  const snapshot = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const html = renderToStaticMarkup(createElement(MessageList, {
    messages: snapshot.messages,
    copy: translations.en.workspace.message,
    status: 'all',
    onConfirm: () => {}, onFeedback: () => {}, onOpen: () => {}, onSkip: () => {}, onStatusChange: () => {},
  }))

  assert.match(html, /message-list-action-confirm/)
  assert.match(html, /message-list-action-skip/)
  assert.match(html, /aria-label="Like"/)
  assert.match(html, /aria-label="Dislike"/)
})

test('MessageList uses compact HeroUI controls for confirmation decisions', async () => {
  const { default: MessageList } = await vite.ssrLoadModule('/src/components/MessageList.tsx')
  const snapshot = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const list = MessageList({
    messages: snapshot.messages,
    copy: translations.zh.workspace.message,
    status: 'all',
    onConfirm: () => {}, onFeedback: () => {}, onOpen: () => {}, onSkip: () => {}, onStatusChange: () => {},
  })
  const decisions = findAll(list, (element) => ['message-list-action-confirm', 'message-list-action-skip'].includes(element.props.className))

  assert.deepEqual(decisions.map((button) => button.props.variant), ['primary', 'secondary'])
  assert.ok(decisions.every((button) => button.props.size === 'sm' && typeof button.props.onPress === 'function'))
})

test('MessageList sidebar uses component filters and changes its summary range', async () => {
  const { default: MessageList } = await vite.ssrLoadModule('/src/components/MessageList.tsx')
  const snapshot = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const calls: string[] = []
  const filterChanges: Array<Record<string, string>> = []
  const rangeChanges: string[] = []
  let openedSettings = 0
  const list = MessageList({
    messages: snapshot.messages,
    copy: translations.zh.workspace.message,
    status: 'all',
    onConfirm: () => {}, onFeedback: () => {}, onOpen: () => {}, onSkip: () => {}, onStatusChange: (status: string) => calls.push(status),
    onFiltersChange: (filters: { source: string; category: string }) => filterChanges.push(filters), onOpenSettings: () => { openedSettings++ }, onSummaryRangeChange: (range: string) => rangeChanges.push(range),
  })
  const aside = find(list, (element) => element.type === 'aside' && element.props.className === 'message-list-quick')
  const sections = findAll(aside, (element) => element.type === 'section')

  assert.deepEqual(sections.map((section) => section.props.className), ['message-list-filters', 'message-list-sources', 'message-list-summary', 'message-list-smarter'])
  assert.deepEqual(findAll(sections[0], (element) => element.props.onSelectionChange).map((select) => select.props.label), ['全部来源', '全部类别'])
  find(sections[0], (element) => element.props.onSelectionChange && element.props.label === '全部来源').props.onSelectionChange('feishu')
  find(sections[0], (element) => element.props.onPress && text(element) === '清除全部').props.onPress()
  assert.deepEqual(filterChanges, [{ source: 'feishu', category: 'all' }, { source: 'all', category: 'all' }])
  assert.deepEqual(calls, [])
  assert.deepEqual(findAll(sections[1], (element) => element.type === 'li').map(text), ['钉钉3', '飞书2', 'Teams1', 'Slack0', '企微0', 'Discord0'])
  assert.match(text(sections[2]), /过去 7 天/)
  assert.match(text(sections[2]), /消息总数6待确认1已处理1处理失败1/)
  find(sections[2], (element) => element.props.onAction && element.props['aria-label'] === '统计范围').props.onAction('30d')
  assert.deepEqual(rangeChanges, ['30d'])
  find(sections[3], (element) => element.props.onPress && text(element) === '前往设置').props.onPress()
  assert.equal(openedSettings, 1)
})

test('MessageDetail keeps A-to-C in the reading area and moves Feedback to the aside', async () => {
  const { default: MessageDetail } = await vite.ssrLoadModule('/src/components/MessageDetail.tsx')
  const message = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z')).messages.find((item) => item.id === 'delivery-commitment')!
  const detail = MessageDetail({ copy: translations.zh.workspace.message, message, onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {} })
  const reading = find(detail, (element) => element.type === 'main' && element.props.className === 'message-detail-reading')
  const aside = find(detail, (element) => element.type === 'aside' && element.props.className === 'message-detail-aside')
  const readingHtml = renderToStaticMarkup(reading)
  const asideHtml = renderToStaticMarkup(aside)

  for (const heading of ['A. 原始问题', 'B. Friday 的判断依据', 'C. 回答／处理结果']) assert.match(readingHtml, new RegExp(heading))
  assert.match(readingHtml, /message-detail-original-source/)
  assert.match(readingHtml, /交付资源与排期核对\.xlsx/)
  assert.match(readingHtml, /已准备回复客户的交付承诺草稿/)
  assert.doesNotMatch(readingHtml, /D\. 关联 Task|E\. 反馈|确认交付资源与最终排期/)
  assert.match(asideHtml, /message-detail-feedback/)
  assert.match(asideHtml, /反馈/)
  assert.match(asideHtml, /aria-label="点赞"/)
  assert.match(asideHtml, /aria-label="点踩"/)
  assert.match(asideHtml, /message-detail-information-row/)
  assert.match(asideHtml, /message-detail-task-summary-link/)
  assert.match(asideHtml, /1 个 Task（1 个进行中）/)
  assert.doesNotMatch(asideHtml, /活动时间线/)
})

test('MessageDetail keeps the Task summary visual while making it noninteractive', async () => {
  const { default: MessageDetail } = await vite.ssrLoadModule('/src/components/MessageDetail.tsx')
  const message = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z')).messages.find((item) => item.id === 'delivery-commitment')!
  const detail = MessageDetail({ copy: translations.zh.workspace.message, message, onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {} })
  const summary = find(detail, (element) => element.props.className === 'message-detail-task-summary-link')

  assert.equal(summary.type, 'div')
  assert.equal(summary.props.onPress, undefined)
  assert.match(renderToStaticMarkup(summary), /1 个 Task（1 个进行中）.*<svg/)
})

test('MessageDetail keeps rendering when a hot-reloaded session still holds a legacy Message record', async () => {
  const { default: MessageDetail } = await vite.ssrLoadModule('/src/components/MessageDetail.tsx')
  const currentMessage = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z')).messages.find((item) => item.id === 'delivery-commitment')!
  const legacyMessage = {
    ...currentMessage,
    deliverables: undefined,
    relatedTasks: undefined,
    timeline: ['收到客户交付承诺询问'],
  } as unknown as typeof currentMessage

  const html = renderToStaticMarkup(createElement(MessageDetail, { copy: translations.zh.workspace.message, message: legacyMessage, onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {} }))

  assert.match(html, /C\. 回答／处理结果/)
  assert.match(html, /0 个 Task（0 个进行中）/)
  assert.doesNotMatch(html, /D\. 关联 Task|关联 Task：确认交付资源与最终排期/)
})

test('Message styles align aside headers and detail card content with their reading anchors', () => {
  const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8')

  assert.match(css, /\.message-list-open\s*\{[^}]*align-items:\s*center;/)
  assert.match(css, /\.message-list-status\s*\{[^}]*gap:\s*12px;/)
  assert.match(css, /\.message-list-status-dot\s*\{[^}]*translateY\(3px\)/)
  assert.match(css, /\.message-list-filters header h2, \.message-list-summary header h2\s*\{[^}]*margin-bottom:\s*0;/)
  assert.match(css, /\.message-detail-card > p, \.message-detail-card > small, \.message-detail-card > ul\s*\{[^}]*margin-left:\s*23px;/)
  assert.match(css, /\.message-feedback-control\[aria-pressed='true'\]\s*\{/)
  assert.match(css, /\.message-detail-status-needs-confirmation\s*\{[^}]*color:\s*var\(--status-pending-foreground\)/)
  for (const className of ['message-detail-original-source', 'message-detail-deliverables', 'message-detail-information-row', 'message-detail-task-summary-link', 'message-detail-feedback']) assert.match(css, new RegExp(`\\.${className}`))
})

test('MessageDetail reads in decision order with compact feedback and a collapsed material section', async () => {
  const { default: MessageDetail } = await vite.ssrLoadModule('/src/components/MessageDetail.tsx')
  const message = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z')).messages.find((item) => item.status === 'processed')!
  const html = renderToStaticMarkup(createElement(MessageDetail, { copy: translations.zh.workspace.message, message, onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {} }))

  const ordered = ['用户问题', '判断依据', '回答／处理结果', '处理依据与材料']
  assert.ok(ordered.every((label, index) => index === 0 || html.indexOf(ordered[index - 1]) < html.indexOf(label)))
  assert.match(html, /点赞/)
  assert.match(html, /点踩/)
  assert.match(html, /message-detail-feedback-header/)
  assert.doesNotMatch(html, /反馈原因|提交反馈/)
  assert.match(html, /<details/)
  for (const label of ['操作', 'Message 信息', 'Task 汇总']) assert.match(html, new RegExp(label))
  assert.doesNotMatch(html, /活动时间线/)
  assert.doesNotMatch(html, /思维链|技术日志/)
})

test('MessageDetail title area carries status and known metadata before the reading layout', async () => {
  const { default: MessageDetail } = await vite.ssrLoadModule('/src/components/MessageDetail.tsx')
  const message = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z')).messages.find((item) => item.status === 'needs-confirmation')!
  const detail = MessageDetail({ copy: translations.zh.workspace.message, message, onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {} })
  const header = find(detail, (element) => element.type === 'header' && element.props.className === 'message-detail-header')
  const metadata = find(header, (element) => element.props.className === 'message-detail-meta')
  const items = findAll(metadata, (element) => element.props.className === 'message-detail-meta-item')
  const status = find(header, (element) => String(element.props.className).includes('message-detail-status'))

  assert.match(text(header), /客户交付群待确认/)
  assert.equal(items.length, 4)
  for (const value of ['对象：赵明', '来源：飞书', '类别：聊天', '收到时间：']) assert.match(text(metadata), new RegExp(value))
  assert.equal(find(items[3], (element) => element.type === 'time').props.dateTime, message.receivedAt)
  assert.equal(find(status, (element) => element.props.className === 'message-detail-status-dot').type, 'i')
})

test('Message interactions filter, open, decide, and keep detail feedback free of follow-up copy', async () => {
  const [{ default: MessageList }, { default: MessageDetail }, { MessageFeedbackControls }] = await Promise.all([
    vite.ssrLoadModule('/src/components/MessageList.tsx'), vite.ssrLoadModule('/src/components/MessageDetail.tsx'), vite.ssrLoadModule('/src/components/MessageFeedbackControls.tsx'),
  ])
  const snapshot = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const calls: string[] = []
  const list = MessageList({ copy: translations.zh.workspace.message, messages: snapshot.messages, status: 'all', onConfirm: (id: string) => calls.push(`confirm:${id}`), onFeedback: () => {}, onOpen: (id: string) => calls.push(`open:${id}`), onSkip: (id: string) => calls.push(`skip:${id}`), onStatusChange: (status: string) => calls.push(`filter:${status}`) })
  const pending = snapshot.messages.find((message) => message.status === 'pending')!
  const confirmation = snapshot.messages.find((message) => message.status === 'needs-confirmation')!

  find(list, (element) => element.type === 'button' && text(element) === '待处理 1').props.onClick()
  find(list, (element) => element.type === 'button' && element.props.className === 'message-list-open' && element.props.title.includes(pending.question)).props.onClick()
  find(list, (element) => element.props.className === 'message-list-action-confirm').props.onPress()
  find(list, (element) => element.props.className === 'message-list-action-skip').props.onPress()
  assert.deepEqual(calls, [`filter:pending`, `open:${pending.id}`, `confirm:${confirmation.id}`, `skip:${confirmation.id}`])

  const pendingHtml = renderToStaticMarkup(createElement(MessageDetail, { copy: translations.zh.workspace.message, message: pending, onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {} }))
  assert.match(pendingHtml, /点赞|点踩/)
  assert.doesNotMatch(pendingHtml, /提交反馈/)
  const feedbackHtml = renderToStaticMarkup(createElement(MessageFeedbackControls, { copy: translations.zh.workspace.message.feedbackControls, id: pending.id, onFeedback: () => {}, stopPropagation: true }))
  assert.doesNotMatch(feedbackHtml, /<details|<form|提交反馈/)
})

test('MessageDetail does not print a separate feedback result after selection', async () => {
  const { default: MessageDetail } = await vite.ssrLoadModule('/src/components/MessageDetail.tsx')
  const message = { ...createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z')).messages.find((item) => item.status === 'processed')!, feedback: [{ rating: 'down' as const, reason: '请补充上线范围。' }] }
  const html = renderToStaticMarkup(createElement(MessageDetail, { copy: translations.zh.workspace.message, message, onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {} }))

  assert.match(html, /message-detail-feedback-header/)
  assert.doesNotMatch(html, /点踩：请补充上线范围。|已点赞/)
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

  for (const label of ['Message', 'All', 'Needs confirmation', 'Status and time', 'Question', 'Actions', 'Filters', 'Activity summary', 'Make Friday smarter', 'Back to Message', 'Original request', "Friday(?:'|&#x27;)s judgment basis", 'Answer / handling result', 'Message information', 'Task summary']) assert.match(`${list}${detail}`, new RegExp(label))
  assert.match(`${list}${detail}`, /Friday(?:'|&#x27;)s handling/)
  assert.doesNotMatch(`${list}${detail}`, /<h1[^>]*>消息<|aria-label="消息状态"|>全部 6<|>状态与时间<|>对象／来源／类别<|>用户问题<|>Friday 的处理<|>快捷概览<|>返回消息<|>反馈原因<|>提交反馈<|>处理依据与材料<|>Message 信息<|>活动时间线</)
})
