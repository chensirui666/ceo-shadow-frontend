import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

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
