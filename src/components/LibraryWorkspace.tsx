import { useCallback, useEffect, useState } from 'react'
import { Accordion, Button, Card, InputGroup, ListBox, Modal, Select, TextField } from '@heroui/react'
import { ArrowUpRight, Download, LayoutGrid, List, Search, X } from 'lucide-react'
import type { Locale } from '../appState.ts'
import { libraryCopy } from '../content/libraryCopy.ts'
import { downloadLibraryFile } from '../libraryPreview.ts'
import type { LibraryService } from '../libraryService.ts'
import { deliveryResult, libraryCategories, selectLibraryFiles } from '../libraryState.ts'
import type { LibraryCategory, LibraryFile, LibrarySource } from '../libraryState.ts'
import LibraryFileContent from './LibraryFileContent.tsx'
import LibraryList from './LibraryList.tsx'
import '../library.css'

function Filter({ label, value, options, onChange }: { label: string; value: string; options: Array<{ id: string; label: string }>; onChange: (value: string) => void }) {
  return <Select aria-label={label} className="library-filter" onSelectionChange={(key) => onChange(String(key))} selectedKey={value} variant="secondary"><Select.Trigger><span className="library-filter-label">{label}:</span><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover className="library-filter-popover"><ListBox>{options.map((option) => <ListBox.Item id={option.id} key={option.id} textValue={option.label}>{option.label}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover></Select>
}

const focusFile = (id: string | null) => window.requestAnimationFrame(() => {
  document.querySelector<HTMLButtonElement>(id ? `[data-library-id="${CSS.escape(id)}"] .library-row-open` : '.library-row-open')?.focus({ preventScroll: true })
})

export default function LibraryWorkspace({ locale, service, onOpenSource }: { locale: Locale; service: LibraryService; onOpenSource: (source: LibrarySource) => void }) {
  const copy = libraryCopy[locale]
  const [files, setFiles] = useState<LibraryFile[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [source, setSource] = useState<LibrarySource['kind'] | 'all'>('all')
  const [category, setCategory] = useState<LibraryCategory | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [renameError, setRenameError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [downloadError, setDownloadError] = useState<LibraryFile | null>(null)
  const [busy, setBusy] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [missingNotice, setMissingNotice] = useState(false)
  const selected = files?.find((file) => file.id === selectedId)
  const filtered = query !== '' || source !== 'all' || category !== 'all'
  const visible = selectLibraryFiles(files ?? [], query, source, category)
  const missing = useCallback((id: string) => {
    setSelectedId((current) => current === id ? null : current)
    setMissingNotice(true)
    void service.forgetMissing(id).then(setFiles)
  }, [service])

  useEffect(() => {
    let active = true
    setLoadError(false)
    void service.load().then((next) => { if (active) setFiles(next) }).catch(() => { if (active) setLoadError(true) })
    return () => { active = false }
  }, [service, loadAttempt])

  const clear = () => { setQuery(''); setSource('all'); setCategory('all') }
  const cancelRename = () => { setEditingId(null); focusFile(editingId) }
  const download = async (file: LibraryFile) => {
    setDownloading(true)
    setDownloadError(null)
    try { await downloadLibraryFile(file) } catch { setDownloadError(file) } finally { setDownloading(false) }
  }
  const action = (file: LibraryFile, key: string) => {
    if (key === 'download') void download(file)
    if (key === 'rename') { setEditingId(file.id); setDraft(file.name); setRenameError('') }
    if (key === 'delete' && deliveryResult(file.deliveries) !== 'sending') { setDeleteId(file.id); setDeleteError('') }
  }
  const rename = async () => {
    if (!editingId || busy) return
    setBusy(true)
    try { setFiles(await service.rename(editingId, draft)); focusFile(editingId); setEditingId(null); setRenameError('') } catch { setRenameError(copy.renameFailed) } finally { setBusy(false) }
  }
  const remove = async () => {
    if (!deleteId || busy) return
    setBusy(true)
    try {
      setFiles(await service.remove(deleteId))
      if (selectedId === deleteId) setSelectedId(null)
      setDeleteId(null)
      focusFile(null)
    } catch { setDeleteError(copy.deleteFailed) } finally { setBusy(false) }
  }

  return <section className={`library-page${selected ? ' library-page-preview' : ''}`}>
    <div className="library-main">
      <header className="library-header"><h1>Library</h1><p>{copy.subtitle}</p></header>
      <Card className="library-weekly" aria-label={locale === 'zh' ? '本周成果' : 'This week’s creations'}>
        <Card.Content><p className="library-weekly-label">THIS WEEK WITH FRIDAY</p><h2>12 things <em>created</em></h2><p className="library-weekly-breakdown">5 docs • 3 reports • 4 files</p></Card.Content>
      </Card>
      <div className="library-controls"><TextField aria-label={copy.search} className="library-search-field" onChange={setQuery} type="search" value={query}><InputGroup className="library-search"><InputGroup.Prefix><Search aria-hidden="true" /></InputGroup.Prefix><InputGroup.Input /></InputGroup></TextField>
        <div className="library-filters"><Filter label={copy.source} onChange={(value) => setSource(value as typeof source)} options={[{ id: 'all', label: copy.all }, { id: 'message', label: 'Message' }, { id: 'routine', label: 'Routine' }]} value={source} /><Filter label={copy.category} onChange={(value) => setCategory(value as typeof category)} options={[{ id: 'all', label: copy.all }, ...libraryCategories.map((id) => ({ id, label: copy.categories[id] }))]} value={category} />{filtered && <Button className="library-clear" onPress={clear} size="sm" variant="ghost">{copy.clear}</Button>}</div>
        <div className="library-view-toggle" role="group" aria-label={locale === 'zh' ? '显示方式' : 'View layout'}>
          <Button aria-label={locale === 'zh' ? '列表视图' : 'List view'} aria-pressed={view === 'list'} isIconOnly onPress={() => setView('list')} variant="ghost"><List aria-hidden="true" /></Button>
          <Button aria-label={locale === 'zh' ? '网格视图' : 'Grid view'} aria-pressed={view === 'grid'} isIconOnly onPress={() => setView('grid')} variant="ghost"><LayoutGrid aria-hidden="true" /></Button>
        </div>
      </div>
      {downloadError && <div className="library-action-error" role="alert">{copy.downloadFailed}<Button isDisabled={downloading} onPress={() => void download(downloadError)} size="sm" variant="ghost">{copy.retry}</Button></div>}
      {missingNotice && <p className="library-action-error" role="status">{locale === 'zh' ? '文件不存在或已被删除，列表已更新。' : 'The file no longer exists. The list has been updated.'}</p>}
      <h2 className="library-section-label">{locale === 'zh' ? '最近生成' : 'RECENTLY CREATED'}</h2>
      <div className="library-list-scroll">{loadError ? <div className="library-empty" role="alert"><p>{copy.loadFailed}</p><Button onPress={() => setLoadAttempt((value) => value + 1)} variant="secondary">{copy.retry}</Button></div> : !files ? <p className="library-empty" role="status">{copy.loading}</p> : !visible.length ? <div className="library-empty"><p>{filtered ? copy.noResults : copy.empty}</p>{filtered && <Button onPress={clear} variant="secondary">{copy.clear}</Button>}</div> : <LibraryList view={view} busy={busy} copy={copy} draft={draft} editingId={editingId} error={renameError} files={visible} locale={locale} onAction={action} onCancel={cancelRename} onDraft={setDraft} onOpen={setSelectedId} onSave={() => void rename()} selectedId={selectedId} />}</div>
    </div>
    {selected && <aside aria-label={copy.preview} className="library-preview">
      <header className="library-preview-heading"><span>{copy.preview}</span><Button aria-label={copy.close} isIconOnly onPress={() => { setSelectedId(null); focusFile(selectedId) }} size="sm" variant="ghost"><X /></Button></header>
      <div className="library-preview-meta"><h2>{selected.name}</h2><p>{selected.extension.toUpperCase()} · {new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selected.generatedAt))}</p>
        <Accordion className="library-source-details" key={selected.id}><Accordion.Item><Accordion.Heading><Accordion.Trigger>{copy.details}<Accordion.Indicator /></Accordion.Trigger></Accordion.Heading><Accordion.Panel><Accordion.Body><div className="library-source-line"><span>{selected.source.kind === 'message' ? 'Message' : 'Routine'}</span>{selected.source.available && !selected.source.deleted ? <Button onPress={() => onOpenSource(selected.source)} size="sm" variant="ghost">{selected.source.name}<ArrowUpRight aria-hidden="true" /></Button> : <span>{selected.source.name} · {selected.source.deleted ? copy.originalDeleted : copy.unavailable}</span>}</div><p className="library-delivery-result">{copy.result[deliveryResult(selected.deliveries)]}</p>{selected.deliveries.map((target) => <div className="library-target" key={`${target.connector}:${target.targetId}`}><span>{target.connector} · {target.targetName}</span><span>{copy.result[target.status]}</span>{target.reason && <small>{target.reason}</small>}</div>)}</Accordion.Body></Accordion.Panel></Accordion.Item></Accordion>
      </div>
      <div className="library-preview-body"><LibraryFileContent file={selected} key={selected.id} locale={locale} onMissing={missing} /></div>
      <footer><Button isDisabled={downloading} onPress={() => void download(selected)} variant="secondary"><Download aria-hidden="true" />{copy.download}</Button></footer>
    </aside>}
    <Modal.Backdrop className="exit-backdrop" isOpen={deleteId !== null} onOpenChange={(open) => { if (!open && !busy) setDeleteId(null) }}><Modal.Container className="exit-container" placement="center"><Modal.Dialog className="exit-dialog"><Modal.Header><Modal.Heading className="exit-title">{copy.deleteTitle}</Modal.Heading></Modal.Header><Modal.Body className="exit-body"><p>{copy.deleteBody}</p>{deleteError && <p role="alert">{deleteError}</p>}</Modal.Body><Modal.Footer className="exit-footer"><Button className="modal-cancel" isDisabled={busy} onPress={() => setDeleteId(null)}>{copy.cancel}</Button><Button className="library-delete-confirm" isDisabled={busy} onPress={() => void remove()} variant="danger">{copy.remove}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
  </section>
}
