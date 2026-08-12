import assert from 'node:assert/strict'
import test from 'node:test'

const { translations } = await import('./content/translations.ts')

test('Chinese Settings copy localizes alias removal and safety summaries', () => {
  const copy = translations.zh.workspace.settings

  assert.equal(copy.profile.removeAlias?.('@CS'), '移除 @CS')
  assert.equal(copy.safety.summary, '承诺 · 敏感事项 · 信息不足 · 要求本人')
})

test('Chinese workspace copy uses Chinese controls outside product names', () => {
  const copy = translations.zh.workspace

  assert.equal(copy.onboarding.welcome.duration, '预计耗时 3 分钟')
  assert.equal(copy.onboarding.connection.connect, '连接')
  assert.equal(copy.onboarding.style.promptLabel, '工作风格提示词')
  assert.equal(copy.onboarding.trial.subtitle, '试运行中，消息只会发给 Friday，不会发给同事。')
  assert.equal(copy.feedback.title, '反馈')
  assert.equal(copy.tasks.document.detail, '详情')
  assert.equal(copy.settings.profile.title, '个人资料')
  assert.equal(copy.settings.safety.title, '安全边界')
})

test('onboarding copy omits demo-only notices and keeps Memory migration as one destination', () => {
  for (const locale of ['en', 'zh'] as const) {
    const onboarding = translations[locale].workspace.onboarding
    assert.equal('demo' in onboarding.connection, false)
    assert.equal('demo' in onboarding.memory, false)
    assert.equal('demo' in onboarding.style, false)
    assert.equal('hint' in onboarding.activation, false)
    assert.equal('sources' in onboarding.memory.migration, false)
  }
  assert.equal(translations.zh.workspace.onboarding.memory.migration.body, '你可以在 Memory 中完成数据迁移。')
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

test('AI Product document copy identifies local editing, feedback, and assistant entry points', () => {
  assert.equal(translations.zh.workspace.tasks.aiProductDocument.openCopilot, '打开 AI 助手')
  assert.equal(translations.en.workspace.tasks.aiProductDocument.feedbackSent, 'Feedback saved for this session')
})
