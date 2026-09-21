import assert from 'node:assert/strict'
import test from 'node:test'
import { confirmCandidates, deleteContact, inviteContact, refreshContact, removeContactSource, selectContacts, updateContact } from './contactsState.ts'
import type { Contact, ContactCandidate } from './contactsState.ts'

const candidate = (id = 'mia-lin'): ContactCandidate => ({
  id,
  name: 'Mia Lin',
  relationship: 'Stardust AI colleague',
  sources: [{ connector: 'dingtalk', name: 'Mia Lin' }],
  lastInteractionAt: '2026-09-20T11:00:00.000Z',
  profile: {
    summary: 'Mia works with Stardust AI on product launches.',
    recentContacts: 'Sep 20 · DingTalk · Confirmed the release checklist.',
    relationship: 'You work together on product launches.',
    context: 'Usually concise and action-oriented.',
  },
  contextPrompt: '',
})

const contact = (): Contact => candidate()

test('filters by visible name, relationship, source identity, time, and source together', () => {
  const contacts: Contact[] = [
    contact(),
    { ...candidate('sam-wu'), name: 'Sam Wu', relationship: 'Design partner', sources: [{ connector: 'feishu', name: '吴森' }], lastInteractionAt: '2026-07-01T11:00:00.000Z' },
  ]

  assert.deepEqual(selectContacts(contacts, { query: ' Lin ', sourceIds: ['dingtalk'], time: 'week' }, new Date('2026-09-21T12:00:00.000Z')).map((item) => item.id), ['mia-lin'])
  assert.deepEqual(selectContacts(contacts, { query: '吴森', sourceIds: ['feishu'], time: 'all' }, new Date('2026-09-21T12:00:00.000Z')).map((item) => item.id), ['sam-wu'])
  assert.equal(selectContacts(contacts, { query: 'partner', sourceIds: ['dingtalk'], time: 'all' }, new Date('2026-09-21T12:00:00.000Z')).length, 0)
})

test('keeps candidates out until explicit confirmation and never adds the same candidate twice', () => {
  const candidates = [candidate(), candidate('sam-wu')]
  const before = confirmCandidates([], candidates, [])
  const after = confirmCandidates(before, candidates, ['mia-lin'])

  assert.equal(before.length, 0)
  assert.deepEqual(after.map((item) => item.id), ['mia-lin'])
  assert.equal(confirmCandidates(after, candidates, ['mia-lin']).length, 1)
})

test('edits user-controlled fields without rewriting observed profile facts', () => {
  const original = contact()
  const updated = updateContact([original], original.id, {
    name: 'Mia L.',
    relationship: 'Product launch partner',
    sources: [{ connector: 'dingtalk', name: '林米娅' }],
    contextPrompt: 'Keep references to the release checklist short.',
  })

  assert.deepEqual(updated[0].sources, [{ connector: 'dingtalk', name: '林米娅' }])
  assert.equal(updated[0].contextPrompt, 'Keep references to the release checklist short.')
  assert.equal(updated[0].profile.context, original.profile.context)
  assert.equal(original.name, 'Mia Lin')
  assert.throws(() => updateContact([original], original.id, { name: '   ' }), /invalid-name/)
})

test('preserves profile history when its final source identity is removed', () => {
  const original = contact()
  const updated = removeContactSource([original], original.id, 'dingtalk')

  assert.equal(updated[0].sources.length, 0)
  assert.equal(updated[0].profile.relationship, 'You work together on product launches.')
  assert.equal(original.sources.length, 1)
})

test('refreshing and inviting mutate only the selected profile without adding contacts', () => {
  const contacts = [contact(), candidate('sam-wu')]
  const refreshed = refreshContact(contacts, 'mia-lin', '2026-09-21T12:00:00.000Z')
  const invited = inviteContact(refreshed, 'mia-lin', '2026-09-21T12:05:00.000Z')

  assert.equal(invited.length, 2)
  assert.equal(invited[0].refreshedAt, '2026-09-21T12:00:00.000Z')
  assert.equal(invited[0].invitedAt, '2026-09-21T12:05:00.000Z')
  assert.equal(invited[1].refreshedAt, undefined)
  assert.equal(invited[1].invitedAt, undefined)
})

test('deleting a contact does not alter any surviving profile', () => {
  const contacts = [contact(), candidate('sam-wu')]
  const remaining = deleteContact(contacts, 'mia-lin')

  assert.deepEqual(remaining.map((item) => item.id), ['sam-wu'])
  assert.throws(() => deleteContact(contacts, 'missing'), /not-found/)
})
