import { Button, Modal } from '@heroui/react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Locale } from '../appState.ts'

export default function RoutineDialog({ title, children, footer, onClose, locale, wide = false, icon, subtitle, className = '' }: { title: string; children: ReactNode; footer?: ReactNode; onClose: () => void; locale: Locale; wide?: boolean; icon?: ReactNode; subtitle?: string; className?: string }) {
  return <Modal.Backdrop className="routine-backdrop" isOpen onOpenChange={(open) => { if (!open) onClose() }}>
    <Modal.Container placement="center" scroll="inside" size="lg">
      <Modal.Dialog className={`routine-dialog${wide ? ' routine-dialog-wide' : ''} ${className}`}>
        <Modal.Header className="routine-dialog-header"><div className="routine-dialog-title">{icon && <span className="routine-dialog-icon">{icon}</span>}<div><Modal.Heading>{title}</Modal.Heading>{subtitle && <p>{subtitle}</p>}</div></div><Button aria-label={locale === 'zh' ? '关闭' : 'Close'} isIconOnly onPress={onClose} variant="ghost"><X size={18} /></Button></Modal.Header>
        <Modal.Body className="routine-dialog-body">{children}</Modal.Body>
        {footer && <Modal.Footer className="routine-dialog-footer">{footer}</Modal.Footer>}
      </Modal.Dialog>
    </Modal.Container>
  </Modal.Backdrop>
}
