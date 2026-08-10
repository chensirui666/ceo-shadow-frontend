# Feedback 质量驾驶舱 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** 在 Friday 前端交付一个由真实 Feedback 服务驱动的质量驾驶舱，展示收集覆盖、质量趋势、来源占比和可展开的反馈卡片墙。

**Architecture:** feedbackService.ts 是唯一的可替换服务边界，负责三个 HTTP 读取能力；组件不感知接口 URL、学习队列或任何本地示例数据。FeedbackWorkspace 只协调范围、读取、分页和详情，三个展示组件分别负责汇总、卡片墙和详情面板。

**Tech Stack:** React 19、TypeScript、Vite、HeroUI、原生 CSS、Node test runner、React DOM server rendering。

## Global Constraints

- 只展示服务端返回的真实反馈；运行时不内置或伪装本地反馈样例。
- 仅支持 7d、30d、all，默认 7d；all 的趋势按月，其余按日。
- 同事评价与我的审核必须始终标明来源；正负向不能只靠颜色表达。
- 页面没有“已处理”、训练确认、编辑、重发、撤回或关联回复跳转。
- 后台工作画像学习不属于前端接口、状态、文案或错误展示。
- 不新增依赖；复用现有 Button、React、HeroUI 和 CSS 模式。
- API 无数据时明确空态；读取失败可重试，绝不以 fixtures 替代真实数据。

---

## File Structure

- src/feedbackState.ts：Feedback API 的领域类型、范围常量和只读显示辅助函数。
- src/feedbackService.ts：三个真实 HTTP 读取能力与响应验证，是唯一 API URL 边界。
- src/components/FeedbackWorkspace.tsx：范围、加载、失败重试、分页、详情选择的页面协调。
- src/components/FeedbackDashboard.tsx：四项指标、趋势图与来源占比。
- src/components/FeedbackCardWall.tsx：无表格的双列反馈卡片墙与“加载更多”。
- src/components/FeedbackDetailPanel.tsx：当前页面中的只读详情侧栏。
- src/components/Workspace.tsx：把 feedback 路由接到新页面。
- src/content/translations.ts：中英文 Feedback 文案，集中在 FeedbackCopy。
- src/index.css：Feedback 专属布局、图表、卡片、侧栏和响应式规则。
- src/feedbackState.test.ts、src/feedbackService.test.ts、src/feedbackComponents.test.ts：领域、服务契约和可见 UI 的最小回归测试。

## Task 1: 定义只读领域契约

**Files:**
- Create: src/feedbackState.ts
- Test: src/feedbackState.test.ts

**Interfaces:**
- Produces: feedbackRanges, FeedbackRange, FeedbackSource, FeedbackSentiment, FeedbackMetricSet, FeedbackTrendPoint, FeedbackDashboardData, FeedbackCard, FeedbackCardPage, FeedbackDetail, formatFeedbackTime。
- Consumes: nothing.

- [ ] **Step 1: Write the failing test**

~~~ts
import assert from 'node:assert/strict'
import test from 'node:test'

const feedback = await import('./feedbackState.ts')

test('Feedback ranges and time formatting keep the UI contract explicit', () => {
  assert.deepEqual(feedback.feedbackRanges, ['7d', '30d', 'all'])
  assert.equal(feedback.formatFeedbackTime('2026-08-10T02:23:00.000Z', 'zh'), '2026年8月10日 10:23')
})
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: node --test src/feedbackState.test.ts
Expected: FAIL because feedbackState.ts does not exist.

- [ ] **Step 3: Write minimal implementation**

~~~ts
export const feedbackRanges = ['7d', '30d', 'all'] as const
export type FeedbackRange = typeof feedbackRanges[number]
export type FeedbackSource = 'recipient' | 'owner'
export type FeedbackSentiment = 'positive' | 'negative'

export type FeedbackMetricSet = { feedbackCount: number; coverageRate: number; positiveRate: number; attentionCount: number }
export type FeedbackTrendPoint = { label: string; positive: number; negative: number }
export type FeedbackDashboardData = { metrics: FeedbackMetricSet; trend: FeedbackTrendPoint[]; sourceTotals: Record<FeedbackSource, number> }
export type FeedbackCard = { id: string; replyId: string; source: FeedbackSource; sentiment: FeedbackSentiment; question: string; reply: string; note: string; createdAt: string }
export type FeedbackCardPage = { items: FeedbackCard[]; nextCursor: string | null }
export type FeedbackDetail = FeedbackCard & { feedback: Array<Pick<FeedbackCard, 'id' | 'source' | 'sentiment' | 'note' | 'createdAt'>> }

