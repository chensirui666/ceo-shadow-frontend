# Onboarding Editorial Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved Friday editorial visual system to onboarding Steps 2–4 while preserving all existing local-demo behavior.

**Architecture:** Keep `OnboardingHome.tsx` as the sole onboarding state coordinator. Add three raster assets under `src/assets/`, render each as a decorative background in its matching step, and use scoped CSS modifiers for the shared content-over-art layout. No state, translated copy, service, modal, or API contract changes.

**Tech Stack:** React 19, TypeScript, Vite, HeroUI React, CSS, Node test runner, built-in image generation.

## Global Constraints

- Existing Step 1 changes remain intact.
- Keep the desktop onboarding panel at 468px and preserve narrow-screen scrolling.
- Do not alter connection, Memory construction, Prompt, Trial, activation, Home-event, or local-demo behavior.
- Generated images contain no text, user data, success claims, people, avatars, or watermarks.
- Use espresso, ivory, caramel, amber, and muted petrol teal; no purple interface accent.
- Trial remains private and session-local.

---

### Task 1: Create the three project-local editorial visuals

**Files:**
- Create: `src/assets/onboarding-memory-editorial.png`
- Create: `src/assets/onboarding-work-style-editorial.png`
- Create: `src/assets/onboarding-trial-editorial.png`

**Interfaces:**
- Each PNG is imported only by `src/components/OnboardingHome.tsx`.
- Each rendered `<img>` uses empty alt text because it is decorative.

- [ ] **Step 1: Generate and inspect the Memory visual**

Use the Friday Editorial Feature Visuals template. Generate a text-free, 2:1 horizontal image with dark readable negative space on the left and a right-side ivory collection surface holding abstract message, calendar, and document signals. It must not imply real content was read.

- [ ] **Step 2: Generate and inspect the work-style visual**

Use the same template. Generate a text-free, 2:1 horizontal image with dark left negative space and a right-side structured summary/Prompt card. It must not show a person, a specific work style, or readable source text.

- [ ] **Step 3: Generate and inspect the Trial visual**

Use the same template. Generate a text-free, 2:1 horizontal image with dark left negative space and a right-side private draft surface with a subtle lock cue. It must not depict a sent message, a recipient, or a response.

- [ ] **Step 4: Copy final outputs into the project and validate them**

Run:

```bash
file src/assets/onboarding-memory-editorial.png src/assets/onboarding-work-style-editorial.png src/assets/onboarding-trial-editorial.png
```

Expected: all three paths report `PNG image data`.

### Task 2: Render decorative visuals for Steps 2–4

**Files:**
- Modify: `src/components/OnboardingHome.tsx`
- Modify: `src/onboardingHome.test.ts`

**Interfaces:**
- `OnboardingHome` continues to own `state`, `memoryStage`, `promptOpen`, `question`, and `activation` unchanged.
- Each step body gains only a step-specific layout class, content wrapper, and `aria-hidden` artwork aside.

- [ ] **Step 1: Extend the SSR coverage**

Add one test that renders a reachable Step 2, 3, and 4 state and asserts the HTML contains `onboarding-memory-editorial`, `onboarding-work-style-editorial`, and `onboarding-trial-editorial`.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
node --test src/onboardingHome.test.ts
```

Expected: the new asset assertions fail before markup is added.

- [ ] **Step 3: Add the smallest matching markup**

Import the three PNGs. For each of Steps 2–4, wrap existing real controls in `.onboarding-editorial-content`, add `.onboarding-editorial-layout` plus a step modifier to the outer section, then add `<aside aria-hidden="true" className="onboarding-editorial-artwork"><img alt="" src={...} /></aside>`. Do not move controls into the image or change any handler.

- [ ] **Step 4: Run the focused test**

Run:

```bash
node --test src/onboardingHome.test.ts
```

Expected: the new decorative-asset test and existing interaction assertions pass.

### Task 3: Apply scoped editorial layout rules and verify

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- `.onboarding-editorial-layout` shares the full-width image, left content, dark overlay, typography, source-card, and action styles.
- `.onboarding-memory-layout`, `.onboarding-work-style-layout`, and `.onboarding-trial-layout` are selectors only; no behavior changes.

- [ ] **Step 1: Add the shared content-over-art layout**

Use an absolute, full-panel decorative artwork layer with a left-to-right dark overlay. Put semantic content above it at `width: min(54%, 580px)` and set its headings, helper copy, rules, inputs, and actions to maintain WCAG-readable contrast. Keep the selector scope beneath `.onboarding-editorial-layout`.

- [ ] **Step 2: Add narrow-screen readability rules**

At the existing 720px breakpoint, set the editorial content width to 100% and replace the directional overlay with a uniform dark overlay. Retain the current panel frame and scrolling behavior.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm test && npm run typecheck && npm run build && git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 4: Perform visual acceptance checks**

At desktop and 390px widths, navigate to each completed step. Confirm headings, body copy, inputs, and buttons remain visible; modal behavior is unchanged; and Steps 2–4 retain the same panel size as Step 1.
