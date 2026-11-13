export interface AnnualIncome {
  amount: number
  year: number
  basis: 'gross' | 'net'
}

/** Public historical finances for one timeline event. Omit unknown fields.
 * Explicit null hides a value from this point onwards.
 */
export interface FinancialMetadata {
  featured?: 'debt' | 'savings'
  debt?: number | null
  savings?: number | null
  yearlyIncome?: AnnualIncome | null
  context?: { en: string; nl: string }
}

export interface FinancialSnapshot {
  featured: 'debt' | 'savings'
  debt: number | null
  savings: number | null
  yearlyIncome: AnnualIncome | null
}

const validAmount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

export function financialSnapshot(
  events: readonly { finance?: FinancialMetadata }[],
  index: number,
): FinancialSnapshot {
  const result: FinancialSnapshot = {
    featured: 'debt',
    debt: null,
    savings: null,
    yearlyIncome: null,
  }

  for (const event of events.slice(0, Math.max(0, index + 1))) {
    const data = event.finance
    if (!data) continue
    if (data.featured === 'debt' || data.featured === 'savings')
      result.featured = data.featured

    for (const key of ['debt', 'savings'] as const) {
      if (Object.hasOwn(data, key)) {
        const value = data[key]
        result[key] = validAmount(value) ? value : null
      }
    }

    if (Object.hasOwn(data, 'yearlyIncome')) {
      const value = data.yearlyIncome
      result.yearlyIncome =
        value &&
        validAmount(value.amount) &&
        Number.isInteger(value.year) &&
        value.year >= 1900 &&
        value.year <= 2100 &&
        (value.basis === 'gross' || value.basis === 'net')
          ? value
          : null
    }
  }
  return result
}
