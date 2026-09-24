import { useState } from 'react'
import { Button, Input, TextArea } from '@heroui/react'
import type { ReactNode } from 'react'
import type { Translation } from '../content/translations.ts'
import { unblacklistContact } from '../settingsState.ts'
import type { FridaySettings } from '../settingsState.ts'

type SettingsProfilePanelProps = {
  confirmation: ReactNode
  copy: Translation['workspace']['settings']
  draft: FridaySettings
  notice: string
  onSave: () => void
  onUpdateDraft: (update: (current: FridaySettings) => FridaySettings) => void
}

export default function SettingsProfilePanel({ confirmation, copy, draft, notice, onSave, onUpdateDraft }: SettingsProfilePanelProps) {
  const [newAlias, setNewAlias] = useState('')

  return <>
    <header className="settings-sticky-header"><h2>{copy.nav.profile}</h2><p className="settings-subtitle">{copy.profile.description}</p>{notice && <p aria-live="polite" className="settings-notice">{notice}</p>}</header>
    <section className="settings-topic">
      <h3>{copy.profile.title}</h3><p className="settings-section-meta">{copy.profile.subtitle(draft.profile.name)} · {copy.profile.updated}</p>
      <div className="settings-rule-list">
      <label className="settings-field"><span>{copy.profile.name}</span><Input aria-label={copy.profile.name} onChange={(event) => onUpdateDraft((current) => ({ ...current, profile: { ...current.profile, name: event.target.value } }))} value={draft.profile.name} /></label>
      <div className="settings-field">
        <span>{copy.profile.aliases}</span>
        <div className="alias-list">{draft.profile.aliases.map((alias) => <span className="alias-chip" key={alias}>{alias}<Button aria-label={copy.profile.removeAlias(alias)} isIconOnly onPress={() => onUpdateDraft((current) => ({ ...current, profile: { ...current.profile, aliases: current.profile.aliases.filter((value) => value !== alias) } }))} type="button">×</Button></span>)}</div>
        <form className="alias-form" onSubmit={(event) => { event.preventDefault(); const alias = newAlias.trim(); if (alias && !draft.profile.aliases.includes(alias)) onUpdateDraft((current) => ({ ...current, profile: { ...current.profile, aliases: [...current.profile.aliases, alias] } })); setNewAlias('') }}><Input aria-label={copy.profile.aliases} onChange={(event) => setNewAlias(event.target.value)} placeholder={copy.profile.aliasPlaceholder} value={newAlias} /><Button className="settings-button settings-button-secondary" type="submit">{copy.profile.addAlias}</Button></form>
      </div>
      <label className="settings-field settings-prompt-field"><span>{copy.profile.prompt}</span><TextArea aria-label={copy.profile.prompt} onChange={(event) => onUpdateDraft((current) => ({ ...current, profile: { ...current.profile, prompt: event.target.value } }))} value={draft.profile.prompt} /></label>
      <label className="settings-field settings-prompt-field"><span>{copy.profile.contactsRules}</span><small>{copy.profile.contactsRulesHint}</small><TextArea aria-label={copy.profile.contactsRules} onChange={(event) => onUpdateDraft((current) => ({ ...current, contacts: { ...current.contacts, rules: event.target.value } }))} value={draft.contacts.rules} /></label>
      <section className="settings-field settings-blacklist" aria-label={copy.profile.blacklist}><span>{copy.profile.blacklist}</span><small>{copy.profile.blacklistHint}</small>{draft.contacts.blacklist.length ? <ul>{draft.contacts.blacklist.map((contact) => <li key={contact.id}><div><strong>{contact.name}</strong>{contact.sourceLabels.length > 0 && <small>{contact.sourceLabels.join(' · ')}</small>}</div><Button aria-label={copy.profile.removeBlacklist(contact.name)} className="settings-text-danger" onPress={() => onUpdateDraft((current) => unblacklistContact(current, contact.id))} type="button">{copy.profile.removeBlacklist(contact.name)}</Button></li>)}</ul> : <p>{copy.profile.blacklistEmpty}</p>}</section>
      </div>
    </section>
    <Button className="settings-button settings-button-dark" onPress={onSave} type="button">{copy.profile.save}</Button>{confirmation}
  </>
}
