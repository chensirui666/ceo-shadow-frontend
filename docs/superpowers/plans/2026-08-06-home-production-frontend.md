# Home Production Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder Home with a bilingual, backend-ready daily work-event experience defined by Feature 3.

**Architecture:** Keep domain rules in `homeState.ts` and expose the current fixture through `homeService.ts`, the only data dependency of the React page. `HomeWorkspace` orchestrates the snapshot and navigation; the activity chart, event list, and event detail are independently rendered components that consume typed inputs and localized copy.

**Tech Stack:** React 19, TypeScript, Vite, Node built-in test runner, existing HeroUI v3 Button and Modal, CSS.

## Global Constraints

- Work only in `/Users/stardust/ceo-shadow-frontend/.worktrees/codex-feature3-home-page` on `codex/feature3-home-page`.
- Do not add dependencies, localStorage persistence, live API calls, invented HTTP routes, connector authorization, external sending, external-feedback submission, or a user-facing scenario switcher.
- `homeService.ts` is the sole fixture/data boundary; every UI component receives data and callbacks rather than importing fixture records.
- Keep event status separate from terminal outcome. `completed` is the normal terminal event state; sent, cancelled, self-replied, and no-reply are outcomes.
- Show exactly 24 hourly stacked bars; source filtering must drive both bars and list rows; connection errors never count in the chart.
- Put every visible or accessible Home string in `src/content/translations.ts` in both English and Chinese.
- Use native select and textarea controls; use HeroUI v3 Button/Modal with `onPress` for action and confirmation controls.
- Follow TDD: every state/service/component behaviour begins with a focused failing Node test, then the minimum implementation, then a passing rerun.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/homeState.ts` | Home domain types, fixture factory, visible-event selector, 24-hour aggregation, immutable run-mode/event/feedback transitions. |
| `src/homeState.test.ts` | Behavioural regression tests for filtering, aggregation, mode confirmation, completion outcomes, and feedback. |
| `src/homeService.ts` | Async local implementation of the future Home API boundary; no component imports its fixture directly. |
| `src/homeService.test.ts` | Tests that service mutations return immutable, current snapshots. |
| `src/components/HomeActivityChart.tsx` | Accessible 24-hour stacked chart and textual legend. |
| `src/components/HomeEventList.tsx` | Compact, keyboard-operable three-line event stream. |
| `src/components/HomeEventDetail.tsx` | Detail reading flow, confirmation editing, owner feedback, and recipient preview. |
| `src/components/HomeWorkspace.tsx` | Snapshot orchestration, source filter, mode confirmation, detail navigation, retry, empty states, Settings navigation, and scroll restoration. |
| `src/homeComponents.test.ts` | Vite-SSR behavioural coverage for chart, list, and detail conditional content; Vite transpiles the `.tsx` modules before rendering. |
| `src/homeWorkspace.test.ts` | Vite-SSR coverage for the initial Home loading state. |
| `src/content/translations.ts` | Exported `HomeCopy` and complete English/Chinese Home content. |
| `src/components/Workspace.tsx` | Mounts `HomeWorkspace` for the existing `home` route. |
| `src/index.css` | Scoped Home layout, chart semantic tokens, list/detail treatment, responsive rules, and reduced-motion overrides. |

## Shared Interfaces

`src/homeState.ts` provides these contracts before any component is written:

```ts
export const homeSources = ['dingtalk', 'feishu', 'teams'] as const
export type HomeSource = typeof homeSources[number]
export type OperatingMode = 'trial' | 'active' | 'paused'
export type HomeStatus = 'waiting' | 'processing' | 'needs-confirmation' | 'completed' | 'trial-complete' | 'send-failed' | 'connection-error'
export type HomeOutcome = 'sent' | 'cancelled' | 'self-replied' | 'no-reply'
export type OwnerFeedback = { kind: 'matched' | 'adjust'; note: string }
export type HomeEvent = {
  id: string
  source: HomeSource
  conversation?: string
  sender: string
  receivedAt: string
  status: HomeStatus
  outcome?: HomeOutcome
  question: string
  reply?: string
  rationale: string
  waitUntil?: string
  ownerFeedback?: OwnerFeedback
}
export type HomeSnapshot = { mode: OperatingMode; connectedSources: HomeSource[]; events: HomeEvent[] }
export type ActivityHour = { hour: string; processed: number; pending: number; failed: number }

