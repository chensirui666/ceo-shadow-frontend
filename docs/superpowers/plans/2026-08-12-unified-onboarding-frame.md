# Unified Four-Step Onboarding Frame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Rebuild the existing four-step local-demo onboarding into one visually stable, bilingual desktop frame with shared lower cards and an embedded Trial send action.

**Architecture:** Keep OnboardingHome as the only onboarding state owner and keep every existing transition function in onboardingState.ts. Add the fixed frame, checklist, and support cards as local presentational markup in OnboardingHome; use one support copy object in translations.ts. Replace onboarding-specific raw color values with variables derived exclusively from existing Friday tokens in index.css.

**Tech Stack:** React 19, TypeScript, HeroUI, Lucide, CSS, Vite SSR tests, Node test runner.

## Global Constraints

- Keep the welcome dialog, local/session behavior, all current onboarding transitions, modal flows, and reduced-motion activation behavior.
- This is a local frontend demo: do not add OAuth, API calls, storage, real content ingestion, or real colleague sending.
- Keep Chinese and English copy in src/content/translations.ts; do not hard-code visible language in components.
- At desktop width all four steps use one hero-card height, padding, content/illustration split, action position, lower-card grid, radius, and shadow treatment.
- Use only existing Friday tokens and color-mix derived from them for changed onboarding colors. Do not add raw hex, RGB, or per-step color values.
- Send to Friday must be a small button inside a 52px composer; do not retain a standalone full-width Trial send button.
- Do not add dependencies, routes, services, state stores, or generated runtime image assets.
- Stage and commit only files owned by each task; leave unrelated dirty-worktree changes untouched.

---

### Task 1: Add the bilingual support-card copy contract

**Files:**
- Modify: src/content/translations.ts:96-110,245-255,429-439
- Modify: src/translations.test.ts

**Interfaces:**
- Consumes: Existing OnboardingCopy.steps and product source names.
- Produces: OnboardingCopy.support, used by the local support-card markup in Task 2.

- [ ] **Step 1: Write the failing translation assertions**

~~~ts
test('onboarding support cards provide truthful bilingual labels', () => {
  const zh = translations.zh.workspace.onboarding.support
  const en = translations.en.workspace.onboarding.support

  assert.equal(zh.checklist.title, '配置清单')
  assert.equal(zh.checklist.completed(2), '已完成 2 / 4')
  assert.equal(en.checklist.title, 'Setup checklist')
  assert.equal(en.checklist.completed(2), '2 / 4 completed')
  assert.equal(zh.security.points[1], '不会读取或存储工作内容。')
  assert.equal(en.security.points[2], 'Real sending still requires backend gates.')
})
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: node --test src/translations.test.ts

Expected: FAIL because onboarding.support is not defined.

- [ ] **Step 3: Extend OnboardingCopy and both locale objects**

Add this exact structural type immediately after trial in OnboardingCopy:

~~~ts
support: {
  checklist: { title: string; completed: (count: number) => string }
  apps: { title: string; more: string; comingSoon: string }
  security: { title: string; intro: string; points: [string, string, string] }
  insights: { title: string; rows: [string, string, string]; footer: string }
  teams: { title: string; body: string; segments: [string, string, string] }
}
~~~

Use these exact localized values:

~~~ts
// en
support: {
  checklist: { title: 'Setup checklist', completed: (count) => String(count) + ' / 4 completed' },
  apps: { title: 'Supported work apps', more: 'More apps coming soon.', comingSoon: 'Coming soon' },
  security: { title: 'Security & permissions', intro: 'This local preview changes only what is displayed.', points: ['No account is authorised in this demo.', 'No work content is read or stored.', 'Real sending still requires backend gates.'] },
  insights: { title: 'Example Memory insights', rows: ['Project Alpha planning update', 'Design sync summary', 'Weekly team update'], footer: 'Examples shown for this local preview.' },
  teams: { title: 'How teams use Friday', body: 'Keep decisions, owners, and next steps easy to review.', segments: ['Product', 'Operations', 'Leadership'] },
}

