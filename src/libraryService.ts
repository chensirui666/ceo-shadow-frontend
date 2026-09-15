import { collectLibraryFile, deleteLibraryFile, renameLibraryFile } from './libraryState.ts'
import type { LibraryFile } from './libraryState.ts'

export const createLibrarySamples = (): LibraryFile[] => {
  const samples = [
    ['weekly-report.pdf', '项目周报'], ['checklist.md', '本周上线检查清单'], ['delivery.xlsx', '交付资源与排期核对'],
    ['work-notes.docx', '项目工作记录'], ['review.pptx', '上线检查汇报'], ['diagram.png', '产品方案示意图'],
    ['progress.csv', '检查进度'], ['notes.txt', '工作记录'], ['report.html', '项目页面'], ['config.json', '检查配置'],
    ['example.py', 'Python 示例'], ['example.js', 'JavaScript 示例'], ['diagram.jpg', '方案图片'],
    ['diagram.webp', '方案图片 WebP'], ['diagram.gif', '动图示例'], ['diagram.svg', '矢量示意图'], ['archive.zip', '资料压缩包'],
  ]
  return samples.map(([filename, name], index) => ({
    id: `library-sample-${index}`, name, extension: filename.split('.').at(-1)!, generatedAt: new Date(Date.UTC(2026, 8, 13 - Math.floor(index / 3), 10 - index % 3)).toISOString(),
    url: `/library-samples/${filename}`,
    source: index === 0
      ? { kind: 'routine', id: 'deleted-demo-routine', recordId: 'deleted-demo-run', name: '项目周报', available: false, deleted: true }
      : { kind: 'message', id: index === 2 ? 'delivery-commitment' : 'weekly-summary', recordId: index === 2 ? 'delivery-commitment' : 'weekly-summary', name: index === 2 ? '客户交付群' : '项目频道', available: true },
    deliveries: index === 0 ? [{ connector: '钉钉', targetId: 'project-group', targetName: '项目组', status: 'sent' }, { connector: 'Teams', targetId: 'product-group', targetName: '产品组', status: 'failed', reason: '连接已失效' }]
      : index === 1 ? [{ connector: 'Teams', targetId: 'project-channel', targetName: '项目频道', status: 'sent' }]
      : index === 3 ? [{ connector: '钉钉', targetId: 'project-group', targetName: '项目组', status: 'sending' }]
      : index === 4 ? [{ connector: 'Teams', targetId: 'product-group', targetName: '产品组', status: 'unknown', reason: '尚未收到投递结果' }]
      : index === 6 ? [{ connector: '钉钉', targetId: 'project-group', targetName: '项目组', status: 'failed', reason: '目标暂时不可访问' }] : [],
  }))
}

export const createLibraryService = (initial: LibraryFile[] = createLibrarySamples()) => {
  let files = structuredClone(initial)
  const current = () => structuredClone(files)
  return {
    load: async () => current(),
    rename: async (id: string, name: string) => { files = renameLibraryFile(files, id, name); return current() },
    remove: async (id: string) => { files = deleteLibraryFile(files, id); return current() },
    forgetMissing: async (id: string) => { files = files.filter((file) => file.id !== id); return current() },
    collect: async (file: LibraryFile, formal: boolean) => { files = collectLibraryFile(files, file, formal); return current() },
  }
}

export type LibraryService = ReturnType<typeof createLibraryService>
