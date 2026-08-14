# Agent CLI Onboarding Cancellation Addendum

## Scope

This addendum changes the approved current frontend-only Onboarding interaction. It overrides the earlier P0 proposal that cancellation lives in Settings: cancellation belongs in step 1, “选择 Agent”.

## Row behavior

All three rows begin as “未下载”. A completed local download changes only that row to “已下载”; downloading more than one Agent remains allowed because the exclusive condition is connection, not download.

| Row state | Right-side action | Result |
| --- | --- | --- |
| 未下载 | 下载 | Confirm, show local progress, then become 已下载. |
| 已下载，尚无 Agent 已连接 | 选择 | Run the local connection interaction; Pi first asks for a provider. |
| 已连接 | 取消连接 | Ask for confirmation before clearing this local selection. |
| 已下载，另一个 Agent 已连接 | 选择（置灰） | Do not connect. On hover or keyboard focus, explain which Agent must be cancelled first. |

The disabled choose button is wrapped in a focusable explanatory element. A disabled button cannot itself receive keyboard focus, so the same lock explanation remains available without a mouse.

## Cancellation and gate

Choosing “取消连接” opens a confirmation dialog. Confirming changes the selected Agent from “已连接” back to “已下载”, clears the selection, and returns the flow to step 1. It does not uninstall a CLI, log the user out, or delete source, Memory, Message, or work-style data.

Step 1’s “确认并继续” button stays disabled until exactly one Agent has `connected` status. The state transition to step 2 validates the same condition, so step navigation cannot bypass the requirement. Cancellation immediately locks steps 2–4 again.

## Current-version truthfulness

This is local frontend state only. The UI does not scan, install, log in to, authorize, configure, or health-check any CLI; it also does not collect an API key. The confirmation dialog explicitly says that it clears only the local Onboarding selection.
