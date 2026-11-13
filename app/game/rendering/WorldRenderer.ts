import { Application, Container, Rectangle } from 'pixi.js'
import { BuildingActivityScene } from './scenes/BuildingActivityScene'
import { CampsiteScene } from './scenes/CampsiteScene'
import { FirstLinesScene } from './scenes/FirstLinesScene'
import { FootstepScene } from './scenes/FootstepScene'
import { tapTarget } from './interactions'
import { AtmosphereScene } from './scenes/AtmosphereScene'
import { TerrainScene } from './scenes/TerrainScene'
import { SkillsRoadScene } from './scenes/SkillsRoadScene'
import { BuildingSprite } from './sprites/BuildingSprite'
import { LevelEntranceScene } from './scenes/LevelEntranceScene'
import { isBuilding } from '../../content/buildings'
import { doorOpenness } from '../core/buildingVisit'

import { CharacterSprite } from './sprites/CharacterSprite'
import { ComputerSprite } from './sprites/ComputerSprite'

import { terrainHeight, cameraTarget } from '../core/physics'
import type { ActivitySystem } from '../engine/ActivitySystem'
import type { RendererCallbacks, SceneEntry, WorldFrame, WorldModel } from './types'
export class WorldRenderer {
  readonly app = new Application()
  private gates = new LevelEntranceScene()
  private dust = new FootstepScene()
  private activitiesByScene = new Map<string, BuildingActivityScene>()
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
  private lastReadout = -1000
  private zoom = 1
  private viewCamera = 0
  private initialized = false
  private presentationProgress = 0
  private presentationActive = false
  constructor(
    private host: HTMLElement,
    private model: WorldModel,
    private activities: ActivitySystem,
    private callbacks: RendererCallbacks,
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
    this.app.renderer.events.autoPreventDefault = false
    this.app.canvas.style.touchAction = 'pan-y pinch-zoom'
    this.app.stage.addChild(this.atmosphere, this.world)
    this.world.addChild(
      this.terrain,
      this.gates,
      this.scenery,
      this.dust,
      this.character,
      this.gates.foreground,
    )
    this.terrain.build(this.model)
    this.gates.build(this.model)
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
    this.gates.build(model)
    for (const sprite of this.scenes.values()) sprite.destroy({ children: true })
    this.scenes.clear()
    this.activitiesByScene.clear()
  }
  private makeScene(entry: SceneEntry) {
    const id = entry.event.id
    if (isBuilding(id))
      return new BuildingSprite(
        entry.event,
        () => this.callbacks.details(entry.index),
        this.model.locale,
      )
    if (id === 'skills-road')
      return new SkillsRoadScene(
        this.activities,
        (name, count) => this.callbacks.skill(name, count),
        this.model.locale,
      )
    if (id === 'navel-development') return new ComputerSprite(this.model.slides, this.model.locale)
    if (id === 'contact') return new CampsiteScene(this.model.locale)
    return new FirstLinesScene()
  }
  render(frame: WorldFrame) {
    if (this.disposed || !this.app.renderer) return
    this.presentationProgress = frame.presentation.progress
    this.presentationActive = frame.presentation.active
    const width = this.app.screen.width,
      height = this.app.screen.height,
      base = height - frame.groundInset,
      dt = this.previous ? Math.min(0.2, (frame.time - this.previous) / 1000) : 0
    this.previous = frame.time
    this.activities.tick(dt, frame.paused)
    const computerView =
      frame.presentation.active ||
      (frame.activeId === 'navel-development' &&
        Math.abs(frame.motion.x - (frame.presentation.center - 360)) < 210 &&
        !frame.navigating)
    const campView = frame.activeId === 'contact' && width < 700
    const targetZoom = computerView
      ? Math.min(frame.scale, (width - 24) / 820)
      : campView
        ? Math.min(frame.scale, (width - 24) / 800)
        : isBuilding(frame.activeId)
          ? Math.min(frame.scale, Math.max(0.6, (height - frame.groundInset - 125) / 290))
          : frame.scale
    const targetCamera = computerView
      ? frame.presentation.center + 15 - width / (2 * targetZoom)
      : Math.max(
          0,
          Math.min(
            this.model.width - width / targetZoom,
            frame.motion.x - (width / targetZoom) * (campView ? 0.65 : width < 700 ? 0.5 : 0.38),
          ),
        )
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
        this.activitiesByScene.delete(id)
      }
    for (const entry of visible) {
      let node = this.scenes.get(entry.event.id)
      if (!node) {
        node = this.makeScene(entry)
        if (node instanceof ComputerSprite)
          tapTarget(
            node,
            () =>
              this.presentationActive
                ? this.callbacks.seek(
                    Math.min(1, this.presentationProgress + 1 / this.model.slides.length),
                  )
                : this.callbacks.startComputer(),
            new Rectangle(-296, -354, 662, 244),
          )
        if (node instanceof BuildingSprite) {
          const activity = new BuildingActivityScene(
            entry.event.id,
            this.activities,
            this.model.locale,
          )
          node.addChild(activity)
          this.activitiesByScene.set(entry.event.id, activity)
        }
        this.scenes.set(entry.event.id, node)
        this.scenery.addChild(node)
      }
      node.position.set(entry.x, -terrainHeight(entry.x, this.model.geometry.terrain))
      if (node instanceof SkillsRoadScene)
        node.update(
          frame,
          terrainHeight(entry.x, this.model.geometry.terrain),
          this.reduced,
          this.model.geometry.terrain ?? [],
        )
      if (node instanceof ComputerSprite)
        node.update(
          frame.presentation.progress,
          this.zoom,
          frame.presentation.active,
          frame.time,
          this.reduced,
        )
      if (node instanceof BuildingSprite)
        node.update(
          frame.time,
          Math.max(
            frame.visit.index === entry.index ? doorOpenness(frame.visit) : 0,
            entry.event.id === 'fletcher' &&
              this.activities.actions.fletcher?.running &&
              this.activities.actions.fletcher.age > 2 &&
              this.activities.actions.fletcher.age < 3.8
              ? 1
              : 0,
          ),
          this.reduced,
          width < 700,
        )
    }
    for (const [id, activity] of this.activitiesByScene) {
      const entry = this.model.entries.find((e) => e.event.id === id)
      if (entry) activity.update(frame, entry.x, this.reduced)
    }
    for (const scene of this.scenes.values())
      if (scene instanceof CampsiteScene) scene.update(frame, this.reduced)
      else if (scene instanceof FirstLinesScene) scene.update(frame.time, this.reduced)
    this.terrain.update(frame.time, this.reduced)
    this.dust.update(frame, this.model, this.reduced)
    this.character.update(
      { ...frame, running: frame.running && !frame.presentation.active },
      this.model,
    )
    this.app.render()
    if (frame.time - this.lastReadout >= 100) {
      this.lastReadout = frame.time
      this.app.canvas.dataset.playerX = frame.motion.x.toFixed(1)
      this.app.canvas.dataset.playerY = frame.motion.y.toFixed(1)
      this.app.canvas.dataset.scene = frame.activeId
      this.app.canvas.dataset.actions = JSON.stringify(
        Object.fromEntries(
          Object.entries(this.activities.actions).map(([id, s]) => [
            id,
            { age: s.age, running: s.running, completed: s.completed },
          ]),
        ),
      )
      this.app.canvas.dataset.skillCount = String(this.activities.exploredSkills.length)
      this.app.canvas.dataset.visit = frame.visit.phase
      this.app.canvas.dataset.presentation = frame.presentation.progress.toFixed(3)
    }
  }
  destroy() {
    this.disposed = true
    this.observer?.disconnect()
    if (this.app.renderer) this.app.destroy(true, { children: true })
  }
}
