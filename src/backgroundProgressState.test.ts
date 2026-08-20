import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const progress = await import('./backgroundProgressState.ts')
const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: false, middlewareMode: true } })
after(() => vite.close())

test('each completed background task creates an unread bell notification', () => {
  const memoryQueued = progress.queueBackgroundJob(progress.createBackgroundProgressState(), 'memory')
  const memoryComplete = progress.completeBackgroundJob(memoryQueued, 'memory')
  const styleQueued = progress.queueBackgroundJob(memoryComplete, 'work-style')
  const styleComplete = progress.completeBackgroundJob(styleQueued, 'work-style')

  assert.deepEqual(memoryComplete.unreadCompletedJobs, ['memory'])
  assert.deepEqual(styleComplete.unreadCompletedJobs, ['memory', 'work-style'])
  assert.equal(progress.backgroundJobFor(styleComplete, 'memory')?.status, 'completed')
  assert.equal(progress.backgroundJobFor(styleComplete, 'work-style')?.estimatedMinutes, 20)
})

test('opening the bell marks completed background notifications as read', () => {
  const completed = progress.completeBackgroundJob(
    progress.queueBackgroundJob(progress.createBackgroundProgressState(), 'work-style'),
    'work-style',
  )

  const read = progress.markBackgroundNotificationsRead(completed)
  assert.deepEqual(read.unreadCompletedJobs, [])
})

test('background progress lists submitted work without inventing a percentage', async () => {
  const { BackgroundProgressPanel } = await vite.ssrLoadModule('/src/components/BackgroundProgressPanel.tsx')
  const queued = progress.queueBackgroundJob(progress.createBackgroundProgressState(), 'memory')
  const html = renderToStaticMarkup(createElement(BackgroundProgressPanel, {
    copy: {
      title: '后台进度', empty: '目前没有后台任务。', estimate: (minutes: number) => `预计约 ${minutes} 分钟`,
      jobs: { memory: '建立工作记忆', 'work-style': '生成工作风格' },
      status: { running: '正在后台处理', completed: '已完成', failed: '处理失败' },
    },
    jobs: queued.jobs,
  }))

  assert.match(html, /后台进度/)
  assert.match(html, /建立工作记忆[一-鿿\s\S]*正在后台处理[一-鿿\s\S]*预计约 20 分钟/)
  assert.doesNotMatch(html, /0%|100%/)
})

test('completed work style is presented through the bell notification panel', async () => {
  const { BackgroundNotificationsPanel } = await vite.ssrLoadModule('/src/components/BackgroundNotificationsPanel.tsx')
  const completed = progress.completeBackgroundJob(
    progress.queueBackgroundJob(progress.createBackgroundProgressState(), 'work-style'),
    'work-style',
  )
  const html = renderToStaticMarkup(createElement(BackgroundNotificationsPanel, {
    copy: {
      title: '通知', empty: '暂无通知。',
      completed: { memory: { title: '工作记忆已构建完成', body: '已整理完成。' }, 'work-style': { title: '你的工作风格已生成', body: '可前往个人风格查看。', action: '查看个人风格' } },
    },
    jobs: completed.jobs,
    onOpenWorkStyle: () => {},
  }))

  assert.match(html, /你的工作风格已生成[\s\S]*查看个人风格/)
  assert.match(html, /<svg/)
})
