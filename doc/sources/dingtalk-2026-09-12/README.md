# 钉钉 PRD 同步记录

拉取日期：2026-09-12（Asia/Shanghai）。三份在线原文均已完整读取，接口返回 success、complete=true。原有本地 PRD 未覆盖；本目录保存正文和原始读取回执。

| 文档 | 在线原文 | 云端修改时间（北京时间） | 本地正文 |
| --- | --- | --- | --- |
| Message | https://alidocs.dingtalk.com/i/nodes/m9bN7RYPWdbednwAijXE2v45JZd1wyK0 | 2026-09-09 14:51:01 | message.md |
| Onboarding | https://alidocs.dingtalk.com/i/nodes/mExel2BLV5xpQm0wsp3z7jQRWgk9rpMq | 2026-09-10 14:26:52 | onboarding.md |
| Settings | https://alidocs.dingtalk.com/i/nodes/P7QG4Yx2JpEnpRkgiqXmPPaG89dEq3XD | 2026-08-25 16:33:01 | settings.md |

检索完整读取了三个 PRD 标题的匹配结果。两套在线同名文档位于不同知识库；带 -copy 的正文均明确链接到上表原文。Settings 副本修改时间为 2026-09-08，但除原文链接和临时图片地址外正文一致；因此不能凭副本修改时间判断内容更新。Message 原文新增私聊全部消息及待处理消息撤回后跳过规则；Onboarding 原文新增“一期可暂时仅支持连接一个 connector”。正文头部版本日期未同步更新，不作为实际修改时间。

## 对 Routine 与 Library 的设计影响

- Message 定义为外部工作信息及其处理结果；MVP 群聊明确 @ 本人、私聊所有信息进入。Routine 定时执行记录不应未经确认就归入 Message。
- Settings 已合并入 Friday 全局设置，保留 General 和 How Friday works for you；支持个人 Prompt 编辑及后台重新蒸馏风格。
- Onboarding 与 Friday 已连接应用状态同步；Memory 和风格生成在后台执行，完成初始化不等于任务完成或授权外发。
- Onboarding 规定原始资料不建长期副本；Library 存放 Agent 生成的 artifacts，与原始资料库需区分。

## 原文中尚未统一的规则

1. Connector：2.1 支持多个活动 Connector；5.2 支持多个不同 Connector、每种一个账号，另有“一期可暂时仅支持连接一个”；5.1、Memory 隔离及验收仍保留单活动身份。需要确认 Routine 本期采用哪种口径。
2. 完成提醒：后台通知表写时钟红点，后文验收写只有铃铛出现红点。尚不能作为 Routine 通知入口的确定依据。
3. 工作风格：Teams 新增段落写同一用户统一个人风格，旧隔离段落仍写不同身份工作方式隔离。

上述为正文冲突记录，不擅自修改云端或认定新功能已实现。
