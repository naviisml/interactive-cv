/**
 * Coordinates are local to each chapter's scene; proximity uses the same world
 * units as movement, never the current camera zoom or screen size.
 */
export type WorldCueAction =
  | 'enter'
  | 'first-code'
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
  | 'email'

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
  key,
  action,
  x,
  y,
  radius,
  title: { en, nl },
  hint: { en: hintEn, nl: hintNl },
})

export function cuesForScene(id: string): WorldCueSpec[] {
  if (id === 'first-lines')
    return [
      {
        ...cue(
          'computer',
          'first-code',
          153,
          -145,
          'Explore the computer',
          'Open de computer',
          'Edit the first HTML & CSS',
          'Bewerk de eerste HTML & CSS',
          220,
        ),
        popupOffset: 154,
      },
    ]
  if (id === 'skills-road')
    return [
      cue(
        'tooling',
        'skill-0',
        -440,
        -185,
        'Build a deployment',
        'Bouw een deployment',
        'Use the four pipeline steps',
        'Gebruik de vier pipelinestappen',
        150,
      ),
      cue(
        'web',
        'skill-1',
        0,
        -185,
        'Change the live page',
        'Pas de livepagina aan',
        'Tap a technology or screen',
        'Tik op een technologie of scherm',
        150,
      ),
      cue(
        'cloud',
        'skill-2',
        440,
        -185,
        'Scale the workers',
        'Schaal de workers',
        'Tap a server rack',
        'Tik op een serverrack',
        150,
      ),
    ].map((item) => ({ ...item, popupOffset: 166 }))
  if (id === 'contact')
    return [
      cue(
        'email',
        'email',
        370,
        -90,
        'Send me an email',
        'Stuur me een e-mail',
        'Tap to open your email app',
        'Tik om je mailapp te openen',
        130,
      ),
      cue(
        'tent',
        'tent',
        -355,
        -100,
        'Open the tent',
        'Open de tent',
        'Tap to unzip',
        'Tik om te openen',
        120,
      ),
      cue(
        'campfire',
        'fire',
        5,
        -34,
        'Stoke the fire',
        'Voed het kampvuur',
        'Tap the flames',
        'Tik op de vlammen',
        130,
      ),
      cue(
        'lantern',
        'lantern',
        255,
        -85,
        'Switch the lantern',
        'Schakel de lantaarn',
        'Tap the lantern',
        'Tik op de lantaarn',
        130,
      ),
    ]
  const door = cue(
    'door',
    'enter',
    0,
    -52,
    'Explore this job',
    'Ontdek deze baan',
    'Enter the door to see my work · Tap or E',
    'Ga naar binnen voor mijn werk · Tik of E',
    225,
  )
  const actions: Record<string, WorldCueSpec> = {
    'panta-rhei': cue(
      'ball',
      'basketball',
      65,
      -35,
      'Take a shot',
      'Gooi op de basket',
      'Hold and drag up/down, release to shoot',
      'Houd vast en sleep omhoog/omlaag',
      160,
    ),
    'roc-hilversum': {
      ...cue(
        'cables',
        'circuit',
        410,
        -145,
        'Power the campus',
        'Verlicht de campus',
        'Tap cables to rotate',
        'Tik op kabels om te draaien',
        240,
      ),
      popupOffset: 158,
    },
    'coding-college': {
      ...cue(
        'rover',
        'rover',
        410,
        -140,
        'Program the rover',
        'Programmeer de rover',
        'Build a route through the gaps',
        'Bouw een route over de gaten',
        240,
      ),
      popupOffset: 158,
    },
    fletcher: cue(
      'bell',
      'luggage',
      182,
      -62,
      'Ring the bell',
      'Laat de bel klinken',
      'Tap the bell or press E',
      'Tik op de bel of druk op E',
      150,
    ),
    'get-e': cue(
      'taxi',
      'departure',
      130,
      -45,
      'Airport pickup',
      'Haal de reiziger op',
      'Tap to replay the transfer',
      'Tik om de transfer te herhalen',
      180,
    ),
    appjection: cue(
      'car',
      'camera',
      225,
      -40,
      'Try the speed camera',
      'Test de flitspaal',
      'Hold the car, release near 50 km/h',
      'Houd de auto vast, laat los rond 50 km/u',
      180,
    ),
  }
  return actions[id]
    ? ['panta-rhei', 'roc-hilversum', 'coding-college'].includes(id)
      ? [actions[id]]
      : [door, actions[id]]
    : []
}

export interface CueCandidate {
  id: string
  distance: number
  radius: number
  hovered?: boolean
}

/** One introductory door takes precedence over nearby props until entered.
 * A deliberate pointer hover still targets the object under the cursor.
 */
export function selectWorldCue(candidates: CueCandidate[], firstDoor?: string): string | undefined {
  const eligible = candidates.filter((c) => c.hovered || c.distance <= c.radius)
  eligible.sort((a, b) => Number(!!b.hovered) - Number(!!a.hovered) || a.distance - b.distance)
  if (
    !eligible[0]?.hovered &&
    firstDoor &&
    eligible.some((cue) => cue.id === firstDoor && cue.distance < 110)
  )
    return firstDoor
  return eligible[0]?.id
}

export function showsWorldHint(scene: string, key: string) {
  // The first job entrance is the only door tutorial; basketball has physical
  // aim dots and a scoreboard rather than repeated instructional bubbles.
  if (key === 'door') return scene === 'fletcher'
  if (scene === 'panta-rhei' && key === 'ball') return false
  return !['contact', 'fletcher', 'get-e', 'appjection'].includes(scene)
}
