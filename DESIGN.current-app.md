---
version: alpha
name: Friday Current Application Design
description: 暖白底色、紧凑工作台与深色编辑式引导视觉。
colors:
  primary: "#242422"
  canvas: "#F7F5EF"
  surface: "#FFFFFF"
  card: "#FFFEFD"
  muted-surface: "#F4F2EC"
  selected: "#ECEAE2"
  muted: "#6F6D67"
  border: "#E7E4DC"
  editorial: "#191512"
  on-editorial: "#FFF9EF"
  inverse-button: "#F3EADC"
  success: "#1B9876"
  success-text: "#1E785E"
  success-soft: "#E4F2ED"
  negative: "#BC8D86"
  negative-text: "#8A514B"
  negative-soft: "#F8EEEE"
  node-sage: "#82957D"
  node-blue: "#839EB3"
  node-lilac: "#9990A8"
  node-ochre: "#B59663"
  node-neutral: "#969189"
  graph-canvas: "#FBFAF7"
  graph-edge: "#D9D6CE"
  progress: "#789776"
  table-head: "#ECE9E3"
  overdue: "#926D34"
typography:
  nav:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.45
  page-title:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
  feedback-title:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: 27px
    fontWeight: 650
    lineHeight: 1.45
  section:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: 14px
    fontWeight: 650
    lineHeight: 1.45
  metric:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: 38px
    fontWeight: 650
    lineHeight: 1
  feedback-metric:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: 25px
    fontWeight: 650
    lineHeight: 1.45
  table-label:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.45
  badge:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: 10px
    fontWeight: 700
    lineHeight: 1.45
  button:
    fontFamily: "Figtree, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.45
  editorial-title:
    fontFamily: "EB Garamond, Songti SC, STSong, serif"
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.08
  editorial-title-compact:
    fontFamily: "EB Garamond, Songti SC, STSong, serif"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.08
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  page: 48px
rounded:
  control: 8px
  card: 12px
  editorial: 20px
  canvas: 24px
  pill: 999px
components:
  application-frame:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
  workspace:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.canvas}"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
  nav-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.primary}"
    typography: "{typography.nav}"
    rounded: "{rounded.control}"
    height: "40px"
  nav-hover:
    backgroundColor: "{colors.muted-surface}"
  metadata:
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
  divider:
    backgroundColor: "{colors.border}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    height: "40px"
  editorial-panel:
    backgroundColor: "{colors.editorial}"
    textColor: "{colors.on-editorial}"
    typography: "{typography.editorial-title}"
    rounded: "{rounded.editorial}"
    padding: "{spacing.xl}"
  editorial-panel-compact-title:
    typography: "{typography.editorial-title-compact}"
  button-inverse:
    backgroundColor: "{colors.inverse-button}"
    textColor: "{colors.primary}"
    height: "34px"
  positive-chart:
    backgroundColor: "{colors.success}"
  positive-badge:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success-text}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
  negative-chart:
    backgroundColor: "{colors.negative}"
  negative-badge:
    backgroundColor: "{colors.negative-soft}"
    textColor: "{colors.negative-text}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
  graph:
    backgroundColor: "{colors.graph-canvas}"
    rounded: "{rounded.card}"
  graph-edge:
    backgroundColor: "{colors.graph-edge}"
  progress-arc:
    backgroundColor: "{colors.progress}"
  project-table-header:
    backgroundColor: "{colors.table-head}"
    typography: "{typography.table-label}"
  overdue-label:
    textColor: "{colors.overdue}"
  page-heading:
    typography: "{typography.page-title}"
  feedback-heading:
    typography: "{typography.feedback-title}"
  section-heading:
    typography: "{typography.section}"
  task-metric:
    typography: "{typography.metric}"
  feedback-metric:
    typography: "{typography.feedback-metric}"
  card-wall:
    padding: "{spacing.sm}"
  page-content:
    padding: "{spacing.page}"
  inline-group:
    padding: "{spacing.xs}"
  compact-group:
    padding: "{spacing.md}"
  graph-node-sage:
    backgroundColor: "{colors.node-sage}"
    rounded: "{rounded.pill}"
  graph-node-blue:
    backgroundColor: "{colors.node-blue}"
    rounded: "{rounded.pill}"
  graph-node-lilac:
    backgroundColor: "{colors.node-lilac}"
    rounded: "{rounded.pill}"
  graph-node-ochre:
    backgroundColor: "{colors.node-ochre}"
    rounded: "{rounded.pill}"
  graph-node-neutral:
    backgroundColor: "{colors.node-neutral}"
    rounded: "{rounded.pill}"
