import { useEffect, useState } from 'react'
import type { Locale } from '../appState.ts'
import { translations } from '../content/translations.ts'
import { feedbackService } from '../feedbackService.ts'
import type { FeedbackCardPage, FeedbackDashboardData, FeedbackDetail, FeedbackRange } from '../feedbackState.ts'
import FeedbackCardWall from './FeedbackCardWall.tsx'
import FeedbackDashboard from './FeedbackDashboard.tsx'
import FeedbackDetailPanel from './FeedbackDetailPanel.tsx'

type FailedOperation = 'range' | 'more' | 'detail' | null

export default function FeedbackWorkspace({ locale }: { locale: Locale }) {
  const copy = translations[locale].workspace.feedback
  const [range, setRange] = useState<FeedbackRange>('7d')
  const [dashboard, setDashboard] = useState<FeedbackDashboardData | null>(null)
  const [page, setPage] = useState<FeedbackCardPage | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<FeedbackDetail | null>(null)
  const [failedOperation, setFailedOperation] = useState<FailedOperation>(null)
  const [rangeRequest, setRangeRequest] = useState(0)
  const [detailRequest, setDetailRequest] = useState(0)

  useEffect(() => {
    let active = true
    setDashboard(null); setPage(null); setSelectedId(null); setDetail(null); setFailedOperation(null)
    void Promise.all([feedbackService.loadDashboard(range), feedbackService.loadCards(range, null)])
      .then(([nextDashboard, nextPage]) => { if (active) { setDashboard(nextDashboard); setPage(nextPage) } })
      .catch(() => { if (active) setFailedOperation('range') })
    return () => { active = false }
  }, [range, rangeRequest])

  useEffect(() => {
    if (!selectedId) return
    let active = true
    setDetail(null); setFailedOperation(null)
    void feedbackService.loadDetail(selectedId).then((next) => { if (active) setDetail(next) }).catch(() => { if (active) setFailedOperation('detail') })
    return () => { active = false }
  }, [selectedId, detailRequest])

  const loadMore = () => {
    if (!page?.nextCursor) return
    setFailedOperation(null)
    void feedbackService.loadCards(range, page.nextCursor)
      .then((next) => setPage({ items: [...page.items, ...next.items], nextCursor: next.nextCursor }))
      .catch(() => setFailedOperation('more'))
  }

  const retry = () => {
    if (failedOperation === 'detail') setDetailRequest((value) => value + 1)
    else if (failedOperation === 'more') loadMore()
    else setRangeRequest((value) => value + 1)
  }

  if (!dashboard || !page) return <section aria-live="polite" className="feedback-state"><p>{failedOperation === 'range' ? copy.state.error : copy.state.loading}</p>{failedOperation === 'range' && <button onClick={retry} type="button">{copy.state.retry}</button>}</section>

  return <section className="feedback-page">
    <FeedbackDashboard copy={copy} data={dashboard} onRangeChange={setRange} range={range} />
    {failedOperation === 'more' && <div aria-live="polite" className="feedback-state"><p>{copy.state.error}</p><button onClick={retry} type="button">{copy.state.retry}</button></div>}
    <FeedbackCardWall copy={copy} items={page.items} locale={locale} nextCursor={page.nextCursor} onLoadMore={loadMore} onOpen={setSelectedId} />
    {selectedId && <FeedbackDetailPanel copy={copy} detail={detail} error={failedOperation === 'detail'} loading={!detail && failedOperation !== 'detail'} locale={locale} onClose={() => { setSelectedId(null); setDetail(null); setFailedOperation(null) }} onRetry={retry} />}
  </section>
}
