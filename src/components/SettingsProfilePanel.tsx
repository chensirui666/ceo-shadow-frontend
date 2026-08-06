import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Route } from '../appState.ts'
import type { Translation } from '../content/translations.ts'
import type { FridaySettings } from '../settingsState.ts'
import SettingsDetailHeader from './SettingsDetailHeader.tsx'

export type ProfileView = 'overview' | 'user-profile' | 'safety'

type SettingsProfilePanelProps = {
  confirmation: ReactNode
  copy: Translation['workspace']['settings']
  draft: FridaySettings
  notice: string
  onRequestClose: (route: Route) => void
  onSave: () => void
  onUpdateDraft: (update: (current: FridaySettings) => FridaySettings) => void
  onViewChange: (view: ProfileView) => void
  view: ProfileView
}

export default function SettingsProfilePanel({ confirmation, copy, draft, notice, onRequestClose, onSave, onUpdateDraft, onViewChange, view }: SettingsProfilePanelProps) {
  const [newAlias, setNewAlias] = useState('')

  if (view === 'user-profile') return <>
    <SettingsDetailHeader backLabel={copy.back} meta={copy.profile.updated} onBack={() => onViewChange('overview')} subtitle={copy.profile.subtitle(draft.profile.name)} title={copy.profile.title} />
    <section className="profile-detail"><h3>{copy.profile.identity}</h3><label className="settings-field"><span>{copy.profile.name}</span><input onChange={(event) => onUpdateDraft((current) => ({ ...current, profile: { ...current.profile, name: event.target.value } }))} value={draft.profile.name} /></label><div className="settings-field"><span>{copy.profile.aliases}</span><div className="alias-list">{draft.profile.aliases.map((alias) => <span className="alias-chip" key={alias}>{alias}<button aria-label={copy.profile.removeAlias(alias)} onClick={() => onUpdateDraft((current) => ({ ...current, profile: { ...current.profile, aliases: current.profile.aliases.filter((value) => value !== alias) } }))} type="button">×</button></span>)}</div><form className="alias-form" onSubmit={(event) => { event.preventDefault(); const alias = newAlias.trim(); if (alias && !draft.profile.aliases.includes(alias)) onUpdateDraft((current) => ({ ...current, profile: { ...current.profile, aliases: [...current.profile.aliases, alias] } })); setNewAlias('') }}><input onChange={(event) => setNewAlias(event.target.value)} placeholder={copy.profile.aliasPlaceholder} value={newAlias} /><button className="settings-button settings-button-secondary" type="submit">{copy.profile.addAlias}</button></form></div><dl className="profile-reading"><div><dt>{copy.profile.judgment}</dt><dd>{copy.profile.judgmentValue}</dd></div><div><dt>{copy.profile.expression}</dt><dd>{copy.profile.expressionValue}</dd></div><div><dt>{copy.profile.boundaries}</dt><dd>{copy.profile.boundariesValue}</dd></div></dl></section>
    <div className="settings-actions settings-actions-spread"><button className="settings-inline-link" onClick={() => onRequestClose('memory')} type="button">{copy.profile.memory} →</button><button className="settings-inline-link" onClick={() => onRequestClose('feedback')} type="button">{copy.profile.feedback} →</button></div><button className="settings-button settings-button-dark" onClick={onSave} type="button">{copy.profile.save}</button>{confirmation}
  </>

  if (view === 'safety') return <>
    <SettingsDetailHeader backLabel={copy.back} onBack={() => onViewChange('overview')} subtitle={copy.safety.description} title={copy.safety.title} />
    <section className="safety-detail"><h3>{copy.safety.title}</h3><p>{copy.safety.description}</p><ul>{copy.safety.items.map((item) => <li key={item}>{item}</li>)}</ul><p>{copy.safety.handoff}</p><strong>{copy.safety.always}</strong></section>{confirmation}
  </>

  return <>
    <h2>{copy.nav.profile}</h2><p className="settings-subtitle">{copy.profile.description}</p>{notice && <p aria-live="polite" className="settings-notice">{notice}</p>}
    <div className="capability-cards"><button className="capability-card" onClick={() => onViewChange('user-profile')} type="button"><span><strong>{copy.profile.title}</strong><small>{copy.profile.description}</small></span><div className="profile-tags">{copy.profile.tags.map((tag) => <em key={tag}>{tag}</em>)}</div><footer>{copy.profile.updated}<b>›</b></footer></button><button className="capability-card" onClick={() => onViewChange('safety')} type="button"><span><strong>{copy.safety.title}</strong><small>{copy.safety.description}</small></span><p>{copy.safety.summary}</p><footer>{copy.safety.always}<b>›</b></footer></button></div>{confirmation}
  </>
}
