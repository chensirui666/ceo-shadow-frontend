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
      <Button className="settings-button settings-button-secondary" onPress={onCancel} type="button">{cancelLabel}</Button>
      <Button className={destructive ? 'settings-button settings-button-danger' : 'settings-button settings-button-dark'} onPress={onConfirm} type="button">{confirmLabel}</Button>
    </div>
  </section>
}
import { Button } from '@heroui/react'
