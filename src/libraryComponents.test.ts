import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { createLibrarySamples } from './libraryService.ts'
import { libraryCopy } from './content/libraryCopy.ts'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: false, middlewareMode: true } })
after(() => vite.close())

test('library rows show format icons, file names, formats and full dates without sources', async () => {
  const { default: LibraryList } = await vite.ssrLoadModule('/src/components/LibraryList.tsx')
  const html = renderToStaticMarkup(createElement(LibraryList, {
    files: createLibrarySamples(), copy: libraryCopy.zh, locale: 'zh', selectedId: null,
    editingId: null, draft: '', error: '', busy: false, onOpen: () => {}, onAction: () => {}, onDraft: () => {}, onSave: () => {}, onCancel: () => {},
  }))
  assert.match(html, /本周上线检查清单/)
  assert.match(html, /library-format[^>]*>.*?PDF</)
  assert.match(html, /<time[^>]*>2026-09-\d{2}</)
  assert.match(html, /lucide-file-spreadsheet/)
  assert.doesNotMatch(html, /客户交付群|项目频道|原日程已删除|发送中|<table|<th/)
})
