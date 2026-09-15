import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { createRoutineDraft } from './routineState.ts'
import type { RoutineSession } from './routineState.ts'
import { createRoutineService } from './routineService.ts'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: false, middlewareMode: true } })
after(() => vite.close())

test('Routine settings show one core-skill selection plus seven weekdays and 48 times', async () => {
  const { default: RoutineSettings } = await vite.ssrLoadModule('/src/components/RoutineSettings.tsx')
  const draft = createRoutineDraft([], 'Asia/Shanghai', 'zh')
  const html = renderToStaticMarkup(createElement(RoutineSettings, { draft, locale: 'zh', service: createRoutineService(), busy: false, onChange: () => {} }))
  assert.match(html, /核心能力/)
  assert.match(html, /选择核心能力/)
  assert.doesNotMatch(html, /每月|PNG/)
  assert.doesNotMatch(html, /内容模板|主题总结|详细 Prompt/)
  assert.equal((html.match(/<option value="[1-7]"/g) || []).length, 7)
  assert.match(html, /周一、周二、周三、周四、周五、周六、周日/)
  assert.equal((html.match(/value="\d\d:(00|30)"/g) || []).length, 48)
  assert.match(html, /可选/)
  assert.match(html, /Asia\/Shanghai/)
  const selectedDays = renderToStaticMarkup(createElement(RoutineSettings, { draft: { ...draft, weekdays: [1, 3] }, locale: 'zh', service: createRoutineService(), busy: false, onChange: () => {} }))
  assert.match(selectedDays, /周一、周三/)
  assert.match(selectedDays, /<option value="1" selected="">周一/)
  assert.match(selectedDays, /<option value="2">周二/)
  assert.match(selectedDays, /<option value="3" selected="">周三/)
})

test('Routine settings use a flat settings hierarchy with consistent row and stack layouts', async () => {
  const { default: RoutineSettings } = await vite.ssrLoadModule('/src/components/RoutineSettings.tsx')
  const draft = createRoutineDraft([], 'Asia/Shanghai', 'zh')
  const html = renderToStaticMarkup(createElement(RoutineSettings, { draft, locale: 'zh', service: createRoutineService(), busy: false, onChange: () => {} }))
  assert.match(html, /<h2[^>]*>设置<\/h2>/)
  assert.match(html, /设置核心能力、生成时间和发送方式。/)
  assert.ok((html.match(/routine-setting-row/g) || []).length >= 4)
  assert.ok((html.match(/routine-core-skill/g) || []).length >= 1)
  assert.doesNotMatch(html, /执行安排/)
})

test('core skill selection starts as one empty slot and renders the chosen Skill as read-only', async () => {
  const { default: RoutineCoreSkill } = await vite.ssrLoadModule('/src/components/RoutineCoreSkill.tsx')
  const draft = createRoutineDraft([], 'Asia/Shanghai', 'zh')
  const empty = renderToStaticMarkup(createElement(RoutineCoreSkill, { draft, locale: 'zh', busy: false, onChange: () => {} }))
  assert.match(empty, /核心能力/)
  assert.match(empty, /选择核心能力/)

  const selected = renderToStaticMarkup(createElement(RoutineCoreSkill, { draft: { ...draft, skillId: 'project-weekly-report' }, locale: 'zh', busy: false, onChange: () => {} }))
  assert.match(selected, /项目周报能力/)
  assert.match(selected, /Friday 创建/)
  assert.match(selected, /汇总本周成果、项目进展、风险与下周重点。/)
  assert.match(selected, /routine-skill-icon--project-weekly-report/)
  assert.doesNotMatch(selected, /<img/)
  assert.doesNotMatch(selected, /内容模板|主题总结|详细 Prompt/)
})

test('skill drawer keeps Add in the selected skill detail instead of every browse card', async () => {
  const { RoutineSkillDrawerBody } = await vite.ssrLoadModule('/src/components/RoutineCoreSkill.tsx')
  assert.equal(typeof RoutineSkillDrawerBody, 'function')
  const draft = createRoutineDraft([], 'Asia/Shanghai', 'zh')
  const props = { draft, locale: 'zh' as const, busy: false, onAdd: () => {}, onDetail: () => {} }
  const browse = renderToStaticMarkup(createElement(RoutineSkillDrawerBody, { ...props, detailId: null }))
  assert.match(browse, /早间简报能力.*项目周报能力.*风险与阻塞复盘/s)
  assert.doesNotMatch(browse, /routine-skill-detail-action/)

  const detail = renderToStaticMarkup(createElement(RoutineSkillDrawerBody, { ...props, detailId: 'project-weekly-report' }))
  assert.match(detail, /基于已连接的工作资料，形成一份结构清晰的项目周报。/)
  assert.match(detail, /能力说明.*输入.*产出.*编辑/s)
  assert.match(detail, /routine-skill-detail-action/)
  assert.match(detail, /Add/)
})

test('routine settings do not retain legacy content controls or disconnected-app copy', async () => {
  const { default: RoutineSettings } = await vite.ssrLoadModule('/src/components/RoutineSettings.tsx')
  const draft = createRoutineDraft([], 'Asia/Shanghai', 'zh')
  const html = renderToStaticMarkup(createElement(RoutineSettings, { draft, locale: 'zh', service: createRoutineService(), busy: false, onChange: () => {} }))
  assert.doesNotMatch(html, /内容模板|主题总结|详细 Prompt|尚未连接应用。|前往设置/)
})

