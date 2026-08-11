# 首页颜色语义与信息区视觉收敛

## 目标与范围

把 Friday 的核心界面收敛为「一个主色 + 一套暖中性色阶 + 三种功能色」，并将首页的状态标签、柱状图和默认浮层统一到同一组功能色。此次只调整全局 token 基础和 Home 的图表、状态、列表外观；不改事件数据、筛选、状态流转、文案、图标或图片资产。

本次不做全仓 150 余个历史近似色的机械替换，也不改 Memory 的来源数据色。那些颜色将在后续按页面迁移；本次建立的 token 是迁移目标，不是新增另一套主题。

## 核心色板

核心 UI 只承认以下 10 个基础色；由透明度或 `color-mix()` 得到的浅底、细边和焦点层是这些基础色的派生语义，不计为新色。

| 类别 | Token | 色值 | 用途 |
| --- | --- | --- | --- |
| 主色 / 最深墨色 | `friday-ink` | `#242422` | 主按钮、主文字、键盘焦点 |
| 暖中性 | `friday-surface` | `#FFFEFD` | 卡片、浮层、深色文字的反白 |
| 暖中性 | `friday-canvas` | `#F7F5EF` | 页面底色 |
| 暖中性 | `friday-surface-muted` | `#F4F2EC` | 弱层级底色 |
| 暖中性 | `friday-surface-selected` | `#ECEAE2` | 选中态、悬停态 |
| 暖中性 | `friday-border` | `#E7E4DC` | 极浅边框、分隔线、图表基线 |
| 暖中性 | `friday-muted` | `#6F6D67` | 次级文字、时间刻度 |
| 完成 / 正常 | `friday-success` | `#00B89C` | 已处理、处理中、健康状态 |
| 待处理 / 需判断 | `friday-pending` | `#FF9F1C` | Pending、待你确认、倒计时 |
| 失败 / 风险 | `friday-danger` | `#FF4D4F` | 发送失败、连接异常、破坏性操作 |

`warning` 保留为兼容 HeroUI 的语义别名，但必须指向 `friday-pending`，不再拥有独立的棕黄色。`trial` 和 `lilac` 不再作为功能色 token；试运行是运行模式而非风险等级，使用暖中性与墨色表达。现有 Memory 的 DingTalk、Feishu、Teams、File、Conversation 五色仍只用于来源/关系数据可视化，不能进入全局状态或 Home 图表。

## 功能色的语义层

每个功能色固定派生三个角色，避免页面自行挑近似色：

| 角色 | 值 | 使用规则 |
| --- | --- | --- |
| `status-*-foreground` | 对应基础功能色本身 | 圆点、柱状图段、浮层项目符号和状态边线；同一状态必须同色 |
| `status-*-text` | 成功 `color-mix(in srgb, foreground 65%, ink)`；待处理 `57%`；失败 `79%` | 小字号标签文字和浮层文字；保持同色相，同时在 surface 上至少达到 4.5:1 对比度 |
| `status-*-background` | `color-mix(in srgb, foreground 12%, surface)` | 静态状态标签的浅底，不用于柱状图 |
| `status-*-border` | `color-mix(in srgb, foreground 28%, surface)` | 状态标签的可选细边；没有边框需求时不强加 |

因此，成功、待处理、失败三个状态在首页任意位置均以 `#00B89C`、`#FF9F1C`、`#FF4D4F` 作为可见主色，而不是出现新的低饱和近似绿、黄、红。小字号文字使用对应的深色同色系派生值，图例和浮层的圆点、柱段、边线仍使用基础功能色。颜色只作辅助：图例、浮层和行内状态必须保留文字。

## 首页信息结构与样式

### 最近 24 小时图表

保留它作为一个完整的信息卡：圆角容器、`1px` 极浅边框、标题、图例、虚线网格、柱状图、基线与时间刻度都保留。去掉所有图表容器和柱状图的阴影。

- 外框与内容区使用 `friday-surface`；边框、基线和网格从 `friday-border` 派生。网格是低对比虚线，基线比网格略清晰。
- 默认展示最新一个非零时段的浮层；没有数据时不显示。浮层展示该时段和三种状态的文字计数，不依赖 hover 才能看见；它采用 surface、极浅边框和无阴影的样式。
- 仅显示 `processed`、`pending`、`failed` 三种柱段：它们与图例圆点和浮层圆点严格一一对应为 success、pending、danger 的 `foreground`。柱子不做渐变、阴影或第二套图表色。
- 相邻小时柱保留固定的呼吸间隔：桌面端 `4px`，窄屏降为 `2px`；间隔露出极浅网格，不让柱体黏连。
- 每小时仍保留现有的键盘焦点与文本可访问名称；默认浮层不能替代 `title`/辅助文本。

### 来源筛选与事件列表

筛选条和模式按钮保留原有位置与行为。事件列表恢复为一个由极浅 `1px` 外框包裹的圆角信息区，内部每一行以同色系极浅分隔线区分；不加投影。行悬停仅使用暖中性 selected 派生底色。

行内状态映射固定如下：

- `processing`、`completed` 使用 success；
- `waiting`、`needs-confirmation` 使用 pending；
- `send-failed`、`connection-error` 使用 danger；
- `trial-complete` 使用 muted，不占用第四种功能色。

来源首字母圆点继续使用 Memory 的来源数据色，因为它表达的是来源身份而不是处理状态；不得与功能状态颜色混用。

## 实施边界

只改已有的 `src/index.css`、`HomeActivityChart.tsx`、`HomeEventList.tsx`，以及为默认浮层提供最小必要数据的调用处或既有 Home 组件测试。优先复用现有 CSS token、Home 的 24 小时聚合和本地 fixture；不增加依赖、主题配置层、图表库、图片或 SVG。

不改登录、Onboarding、Memory、Tasks 或 Settings 的独立布局。为避免 Onboarding 复用图表时意外多出默认浮层，图表默认浮层只由 Home 页面显式开启。

## 验收与验证

1. `src/index.css` 中 Home 状态不再引用旧的 `#176C69`、`#8A4F0F`、`#B42318`、紫色 trial token 或手写近似状态色；HeroUI `warning` 映射到 pending。
2. 首页图例、默认浮层、柱段及事件行状态按同一状态使用同一主色；标签浅底和细边仅由该主色派生。
3. 图表有圆角极浅外框、无阴影、极浅虚线网格和基线；事件列表有极浅外框和行分隔线、无阴影。
4. 无数据时没有默认浮层；图表和行的键盘焦点与文本标签仍有效。
5. 更新现有 Home 组件静态渲染测试，覆盖默认浮层开关和必要的语义 class；随后执行 `npm test`、`npm run typecheck`、`npm run build`，并用本地浏览器检查 Home 的桌面与窄屏截图。