---

## Overview

Friday 的视觉是温暖、克制的桌面工作台：暖白应用底色包围白色主画布，操作区紧凑，标题与内容保持清晰层级。品牌以深墨色标志和文字呈现，导航使用细线图标。

- 日常工作区使用无衬线字体、细分隔线和低饱和配色。
- 引导区使用深色插画、衬线标题与奶油色按钮，形成独立的视觉层级。
- Task 以指标和表格组织信息；Memory 以关系图组织信息；Feedback 以指标、趋势和反馈卡片组织信息。
- 状态色与来源色有明确用途，不作为通用按钮配色。

## Colors

`primary` 用于主文字、导航图标与主要按钮；`canvas` 是暖白外框，`surface` 是白色画布，`card` 是略暖的卡片底色。`muted-surface` 用于轻量分组和悬停，`selected` 用于导航选中态。辅助文字使用 `muted`，分隔线使用 `border`。

引导大图使用 `editorial` 深棕黑底色，标题为 `on-editorial` 奶油白。反色按钮使用 `inverse-button` 配深墨文字；图片左侧叠加暗色渐变，避免文字直接落在高亮图案上。

正向反馈图表使用 `success`，文字标签使用更深的 `success-text` 配 `success-soft`。负向反馈图表及卡片左边线使用 `negative`，标签使用 `negative-text` 配 `negative-soft`。图表颜色不可直接当作小字号文字颜色。

Memory 节点以鼠尾草绿、灰蓝、灰紫、赭色、灰色区分来源；会话来源复用 `negative` 的灰粉色，此处不表示负面状态。连线为 `graph-edge`，画布为 `graph-canvas`。任务弧形进度使用 `progress`，表头使用 `table-head`，逾期文字使用 `overdue`。

## Typography

界面字体为 Figtree，中文回退至苹方等系统字体。正文 14px / 1.45；导航 14px、500 字重；辅助文字 12px。页面标题通常 28px，Feedback 标题为 27px、650 字重；图表和卡片分区标题是 14px、650 字重。

任务大指标使用 38px、650 字重、1 倍行高及 -0.055em 字距；反馈指标使用 25px、650 字重、-0.04em 字距。表头 11px、700 字重；反馈状态标签 10px、700 字重。不要将这些较小字号用于长篇阅读。

引导标题使用 EB Garamond，中文回退宋体：宽屏 40px，紧凑布局 30px，400 字重，1.08 倍行高，-0.035em 字距。此衬线角色只用于引导的叙事标题，不扩展到项目表格、导航和操作标签。

## Layout

宽屏应用使用双栏：左侧导航宽度为 `clamp(196px, 14vw, 224px)`，右侧是独立白色圆角画布。导航按 Message、Task、Memory、Feedback 排列；账号、通知、后台进度使用轻量图标入口。

普通页面在宽度不超过 1000px 时改为顶部品牌与横向导航，画布左右及底部留 16px，页面自然纵向滚动。引导页在 721–1000px 仍保留 152–196px 的左侧栏，主内容横向内边距为 24px。不要将两类页面的响应式规则合并。

Memory 内容宽度上限 1130px，常规左右合计留白 104px；Feedback 内容宽度上限 1120px，左右合计留白 64px，顶部 32px、底部 48px。基础间距为 4、8、12、16、24、48px，但卡片保留局部 10px 间隙与 15px × 17px 内边距。

Task 顶部三块指标共享一个容器，中间弧形进度区更宽。下方表格依次呈现项目、状态、负责人、进度、个人行动；行高至少 57px，列间距 16px。Feedback 指标宽屏四列，紧凑布局两列；图表区按 2:1 分栏，反馈墙为两列卡片。

## Elevation & Depth

常规画布、指标、表格和反馈卡片基本平面化，靠底色、留白与细边框区分。不要给每一行加投影。

