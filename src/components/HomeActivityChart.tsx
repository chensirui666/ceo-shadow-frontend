import type { HomeCopy } from '../content/translations.ts'
import type { ActivityHour } from '../homeState.ts'

type HomeActivityChartProps = {
  activity: ActivityHour[]
  copy: HomeCopy
  showDefaultTooltip?: boolean
}

export default function HomeActivityChart({ activity, copy, showDefaultTooltip }: HomeActivityChartProps) {
  const totals = activity.reduce((sum, hour) => ({
    processed: sum.processed + hour.processed,
    pending: sum.pending + hour.pending,
    failed: sum.failed + hour.failed,
  }), { processed: 0, pending: 0, failed: 0 })
  const maximum = Math.max(1, ...activity.map((hour) => hour.processed + hour.pending + hour.failed))
  const tooltipHour = showDefaultTooltip
    ? activity.reduce<ActivityHour | undefined>((latest, hour) => (
      hour.processed + hour.pending + hour.failed > 0 ? hour : latest
    ), undefined)
    : undefined
  const tooltipColumn = tooltipHour ? activity.indexOf(tooltipHour) + 1 : 1
  const tooltipAlignment = tooltipColumn <= 3 ? 'start' : tooltipColumn >= activity.length - 2 ? 'end' : 'center'

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
    <div className="home-chart-plot">
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
      {tooltipHour && <div className="home-chart-tooltip-layer">
        <aside
          aria-label={copy.chart.hourLabel(tooltipHour)}
          className={`home-chart-tooltip home-chart-tooltip-${tooltipAlignment}`}
          style={{ gridColumn: `${tooltipColumn} / span 1` }}
        >
          <strong>{tooltipHour.hour}:00</strong>
          <span aria-label={`${copy.chart.processed} ${tooltipHour.processed}`} className="home-chart-tooltip-item home-chart-key-processed">
            <span className="home-chart-tooltip-label">{copy.chart.processed}</span>
            <strong aria-hidden="true" className="home-chart-tooltip-value">{tooltipHour.processed}</strong>
          </span>
          <span aria-label={`${copy.chart.pending} ${tooltipHour.pending}`} className="home-chart-tooltip-item home-chart-key-pending">
            <span className="home-chart-tooltip-label">{copy.chart.pending}</span>
            <strong aria-hidden="true" className="home-chart-tooltip-value">{tooltipHour.pending}</strong>
          </span>
          <span aria-label={`${copy.chart.failed} ${tooltipHour.failed}`} className="home-chart-tooltip-item home-chart-key-failed">
            <span className="home-chart-tooltip-label">{copy.chart.failed}</span>
            <strong aria-hidden="true" className="home-chart-tooltip-value">{tooltipHour.failed}</strong>
          </span>
        </aside>
      </div>}
    </div>
  </section>
}
