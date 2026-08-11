# AI Product Document and Dense Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn an action item's AI Product into an editable, locally persisted document with a Copilot feedback dock, while making project overview, action items and source material visually content-tight.

**Architecture:** Keep `tasksState.ts` and `tasksService.ts` as the replaceable in-memory data boundary. `TaskProjectDetail` remains responsible for project reading and inline Detail disclosure; `TaskAiProductDocument` owns the isolated draft editor and Copilot interaction. `TasksWorkspace` switches between list, project detail and AI Product document states without adding a routing library.

**Tech Stack:** React 19, TypeScript, HeroUI, lucide-react, Vite, node:test, existing CSS.

## Global Constraints

- All edits and feedback persist only for the active frontend session and reset on refresh.
- Do not add dependencies, real model calls, external sends, source-file reads, rich-text collaboration or backend persistence.
- Copilot feedback never changes document text without an explicit user edit.
- Keep tooltip information available on keyboard focus as well as mouse hover.
- Preserve existing completion, cancellation, milestone and responsive behavior.
- Do not stage, commit or push existing dirty worktree changes without explicit user approval.

---

### Task 1: Make AI Product drafts session-editable in the data boundary

**Files:**
- Modify: `src/tasksState.ts:10-21, 44-104, 205-220`
- Modify: `src/tasksService.ts:1-17`
- Test: `src/tasksState.test.ts`

**Interfaces:**
- Produces `updateAiProduct(snapshot, todoId, { title, content, feedback }, now)` returning a new `TasksSnapshot`.
- Produces `TasksService.updateAiProduct(todoId, update)` returning the cloned current session snapshot.
- `TaskAiProduct` gains `content` and `feedback` fields; fixtures provide bodies for every existing product.

- [x] **Step 1: Write failing state and service tests**

```ts
test('AI Product updates stay in the current snapshot and preserve traceability', async () => {
  const before = createDemoTasksSnapshot('陈思睿')
  const after = updateAiProduct(before, 'acceptance-scope', {
    title: '更新后的验收清单', content: '第一项：确认环境。', feedback: ['补充权限负责人。'],
  }, new Date('2026-08-10T08:00:00.000Z'))

  const product = after.projects[0].todos[0].aiProduct
  assert.equal(product?.title, '更新后的验收清单')
  assert.equal(product?.content, '第一项：确认环境。')
  assert.deepEqual(product?.feedback, ['补充权限负责人。'])
  assert.deepEqual(product?.sourceIds, ['delivery-minutes', 'delivery-document'])
})
```

- [x] **Step 2: Run the focused test and confirm it fails because the updater is absent**

Run: `node --import tsx --test src/tasksState.test.ts`

- [x] **Step 3: Add the minimal typed product content, updater and service method**

```ts
export const updateAiProduct = (snapshot: TasksSnapshot, todoId: string, update: Pick<TaskAiProduct, 'title' | 'content' | 'feedback'>, now = new Date()): TasksSnapshot => ({
  ...snapshot,
  projects: snapshot.projects.map((project) => ({
    ...project,
    todos: project.todos.map((todo) => todo.id === todoId && todo.aiProduct
      ? { ...todo, aiProduct: { ...todo.aiProduct, ...update, preview: update.content.slice(0, 80), updatedAt: now.toISOString() } }
      : todo),
  })),
})
```

- [x] **Step 4: Re-run state and service tests**

Run: `node --import tsx --test src/tasksState.test.ts`

- [x] **Step 5: Inspect the diff without staging it**

Run: `git diff --check -- src/tasksState.ts src/tasksService.ts src/tasksState.test.ts`

### Task 2: Rebuild the project-detail reading surfaces

**Files:**
- Modify: `src/components/TaskProjectDetail.tsx:1-167`
- Modify: `src/index.css:483-570, 995-1019`
- Test: `src/tasksComponents.test.ts`

**Interfaces:**
- `TaskProjectDetail` accepts `onOpenAiProduct(todoId: string)`.
- It renders inline Detail only; its source region renders source type/count rail targets with title-only tooltip lists.
- It emits `tasks-source-rail`, `task-source-rail-item`, and no longer emits individual source cards.

- [x] **Step 1: Write failing server-render tests for the source rail and AI Product navigation action**

```ts
assert.match(html, /tasks-source-rail/)
assert.match(html, /task-source-rail-item/)
assert.match(html, /aria-label="Minutes · 1 source"/)
assert.doesNotMatch(html, /task-project-source-group/)
assert.match(html, /data-ai-product-action="acceptance-scope"/)
```

- [x] **Step 2: Run the component test and confirm the new selectors are absent**

Run: `node --import tsx --test src/tasksComponents.test.ts`

