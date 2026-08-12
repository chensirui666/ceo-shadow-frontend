import { useEffect, useState } from 'react'
import type { Locale } from '../appState.ts'
import { translations } from '../content/translations.ts'
import { feedbackService } from '../feedbackService.ts'
import { localizedFeedbackCards, localizedFeedbackDetail } from '../feedbackState.ts'
import type { FeedbackCard, FeedbackDashboardData, FeedbackDetail, FeedbackRange } from '../feedbackState.ts'
import FeedbackCardWall from './FeedbackCardWall.tsx'
import FeedbackDashboard from './FeedbackDashboard.tsx'
import FeedbackDetailPanel from './FeedbackDetailPanel.tsx'

export default function FeedbackWorkspace({ locale }: { locale: Locale }) {
  const copy = translations[locale].workspace.feedback
  const [range, setRange] = useState<FeedbackRange>('7d')
  const [dashboard, setDashboard] = useState<FeedbackDashboardData | null>(null)
  const [cards, setCards] = useState<FeedbackCard[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<FeedbackDetail | null>(null)

  useEffect(() => {
    let active = true
    setDashboard(null); setCards(null); setSelectedId(null); setDetail(null)
    void Promise.all([feedbackService.loadDashboard(range), feedbackService.loadCards(range)])
      .then(([nextDashboard, nextCards]) => { if (active) { setDashboard(nextDashboard); setCards(nextCards) } })
    return () => { active = false }
  }, [range])

  useEffect(() => {
    if (!selectedId) return
    let active = true
    setDetail(null)
    void feedbackService.loadDetail(selectedId).then((next) => { if (active) setDetail(next) })
    return () => { active = false }
  }, [selectedId])

  const changeRange = (nextRange: FeedbackRange) => {
    setRange(nextRange)
  }

  if (!dashboard || !cards) return <section aria-live="polite" className="feedback-state"><p>{copy.state.loading}</p></section>

  const localizedCards = localizedFeedbackCards(cards, locale)
  const localizedDetail = detail && localizedFeedbackDetail(detail, locale)

  return <section className="feedback-page">
    <FeedbackDashboard copy={copy} data={dashboard} onRangeChange={changeRange} range={range} />
    <FeedbackCardWall copy={copy} items={localizedCards} locale={locale} onOpen={setSelectedId} />
    {selectedId && <FeedbackDetailPanel copy={copy} detail={localizedDetail} loading={!localizedDetail} locale={locale} onClose={() => { setSelectedId(null); setDetail(null) }} />}
  </section>
}
