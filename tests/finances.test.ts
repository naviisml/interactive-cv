import { test } from 'node:test'
import assert from 'node:assert/strict'
import { financialSnapshot } from '../app/game/core/financialSnapshot.ts'

test('history uses event metadata without separate chapter IDs', () => {
  const events = [
    { id: 'early', finance: { debt: 4000, savings: 800 } },
    { id: 'middle', finance: { featured: 'savings' as const } },
    { id: 'now', finance: { debt: 2500 } },
  ]
  const result = financialSnapshot(events, 2)
  assert.equal(result.debt, 2500)
  assert.equal(result.savings, 800)
  assert.equal(result.featured, 'savings')
  assert.equal(financialSnapshot([{}], 0).debt, null)
})

test('null masks private amounts, rewind restores past values, zero stays zero', () => {
  const events = [
    { finance: { debt: 4000 } },
    { finance: { debt: 2000 } },
    { finance: { debt: 0 } },
    { finance: { debt: null, yearlyIncome: null } },
  ]
  assert.equal(financialSnapshot(events, 2).debt, 0)
  assert.equal(financialSnapshot(events, 0).debt, 4000)
  assert.equal(financialSnapshot(events, 3).debt, null)
  assert.equal(financialSnapshot(events, -1).debt, null)
})

test('yearly income needs a valid year and gross/net basis', () => {
  assert.equal(
    financialSnapshot([{ finance: { yearlyIncome: { amount: 50000 } as never } }], 0)
      .yearlyIncome,
    null,
  )
  assert.deepEqual(
    financialSnapshot([
      { finance: { yearlyIncome: { amount: 50000, year: 2025, basis: 'gross' } } },
    ], 0).yearlyIncome,
    { amount: 50000, year: 2025, basis: 'gross' },
  )
})

test('business turnover notes never become personal annual salary', () => {
  const result = financialSnapshot(
    [{ finance: { debt: 0, context: { en: 'Business turnover', nl: 'Omzet' } } }],
    0,
  )
  assert.equal(result.debt, 0)
  assert.equal(result.savings, null)
  assert.equal(result.yearlyIncome, null)
})
