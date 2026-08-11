# Button Color Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ink black the single primary action color while applying the approved green, orange-yellow, and red status roles consistently without changing source-identity colors.

**Architecture:** Keep this as a CSS-token and selector migration. HeroUI default accent already uses Friday ink, so modify only explicit per-page overrides. Centralize status roles in `:root`; Home consumes them directly, while source colors remain narrowly scoped to source marks.

**Tech Stack:** React 19, TypeScript, HeroUI, CSS custom properties, Node test runner, Vite.

## Global Constraints

- Primary action fill is `#242422` with surface text; do not introduce a second brand accent.
- Functional bases are success `#1B9876`, pending `#FFA946`, danger `#D84E52`; the solid destructive action uses accessible danger text `#B24548`.
- On dark onboarding artwork, primary means a warm inverse fill and secondary means a transparent warm outline.
- DingTalk `#82957D`, Feishu `#839EB3`, and Teams `#9990A8` remain source identifiers only.
- Exclude images and SVG-internal colors. Do not alter interaction logic, translations, or unrelated dirty-worktree files.

---

### Task 1: Centralize functional status roles

**Files:**
- Modify: `src/index.css:5-70, 365-455, 1000-1020, 1254-1263`
- Modify: `src/homeComponents.test.ts:36-55`

**Interfaces:**
- Consumes: `--status-{success,pending,danger}-{foreground,text,background,border}`.
- Produces: the same shared properties for every page; Home no longer owns duplicate `--home-status-*` values.

- [ ] **Step 1: Write a failing static palette contract**

```ts
assert.match(css, /--color-friday-success: #1b9876;/)
assert.match(css, /--color-friday-pending: #ffa946;/)
assert.match(css, /--color-friday-danger: #d84e52;/)
assert.match(css, /--status-danger-text: #b24548;/)
assert.match(css, /\\.home-source-dingtalk \\{ background: #82957d; \\}/)
assert.doesNotMatch(css, /--home-status-success-foreground/)
```

- [ ] **Step 2: Run the focused test**

Run: `node --test src/homeComponents.test.ts`

Expected: FAIL because root values are legacy and Home owns duplicate local status properties.

- [ ] **Step 3: Apply exact role values and remove Home duplication**

```css
--status-success-foreground: #1b9876;
--status-success-text: #1e785e;
--status-success-background: #e4f2ed;
--status-success-border: #bfe1d7;
--status-pending-foreground: #ffa946;
--status-pending-text: #8f6534;
--status-pending-background: #fff4e7;
--status-pending-border: #ffe6ca;
--status-danger-foreground: #d84e52;
--status-danger-text: #b24548;
--status-danger-background: #fae9e8;
--status-danger-border: #f4cdcd;
```

Delete `--home-status-*` declarations and their Home-only override rules. Point Home chart, legend, row status, and detail borders to the shared `--status-*` values. Keep the three `.home-source-*` rules unchanged.

- [ ] **Step 4: Reuse the roles only in existing status UI**

```css
.memory-task-processing { background: var(--status-pending-background); color: var(--status-pending-text); }
.memory-task-completed { background: var(--status-success-background); color: var(--status-success-text); }
.memory-task-failed { background: var(--status-danger-background); color: var(--status-danger-text); }
.connection-status-connected { color: var(--status-success-text); }
.connection-status-connected::before { background: var(--status-success-foreground); }
```

Use `--status-danger-text` for small danger/error text. Do not restyle visual artwork.

- [ ] **Step 5: Verify and commit**

Run: `node --test src/homeComponents.test.ts`

```bash
git add src/index.css src/homeComponents.test.ts
git commit -m "style: centralize functional status palette"
```

### Task 2: Normalize primary, secondary, inverse, and destructive buttons

**Files:**
- Modify: `src/index.css:40-70, 186-198, 399-440, 504-530, 576-592, 663-675, 1070-1100, 1254-1263`
- Modify: `src/homeComponents.test.ts:36-55`

**Interfaces:**
- Consumes: Friday ink, Friday surface, and `--status-danger-text` from Task 1.
- Produces: `--button-primary-*` and `--button-inverse-*` properties, reused by explicit primary buttons.

- [ ] **Step 1: Add a failing button-hierarchy contract**

```ts
assert.match(css, /--button-primary-background: var\\(--color-friday-ink\\);/)
assert.match(css, /\\.home-mode-trigger \\{[\\s\\S]*?background: var\\(--button-primary-background\\);/)
assert.match(css, /\\.settings-button-danger \\{ background: var\\(--status-danger-text\\); color: var\\(--color-friday-surface\\); \\}/)
assert.match(css, /\\.onboarding-connect-content \\.onboarding-section-footer \\.onboarding-continue-action \\{[\\s\\S]*?background: var\\(--button-inverse-background\\);/)
```

- [ ] **Step 2: Run the focused test**

Run: `node --test src/homeComponents.test.ts`

Expected: FAIL because explicit button selectors contain deep gray, teal, and bright-red fills.

- [ ] **Step 3: Add button properties and migrate light-surface primary buttons**

```css
--button-primary-background: var(--color-friday-ink);
--button-primary-foreground: var(--color-friday-surface);
--button-primary-hover-background: #131312;
--button-inverse-background: #f3eadc;
--button-inverse-foreground: var(--color-friday-ink);
```

Apply the primary properties to `.primary-action`, `.home-mode-trigger`, `.empty-action`, `.modal-confirm`, `.memory-add-button`, `.memory-button-primary`, `.settings-button-dark`, and light onboarding confirmation buttons. Leave navigation, selects, chips, filters, and icon controls neutral.

- [ ] **Step 4: Repair dark-onboarding action hierarchy**

```css
.onboarding-connect-button { border-color: var(--color-friday-ink); background: transparent; color: var(--color-friday-ink); }
.onboarding-connect-content .onboarding-connect-button { border-color: rgb(255 248 237 / 48%); background: transparent; color: #fff9ef; }
.onboarding-connect-content .onboarding-section-footer .onboarding-continue-action,
.onboarding-editorial-content .onboarding-memory-actions .button:not(.button--secondary),
.onboarding-editorial-content .onboarding-style-actions .button:not(.button--secondary),
.onboarding-editorial-content .onboarding-trial-submit { background: var(--button-inverse-background); color: var(--button-inverse-foreground); }
```

Keep dark secondary actions as transparent warm outlines. Keep step navigation, suggestion chips, status text, and images unchanged.

- [ ] **Step 5: Keep danger semantic, not generic**

```css
.settings-button-danger { background: var(--status-danger-text); color: var(--color-friday-surface); }
.settings-text-danger { color: var(--status-danger-text); }
```

`SettingsConfirmation` already selects its destructive class; do not change component logic.

- [ ] **Step 6: Verify and commit**

Run: `node --test src/homeComponents.test.ts`

```bash
git add src/index.css src/homeComponents.test.ts
git commit -m "style: unify button hierarchy with ink primary"
```

### Task 3: Verify visual and build contracts

**Files:** No source changes expected.

- [ ] **Step 1: Run code checks**

```bash
npm test
npm run typecheck
npm run build
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 2: Inspect the local UI**

Inspect seeded Home chart/status rows, Settings save and disconnect confirmation, Memory add dialog, and dark onboarding steps 1, 2, and 4. Confirm light-surface primary actions are black, dark-artwork primary actions are inverse, and source marks retain their three source colors.

- [ ] **Step 3: Commit only a verification fix, if one is needed**

```bash
git add src/index.css src/homeComponents.test.ts
git commit -m "fix: address button hierarchy verification"
```

Do not create an empty commit.
