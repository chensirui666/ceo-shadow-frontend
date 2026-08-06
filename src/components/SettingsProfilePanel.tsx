import { useState } from 'react'
import { Button, Input } from '@heroui/react'
import type { ReactNode } from 'react'
import type { Route } from '../appState.ts'
import type { Translation } from '../content/translations.ts'
import type { FridaySettings } from '../settingsState.ts'

type SettingsProfilePanelProps = {
  confirmation: ReactNode
  copy: Translation['workspace']['settings']
  draft: FridaySettings
  notice: string
  onRequestClose: (route: Route) => void
  onSave: () => void
  onUpdateDraft: (update: (current: FridaySettings) => FridaySettings) => void
}

export default function SettingsProfilePanel({ confirmation, copy, draft, notice, onRequestClose, onSave, onUpdateDraft }: SettingsProfilePanelProps) {
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
      <dl className="profile-reading"><div><dt>{copy.profile.judgment}</dt><dd>{copy.profile.judgmentValue}</dd></div><div><dt>{copy.profile.expression}</dt><dd>{copy.profile.expressionValue}</dd></div><div><dt>{copy.profile.boundaries}</dt><dd>{copy.profile.boundariesValue}</dd></div></dl>
      </div>
    </section>
    <section className="settings-topic"><h3>{copy.safety.title}</h3><div className="safety-inline"><p>{copy.safety.description}</p><ul>{copy.safety.items.map((item) => <li key={item}>{item}</li>)}</ul><p>{copy.safety.handoff}</p><strong>{copy.safety.always}</strong></div></section>
    <div className="settings-actions settings-actions-spread"><Button className="settings-inline-link" onPress={() => onRequestClose('memory')} type="button">{copy.profile.memory} →</Button><Button className="settings-inline-link" onPress={() => onRequestClose('feedback')} type="button">{copy.profile.feedback} →</Button></div><Button className="settings-button settings-button-dark" onPress={onSave} type="button">{copy.profile.save}</Button>{confirmation}
  </>
}
