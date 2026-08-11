import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const { translations } = await import('./content/translations.ts')
const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: { port: 24679 }, middlewareMode: true } })
after(() => vite.close())

test('activity chart exposes a textual legend and exact counts for a focusable hour', async () => {
  const { default: HomeActivityChart } = await vite.ssrLoadModule('/src/components/HomeActivityChart.tsx')
  const html = renderToStaticMarkup(createElement(HomeActivityChart, { activity: [{ hour: '10', processed: 2, pending: 1, failed: 1 }], copy: translations.zh.workspace.home }))

  assert.match(html, /已处理 2/)
  assert.match(html, /待处理 1/)
  assert.match(html, /发送失败 1/)
  assert.match(html, /10:00：已处理 2，待处理 1，发送失败 1/)
})

test('formal Home exposes the latest non-zero hour in an opt-in tooltip', async () => {
  const { default: HomeActivityChart } = await vite.ssrLoadModule('/src/components/HomeActivityChart.tsx')
  const activity = [
    { hour: '02', processed: 0, pending: 0, failed: 0 },
    { hour: '03', processed: 3, pending: 3, failed: 1 },
  ]
  const withTooltip = renderToStaticMarkup(createElement(HomeActivityChart, {
    activity, copy: translations.en.workspace.home, showDefaultTooltip: true,
  }))
  const withoutTooltip = renderToStaticMarkup(createElement(HomeActivityChart, {
    activity, copy: translations.en.workspace.home,
  }))

  assert.match(withTooltip, /home-chart-tooltip/)
  assert.match(withTooltip, /03:00/)
  assert.match(withTooltip, /Processed 3/)
  assert.match(withTooltip, /Pending 3/)
  assert.match(withTooltip, /Send failed 1/)
  assert.doesNotMatch(withoutTooltip, /home-chart-tooltip/)
})

test('event list renders a compact row with a countdown and message lines', async () => {
  const { default: HomeEventList } = await vite.ssrLoadModule('/src/components/HomeEventList.tsx')
  const event = {
    id: 'waiting', source: 'feishu', conversation: '产品项目群', sender: '刘晨', receivedAt: '2026-08-06T10:42:00.000Z',
    status: 'waiting', question: '下周的上线时间能确定吗？', reply: '目前计划在下周三完成上线，我会在周一同步最终排期。',
    rationale: '等待你先回复。', waitUntil: '2026-08-06T10:45:00.000Z',
  } satisfies import('./homeState.ts').HomeEvent
  const html = renderToStaticMarkup(createElement(HomeEventList, { copy: translations.zh.workspace.home, events: [event], now: new Date('2026-08-06T10:42:42.000Z'), onOpen: () => {}, sourceNames: { dingtalk: '钉钉', feishu: '飞书', teams: 'Teams' } }))

  assert.match(html, /产品项目群 · 刘晨/)
  assert.match(html, /2分18秒后自动回复/)
  assert.match(html, /问题：下周的上线时间能确定吗？/)
  assert.match(html, /回复：目前计划在下周三完成上线/)
})

test('a session Trial event carries a visible Trial marker in Home', async () => {
  const { default: HomeEventList } = await vite.ssrLoadModule('/src/components/HomeEventList.tsx')
  const event = {
    id: 'trial', source: 'dingtalk', sender: '你', receivedAt: '2026-08-09T09:00:00.000Z', status: 'trial-complete',
    question: '客户问：当前方案有什么风险？', reply: '我会先核实当前进度、风险和需要确认的事项。', rationale: 'Trial：回复仅在当前会话中查看，未发送给任何联系人。',
  } satisfies import('./homeState.ts').HomeEvent
  const html = renderToStaticMarkup(createElement(HomeEventList, { copy: translations.zh.workspace.home, events: [event], now: new Date('2026-08-09T09:01:00.000Z'), onOpen: () => {}, sourceNames: { dingtalk: '钉钉', feishu: '飞书', teams: 'Teams' } }))

  assert.match(html, /Trial · 已完成，未发送/)
})

const createDetailEvent = (override: Partial<import('./homeState.ts').HomeEvent> = {}): import('./homeState.ts').HomeEvent => ({
  id: 'detail', source: 'feishu', conversation: '产品项目群', sender: '刘晨', receivedAt: '2026-08-06T10:42:00.000Z',
  status: 'completed', outcome: 'sent', question: '下周的上线时间能确定吗？', reply: '建议下周三上线。',
  rationale: '符合当前处理规则，回复已自动发送。', ...override,
})

