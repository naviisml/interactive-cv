export type HeldControl = 'left' | 'right' | 'up' | 'down' | 'sprint'
export function heldControls(held: Map<number, HeldControl>) {
  const values = [...held.values()]
  const horizontal = values.filter((value) => value === 'left' || value === 'right').at(-1)
  const vertical = values.filter((value) => value === 'up' || value === 'down').at(-1)
  return {
    direction: horizontal === 'left' ? -1 : horizontal === 'right' ? 1 : 0,
    vertical: vertical === 'up' ? -1 : vertical === 'down' ? 1 : 0,
    sprint: values.includes('sprint'),
  }
}