export const createDemoHomeSnapshot: (now?: Date) => HomeSnapshot
export const selectHomeEvents: (snapshot: HomeSnapshot, source: HomeSource | 'all') => HomeEvent[]
export const activityHours: (events: HomeEvent[], now: Date) => ActivityHour[]
export const modeChangeNeedsConfirmation: (from: OperatingMode, to: OperatingMode) => boolean
export const setOperatingMode: (snapshot: HomeSnapshot, mode: OperatingMode) => HomeSnapshot
export const resolveConfirmation: (snapshot: HomeSnapshot, eventId: string, decision: 'send' | 'cancel', reply: string) => HomeSnapshot
export const recordOwnerFeedback: (snapshot: HomeSnapshot, eventId: string, feedback: OwnerFeedback) => HomeSnapshot
```

`src/homeService.ts` consumes those types and exports this concrete service shape:

```ts
export type HomeService = {
  load: () => Promise<HomeSnapshot>
  updateMode: (mode: OperatingMode) => Promise<HomeSnapshot>
  resolveEvent: (eventId: string, decision: 'send' | 'cancel', reply: string) => Promise<HomeSnapshot>
  submitOwnerFeedback: (eventId: string, feedback: OwnerFeedback) => Promise<HomeSnapshot>
}

export const createHomeService: (initial?: HomeSnapshot) => HomeService
export const homeService: HomeService
```

### Task 1: Build and test Home domain state

**Files:**

- Create: `src/homeState.ts`
- Create: `src/homeState.test.ts`

**Consumes:** no Home code.

**Produces:** the Shared Interfaces above for all later tasks.

- [ ] **Step 1: Write the failing selector and aggregation test**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'

const homeState = await import('./homeState.ts')

test('source filtering and activity totals use the same events and exclude connection errors', () => {
  const snapshot = {
    mode: 'active',
    connectedSources: ['dingtalk', 'feishu'],
    events: [
      { id: 'sent', source: 'dingtalk', sender: '陈思睿', receivedAt: '2026-08-06T10:10:00.000Z', status: 'completed', outcome: 'sent', question: '进度如何？', reply: '今天完成。', rationale: '符合当前处理规则。' },
      { id: 'wait', source: 'dingtalk', sender: '刘晨', receivedAt: '2026-08-06T10:20:00.000Z', status: 'waiting', question: '能确认吗？', rationale: '等待你先回复。', waitUntil: '2026-08-06T10:25:00.000Z' },
      { id: 'offline', source: 'feishu', sender: '系统', receivedAt: '2026-08-06T10:30:00.000Z', status: 'connection-error', question: '飞书连接异常', rationale: 'Friday 暂时无法使用飞书。' },
    ],
  } satisfies import('./homeState.ts').HomeSnapshot

  const events = homeState.selectHomeEvents(snapshot, 'dingtalk')
  const hour = homeState.activityHours(events, new Date('2026-08-06T10:40:00.000Z')).at(-1)

  assert.deepEqual(events.map((event) => event.id), ['sent', 'wait'])
  assert.deepEqual(hour, { hour: '10', processed: 1, pending: 1, failed: 0 })
  assert.equal(homeState.activityHours(snapshot.events, new Date('2026-08-06T10:40:00.000Z')).at(-1)?.processed, 1)
})
```

- [ ] **Step 2: Run the test and verify the expected red failure**

Run: `node --test src/homeState.test.ts`

Expected: failure because `src/homeState.ts` does not exist yet.

- [ ] **Step 3: Implement types, selector, 24-hour aggregation, and a complete relative-time fixture**

```ts
export const selectHomeEvents = (snapshot: HomeSnapshot, source: HomeSource | 'all') => (
  source === 'all' ? snapshot.events : snapshot.events.filter((event) => event.source === source)
)

export const activityHours = (events: HomeEvent[], now: Date): ActivityHour[] => {
  const start = new Date(now)
  start.setUTCMinutes(0, 0, 0)
  start.setUTCHours(start.getUTCHours() - 23)
  return Array.from({ length: 24 }, (_, index) => {
    const time = new Date(start)
    time.setUTCHours(start.getUTCHours() + index)
    const hourEvents = events.filter((event) => event.receivedAt.slice(0, 13) === time.toISOString().slice(0, 13))
    return {
      hour: time.toISOString().slice(11, 13),
      processed: hourEvents.filter((event) => event.status === 'completed' || event.status === 'trial-complete').length,
      pending: hourEvents.filter((event) => ['waiting', 'processing', 'needs-confirmation'].includes(event.status)).length,
      failed: hourEvents.filter((event) => event.status === 'send-failed').length,
    }
  })
}
```

