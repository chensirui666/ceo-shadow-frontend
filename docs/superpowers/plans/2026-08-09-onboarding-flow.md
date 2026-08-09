# Friday Onboarding Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the confirmed four-step Home onboarding flow for every demo account except `sirui.chen@stardust.ai`, while retaining the existing Home experience after formal activation.

**Architecture:** Keep onboarding as a small, pure in-memory state model plus one Home-only UI component. `Workspace` decides whether an account enters onboarding, owns its temporary onboarding state so a Memory visit can return to the same step, and owns the session-scoped Home service; onboarding completion replaces the empty initial Home with the existing fixture-backed Home and optionally adds the Trial event. No connector auth, Memory ingestion, external read, or external send is performed by this frontend mock.

**Tech Stack:** React 19, TypeScript, HeroUI React, Vite SSR tests via Node's built-in test runner, CSS in `src/index.css`.

## Global Constraints

- `sirui.chen@stardust.ai` skips onboarding; any other email begins onboarding on every mock login.
- Only `trial` and `active` modes exist. Trial never sends externally; real active-mode gates remain a backend responsibility.
- Onboarding lives at the top of Home; before activation its lower 24-hour timeline is empty.
- DingTalk, Feishu, and Teams are mock connection choices. Every data action and notification must say it is simulated locally.
- Step 1 requires at least one connection; Step 2 confirms read scopes before building Memory; Step 3 previews only the distilled work-style summary/Prompt; Step 4 can be skipped when formally activating.
- A Trial answer is session-local, has a visible Trial marker, can be regenerated from the current adjustment only, and does not overwrite the long-term work style.
- After explicit formal activation, show a brief completion state then an optional contact-notification modal. A close skips notification; a notify action is simulated only.

---

### Task 1: Model account-specific onboarding and two operating modes

**Files:**
- Create: `src/onboardingState.ts`
- Create: `src/onboardingState.test.ts`
- Modify: `src/homeState.ts`
- Modify: `src/homeState.test.ts`

**Interfaces:**
- Produces `needsOnboarding(email: string): boolean`, `createOnboardingState()`, `connectSource(state, source)`, `confirmMemory(state)`, `confirmWorkStyle(state)`, `recordTrial(state, question)`, `regenerateTrial(state, adjustment)`, `completeOnboarding(state)`, and `createTrialEvent(state, now)`.
- `createTrialEvent` returns `HomeEvent | null`; `Workspace` consumes it when creating the active Home snapshot.
- `OperatingMode` becomes `'trial' | 'active'`; `setOperatingMode` accepts only that union.

- [x] **Step 1: Write the failing state tests**

```ts
test('only the seeded account skips onboarding', () => {
  assert.equal(needsOnboarding('sirui.chen@stardust.ai'), false)
  assert.equal(needsOnboarding('new.person@stardust.ai'), true)
})

test('a trial adjustment changes only the current trial reply', () => {
  const connected = connectSource(createOnboardingState(), 'dingtalk')
  const confirmedMemory = confirmMemory(connected)
  const confirmedStyle = confirmWorkStyle(confirmedMemory)
  const trial = regenerateTrial(recordTrial(confirmedStyle, '客户问：这个项目本周能交付吗？'), '语气更保守，先说明风险。')
  assert.match(trial.trial?.reply ?? '', /风险/)
  assert.equal(trial.workStyleConfirmed, true)
})
```

- [x] **Step 2: Run the new state tests and verify they fail because the module is missing**

Run: `node --test src/onboardingState.test.ts`

Expected: module-resolution failure for `./onboardingState.ts`.

- [x] **Step 3: Implement the minimal state transitions**

```ts
export type OnboardingState = {
  step: 1 | 2 | 3 | 4
  connectedSources: HomeSource[]
  memoryConfirmed: boolean
  workStyleConfirmed: boolean
  trial?: { question: string; reply: string }
}

export const connectSource = (state: OnboardingState, source: HomeSource): OnboardingState => ({
  ...state,
  connectedSources: state.connectedSources.includes(source) ? state.connectedSources : [...state.connectedSources, source],
})
```

Keep all functions immutable. Generate the Trial response from the question plus the latest adjustment; do not mutate any work-style field. Change the existing Home default fixture from `paused` support to the two-mode union and update the old mode test accordingly.

- [x] **Step 4: Run the focused state tests and then the full suite**

Run: `node --test src/onboardingState.test.ts src/homeState.test.ts && npm test`

Expected: all tests pass.

- [x] **Step 5: Commit the state layer**

```bash
git add src/onboardingState.ts src/onboardingState.test.ts src/homeState.ts src/homeState.test.ts
git commit -m "feat: add onboarding state model"
```

### Task 2: Render the four-step Home onboarding interaction

**Files:**
- Create: `src/components/OnboardingHome.tsx`
- Create: `src/onboardingHome.test.ts`
- Modify: `src/content/translations.ts`
- Modify: `src/index.css`

**Interfaces:**
- `OnboardingHome` accepts `{ initialState, locale, onComplete, onOpenMemory, onStateChange }`.
- `onComplete` receives `OnboardingState` after notification is sent or dismissed.
- `Workspace` retains `OnboardingState` only for the mounted login session; `onStateChange` makes a Memory visit return to the same step.
- `OnboardingHome` consumes `OnboardingState` transitions from Task 1 and never calls a connector, Memory, or outbound-message API.

- [x] **Step 1: Write failing SSR tests for the initial screen and the safe Trial language**

```ts
test('onboarding starts with four steps, three connection choices, and an empty Home timeline', async () => {
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {}, onOpenMemory: () => {} }))
  assert.match(html, /1.*连接应用/)
  assert.match(html, /钉钉/)
  assert.match(html, /飞书/)
  assert.match(html, /Teams/)
  assert.match(html, /暂无工作事件/)
})
```

