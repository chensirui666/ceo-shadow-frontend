import { Button } from '@heroui/react'
import { BadgeInfo, Check, ChevronRight, Clock, FileCode2, FileSpreadsheet, FileText, ListChecks, MessageSquare, Scale, SkipForward, Sparkles, UserRound } from 'lucide-react'
import { connectorLogos, onboardingSupplementalLogos } from '../content/connectorLogos.ts'
import type { MessageCopy } from '../content/translations.ts'
import type { Message, MessageFeedback, MessageSource } from '../messageState.ts'
import { MessageFeedbackControls } from './MessageFeedbackControls.tsx'

type MessageDetailProps = {
  copy: MessageCopy
  message: Message
  onBack: () => void
  onConfirm: (id: string) => void
  onFeedback: (id: string, feedback: MessageFeedback) => void
  onSkip: (id: string) => void
}

const sourceIcons: Record<MessageSource, string> = {
  dingtalk: connectorLogos.dingtalk,
  feishu: connectorLogos.feishu,
  teams: connectorLogos.teams,
  slack: onboardingSupplementalLogos.slack,
  wecom: onboardingSupplementalLogos.wecom,
  discord: onboardingSupplementalLogos.discord,
}

const detailTime = (value: string, locale: string) => new Intl.DateTimeFormat(locale, {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(value))

const metaLabel = (label: string, locale: string) => `${label}${locale === 'zh-CN' ? '：' : ':'}`

export default function MessageDetail({ copy, message, onBack, onConfirm, onFeedback, onSkip }: MessageDetailProps) {
  const canDecide = message.status === 'needs-confirmation'
  const sourceIcon = sourceIcons[message.source]
  const receivedTime = detailTime(message.receivedAt, copy.dateLocale)
  const deliverables = message.deliverables ?? []
  const relatedTasks = message.relatedTasks ?? []
  const openTaskCount = relatedTasks.filter((task) => task.status === 'open').length
  return <section aria-labelledby="message-detail-title" className="message-detail">
    <header className="message-detail-header"><Button className="message-detail-back" onPress={onBack} type="button" variant="ghost">{copy.detail.back}</Button><div className="message-detail-title"><h1 id="message-detail-title">{message.subject}</h1><span className={`message-detail-status message-detail-status-${message.status}`}><i aria-hidden="true" className="message-detail-status-dot" />{copy.status[message.status]}</span></div><div className="message-detail-meta"><span className="message-detail-meta-item"><UserRound aria-hidden="true" /><strong>{metaLabel(copy.detail.object, copy.dateLocale)}</strong>{message.sender}</span><span className="message-detail-meta-item"><img alt="" src={sourceIcon} /><strong>{metaLabel(copy.detail.source, copy.dateLocale)}</strong>{copy.sources[message.source]}</span><span className="message-detail-meta-item"><MessageSquare aria-hidden="true" /><strong>{metaLabel(copy.detail.category, copy.dateLocale)}</strong>{copy.categories[message.category]}</span><span className="message-detail-meta-item"><Clock aria-hidden="true" /><strong>{metaLabel(copy.detail.received, copy.dateLocale)}</strong><time dateTime={message.receivedAt}>{receivedTime}</time></span></div></header>
    <div className="message-detail-layout"><main className="message-detail-reading">
      <section className="message-detail-card message-detail-original"><h2><MessageSquare aria-hidden="true" />A. {copy.detail.question}</h2><p>{message.question}</p><small className="message-detail-original-source"><img alt="" src={sourceIcon} />{copy.detail.originalSource(copy.sources[message.source], message.sender, receivedTime)}</small></section>
      <section className="message-detail-card message-detail-rationale"><h2><Scale aria-hidden="true" />B. {copy.detail.rationale}</h2><p>{message.rationale}</p></section>
      <section className="message-detail-card message-detail-result"><h2><Sparkles aria-hidden="true" />C. {copy.detail.result}</h2><p>{message.result}</p>{deliverables.length > 0 && <ul className="message-detail-deliverables">{deliverables.map((deliverable) => {
        const DeliverableIcon = deliverable.format === 'xlsx' ? FileSpreadsheet : deliverable.format === 'md' ? FileCode2 : FileText
        return <li key={deliverable.name}><DeliverableIcon aria-hidden="true" /><span><strong>{deliverable.name}</strong><small>{deliverable.format.toUpperCase()} · {deliverable.size}</small></span></li>
      })}</ul>}</section>
      <details className="message-detail-references"><summary>{copy.detail.references}</summary><ul>{message.references.map((reference) => <li key={reference}>{reference}</li>)}</ul></details>
    </main><aside className="message-detail-aside">
      <section><h2>{copy.detail.actions}</h2>{canDecide ? <><Button className="message-detail-action-confirm" onPress={() => onConfirm(message.id)} type="button"><Check aria-hidden="true" />{copy.list.confirm}</Button><Button className="message-detail-action-skip" onPress={() => onSkip(message.id)} type="button" variant="secondary"><SkipForward aria-hidden="true" />{copy.list.skip}</Button></> : <p>{copy.detail.noActions}</p>}</section>
      <section className="message-detail-information"><h2><BadgeInfo aria-hidden="true" />{copy.detail.information}</h2><dl><div className="message-detail-information-row"><dt>{copy.detail.object}</dt><dd>{message.sender}</dd></div><div className="message-detail-information-row"><dt>{copy.detail.source}</dt><dd><img alt="" src={sourceIcon} />{copy.sources[message.source]}</dd></div><div className="message-detail-information-row"><dt>{copy.detail.category}</dt><dd>{copy.categories[message.category]}</dd></div><div className="message-detail-information-row"><dt>{copy.detail.status}</dt><dd className={`message-detail-info-status message-detail-info-status-${message.status}`}><i aria-hidden="true" />{copy.status[message.status]}</dd></div><div className="message-detail-information-row"><dt>{copy.detail.received}</dt><dd><time dateTime={message.receivedAt}>{receivedTime}</time></dd></div></dl></section>
      <section className="message-detail-task-summary"><h2><ListChecks aria-hidden="true" />{copy.detail.taskSummary}</h2><div aria-label={copy.detail.taskCount(relatedTasks.length, openTaskCount)} className="message-detail-task-summary-link"><span>{copy.detail.taskCount(relatedTasks.length, openTaskCount)}</span><ChevronRight aria-hidden="true" /></div></section>
      <section className="message-detail-feedback"><div className="message-detail-feedback-header"><h2>{copy.detail.feedback}</h2><MessageFeedbackControls copy={copy.feedbackControls} id={message.id} onFeedback={onFeedback} /></div></section>
    </aside></div>
  </section>
}