test('confirmation detail offers an editable response with send and cancel', async () => {
  const { default: HomeEventDetail } = await vite.ssrLoadModule('/src/components/HomeEventDetail.tsx')
  const event = createDetailEvent({ status: 'needs-confirmation', reply: '建议下周三上线。', rationale: '涉及交付时间承诺，需要你确认后再回复。' })
  const html = renderToStaticMarkup(createElement(HomeEventDetail, { busy: false, copy: translations.zh.workspace.home, event, onBack: () => {}, onResolve: () => {}, onSubmitFeedback: () => {}, sourceName: '飞书' }))

  assert.match(html, /执行依据/)
  assert.match(html, /涉及交付时间承诺，需要你确认后再回复。/)
  assert.match(html, /<textarea/)
  assert.match(html, />发送</)
  assert.match(html, />取消</)
})

test('sent detail includes the recipient feedback preview while a failure has no retry action', async () => {
  const { default: HomeEventDetail } = await vite.ssrLoadModule('/src/components/HomeEventDetail.tsx')
  const sent = renderToStaticMarkup(createElement(HomeEventDetail, { busy: false, copy: translations.zh.workspace.home, event: createDetailEvent(), onBack: () => {}, onResolve: () => {}, onSubmitFeedback: () => {}, sourceName: '钉钉' }))
  const failed = renderToStaticMarkup(createElement(HomeEventDetail, { busy: false, copy: translations.zh.workspace.home, event: createDetailEvent({ status: 'send-failed', outcome: undefined }), onBack: () => {}, onResolve: () => {}, onSubmitFeedback: () => {}, sourceName: '飞书' }))

  assert.match(sent, /这条回复是否解决了你的问题？/)
  assert.match(sent, /未解决/)
  assert.doesNotMatch(failed, /重试|重新连接/)
})

test('source row switches the formal Home back to Trial with filtering', async () => {
  const { HomeSourceRow } = await vite.ssrLoadModule('/src/components/HomeWorkspace.tsx')
  const html = renderToStaticMarkup(createElement(HomeSourceRow, {
    connectedSources: ['dingtalk', 'feishu'] as const, copy: translations.en.workspace.home, mode: 'active',
    onModeChange: async () => {}, onSourceChange: () => {}, source: 'all',
  }))

  assert.match(html, /Source/)
  assert.match(html, /All apps/)
  assert.match(html, />Switch to trial mode</)
  assert.doesNotMatch(html, />Pause</)
})

test('workspace keeps global controls outside the white canvas and removes the rail account', async () => {
  const { default: Workspace } = await vite.ssrLoadModule('/src/components/Workspace.tsx')
  const html = renderToStaticMarkup(createElement(Workspace, {
    locale: 'en', onLocaleChange: () => {}, onSignOut: () => {}, session: { email: 'sirui@example.com', route: 'home' },
  }))

  const globalBarIndex = html.indexOf('workspace-global-bar')
  const canvasIndex = html.indexOf('workspace-canvas')
  assert.ok(globalBarIndex >= 0 && globalBarIndex < canvasIndex)
  assert.doesNotMatch(html, /rail-account/)
})

test('workspace starts onboarding for every non-seeded demo account', async () => {
  const { default: Workspace } = await vite.ssrLoadModule('/src/components/Workspace.tsx')
  const html = renderToStaticMarkup(createElement(Workspace, {
    locale: 'zh', onLocaleChange: () => {}, onSignOut: () => {}, session: { email: 'new.person@stardust.ai', route: 'home' },
  }))

  assert.match(html, /连接你的工作应用/)
  assert.match(html, /暂无工作事件/)
})

test('workspace keeps the seeded demo account on the normal Home', async () => {
  const { default: Workspace } = await vite.ssrLoadModule('/src/components/Workspace.tsx')
  const html = renderToStaticMarkup(createElement(Workspace, {
    locale: 'zh', onLocaleChange: () => {}, onSignOut: () => {}, session: { email: 'sirui.chen@stardust.ai', route: 'home' },
  }))

  assert.doesNotMatch(html, /连接你的工作应用/)
  assert.match(html, /正在加载最近事件…/)
})

test('workspace renders FeedbackWorkspace instead of the feedback placeholder', async () => {
  const { default: Workspace } = await vite.ssrLoadModule('/src/components/Workspace.tsx')
  const html = renderToStaticMarkup(createElement(Workspace, {
    locale: 'zh', onLocaleChange: () => {}, onSignOut: () => {}, session: { email: 'sirui@example.com', route: 'feedback' },
  }))

  assert.match(html, /正在载入演示反馈…/)
  assert.doesNotMatch(html, /你和同事对回复的反馈，会在这里帮助 Friday 持续校准/)
})
