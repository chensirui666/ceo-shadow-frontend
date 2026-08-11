# Project Detail Panel Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the project detail page into clearly separated, independently outlined work panels while preserving its current local data and interactions.

**Architecture:** Keep `TaskProjectDetail.tsx` as the only detail-page component. Add semantic panel wrappers around the existing overview, milestone, action-item, and source content; update `index.css` to make the wrappers the primary visual boundary. Do not alter fixtures, derived state, source-preview behavior, or action-item updates.

**Tech Stack:** React 19, TypeScript, HeroUI, CSS, Node test runner.

## Global Constraints

- Worktree: `/Users/stardust/ceo-shadow-frontend/.worktrees/codex-feature4-tasks` on `codex/feature4-tasks`.
- A section heading sits above its outlined content panel. Large panels are separated by 28px desktop space, with responsive reduction only on narrow screens.
- Use one exterior border per large module; avoid nested card stacks and full-width section separator lines.
- Preserve: project-first hierarchy, local fixture-only data, milestone selection, Detail/AI Product in-place panels, source hover/focus previews, and complete/cancel behavior.
- Do not stage, commit, or push.

---

### Task 1: Semantic module boundaries

**Files:**
- Modify: `src/components/TaskProjectDetail.tsx`
- Test: `src/tasksComponents.test.ts`

**Interfaces:**
- Consumes existing project, milestone, todo, and source props.
- Produces stable `tasks-detail-panel` and module-specific classes used only by detail CSS.

- [ ] **Step 1: Write a failing rendered-output test**

```ts
test('project detail groups each major work area in a distinct panel', async () => {
  const html = renderToStaticMarkup(createElement(TaskProjectDetail, props))
  assert.match(html, /tasks-project-overview-panel/)
  assert.match(html, /tasks-milestones-panel/)
  assert.match(html, /tasks-action-items-panel/)
  assert.match(html, /tasks-sources-panel/)
})
```

- [ ] **Step 2: Run the component test and verify RED**

Run: `npm test -- src/tasksComponents.test.ts`

Expected: the assertion fails because panel classes do not yet exist.

- [ ] **Step 3: Add the smallest semantic wrappers**

Wrap the existing overview reading/progress pair, milestone path/focus, action-item table, and sources list in their respective panels. Keep titles outside panels and do not move state, handlers, or source controls.

- [ ] **Step 4: Run the component test and verify GREEN**

Run: `npm test -- src/tasksComponents.test.ts`

### Task 2: Panel-first CSS and responsive visual checks

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes the Task 1 panel classes.
- Produces independent outlined panels, 28px inter-module gaps, a two-panel overview, and a single-column small-screen layout without horizontal overflow.

- [ ] **Step 1: Replace continuous section padding with module gaps**

Set `.tasks-detail-section` to use an exterior `margin-top` after the first module and a compact heading-to-panel gap. Give `.tasks-detail-panel` the shared `1px #e4e0d8` border, `12px` radius, `#fffefd` background, and `6px` inset. Remove duplicate outer borders from descendants that become panel contents.

- [ ] **Step 2: Make inner rows use surfaces rather than separator lines**

Keep overview label cells in warm deep gray and content cells in pale warm gray. Keep action rows equal-height and alternating warm surfaces; do not add horizontal rules. Present milestone selection inside its panel without reflowing other modules.

- [ ] **Step 3: Retain narrow-screen behavior**

At the existing narrow breakpoint, stack the overview panels, collapse the milestone path vertically, and ensure `.tasks-detail` remains within the viewport.

- [ ] **Step 4: Run quality and browser checks**

Run: `npm test && npm run typecheck && npm run build && git diff --check`

Browser: inspect desktop detail spacing and exterior panel boundaries; verify milestone selection, Detail/AI Product, source hover/focus, and 390px width with no horizontal overflow.
