# Agent CLI Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the current frontend-only four-step Onboarding flow where a user must locally download and connect exactly one CLI Agent before continuing, and can cancel that connection from the first step before choosing another downloaded Agent.

**Architecture:** Extend the existing pure `onboardingState` with three Agent statuses and one selected Agent. `OnboardingAgentSetup` owns only temporary confirmation, progress, and Pi-provider UI; it calls pure state transitions supplied by `OnboardingHome`. No Agent data enters Settings, localStorage, a backend, or a native CLI bridge.

**Tech Stack:** React 19, TypeScript, HeroUI, Vite, Node built-in test runner, existing CSS in `src/index.css`.

## Global Constraints

- Do not add dependencies.
- P0 Agent ids are exactly `codex`, `claude`, and `pi`.
- A fresh `createOnboardingState()` always returns all three Agent statuses as `not-downloaded` and `selectedAgent` as `null`.
- Persistent statuses are exactly `not-downloaded`, `downloaded`, and `connected`; confirmation dialogs, spinners, connection indicators, and Pi-provider choice are component-local state.
- Downloading does not connect an Agent. A user must separately choose one downloaded Agent.
- Only one Agent may be `connected`. Downloads remain allowed after connection, but every other downloaded Agent’s choose button is disabled until the current connection is cancelled.
- The connected row shows `取消连接`. Confirmation changes only that Agent from `connected` to `downloaded`, clears the local selection, resets Onboarding to step 1, and preserves source, Memory, Message, and work-style data.
- The step-1 `确认并继续` button and the pure state transition both require `selectedAgent` to have `connected` status. A visual disabled button alone is insufficient.
- A disabled choose button must explain the lock on mouse hover and keyboard focus. Attach the message to a focusable wrapper, because a disabled button itself cannot receive focus.
- This is a frontend interaction demo. Do not claim a CLI was scanned, installed, logged in, authorized, configured, health-checked, or given execution access. Do not show API-key or model-parameter fields.
- Agent state remains in the existing React session state. Do not modify `settingsState.ts`, Settings components, localStorage, or a network service.
- Existing source, Memory, work-style, celebration, and Message behaviors shift only from steps 1–3 to steps 2–4.
- Before every task commit, stage only that task’s files, run `git diff --cached --check`, and leave unrelated changes untouched.

## File Structure

- Create: `src/components/OnboardingAgentSetup.tsx` — compact rows, local confirmation/progress states, Pi-provider selector, locked-choice message, cancel confirmation, and step-1 continuation.
- Create: `src/onboardingAgentSetup.test.ts` — SSR coverage for initial, connected, and locked Agent rows.
- Modify: `src/onboardingState.ts` — Agent state, download/connect/cancel transitions, four-step gate.
- Modify: `src/onboardingState.test.ts` — initial, exclusivity, cancellation, and shifted progression tests.
- Modify: `src/content/translations.ts` — four-step Chinese/English copy plus all Agent labels and messages.
- Modify: `src/translations.test.ts` — four-step and no-API-key copy coverage.
- Modify: `src/components/OnboardingHome.tsx` — Agent-first panel and shifted existing panels.
- Modify: `src/onboardingHome.test.ts` — four-step layout and Agent-gated source panel assertions.
- Modify: `src/index.css` — four-column progress and compact Agent-row states using existing modal/button tokens.

---

### Task 1: Add the pure Agent selection and cancellation state

**Files:**
- Modify: `src/onboardingState.ts`
- Modify: `src/onboardingState.test.ts`

**Interfaces:**
- Produces: `AgentId`, `AgentStatus`, `agentIds`, `downloadAgent(state, agent)`, `connectAgent(state, agent)`, `cancelAgentConnection(state)`, `continueToSources(state)`, and `OnboardingStep = 1 | 2 | 3 | 4`.
- Consumes: no browser, backend, CLI, storage, or timer API.

- [ ] **Step 1: Write failing state tests**

