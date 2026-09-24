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

test('settings default to safe group handling, a five-minute wait, and editable Contacts rules', () => {
  const settings = settingsState.createDefaultSettings()

  assert.equal(settings.general.respondToEveryone, false)
  assert.equal(settings.general.waitMinutes, 5)
  assert.equal(settings.general.quietHours, null)
  assert.deepEqual(settings.connectors, { dingtalk: 'disconnected', feishu: 'disconnected', teams: 'disconnected' })
  assert.equal(settings.profile.prompt, '先看目标与事实；信息不足先追问；不轻易替人承诺。\n\n结论优先，简短直接；复杂事项给出下一步。\n\n涉及关键判断、对外承诺或敏感议题时，必须交由本人确认。')
  assert.match((settings as unknown as { contacts: { rules: string } }).contacts.rules, /three direct messages/)
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

  assert.deepEqual(settings.connectors, { dingtalk: 'connected', feishu: 'disconnected', teams: 'disconnected' })
  assert.equal(settings.general.waitMinutes, 5)
  assert.equal(settings.general.quietHours, null)
  assert.deepEqual(settings.profile, {
    name: '陈思睿',
    aliases: ['@思睿', '@CS'],
    prompt: '先看目标与事实；信息不足先追问；不轻易替人承诺。\n\n结论优先，简短直接；复杂事项给出下一步。\n\n涉及关键判断、对外承诺或敏感议题时，必须交由本人确认。',
  })
  assert.equal(settings.lastSection, 'apps')
})

test('normalizeSettings discards removed notification preferences', () => {
  const settings = settingsState.normalizeSettings({
    general: { notifications: { handoff: false, reconnect: false, sendFailed: false } },
  })

  assert.equal('notifications' in settings.general, false)
})

test('normalizes a saved Contacts inclusion rule', () => {
  const settings = settingsState.normalizeSettings({ contacts: { rules: '  Add only project sponsors.  ' } })

  assert.equal(settings.contacts.rules, 'Add only project sponsors.')
})

test('persists a blacklisted contact until it is explicitly restored', () => {
  const initial = settingsState.createDefaultSettings()
  const blocked = settingsState.blacklistContact(initial, {
    id: 'mia-lin',
    name: 'Mia Lin',
    sourceLabels: ['DingTalk · Mia Lin', 'Feishu · 林米娅'],
  })

  assert.deepEqual(blocked.contacts.blacklist, [{
    id: 'mia-lin',
    name: 'Mia Lin',
    sourceLabels: ['DingTalk · Mia Lin', 'Feishu · 林米娅'],
  }])
  assert.deepEqual(settingsState.unblacklistContact(blocked, 'mia-lin').contacts.blacklist, [])
})

test('saveSettings persists normalized preferences for a later load', () => {
  const storage = createStorage()
  const saved = settingsState.saveSettings(storage, {
    ...settingsState.createDefaultSettings(),
    connectors: { dingtalk: 'connected', feishu: 'disconnected', teams: 'connected' },
    general: {
      respondToEveryone: false,
      waitMinutes: 10,
      quietHours: { start: '19:00', end: '09:00' },
    },
    lastSection: 'general',
  })

  assert.equal('notifications' in saved.general, false)
  assert.deepEqual(settingsState.loadSettings(storage), saved)
})

test('settings navigation keeps language inside General and recovers old language routes', () => {
  assert.deepEqual(settingsState.settingsSections, ['apps', 'general', 'profile'])
  assert.equal(settingsState.normalizeSettings({ lastSection: 'language' }).lastSection, 'apps')
})
