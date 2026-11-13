import { Application, Container } from 'pixi.js'
import { AtmosphereScene } from './scenes/AtmosphereScene'
import { TerrainScene } from './scenes/TerrainScene'
import { SkillsRoadScene } from './scenes/SkillsRoadScene'
import { PortalScene } from './scenes/PortalScene'
import { SchoolScene } from './scenes/SchoolScene'
import { CharacterSprite } from './sprites/CharacterSprite'
import { ScenerySprite } from './sprites/ScenerySprite'
import { ComputerSprite } from './sprites/ComputerSprite'
import { CompanySign } from './sprites/CompanySign'
import { terrainHeight } from '../core/physics'
import type { ActivitySystem } from '../engine/ActivitySystem'
import type { WorldFrame, WorldModel } from './types'
export class WorldRenderer {
  readonly app = new Application()
  private world = new Container()
  private scenery = new Container()
  private atmosphere = new AtmosphereScene()
  private terrain = new TerrainScene()
  private character = new CharacterSprite()
  private scenes = new Map<string, Container>()
  private observer?: ResizeObserver
  private disposed = false
  private reduced = false
  private previous = 0
  private zoom = 1
  private viewCamera = 0
  private initialized = false
  private unlocked = false
  constructor(
    private host: HTMLElement,
    private model: WorldModel,
    private activities: ActivitySystem,
    private unlock: () => void,
  ) {}
  async init() {
    await this.app.init({
      width: this.host.clientWidth,
      height: this.host.clientHeight,
      backgroundAlpha: 0,
      antialias: false,
      resolution: Math.min(devicePixelRatio, 2),
      autoDensity: true,
      autoStart: false,
      preference: 'webgl',
    })
    if (this.disposed) {
      this.app.destroy(true, { children: true })
      return
    }
    this.host.appendChild(this.app.canvas)
    this.app.canvas.setAttribute('aria-label', 'Playable portfolio world')
    this.app.canvas.dataset.renderer = 'pixi'
    this.app.stage.addChild(this.atmosphere, this.world)
    this.world.addChild(this.terrain, this.scenery, this.character)
    this.terrain.build(this.model)
    await this.character.load()
    if (this.disposed) return
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    this.observer = new ResizeObserver(() =>
      this.app.renderer.resize(this.host.clientWidth, this.host.clientHeight),
    )
    this.observer.observe(this.host)
  }
  setModel(model: WorldModel) {
    this.model = model
    this.terrain.build(model)
    for (const sprite of this.scenes.values()) sprite.destroy({ children: true })
    this.scenes.clear()
  }
  private makeScene(id: string) {
    if (id === 'gmodstore') return new PortalScene()
    if (id === 'skills-road') return new SkillsRoadScene()
    if (id === 'navel-development') return new ComputerSprite(this.model.slides)
    if (['panta-rhei', 'roc-hilversum', 'coding-college'].includes(id)) return new SchoolScene(id)
    const sprite = new ScenerySprite()
    void sprite.load(id)
    return sprite
  }
  render(frame: WorldFrame) {
    if (this.disposed || !this.app.renderer) return
    const width = this.app.screen.width,
      height = this.app.screen.height,
      base = height - frame.groundInset,
      dt = this.previous ? Math.min(0.2, (frame.time - this.previous) / 1000) : 0
    this.previous = frame.time
    const targetZoom = frame.presentation.active
      ? Math.min(frame.scale, (width - 24) / 820)
      : frame.scale
    const targetCamera = frame.presentation.active
      ? frame.presentation.center + 15 - width / (2 * targetZoom)
      : frame.camera
    if (!this.initialized) {
      this.zoom = targetZoom
      this.viewCamera = targetCamera
      this.initialized = true
    }
    const ease = this.reduced ? 1 : 1 - Math.exp(-7 * dt)
    this.zoom += (targetZoom - this.zoom) * ease
    this.viewCamera += (targetCamera - this.viewCamera) * ease
    this.atmosphere.resize(width, base)
    this.atmosphere.update(frame, this.reduced)
    this.world.scale.set(this.zoom)
    this.world.position.set(-this.viewCamera * this.zoom, base + frame.cameraY * this.zoom)
    const entry = this.model.entries.find((entry) => entry.event.id === frame.activeId)
    this.activities.update(
      frame,
      entry,
      dt,
      entry ? terrainHeight(entry.x, this.model.geometry.terrain) : 0,
      frame.navigating,
    )
    if (this.activities.runes.length === 3 && !this.unlocked) {
      this.unlocked = true
      this.unlock()
    }
    const visible = this.model.entries.filter(
      (entry) =>
        entry.x + (entry.event.span ?? 920) / 2 > this.viewCamera - 400 &&
        entry.x - (entry.event.span ?? 920) / 2 < this.viewCamera + width / this.zoom + 400,
    )
    const ids = new Set(visible.map((entry) => entry.event.id))
    for (const [id, node] of this.scenes)
      if (!ids.has(id)) {
        node.destroy({ children: true })
        this.scenes.delete(id)
      }
    for (const entry of visible) {
      let node = this.scenes.get(entry.event.id)
      if (!node) {
        node = this.makeScene(entry.event.id)
        if (
          (entry.event.category === 'work' || entry.event.category === 'projects') &&
          entry.event.id !== 'first-lines'
        ) {
          const sign = new CompanySign(entry.event)
          sign.x = entry.event.id === 'navel-development' ? -395 : -320
          sign.y =
            terrainHeight(entry.x, this.model.geometry.terrain) -
            terrainHeight(entry.x + sign.x, this.model.geometry.terrain)
          node.addChild(sign)
        }
        this.scenes.set(entry.event.id, node)
        this.scenery.addChild(node)
      }
      node.position.set(entry.x, -terrainHeight(entry.x, this.model.geometry.terrain))
      if (node instanceof SkillsRoadScene) node.update(frame.motion.x, frame.time, this.reduced)
      if (node instanceof ComputerSprite) node.update(frame.presentation.progress, this.zoom)
      if (node instanceof PortalScene) node.update(this.activities, frame.time, this.reduced)
      if (node instanceof SchoolScene) node.update(this.activities)
    }
    this.character.update(
      { ...frame, running: frame.running && !frame.presentation.active },
      this.model,
    )
    this.app.render()
    if (frame.time % 100 < 20) {
      this.app.canvas.dataset.playerX = frame.motion.x.toFixed(1)
      this.app.canvas.dataset.playerY = frame.motion.y.toFixed(1)
      this.app.canvas.dataset.scene = frame.activeId
      this.app.canvas.dataset.presentation = frame.presentation.progress.toFixed(3)
    }
  }
  destroy() {
    this.disposed = true
    this.observer?.disconnect()
    if (this.app.renderer) this.app.destroy(true, { children: true })
  }
}
