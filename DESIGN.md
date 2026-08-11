---
version: alpha
name: Friday Warm Editorial Workbench
description: A calm, compact desktop workspace for a trustworthy work avatar.

colors:
  primary: "#242422"
  on-primary: "#FFFFFF"
  app-canvas: "#F6F5F0"
  surface: "#FFFFFF"
  surface-muted: "#F4F2EC"
  surface-selected: "#ECEAE2"
  border: "#E7E4DC"
  text-secondary: "#6F6D67"
  teal: "#176C69"
  teal-soft: "#D9EFEB"
  lilac: "#8649C9"
  lilac-soft: "#F7EDFF"
  warning: "#8A4F0F"
  critical: "#B42318"

typography:
  meta:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.45
  ui:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  section-title:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
  dialog-title:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.25
  page-title:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  display:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "32px–46px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.05em"
  label:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.04em"

rounded:
  control: "8px"
  card: "12px"
  dialog: "16px"
  canvas: "24px"
  full: "999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  page: "48px"

components:
  application-frame:
    backgroundColor: "{colors.app-canvas}"
  workspace-canvas:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.canvas}"
  content-card:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{rounded.card}"
    padding: "{spacing.xl}"
  nav-item-selected:
    backgroundColor: "{colors.surface-selected}"
    rounded: "{rounded.control}"
    padding: "{spacing.sm}"
  list-divider:
    backgroundColor: "{colors.border}"
  metadata:
    textColor: "{colors.text-secondary}"
    typography: "{typography.meta}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.ui}"
    rounded: "{rounded.control}"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.primary}"
    typography: "{typography.ui}"
    rounded: "{rounded.control}"
    height: "40px"
  status-active:
    backgroundColor: "{colors.teal-soft}"
    textColor: "{colors.teal}"
    typography: "{typography.meta}"
    rounded: "{rounded.full}"
  status-trial:
    backgroundColor: "{colors.lilac-soft}"
    textColor: "{colors.lilac}"
    typography: "{typography.meta}"
    rounded: "{rounded.full}"
  status-warning:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.warning}"
    typography: "{typography.meta}"
    rounded: "{rounded.full}"
  status-critical:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.critical}"
    typography: "{typography.meta}"
    rounded: "{rounded.full}"
---

## Overview

Friday is a warm editorial desktop workbench: composed, personal, and highly
legible. It should feel like a capable assistant working quietly beside a
manager, not an analytics dashboard or an autonomous black box.

Use generous outer margins and a compact rhythm inside modules. The application
shell is warm off-white; the active workspace is a single white canvas with a
soft, architectural corner radius. Information remains plain and scannable.

The visual language is inspired by a restrained desktop utility: familiar left
navigation, quiet cards, thin dividers, and occasional editorial warmth. Do not
reuse another product's name, copy, imagery, logo, or brand assets.

## Colors

- **Primary:** Near-black is the default for text, icons, and primary actions.
  It should carry authority without using pure black everywhere.
- **Surfaces:** `app-canvas` creates a warm frame around a white workspace.
  `surface-muted` is for cards and settings rows; use `border` for separation,
  not shadows.
- **Teal:** Reserved for reliable, completed, or currently active work. It is
  suitable for a healthy connection, a completed step, or a positive trend.
- **Lilac:** Reserved for Trial, onboarding progress, limits, and low-pressure
  product guidance. It must never imply that Friday has sent a message.
- **Warning and critical:** Use only for a real warning, failed action, or
  message that needs a person. Never use them as decoration.

## Typography

Use the sans-serif tokens for navigation, page titles, tables, settings, and
all operational information. The default UI size is 14px; long-form reading
uses 15px. Labels are small, uppercase only when they describe metadata or a
metric category, and must not become the dominant visual element.

Use `display` only for a welcome message, an event-detail headline, or an empty
state headline. It is an emotional accent, not a data-display style. Do not use
it for a task title, a reply, an event row, a table, or a setting.

## Layout

Desktop is the primary target. At widths of 1280px and above, keep a persistent
left rail around 216px wide. Place global navigation and account actions in the
rail; keep the main content within one white `workspace-canvas` inset from the
warm application frame.

Within the workspace, use a max content width around 920px for lists and
settings. Keep page padding at `page`; use `lg` inside cards and `md` between
cards. A page can have one focused secondary column for concise metrics,
connection health, or a single invitation. It must not compete with the
primary work area.

Use textual tabs with a thin baseline and a dark underline for the selected
tab. Do not replace this with large segmented controls. Tables and event feeds
should use quiet row dividers, one-line summaries, and readable timestamps.

## Elevation & Depth

Depth comes from surface color and a 1px `border`, not raised cards. Avoid
visible drop shadows in ordinary content. A modal may use one soft shadow and a
dimmed backdrop to clearly isolate a consequential setting or confirmation.

## Shapes

Use `control` for buttons, inputs, selected navigation, and tabs. Use `card`
for cards, panels, and muted status blocks. Use `canvas` only for the main
workspace and large modal shell. Pills are restricted to compact state labels,
not primary actions.

## Components

**Navigation:** Each item pairs a 16-20px outlined icon with a 14px label.
The selected item uses `nav-item-selected`; inactive items remain on the warm
rail with no border. Group low-frequency actions, such as Settings and Help,
at the bottom.

**Buttons:** Use `button-primary` for one main action per visual area.
`button-secondary` is the default for safe alternatives. Do not use teal or
lilac as a generic call-to-action color.

**Cards and lists:** Use `content-card` for metrics, settings groups, and
supporting information. Data-heavy lists may use the white canvas directly
with row dividers instead of cards within cards. Avoid nesting more than one
card level.

**Status:** Trial uses `status-trial` and must say that a result has not been
sent. Active uses `status-active` only when the channel is healthy
and work is actually enabled. A disconnected or failed state must use explicit
warning/critical language and explain what happened; recovery actions belong
only on the page responsible for recovery.

**Promotional or onboarding banner:** A dark, softly blurred human-work image
may appear in a setup invitation or an optional product tip. Keep text and CTA
on the dark portion, ensure contrast, and never use such imagery behind live
messages, tasks, or decisions.

**Modal settings:** Use a centered white modal with a left category rail and a
right detail panel. The background is dimmed. Rows show a concise current value
and one clear action; engineering configuration, raw prompts, logs, and model
names are never exposed here.

## Do's and Don'ts

- Do give each page one clear job: today’s work, tasks, memory, feedback, or
  settings.
- Do make Trial, Active, paused, and connection-error states visually and
  verbally distinct.
- Do show plain-language evidence: source, current status, timestamp, and
  next step.
- Do use empty space around sections, but keep list rows and controls compact.
- Don't use gradients, glass effects, oversized headings, or decorative charts.
- Don't use a status color to make a promise the system has not fulfilled.
- Don't place a marketing banner above a user’s urgent reply awaiting a decision.
- Don't reproduce reference-product copy, people, photography, or visual marks.
