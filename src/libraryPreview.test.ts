import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { test } from 'node:test'
import { loadLibraryBlob, previewKind, readLibrarySheets } from './libraryPreview.ts'

test('routes every agreed format to a real renderer and leaves unsupported binaries untouched', () => {
  for (const extension of ['pdf', 'docx', 'pptx']) assert.equal(previewKind(extension), extension)
  for (const extension of ['md', 'markdown']) assert.equal(previewKind(extension), 'markdown')
  for (const extension of ['xlsx', 'csv']) assert.equal(previewKind(extension), 'spreadsheet')
  for (const extension of ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']) assert.equal(previewKind(extension), 'image')
  for (const extension of ['txt', 'json', 'py', 'js', 'ts']) assert.equal(previewKind(extension), 'text')
  assert.equal(previewKind('html'), 'html')
  assert.equal(previewKind('zip'), 'unsupported')
  assert.equal(previewKind('doc'), 'unsupported')
})

test('CSV preserves UTF-8 Chinese text and quoted commas', async () => {
  const sheets = await readLibrarySheets(new Blob(['检查项,说明\n文件预览,"包含表格、图片和文档"\n']), 'csv')
  assert.deepEqual(sheets[0].rows, [['检查项', '说明'], ['文件预览', '包含表格、图片和文档']])
})

test('file requests distinguish missing, forbidden and server fallback pages from file bytes', async () => {
  const server = createServer((request, response) => {
    if (request.url === '/missing') { response.writeHead(404); response.end(); return }
    if (request.url === '/forbidden') { response.writeHead(403); response.end(); return }
    if (request.url === '/fallback') { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end('<html>app</html>'); return }
    response.writeHead(200, { 'Content-Type': 'text/plain' }); response.end('Complete file content')
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address() as { port: number }
    const url = `http://127.0.0.1:${address.port}`
    assert.equal(await (await loadLibraryBlob({ url, extension: 'txt' })).text(), 'Complete file content')
    await assert.rejects(loadLibraryBlob({ url: `${url}/missing`, extension: 'pdf' }), /not-found/)
    await assert.rejects(loadLibraryBlob({ url: `${url}/forbidden`, extension: 'pdf' }), /forbidden/)
    await assert.rejects(loadLibraryBlob({ url: `${url}/fallback`, extension: 'pdf' }), /invalid-file/)
    assert.match(await (await loadLibraryBlob({ url: `${url}/fallback`, extension: 'html' })).text(), /app/)
  } finally { await new Promise<void>((resolve) => server.close(() => resolve())) }
})
