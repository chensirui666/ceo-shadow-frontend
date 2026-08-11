# Projects Workspace Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe Feature 4 as a project-first local workspace with explicit milestones, action-item context and AI products, and hoverable project-source materials.

**Architecture:** Extend the existing local `tasksState.ts` fixture and state helpers rather than adding a data layer. Keep `TasksWorkspace.tsx` responsible for list/dashboard navigation and `TaskProjectDetail.tsx` responsible for the selected project view. Reuse the existing HeroUI controls and Lucide icons; no dependencies, remote retrieval, external writes, or route changes are introduced.

**Tech Stack:** React 19, TypeScript, Vite, HeroUI, Lucide, Node test runner, CSS.

## Global Constraints

- User-facing module and copy use `Projects`; `TODO` remains only as an internal compatibility term.
- The worktree is `/Users/stardust/ceo-shadow-frontend/.worktrees/codex-feature4-tasks` on `codex/feature4-tasks`.
- All data remains deterministic local demo fixture data; refresh resets it and no external source, task, or AI product is read or written.
- A project source is previewed on hover and keyboard focus; it is not click-to-expand.
- An AI Product is a reviewable draft only, never an auto-send or external side effect.
- Do not stage, commit, or push without a separate user request.

---

## File map

- Modify `src/tasksState.ts`: explicit milestone/source/action-item fixture fields and derived milestone progress.
- Modify `src/tasksState.test.ts`: state-model red/green checks for fixtures and status updates.
- Modify `src/content/translations.ts`: Projects, action-item, milestone, source and AI Product copy in English and Chinese.
- Modify `src/translations.test.ts`: localized user-facing terminology checks if the existing test structure supports it.
- Modify `src/components/Workspace.tsx`: display the existing `tasks` route as Projects while retaining its stable route key.
- Modify `src/components/TasksWorkspace.tsx`: project-first list labels and dashboard copy only.
- Modify `src/components/TaskProjectDetail.tsx`: overview, milestone path, action-item detail/AI product controls, and grouped hoverable sources.
- Modify `src/tasksComponents.test.ts`: rendered semantic coverage for the new detail structure and source behavior.
- Modify `src/index.css`: responsive visual structure for the rebuilt workspace.

## Task 1: Explicit local project model

**Files:**
- Modify: `src/tasksState.ts`
- Test: `src/tasksState.test.ts`

**Interfaces:**
- Produces `TaskMilestone`, `TaskSource`, `TaskTodo.detail`, `TaskTodo.aiProduct`, `TaskProject.milestones`, `TaskProject.sources`, and `milestoneProgress(project, milestone)`.
- Consumes existing `projectProgress(project)` and `updateTodoStatus(snapshot, todoId, status, now)`.

- [x] **Step 1: Write failing fixture and progress tests**

```ts
test('demo projects expose explicit milestones and source materials', () => {
  const delivery = tasksState.createDemoTasksSnapshot('陈思睿').projects[0]
  assert.equal(delivery.milestones.find((item) => item.status === 'active')?.title, '确认验收范围')
  assert.deepEqual(delivery.sources.map((item) => item.type), ['minutes', 'document', 'presentation', 'audio', 'folder'])
})

test('a completed action updates only its linked milestone fraction', () => {
  const before = tasksState.createDemoTasksSnapshot('陈思睿')
  const after = tasksState.updateTodoStatus(before, 'acceptance-scope', 'completed', new Date('2026-08-08T12:00:00.000Z'))
  const milestone = after.projects[0].milestones.find((item) => item.id === 'acceptance')!
  assert.deepEqual(tasksState.milestoneProgress(after.projects[0], milestone), { completed: 1, total: 1, percent: 100 })
})
```

- [x] **Step 2: Verify the tests fail because milestones, sources, and `milestoneProgress` do not exist**

Run: `npm test -- src/tasksState.test.ts`

- [x] **Step 3: Add the smallest typed fixture model**

```ts
export type TaskMilestone = { id: string; title: string; summary: string; status: 'completed' | 'active' | 'upcoming'; dueAt: string; completedAt?: string }
export const milestoneProgress = (project: TaskProject, milestone: TaskMilestone) => {
  const items = project.todos.filter((todo) => todo.milestoneId === milestone.id && todo.status !== 'cancelled')
  const completed = items.filter((todo) => todo.status === 'completed').length
  return { completed, total: items.length, percent: items.length ? Math.round(completed / items.length * 100) : 0 }
}
```

Add deterministic per-project milestones, typed source materials, Detail text, AI Product fixtures, and milestone links on their action items. Do not infer stage state from action titles or automatically change a milestone status after cancellation.

