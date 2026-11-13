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
import { circuitConnected, pipelineSteps } from '../core/learningActivities'
import { cuesForScene, selectWorldCue, type WorldCueAction } from '../core/worldCues'
import { WorldInteractionCue } from './WorldInteractionCue'
import { skillGroups } from '../../content/skills'
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
  private cues = new Map<string, { node: WorldInteractionCue; entry: SceneEntry }>()
  private currentCue?: { action: WorldCueAction; entry: SceneEntry }
  private pointer?: { x: number; y: number }
  private movePointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
      this.pointer = undefined
      return
    }
    const bounds = this.host.getBoundingClientRect()
    this.pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
  }
  private leavePointer = () => { this.pointer = undefined }
  private observer?: ResizeObserver
  private disposed = false
  private reduced = false
  private motionQuery?: MediaQueryList
  private motionPreference = () => {
    this.reduced = this.motionQuery?.matches ?? false
    this.dirty = true
  }
  private dirty = true
  private frozen = false
  private cancelCharges = () => this.activities.cancelCharges()
  private visibilityChanged = () => {
    if (document.hidden) this.cancelCharges()
  }
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
    this.host.addEventListener('pointermove', this.movePointer)
    this.host.addEventListener('pointerleave', this.leavePointer)
    window.addEventListener('blur', this.cancelCharges)
    document.addEventListener('visibilitychange', this.visibilityChanged)
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
    this.motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
    this.motionPreference()
    this.motionQuery.addEventListener('change', this.motionPreference)
    this.observer = new ResizeObserver(() => {
      this.app.renderer.resize(this.host.clientWidth, this.host.clientHeight)
      this.dirty = true
    })
    this.observer.observe(this.host)
  }
  setModel(model: WorldModel) {
    this.activities.cancelCharges()
    this.dirty = true
    this.model = model
    this.terrain.build(model)
    this.gates.build(model)
    for (const sprite of this.scenes.values()) sprite.destroy({ children: true })
    this.scenes.clear()
    this.cues.clear()
    this.currentCue = undefined
    this.activitiesByScene.clear()
  }
  private makeScene(entry: SceneEntry) {
    const id = entry.event.id
    if (isBuilding(id))
      return new BuildingSprite(
        entry.event,
        () => {
          this.activities.markCueUsed(id, 'door')
          this.callbacks.details(entry.index)
        },
        this.model.locale,
      )
    if (id === 'skills-road')
      return new SkillsRoadScene(
        this.activities,
        (name, count) => this.callbacks.skill(name, count),
        this.model.locale,
        (index) => this.activities.markCueUsed(id, ['tooling', 'web', 'cloud'][index]!),
      )
    if (id === 'navel-development') return new ComputerSprite(this.model.slides, this.model.locale)
    if (id === 'contact')
      return new CampsiteScene(this.model.locale, (action) =>
        this.activities.markCueUsed(id, action === 'fire' ? 'campfire' : action))
    return new FirstLinesScene(() => {
      this.activities.markCueUsed(id, 'computer')
      this.callbacks.openFirstComputer()
    })
  }
  /** Keyboard action follows whichever object is highlighted in the scene. */
  interactNearest() {
    const target = this.currentCue
    if (!target) return false
    const { action, entry } = target
    const id = entry.event.id
    const spec = cuesForScene(id).find((cue) => cue.action === action)
    if (spec) this.activities.markCueUsed(id, spec.key)
    if (action === 'enter') this.callbacks.details(entry.index)
    else if (action === 'first-code') this.callbacks.openFirstComputer()
    else if (action === 'projects') this.callbacks.startComputer()
    else if (action === 'luggage') this.activities.trigger(id, 'luggage')
    else if (action === 'basketball') this.activities.trigger(id, 'basketball', 0.65)
    else if (action === 'departure') this.activities.trigger(id, 'departure', 0.85)
    else if (action === 'camera') this.activities.trigger(id, 'camera', 0.36)
    else if (action === 'circuit') this.activities.circuit[0] = (this.activities.circuit[0]! + 1) % 4
    else if (action === 'rover') this.activities.rover.commands.length
      ? this.activities.runRover()
      : this.activities.editRover('step')
    else if (action.startsWith('skill-')) {
      const index = Number(action.slice(6))
      if (this.activities.activateSkillGroup(index)) {
        const group = skillGroups[index]
        if (group) this.callbacks.skill(group.title[this.model.locale === 'nl' ? 'nl' : 'en'], this.activities.exploredSkills.length)
      }
    } else {
      const camp = this.scenes.get('contact')
      if (camp instanceof CampsiteScene) camp.interact(action)
    }
    return true
  }
  private drawCues(frame: WorldFrame, base: number, width: number, height: number) {
    const candidates: { id: string; distance: number; radius: number; hovered: boolean }[] = []
    const positions = new Map<string, { screenX: number; screenY: number; near: boolean }>()
    for (const [id, { node, entry }] of this.cues) {
      const x = entry.x + node.spec.x
      const ground = terrainHeight(entry.x, this.model.geometry.terrain)
      const localSlope =
        entry.event.id === 'skills-road'
          ? ground - terrainHeight(x, this.model.geometry.terrain)
          : 0
      const actionPoint =
        this.activitiesByScene.get(entry.event.id)?.focusPoint() 
      const dynamic = actionPoint && node.spec.key !== 'door' ? actionPoint : undefined
      node.position.set(dynamic?.x ?? node.spec.x, (dynamic?.y ?? node.spec.y) + localSlope)
      const projectedX = (entry.x + node.x - this.viewCamera) * this.zoom
      const projectedY = base + (frame.cameraY - ground + node.y) * this.zoom
      const visible =
        projectedX > 28 && projectedX < width - 28 &&
        projectedY > 24 && projectedY < height - 20
      const distance = Math.abs(frame.motion.x - (entry.x + node.x))
      const hovered = !!this.pointer && visible &&
        Math.hypot(this.pointer.x - projectedX, this.pointer.y - projectedY) < 48
      const used = this.activities.wasCueUsed(entry.event.id, node.spec.key)
      const near = !used && visible && (hovered || distance < node.spec.radius)
      positions.set(id, { screenX: projectedX, screenY: projectedY, near })
      if (near) candidates.push({ id, distance, radius: node.spec.radius, hovered })
    }
    const selected = frame.visit.phase === 'outside' && !frame.paused
      ? selectWorldCue(candidates)
      : undefined
    // Only the selected, never-used prop illuminates. No free-standing rings.
    for (const [id, sprite] of this.scenes) {
      if (sprite instanceof BuildingSprite)
        sprite.setEntranceHighlight(selected === id + ':door',
          selected === id + ':door', frame.time, this.reduced)
      else if (sprite instanceof FirstLinesScene)
        sprite.setInteractionGlow(selected === id + ':computer', frame.time, this.reduced)
      else if (sprite instanceof ComputerSprite)
        sprite.setInteractionGlow(selected === id + ':projects', frame.time, this.reduced)
      else if (sprite instanceof SkillsRoadScene)
        sprite.setInteractionGlow(
          selected === id + ':tooling' ? 0 :
          selected === id + ':web' ? 1 :
          selected === id + ':cloud' ? 2 : undefined,
          frame.time, this.reduced)
      else if (sprite instanceof CampsiteScene)
        sprite.setInteractionGlow(
          selected === id + ':tent' ? 'tent' :
          selected === id + ':campfire' ? 'fire' :
          selected === id + ':lantern' ? 'lantern' : undefined,
          frame.time, this.reduced)
    }
    for (const [id, activity] of this.activitiesByScene) {
      const selectedActivity = selected?.startsWith(id + ':') &&
        selected !== id + ':door'
      activity.setInteractionGlow(!!selectedActivity, frame.time, this.reduced)
    }
    const picked = selected ? this.cues.get(selected) : undefined
    this.currentCue = picked ? { entry: picked.entry, action: picked.node.spec.action } : undefined
    const nl = this.model.locale === 'nl'
    for (const [id, { node, entry }] of this.cues) {
      const p = positions.get(id)!
      const selectedThis = selected === id
      const record = this.activities.actions[entry.event.id]
      let feedback: string | undefined
      if (node.spec.key !== 'door' && record && (record.running || record.completed)) {
        if (record.running) feedback = nl ? 'Bezig…' : 'In progress…'
        else if (record.outcome === 'retry' || record.outcome === 'ticket')
          feedback = nl ? 'Probeer opnieuw' : 'Try again'
        else feedback = entry.event.id === 'fletcher'
          ? (nl ? 'Bagage bezorgd · bel opnieuw' : 'Delivered · ring again')
          : (nl ? 'Geslaagd · probeer opnieuw' : 'Completed · try again')
      }
      if (entry.event.id === 'skills-road') {
        if (node.spec.key === 'tooling') {
          const pipeline = this.activities.pipeline
          feedback = pipeline.status === 'success'
            ? (nl ? 'Pipeline geslaagd · deployed' : 'Pipeline passed · deployed')
            : pipeline.status === 'error'
              ? (nl ? 'Verkeerde volgorde · opnieuw' : 'Wrong order · retry')
              : pipeline.completed > 0
                ? `${pipeline.completed}/4 · ${pipelineSteps[pipeline.completed] ?? 'deploy'}`
                : undefined
        } else if (node.spec.key === 'web' && (this.activities.web.records || this.activities.web.theme)) {
          feedback = nl ? 'Live pagina bijgewerkt' : 'Live page updated'
        } else if (node.spec.key === 'cloud' && this.activities.actions['skill-systems']) {
          feedback = `${nl ? 'Wachtrij' : 'Queue'} ${Math.ceil(this.activities.cloud.queued)} · ${this.activities.cloud.workers} workers`
        }
      }
      // Keep the whole 238-world-unit tooltip visible at every camera zoom.
      const halfBubble = Math.min(width / 2, 119 * this.zoom + 14)
      const safeX = Math.max(halfBubble, Math.min(width - halfBubble, p.screenX))
      const popupOffset = node.spec.popupOffset ?? 106
      const top = p.screenY - (popupOffset + 27) * this.zoom
      const pushDown = Math.max(0, (16 - top) / this.zoom)
      node.update(frame.time, p.near && frame.visit.phase === 'outside', selectedThis, this.reduced,
        feedback, (safeX - p.screenX) / this.zoom, pushDown)
    }
    if (frame.paused) this.currentCue = undefined
    this.app.canvas.dataset.cue = this.currentCue
      ? `${this.currentCue.entry.event.id}:${picked!.node.spec.key}` : ''
  }
  render(frame: WorldFrame) {
    if (this.disposed || !this.app.renderer) return
    if (frame.paused) this.activities.cancelCharges()
    // Keep drawing entry/exit animations, but retain the GPU frame behind a
    // stationary dialog. A resize, locale or motion preference invalidates it.
    const freeze = frame.paused && ['outside', 'inside'].includes(frame.visit.phase)
    if (freeze && this.frozen && !this.dirty) {
      this.previous = frame.time
      return
    }
    this.frozen = freeze
    this.dirty = false
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
    const closeView =
      width < 700 &&
      (isBuilding(frame.activeId) ||
        frame.activeId === 'skills-road' ||
        frame.activeId === 'first-lines')
    const firstEntry = this.model.entries.find((entry) => entry.event.id === 'first-lines')
    const introView =
      frame.activeId === 'first-lines' && frame.motion.x < (firstEntry?.x ?? 780) - 250
    const portraitAnchor = introView
      ? 0.22
      : frame.activeId === 'skills-road'
        ? 0.5
        : ['roc-hilversum', 'coding-college'].includes(frame.activeId)
          ? 0.18
          : 0.32
    const targetZoom = introView
      ? 0.82
      : closeView
        ? Math.max(
            0.78,
            Math.min(
              isBuilding(frame.activeId) ? 0.9 : 1.1,
              (height - frame.groundInset - 148) / 300,
            ),
          )
        : computerView
          ? Math.min(frame.scale, (width - 24) / 675)
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
            frame.motion.x -
              (width / targetZoom) * (campView ? 0.65 : closeView ? portraitAnchor : 0.38),
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
    this.gates.update(frame, this.reduced)
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
        for (const key of this.cues.keys())
          if (key.startsWith(id + ':')) this.cues.delete(key)
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
                : (this.activities.markCueUsed(entry.event.id, 'projects'), this.callbacks.startComputer()),
            new Rectangle(-296, -354, 662, 244),
          )
        if (node instanceof BuildingSprite) {
          const activity = new BuildingActivityScene(
            entry.event.id,
            this.activities,
            this.model.locale,
            () => {
              const prop = cuesForScene(entry.event.id).find((cue) => cue.key !== 'door')
              if (prop) this.activities.markCueUsed(entry.event.id, prop.key)
            },
          )
          node.addChild(activity)
          this.activitiesByScene.set(entry.event.id, activity)
        }
        this.scenes.set(entry.event.id, node)
        this.scenery.addChild(node)
        for (const spec of cuesForScene(entry.event.id)) {
          const interaction = new WorldInteractionCue(spec, this.model.locale === 'nl' ? 'nl' : 'en')
          node.addChild(interaction)
          this.cues.set(entry.event.id + ':' + spec.key, { node: interaction, entry })
        }
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
          entry.event.id === 'roc-hilversum'
            ? circuitConnected(this.activities.circuit)
            : entry.event.id === 'coding-college' && this.activities.rover.status === 'success',
        )
    }
    for (const [id, activity] of this.activitiesByScene) {
      const entry = this.model.entries.find((e) => e.event.id === id)
      if (entry)
        activity.update(
          frame,
          entry.x,
          this.reduced,
          terrainHeight(entry.x, this.model.geometry.terrain),
        )
    }
    for (const scene of this.scenes.values())
      if (scene instanceof CampsiteScene) scene.update(frame, this.reduced)
      else if (scene instanceof FirstLinesScene) scene.update(frame.time, this.reduced)
    this.drawCues(frame, base, width, height)
    this.terrain.update(frame.time, this.reduced)
    this.dust.update(frame, this.model, this.reduced)
    this.character.update(
      { ...frame, running: frame.running && !frame.presentation.active },
      this.model,
    )
    this.app.render()
    if (freeze || frame.time - this.lastReadout >= 100) {
      this.lastReadout = frame.time
      this.app.canvas.dataset.viewScale = this.zoom.toFixed(4)
      this.app.canvas.dataset.viewCamera = this.viewCamera.toFixed(2)
      this.app.canvas.dataset.entryPositions = JSON.stringify(
        Object.fromEntries(
          this.model.entries.map((entry) => [
            entry.event.id,
            {
              x: entry.x,
              ground:
                base +
                (frame.cameraY - terrainHeight(entry.x, this.model.geometry.terrain)) * this.zoom,
            },
          ]),
        ),
      )
      this.app.canvas.dataset.renderedAt = frame.time.toFixed(1)
      this.app.canvas.dataset.charges = JSON.stringify(this.activities.charges)
      this.app.canvas.dataset.navigating = String(frame.navigating)
      this.app.canvas.dataset.usedCues = JSON.stringify([...this.activities.usedCues])
      this.app.canvas.dataset.playerX = frame.motion.x.toFixed(1)
      this.app.canvas.dataset.playerY = frame.motion.y.toFixed(1)
      this.app.canvas.dataset.scene = frame.activeId
      this.app.canvas.dataset.actions = JSON.stringify(
        Object.fromEntries(
          Object.entries(this.activities.actions).map(([id, s]) => [
            id,
            {
              age: s.age,
              running: s.running,
              completed: s.completed,
              outcome: s.outcome,
              successes: s.successes,
            },
          ]),
        ),
      )
      this.app.canvas.dataset.pipeline = JSON.stringify(this.activities.pipeline)
      this.app.canvas.dataset.workerQueue = JSON.stringify(this.activities.cloud)
      this.app.canvas.dataset.webPage = JSON.stringify(this.activities.web)
      this.app.canvas.dataset.circuit = JSON.stringify(this.activities.circuit)
      this.app.canvas.dataset.rover = JSON.stringify(this.activities.rover)
      this.app.canvas.dataset.skillCount = String(this.activities.exploredSkills.length)
      this.app.canvas.dataset.visit = frame.visit.phase
      this.app.canvas.dataset.presentation = frame.presentation.progress.toFixed(3)
    }
  }
  destroy() {
    if (this.disposed) return
    this.disposed = true
    this.activities.cancelCharges()
    this.host.removeEventListener('pointermove', this.movePointer)
    this.host.removeEventListener('pointerleave', this.leavePointer)
    this.cues.clear()
    window.removeEventListener('blur', this.cancelCharges)
    document.removeEventListener('visibilitychange', this.visibilityChanged)
    this.observer?.disconnect()
    this.motionQuery?.removeEventListener('change', this.motionPreference)
    if (this.app.renderer) this.app.destroy(true, { children: true })
  }
}
