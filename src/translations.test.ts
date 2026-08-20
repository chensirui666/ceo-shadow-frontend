import assert from 'node:assert/strict'
import test from 'node:test'

const { translations } = await import('./content/translations.ts')

test('Chinese Settings copy localizes alias removal and the Prompt label', () => {
  const copy = translations.zh.workspace.settings

  assert.equal(copy.profile.removeAlias?.('@CS'), '移除 @CS')
  assert.equal(copy.profile.prompt, 'Prompt')
})

test('Chinese workspace copy uses Chinese controls outside product names', () => {
  const copy = translations.zh.workspace

  assert.equal(copy.onboarding.welcome.duration, '预计耗时 3 分钟')
  assert.equal(copy.onboarding.connection.connect, '连接')
  assert.equal(copy.onboarding.style.extract, '确认处理说明')
  assert.equal(copy.onboarding.actions.continue, '继续')
  assert.equal(copy.notifications.open, '打开通知')
  assert.equal(copy.feedback.title, '反馈')
  assert.equal(copy.tasks.document.detail, '详情')
  assert.equal(copy.settings.profile.title, '个人资料')
  assert.equal(copy.settings.profile.prompt, 'Prompt')
})

test('style-distillation copy omits the redundant edit hint', () => {
  for (const locale of ['en', 'zh'] as const) {
    assert.equal('editHint' in translations[locale].workspace.onboarding.style, false)
  }
})

test('onboarding copy omits demo-only notices and keeps Memory migration as one destination', () => {
  for (const locale of ['en', 'zh'] as const) {
    const onboarding = translations[locale].workspace.onboarding
    assert.equal('demo' in onboarding.connection, false)
    assert.equal('demo' in onboarding.memory, false)
    assert.equal('demo' in onboarding.style, false)
    assert.ok(onboarding.style.confirm)
    assert.ok(onboarding.style.completionConfirm)
    assert.ok(onboarding.activation.completeAction)
    assert.equal('sources' in onboarding.memory.migration, false)
  }
  assert.equal(translations.zh.workspace.onboarding.memory.migration.body, '你可以在 Memory 中完成数据迁移。')
  assert.equal(translations.zh.workspace.onboarding.style.confirm, '开始后台处理')
  assert.equal(translations.zh.workspace.onboarding.activation.completeAction, '开始体验')
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

test('the stable home and tasks routes are presented as Message and Task', () => {
  assert.equal(translations.en.workspace.nav.home, 'Message')
  assert.equal(translations.zh.workspace.nav.home, 'Message')
  assert.equal(translations.en.workspace.nav.tasks, 'Task')
  assert.equal(translations.zh.workspace.nav.tasks, 'Task')
  assert.equal(translations.zh.workspace.tasks.sections.todos, '待办')
  assert.equal(translations.en.workspace.tasks.sections.sources, 'Project sources')
})

test('AI Product document copy identifies local editing, feedback, and assistant entry points', () => {
  assert.equal(translations.zh.workspace.tasks.aiProductDocument.openCopilot, '打开 AI 助手')
  assert.equal(translations.en.workspace.tasks.aiProductDocument.feedbackSent, 'Feedback saved for this session')
})
