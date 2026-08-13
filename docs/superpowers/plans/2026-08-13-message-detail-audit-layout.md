# Message Detail Audit Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Message detail into an auditable, ordered handling record and vertically balance every Message list row.

**Architecture:** Extend the local Message fixture contract with optional deliverables, linked Task state, and staged timeline events. `MessageDetail` renders those records in its existing decision order; CSS supplies the visual hierarchy. Existing HeroUI buttons, feedback controls, and connector assets are reused.

**Tech Stack:** React, TypeScript, HeroUI v3, lucide-react, CSS, Node test runner.

## Global Constraints

- Work only in the `codex/message-page` worktree; do not alter the dirty primary worktree.
- Keep Message state separate from linked Task state.
- Present concise judgment basis, never chain-of-thought or technical logs.
- A deliverable is rendered only when the Message fixture declares one; do not render a fixed Excel card.
- Feedback records locally and never changes the Message answer or Memory automatically.
- Use HeroUI Button components already present in the workspace; add no dependencies.

---

### Task 1: Detail record data and feedback eligibility

**Files:**
- Modify: `src/messageState.ts`
- Modify: `src/messageState.test.ts`

**Interfaces:**
- Produces `Message.deliverables`, `Message.relatedTasks`, and `Message.timeline` records for `MessageDetail`.
- Keeps `recordMessageFeedback(snapshot, id, feedback): MessageSnapshot` as the service boundary.

- [ ] **Step 1: Write the failing test**

```ts
test('Message records preserve actual deliverable types, linked Task state, staged timeline, and feedback before resolution', () => {
  const snapshot = messageState.createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z'))
  const message = snapshot.messages.find((item) => item.id === 'delivery-commitment')!
  const updated = messageState.recordMessageFeedback(snapshot, message.id, { rating: 'down', reason: '需要先确认资源。' })

  assert.deepEqual(message.deliverables.map((item) => item.format), ['xlsx'])
  assert.deepEqual(message.relatedTasks.map((item) => item.status), ['open'])
  assert.deepEqual(message.timeline.map((item) => item.state), ['completed', 'completed', 'current'])
  assert.deepEqual(updated.messages.find((item) => item.id === message.id)?.feedback, [{ rating: 'down', reason: '需要先确认资源。' }])
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/messageState.test.ts`

Expected: FAIL because the new data fields do not yet exist and pre-resolution feedback is rejected.

- [ ] **Step 3: Write the minimal implementation**

```ts
export type MessageDeliverable = { name: string; format: 'xlsx' | 'pdf' | 'md'; size: string }
export type MessageRelatedTask = { title: string; status: 'open' | 'completed' }
export type MessageTimelineItem = { label: string; occurredAt: string; state: 'completed' | 'current' }

export type Message = {
  // existing fields
  deliverables: MessageDeliverable[]
  relatedTasks: MessageRelatedTask[]
  timeline: MessageTimelineItem[]
}

export const recordMessageFeedback = (snapshot: MessageSnapshot, id: string, feedback: MessageFeedback): MessageSnapshot => {
  const reason = feedback.reason.trim()
  if (!snapshot.messages.some((message) => message.id === id) || (feedback.rating === 'down' && !reason)) return snapshot
  return { ...snapshot, messages: snapshot.messages.map((message) => message.id === id ? { ...message, feedback: [...message.feedback, { ...feedback, reason }] } : message) }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/messageState.test.ts`

Expected: PASS.

### Task 2: Ordered detail cards and staged aside

**Files:**
- Modify: `src/content/translations.ts`
- Modify: `src/components/MessageDetail.tsx`
- Modify: `src/messageComponents.test.ts`

**Interfaces:**
- Consumes the Task 1 `Message` records and the existing `onFeedback` callback.
- Produces A–E semantic card headings, dynamic deliverable cards, Task status, information rows, and timeline stages.

- [ ] **Step 1: Write the failing test**

