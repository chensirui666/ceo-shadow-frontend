import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { createContactsService } from './contactsService.ts'

const vite = await createServer({ root: process.cwd(), appType: 'custom', server: { hmr: false, middlewareMode: true } })
after(() => vite.close())

const copy = {
  title: 'Contacts',
  explainer: 'Your assistant builds a working profile of the people you interact with, drawn from your conversations and background research.',
  search: 'Search contacts', time: 'Contact time', source: 'Source', allSources: 'All sources', noSources: 'No source identity', get: 'Get contacts', goConnect: 'Go connect', lastContact: 'Last contact',
  times: { all: 'All time', day: 'Today', week: 'Last week', month: 'Last month', quarter: 'Last three months' },
  sources: { dingtalk: 'DingTalk', feishu: 'Feishu', teams: 'Teams' },
  fields: { name: 'Name', relationship: 'Relationship', company: 'Company', tags: 'Tags', recentStatus: 'Recent status', category: 'Category', sources: 'Sources', context: 'Additional context or instructions', contextHint: 'Optional — passed to your assistant when refreshing their people document' },
  statuses: { 'on-track': 'On track', waiting: 'Waiting', 'needs-follow-up': 'Needs follow-up', 'no-update': 'No recent update' },
  categories: { all: 'All', leader: 'Leader', colleague: 'Colleague', report: 'Report', client: 'Client', other: 'Other' }, actions: 'Actions',
  empty: 'Contacts keeps the people Friday has confirmed for you.', profile: 'Profile', close: 'Close profile', more: 'More actions', edit: 'Edit information', blacklist: 'Add to blacklist', invite: 'Invite to Team', refresh: 'Update profile',
  noContext: 'There is not enough interaction to describe a communication pattern yet.',
  getDialog: { title: 'Get contacts', body: 'Friday automatically maintains Contacts from people who match your inclusion rules. You can edit those rules in Settings.', cancel: 'Cancel', tryChat: 'Try in chat' },
  editDialog: { title: 'Edit contact', save: 'Save changes', removeSource: 'Remove source', error: 'Enter every remaining source identity.' },
  blacklistDialog: { title: 'Add this contact to the blacklist?', body: 'Friday will no longer use this person in future processing.', cancel: 'Cancel', confirm: 'Add to blacklist' },
  tagDialog: { title: 'Manage tags', name: 'Tag name', rule: 'Tag rule', create: 'Create tag', remove: 'Delete tag', deleteTitle: 'Delete tag?', deleteBody: 'This removes the tag from every contact.', cancel: 'Cancel', confirm: 'Delete tag', error: 'Enter a tag name and rule.' },
  notices: { saved: 'Contact information saved.', refreshed: 'Profile refresh recorded locally.', invited: 'Team invitation recorded locally.', blacklisted: 'Contact added to the blacklist.', tagCreated: 'Tag created.', tagRemoved: 'Tag removed.' },
}

test('contacts list presents tags instead of projects and importance in the continuous right profile', async () => {
  const { ContactsWorkspaceContent } = await vite.ssrLoadModule('/src/components/ContactsWorkspace.tsx')
  const { contacts: [contact], tags } = await createContactsService().load()
  const html = renderToStaticMarkup(createElement(ContactsWorkspaceContent, {
    contacts: [contact], tags, selectedId: contact.id, query: '', time: 'all', category: 'all', sourceIds: [], connectedSources: ['dingtalk', 'feishu'], copy,
    onOpen: () => {}, onAction: () => {}, onManageTags: () => {}, onRemoveContactTag: () => {}, onQueryChange: () => {}, onSourceIdsChange: () => {}, onTimeChange: () => {}, onCategoryChange: () => {},
  }))

  assert.match(html, /Your assistant builds a working profile of the people you interact with/)
  assert.match(html, /Mia Lin/)
  assert.match(html, /Stardust AI colleague/)
  assert.match(html, /Company/)
  assert.match(html, /Tags/)
  assert.match(html, /Stardust AI/)
  assert.match(html, /Product launch/)
  assert.match(html, /DingTalk.*Mia Lin/)
  assert.match(html, /Last contact/)
  assert.match(html, /Recent status/)
  assert.match(html, /On track/)
  assert.match(html, /Product launch · release checklist confirmed/)
  assert.ok(html.indexOf('contacts-list') < html.indexOf('Last contact'))
  assert.match(html, /Actions/)
  assert.doesNotMatch(html, /contacts-demo-note|<details/)
  assert.match(html, /Mia works with Stardust AI on product launches.*Confirmed the release checklist.*work together on product launches.*Usually concise and action-oriented/s)
  assert.doesNotMatch(html, /raw message|prompt|reasoning/i)
})

