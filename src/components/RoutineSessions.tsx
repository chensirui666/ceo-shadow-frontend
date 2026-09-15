import { useState } from 'react'
import { Button, Dropdown } from '@heroui/react'
import { MoreHorizontal } from 'lucide-react'
import { Button as AriaButton } from 'react-aria-components'
import type { Locale } from '../appState.ts'
import { sessionResult } from '../routineState.ts'
import type { RoutineConfig, RoutineDocument, RoutineSession } from '../routineState.ts'
import type { RoutineService } from '../routineService.ts'
import RoutineDialog from './RoutineDialog.tsx'
import RoutineDocumentView from './RoutineDocument.tsx'
import { routineConnectorNames } from './RoutineRecipients.tsx'

type Props = { routine: RoutineConfig; sessions: RoutineSession[]; service: RoutineService; locale: Locale; onSessionChange?: (session: RoutineSession) => void }

export default function RoutineSessions({ routine, sessions, service, locale, onSessionChange }: Props) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en
  const [selected, setSelected] = useState<RoutineSession | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const status = (session: RoutineSession): 'generating' | 'generated' | 'sent' | 'delivery-failed' | 'failed' => {
    const result = sessionResult(session)
    if (result === 'generated' || result === 'sent' || result === 'failed') return result
    return result === 'delivery-failed' || result === 'partial' ? 'delivery-failed' : 'generating'
  }
  const states = {
    generating: { label: t('生成中', 'Generating') },
    generated: { label: t('已生成', 'Generated') },
    sent: { label: t('已发送', 'Sent') },
    'delivery-failed': { label: t('发送失败', 'Delivery failed') },
    failed: { label: t('生成失败', 'Generation failed') },
  }
  const timestamp = (value: string) => {
    const date = new Date(value)
    const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { timeZone: routine.timezone, ...options }).format(date)
    const day = format({ year: 'numeric', month: 'numeric', day: 'numeric' })
    const today = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { timeZone: routine.timezone, year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date())
    return day === today ? format({ hour: '2-digit', minute: '2-digit' }) : format({ month: 'short', day: 'numeric' })
  }
  const retry = async (session: RoutineSession, selectResult = false) => {
    if (busy) return
    setBusy(true); setError('')
    try {
      const result = await service.retry(session)
      onSessionChange?.(result)
      if (selectResult) setSelected(result)
    } catch { setError(t('重试失败，原结果已保留。', 'Retry failed. Original results are kept.')) }
    finally { setBusy(false) }
  }
  const rows = <div className="routine-session-list">{[...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).map((session) => {
    const result = status(session)
    const state = states[result]
    return <article className="routine-session-row" key={session.id}>
      <time dateTime={session.startedAt}>{timestamp(session.startedAt)}</time>
      <strong>{session.title}</strong>
      <span className={`routine-session-status routine-session-status--${result}`}>{state.label}</span>
      <Dropdown><AriaButton aria-label={t('更多操作', 'More actions')} className="routine-session-action" type="button"><MoreHorizontal size={18} /></AriaButton><Dropdown.Popover placement="bottom right"><Dropdown.Menu aria-label={t('会话操作', 'Session actions')} onAction={(key) => { if (key === 'view') { setSelected(session); setError('') } else void retry(session) }}>{result !== 'failed' && <Dropdown.Item id="view" textValue={t('查看详情', 'View details')}>{t('查看详情', 'View details')}</Dropdown.Item>}{result === 'delivery-failed' && <Dropdown.Item id="retry" textValue={t('重试发送', 'Retry delivery')}>{t('重试发送', 'Retry delivery')}</Dropdown.Item>}{result === 'failed' && <Dropdown.Item id="retry" textValue={t('重试', 'Retry')}>{t('重试', 'Retry')}</Dropdown.Item>}</Dropdown.Menu></Dropdown.Popover></Dropdown>
    </article>
  })}</div>
  const links = (document: RoutineDocument) => <div className="routine-session-links">{document.url ? <a href={document.url} target="_blank" rel="noreferrer">{t('打开文件', 'Open file')}</a> : <span>{t('文件服务尚未接入', 'File service unavailable')}</span>}{document.libraryUrl ? <a href={document.libraryUrl} target="_blank" rel="noreferrer">{t('在 Library 查看', 'View in Library')}</a> : <span>{t('Library 尚未接入', 'Library unavailable')}</span>}</div>
  const selectedStatus = selected && states[status(selected)]
  return <section className="routine-sessions">
    <header className="routine-sessions-heading"><h2>Recent Sessions</h2><p>{t('查看每次生成与发送结果。', 'Review the generated content and delivery result for each run.')}</p></header>
    {sessions.length ? rows : <p className="routine-empty">{t('日程执行后，你可以在这里查看生成内容和发送结果。', 'Generated content and delivery results will appear here after a scheduled run.')}</p>}
    {error && !selected && <p className="routine-error" role="alert">{error}</p>}
    {selected && <RoutineDialog title={selected.title} locale={locale} onClose={() => { if (!busy) setSelected(null) }} wide>
      <p className="routine-helper">{new Date(selected.startedAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', { timeZone: routine.timezone, dateStyle: 'medium', timeStyle: 'short' })} · {routine.timezone} · {t('日程触发', 'Scheduled run')}</p>
      <p role="status">{selectedStatus?.label}</p>
      {selected.reason && <p className="routine-error">{selected.reason}</p>}
      {selected.document && <>{links(selected.document)}<RoutineDocumentView document={selected.document} locale={locale} /></>}
      {Object.entries(routineConnectorNames[locale]).filter(([id]) => selected.deliveries.some((delivery) => delivery.target.connector === id)).map(([id, name]) => <section className="routine-delivery-group" key={id}><h3>{name}</h3>{selected.deliveries.filter((delivery) => delivery.target.connector === id).map((delivery) => <div className="routine-delivery-result" key={`${delivery.target.kind}:${delivery.target.id}`}><div><strong>{delivery.target.name}</strong><p className="routine-helper">{delivery.target.detail}</p>{delivery.reason && <p className="routine-error">{delivery.reason}</p>}</div><span>{delivery.status === 'failed' ? states['delivery-failed'].label : delivery.status === 'sent' ? states.sent.label : states.generating.label}</span></div>)}</section>)}
      {status(selected) === 'delivery-failed' && <Button isDisabled={busy} onPress={() => void retry(selected, true)} variant="secondary">{t('仅重试失败对象', 'Retry failed recipients only')}</Button>}
      {error && <p className="routine-error" role="alert">{error}</p>}
    </RoutineDialog>}
  </section>
}
