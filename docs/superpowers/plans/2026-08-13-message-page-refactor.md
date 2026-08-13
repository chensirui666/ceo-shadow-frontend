# Message 页面改造实施计划

> **执行方式：** 用户已明确要求在新 worktree 直接开始改造；本计划确认后在当前分支内执行。

## 目标

将当前 Home 运行面板替换为以 Message 为中心的桌面页面，使用户能在同一信息流中看到外部问题、Friday 的判断和处理结果，并进入两栏详情查看完整案卷。视觉布局遵循已写入 Message PRD 的北极星：左侧导航、中央主信息流／详情阅读列、右侧辅助栏／操作栏。

本次仅改造 Message。Task 保留当前实现，导航文案会改为`Task`，但不提前实现尚未确定视觉方向的 Task 页面。

## 当前代码边界

- `src/components/Workspace.tsx` 在内部 `home` 路由渲染 `HomeWorkspace`；该路由可以继续用于兼容既有会话，但用户可见名称要改为`Message`。
- `src/homeState.ts`、`src/homeService.ts` 和 `Home*` 组件是旧的本地演示运行面板，包含运行模式、自动推进和 24 小时图表，不符合新的 Message 定义。
- Onboarding 仍依赖旧 Home fixture 类型；为了不扩大本次范围，新的 Message 数据层独立接入 Workspace，旧 Home 文件暂不删除。
- 所有数据仍是本地演示。确认、跳过、重试、点赞和点踩只能更新浏览器内的 Message fixture，不能声称已对钉钉、飞书等真实渠道执行动作。

## 实施步骤

### Task 1: 建立 Message 的最小本地数据边界

**文件：**
- 新增 `src/messageState.ts`
- 新增 `src/messageService.ts`
- 新增 `src/messageState.test.ts`
- 新增 `src/messageService.test.ts`

**先写失败测试：**

1. fixture 默认按接收时间倒序；状态筛选和状态数量只基于同一组 Message。
2. `确认`只将`待确认` Message 变为`已处理`；`跳过`只变为`已跳过`，都不改变关联 Task 汇总。
3. 点赞和点踩原因仅写到 Message 的本地反馈记录，不改写问题、判断依据或处理结果。
4. service 每次动作返回新 snapshot，之前 load 的 snapshot 不被修改。

**实现：**

- 定义 Message 所需的最小字段：来源、类别、对象、发起人、接收时间、状态、问题、判断依据、处理结果、Task 汇总、引用、时间线和本地反馈。
- fixture 覆盖待确认、处理中、已处理、已跳过和失败，以便呈现全部行内操作；来源只使用当前前端已支持的演示来源。
- 不引入后端、持久化、自动处理计时器或跨 Message 的任务管理逻辑。

### Task 2: 以测试驱动实现列表和详情组件

**文件：**
- 新增 `src/components/MessageWorkspace.tsx`
- 新增 `src/components/MessageList.tsx`
- 新增 `src/components/MessageDetail.tsx`
- 新增 `src/messageComponents.test.ts`
- 新增 `src/messageWorkspace.test.ts`
- 修改 `src/messageState.ts`
- 修改 `src/messageState.test.ts`

**先写失败测试：**

1. 先补齐缺失的`待处理` Message 状态和 fixture，确保 PRD 的六种状态都能被 Tab 呈现；不改变既有确认、跳过和反馈的行为。
2. 列表包含标题、完整状态 Tab、固定五列标题，以及`待确认` Message 的确认／跳过操作。
3. 有处理结果的卡片包含点赞／点踩；点踩控件能够显示原因输入和提交入口。
4. 详情的 DOM 阅读顺序为问题、判断依据、回答／处理结果、关联 Task、反馈、折叠的处理依据；不渲染原始思维链或技术日志。
5. 详情右栏包含操作、Message 信息、Task 汇总和活动时间线；按状态只显示适用操作。
6. 页面初始加载和空态保持可读。

**实现：**

