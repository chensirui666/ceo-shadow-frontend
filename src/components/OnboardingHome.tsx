import { useEffect, useRef, useState } from 'react'
import { Button } from '@heroui/react'
import type { Locale } from '../appState.ts'
import { translations } from '../content/translations.ts'
import { activityHours, homeSources } from '../homeState.ts'
import type { HomeSource } from '../homeState.ts'
import { completeOnboarding, confirmMemory, confirmWorkStyle, connectSource, continueToMemory, createOnboardingState, recordTrial, regenerateTrial } from '../onboardingState.ts'
import type { OnboardingState } from '../onboardingState.ts'
import HomeActivityChart from './HomeActivityChart.tsx'

type OnboardingHomeProps = {
  initialState?: OnboardingState
  locale: Locale
  onComplete: (state: OnboardingState) => void
  onOpenMemory: () => void
  onStateChange?: (state: OnboardingState) => void
}

type ActivationStage = 'idle' | 'confirm' | 'celebrating' | 'contacts'

const contacts = ['刘晨', '周航', '赵明']

export default function OnboardingHome({ initialState, locale, onComplete, onOpenMemory, onStateChange }: OnboardingHomeProps) {
  const copy = translations[locale].workspace.onboarding
  const homeCopy = translations[locale].workspace.home
  const fallbackInitialState = useRef(createOnboardingState())
  const [state, setState] = useState(() => initialState ?? fallbackInitialState.current)
  const [connecting, setConnecting] = useState<HomeSource | null>(null)
  const [question, setQuestion] = useState('')
  const [adjustment, setAdjustment] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [activation, setActivation] = useState<ActivationStage>('idle')
  const [contact, setContact] = useState(contacts[0])
  const completionTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (completionTimer.current !== null) window.clearTimeout(completionTimer.current)
  }, [])

  const update = (next: OnboardingState) => {
    setState(next)
    onStateChange?.(next)
  }

  const completeConnection = () => {
    if (!connecting) return
    update(connectSource(state, connecting))
    setConnecting(null)
  }

  const beginActivation = () => {
    const completed = completeOnboarding(state)
    update(completed)
    setActivation('celebrating')
    completionTimer.current = window.setTimeout(() => setActivation('contacts'), 650)
  }

  const finish = () => onComplete(completeOnboarding(state))

  return <section className="onboarding-page">
    <ol aria-label={copy.progressLabel} className="onboarding-steps">
      {copy.steps.map((label, index) => <li className={state.step === index + 1 ? 'onboarding-step onboarding-step-active' : state.step > index + 1 ? 'onboarding-step onboarding-step-done' : 'onboarding-step'} key={label}>
        <span>{index + 1}</span><strong>{label}</strong>
      </li>)}
    </ol>

    <section className="onboarding-panel">
      {state.step === 1 && <section className="onboarding-section">
        <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(1)}</p><h2>{copy.connection.title}</h2><p>{copy.connection.subtitle}</p></header>
        <p className="onboarding-demo-note">{copy.connection.demo}</p>
        <div className="onboarding-source-list">
          {homeSources.map((source) => {
            const connected = state.connectedSources.includes(source)
            return <div className="onboarding-source-row" key={source}>
              <span aria-hidden="true" className="onboarding-source-glyph">{homeCopy.sources[source].slice(0, 1)}</span>
              <span><strong>{homeCopy.sources[source]}</strong><small>{copy.connection.scope[source]}</small></span>
              {connected ? <span className="onboarding-connected">{copy.connection.connected}</span> : <Button className="onboarding-connect-button" onPress={() => setConnecting(source)} type="button">{copy.connection.connect}</Button>}
            </div>
          })}
        </div>
        {connecting && <aside aria-live="polite" className="onboarding-inline-confirmation"><strong>{copy.connection.confirmTitle(homeCopy.sources[connecting])}</strong><p>{copy.connection.confirmBody}</p><div><Button onPress={() => setConnecting(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={completeConnection} type="button">{copy.connection.complete}</Button></div></aside>}
        <footer className="onboarding-section-footer"><Button isDisabled={!state.connectedSources.length} onPress={() => update(continueToMemory(state))} type="button">{copy.actions.continue}</Button><p>{copy.connection.continueHint}</p></footer>
      </section>}

      {state.step === 2 && <section className="onboarding-section">
        <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(2)}</p><h2>{copy.memory.title}</h2><p>{copy.memory.subtitle}</p></header>
        <div className="onboarding-scope-list">
          {state.connectedSources.map((source) => <div key={source}><strong>{homeCopy.sources[source]}</strong><span>{copy.memory.scope[source]}</span></div>)}
        </div>
        <p className="onboarding-demo-note">{copy.memory.demo}</p>
        <footer className="onboarding-section-footer onboarding-section-footer-split"><Button onPress={() => update(confirmMemory(state))} type="button">{copy.memory.confirm}</Button><Button onPress={onOpenMemory} type="button" variant="secondary">{copy.memory.view}</Button></footer>
      </section>}

      {state.step === 3 && <section className="onboarding-section">
        <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(3)}</p><h2>{copy.style.title}</h2><p>{copy.style.subtitle}</p></header>
        <div className="onboarding-style-summary"><p>{copy.style.summary}</p><ul>{copy.style.points.map((point) => <li key={point}>{point}</li>)}</ul></div>
        <button aria-expanded={showPrompt} className="onboarding-prompt-toggle" onClick={() => setShowPrompt((current) => !current)} type="button">{showPrompt ? copy.style.hidePrompt : copy.style.showPrompt}</button>
        {showPrompt && <pre className="onboarding-prompt-preview">{copy.style.prompt}</pre>}
        <footer className="onboarding-section-footer"><Button onPress={() => update(confirmWorkStyle(state))} type="button">{copy.style.confirm}</Button></footer>
      </section>}

      {state.step === 4 && <section className="onboarding-section onboarding-trial-section">
        <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(4)}</p><h2>{copy.trial.title}</h2><p>{copy.trial.subtitle}</p></header>
        <div className="onboarding-trial-suggestions"><span>{copy.trial.suggestions}</span>{copy.trial.questions.map((suggestion) => <button key={suggestion} onClick={() => setQuestion(suggestion)} type="button">{suggestion}</button>)}</div>
        <label className="onboarding-composer"><span className="sr-only">{copy.trial.inputLabel}</span><textarea onChange={(event) => setQuestion(event.target.value)} placeholder={copy.trial.placeholder} value={question} /></label>
        <Button className="onboarding-trial-submit" isDisabled={!question.trim()} onPress={() => update(recordTrial(state, question))} type="button">{copy.trial.submit}</Button>
        {state.trial && <article className="onboarding-trial-result"><span className="onboarding-trial-label">Trial</span><h3>{copy.trial.contextTitle}</h3><p>{copy.trial.context}</p><h3>{copy.trial.replyTitle}</h3><p className="onboarding-trial-reply">{state.trial.reply}</p><p className="onboarding-trial-note">{copy.trial.note}</p><div className="onboarding-adjustment"><label>{copy.trial.adjustLabel}<input onChange={(event) => setAdjustment(event.target.value)} placeholder={copy.trial.adjustPlaceholder} value={adjustment} /></label><Button isDisabled={!adjustment.trim()} onPress={() => { update(regenerateTrial(state, adjustment)); setAdjustment('') }} type="button" variant="secondary">{copy.trial.adjustAction}</Button></div></article>}
        {activation === 'confirm' && <aside className="onboarding-activation-confirmation"><strong>{copy.activation.confirmTitle}</strong><p>{copy.activation.confirmBody}</p><div><Button onPress={() => setActivation('idle')} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={beginActivation} type="button">{copy.activation.confirm}</Button></div></aside>}
        {activation === 'celebrating' && <aside aria-live="polite" className="onboarding-celebration"><span aria-hidden="true">✦</span><strong>{copy.activation.celebrating}</strong></aside>}
        <footer className="onboarding-section-footer onboarding-formal-action"><Button onPress={() => setActivation('confirm')} type="button" variant="secondary">{copy.activation.start}</Button><p>{copy.activation.hint}</p></footer>
      </section>}
    </section>

    <section aria-labelledby="onboarding-recent-title" className="onboarding-empty-home"><div className="onboarding-empty-heading"><h2 id="onboarding-recent-title">{homeCopy.recent}</h2><span>{copy.emptyTimeline}</span></div><HomeActivityChart activity={activityHours([], new Date())} copy={homeCopy} /></section>

    {activation === 'contacts' && <section aria-label={copy.contacts.title} aria-modal="true" className="onboarding-contact-backdrop" role="dialog"><div className="onboarding-contact-dialog"><span className="onboarding-trial-label">{copy.contacts.label}</span><h2>{copy.contacts.title}</h2><p>{copy.contacts.body}</p><fieldset>{contacts.map((name) => <label key={name}><input checked={contact === name} name="contact" onChange={() => setContact(name)} type="radio" value={name} /><span>{name}</span></label>)}</fieldset><p className="onboarding-demo-note">{copy.contacts.demo}</p><footer><Button onPress={finish} type="button" variant="secondary">{copy.contacts.close}</Button><Button onPress={finish} type="button">{copy.contacts.notify(contact)}</Button></footer></div></section>}
  </section>
}
