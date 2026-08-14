import { useEffect, useRef, useState } from 'react'
import { Button } from '@heroui/react'
import { ArrowRight, CalendarCheck, Check, FileText, MessageCircle, Repeat2, Scale, ShieldCheck, Users, X } from 'lucide-react'
import connectIllustration from '../assets/onboarding-connect-editorial.png'
import memoryIllustration from '../assets/onboarding-memory-editorial.png'
import teamGroupApricot from '../assets/onboarding-team-group-apricot.png'
import teamGroupBlue from '../assets/onboarding-team-group-blue.png'
import teamGroupLavender from '../assets/onboarding-team-group-lavender.png'
import teamGroupSage from '../assets/onboarding-team-group-sage.png'
import welcomeMemoryIllustration from '../assets/onboarding-welcome-memory.png'
import workStyleIllustration from '../assets/onboarding-work-style-editorial.png'
import type { Locale } from '../appState.ts'
import { onboardingConnectorLogos, onboardingSupplementalLogos } from '../content/connectorLogos.ts'
import { translations } from '../content/translations.ts'
import { homeSources } from '../homeState.ts'
import type { HomeSource } from '../homeState.ts'
import { advanceFromMemory, completeOnboarding, confirmMemory, confirmWorkStyle, connectSource, continueToMemory, createOnboardingState, selectOnboardingStep } from '../onboardingState.ts'
import type { OnboardingState } from '../onboardingState.ts'

type OnboardingHomeProps = {
  initialState?: OnboardingState
  locale: Locale
  onComplete: (state: OnboardingState) => void
  onOpenMemory: () => void
  onStateChange?: (state: OnboardingState) => void
  onWelcomeDismiss?: () => void
  welcomeOpen?: boolean
}

export type ActivationStage = 'idle' | 'celebrating' | 'ready'
type MemoryStage = 'selecting' | 'reading' | 'ready' | null
type StyleStage = 'extracting' | 'ready' | null

const memorySignalIcons = { messages: MessageCircle, documents: FileText, calendar: CalendarCheck }
const memoryFindingIcons = { messages: MessageCircle, documents: FileText, topics: Repeat2 }
const memoryFindingKeys = ['messages', 'documents', 'topics'] as const
const stylePointIcons = [MessageCircle, Scale, ArrowRight, ShieldCheck]
const supportApps = [
  ['DingTalk', onboardingConnectorLogos.dingtalk], ['Feishu', onboardingConnectorLogos.feishu], ['WeCom', onboardingSupplementalLogos.wecom],
  ['Slack', onboardingSupplementalLogos.slack], ['Teams', onboardingConnectorLogos.teams], ['Discord', onboardingSupplementalLogos.discord],
  ['Gmail', onboardingSupplementalLogos.gmail, true], ['Zoom', onboardingSupplementalLogos.zoom, true], ['Google Meet', onboardingSupplementalLogos.googleMeet, true],
] as const
const teamGroups = [teamGroupApricot, teamGroupBlue, teamGroupSage, teamGroupLavender]
export const ACTIVATION_CELEBRATION_DURATION = 5_000
export const getActivationStartStage = (prefersReducedMotion: boolean): Extract<ActivationStage, 'celebrating' | 'ready'> => prefersReducedMotion ? 'ready' : 'celebrating'
const analysisProgressAt = (elapsed: number): number => elapsed < 3_800 ? (elapsed / 3_800) * 95 : Math.min(100, 95 + ((elapsed - 3_800) / 300) * 5)

export function AnalysisProgress({ completeLabel, label, value }: { completeLabel: string; label: string; value: number }) {
  const displayValue = Math.round(value)
  return <><p className="onboarding-analysis-status"><span>{value === 100 ? completeLabel : label}</span><strong>{displayValue}%</strong></p><progress className="onboarding-progress" max="100" value={value}>{displayValue}%</progress></>
}

export function MemoryConnector({ connectedLabel, logo, name, onRemove, removeLabel }: { connectedLabel: string; logo: string; name: string; onRemove?: () => void; removeLabel?: string }) {
  return <span className="onboarding-memory-connector"><img alt="" src={logo} /><span><strong>{name}</strong><small>{connectedLabel}</small></span>{onRemove ? <button aria-label={removeLabel} onClick={onRemove} type="button"><X aria-hidden="true" /></button> : <i aria-hidden="true" />}</span>
}