test('recipient picker searches people and groups together without type tabs', async () => {
  const source = await readFile(new URL('./components/RoutineRecipients.tsx', import.meta.url), 'utf8')
  assert.match(source, /搜索对象/)
  assert.doesNotMatch(source, /\bTabs\b|target\.kind === kind/)
})

test('routine detail keeps tab content separate and template cards toggle with hover preview controls', async () => {
  const source = await readFile(new URL('./components/RoutineWorkspace.tsx', import.meta.url), 'utf8')
  const css = await readFile(new URL('./routine.css', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /shouldForceMount/)
  assert.match(source, /draft\.style === style \? null : style/)
  assert.match(source, /routine-style-preview/)
  assert.match(source, /routine-style-name/)
  assert.match(css, /\.routine-style-section > \.routine-helper, \.routine-sessions-heading p \{[^}]*margin: 4px 0 0/)
})

test('recent sessions use outlined status labels and give every state an operation menu', async () => {
  const { default: RoutineSessions } = await vite.ssrLoadModule('/src/components/RoutineSessions.tsx')
  const routine = createRoutineDraft([], 'Asia/Shanghai', 'zh')
  const service = createRoutineService()
  const recipient = (await service.recipients('dingtalk', 'zh'))[0]
  const base = { routineId: routine.id, title: routine.name, trigger: 'schedule' as const, demo: true }
  const sessions: RoutineSession[] = [
    { ...base, id: 'generating', startedAt: '2026-09-14T01:00:00.000Z', status: 'generating', deliveries: [] },
    { ...base, id: 'generated', startedAt: '2026-09-13T01:00:00.000Z', status: 'completed', deliveries: [] },
    { ...base, id: 'sent', startedAt: '2026-09-12T01:00:00.000Z', status: 'completed', deliveries: [{ target: recipient, status: 'sent' }] },
    { ...base, id: 'delivery-failed', startedAt: '2026-09-11T01:00:00.000Z', status: 'completed', deliveries: [{ target: recipient, status: 'failed' }] },
    { ...base, id: 'failed', startedAt: '2026-09-10T01:00:00.000Z', status: 'failed', deliveries: [] },
  ]
  const html = renderToStaticMarkup(createElement(RoutineSessions, { routine, sessions, service, locale: 'zh' }))
  assert.match(html, /Recent Sessions/)
  assert.match(html, /查看每次生成与发送结果。/)
  assert.match(html, /routine-sessions-heading"><h2>Recent Sessions<\/h2><p>/)
  assert.equal((html.match(/routine-session-status(?: |\")/g) || []).length, 5)
  assert.match(html, /生成中.*已生成.*已发送.*发送失败.*生成失败/s)
  assert.doesNotMatch(html, /routine-session-status[^>]*><svg/)
  assert.equal((html.match(/aria-label="更多操作"/g) || []).length, 5)
  assert.doesNotMatch(html, /routine-session-retry/)
})

test('recent-session status frames give long English states enough fixed width', async () => {
  const css = await readFile(new URL('./routine.css', import.meta.url), 'utf8')
  assert.match(css, /grid-template-columns: 58px minmax\(0, 1fr\) 128px 30px/)
  assert.match(css, /\.routine-session-status \{[^}]*width: 128px/)
})

test('connector picker only offers apps not already added to this routine', async () => {
  const source = await readFile(new URL('./components/RoutineSettings.tsx', import.meta.url), 'utf8')
  assert.match(source, /const availableConnectors = connected\.filter\(\(id\) => !draft\.recipients\.some\(\(target\) => target\.connector === id\)\)/)
  assert.match(source, /availableConnectors\.map/)
})

test('connector choices open directly beneath the right-side Add control', async () => {
  const settings = await readFile(new URL('./components/RoutineSettings.tsx', import.meta.url), 'utf8')
  const css = await readFile(new URL('./routine.css', import.meta.url), 'utf8')
  assert.match(settings, /routine-connector-control/)
  assert.match(css, /\.routine-connector-control \{[^}]*position: relative/)
  assert.match(css, /\.routine-connector-picker \{[^}]*position: absolute/)
})

test('document previews do not expose temporary or demo labels', async () => {
  const { default: RoutineDocumentView } = await vite.ssrLoadModule('/src/components/RoutineDocument.tsx')
  const draft = { ...createRoutineDraft([], 'Asia/Shanghai', 'zh'), skillId: 'project-weekly-report' as const }
  const document = await createRoutineService().preview(draft, 'zh')
  for (const style of ['edition', 'signal', 'folio']) {
    const html = renderToStaticMarkup(createElement(RoutineDocumentView, { document: { ...document, style }, locale: 'zh' }))
    assert.match(html, /Friday Routine/)
    assert.match(html, /工作进展/)
    assert.doesNotMatch(html, /示例|Demo|未实际生成或发送|未读取你的工作资料/)
    assert.match(html, new RegExp(`routine-paper-${style}`))
  }
})
