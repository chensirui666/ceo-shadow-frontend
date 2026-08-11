# 首页颜色语义与信息区视觉收敛 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Home 的状态色、图表、标签和事件列表收敛为已批准的 10 色核心系统，同时保留完整图表卡、虚线网格和默认数据浮层。

**Architecture:** 继续以 `src/index.css` 作为颜色与 Home 布局的唯一样式入口；不引入主题层或图表库。`HomeActivityChart` 仅增加一个显式开启的默认浮层，`HomeWorkspace` 为正式 Home 开启它，Onboarding 的复用图表维持当前无浮层行为。

**Tech Stack:** React 19、TypeScript、Vite、Tailwind CSS / HeroUI、Node test runner、CSS `color-mix()`。

## Global Constraints

- 核心基础色固定为 `#242422`、`#FFFEFD`、`#F7F5EF`、`#F4F2EC`、`#ECEAE2`、`#E7E4DC`、`#6F6D67`、`#00B89C`、`#FF9F1C`、`#FF4D4F`。
- `warning` 只能映射到 pending；Trial 是模式，使用暖中性与墨色，不建立第四种功能色。
- 成功、待处理、失败的前景色、浅底和细边必须分别从同一基础色派生；不增加近似状态色、渐变或阴影。
- Home 图表保留圆角极浅外框、虚线网格、基线、时间刻度和默认浮层；图表与事件列表均无阴影。
- 相邻小时柱在桌面端保持 `4px` 间隔，在窄屏保持 `2px` 间隔，露出网格并保留呼吸感。
- Memory 的五个来源数据色只保留在来源标识/关系可视化，不进入 Home 状态或图表。
- 不改变 Home 本地 fixture、筛选、计数口径、事件流转、文案、图片、SVG 或其他页面布局。
- 不增加依赖；Onboarding 复用图表时默认不显示浮层。

---

### Task 1: 为正式 Home 增加可控的默认数据浮层

**Files:**
- Modify: `src/components/HomeActivityChart.tsx`
- Modify: `src/components/HomeWorkspace.tsx`
- Modify: `src/homeComponents.test.ts`

**Interfaces:**
- Consumes: `ActivityHour[]` 和既有 `HomeCopy`；数组顺序是从最早小时到最新小时。
- Produces: `HomeActivityChart` 新增可选 `showDefaultTooltip?: boolean`；只有传入 `true` 时，最新非零小时显示 `.home-chart-tooltip`。
- Preserves: 不传该 prop 的 `OnboardingHome` 调用不产生浮层，现有每小时 `title`、`aria-label` 与图例保持不变。

- [ ] **Step 1: 写出默认浮层的失败测试**

在 `src/homeComponents.test.ts` 的图表测试后加入：

```ts
test('formal Home exposes the latest non-zero hour in an opt-in tooltip', async () => {
  const { default: HomeActivityChart } = await vite.ssrLoadModule('/src/components/HomeActivityChart.tsx')
  const activity = [
    { hour: '02', processed: 0, pending: 0, failed: 0 },
    { hour: '03', processed: 3, pending: 3, failed: 1 },
  ]
  const withTooltip = renderToStaticMarkup(createElement(HomeActivityChart, {
    activity, copy: translations.en.workspace.home, showDefaultTooltip: true,
  }))
  const withoutTooltip = renderToStaticMarkup(createElement(HomeActivityChart, {
    activity, copy: translations.en.workspace.home,
  }))

  assert.match(withTooltip, /home-chart-tooltip/)
  assert.match(withTooltip, /03:00/)
  assert.match(withTooltip, /Processed 3/)
  assert.match(withTooltip, /Pending 3/)
  assert.match(withTooltip, /Send failed 1/)
  assert.doesNotMatch(withoutTooltip, /home-chart-tooltip/)
})
```

- [ ] **Step 2: 运行聚焦测试，确认它先失败**

Run:

```bash
node --test --test-name-pattern="formal Home exposes" src/homeComponents.test.ts
```

Expected: FAIL，因为 `HomeActivityChart` 还没有 `home-chart-tooltip` 标记。

- [ ] **Step 3: 以最小 prop 和现有聚合结果实现浮层**

在 `HomeActivityChart.tsx` 中扩展 props，并从现有 `activity` 中从左到右保留最后一个总数大于 0 的小时；不更改 `activityHours()` 的统计口径：

```ts
type HomeActivityChartProps = {
  activity: ActivityHour[]
  copy: HomeCopy
  showDefaultTooltip?: boolean
}

const tooltipHour = showDefaultTooltip
  ? activity.reduce<ActivityHour | undefined>((latest, hour) => (
    hour.processed + hour.pending + hour.failed > 0 ? hour : latest
  ), undefined)
  : undefined
const tooltipColumn = tooltipHour ? activity.indexOf(tooltipHour) + 1 : 1
const tooltipAlignment = tooltipColumn <= 3 ? 'start' : tooltipColumn >= activity.length - 2 ? 'end' : 'center'
```

