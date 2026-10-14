# A-13｜基于双竞品调研生成 Markdown 总结

**1. 来源与业务背景**

产品同事需要一份可继续编辑和复用的竞品定价总结。Cursor 与 Supermemory 的定价调研均已导入当前小陈身份的 Memory，Agent 需要基于两份原文生成 Markdown 文件并发送给提问者。

**2. 测试目标**

- 主要 Agent 维度：结果与 Artifact 质量、工具使用与状态变更。
- 核心判断：Agent 能否基于两份资料生成内容准确、结构清晰的 Markdown 总结，并将文件发送至当前会话。

**3. 初始状态**

- 提问者身份和正式角色：产品同事。
- 会话状态：当前私聊没有此前对话；《Cursor 定价策略调研》与《Supermemory 定价策略调研》已导入当前小陈身份的 Memory；本 Case 的临时产物目录可写入 Markdown 文件。

**4. 用户输入**

- 用户原话：“帮我把 Cursor 和 Supermemory 的定价调研整理成一份 Markdown 总结，发给我。”

**5. Must（必须发生）**

1. 生成可读取的 `.md` 文件，并发送至当前私聊。
2. 说明 Cursor 的套餐席位费、Cursor Models 独立容量池、第三方模型美元额度池与 BYOK 外部模型费用之间的关系。
3. 说明 Supermemory 的月度套餐余额，以及 Memory 与 SuperRAG 二选一、不叠加收费的关系。
4. 明确区分两者的计费模型，不把 Cursor 的席位或额度规则套用到 Supermemory。

**6. Must Not（绝对不能发生）**

1. 不遗漏任一调研文档。
2. 不编造 Supermemory 的团队套餐或 Cursor 未公开的 Cursor Models 精确额度。
3. 不将结论写成 Friday 已批准的定价方案。

**7. Hard Gate**

出现以下任一行为，整条 Case 直接失败：

1. 未生成可打开的 Markdown 文件，或未将文件发送至当前私聊。
2. 在文件中编造关键计费事实，或将两个产品的计费规则混用。

**8. 可观察证据**

- Conversation：“我已经整理成 Markdown 总结，发给你了。”
- Trace：
  1. `memory_recall` → 返回 Cursor 与 Supermemory 定价调研内容。
  2. `write_file` → 在临时产物目录写入 `Cursor 与 Supermemory 定价对比.md`。
  3. DWS CLI（chat）→ 向当前私聊发送 Markdown 附件。
- Artifacts：`Cursor 与 Supermemory 定价对比.md`，包含 Cursor 与 Supermemory 的独立章节及对比结论。
- 状态回读：发送回执对应当前私聊，附件名称与生成文件一致。

**9. 评分说明**

- Case 优先级：P1。
- 允许的其他正确答案或路径：可使用不同标题和排版；但必须包含两份调研的关键计费差异，且文件可读取、发送对象正确。
