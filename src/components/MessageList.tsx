import { Button, Dropdown, ListBox, Select } from '@heroui/react'
import { Check, ChevronDown, Clock, SkipForward, Sparkles } from 'lucide-react'
import { connectorLogos, onboardingSupplementalLogos } from '../content/connectorLogos.ts'
import { canProvideMessageFeedback, createDefaultMessageFilters, messageSummaryRanges, messageStatuses, selectMessages, selectMessagesForSummaryRange } from '../messageState.ts'
import type { MessageCopy } from '../content/translations.ts'
import type { Message, MessageFeedback, MessageFilters, MessageSource, MessageStatus, MessageSummaryRange } from '../messageState.ts'
import { MessageFeedbackControls } from './MessageFeedbackControls.tsx'

type MessageListProps = {
  copy: MessageCopy
  messages: Message[]
  status: MessageStatus | 'all'
  onConfirm: (id: string) => void
  onFeedback: (id: string, feedback: MessageFeedback) => void
  onOpen: (id: string) => void
  onSkip: (id: string) => void
  onStatusChange: (status: MessageStatus | 'all') => void
  filters?: MessageFilters
  onFiltersChange?: (filters: MessageFilters) => void
  onOpenSettings?: () => void
  summaryRange?: MessageSummaryRange
  onSummaryRangeChange?: (range: MessageSummaryRange) => void
}

const sourceApps: Array<{ id: MessageSource; icon: string }> = [
  { id: 'dingtalk', icon: connectorLogos.dingtalk },
  { id: 'feishu', icon: connectorLogos.feishu },
  { id: 'teams', icon: connectorLogos.teams },
  { id: 'slack', icon: onboardingSupplementalLogos.slack },
  { id: 'wecom', icon: onboardingSupplementalLogos.wecom },
  { id: 'discord', icon: onboardingSupplementalLogos.discord },
]

