# Navi · A life in progress

A Nuxt 4 playable portfolio with five connected levels: About me, Skills, Work experience, My company & projects, and Contact me. Layered pixel scenery, terrain, optional ladders and slides, keyboard and touch controls, an accessible reading list, and details that open inside the world.

## Run

Use Node 22.12+ or Node 24.

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run generate
```

Static output is `.output/public`. `npm run build` produces a server build.

## Content and levels

`app/data/timeline.ts` holds the real CV events. Content comes from the four-page Figma CV, CV 2026 — Navarone Ismail (`fRNmeTPW9BxYg11rzeDezV`). Each event has a unique ID, category, title, summary, body, label and landmark, with optional role, period, location, tags and attribution.

`app/data/levels.ts` groups those events into the five levels and defines the skill stations. Add a real event to the timeline, then its ID to the appropriate level. Work and company client assignments have separate sections; school stays in About. The full journey is arranged by subject; dates stay visible within each section. Skills list tools from the CV without numerical ratings. Navel Cloud has no date in the source CV and stays labelled Own Product.

The level buttons and footer timeline start an animated run to the chosen stop. Manual input cancels it. Reverse movement bypasses obstacle triggers. Each level has a gateway and its own backdrop treatment. The list tracks reading progress from actual row positions, supports category filtering, and retains a route back into the world.

## Controls and event details

Left/Right or A/D walk. Space jumps. Up/Down or W/S climb nearby ladders; Up/W jumps away from ladders. E opens nearby details. Short milestones and school events show proximity tooltips. Other events open a focused, scrollable panel contained within the world; Escape closes it. Original CV entries also retain direct `/events/[id]` pages.

Horizontal swipes and trackpad scrolling use buffered distance at the same capped physics speed as keyboard input. Releasing a finger clears pending travel. Safari uses a non-passive native touchmove listener with direction locking; vertical starts and pinch zoom remain native. The world pauses while a detail panel, the money information panel, or the list is open.

## Rendering and motion

- `app/composables/physics.ts`: elapsed-time movement, terrain, collisions, climbing and sliding.
- `app/composables/navigation.ts`: continuous destination travel in either direction, with a distance-based duration and terrain sampling.
- `app/data/world.ts`: generates the terrain and optional courses for the current number of events.
- `WorldTerrain.vue` / `WorldCourse.vue`: scenery uses the same geometry as movement; rocks and plants sample the local slope.
- `WorldAtmosphere.vue`: parallax clouds, mountains, forests, city silhouettes and skill circuits. Foreground trunks no longer cover events.
- `PixelCharacter.vue`: one fixed bitmap frame at a time from `public/sprites/navi.png`; walking, running, climbing, jumping, falling, sliding and idle poses. No independently transformed limbs. Reduced motion freezes the frame cycle.

The avatar has dark hair, short facial hair, a black jacket and longer proportions, based on the supplied references. Reference photos are not bundled. Its shadow is a separate world object projected onto the support below the character.

Regenerate the 32-frame atlas with `npm run sprites:generate`. Set `CHARACTER_REVIEW_DIR` to an absolute temporary directory to also generate a contact sheet and walk frames for review. `public/sprites/walk-preview.gif` is a visual animation sample, not a runtime dependency.

The CSS ground datum `--ground-y` anchors the terrain, character and event scenery on all viewport sizes. Camera and position survive client-side navigation through Nuxt state. No persistent database, CMS, analytics or external game engine is included.

## Money through the years

Edit `app/data/finances.json`. Each original CV event ID has debt, savings, a featured balance choice, and yearly income. Amounts use the root currency (EUR). `null` is undisclosed; an omitted field carries the preceding chronological value forward. Income requires amount, year, and gross/net basis. No actual balances have been invented.

The header maps each stop to its original CV snapshot even though the levels reorganize the journey. Skills and contact show no financial snapshot. The information panel explains the counters and links to support resources for the Netherlands, Flanders, Germany, the UK and the US, with a manual country selector and browser-locale suggestion.

Fonts load from Google Fonts with system fallbacks. Self-host them for a fully offline build.

## Interactive world scenes

`WorldChapterScene.vue` replaces the repeated landmark buildings in the walking world. The CV content stays in the existing timeline. The three schools have distinct activities: a physical football and goal at Panta Rhei, a six-wire circuit puzzle at ROC Hilversum, and a stepping-stone code sequence at Coding College. The portal collects three runes through jumping and unlocks three physical side-route platforms. Other scene objects react to proximity. All scene props fit inside the level clearing; background trees stay behind the route.

The character atlas now has 32 frames: twelve walk, twelve run, four climb and the idle/jump/fall/slide poses. `npm run sprites:generate` regenerates the committed bitmap. Gait phase follows distance travelled, with a grounded stance, lifted recovery foot and running flight poses. Timeline travel has a fixed distance-based pace.

`worldActivities.ts` owns the testable football simulation, circuit tracing, code sequence and platform positions. Activities pause with world dialogs and remain optional. `SchoolWorldScene.vue` supports walking, taps and keyboard focus. `PortalWorldActivity.vue` uses the character’s real bounds for collection. Scene drawings and collisions share world pixels; portal ledges are drawn once by their scene. The vertical camera follows the terrain rather than the character’s jump, keeping elevated scenes in view.