- [x] **Step 2: Run the SSR test and verify it fails because the component is missing**

Run: `node --test src/onboardingHome.test.ts`

Expected: Vite cannot load `/src/components/OnboardingHome.tsx`.

- [x] **Step 3: Implement the component and translated copy**

Use a single component and do not create a multi-page router. It initializes from the parent-owned session state and reports every state transition through `onStateChange`. Implement:

```tsx
<ol className="onboarding-steps">{/* four visible step labels, state.step is active */}</ol>
<section className="onboarding-panel">{/* current step only */}</section>
<HomeActivityChart activity={activityHours([], new Date())} copy={copy.home} />
```

Step 1 has an in-place mock connection confirmation, keeps the person on the page, and enables continuation only with a source. Step 2 shows only connected source scopes and `查看 Memory`. Step 3 starts with a readable work-style summary and offers a read-only Prompt expansion. Step 4 has question chips that fill one composer, a Trial-only generated result, and a short adjustment input that regenerates that one reply. Offer formal activation without requiring a Trial result.

Use a CSS-only, reduced-motion-safe completion treatment. Then show an optional contact selector modal; `通知` and closing it both finish onboarding. The notification modal contains only selected contacts and the local-simulation disclosure, never a compose field or invented message copy.

- [x] **Step 4: Run the component test and full suite**

Run: `node --test src/onboardingHome.test.ts && npm test`

Expected: all tests pass.

- [x] **Step 5: Commit the onboarding UI**

```bash
git add src/components/OnboardingHome.tsx src/onboardingHome.test.ts src/content/translations.ts src/index.css
git commit -m "feat: add Home onboarding flow"
```

### Task 3: Integrate onboarding with the logged-in Home session

**Files:**
- Modify: `src/components/Workspace.tsx`
- Modify: `src/components/HomeWorkspace.tsx`
- Modify: `src/homeService.ts`
- Modify: `src/homeWorkspace.test.ts`
- Modify: `src/homeComponents.test.ts`

**Interfaces:**
- `HomeWorkspace` accepts an optional `service: HomeService`, defaulting to the existing global `homeService` for existing tests.
- `Workspace` creates one `HomeService` for its mounted session and passes it to `HomeWorkspace` after onboarding.
- `Workspace` retains `OnboardingState` while the user visits Memory, receives it on completion, calls `createTrialEvent`, prepends it when present, and creates the active fixture snapshot.

- [x] **Step 1: Write failing integration tests**

```ts
test('Workspace renders onboarding for a non-seeded account', async () => {
  const html = renderToStaticMarkup(createElement(Workspace, {
    locale: 'zh', onLocaleChange: () => {}, onSignOut: () => {}, session: { email: 'new.person@stardust.ai', route: 'home' },
  }))
  assert.match(html, /连接你的工作应用/)
})

test('Workspace keeps the seeded account on the normal Home', async () => {
  const html = renderToStaticMarkup(createElement(Workspace, {
    locale: 'zh', onLocaleChange: () => {}, onSignOut: () => {}, session: { email: 'sirui.chen@stardust.ai', route: 'home' },
  }))
  assert.doesNotMatch(html, /连接你的工作应用/)
})
```

- [x] **Step 2: Run the integration tests and verify they fail because Workspace always renders normal Home**

Run: `node --test src/homeWorkspace.test.ts src/homeComponents.test.ts`

Expected: the non-seeded-account assertion fails.

- [x] **Step 3: Implement session-scoped service integration**

```tsx
const service = useRef(createHomeService(createDemoHomeSnapshot()))
const [onboarding, setOnboarding] = useState(() => needsOnboarding(session.email))

{onboarding
  ? <OnboardingHome locale={locale} onOpenMemory={() => goTo('memory')} onComplete={finishOnboarding} />
  : <HomeWorkspace locale={locale} onOpenSettings={openSettings} service={service.current} />}
```

`finishOnboarding` must replace the session service with an active snapshot and optionally prepend the Trial event. Do not write onboarding completion to localStorage. Adapt the Home mode control to the two-mode model without changing its existing event behavior.

- [x] **Step 4: Run focused integration tests and all static checks**

Run: `npm test && npm run typecheck && npm run build && git diff --check`

Expected: all commands exit 0.

- [x] **Step 5: Commit the integration**

```bash
git add src/components/Workspace.tsx src/components/HomeWorkspace.tsx src/homeService.ts src/homeWorkspace.test.ts src/homeComponents.test.ts
git commit -m "feat: show onboarding before Home"
```

### Task 4: Perform browser-level acceptance checks

**Files:**
- Modify: none unless a verified visual defect needs a minimal fix

**Interfaces:**
- Uses the completed app from Tasks 1-3.

- [x] **Step 1: Start the Vite app**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite reports its local URL.

- [ ] **Step 2: Verify the non-seeded account journey**

Use the browser to log in as `new.person@stardust.ai` with mock code `123456`, connect one app, confirm Memory, confirm style, generate and adjust a Trial answer, activate formally, and close the optional contact dialog. Confirm that the Home event has a `Trial` marker.

- [ ] **Step 3: Verify the seeded account exception**

Sign out and log in as `sirui.chen@stardust.ai` with code `123456`. Confirm Home appears without the onboarding panel.

- [x] **Step 4: Run final checks**

Run: `npm test && npm run typecheck && npm run build && git diff --check && git status --short`

Expected: tests, typecheck, build, and diff check exit 0; status contains only the approved onboarding files.

- [ ] **Step 5: Commit only a verified visual correction, if one was needed**

```bash
git add <only-the-verified-correction-files>
git commit -m "fix: refine onboarding presentation"
```

If no correction is needed, do not create an empty commit.