type ActivationCelebrationProps = {
  copy: typeof translations.zh.workspace.onboarding.activation
  onFinish: () => void
  stage: Extract<ActivationStage, 'celebrating' | 'ready'>
}

export function ActivationCelebration({ copy, onFinish, stage }: ActivationCelebrationProps) {
  if (stage === 'ready') return <section aria-label={copy.completeTitle} aria-modal="true" className="onboarding-activation-backdrop onboarding-activation-complete" role="dialog"><div className="onboarding-activation-complete-dialog">
    <span aria-hidden="true" className="onboarding-activation-complete-mark"><Check /></span><h2>{copy.completeTitle}</h2><p>{copy.completeBody}</p><Button onPress={onFinish} type="button">{copy.completeAction}</Button>
  </div></section>

  return <section aria-live="polite" className="onboarding-activation-backdrop onboarding-activation-celebration" role="status"><span className="sr-only">{copy.celebrating}</span><svg aria-hidden="true" className="onboarding-celebration-scene" fill="none" viewBox="0 0 800 500">
    <defs>
      <radialGradient id="onboarding-celebration-glow"><stop stopColor="#f1c57b" stopOpacity=".42" /><stop offset="1" stopColor="#f1c57b" stopOpacity="0" /></radialGradient>
      <filter id="onboarding-celebration-soft-glow"><feGaussianBlur stdDeviation="8" /></filter>
    </defs>
    <path className="onboarding-celebration-ground" d="M82 413H720" />
    <g className="onboarding-celebration-crew">
      <g className="onboarding-celebration-person">
        <path className="onboarding-celebration-person-hat" d="M270 309C272 297 282 291 293 293C300 294 304 298 306 303L273 307Z" fill="#2d2a25" />
        <path d="M268 307H309" stroke="#2d2a25" strokeLinecap="round" strokeWidth="5" />
        <circle cx="287" cy="314" fill="#e9c6a2" r="11" />
        <path className="onboarding-celebration-person-coat" d="M278 326C283 322 292 322 298 328L305 366L275 366L278 326Z" fill="#176869" />
        <path d="M286 329V361" stroke="#f8f4ea" strokeLinecap="round" strokeWidth="3" />
        <path d="M279 334L264 359M297 334L316 361" stroke="#e9c6a2" strokeLinecap="round" strokeWidth="7" />
        <path d="M280 366L275 395M298 366L306 395" stroke="#4a443c" strokeLinecap="round" strokeWidth="9" />
        <path d="M270 399H281M301 399H313" stroke="#2d2a25" strokeLinecap="round" strokeWidth="7" />
      </g>
      <g className="onboarding-celebration-cart">
        <path d="M313 365H337" stroke="#2d2a25" strokeLinecap="round" strokeWidth="5" />
        <path d="M332 356H441L429 392H343L332 356Z" fill="#e9d6bb" stroke="#2d2a25" strokeWidth="4" />
        <path d="M345 356H429M349 369H425" stroke="#c18c53" strokeWidth="3" />
        <path d="M350 356V341H423V356" stroke="#2d2a25" strokeWidth="4" />
        <circle cx="355" cy="403" fill="#2d2a25" r="12" /><circle cx="420" cy="403" fill="#2d2a25" r="12" />
        <circle cx="355" cy="403" fill="#f8f4ea" r="4" /><circle cx="420" cy="403" fill="#f8f4ea" r="4" />
      </g>
      <g className="onboarding-celebration-rocket">
        <path d="M383 341V311C383 293 396 280 408 274C421 280 434 293 434 311V341H383Z" fill="#176869" />
        <path d="M383 328L367 343H383M434 328L450 343H434" fill="#d7724f" />
        <path d="M408 280V337" stroke="#e9d6bb" strokeWidth="3" />
        <circle cx="408" cy="306" fill="#f8f4ea" r="8" /><circle cx="408" cy="306" fill="#d7a64e" r="4" />
        <path d="M396 341L408 358L421 341" fill="#d7a64e" />
      </g>
      <path className="onboarding-celebration-fuse" d="M376 350C358 349 356 336 365 328" stroke="#d7724f" strokeLinecap="round" strokeWidth="4" />
      <g className="onboarding-celebration-burst" strokeLinecap="round">
        <circle className="onboarding-celebration-firework-halo" cx="408" cy="106" fill="url(#onboarding-celebration-glow)" filter="url(#onboarding-celebration-soft-glow)" r="91" />
        <g className="onboarding-celebration-firework-rays onboarding-celebration-firework-rays-outer" strokeWidth="5">
          <path d="M408 97V20M414 98L455 29M418 101L485 64M419 106L501 112M416 111L475 158M411 114L433 190M404 114L372 182M399 111L329 155M397 106L309 111M399 101L338 61M404 98L380 29" stroke="#176869" />
          <path d="M411 97L431 24M417 99L470 46M419 103L493 87M418 109L493 133M414 113L457 178M406 114L398 194M401 113L349 178M397 109L319 133M397 103L324 85M400 99L346 46" stroke="#d7724f" />
        </g>
        <g className="onboarding-celebration-firework-rays onboarding-celebration-firework-rays-inner" stroke="#d7a64e" strokeWidth="4">
          <path d="M408 96V51M413 98L440 55M417 102L460 84M418 107L464 118M414 112L442 153M408 114L408 169M402 112L372 153M398 107L351 118M399 102L356 84M403 98L376 55" />
        </g>
        <g className="onboarding-celebration-firework-sparks" fill="#d7a64e"><circle cx="408" cy="22" r="3" /><circle cx="490" cy="65" r="3" /><circle cx="503" cy="138" r="3" /><circle cx="443" cy="188" r="3" /><circle cx="347" cy="180" r="3" /><circle cx="311" cy="120" r="3" /><circle cx="341" cy="55" r="3" /></g>
        <circle cx="408" cy="106" fill="#f8f4ea" r="13" stroke="#d7724f" strokeWidth="4" /><circle cx="408" cy="106" fill="#d7a64e" r="5" />
      </g>
    </g>
  </svg></section>
}

