# Settings Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let signed-in users switch the interface between English and Chinese from a dedicated Settings category.

**Architecture:** Extend the existing settings navigation configuration with a `language` section, then render that section through a focused `SettingsLanguagePanel`. The panel calls the existing app-level locale callback, which already persists the choice through `saveLocale`; no second preference model is introduced.

**Tech Stack:** React 19, TypeScript, HeroUI, Tailwind CSS 4, Node `node:test`, Vite 8.

## Global Constraints

- Support exactly `en` and `zh`; invalid persisted values resolve to `en`.
- Reuse `Locale`, `loadLocale`, and `saveLocale`; add no dependency or alternate storage key.
- Keep all visible copy and aria labels in `src/content/translations.ts`.
- The signed-in workspace header has no language control; Login keeps its existing control.
- Language selection applies immediately with no Save button or confirmation.

---

### Task 1: Add the dedicated Settings section contract

**Files:**
- Modify: `src/settingsState.test.ts`
- Modify: `src/settingsState.ts`

**Interfaces:**
- Produces: `SettingsSection` includes `'language'` and `settingsSections` is `['apps', 'general', 'language', 'profile']`.
- Consumes: Existing `settingsSections` mapping in `SettingsWorkspace`.

- [ ] **Step 1: Write the failing test**

Add this assertion to `src/settingsState.test.ts`. It fails until the navigation source of truth gains the category and catches future removal of the dedicated setting.

```ts
test('settings navigation includes a dedicated language category', () => {
  assert.deepEqual(settingsState.settingsSections, ['apps', 'general', 'language', 'profile'])
})
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `node --test src/settingsState.test.ts`

Expected: FAIL because `settingsSections` is `['apps', 'general', 'profile']`.

- [ ] **Step 3: Add the smallest settings contract change**

In `src/settingsState.ts`, replace the section tuple with:

```ts
export const settingsSections = ['apps', 'general', 'language', 'profile'] as const
```

No default data needs to change: `lastSection` remains `'apps'` and existing persisted data keeps normalizing correctly.

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `node --test src/settingsState.test.ts`

Expected: PASS, including the new dedicated-category test.

- [ ] **Step 5: Commit the tested contract**

```bash
git add src/settingsState.ts src/settingsState.test.ts
git commit -m "feat: add language settings section"
```

### Task 2: Add localized language panel copy and UI

**Files:**
- Modify: `src/content/translations.ts`
- Create: `src/components/SettingsLanguagePanel.tsx`

**Interfaces:**
- Consumes: `locale: Locale`, `onLocaleChange: (locale: Locale) => void`, and `copy: Translation['workspace']['settings']['language']`.
- Produces: `SettingsLanguagePanel`, a single-purpose immediate-selection view with two accessible buttons.

- [ ] **Step 1: Extend the settings translation type and both locales**

Add a `language` shape to `SettingsCopy`:

```ts
language: {
  title: string
  subtitle: string
  english: string
  chinese: string
  selected: (language: string) => string
}
```

Add `language` to each `nav` record and define the corresponding values:

```ts
// en
nav: { apps: 'Connected apps', general: 'General', language: 'Language', profile: 'How Friday works for you' },
language: {
  title: 'Language',
  subtitle: 'Choose the language Friday uses throughout the workspace.',
  english: 'English',
  chinese: 'Chinese',
  selected: (language) => `${language} selected`,
},

// zh
nav: { apps: '已连接的应用', general: '通用', language: '语言', profile: 'Friday 如何为你工作' },
language: {
  title: '语言',
  subtitle: '选择 Friday 在整个工作台中使用的语言。',
  english: 'English',
  chinese: '中文',
  selected: (language) => `已选择${language}`,
},
```

- [ ] **Step 2: Create the focused language view**

Create `src/components/SettingsLanguagePanel.tsx`:

```tsx
import type { Locale } from '../appState.ts'
import type { Translation } from '../content/translations.ts'

type SettingsLanguagePanelProps = {
  copy: Translation['workspace']['settings']['language']
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}

