import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: { port: 24681 }, middlewareMode: true } })
after(() => vite.close())

test('confirmation detail leads with the decision before its event facts', async () => {
  const [{ default: HomeEventDetail }, { translations }] = await Promise.all([
    vite.ssrLoadModule('/src/components/HomeEventDetail.tsx'),
    vite.ssrLoadModule('/src/content/translations.ts'),
  ])
  const html = renderToStaticMarkup(createElement(HomeEventDetail, {
    busy: false,
    copy: translations.zh.workspace.home,
    event: {
      id: 'confirmation',
      source: 'feishu',
      conversation: '客户交付群',
      sender: '赵明',
      receivedAt: '2026-08-06T10:42:00.000Z',
      status: 'needs-confirmation',
      question: '是否可以承诺本月完成交付？',
      reply: '我们会以本月完成交付为目标，并在本周确认最终资源安排。',
      rationale: '涉及交付时间承诺，需要你确认后再回复。',
    },
    now: new Date('2026-08-06T10:42:00.000Z'),
    onBack: () => {},
    onResolve: () => {},
    onSubmitFeedback: () => {},
    sourceName: '飞书',
  }))

  assert.match(html, /class="home-detail-hero"/)
  assert.match(html, /待你确认/)
  assert.doesNotMatch(html, /<h1>/)
  assert.ok(html.indexOf('是否可以承诺本月完成交付？') < html.indexOf('事件信息'))
  assert.ok(html.indexOf('编辑回复') < html.indexOf('事件信息'))
})

test('waiting detail shows the remaining wait instead of a reply section', async () => {
  const [{ default: HomeEventDetail }, { translations }] = await Promise.all([
    vite.ssrLoadModule('/src/components/HomeEventDetail.tsx'),
    vite.ssrLoadModule('/src/content/translations.ts'),
  ])
  const html = renderToStaticMarkup(createElement(HomeEventDetail, {
    busy: false,
    copy: translations.zh.workspace.home,
    event: {
      id: 'waiting',
      source: 'feishu',
      sender: '刘晨',
      receivedAt: '2026-08-06T10:39:00.000Z',
      status: 'waiting',
      question: '下周的上线时间能确定吗？',
      reply: '目前计划在下周三完成上线。',
      rationale: '等待你先回复，尚未开始处理。',
      waitUntil: '2026-08-06T10:44:00.000Z',
    },
    now: new Date('2026-08-06T10:42:00.000Z'),
    onBack: () => {},
    onResolve: () => {},
    onSubmitFeedback: () => {},
    sourceName: '飞书',
  }))

  assert.match(html, /2分0秒后自动回复/)
  assert.doesNotMatch(html, /<h2>回复<\/h2>/)
})