- `MessageWorkspace` 只管理加载、状态筛选、选中详情和本地演示动作；不再使用旧运行模式、来源下拉、自动推进或活动图表。
- `MessageList` 渲染统一高度的五列卡片；问题与处理结果使用 CSS 截断，hover／focus 展示全文；点卡片进详情，行内按钮阻止冒泡。
- 列表右侧栏只基于当前 snapshot 计算快捷筛选、来源数和简单数字摘要，不制作图表或假数据入口。
- `MessageDetail` 做成主阅读列与右侧操作列；引用区域使用原生 `<details>` 折叠，成果物只在 fixture 有对应结果时显示紧凑入口。

### Task 3: 接入工作区与用户可见文案

**文件：**
- 修改 `src/components/Workspace.tsx`
- 修改 `src/components/MessageWorkspace.tsx`
- 修改 `src/components/MessageList.tsx`
- 修改 `src/components/MessageDetail.tsx`
- 修改 `src/components/MessageFeedbackControls.tsx`
- 修改 `src/content/translations.ts`
- 必要时修改 `src/components/Icon.tsx`
- 修改 `src/messageComponents.test.ts`
- 修改 `src/messageWorkspace.test.ts`
- 修改／新增对应 Workspace SSR 测试

**先写失败测试：**

1. 已完成 onboarding 的 `home` 路由渲染 Message 加载态，而不是旧的最近事件文案。
2. 左侧导航对用户显示`Message`和`Task`；Message 页面自己显示标题，不再叠加“欢迎回来”。

**实现：**

- 保留内部路由键 `home`，避免破坏现有本地会话；只替换它的可见文案和所渲染组件。
- 建立 session 级 `MessageService`，让列表与详情的本地操作在页面内保持一致。
- 补齐中英文的 Message 标题、状态、类别、动作、空态和辅助栏文案；通过 Message 组件的 `copy` 入参消费这些文案，移除本页面对“自动发送”“运行模式”的可见承诺。
- 不改变 Onboarding、Memory、Feedback 和当前 Task 的逻辑。

### Task 4: 用最少 CSS 完成两套桌面布局

**文件：**
- 修改 `src/index.css`
- 修改 `src/components/MessageList.tsx`
- 修改 `src/components/MessageDetail.tsx`
- 修改 `src/messageComponents.test.ts`

**实现：**

- 先用最小结构补足北极星所需但现有组件没有的分区：列表右栏只展示可由当前 fixture 推导的快捷筛选（待确认、处理失败）、来源概览和数字摘要；详情标题下显示已知元信息。不展示“我创建的”“收藏”等缺少数据支撑的伪筛选，不新增外部动作。
- 复用现有 workspace shell、左侧导航、画布和 HeroUI Button；新增紧凑的 `.message-*` 样式。
- 列表页使用主列优先、右侧固定宽辅助栏的 grid；详情页使用较宽阅读列和窄操作栏的 grid。
- 在窄窗口将右栏下移到主内容之后；五列卡片保持列顺序，保证键盘聚焦和文字截断可用。
- 不新增 UI 库、不制定颜色 token、不重做全局 shell。

### Task 5: 验证与可视检查

1. 先在新 worktree 运行 `npm install`、`npm test` 记录基线。
2. 每一阶段执行新增测试；最终运行 `npm test`、`npm run typecheck`、`npm run build` 和 `git diff --check`。
3. 启动 Vite，用浏览器检查 Message 列表、待确认行内动作、点踩输入、详情返回和窄宽布局；截图仅作为视觉核验，不作为真实渠道行为证明。
4. 提交时只纳入 Message PRD、实施计划和本次 Message 改造文件，不带入原工作区的未提交 onboarding 文件。

## 明确不做

- 真实渠道收取、外发、通知、搜索、连接器授权或发送门禁；
- Task 页面重做、Task 完成状态联动或自动完成判断；
- 将 Message 点踩的本地演示数据接入现有 Feedback 仪表盘；
- 图表、趋势报告、手动新建 Message、复杂筛选保存和跨来源搜索。
