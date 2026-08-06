import { Button } from '@heroui/react'
import type { ReactNode } from 'react'
import { connectorLogos } from '../content/connectorLogos.ts'
import type { Translation } from '../content/translations.ts'
import { connectorIds } from '../settingsState.ts'
import type { ConnectorId, FridaySettings } from '../settingsState.ts'

type SettingsAppsPanelProps = {
  busyConnector: ConnectorId | null
  confirmation: ReactNode
  copy: Translation['workspace']['settings']
  notice: string
  onConnect: (app: ConnectorId) => void
  onRequestDisconnect: (app: ConnectorId) => void
  saved: FridaySettings
}

const appNames: Record<ConnectorId, string> = { dingtalk: 'DingTalk', feishu: 'Feishu' }

export default function SettingsAppsPanel({ busyConnector, confirmation, copy, notice, onConnect, onRequestDisconnect, saved }: SettingsAppsPanelProps) {
  return <>
    <header className="settings-sticky-header"><h2>{copy.apps.title}</h2><p className="settings-subtitle">{copy.apps.subtitle}</p>{notice && <p aria-live="polite" className="settings-notice">{notice}</p>}</header>
    <p className="settings-demo-note">{copy.apps.demo}</p>
    <div className="connector-list">
      {connectorIds.map((app) => {
        const status = busyConnector === app ? 'connecting' : saved.connectors[app]
        const connected = status === 'connected'
        const needsReconnect = status === 'needs-reconnect'
        const name = appNames[app]
        return <section className="connector-card" key={app}>
          <span className="connector-glyph"><img alt="" src={connectorLogos[app]} /></span><span className="connector-copy"><span className="connector-name">{name}</span><span className="connector-description">{copy.apps.description[app]}</span></span><div className="connector-action"><span className={connected ? 'connection-status connection-status-connected' : 'connection-status'}>{copy.apps.status[status]}</span>{connected ? <Button className="settings-text-danger" onPress={() => onRequestDisconnect(app)} type="button">{copy.apps.action.disconnect(name)}</Button> : <Button className="settings-button settings-button-dark" isDisabled={busyConnector === app} onPress={() => onConnect(app)} type="button">{needsReconnect ? copy.apps.action.reconnect(name) : copy.apps.action.connect(name)}</Button>}</div>
        </section>
      })}
    </div>
    {confirmation}
  </>
}
