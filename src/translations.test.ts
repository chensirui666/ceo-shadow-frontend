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

test('the stable tasks route is presented as Projects and Todos to users', () => {
  assert.equal(translations.en.workspace.nav.tasks, 'Projects')
  assert.equal(translations.zh.workspace.nav.tasks, '项目')
  assert.equal(translations.zh.workspace.tasks.sections.todos, '待办')
  assert.equal(translations.en.workspace.tasks.sections.sources, 'Project sources')
})

test('AI Product document copy identifies local editing, feedback, and Copilot entry points', () => {
  assert.equal(translations.zh.workspace.tasks.aiProductDocument.openCopilot, '打开 Copilot')
  assert.equal(translations.en.workspace.tasks.aiProductDocument.feedbackSent, 'Feedback saved for this session')
})
