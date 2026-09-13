# Onboarding Welcome Modal Design

## Goal

Before a new user's existing four-step onboarding is visible, show the approved deep editorial welcome dialog. Its primary action exposes the already-active first step; no personal-profile fields or real Memory processing are added.

## Confirmed content

- Title: `准备好认识你的工作分身了吗？`
- Summary: `4 步完成配置 · 预计 3 分钟`
- Steps: `连接工作来源` → `建立工作 Memory` → `确认工作风格` → `试运行`
- Primary action: `开始配置`

The English locale keeps equivalent copy. The same step labels are used by the dialog and the visible onboarding navigator, so the two cannot diverge.

## Behavior

- `OnboardingHome` starts with the welcome dialog open for each new login session.
- Clicking the primary action closes only the dialog. The page behind it is the existing step 1 and is already marked active.
- The close icon provides the same non-destructive dismissal. No preference is persisted and no onboarding step is changed.

## Visual

Use the approved split dialog: a near-black editorial left panel with a small Memory diagram, an ivory right panel with the four steps, a black action button, amber accents, and a dimmed version of the existing app shell. On compact screens the dialog stacks the content and retains the step order.

## Boundaries and verification

- Remain a local demo: no connector reads, profile writes, or Memory ingestion.
- Do not add dependencies or image assets; the graphic is CSS-only.
- SSR coverage confirms the initial welcome copy uses the four actual steps and the first step remains present below it. Browser verification confirms the button closes the dialog and reveals the active first step.
