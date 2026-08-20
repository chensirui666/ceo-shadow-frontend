import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: false, middlewareMode: true } })
after(() => vite.close())

test('a new onboarding session opens the approved welcome dialog with the actual three steps', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {} }))

  assert.match(html, /3 步完成配置/)
  assert.match(html, /预计耗时 3 分钟/)
  assert.match(html, /欢迎使用 Friday/)
  assert.match(html, /准备好认识你的工作分身了吗？/)
  assert.ok(html.indexOf('准备好认识你的工作分身了吗？') < html.indexOf('onboarding-welcome-illustration'))
  assert.match(html, /连接工作来源[\s\S]*建立工作记忆[\s\S]*生成工作风格/)
  assert.doesNotMatch(html, /试运行/)
  assert.match(html, /开始配置/)
  assert.match(html, /onboarding-welcome-dialog/)
  assert.match(html, /onboarding-welcome-illustration/)
  assert.match(html, /onboarding-welcome-memory\.png/)
})

test('a returning onboarding user does not see the welcome dialog again', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {}, welcomeOpen: false }))

  assert.doesNotMatch(html, /onboarding-welcome-dialog/)
})

test('English welcome copy does not mix in Chinese labels', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'en', onComplete: () => {} }))

  assert.match(html, /Set up in 3 steps/)
  assert.match(html, /Estimated time: 3 min/)
  assert.match(html, /Welcome to Friday/)
  assert.match(html, /Ready to meet your work twin\?/)
  assert.doesNotMatch(html, /欢迎使用 Friday|项目记录|四步完成配置/)
})

test('onboarding starts with three steps and does not render the Home timeline', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {} }))

  assert.match(html, /1.*连接工作来源/)
  assert.match(html, /2.*建立工作记忆/)
  assert.match(html, /3.*生成工作风格/)
  assert.doesNotMatch(html, /4.*试运行/)
  assert.match(html, /钉钉/)
  assert.match(html, /飞书/)
  assert.match(html, /Teams/)
  assert.match(html, /至少连接一个应用后继续/)
  assert.doesNotMatch(html, /Recent 24 hours|最近 24 小时|暂无工作事件/)
  assert.doesNotMatch(html, /onboarding-home-events/)
})

test('a queued third step keeps the explicit onboarding completion confirmation without style results', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const state = onboarding.queueWorkStyle(onboarding.advanceFromMemory(onboarding.queueMemory(
    onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')),
  )))
  const html = renderToStaticMarkup(createElement(OnboardingHome, { initialState: state, locale: 'zh', onComplete: () => {}, welcomeOpen: false }))

  assert.match(html, /1.*连接工作来源[\s\S]*2.*建立工作记忆[\s\S]*3.*生成工作风格/)
  assert.match(html, /完成配置/)
  assert.doesNotMatch(html, /20 分钟|工作风格提示词|查看风格|正式开始|进入 Message/)
})

test('Connect apps renders its decorative illustration alongside the connection flow', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'zh', onComplete: () => {} }))

  assert.match(html, /onboarding-connect-layout/)
  assert.match(html, /onboarding-connect-artwork/)
  assert.match(html, /onboarding-connect-editorial/)
})

test('background work no longer blocks onboarding in a 20-minute handoff dialog', async () => {
  const css = await readFile(new URL('./index.css', import.meta.url), 'utf8')

  assert.doesNotMatch(css, /onboarding-background-handoff/)
})

test('formal start restores the firework activation sequence', async () => {
  const { ActivationCelebration, getActivationStartStage } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const { translations } = await vite.ssrLoadModule('/src/content/translations.ts')
  const html = renderToStaticMarkup(createElement(ActivationCelebration, { copy: translations.zh.workspace.onboarding.activation, onFinish: () => {}, stage: 'celebrating' }))

  assert.equal(getActivationStartStage(false), 'celebrating')
  assert.equal(getActivationStartStage(true), 'ready')
  assert.match(html, /onboarding-celebration-scene[\s\S]*onboarding-celebration-firework-rays/)
})

test('memory connector exposes removal only while choosing the read scope', async () => {
  const { MemoryConnector } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const choosing = renderToStaticMarkup(createElement(MemoryConnector, { connectedLabel: 'Connected', logo: '/dingtalk.png', name: 'DingTalk', onRemove: () => {}, removeLabel: 'Remove DingTalk from this Memory' }))
  const reading = renderToStaticMarkup(createElement(MemoryConnector, { connectedLabel: 'Connected', logo: '/dingtalk.png', name: 'DingTalk' }))

  assert.match(choosing, /DingTalk[\s\S]*Connected[\s\S]*Remove DingTalk from this Memory/)
  assert.match(choosing, /<button/)
  assert.doesNotMatch(reading, /<button/)
  assert.match(reading, /Connected/)
})

test('desktop onboarding separates progress, hero, and three support zones', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'en', onComplete: () => {}, welcomeOpen: false }))

  assert.match(html, /onboarding-frame[\s\S]*onboarding-steps[\s\S]*onboarding-panel[\s\S]*onboarding-support-grid/)
  assert.match(html, /onboarding-supported-apps[\s\S]*Supported work apps/)
  assert.match(html, /onboarding-security[\s\S]*Security &amp; permissions/)
  assert.match(html, /onboarding-team-uses[\s\S]*Teams that use Friday/)
})

