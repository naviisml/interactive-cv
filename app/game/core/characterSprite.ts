export type CharacterAction = 'idle' | 'walk' | 'run' | 'climb' | 'jump' | 'fall' | 'slide'
export const SPRITE_WIDTH = 32,
  SPRITE_HEIGHT = 64,
  SPRITE_FRAMES = 32
export function spriteFrame(action: CharacterAction, phase: number): number {
  const frame = Math.max(0, Math.floor(phase))
  switch (action) {
    case 'walk':
      return 1 + (frame % 12)
    case 'run':
      return 20 + (frame % 12)
    case 'climb':
      return 15 + (frame % 4)
    case 'jump':
      return 13
    case 'fall':
      return 14
    case 'slide':
      return 19
    default:
      return 0
  }
}