在柱状图外新增 `.home-chart-plot` 包装器，保留 `.home-chart-bars` 内 24 个可聚焦小时。仅在 `tooltipHour` 存在时，在同一 plot 中渲染：

```tsx
<div className="home-chart-tooltip-layer">
  <aside
    aria-label={copy.chart.hourLabel(tooltipHour)}
    className={`home-chart-tooltip home-chart-tooltip-${tooltipAlignment}`}
    style={{ gridColumn: `${tooltipColumn} / span 1` }}
  >
    <strong>{tooltipHour.hour}:00</strong>
    <span className="home-chart-tooltip-item home-chart-key-processed">{copy.chart.processed} {tooltipHour.processed}</span>
    <span className="home-chart-tooltip-item home-chart-key-pending">{copy.chart.pending} {tooltipHour.pending}</span>
    <span className="home-chart-tooltip-item home-chart-key-failed">{copy.chart.failed} {tooltipHour.failed}</span>
  </aside>
</div>
```

在 `HomeWorkspace.tsx` 的正式 Home 调用改为：

```tsx
<HomeActivityChart activity={activityHours(events, now)} copy={copy} showDefaultTooltip />
```

不要改 `OnboardingHome.tsx`，它不传 prop。

- [ ] **Step 4: 运行聚焦测试，确认通过**

Run:

```bash
node --test --test-name-pattern="activity chart|formal Home exposes" src/homeComponents.test.ts
```

Expected: PASS，现有图例/可访问名称测试与新增的 opt-in 浮层测试均通过。

- [ ] **Step 5: 提交可验证的浮层契约**

```bash
git add src/components/HomeActivityChart.tsx src/components/HomeWorkspace.tsx src/homeComponents.test.ts
git commit -m "feat: add Home activity tooltip"
```

### Task 2: 统一 token、状态标签、图表卡和事件列表的视觉语义

**Files:**
- Modify: `src/index.css:5-68`
- Modify: `src/index.css:361-420`
- Modify: `src/index.css:576-604`

**Interfaces:**
- Consumes: Task 1 产生的 `.home-chart-plot`、`.home-chart-tooltip-layer`、`.home-chart-tooltip` 和 `home-chart-tooltip-{start,center,end}` class。
- Produces: 全局 10 色基础 token、派生状态角色和只作用于正式 Home 的卡片/列表样式。
- Preserves: `HomeActivityChart` 的 class 名、Home 详情结构、来源圆点类、移动端网格与其他页面的布局。

- [ ] **Step 1: 先确认旧色只存在于待替换的 Home/token 路径**

Run:

```bash
rg -n '#(176c69|8a4f0f|b42318|8649c9|f7edff|9a7a40|a3655e|d9d6ce)' src/index.css
```

Expected: 命中全局旧 token、Home 图表、Home 行状态或 Home 详情状态；不要修改 Tasks、Memory、Onboarding 的独立颜色。

- [ ] **Step 2: 替换基础 token，并定义唯一的派生状态角色**

在 `@theme` 中删除 `friday-subtle`、`friday-warning`、`friday-trial`、`friday-lilac`，保留并替换三个功能 token：

```css
--color-friday-success: #00b89c;
--color-friday-pending: #ff9f1c;
--color-friday-danger: #ff4d4f;
```

在 `:root` 中把 `--focus-ring` 设为 `var(--color-friday-ink)`，将 HeroUI 的 `--warning` 设为 `var(--color-friday-pending)`，并定义九个派生状态角色：

```css
--status-success-foreground: var(--color-friday-success);
--status-success-background: color-mix(in srgb, var(--status-success-foreground) 12%, var(--color-friday-surface));
--status-success-border: color-mix(in srgb, var(--status-success-foreground) 28%, var(--color-friday-surface));
--status-pending-foreground: var(--color-friday-pending);
--status-pending-background: color-mix(in srgb, var(--status-pending-foreground) 12%, var(--color-friday-surface));
--status-pending-border: color-mix(in srgb, var(--status-pending-foreground) 28%, var(--color-friday-surface));
--status-danger-foreground: var(--color-friday-danger);
--status-danger-background: color-mix(in srgb, var(--status-danger-foreground) 12%, var(--color-friday-surface));
--status-danger-border: color-mix(in srgb, var(--status-danger-foreground) 28%, var(--color-friday-surface));
```

将 `--success-foreground`、`--warning-foreground`、`--danger-foreground` 和 `--accent-foreground` 指向 `var(--color-friday-surface)`，避免再引入纯白基础色。

