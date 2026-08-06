import type { HomeCopy } from '../content/translations.ts'
import type { ActivityHour } from '../homeState.ts'

type HomeActivityChartProps = {
  activity: ActivityHour[]
  copy: HomeCopy
}

export default function HomeActivityChart({ activity, copy }: HomeActivityChartProps) {
  const totals = activity.reduce((sum, hour) => ({
    processed: sum.processed + hour.processed,
    pending: sum.pending + hour.pending,
    failed: sum.failed + hour.failed,
  }), { processed: 0, pending: 0, failed: 0 })
  const maximum = Math.max(1, ...activity.map((hour) => hour.processed + hour.pending + hour.failed))

  return <section aria-labelledby="home-activity-title" className="home-activity">
    <div className="home-section-heading">
      <h2 id="home-activity-title">{copy.recent}</h2>
      <span className="home-chart-summary">{copy.chart.legend(totals)}</span>
    </div>
    <div aria-label={copy.chart.title} className="home-chart-legend">
      <span className="home-chart-key home-chart-key-processed">{copy.chart.processed} {totals.processed}</span>
      <span className="home-chart-key home-chart-key-pending">{copy.chart.pending} {totals.pending}</span>
      <span className="home-chart-key home-chart-key-failed">{copy.chart.failed} {totals.failed}</span>
    </div>
    {totals.processed + totals.pending + totals.failed === 0 && <p className="home-chart-empty">{copy.chart.empty}</p>}
    <div className="home-chart-bars">
      {activity.map((hour) => <div aria-label={copy.chart.hourLabel(hour)} className="home-chart-hour" key={hour.hour} role="img" tabIndex={0} title={copy.chart.hourLabel(hour)}>
        <span className="home-chart-stack">
          <span className="home-chart-segment home-chart-processed" style={{ height: `${hour.processed / maximum * 100}%` }} />
          <span className="home-chart-segment home-chart-pending" style={{ height: `${hour.pending / maximum * 100}%` }} />
          <span className="home-chart-segment home-chart-failed" style={{ height: `${hour.failed / maximum * 100}%` }} />
        </span>
        <span className="home-chart-axis-label">{hour.hour}</span>
      </div>)}
    </div>
  </section>
}
