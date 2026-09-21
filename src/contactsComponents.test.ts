import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { createContactCandidates } from './contactsService.ts'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: false, middlewareMode: true } })
after(() => vite.close())

const copy = {
  title: 'Contacts',
  explainer: 'Your assistant builds a working profile of the people you interact with, drawn from your conversations and background research.',
  search: 'Search contacts', time: 'Contact time', source: 'Source', allSources: 'All sources', noSources: 'No source identity', get: 'Get contacts', goConnect: 'Go connect',
  times: { all: 'All time', day: 'Today', week: 'Last week', month: 'Last month', quarter: 'Last three months' },
  sources: { dingtalk: 'DingTalk', feishu: 'Feishu', teams: 'Teams' },
  fields: { name: 'Name', relationship: 'Relationship', sources: 'Sources', context: 'Additional context or instructions', contextHint: 'Optional — passed to your assistant when refreshing their people document' },
  empty: 'Contacts keeps the people Friday has confirmed for you.', profile: 'Profile', close: 'Close profile', more: 'More actions', edit: 'Edit information', remove: 'Delete contact', invite: 'Invite to Team', refresh: 'Update profile',
  noContext: 'There is not enough interaction to describe a communication pattern yet.',
  getDialog: { title: 'Get contacts', body: 'Friday can find people from direct messages, personal emails, and group messages that directly mention you.', cancel: 'Cancel', tryChat: 'Try in chat', send: 'Send', result: 'Found the following eligible contacts. Confirm to add them.', noResult: 'No contacts met the current criteria.', confirm: 'Confirm add' },
  editDialog: { title: 'Edit contact', save: 'Save changes', removeSource: 'Remove source', error: 'Enter a name for the contact and every remaining source identity.' },
  deleteDialog: { title: 'Delete this contact?', body: 'This removes the contact from this local session.', cancel: 'Cancel', confirm: 'Delete contact' },
  notices: { added: 'Contacts added to this local session.', saved: 'Contact information saved.', refreshed: 'Profile refresh recorded locally.', invited: 'Team invitation recorded locally.', removed: 'Contact removed.' },
}

test('contacts list presents the three required information fields and a continuous right profile', async () => {
  const { ContactsWorkspaceContent } = await vite.ssrLoadModule('/src/components/ContactsWorkspace.tsx')
  const contact = createContactCandidates()[0]
  const html = renderToStaticMarkup(createElement(ContactsWorkspaceContent, {
    contacts: [contact], selectedId: contact.id, query: '', time: 'all', sourceIds: [], connectedSources: ['dingtalk', 'feishu'], copy,
    onOpen: () => {}, onAction: () => {}, onQueryChange: () => {}, onSourceIdsChange: () => {}, onTimeChange: () => {},
  }))

  assert.match(html, /Your assistant builds a working profile of the people you interact with/)
  assert.match(html, /Mia Lin/)
  assert.match(html, /Stardust AI colleague/)
  assert.match(html, /DingTalk.*Mia Lin/)
  assert.match(html, /Mia works with Stardust AI on product launches.*Confirmed the release checklist.*work together on product launches.*Usually concise and action-oriented/s)
  assert.doesNotMatch(html, /raw message|prompt|reasoning/i)
})

test('uses the current saved connector state when opening contacts', async () => {
  const { connectedContactSources } = await vite.ssrLoadModule('/src/components/ContactsWorkspace.tsx')
  const { createDefaultSettings } = await vite.ssrLoadModule('/src/settingsState.ts')
  const settings = createDefaultSettings()
  settings.connectors.dingtalk = 'connected'

  assert.deepEqual(connectedContactSources(settings), ['dingtalk'])
})

test('labels a profile with no remaining source identity accurately', async () => {
  const { ContactsWorkspaceContent } = await vite.ssrLoadModule('/src/components/ContactsWorkspace.tsx')
  const contact = { ...createContactCandidates()[0], sources: [] }
  const html = renderToStaticMarkup(createElement(ContactsWorkspaceContent, {
    contacts: [contact], selectedId: contact.id, query: '', time: 'all', sourceIds: [], connectedSources: ['dingtalk'], copy,
    onOpen: () => {}, onAction: () => {}, onQueryChange: () => {}, onSourceIdsChange: () => {}, onTimeChange: () => {},
  }))

  assert.match(html, /No source identity/)
})
