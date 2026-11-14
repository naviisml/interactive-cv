export type BuildingKind = 'high-school' | 'college' | 'codam' | 'hotel' | 'airport' | 'mobility'
export const buildings: Record<string, BuildingKind> = {
  'panta-rhei': 'high-school',
  'roc-hilversum': 'college',
  'coding-college': 'codam',
  fletcher: 'hotel',
  'get-e': 'airport',
  appjection: 'mobility',
}
export const isBuilding = (id: string) => id in buildings

export const canEnterBuilding = (id: string) => ['fletcher', 'get-e', 'appjection'].includes(id)