Use `createDemoHomeSnapshot(now)` to build timestamps relative to `now`, with at least one event for every PRD state. Never add a duplicate event for status history.

- [ ] **Step 4: Run the selector test and verify green**

Run: `node --test src/homeState.test.ts`

Expected: the filtering and aggregation test passes.

- [ ] **Step 5: Add failing transition tests**

```ts
test('a confirmation decision updates one event into completed with its distinct outcome', () => {
  const snapshot = homeState.createDemoHomeSnapshot(new Date('2026-08-06T12:00:00.000Z'))
  const confirmed = homeState.resolveConfirmation(snapshot, 'needs-confirmation', 'send', '确认下周三上线。')
  const cancelled = homeState.resolveConfirmation(snapshot, 'needs-confirmation', 'cancel', '确认下周三上线。')

  assert.equal(confirmed.events.length, snapshot.events.length)
  assert.deepEqual(confirmed.events.find((event) => event.id === 'needs-confirmation')?.status, 'completed')
  assert.deepEqual(confirmed.events.find((event) => event.id === 'needs-confirmation')?.outcome, 'sent')
  assert.deepEqual(cancelled.events.find((event) => event.id === 'needs-confirmation')?.outcome, 'cancelled')
})

test('mode confirmation and owner feedback preserve the current event result', () => {
  const snapshot = homeState.createDemoHomeSnapshot(new Date('2026-08-06T12:00:00.000Z'))
  const updated = homeState.recordOwnerFeedback(snapshot, 'trial-complete', { kind: 'adjust', note: '承诺时间前先确认资源。' })

  assert.equal(homeState.modeChangeNeedsConfirmation('trial', 'active'), true)
  assert.equal(homeState.modeChangeNeedsConfirmation('active', 'paused'), false)
  assert.equal(updated.events.find((event) => event.id === 'trial-complete')?.outcome, undefined)
  assert.deepEqual(updated.events.find((event) => event.id === 'trial-complete')?.ownerFeedback, { kind: 'adjust', note: '承诺时间前先确认资源。' })
})
```

- [ ] **Step 6: Run transition tests and verify the expected red failure**

Run: `node --test src/homeState.test.ts`

Expected: failures for undefined transition helpers.

- [ ] **Step 7: Implement immutable transitions and rerun the full state test**

```ts
export const resolveConfirmation = (snapshot: HomeSnapshot, eventId: string, decision: 'send' | 'cancel', reply: string): HomeSnapshot => ({
  ...snapshot,
  events: snapshot.events.map((event) => event.id !== eventId ? event : {
    ...event,
    status: 'completed',
    outcome: decision === 'send' ? 'sent' : 'cancelled',
    reply,
    rationale: decision === 'send' ? '回复已发送。' : '已取消发送；Friday 未发送这条回复。',
  }),
})
```

Run: `node --test src/homeState.test.ts`

Expected: all Home state tests pass.

- [ ] **Step 8: Commit the domain behaviour**

```bash
git add src/homeState.ts src/homeState.test.ts
git commit -m "feat: add Home event state"
```

### Task 2: Isolate the async data boundary

**Files:**

- Create: `src/homeService.ts`
- Create: `src/homeService.test.ts`

**Consumes:** `HomeSnapshot`, `OperatingMode`, `OwnerFeedback`, and transitions from `src/homeState.ts`.

**Produces:** `HomeService`, `createHomeService`, and `homeService` for `HomeWorkspace`.

- [ ] **Step 1: Write the failing service mutation test**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'

const { createDemoHomeSnapshot } = await import('./homeState.ts')
const { createHomeService } = await import('./homeService.ts')