// zh
support: {
  checklist: { title: '配置清单', completed: (count) => '已完成 ' + count + ' / 4' },
  apps: { title: '支持的工作应用', more: '更多应用即将支持。', comingSoon: '即将支持' },
  security: { title: '安全与权限', intro: '此本地预览只会改变页面中的展示内容。', points: ['此演示不会授权任何账号。', '不会读取或存储工作内容。', '真实发送仍需要后端门禁。'] },
  insights: { title: 'Memory 示例洞察', rows: ['Project Alpha 规划更新', '设计同步摘要', '每周团队更新'], footer: '这些内容仅用于本地预览。' },
  teams: { title: '团队如何使用 Friday', body: '让决策、负责人和下一步更容易复盘。', segments: ['产品', '运营', '管理'] },
}
~~~

- [ ] **Step 4: Run the focused test to verify it passes**

Run: node --test src/translations.test.ts

Expected: PASS.

- [ ] **Step 5: Commit the copy contract**

~~~bash
git add src/content/translations.ts src/translations.test.ts
git commit -m "feat: add onboarding support copy"
~~~

### Task 2: Render one shared onboarding frame and embedded Trial composer

**Files:**
- Modify: src/components/OnboardingHome.tsx:1-360
- Modify: src/onboardingHome.test.ts

**Interfaces:**
- Consumes: OnboardingState.step, OnboardingState.maxReached, translations[locale].workspace.onboarding.support, homeSources, and existing connector logos.
- Produces: onboarding-frame, onboarding-support-grid, onboarding-checklist, and onboarding-composer markup used by Task 3 CSS.
- Preserves: connectSource, continueToMemory, confirmMemory, advanceFromMemory, confirmWorkStyle, recordTrial, completeOnboarding, and all existing modals.

- [ ] **Step 1: Write failing SSR coverage for the stable frame**

~~~ts
test('every reached onboarding step uses the same support frame and checklist progress', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const one = onboarding.createOnboardingState()
  const two = onboarding.continueToMemory(onboarding.connectSource(one, 'dingtalk'))
  const three = onboarding.advanceFromMemory(onboarding.confirmMemory(two))
  const four = onboarding.confirmWorkStyle(three)
  const props = { locale: 'en' as const, onComplete: () => {}, onOpenMemory: () => {}, welcomeOpen: false }

  for (const [state, completed] of [[one, '0 / 4 completed'], [two, '1 / 4 completed'], [three, '2 / 4 completed'], [four, '3 / 4 completed']] as const) {
    const html = renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: state }))
    assert.match(html, /onboarding-frame/)
    assert.match(html, /onboarding-panel/)
    assert.match(html, /onboarding-support-grid/)
    assert.match(html, new RegExp('onboarding-checklist-progress[^>]*>' + completed))
    assert.match(html, /Supported work apps[\s\S]*Security &amp; permissions[\s\S]*Example Memory insights[\s\S]*How teams use Friday/)
  }
})

