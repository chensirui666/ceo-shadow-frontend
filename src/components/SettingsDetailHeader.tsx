import type { ReactNode } from 'react'

type SettingsDetailHeaderProps = {
  backLabel: string
  meta?: string
  onBack: () => void
  status?: ReactNode
  subtitle?: string
  title: string
}

export default function SettingsDetailHeader({ backLabel, meta, onBack, status, subtitle, title }: SettingsDetailHeaderProps) {
  return <>
    <button className="settings-back" onClick={onBack} type="button">‹ {backLabel}</button>
    <div className={status ? 'settings-title-row' : 'settings-detail-heading'}>
      <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      {status}
    </div>
    {meta && <p className="settings-meta">{meta}</p>}
  </>
}