test('prioritizes name and status columns, keeps tags manageable, and keeps source filters compact', async () => {
  const { ContactsWorkspaceContent } = await vite.ssrLoadModule('/src/components/ContactsWorkspace.tsx')
  const { contacts: [contact], tags } = await createContactsService().load()
  const html = renderToStaticMarkup(createElement(ContactsWorkspaceContent, {
    contacts: [contact], tags, selectedId: null, query: '', time: 'all', category: 'all', sourceIds: [], connectedSources: ['dingtalk', 'feishu'], copy,
    onOpen: () => {}, onAction: () => {}, onManageTags: () => {}, onRemoveContactTag: () => {}, onQueryChange: () => {}, onSourceIdsChange: () => {}, onTimeChange: () => {}, onCategoryChange: () => {},
  }))
  const header = html.slice(html.indexOf('contacts-list-head'), html.indexOf('contacts-row'))

  assert.match(header, /Name.*Recent status.*Company.*Tags.*Source.*Last contact.*Actions/s)
  assert.doesNotMatch(header, />All sources</)
  assert.doesNotMatch(header, />All time</)
  assert.match(html, /Product launch/)
  assert.match(html, /contacts-source-item[^>]*><img[^>]*><span>Mia Lin<\/span><\/span>.*contacts-source-item[^>]*><img[^>]*><span>林米娅<\/span><\/span>/s)
})

test('does not render a decorative contacts banner', async () => {
  const { ContactsWorkspaceContent } = await vite.ssrLoadModule('/src/components/ContactsWorkspace.tsx')
  const { contacts: [contact], tags } = await createContactsService().load()
  const html = renderToStaticMarkup(createElement(ContactsWorkspaceContent, {
    contacts: [contact], tags, selectedId: null, query: '', time: 'all', category: 'all', sourceIds: [], connectedSources: ['dingtalk'], copy,
    onOpen: () => {}, onAction: () => {}, onManageTags: () => {}, onRemoveContactTag: () => {}, onQueryChange: () => {}, onSourceIdsChange: () => {}, onTimeChange: () => {}, onCategoryChange: () => {},
  }))

  assert.doesNotMatch(html, /contacts-banner/)
})

test('renders category tabs beside search and the selected contact category in basic information', async () => {
  const { ContactsWorkspaceContent } = await vite.ssrLoadModule('/src/components/ContactsWorkspace.tsx')
  const { contacts: [contact], tags } = await createContactsService().load()
  const html = renderToStaticMarkup(createElement(ContactsWorkspaceContent, {
    contacts: [contact], tags, selectedId: contact.id, query: '', time: 'all', sourceIds: [], category: 'all', connectedSources: ['dingtalk'], copy,
    onOpen: () => {}, onAction: () => {}, onManageTags: () => {}, onRemoveContactTag: () => {}, onQueryChange: () => {}, onSourceIdsChange: () => {}, onTimeChange: () => {}, onCategoryChange: () => {},
  }))

  assert.match(html, /role="tablist"/)
  assert.match(html, />All</)
  assert.match(html, />Category</)
  assert.match(html, />Colleague</)
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
  const { contacts: [savedContact], tags } = await createContactsService().load()
  const contact = { ...savedContact, sources: [] }
  const html = renderToStaticMarkup(createElement(ContactsWorkspaceContent, {
    contacts: [contact], tags, selectedId: contact.id, query: '', time: 'all', category: 'all', sourceIds: [], connectedSources: ['dingtalk'], copy,
    onOpen: () => {}, onAction: () => {}, onManageTags: () => {}, onRemoveContactTag: () => {}, onQueryChange: () => {}, onSourceIdsChange: () => {}, onTimeChange: () => {}, onCategoryChange: () => {},
  }))

  assert.match(html, /No source identity/)
})

test('uses Go connect as the sole primary entry when no source is connected', async () => {
  const { ContactsWorkspaceContent } = await vite.ssrLoadModule('/src/components/ContactsWorkspace.tsx')
  const html = renderToStaticMarkup(createElement(ContactsWorkspaceContent, {
    contacts: [], tags: [], selectedId: null, query: '', time: 'all', category: 'all', sourceIds: [], connectedSources: [], copy,
    onOpen: () => {}, onAction: () => {}, onManageTags: () => {}, onRemoveContactTag: () => {}, onQueryChange: () => {}, onSourceIdsChange: () => {}, onTimeChange: () => {}, onCategoryChange: () => {},
  }))

  assert.match(html, /Go connect/)
})
