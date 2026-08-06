import { isValidEmail, resolveLocale, resolveRoute } from './appState.ts'
import type { Locale, Session, StorageLike } from './appState.ts'

const isStoredSession = (value: unknown): value is { email: unknown; route: unknown } => (
  typeof value === 'object' && value !== null && 'email' in value && 'route' in value
)

export const loadSession = (storage: Pick<StorageLike, 'getItem'>): Session | null => {
  try {
    const session: unknown = JSON.parse(storage.getItem('friday-demo-session') || 'null')
    return isStoredSession(session) && isValidEmail(session.email)
      ? { email: session.email, route: resolveRoute(session.route) }
      : null
  } catch {
    return null
  }
}

export const saveSession = (storage: Pick<StorageLike, 'setItem'>, session: Session): void => {
  storage.setItem('friday-demo-session', JSON.stringify(session))
}

export const clearSession = (storage: Pick<StorageLike, 'removeItem'>): void => {
  storage.removeItem('friday-demo-session')
}

export const loadLocale = (storage: Pick<StorageLike, 'getItem'>): Locale => {
  try {
    return resolveLocale(storage.getItem('friday-language'))
  } catch {
    return 'en'
  }
}

export const saveLocale = (storage: Pick<StorageLike, 'setItem'>, locale: unknown): Locale => {
  const resolvedLocale = resolveLocale(locale)
  storage.setItem('friday-language', resolvedLocale)
  return resolvedLocale
}
