import type { HomeCopy } from '../content/translations.ts'
import type { HomeEvent, HomeSource } from '../homeState.ts'

type HomeEventListProps = {
  copy: HomeCopy
  events: HomeEvent[]
  now: Date
  onOpen: (eventId: string) => void
  sourceNames: Record<HomeSource, string>
}

const eventTime = (value: string) => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))

const statusText = (event: HomeEvent, copy: HomeCopy, now: Date) => {
  if (event.status !== 'waiting' || !event.waitUntil) return copy.status[event.status]
  return copy.countdown(Math.max(0, Math.floor((new Date(event.waitUntil).getTime() - now.getTime()) / 1000)))
}

export default function HomeEventList({ copy, events, now, onOpen, sourceNames }: HomeEventListProps) {
  return <section aria-label={copy.recent} className="home-event-list">
    {events.map((event) => <button className="home-event-row" key={event.id} onClick={() => onOpen(event.id)} type="button">
      <span aria-hidden="true" className={`home-source-mark home-source-${event.source}`}>{sourceNames[event.source].slice(0, 1)}</span>
      <span className="home-event-meta">{[event.conversation, event.sender, eventTime(event.receivedAt)].filter(Boolean).join(' · ')}</span>
      <span className={`home-event-status home-event-status-${event.status}`}>{statusText(event, copy, now)}</span>
      <span className="home-event-question">{copy.question}{copy.labelSeparator}{event.question}</span>
      <span className="home-event-reply">{copy.reply}{copy.labelSeparator}{event.reply ?? (event.outcome ? copy.outcome[event.outcome] : copy.status[event.status])}</span>
    </button>)}
  </section>
}
