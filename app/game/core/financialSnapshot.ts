export interface AnnualIncome {
  amount: number
  year: number
  basis: 'gross' | 'net'
}
export interface FinancialSnapshot {
  featured: 'debt' | 'savings'
  debt: number | null
  savings: number | null
  yearlyIncome: AnnualIncome | null
}
interface ChapterMoney {
  featured?: string
  debt?: number | null
  savings?: number | null
  yearlyIncome?: unknown
}
const validAmount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
export function financialSnapshot(
  ids: string[],
  index: number,
  chapters: Record<string, ChapterMoney>,
): FinancialSnapshot {
  const result: FinancialSnapshot = {
    featured: 'debt',
    debt: null,
    savings: null,
    yearlyIncome: null,
  }
  for (const id of ids.slice(0, Math.max(0, index + 1))) {
    const chapter = chapters[id]
    if (!chapter) continue
    if (chapter.featured === 'debt' || chapter.featured === 'savings')
      result.featured = chapter.featured
    for (const key of ['debt', 'savings'] as const)
      if (Object.hasOwn(chapter, key))
        result[key] = validAmount(chapter[key]) ? chapter[key]! : null
    if (Object.hasOwn(chapter, 'yearlyIncome')) {
      const value = chapter.yearlyIncome as Partial<AnnualIncome> | null
      result.yearlyIncome =
        value &&
        validAmount(value.amount) &&
        Number.isInteger(value.year) &&
        value.year! >= 1900 &&
        value.year! <= 2100 &&
        (value.basis === 'gross' || value.basis === 'net')
          ? (value as AnnualIncome)
          : null
    }
  }
  return result
}
