import type { BuildingVisit } from '../core/buildingVisit'
import type { Motion, WorldGeometry } from '../core/physics'
import type { TimelineEvent } from '../../content/timeline'
export interface SceneEntry {
  event: TimelineEvent & { level?: string }
  index: number
  x: number
}
export interface WorldFrame {
  codeOpen?: boolean
  time: number
  motion: Motion
  camera: number
  cameraY: number
  scale: number
  groundInset: number
  animationFrame: number
  facing: number
  running: boolean
  paused: boolean
  urban: number
  technical: number
  activeId: string
  visit: BuildingVisit
  navigating: boolean
}
export interface WorldModel {
  width: number
  geometry: WorldGeometry
  entries: SceneEntry[]
  locale: string
  tutorial: string
  levelTitles: Record<string, string>
}

export interface RendererCallbacks {
  screen?: (rect: import('../core/monitorSurface').ScreenViewport | null) => void
  openFirstComputer: () => void
  skill: (name: string, count: number) => void
  details: (index: number) => void
}
