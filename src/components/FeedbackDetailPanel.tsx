import type { FeedbackCopy } from '../content/translations.ts'
import { formatFeedbackTime } from '../feedbackState.ts'
import type { FeedbackDetail } from '../feedbackState.ts'

type FeedbackDetailPanelProps = {
  copy: FeedbackCopy
  detail: FeedbackDetail | null
  error?: boolean
  loading?: boolean
  locale: 'en' | 'zh'
  onClose: () => void
  onRetry?: () => void
}

export default function FeedbackDetailPanel({ copy, detail, error = false, loading = false, locale, onClose, onRetry }: FeedbackDetailPanelProps) {
  return <aside aria-labelledby="feedback-detail-title" className="feedback-detail">
    <header><h2 id="feedback-detail-title">{copy.detail.title}</h2><button aria-label={copy.detail.close} onClick={onClose} type="button">×</button></header>
    {loading && <p aria-live="polite">{copy.detail.loading}</p>}
    {error && <div aria-live="polite"><p>{copy.detail.error}</p>{onRetry && <button onClick={onRetry} type="button">{copy.state.retry}</button>}</div>}
    {detail && <>
      <section><h3>{copy.detail.question}</h3><p>{detail.question}</p></section>
      <section><h3>{copy.detail.reply}</h3><p>{detail.reply}</p></section>
      <section><h3>{copy.detail.feedback}</h3>{detail.feedback.map((item) => <article className={`feedback-detail-record feedback-detail-record-${item.sentiment}`} key={item.id}>
        <strong>{copy.sentiment[item.sentiment]}</strong><span>{copy.sources.names[item.source]}</span>
        <p>{item.note}</p><time dateTime={item.createdAt}>{formatFeedbackTime(item.createdAt, locale)}</time>
      </article>)}</section>
    </>}
  </aside>
}
