# Home 状态色与数据浮层细化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将确认版的三种状态色应用到 Home，并让默认数据浮层以轻阴影和纵向对齐的数值列呈现。

**Architecture:** 只调整 `HomeActivityChart` 的浮层标记和 `src/index.css` 中既有 token、浮层样式；不改变数据、图表结构、Onboarding 或其他页面。

**Tech Stack:** React 19、TypeScript、Vite、Node test runner、CSS `color-mix()`。

## Global Constraints

- 状态基础色固定为成功 `#1B9876`、待处理 `#FFA946`、失败 `#D84E52`；它们继续用于图例圆点、柱段和细边。
- 状态标签与浮层文字使用同色系的深色派生文字，放在 `12%` 状态浅底上时对比度至少 `4.5:1`：success `72%`、pending `49%`、danger `79%` 与 `#242422` 混合。
- 浮层是唯一新增阴影的元素：`0 10px 24px rgb(54 48 39 / 12%)`；图表卡、柱段、事件列表和状态标签继续无阴影。
- 浮层每条状态为「圆点 | 标签 | 数字」三列；数字为右对齐、`tabular-nums`，三行组成一条竖向数值列。
- `--accent-foreground` 必须是 surface，不能与 ink 色的 `--accent` 相同。
- 不改变 Home 本地 fixture、筛选、计数口径、事件流转、文案、图片、SVG、Memory 来源色或 Onboarding 复用图表。
- 不新增依赖。

---

### Task 1: 应用确认版状态色并细化 Home 数据浮层

**Files:**
- Modify: `src/homeComponents.test.ts`
- Modify: `src/components/HomeActivityChart.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `HomeActivityChart` 已有 `ActivityHour[]`、`HomeCopy` 和 `showDefaultTooltip`。
- Produces: 每条 `.home-chart-tooltip-item` 内含 `.home-chart-tooltip-label` 与 `.home-chart-tooltip-value`；既有 tooltip 选择器继续有效。
- Preserves: Onboarding 不传 `showDefaultTooltip`，不显示默认浮层。

- [ ] **Step 1: 写出失败的 Home 浮层与样式契约测试**

在 `src/homeComponents.test.ts` 的默认浮层测试中，追加：

```ts
assert.match(withTooltip, /home-chart-tooltip-label/)
assert.match(withTooltip, /home-chart-tooltip-value/)
assert.match(withTooltip, /aria-label="Processed 3"/)
```

并在测试文件顶部新增 `readFile` import，再加入：

```ts
test('Home status tokens and tooltip layout use the approved palette', async () => {
  const css = await readFile(new URL('./index.css', import.meta.url), 'utf8')

  assert.match(css, /--color-friday-success: #1b9876;/)
  assert.match(css, /--color-friday-pending: #ffa946;/)
  assert.match(css, /--color-friday-danger: #d84e52;/)
  assert.match(css, /--accent-foreground: var\(--color-friday-surface\);/)
  assert.match(css, /\.home-chart-tooltip \{[\s\S]*?box-shadow: 0 10px 24px rgb\(54 48 39 \/ 12%\);/)
  assert.match(css, /\.home-chart-tooltip-item \{[\s\S]*?grid-template-columns: 8px minmax\(0, 1fr\) auto;/)
  assert.match(css, /\.home-chart-tooltip-value \{[\s\S]*?font-variant-numeric: tabular-nums;/)
})
```

- [ ] **Step 2: 运行聚焦测试，确认它先失败**

Run:

```bash
node --test --test-name-pattern="formal Home exposes|approved palette" src/homeComponents.test.ts
```

Expected: FAIL，当前 JSX 没有 label/value 元素且 token 仍是旧色。

- [ ] **Step 3: 以最小 JSX 和 CSS 实现需求**

在 `HomeActivityChart.tsx` 的三条 tooltip item 中，将原来的纯文本换为同一结构：

```tsx
<span aria-label={`${copy.chart.processed} ${tooltipHour.processed}`} className="home-chart-tooltip-item home-chart-key-processed">
  <span className="home-chart-tooltip-label">{copy.chart.processed}</span>
  <strong aria-hidden="true" className="home-chart-tooltip-value">{tooltipHour.processed}</strong>
</span>
```

pending 和 failed 使用相同 class 结构及对应文案/值。

在 `src/index.css` 更新为：

```css
--color-friday-success: #1b9876;
--color-friday-pending: #ffa946;
--color-friday-danger: #d84e52;
--accent-foreground: var(--color-friday-surface);
--status-success-text: color-mix(in srgb, var(--status-success-foreground) 72%, var(--color-friday-ink));
--status-pending-text: color-mix(in srgb, var(--status-pending-foreground) 49%, var(--color-friday-ink));
--status-danger-text: color-mix(in srgb, var(--status-danger-foreground) 79%, var(--color-friday-ink));
```

并将 tooltip 样式换为：

```css
.home-chart-tooltip { box-shadow: 0 10px 24px rgb(54 48 39 / 12%); }
.home-chart-tooltip-item { display: grid; grid-template-columns: 8px minmax(0, 1fr) auto; align-items: center; column-gap: 6px; }
.home-chart-tooltip-value { justify-self: end; font-variant-numeric: tabular-nums; font-weight: 600; }
```

保留现有圆点伪元素、透明行背景、`4px / 2px` 网格间隔与非浮层无阴影规则。

- [ ] **Step 4: 运行聚焦和全量验证**

Run:

```bash
node --test src/homeComponents.test.ts
npm test && npm run typecheck && npm run build && git diff --check
```

Expected: 所有命令以 `0` 退出。

- [ ] **Step 5: 浏览器验收并提交**

确认正式 Home 桌面图表的三种色为 `#1B9876`、`#FFA946`、`#D84E52`；浮层有轻阴影，三条数值在右侧成列对齐；卡片、柱段、状态标签和列表仍无阴影；Onboarding 不显示默认浮层。

```bash
git add src/homeComponents.test.ts src/components/HomeActivityChart.tsx src/index.css docs/superpowers/plans/2026-08-11-home-status-tooltip-refinement.md
git commit -m "style: refine Home status tooltip"
```
