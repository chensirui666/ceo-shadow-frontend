import assert from 'node:assert/strict'
import test from 'node:test'

const sessionStore = await import('./sessionStore.ts')

const createStorage = (entries: Record<string, string>) => {
  const values = new Map(Object.entries(entries))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, String(value)),
    removeItem: (key: string) => values.delete(key),
  }
}

test('loadSession restores a valid user and normalizes an unknown route to Home', () => {
  const storage = createStorage({
    'friday-demo-session': JSON.stringify({ email: 'name@company.com', route: 'not-a-page' }),
  })

  assert.deepEqual(sessionStore.loadSession(storage), {
    email: 'name@company.com',
    route: 'home',
  })
})

test('loadLocale accepts supported values and defaults invalid storage to English', () => {
  assert.equal(sessionStore.loadLocale(createStorage({ 'friday-language': 'zh' })), 'zh')
  assert.equal(sessionStore.loadLocale(createStorage({ 'friday-language': 'fr' })), 'en')
})

test('the onboarding welcome is remembered separately for each account', () => {
  const storage = createStorage({})

  assert.equal(sessionStore.hasSeenOnboardingWelcome(storage, 'new.person@stardust.ai'), false)
  sessionStore.markOnboardingWelcomeSeen(storage, 'new.person@stardust.ai')
  assert.equal(sessionStore.hasSeenOnboardingWelcome(storage, 'new.person@stardust.ai'), true)
  assert.equal(sessionStore.hasSeenOnboardingWelcome(storage, 'another.person@stardust.ai'), false)
})
