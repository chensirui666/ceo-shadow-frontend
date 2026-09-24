import { Button, Description, Dropdown, InputGroup, Label, ListBox, Modal, Select, Tabs, TextArea, TextField } from '@heroui/react'
import { BotMessageSquare, ChevronDown, MoreHorizontal, Pencil, RefreshCw, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { connectorLogos } from '../content/connectorLogos.ts'
import { createContactsService } from '../contactsService.ts'
import type { ContactsService, ContactsSnapshot } from '../contactsService.ts'
import { contactCategories, contactTimes, selectContacts } from '../contactsState.ts'
import type { Contact, ContactCategory, ContactStatus, ContactTag, ContactTime } from '../contactsState.ts'
import { blacklistContact, connectorIds, loadSettings, saveSettings } from '../settingsState.ts'
import type { ConnectorId, FridaySettings } from '../settingsState.ts'
import '../contacts.css'

export type ContactsCopy = {
  title: string
  explainer: string
  loading: string
  search: string
  time: string
  source: string
  allSources: string
  noSources: string
  get: string
  goConnect: string
  lastContact: string
  times: Record<ContactTime, string>
  categories: Record<typeof contactCategories[number], string>
  sources: Record<ConnectorId, string>
  fields: { name: string; relationship: string; company: string; tags: string; recentStatus: string; category: string; sources: string; context: string; contextHint: string }
  statuses: Record<ContactStatus, string>
  actions: string
  empty: string
  profile: string
  close: string
  more: string
  edit: string
  blacklist: string
  invite: string
  refresh: string
  noContext: string
  getDialog: { title: string; body: string; cancel: string; tryChat: string }
  editDialog: { title: string; save: string; removeSource: string; error: string }
  blacklistDialog: { title: string; body: string; cancel: string; confirm: string }
  tagDialog: { title: string; name: string; rule: string; create: string; remove: string; deleteTitle: string; deleteBody: string; cancel: string; confirm: string; error: string }
  notices: { saved: string; refreshed: string; invited: string; blacklisted: string; tagCreated: string; tagRemoved: string }
}

type ContactAction = 'edit' | 'blacklist' | 'invite' | 'refresh'
type ContactsWorkspaceContentProps = {
  contacts: Contact[]
  tags: ContactTag[]
  selectedId: string | null
  query: string
  time: ContactTime
  category: typeof contactCategories[number]
  sourceIds: ConnectorId[]
  connectedSources: ConnectorId[]
  copy: ContactsCopy
  onOpen: (id: string | null) => void
  onAction: (id: string, action: ContactAction) => void
  onManageTags: () => void
  onRemoveContactTag: (contact: Contact, tagId: string) => void
  onQueryChange: (value: string) => void
  onSourceIdsChange: (value: ConnectorId[]) => void
  onTimeChange: (value: ContactTime) => void
  onCategoryChange: (value: typeof contactCategories[number]) => void
}

const sourceNames = (contact: Contact, copy: ContactsCopy) => contact.sources.map((source) => `${copy.sources[source.connector]} · ${source.name}`).join(' · ')
const contactCategoryOptions = contactCategories.filter((category): category is ContactCategory => category !== 'all')
const tagsForContact = (contact: Contact, tags: ContactTag[]) => tags.filter((tag) => contact.tagIds.includes(tag.id))

const ContactTagChips = ({ contact, tags, copy, onRemove }: { contact: Contact; tags: ContactTag[]; copy: ContactsCopy; onRemove?: (tagId: string) => void }) => {
  const contactTags = tagsForContact(contact, tags)
  if (!contactTags.length) return <span className="contacts-tag-empty">—</span>
  return <span className="contacts-tag-list">{contactTags.map((tag) => onRemove ? <span key={tag.id} title={tag.rule}><Button aria-label={`${copy.tagDialog.remove}: ${tag.name}`} className={`contacts-tag contacts-tag-${tag.color}`} onPress={() => onRemove(tag.id)} size="sm" variant="ghost"><span>{tag.name}</span><X aria-hidden="true" /></Button></span> : <span className={`contacts-tag contacts-tag-${tag.color}`} key={tag.id} title={tag.rule}>{tag.name}</span>)}</span>
}

export const connectedContactSources = (settings: FridaySettings): ConnectorId[] => connectorIds.filter((source) => settings.connectors[source] === 'connected')

export function ContactsWorkspaceContent({ contacts, tags, selectedId, query, time, category, sourceIds, connectedSources, copy, onOpen, onAction, onManageTags, onRemoveContactTag, onQueryChange, onSourceIdsChange, onTimeChange, onCategoryChange }: ContactsWorkspaceContentProps) {
  const visible = selectContacts(contacts, { query, sourceIds, time, category }, new Date(), tags)
  const selected = contacts.find((contact) => contact.id === selectedId) ?? null
  const sourceFilterLabel = sourceIds.length ? sourceIds.map((source) => copy.sources[source]).join(', ') : copy.allSources
  const availableSources = connectorIds.filter((source) => contacts.some((contact) => contact.sources.some((item) => item.connector === source)))

  return <section className={`contacts-page${selected ? ' contacts-page-preview' : ''}`}>
    <div className="contacts-main">
      <header className="contacts-header">
        <div><h1>{copy.title}</h1><p>{copy.explainer}</p></div>
        <Button className="contacts-get" onPress={() => onAction('', 'refresh')}>{connectedSources.length ? <><BotMessageSquare aria-hidden="true" />{copy.get}</> : copy.goConnect}</Button>
      </header>
      <div className="contacts-controls">
        <TextField aria-label={copy.search} className="contacts-search" onChange={onQueryChange} type="search" value={query}>
          <InputGroup><InputGroup.Prefix><Search aria-hidden="true" /></InputGroup.Prefix><InputGroup.Input placeholder={copy.search} /></InputGroup>
        </TextField>
        <Tabs className="contacts-category-tabs" onSelectionChange={(key) => onCategoryChange(String(key) as typeof category)} selectedKey={category} variant="secondary">
          <Tabs.ListContainer><Tabs.List aria-label={copy.fields.category}>
            {contactCategories.map((item) => <Tabs.Tab id={item} key={item}>{copy.categories[item]}<Tabs.Indicator /></Tabs.Tab>)}
          </Tabs.List></Tabs.ListContainer>
        </Tabs>
      </div>
      <div className="contacts-list" role="table" aria-label={copy.title}>
        <div className="contacts-list-head" role="row">
          <span role="columnheader">{copy.fields.name}</span><span role="columnheader">{copy.fields.recentStatus}</span><span role="columnheader">{copy.fields.company}</span>
          <span className="contacts-tags-header" role="columnheader"><span>{copy.fields.tags}</span><Button aria-label={copy.tagDialog.title} className="contacts-header-filter-button" isIconOnly onPress={onManageTags} size="sm" variant="ghost"><Pencil aria-hidden="true" /></Button></span>
          <span className="contacts-header-filter" role="columnheader"><span>{copy.source}</span><Dropdown><Button aria-label={`${copy.source}: ${sourceFilterLabel}`} className="contacts-header-filter-button" isIconOnly size="sm" variant="ghost"><ChevronDown aria-hidden="true" /></Button><Dropdown.Popover className="contacts-source-filter-popover" placement="bottom start"><Dropdown.Menu aria-label={copy.source} onSelectionChange={(keys) => onSourceIdsChange(keys === 'all' ? availableSources : Array.from(keys).map(String).filter((source): source is ConnectorId => connectorIds.includes(source as ConnectorId)))} selectedKeys={sourceIds} selectionMode="multiple">{availableSources.map((source) => <Dropdown.Item id={source} key={source} textValue={copy.sources[source]}><Dropdown.ItemIndicator /><img alt="" src={connectorLogos[source]} />{copy.sources[source]}</Dropdown.Item>)}</Dropdown.Menu></Dropdown.Popover></Dropdown></span>
          <span className="contacts-header-filter" role="columnheader"><span>{copy.lastContact}</span><Dropdown><Button aria-label={`${copy.time}: ${copy.times[time]}`} className="contacts-header-filter-button" isIconOnly size="sm" variant="ghost"><ChevronDown aria-hidden="true" /></Button><Dropdown.Popover placement="bottom start"><Dropdown.Menu aria-label={copy.time} onAction={(key) => onTimeChange(String(key) as ContactTime)} selectedKeys={[time]} selectionMode="single">{contactTimes.map((item) => <Dropdown.Item id={item} key={item} textValue={copy.times[item]}>{copy.times[item]}<Dropdown.ItemIndicator /></Dropdown.Item>)}</Dropdown.Menu></Dropdown.Popover></Dropdown></span><span role="columnheader">{copy.actions}</span>
        </div>
        {visible.map((contact) => <div className={contact.id === selectedId ? 'contacts-row contacts-row-selected' : 'contacts-row'} data-contacts-id={contact.id} key={contact.id} role="row">
          <Button aria-pressed={contact.id === selectedId} className="contacts-open contacts-name" onPress={() => onOpen(contact.id)} variant="ghost"><span className="contacts-avatar" aria-hidden="true">{contact.name.slice(0, 1).toUpperCase()}</span><span className="contacts-name-copy" title={`${contact.name} · ${contact.relationship}`}><strong>{contact.name}</strong><span>{contact.relationship}</span></span></Button>
          <Button className="contacts-open contacts-recent-status" onPress={() => onOpen(contact.id)} variant="ghost"><span aria-hidden="true" className={`contacts-status-dot contacts-status-${contact.recentStatus.tone}`} /><span className="contacts-status-copy" title={`${copy.statuses[contact.recentStatus.tone]} · ${contact.recentStatus.detail}`}><strong>{copy.statuses[contact.recentStatus.tone]}</strong><span>{contact.recentStatus.detail}</span></span></Button>
          <Button className="contacts-open contacts-cell-text" onPress={() => onOpen(contact.id)} variant="ghost"><span title={contact.company}>{contact.company}</span></Button>
          <span className="contacts-tags-cell"><ContactTagChips contact={contact} copy={copy} onRemove={(tagId) => onRemoveContactTag(contact, tagId)} tags={tags} /></span>
          <Button aria-label={`${copy.source}: ${sourceNames(contact, copy)}`} className="contacts-open contacts-source-names" onPress={() => onOpen(contact.id)} variant="ghost">{contact.sources.map((source) => <span className="contacts-source-item" key={source.connector} title={`${copy.sources[source.connector]} · ${source.name}`}><img alt="" src={connectorLogos[source.connector]} /><span>{source.name}</span></span>)}</Button>
          <Button className="contacts-open contacts-last-contact" onPress={() => onOpen(contact.id)} variant="ghost"><span title={contact.lastInteractionAt.slice(0, 10)}>{contact.lastInteractionAt.slice(0, 10)}</span></Button>
          <Dropdown><Button aria-label={`${copy.more}: ${contact.name}`} className="contacts-more" isIconOnly size="sm" variant="ghost"><MoreHorizontal aria-hidden="true" /></Button><Dropdown.Popover placement="bottom right"><Dropdown.Menu aria-label={copy.more} onAction={(key) => onAction(contact.id, String(key) as ContactAction)}><Dropdown.Item id="edit" textValue={copy.edit}>{copy.edit}</Dropdown.Item><Dropdown.Item id="invite" textValue={copy.invite}>{copy.invite}</Dropdown.Item><Dropdown.Item id="blacklist" textValue={copy.blacklist} variant="danger">{copy.blacklist}</Dropdown.Item></Dropdown.Menu></Dropdown.Popover></Dropdown>
        </div>)}
      </div>
      {!visible.length && <div className="contacts-empty"><p>{copy.empty}</p></div>}
    </div>
    {selected && <aside aria-label={copy.profile} className="contacts-profile">
      <header>
        <span className="contacts-avatar contacts-avatar-large" aria-hidden="true">{selected.name.slice(0, 1).toUpperCase()}</span>
        <div className="contacts-profile-basic"><h2>{selected.name}</h2><div className="contacts-profile-editable"><p>{selected.relationship}</p><Button aria-label={`${copy.edit}: ${copy.fields.relationship}`} isIconOnly onPress={() => onAction(selected.id, 'edit')} size="sm" variant="ghost"><Pencil aria-hidden="true" /></Button></div></div>
        <Button aria-label={copy.close} isIconOnly onPress={() => onOpen(null)} size="sm" variant="ghost"><X aria-hidden="true" /></Button>
      </header>
      <section className="contacts-profile-facts"><dl>
        <div><dt>{copy.fields.category}</dt><dd title={copy.categories[selected.category]}>{copy.categories[selected.category]}</dd></div>
        <div><dt>{copy.fields.company}</dt><dd title={selected.company}>{selected.company}</dd></div>
        <div><dt>{copy.fields.tags}</dt><dd className="contacts-profile-tags"><ContactTagChips contact={selected} copy={copy} tags={tags} /></dd></div>
        <div><dt>{copy.source}</dt><dd className="contacts-profile-source-identities">{selected.sources.length ? selected.sources.map((source) => <span key={source.connector} title={`${copy.sources[source.connector]} · ${source.name}`}><img alt="" src={connectorLogos[source.connector]} /><strong>{copy.sources[source.connector]}</strong><span>{source.name}</span></span>) : copy.noSources}</dd></div>
      </dl></section>
      <article className="contacts-profile-text"><p>{`${selected.profile.summary} ${selected.profile.recentContacts} ${selected.profile.relationship} ${selected.profile.context || copy.noContext}`}</p></article>
      <footer><Button isDisabled={!selected.sources.length} onPress={() => onAction(selected.id, 'refresh')} variant="secondary"><RefreshCw aria-hidden="true" />{copy.refresh}</Button></footer>
    </aside>}
  </section>
}

export default function ContactsWorkspace({ copy, service = createContactsService(), onOpenSettings }: { copy: ContactsCopy; service?: ContactsService; onOpenSettings: () => void }) {
  const [snapshot, setSnapshot] = useState<ContactsSnapshot | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [time, setTime] = useState<ContactTime>('all')
  const [category, setCategory] = useState<typeof contactCategories[number]>('all')
  const [sourceIds, setSourceIds] = useState<ConnectorId[]>([])
  const connectedSources = typeof window === 'undefined' ? [...connectorIds] : connectedContactSources(loadSettings(window.localStorage))
  const [getOpen, setGetOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [blacklistingId, setBlacklistingId] = useState<string | null>(null)
  const [blacklistedIds, setBlacklistedIds] = useState<string[]>(() => typeof window === 'undefined' ? [] : loadSettings(window.localStorage).contacts.blacklist.map((contact) => contact.id))
  const [tagManagerOpen, setTagManagerOpen] = useState(false)
  const [tagName, setTagName] = useState('')
  const [tagRule, setTagRule] = useState('')
  const [deletingTag, setDeletingTag] = useState<ContactTag | null>(null)
  const [notice, setNotice] = useState('')
  const [editError, setEditError] = useState('')
  const [tagError, setTagError] = useState('')

  useEffect(() => { void service.load().then(setSnapshot) }, [service])
  const update = (action: Promise<ContactsSnapshot>, nextNotice: string, onSuccess?: () => void) => { void action.then((next) => { setSnapshot(next); setNotice(nextNotice); onSuccess?.() }).catch(() => setEditError(copy.editDialog.error)) }
  const openContactsInfo = () => { if (!connectedSources.length) { onOpenSettings(); return }; setGetOpen(true) }
  const saveEdit = () => {
    if (!editing) return
    update(service.update(editing.id, { relationship: editing.relationship, category: editing.category, sources: editing.sources, contextPrompt: editing.contextPrompt, tagIds: editing.tagIds }), copy.notices.saved, () => setEditing(null))
  }
  const action = (id: string, kind: ContactAction) => {
    if (kind === 'refresh' && !id) { openContactsInfo(); return }
    const contact = snapshot?.contacts.find((item) => item.id === id)
    if (!contact) return
    if (kind === 'edit') { setEditing(structuredClone(contact)); setEditError(''); return }
    if (kind === 'blacklist') { setBlacklistingId(id); return }
    if (kind === 'invite') update(service.invite(id), copy.notices.invited)
    if (kind === 'refresh') update(service.refresh(id), copy.notices.refreshed)
  }
  const confirmBlacklist = () => {
    const contact = snapshot?.contacts.find((item) => item.id === blacklistingId)
    if (!contact) return
    const settings = blacklistContact(loadSettings(window.localStorage), { id: contact.id, name: contact.name, sourceLabels: contact.sources.map((source) => `${copy.sources[source.connector]} · ${source.name}`) })
    saveSettings(window.localStorage, settings)
    setBlacklistedIds((current) => current.includes(contact.id) ? current : [...current, contact.id])
    setNotice(copy.notices.blacklisted)
    if (selectedId === contact.id) setSelectedId(null)
    setBlacklistingId(null)
  }
  const createTag = () => {
    void service.createTag({ name: tagName, rule: tagRule }).then((next) => {
      setSnapshot(next); setTagName(''); setTagRule(''); setTagError(''); setNotice(copy.notices.tagCreated)
    }).catch(() => setTagError(copy.tagDialog.error))
  }
  const confirmTagDelete = () => {
    if (!deletingTag) return
    void service.removeTag(deletingTag.id).then((next) => { setSnapshot(next); setDeletingTag(null); setNotice(copy.notices.tagRemoved) }).catch(() => setTagError(copy.tagDialog.error))
  }
  const removeContactTag = (contact: Contact, tagId: string) => update(service.update(contact.id, { tagIds: contact.tagIds.filter((id) => id !== tagId) }), copy.notices.tagRemoved)

  if (!snapshot) return <section className="contacts-state" role="status">{copy.loading}</section>
  const visibleContacts = snapshot.contacts.filter((contact) => !blacklistedIds.includes(contact.id))
  return <>
    <ContactsWorkspaceContent category={category} connectedSources={connectedSources} contacts={visibleContacts} copy={copy} onAction={action} onCategoryChange={setCategory} onManageTags={() => setTagManagerOpen(true)} onOpen={setSelectedId} onQueryChange={setQuery} onRemoveContactTag={removeContactTag} onSourceIdsChange={setSourceIds} onTimeChange={setTime} query={query} selectedId={selectedId} sourceIds={sourceIds} tags={snapshot.tags} time={time} />
    {notice && <p className="contacts-notice" role="status">{notice}</p>}
    <Modal.Backdrop className="exit-backdrop" isOpen={getOpen} onOpenChange={(open) => { if (!open) setGetOpen(false) }}><Modal.Container className="exit-container contacts-dialog-container" placement="center"><Modal.Dialog className="exit-dialog contacts-dialog"><Modal.Header><Modal.Heading className="exit-title">{copy.getDialog.title}</Modal.Heading></Modal.Header><Modal.Body className="exit-body"><p>{copy.getDialog.body}</p></Modal.Body><Modal.Footer className="exit-footer"><Button className="modal-cancel" onPress={() => setGetOpen(false)}>{copy.getDialog.cancel}</Button><Button onPress={() => setGetOpen(false)}>{copy.getDialog.tryChat}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
    <Modal.Backdrop className="exit-backdrop" isOpen={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null) }}><Modal.Container className="exit-container contacts-dialog-container" placement="center"><Modal.Dialog className="exit-dialog contacts-dialog"><Modal.Header><Modal.Heading className="exit-title">{copy.editDialog.title}</Modal.Heading></Modal.Header><Modal.Body className="exit-body">{editing && <form className="contacts-edit-form" onSubmit={(event) => { event.preventDefault(); saveEdit() }}><TextField aria-label={copy.fields.relationship} onChange={(relationship) => setEditing({ ...editing, relationship })} value={editing.relationship}><InputGroup><InputGroup.Input /></InputGroup></TextField><Select aria-label={copy.fields.category} className="contacts-edit-category" onSelectionChange={(key) => setEditing({ ...editing, category: String(key) as ContactCategory })} selectedKey={editing.category} variant="secondary"><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox>{contactCategoryOptions.map((item) => <ListBox.Item id={item} key={item} textValue={copy.categories[item]}>{copy.categories[item]}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover></Select><fieldset className="contacts-edit-tags"><legend>{copy.fields.tags}</legend><div>{snapshot.tags.map((tag) => <span key={tag.id} title={tag.rule}><Button aria-label={tag.rule} aria-pressed={editing.tagIds.includes(tag.id)} className={`contacts-tag contacts-tag-${tag.color}`} onPress={() => setEditing({ ...editing, tagIds: editing.tagIds.includes(tag.id) ? editing.tagIds.filter((id) => id !== tag.id) : [...editing.tagIds, tag.id] })} size="sm" variant="ghost">{tag.name}</Button></span>)}</div></fieldset><fieldset><legend>{copy.fields.sources}</legend>{editing.sources.map((source) => <div className="contacts-edit-source" key={source.connector}><img alt="" src={connectorLogos[source.connector]} /><TextField aria-label={`${copy.sources[source.connector]} ${copy.fields.name}`} onChange={(name) => setEditing({ ...editing, sources: editing.sources.map((item) => item.connector === source.connector ? { ...item, name } : item) })} value={source.name}><InputGroup><InputGroup.Input /></InputGroup></TextField><Button onPress={() => setEditing({ ...editing, sources: editing.sources.filter((item) => item.connector !== source.connector) })} size="sm" variant="ghost">{copy.editDialog.removeSource}</Button></div>)}</fieldset><TextField aria-label={copy.fields.context} className="contacts-edit-context" onChange={(contextPrompt) => setEditing({ ...editing, contextPrompt })} value={editing.contextPrompt}><Label>{copy.fields.context}</Label><Description>{copy.fields.contextHint}</Description><TextArea rows={4} variant="secondary" /></TextField>{editError && <p role="alert">{editError}</p>}<Button className="sr-only" type="submit">{copy.editDialog.save}</Button></form>}</Modal.Body><Modal.Footer className="exit-footer"><Button className="modal-cancel" onPress={() => setEditing(null)}>{copy.getDialog.cancel}</Button><Button onPress={saveEdit}>{copy.editDialog.save}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
    <Modal.Backdrop className="exit-backdrop" isOpen={tagManagerOpen} onOpenChange={setTagManagerOpen}><Modal.Container className="exit-container contacts-dialog-container" placement="center"><Modal.Dialog className="exit-dialog contacts-dialog"><Modal.Header><Modal.Heading className="exit-title">{copy.tagDialog.title}</Modal.Heading></Modal.Header><Modal.Body className="exit-body"><div className="contacts-tag-manager"><TextField aria-label={copy.tagDialog.name} onChange={setTagName} value={tagName}><InputGroup><InputGroup.Input placeholder={copy.tagDialog.name} /></InputGroup></TextField><TextField aria-label={copy.tagDialog.rule} onChange={setTagRule} value={tagRule}><InputGroup><InputGroup.Input placeholder={copy.tagDialog.rule} /></InputGroup></TextField><Button onPress={createTag} variant="secondary">{copy.tagDialog.create}</Button><div className="contacts-tag-manager-list">{snapshot.tags.map((tag) => <div key={tag.id}><span className={`contacts-tag contacts-tag-${tag.color}`} title={tag.rule}>{tag.name}</span><span title={tag.rule}>{tag.rule}</span><Button aria-label={`${copy.tagDialog.remove}: ${tag.name}`} onPress={() => setDeletingTag(tag)} size="sm" variant="ghost">{copy.tagDialog.remove}</Button></div>)}</div>{tagError && <p role="alert">{tagError}</p>}</div></Modal.Body><Modal.Footer className="exit-footer"><Button className="modal-cancel" onPress={() => setTagManagerOpen(false)}>{copy.tagDialog.cancel}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
    <Modal.Backdrop className="exit-backdrop" isOpen={blacklistingId !== null} onOpenChange={(open) => { if (!open) setBlacklistingId(null) }}><Modal.Container className="exit-container" placement="center"><Modal.Dialog className="exit-dialog"><Modal.Header><Modal.Heading className="exit-title">{copy.blacklistDialog.title}</Modal.Heading></Modal.Header><Modal.Body className="exit-body"><p>{copy.blacklistDialog.body}</p></Modal.Body><Modal.Footer className="exit-footer"><Button className="modal-cancel" onPress={() => setBlacklistingId(null)}>{copy.blacklistDialog.cancel}</Button><Button onPress={confirmBlacklist} variant="danger">{copy.blacklistDialog.confirm}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
    <Modal.Backdrop className="exit-backdrop" isOpen={deletingTag !== null} onOpenChange={(open) => { if (!open) setDeletingTag(null) }}><Modal.Container className="exit-container" placement="center"><Modal.Dialog className="exit-dialog"><Modal.Header><Modal.Heading className="exit-title">{copy.tagDialog.deleteTitle}</Modal.Heading></Modal.Header><Modal.Body className="exit-body"><p>{copy.tagDialog.deleteBody}</p></Modal.Body><Modal.Footer className="exit-footer"><Button className="modal-cancel" onPress={() => setDeletingTag(null)}>{copy.tagDialog.cancel}</Button><Button onPress={confirmTagDelete} variant="danger">{copy.tagDialog.confirm}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
  </>
}
