# Message Task Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep Message filtering focused, remove the low-value timeline, and make a Message's Task count open its related Task list.

**Architecture:** `messageState` keeps only source and category filters. `MessageDetail` derives a compact count from its existing related Task records and delegates navigation upward. `Workspace` carries that selected relation to the existing Task route, where `TasksWorkspace` renders only those records.

**Tech Stack:** React 19, TypeScript, HeroUI, Vite, Node test runner.

## Global Constraints

- Do not let Task status change Message status.
- Reuse the existing fixture-shaped Message and Task route; do not add a new route or dependency.
- Keep the Task count as an actual navigation control, not a decorative chevron.

---

### Task 1: Focus Message filters and detail summary

**Files:**
- Modify: `src/messageState.ts`
- Modify: `src/components/MessageList.tsx`
- Modify: `src/components/MessageDetail.tsx`
- Modify: `src/content/translations.ts`
- Modify: `src/messageState.test.ts`
- Modify: `src/messageComponents.test.ts`

- [x] **Step 1: Write failing tests**

```ts
assert.deepEqual(messageState.selectMessages(snapshot, 'all', { source: 'feishu', category: 'chat' }).map((message) => message.id), ['delivery-commitment', 'expired-connection'])
assert.deepEqual(filterChanges, [{ source: 'feishu', category: 'all' }, { source: 'all', category: 'all' }])
assert.deepEqual(calls, [])
```

Assert that a detail renders the task count control and does not render an Activity timeline.

- [x] **Step 2: Run focused tests and verify they fail**

Run: `node --test src/messageState.test.ts src/messageComponents.test.ts`

Expected: FAIL because the state still supports subject/sender filters, Clear all resets status, and the detail includes a timeline.

- [x] **Step 3: Implement the smallest behavior**

```ts
export type MessageFilters = { source: MessageSource | 'all'; category: string }
const clearFilters = () => onFiltersChange(createDefaultMessageFilters())
const openCount = relatedTasks.filter((task) => task.status === 'open').length
```

Render a HeroUI button with the task count and chevron only when the Message has related Tasks; remove the Activity timeline card.

- [x] **Step 4: Re-run focused tests**

Run: `node --test src/messageState.test.ts src/messageComponents.test.ts`

Expected: PASS.

### Task 2: Carry a selected Message relation to Task

**Files:**
- Modify: `src/components/MessageWorkspace.tsx`
- Modify: `src/components/Workspace.tsx`
- Modify: `src/components/TasksWorkspace.tsx`
- Modify: `src/messageComponents.test.ts`
- Modify: `src/tasksComponents.test.ts`

- [x] **Step 1: Write a failing navigation test**

```ts
const detail = MessageDetail({ ...handlers, onOpenTasks: (tasks) => opened.push(tasks) })
find(detail, (element) => element.props.className === 'message-detail-task-summary-link').props.onPress()
assert.deepEqual(opened, [message.relatedTasks])
```

- [x] **Step 2: Run focused tests and verify they fail**

Run: `node --test src/messageComponents.test.ts src/tasksComponents.test.ts`

Expected: FAIL because `onOpenTasks` is not part of the component contract.

- [x] **Step 3: Implement the smallest route handoff**

```ts
const [messageTasks, setMessageTasks] = useState<MessageRelatedTask[] | null>(null)
const openMessageTasks = (tasks: MessageRelatedTask[]) => {
  setTasksDetailHeader(null)
  setMessageTasks(tasks)
  setRoute('tasks')
}
```

Pass `messageTasks` to `TasksWorkspace`; when it is present, render just those Task records with their existing state chips. Normal Task navigation clears the focused relation.

- [x] **Step 4: Re-run focused tests and typecheck**

Run: `node --test src/messageComponents.test.ts src/tasksComponents.test.ts && npm run typecheck`

Expected: PASS.

### Task 3: Verify the focused view

**Files:**
- Modify: `src/index.css`

- [x] **Step 1: Add only the layout needed for the compact summary button and focused Task rows**

```css
.message-detail-task-summary-link { display: flex; justify-content: space-between; width: 100%; }
.tasks-message-list { display: grid; gap: 8px; }
```

- [x] **Step 2: Run the full verification set**

Run: `npm test && npm run typecheck && npm run build && git diff --check`

Expected: PASS.

- [x] **Step 3: Visually verify in the existing 5174 preview**

Open a Message detail, activate its Task count, and confirm the Task route shows only the relation records.
