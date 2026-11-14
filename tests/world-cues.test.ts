import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cuesForScene, selectWorldCue, showsWorldHint } from '../app/game/core/worldCues.ts'
import { ActivitySystem } from '../app/game/engine/ActivitySystem.ts'

test('interaction anchors belong to real objects rather than a chapter overlay', () => {
  const hotel = cuesForScene('fletcher')
  assert.deepEqual(
    hotel.map((cue) => cue.key),
    ['door', 'bell'],
  )
  assert.deepEqual(
    hotel.map((cue) => cue.x),
    [0, 182],
  )
  assert.equal(hotel[0]!.title.nl, 'Ga naar binnen')
  assert.equal(cuesForScene('first-lines')[0]?.action, 'first-code')
  assert.deepEqual(cuesForScene('navel-development'), [])
  assert.equal(cuesForScene('skills-road').length, 3)
  assert.equal(cuesForScene('contact').length, 4)
  assert.deepEqual(cuesForScene('unlisted-scene'), [])
})

test('approaching the bell prioritizes it over the door, leaving hides the cue', () => {
  const specs = cuesForScene('fletcher')
  const at = (x: number) =>
    selectWorldCue(
      specs.map((cue) => ({ id: cue.key, distance: Math.abs(x - cue.x), radius: cue.radius })),
    )
  assert.equal(at(0), 'door')
  assert.equal(at(150), 'bell')
  assert.equal(at(500), undefined)
})

test('hover selects actual pointed-to object and only one tooltip can show', () => {
  assert.equal(
    selectWorldCue([
      { id: 'door', distance: 10, radius: 175 },
      { id: 'bell', distance: 160, radius: 150, hovered: true },
    ]),
    'bell',
  )
  assert.equal(selectWorldCue([{ id: 'door', distance: 600, radius: 175 }]), undefined)
})

test('first interaction suppresses hints for that individual object on later visits', () => {
  const actions = new ActivitySystem()
  assert.equal(actions.wasCueUsed('panta-rhei', 'door'), false)
  assert.equal(actions.wasCueUsed('panta-rhei', 'ball'), false)
  actions.markCueUsed('panta-rhei', 'door')
  assert.equal(actions.wasCueUsed('panta-rhei', 'door'), true)
  assert.equal(actions.wasCueUsed('panta-rhei', 'ball'), false)
  actions.markCueUsed('panta-rhei', 'ball')
  assert.equal(actions.wasCueUsed('panta-rhei', 'ball'), true)
  assert.equal(actions.wasCueUsed('roc-hilversum', 'door'), false)
  actions.markCueUsed('panta-rhei', 'door')
  assert.equal(actions.usedCues.size, 2, 'repeated clicks do not create duplicate discoveries')
})

test('only the first entrance teaches doors, and the campsite keeps all four actions without hints', () => {
  assert.equal(showsWorldHint('fletcher', 'door'), true)
  for (const id of ['get-e', 'appjection']) assert.equal(showsWorldHint(id, 'door'), false)
  for (const cue of cuesForScene('contact')) assert.equal(showsWorldHint('contact', cue.key), false)
})
