import type { ReactNode } from 'react'
import type { Translation } from '../content/translations.ts'
import { countEnabledNotifications, waitMinutes } from '../settingsState.ts'
import type { FridaySettings } from '../settingsState.ts'
import SettingsDetailHeader from './SettingsDetailHeader.tsx'

export type GeneralView = 'overview' | 'group' | 'rhythm' | 'notifications'

type SettingsGeneralPanelProps = {
  confirmation: ReactNode
  copy: Translation['workspace']['settings']
  draft: FridaySettings
  notice: string
  onRequestEveryone: () => void
  onSave: () => void
  onUpdateDraft: (update: (current: FridaySettings) => FridaySettings) => void
  onViewChange: (view: GeneralView) => void
  saved: FridaySettings
  view: GeneralView
}

type SummaryRowProps = {
  description: string
  onClick: () => void
  title: string
  value: string
}

function SummaryRow({ description, onClick, title, value }: SummaryRowProps) {
  return <button onClick={onClick} type="button"><span><strong>{title}</strong><small>{description}</small></span><em>{value}</em><b>›</b></button>
}

export default function SettingsGeneralPanel({ confirmation, copy, draft, notice, onRequestEveryone, onSave, onUpdateDraft, onViewChange, saved, view }: SettingsGeneralPanelProps) {
  if (view === 'group') return <>
    <SettingsDetailHeader backLabel={copy.back} onBack={() => onViewChange('overview')} subtitle={copy.general.group.description} title={copy.general.group.title} />
    <section className="settings-editor"><p className="settings-fixed-rule">{copy.general.group.direct}</p><label className="settings-switch-row"><span>{copy.general.group.everyone}</span><input checked={draft.general.respondToEveryone} onChange={(event) => { if (event.target.checked) onRequestEveryone(); else onUpdateDraft((current) => ({ ...current, general: { ...current.general, respondToEveryone: false } })) }} type="checkbox" /><span aria-hidden="true" className="settings-switch" /></label></section>
    <button className="settings-button settings-button-dark" onClick={onSave} type="button">{copy.general.save}</button>{confirmation}
  </>

  if (view === 'rhythm') return <>
    <SettingsDetailHeader backLabel={copy.back} onBack={() => onViewChange('overview')} subtitle={copy.general.rhythm.description} title={copy.general.rhythm.title} />
    <section className="settings-editor"><label className="settings-field"><span>{copy.general.rhythm.wait}</span><select onChange={(event) => onUpdateDraft((current) => ({ ...current, general: { ...current.general, waitMinutes: Number(event.target.value) as FridaySettings['general']['waitMinutes'] } }))} value={draft.general.waitMinutes}>{waitMinutes.map((minutes) => <option key={minutes} value={minutes}>{copy.general.rhythm.waitOptions(minutes)}</option>)}</select></label><label className="settings-switch-row"><span>{copy.general.rhythm.quiet}</span><input checked={Boolean(draft.general.quietHours)} onChange={(event) => onUpdateDraft((current) => ({ ...current, general: { ...current.general, quietHours: event.target.checked ? current.general.quietHours ?? { start: '19:00', end: '09:00' } : null } }))} type="checkbox" /><span aria-hidden="true" className="settings-switch" /></label>{draft.general.quietHours && <div className="time-fields"><label className="settings-field"><span>{copy.general.rhythm.quietStart}</span><input onChange={(event) => onUpdateDraft((current) => ({ ...current, general: { ...current.general, quietHours: current.general.quietHours && { ...current.general.quietHours, start: event.target.value } } }))} type="time" value={draft.general.quietHours.start} /></label><label className="settings-field"><span>{copy.general.rhythm.quietEnd}</span><input onChange={(event) => onUpdateDraft((current) => ({ ...current, general: { ...current.general, quietHours: current.general.quietHours && { ...current.general.quietHours, end: event.target.value } } }))} type="time" value={draft.general.quietHours.end} /></label></div>}<p className="settings-helper">{copy.general.rhythm.helper}</p></section>
    <button className="settings-button settings-button-dark" onClick={onSave} type="button">{copy.general.save}</button>
  </>

  if (view === 'notifications') return <>
    <SettingsDetailHeader backLabel={copy.back} onBack={() => onViewChange('overview')} subtitle={copy.general.notifications.description} title={copy.general.notifications.title} />
    <section className="settings-editor">{(['handoff', 'reconnect', 'sendFailed'] as const).map((key) => <label className="settings-switch-row settings-switch-row-description" key={key}><span><strong>{copy.general.notifications[key]}</strong><small>{copy.general.notifications[`${key}Description`]}</small></span><input checked={draft.general.notifications[key]} onChange={(event) => onUpdateDraft((current) => ({ ...current, general: { ...current.general, notifications: { ...current.general.notifications, [key]: event.target.checked } } }))} type="checkbox" /><span aria-hidden="true" className="settings-switch" /></label>)}</section>
    <button className="settings-button settings-button-dark" onClick={onSave} type="button">{copy.general.save}</button>
  </>

  return <>
    <h2>{copy.general.title}</h2><p className="settings-subtitle">{copy.general.subtitle}</p>{notice && <p aria-live="polite" className="settings-notice">{notice}</p>}
    <div className="settings-summary-list">
      <SummaryRow description={copy.general.group.description} onClick={() => onViewChange('group')} title={copy.general.group.title} value={copy.general.group.summary(saved.general.respondToEveryone)} />
      <SummaryRow description={copy.general.rhythm.description} onClick={() => onViewChange('rhythm')} title={copy.general.rhythm.title} value={copy.general.rhythm.summary(saved.general.waitMinutes, saved.general.quietHours ? `${saved.general.quietHours.start}–${saved.general.quietHours.end}` : null)} />
      <SummaryRow description={copy.general.notifications.description} onClick={() => onViewChange('notifications')} title={copy.general.notifications.title} value={copy.general.notifications.summary(countEnabledNotifications(saved.general.notifications))} />
    </div>
  </>
}