```ts
test('a new frontend session starts with no downloaded or connected Agent', () => {
  const state = onboarding.createOnboardingState()

  assert.deepEqual(state.agentStatuses, {
    codex: 'not-downloaded', claude: 'not-downloaded', pi: 'not-downloaded',
  })
  assert.equal(state.selectedAgent, null)
  assert.equal(onboarding.continueToSources(state).step, 1)
})

test('a downloaded Agent connects alone and opens the source step', () => {
  const downloaded = onboarding.downloadAgent(onboarding.createOnboardingState(), 'codex')
  const connected = onboarding.connectAgent(downloaded, 'codex')

  assert.equal(connected.agentStatuses.codex, 'connected')
  assert.equal(connected.selectedAgent, 'codex')
  assert.equal(onboarding.continueToSources(connected).step, 2)
})

test('cancelling returns the current Agent to downloaded without deleting prepared data', () => {
  const connected = onboarding.connectAgent(onboarding.downloadAgent(onboarding.createOnboardingState(), 'codex'), 'codex')
  const cancelled = onboarding.cancelAgentConnection({
    ...connected,
    step: 2,
    maxReached: 2,
    connectedSources: ['dingtalk'],
    memorySources: ['dingtalk'],
    memoryConfirmed: true,
    workStyleConfirmed: true,
    workStylePrompt: '先确认事实。',
  })

  assert.equal(cancelled.agentStatuses.codex, 'downloaded')
  assert.equal(cancelled.selectedAgent, null)
  assert.equal(cancelled.step, 1)
  assert.equal(cancelled.maxReached, 1)
  assert.equal(onboarding.continueToSources(cancelled).step, 1)
  assert.deepEqual(cancelled.memorySources, ['dingtalk'])
  assert.equal(cancelled.workStylePrompt, '先确认事实。')
})
```

- [ ] **Step 2: Run the state test to verify it fails**

Run: `node --test src/onboardingState.test.ts`

Expected: FAIL because the current state has three steps and no Agent transitions.

- [ ] **Step 3: Add the minimal state transitions**

```ts
export const agentIds = ['codex', 'claude', 'pi'] as const
export type AgentId = typeof agentIds[number]
export type AgentStatus = 'not-downloaded' | 'downloaded' | 'connected'
export type OnboardingStep = 1 | 2 | 3 | 4

export const connectAgent = (state: OnboardingState, agent: AgentId): OnboardingState => (
  state.selectedAgent || state.agentStatuses[agent] !== 'downloaded'
    ? state
    : { ...state, selectedAgent: agent, agentStatuses: { ...state.agentStatuses, [agent]: 'connected' } }
)

export const cancelAgentConnection = (state: OnboardingState): OnboardingState => {
  const agent = state.selectedAgent
  return !agent || state.agentStatuses[agent] !== 'connected'
    ? state
    : { ...state, step: 1, maxReached: 1, completed: false, selectedAgent: null, agentStatuses: { ...state.agentStatuses, [agent]: 'downloaded' } }
}
```

Add `agentStatuses` and `selectedAgent` to `OnboardingState` and the fixed initial values to `createOnboardingState`. Add `downloadAgent` only for `not-downloaded` → `downloaded`. Make `continueToSources` move from step 1 to step 2 only if the selected Agent has status `connected`; move source continuation to 2 → 3, Memory continuation to 3 → 4, and require step 4 in `confirmWorkStyle`. Preserve source, Memory, and work-style fields through cancellation while intentionally clearing the local `completed` flag.

- [ ] **Step 4: Add exclusivity coverage and run the state test**

```ts
test('a second downloaded Agent cannot connect until the current connection is cancelled', () => {
  const downloaded = onboarding.downloadAgent(
    onboarding.downloadAgent(onboarding.createOnboardingState(), 'codex'),
    'claude',
  )
  const codex = onboarding.connectAgent(downloaded, 'codex')
  const cancelled = onboarding.cancelAgentConnection(codex)

  assert.deepEqual(onboarding.connectAgent(codex, 'claude'), codex)
  assert.equal(onboarding.connectAgent(cancelled, 'claude').selectedAgent, 'claude')
})
```