- [ ] **Step 3: 按组件层级应用 Home 样式，不产生全局卡片副作用**

在 `.home-page` 中将图表变量改为三种 `--status-*-foreground`，并使用 `friday-border` 派生网格、`friday-muted` 作为时间文字、`friday-ink` 作为焦点。用以下选择器限制卡片只落在正式 Home：

```css
.home-page > .home-activity {
  border: 1px solid var(--color-friday-border);
  border-radius: var(--radius-card);
  background: var(--color-friday-surface);
  box-shadow: none;
  padding: 24px 28px;
}

.home-page > .home-event-list {
  overflow: hidden;
  border: 1px solid var(--color-friday-border);
  border-radius: var(--radius-card);
  box-shadow: none;
}
```

将 `.home-chart-bars` 放进 `.home-chart-plot` 的相对定位上下文，并以重复的水平虚线背景表现网格；保留更清晰的 `border-bottom` 基线。桌面端设置 `gap: 4px`，沿用现有窄屏媒体查询将其覆盖为 `gap: 2px`。`home-chart-tooltip-layer` 使用与柱图相同的 24 列 grid；浮层用 surface、border、`box-shadow: none`，并让 `start`、`center`、`end` class 分别贴齐首列、中间和尾列以避免溢出。

把 `.home-chart-key` 和 `.home-event-status` 变为无阴影的细边圆角标签：成功/处理中使用 `status-success-*`，等待/待确认使用 `status-pending-*`，发送失败/连接异常使用 `status-danger-*`，Trial 完成使用 `friday-muted`、`friday-surface-muted`、`friday-border`。将 Home 详情的 `needs-confirmation`、失败、Trial 左边线和 Trial 提示也替换到同一套 pending、danger、muted 语义。

来源圆点保留原有 `#82957D`、`#839EB3`、`#9990A8` 数据色，不把它们改成功能色。

- [ ] **Step 4: 做静态 token 回归检查**

Run:

```bash
rg -n -- '--color-friday-(subtle|warning|trial|lilac)' src/index.css
rg -n '#(176c69|8a4f0f|b42318|8649c9|f7edff|9a7a40|a3655e|d9d6ce)' src/index.css | rg -v -- '--memory-edge: #d9d6ce' || true
git diff --check
```

Expected: 前两条命令没有输出；第三条命令以 `0` 退出。允许 `#9990A8` 只出现在 Teams 来源色，而不作为全局 token；允许 Memory 既有的 `--memory-edge: #d9d6ce` 保持不变，因为它不属于本次 Home/token 收敛范围。

- [ ] **Step 5: 提交样式收敛**

```bash
git add src/index.css
git commit -m "style: unify Home status colors"
```

### Task 3: 运行全量校验并进行浏览器验收

**Files:**
- Verify only: `src/homeComponents.test.ts`
- Verify only: `src/homeState.test.ts`
- Verify only: `src/index.css`
- Verify only: `src/components/HomeActivityChart.tsx`
- Verify only: `src/components/HomeWorkspace.tsx`

**Interfaces:**
- Consumes: Task 1 的 tooltip prop 与 Task 2 的 CSS semantic roles。
- Produces: 通过的测试、类型检查、构建和两个断点的视觉验收记录；不再修改产品功能。

- [ ] **Step 1: 运行仓库检查**

Run:

```bash
npm test && npm run typecheck && npm run build && git diff --check
```

Expected: 四个命令全部以 `0` 退出；现有 Home 状态流转、Onboarding 复用图表和 SSR 测试均保持通过。

- [ ] **Step 2: 验证正式 Home 的桌面视图**

在本地以 seeded demo 帐号打开 Home。确认：图表是有圆角极浅边框的完整信息卡；无容器或柱子阴影；有极浅虚线网格和清晰基线；相邻柱子有 `4px` 可见间隔；最新非零小时有默认浮层；Processed、Pending、Send failed 在图例、浮层和柱段中分别是 `#00B89C`、`#FF9F1C`、`#FF4D4F`；事件列表有极浅外框、行分隔线和无阴影状态标签。

- [ ] **Step 3: 验证窄屏和复用图表**

在 `390px` 宽度确认图表、浮层和筛选控件没有横向溢出，事件状态标签仍可读。进入 Onboarding 的 Trial 预览，确认它保持现有的紧凑图表呈现且没有 `.home-chart-tooltip`；本方案不改变 Onboarding 既有的隐藏标题/图例规则。

- [ ] **Step 4: 检查最终改动范围并提交验收完成状态**

Run:

```bash
git status --short
git log -2 --oneline
```

Expected: Task 1 和 Task 2 的代码提交存在，配套规格/计划提交可存在；任何既有未跟踪 Playwright 文件或截图保持未暂存、未修改。
