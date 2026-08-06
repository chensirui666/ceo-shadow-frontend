export const settingsStorageKey = 'friday-demo-settings'

export const connectorIds = ['dingtalk', 'feishu'] as const
export const connectorStatuses = ['disconnected', 'connected', 'needs-reconnect'] as const
export const settingsSections = ['apps', 'general', 'language', 'profile'] as const
export const waitMinutes = [1, 5, 10] as const

export type ConnectorId = typeof connectorIds[number]
export type ConnectorStatus = typeof connectorStatuses[number]
export type SettingsSection = typeof settingsSections[number]
export type Notifications = { handoff: boolean; reconnect: boolean; sendFailed: boolean }
export type QuietHours = { start: string; end: string }
export type FridaySettings = {
  connectors: Record<ConnectorId, ConnectorStatus>
  general: {
    respondToEveryone: boolean
    waitMinutes: typeof waitMinutes[number]
    quietHours: QuietHours | null
    notifications: Notifications
  }
  profile: { name: string; aliases: string[] }
  lastSection: SettingsSection
}

type SettingsStorage = Pick<Storage, 'getItem' | 'setItem'>

const asRecord = (value: unknown): Record<string, unknown> => (
  typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
)

const isTime = (value: unknown): value is string => (
  typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
)

const isConnectorStatus = (value: unknown): value is ConnectorStatus => (
  connectorStatuses.includes(value as ConnectorStatus)
)

const isSection = (value: unknown): value is SettingsSection => (
  settingsSections.includes(value as SettingsSection)
)

const isWaitMinutes = (value: unknown): value is typeof waitMinutes[number] => (
  waitMinutes.includes(value as typeof waitMinutes[number])
)

export const createDefaultSettings = (): FridaySettings => ({
  connectors: { dingtalk: 'disconnected', feishu: 'disconnected' },
  general: {
    respondToEveryone: false,
    waitMinutes: 5,
    quietHours: null,
    notifications: { handoff: true, reconnect: true, sendFailed: true },
  },
  profile: { name: '陈思睿', aliases: ['@思睿', '@CS'] },
  lastSection: 'apps',
})

export const normalizeSettings = (value: unknown): FridaySettings => {
  const fallback = createDefaultSettings()
  const record = asRecord(value)
  const connectors = asRecord(record.connectors)
  const general = asRecord(record.general)
  const notifications = asRecord(general.notifications)
  const profile = asRecord(record.profile)
  const quietHours = asRecord(general.quietHours)
  const aliases = Array.isArray(profile.aliases)
    ? [...new Set(profile.aliases.filter((alias): alias is string => typeof alias === 'string').map((alias) => alias.trim()).filter(Boolean))].slice(0, 8)
    : fallback.profile.aliases

  return {
    connectors: {
      dingtalk: isConnectorStatus(connectors.dingtalk) ? connectors.dingtalk : fallback.connectors.dingtalk,
      feishu: isConnectorStatus(connectors.feishu) ? connectors.feishu : fallback.connectors.feishu,
    },
    general: {
      respondToEveryone: typeof general.respondToEveryone === 'boolean' ? general.respondToEveryone : fallback.general.respondToEveryone,
      waitMinutes: isWaitMinutes(general.waitMinutes) ? general.waitMinutes : fallback.general.waitMinutes,
      quietHours: isTime(quietHours.start) && isTime(quietHours.end) ? { start: quietHours.start, end: quietHours.end } : null,
      notifications: {
        handoff: typeof notifications.handoff === 'boolean' ? notifications.handoff : fallback.general.notifications.handoff,
        reconnect: typeof notifications.reconnect === 'boolean' ? notifications.reconnect : fallback.general.notifications.reconnect,
        sendFailed: typeof notifications.sendFailed === 'boolean' ? notifications.sendFailed : fallback.general.notifications.sendFailed,
      },
    },
    profile: {
      name: typeof profile.name === 'string' && profile.name.trim() ? profile.name.trim().slice(0, 40) : fallback.profile.name,
      aliases: aliases.length ? aliases : fallback.profile.aliases,
    },
    lastSection: isSection(record.lastSection) ? record.lastSection : fallback.lastSection,
  }
}

export const countEnabledNotifications = (notifications: Notifications): number => (
  Object.values(notifications).filter(Boolean).length
)

export const loadSettings = (storage: Pick<SettingsStorage, 'getItem'>): FridaySettings => {
  try {
    return normalizeSettings(JSON.parse(storage.getItem(settingsStorageKey) || 'null'))
  } catch {
    return createDefaultSettings()
  }
}

export const saveSettings = (storage: Pick<SettingsStorage, 'setItem'>, value: unknown): FridaySettings => {
  const settings = normalizeSettings(value)
  storage.setItem(settingsStorageKey, JSON.stringify(settings))
  return settings
}
