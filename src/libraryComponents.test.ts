import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { createLibrarySamples, createLibraryService } from './libraryService.ts'
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

test('Library chrome follows the selected language', async () => {
  const { default: LibraryWorkspace } = await vite.ssrLoadModule('/src/components/LibraryWorkspace.tsx')
  const html = renderToStaticMarkup(createElement(LibraryWorkspace, {
    locale: 'zh', service: createLibraryService(), onOpenSource: () => {},
  }))

  assert.match(html, /<h1>资料库<\/h1>/)
  assert.match(html, /本周与 Friday 一起完成/)
  assert.match(html, /本周创建了 12 项 <em>成果<\/em>/)
  assert.match(html, /5 份文档 · 3 份报告 · 4 个文件/)
  assert.match(html, />日程</)
  assert.doesNotMatch(html, />Library</)
  assert.doesNotMatch(html, /THIS WEEK WITH FRIDAY|12 things/)
})
