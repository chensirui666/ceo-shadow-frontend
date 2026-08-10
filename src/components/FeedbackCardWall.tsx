import type { FeedbackCopy } from '../content/translations.ts'
import { formatFeedbackTime } from '../feedbackState.ts'
import type { FeedbackCard } from '../feedbackState.ts'

type FeedbackCardWallProps = {
  copy: FeedbackCopy
  items: FeedbackCard[]
  locale: 'en' | 'zh'
  nextCursor: string | null
  onLoadMore: () => void
  onOpen: (id: string) => void
}

export default function FeedbackCardWall({ copy, items, locale, nextCursor, onLoadMore, onOpen }: FeedbackCardWallProps) {
  return <section aria-labelledby="feedback-cards-title" className="feedback-card-wall-section">
    <h2 id="feedback-cards-title">{copy.cards.title}</h2>
    {!items.length && <p>{copy.cards.empty}</p>}
    <div className="feedback-card-wall">
      {items.map((item) => <button className={`feedback-card feedback-card-${item.sentiment}`} key={item.id} onClick={() => onOpen(item.id)} type="button">
        <span className="feedback-card-state">{copy.sentiment[item.sentiment]}</span>
        <span className="feedback-card-source">{copy.sources.names[item.source]}</span>
        <strong>{copy.cards.question}</strong><span>{item.question}</span>
        <strong>{copy.cards.reply}</strong><span>{item.reply}</span>
        <strong>{copy.cards.note}</strong><span>{item.note}</span>
        <time dateTime={item.createdAt}>{formatFeedbackTime(item.createdAt, locale)}</time>
        <span className="feedback-card-link">{copy.cards.view}</span>
      </button>)}
    </div>
    {nextCursor && <button className="feedback-load-more" onClick={onLoadMore} type="button">{copy.cards.loadMore}</button>}
  </section>
}
