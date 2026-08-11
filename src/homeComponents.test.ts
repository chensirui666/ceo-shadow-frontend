import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
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

test('formal Home chart starts without a detail panel', async () => {
  const { default: HomeActivityChart } = await vite.ssrLoadModule('/src/components/HomeActivityChart.tsx')
  const activity = [
    { hour: '02', processed: 0, pending: 0, failed: 0 },
    { hour: '03', processed: 3, pending: 3, failed: 1 },
  ]
  const html = renderToStaticMarkup(createElement(HomeActivityChart, {
    activity, copy: translations.en.workspace.home, showDefaultTooltip: true,
  }))

  assert.doesNotMatch(html, /home-chart-tooltip/)
})

test('Home status tokens and tooltip layout use the approved palette', async () => {
  const css = await readFile(new URL('./index.css', import.meta.url), 'utf8')

  assert.match(css, /--color-friday-success: #1b9876;/)
  assert.match(css, /--color-friday-pending: #ffa946;/)
  assert.match(css, /--color-friday-danger: #d84e52;/)
  assert.match(css, /--status-danger-text: #b24548;/)
  assert.match(css, /\.home-source-dingtalk \{ background: #82957d; \}/)
  assert.match(css, /\.home-source-feishu \{ background: #839eb3; \}/)
  assert.match(css, /\.home-source-teams \{ background: #9990a8; \}/)
  assert.match(css, /--memory-source-dingtalk: #82957d;/)
  assert.match(css, /--memory-source-feishu: #839eb3;/)
  assert.match(css, /--memory-source-teams: #9990a8;/)
  assert.doesNotMatch(css, /--home-status-success-foreground/)
  assert.match(css, /--button-primary-background: var\(--color-friday-ink\);/)
  assert.match(css, /\.home-mode-choice\[aria-pressed='true'\] \{[^}]*background: var\(--button-primary-background\);/)
  assert.match(css, /\.home-mode-choice:focus-visible \{[^}]*outline: 2px solid var\(--focus-ring\);/)
  assert.match(css, /\.home-detail-state \{[^}]*border-left: 2px solid var\(--status-success-foreground\);/)
  assert.match(css, /\.settings-button-danger \{ background: var\(--status-danger-text\); color: var\(--color-friday-surface\); \}/)
  assert.match(css, /\.onboarding-connect-content \.onboarding-section-footer \.onboarding-continue-action \{[^}]*background: var\(--button-inverse-background\);/)
  assert.match(css, /\.settings-button-danger:hover \{ background: color-mix\(in srgb, var\(--status-danger-text\) 88%, #000\); \}/)
  assert.match(css, /--accent-foreground: var\(--color-friday-surface\);/)
  assert.match(css, /\.home-chart-tooltip \{[^}]*box-shadow: 0 10px 24px rgb\(54 48 39 \/ 12%\);/)
  assert.match(css, /\.home-chart-tooltip-item \{[^}]*grid-template-columns: 8px minmax\(0, 1fr\) auto;/)
  assert.match(css, /\.home-chart-tooltip-value \{[^}]*font-variant-numeric: tabular-nums;/)
  assert.match(css, /\.home-detail \.home-detail-state-trial-complete \{ border-color: var\(--color-friday-muted\); \}/)
  assert.match(css, /\.home-feedback-options button\[aria-pressed='true'\] \{[^}]*border-color: var\(--status-success-border\);[^}]*background: var\(--status-success-background\);[^}]*color: var\(--status-success-text\);/)
  assert.match(css, /\.feedback-page \{[^}]*--feedback-positive: var\(--status-success-foreground\);[^}]*--feedback-positive-soft: var\(--status-success-background\);/)
  assert.match(css, /\.feedback-source-owner progress \{ accent-color: var\(--color-friday-muted\); \}/)
  assert.match(css, /\.task-project-open:focus-visible \{[^}]*outline: 2px solid var\(--focus-ring\);/)
  assert.match(css, /\.task-document-title:focus \{ box-shadow: inset 0 -2px var\(--focus-ring\); \}/)
  assert.match(css, /\.form-error \{[^}]*color: var\(--status-danger-text\);/)
  assert.match(css, /\.settings-notice \{[^}]*background: var\(--status-success-background\);[^}]*color: var\(--status-success-text\);/)
  assert.match(css, /\.safety-inline strong \{[^}]*color: var\(--status-success-text\);/)
  assert.doesNotMatch(css, /\.feedback-page \{[^}]*#82957d/)
  assert.doesNotMatch(css, /\.feedback-source-owner progress(?:::-webkit-progress-value)? \{[^}]*#9990a8/)
  assert.doesNotMatch(css, /\.task-(?:project-open:focus-visible|personal-todo-trigger:focus-visible|milestone:focus-visible|todo-source-trigger:focus-visible|source-rail-item:focus-visible|document-title:focus) \{[^}]*#839eb3/)
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

test('source row renders exactly three compact mode choices without the old toggle wording', async () => {
  const { HomeSourceRow } = await vite.ssrLoadModule('/src/components/HomeWorkspace.tsx')
  const html = renderToStaticMarkup(createElement(HomeSourceRow, {
    connectedSources: ['dingtalk', 'feishu'] as const, copy: translations.en.workspace.home, mode: 'active',
    onModeChange: async () => {}, onSourceChange: () => {}, source: 'all',
  }))

  assert.match(html, /Source/)
  assert.match(html, /All apps/)
  assert.equal((html.match(/home-mode-choice/g) ?? []).length, 3)
  assert.match(html, />Start</)
  assert.match(html, />Try</)
  assert.match(html, />Pause</)
  assert.doesNotMatch(html, /Switch to trial mode|Enable active mode/)
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
