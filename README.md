# Friday Web

Friday 工作分身的 Web 前端原型，用于演示从首次配置到处理工作消息的主要体验。

## 当前包含

- 首次配置：连接工作来源、建立 Memory、确认工作风格和 Trial；
- Message：查看工作消息、处理状态、判断依据、结果与反馈；
- Tasks、Memory、Feedback 与 Settings 工作区；
- 中英文界面切换。

## 当前边界

这是一个本地前端演示项目。消息、任务、反馈和 Memory 使用本地示例数据；界面设置保存在浏览器本地。连接第三方应用、上传或读取真实文件、以及自动发送消息都尚未接入真实后端。

## 本地运行

先安装 Node.js（建议使用当前 LTS 版本），然后执行：

```bash
git clone https://github.com/chensirui666/ceo-shadow-frontend.git
cd ceo-shadow-frontend
npm install
npm run dev
```

终端会显示本地访问地址。若仓库保持私有，请先让项目所有者邀请你的 GitHub 账号。

## 常用命令

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

## 交付方式

- 开发协作：通过 GitHub 仓库获取完整源码与提交历史；
- 单次交付：在 GitHub 仓库页面选择 **Code → Download ZIP**；
- 版本里程碑：创建 GitHub Release 后，可下载该版本自动生成的 `Source code (zip)`；
- 产品需求文档：作为单独压缩包或附件交付，不与源码包混在一起。

项目采用 [Apache License 2.0](LICENSE)。
