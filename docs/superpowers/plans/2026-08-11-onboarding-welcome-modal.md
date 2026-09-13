# Onboarding Welcome Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the approved welcome modal once when a new-login onboarding session opens, then reveal the existing first setup step.

**Architecture:** Keep all transient modal state in `OnboardingHome`. Make `translations.ts` the single source of truth for the four step labels; both the navigation and the modal read the same tuple. Add scoped CSS beside existing onboarding styles.

**Tech Stack:** React 19, TypeScript, HeroUI, CSS, Node test runner.

## Global Constraints

- Use the exact Chinese summary `4 步完成配置 · 预计 3 分钟`.
- Use the exact Chinese step labels `连接工作来源`, `建立工作 Memory`, `确认工作风格`, `试运行`.
- Do not add profile fields, persistence, dependencies, connector reads, or Memory writes.
- Preserve the existing four-step state machine and other user changes in the dirty worktree.

---

### Task 1: Shared copy and welcome dialog

**Files:**
- Modify: `src/content/translations.ts`
- Modify: `src/components/OnboardingHome.tsx`
- Test: `src/onboardingHome.test.ts`

**Interfaces:**
- Produces: `OnboardingCopy.steps` shared by the navigator and welcome dialog.
- Produces: a local `welcomeOpen` boolean in `OnboardingHome`.

- [ ] **Step 1: Write the failing SSR assertion**

```ts
assert.match(html, /4 步完成配置 · 预计 3 分钟/)
assert.match(html, /连接工作来源[\s\S]*建立工作 Memory[\s\S]*确认工作风格[\s\S]*试运行/)
assert.match(html, /开始配置/)
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test src/onboardingHome.test.ts`

- [ ] **Step 3: Add the smallest implementation**

```tsx
const [welcomeOpen, setWelcomeOpen] = useState(true)

{welcomeOpen && <section aria-modal="true" className="onboarding-welcome-backdrop" role="dialog">
  <Button onPress={() => setWelcomeOpen(false)}>{copy.welcome.start}</Button>
</section>}
```

Change `copy.steps` once and render that shared tuple in the dialog as well as the navigator.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test src/onboardingHome.test.ts`

### Task 2: Approved editorial styling and compact layout

**Files:**
- Modify: `src/index.css`
- Test: `src/onboardingHome.test.ts`

**Interfaces:**
- Consumes: `.onboarding-welcome-*` elements from Task 1.
- Produces: a modal that visually follows the approved split dark-and-ivory reference.

- [ ] **Step 1: Extend the failing SSR assertion with the style hooks**

```ts
assert.match(html, /onboarding-welcome-dialog/)
assert.match(html, /onboarding-welcome-memory/)
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test src/onboardingHome.test.ts`

- [ ] **Step 3: Add scoped CSS only**

```css
.onboarding-welcome-dialog { display: grid; grid-template-columns: 1.2fr .8fr; }
@media (max-width: 700px) { .onboarding-welcome-dialog { grid-template-columns: 1fr; } }
```

Use CSS-built note cards and connector lines for the small Memory illustration. Do not add a generated screenshot as a runtime asset.

- [ ] **Step 4: Run complete checks**

Run: `npm test && npm run typecheck && npm run build && git diff --check`

- [ ] **Step 5: Verify the interaction in a browser**

Start Vite, open the onboarding route, capture the initial dialog, click `开始配置`, then confirm that the dialog is gone and `连接工作来源` is the active step.
