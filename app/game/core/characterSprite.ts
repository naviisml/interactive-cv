/** Offline atlas contract. Every action owns complete frames with the same foot pivot. */
export const SPRITE_WIDTH = 48,
  SPRITE_HEIGHT = 96
export const characterClips = {
  idle: { start: 0, frames: 6, fps: 5 },
  walk: { start: 6, frames: 12, fps: 12 },
  run: { start: 18, frames: 12, fps: 17 },
  climb: { start: 30, frames: 8, fps: 10 },
  jump: { start: 38, frames: 2, fps: 8 },
  fall: { start: 40, frames: 2, fps: 6 },
  slide: { start: 42, frames: 2, fps: 6 },
  crouch: { start: 44, frames: 4, fps: 8 },
  dance: { start: 48, frames: 12, fps: 10 },
  enter: { start: 60, frames: 6, fps: 9 },
} as const
export type CharacterAction = keyof typeof characterClips
export const SPRITE_FRAMES = 66
export function spriteFrame(action: CharacterAction, phase: number) {
  const clip = characterClips[action]
  return clip.start + (Math.max(0, Math.floor(phase)) % clip.frames)
}
