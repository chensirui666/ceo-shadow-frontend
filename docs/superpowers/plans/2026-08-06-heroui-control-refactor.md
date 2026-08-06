# HeroUI Control Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve Friday's current look and behavior while converting every appropriate interactive control to the installed HeroUI primitives.

**Architecture:** Keep the existing component boundaries and state contracts. Replace native action controls with HeroUI components in place, retaining established Friday class names only for visual customization; use HeroUI's compound controls for the Memory toolbar and Settings switches/selects. Leave semantic layout and the browser-secured file picker native.

**Tech Stack:** React 19, TypeScript, HeroUI 3, Tailwind CSS 4, Vite, Node built-in test runner.

## Global Constraints

- Preserve the user's existing uncommitted Memory and Settings changes; do not commit or reset the worktree.
- Keep all existing localized copy, state shapes, routing, local-storage semantics, and demo boundaries.
- Use `Button`, `Input`, `Switch`, `Tabs`, `Select`, `SearchField`, `Dropdown`, `Modal`, and `ListBox` from the existing `@heroui/react` dependency when their semantics match.
- Retain native `<input type="file">`, SVG graph markup, forms, and ordinary layout/text elements where HeroUI is not a better semantic replacement.

---

### Task 1: Establish the existing behavior baseline

**Files:**
- Test: `src/*.test.ts`

**Interfaces:**
- Existing pure-state tests characterize the user-visible authentication, session, Settings, Memory, and localization behavior that this UI-only refactor must preserve.

- [x] **Step 1: Run the baseline state suite and TypeScript check**

Run: `npm test && npm run typecheck`

Observed: 17 Node tests pass and TypeScript exits 0 before any HeroUI migration.

- [x] **Step 2: Reject a source-text test**

Do not add a test that searches for HeroUI imports or native tag names: it would only assert implementation text, not Friday behavior. The browser checks in Task 4 verify the actual components and their keyboard/overlay behavior.

### Task 2: Convert shared and simple action controls

**Files:**
- Modify: `src/components/LanguageToggle.tsx`
- Modify: `src/components/Login.tsx`
- Modify: `src/components/Workspace.tsx`
- Modify: `src/components/MemoryWorkspace.tsx`
- Modify: `src/components/SettingsAppsPanel.tsx`
- Modify: `src/components/SettingsConfirmation.tsx`
- Modify: `src/components/SettingsDetailHeader.tsx`
- Modify: `src/components/SettingsProfilePanel.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Preserve each existing `onClick`, `disabled`, and form `type` behavior through HeroUI `Button` equivalents (`onPress`, `isDisabled`, and `type`).
- Preserve current class names so Friday-specific visual CSS continues to apply.

- [ ] **Step 1: Replace native action buttons with HeroUI `Button`**

```tsx
import { Button } from '@heroui/react'

<Button className="settings-button settings-button-dark" onPress={onSave} type="button">
  {copy.general.save}
</Button>
```

Use `isDisabled={...}` instead of `disabled={...}`. Convert navigation, icon-only, retry, empty-state, link-style, form-submit, and dialog action buttons. Keep only `<input type="file">` native in `MemoryWorkspace.tsx`.

- [ ] **Step 2: Run the existing regression suite and TypeScript check**

Run: `npm test && npm run typecheck`

Expected: all existing behavior tests and TypeScript pass while the remaining composite controls are migrated.

### Task 3: Convert composite controls and the Settings modal

**Files:**
- Modify: `src/components/MemoryToolbar.tsx`
- Modify: `src/components/SettingsGeneralPanel.tsx`
- Modify: `src/components/SettingsWorkspace.tsx`
- Modify: `src/index.css`

**Interfaces:**
- `MemoryToolbar` keeps its existing props and emits `MemoryLayer` and `MemorySource` through the same callbacks.
- `SettingsGeneralPanel` keeps its existing draft-update callbacks and save/confirmation flow.
- `SettingsWorkspace` continues to call `onClose` only after the existing dirty-state confirmation permits it.

- [ ] **Step 1: Migrate the Memory controls to HeroUI compound controls**

```tsx
<Tabs aria-label={copy.layersLabel} className="memory-tabs" selectedKey={layer} onSelectionChange={(key) => onLayerChange(key as MemoryLayer)}>
  <Tabs.List>{memoryLayers.map((item) => <Tabs.Tab id={item} key={item}>{copy.layers[item].label}</Tabs.Tab>)}</Tabs.List>
</Tabs>
<SearchField className="memory-search" value={keyword} onChange={onKeywordChange}>
  <SearchField.Input placeholder={copy.searchPlaceholder} />
</SearchField>
```

Use `Select` plus `ListBox` for sources and `Dropdown` for the add-material menu. Do not retain the native `details`, `summary`, `select`, or tab roles.

- [ ] **Step 2: Migrate Settings field controls and overlay**

```tsx
<Switch className="settings-switch-row" isSelected={draft.general.respondToEveryone} onChange={(selected) => selected ? onRequestEveryone() : onUpdateDraft(disableEveryone)}>
  <Switch.Content>{copy.general.group.everyone}</Switch.Content>
  <Switch.Control><Switch.Thumb /></Switch.Control>
</Switch>
```

Use `Input` for profile and time fields, `Select` plus `ListBox` for wait minutes, and `Switch` for all boolean values. Wrap the Settings workspace in a controlled HeroUI `Modal` whose close request goes through `requestClose`, so backdrop, escape, and explicit close remain subject to the unsaved-change confirmation.

- [ ] **Step 3: Update only selectors whose underlying native markup changed**

Remove the obsolete `details`, `summary`, native select, checkbox-input, and native-tab CSS selectors. Retain the Friday palette, spacing, responsive breakpoints, and component class names.

- [ ] **Step 4: Run the full Node suite**

Run: `npm test`

Expected: all existing state tests pass.

### Task 4: Verify visual and behavioral preservation

**Files:**
- Modify only if verification identifies a concrete defect in files from Tasks 2–3.

**Interfaces:**
- No new public interfaces.

- [ ] **Step 1: Run compile and bundle checks**

Run: `npm run typecheck && npm run build`

Expected: both commands exit 0.

- [ ] **Step 2: Run browser regression at desktop width**

Run: `npm run dev -- --host 127.0.0.1`

Verify email/code login, primary navigation, account menu and sign-out dialog, Memory layer/source/search/add controls, and Settings navigation, switches, select, profile edit, connector state, and dirty-change confirmation. Check the existing visual language is retained.

- [ ] **Step 3: Re-run final evidence commands**

Run: `npm test && npm run typecheck && npm run build`

Expected: all commands exit 0 after any browser-driven correction.