Run: `node --test src/onboardingState.test.ts`

Expected: PASS, including the existing Memory-scope tests updated to begin with a connected Agent and `continueToSources`.

- [ ] **Step 5: Commit the state machine**

```bash
git add src/onboardingState.ts src/onboardingState.test.ts
git diff --cached --check
git commit -m "feat: add local agent selection state"
```

### Task 2: Add complete bilingual Agent-first copy

**Files:**
- Modify: `src/content/translations.ts`
- Modify: `src/translations.test.ts`

**Interfaces:**
- Consumes: `AgentId` and `AgentStatus` from Task 1 as type-only imports.
- Produces: four-item `OnboardingCopy.steps` and an `onboarding.agent` copy group in both locales.

- [ ] **Step 1: Write failing translation tests**

```ts
test('onboarding copy starts with Agent selection and includes cancellation guidance', () => {
  for (const locale of ['zh', 'en'] as const) {
    const onboarding = translations[locale].workspace.onboarding
    assert.equal(onboarding.steps.length, 4)
    assert.ok(onboarding.agent.actions.cancelConnection)
    assert.ok(onboarding.agent.blockedChoose('Codex CLI', 'Claude Code'))
  }
})

test('Agent copy has no API-key setup', () => {
  for (const locale of ['zh', 'en'] as const) {
    assert.equal('apiKey' in translations[locale].workspace.onboarding.agent, false)
  }
})
```

- [ ] **Step 2: Run the translation test to verify it fails**

Run: `node --test src/translations.test.ts`

Expected: FAIL because current onboarding copy has three steps and no Agent copy group.

- [ ] **Step 3: Add the typed copy contract and both locales**

```ts
agent: {
  title: string
  subtitle: string
  names: Record<AgentId, string>
  status: Record<AgentStatus, string>
  actions: { download: string; choose: string; cancelConnection: string; continue: string; cancel: string }
  download: { title: (name: string) => string; body: (name: string) => string; confirm: string; progress: (value: number) => string }
  cancellation: { title: (name: string) => string; body: (name: string) => string; confirm: string }
  blockedChoose: (connected: string, target: string) => string
  piProviders: { chatgpt: string; claude: string; githubCopilot: string }
  localOnly: string
}
```

Change `OnboardingCopy.steps` to a four-item tuple, welcome copy to four steps, and `stepKicker` to step 1–4 language. Add compact local-demo text that explicitly avoids claims of actual CLI scanning, installation, login, or authorization. The Chinese blocked message must say the user needs to cancel the named connected Agent before selecting the target Agent. Do not add Settings Agent copy, API-key fields, model parameters, or real-installation success copy.

- [ ] **Step 4: Run the translation test to verify it passes**

Run: `node --test src/translations.test.ts`

Expected: PASS with four-step Chinese and English copy and no API-key copy.

- [ ] **Step 5: Commit the copy contract**

```bash
git add src/content/translations.ts src/translations.test.ts
git diff --cached --check
git commit -m "feat: add agent onboarding copy"
```

### Task 3: Build the compact Agent setup and cancellation UI

**Files:**
- Create: `src/components/OnboardingAgentSetup.tsx`
- Create: `src/onboardingAgentSetup.test.ts`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: Task 1’s `OnboardingState`, Agent types/transitions, and Task 2’s copy.
- Produces: `OnboardingAgentSetup` with `onDownload(agent)`, `onConnect(agent)`, `onCancelConnection()`, and `onContinue()` callbacks.

- [ ] **Step 1: Write failing row-state rendering tests**