export default function SettingsLanguagePanel({ copy, locale, onLocaleChange }: SettingsLanguagePanelProps) {
  return <>
    <h2>{copy.title}</h2>
    <p className="settings-subtitle">{copy.subtitle}</p>
    <div aria-label={copy.title} className="settings-language-picker" role="group">
      {(['en', 'zh'] as const).map((option) => {
        const label = option === 'en' ? copy.english : copy.chinese
        return <button aria-label={copy.selected(label)} aria-pressed={locale === option} className={locale === option ? 'settings-language-option settings-language-option-active' : 'settings-language-option'} key={option} onClick={() => onLocaleChange(option)} type="button">
          {option === 'en' ? 'EN' : '中文'}
        </button>
      })}
    </div>
  </>
}
```

- [ ] **Step 3: Check the new UI module compiles**

Run: `npm run typecheck`

Expected: PASS. The panel is not yet routed, but its public props and translation contract compile.

- [ ] **Step 4: Commit the localized view**

```bash
git add src/content/translations.ts src/components/SettingsLanguagePanel.tsx
git commit -m "feat: add language settings panel"
```

### Task 3: Route the panel and style the compact segmented control

**Files:**
- Modify: `src/components/SettingsWorkspace.tsx`
- Modify: `src/components/Workspace.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `SettingsSection = 'apps' | 'general' | 'language' | 'profile'`, `SettingsLanguagePanel`, and the parent `onLocaleChange` callback.
- Produces: A fourth Settings navigation destination and a workspace without a header language control.

- [ ] **Step 1: Pass the existing app-level locale callback into Settings**

In `src/components/Workspace.tsx`, remove the `LanguageToggle` import and its header render. Keep `onLocaleChange` in `WorkspaceProps`, then pass it to the modal:

```tsx
{settingsOpen && <SettingsWorkspace locale={locale} onClose={() => setSettingsOpen(false)} onLocaleChange={onLocaleChange} onNavigate={goTo} />}
```

- [ ] **Step 2: Select the language panel from the Settings coordinator**

In `src/components/SettingsWorkspace.tsx`, import `SettingsLanguagePanel`, add `onLocaleChange` to `SettingsWorkspaceProps`, and add this branch before Profile:

```tsx
: section === 'language'
  ? <SettingsLanguagePanel copy={copy.language} locale={locale} onLocaleChange={onLocaleChange} />
  : <SettingsProfilePanel /* existing props unchanged */ />
```

The existing sidebar map automatically renders the localized fourth item from `settingsSections` and `copy.nav`.

- [ ] **Step 3: Add only the control styling required by the supplied reference**

Append these rules in the existing Settings CSS group in `src/index.css`:

```css
.settings-language-picker { display: inline-flex; margin-top: 30px; border: 1px solid #e2ded5; border-radius: 999px; background: #fffefd; padding: 5px; }
.settings-language-option { min-width: 56px; border: 0; border-radius: 999px; background: transparent; color: #6f6d67; cursor: pointer; padding: 9px 13px; font-size: 14px; font-weight: 700; }
.settings-language-option:hover, .settings-language-option:focus-visible { outline: 2px solid rgb(36 36 34 / 16%); outline-offset: 2px; }
.settings-language-option-active { background: #eceae2; color: #242422; }
```

- [ ] **Step 4: Verify the combined code compiles and builds**

Run: `npm run typecheck && npm run build`

Expected: both commands exit 0.

- [ ] **Step 5: Commit the composed feature**

```bash
git add src/components/SettingsWorkspace.tsx src/components/Workspace.tsx src/index.css
git commit -m "feat: move language selection into settings"
```

### Task 4: Verify persistence and the user flow

**Files:**
- Modify only if a verification exposes a defect in the files above.

**Interfaces:**
- Consumes: `saveLocale` invoked by `App`'s `changeLocale`, Settings language selection, and browser localStorage.
- Produces: Fresh evidence that a choice changes the UI immediately and survives reload.

- [ ] **Step 1: Run the full automated checks**

Run: `npm test && npm run typecheck && npm run build`

Expected: every Node test passes, and both TypeScript and Vite finish with exit code 0.

- [ ] **Step 2: Run the browser regression**

1. Open `http://localhost:5173/` and sign in with any valid email plus `123456` if no demo session exists.
2. Open Settings, select `Language`, then select `中文`.
3. Confirm the Settings title becomes `设置`, the navigation shows `语言`, and the `中文` control has `aria-pressed="true"`.
4. Reload the page and confirm visible workspace copy remains Chinese.
5. Reopen Settings, select `EN`, and confirm visible workspace copy changes to English immediately.

- [ ] **Step 3: Inspect the final diff and commit verification-only fixes if any**

Run: `git diff --check && git status --short`

If this step required a source fix, stage only the files changed for that fix and commit with a focused `fix:` message. Otherwise, do not create an empty commit.
