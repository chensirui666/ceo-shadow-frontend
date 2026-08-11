import { useState } from 'react'
import type { HomeCopy } from '../content/translations.ts'
import type { ActivityHour } from '../homeState.ts'

type HomeActivityChartProps = {
  activity: ActivityHour[]
  copy: HomeCopy
}

export default function HomeActivityChart({ activity, copy }: HomeActivityChartProps) {
  const [tooltipHour, setTooltipHour] = useState<ActivityHour | null>(null)
  const totals = activity.reduce((sum, hour) => ({
    processed: sum.processed + hour.processed,
    pending: sum.pending + hour.pending,
    failed: sum.failed + hour.failed,
  }), { processed: 0, pending: 0, failed: 0 })
  const maximum = Math.max(3, Math.ceil(Math.max(...activity.map((hour) => hour.processed + hour.pending + hour.failed), 1) / 3) * 3)
  const ticks = [maximum, maximum / 3 * 2, maximum / 3, 0]
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
    <div className="home-chart-frame">
      <div aria-hidden="true" className="home-chart-y-axis">{ticks.map((tick) => <span key={tick}>{tick}</span>)}</div>
      <div>
        <div className="home-chart-plot">
          <div aria-hidden="true" className="home-chart-grid-lines">{ticks.slice(0, -1).map((tick) => <span className="home-chart-grid-line" key={tick} />)}</div>
          <div className="home-chart-bars">
            {activity.map((hour) => <div aria-label={copy.chart.hourLabel(hour)} className="home-chart-hour" key={hour.hour} onBlur={() => setTooltipHour(null)} onFocus={() => setTooltipHour(hour)} onMouseEnter={() => setTooltipHour(hour)} onMouseLeave={() => setTooltipHour(null)} role="img" tabIndex={0}>
              <span className="home-chart-stack">
                <span className="home-chart-segment home-chart-processed" style={{ height: `${hour.processed / maximum * 100}%` }} />
                <span className="home-chart-segment home-chart-pending" style={{ height: `${hour.pending / maximum * 100}%` }} />
                <span className="home-chart-segment home-chart-failed" style={{ height: `${hour.failed / maximum * 100}%` }} />
              </span>
            </div>)}
          </div>
          {tooltipHour && <div className="home-chart-tooltip-layer">
            <aside
              aria-label={copy.chart.hourLabel(tooltipHour)}
              className={`home-chart-tooltip home-chart-tooltip-${tooltipAlignment}`}
              style={{ gridColumn: `${tooltipColumn} / span 1` }}
            >
              <strong>{tooltipHour.hour}:00</strong>
              <span className="home-chart-tooltip-item home-chart-key-processed">
                <span className="home-chart-tooltip-label">{copy.chart.processed}</span>
                <strong className="home-chart-tooltip-value">{tooltipHour.processed}</strong>
              </span>
              <span className="home-chart-tooltip-item home-chart-key-pending">
                <span className="home-chart-tooltip-label">{copy.chart.pending}</span>
                <strong className="home-chart-tooltip-value">{tooltipHour.pending}</strong>
              </span>
              <span className="home-chart-tooltip-item home-chart-key-failed">
                <span className="home-chart-tooltip-label">{copy.chart.failed}</span>
                <strong className="home-chart-tooltip-value">{tooltipHour.failed}</strong>
              </span>
            </aside>
          </div>}
        </div>
        <div aria-hidden="true" className="home-chart-x-axis">{activity.map((hour, index) => <span key={hour.hour}>{index % 6 === 0 ? hour.hour : ''}</span>)}</div>
      </div>
    </div>
  </section>
}
