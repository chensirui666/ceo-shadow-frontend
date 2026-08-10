# Connect apps visual refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give onboarding Step 1 a violet, two-column connection experience while preserving every existing connection behavior and demo boundary.

**Architecture:** Keep `OnboardingHome` as the state coordinator. Add one project-local raster artwork asset, render it only in the Step 1 panel, and use Step 1-specific CSS selectors for layout and purple emphasis. Existing source data, confirmation modal, and progression functions remain unchanged.

**Tech Stack:** React, TypeScript, Vite, HeroUI, CSS, Node test runner, built-in image generation.

## Global Constraints

- Modify only onboarding Step 1; do not alter Steps 2–4, Home events, Trial behavior, or formal-mode boundaries.
- Keep the desktop onboarding panel at its existing fixed height of `468px`.
- Keep the connection confirmation modal, app names, scopes, local-demo disclosure, and at-least-one-app gate unchanged.
- Use `#6F42C1` only as the Step 1 emphasis color; retain existing colors for other onboarding steps and product status semantics.
- Generate a text-free raster asset under `src/assets/`; it must contain no fake user data or claims of a live connection.

---

### Task 1: Add the Step 1 decorative artwork

**Files:**
- Create: `src/assets/onboarding-connect-illustration.png`

**Interfaces:**
- Produces the static image imported by `OnboardingHome.tsx` in Task 2.
- The image is decorative; its accessible name is supplied by the surrounding DOM, so its `<img>` will use `alt=""`.

- [x] **Step 1: Generate the artwork with the built-in image tool**

Use this exact prompt:

```text
Use case: stylized-concept
Asset type: right-side decorative artwork for a desktop onboarding panel
Primary request: Create a refined 3D-style illustration of an AI work assistant connection hub. A luminous rounded square hub sits near the lower center on a soft circular platform. Three elegant curved connection lines rise toward empty floating rounded tiles. The composition must leave clean negative space around the upper and side edges for real app icons to be overlaid in the frontend.
Scene/backdrop: warm ivory to pale lavender gradient with faint clouds and subtle sparkles
Style/medium: premium soft 3D product illustration, editorial SaaS onboarding artwork
Composition/framing: landscape 3:2, all visual mass inside the frame, central hub in lower middle
Lighting/mood: soft lilac and warm peach glow, calm and optimistic
Color palette: muted violet #6F42C1, pale lavender, warm white, a restrained peach accent
Constraints: no text, no letters, no brand marks, no people, no dashboards, no charts, no user data, no watermark
```

- [x] **Step 2: Inspect the generated output**

Check that the artwork is landscape, contains no readable text or product marks, has room for three overlaid connector marks, and stays visually quiet enough for the left-side work flow to remain primary.

- [x] **Step 3: Place the selected asset in the project**

Copy the selected generated PNG to `src/assets/onboarding-connect-illustration.png` without overwriting any existing asset. Confirm it is a valid PNG:

```bash
file src/assets/onboarding-connect-illustration.png
```

Expected: `PNG image data`.

### Task 2: Compose the Connect apps panel around the artwork

**Files:**
- Modify: `src/components/OnboardingHome.tsx:1-127`
- Modify: `src/index.css:375-447`
- Modify: `src/onboardingHome.test.ts:8-23`

**Interfaces:**
- Consumes: `src/assets/onboarding-connect-illustration.png` from Task 1 and `onboardingConnectorLogos` already exported by `src/content/connectorLogos.ts`.
- Produces: Step 1 markup with `.onboarding-connect-layout`, `.onboarding-connect-content`, `.onboarding-connect-artwork`, and `.onboarding-connect-artwork-mark` classes.
- Keeps: `connecting`, `completeConnection`, `continueToMemory`, and `state.connectedSources` behavior unchanged.

- [x] **Step 1: Write the failing SSR assertion**

Add this test to `src/onboardingHome.test.ts`:

```ts
test('Connect apps uses the dedicated two-column artwork layout', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {}, onOpenMemory: () => {} }))

  assert.match(html, /onboarding-connect-layout/)
  assert.match(html, /onboarding-connect-artwork/)
  assert.match(html, /onboarding-connect-illustration/)
})
```

- [x] **Step 2: Run the focused test and confirm the new markup is absent**

Run: `node --test src/onboardingHome.test.ts`

Expected: FAIL because `onboarding-connect-layout` is not rendered.

- [x] **Step 3: Add the scoped Step 1 markup**

Import the artwork and update only the Step 1 branch:

