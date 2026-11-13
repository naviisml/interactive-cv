import { test } from 'node:test'
import assert from 'node:assert/strict'
import { financialSnapshot } from '../app/game/core/financialSnapshot.ts'
test('debt and savings coexist without netting or inventing zero balances', () => {
  const result = financialSnapshot(['a', 'b'], 1, {
    a: { debt: 4000, savings: 800 },
    b: { featured: 'savings' },
  })
  assert.equal(result.debt, 4000)
  assert.equal(result.savings, 800)
  assert.equal(result.featured, 'savings')
  assert.equal(financialSnapshot(['a'], 0, {}).debt, null)
})
test('financial history carries forward, rewinds and respects withheld values', () => {
  const chapters = { a: { debt: 4000 }, b: { debt: 2000 }, c: { debt: 0 }, d: { debt: null } }
  assert.equal(financialSnapshot(['a', 'b', 'c', 'd'], 2, chapters).debt, 0)
  assert.equal(financialSnapshot(['a', 'b', 'c', 'd'], 0, chapters).debt, 4000)
  assert.equal(financialSnapshot(['a', 'b', 'c', 'd'], 3, chapters).debt, null)
})
test('annual income requires its year and gross/net basis to be shown', () => {
  assert.equal(
    financialSnapshot(['a'], 0, { a: { yearlyIncome: { amount: 50000 } } }).yearlyIncome,
    null,
  )
  assert.deepEqual(
    financialSnapshot(['a'], 0, {
      a: { yearlyIncome: { amount: 50000, year: 2025, basis: 'gross' } },
    }).yearlyIncome,
    { amount: 50000, year: 2025, basis: 'gross' },
  )
})
