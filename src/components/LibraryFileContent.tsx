import { useEffect, useState } from 'react'
import { Button, Table, Tabs } from '@heroui/react'
import type { Locale } from '../appState.ts'
import type { LibraryFile } from '../libraryState.ts'
import { loadLibraryBlob, previewKind, readLibrarySheets } from '../libraryPreview.ts'

const frameDocument = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; font-src data: blob:; media-src data: blob:;"><style>
*{box-sizing:border-box}body{margin:0;padding:24px;color:#242422;background:#fff;font:15px/1.7 system-ui,sans-serif;overflow-wrap:anywhere}h1{font-size:26px}h2{font-size:20px}h3{font-size:17px}img,svg{max-width:100%}pre{overflow:auto;background:#f4f2ec;padding:16px;font-size:13px}table{border-collapse:collapse;max-width:100%;font-size:13px}td,th{border:1px solid #e7e4dc;padding:8px;text-align:left}blockquote{margin-left:0;padding-left:16px;border-left:3px solid #e7e4dc;color:#6f6d67}a{color:#176c69}.docx-wrapper{padding:0!important;background:white!important}.docx-wrapper>section.docx{box-shadow:none!important;margin:0 auto 20px!important;max-width:100%;padding:24px!important}.docx-wrapper section{overflow-wrap:anywhere}body.office{padding:12px}
</style></head><body></body></html>`

function DocumentFrame({ blob, kind, title, locale, onError }: { blob: Blob; kind: string; title: string; locale: Locale; onError: () => void }) {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!frame?.contentDocument) return
    let active = true
    let destroy = () => {}
    const doc = frame.contentDocument
    const render = async () => {
      doc.body.replaceChildren()
      if (kind === 'docx') {
        const { renderAsync } = await import('docx-preview')
        if (!active) return
        doc.body.className = 'office'
        const styles = doc.createElement('div')
        doc.head.append(styles)
        await renderAsync(await blob.arrayBuffer(), doc.body, styles, { ignoreWidth: true, useBase64URL: true, ignoreLastRenderedPageBreak: false })
      } else if (kind === 'pptx') {
        const { PptxViewer, RECOMMENDED_ZIP_LIMITS } = await import('@aiden0z/pptx-renderer')
        if (!active) return
        doc.body.className = 'office'
        const container = doc.createElement('div')
        doc.body.append(container)
        const viewer = await PptxViewer.open(await blob.arrayBuffer(), container, { zipLimits: RECOMMENDED_ZIP_LIMITS, pdfjs: false, onSlideError: onError })
        destroy = () => viewer.destroy()
        if (!active) destroy()
      } else {
        const { default: DOMPurify } = await import('dompurify')
        const text = await blob.text()
        const html = kind === 'markdown' ? (await import('marked')).marked.parse(text, { async: false }) : text
        if (!active) return
        doc.body.innerHTML = DOMPurify.sanitize(html, { ADD_TAGS: ['style'], FORBID_TAGS: ['form', 'iframe', 'object', 'embed', 'base'], FORBID_ATTR: ['srcdoc'] })
      }
    }
    void render().then(() => { if (active) setLoading(false) }).catch(() => { if (active) onError() })
    return () => { active = false; destroy() }
  }, [blob, frame, kind, onError])
  return <div className="library-rendered-document">{loading && <p className="library-document-loading" role="status">{locale === 'zh' ? '正在加载预览…' : 'Loading preview…'}</p>}<iframe className="library-document-frame" onLoad={(event) => setFrame(event.currentTarget)} sandbox="allow-same-origin" srcDoc={frameDocument} style={{ visibility: loading ? 'hidden' : 'visible' }} title={title} /></div>
}

function SpreadsheetContent({ blob, extension, locale, onError }: { blob: Blob; extension: string; locale: Locale; onError: () => void }) {
  const [sheets, setSheets] = useState<Array<{ name: string; rows: string[][] }> | null>(null)
  const [sheetIndex, setSheetIndex] = useState(0)
  useEffect(() => {
    let active = true
    void readLibrarySheets(blob, extension).then((result) => { if (active) setSheets(result) }).catch(() => { if (active) onError() })
    return () => { active = false }
  }, [blob, extension, onError])
  if (!sheets) return <p role="status">{locale === 'zh' ? '正在读取表格…' : 'Reading spreadsheet…'}</p>
  const sheet = sheets[sheetIndex]
  const columns = Array.from({ length: sheet.rows.reduce((count, row) => Math.max(count, row.length), 1) }, (_, index) => index)
  return <Tabs className="library-sheet" selectedKey={sheetIndex} onSelectionChange={(key) => setSheetIndex(Number(key))}>
    <Tabs.ListContainer><Tabs.List aria-label={locale === 'zh' ? '工作表' : 'Worksheets'}>{sheets.map((item, index) => <Tabs.Tab id={index} key={index}>{item.name}<Tabs.Indicator /></Tabs.Tab>)}</Tabs.List></Tabs.ListContainer>
    <Tabs.Panel className="library-sheet-scroll" id={sheetIndex}>
      <Table><Table.ScrollContainer><Table.Content aria-label={sheet.name}><Table.Header className="sr-only">{columns.map((index) => <Table.Column id={`column-${index}`} isRowHeader={index === 0} key={index}>{index + 1}</Table.Column>)}</Table.Header><Table.Body>{sheet.rows.map((row, rowIndex) => <Table.Row id={`row-${rowIndex}`} key={rowIndex}>{columns.map((colIndex) => <Table.Cell key={colIndex}>{row[colIndex] ?? ''}</Table.Cell>)}</Table.Row>)}</Table.Body></Table.Content></Table.ScrollContainer></Table>
      {!sheet.rows.length && <p>{locale === 'zh' ? '空白工作表' : 'Empty worksheet'}</p>}
    </Tabs.Panel>
  </Tabs>
}

function LoadedContent({ blob, file, locale, onError }: { blob: Blob; file: LibraryFile; locale: Locale; onError: () => void }) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const kind = previewKind(file.extension)
  useEffect(() => {
    const mime = kind === 'pdf' ? 'application/pdf' : file.extension.toLowerCase() === 'svg' ? 'image/svg+xml' : blob.type
    const objectUrl = URL.createObjectURL(new Blob([blob], { type: mime }))
    setUrl(objectUrl)
    let active = true
    if (kind === 'text') void blob.text().then((value) => { if (active) setText(value) }).catch(onError)
    return () => { active = false; URL.revokeObjectURL(objectUrl) }
  }, [blob, file.extension, kind, onError])
  if (kind === 'text') return <pre className="library-text-content">{text}</pre>
  if (kind === 'image') return url && <div className="library-image-content"><img alt={file.name} onError={onError} src={url} /></div>
  if (kind === 'pdf') return url && <iframe className="library-document-frame" src={`${url}#toolbar=0&navpanes=0&view=FitH`} title={file.name} />
  if (kind === 'spreadsheet') return <SpreadsheetContent blob={blob} extension={file.extension} locale={locale} onError={onError} />
  return <DocumentFrame blob={blob} kind={kind} locale={locale} onError={onError} title={file.name} />
}