const shortTime = (value: string, locale: string) => new Intl.DateTimeFormat(locale, {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(value))

function MessageFilterSelect({ label, onSelectionChange, options, selectedKey }: { label: string; onSelectionChange: (value: string) => void; options: Array<{ id: string; label: string }>; selectedKey: string }) {
  return <Select aria-label={label} className="message-list-filter-select" onSelectionChange={(key) => onSelectionChange(String(key))} selectedKey={selectedKey} variant="secondary"><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox>{options.map((option) => <ListBox.Item id={option.id} key={option.id} textValue={option.label}>{option.label}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover></Select>
}

export default function MessageList({ copy, messages, status, onConfirm, onFeedback, onOpen, onSkip, onStatusChange, filters = createDefaultMessageFilters(), onFiltersChange = () => {}, onOpenSettings = () => {}, summaryRange = '7d', onSummaryRangeChange = () => {} }: MessageListProps) {
  const visibleMessages = selectMessages({ messages }, status, filters)
  const categories = [...new Set(messages.map((message) => message.category))]
  const subjects = [...new Set(messages.map((message) => message.subject))]
  const senders = [...new Set(messages.map((message) => message.sender))]
  const count = (item: MessageStatus) => messages.filter((message) => message.status === item).length
  const summaryMessages = selectMessagesForSummaryRange(messages, summaryRange)
  const summaryCount = (item: MessageStatus) => summaryMessages.filter((message) => message.status === item).length
  const updateFilter = (field: keyof MessageFilters, value: string) => onFiltersChange({ ...filters, [field]: value } as MessageFilters)
  const clearFilters = () => { onFiltersChange(createDefaultMessageFilters()); onStatusChange('all') }

  return <section aria-labelledby="message-list-title" className="message-list">
    <header className="message-list-header"><h1 id="message-list-title">{copy.list.title}</h1><p>{copy.list.subtitle}</p></header>
    <nav aria-label={copy.list.statusNavigation} className="message-status-tabs"><button aria-pressed={status === 'all'} onClick={() => onStatusChange('all')} type="button">{copy.status.all} {messages.length}</button>{messageStatuses.map((item) => <button aria-pressed={status === item} key={item} onClick={() => onStatusChange(item)} type="button">{copy.status[item]} {count(item)}</button>)}</nav>
    <div className="message-list-layout">
      <section aria-label={copy.list.label} className="message-list-stream">
        <div className="message-list-columns"><span>{copy.list.columns.statusTime}</span><span>{copy.list.columns.metadata}</span><span>{copy.list.columns.question}</span><span>{copy.list.columns.handling}</span><span>{copy.list.columns.actions}</span></div>
        {visibleMessages.length ? visibleMessages.map((message) => <article className="message-list-row" key={message.id}>
          <button className="message-list-open" onClick={() => onOpen(message.id)} title={`${message.question}\n${message.result}`} type="button">
            <span className={`message-list-status message-list-status-${message.status}`}><strong><i aria-hidden="true" className="message-list-status-dot" />{copy.status[message.status]}</strong><time className="message-list-time" dateTime={message.receivedAt}><Clock aria-hidden="true" />{shortTime(message.receivedAt, copy.dateLocale)}</time></span>
            <span className="message-list-object" title={message.subject}><img alt="" className="message-list-avatar" src={message.senderAvatar} /><span className="message-list-identity"><strong>{message.sender}</strong><span className="message-list-source"><img alt="" className="message-list-source-icon" src={sourceApps.find((app) => app.id === message.source)!.icon} />{copy.sources[message.source]}</span><small className="message-list-category">{copy.categories[message.category]}</small></span></span>
            <span className="message-list-clamp" title={message.question}>{message.question}</span><span className="message-list-clamp" title={message.result}>{message.result}</span>
          </button>
          <span className="message-list-actions">{message.status === 'needs-confirmation' && <><button className="message-list-action-confirm" onClick={(event) => { event.stopPropagation(); onConfirm(message.id) }} type="button"><Check aria-hidden="true" />{copy.list.confirm}</button><button className="message-list-action-skip" onClick={(event) => { event.stopPropagation(); onSkip(message.id) }} type="button"><SkipForward aria-hidden="true" />{copy.list.skip}</button></>}{canProvideMessageFeedback(message) && <MessageFeedbackControls copy={copy.feedbackControls} id={message.id} onFeedback={onFeedback} stopPropagation />}</span>
        </article>) : <p className="message-empty">{copy.list.filteredEmpty}</p>}
      </section>
      <aside aria-label={copy.list.aside.filters.title} className="message-list-quick">
        <section className="message-list-filters"><header><h2>{copy.list.aside.filters.title}</h2><Button onPress={clearFilters} type="button" variant="ghost">{copy.list.aside.filters.clear}</Button></header><MessageFilterSelect label={copy.list.aside.filters.source} onSelectionChange={(value) => updateFilter('source', value)} options={[{ id: 'all', label: copy.list.aside.filters.source }, ...sourceApps.map((app) => ({ id: app.id, label: copy.list.aside.sources.apps[app.id] }))]} selectedKey={filters.source} /><MessageFilterSelect label={copy.list.aside.filters.category} onSelectionChange={(value) => updateFilter('category', value)} options={[{ id: 'all', label: copy.list.aside.filters.category }, ...categories.map((category) => ({ id: category, label: copy.categories[category] }))]} selectedKey={filters.category} /><MessageFilterSelect label={copy.list.aside.filters.subject} onSelectionChange={(value) => updateFilter('subject', value)} options={[{ id: 'all', label: copy.list.aside.filters.subject }, ...subjects.map((subject) => ({ id: subject, label: subject }))]} selectedKey={filters.subject} /><MessageFilterSelect label={copy.list.aside.filters.sender} onSelectionChange={(value) => updateFilter('sender', value)} options={[{ id: 'all', label: copy.list.aside.filters.sender }, ...senders.map((sender) => ({ id: sender, label: sender }))]} selectedKey={filters.sender} /></section>
        <section className="message-list-sources"><h2>{copy.list.aside.sources.title}</h2><ul>{sourceApps.map((app) => <li key={app.id}><span><img alt="" className="message-list-source-list-icon" src={app.icon} />{copy.list.aside.sources.apps[app.id]}</span><strong>{messages.filter((message) => message.source === app.id).length}</strong></li>)}</ul></section>
        <section className="message-list-summary"><header><h2>{copy.list.aside.activity.title}</h2><Dropdown><Button aria-label={copy.list.aside.activity.rangeLabel} className="message-list-summary-range" type="button" variant="ghost">{copy.list.aside.activity.ranges[summaryRange]}<ChevronDown aria-hidden="true" /></Button><Dropdown.Popover placement="bottom right"><Dropdown.Menu aria-label={copy.list.aside.activity.rangeLabel} onAction={(key) => onSummaryRangeChange(key as MessageSummaryRange)} selectedKeys={[summaryRange]} selectionMode="single">{messageSummaryRanges.map((range) => <Dropdown.Item id={range} key={range} textValue={copy.list.aside.activity.ranges[range]}>{copy.list.aside.activity.ranges[range]}<Dropdown.ItemIndicator /></Dropdown.Item>)}</Dropdown.Menu></Dropdown.Popover></Dropdown></header><dl><div><dt>{copy.list.aside.activity.all}</dt><dd>{summaryMessages.length}</dd></div><div><dt>{copy.list.aside.activity.needsConfirmation}</dt><dd>{summaryCount('needs-confirmation')}</dd></div><div><dt>{copy.list.aside.activity.processed}</dt><dd>{summaryCount('processed')}</dd></div><div><dt>{copy.list.aside.activity.failed}</dt><dd>{summaryCount('failed')}</dd></div></dl></section>
        <section className="message-list-smarter"><h2><Sparkles aria-hidden="true" />{copy.list.aside.smarter.title}</h2><p>{copy.list.aside.smarter.body}</p><Button onPress={onOpenSettings} type="button">{copy.list.aside.smarter.action}</Button></section>
      </aside>
    </div>
  </section>
}