浮层使用柔和暖灰阴影。Memory 提示层对应 `0 18px 48px rgb(54 48 39 / 16%)`，用来与图谱分离，不用于普通节点。引导插画内部保留物体光影，页面外壳不复制图片的立体效果。

## Shapes

导航、按钮、搜索框采用 8px 圆角；普通容器以 12px 为基准；白色主画布为 24px。局部变体包括反馈卡片 11px、任务指标容器 14px、引导大图约 20px。状态标签和图谱节点使用全圆角。

通用边界为 1px `border`。反馈卡片边框为 1px #E5E0D7，左侧状态强调线为 3px；任务行只用 1px #E6E1D8 横向分隔，避免完整网格。图谱节点用 1.5px 暖白描边，细灰连线放在节点后方。

图标使用圆头圆角细线，常规约 18–21px，笔画约 1.7–1.8px。插画中的第三方应用标志保持原始品牌色，不统一染成工作台状态色。

## Components

**应用外壳与导航**：品牌在导航区域上方；每项由图标、文字组成。40px 最小高度，横向内边距 14px，图文间距 12px。选中使用浅暖灰背景，悬停用更轻底色。

**按钮与搜索**：主操作为深墨底、白字、8px 圆角，常规高度 40px。Memory 搜索、来源选择与添加资料按钮并排。引导连接按钮为浅色描边透明底，继续按钮为奶油色底；禁用继续按钮降低整体显著性，同时附简短原因。

**引导面板**：顶部三步进度以圆形序号、文字和短连接线组成。当前步骤以暖棕色强调，未开启步骤淡化。主体大图在右侧呈现应用卡片场景，文字和来源列表在左侧。列表每行包含应用图标、名称、说明、连接操作；下方排列支持应用、安全说明、团队人物图片三类辅助卡片。

**任务指标与表格**：指标容器内边距 10px，各指标区约 18px × 22px；中间半圆进度线宽 13px、圆形端点，数字居中。表头浅灰底，仅上侧圆角；项目名加粗，其余字段保持常规字重。状态采用小型药丸标签，不将整行染色。

**Memory 工具栏与图谱**：Context / User 为文本页签，选中项底部深色短线。工具栏下面是浅暖色网格画布，来源节点为大小不一的低饱和彩色圆点，以细线连接；缩放及适配视图控件贴近画布左下角。节点文字在提示层中呈现，避免默认把全图塞满标签。

**Feedback 指标与图表**：标题右侧是三段日期筛选，选中段浅暖灰底。指标卡 15px × 17px 内边距。趋势用并列细柱，正向绿色、负向灰粉色；来源分布使用 7px 高的圆头进度条。图例文字与数值必须同时出现。

**反馈墙**：每卡左上状态标签、右上反馈来源；中间按问题、最终回复、反馈三行组织；左下时间、右下详情入口。摘要单行截断，正文色保持深灰。正负反馈使用左边线和标签共同标识，不能只依赖颜色。

## Do's and Don'ts

- 保持暖白外框、白色画布与深墨文字的主体关系。
- 保留引导的衬线标题、深色图片和奶油按钮这一组视觉语言。
- 用来源色区分图谱，用状态色表达反馈；不要混用语义。
- 表格保持紧凑，以分隔线组织，不添加多层嵌套卡片。
- 深色图片可使用局部渐变遮罩；不要将渐变扩展为普通业务区背景。
- 保留可见焦点、状态文字与图表图例，不用颜色代替信息。
- 不将设计中的状态标签、进度和图表视为实际业务完成的证明。

## Known Gaps

- 登录页、完成引导后的消息列表、设置弹窗及全部详情页的完整视觉状态尚未核验，不在此定义具体组件规范。
- 720px 以下手机布局未完成视觉核验；不能把紧凑桌面规则当成已验证的手机方案。
- 加载、连接失败、空列表、上传失败等状态未形成完整视觉覆盖；不要从正常页面推导它们的颜色和布局。
- 字体声明不等于每台设备实际加载成功，中文字体与字体下载失败时的回退需单独检查。
- 局部小字号辅助文字和逾期标签需要进一步对比度检查；未将所有现有配色声明为安全的背景／文字成对 token。
- 设计 token 汇总常见角色，不代表所有局部样式数值都已经统一；视觉复用时保留明确列出的页面变体。
