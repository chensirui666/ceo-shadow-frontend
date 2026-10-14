# A-17｜基于双竞品调研生成 Word 总结

**1. 来源与业务背景**

产品同事需要一份可继续编辑的竞品定价 Word 报告。Cursor 与 Supermemory 的定价调研均已导入当前小陈身份的 Memory，Agent 需要基于两份原文生成 Word 文件并发送给提问者。

**2. 测试目标**

- 主要 Agent 维度：结果与 Artifact 质量、工具使用与状态变更。
- 核心判断：Agent 能否将两份竞品调研整理成内容准确、结构可编辑的 Word 文档，并发送至当前会话。

**3. 初始状态**

- 提问者身份和正式角色：产品同事。
- 会话状态：当前私聊没有此前对话；《Cursor 定价策略调研》与《Supermemory 定价策略调研》已导入当前小陈身份的 Memory；本 Case 的临时产物目录可通过预置 Word 生成脚本写入 Word 文件。

**4. 用户输入**

- 用户原话：“帮我把 Cursor 和 Supermemory 的定价调研整理成一份 Word 文档，发给我。”

**5. Must（必须发生）**

1. 生成可打开、可编辑的 `.docx` 文件，并发送至当前私聊。
2. 文档有 Cursor、Supermemory 和对比总结三个清晰章节。
3. Cursor 章节说明订阅费、两个用量池、BYOK 与超额按量付费。
4. Supermemory 章节说明套餐余额、纯文本与富内容的不同单价，以及重复内容不重复收费。

**6. Must Not（绝对不能发生）**

1. 不遗漏任一调研文档。
2. 不把 Supermemory 的 Memory 与 SuperRAG 表述为同一内容会同时收取两次费用。
3. 不将文档写成 Friday 已决定的定价方案。

**7. Hard Gate**

出现以下任一行为，整条 Case 直接失败：

1. 未生成可打开、可编辑的 Word 文件，或未将文件发送至当前私聊。
2. 文档将竞品的关键计费逻辑写错或混用。

**8. 可观察证据**

- Conversation：“我已经整理成可编辑的 Word 文档，发给你了。”
- Trace：
  1. `memory_recall` → 返回 Cursor 与 Supermemory 定价调研内容。
  2. `run_bash` → 调用预置 Word 生成脚本，在临时产物目录输出 `Cursor 与 Supermemory 定价对比.docx`。
  3. DWS CLI（chat）→ 向当前私聊发送 Word 附件。
- Artifacts：`Cursor 与 Supermemory 定价对比.docx`，可编辑，包含两份调研的独立章节和对比总结。
- 状态回读：发送回执对应当前私聊，附件名称与生成文件一致。

**9. 评分说明**

- Case 优先级：P1。
- 允许的其他正确答案或路径：段落、标题样式和对比表形式可以不同；但三个章节、关键计费事实与可编辑性必须满足。
