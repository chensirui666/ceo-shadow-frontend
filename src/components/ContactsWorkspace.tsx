import { Button, Dropdown, InputGroup, ListBox, Modal, Select, TextField } from '@heroui/react'
import { BotMessageSquare, ChevronDown, MoreHorizontal, Pencil, RefreshCw, Search, UserPlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Locale } from '../appState.ts'
import { connectorLogos } from '../content/connectorLogos.ts'
import { createContactsService } from '../contactsService.ts'
import type { ContactsService } from '../contactsService.ts'
import { contactTimes, selectContacts } from '../contactsState.ts'
import type { Contact, ContactFilters, ContactTime } from '../contactsState.ts'
import { connectorIds, loadSettings } from '../settingsState.ts'
import type { ConnectorId } from '../settingsState.ts'
import '../contacts.css'

export type ContactsCopy = {
  title: string
  explainer: string
  demo: string
  loading: string
  search: string
  time: string
  source: string
  allSources: string
  get: string
  goConnect: string
  times: Record<ContactTime, string>
  sources: Record<ConnectorId, string>
  fields: { name: string; relationship: string; sources: string; context: string; contextHint: string }
  empty: string
  profile: string
  close: string
  more: string
  edit: string
  remove: string
  invite: string
  refresh: string
  noContext: string
  getDialog: { title: string; body: string; cancel: string; tryChat: string; command: (sources: string) => string; send: string; result: string; noResult: string; confirm: string }
  editDialog: { title: string; save: string; removeSource: string; error: string }
  deleteDialog: { title: string; body: string; cancel: string; confirm: string }
  notices: { added: string; saved: string; refreshed: string; invited: string; removed: string }
}

type ContactAction = 'edit' | 'delete' | 'invite' | 'refresh'
type ContactsWorkspaceContentProps = {
  contacts: Contact[]
  selectedId: string | null
  query: string
  time: ContactTime
  sourceIds: ConnectorId[]
  connectedSources: ConnectorId[]
  copy: ContactsCopy
  onOpen: (id: string | null) => void
  onAction: (id: string, action: ContactAction) => void
  onQueryChange: (value: string) => void
  onSourceIdsChange: (value: ConnectorId[]) => void
  onTimeChange: (value: ContactTime) => void
}

const sourceNames = (contact: Contact, copy: ContactsCopy) => contact.sources.map((source) => `${copy.sources[source.connector]} · ${source.name}`).join(' · ')

