import assert from 'node:assert/strict'
import test from 'node:test'

const appState = await import('./appState.ts')

test('isValidEmail accepts a standard work email', () => {
  assert.equal(appState.isValidEmail('name@company.com'), true)
})

test('normalizeCode accepts only six digits', () => {
  assert.equal(appState.normalizeCode('12 34-56'), '123456')
  assert.equal(appState.normalizeCode('12345'), '')
})

test('verifyDemoCode creates a Home session only for the labelled demo code', () => {
  assert.deepEqual(appState.verifyDemoCode('name@company.com', '123456'), {
    email: 'name@company.com',
    route: 'home',
  })
  assert.equal(appState.verifyDemoCode('name@company.com', '000000'), null)
})

test('canResend waits for the countdown to finish', () => {
  assert.equal(appState.canResend(1), false)
  assert.equal(appState.canResend(0), true)
})

test('resolveRoute falls back to home for an unknown destination', () => {
  assert.equal(appState.resolveRoute('not-a-page'), 'home')
})

test('Library is a supported workspace route', () => {
  assert.equal(appState.resolveRoute('library'), 'library')
})

test('resolveLocale defaults to English and accepts the supported Chinese locale', () => {
  assert.equal(appState.resolveLocale(), 'en')
  assert.equal(appState.resolveLocale('zh'), 'zh')
  assert.equal(appState.resolveLocale('fr'), 'en')
})

test('setDocumentLocale aligns the document language with the selected locale', () => {
  const root = { lang: '' }
  const setDocumentLocale = Reflect.get(appState, 'setDocumentLocale')

  assert.equal(typeof setDocumentLocale, 'function')
  if (typeof setDocumentLocale === 'function') {
    setDocumentLocale(root, 'zh')
    assert.equal(root.lang, 'zh-CN')
    setDocumentLocale(root, 'en')
    assert.equal(root.lang, 'en')
  }
})

test('signOut removes visible user state and returns to sign-in', () => {
  assert.deepEqual(appState.signOut(), {
    user: null,
    route: 'sign-in',
  })
})