```ts
test('all Agent rows initially show a download action', async () => {
  const html = renderToStaticMarkup(createElement(OnboardingAgentSetup, {
    locale: 'zh', state: onboarding.createOnboardingState(), onDownload: () => {}, onConnect: () => {}, onCancelConnection: () => {}, onContinue: () => {},
  }))

  assert.match(html, /Codex CLI[\s\S]*未下载[\s\S]*下载/)
  assert.match(html, /Claude Code[\s\S]*未下载[\s\S]*下载/)
  assert.match(html, /Pi[\s\S]*未下载[\s\S]*下载/)
})

test('a connected Agent offers cancellation while another downloaded Agent is explained as locked', async () => {
  const state = onboarding.downloadAgent(onboarding.downloadAgent(onboarding.createOnboardingState(), 'codex'), 'claude')
  const html = renderToStaticMarkup(createElement(OnboardingAgentSetup, {
    locale: 'zh', state: onboarding.connectAgent(state, 'codex'), onDownload: () => {}, onConnect: () => {}, onCancelConnection: () => {}, onContinue: () => {},
  }))

  assert.match(html, /Codex CLI[\s\S]*已连接[\s\S]*取消连接/)
  assert.match(html, /Claude Code[\s\S]*选择/)
  assert.match(html, /请先取消已连接的 Codex CLI，才能选择 Claude Code/)
})
```

- [ ] **Step 2: Run the component test to verify it fails**

Run: `node --test src/onboardingAgentSetup.test.ts`

Expected: FAIL because `OnboardingAgentSetup.tsx` does not exist.

- [ ] **Step 3: Implement rows, local operations, and cancellation confirmation**

```tsx
export type OnboardingAgentSetupProps = {
  locale: Locale
  state: Pick<OnboardingState, 'agentStatuses' | 'selectedAgent'>
  onDownload: (agent: AgentId) => void
  onConnect: (agent: AgentId) => void
  onCancelConnection: () => void
  onContinue: () => void
}
```

Map the three `agentIds` into one compact `.onboarding-agent-row` each: tool/status at left and one current action at right. `not-downloaded` opens a confirmation dialog, then shows short local `0–100%` progress and calls `onDownload`; it never auto-connects. `downloaded` calls `onConnect` after the short local connection indicator; Pi first opens its three provider choices and then calls `onConnect('pi')`. The selected `connected` row opens the cancellation confirmation dialog; confirm calls `onCancelConnection`, cancel only closes the dialog. A different downloaded row renders a disabled choose button inside a focusable wrapper with `title` and `aria-describedby` using `blockedChoose`. The footer calls `onContinue` and is disabled unless `selectedAgent` has `connected` status. Keep `localOnly` visible and use `aria-live="polite"` for progress.

- [ ] **Step 4: Add the smallest matching CSS and run the component test**

Run: `node --test src/onboardingAgentSetup.test.ts`

Expected: PASS. Reuse `.onboarding-source-row`, `.onboarding-modal-backdrop`, `.onboarding-modal-dialog`, and existing button tokens. Add only Agent-row alignment, status/progress, provider choice, focusable locked-action tooltip, disabled action, cancel action, and mobile-wrap rules. Change `.onboarding-steps` from three to four equal columns so four steps remain in its existing top row.

- [ ] **Step 5: Commit the Agent setup component**

```bash
git add src/components/OnboardingAgentSetup.tsx src/onboardingAgentSetup.test.ts src/index.css
git diff --cached --check
git commit -m "feat: add local agent setup"
```

### Task 4: Put Agent selection before the existing onboarding panels

**Files:**
- Modify: `src/components/OnboardingHome.tsx`
- Modify: `src/onboardingHome.test.ts`

**Interfaces:**
- Consumes: Task 1 transitions, Task 2 copy, and Task 3 component.
- Produces: Agent setup at step 1, source connection at step 2, Memory at step 3, and work style/celebration at step 4.

- [ ] **Step 1: Write failing shell tests**

