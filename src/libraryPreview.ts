import { libraryCategory } from './libraryState.ts'
import type { LibraryFile } from './libraryState.ts'

export const previewKind = (extension: string) => {
  const ext = extension.toLowerCase().replace(/^\./, '')
  if (ext === 'pdf' || ext === 'docx' || ext === 'pptx') return ext
  if (['md', 'markdown'].includes(ext)) return 'markdown'
  if (['html', 'htm'].includes(ext)) return 'html'
  if (['xlsx', 'xls', 'csv', 'tsv', 'ods'].includes(ext)) return 'spreadsheet'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'avif'].includes(ext)) return 'image'
  if (ext === 'txt' || libraryCategory(ext) === 'code') return 'text'
  return 'unsupported'
}

export const loadLibraryBlob = async (file: Pick<LibraryFile, 'url' | 'extension'>, signal?: AbortSignal): Promise<Blob> => {
  const response = await fetch(file.url, { signal })
  if (response.status === 404 || response.status === 410) throw new Error('not-found')
  if (response.status === 401 || response.status === 403) throw new Error('forbidden')
  if (!response.ok) throw new Error('load-failed')
  if (response.headers.get('content-type')?.includes('text/html') && previewKind(file.extension) !== 'html') throw new Error('invalid-file')
  return response.blob()
}

export const readLibrarySheets = async (blob: Blob, extension: string): Promise<Array<{ name: string; rows: string[][] }>> => {
  const XLSX = await import('xlsx')
  const text = ['csv', 'tsv'].includes(extension.toLowerCase())
  const workbook = text ? XLSX.read(await blob.text(), { type: 'string' }) : XLSX.read(await blob.arrayBuffer(), { type: 'array' })
  if (!workbook.SheetNames.length) throw new Error('empty-workbook')
  return workbook.SheetNames.map((name) => ({ name, rows: XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[name], { header: 1, raw: false, defval: '' }) }))
}

export const downloadLibraryFile = async (file: LibraryFile): Promise<void> => {
  const blob = await loadLibraryBlob(file)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${file.name}.${file.extension}`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