- [x] **Step 4: Verify state tests pass**

Run: `npm test -- src/tasksState.test.ts`

## Task 2: User-facing Projects vocabulary

**Files:**
- Modify: `src/content/translations.ts`
- Modify: `src/components/Workspace.tsx`
- Test: `src/translations.test.ts`

**Interfaces:**
- Produces localized `TasksCopy` fields for milestones, action-item Detail, AI Product, and project sources.
- Keeps the stable route key `tasks`; only its visible label becomes Projects／项目.

- [x] **Step 1: Write a failing translation test**

```ts
test('the stable tasks route is presented as Projects and action items to users', () => {
  assert.equal(translations.en.workspace.nav.tasks, 'Projects')
  assert.equal(translations.zh.workspace.nav.tasks, '项目')
  assert.equal(translations.zh.workspace.tasks.sections.todos, '行动项')
})
```

- [x] **Step 2: Verify it fails on existing Tasks and TODO copy**

Run: `npm test -- src/translations.test.ts`

- [x] **Step 3: Make the smallest copy/type update**

Add copy for `milestones`, `sources`, Detail, AI Product, source categories, draft states, and no-product text in both locales. Replace visible Tasks/To-dos/Conclusions text, while leaving route keys and service filenames unchanged.

- [x] **Step 4: Verify translation tests pass**

Run: `npm test -- src/translations.test.ts`

## Task 3: Project detail interactions

**Files:**
- Modify: `src/components/TaskProjectDetail.tsx`
- Modify: `src/components/TasksWorkspace.tsx`
- Test: `src/tasksComponents.test.ts`

**Interfaces:**
- Consumes `TaskProject.milestones`, `TaskProject.sources`, `TaskTodo.detail`, and `TaskTodo.aiProduct` from Task 1.
- Renders one active milestone at initial load and local state for the selected milestone and selected action-item panel.

- [x] **Step 1: Write failing rendered-output tests**

```ts
test('project detail renders milestones, action-item context, AI drafts, and grouped hoverable sources', async () => {
  const html = renderToStaticMarkup(createElement(TaskProjectDetail, props))
  assert.match(html, /执行路径/)
  assert.match(html, /确认验收范围/)
  assert.match(html, /Detail/)
  assert.match(html, /AI Product/)
  assert.match(html, /项目来源/)
  assert.match(html, /文档\/听记/)
  assert.doesNotMatch(html, /Conclusions/)
})
```

- [x] **Step 2: Verify the test fails for the missing project-first sections**

Run: `npm test -- src/tasksComponents.test.ts`

- [x] **Step 3: Implement the compact project detail hierarchy**

Use this order: project facts; two-column overview/progress on wide screens; selectable explicit milestone path; action-item table; grouped project sources. Detail and AI Product are buttons that reveal content in the current detail section. Source entries remain focusable hover previews. Preserve the existing cancel confirmation and local action updates.

- [x] **Step 4: Verify component tests pass**

Run: `npm test -- src/tasksComponents.test.ts`

## Task 4: Responsive visual integration

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes class names added in Task 3.
- Produces equal-height desktop action rows, a warm-gray hierarchy, and a stacked narrow-screen layout.

- [x] **Step 1: Add the minimal CSS for new semantic sections**

```css
.tasks-project-overview { display: grid; grid-template-columns: minmax(0, 1fr) 240px; gap: 18px; }
.task-milestone-path { display: grid; grid-template-columns: repeat(var(--milestone-count), minmax(0, 1fr)); }
@media (max-width: 720px) { .tasks-project-overview, .task-milestone-path { grid-template-columns: 1fr; } }
```

Use the existing warm-gray tokens already present in the task styles. Keep long values clipped in desktop table rows; expose full text through native `title` and explicit Detail/AI Product controls. Do not add line-heavy separators, new image assets, or animation libraries.

- [x] **Step 2: Run static quality checks**

Run: `npm run typecheck && npm run build && git diff --check`

- [x] **Step 3: Perform browser verification**

Check list scan, project entry, milestone selection, Detail/AI Product toggles, source hover/focus previews, completion/cancel update, and narrow layout at approximately 390px wide.

## Task 5: Final regression check

**Files:**
- Verify: all modified files

- [x] **Step 1: Run the complete test suite**

Run: `npm test`

- [x] **Step 2: Re-run type, build, and diff checks**

Run: `npm run typecheck && npm run build && git diff --check`

- [x] **Step 3: Inspect the final change scope**

Run: `git status --short && git diff --stat`

No commit, stage, or push is part of this plan.
