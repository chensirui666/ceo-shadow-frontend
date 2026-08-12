import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: false, middlewareMode: true } })
after(() => vite.close())

test('a new onboarding session opens the approved welcome dialog with the actual four steps', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {}, onOpenMemory: () => {} }))

  assert.match(html, /4 步完成配置/)
  assert.match(html, /预计耗时 3 分钟/)
  assert.match(html, /欢迎使用 Friday/)
  assert.match(html, /准备好认识你的工作分身了吗？/)
  assert.ok(html.indexOf('准备好认识你的工作分身了吗？') < html.indexOf('onboarding-welcome-illustration'))
  assert.match(html, /连接工作来源[\s\S]*建立工作记忆[\s\S]*确认工作风格[\s\S]*试运行/)
  assert.match(html, /开始配置/)
  assert.match(html, /onboarding-welcome-dialog/)
  assert.match(html, /onboarding-welcome-illustration/)
  assert.match(html, /onboarding-welcome-memory\.png/)
})

test('a returning onboarding user does not see the welcome dialog again', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {}, onOpenMemory: () => {}, welcomeOpen: false }))

  assert.doesNotMatch(html, /onboarding-welcome-dialog/)
})

test('English welcome copy does not mix in Chinese labels', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'en', onComplete: () => {}, onOpenMemory: () => {} }))

  assert.match(html, /Set up in 4 steps/)
  assert.match(html, /Estimated time: 3 min/)
  assert.match(html, /Welcome to Friday/)
  assert.match(html, /Ready to meet your work twin\?/)
  assert.doesNotMatch(html, /欢迎使用 Friday|项目记录|四步完成配置/)
})

test('formal activation runs a five-second celebration before the requested completion dialog', async () => {
  const { ACTIVATION_CELEBRATION_DURATION, ActivationCelebration, getActivationStartStage } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const { translations } = await vite.ssrLoadModule('/src/content/translations.ts')
  const copy = translations.zh.workspace.onboarding.activation

  assert.equal(ACTIVATION_CELEBRATION_DURATION, 5_000)
  assert.equal(getActivationStartStage(false), 'celebrating')
  assert.equal(getActivationStartStage(true), 'ready')

  const celebration = renderToStaticMarkup(createElement(ActivationCelebration, { copy, onFinish: () => {}, stage: 'celebrating' }))
  assert.match(celebration, /onboarding-activation-celebration/)
  assert.match(celebration, /onboarding-celebration-crew/)
  assert.match(celebration, /onboarding-celebration-rocket/)
  assert.match(celebration, /onboarding-celebration-burst/)
  assert.match(celebration, /onboarding-celebration-firework-halo/)
  assert.match(celebration, /onboarding-celebration-firework-rays/)
  assert.match(celebration, /onboarding-celebration-person-hat/)
  assert.match(celebration, /onboarding-celebration-person-coat/)

  const ready = renderToStaticMarkup(createElement(ActivationCelebration, { copy, onFinish: () => {}, stage: 'ready' }))
  assert.match(ready, /你的工作分身已启用/)
  assert.match(ready, /Friday 已准备好开始协助你工作/)
  assert.match(ready, /开始体验/)
})

test('onboarding starts with four steps and does not render the Home timeline', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {}, onOpenMemory: () => {} }))

  assert.match(html, /1.*连接工作来源/)
  assert.match(html, /2.*建立工作记忆/)
  assert.match(html, /3.*确认工作风格/)
  assert.match(html, /4.*试运行/)
  assert.match(html, /钉钉/)
  assert.match(html, /飞书/)
  assert.match(html, /Teams/)
  assert.match(html, /至少连接一个应用后继续/)
  assert.doesNotMatch(html, /Recent 24 hours|最近 24 小时|暂无工作事件/)
  assert.doesNotMatch(html, /onboarding-home-events/)
})

test('Connect apps renders its decorative illustration alongside the connection flow', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {}, onOpenMemory: () => {} }))

  assert.match(html, /onboarding-connect-layout/)
  assert.match(html, /onboarding-connect-artwork/)
  assert.match(html, /onboarding-connect-editorial/)
})

test('later onboarding steps render their matching decorative artwork', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const stepTwo = onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk'))
  const stepThree = onboarding.advanceFromMemory(onboarding.confirmMemory(stepTwo))
  const stepFour = onboarding.confirmWorkStyle(stepThree)
  const props = { locale: 'zh' as const, onComplete: () => {}, onOpenMemory: () => {} }

  const stepTwoHtml = renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: stepTwo }))
  assert.match(stepTwoHtml, /onboarding-memory-editorial/)
  assert.match(stepTwoHtml, /已连接的应用/)
  assert.match(stepTwoHtml, /工作消息/)
  assert.match(stepTwoHtml, /日历/)
  assert.match(stepTwoHtml, /在 Memory 中完成数据迁移/)
  assert.doesNotMatch(stepTwoHtml, /ChatGPT|Claude Code|Codex|导出数据/)
  assert.doesNotMatch(stepTwoHtml, /Skip|跳过/)
  const stepThreeHtml = renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: stepThree }))
  assert.match(stepThreeHtml, /onboarding-work-style-editorial/)
  assert.match(stepThreeHtml, /蒸馏工作风格/)
  assert.doesNotMatch(stepThreeHtml, /Skip|跳过/)
  assert.match(stepThreeHtml, /onboarding-style-point/)
  assert.doesNotMatch(stepThreeHtml, /查看 Prompt 原文/)
  assert.match(renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: stepFour })), /onboarding-trial-editorial/)
})

test('confirmed Memory remains on step 2 with viewing and continuation actions', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const built = onboarding.confirmMemory(onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')))
  const html = renderToStaticMarkup(createElement(OnboardingHome, { initialState: built, locale: 'zh', onComplete: () => {}, onOpenMemory: () => {} }))

  assert.match(html, /onboarding-memory-actions[\s\S]*查看工作记忆[\s\S]*确认/)
  assert.doesNotMatch(html, /onboarding-work-style-editorial/)
})

test('work-style confirmation explains how style makes Friday sound more like the user', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const props = { locale: 'zh' as const, onComplete: () => {}, onOpenMemory: () => {} }
  const stepThree = onboarding.advanceFromMemory(onboarding.confirmMemory(onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk'))))
  const stepThreeHtml = renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: stepThree }))

  assert.match(stepThreeHtml, /onboarding-style-benefits/)
  assert.match(stepThreeHtml, /onboarding-style-benefits"><strong>工作风格</)
  assert.match(stepThreeHtml, /让 Friday 的回答更接近你日常的思考方式和表达风格。/)
})

test('a connected app is represented by a success icon instead of a status word', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const state = onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { initialState: state, locale: 'zh', onComplete: () => {}, onOpenMemory: () => {}, welcomeOpen: false }))

  assert.match(html, /onboarding-connected[^>]*><svg/)
  assert.doesNotMatch(html, /onboarding-connected[^>]*>已连接</)
})

test('Step 4 keeps its composer in the fixed onboarding panel', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const stepFour = onboarding.recordTrial(
    onboarding.confirmWorkStyle(
      onboarding.advanceFromMemory(onboarding.confirmMemory(
        onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')),
      )),
    ),
    '客户问：当前方案有什么风险？',
  )
  const html = renderToStaticMarkup(createElement(OnboardingHome, { initialState: stepFour, locale: 'zh', onComplete: () => {}, onOpenMemory: () => {} }))

  assert.match(html, /发送给 Friday/)
  assert.doesNotMatch(html, /Trial · 已完成，未发送/)
  assert.doesNotMatch(html, /调整这次回复/)
})
