---
version: alpha
name: avatar-onboarding-design-analysis
description: "暖白工作台、铜色进度标记与深色编辑式引导画面。"

colors:
  primary: "#AE622D"
  canvas: "#F7F5EF"
  surface: "#FFFEFD"
  surface-raised: "#FFFFFF"
  surface-selected: "#ECEAE2"
  surface-warm: "#FFF5E9"
  ink: "#242422"
  ink-muted: "#6F6D67"
  border: "#E5E0D7"
  border-subtle: "#EFEAE1"
  surface-inverse: "#191512"
  on-inverse: "#FFF9EF"
  on-primary: "#FFFFFF"
  accent-gold: "#E9B26D"
  accent-soft: "#FFF0DB"
  team-apricot: "#F7EFE4"
  team-blue: "#E8EFFA"
  team-sage: "#E8F0E7"

typography:
  brand:
    fontFamily: 'Figtree, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.06em
  display-editorial:
    fontFamily: '"EB Garamond", "Songti SC", STSong, serif'
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: -0.035em
  heading-card:
    fontFamily: 'Figtree, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    fontSize: 15px
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: -0.02em
  nav:
    fontFamily: 'Figtree, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0em
  body-md:
    fontFamily: 'Figtree, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-sm:
    fontFamily: 'Figtree, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0em
  label:
    fontFamily: 'Figtree, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.05em
  button:
    fontFamily: 'Figtree, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0em
  micro-label:
    fontFamily: 'Figtree, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    fontSize: 9px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: 0em

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  workspace-gutter: 16px
  page-inline: 44px
  onboarding-hero-inline: 36px

rounded:
  button: 7px
  control: 8px
  tile: 9px
  card: 16px
  hero: 20px
  canvas: 24px
  pill: 9999px

components:
  page-canvas:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    padding: "{spacing.page-inline}"
  workspace-canvas:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.canvas}"
    padding: "{spacing.workspace-gutter}"
  workspace-brand:
    textColor: "{colors.ink}"
    typography: "{typography.brand}"
    padding: "{spacing.md}"
  side-nav-active:
    backgroundColor: "{colors.surface-selected}"
    textColor: "{colors.ink}"
    typography: "{typography.nav}"
    rounded: "{rounded.control}"
    height: 40px
  onboarding-step-active:
    backgroundColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    size: 25px
  onboarding-hero:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.on-inverse}"
    typography: "{typography.display-editorial}"
    rounded: "{rounded.hero}"
    padding: "{spacing.onboarding-hero-inline}"
  onboarding-kicker:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.accent-gold}"
    typography: "{typography.label}"
  onboarding-subtitle:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.on-inverse}"
    typography: "{typography.body-sm}"
  connector-row:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.on-inverse}"
    typography: "{typography.body-sm}"
    padding: "{spacing.sm}"
  connector-tile:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.micro-label}"
    rounded: "{rounded.tile}"
    padding: "{spacing.sm}"
  connector-tile-divider:
    backgroundColor: "{colors.border-subtle}"
    size: 1px
  support-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-card}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
  support-card-divider:
    backgroundColor: "{colors.border}"
    size: 1px
  security-card:
    backgroundColor: "{colors.surface-warm}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
  security-mark:
    backgroundColor: "{colors.accent-soft}"
    rounded: "{rounded.pill}"
    size: 32px
  onboarding-connect-button:
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "{spacing.md}"
    height: 34px
  team-segment-apricot:
    backgroundColor: "{colors.team-apricot}"
    textColor: "{colors.ink}"
    typography: "{typography.micro-label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  team-segment-blue:
    backgroundColor: "{colors.team-blue}"
    textColor: "{colors.ink}"
    typography: "{typography.micro-label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  team-segment-sage:
    backgroundColor: "{colors.team-sage}"
    textColor: "{colors.ink}"
    typography: "{typography.micro-label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
---

## Overview

- 暖灰白应用外壳、纯白内容画布、深色编辑式引导区构成三层层级。
- 铜色只用于进度、信任和微型故事细节；内容区域不用大面积高饱和色。
- 衬线字体只用于大号引导标题；其余界面使用无衬线字体和细边框。

## Colors

- `canvas` 用于应用外壳；`surface` 用于面板和支持卡；`surface-raised` 仅用于小型连接器磁贴；`surface-selected` 用于选中导航。
- `ink` 为品牌、导航和正文；`ink-muted` 为辅助信息；`border` 和 `border-subtle` 只用于低对比度结构线。
- `primary` 仅用于铜色进度与信任提示，不能作为页面底色或通用 CTA。
- `surface-warm`、`accent-soft` 仅用于安全卡及圆形信任标记。
- `surface-inverse`、`on-inverse`、`accent-gold` 仅用于深色引导画面。
- `team-apricot`、`team-blue`、`team-sage` 仅用于团队分类标签；不可扩展为状态色。

