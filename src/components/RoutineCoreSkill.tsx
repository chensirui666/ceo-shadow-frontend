import { useState } from 'react'
import { Button } from '@heroui/react'
import { ArrowLeft, ChevronRight, FileChartColumn, Plus, ShieldAlert, Sunrise, X } from 'lucide-react'
import type { Locale } from '../appState.ts'
import { routineSkillIds, routineSkills } from '../routineState.ts'
import type { RoutineConfig, RoutineSkillId } from '../routineState.ts'

const skillIcons = {
  'morning-briefing': Sunrise,
  'project-weekly-report': FileChartColumn,
  'risk-review': ShieldAlert,
} as const

function SkillIcon({ skillId, size = 20 }: { skillId: RoutineSkillId; size?: number }) {
  const Icon = skillIcons[skillId]
  return <span aria-hidden="true" className={`routine-skill-icon routine-skill-icon--${skillId}`}><Icon size={size} strokeWidth={1.55} /></span>
}

function SkillCopy({ skillId, locale }: { skillId: RoutineSkillId; locale: Locale }) {
  const skill = routineSkills[locale][skillId]
  return <span className="routine-skill-copy"><strong>{skill.name}</strong><small>{skill.creator}</small><em>{skill.description}</em></span>
}

export function RoutineSkillDrawerBody({ detailId, draft, locale, busy, onAdd, onDetail }: { detailId: RoutineSkillId | null; draft: RoutineConfig; locale: Locale; busy: boolean; onAdd: (skillId: RoutineSkillId) => void; onDetail: (skillId: RoutineSkillId) => void }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en
  const detail = detailId ? routineSkills[locale][detailId] : null
  if (detail && detailId) return <section className="routine-skill-detail"><div className="routine-skill-detail-heading"><SkillIcon skillId={detailId} size={30} /><div><p className="routine-skill-detail-creator">{detail.creator}</p><p>{detail.detail}</p></div></div><section className="routine-skill-detail-section"><h3>{t('能力说明', 'About this skill')}</h3><p>{detail.description}</p></section><dl><div><dt>{t('输入', 'Input')}</dt><dd>{t('已连接的工作资料', 'Connected work context')}</dd></div><div><dt>{t('产出', 'Output')}</dt><dd>{detail.description}</dd></div><div><dt>{t('编辑', 'Editing')}</dt><dd>{t('当前仅支持使用 Friday 提供的默认能力。', 'Friday-provided skills are read-only for now.')}</dd></div></dl><footer className="routine-skill-detail-footer"><Button className="routine-skill-detail-action" isDisabled={busy || draft.skillId === detailId} onPress={() => onAdd(detailId)} type="button">{draft.skillId === detailId ? t('已选择', 'Selected') : 'Add'}</Button></footer></section>

  return <div className="routine-skill-options">{routineSkillIds.map((skillId) => { const skill = routineSkills[locale][skillId]; return <Button aria-label={`${t('查看能力详情：', 'View skill details: ')}${skill.name}`} className="routine-skill-option" key={skillId} onPress={() => onDetail(skillId)} type="button" variant="ghost"><SkillIcon skillId={skillId} size={30} /><SkillCopy skillId={skillId} locale={locale} /><ChevronRight aria-hidden="true" className="routine-skill-option-arrow" size={18} /></Button> })}</div>
}

export default function RoutineCoreSkill({ draft, locale, busy, onChange }: { draft: RoutineConfig; locale: Locale; busy: boolean; onChange: (next: RoutineConfig) => void }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailId, setDetailId] = useState<RoutineSkillId | null>(null)
  const selected = draft.skillId ? routineSkills[locale][draft.skillId] : null
  const selectSkill = (skillId: RoutineSkillId) => { onChange({ ...draft, skillId }); setDrawerOpen(false); setDetailId(null) }
  const close = () => { setDrawerOpen(false); setDetailId(null) }

  return <section className="routine-core-skill">
    <header className="routine-setting-copy"><span>{t('核心能力', 'Core skill')}</span><p>{t('决定这条 Routine 如何理解工作资料并生成结果。', 'Defines how this Routine turns work context into a result.')}</p></header>
    {selected && draft.skillId ? <div className="routine-core-skill-selected"><Button aria-label={`${t('查看能力详情：', 'View skill details: ')}${selected.name}`} className="routine-core-skill-card" onPress={() => { setDetailId(draft.skillId); setDrawerOpen(true) }} type="button" variant="ghost"><SkillIcon skillId={draft.skillId} size={30} /><SkillCopy skillId={draft.skillId} locale={locale} /></Button><Button className="routine-core-skill-change" isDisabled={busy} onPress={() => setDrawerOpen(true)} type="button" variant="secondary">{t('更换', 'Change')}</Button></div> : <Button aria-label={t('选择核心能力', 'Select core skill')} className="routine-core-skill-empty" isDisabled={busy} onPress={() => setDrawerOpen(true)} type="button" variant="secondary"><Plus size={17} />{t('选择核心能力', 'Select core skill')}</Button>}
    {drawerOpen && <><button aria-label={t('关闭能力侧边栏', 'Close skill drawer')} className="routine-skill-scrim" onClick={close} type="button" /><aside aria-label={t('选择核心能力', 'Select core skill')} aria-modal="true" className="routine-skill-drawer" role="dialog"><header><div>{detailId ? <Button aria-label={t('返回能力列表', 'Back to skills')} className="routine-skill-drawer-back" onPress={() => setDetailId(null)} type="button" variant="ghost"><ArrowLeft size={17} /></Button> : null}<div><h2>{detailId ? routineSkills[locale][detailId].name : t('选择核心能力', 'Choose a core skill')}</h2><p>{detailId ? t('查看这个能力会如何处理工作资料。', 'See how this skill handles work context.') : t('仅展示适合当前 Routine 的能力。', 'Only skills that fit this Routine are shown.')}</p></div></div><Button aria-label={t('关闭', 'Close')} className="routine-skill-drawer-close" onPress={close} type="button" variant="ghost"><X size={18} /></Button></header><RoutineSkillDrawerBody detailId={detailId} draft={draft} locale={locale} busy={busy} onAdd={selectSkill} onDetail={setDetailId} /></aside></>}
  </section>
}
