import assert from 'node:assert/strict'
import test from 'node:test'

const { translations } = await import('./content/translations.ts')

test('Chinese Settings copy localizes alias removal and safety summaries', () => {
  const copy = translations.zh.workspace.settings

  assert.equal(copy.profile.removeAlias?.('@CS'), '移除 @CS')
  assert.equal(copy.safety.summary, '承诺 · 敏感事项 · 信息不足 · 要求本人')
})

test('Memory tabs omit supplemental descriptions', () => {
  for (const locale of ['en', 'zh'] as const) {
    const layers = translations[locale].workspace.memory.layers
    assert.equal('description' in layers.context, false)
    assert.equal('description' in layers.user, false)
  }
})

test('Memory page omits introductory and demo copy', () => {
  for (const locale of ['en', 'zh'] as const) {
    const memory = translations[locale].workspace.memory
    assert.equal('description' in memory, false)
    assert.equal('demo' in memory, false)
  }
})