test('onboarding support cards show upcoming apps, warm security, and team groups', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { locale: 'en', onComplete: () => {}, welcomeOpen: false }))
  const css = await readFile(new URL('./index.css', import.meta.url), 'utf8')

  assert.match(html, /Gmail[\s\S]*Coming soon[\s\S]*Zoom[\s\S]*Coming soon[\s\S]*Google Meet[\s\S]*Coming soon/)
  assert.match(html, /All content is previewed locally on your device[\s\S]*We never access data without your permission[\s\S]*You stay in control. Approval before anything is sent/)
  assert.match(html, /onboarding-team-group-apricot[\s\S]*onboarding-team-group-blue[\s\S]*onboarding-team-group-sage[\s\S]*onboarding-team-group-lavender/)
  assert.match(html, /Product[\s\S]*Operations[\s\S]*Management[\s\S]*Marketing[\s\S]*See customer stories/)
  assert.match(css, /--onboarding-security-accent:\s*#d9772c/)
})

test('onboarding uses the workspace canvas as its only frame and divides its available height', async () => {
  const css = await readFile(new URL('./index.css', import.meta.url), 'utf8')

  assert.match(css, /\.onboarding-page\s*\{[^}]*height:\s*100%/)
  assert.match(css, /\.onboarding-frame\s*\{[^}]*display:\s*grid[^}]*grid-template-rows:\s*9%\s+51%\s+2%\s+33%\s+5%[^}]*border:\s*0/)
  assert.match(css, /\.onboarding-panel\s*\{[^}]*grid-row:\s*2/)
  assert.match(css, /\.onboarding-support-grid\s*\{[^}]*grid-row:\s*4/)
  assert.match(css, /\.onboarding-panel\s*\{[^}]*height:\s*auto[^}]*min-height:\s*0/)
  assert.match(css, /\.workspace-shell:has\(\.onboarding-page\)\s*\{[^}]*grid-template-columns:\s*clamp\(152px,\s*18vw,\s*196px\)\s+minmax\(0,\s*1fr\)/)
  assert.match(css, /\.workspace-shell:has\(\.onboarding-page\)\s+\.workspace-rail\s*\{[^}]*grid-column:\s*1[^}]*grid-row:\s*1/)
  assert.match(css, /\.workspace-shell:has\(\.onboarding-page\)\s+\.workspace-canvas\s*\{[^}]*grid-column:\s*2[^}]*grid-row:\s*1/)
})

test('later onboarding steps render their matching decorative artwork', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const stepTwo = onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk'))
  const stepThree = onboarding.advanceFromMemory(onboarding.queueMemory(stepTwo))
  const submittedStepThree = onboarding.queueWorkStyle(stepThree)
  const props = { locale: 'zh' as const, onComplete: () => {} }

  const stepTwoHtml = renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: stepTwo }))
  assert.match(stepTwoHtml, /onboarding-memory-editorial/)
  assert.doesNotMatch(stepTwoHtml, /已连接的应用/)
  assert.match(stepTwoHtml, /工作消息/)
  assert.match(stepTwoHtml, /日历/)
  assert.match(stepTwoHtml, /在 Memory 中完成数据迁移/)
  assert.doesNotMatch(stepTwoHtml, /ChatGPT|Claude Code|Codex|导出数据/)
  assert.doesNotMatch(stepTwoHtml, /Skip|跳过/)
  const stepThreeHtml = renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: stepThree }))
  assert.match(stepThreeHtml, /onboarding-work-style-editorial/)
  assert.match(stepThreeHtml, /生成工作风格/)
  assert.doesNotMatch(stepThreeHtml, /Skip|跳过/)
  assert.match(stepThreeHtml, /onboarding-style-point/)
  assert.doesNotMatch(stepThreeHtml, /工作风格提示词/)
  assert.match(renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: submittedStepThree })), /onboarding-style-actions[\s\S]*完成配置/)
})

test('a submitted Memory step can continue without opening Memory', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const built = onboarding.queueMemory(onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')))
  const html = renderToStaticMarkup(createElement(OnboardingHome, { initialState: built, locale: 'zh', onComplete: () => {} }))

  assert.match(html, /onboarding-memory-actions[\s\S]*继续/)
  assert.doesNotMatch(html, /查看工作记忆/)
  assert.doesNotMatch(html, /onboarding-work-style-editorial/)
})

test('work-style submission keeps the habits and places its action without a filler benefit block', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const css = await readFile(new URL('./index.css', import.meta.url), 'utf8')
  const props = { locale: 'zh' as const, onComplete: () => {} }
  const stepThree = onboarding.advanceFromMemory(onboarding.queueMemory(onboarding.continueToMemory(onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk'))))
  const stepThreeHtml = renderToStaticMarkup(createElement(OnboardingHome, { ...props, initialState: stepThree }))

  assert.doesNotMatch(stepThreeHtml, /onboarding-style-benefits/)
  assert.match(stepThreeHtml, /onboarding-style-summary[\s\S]*onboarding-style-actions[\s\S]*生成工作风格/)
  assert.match(css, /\.onboarding-work-style-layout \.onboarding-section-footer\s*\{[^}]*margin-top:\s*8px[^}]*padding-top:\s*0/)
  assert.doesNotMatch(css, /\.onboarding-work-style-layout \.onboarding-editorial-artwork > img/)
})

test('a connected app is represented by a success icon instead of a status word', async () => {
  const { default: OnboardingHome } = await vite.ssrLoadModule('/src/components/OnboardingHome.tsx')
  const onboarding = await vite.ssrLoadModule('/src/onboardingState.ts')
  const state = onboarding.connectSource(onboarding.createOnboardingState(), 'dingtalk')
  const html = renderToStaticMarkup(createElement(OnboardingHome, { initialState: state, locale: 'zh', onComplete: () => {}, welcomeOpen: false }))

  assert.match(html, /onboarding-connected[^>]*><svg/)
  assert.doesNotMatch(html, /onboarding-connected[^>]*>已连接</)
})
