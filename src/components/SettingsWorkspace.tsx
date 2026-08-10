import { Button, Modal } from '@heroui/react'
import { Cable, SlidersHorizontal, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { Locale, Route } from '../appState.ts'
import { translations } from '../content/translations.ts'
import { connectorIds, loadSettings, saveSettings, settingsSections } from '../settingsState.ts'
import type { ConnectorId, FridaySettings, SettingsSection } from '../settingsState.ts'
import SettingsAppsPanel from './SettingsAppsPanel.tsx'
import SettingsConfirmation from './SettingsConfirmation.tsx'
import SettingsGeneralPanel from './SettingsGeneralPanel.tsx'
import SettingsProfilePanel from './SettingsProfilePanel.tsx'

type SettingsWorkspaceProps = {
  locale: Locale
  onClose: () => void
  onLocaleChange: (locale: Locale) => void
  onNavigate: (route: Route) => void
}

type Confirmation = 'discard' | 'everyone' | ConnectorId | null

const settingsNavIcons: Record<SettingsSection, LucideIcon> = {
  apps: Cable,
  general: SlidersHorizontal,
  profile: UserRound,
}

const connectorNames: Record<ConnectorId, string> = { dingtalk: 'DingTalk', feishu: 'Feishu', teams: 'Teams' }

export default function SettingsWorkspace({ locale, onClose, onLocaleChange, onNavigate }: SettingsWorkspaceProps) {
  const [saved, setSaved] = useState<FridaySettings>(() => loadSettings(window.localStorage))
  const [draft, setDraft] = useState<FridaySettings>(saved)
  const [section, setSection] = useState<SettingsSection>(saved.lastSection)
  const [confirmation, setConfirmation] = useState<Confirmation>(null)
  const [pendingRoute, setPendingRoute] = useState<Route | null>(null)
  const [busyConnector, setBusyConnector] = useState<ConnectorId | null>(null)
  const [notice, setNotice] = useState('')
  const copy = translations[locale].workspace.settings
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  const updateDraft = (update: (current: FridaySettings) => FridaySettings) => setDraft((current) => update(current))
  const leave = (route?: Route) => { onClose(); if (route) onNavigate(route) }

  const requestClose = (route?: Route) => {
    if (!dirty) return leave(route)
    setPendingRoute(route ?? null)
    setConfirmation('discard')
  }

  const saveDraft = () => {
    const next = saveSettings(window.localStorage, draft)
    setSaved(next)
    setDraft(next)
    setConfirmation(null)
    setNotice(copy.saved)
  }

  const selectSection = (nextSection: SettingsSection) => {
    const nextSaved = saveSettings(window.localStorage, { ...saved, lastSection: nextSection })
    setSaved(nextSaved)
    setDraft((current) => ({ ...current, lastSection: nextSection }))
    setSection(nextSection)
    setConfirmation(null)
    setNotice('')
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
    setNotice(copy.saved)
  }

  const discardConfirmation = confirmation === 'discard' ? <SettingsConfirmation body={copy.discard.body} cancelLabel={copy.discard.cancel} confirmLabel={copy.discard.confirm} destructive onCancel={() => { setConfirmation(null); setPendingRoute(null) }} onConfirm={() => { setDraft(saved); leave(pendingRoute ?? undefined) }} title={copy.discard.title} /> : null
  const everyoneConfirmation = confirmation === 'everyone' ? <SettingsConfirmation body={copy.general.group.confirmation.body} cancelLabel={copy.general.group.confirmation.cancel} confirmLabel={copy.general.group.confirmation.confirm} onCancel={() => setConfirmation(null)} onConfirm={() => { updateDraft((current) => ({ ...current, general: { ...current.general, respondToEveryone: true } })); setConfirmation(null) }} title={copy.general.group.confirmation.title} /> : null
  const pendingConnector = confirmation && connectorIds.includes(confirmation as ConnectorId) ? confirmation as ConnectorId : null
  const connectorConfirmation = pendingConnector ? <SettingsConfirmation body={copy.apps.disconnect.body(connectorNames[pendingConnector])} cancelLabel={copy.apps.disconnect.cancel} confirmLabel={copy.apps.disconnect.confirm(connectorNames[pendingConnector])} destructive onCancel={() => setConfirmation(null)} onConfirm={() => disconnect(pendingConnector)} title={copy.apps.disconnect.title(connectorNames[pendingConnector])} /> : null

  const content = section === 'apps'
    ? <SettingsAppsPanel busyConnector={busyConnector} confirmation={discardConfirmation ?? connectorConfirmation} copy={copy} notice={notice} onConnect={connect} onRequestDisconnect={setConfirmation} saved={saved} />
    : section === 'general'
      ? <SettingsGeneralPanel confirmation={discardConfirmation ?? everyoneConfirmation} copy={copy} draft={draft} locale={locale} notice={notice} onLocaleChange={onLocaleChange} onRequestEveryone={() => setConfirmation('everyone')} onSave={saveDraft} onUpdateDraft={updateDraft} />
      : <SettingsProfilePanel confirmation={discardConfirmation} copy={copy} draft={draft} notice={notice} onRequestClose={requestClose} onSave={saveDraft} onUpdateDraft={updateDraft} />

  return <Modal.Backdrop className="settings-overlay" isOpen onOpenChange={(isOpen) => { if (!isOpen) requestClose() }}>
    <Modal.Container className="settings-modal-container" placement="center" size="cover">
      <Modal.Dialog aria-labelledby="settings-workspace-title" className="settings-workspace">
        <aside className="settings-sidebar"><p>{copy.title}</p><nav aria-label={copy.title}>{settingsSections.map((item) => { const NavIcon = settingsNavIcons[item]; return <Button className={section === item ? 'settings-nav-item settings-nav-active' : 'settings-nav-item'} fullWidth key={item} onPress={() => selectSection(item)} type="button" variant="tertiary"><NavIcon aria-hidden="true" /><span>{copy.nav[item]}</span></Button> })}</nav></aside>
        <main className="settings-content"><Button aria-label={copy.close} className="settings-close" isIconOnly onPress={() => requestClose()} type="button">×</Button><div className="settings-content-inner" id="settings-workspace-title">{content}</div></main>
      </Modal.Dialog>
    </Modal.Container>
  </Modal.Backdrop>
}