export default function OnboardingHome({ initialState, locale, onComplete, onOpenMemory, onStateChange, onWelcomeDismiss, welcomeOpen = true }: OnboardingHomeProps) {
  const copy = translations[locale].workspace.onboarding
  const homeCopy = translations[locale].workspace.home
  const fallbackInitialState = useRef(createOnboardingState())
  const [state, setState] = useState(() => initialState ?? fallbackInitialState.current)
  const [connecting, setConnecting] = useState<HomeSource | null>(null)
  const [memoryStage, setMemoryStage] = useState<MemoryStage>(null)
  const [memoryProgress, setMemoryProgress] = useState(0)
  const [memorySources, setMemorySources] = useState<HomeSource[]>([])
  const [styleStage, setStyleStage] = useState<StyleStage>(null)
  const [styleProgress, setStyleProgress] = useState(0)
  const [promptDraft, setPromptDraft] = useState(() => state.workStylePrompt ?? copy.style.prompt)
  const [styleViewerOpen, setStyleViewerOpen] = useState(false)
  const [activation, setActivation] = useState<ActivationStage>('idle')
  const [welcomeDismissed, setWelcomeDismissed] = useState(false)

  useEffect(() => {
    if (memoryStage !== 'reading') return
    const startedAt = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const value = analysisProgressAt(now - startedAt)
      setMemoryProgress(value)
      if (value === 100) setMemoryStage('ready')
      else frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [memoryStage])

  useEffect(() => {
    if (styleStage !== 'extracting') return
    const startedAt = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const value = analysisProgressAt(now - startedAt)
      setStyleProgress(value)
      if (value === 100) setStyleStage('ready')
      else frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [styleStage])

  useEffect(() => {
    if (!state.workStylePrompt) setPromptDraft(copy.style.prompt)
  }, [copy.style.prompt, state.workStylePrompt])

  useEffect(() => {
    if (activation !== 'celebrating') return
    const timer = window.setTimeout(() => setActivation('ready'), ACTIVATION_CELEBRATION_DURATION)
    return () => window.clearTimeout(timer)
  }, [activation])

  const update = (next: OnboardingState) => {
    setState(next)
    onStateChange?.(next)
  }

  const completeConnection = () => {
    if (!connecting) return
    update(connectSource(state, connecting))
    setConnecting(null)
  }

  const beginMemoryRead = () => {
    setMemorySources(state.connectedSources)
    setMemoryStage('selecting')
  }

  const readSelectedMemory = () => {
    if (!memorySources.length) return
    setMemoryProgress(0)
    setMemoryStage('reading')
  }

  const beginStyleExtraction = () => {
    setPromptDraft(state.workStylePrompt ?? copy.style.prompt)
    setStyleProgress(0)
    setStyleStage('extracting')
  }

  const confirmStyle = () => {
    update(confirmWorkStyle(state, promptDraft))
    setStyleStage(null)
  }

  const beginActivation = () => {
    if (!state.workStyleConfirmed) return
    update(completeOnboarding(state))
    setActivation(getActivationStartStage(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false))
  }

  const finish = () => onComplete(completeOnboarding(state))

  const dismissWelcome = () => {
    setWelcomeDismissed(true)
    onWelcomeDismiss?.()
  }

  return <section className={`onboarding-page onboarding-page-step-${state.step}`}>
    <section className="onboarding-frame">
      <ol aria-label={copy.progressLabel} className="onboarding-steps">
      {copy.steps.map((stepCopy, index) => {
        const step = (index + 1) as 1 | 2 | 3
        const className = state.step === step ? 'onboarding-step onboarding-step-active' : state.maxReached > step ? 'onboarding-step onboarding-step-done' : 'onboarding-step'
        return <li className={className} key={stepCopy.label}><button disabled={step > state.maxReached} onClick={() => update(selectOnboardingStep(state, step))} type="button"><span>{step}</span><strong>{stepCopy.label}</strong></button></li>
      })}
      </ol>

      <section className="onboarding-panel">
      {state.step === 1 && <section className="onboarding-section onboarding-connect-layout">
        <div className="onboarding-connect-content">
          <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(1)}</p><h2>{copy.connection.title}</h2><p>{copy.connection.subtitle}</p></header>
          <div className="onboarding-source-list">
            {homeSources.map((source) => {
              const connected = state.connectedSources.includes(source)
              return <div className="onboarding-source-row" key={source}>
                <span aria-hidden="true" className="onboarding-source-glyph"><img alt="" src={onboardingConnectorLogos[source]} /></span>
                <span><strong>{homeCopy.sources[source]}</strong><small>{copy.connection.scope[source]}</small></span>
                {connected ? <span aria-label={copy.connection.connected} className="onboarding-connected"><Check aria-hidden="true" /></span> : <Button className="onboarding-connect-button" onPress={() => setConnecting(source)} type="button">{copy.connection.connect}</Button>}
              </div>
            })}
          </div>
          <footer className="onboarding-section-footer"><Button className="onboarding-continue-action" isDisabled={!state.connectedSources.length} onPress={() => update(continueToMemory(state))} type="button">{copy.actions.continue}</Button><p>{copy.connection.continueHint}</p></footer>
        </div>
        <aside aria-hidden="true" className="onboarding-connect-artwork">
          <img alt="" src={connectIllustration} />
        </aside>
      </section>}

      {state.step === 2 && <section className="onboarding-section onboarding-editorial-layout onboarding-memory-layout">
        <div className="onboarding-editorial-content">
          <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(2)}</p><h2>{copy.memory.title}</h2><p>{copy.memory.subtitle}</p></header>
          <div className="onboarding-memory-signals"><p>{copy.memory.signalsTitle}</p><ul>{(Object.keys(memorySignalIcons) as Array<keyof typeof memorySignalIcons>).map((signal) => {
              const SignalIcon = memorySignalIcons[signal]
              const [label, description] = copy.memory.signals[signal]
              return <li key={signal}><SignalIcon aria-hidden="true" /><span><strong>{label}</strong><small>{description}</small></span></li>
            })}</ul></div>
          <section className="onboarding-memory-migration"><strong>{copy.memory.migration.title}</strong><p>{copy.memory.migration.body}</p></section>
          <footer className="onboarding-section-footer onboarding-section-footer-actions onboarding-memory-actions">
            {state.memoryConfirmed ? <><Button onPress={onOpenMemory} type="button" variant="secondary">{copy.memory.view}</Button><Button onPress={() => update(advanceFromMemory(state))} type="button">{copy.memory.proceed}</Button></> : <Button onPress={beginMemoryRead} type="button">{copy.memory.confirm}</Button>}
          </footer>
        </div>
        <aside aria-hidden="true" className="onboarding-editorial-artwork"><img alt="" src={memoryIllustration} /></aside>
      </section>}

      {state.step === 3 && <section className="onboarding-section onboarding-editorial-layout onboarding-work-style-layout">
        <div className="onboarding-editorial-content">
          <header className="onboarding-section-header"><p className="onboarding-kicker">{copy.stepKicker(3)}</p><h2>{copy.style.title}</h2><p>{copy.style.subtitle}</p></header>
          <div className="onboarding-style-summary"><p>{copy.style.summary}</p><ul>{copy.style.points.map((point, index) => {
            const PointIcon = stylePointIcons[index]
            return <li className="onboarding-style-point" key={point}><span className="onboarding-style-point-icon"><PointIcon aria-hidden="true" /></span>{point}</li>
          })}</ul></div>
          <footer className="onboarding-section-footer onboarding-style-actions">
            {state.workStyleConfirmed ? <><Button onPress={() => setStyleViewerOpen(true)} type="button" variant="secondary">{copy.style.view}</Button><Button onPress={beginActivation} type="button">{copy.style.start}</Button></> : <Button onPress={beginStyleExtraction} type="button">{copy.style.extract}</Button>}
          </footer>
        </div>
        <aside aria-hidden="true" className="onboarding-editorial-artwork"><img alt="" src={workStyleIllustration} /></aside>
      </section>}
      </section>

      <section aria-label={copy.progressLabel} className="onboarding-support-grid">
        <section className="onboarding-support-card onboarding-supported-apps">
          <h3>{copy.support.apps.title}</h3>
          <div className="onboarding-supported-app-list">{supportApps.map(([name, logo, comingSoon]) => <div className={`onboarding-supported-app${comingSoon ? ' onboarding-supported-app-soon' : ''}`} key={name}>
            <img alt="" src={logo} /><span>{name}</span>{comingSoon && <small>{copy.support.apps.comingSoon}</small>}
          </div>)}</div>
        </section>
        <section className="onboarding-support-card onboarding-security">
          <header><h3>{copy.support.security.title}</h3><span aria-hidden="true" className="onboarding-security-mark"><ShieldCheck /></span></header>
          <ul>{copy.support.security.points.map((point) => <li key={point}><Check aria-hidden="true" />{point}</li>)}</ul>
          <span className="onboarding-security-link">{copy.support.security.learnMore}</span>
        </section>
        <section className="onboarding-support-card onboarding-team-uses">
          <span aria-hidden="true" className="onboarding-team-sparkle">✦</span>
          <header><h3>{copy.support.teams.title}</h3><p>{copy.support.teams.subtitle}</p></header>
          <div aria-hidden="true" className="onboarding-team-groups">{teamGroups.map((group, index) => <div className="onboarding-team-group" key={group}>
            <img alt="" src={group} /><span>{copy.support.teams.segments[index]}</span>
          </div>)}</div>
          <footer><span className="onboarding-team-detail"><Users aria-hidden="true" />{copy.support.teams.detail}</span><span className="onboarding-team-stories">{copy.support.teams.stories}<ArrowRight aria-hidden="true" /></span></footer>
        </section>
      </section>
    </section>

    {connecting && <section aria-label={copy.connection.confirmTitle(homeCopy.sources[connecting])} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div className="onboarding-modal-dialog"><h2>{copy.connection.confirmTitle(homeCopy.sources[connecting])}</h2><p>{copy.connection.confirmBody}</p><footer><Button onPress={() => setConnecting(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={completeConnection} type="button">{copy.connection.complete}</Button></footer></div></section>}

    {memoryStage && <section aria-label={memoryStage === 'selecting' ? copy.memory.scopeTitle : copy.memory.readingTitle} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div aria-live="polite" className="onboarding-modal-dialog onboarding-memory-dialog">
      <h2>{memoryStage === 'selecting' ? copy.memory.scopeTitle : copy.memory.readingTitle}</h2>
      {memoryStage !== 'selecting' && <p className="onboarding-dialog-subtitle">{copy.memory.readingSubtitle}</p>}
      {memoryStage === 'selecting' ? <div className="onboarding-memory-scope-list">{memorySources.map((source) => <MemoryConnector connectedLabel={copy.connection.connected} key={source} logo={onboardingConnectorLogos[source]} name={homeCopy.sources[source]} onRemove={() => setMemorySources((sources) => sources.filter((item) => item !== source))} removeLabel={copy.memory.removeSource(homeCopy.sources[source])} />)}</div> : <div className="onboarding-memory-connectors">{memorySources.map((source) => <MemoryConnector connectedLabel={copy.connection.connected} key={source} logo={onboardingConnectorLogos[source]} name={homeCopy.sources[source]} />)}</div>}
      {memoryStage === 'selecting' && <><p className="onboarding-memory-scope-hint">{copy.memory.scopeHint}</p><footer><Button onPress={() => setMemoryStage(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button isDisabled={!memorySources.length} onPress={readSelectedMemory} type="button">{copy.memory.readSelected}</Button></footer></>}
      {memoryStage === 'reading' && <AnalysisProgress completeLabel={copy.memory.analysisComplete} label={copy.memory.analysis} value={memoryProgress} />}
      {memoryStage === 'ready' && <div className="onboarding-modal-result"><AnalysisProgress completeLabel={copy.memory.analysisComplete} label={copy.memory.analysis} value={100} /><div aria-label={copy.memory.findingsLabel} className="onboarding-memory-findings">{memoryFindingKeys.map((finding) => {
        const FindingIcon = memoryFindingIcons[finding]
        const [count, label] = copy.memory.findings[finding]
        return <div className="onboarding-memory-finding" key={finding}><FindingIcon aria-hidden="true" /><strong>{count}</strong><span>{label}</span></div>
      })}</div><footer><Button onPress={() => setMemoryStage(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button onPress={() => { update(confirmMemory(state, memorySources)); setMemoryStage(null) }} type="button">{copy.memory.proceed}</Button></footer></div>}
    </div></section>}

    {styleStage && <section aria-label={copy.style.extractingTitle} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div aria-live="polite" className="onboarding-modal-dialog onboarding-memory-dialog onboarding-style-dialog">
      <h2>{copy.style.extractingTitle}</h2><p className="onboarding-dialog-subtitle">{copy.style.extractingSubtitle}</p><AnalysisProgress completeLabel={copy.style.analysisComplete} label={copy.style.analysis} value={styleStage === 'ready' ? 100 : styleProgress} />
      {styleStage === 'ready' && <div className="onboarding-modal-result"><p>{copy.style.editHint}</p><label className="onboarding-prompt-editor"><span>{copy.style.promptLabel}</span><textarea onChange={(event) => setPromptDraft(event.target.value)} value={promptDraft} /></label><footer><Button onPress={() => setStyleStage(null)} type="button" variant="secondary">{copy.actions.cancel}</Button><Button isDisabled={!promptDraft.trim()} onPress={confirmStyle} type="button">{copy.style.usePrompt}</Button></footer></div>}
    </div></section>}

    {styleViewerOpen && <section aria-label={copy.style.view} aria-modal="true" className="onboarding-modal-backdrop" role="dialog"><div className="onboarding-modal-dialog onboarding-style-dialog"><h2>{copy.style.view}</h2><label className="onboarding-prompt-editor"><span>{copy.style.promptLabel}</span><textarea readOnly value={promptDraft} /></label><footer><Button onPress={() => setStyleViewerOpen(false)} type="button" variant="secondary">{copy.actions.cancel}</Button></footer></div></section>}

    {(activation === 'celebrating' || activation === 'ready') && <ActivationCelebration copy={copy.activation} onFinish={finish} stage={activation} />}

    {welcomeOpen && !welcomeDismissed && <section aria-label={copy.welcome.title} aria-modal="true" className="onboarding-welcome-backdrop" role="dialog"><div className="onboarding-welcome-dialog">
      <section className="onboarding-welcome-story">
        <header className="onboarding-welcome-story-header"><p>{copy.welcome.eyebrow}</p><h2>{copy.welcome.storyTitle}</h2></header>
        <img alt={copy.welcome.memoryAlt} className="onboarding-welcome-illustration" src={welcomeMemoryIllustration} />
      </section>
      <section className="onboarding-welcome-setup">
        <Button aria-label={copy.welcome.dismiss} className="onboarding-welcome-close" isIconOnly onPress={dismissWelcome} type="button" variant="ghost"><X aria-hidden="true" /></Button>
        <header className="onboarding-welcome-header"><h2>{copy.welcome.title}</h2><p>{copy.welcome.duration}</p></header>
        <ol>{copy.steps.map((stepCopy, index) => <li className={index === 0 ? 'onboarding-welcome-step-active' : ''} key={stepCopy.label}><span>{index + 1}</span><div><strong>{stepCopy.label}</strong><small>{stepCopy.description}</small></div></li>)}</ol>
        <Button className="onboarding-welcome-start" onPress={dismissWelcome} type="button">{copy.welcome.start}</Button>
      </section>
    </div></section>}
  </section>
}