test('Trial keeps Send to Friday inside its compact composer', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const stepFour = onboarding.confirmWorkStyle(onboarding.advanceFromMemory(onboarding.confirmMemory(onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')))))
  const html = renderToStaticMarkup(createElement(OnboardingHome, { initialState: stepFour, locale: 'en', onComplete: () => {}, onOpenMemory: () => {}, welcomeOpen: false }))

  assert.match(html, /onboarding-composer[\s\S]*onboarding-trial-submit[\s\S]*Send to Friday/)
})
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: node --test src/onboardingHome.test.ts

Expected: FAIL because the support-frame hooks and nested send button do not exist.

- [ ] **Step 3: Add local presentational markup without changing state behavior**

Wrap the existing `ol.onboarding-steps`, existing `section.onboarding-panel`, and the new support grid in one `section.onboarding-frame`; leave every existing modal and welcome-dialog sibling after that frame. Insert `<OnboardingSupportGrid completed={state.maxReached - 1} copy={copy.support} homeCopy={homeCopy} state={state} />` immediately after the closing onboarding-panel tag.

Import `BookOpen, CalendarDays, Check, Circle, LockKeyhole, Mail, ShieldCheck, UsersRound` from Lucide and define this local component above `OnboardingHome`:

~~~tsx
function OnboardingSupportGrid({ completed, copy, homeCopy, state }: {
  completed: number
  copy: OnboardingCopy['support']
  homeCopy: typeof translations.zh.workspace.home
  state: OnboardingState
}) {
  const extraApps = [{ Icon: Mail, name: 'Gmail' }, { Icon: CalendarDays, name: 'Outlook' }] as const

  return <section className="onboarding-support-grid">
    <section className="onboarding-support-card onboarding-checklist">
      <header><Check aria-hidden="true" /><h3>{copy.checklist.title}</h3></header>
      <ol>{copy.steps.map((stepCopy, index) => {
        const step = (index + 1) as OnboardingStep
        const itemState = step === state.step ? 'current' : step < state.maxReached ? 'done' : 'future'
        return <li data-state={itemState} key={stepCopy.label}><span aria-hidden="true">{itemState === 'done' ? <Check /> : itemState === 'current' ? step : <Circle />}</span><div><strong>{stepCopy.label}</strong><small>{stepCopy.description}</small></div></li>
      })}</ol>
      <p className="onboarding-checklist-progress">{copy.checklist.completed(completed)}</p>
    </section>
    <section className="onboarding-support-card onboarding-supported-apps">
      <header><h3>{copy.apps.title}</h3></header>
      <div className="onboarding-supported-app-list">{homeSources.map((source) => <span key={source}><img alt="" src={onboardingConnectorLogos[source]} /><small>{homeCopy.sources[source]}</small></span>)}{extraApps.map(({ Icon, name }) => <span key={name}><Icon aria-hidden="true" /><small>{name}</small><em>{copy.apps.comingSoon}</em></span>)}</div>
      <p>{copy.apps.more}</p>
    </section>
    <section className="onboarding-support-card onboarding-security">
      <header><ShieldCheck aria-hidden="true" /><h3>{copy.security.title}</h3></header>
      <p>{copy.security.intro}</p>
      <ul>{copy.security.points.map((point) => <li key={point}><Check aria-hidden="true" />{point}</li>)}</ul>
      <LockKeyhole aria-hidden="true" className="onboarding-security-mark" />
    </section>
    <section className="onboarding-support-card onboarding-memory-insights">
      <header><BookOpen aria-hidden="true" /><h3>{copy.insights.title}</h3></header>
      <ul>{copy.insights.rows.map((row) => <li key={row}>{row}</li>)}</ul>
      <p>{copy.insights.footer}</p>
    </section>
    <section className="onboarding-support-card onboarding-team-uses">
      <header><UsersRound aria-hidden="true" /><h3>{copy.teams.title}</h3></header>
      <p>{copy.teams.body}</p>
      <ul>{copy.teams.segments.map((segment) => <li key={segment}>{segment}</li>)}</ul>
    </section>
  </section>
}
~~~

Use copy.security, copy.insights, and copy.teams verbatim. Do not invent customer names, metrics, avatars, authorization claims, or stored-data claims.

Replace the Step 4 textarea label plus standalone button with one valid wrapper that keeps the label associated with the textarea while nesting the button outside the label:

~~~tsx
<div className="onboarding-composer">
  <label>
    <span className="sr-only">{copy.trial.inputLabel}</span>
    <textarea onChange={(event) => setQuestion(event.target.value)} placeholder={copy.trial.placeholder} value={question} />
  </label>
  <Button className="onboarding-trial-submit" isDisabled={!question.trim()} onPress={submitTrial} type="button">{copy.trial.submit}</Button>
</div>
~~~

Keep existing style/Migration callouts and all action handlers. Do not change onboardingState.ts.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: node --test src/onboardingHome.test.ts

Expected: PASS.

- [ ] **Step 5: Commit the shared markup**

~~~bash
git add src/components/OnboardingHome.tsx src/onboardingHome.test.ts
git commit -m "feat: add unified onboarding frame"
~~~

### Task 3: Apply token-only geometry and visually verify all four steps

**Files:**
- Modify: src/index.css:428-660,1429-1458
- Modify: src/onboardingHome.test.ts

**Interfaces:**
- Consumes: Frame and support-card class hooks from Task 2 and existing Friday tokens in :root.
- Produces: One desktop hero geometry and lower grid for all steps; a compact vertical fallback below 1000px.
- Preserves: Existing welcome, modal, activation, and illustration behavior while replacing their onboarding-scoped raw colors with existing tokens.

- [ ] **Step 1: Write the failing token/geometry assertion**

Import readFile from node:fs/promises and add:

~~~ts
test('unified onboarding CSS keeps one desktop geometry and token-only color aliases', async () => {
  const css = await readFile(new URL('./index.css', import.meta.url), 'utf8')
  const start = css.indexOf('/* Onboarding */')
  const end = css.indexOf('@media (prefers-reduced-motion: reduce)', start)
  const onboardingCss = css.slice(start, end)

  assert.match(onboardingCss, /\.onboarding-panel\s*{[^}]*height:\s*346px/)
  assert.match(onboardingCss, /\.onboarding-support-grid\s*{[^}]*grid-template-columns:\s*260px minmax\(0, 1fr\) minmax\(0, 1fr\)/)
  assert.match(onboardingCss, /--onboarding-hero:\s*var\(--color-friday-ink\)/)
  assert.doesNotMatch(onboardingCss, /#[0-9a-fA-F]{3,8}|rgb\(/)
  assert.doesNotMatch(onboardingCss, /\.onboarding-(?:memory|work-style|trial)-layout\s+\.onboarding-editorial-content\s*{[^}]*\b(?:width|height|padding)\s*:/)
})
~~~

- [ ] **Step 2: Run the focused test to verify it fails**

Run: node --test src/onboardingHome.test.ts

Expected: FAIL because existing onboarding styles use raw colors and per-step geometry overrides.

- [ ] **Step 3: Replace onboarding CSS with the shared desktop grid and token aliases**

At the start of the onboarding block, define the only onboarding color aliases:

~~~css
.onboarding-frame {
  --onboarding-hero: var(--color-friday-ink);
  --onboarding-hero-foreground: var(--color-friday-surface);
  --onboarding-hero-muted: color-mix(in srgb, var(--color-friday-surface) 72%, transparent);
  --onboarding-hero-overlay: color-mix(in srgb, var(--color-friday-ink) 88%, transparent);
  --onboarding-accent: var(--color-friday-pending);
  --onboarding-complete: var(--color-friday-success);
  --onboarding-soft: var(--color-friday-surface-muted);
}
~~~

Use one desktop frame: width: min(1240px, calc(100% - 64px)) on .onboarding-page; a surface/border/radius canvas on .onboarding-frame; a 346px .onboarding-panel; and this lower grid:

~~~css
.onboarding-support-grid {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  min-height: 356px;
}
.onboarding-checklist { grid-row: 1 / span 2; }
.onboarding-supported-apps { grid-column: 2; }
.onboarding-security { grid-column: 3; }
.onboarding-memory-insights { grid-column: 2; }
.onboarding-team-uses { grid-column: 3; }
~~~

Make .onboarding-connect-layout and .onboarding-editorial-layout share the same height: 100%, hero background, overlay, content width, content padding, title sizes, and image treatment. Delete the .onboarding-memory-layout, .onboarding-work-style-layout, and .onboarding-trial-layout rules that override hero content width, padding, or dimensions. Retain only step-specific content-flow rules that do not change card geometry.

Set .onboarding-composer to a two-column, 52px-tall surface with grid-template-columns: minmax(0, 1fr) auto; make its textarea fill the height, disable resize, and make .onboarding-trial-submit width auto and margin zero. Use var(--control-height-large) plus 4px padding for the 52px outer composer height; no standalone Trial button selector remains.

Replace every raw hexadecimal or RGB color literal inside the onboarding CSS block, including welcome, modal, and activation CSS, with existing tokens or the aliases above. Do not alter SVG fill/stroke values in OnboardingHome.tsx; they are existing celebration illustration content rather than authored UI CSS.

At max-width: 1000px, change .onboarding-support-grid to one column and allow .onboarding-panel to use height: auto; min-height: 468px; keep the desktop geometry declaration untouched outside that media query.

- [ ] **Step 4: Run focused and full automated checks**

Run: node --test src/onboardingHome.test.ts && npm test && npm run typecheck && npm run build && git diff --check

Expected: all tests, typecheck, build, and diff check PASS.

- [ ] **Step 5: Run the desktop and compact browser acceptance check**

Run: npm run dev -- --host 127.0.0.1

In a browser at a 1600px-wide desktop viewport, dismiss the welcome dialog and verify: initial Step 1; Step 2 after connecting DingTalk and continuing; Step 3 after confirming Memory; Step 4 after confirming the work-style Prompt. For every state, verify the hero and five support cards have identical outer bounds, the step navigator/checklist count agrees, and the lower grid does not reflow. On Step 4, click a suggestion, confirm the 52px composer enables its internal send button, submit it, and verify the Trial flow remains local-only. Switch locale once in the same browser session and check no visible text overflows. At a width below 1000px, verify the support cards stack after the hero without horizontal overflow.

- [ ] **Step 6: Commit the visual system**

~~~bash
git add src/index.css src/onboardingHome.test.ts
git commit -m "feat: align onboarding frame design"
~~~
