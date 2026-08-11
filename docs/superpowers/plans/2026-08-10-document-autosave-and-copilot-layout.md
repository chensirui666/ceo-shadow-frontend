# Document Autosave and Copilot Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Make task documents directly editable with invisible five-second autosave, refine project-detail hierarchy, and align the AI Product Copilot with the supplied conversation reference.

**Architecture:** TasksWorkspace and its session-only service methods retain data ownership. TaskDocumentSurface owns title/body draft state and a five-second debounce; TaskAiProductDocument owns the optional conversation panel and forwards the same autosave callback.

**Tech Stack:** React, TypeScript, HeroUI, lucide-react, CSS, Node test runner with Vite SSR.

## Global Constraints

- Work only in /Users/stardust/ceo-shadow-frontend/.worktrees/codex-feature4-tasks on codex/feature4-tasks.
- Add no dependency, backend, rich-text editor, real model call, external send, staging, commit, or push.
- Autosave is debounced for 5,000 ms after the last title/body input; it remains current-session only.
- Project Detail receives no Copilot in this iteration. AI Product records only local user messages and never manufactures an assistant reply.
- Preserve keyboard access and visible focus.

---

### Task 1: Make the shared document surface directly editable and autosaved

**Files:**
- Modify: src/components/TaskDocumentSurface.tsx
- Modify: src/tasksComponents.test.ts

**Consumes:** TaskDocument and onSave(update) from document owners.

**Produces:** An editable document with no Preview/Edit/manual Save controls and one debounced onSave call after five seconds of input inactivity.

- [x] **Step 1: Write the failing rendered-document test**

~~~ts
test('the shared document surface starts editable without preview or manual-save controls', async () => {
  const { default: TaskDocumentSurface } = await vite.ssrLoadModule('/src/components/TaskDocumentSurface.tsx')
  const project = createDemoTasksSnapshot('陈思睿').projects[0]
  const html = renderToStaticMarkup(createElement(TaskDocumentSurface, {
    copy, document: project.detailDocument, label: copy.projectDetail,
    onBack: () => {}, onSave: () => {},
  }))

  assert.match(html, /<textarea/)
  assert.doesNotMatch(html, />Preview</)
  assert.doesNotMatch(html, />Edit</)
  assert.doesNotMatch(html, />Save changes</)
})
~~~

- [x] **Step 2: Run the targeted test to verify it fails**

Run: npm test -- --test-name-pattern='starts editable without preview'

Expected: FAIL because the surface starts in preview mode and renders an Edit control.

- [x] **Step 3: Write the minimum autosave surface**

~~~tsx
useEffect(() => {
  if (!dirty || !title.trim()) return
  const timer = window.setTimeout(() => {
    onSave({ title: title.trim(), content })
    setDirty(false)
  }, 5000)
  return () => window.clearTimeout(timer)
}, [content, dirty, onSave, title])
~~~

Start editable and always render the native title input and textarea. Remove the document-kind context, preview label, edit button, and manual save footer. Reset local draft only when the incoming document changes.

- [x] **Step 4: Run the targeted test to verify it passes**

Run: npm test -- --test-name-pattern='starts editable without preview'

Expected: PASS.

### Task 2: Match AI Product Copilot to the conversation-panel reference

**Files:**
- Modify: src/components/TaskAiProductDocument.tsx
- Modify: src/content/translations.ts
- Modify: src/tasksComponents.test.ts
- Modify: src/index.css

**Consumes:** The shared editable document surface and current-session feedback list.

**Produces:** A slightly darker right panel with a compact header, scrollable conversation, and bottom composer. Project Detail keeps no Copilot trigger.

- [x] **Step 1: Write the failing AI-document SSR test**

~~~ts
test('AI Product exposes a conversation composer without a fake reply', async () => {
  const html = renderAiProduct()

  assert.match(html, /aria-label="Open Copilot"/)
  assert.doesNotMatch(html, /ai-product-copilot-suggestions/)
  assert.doesNotMatch(html, /ai-product-feedback/)
})
~~~

- [x] **Step 2: Run the targeted test to verify it fails**

Run: npm test -- --test-name-pattern='conversation composer without a fake reply'

Expected: FAIL because the current dock uses suggestion and feedback components.

- [x] **Step 3: Replace the dock structure and copy**

Render the optional Copilot panel as a header, scrollable ordered list of local user messages, and bottom composer. Sending a nonblank prompt appends it to the session-only feedback list. Remove the suggestion and feedback-list markup. Give the panel a subtle warm-gray background and one left separator; anchor the composer at the bottom of the flex column.

- [x] **Step 4: Run the targeted test to verify it passes**

Run: npm test -- --test-name-pattern='conversation composer without a fake reply|AI Product uses the shared'

Expected: PASS.

### Task 3: Tighten Current progress, action items, and source filenames

**Files:**
- Modify: src/components/TaskProjectDetail.tsx
- Modify: src/index.css
- Modify: src/tasksComponents.test.ts
- Modify: doc/feature4-tasks page/04-Tasks PRD.md

**Consumes:** Existing milestones and source groups.

**Produces:** Centered milestone markers, separated stage detail, white action rows with beige header, and filename-like source hover text.

- [x] **Step 1: Write failing project-detail rendered tests**

~~~ts
test('source hover labels use concrete type-specific filenames', async () => {
  const html = renderProjectDetail()
  assert.match(html, /8 月客户联调会\.md/)
  assert.match(html, /现场演示方案\.pptx/)
  assert.match(html, /客户回访录音\.mp3/)
})
~~~

- [x] **Step 2: Run the targeted test to verify it fails**

Run: npm test -- --test-name-pattern='type-specific filenames'

Expected: FAIL because tooltips show only bare titles.

- [x] **Step 3: Implement the layout and filename mapping**

Use a fixed marker column in each milestone and align the connector to its center. Keep stage detail below the track in a padded, top-bordered row. Change table rows to #fffefd and the header to #f7f4ed. Map minutes to .md, documents to .docx, presentations to .pptx, audio to .mp3; folders retain their title without a synthetic suffix.

- [x] **Step 4: Run the targeted test to verify it passes**

Run: npm test -- --test-name-pattern='type-specific filenames|Current progress'

Expected: PASS.

### Task 4: Verify and document the local-demo boundary

**Files:**
- Modify: doc/feature4-tasks page/04-Tasks PRD.md
- Test: src/tasksComponents.test.ts

- [x] **Step 1: Update the PRD interaction and acceptance text**

Record direct editable documents, five-second session-only autosave, AI Product-only conversation panel, and the refined milestone/table/source presentation.

- [x] **Step 2: Run complete verification**

Run:

~~~bash
npm test
npm run typecheck
npm run build
git diff --check
~~~

Expected: all commands pass; record the existing bundle-size warning separately from failures.