test('service returns a new snapshot for a confirmation decision without mutating the earlier load', async () => {
  const service = createHomeService(createDemoHomeSnapshot(new Date('2026-08-06T12:00:00.000Z')))
  const before = await service.load()
  const after = await service.resolveEvent('needs-confirmation', 'cancel', '确认后再安排。')

  assert.equal(before.events.find((event) => event.id === 'needs-confirmation')?.status, 'needs-confirmation')
  assert.equal(after.events.find((event) => event.id === 'needs-confirmation')?.status, 'completed')
  assert.equal(after.events.find((event) => event.id === 'needs-confirmation')?.outcome, 'cancelled')
})
```

- [ ] **Step 2: Run the test and verify red**

Run: `node --test src/homeService.test.ts`

Expected: failure because `src/homeService.ts` is absent.

- [ ] **Step 3: Implement the small in-memory service**

```ts
export const createHomeService = (initial: HomeSnapshot = createDemoHomeSnapshot()): HomeService => {
  let snapshot = structuredClone(initial)
  const current = () => structuredClone(snapshot)
  return {
    load: async () => current(),
    updateMode: async (mode) => { snapshot = setOperatingMode(snapshot, mode); return current() },
    resolveEvent: async (eventId, decision, reply) => { snapshot = resolveConfirmation(snapshot, eventId, decision, reply); return current() },
    submitOwnerFeedback: async (eventId, feedback) => { snapshot = recordOwnerFeedback(snapshot, eventId, feedback); return current() },
  }
}

export const homeService = createHomeService()
```

- [ ] **Step 4: Verify green and commit**

Run: `node --test src/homeService.test.ts`

Expected: the service test passes.

```bash
git add src/homeService.ts src/homeService.test.ts
git commit -m "feat: add Home data service"
```

### Task 3: Add bilingual Home copy and the 24-hour activity chart

**Files:**

- Modify: `src/content/translations.ts:90-114,167-174,337-344`
- Create: `src/components/HomeActivityChart.tsx`
- Create: `src/homeComponents.test.ts`

**Consumes:** `ActivityHour` from `src/homeState.ts`; `HomeCopy` from translations.

**Produces:** `HomeCopy` and `HomeActivityChart`.

- [ ] **Step 1: Write the failing chart rendering test**

```ts
import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const { translations } = await import('./content/translations.ts')
const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { middlewareMode: true } })
after(() => vite.close())
const { default: HomeActivityChart } = await vite.ssrLoadModule('/src/components/HomeActivityChart.tsx')

test('activity chart exposes a textual legend and exact counts for a focusable hour', () => {
  const html = renderToStaticMarkup(createElement(HomeActivityChart, { activity: [{ hour: '10', processed: 2, pending: 1, failed: 1 }], copy: translations.zh.workspace.home }))

  assert.match(html, /已处理 2/)
  assert.match(html, /待处理 1/)
  assert.match(html, /发送失败 1/)
  assert.match(html, /10:00：已处理 2，待处理 1，发送失败 1/)
})
```

- [ ] **Step 2: Run the chart test and verify red**

Run: `node --test src/homeComponents.test.ts`

Expected: failure because `HomeActivityChart.tsx` is absent.

- [ ] **Step 3: Define `HomeCopy`, translate all Home copy, and render the chart**

Add an exported `HomeCopy` with keys used by all Home components: `title`, `recent`, `sources`, `source`, `allSources`, `question`, `reply`, `demoDisclosure`, `status`, `outcome`, `mode`, `chart`, `empty`, `detail`, `feedback`, `actions`, and `confirmation`. `mode` provides labels, descriptions, the primary action for each mode, and the active-mode `switchToTrial` action. Type `sources` as `Record<HomeSource, string>`, `status` as `Record<HomeStatus, string>`, and `outcome` as `Record<HomeOutcome, string>`; import those types with `import type` from `homeState.ts`. Replace the old placeholder-only `home` record in both locales with full English and Chinese content.

```tsx
export default function HomeActivityChart({ activity, copy }: { activity: ActivityHour[]; copy: HomeCopy }) {
  const totals = activity.reduce((sum, hour) => ({ processed: sum.processed + hour.processed, pending: sum.pending + hour.pending, failed: sum.failed + hour.failed }), { processed: 0, pending: 0, failed: 0 })
  const maximum = Math.max(1, ...activity.map((hour) => hour.processed + hour.pending + hour.failed))
  return <section aria-label={copy.chart.title} className="home-activity">
    <div className="home-chart-legend">{copy.chart.legend(totals)}</div>
    <div className="home-chart-bars">{activity.map((hour) => {
      const total = hour.processed + hour.pending + hour.failed
      return <div aria-label={copy.chart.hourLabel(hour)} className="home-chart-hour" key={hour.hour} role="img" tabIndex={0} title={copy.chart.hourLabel(hour)}>
        <span className="home-chart-segment home-chart-processed" style={{ height: `${hour.processed / maximum * 100}%` }} />
        <span className="home-chart-segment home-chart-pending" style={{ height: `${hour.pending / maximum * 100}%` }} />
        <span className="home-chart-segment home-chart-failed" style={{ height: `${hour.failed / maximum * 100}%` }} />
        <span className="home-chart-axis-label">{total ? hour.hour : ''}</span>
      </div>
    })}</div>
  </section>
}
```

Render exactly 24 values in product use. The component accepts fewer values only for focused rendering tests. Use no card frame, gradient, shadow, or colour-only label.

- [ ] **Step 4: Verify green and commit**

Run: `node --test src/homeComponents.test.ts`

Expected: the chart test passes.

```bash
git add src/content/translations.ts src/components/HomeActivityChart.tsx src/homeComponents.test.ts
git commit -m "feat: add Home activity chart"
```

### Task 4: Add the compact event list component

**Files:**

- Create: `src/components/HomeEventList.tsx`
- Modify: `src/homeComponents.test.ts`

**Consumes:** `HomeEvent`, `HomeSource`, and `HomeCopy`; receives `onOpen(eventId)` from `HomeWorkspace`.

**Produces:** `HomeEventList` with `events`, `sourceNames`, `copy`, `now`, and `onOpen` props.

- [ ] **Step 1: Add a failing list test**

```ts
const { default: HomeEventList } = await vite.ssrLoadModule('/src/components/HomeEventList.tsx')