```ts
test('onboarding starts with Agent selection before the existing three steps', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {}, onOpenMemory: () => {} }))

  assert.match(html, /1.*选择 Agent[\s\S]*2.*连接工作来源[\s\S]*3.*建立工作记忆[\s\S]*4.*确认工作风格/)
  assert.match(html, /Codex CLI[\s\S]*Claude Code[\s\S]*Pi/)
})

test('source connection appears only after the Agent state reaches step 2', async () => {
  const agent = onboarding.connectAgent(onboarding.downloadAgent(onboarding.createOnboardingState(), 'codex'), 'codex')
  const state = onboarding.continueToSources(agent)
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { initialState: state, locale: 'zh', onComplete: () => {}, onOpenMemory: () => {}, welcomeOpen: false }))

  assert.match(html, /连接你的工作应用/)
  assert.doesNotMatch(html, /onboarding-agent-row/)
})
```

- [ ] **Step 2: Run the shell test to verify it fails**

Run: `node --test src/onboardingHome.test.ts`

Expected: FAIL because current onboarding renders source connection at step 1 and has three progress entries.

- [ ] **Step 3: Shift panels and wire cancellation**

```tsx
{state.step === 1 && <OnboardingAgentSetup
  locale={locale}
  state={state}
  onDownload={(agent) => update(downloadAgent(state, agent))}
  onConnect={(agent) => update(connectAgent(state, agent))}
  onCancelConnection={() => update(cancelAgentConnection(state))}
  onContinue={() => update(continueToSources(state))}
/>}
```

Import `OnboardingStep`, `OnboardingAgentSetup`, and the four Agent state transitions. Change the existing work-source branch guard from `state.step === 1` to `state.step === 2`, its `copy.stepKicker(1)` call to `copy.stepKicker(2)`, and keep its existing `continueToMemory(state)` footer callback. Change the existing Memory branch guard and kicker from `2` to `3`; change the existing work-style branch guard and kicker from `3` to `4`. Change the progress cast from `1 | 2 | 3` to `OnboardingStep`. Update every existing test setup that previously began with `connectSource(createOnboardingState(), ...)` so it first connects Codex and calls `continueToSources`. Keep Message as the final target and retain the existing celebration duration.

- [ ] **Step 4: Run shifted-flow tests**

Run: `node --test src/onboardingHome.test.ts src/onboardingState.test.ts`

Expected: PASS with four steps, no source panel before a connected Agent, and the existing final celebration on step 4.

- [ ] **Step 5: Commit the integrated flow**

```bash
git add src/components/OnboardingHome.tsx src/onboardingHome.test.ts
git diff --cached --check
git commit -m "feat: add agent-first onboarding flow"
```

### Task 5: Verify the frontend-only release

**Files:**
- Modify only files that a failing verification proves need correction.

**Interfaces:**
- Consumes: completed local Agent state, copy, component, onboarding shell, and CSS.
- Produces: a verified interaction flow that makes no real CLI-control claim.

- [ ] **Step 1: Run focused tests**

Run: `node --test src/onboardingState.test.ts src/onboardingAgentSetup.test.ts src/onboardingHome.test.ts src/translations.test.ts`

Expected: PASS.

- [ ] **Step 2: Run the full unit test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run static and production checks**

Run: `npm run typecheck && npm run build && git diff --check`

Expected: TypeScript has no errors, Vite emits a build, and Git finds no whitespace errors.

- [ ] **Step 4: Perform the browser acceptance pass**

Use the frontend to verify: a fresh session shows all three Agents as not downloaded; download requires confirmation and ends at downloaded; one chosen Codex or Claude becomes connected; Pi requires one provider choice; other downloaded Agent choose buttons lock with hover and keyboard-focus guidance; cancellation requires confirmation, restores the connected Agent to downloaded, returns to step 1, and locks step 2; no API-key field, real-installation claim, real-login claim, or terminal output appears.

- [ ] **Step 5: Handle a verification failure at its owning task**

If a state test fails, correct Task 1 and rerun its focused test. If copy or row rendering fails, correct Task 2 or Task 3 and rerun its focused test. If flow rendering fails, correct Task 4 and rerun its focused test. After any correction, rerun Steps 1–3 of this task; do not create an empty verification-only commit.
