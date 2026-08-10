import type { FeedbackCopy } from '../content/translations.ts'
import { feedbackRanges } from '../feedbackState.ts'
import type { FeedbackDashboardData, FeedbackRange } from '../feedbackState.ts'

type FeedbackDashboardProps = {
  copy: FeedbackCopy
  data: FeedbackDashboardData
  onRangeChange: (range: FeedbackRange) => void
  range: FeedbackRange
}

const percentage = (value: number) => `${Math.round(value * 100)}%`

export default function FeedbackDashboard({ copy, data, onRangeChange, range }: FeedbackDashboardProps) {
  const maximum = Math.max(1, ...data.trend.map((point) => point.positive + point.negative))
  const metricValues = {
    feedbackCount: data.metrics.feedbackCount,
    coverageRate: percentage(data.metrics.coverageRate),
    positiveRate: percentage(data.metrics.positiveRate),
    attentionCount: data.metrics.attentionCount,
  }
  const sourceCount = data.sourceTotals.recipient + data.sourceTotals.owner

  return <>
    <header className="feedback-header">
      <div><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
      <div aria-label={copy.title} className="feedback-range" role="group">
        {feedbackRanges.map((item) => <button aria-pressed={range === item} key={item} onClick={() => onRangeChange(item)} type="button">{copy.ranges[item]}</button>)}
      </div>
    </header>
    <section aria-label={copy.title} className="feedback-metrics">
      {(Object.keys(metricValues) as Array<keyof typeof metricValues>).map((metric) => <article className="feedback-metric" key={metric}><span>{copy.metrics[metric]}</span><strong>{metricValues[metric]}</strong></article>)}
    </section>
    <div className="feedback-dashboard-charts">
      <section aria-labelledby="feedback-trend-title" className="feedback-trend">
        <h2 id="feedback-trend-title">{copy.trend.title}</h2>
        <p className="feedback-legend"><span>{copy.trend.positive}</span><span>{copy.trend.negative}</span></p>
        {!data.trend.length && <p>{copy.trend.empty}</p>}
        <div className="feedback-trend-bars">
          {data.trend.map((point) => <div aria-label={copy.trend.point(point)} className="feedback-trend-point" key={point.label} role="img" tabIndex={0} title={copy.trend.point(point)}>
            <span className="feedback-trend-stack">
              <span className="feedback-trend-positive" style={{ height: `${point.positive / maximum * 100}%` }} />
              <span className="feedback-trend-negative" style={{ height: `${point.negative / maximum * 100}%` }} />
            </span>
            <span>{point.label}</span>
          </div>)}
        </div>
      </section>
      <section aria-labelledby="feedback-sources-title" className="feedback-sources">
        <h2 id="feedback-sources-title">{copy.sources.title}</h2>
        {!sourceCount && <p>{copy.sources.empty}</p>}
        {(['recipient', 'owner'] as const).map((source) => {
          const rate = sourceCount ? Math.round(data.sourceTotals[source] / sourceCount * 100) : 0
          const label = copy.sources.total(copy.sources.names[source], data.sourceTotals[source], rate)
          return <div className={`feedback-source feedback-source-${source}`} key={source}><p>{label}</p><progress aria-label={label} max={sourceCount || 1} value={data.sourceTotals[source]} /></div>
        })}
      </section>
    </div>
  </>
}
