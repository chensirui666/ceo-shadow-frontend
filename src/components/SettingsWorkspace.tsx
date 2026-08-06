import { useEffect, useState } from 'react'
import type { Locale, Route } from '../appState.ts'
import { translations } from '../content/translations.ts'
import { connectorIds, loadSettings, saveSettings } from '../settingsState.ts'
import type { ConnectorId, FridaySettings, SettingsSection } from '../settingsState.ts'
import SettingsAppsPanel from './SettingsAppsPanel.tsx'
import type { AppsView } from './SettingsAppsPanel.tsx'
import SettingsConfirmation from './SettingsConfirmation.tsx'
import SettingsGeneralPanel from './SettingsGeneralPanel.tsx'
import type { GeneralView } from './SettingsGeneralPanel.tsx'
import SettingsProfilePanel from './SettingsProfilePanel.tsx'
import type { ProfileView } from './SettingsProfilePanel.tsx'

type SettingsWorkspaceProps = {
  locale: Locale
  onClose: () => void
  onNavigate: (route: Route) => void
}

type SettingsView = AppsView | GeneralView | ProfileView
type Confirmation = 'discard' | 'everyone' | ConnectorId | null

export default function SettingsWorkspace({ locale, onClose, onNavigate }: SettingsWorkspaceProps) {
  const [saved, setSaved] = useState<FridaySettings>(() => loadSettings(window.localStorage))
  const [draft, setDraft] = useState<FridaySettings>(saved)
  const [section, setSection] = useState<SettingsSection>(saved.lastSection)
  const [view, setView] = useState<SettingsView>('overview')
  const [confirmation, setConfirmation] = useState<Confirmation>(null)
  const [pendingRoute, setPendingRoute] = useState<Route | null>(null)
  const [busyConnector, setBusyConnector] = useState<ConnectorId | null>(null)
  const [notice, setNotice] = useState('')
  const copy = translations[locale].workspace.settings
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      if (dirty) setConfirmation('discard')
      else onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [dirty, onClose])

  const updateDraft = (update: (current: FridaySettings) => FridaySettings) => setDraft((current) => update(current))
  const moveToView = (nextView: SettingsView) => { setView(nextView); setConfirmation(null); setNotice('') }
  const leave = (route?: Route) => { onClose(); if (route) onNavigate(route) }

  const saveDraft = () => {
    const next = saveSettings(window.localStorage, draft)
    setSaved(next)
    setDraft(next)
    setView('overview')
    setConfirmation(null)
    setNotice(copy.saved)
  }

  const selectSection = (nextSection: SettingsSection) => {
    const nextSaved = saveSettings(window.localStorage, { ...saved, lastSection: nextSection })
    setSaved(nextSaved)
    setDraft((current) => ({ ...current, lastSection: nextSection }))
    setSection(nextSection)
    moveToView('overview')
  }

  const requestClose = (route?: Route) => {
    if (!dirty) return leave(route)
    setPendingRoute(route ?? null)
    setConfirmation('discard')
  }

  const connect = (app: ConnectorId) => {
    setBusyConnector(app)
    window.setTimeout(() => {
      const nextSaved = saveSettings(window.localStorage, { ...saved, connectors: { ...saved.connectors, [app]: 'connected' } })
      setSaved(nextSaved)
      setDraft((current) => ({ ...current, connectors: nextSaved.connectors }))
      setBusyConnector(null)
      setNotice(copy.saved)
    }, 360)
  }

  const disconnect = (app: ConnectorId) => {
    const nextSaved = saveSettings(window.localStorage, { ...saved, connectors: { ...saved.connectors, [app]: 'disconnected' } })
    setSaved(nextSaved)
    setDraft((current) => ({ ...current, connectors: nextSaved.connectors }))
    setConfirmation(null)
    setView('overview')
    setNotice(copy.saved)
  }

  const discardConfirmation = confirmation === 'discard' ? <SettingsConfirmation body={copy.discard.body} cancelLabel={copy.discard.cancel} confirmLabel={copy.discard.confirm} destructive onCancel={() => { setConfirmation(null); setPendingRoute(null) }} onConfirm={() => { setDraft(saved); leave(pendingRoute ?? undefined) }} title={copy.discard.title} /> : null
  const everyoneConfirmation = confirmation === 'everyone' ? <SettingsConfirmation body={copy.general.group.confirmation.body} cancelLabel={copy.general.group.confirmation.cancel} confirmLabel={copy.general.group.confirmation.confirm} onCancel={() => setConfirmation(null)} onConfirm={() => { updateDraft((current) => ({ ...current, general: { ...current.general, respondToEveryone: true } })); setConfirmation(null) }} title={copy.general.group.confirmation.title} /> : null
  const pendingConnector = confirmation && connectorIds.includes(confirmation as ConnectorId) ? confirmation as ConnectorId : null
  const connectorConfirmation = pendingConnector ? <SettingsConfirmation body={copy.apps.disconnect.body(pendingConnector === 'dingtalk' ? 'DingTalk' : 'Feishu')} cancelLabel={copy.apps.disconnect.cancel} confirmLabel={copy.apps.disconnect.confirm(pendingConnector === 'dingtalk' ? 'DingTalk' : 'Feishu')} destructive onCancel={() => setConfirmation(null)} onConfirm={() => disconnect(pendingConnector)} title={copy.apps.disconnect.title(pendingConnector === 'dingtalk' ? 'DingTalk' : 'Feishu')} /> : null

  const content = section === 'apps'
    ? <SettingsAppsPanel busyConnector={busyConnector} confirmation={discardConfirmation ?? connectorConfirmation} copy={copy} notice={notice} onConnect={connect} onRequestClose={requestClose} onRequestDisconnect={setConfirmation} onViewChange={moveToView} saved={saved} view={view as AppsView} />
    : section === 'general'
      ? <SettingsGeneralPanel confirmation={discardConfirmation ?? everyoneConfirmation} copy={copy} draft={draft} notice={notice} onRequestEveryone={() => setConfirmation('everyone')} onSave={saveDraft} onUpdateDraft={updateDraft} onViewChange={moveToView} saved={saved} view={view as GeneralView} />
      : <SettingsProfilePanel confirmation={discardConfirmation} copy={copy} draft={draft} notice={notice} onRequestClose={requestClose} onSave={saveDraft} onUpdateDraft={updateDraft} onViewChange={moveToView} view={view as ProfileView} />

  return <div aria-hidden="false" className="settings-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose() }}>
    <section aria-labelledby="settings-workspace-title" aria-modal="true" className="settings-workspace" role="dialog">
      <aside className="settings-sidebar"><p>SETTINGS</p><nav aria-label={copy.title}>{(['apps', 'general', 'profile'] as const).map((item) => <button className={section === item ? 'settings-nav-item settings-nav-active' : 'settings-nav-item'} key={item} onClick={() => selectSection(item)} type="button">{copy.nav[item]}</button>)}</nav></aside>
      <main className="settings-content"><button aria-label={copy.close} className="settings-close" onClick={() => requestClose()} type="button">×</button><div className="settings-content-inner" id="settings-workspace-title">{content}</div></main>
    </section>
  </div>
}
