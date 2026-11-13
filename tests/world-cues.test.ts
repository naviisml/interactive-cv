import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cuesForScene, selectWorldCue } from '../app/game/core/worldCues.ts'

test('interaction anchors belong to real objects rather than a chapter overlay', () => {
  const hotel = cuesForScene('fletcher')
  assert.deepEqual(hotel.map((cue) => cue.key), ['door', 'bell'])
  assert.deepEqual(hotel.map((cue) => cue.x), [0, 182])
  assert.equal(hotel[0]!.title.nl, 'Ga naar binnen')
  assert.equal(cuesForScene('first-lines')[0]?.action, 'first-code')
  assert.equal(cuesForScene('navel-development')[0]?.action, 'projects')
  assert.equal(cuesForScene('skills-road').length, 3)
  assert.equal(cuesForScene('contact').length, 3)
  assert.deepEqual(cuesForScene('unlisted-scene'), [])
})

test('approaching the bell prioritizes it over the door, leaving hides the cue', () => {
  const specs = cuesForScene('fletcher')
  const at = (x: number) => selectWorldCue(
    specs.map((cue) => ({ id: cue.key, distance: Math.abs(x - cue.x), radius: cue.radius })),
  )
  assert.equal(at(0), 'door')
  assert.equal(at(150), 'bell')
  assert.equal(at(500), undefined)
})

test('hover selects actual pointed-to object and only one tooltip can show', () => {
  assert.equal(selectWorldCue([
    { id: 'door', distance: 10, radius: 175 },
    { id: 'bell', distance: 160, radius: 150, hovered: true },
  ]), 'bell')
  assert.equal(selectWorldCue([
    { id: 'door', distance: 600, radius: 175 },
  ]), undefined)
})
