import type { Locale } from '../appState.ts'
import type { RoutineDocument } from '../routineState.ts'

export const routineStyleNames = { zh: { edition: '刊物', signal: '简讯', folio: '画册' }, en: { edition: 'Edition', signal: 'Signal', folio: 'Folio' } }

export default function RoutineDocumentView({ document, locale }: { document: RoutineDocument; locale: Locale }) {
  const styled = document.format === 'pdf'
  const date = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(document.createdAt))
  return <article className={`routine-paper ${styled ? `routine-paper-${document.style}` : 'routine-paper-plain'}`}>
    <header className="routine-paper-header"><div className="routine-paper-masthead"><span>Friday</span><span>{date}<br />{document.format.toUpperCase()}</span></div><h1>{document.title}</h1><p>{locale === 'zh' ? '工作简报' : 'Work briefing'}</p></header>
    <div className="routine-paper-content">{document.sections.map((section, index) => <section className="routine-paper-section" key={index}><h2><span className="routine-paper-number">{String(index + 1).padStart(2, '0')}</span>{section.heading}</h2><p>{section.body}</p></section>)}</div>
    <footer className="routine-paper-footer"><span>Friday Routine</span><span>01</span></footer>
  </article>
}