## Typography

- UI 字体：Figtree，中文回退为 PingFang SC、Hiragino Sans GB、Microsoft YaHei。
- 品牌为 28px/600；卡片标题为 15px/650；导航和正文为 14px；辅助文案与按钮为 13px；标签为 12px；连接器微标签为 9px。
- 引导大标题单独使用 EB Garamond / Songti / STSong，40px/400、1.08 行高、-0.035em 字距。
- 衬线字体不得用于导航、卡片、表格、表单或普通按钮。正文行高保持 1.45–1.6；只有 kicker 可使用 0.05em 字距。

## Layout

- 全视口双栏：左侧导航 196–224px，右侧为弹性内容区，顶部工具带高 40px。
- 主画布距顶部 40px、右侧和底部 16px，使用 24px 圆角与 1px 边线；仅内容画布滚动。
- Onboarding 使用 44px 横向页边距，纵向比例为：步骤 9%、引导区 51%、间隔 2%、支持卡 33%、尾部 5%。
- 支持卡网格为 `1.1fr / 1fr / 2.27fr`，间隙 10px；连接器磁贴为三列，间隙 6px。
- 间距以 4/8/12/16/24px 为基础；36px 用于深色引导区内边距，44px 仅用于页面边距。

## Elevation & Depth

- 常规界面不用投影，依靠暖色层次、白色承载面和 1px 边线建立层级。
- 深色引导区使用摄影画面和自左向右的黑色渐隐遮罩；文案始终放在遮罩最深的一侧。
- 支持卡、连接器磁贴、侧边导航和主画布不加阴影。

## Shapes

- 连接按钮 7px；常规控件 8px；连接器磁贴 9px；支持卡 16px；引导区 20px；主画布 24px。
- 全圆角只用于步骤圆点、信任标记、头像式群组图与短分类标签；普通按钮和卡片不得胶囊化。
- 边线统一 1px：`border` 用于面板/卡片，`border-subtle` 用于连接器磁贴；深色引导区内可使用半透明暖白分割线。
- 侧栏为约 21px 的线性图标；连接器使用真实品牌图标，引导区 27px、支持区 25px。

## Components

- **应用外壳与侧栏：** 保留暖色外壳和白色主画布的留白关系。选中导航为 40px 高、`surface-selected` 的低调圆角行；未选中项透明。
- **步骤进度：** 三个等宽步骤由细线连接。当前/完成步骤使用 25px 铜色圆点；不可用步骤保持浅色描边和禁用感，不使用粗进度条。
- **深色连接引导区：** 使用近黑摄影底图、金色 kicker、40px 衬线标题、暖白辅助文案和纵向连接器列表；不得改成冷蓝色仪表盘插画。
- **连接器行与按钮：** 深色区行高 56px，使用半透明分隔线、27px 品牌图标、两级文字和最小 86px × 34px 描边按钮。禁用的继续按钮保持低对比度。
- **支持卡：** 引导区下方固定三张平面卡：连接器矩阵、安全说明、团队头像与分类标签。安全卡可用暖白到浅桃色层次和一个铜色圆形标记；团队卡只保留微型铜色星芒/细线。
- **文字边界：** 卡片使用 `heading-card`，连接器磁贴使用 `micro-label`，只有深色引导标题使用 `display-editorial`。

## Do's and Don'ts

- Do：保持“暖色外壳 → 白色画布 → 深色引导区”的层级。
- Do：铜色只用于进度、信任提示和极小装饰；连接器使用真实品牌图标。
- Don't：使用冷灰 SaaS 底色、霓虹渐变、大面积状态色仪表盘或厚重卡片阴影。
- Don't：将 EB Garamond/Songti 用于密集业务 UI；不要把未定义状态补成具体组件规则。

## Known Gaps

- **未定义状态：** 加载、错误、空态、连接成功、确认弹窗、完成庆祝，以及其他业务页面状态。
- **响应式：** 移动端结构、断点、溢出和触控规则。
- **交互与动效：** hover、focus、pressed、弹窗过渡、连接器选择和禁用转可用动画。
- **字体：** 中文实际回退字体与按钮最终字重。
- **Token：** 摄影底图的综合色彩和透明度不作为可复用色彩 token。
