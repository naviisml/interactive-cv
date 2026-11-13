/**
 * Coordinates are local to each chapter's scene; proximity uses the same world
 * units as movement, never the current camera zoom or screen size.
 */
export type WorldCueAction =
  | 'enter'
  | 'first-code'
  | 'projects'
  | 'basketball'
  | 'luggage'
  | 'departure'
  | 'camera'
  | 'circuit'
  | 'rover'
  | 'skill-0'
  | 'skill-1'
  | 'skill-2'
  | 'tent'
  | 'fire'
  | 'lantern'

export interface WorldCueSpec {
  key: string
  action: WorldCueAction
  x: number
  y: number
  radius: number
  popupOffset?: number
  title: { en: string; nl: string }
  hint: { en: string; nl: string }
}

const cue = (
  key: string,
  action: WorldCueAction,
  x: number,
  y: number,
  en: string,
  nl: string,
  hintEn = 'Tap or press E',
  hintNl = 'Tik of druk op E',
  radius = 170,
): WorldCueSpec => ({
  key, action, x, y, radius,
  title: { en, nl },
  hint: { en: hintEn, nl: hintNl },
})

export function cuesForScene(id: string): WorldCueSpec[] {
  if (id === 'first-lines') return [cue('computer', 'first-code', 153, -145, 'Explore the computer', 'Open de computer', 'Edit the first HTML & CSS', 'Bewerk de eerste HTML & CSS', 220)]
  if (id === 'navel-development') return [cue('projects', 'projects', 20, -210, 'Explore my projects', 'Bekijk mijn projecten', 'Tap screen or press E', 'Tik op scherm of druk op E', 300)]
  if (id === 'skills-road')
    return [
      cue('tooling', 'skill-0', -440, -185, 'Build a deployment', 'Bouw een deployment', 'Use the four pipeline steps', 'Gebruik de vier pipelinestappen', 150),
      cue('web', 'skill-1', 0, -185, 'Change the live page', 'Pas de livepagina aan', 'Tap a technology or screen', 'Tik op een technologie of scherm', 150),
      cue('cloud', 'skill-2', 440, -185, 'Scale the workers', 'Schaal de workers', 'Tap a server rack', 'Tik op een serverrack', 150),
    ].map((item) => ({ ...item, popupOffset: 166 }))
  if (id === 'contact')
    return [
      cue('tent', 'tent', -355, -100, 'Open the tent', 'Open de tent', 'Tap to unzip', 'Tik om te openen', 120),
      cue('campfire', 'fire', 5, -34, 'Stoke the fire', 'Voed het kampvuur', 'Tap the flames', 'Tik op de vlammen', 130),
      cue('lantern', 'lantern', 255, -85, 'Switch the lantern', 'Schakel de lantaarn', 'Tap the lantern', 'Tik op de lantaarn', 130),
    ]
  const door = cue('door', 'enter', 0, -52, 'Enter building', 'Ga naar binnen', 'Tap doorway or press E', 'Tik op deur of druk op E', 175)
  const actions: Record<string, WorldCueSpec> = {
    'panta-rhei': cue('ball', 'basketball', 65, -35, 'Take a shot', 'Gooi op de basket', 'Hold the ball, then release', 'Houd de bal vast en laat los', 160),
    'roc-hilversum': cue('cables', 'circuit', 410, -145, 'Power the campus', 'Verlicht de campus', 'Tap cables to rotate', 'Tik op kabels om te draaien', 240),
    'coding-college': cue('rover', 'rover', 410, -140, 'Program the rover', 'Programmeer de rover', 'Build a route through the gaps', 'Bouw een route over de gaten', 240),
    'fletcher': cue('bell', 'luggage', 182, -62, 'Ring the bell', 'Laat de bel klinken', 'Tap the bell or press E', 'Tik op de bel of druk op E', 150),
    'get-e': cue('plane', 'departure', 130, -45, 'Launch the aircraft', 'Laat het vliegtuig opstijgen', 'Hold to build power, release', 'Houd vast voor vermogen, laat los', 180),
    'appjection': cue('car', 'camera', 70, -40, 'Try the speed camera', 'Test de flitspaal', 'Hold the car, release near 50 km/h', 'Houd de auto vast, laat los rond 50 km/u', 180),
  }
  return actions[id] ? [door, actions[id]] : []
}

export interface CueCandidate {
  id: string
  distance: number
  radius: number
  hovered?: boolean
}

/** Only one tooltip can be in focus; a pointer hover takes precedence over proximity. */
export function selectWorldCue(candidates: CueCandidate[]): string | undefined {
  const eligible = candidates.filter((c) => c.hovered || c.distance <= c.radius)
  eligible.sort((a, b) =>
    Number(!!b.hovered) - Number(!!a.hovered) || a.distance - b.distance,
  )
  return eligible[0]?.id
}
