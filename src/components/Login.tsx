import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Button, Input } from '@heroui/react'
import { canResend, isValidEmail, verifyDemoCode } from '../appState.ts'
import type { Locale, Session } from '../appState.ts'
import { translations } from '../content/translations.ts'
import type { Translation } from '../content/translations.ts'
import LanguageToggle from './LanguageToggle.tsx'

type LoginProps = {
  locale: Locale
  onAuthenticated: (session: Session) => void
  onLocaleChange: (locale: Locale) => void
}

type ErrorKey = keyof Translation['login']['errors']

function Journey({ copy }: { copy: Translation }) {
  return (
    <div aria-label={copy.journey.join(' · ')} className="journey">
      {copy.journey.map((item, index) => (
        <div className="journey-item" key={item}>
          {index > 0 && <span aria-hidden="true" className="journey-chevron">›</span>}
          <span className={index === 0 ? 'journey-label journey-label-active' : 'journey-label'}>{item}</span>
        </div>
      ))}
    </div>
  )
}

function DemoNote({ children, label }: { children: ReactNode; label: string }) {
  return <p className="demo-note"><strong>{label}</strong> · {children}</p>
}

export default function Login({ locale, onAuthenticated, onLocaleChange }: LoginProps) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [errorKey, setErrorKey] = useState<ErrorKey | ''>('')
  const [resendIn, setResendIn] = useState(60)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const copy = translations[locale]
  const error = errorKey ? copy.login.errors[errorKey] : ''

  useEffect(() => {
    if (step !== 'code' || canResend(resendIn)) return undefined
    const countdown = window.setTimeout(() => setResendIn((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(countdown)
  }, [step, resendIn])

  const requestCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValidEmail(email)) {
      setErrorKey('invalidEmail')
      return
    }
    if (!navigator.onLine) {
      setErrorKey('sendFailed')
      return
    }
    setErrorKey('')
    setIsSending(true)
    window.setTimeout(() => {
      setIsSending(false)
      setStep('code')
      setResendIn(60)
    }, 360)
  }

  const verifyCode = (candidate = code) => {
    const session = verifyDemoCode(email, candidate)
    if (!session) {
      setErrorKey(candidate.length === 6 ? 'invalidCode' : 'incompleteCode')
      return
    }
    setErrorKey('')
    setIsVerifying(true)
    window.setTimeout(() => onAuthenticated(session), 360)
  }

  const editEmail = () => {
    setStep('email')
    setCode('')
    setErrorKey('')
  }

  const resendCode = () => {
    if (!canResend(resendIn)) return
    setErrorKey('')
    setResendIn(60)
  }

  return (
    <main className="auth-shell">
      <header className="auth-header">
        <span className="brand">Friday</span>
        <Journey copy={copy} />
        <LanguageToggle copy={copy} locale={locale} onChange={onLocaleChange} />
      </header>

      <section className="auth-layout">
        <div className="auth-form-column">
          <div className="auth-form-wrap">
            {step === 'email' ? (
              <form className="auth-form" onSubmit={requestCode} noValidate>
                <p className="eyebrow">{copy.login.email.eyebrow}</p>
                <h1>{copy.login.email.title}</h1>
                <p className="auth-subtitle">{copy.login.email.subtitle}</p>
                <DemoNote label={copy.login.email.demoLabel}>{copy.login.email.demo} <b>123456</b>{copy.login.email.demoEnding}</DemoNote>

                <label className="field-label" htmlFor="work-email">{copy.login.email.label}</label>
                <Input
                  id="work-email"
                  aria-describedby={error ? 'email-error' : undefined}
                  className="auth-input"
                  name="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setErrorKey('')
                  }}
                />
                {error && <p className="form-error" id="email-error" role="alert">{error}</p>}

                <Button className="primary-action" isDisabled={isSending} type="submit">{isSending ? copy.login.email.sending : copy.login.email.submit}</Button>
                <p className="legal-copy">{copy.login.email.legalBefore} <button type="button">{copy.login.email.terms}</button> {copy.login.email.legalBetween} <button type="button">{copy.login.email.privacy}</button></p>
              </form>
            ) : (
              <form className="auth-form" onSubmit={(event) => {
                event.preventDefault()
                verifyCode()
              }} noValidate>
                <p className="eyebrow">{copy.login.code.eyebrow}</p>
                <h1>{copy.login.code.title}</h1>
                <p className="auth-subtitle">{copy.login.code.subtitle(email)}</p>
                <DemoNote label={copy.login.code.demoLabel}>{copy.login.code.demo} <b>123456</b>{copy.login.code.demoEnding}</DemoNote>

                <label className="field-label" htmlFor="verification-code">{copy.login.code.label}</label>
                <Input
                  id="verification-code"
                  aria-describedby={error ? 'code-error' : undefined}
                  className="auth-input code-input"
                  inputMode="numeric"
                  maxLength={6}
                  name="code"
                  placeholder="000000"
                  value={code}
                  onChange={(event) => {
                    const nextCode = event.target.value.replace(/\D/g, '').slice(0, 6)
                    setCode(nextCode)
                    setErrorKey('')
                    if (nextCode.length === 6) verifyCode(nextCode)
                  }}
                />
                {error && <p className="form-error" id="code-error" role="alert">{error}</p>}

                <Button className="primary-action" isDisabled={isVerifying} type="submit">{isVerifying ? copy.login.code.verifying : copy.login.code.submit}</Button>
                <div className="code-actions">
                  <button type="button" onClick={editEmail}>{copy.login.code.edit}</button>
                  <button disabled={!canResend(resendIn)} type="button" onClick={resendCode}>{canResend(resendIn) ? copy.login.code.resend : copy.login.code.resendIn(resendIn)}</button>
                </div>
              </form>
            )}
          </div>
        </div>

        <aside aria-label={copy.login.authVisualLabel} className="auth-visual" />
      </section>
    </main>
  )
}
