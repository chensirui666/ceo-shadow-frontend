import { useEffect, useState } from 'react'
import { Button, Input, Checkbox } from '@heroui/react'
import type { Locale } from '../appState.ts'
import type { ConnectorId } from '../settingsState.ts'
import { normalizeRecipients, recipientKey } from '../routineState.ts'
import type { RoutineRecipient } from '../routineState.ts'
import type { RoutineService } from '../routineService.ts'
import RoutineDialog from './RoutineDialog.tsx'

export const routineConnectorNames = { zh: { dingtalk: '钉钉', feishu: '飞书', teams: 'Teams' }, en: { dingtalk: 'DingTalk', feishu: 'Feishu', teams: 'Teams' } }

export default function RoutineRecipients({ connector, selected, locale, service, onClose, onConfirm }: { connector: ConnectorId; selected: RoutineRecipient[]; locale: Locale; service: RoutineService; onClose: () => void; onConfirm: (targets: RoutineRecipient[]) => void }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en
  const [targets, setTargets] = useState<RoutineRecipient[]>([])
  const [draft, setDraft] = useState(selected)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    service.recipients(connector, locale).then((items) => { if (!cancelled) { setTargets(items); setStatus('ready') } }).catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [service, connector, locale, attempt])
  const visible = targets.filter((target) => `${target.name} ${target.detail}`.toLowerCase().includes(query.trim().toLowerCase()))
  const toggle = (target: RoutineRecipient) => setDraft((current) => current.some((item) => recipientKey(item) === recipientKey(target)) ? current.filter((item) => recipientKey(item) !== recipientKey(target)) : normalizeRecipients([...current, target]))
  return <RoutineDialog title={`${t('选择', 'Select ')}${routineConnectorNames[locale][connector]}${t('收件人', ' recipients')}`} onClose={onClose} locale={locale} footer={<><span className="routine-selection-count">{t('已选择', 'Selected')}: {draft.length}</span><Button onPress={onClose} variant="secondary">{t('取消', 'Cancel')}</Button><Button isDisabled={status !== 'ready'} onPress={() => onConfirm(draft)}>{t('确认选择', 'Confirm')}</Button></>}>
    <Input aria-label={t('搜索对象', 'Search people or groups')} className="routine-input" placeholder={t('搜索对象', 'Search people or groups')} value={query} onChange={(event) => setQuery(event.target.value)} />
    {status === 'loading' ? <p role="status">{t('正在加载…', 'Loading…')}</p> : status === 'error' ? <div role="alert"><p>{t('收件人加载失败。', 'Could not load recipients.')}</p><Button onPress={() => setAttempt((value) => value + 1)} variant="secondary">{t('重试', 'Retry')}</Button></div> : <div className="routine-recipient-list">{visible.length ? visible.map((target) => <Checkbox className="routine-recipient-option" key={recipientKey(target)} isSelected={draft.some((item) => recipientKey(item) === recipientKey(target))} onChange={() => toggle(target)}><Checkbox.Content><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><span><strong>{target.name}</strong><small>{target.detail}</small></span></Checkbox.Content></Checkbox>) : <p>{t('没有找到符合条件的对象', 'No matching recipients')}</p>}</div>}
  </RoutineDialog>
}
