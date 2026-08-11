# Onboarding Modal and Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make onboarding progress feel deliberate, unify modal actions, and let a user refine the extracted work-style Prompt before confirmation.

**Architecture:** Keep all local-demo interaction state in `OnboardingHome`. Reuse the existing modal shell and HeroUI buttons; only add small UI state for progress and the editable Prompt.

**Tech Stack:** React 19, TypeScript, HeroUI, CSS, Node test runner.

## Global Constraints

- Remain a local demo: no external reads, writes, or sending.
- Preserve the existing four onboarding states and Trial boundary.
- Do not add dependencies or persistent storage.

---

### Task 1: Modal visual system and gradual progress

**Files:**
- Modify: `src/components/OnboardingHome.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Make a failing SSR assertion for the visible style extraction action.**

```ts
assert.match(stepThreeHtml, /Extract work style/)
```

- [ ] **Step 2: Run the focused test and observe the missing control.**

Run: `node --test src/onboardingHome.test.ts`

- [ ] **Step 3: Replace the Memory timeout jump with a small-interval progress update and delay the summary until 100% is visible.**

```ts
const progressTimer = window.setInterval(() => setMemoryProgress((value) => Math.min(value + 2.5, 95)), 100)
```

- [ ] **Step 4: Apply modal-specific button classes for cream secondary actions and near-black primary actions.**

```css
.onboarding-modal-dialog .button--secondary { background: #f3eadc; color: #292721; }
.onboarding-modal-dialog .button:not(.button--secondary) { background: #292721; color: #fffefd; }
```

- [ ] **Step 5: Run the focused test and verify it passes.**

Run: `node --test src/onboardingHome.test.ts`

### Task 2: Editable work-style extraction

**Files:**
- Modify: `src/components/OnboardingHome.tsx`
- Modify: `src/content/translations.ts`
- Modify: `src/onboardingState.ts`
- Modify: `src/onboardingHome.test.ts`

- [ ] **Step 1: Add translated extraction labels and an accessible editable Prompt label.**

```ts
extract: 'Extract work style', extractingTitle: 'Extracting your work style', editPrompt: 'Edit work-style Prompt'
```

- [ ] **Step 2: Add a local `styleStage`, `styleProgress`, and `promptDraft` in `OnboardingHome`; accept the edited Prompt in `confirmWorkStyle` and retain it in the session state.**

```ts
const [styleStage, setStyleStage] = useState<'extracting' | 'editing' | null>(null)
const [promptDraft, setPromptDraft] = useState(copy.style.prompt)
confirmWorkStyle(state, promptDraft)
```

- [ ] **Step 3: Render extraction progress followed by an editable textarea preview; route the existing confirmation through the edited draft.**

```tsx
<textarea aria-label={copy.style.promptLabel} onChange={(event) => setPromptDraft(event.target.value)} value={promptDraft} />
```

- [ ] **Step 4: Run full verification.**

Run: `npm test && npm run typecheck && npm run build && git diff --check`