```ts
test('MessageDetail renders auditable A-to-E cards, dynamic artifacts, task state, source evidence, and a staged timeline', async () => {
  const { default: MessageDetail } = await vite.ssrLoadModule('/src/components/MessageDetail.tsx')
  const message = createDemoMessageSnapshot(new Date('2026-08-13T12:00:00.000Z')).messages[0]
  const html = renderToStaticMarkup(createElement(MessageDetail, { copy: translations.zh.workspace.message, message, onBack: () => {}, onConfirm: () => {}, onFeedback: () => {}, onSkip: () => {} }))

  for (const heading of ['A. 原始问题', 'B. Friday 的判断依据', 'C. 回答／处理结果', 'D. 关联 Task', 'E. 反馈']) assert.match(html, new RegExp(heading))
  assert.match(html, /交付资源与排期核对\.xlsx/)
  assert.match(html, /进行中/)
  assert.match(html, /已准备回复草稿/)
  assert.match(html, /aria-label="点赞"/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/messageComponents.test.ts`

Expected: FAIL because the current detail consists of generic text cards and hides feedback for this Message.

- [ ] **Step 3: Write the minimal implementation**

```tsx
<section className="message-detail-card message-detail-original">
  <h2><MessageSquare aria-hidden="true" /><span>A.</span>{copy.detail.question}</h2>
  <p>{message.question}</p>
  <small><img alt="" src={sourceIcon[message.source]} />{copy.detail.originalSource(copy.sources[message.source], message.sender, detailTime(message.receivedAt))}</small>
</section>
```

Render B with concise `message.rationale`, C with `message.result` plus `message.deliverables`, D with `message.relatedTasks`, and E with the existing `MessageFeedbackControls`. Render Message information as aligned object/source/category/status/received rows and render timeline records as completed/current stages.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/messageComponents.test.ts`

Expected: PASS.

### Task 3: Visual balance for detail and Message list rows

**Files:**
- Modify: `src/index.css`
- Test: `src/messageComponents.test.ts`

**Interfaces:**
- Styles the DOM classes from Task 2 without changing interaction behavior.

- [ ] **Step 1: Write the failing test**

```ts
test('Message styles center row content, separate status from time, and supply detail audit classes', () => {
  const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8')

  assert.match(css, /\.message-list-open \{[\s\S]*align-items: center;/)
  assert.match(css, /\.message-list-status \{[\s\S]*gap: 12px;/)
  assert.match(css, /\.message-detail-timeline/)
  assert.match(css, /\.message-detail-information-row/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/messageComponents.test.ts`

Expected: FAIL because rows align content to the top and audit classes are unstyled.

- [ ] **Step 3: Write the minimal implementation**

```css
.message-list-open { align-items: center; }
.message-list-status { align-content: center; gap: 12px; }
.message-list-status strong { align-items: center; padding-top: 2px; }
.message-list-status-dot { transform: translateY(1px); }
```

Add compact CSS for icon heading rows, result file cards, Task state badges, information label/value rows, stage timeline, and two-row feedback controls. Keep existing responsive breakpoints.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/messageComponents.test.ts`

Expected: PASS.

### Task 4: Verify and commit

**Files:**
- Modify: only the files listed in Tasks 1–3 and this plan.

- [ ] **Step 1: Run the complete validation set**

Run: `npm test && npm run typecheck && npm run build && git diff --check`

Expected: all tests, TypeScript, build, and whitespace validation pass.

- [ ] **Step 2: Inspect the local Message page**

Run: open `http://127.0.0.1:5174/`, open the first Message, and verify card order, source evidence, current timeline stage, dynamic artifact type, expanded downvote reason, and vertically centered list rows.

- [ ] **Step 3: Commit the scoped change**

```bash
git add src/messageState.ts src/messageState.test.ts src/components/MessageDetail.tsx src/messageComponents.test.ts src/content/translations.ts src/index.css docs/superpowers/plans/2026-08-13-message-detail-audit-layout.md
git commit -m "feat: refine Message detail audit layout"
```
