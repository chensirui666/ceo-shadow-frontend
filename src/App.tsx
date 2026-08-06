import { useState } from 'react'
import { signOut } from './appState.ts'
import type { Locale, Session } from './appState.ts'
import Login from './components/Login.tsx'
import Workspace from './components/Workspace.tsx'
import { clearSession, loadLocale, loadSession, saveLocale, saveSession } from './sessionStore.ts'

export default function App() {
  const [session, setSession] = useState<Session | null>(() => loadSession(window.localStorage))
  const [locale, setLocale] = useState<Locale>(() => loadLocale(window.localStorage))

  const changeLocale = (nextLocale: Locale) => setLocale(saveLocale(window.localStorage, nextLocale))

  const authenticate = (nextSession: Session) => {
    saveSession(window.localStorage, nextSession)
    setSession(nextSession)
  }

  const logout = () => {
    const nextSession = signOut()
    clearSession(window.localStorage)
    setSession(nextSession.user)
  }

  return session
    ? <Workspace locale={locale} onLocaleChange={changeLocale} onSignOut={logout} session={session} />
    : <Login locale={locale} onAuthenticated={authenticate} onLocaleChange={changeLocale} />
}