export const formatFeedbackTime = (value: string, locale: 'en' | 'zh') => new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value))
~~~

- [ ] **Step 4: Run test to verify it passes**

Run: node --test src/feedbackState.test.ts
Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/feedbackState.ts src/feedbackState.test.ts
git commit -m "feat: define feedback read model"
~~~

## Task 2: 建立真实 Feedback 服务边界

**Files:**
- Create: src/feedbackService.ts
- Test: src/feedbackService.test.ts

**Interfaces:**
- Consumes: Task 1 FeedbackRange, FeedbackDashboardData, FeedbackCardPage, FeedbackDetail。
- Produces: FeedbackService, createFeedbackService, feedbackService。

- [ ] **Step 1: Write the failing test**

~~~ts
test('service requests dashboard, card page, and detail from the feedback API', async () => {
  const requests: string[] = []
  const service = createFeedbackService(async (input) => {
    requests.push(String(input))
    return new Response(JSON.stringify({ metrics: {}, trend: [], sourceTotals: {}, items: [], nextCursor: null, feedback: [] }))
  })

  await service.loadDashboard('7d')
  await service.loadCards('7d', null)
  await service.loadDetail('feedback-1')
  assert.deepEqual(requests, ['/api/feedback/dashboard?range=7d', '/api/feedback?range=7d', '/api/feedback/feedback-1'])
})
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: node --test src/feedbackService.test.ts
Expected: FAIL because feedbackService.ts does not exist.

- [ ] **Step 3: Write minimal implementation**

~~~ts
export type FeedbackService = {
  loadDashboard: (range: FeedbackRange) => Promise<FeedbackDashboardData>
  loadCards: (range: FeedbackRange, cursor: string | null) => Promise<FeedbackCardPage>
  loadDetail: (id: string) => Promise<FeedbackDetail>
}

export const createFeedbackService = (request: typeof fetch = fetch): FeedbackService => ({
  loadDashboard: (range) => request('/api/feedback/dashboard?range=' + range).then(readJson),
  loadCards: (range, cursor) => request('/api/feedback?range=' + range + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '')).then(readJson),
  loadDetail: (id) => request('/api/feedback/' + encodeURIComponent(id)).then(readJson),
})
~~~

readJson must throw when response.ok is false so the page can expose one clear retry state. It does not catch errors, inspect learning state, or fall back to static data.

- [ ] **Step 4: Run test to verify it passes**

Run: node --test src/feedbackService.test.ts
Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/feedbackService.ts src/feedbackService.test.ts
git commit -m "feat: add feedback API boundary"
~~~

## Task 3: 实现质量驾驶舱与详情组件

**Files:**
- Create: src/components/FeedbackDashboard.tsx
- Create: src/components/FeedbackCardWall.tsx
- Create: src/components/FeedbackDetailPanel.tsx
- Create: src/components/FeedbackWorkspace.tsx
- Modify: src/content/translations.ts
- Test: src/feedbackComponents.test.ts

**Interfaces:**
- Consumes: Task 1 model types, Task 2 feedbackService, existing Locale and translations.
- Produces: FeedbackWorkspace, server-renderable dashboard/card/detail components.

- [ ] **Step 1: Write the failing component tests**

~~~ts
test('feedback components render range controls, measurable quality signals, source labels, cards, and a read-only detail', async () => {
  const { default: FeedbackDashboard } = await vite.ssrLoadModule('/src/components/FeedbackDashboard.tsx')
  const html = renderToStaticMarkup(createElement(FeedbackDashboard, { range: '7d', data: dashboard, copy, onRangeChange: () => {} }))
  assert.match(html, /近 7 天/)
  assert.match(html, /反馈覆盖率/)
  assert.match(html, /同事评价/)
  assert.doesNotMatch(html, /已处理|学习队列/)
})
~~~

Add a second test that renders one negative owner card and its detail. Assert 需调整 and 我的审核 appear, while 标记已处理 and 查看关联回复 do not.

- [ ] **Step 2: Run tests to verify they fail**

Run: node --test src/feedbackComponents.test.ts
Expected: FAIL because the Feedback components do not exist.

- [ ] **Step 3: Add minimal typed UI implementation**

~~~tsx
export default function FeedbackWorkspace({ locale }: { locale: Locale }) {
  const [range, setRange] = useState<FeedbackRange>('7d')
  const [dashboard, setDashboard] = useState<FeedbackDashboardData | null>(null)
  const [page, setPage] = useState<FeedbackCardPage | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // load dashboard + first card page when range changes; keep a single retry state.
}
~~~

