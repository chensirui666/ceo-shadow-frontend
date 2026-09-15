import { Button, Card, Chip, Dropdown, FieldError, Form, InputGroup, TextField } from '@heroui/react'
import { Check, File, FileArchive, FileCode, FileImage, FileSpreadsheet, FileText, FileType, MoreHorizontal, Presentation, X } from 'lucide-react'
import type { Locale } from '../appState.ts'
import type { libraryCopy } from '../content/libraryCopy.ts'
import { deliveryResult, libraryCategory } from '../libraryState.ts'
import type { LibraryFile } from '../libraryState.ts'

type LibraryListProps = {
  view?: 'list' | 'grid'
  files: LibraryFile[]
  copy: typeof libraryCopy.zh
  locale: Locale
  selectedId: string | null
  editingId: string | null
  draft: string
  error: string
  busy: boolean
  onOpen: (id: string) => void
  onAction: (file: LibraryFile, action: string) => void
  onDraft: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

export default function LibraryList({ view = 'list', files, copy, selectedId, editingId, draft, error, busy, onOpen, onAction, onDraft, onSave, onCancel }: LibraryListProps) {
  const date = new Intl.DateTimeFormat('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const Row = view === 'grid' ? Card : 'div'
  return <div className={`library-file-list${view === 'grid' ? ' library-file-grid' : ''}`}>{files.map((file) => {
    const FileIcon = file.extension.toLowerCase() === 'pdf' ? FileType : ['zip', 'rar', '7z', 'gz', 'tar'].includes(file.extension.toLowerCase()) ? FileArchive : ({ document: FileText, spreadsheet: FileSpreadsheet, presentation: Presentation, image: FileImage, code: FileCode, other: File })[libraryCategory(file.extension)]
    return <Row className={`library-row${file.id === selectedId ? ' library-row-selected' : ''}`} data-library-id={file.id} key={file.id}>
    {editingId === file.id ? <Form className="library-rename" onSubmit={(event) => { event.preventDefault(); onSave() }}>
      <span aria-hidden="true" className="library-file-badge" data-format={file.extension.toLowerCase()} data-category={libraryCategory(file.extension)}><FileIcon className="library-file-icon" /></span>
      <TextField aria-label={copy.name} className="library-rename-field" isDisabled={busy} isInvalid={!!error} onChange={onDraft} value={draft}>
        <InputGroup><InputGroup.Input autoFocus onFocus={(event) => event.target.select()} onKeyDown={(event) => { if (event.key === 'Escape') onCancel() }} /><InputGroup.Suffix className="library-extension">.{file.extension}</InputGroup.Suffix></InputGroup>
        <FieldError>{error}</FieldError>
      </TextField>
      <Button aria-label={copy.save} isDisabled={busy || !draft.trim()} isIconOnly size="sm" type="submit" variant="ghost"><Check /></Button><Button aria-label={copy.cancel} isDisabled={busy} isIconOnly onPress={onCancel} size="sm" variant="ghost"><X /></Button>
    </Form> : <><Button variant="ghost" aria-pressed={file.id === selectedId} className="library-row-open" onPress={() => onOpen(file.id)} type="button"><span aria-hidden="true" className="library-file-badge" data-format={file.extension.toLowerCase()} data-category={libraryCategory(file.extension)}><FileIcon className="library-file-icon" /></span><span className="library-file-name">{file.name}</span></Button>
      <Chip className="library-format" data-format={file.extension.toLowerCase()} data-category={libraryCategory(file.extension)}>{file.extension.toUpperCase()}</Chip>
      <time dateTime={file.generatedAt}>{date.format(new Date(file.generatedAt))}</time>
      <Dropdown><Button aria-label={`${copy.more}：${file.name}`} className="library-more" isIconOnly size="sm" variant="ghost"><MoreHorizontal /></Button><Dropdown.Popover placement="bottom right"><Dropdown.Menu aria-label={copy.more} disabledKeys={deliveryResult(file.deliveries) === 'sending' ? ['delete'] : []} onAction={(key) => onAction(file, String(key))}><Dropdown.Item id="download" textValue={copy.download}>{copy.download}</Dropdown.Item><Dropdown.Item id="rename" textValue={copy.rename}>{copy.rename}</Dropdown.Item><Dropdown.Item className="library-delete-action" id="delete" textValue={copy.remove} variant="danger">{copy.remove}</Dropdown.Item></Dropdown.Menu></Dropdown.Popover></Dropdown>
    </>}
  </Row>})}</div>
}
