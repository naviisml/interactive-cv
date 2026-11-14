import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { journeyEvents } from '../app/content/journey.ts'
import { skillGroups, SKILL_ROAD_SPAN, skillLogos } from '../app/content/skills.ts'
import { hasDetails } from '../app/content/timeline.ts'
import { dutchEvents } from '../app/content/locales/nl.ts'
import { journeyLayout, currentSlot } from '../app/game/core/journeyLayout.ts'
import { createWorld } from '../app/game/core/world.ts'
import { terrainHeight } from '../app/game/core/physics.ts'
test('every chapter has Dutch content and Skills/computer have no modal', () => {
  for (const event of journeyEvents) assert.ok(dutchEvents[event.id]?.summary, event.id)
  const skills = journeyEvents.filter((event) => event.category === 'skills')
  assert.equal(skills.length, 1)
  assert.equal(hasDetails(skills[0]!), false)
  assert.equal(hasDetails(journeyEvents.find((event) => event.id === 'navel-development')!), false)
  assert.equal(journeyEvents[0]!.label, '2011')
})
test('all 18 original CV logos are local nonempty assets', () => {
  assert.equal(skillLogos.length, 18)
  assert.equal(new Set(skillLogos.map((logo) => logo.id)).size, 18)
  for (const logo of skillLogos) {
    assert.ok(fs.statSync(new URL('../public' + logo.asset, import.meta.url)).size > 100)
    assert.ok(logo.width > 0 && logo.height > 0)
  }
})
test('long scene spans remain current until the actual zone boundary and stay level', () => {
  const slots = journeyLayout(
    journeyEvents.map((_, i) => i),
    (i) => journeyEvents[i]?.span ?? 920,
  )
  const skill = slots.find((slot) => journeyEvents[slot.index]?.id === 'skills-road')!
  assert.equal(currentSlot(skill.x + SKILL_ROAD_SPAN / 2 - 5, slots)?.index, skill.index)
  const world = createWorld(
    slots.map((slot) => ({ ...slot, course: journeyEvents[slot.index]?.category !== 'skills' })),
  )
  assert.equal(
    terrainHeight(skill.x - SKILL_ROAD_SPAN / 2 + 180, world.geometry.terrain),
    terrainHeight(skill.x + SKILL_ROAD_SPAN / 2 - 180, world.geometry.terrain),
  )
  for (let i = 1; i < slots.length; i++) assert.equal(slots[i - 1]!.end, slots[i]!.start)
})
test('English and Dutch interfaces have the same translation keys', () => {
  const read = (code: string) =>
    JSON.parse(fs.readFileSync(new URL(`../i18n/locales/${code}.json`, import.meta.url), 'utf8'))
  const keys = (value: Record<string, unknown>, prefix = ''): string[] =>
    Object.entries(value)
      .flatMap(([key, v]) =>
        typeof v === 'object' && v
          ? keys(v as Record<string, unknown>, prefix + key + '.')
          : [prefix + key],
      )
      .sort()
  assert.deepEqual(keys(read('en')), keys(read('nl')))
})

test('company projects live in the computer, not a second stretch of the walking route', () => {
  const company = journeyEvents.filter((e) => e.level === 'company')
  assert.equal(company[0]?.category, 'projects')
  assert.deepEqual(
    company.map((e) => e.id),
    ['navel-development'],
  )
  assert.equal(journeyEvents.at(-2)?.id, 'navel-development')
  assert.equal(journeyEvents.at(-1)?.id, 'contact')
})
test('compact skill groups contain each original technology exactly once', () => {
  const ids = skillGroups.flatMap((g) => [...g.ids])
  assert.equal(ids.length, 18)
  assert.equal(new Set(ids).size, 18)
  assert.deepEqual([...ids].sort(), skillLogos.map((l) => l.id).sort())
  assert.ok(SKILL_ROAD_SPAN < 1700)
})
