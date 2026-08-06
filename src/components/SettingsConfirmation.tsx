type SettingsConfirmationProps = {
  body: string
  cancelLabel: string
  confirmLabel: string
  destructive?: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
}

export default function SettingsConfirmation({ body, cancelLabel, confirmLabel, destructive = false, onCancel, onConfirm, title }: SettingsConfirmationProps) {
  return <section aria-live="polite" className="settings-confirmation">
    <h3>{title}</h3>
    <p>{body}</p>
    <div className="settings-actions">
      <button className="settings-button settings-button-secondary" onClick={onCancel} type="button">{cancelLabel}</button>
      <button className={destructive ? 'settings-button settings-button-danger' : 'settings-button settings-button-dark'} onClick={onConfirm} type="button">{confirmLabel}</button>
    </div>
  </section>
}
