import assert from 'node:assert/strict'
import test from 'node:test'

const { createDemoHomeSnapshot } = await import('./homeState.ts')
const { createHomeService } = await import('./homeService.ts')

test('service returns a new snapshot for a confirmation decision without mutating the earlier load', async () => {
  const service = createHomeService(createDemoHomeSnapshot(new Date('2026-08-06T12:00:00.000Z')))
  const before = await service.load()
  const after = await service.resolveEvent('needs-confirmation', 'cancel', '确认后再安排。')

  assert.equal(before.events.find((event) => event.id === 'needs-confirmation')?.status, 'needs-confirmation')
  assert.equal(after.events.find((event) => event.id === 'needs-confirmation')?.status, 'completed')
  assert.equal(after.events.find((event) => event.id === 'needs-confirmation')?.outcome, 'cancelled')
})
