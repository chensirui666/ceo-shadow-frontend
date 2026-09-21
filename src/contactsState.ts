import type { ConnectorId } from './settingsState.ts'

export const contactTimes = ['all', 'day', 'week', 'month', 'quarter'] as const
export type ContactTime = typeof contactTimes[number]

export type ContactSource = { connector: ConnectorId; name: string }
export type ContactProfile = {
  summary: string
  recentContacts: string
  relationship: string
  context: string
}
export type Contact = {
  id: string
  name: string
  relationship: string
  sources: ContactSource[]
  lastInteractionAt: string
  profile: ContactProfile
  contextPrompt: string
  refreshedAt?: string
  invitedAt?: string
}
export type ContactCandidate = Omit<Contact, 'refreshedAt' | 'invitedAt'>
export type ContactFilters = { query: string; sourceIds: ConnectorId[]; time: ContactTime }
export type ContactPatch = Partial<Pick<Contact, 'name' | 'relationship' | 'sources' | 'contextPrompt'>>

const timeWindows: Record<Exclude<ContactTime, 'all' | 'day'>, number> = {
  week: 7 * 24 * 60 * 60 * 1_000,
  month: 30 * 24 * 60 * 60 * 1_000,
  quarter: 90 * 24 * 60 * 60 * 1_000,
}

const connectorSearchTerms: Record<ConnectorId, string[]> = {
  dingtalk: ['dingtalk', '钉钉'],
  feishu: ['feishu', '飞书'],
  teams: ['teams', '微软 teams'],
}

const requireContact = (contacts: Contact[], id: string): Contact => {
  const contact = contacts.find((item) => item.id === id)
  if (!contact) throw new Error('not-found')
  return contact
}

const validTimestamp = (value: string): string => {
  if (!Number.isFinite(Date.parse(value))) throw new Error('invalid-time')
  return value
}

const normalizeSources = (sources: ContactSource[]): ContactSource[] => {
  const seen = new Set<ConnectorId>()
  return sources.map((source) => {
    const name = source.name.trim()
    if (!name || seen.has(source.connector)) throw new Error('invalid-source')
    seen.add(source.connector)
    return { ...source, name }
  })
}

const replaceContact = (contacts: Contact[], id: string, update: (contact: Contact) => Contact): Contact[] => {
  requireContact(contacts, id)
  return contacts.map((contact) => contact.id === id ? update(contact) : contact)
}

export const selectContacts = (contacts: Contact[], filters: ContactFilters, now: Date): Contact[] => {
  const term = filters.query.trim().toLocaleLowerCase()
  const threshold = filters.time === 'all' ? Number.NEGATIVE_INFINITY : filters.time === 'day' ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() : now.getTime() - timeWindows[filters.time]

  return contacts.filter((contact) => {
    const search = [contact.name, contact.relationship, ...contact.sources.flatMap((source) => [source.name, ...connectorSearchTerms[source.connector]])].join(' ').toLocaleLowerCase()
    const sourceMatches = !filters.sourceIds.length || contact.sources.some((source) => filters.sourceIds.includes(source.connector))
    return search.includes(term) && sourceMatches && Date.parse(contact.lastInteractionAt) >= threshold
  }).slice().sort((a, b) => Date.parse(b.lastInteractionAt) - Date.parse(a.lastInteractionAt))
}

export const confirmCandidates = (contacts: Contact[], candidates: ContactCandidate[], ids: string[]): Contact[] => {
  const selected = new Set(ids)
  const existing = new Set(contacts.map((contact) => contact.id))
  return [...contacts, ...candidates.filter((candidate) => selected.has(candidate.id) && !existing.has(candidate.id)).map((candidate) => structuredClone(candidate))]
}

export const updateContact = (contacts: Contact[], id: string, patch: ContactPatch): Contact[] => replaceContact(contacts, id, (contact) => {
  const name = patch.name === undefined ? contact.name : patch.name.trim()
  if (!name) throw new Error('invalid-name')
  return {
    ...contact,
    name,
    relationship: patch.relationship === undefined ? contact.relationship : patch.relationship.trim(),
    sources: patch.sources === undefined ? contact.sources : normalizeSources(patch.sources),
    contextPrompt: patch.contextPrompt === undefined ? contact.contextPrompt : patch.contextPrompt.trim(),
  }
})

export const removeContactSource = (contacts: Contact[], id: string, connector: ConnectorId): Contact[] => replaceContact(contacts, id, (contact) => ({
  ...contact,
  sources: contact.sources.filter((source) => source.connector !== connector),
}))

export const refreshContact = (contacts: Contact[], id: string, refreshedAt: string): Contact[] => replaceContact(contacts, id, (contact) => {
  if (!contact.sources.length) throw new Error('no-source')
  return { ...contact, refreshedAt: validTimestamp(refreshedAt) }
})

export const inviteContact = (contacts: Contact[], id: string, invitedAt: string): Contact[] => replaceContact(contacts, id, (contact) => ({
  ...contact,
  invitedAt: validTimestamp(invitedAt),
}))

export const deleteContact = (contacts: Contact[], id: string): Contact[] => {
  requireContact(contacts, id)
  return contacts.filter((contact) => contact.id !== id)
}