FeedbackDashboard renders the range segmented control, four summary cards, an accessible text legend plus stacked trend bars, and source totals. FeedbackCardWall renders semantic buttons in a two-column card grid, negative cards first as delivered by the API, and a 加载更多 button only when nextCursor exists. FeedbackDetailPanel is a dismissible aside that loads only the selected detail, then renders the complete question, final reply, and every feedback record. It has no action other than close.

Add FeedbackCopy to the existing translation module and give both locales all visible labels, empty/error/retry copy, text equivalents for trend bars, source names, and no-data copy. Keep English and Chinese copy alongside the existing Home copy; do not create a translation subsystem.

- [ ] **Step 4: Run component tests to verify they pass**

Run: node --test src/feedbackComponents.test.ts
Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/components/FeedbackDashboard.tsx src/components/FeedbackCardWall.tsx src/components/FeedbackDetailPanel.tsx src/components/FeedbackWorkspace.tsx src/content/translations.ts src/feedbackComponents.test.ts
git commit -m "feat: add feedback quality dashboard"
~~~

## Task 4: 接入导航并实现紧凑响应式样式

**Files:**
- Modify: src/components/Workspace.tsx
- Modify: src/index.css
- Modify: src/homeComponents.test.ts

**Interfaces:**
- Consumes: Task 3 FeedbackWorkspace。
- Produces: feedback 路由渲染质量驾驶舱，而不是空白占位页。

- [ ] **Step 1: Write the failing integration assertion**

~~~ts
test('workspace renders FeedbackWorkspace instead of the feedback placeholder', async () => {
  const html = renderToStaticMarkup(createElement(Workspace, { locale: 'zh', onLocaleChange: () => {}, onSignOut: () => {}, session: { email: 'sirui@example.com', route: 'feedback' } }))
  assert.match(html, /正在加载反馈概览…/)
  assert.doesNotMatch(html, /你的反馈和同事的反馈会帮助 Friday 持续校准/)
})
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: node --test src/homeComponents.test.ts
Expected: FAIL because the Feedback route still renders empty-page.

- [ ] **Step 3: Add the smallest integration and styles**

~~~tsx
{route === 'feedback' ? <FeedbackWorkspace locale={locale} /> : route === 'memory' ? <MemoryWorkspace locale={locale} /> : route === 'home' ? <HomeWorkspace locale={locale} onOpenSettings={openSettings} /> : <section className="empty-page">…</section>}
~~~

Append Feedback-only CSS using the established warm canvas, white card, sage-positive and coral-negative tokens. The desktop layout is four metric cards, a 2:1 trend/source row, a two-column card wall, and an anchored detail aside. At 1000px collapse metrics to two columns; at 760px use one-column metrics, cards, and a full-width detail panel. Retain focus outlines, textual chart labels, and prefers-reduced-motion behavior.

- [ ] **Step 4: Run test to verify it passes**

Run: node --test src/homeComponents.test.ts
Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/components/Workspace.tsx src/index.css src/homeComponents.test.ts
git commit -m "feat: route feedback dashboard"
~~~

## Task 5: Run full verification and inspect the rendered page

**Files:**
- Modify only if a verification failure identifies a defect in Tasks 1–4.

**Interfaces:**
- Consumes: completed application.
- Produces: verified branch with no scope expansion.

- [ ] **Step 1: Run static and test verification**

Run:

~~~bash
npm test
npm run typecheck
npm run build
git diff --check main...HEAD
~~~

Expected: all tests pass, typecheck/build succeed, and no whitespace errors.

- [ ] **Step 2: Start the Vite development server and inspect Feedback in a browser**

Run: npm run dev -- --host 127.0.0.1
Expected: browser inspection confirms the API-unavailable state is truthful; with a valid Feedback API response, metrics, cards, pagination, and detail are compact and readable at desktop and mobile widths.

## Plan Self-Review

- **Spec coverage:** Tasks 1–2 cover the real-data API boundary, range rules, no-fixture policy, error state and idempotent-learning invisibility. Task 3 covers summary, trend, source split, card wall, details and every excluded action. Task 4 covers navigation, visual hierarchy, accessibility and responsive presentation. Task 5 covers automated and browser verification.
- **Placeholder scan:** the implementation identifiers, API routes, tests, commands, and expected outcomes are specified; the plan contains no deferred work marker.
- **Type consistency:** Task 1 owns all feedback types; Task 2 uses them at the API boundary; Task 3 consumes the same types; Task 4 imports FeedbackWorkspace only.