test('event list renders a single compact row with a countdown and truncated message lines', () => {
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
```

- [ ] **Step 2: Run the list test and verify red**

Run: `node --test src/homeComponents.test.ts`

Expected: failure because `HomeEventList.tsx` is absent.

- [ ] **Step 3: Implement one semantic button per event**

```tsx
export default function HomeEventList({ events, sourceNames, copy, now, onOpen }: Props) {
  return <section aria-label={copy.recent} className="home-event-list">
    {events.map((event) => <button className="home-event-row" key={event.id} onClick={() => onOpen(event.id)} type="button">
      <span className={`home-source-mark home-source-${event.source}`} title={sourceNames[event.source]}>{sourceNames[event.source].slice(0, 1)}</span>
      <span className="home-event-meta">{[event.conversation, event.sender, formatEventTime(event.receivedAt)].filter(Boolean).join(' · ')}</span>
      <span className={`home-event-status home-event-status-${event.status}`}>{statusText(event, copy, now)}</span>
      <span className="home-event-question">{copy.question}: {event.question}</span>
      <span className="home-event-reply">{copy.reply}: {event.reply ?? copy.status[event.status]}</span>
    </button>)}
  </section>
}
```

Keep `formatEventTime` and `statusText` module-local. `statusText` must emit a countdown only for `waiting`; all other states render translated status text. CSS applies ellipsis independently to question and reply.

- [ ] **Step 4: Verify green and commit**

Run: `node --test src/homeComponents.test.ts`

Expected: chart and list rendering tests pass.

```bash
git add src/components/HomeEventList.tsx src/homeComponents.test.ts
git commit -m "feat: add Home event list"
```

### Task 5: Add the independent event detail component

**Files:**

- Create: `src/components/HomeEventDetail.tsx`
- Modify: `src/homeComponents.test.ts`

**Consumes:** `HomeEvent`, `HomeCopy`, source names, and callback props from `HomeWorkspace`.

**Produces:** `HomeEventDetail` with `event`, `copy`, `sourceName`, `busy`, `onBack`, `onResolve`, and `onSubmitFeedback` props.

- [ ] **Step 1: Add failing conditional-detail tests**

```ts
const { default: HomeEventDetail } = await vite.ssrLoadModule('/src/components/HomeEventDetail.tsx')

const createDetailEvent = (override: Partial<import('./homeState.ts').HomeEvent> = {}): import('./homeState.ts').HomeEvent => ({
  id: 'detail', source: 'feishu', conversation: '产品项目群', sender: '刘晨', receivedAt: '2026-08-06T10:42:00.000Z',
  status: 'completed', outcome: 'sent', question: '下周的上线时间能确定吗？', reply: '建议下周三上线。',
  rationale: '符合当前处理规则，回复已自动发送。', ...override,
})

test('confirmation detail offers an editable response with send and cancel', () => {
  const event = createDetailEvent({ status: 'needs-confirmation', reply: '建议下周三上线。' })
  const html = renderToStaticMarkup(createElement(HomeEventDetail, { busy: false, copy: translations.zh.workspace.home, event, onBack: () => {}, onResolve: () => {}, onSubmitFeedback: () => {}, sourceName: '飞书' }))

  assert.match(html, /执行依据/)
  assert.match(html, /涉及交付时间承诺，需要你确认后再回复。/)
  assert.match(html, /<textarea/)
  assert.match(html, />发送</)
  assert.match(html, />取消</)
})

test('sent detail includes the recipient feedback preview while a failure has no retry action', () => {
  const sent = renderToStaticMarkup(createElement(HomeEventDetail, { busy: false, copy: translations.zh.workspace.home, event: createDetailEvent({ status: 'completed', outcome: 'sent' }), onBack: () => {}, onResolve: () => {}, onSubmitFeedback: () => {}, sourceName: '钉钉' }))
  const failed = renderToStaticMarkup(createElement(HomeEventDetail, { busy: false, copy: translations.zh.workspace.home, event: createDetailEvent({ status: 'send-failed' }), onBack: () => {}, onResolve: () => {}, onSubmitFeedback: () => {}, sourceName: '飞书' }))

  assert.match(sent, /这条回复是否解决了你的问题？/)
  assert.match(sent, /未解决/)
  assert.doesNotMatch(failed, /重试|重新连接/)
})
```

The `createDetailEvent` literal stays in the test file; it does not use a production helper.

- [ ] **Step 2: Run the detail tests and verify red**

Run: `node --test src/homeComponents.test.ts`

Expected: failure because `HomeEventDetail.tsx` is absent.

- [ ] **Step 3: Implement the reading sequence and only state-appropriate actions**

```tsx
{event.status === 'needs-confirmation' && <>
  <textarea aria-label={copy.detail.editReply} onChange={(event) => setReply(event.target.value)} value={reply} />
  <div className="home-detail-actions">
    <Button isPending={busy} onPress={() => onResolve('send', reply)}>{copy.actions.send}</Button>
    <Button isDisabled={busy} onPress={() => onResolve('cancel', reply)} variant="secondary">{copy.actions.cancel}</Button>
  </div>
</>}
{event.outcome === 'sent' && <section aria-labelledby="recipient-feedback"><h2 id="recipient-feedback">{copy.feedback.recipientTitle}</h2><p>{copy.feedback.recipientQuestion}</p><fieldset disabled><label><input name="recipient-result" type="radio" />👍 {copy.feedback.helpful}</label><label><input name="recipient-result" type="radio" />👎 {copy.feedback.unresolved}</label><textarea aria-label={copy.feedback.recipientNote} placeholder={copy.feedback.recipientNote} required /></fieldset></section>}
```

Render metadata, original message, rationale, reply/result, available action, and feedback as same-weight reading sections with whitespace or hairlines only. For waiting events, omit reply content; for processing show the translated generating text; for an event without a reply, do not expose owner feedback.

- [ ] **Step 4: Verify green and commit**

Run: `node --test src/homeComponents.test.ts`

Expected: chart, list, and detail tests pass.

```bash
git add src/components/HomeEventDetail.tsx src/homeComponents.test.ts
git commit -m "feat: add Home event detail"
```

### Task 6: Compose Home, replace the placeholder, and apply scoped styles

**Files:**

- Create: `src/components/HomeWorkspace.tsx`
- Create: `src/homeWorkspace.test.ts`
- Modify: `src/components/Workspace.tsx:1-11,94-108`
- Modify: `src/index.css:314-349,728-778`

**Consumes:** `homeService`, all three Home visual components, and `translations[locale].workspace.home`.

**Produces:** the routed production Home page. It receives `onOpenSettings: () => void` from `Workspace` only for the no-connection next step; it never reads or writes Settings data.

- [ ] **Step 1: Write the failing initial-load test**

```ts
import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { middlewareMode: true } })
after(() => vite.close())
const { default: HomeWorkspace } = await vite.ssrLoadModule('/src/components/HomeWorkspace.tsx')

