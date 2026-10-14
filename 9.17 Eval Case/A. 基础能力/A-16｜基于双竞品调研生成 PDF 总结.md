# A-16｜基于双竞品调研生成 PDF 总结

**1. 来源与业务背景**

产品同事需要一份便于转发和打印的竞品定价 PDF。Cursor 与 Supermemory 的定价调研均已导入当前小陈身份的 Memory，Agent 需要基于两份原文生成 PDF 文件并发送给提问者。

**2. 测试目标**

- 主要 Agent 维度：结果与 Artifact 质量、工具使用与状态变更。
- 核心判断：Agent 能否将两份竞品调研整理成可打开、可阅读且事实准确的 PDF，并发送至当前会话。

**3. 初始状态**

- 提问者身份和正式角色：产品同事。
- 会话状态：当前私聊没有此前对话；《Cursor 定价策略调研》与《Supermemory 定价策略调研》已导入当前小陈身份的 Memory；本 Case 的临时产物目录可通过预置 PDF 生成脚本写入 PDF 文件。

**4. 用户输入**

- 用户原话：“帮我把 Cursor 和 Supermemory 的定价调研整理成 PDF，发给我。”

**5. Must（必须发生）**

1. 生成可打开的 `.pdf` 文件，并发送至当前私聊。
2. PDF 分别说明 Cursor 的席位订阅、两个用量池与 BYOK。
3. PDF 分别说明 Supermemory 的套餐余额、Memory / SuperRAG 的选择和搜索 / Operation 计费。
4. PDF 给出两者计费模型的对比总结，不将其表述为 Friday 的最终定价建议。

**6. Must Not（绝对不能发生）**

1. 不遗漏任一调研文档。
2. 不将 Supermemory 的 SM Token 计费写成 Cursor 的第三方模型美元额度。
3. 不编造任一产品未提供的团队、额度或价格信息。

**7. Hard Gate**

出现以下任一行为，整条 Case 直接失败：

1. 未生成可打开的 PDF 文件，或未将文件发送至当前私聊。
2. PDF 缺少任一竞品的核心计费结构，或包含关键虚构事实。

**8. 可观察证据**

- Conversation：“我已经把两份竞品定价调研整理成 PDF，发给你了。”
- Trace：
  1. `memory_recall` → 返回 Cursor 与 Supermemory 定价调研内容。
  2. `run_bash` → 调用预置 PDF 生成脚本，在临时产物目录输出 `Cursor 与 Supermemory 定价对比.pdf`。
  3. DWS CLI（chat）→ 向当前私聊发送 PDF 附件。
- Artifacts：`Cursor 与 Supermemory 定价对比.pdf`，可打开，包含两份调研的独立说明及对比结论。
- 状态回读：发送回执对应当前私聊，附件名称与生成文件一致。

**9. 评分说明**

- Case 优先级：P1。
- 允许的其他正确答案或路径：页数、版式和标题可以不同；但必须基于两份原文生成可读 PDF，且关键计费关系正确。
