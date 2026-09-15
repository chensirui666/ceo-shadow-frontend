import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createLibraryService } from './libraryService.ts'

test('library sessions keep their own mutations and restore samples in a new session', async () => {
  const service = createLibraryService()
  const initial = await service.load()
  assert.ok(initial.length > 10)
  const first = initial.find((file) => !file.deliveries.some((delivery) => delivery.status === 'sending'))!
  await service.rename(first.id, 'Renamed')
  assert.equal((await service.load()).find((file) => file.id === first.id)?.name, 'Renamed')
  await service.remove(first.id)
  assert.ok(!(await service.load()).some((file) => file.id === first.id))
  assert.equal((await createLibraryService().load()).length, initial.length)
  const sending = initial.find((file) => file.deliveries.some((delivery) => delivery.status === 'sending'))!
  await assert.rejects(service.remove(sending.id), /sending/)
  assert.ok((await service.load()).some((file) => file.id === sending.id))
  await service.forgetMissing(sending.id)
  assert.ok(!(await service.load()).some((file) => file.id === sending.id))
})
