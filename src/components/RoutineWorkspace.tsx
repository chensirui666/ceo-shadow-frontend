import { useCallback, useEffect, useState } from 'react'
import { Button, Dropdown, Input, Tabs } from '@heroui/react'
import { Button as AriaButton } from 'react-aria-components'
import { ArrowRight, CalendarDays, MoreHorizontal, Play, Save, Sun, Pencil, Trash2 } from 'lucide-react'
import type { Locale } from '../appState.ts'
import { createRoutineDraft, isRoutineDirty, routineScheduleLabel, routineSkills, validateRoutine } from '../routineState.ts'
import type { RoutineConfig, RoutineDocument, RoutineSession, RoutineSnapshot, RoutineStyle } from '../routineState.ts'
import type { RoutineService } from '../routineService.ts'
import RoutineDialog from './RoutineDialog.tsx'
import RoutineSettings from './RoutineSettings.tsx'
import RoutineSessions from './RoutineSessions.tsx'
import RoutineDocumentView, { routineStyleNames } from './RoutineDocument.tsx'
import '../routine.css'

export type RoutineLeaveGuard = (action: () => void) => void

type Props = { locale: Locale; service: RoutineService; registerLeaveGuard: (guard: RoutineLeaveGuard | null) => void }

export default function RoutineWorkspace({ locale, service, registerLeaveGuard }: Props) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en
  const [snapshot, setSnapshot] = useState<RoutineSnapshot>({ routines: [], sessions: [] })
  const [loaded, setLoaded] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [draft, setDraft] = useState<RoutineConfig | null>(null)
  const [adding, setAdding] = useState(false)
  const [tab, setTab] = useState('sessions')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [preview, setPreview] = useState<RoutineDocument | null>(null)
  const [renaming, setRenaming] = useState(false)
  const [leave, setLeave] = useState<(() => void) | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoutineConfig | null>(null)
  const original = snapshot.routines.find((item) => item.id === draft?.id)
  const dirty = isRoutineDirty(draft, original, adding)
  useEffect(() => {
    let cancelled = false
    setError('')
    service.load().then((value) => { if (!cancelled) { setSnapshot(value); setLoaded(true) } }).catch(() => { if (!cancelled) setError(locale === 'zh' ? '日程加载失败，请重试。' : 'Could not load routines. Try again.') })
    return () => { cancelled = true }
  }, [service, loadAttempt, locale])
  const requestLeave = useCallback((action: () => void) => { if (busy) return; if (dirty) setLeave(() => action); else action() }, [dirty, busy])
  useEffect(() => { registerLeaveGuard(requestLeave); return () => registerLeaveGuard(null) }, [requestLeave, registerLeaveGuard])
  useEffect(() => {
    if (!dirty) return
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [dirty])
  const home = () => { setDraft(null); setAdding(false); setError(''); setRenaming(false) }
  const open = (config: RoutineConfig, nextTab = 'sessions') => { setDraft(structuredClone(config)); setAdding(false); setTab(nextTab); setError(''); setNotice('') }
  const change = (config: RoutineConfig) => { setDraft(config); setNotice(''); setError('') }
  const startAdd = () => { const next = createRoutineDraft(snapshot.routines, Intl.DateTimeFormat().resolvedOptions().timeZone, locale); setDraft(next); setAdding(true); setTab('settings'); setError(''); setNotice('') }
  const validate = () => {
    if (!draft) return false
    const invalid = validateRoutine(draft)
    if (invalid) {
      const messages: Record<string, string> = { name: t('请填写日程名称。', 'Enter a routine name.'), skill: t('请选择一个核心能力。', 'Choose a core skill.'), weekdays: t('请至少选择一个执行星期。', 'Select at least one day.'), time: t('请选择开始生成时间。', 'Select a start time.') }
      setError(messages[invalid] || t('请检查当前配置。', 'Check the current configuration.'))
      return false
    }
    return true
  }
  const save = async (after?: () => void) => {
    if (!draft || busy || !validate()) return
    setBusy(true); setError(''); setNotice('')
    try {
      const next = await service.save(draft)
      setSnapshot(next); setDraft(next.routines.find((item) => item.id === draft.id) || null)
      setNotice(t('已保存', 'Saved'))
      if (adding) home()
      if (after) { setLeave(null); after() }
    } catch { setError(t('保存失败，修改已保留，请重试。', 'Save failed. Your changes are kept; try again.')) }
    finally { setBusy(false) }
  }
  const showPreview = async (style?: RoutineStyle) => {
    if (!draft || busy || !validate()) return
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await service.preview(style ? { ...draft, format: 'pdf', style } : draft, locale)
      if (!result.sections.some((section) => section.body.trim())) {
        setError(t('本次资料不足，未生成预览。请更换核心能力后重试。', 'Not enough information for a preview. Change the core skill and try again.'))
        return
      }
      setPreview(result)
    }
    catch { setError(t('预览失败，请重试或更换核心能力。', 'Preview failed. Try again or change the core skill.')) }
    finally { setBusy(false) }
  }
  const remove = async () => {
    if (!deleteTarget || busy) return
    setBusy(true); setError(''); setNotice('')
    try { setSnapshot(await service.remove(deleteTarget.id)); if (draft?.id === deleteTarget.id) home(); setDeleteTarget(null); setNotice(t('日程已删除', 'Routine deleted')) }
    catch { setError(t('删除失败，日程已保留，请重试。', 'Delete failed. The routine is kept; try again.')) }
    finally { setBusy(false) }
  }
  const toggleRoutine = async (routine: RoutineConfig) => {
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try {
      setSnapshot(await service.save({ ...routine, enabled: !routine.enabled }))
      setNotice(routine.enabled ? t('Routine 已关闭', 'Routine turned off') : t('Routine 已开启', 'Routine turned on'))
    } catch { setError(t('状态更新失败，请重试。', 'Could not update routine status. Try again.')) }
    finally { setBusy(false) }
  }
  const updateSession = (nextSession: RoutineSession) => setSnapshot((current) => ({ ...current, sessions: current.sessions.map((session) => session.id === nextSession.id ? nextSession : session) }))
  const errorView = error && <p className="routine-error" role="alert">{error}</p>
  const form = draft && <RoutineSettings key={draft.id} draft={draft} locale={locale} service={service} busy={busy} onChange={change} />
  return <section className="routine-workspace">
    {!draft || adding ? <>
      <header className="routine-page-heading"><h1>Routine</h1><p>{t('Routine 可以通过不同的 Trigger 触发自动化流程，以协助工作。', 'Routine uses different triggers to automate workflows and help you get work done.')}</p></header>
      {!loaded ? <div className="routine-empty">{errorView || <p role="status">{t('正在加载日程…', 'Loading routines…')}</p>}{error && <Button onPress={() => setLoadAttempt((value) => value + 1)} variant="secondary">{t('重试', 'Retry')}</Button>}</div> : <>
        <h2 className="routine-section-title">{t('推荐', 'Recommended')}</h2>
        <article className="routine-recommendation"><span className="routine-template-icon"><Sun size={24} strokeWidth={1.5} /></span><h3>{t('创建 Routine', 'Create a routine')}</h3><p className="routine-recommendation-author">{t('由 Friday 提供能力', 'Skills by Friday')}</p><p>{t('选择一个核心能力，再设定它的运行时间与交付方式。', 'Choose one core skill, then decide when and where it runs.')}</p><Button onPress={startAdd}>{t('添加', 'Add')}</Button></article>
        <h2 className="routine-section-title routine-my-title">{t('我的日程', 'My routines')}</h2>
        <div className="routine-grid">{snapshot.routines.length ? snapshot.routines.map((routine) => <article className="routine-card" key={routine.id}><Button variant="ghost" className="routine-card-open" onPress={() => open(routine)} type="button"><span className="routine-card-icon"><Sun size={21} strokeWidth={1.7} /></span><h3>{routine.name}</h3><p>{routine.skillId ? routineSkills[locale][routine.skillId].description : t('尚未选择核心能力', 'No core skill selected')}</p><span className="routine-card-schedule"><CalendarDays size={15} />{routineScheduleLabel(routine, locale)}</span></Button><Dropdown><AriaButton aria-label={`${routine.name} ${t('更多操作', 'actions')}`} className="routine-more"><MoreHorizontal size={19} /></AriaButton><Dropdown.Popover><Dropdown.Menu aria-label={t('日程操作', 'Routine actions')} onAction={(key) => { if (key === 'edit') open(routine, 'settings'); else if (key === 'toggle') void toggleRoutine(routine); else setDeleteTarget(routine) }}><Dropdown.Item id="edit" textValue={t('修改设置', 'Edit settings')}>{t('修改设置', 'Edit settings')}</Dropdown.Item><Dropdown.Item id="toggle" textValue={routine.enabled ? t('关闭 Routine', 'Turn off Routine') : t('开启 Routine', 'Turn on Routine')}>{routine.enabled ? t('关闭 Routine', 'Turn off Routine') : t('开启 Routine', 'Turn on Routine')}</Dropdown.Item><Dropdown.Item id="delete" textValue={t('删除', 'Delete')}>{t('删除', 'Delete')}</Dropdown.Item></Dropdown.Menu></Dropdown.Popover></Dropdown></article>) : <p className="routine-empty">{t('还没有日程，从上方添加一个开始', 'No routines yet. Add one above to get started.')}</p>}</div>
      </>}
    </> : <>
      <nav className="routine-breadcrumb" aria-label={t('面包屑', 'Breadcrumb')}><Button variant="ghost" onPress={() => requestLeave(home)} type="button">Routine</Button><ArrowRight size={13} /><span>{draft.name}</span></nav>
      <div className="routine-detail-layout"><aside className="routine-detail-aside"><article className="routine-cover-card"><div className="routine-cover-art"><Sun size={34} strokeWidth={1} /><i /><i /></div><div className="routine-cover-caption"><h2>{draft.name}</h2><p>{draft.skillId ? routineSkills[locale][draft.skillId].description : t('尚未选择核心能力', 'No core skill selected')}</p></div></article><Button className="routine-detail-action" isDisabled={busy} onPress={() => void showPreview()} type="button" variant="ghost"><Play size={15} />{busy ? t('处理中…', 'Working…') : t('试运行', 'Try run')}</Button><Button className="routine-detail-action" isDisabled={busy} onPress={() => void save()} type="button" variant="ghost"><Save size={15} />{t('保存', 'Save')}</Button><Button className="routine-detail-action" isDisabled={busy} onPress={() => setDeleteTarget(draft)} type="button" variant="ghost"><Trash2 size={15} />{t('删除', 'Delete')}</Button></aside>
        <div className="routine-detail-main"><header className="routine-detail-heading">{renaming ? <Input disabled={busy} aria-label={t('日程名称', 'Routine name')} autoFocus className="routine-input routine-name-input" value={draft.name} onChange={(event) => change({ ...draft, name: event.target.value })} onBlur={() => setRenaming(false)} onKeyDown={(event) => { if (event.key === 'Enter') setRenaming(false) }} /> : <h1><Button variant="ghost" isDisabled={busy} onPress={() => setRenaming(true)} aria-label={t('修改名称：', 'Rename: ') + draft.name} type="button">{draft.name}<Pencil size={15} /></Button></h1>}<p>{t('按你的节奏，整理重要的工作。', 'Bring important work together, at your pace.')}</p></header>
          <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(String(key))} variant="secondary" className="routine-detail-tabs">
            <Tabs.ListContainer><Tabs.List aria-label={t('日程详情', 'Routine details')}>{[['sessions', 'Recent Sessions'], ['settings', 'Settings'], ['template', 'Style']].map(([id, label]) => <Tabs.Tab id={id} key={id}>{label}<Tabs.Indicator /></Tabs.Tab>)}</Tabs.List></Tabs.ListContainer>
          {errorView}
          <Tabs.Panel id="sessions"><RoutineSessions key={draft.id} routine={original || draft} sessions={snapshot.sessions.filter((session) => session.routineId === draft.id)} service={service} locale={locale} onSessionChange={updateSession} /></Tabs.Panel>
          <Tabs.Panel id="settings">{form}</Tabs.Panel>
          <Tabs.Panel id="template">{draft.format !== 'pdf' ? <div className="routine-empty"><p>{t('切换为 PDF 后可使用样式模板', 'Switch to PDF to use document styles')}</p><Button isDisabled={busy} onPress={() => change({ ...draft, format: 'pdf' })} variant="secondary">{t('切换为 PDF', 'Switch to PDF')}</Button></div> : <div className="routine-style-section"><h2>{t('选择 PDF 样式', 'Choose a PDF style')}</h2><p className="routine-helper">{t('同样的内容，用你喜欢的方式呈现。', 'The same content, presented your way.')}</p><div className="routine-style-grid">{(['edition', 'signal', 'folio'] as const).map((style) => <div className={`routine-style-option${draft.style === style ? ' is-selected' : ''}`} key={style}><Button className="routine-style-select" variant="ghost" isDisabled={busy} aria-label={`${t('选择', 'Choose')} ${routineStyleNames[locale][style]}`} aria-pressed={draft.style === style} onPress={() => change({ ...draft, style: draft.style === style ? null : style })} type="button"><strong className="routine-style-name">{routineStyleNames[locale][style]}{draft.style === style && <span aria-hidden="true"> ✓</span>}</strong><div className={`routine-style-thumbnail routine-style-${style}`} aria-hidden="true"><small>Friday</small><b>{t('这一周，\n向前一步', 'A week\nof progress')}</b><i /><span /><span /><i /><span /><span /></div></Button><Button variant="ghost" isDisabled={busy} className="routine-style-preview" aria-label={`${t('预览', 'Preview')} ${routineStyleNames[locale][style]}`} onPress={() => void showPreview(style)} type="button"><Play size={14} />{t('预览', 'Preview')}</Button></div>)}</div></div>}</Tabs.Panel>
          </Tabs>
        </div></div>
    </>}
    {!draft && loaded && errorView}
    {notice && <p className="routine-notice" role="status">{notice}</p>}
    {adding && draft && <RoutineDialog title={t('新建 Routine', 'New routine')} subtitle={t('选择一个核心能力，再设置它何时运行与交付。', 'Choose one core skill, then decide when and where it runs.')} icon={<Sun size={26} strokeWidth={1.6} />} className="routine-add-dialog" locale={locale} onClose={home} footer={<><Button isDisabled={busy} onPress={home} variant="secondary">{t('取消', 'Cancel')}</Button><Button isDisabled={busy} onPress={() => void save()}>{busy ? t('正在添加…', 'Adding…') : t('确认添加', 'Add routine')}</Button></>}><section className="routine-add-overview"><p>{t('一条 Routine 定时运行一个核心能力，将已连接的工作资料转化为结果。', 'A Routine runs one core skill on a schedule, turning connected work context into a result.')}</p><h3>{t('如何工作', 'How it works')}</h3><ol><li>{t('选择一个核心能力。', 'Choose one core skill.')}</li><li>{t('设定执行星期与开始生成时间。', 'Set the days and time when generation begins.')}</li><li>{t('生成结果；如需同步给他人，再选择发送对象。', 'Generate the result, then optionally choose people or groups to receive it.')}</li></ol></section><section className="routine-add-settings"><header className="routine-settings-heading"><h2>{t('设置', 'Settings')}</h2></header><section className="routine-setting-section routine-setting-stack"><div className="routine-setting-copy"><label htmlFor={`routine-name-${draft.id}`}>{t('日程名称', 'Routine name')}</label><p>{t('用于识别这条日程。', 'Use a name you will recognize later.')}</p></div><Input disabled={busy} id={`routine-name-${draft.id}`} className="routine-input" value={draft.name} onChange={(event) => change({ ...draft, name: event.target.value })} /></section><RoutineSettings key={draft.id} draft={draft} locale={locale} service={service} busy={busy} onChange={change} showHeading={false} /></section>{errorView}</RoutineDialog>}
    {preview && <RoutineDialog title={t('示例预览', 'Sample preview')} locale={locale} onClose={() => setPreview(null)} wide><div className="routine-preview-canvas"><RoutineDocumentView document={preview} locale={locale} /></div></RoutineDialog>}
    {leave && <RoutineDialog title={t('有未保存的修改', 'Unsaved changes')} locale={locale} onClose={() => setLeave(null)} footer={<><Button isDisabled={busy} onPress={() => { const action = leave; setLeave(null); action() }} variant="secondary">{t('取消保存', 'Discard changes')}</Button><Button isDisabled={busy} onPress={() => void save(leave)}>{t('保存', 'Save')}</Button></>}><p>{t('保存后，后续日程才会使用当前配置；未保存时仍按原配置执行。', 'Save to use this configuration for future runs. Until then, the saved configuration stays in effect.')}</p>{errorView}</RoutineDialog>}
    {deleteTarget && <RoutineDialog title={t('删除此日程？', 'Delete this routine?')} locale={locale} onClose={() => setDeleteTarget(null)} footer={<><Button isDisabled={busy} onPress={() => setDeleteTarget(null)} variant="secondary">{t('取消', 'Cancel')}</Button><Button isDisabled={busy} onPress={() => void remove()} variant="danger">{t('删除', 'Delete')}</Button></>}><p>{t('删除此日程后将停止后续执行，Library 中已有文件会保留。', 'Deleting stops future runs. Existing files in Library are kept.')}</p>{errorView}</RoutineDialog>}
  </section>
}
