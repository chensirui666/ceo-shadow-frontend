import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import type { FridaySettings } from './settingsState.ts'

const { translations } = await import('./content/translations.ts')
const settingsState = await import('./settingsState.ts')
const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: false, middlewareMode: true } })
after(() => vite.close())

test('connected apps presents a local Teams connection alongside existing connectors', async () => {
  const { default: SettingsAppsPanel } = await vite.ssrLoadModule('/src/components/SettingsAppsPanel.tsx')
  const html = renderToStaticMarkup(createElement(SettingsAppsPanel, {
    busyConnector: null,
    confirmation: null,
    copy: translations.zh.workspace.settings,
    notice: '',
    onConnect: () => {},
    onRequestDisconnect: () => {},
    saved: settingsState.createDefaultSettings(),
  }))

  assert.match(html, />Teams</)
  assert.match(html, /团队聊天、频道与共享文件/)
  assert.match(html, />连接Teams</)
})

test('profile replaces its three summaries and auxiliary links with one editable prompt', async () => {
  const { default: SettingsProfilePanel } = await vite.ssrLoadModule('/src/components/SettingsProfilePanel.tsx')
  const draft = settingsState.createDefaultSettings()
  const html = renderToStaticMarkup(createElement(SettingsProfilePanel, {
    confirmation: null,
    copy: translations.zh.workspace.settings,
    draft,
    notice: '',
    onSave: () => {},
    onUpdateDraft: (update: (current: FridaySettings) => FridaySettings) => update(draft),
  }))

  assert.match(html, /<textarea[^>]*aria-label="Prompt"/)
  assert.match(html, /先看目标与事实；信息不足先追问；不轻易替人承诺。/)
  for (const removed of ['我的判断方式', '我的表达方式', '我的工作边界', '安全边界', '去工作记忆查看来源', '去反馈校准不准确的地方']) assert.doesNotMatch(html, new RegExp(removed))
})
