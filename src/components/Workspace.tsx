import { useEffect, useState } from 'react'
import { Button, Dropdown, Modal, useOverlayState } from '@heroui/react'
import { resolveRoute } from '../appState.ts'
import type { Locale, Route, Session } from '../appState.ts'
import { translations } from '../content/translations.ts'
import { saveSession } from '../sessionStore.ts'
import Icon from './Icon.tsx'
import type { IconName } from './Icon.tsx'
import LanguageToggle from './LanguageToggle.tsx'
import HomeWorkspace from './HomeWorkspace.tsx'
import MemoryWorkspace from './MemoryWorkspace.tsx'
import SettingsWorkspace from './SettingsWorkspace.tsx'

type WorkspaceProps = {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
  onSignOut: () => void
  session: Session
}

const pages: Array<{ id: Route; icon: IconName }> = [
  { id: 'home', icon: 'home' },
  { id: 'tasks', icon: 'tasks' },
  { id: 'memory', icon: 'memory' },
  { id: 'feedback', icon: 'feedback' },
  { id: 'settings', icon: 'settings' },
]

export default function Workspace({ locale, onLocaleChange, onSignOut, session }: WorkspaceProps) {
  const storedRoute = resolveRoute(session.route)
  const [route, setRoute] = useState<Route>(() => storedRoute === 'settings' ? 'home' : storedRoute)
  const [settingsOpen, setSettingsOpen] = useState(() => storedRoute === 'settings')
  const exitDialog = useOverlayState()
  const name = session.email.split('@')[0]
  const copy = translations[locale].workspace
  const current = pages.find((page) => page.id === route) ?? pages[0]
  const currentLabel = copy.nav[current.id]
  const pageCopy = copy.pages[route]

  useEffect(() => {
    saveSession(window.localStorage, { ...session, route })
  }, [route, session])

  const openSettings = () => setSettingsOpen(true)

  const goTo = (nextRoute: unknown) => {
    const next = resolveRoute(nextRoute)
    if (next === 'settings') openSettings()
    else setRoute(next)
  }

  return (
    <main className="workspace-shell">
      <aside aria-hidden={settingsOpen} className="workspace-rail" inert={settingsOpen || undefined}>
        <span className="workspace-brand">Friday</span>
        <nav aria-label={copy.primaryNavigation} className="workspace-nav">
          {pages.slice(0, 4).map((page) => (
            <button className={route === page.id ? 'nav-item nav-item-active' : 'nav-item'} key={page.id} onClick={() => goTo(page.id)} type="button">
              <Icon name={page.icon} />
              <span>{copy.nav[page.id]}</span>
            </button>
          ))}
        </nav>
        <div className="workspace-rail-bottom">
          <button className={settingsOpen ? 'nav-item nav-item-active' : 'nav-item'} onClick={openSettings} type="button">
            <Icon name="settings" />
            <span>{copy.nav.settings}</span>
          </button>
          <div className="rail-account">
            <span aria-hidden="true" className="avatar-fallback">{name.slice(0, 1).toUpperCase()}</span>
            <span>{session.email}</span>
          </div>
        </div>
      </aside>

      <section aria-hidden={settingsOpen} aria-label={copy.content(currentLabel)} className="workspace-canvas" inert={settingsOpen || undefined}>
        <header className="workspace-header">
          <h1>{currentLabel}</h1>
          <div className="workspace-tools">
            <LanguageToggle copy={translations[locale]} locale={locale} onChange={onLocaleChange} />
            <button className="icon-button" disabled title={copy.unavailableNotifications} type="button"><Icon name="bell" /><span className="sr-only">{copy.unavailableNotifications}</span></button>
            <Dropdown>
              <Dropdown.Trigger aria-label={copy.openAccountMenu} className="account-menu-trigger">
                <Icon name="user" />
              </Dropdown.Trigger>
              <Dropdown.Popover className="account-menu-popover" placement="bottom right">
                <Dropdown.Menu aria-label={copy.accountMenu} className="account-menu" onAction={(key) => key === 'sign-out' && exitDialog.open()}>
                  <Dropdown.Item className="account-menu-item" id="sign-out" textValue={copy.signOut}>{copy.signOut}</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </header>

        {route === 'memory' ? (
          <MemoryWorkspace locale={locale} />
        ) : route === 'home' ? (
          <HomeWorkspace locale={locale} onOpenSettings={openSettings} />
        ) : (
          <section className="empty-page">
            <p className="eyebrow">{currentLabel}</p>
            <h2>{pageCopy[0]}</h2>
            <p>{pageCopy[1]}</p>
            <Button className="empty-action" onPress={() => goTo('home')}>{pageCopy[2]}</Button>
          </section>
        )}
      </section>

      <Modal state={exitDialog}>
        <Modal.Backdrop className="exit-backdrop">
          <Modal.Container className="exit-container" placement="center">
            <Modal.Dialog className="exit-dialog">
              <Modal.Header><Modal.Heading className="exit-title">{copy.exit.title}</Modal.Heading></Modal.Header>
              <Modal.Body className="exit-body">{copy.exit.body}</Modal.Body>
              <Modal.Footer className="exit-footer">
                <Button className="modal-cancel" onPress={exitDialog.close}>{copy.exit.cancel}</Button>
                <Button className="modal-confirm" onPress={onSignOut}>{copy.signOut}</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {settingsOpen && <SettingsWorkspace locale={locale} onClose={() => setSettingsOpen(false)} onNavigate={goTo} />}
    </main>
  )
}
