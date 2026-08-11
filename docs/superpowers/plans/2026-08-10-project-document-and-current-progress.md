# Project Document and Current Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the project facts bar, add its editable Detail file, and reuse one preview/edit document surface for project details and AI Products while refining Current progress, action-item and source presentation.

**Architecture:** Add a small `TaskDocument` record at the Tasks data boundary and a session-only project-document updater. `TaskDocumentSurface` owns preview/edit UI only; project detail and AI Product remain separate owners that pass their records and save callbacks into it. The project landing page owns navigation to either document type.

**Tech Stack:** React, TypeScript, HeroUI Button, lucide-react icons, CSS, Node test runner with Vite SSR.

## Global Constraints

- Work only in `/Users/stardust/ceo-shadow-frontend/.worktrees/codex-feature4-tasks` on `codex/feature4-tasks`.
- Use native inputs and textareas; add no dependencies and no rich-text capability.
- All edits remain session-local; no external service, upload, model call, send, staging, commit, or push.
- Preserve keyboard access and visible focus for Detail, document controls, milestones, source rail items, and action operations.
- Use test-driven development: each behavior starts with a failing targeted test before its production change.

---

### Task 1: Add a typed project-detail document at the Tasks data boundary

**Files:**
- Modify: `src/tasksState.ts`
- Modify: `src/tasksService.ts`
- Test: `src/tasksState.test.ts`

**Consumes:** Existing `TasksSnapshot`, `TaskProject`, `TaskAiProduct`, and the cloned-session implementation in `createTasksService`.

**Produces:**
- `TaskDocument = { title: string; content: string; updatedAt: string }`
- `TaskProject.detailDocument: TaskDocument`
- `updateProjectDocument(snapshot, projectId, update, now): TasksSnapshot`
- `TasksService.updateProjectDocument(projectId, update): Promise<TasksSnapshot>`

- [ ] **Step 1: Write the failing state-boundary test**

```ts
test('project detail document edits replace only that project in the session snapshot', () => {
  const before = tasksState.createDemoTasksSnapshot('陈思睿')
  const after = tasksState.updateProjectDocument(before, 'client-delivery', {
    title: '客户交付准备：说明',
    content: '已确认验收负责人。',
  }, new Date('2026-08-10T09:00:00.000Z'))

  assert.equal(after.projects[0].detailDocument.content, '已确认验收负责人。')
  assert.equal(after.projects[0].detailDocument.updatedAt, '2026-08-10T09:00:00.000Z')
  assert.equal(before.projects[0].detailDocument.content.includes('项目目标'), true)
  assert.equal(after.projects[1].detailDocument.title, before.projects[1].detailDocument.title)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --test-name-pattern='project detail document edits'`

Expected: FAIL because `updateProjectDocument` and `detailDocument` do not exist.

- [ ] **Step 3: Write minimal data-boundary implementation**

```ts
export type TaskDocument = { title: string; content: string; updatedAt: string }

export const updateProjectDocument = (snapshot: TasksSnapshot, projectId: string, update: Pick<TaskDocument, 'title' | 'content'>, now = new Date()): TasksSnapshot => ({
  ...snapshot,
  projects: snapshot.projects.map((project) => project.id === projectId
    ? { ...project, detailDocument: { ...project.detailDocument, ...update, updatedAt: now.toISOString() } }
    : project),
})
```

Add a `detailDocument` fixture for every demo project. Its body contains the existing project facts plus goal, background, current progress, blocker, next step, and recent change. Add `updateProjectDocument` as a thin `tasksService.ts` method parallel to `updateAiProduct`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --test-name-pattern='project detail document edits'`

Expected: PASS.

### Task 2: Share preview/edit document UI between Detail and AI Product

**Files:**
- Create: `src/components/TaskDocumentSurface.tsx`
- Modify: `src/components/TaskAiProductDocument.tsx`
- Modify: `src/components/TasksWorkspace.tsx`
- Modify: `src/content/translations.ts`
- Modify: `src/translations.test.ts`
- Test: `src/tasksComponents.test.ts`

**Consumes:** `TaskDocument`, existing AI Product session updater, and `TaskProject.detailDocument` from Task 1.

**Produces:** `TaskDocumentSurface` with Preview, Edit, Save, and Back; document selection in `TasksWorkspace` for Detail or AI Product; locale copy for both paths.

- [ ] **Step 1: Write failing SSR and copy tests**

```ts
test('the shared document surface previews a project document before editing', async () => {
  const { default: TaskDocumentSurface } = await vite.ssrLoadModule('/src/components/TaskDocumentSurface.tsx')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const html = renderToStaticMarkup(createElement(TaskDocumentSurface, {
    copy: translations.en.workspace.tasks.document,
    document: project.detailDocument,
    label: translations.en.workspace.tasks.document.projectDetail,
    onBack: () => {},
    onSave: () => {},
  }))

  assert.match(html, /role="document"/)
  assert.match(html, /客户交付准备：项目详情/)
  assert.match(html, />Edit</)
  assert.doesNotMatch(html, /<textarea/)
})