export default function LibraryFileContent({ file, locale, onMissing }: { file: LibraryFile; locale: Locale; onMissing: (id: string) => void }) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [renderError] = useState(() => () => setError('preview-failed'))
  useEffect(() => {
    const controller = new AbortController()
    setBlob(null)
    setError('')
    void loadLibraryBlob(file, controller.signal).then((value) => { if (!controller.signal.aborted) setBlob(value) }).catch((reason) => {
      if (controller.signal.aborted) return
      const message = reason instanceof Error ? reason.message : 'load-failed'
      if (message === 'not-found') onMissing(file.id)
      else setError(message)
    })
    return () => controller.abort()
  }, [file.id, file.url, file.extension, attempt, onMissing])
  const zh = locale === 'zh'
  if (error) return <div className="library-preview-state" role="alert"><p>{error === 'forbidden' ? (zh ? '你没有权限查看此文件。' : 'You do not have permission to view this file.') : error === 'not-found' ? (zh ? '文件不存在或已被删除。' : 'This file no longer exists.') : (zh ? '无法加载文件预览，请重试或下载原文件查看。' : 'Preview could not load. Retry or download the original file.')}</p><Button onPress={() => setAttempt((value) => value + 1)} variant="secondary">{zh ? '重试' : 'Retry'}</Button></div>
  if (!blob) return <p className="library-preview-state" role="status">{zh ? '正在加载文件…' : 'Loading file…'}</p>
  if (previewKind(file.extension) === 'unsupported') return <p className="library-preview-state">{zh ? '此格式暂不支持预览，可下载原文件查看。' : 'Preview is unavailable for this format. Download the original file to view it.'}</p>
  return <LoadedContent blob={blob} file={file} locale={locale} onError={renderError} />
}
