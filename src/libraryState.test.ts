import assert from 'node:assert/strict'
import { test } from 'node:test'
import { collectLibraryFile, deleteLibraryFile, deliveryResult, libraryCategory, renameLibraryFile, selectLibraryFiles } from './libraryState.ts'
import type { LibraryFile } from './libraryState.ts'

const file = (id = 'file-1'): LibraryFile => ({
  id, name: '项目周报', extension: 'md', generatedAt: '2026-09-13T10:00:00Z',
  url: '/samples/report.md', source: { kind: 'routine', id: 'routine-1', recordId: 'run-1', name: '每周工作总结', available: true },
  deliveries: [],
})

test('collects formal files once across delivery retries, preserving separate generations', () => {
  assert.deepEqual(collectLibraryFile([], file(), false), [])
  const first = collectLibraryFile([], file(), true)
  const retried = collectLibraryFile(first, { ...file(), deliveries: [{ connector: '钉钉', targetId: 'group-1', targetName: '项目组', status: 'sent' }] }, true)
  assert.equal(retried.length, 1)
  assert.equal(retried[0].deliveries[0].status, 'sent')
  const next = collectLibraryFile(retried, file('file-2'), true)
  assert.equal(next.length, 2)
  assert.equal(collectLibraryFile(next, { ...file('other'), extension: 'zip' }, true).length, 3)
  assert.throws(() => collectLibraryFile([], { ...file(), url: '' }, true))
})

test('searches names only, intersects source and category, and sorts by full generation time', () => {
  const files = [file(), { ...file('new'), name: 'REPORT', generatedAt: '2026-09-13T11:00:00Z', extension: 'pdf' }]
  assert.deepEqual(selectLibraryFiles(files, '', 'all', 'all').map((item) => item.id), ['new', 'file-1'])
  assert.deepEqual(selectLibraryFiles(files, ' report ', 'routine', 'document').map((item) => item.id), ['new'])
  assert.equal(selectLibraryFiles(files, '每周工作总结', 'all', 'all').length, 0)
  assert.equal(selectLibraryFiles(files, 'report', 'message', 'all').length, 0)
  assert.equal(selectLibraryFiles(files, 'report', 'routine', 'spreadsheet').length, 0)
  assert.equal(files[0].id, 'file-1')
})

test('groups extensions into user-facing categories without losing unknown formats', () => {
  for (const extension of ['pdf', 'docx', 'md', 'markdown', 'txt', 'html', 'htm']) assert.equal(libraryCategory(extension), 'document')
  for (const extension of ['xlsx', 'csv']) assert.equal(libraryCategory(extension), 'spreadsheet')
  assert.equal(libraryCategory('pptx'), 'presentation')
  for (const extension of ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']) assert.equal(libraryCategory(extension), 'image')
  for (const extension of ['json', 'py', 'js', 'ts', 'css', 'yaml']) assert.equal(libraryCategory(extension), 'code')
  assert.equal(libraryCategory('.PDF'), 'document')
  assert.equal(libraryCategory('zip'), 'other')
  assert.equal(selectLibraryFiles([{ ...file(), extension: 'zip' }], '', 'all', 'other').length, 1)
})

test('renames without changing extension, source, deliveries or generation time', () => {
  const original = [file()]
  const renamed = renameLibraryFile(original, 'file-1', ' 新名称 ')
  assert.deepEqual(renamed[0], { ...file(), name: '新名称' })
  assert.equal(original[0].name, '项目周报')
  assert.throws(() => renameLibraryFile(original, 'file-1', '  '))
  assert.throws(() => renameLibraryFile(original, 'file-1', '../report'))
  assert.throws(() => renameLibraryFile(original, 'missing', 'name'))
})

test('blocks deletion when any target is sending and retains files on failure', () => {
  const sending = { ...file(), deliveries: [{ connector: '钉钉', targetId: 'group-1', targetName: '项目组', status: 'sending' as const }] }
  const files = [sending, file('other')]
  assert.throws(() => deleteLibraryFile(files, sending.id), /sending/)
  assert.equal(files.length, 2)
  assert.deepEqual(deleteLibraryFile(files, 'other'), [sending])
  assert.throws(() => deleteLibraryFile(files, 'missing'))
})

test('delivery results distinguish not sent, sending, sent, partial failure, failure and unknown', () => {
  const deliveries = (...statuses: Array<'sending' | 'sent' | 'failed' | 'unknown'>) => statuses.map((status, index) => ({ connector: '钉钉', targetId: String(index), targetName: String(index), status }))
  assert.equal(deliveryResult([]), 'not-sent')
  assert.equal(deliveryResult(deliveries('sending', 'sent')), 'sending')
  assert.equal(deliveryResult(deliveries('sent', 'sent')), 'sent')
  assert.equal(deliveryResult(deliveries('sent', 'failed')), 'partial')
  assert.equal(deliveryResult(deliveries('failed', 'failed')), 'failed')
  assert.equal(deliveryResult(deliveries('unknown', 'sent')), 'unknown')
})
