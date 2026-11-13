import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  circuitSeed,
  circuitConnected,
  poweredWires,
  roverTrace,
  tickRover,
  type RoverState,
} from '../app/game/core/learningActivities.ts'
import { ActivitySystem } from '../app/game/engine/ActivitySystem.ts'
import {
  basketballCourt,
  basketballPose,
  basketballScores,
} from '../app/game/core/sceneActivities.ts'

test('electricity only reaches the campus through reciprocal connected wires', () => {
  assert.equal(circuitConnected(circuitSeed), false)
  const solution = [0, 0, 0, 0, 0, 1]
  assert.equal(circuitConnected(solution), true)
  assert.equal(poweredWires(solution).length, 6)
  // Broken input, corner and return path each interrupt the real connection.
  for (const index of [0, 2, 4, 5]) {
    const broken = [...solution]
    broken[index] = (broken[index]! + 1) % 4
    assert.equal(circuitConnected(broken), false)
  }
})
test('the rover executes commands over time, fails at gaps, and can be corrected', () => {
  assert.equal(roverTrace(['step', 'step']).failed, 1)
  const rover: RoverState = {
    commands: ['step', 'jump', 'step', 'jump', 'step'],
    age: 0,
    status: 'running',
  }
  tickRover(rover, 0.5)
  assert.equal(rover.status, 'running')
  assert.equal(rover.age, 0.5)
  tickRover(rover, 10)
  assert.equal(rover.status, 'success')
  assert.equal(roverTrace(rover.commands).cells.at(-1), 7)
  const broken: RoverState = { commands: ['step', 'step'], age: 0, status: 'running' }
  tickRover(broken, 10)
  assert.equal(broken.status, 'error')
})
test('basket scores use the same physical rim clearance as the drawn trajectory', () => {
  for (let p = 0; p <= 1; p += 0.01) {
    const ball = basketballPose(1.1, p)
    const fits =
      Math.abs(ball.x - basketballCourt.hoopX) <=
      basketballCourt.rimRadius - basketballCourt.ballRadius + 1e-8
    assert.equal(basketballScores(p), fits)
    const game = new ActivitySystem()
    game.trigger('court', 'basketball', p)
    assert.equal(game.actions.court?.outcome === 'success', fits)
  }
})
test('skills activation powers a whole category and remains stable after revisiting', () => {
  const state = new ActivitySystem()
  state.activateSkillGroup(0)
  assert.equal(state.exploredSkills.length, 5)
  assert.equal(state.activateSkillGroup(0), false)
  state.tick(3, false)
  assert.equal(state.activateSkillGroup(0), true)
  assert.equal(state.exploredSkills.length, 5)
})