test('project facts include a fifth Detail file action', async () => {
  const html = renderProjectDetail()
  assert.match(html, /tasks-project-facts/)
  assert.match(html, /data-project-detail-action/)
  assert.match(html, />Detail</)
  assert.doesNotMatch(html, /tasks-project-overview-panel/)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --test-name-pattern='shared document surface|fifth Detail file action'`

Expected: FAIL because the component, copy, fifth action, and overview removal are missing.

- [ ] **Step 3: Build the minimum reusable document surface and route both owners through it**

```tsx
type TaskDocumentSurfaceProps = {
  copy: TasksCopy['document']
  document: TaskDocument
  label: string
  onBack: () => void
  onSave: (update: Pick<TaskDocument, 'title' | 'content'>) => void
}
```

`TaskDocumentSurface` starts in Preview mode with an accessible title and `white-space: pre-wrap` body. Edit swaps only the title and body for native controls. Save calls the owner callback, shows the session-only saved message, and returns to Preview.

Keep `TaskAiProductDocument` as the AI-specific wrapper: it supplies context and its optional Copilot/feedback dock, while reusing `TaskDocumentSurface` for title/body. In `TasksWorkspace`, replace `selectedAiProductTodoId` with a discriminated selection for either `{ kind: 'project-detail' }` or `{ kind: 'ai-product'; todoId: string }`; clear it in `closeDetail` and `openProject`. The facts-bar Detail action opens project detail and uses the new service updater.

Add `document` copy in both locales for project-detail label, preview, edit, save, saved-in-session, return label, title label, and body label.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --test-name-pattern='shared document surface|fifth Detail file action|AI Product document copy'`

Expected: PASS.

### Task 3: Refine the action page hierarchy and sync the PRD

**Files:**
- Modify: `src/components/TaskProjectDetail.tsx`
- Modify: `src/index.css`
- Modify: `src/content/translations.ts`
- Modify: `src/tasksComponents.test.ts`
- Modify: `src/translations.test.ts`
- Modify: `doc/feature4-tasks page/04-Tasks PRD.md`

**Consumes:** Detail action callback from Task 2 and existing milestone/source grouping data.

**Produces:** Current progress heading, contained milestone detail, uniform warm-off-white action-item rows, and a divider-free conventional-icon source rail.

- [ ] **Step 1: Write failing rendered-detail and translation tests**

```ts
test('project detail calls the milestone track Current progress without duplicating overview', async () => {
  const html = renderProjectDetail()
  assert.match(html, />Current progress</)
  assert.doesNotMatch(html, />Execution path</)
  assert.match(html, /task-milestone-focus/)
})

test('source rail uses the conventional material entry class and preserves title tooltip', async () => {
  const html = renderProjectDetail()
  assert.match(html, /task-source-rail-icon/)
  assert.match(html, /task-source-rail-chevron/)
  assert.match(html, /task-source-rail-tooltip/)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --test-name-pattern='Current progress|conventional material entry'`

Expected: FAIL because the label and icon classes are absent.

- [ ] **Step 3: Make the minimum structure and CSS changes**

Set the English and Chinese milestone section copy to Current progress / 当前进展. Keep the existing milestone behavior intact. Make `.task-milestone-focus` a second row within `.tasks-milestones-panel`, with a real top border and its own padding; remove its inset-card margin.

Make all `.task-todo` rows use `#f5f4f1` and remove the alternating-row rule. Preserve green only for meaningful statuses and controls.

Use installed `lucide-react` icons in `SourceRailItem`: `FileText`, `Headphones`, `FileType2`, `AudioLines`, `Folder`, and `ChevronRight`. Add `task-source-rail-icon` and `task-source-rail-chevron` classes. Remove desktop and narrow-screen source-item separator rules; use rail gap/padding only. Keep title-only hover/focus tooltip contents.

Update PRD sections 4.2, 4.3, 4.4, 5.2, 5.4, 5.5, and acceptance items to reflect the confirmed five-column facts bar, Detail document, Current progress naming, session edit boundary, uniform action rows, and divider-free conventional-icon sources.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --test-name-pattern='Current progress|conventional material entry'`

Expected: PASS.

### Task 4: Verify the complete local demo

**Files:**
- Test: `src/tasksState.test.ts`
- Test: `src/tasksComponents.test.ts`
- Test: `src/translations.test.ts`

- [ ] **Step 1: Run static verification**

Run:

```bash
npm test
npm run typecheck
npm run build
git diff --check
```

Expected: all tests, typecheck, build, and whitespace check pass. Record any pre-existing bundle-size warning separately from a failure.

- [ ] **Step 2: Verify the delivered interaction in the local browser**

At `http://127.0.0.1:4173/`, open a project and verify: five facts columns; Detail opens in Preview; Edit, Save, and return preserve the document within the same session; AI Product also previews then edits; Current progress has separated steps and explanation; Action items use consistent off-white rows; sources show conventional icons with no separators and titles only on hover/focus. Check browser console errors before handoff.

- [ ] **Step 3: Report the local-demo boundary**

State that document changes persist only during the current browser session and no external project/document/AI system was contacted.
