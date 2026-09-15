export type LibrarySource = {
  kind: 'message' | 'routine'
  id: string
  recordId: string
  name: string
  available: boolean
  deleted?: boolean
}

export type LibraryDelivery = {
  connector: string
  targetId: string
  targetName: string
  status: 'sending' | 'sent' | 'failed' | 'unknown'
  reason?: string
}

export type LibraryFile = {
  id: string
  name: string
  extension: string
  generatedAt: string
  url: string
  source: LibrarySource
  deliveries: LibraryDelivery[]
}

export const libraryCategories = ['document', 'spreadsheet', 'presentation', 'image', 'code', 'other'] as const
export type LibraryCategory = typeof libraryCategories[number]

const categoryExtensions: Record<Exclude<LibraryCategory, 'other'>, string[]> = {
  document: ['pdf', 'doc', 'docx', 'md', 'markdown', 'txt', 'html', 'htm', 'rtf', 'odt'],
  spreadsheet: ['xls', 'xlsx', 'csv', 'tsv', 'ods'],
  presentation: ['ppt', 'pptx', 'odp'],
  image: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'tif', 'tiff', 'avif', 'heic'],
  code: ['json', 'jsonl', 'py', 'js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'yaml', 'yml', 'xml', 'sql', 'sh', 'bash', 'go', 'rs', 'java', 'c', 'h', 'cpp', 'vue', 'svelte', 'toml', 'ini'],
}

export const libraryCategory = (extension: string): LibraryCategory => {
  const normalized = extension.toLowerCase().replace(/^\./, '')
  return (Object.keys(categoryExtensions) as Array<Exclude<LibraryCategory, 'other'>>)
    .find((category) => categoryExtensions[category].includes(normalized)) ?? 'other'
}

export const deliveryResult = (deliveries: LibraryDelivery[]): 'not-sent' | 'sending' | 'sent' | 'partial' | 'failed' | 'unknown' => {
  if (!deliveries.length) return 'not-sent'
  if (deliveries.some((target) => target.status === 'sending')) return 'sending'
  if (deliveries.some((target) => target.status === 'unknown')) return 'unknown'
  const failed = deliveries.filter((target) => target.status === 'failed').length
  return failed ? (failed === deliveries.length ? 'failed' : 'partial') : 'sent'
}

export const collectLibraryFile = (files: LibraryFile[], file: LibraryFile, formal: boolean): LibraryFile[] => {
  if (!formal) return files
  if (!file.id || !file.name.trim() || !file.extension || !file.url || !Number.isFinite(Date.parse(file.generatedAt))) throw new Error('invalid-file')
  const existing = files.find((item) => item.id === file.id)
  return existing
    ? files.map((item) => item.id === file.id ? { ...item, deliveries: structuredClone(file.deliveries) } : item)
    : [...files, structuredClone(file)]
}

export const selectLibraryFiles = (files: LibraryFile[], query: string, source: LibrarySource['kind'] | 'all', category: LibraryCategory | 'all'): LibraryFile[] => {
  const term = query.trim().toLowerCase()
  return files.filter((file) => file.name.toLowerCase().includes(term)
    && (source === 'all' || file.source.kind === source)
    && (category === 'all' || libraryCategory(file.extension) === category))
    .sort((a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt))
}

const requireFile = (files: LibraryFile[], id: string): LibraryFile => {
  const file = files.find((item) => item.id === id)
  if (!file) throw new Error('not-found')
  return file
}

export const renameLibraryFile = (files: LibraryFile[], id: string, name: string): LibraryFile[] => {
  requireFile(files, id)
  const trimmed = name.trim()
  if (!trimmed || /[\\/\u0000-\u001f\u007f]/.test(trimmed)) throw new Error('invalid-name')
  return files.map((file) => file.id === id ? { ...file, name: trimmed } : file)
}

export const deleteLibraryFile = (files: LibraryFile[], id: string): LibraryFile[] => {
  if (deliveryResult(requireFile(files, id).deliveries) === 'sending') throw new Error('sending')
  return files.filter((file) => file.id !== id)
}