test('Home renders a readable loading state before its snapshot resolves', () => {
  const html = renderToStaticMarkup(createElement(HomeWorkspace, { locale: 'zh', onOpenSettings: () => {} }))
  assert.match(html, /正在加载最近事件…/)
})
```

- [ ] **Step 2: Run the test and verify red**

Run: `node --test src/homeWorkspace.test.ts`

Expected: failure because `HomeWorkspace.tsx` is absent.

- [ ] **Step 3: Implement snapshot orchestration and route it from the workspace**

```tsx
export default function HomeWorkspace({ locale, onOpenSettings }: { locale: Locale; onOpenSettings: () => void }) {
  const copy = translations[locale].workspace.home
  const [snapshot, setSnapshot] = useState<HomeSnapshot | null>(null)
  const [error, setError] = useState(false)
  const [source, setSource] = useState<HomeSource | 'all'>('all')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [pendingMode, setPendingMode] = useState<OperatingMode | null>(null)
  const modeDialog = useOverlayState()

  const load = () => homeService.load().then(setSnapshot).catch(() => setError(true))
  const requestModeChange = (nextMode: OperatingMode) => {
    if (snapshot && modeChangeNeedsConfirmation(snapshot.mode, nextMode)) { setPendingMode(nextMode); modeDialog.open() }
    else homeService.updateMode(nextMode).then(setSnapshot)
  }
  useEffect(() => { load() }, [])
  if (error) return <section className="home-state"><p>{copy.empty.error}</p><Button onPress={() => { setError(false); load() }}>{copy.actions.retry}</Button></section>
  if (!snapshot) return <section aria-live="polite" className="home-state">{copy.empty.loading}</section>
  if (!snapshot.connectedSources.length) return <section className="home-state"><h2>{copy.empty.noConnections}</h2><Button onPress={onOpenSettings}>{copy.actions.goToSettings}</Button></section>
  const events = selectHomeEvents(snapshot, source)
  const selectedEvent = snapshot.events.find((event) => event.id === selectedEventId)
  if (selectedEvent) return <HomeEventDetail busy={false} copy={copy} event={selectedEvent} onBack={() => setSelectedEventId(null)} onResolve={(decision, reply) => homeService.resolveEvent(selectedEvent.id, decision, reply).then(setSnapshot)} onSubmitFeedback={(feedback) => homeService.submitOwnerFeedback(selectedEvent.id, feedback).then(setSnapshot)} sourceName={copy.sources[selectedEvent.source]} />
  return <section className="home-page"><div className="home-page-heading"><p>{copy.title}</p><time>{formatHomeDate(new Date(), locale)}</time></div><section className="home-mode"><p>{copy.mode.label(snapshot.mode)}</p><p>{copy.mode.description(snapshot.mode)}</p><Button onPress={() => requestModeChange(snapshot.mode === 'trial' ? 'active' : snapshot.mode === 'active' ? 'paused' : 'active')}>{copy.mode.action(snapshot.mode)}</Button>{snapshot.mode === 'active' && <Button onPress={() => requestModeChange('trial')} variant="secondary">{copy.mode.switchToTrial}</Button>}<p>{copy.demoDisclosure}</p></section><HomeActivityChart activity={activityHours(events, new Date())} copy={copy} /><label className="home-source-filter">{copy.source}<select onChange={(event) => setSource(event.target.value as HomeSource | 'all')} value={source}><option value="all">{copy.allSources}</option>{snapshot.connectedSources.map((item) => <option key={item} value={item}>{copy.sources[item]}</option>)}</select></label>{events.length ? <HomeEventList copy={copy} events={events} now={new Date()} onOpen={setSelectedEventId} sourceNames={copy.sources} /> : <section className="home-state"><p>{source === 'all' ? copy.empty.events : copy.empty.source(copy.sources[source])}</p>{source !== 'all' && <Button onPress={() => setSource('all')} variant="secondary">{copy.actions.clearSource}</Button>}</section>}{pendingMode && <Modal state={modeDialog}><Modal.Backdrop><Modal.Container><Modal.Dialog><Modal.Header><Modal.Heading>{copy.confirmation.title(pendingMode)}</Modal.Heading></Modal.Header><Modal.Body>{copy.confirmation.body(pendingMode)}</Modal.Body><Modal.Footer><Button onPress={() => { modeDialog.close(); setPendingMode(null) }} variant="secondary">{copy.actions.cancel}</Button><Button onPress={() => homeService.updateMode(pendingMode).then((next) => { setSnapshot(next); setPendingMode(null); modeDialog.close() })}>{copy.confirmation.confirm(pendingMode)}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop></Modal>}</section>
}
```

Before opening detail, store `.workspace-canvas` `scrollTop` via a ref or closest ancestor; reset it for detail and restore it after Back. Use a HeroUI modal for only trial-to-active and active-to-trial confirmation. Keep active-to-paused and paused-to-active as direct, visible state changes. `HomeEmptyState` renders `最近 24 小时暂无消息。` when source is `all`, and the selected-source empty copy plus a clear-source action otherwise. Show the persistent frontend-only disclosure near the mode control.

Replace the existing welcome panel branch with `<HomeWorkspace locale={locale} onOpenSettings={openSettings} />` and change the Home workspace header from the greeting to the localized Home navigation label. Do not change Settings behaviour.

- [ ] **Step 4: Replace placeholder Home CSS with the PRD layout rules**

```css
.home-page {
  --home-chart-processed: #82957d;
  --home-chart-pending: #b59663;
  --home-chart-failed: #bc8d86;
  --home-chart-grid: #d9d6ce;
  --home-chart-focus: #839eb3;
  --home-chart-axis: #9990a8;
  width: min(1008px, calc(100% - 104px));
  margin: 0 auto;
  padding-bottom: 48px;
}

