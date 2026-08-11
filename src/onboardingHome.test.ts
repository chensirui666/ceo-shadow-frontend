import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: false, middlewareMode: true } })
after(() => vite.close())

test('onboarding starts with four steps, three connection choices, and an empty Home timeline', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {}, onOpenMemory: () => {} }))

  assert.match(html, /1.*连接应用/)
  assert.match(html, /2.*建立 Memory/)
  assert.match(html, /3.*确认工作风格/)
  assert.match(html, /4.*Trial/)
  assert.match(html, /钉钉/)
  assert.match(html, /飞书/)
  assert.match(html, /Teams/)
  assert.match(html, /至少连接一个应用后继续/)
  assert.match(html, /暂无工作事件/)
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
  const stepThree = onboarding.skipMemory(stepTwo)
  const stepFour = onboarding.confirmWorkStyle(stepThree)
  const props = { locale: 'zh' as const, onComplete: () => {}, onOpenMemory: () => {} }

  const stepTwoHtml = renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: stepTwo }))
  assert.match(stepTwoHtml, /onboarding-memory-editorial/)
  assert.match(stepTwoHtml, /已连接的应用/)
  assert.match(stepTwoHtml, /工作消息/)
  assert.match(stepTwoHtml, /日历/)
  const stepThreeHtml = renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: stepThree }))
  assert.match(stepThreeHtml, /onboarding-work-style-editorial/)
  assert.match(stepThreeHtml, /蒸馏工作风格/)
  assert.match(stepThreeHtml, /跳过/)
  assert.match(stepThreeHtml, /onboarding-style-point/)
  assert.doesNotMatch(stepThreeHtml, /查看 Prompt 原文/)
  assert.match(renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: stepFour })), /onboarding-trial-editorial/)
})

test('Step 4 keeps its composer in the fixed panel and places a Trial event in the Home event area', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const stepFour = onboarding.recordTrial(
    onboarding.confirmWorkStyle(
      onboarding.skipMemory(
        onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')),
      ),
    ),
    '客户问：当前方案有什么风险？',
  )
  const html = renderToStaticMarkup(createElement(OnboardingHome, { initialState: stepFour, locale: 'zh', onComplete: () => {}, onOpenMemory: () => {} }))

  assert.match(html, /发送给 Friday/)
  assert.match(html, /Trial · 已完成，未发送/)
  assert.doesNotMatch(html, /调整这次回复/)
})
