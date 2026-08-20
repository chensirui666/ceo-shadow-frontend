import { Button, Input, ListBox, Select, Switch } from '@heroui/react'
import type { ReactNode } from 'react'
import type { Locale } from '../appState.ts'
import type { Translation } from '../content/translations.ts'
import { waitMinutes } from '../settingsState.ts'
import type { FridaySettings } from '../settingsState.ts'

type SettingsGeneralPanelProps = {
  confirmation: ReactNode
  copy: Translation['workspace']['settings']
  draft: FridaySettings
  locale: Locale
  notice: string
  onLocaleChange: (locale: Locale) => void
  onRequestEveryone: () => void
  onSave: () => void
  onUpdateDraft: (update: (current: FridaySettings) => FridaySettings) => void
}

export default function SettingsGeneralPanel({ confirmation, copy, draft, locale, notice, onLocaleChange, onRequestEveryone, onSave, onUpdateDraft }: SettingsGeneralPanelProps) {
  return <>
    <header className="settings-sticky-header"><h2>{copy.general.title}</h2><p className="settings-subtitle">{copy.general.subtitle}</p>{notice && <p aria-live="polite" className="settings-notice">{notice}</p>}</header>
    <section className="settings-topic"><h3>{copy.general.group.title}</h3><div className="settings-rule-list"><Switch aria-label={copy.general.group.everyone} className="settings-switch-row" isSelected={draft.general.respondToEveryone} onChange={(selected) => { if (selected) onRequestEveryone(); else onUpdateDraft((current) => ({ ...current, general: { ...current.general, respondToEveryone: false } })) }}><Switch.Content className="settings-switch-content"><span className="settings-switch-copy"><strong>{copy.general.group.everyone}</strong><small>{copy.general.group.direct}</small></span><Switch.Control className="settings-switch"><Switch.Thumb className="settings-switch-thumb" /></Switch.Control></Switch.Content></Switch></div></section>
    <section className="settings-topic"><h3>{copy.general.rhythm.title}</h3><div className="settings-rule-list"><label className="settings-select-row"><span><strong>{copy.general.rhythm.wait}</strong><small>{copy.general.rhythm.description}</small></span><Select aria-label={copy.general.rhythm.wait} className="settings-select-control" selectedKey={draft.general.waitMinutes} onSelectionChange={(key) => onUpdateDraft((current) => ({ ...current, general: { ...current.general, waitMinutes: Number(key) as FridaySettings['general']['waitMinutes'] } }))} variant="secondary"><Select.Trigger className="settings-select"><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover className="settings-select-popover"><ListBox>{waitMinutes.map((minutes) => <ListBox.Item id={minutes} key={minutes} textValue={copy.general.rhythm.waitOptions(minutes)}>{copy.general.rhythm.waitOptions(minutes)}</ListBox.Item>)}</ListBox></Select.Popover></Select></label><Switch aria-label={copy.general.rhythm.quiet} className="settings-switch-row" isSelected={Boolean(draft.general.quietHours)} onChange={(selected) => onUpdateDraft((current) => ({ ...current, general: { ...current.general, quietHours: selected ? current.general.quietHours ?? { start: '19:00', end: '09:00' } : null } }))}><Switch.Content className="settings-switch-content"><span className="settings-switch-copy"><strong>{copy.general.rhythm.quiet}</strong><small>{copy.general.rhythm.helper}</small></span><Switch.Control className="settings-switch"><Switch.Thumb className="settings-switch-thumb" /></Switch.Control></Switch.Content></Switch>{draft.general.quietHours && <div className="settings-time-row"><label className="settings-field"><span>{copy.general.rhythm.quietStart}</span><Input aria-label={copy.general.rhythm.quietStart} onChange={(event) => onUpdateDraft((current) => ({ ...current, general: { ...current.general, quietHours: current.general.quietHours && { ...current.general.quietHours, start: event.target.value } } }))} type="time" value={draft.general.quietHours.start} /></label><label className="settings-field"><span>{copy.general.rhythm.quietEnd}</span><Input aria-label={copy.general.rhythm.quietEnd} onChange={(event) => onUpdateDraft((current) => ({ ...current, general: { ...current.general, quietHours: current.general.quietHours && { ...current.general.quietHours, end: event.target.value } } }))} type="time" value={draft.general.quietHours.end} /></label></div>}</div></section>
    <section className="settings-topic"><h3>{copy.general.preferences.title}</h3><div className="settings-rule-list"><label className="settings-select-row"><span><strong>{copy.general.language.title}</strong><small>{copy.general.language.description}</small></span><Select aria-label={copy.general.language.title} className="settings-select-control" selectedKey={locale} onSelectionChange={(key) => onLocaleChange(key as Locale)} variant="secondary"><Select.Trigger className="settings-select"><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover className="settings-select-popover"><ListBox><ListBox.Item id="zh" textValue={copy.general.language.chinese}>{copy.general.language.chinese}</ListBox.Item><ListBox.Item id="en" textValue={copy.general.language.english}>{copy.general.language.english}</ListBox.Item></ListBox></Select.Popover></Select></label></div></section>
    <Button className="settings-button settings-button-dark" onPress={onSave} type="button">{copy.general.save}</Button>{confirmation}
  </>
}
