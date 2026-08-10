import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import type { FeedbackCard, FeedbackCardPage, FeedbackDashboardData, FeedbackDetail } from './feedbackState.ts'

const { translations } = await import('./content/translations.ts')
const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: { port: 24683 }, middlewareMode: true } })
after(() => vite.close())

const dashboard: FeedbackDashboardData = {
  metrics: { feedbackCount: 18, coverageRate: 0.72, positiveRate: 0.78, attentionCount: 4 },
  trend: [
    { label: '08-09', positive: 5, negative: 2 },
    { label: '08-10', positive: 9, negative: 2 },
  ],
  sourceTotals: { recipient: 11, owner: 7 },
}

test('feedback components render range controls, measurable quality signals, source labels, cards, and a read-only detail', async () => {
  const { default: FeedbackDashboard } = await vite.ssrLoadModule('/src/components/FeedbackDashboard.tsx')
  const html = renderToStaticMarkup(createElement(FeedbackDashboard, { range: '7d', data: dashboard, copy: translations.zh.workspace.feedback, onRangeChange: () => {} }))

  assert.match(html, /近 7 天/)
  assert.match(html, /反馈覆盖率/)
  assert.match(html, /72%/)
  assert.match(html, /正向 5，负向 2/)
  assert.match(html, /同事评价 11 · 61%/)
  assert.match(html, /我的审核/)
  assert.doesNotMatch(html, /已处理|学习队列/)
})

test('a negative owner card and detail stay source-labelled and read-only', async () => {
  const [{ default: FeedbackCardWall }, { default: FeedbackDetailPanel }] = await Promise.all([
    vite.ssrLoadModule('/src/components/FeedbackCardWall.tsx'),
    vite.ssrLoadModule('/src/components/FeedbackDetailPanel.tsx'),
  ])
  const card: FeedbackCard = {
    id: 'feedback-owner-1', replyId: 'reply-1', source: 'owner', sentiment: 'negative',
    question: '这周能完成上线吗？', reply: '可以，周五前会完成。', note: '信息不足时不要直接承诺时间。', createdAt: '2026-08-10T09:30:00.000Z',
  }
  const detail: FeedbackDetail = { ...card, feedback: [{ id: card.id, source: card.source, sentiment: card.sentiment, note: card.note, createdAt: card.createdAt }] }
  const cardsHtml = renderToStaticMarkup(createElement(FeedbackCardWall, { copy: translations.zh.workspace.feedback, items: [card], locale: 'zh', nextCursor: null, onLoadMore: () => {}, onOpen: () => {} }))
  const detailHtml = renderToStaticMarkup(createElement(FeedbackDetailPanel, { copy: translations.zh.workspace.feedback, detail, locale: 'zh', onClose: () => {} }))
  const errorHtml = renderToStaticMarkup(createElement(FeedbackDetailPanel, { copy: translations.zh.workspace.feedback, detail: null, error: true, locale: 'zh', onClose: () => {}, onRetry: () => {} }))
  const html = cardsHtml + detailHtml + errorHtml

  assert.match(html, /需调整/)
  assert.match(html, /我的审核/)
  assert.match(html, /信息不足时不要直接承诺时间。/)
  assert.doesNotMatch(html, /标记已处理|查看关联回复|学习队列/)
  assert.doesNotMatch(errorHtml, /重试/)
})

test('pagination locks its cursor and discards stale range results', async () => {
  const workspace = await vite.ssrLoadModule('/src/components/FeedbackWorkspace.tsx')
  assert.equal(typeof workspace.mergeFeedbackPage, 'function')
  const current: FeedbackCardPage = { items: [], nextCursor: 'cursor-2' }
  const next: FeedbackCardPage = { items: [{
    id: 'late', replyId: 'reply-late', source: 'recipient', sentiment: 'positive', question: 'Late?', reply: 'Late.', note: 'Late result', createdAt: '2026-08-10T10:00:00.000Z',
  }], nextCursor: null }

  assert.equal(workspace.mergeFeedbackPage('30d', current, '7d', 'cursor-1', next), current)
  assert.equal(workspace.mergeFeedbackPage('30d', current, '30d', 'cursor-1', next), current)
  assert.deepEqual(workspace.mergeFeedbackPage('30d', current, '30d', 'cursor-2', next), next)

  const { default: FeedbackCardWall } = await vite.ssrLoadModule('/src/components/FeedbackCardWall.tsx')
  const html = renderToStaticMarkup(createElement(FeedbackCardWall, { copy: translations.zh.workspace.feedback, items: [], loadingMore: true, locale: 'zh', nextCursor: 'cursor-2', onLoadMore: () => {}, onOpen: () => {} }))
  assert.match(html, /<button[^>]*disabled=""[^>]*>加载更多<\/button>/)
})

test('two immediate load-more invocations send one request for the same range and cursor', async () => {
  const [workspace, serviceModule] = await Promise.all([
    vite.ssrLoadModule('/src/components/FeedbackWorkspace.tsx'),
    vite.ssrLoadModule('/src/feedbackService.ts'),
  ])
  assert.equal(typeof workspace.requestFeedbackPage, 'function')
  const active = { current: null }
  const page: FeedbackCardPage = { items: [], nextCursor: 'cursor-1' }
  const calls: Array<[string, string | null]> = []
  const original = serviceModule.feedbackService.loadCards
  serviceModule.feedbackService.loadCards = async (range: string, cursor: string | null) => {
    calls.push([range, cursor])
    return { items: [], nextCursor: null }
  }

  try {
    const loadMore = () => workspace.requestFeedbackPage(active, '7d', page)
    assert.ok(loadMore())
    assert.equal(loadMore(), null)
    assert.deepEqual(calls, [['7d', 'cursor-1']])
  } finally {
    serviceModule.feedbackService.loadCards = original
  }
})
