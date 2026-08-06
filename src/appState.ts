export const routes = ['home', 'tasks', 'memory', 'feedback', 'settings'] as const
export const locales = ['en', 'zh'] as const

export type Route = typeof routes[number]
export type Locale = typeof locales[number]
export type Session = { email: string; route: Route }
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export const isValidEmail = (email: unknown): email is string => (
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
)

export const normalizeCode = (value: unknown): string => {
  const code = String(value).replace(/\D/g, '')
  return code.length === 6 ? code : ''
}

export const verifyDemoCode = (email: unknown, code: unknown): Session | null => (
  isValidEmail(email) && normalizeCode(code) === '123456'
    ? { email, route: 'home' }
    : null
)

export const canResend = (seconds: number): boolean => seconds <= 0

export const resolveRoute = (route: unknown): Route => (
  routes.includes(route as Route) ? route as Route : 'home'
)

export const resolveLocale = (locale?: unknown): Locale => (
  locales.includes(locale as Locale) ? locale as Locale : 'en'
)

export const setDocumentLocale = (root: Pick<HTMLElement, 'lang'>, locale: Locale): void => {
  root.lang = locale === 'zh' ? 'zh-CN' : 'en'
}

export const signOut = () => ({ user: null, route: 'sign-in' as const })
