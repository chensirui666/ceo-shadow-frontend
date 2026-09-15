import { useState } from 'react'
import { Button, Select, ListBox } from '@heroui/react'
import type { Locale } from '../appState.ts'
import { connectorIds, loadSettings } from '../settingsState.ts'
import type { ConnectorId } from '../settingsState.ts'
import { connectorLogos } from '../content/connectorLogos.ts'
import { halfHourTimes } from '../routineState.ts'
import type { RoutineConfig, RoutineFormat } from '../routineState.ts'
import type { RoutineService } from '../routineService.ts'
import RoutineCoreSkill from './RoutineCoreSkill.tsx'
import RoutineRecipients, { routineConnectorNames } from './RoutineRecipients.tsx'

function RoutineSelect({ label, value, options, onChange, disabled }: { label: string; value: string | null; options: { id: string; label: string }[]; onChange: (value: string) => void; disabled: boolean }) {
  return <Select aria-label={label} placeholder={label} selectedKey={value} onSelectionChange={(key) => { if (key !== null) onChange(String(key)) }} isDisabled={disabled} className="routine-select" variant="secondary"><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover className="routine-select-popover"><ListBox>{options.map((option) => <ListBox.Item id={option.id} key={option.id} textValue={option.label}>{option.label}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover></Select>
}

export default function RoutineSettings({ draft, locale, service, busy, onChange, showHeading = true }: { draft: RoutineConfig; locale: Locale; service: RoutineService; busy: boolean; onChange: (next: RoutineConfig) => void; showHeading?: boolean }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en
  const [connector, setConnector] = useState<ConnectorId | null>(null)
  const [connectorListOpen, setConnectorListOpen] = useState(false)
  const connected = typeof window === 'undefined' ? [] : connectorIds.filter((id) => loadSettings(window.localStorage).connectors[id] === 'connected')
  const availableConnectors = connected.filter((id) => !draft.recipients.some((target) => target.connector === id))
  const weekdays = locale === 'zh' ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const settingCopy = (title: string, description: string, optional = false) => <div className="routine-setting-copy"><span>{title}{optional && <small>{t('可选', 'Optional')}</small>}</span><p>{description}</p></div>
  return <div className="routine-settings">
    <fieldset disabled={busy}>
      {showHeading && <header className="routine-settings-heading"><h2>{t('设置', 'Settings')}</h2><p>{t('设置核心能力、生成时间和发送方式。', 'Set the core skill, generation time, and delivery.')}</p></header>}
      <RoutineCoreSkill busy={busy} draft={draft} locale={locale} onChange={onChange} />
      <section className="routine-setting-section routine-setting-row">{settingCopy(t('执行星期', 'Days'), t('选择每周在哪些天开始生成。', 'Choose the days when generation starts.'))}<div className="routine-setting-control"><Select aria-label={t('执行星期', 'Days')} placeholder={t('选择星期', 'Select days')} className="routine-select routine-days-select" variant="secondary" selectionMode="multiple" value={draft.weekdays.map(String)} onChange={(keys) => onChange({ ...draft, weekdays: (Array.isArray(keys) ? keys : []).map(Number).sort((a, b) => a - b) })} isDisabled={busy}>
        <Select.Trigger><Select.Value>{draft.weekdays.length ? [...draft.weekdays].sort((a, b) => a - b).map((day) => weekdays[day - 1]).join(locale === 'zh' ? '、' : ', ') : t('选择星期', 'Select days')}</Select.Value><Select.Indicator /></Select.Trigger>
        <Select.Popover className="routine-select-popover"><ListBox selectionMode="multiple">{weekdays.map((day, index) => <ListBox.Item id={String(index + 1)} key={day} textValue={day}>{day}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover>
      </Select></div></section>
      <section className="routine-setting-section routine-setting-row">{settingCopy(t('开始生成时间', 'Start generating at'), `${t('在固定时区开始生成', 'Generation starts in the fixed time zone')} · ${draft.timezone}`)}<div className="routine-setting-control"><RoutineSelect label={t('开始生成时间', 'Start generating at')} value={draft.time} disabled={busy} onChange={(time) => onChange({ ...draft, time })} options={halfHourTimes.map((time) => ({ id: time, label: time }))} /></div></section>
      <section className="routine-setting-section routine-delivery-section"><div className="routine-setting-row">{settingCopy(t('发送到', 'Deliver briefing via'), t('可选；未选择对象时只生成文件。', 'Optional; without recipients, only a file is generated.'), true)}<div className="routine-setting-control routine-connector-control"><Button className="routine-connector-add" isDisabled={busy || !availableConnectors.length} onPress={() => setConnectorListOpen((open) => !open)} type="button">{t('添加', 'Add')}</Button>{connectorListOpen && <div className="routine-connector-picker">{availableConnectors.map((id) => <Button className="routine-connector-option" key={id} onPress={() => { setConnector(id); setConnectorListOpen(false) }} type="button" variant="secondary"><img alt="" src={connectorLogos[id]} /><span>{routineConnectorNames[locale][id]}</span></Button>)}</div>}</div></div><div className="routine-connector-cards">{connectorIds.filter((id) => draft.recipients.some((target) => target.connector === id)).map((id) => { const recipients = draft.recipients.filter((target) => target.connector === id); return <Button className="routine-connector-card" key={id} onPress={() => setConnector(id)} type="button" variant="ghost"><span className="routine-connector-card-title"><img alt="" src={connectorLogos[id]} /><strong>{routineConnectorNames[locale][id]}</strong></span><span className="routine-connector-card-recipients">{recipients.slice(0, 3).map((target) => target.name).join(locale === 'zh' ? '、' : ', ')}{recipients.length > 3 && ` +${recipients.length - 3}`}</span>{!connected.includes(id) && <small className="routine-error">{t('连接已断开，请重新连接或移除对象。', 'Disconnected. Reconnect or remove recipients.')}</small>}</Button>})}</div></section>
      <section className="routine-setting-section routine-setting-row">{settingCopy(t('格式', 'Format'), t('所有收件人会收到相同的文件格式。', 'All recipients receive the same file format.'))}<div className="routine-setting-control"><RoutineSelect label={t('格式', 'Format')} value={draft.format} disabled={busy} onChange={(value) => onChange({ ...draft, format: value as RoutineFormat })} options={[{ id: 'pdf', label: 'PDF' }, { id: 'md', label: 'MD' }, { id: 'docx', label: 'Word' }]} /></div></section>
    </fieldset>
    {connector && <RoutineRecipients connector={connector} selected={draft.recipients.filter((target) => target.connector === connector)} locale={locale} service={service} onClose={() => setConnector(null)} onConfirm={(targets) => { onChange({ ...draft, recipients: [...draft.recipients.filter((target) => target.connector !== connector), ...targets] }); setConnector(null) }} />}
  </div>
}
