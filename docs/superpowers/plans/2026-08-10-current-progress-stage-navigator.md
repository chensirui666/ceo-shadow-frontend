# Current Progress Stage Navigator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the project-detail milestone track with the approved accessible two-column stage navigator and focused selected-stage panel.

**Architecture:** `TaskProjectDetail` retains selected milestone state and derives its fraction through `milestoneProgress`. It replaces only milestone markup and adds a local scroll handler for the existing Action items section. `index.css` owns desktop/stacked visual layout; translations supply the linked-action label.

**Tech Stack:** React, TypeScript, HeroUI, lucide-react, CSS, Node test runner with Vite SSR.

## Global Constraints

- Work only in `/Users/stardust/ceo-shadow-frontend/.worktrees/codex-feature4-tasks` on `codex/feature4-tasks`.
- Add no dependency, API, persistence, animation library, staging, commit, or push.
- Preserve session-only data behavior, Todo controls, source rails, and Project Detail document flow.
- Use keyboard-operable tab semantics, text-plus-icon state signals, and a 720px stacked layout.

---

### Task 1: Define and test the stage navigator contract

**Files:**
- Modify: `src/content/translations.ts`
- Modify: `src/tasksComponents.test.ts`

**Produces:** `copy.milestone.openLinkedActions` in both locales and a test for the selected-stage structure.

- [x] **Step 1: Write the failing rendered-detail test**

```ts
assert.match(html, /class="task-milestone-navigator"/)
assert.match(html, /role="tablist"/)
assert.match(html, /<button(?=[^>]*role="tab")(?=[^>]*aria-selected="true")/)
assert.match(html, /class="task-milestone-detail"/)
assert.match(html, /role="tabpanel"/)
assert.match(html, />View linked action items</)
```

- [x] **Step 2: Run the targeted test**

Run: `npm test -- --test-name-pattern='selectable stage navigator'`

Expected: FAIL because no tablist, tabpanel, or linked-action control exists.

- [x] **Step 3: Add the localized action label**

```ts
milestone: { current: 'Current milestone', due: 'Due', progress: 'Progress', completed: 'Completed', active: 'In progress', upcoming: 'Upcoming', openLinkedActions: 'View linked action items' }
```

Add `查看关联行动项` to Chinese and extend `TasksCopy.milestone` with the key.

- [x] **Step 4: Verify the translation change**

Run: `npm run typecheck`

Expected: PASS.

### Task 2: Rebuild Current progress around the selected-stage navigator

**Files:**
- Modify: `src/components/TaskProjectDetail.tsx`
- Modify: `src/index.css`
- Test: `src/tasksComponents.test.ts`

**Consumes:** `project.milestones`, `selectedMilestoneId`, `milestoneProgress`, `copy.milestone`, and the current Action items section.

**Produces:** Clickable navigator at left, selected stage at right, Action items scroll anchor.

- [x] **Step 1: Render tab navigator and selected panel**

```tsx
<div aria-label={copy.sections.milestones} className="task-milestone-navigator" role="tablist">
  {project.milestones.map((milestone) => <button aria-controls={`milestone-panel-${milestone.id}`}
    aria-selected={selectedMilestone?.id === milestone.id} key={milestone.id}
    onClick={() => setSelectedMilestoneId(milestone.id)} role="tab" type="button">
    <MilestoneIcon status={milestone.status} />
    <span><strong>{milestone.title}</strong><small>{copy.milestone[milestone.status]}</small></span>
    <time>{formatDate(milestone.dueAt, locale)}</time>
  </button>)}
</div>
<section className="task-milestone-detail" id={`milestone-panel-${selectedMilestone.id}`} role="tabpanel">
  <h4>{selectedMilestone.title}</h4><p>{selectedMilestone.summary}</p>
  <progress max={selectedMilestoneProgress.total || 1} value={selectedMilestoneProgress.completed} />
  <Button onPress={scrollToActionItems} variant="ghost">{copy.milestone.openLinkedActions}</Button>
</section>
```

Include title, summary, native `<progress value={completed} max={total || 1}>`, deadline, and a button that calls `document.getElementById('task-action-items')?.scrollIntoView({ behavior: 'smooth', block: 'start' })`.

- [x] **Step 2: Anchor Action items**

```tsx
<section className="tasks-detail-section" id="task-action-items">
```

Do not add a new filter or duplicate the existing Todo table.

- [x] **Step 3: Apply the approved two-column CSS**

```css
.tasks-milestones-panel { display: grid; grid-template-columns: minmax(230px, .72fr) minmax(0, 1.28fr); padding: 0; }
.task-milestone-navigator { border-right: 1px solid #e4e0d8; padding: 16px 0; }
.task-milestone-detail { display: grid; align-content: center; gap: 18px; min-height: 244px; padding: 28px 34px; }
@media (max-width: 720px) { .tasks-milestones-panel { grid-template-columns: 1fr; } .task-milestone-navigator { border-right: 0; border-bottom: 1px solid #e4e0d8; } }
```

Draw the navigator connector behind status icons with a pseudo-element. Use the selected row's beige background and amber inset marker, not a raised card or shadow. Style the native progress element with a neutral track and amber active fill.

- [x] **Step 4: Run focused component tests**

Run: `npm test -- --test-name-pattern='selectable stage navigator|Current progress|project detail keeps a Detail file'`

Expected: PASS.

### Task 3: Synchronize PRD and verify the complete result

**Files:**
- Modify: `doc/feature4-tasks page/04-Tasks PRD.md`
- Modify: `docs/superpowers/plans/2026-08-10-current-progress-stage-navigator.md`

- [x] **Step 1: Replace the Current progress PRD rule**

Document the desktop two-column selectable navigator, selected-stage panel, existing-Action-items scroll entry, and stacked narrow-screen layout. Remove the old horizontal-track-and-lower-detail description.

- [x] **Step 2: Run complete verification**

Run: `npm test && npm run typecheck && npm run build && git diff --check`

Expected: PASS; bundle-size warning remains non-blocking.

- [x] **Step 3: Mark complete steps**

Change each checkbox in this plan to `- [x]` only after the verification command passes.