- [x] **Step 3: Replace individual source cards with compact type/count rails and lift the AI Product click callback**

```tsx
<Button className="task-todo-link" data-ai-product-action={todo.id} onPress={() => onOpenAiProduct(todo.id)} variant="ghost">
  {copy.todo.openAiProduct}
</Button>
```

- [x] **Step 4: Remove inset panel padding and grid gaps only from the named detail surfaces**

```css
.tasks-reading dl, .tasks-action-items-panel { padding: 0; }
.tasks-reading dl, .task-todo-list { gap: 0; }
.tasks-sources-panel { padding: 0; }
```

- [x] **Step 5: Re-run component tests**

Run: `node --import tsx --test src/tasksComponents.test.ts`

### Task 3: Add the isolated AI Product document and Copilot feedback dock

**Files:**
- Create: `src/components/TaskAiProductDocument.tsx`
- Modify: `src/components/TasksWorkspace.tsx:22-95`
- Modify: `src/index.css:571-720, 1010-1030`
- Modify: `src/content/translations.ts:95-113, 218-230, 401-413`
- Test: `src/tasksComponents.test.ts`

**Interfaces:**
- `TaskAiProductDocument` consumes `{ copy, locale, project, todo, onBack, onSave }`.
- `onSave(todoId, { title, content, feedback })` sends only explicit document edits or submitted feedback to `TasksService.updateAiProduct`.
- `TasksWorkspace` holds `selectedAiProductTodoId` and switches to the document component only for the selected project's existing AI Product.

- [x] **Step 1: Write a failing server-render test for title/body controls, return path and Copilot states**

```ts
const project = createDemoTasksSnapshot('陈思睿').projects[0]
const todo = project.todos.find((item) => item.id === 'acceptance-scope')
assert.ok(todo?.aiProduct)
const html = renderToStaticMarkup(createElement(TaskAiProductDocument, {
  copy: translations.en.workspace.tasks,
  locale: 'en',
  onBack: () => {},
  onSave: () => {},
  project,
  todo: todo!,
}))
assert.match(html, /aria-label="AI Product document"/)
assert.match(html, /value="客户验收清单"/)
assert.match(html, /aria-label="Open Copilot"/)
assert.match(html, /Back to 客户交付准备/)
```

- [x] **Step 2: Run the focused component test and confirm the module cannot load**

Run: `node --import tsx --test src/tasksComponents.test.ts`

- [x] **Step 3: Implement the document page with native input and textarea controls**

```tsx
<input aria-label={copy.aiProductDocument.titleLabel} onChange={(event) => setTitle(event.target.value)} value={title} />
<textarea aria-label={copy.aiProductDocument.bodyLabel} onChange={(event) => setContent(event.target.value)} value={content} />
```

- [x] **Step 4: Implement collapsed/open Copilot and explicit feedback submission**

```tsx
<Button aria-expanded={copilotOpen} aria-label={copy.aiProductDocument.openCopilot} onPress={() => setCopilotOpen((open) => !open)} />
```

The submitted message appends to product feedback and displays the localized local-session acknowledgement. It does not mutate title or content.

- [x] **Step 5: Wire document navigation and session saves through `TasksWorkspace`**

Run: `node --import tsx --test src/tasksComponents.test.ts`

### Task 4: Align requirements, localization and regression coverage

**Files:**
- Modify: `doc/feature4-tasks page/04-Tasks PRD.md:134-138, 220-227, 264-270, 287-343`
- Modify: `src/translations.test.ts`
- Modify: `src/tasksComponents.test.ts`

**Interfaces:**
- PRD P0 defines editable, reviewable AI Product documents and the feedback boundary.
- PRD source requirement defines the compact material rail and title-only hover/focus preview.

- [x] **Step 1: Update PRD P0 wording and acceptance criteria**

The document must distinguish local-session edit/feedback interaction from real model calls, external sends, source reading and backend persistence.

- [x] **Step 2: Add translation completeness assertions for document and Copilot copy**

```ts
assert.equal(translations.zh.workspace.tasks.aiProductDocument.openCopilot, '打开 Copilot')
assert.equal(translations.en.workspace.tasks.aiProductDocument.feedbackSent, 'Feedback saved for this session')
```

- [x] **Step 3: Run the full project verification set**

Run: `npm test && npm run typecheck && npm run build && git diff --check`

- [ ] **Step 4: Visually verify the narrow layout**

Desktop visual verification is complete. The in-app browser's viewport override did not take effect during this run, so 390px confirmation remains a separate check.

Check the project-detail overview/action/source frames, source hover/focus titles, document return action, Copilot open/close, editor persistence while navigating back, and no horizontal overflow at 390px.

- [x] **Step 5: Leave the worktree unstaged**

Run: `git status --short`
