import assert from 'node:assert/strict'
import test from 'node:test'

const settingsState = await import('./settingsState.ts')

const createStorage = (entries: Record<string, string> = {}) => {
  const values = new Map(Object.entries(entries))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, String(value)),
  }
}

test('settings default to safe group handling, a five-minute wait, and three alerts', () => {
  const settings = settingsState.createDefaultSettings()

  assert.equal(settings.general.respondToEveryone, false)
  assert.equal(settings.general.waitMinutes, 5)
  assert.equal(settings.general.quietHours, null)
  assert.equal(settingsState.countEnabledNotifications(settings.general.notifications), 3)
  assert.deepEqual(settings.connectors, { dingtalk: 'disconnected', feishu: 'disconnected' })
})

test('normalizeSettings recovers safe values from malformed persisted preferences', () => {
  const settings = settingsState.normalizeSettings({
    connectors: { dingtalk: 'connected', feishu: 'unknown' },
    general: {
      respondToEveryone: true,
      waitMinutes: 7,
      quietHours: { start: '25:00', end: '09:00' },
      notifications: { handoff: false },
    },
    profile: { name: '  陈思睿  ', aliases: [' @思睿 ', '', '@CS', '@CS'] },
    lastSection: 'missing',
  })

  assert.deepEqual(settings.connectors, { dingtalk: 'connected', feishu: 'disconnected' })
  assert.equal(settings.general.waitMinutes, 5)
  assert.equal(settings.general.quietHours, null)
  assert.deepEqual(settings.general.notifications, { handoff: false, reconnect: true, sendFailed: true })
  assert.deepEqual(settings.profile, { name: '陈思睿', aliases: ['@思睿', '@CS'] })
  assert.equal(settings.lastSection, 'apps')
})

test('saveSettings persists normalized preferences for a later load', () => {
  const storage = createStorage()
  const saved = settingsState.saveSettings(storage, {
    ...settingsState.createDefaultSettings(),
    connectors: { dingtalk: 'connected', feishu: 'disconnected' },
    general: {
      respondToEveryone: false,
      waitMinutes: 10,
      quietHours: { start: '19:00', end: '09:00' },
      notifications: { handoff: true, reconnect: false, sendFailed: true },
    },
    lastSection: 'general',
  })

  assert.equal(settingsState.countEnabledNotifications(saved.general.notifications), 2)
  assert.deepEqual(settingsState.loadSettings(storage), saved)
})
