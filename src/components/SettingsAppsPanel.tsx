import type { ReactNode } from 'react'
import type { Route } from '../appState.ts'
import type { Translation } from '../content/translations.ts'
import { connectorIds } from '../settingsState.ts'
import type { ConnectorId, FridaySettings } from '../settingsState.ts'
import SettingsDetailHeader from './SettingsDetailHeader.tsx'

export type AppsView = 'overview' | `connector-${ConnectorId}`
type SettingsAppsPanelProps = {
  busyConnector: ConnectorId | null
  confirmation: ReactNode
  copy: Translation['workspace']['settings']
  notice: string
  onConnect: (app: ConnectorId) => void
  onRequestClose: (route: Route) => void
  onRequestDisconnect: (app: ConnectorId) => void
  onViewChange: (view: AppsView) => void
  saved: FridaySettings
  view: AppsView
}

const appNames: Record<ConnectorId, string> = { dingtalk: 'DingTalk', feishu: 'Feishu' }

export default function SettingsAppsPanel({ busyConnector, confirmation, copy, notice, onConnect, onRequestClose, onRequestDisconnect, onViewChange, saved, view }: SettingsAppsPanelProps) {
  const detailApp = view.startsWith('connector-') ? view.replace('connector-', '') as ConnectorId : null
  if (detailApp) {
    const status = saved.connectors[detailApp]
    const connected = status === 'connected'
    const needsReconnect = status === 'needs-reconnect'
    const name = appNames[detailApp]
    const visibleStatus = busyConnector === detailApp ? 'connecting' : status

    return <>
      <SettingsDetailHeader backLabel={copy.back} onBack={() => onViewChange('overview')} status={<span className={connected ? 'connection-status connection-status-connected' : 'connection-status'}>{copy.apps.status[visibleStatus]}</span>} subtitle={connected ? copy.apps.detail.verified : needsReconnect ? copy.apps.detail.reconnect(name) : copy.apps.detail.disconnected(name)} title={name} />
      <section className="settings-detail-copy">
        <h3>{copy.apps.detail.uses(name)}</h3>
        <ul>{copy.apps.detail.usesItems.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>{copy.apps.detail.workScope}</h3>
        <p>{copy.apps.detail.groupScope}</p><p>{copy.apps.detail.directScope}</p>
        <dl><div><dt>{copy.apps.detail.dataScope}</dt><dd>{copy.apps.detail.dataScopeValue}</dd></div><div><dt>{copy.apps.detail.memory}</dt><dd>{copy.apps.detail.memoryValue}</dd></div><div><dt>{copy.apps.detail.mode}</dt><dd>{copy.apps.detail.modeValue} · <button className="settings-inline-link" onClick={() => onRequestClose('home')} type="button">{copy.apps.detail.manageOnHome} →</button></dd></div></dl>
      </section>
      {connected ? <button className="settings-text-danger" onClick={() => onRequestDisconnect(detailApp)} type="button">{copy.apps.action.disconnect(name)}</button> : <button className="settings-button settings-button-dark" disabled={busyConnector === detailApp} onClick={() => onConnect(detailApp)} type="button">{needsReconnect ? copy.apps.action.reconnect(name) : copy.apps.action.connect(name)}</button>}
      {confirmation}
    </>
  }

  return <>
    <h2>{copy.apps.title}</h2><p className="settings-subtitle">{copy.apps.subtitle}</p>
    {notice && <p aria-live="polite" className="settings-notice">{notice}</p>}
    <p className="settings-demo-note">{copy.apps.demo}</p>
    <div className="connector-list">
      {connectorIds.map((app) => {
        const status = busyConnector === app ? 'connecting' : saved.connectors[app]
        return <button className="connector-row" key={app} onClick={() => onViewChange(`connector-${app}`)} type="button">
          <span aria-hidden="true" className="connector-glyph">{app === 'dingtalk' ? 'D' : 'F'}</span><span className="connector-name">{appNames[app]}</span><span className={status === 'connected' ? 'connection-status connection-status-connected' : 'connection-status'}>{copy.apps.status[status]}</span><span aria-hidden="true" className="row-chevron">›</span>
        </button>
      })}
    </div>
  </>
}
