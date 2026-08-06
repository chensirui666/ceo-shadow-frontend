import assert from 'node:assert/strict'
import test from 'node:test'

const { translations } = await import('./content/translations.ts')

test('Chinese Settings copy localizes alias removal and safety summaries', () => {
  const copy = translations.zh.workspace.settings

  assert.equal(copy.profile.removeAlias?.('@CS'), '移除 @CS')
  assert.equal(copy.safety.summary, '承诺 · 敏感事项 · 信息不足 · 要求本人')
})