export function ContactsWorkspaceContent({ contacts, selectedId, query, time, sourceIds, connectedSources, copy, onOpen, onAction, onQueryChange, onSourceIdsChange, onTimeChange }: ContactsWorkspaceContentProps) {
  const visible = selectContacts(contacts, { query, sourceIds, time }, new Date())
  const selected = contacts.find((contact) => contact.id === selectedId) ?? null
  const toggleSource = (source: ConnectorId, checked: boolean) => onSourceIdsChange(checked ? [...sourceIds, source] : sourceIds.filter((item) => item !== source))

  return <section className={`contacts-page${selected ? ' contacts-page-preview' : ''}`}>
    <div className="contacts-main">
      <header className="contacts-header"><div><h1>{copy.title}</h1><p>{copy.explainer}</p></div><Button className="contacts-get" onPress={() => onAction('', 'refresh')}><BotMessageSquare aria-hidden="true" />{copy.get}</Button></header>
      <p className="contacts-demo-note">{copy.demo}</p>
      <div className="contacts-controls">
        <TextField aria-label={copy.search} className="contacts-search" onChange={onQueryChange} type="search" value={query}><InputGroup><InputGroup.Prefix><Search aria-hidden="true" /></InputGroup.Prefix><InputGroup.Input placeholder={copy.search} /></InputGroup></TextField>
        <Select aria-label={copy.time} className="contacts-time" onSelectionChange={(key) => onTimeChange(String(key) as ContactTime)} selectedKey={time} variant="secondary"><Select.Trigger><span>{copy.time}:</span><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox>{contactTimes.map((item) => <ListBox.Item id={item} key={item} textValue={copy.times[item]}>{copy.times[item]}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover></Select>
        <details className="contacts-source-filter"><summary>{copy.source}: <span>{sourceIds.length ? sourceIds.map((source) => copy.sources[source]).join(', ') : copy.allSources}</span><ChevronDown aria-hidden="true" /></summary><div>{connectedSources.map((source) => <label key={source}><input checked={sourceIds.includes(source)} onChange={(event) => toggleSource(source, event.target.checked)} type="checkbox" /><img alt="" src={connectorLogos[source]} />{copy.sources[source]}</label>)}</div></details>
      </div>
      <div className="contacts-list" role="table" aria-label={copy.title}>
        <div className="contacts-list-head" role="row"><span role="columnheader">{copy.fields.name}</span><span role="columnheader">{copy.fields.relationship}</span><span role="columnheader">{copy.fields.sources}</span><span aria-hidden="true" /></div>
        {visible.map((contact) => <div className={contact.id === selectedId ? 'contacts-row contacts-row-selected' : 'contacts-row'} data-contacts-id={contact.id} key={contact.id} role="row">
          <Button aria-pressed={contact.id === selectedId} className="contacts-open" onPress={() => onOpen(contact.id)} variant="ghost"><span className="contacts-avatar" aria-hidden="true">{contact.name.slice(0, 1).toUpperCase()}</span><span>{contact.name}</span></Button>
          <Button className="contacts-open contacts-relationship" onPress={() => onOpen(contact.id)} variant="ghost">{contact.relationship}</Button>
          <Button className="contacts-open contacts-source-names" onPress={() => onOpen(contact.id)} variant="ghost">{sourceNames(contact, copy)}</Button>
          <Dropdown><Button aria-label={`${copy.more}: ${contact.name}`} className="contacts-more" isIconOnly size="sm" variant="ghost"><MoreHorizontal aria-hidden="true" /></Button><Dropdown.Popover placement="bottom right"><Dropdown.Menu aria-label={copy.more} onAction={(key) => onAction(contact.id, String(key) as ContactAction)}><Dropdown.Item id="edit" textValue={copy.edit}>{copy.edit}</Dropdown.Item><Dropdown.Item id="invite" textValue={copy.invite}>{copy.invite}</Dropdown.Item><Dropdown.Item id="delete" textValue={copy.remove} variant="danger">{copy.remove}</Dropdown.Item></Dropdown.Menu></Dropdown.Popover></Dropdown>
        </div>)}
      </div>
      {!visible.length && <div className="contacts-empty"><p>{contacts.length ? copy.empty : copy.empty}</p></div>}
    </div>
    {selected && <aside aria-label={copy.profile} className="contacts-profile"><header><span className="contacts-avatar contacts-avatar-large" aria-hidden="true">{selected.name.slice(0, 1).toUpperCase()}</span><div><h2>{selected.name}</h2><p>{selected.relationship}</p></div><Button aria-label={copy.close} isIconOnly onPress={() => onOpen(null)} size="sm" variant="ghost"><X aria-hidden="true" /></Button></header><section className="contacts-profile-sources"><h3>{copy.fields.sources}</h3>{selected.sources.length ? selected.sources.map((source) => <p key={source.connector}><img alt="" src={connectorLogos[source.connector]} /><span>{copy.sources[source.connector]} · <strong>{source.name}</strong></span></p>) : <p>{copy.allSources}</p>}</section><article className="contacts-profile-text"><p>{`${selected.profile.summary} ${selected.profile.recentContacts} ${selected.profile.relationship} ${selected.profile.context || copy.noContext}`}</p></article><footer><Button onPress={() => onAction(selected.id, 'refresh')} variant="secondary"><RefreshCw aria-hidden="true" />{copy.refresh}</Button><Button onPress={() => onAction(selected.id, 'edit')} variant="ghost"><Pencil aria-hidden="true" />{copy.edit}</Button></footer></aside>}
  </section>
}

export default function ContactsWorkspace({ copy, locale, service = createContactsService(), onOpenSettings }: { copy: ContactsCopy; locale: Locale; service?: ContactsService; onOpenSettings: () => void }) {
  const [contacts, setContacts] = useState<Contact[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [time, setTime] = useState<ContactTime>('all')
  const [sourceIds, setSourceIds] = useState<ConnectorId[]>([])
  const [connectedSources] = useState<ConnectorId[]>(() => typeof window === 'undefined' ? [...connectorIds] : connectorIds.filter((source) => loadSettings(window.localStorage).connectors[source] === 'connected'))
  const [getStep, setGetStep] = useState<'explain' | 'chat' | 'result' | null>(null)
  const [command, setCommand] = useState('')
  const [candidates, setCandidates] = useState<Contact[]>([])
  const [editing, setEditing] = useState<Contact | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [editError, setEditError] = useState('')

  useEffect(() => { void service.load().then(setContacts) }, [service])
  const selected = contacts?.find((contact) => contact.id === selectedId) ?? null
  const update = (action: Promise<Contact[]>, nextNotice: string) => { void action.then((next) => { setContacts(next); setNotice(nextNotice) }).catch(() => setEditError(copy.editDialog.error)) }
  const openDiscovery = () => {
    if (!connectedSources.length) { onOpenSettings(); return }
    setCommand(copy.getDialog.command(connectedSources.map((source) => copy.sources[source]).join('、')))
    setCandidates([])
    setGetStep('explain')
  }
  const discover = () => { void service.discover(connectedSources).then((next) => { setCandidates(next); setGetStep('result') }) }
  const saveEdit = () => {
    if (!editing) return
    update(service.update(editing.id, { name: editing.name, relationship: editing.relationship, sources: editing.sources, contextPrompt: editing.contextPrompt }), copy.notices.saved)
    setEditing(null)
  }
  const action = (id: string, kind: ContactAction) => {
    if (kind === 'refresh' && !id) { openDiscovery(); return }
    if (!contacts) return
    const contact = contacts.find((item) => item.id === id)
    if (!contact) return
    if (kind === 'edit') { setEditing(structuredClone(contact)); setEditError(''); return }
    if (kind === 'delete') { setDeletingId(id); return }
    if (kind === 'invite') update(service.invite(id), copy.notices.invited)
    if (kind === 'refresh') update(service.refresh(id), copy.notices.refreshed)
  }

  if (!contacts) return <section className="contacts-state" role="status">{copy.loading}</section>
  return <><ContactsWorkspaceContent connectedSources={connectedSources} contacts={contacts} copy={copy} onAction={action} onOpen={setSelectedId} onQueryChange={setQuery} onSourceIdsChange={setSourceIds} onTimeChange={setTime} query={query} selectedId={selectedId} sourceIds={sourceIds} time={time} />
    {!contacts.length && !connectedSources.length && <Button className="contacts-connect" onPress={onOpenSettings}>{copy.goConnect}</Button>}
    {notice && <p className="contacts-notice" role="status">{notice}</p>}
    <Modal.Backdrop className="exit-backdrop" isOpen={getStep !== null} onOpenChange={(open) => { if (!open) setGetStep(null) }}><Modal.Container className="exit-container contacts-dialog-container" placement="center"><Modal.Dialog className="exit-dialog contacts-dialog"><Modal.Header><Modal.Heading className="exit-title">{copy.getDialog.title}</Modal.Heading></Modal.Header><Modal.Body className="exit-body">{getStep === 'explain' && <p>{copy.getDialog.body}</p>}{getStep === 'chat' && <><p>{copy.getDialog.body}</p><textarea aria-label={copy.getDialog.title} className="contacts-command" onChange={(event) => setCommand(event.target.value)} value={command} /></>}{getStep === 'result' && (candidates.length ? <><p>{copy.getDialog.result}</p><table className="contacts-candidates"><thead><tr><th>{copy.fields.name}</th><th>{copy.fields.relationship}</th><th>{copy.fields.sources}</th></tr></thead><tbody>{candidates.map((candidate) => <tr key={candidate.id}><td>{candidate.name}</td><td>{candidate.relationship}</td><td>{sourceNames(candidate, copy)}</td></tr>)}</tbody></table></> : <p>{copy.getDialog.noResult}</p>)}</Modal.Body><Modal.Footer className="exit-footer"><Button className="modal-cancel" onPress={() => setGetStep(null)}>{copy.getDialog.cancel}</Button>{getStep === 'explain' && <Button onPress={() => setGetStep('chat')}>{copy.getDialog.tryChat}</Button>}{getStep === 'chat' && <Button onPress={discover}>{copy.getDialog.send}</Button>}{getStep === 'result' && candidates.length > 0 && <Button onPress={() => { update(service.confirm(candidates.map((candidate) => candidate.id)), copy.notices.added); setSelectedId(candidates[0].id); setGetStep(null) }}>{copy.getDialog.confirm}</Button>}</Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
    <Modal.Backdrop className="exit-backdrop" isOpen={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null) }}><Modal.Container className="exit-container contacts-dialog-container" placement="center"><Modal.Dialog className="exit-dialog contacts-dialog"><Modal.Header><Modal.Heading className="exit-title">{copy.editDialog.title}</Modal.Heading></Modal.Header><Modal.Body className="exit-body">{editing && <form className="contacts-edit-form" onSubmit={(event) => { event.preventDefault(); saveEdit() }}><TextField aria-label={copy.fields.name} onChange={(name) => setEditing({ ...editing, name })} value={editing.name}><InputGroup><InputGroup.Input /></InputGroup></TextField><TextField aria-label={copy.fields.relationship} onChange={(relationship) => setEditing({ ...editing, relationship })} value={editing.relationship}><InputGroup><InputGroup.Input /></InputGroup></TextField><fieldset><legend>{copy.fields.sources}</legend>{editing.sources.map((source) => <div className="contacts-edit-source" key={source.connector}><img alt="" src={connectorLogos[source.connector]} /><TextField aria-label={`${copy.sources[source.connector]} ${copy.fields.name}`} onChange={(name) => setEditing({ ...editing, sources: editing.sources.map((item) => item.connector === source.connector ? { ...item, name } : item) })} value={source.name}><InputGroup><InputGroup.Input /></InputGroup></TextField><Button onPress={() => setEditing({ ...editing, sources: editing.sources.filter((item) => item.connector !== source.connector) })} size="sm" variant="ghost">{copy.editDialog.removeSource}</Button></div>)}</fieldset><label>{copy.fields.context}<small>{copy.fields.contextHint}</small><textarea onChange={(event) => setEditing({ ...editing, contextPrompt: event.target.value })} value={editing.contextPrompt} /></label>{editError && <p role="alert">{editError}</p>}<Button className="sr-only" type="submit">{copy.editDialog.save}</Button></form>}</Modal.Body><Modal.Footer className="exit-footer"><Button className="modal-cancel" onPress={() => setEditing(null)}>{copy.getDialog.cancel}</Button><Button onPress={saveEdit}>{copy.editDialog.save}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
    <Modal.Backdrop className="exit-backdrop" isOpen={deletingId !== null} onOpenChange={(open) => { if (!open) setDeletingId(null) }}><Modal.Container className="exit-container" placement="center"><Modal.Dialog className="exit-dialog"><Modal.Header><Modal.Heading className="exit-title">{copy.deleteDialog.title}</Modal.Heading></Modal.Header><Modal.Body className="exit-body"><p>{copy.deleteDialog.body}</p></Modal.Body><Modal.Footer className="exit-footer"><Button className="modal-cancel" onPress={() => setDeletingId(null)}>{copy.deleteDialog.cancel}</Button><Button onPress={() => { if (deletingId) { update(service.remove(deletingId), copy.notices.removed); if (selectedId === deletingId) setSelectedId(null) }; setDeletingId(null) }} variant="danger">{copy.deleteDialog.confirm}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
  </>
}