.home-event-row:focus-visible, .home-chart-hour:focus-visible {
  outline: 2px solid var(--home-chart-focus);
  outline-offset: 3px;
}
```

Keep list row groups divider-separated without cards. Add source marks, status text treatments, one-line ellipsis, 24-bar stacked segment height styles, detail section hairlines, mode confirmation styling, mobile stacking, and a reduced-motion rule. Remove obsolete `.welcome-panel`, `.setup-badge`, `.panel-action`, and `.today-section` selectors only after the Workspace no longer renders them.

- [ ] **Step 5: Verify the workspace test and complete automated checks**

Run: `node --test src/homeWorkspace.test.ts && npm test && npm run typecheck && npm run build`

Expected: all tests pass, TypeScript reports no errors, and Vite finishes a production build.

- [ ] **Step 6: Browser verification**

Run the Vite dev server and use the browser test workflow to verify:

1. 24 distinct hour slots, legend totals, and keyboard-focus text for an hour;
2. a source change changes both bars and rows;
3. trial-to-active confirmation and direct pause/resume;
4. detail Back restores the selected source and scroll position;
5. send and cancel update one confirmation event to `已处理` with different outcomes;
6. trial owner feedback acknowledgement, sent recipient-feedback preview, and no retry/reconnect action for failures; and
7. desktop and narrow mobile layouts retain readable content and visible focus.

- [ ] **Step 7: Commit the composed Home experience**

```bash
git add src/components/HomeWorkspace.tsx src/homeWorkspace.test.ts src/components/Workspace.tsx src/index.css
git commit -m "feat: build Home work event experience"
```

### Task 7: Final verification and requirement review

**Files:** no new files unless a verification failure identifies a minimal correction.

**Consumes:** every prior task.

**Produces:** fresh evidence for completion.

- [ ] **Step 1: Run the full final gate**

Run: `npm test && npm run typecheck && npm run build && git status --short && git log --oneline -6`

Expected: all tests and checks exit zero; status shows no uncommitted implementation files.

- [ ] **Step 2: Re-read the Feature 3 P0 list against the implementation**

Check each of these concrete outcomes in the browser: 24 stacked bars, synchronized connected-source filter, all P0 event states, compact three-line rows, standalone detail, clear trial non-send language, same-event send/cancel transition, owner feedback, recipient preview, and load/error/empty handling. Confirm no audit terminology, model/prompt/risk content, retry/reconnect action, external send, or external feedback submission was added.

- [ ] **Step 3: Commit a minimal correction only if verification found one**

```bash
git add src/homeState.ts src/homeState.test.ts src/homeService.ts src/homeService.test.ts src/components/HomeActivityChart.tsx src/components/HomeEventList.tsx src/components/HomeEventDetail.tsx src/components/HomeWorkspace.tsx src/homeComponents.test.ts src/homeWorkspace.test.ts src/content/translations.ts src/components/Workspace.tsx src/index.css
git commit -m "fix: address Home verification finding"
```

Do not create this commit when the prior checks reveal no correction.