```tsx
import connectIllustration from '../assets/onboarding-connect-illustration.png'

<section className="onboarding-section onboarding-connect-layout">
  <div className="onboarding-connect-content">
    <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(1)}</p><h2>{copy.connection.title}</h2><p>{copy.connection.subtitle}</p></header>
    <p className="onboarding-demo-note">{copy.connection.demo}</p>
    <div className="onboarding-source-list">
      {homeSources.map((source) => {
        const connected = state.connectedSources.includes(source)
        return <div className="onboarding-source-row" key={source}>
          <span aria-hidden="true" className="onboarding-source-glyph"><img alt="" src={onboardingConnectorLogos[source]} /></span>
          <span><strong>{homeCopy.sources[source]}</strong><small>{copy.connection.scope[source]}</small></span>
          {connected ? <span className="onboarding-connected">{copy.connection.connected}</span> : <Button className="onboarding-connect-button" onPress={() => setConnecting(source)} type="button">{copy.connection.connect}</Button>}
        </div>
      })}
    </div>
    <footer className="onboarding-section-footer"><Button isDisabled={!state.connectedSources.length} onPress={() => update(continueToMemory(state))} type="button">{copy.actions.continue}</Button><p>{copy.connection.continueHint}</p></footer>
  </div>
  <aside aria-hidden="true" className="onboarding-connect-artwork">
    <img alt="" src={connectIllustration} />
    {homeSources.map((source) => <img className={`onboarding-connect-artwork-mark onboarding-connect-artwork-mark-${source}`} key={source} alt="" src={onboardingConnectorLogos[source]} />)}
  </aside>
</section>
```

Add `onboarding-page-step-1` to the outer page class so CSS can apply violet only while Step 1 is active:

```tsx
<section className={`onboarding-page onboarding-page-step-${state.step}`}>
```

- [x] **Step 4: Add the scoped layout and color rules**

Use CSS equivalent to:

```css
.onboarding-connect-layout { display: grid; grid-template-columns: minmax(0, 52fr) minmax(330px, 48fr); padding: 0; }
.onboarding-connect-content { display: flex; min-width: 0; flex-direction: column; padding: 31px 36px; }
.onboarding-connect-artwork { position: relative; min-width: 0; overflow: hidden; border-left: 1px solid #eee7f7; background: #fbf8ff; }
.onboarding-connect-artwork > img:first-child { width: 100%; height: 100%; object-fit: cover; }
.onboarding-connect-artwork-mark { position: absolute; z-index: 1; box-sizing: border-box; width: 44px; height: 44px; border: 1px solid rgb(255 255 255 / 76%); border-radius: 12px; background: #fffefd; box-shadow: 0 10px 22px rgb(88 56 161 / 16%); padding: 7px; }
.onboarding-connect-artwork-mark-dingtalk { top: 16%; left: 17%; }
.onboarding-connect-artwork-mark-feishu { top: 30%; right: 13%; }
.onboarding-connect-artwork-mark-teams { top: 55%; left: 9%; }
.onboarding-page-step-1 .onboarding-step-active { color: #6F42C1; }
.onboarding-page-step-1 .onboarding-step-active span, .onboarding-connect-content .onboarding-connect-button { border-color: #6F42C1; background: #6F42C1; color: #fff; }
@media (max-width: 720px) {
  .onboarding-connect-layout { grid-template-columns: 1fr; }
  .onboarding-connect-artwork { min-height: 250px; border-top: 1px solid #eee7f7; border-left: 0; }
}
```

The existing `@media (max-width: 720px)` panel rule continues to preserve the `468px` outer frame and internal scrolling.

- [x] **Step 5: Run the focused SSR test**

Run: `node --test src/onboardingHome.test.ts`

Expected: PASS, including existing Step 4 Trial placement coverage.

### Task 3: Verify the refresh and commit it

**Files:**
- Modify: `src/components/OnboardingHome.tsx`
- Modify: `src/index.css`
- Modify: `src/onboardingHome.test.ts`
- Create: `src/assets/onboarding-connect-illustration.png`
- Modify: `docs/superpowers/plans/2026-08-10-onboarding-connect-visual.md`

**Interfaces:**
- Uses the two-column Step 1 layout from Task 2.
- Does not add state fields, service calls, dependencies, or external requests at runtime.

- [x] **Step 1: Run the full verification suite**

Run:

```bash
npm test && npm run typecheck && npm run build && git diff --check
```

Expected: all commands exit `0`.

- [x] **Step 2: Check the local page manually**

Open `http://127.0.0.1:5173/` as a non-seeded account. Confirm the left column remains readable, the right-side artwork is decorative, Connect opens the existing confirmation modal, confirmation switches the row to connected, and Continue stays disabled until one app is connected.

- [x] **Step 3: Commit the verified refresh**

```bash
git add src/assets/onboarding-connect-illustration.png src/components/OnboardingHome.tsx src/index.css src/onboardingHome.test.ts docs/superpowers/plans/2026-08-10-onboarding-connect-visual.md
git commit -m "feat: refresh onboarding connect experience"
```
