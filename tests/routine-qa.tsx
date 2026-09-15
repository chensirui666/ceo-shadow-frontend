// Development-only manual checks: open /tests/routine-qa.html with the Vite server.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button } from '@heroui/react'
import SettingsWorkspace from '../src/components/SettingsWorkspace.tsx'
import RoutineWorkspace from '../src/components/RoutineWorkspace.tsx'
import { createRoutineService } from '../src/routineService.ts'
import { createRoutineDraft } from '../src/routineState.ts'
import type { RoutineLeaveGuard } from '../src/components/RoutineWorkspace.tsx'
import '../src/index.css'

let failure = ''
let guard: RoutineLeaveGuard | null = null
const base = createRoutineService()
await base.save(createRoutineDraft([], 'Asia/Shanghai', 'zh'))
const service = {
  ...base,
  load: async () => { if (failure === 'load') throw new Error('QA load failure'); return base.load() },
  save: async (...args: Parameters<typeof base.save>) => { if (failure === 'save') throw new Error('QA save failure'); return base.save(...args) },
  synchronize: async (...args: Parameters<typeof base.synchronize>) => { if (failure === 'sync') throw new Error('QA synchronization failure'); return base.synchronize(...args) },
  preview: async (...args: Parameters<typeof base.preview>) => { if (failure === 'preview') throw new Error('QA preview failure'); const result = await base.preview(...args); return failure === 'empty' ? { ...result, sections: [] } : result },
}
function QA() {
  const [mode, setMode] = useState('')
  const [visit, setVisit] = useState(0)
  const [left, setLeft] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  return <><aside aria-label="测试控制" style={{ padding: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    <strong>仅测试 · {mode || '正常'}</strong>
    {[['', '正常'], ['load', '加载失败'], ['save', '保存失败'], ['sync', '同步失败'], ['preview', '预览失败'], ['empty', '资料不足']].map(([value, label]) => <Button key={value} variant="secondary" onPress={() => { failure = value; setMode(value) }}>{label}</Button>)}
    <Button variant="secondary" onPress={() => { setLeft(false); setVisit((value) => value + 1) }}>重新进入</Button>
    <Button variant="secondary" onPress={() => guard?.(() => setLeft(true))}>测试离开</Button>
  </aside>{left ? <p>已离开</p> : <RoutineWorkspace key={visit} locale="zh" service={service} onOpenSettings={() => setSettingsOpen(true)} registerLeaveGuard={(value) => { guard = value }} />}{settingsOpen && <SettingsWorkspace initialSection="apps" locale="zh" onLocaleChange={() => {}} onNavigate={() => {}} onClose={() => setSettingsOpen(false)} />}</>
}
createRoot(document.getElementById('root')!).render(<QA />)
