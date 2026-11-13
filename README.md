# Navi — interactive CV

A Nuxt portfolio with one PixiJS 2D world. Walk, jump, climb, sprint, scroll or use touch controls to explore the timeline. English and Dutch share the same content IDs, game state and routes.

## Development

Requires Node 22.12+ or Node 24.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run generate
npm run format:check
```

`npm run generate` produces `.output/public`, including static language messages and direct event pages. The PixiJS bundle loads only in world mode on the client. Header, reading list and dialogs remain normal accessible Vue components.

## Project structure

| Directory | Responsibility |
| --- | --- |
| `app/components/layout` | Navigation and language selection |
| `app/components/portfolio` | Journey shell and chapter dialog |
| `app/components/game` | Canvas lifecycle, touch/keyboard hints, computer invitation, slideshow controls and building interiors |
| `app/components/ui` | Shared UI components |
| `app/content` | CV events, journey sections, logo manifest and company slides |
| `app/content/locales` | Dutch CV and support-resource copy |
| `i18n/locales` | English and Dutch interface messages |
| `app/game/engine` | Movement loop, viewport and persistent activity state |
| `app/game/core` | Framework-independent movement, terrain, navigation and presentation rules |
| `app/game/rendering` | PixiJS scene graph, renderer and drawing helpers |
| `app/game/rendering/sprites` | Character atlas, scenery textures, aircraft, computer, character and building exteriors |
| `app/game/rendering/scenes` | Atmosphere, terrain, Skills road and building activities, campsite and layered level entrances |
| `art/scenes` | Editable source artwork; never mounted in the runtime DOM |
| `public/world/scenes` | Exported scenery textures |
| `public/sprites` | Character atlas |
| `public/skills` | Runtime textures generated from the original Figma CV assets |
| `tests` | Movement, presentation, layout, content and asset checks |

## Renderer lifecycle

`useJourney` owns the single animation loop and physics. `GameCanvas.client.vue` loads PixiJS, subscribes to that loop and disposes its subscription, observer and GPU resources on unmount. PixiJS's own ticker is disabled. `WorldRenderer` reads one plain frame snapshot; Vue does not create a component per scenery object or receive per-frame character positions.

Terrain, scenery, shadows, props and sprites share one world coordinate system. Building doorways and both depth planes of the level entrances share the terrain projection. Wide scenes declare a `span` so they stay current over their entire route. Only nearby chapter sprites are mounted. Scenery textures and logo textures use the shared asset cache. The continuous forest-to-city transition follows travelled distance and reverses with the player.

## Editing content

Add CV entries in `app/content/timeline.ts`, their IDs to a section in `app/content/journey.ts`, and Dutch copy with the same ID in `app/content/locales/nl.ts`. Set `span` for a longer scene. `presentation: 'world'` removes its modal; short milestones are tooltips. `hasDetails` is the single modal eligibility rule.

Skills are one continuous road, not Backend/Frontend/Infrastructure/Approach modals. `app/content/skills.ts` lists all 18 original Figma logos and their asset paths. `SkillsRoadScene` owns three grounded, animated machines. Walking across their pressure plates activates tooling, a live web page and a worker queue; their original CV logos remain grouped above each bench. Tapping the machine or using its keyboard action replays it. There is no separate skills modal. CSS changes the live page theme, backend logos load data cards, and selecting server racks changes worker capacity against a real queue with ongoing arrivals. `ActivitySystem` retains discovered tools and machine progress across culling and locale changes. The three raised stations use actual terrain from `skillTerrain`, not decorative fake platforms. Do not replace brand assets with text approximations.

Navel Development uses `ComputerSprite`. `app/content/company.ts` selects the slides from actual CV entries. Arriving at the viewing position shows a start screen and an invitation explaining the projects. The player must explicitly start, either on the screen or with the accessible button. Only after starting does held walking or scrolling advance the slides while the character stays on the spot. Release to pause, reverse to rewind, or use the accessible previous/next/slide controls. At the end, walking continues along the route. Small screens show the larger title and summary rather than tiny body text.

`art/skills` retains the untouched Figma PNG originals. `npm run art:skills` makes small, aspect-preserving runtime textures so the road does not decode eighteen large source images on a phone. SVG logo files remain unchanged.

The opening CRT and desk are native `FirstLinesScene` objects, with their artwork and hit area authored together. The old scenery source remains in `art/scenes` for reference; it is no longer a runtime dependency. `npm run sprites:generate` rebuilds the character atlas. The source reference photos are not bundled.

## Languages and money

`@nuxtjs/i18n` loads English and Dutch messages lazily. The header language selector persists the choice in the locale cookie. UI messages live in `i18n/locales`; event translations are separate content objects so paragraphs stay readable and editable. Locale changes update signs and the computer without rebuilding physical layout or restarting the journey.


## Controls and checks

- Desktop: arrows or A/D to walk, Space to jump, Shift to sprint, up/down or W/S to climb, wheel/trackpad to move forward or backward.
- Touch: swipe or hold independent direction buttons; jump and sprint have separate buttons and pointer capture, so multiple touches can remain active.
- Returning disables automatic slide triggers, not physical support or explicit ladders. Ladder jumps cannot reattach in mid-air.
- Navigation is continuous and symmetric, with a brief start/stop ramp and a ten-second cap for long trips. Manual movement keeps its physical speed.
- Game Space overrides a focused navigation button. Forms, puzzles, reading mode and dialogs keep native keyboard behavior.

Tests cover movement at different frame rates, reverse supports, ladders, jumps, sprint, multi-pointer state, scene spans, presentation bounds, translation coverage and all logo assets. The GitHub browser smoke test checks desktop/mobile layout, canvas startup, keyboard input, menu/list navigation and language switching. Real iPhone Safari multi-touch and GPU performance require an on-device check; a headless browser does not establish them.

### World chapters and building visits

`app/content/journey.ts` is the **walking route**, not the full CV. Navel Development owns one stop. Its seven project slides are resolved from the complete, localized CV with `companySlides`; they are also expandable inside its list entry. Do not add these projects to the route again.

`app/content/buildings.ts` assigns the six school/employer facades. `BuildingSprite` draws grounded doors and facade signs. Door clicks, E and the accessible nearby entrance button all call `useBuildingVisit`. The visit state advances through approach → opening → entering → inside → leaving → closing. `buildingVisit.ts` controls door openness and actor visibility from that same state. `BuildingInterior` holds the localized story/tools boards and return door. Navigation cancels a visit; closing returns control at the exact doorway.

`skillGroups` in `app/content/skills.ts` owns compact clusters and category labels. A discovery belongs to `ActivitySystem`, so culling or changing language does not reset it. `LevelEntranceScene` draws exactly one depth-layered arch for each section. Its far plane is behind the actor; its near pillar is in the foreground so crossing it produces real occlusion.

### Character atlas

Run `npm run sprites:generate` after editing `scripts/build-character.mjs`. This authors complete 48×96 pixel poses, a shared bottom-centre anchor, `public/sprites/navi.png`, the JSON atlas manifest, and `art/character/poses.png` for review. `characterClips` is the runtime clip table. Idle/walk/run/climb/jump/fall/slide/entry are wired into the game; crouch and dance are separate authored clips available for future input bindings. Add a clip to the generator and runtime table together; never stretch individual limbs at runtime. The alpha/baseline and clip isolation tests validate the actual atlas bytes.

### Scene actions and ending

`sceneActivities.ts` defines replayable action timing, aircraft/car/basketball paths and Skills terrain. Basketball scoring is calculated from the same rim clearance as the visible trajectory; misses rebound, and the ball is picked up before release. The camera car starts where it is parked, rather than teleporting to the opposite end of the road. The player must press and hold the ball, aircraft or car and release at the right moment; the charge determines shot accuracy, takeoff outcome and speed-camera result. `ActivitySystem` persists their state across culling and locale switches, and freezes time when the world is paused; a pending hold is cancelled on pause, focus loss or pointer cancellation. `BuildingActivityScene` provides a basketball court, hotel luggage bell, departing aircraft and camera test drive. `SchoolActivityScene` provides two distinct simulations backed by `learningActivities.ts`: six rotatable wires with reciprocal connectivity and visible campus lighting, and a programmable rover that executes step/jump commands across real gaps, fails on invalid landings and can be corrected. The old three-toggle boards and detached `SkillWorkshop` are removed. These are world objects; equivalent keyboard/screen-reader controls appear only when focused. A finished action can be triggered again. Scores, cable orientations, rover commands, page settings and queue state survive scene culling and language changes.

The contact stop is `CampsiteScene`: tent zip, lantern and fire are interactive. Its clearing stays level and bounds the world near the campsite. It never opens a finish overlay or locks movement.

Only `FirstLines.vue` still uses authored SVG scenery. Its export is `public/world/scenes/first-lines.svg`; the superseded project/building textures and old football/portal/wire-grid simulation have been removed. The other scenes are reusable Pixi objects.

## First-code workstation

The opening scene's computer is clickable, with an accessible button as a fallback. It opens a real HTML/CSS editor and immediate preview in a sandboxed iframe (no script execution). This is intentionally a learning interaction, separate from the later Navel Development project slideshow. Editing the sample never changes deployed files.

## Production verification

`npm ci`, `npm test`, `npm run typecheck`, and `npm run generate` validate the locked source. `npm run serve:generated` serves that generated output; `npm run test:browser` exercises it at desktop, mobile and compact widths. CI uses the same lockfile and generated assets instead of installing unpinned browser tooling or testing the Nuxt development server. Its artifacts include scene, editor, workshop and interior screenshots.

Browser regressions cover outside-menu click-through, background inertness, retained GPU frames while a dialog is stationary, sandboxed previews, direct reading-mode URLs without WebGL initialization, and recovery after real WebGL context loss. Optional scenery textures can fail without breaking the game.

Financial metadata is read from the active journey sequence, including authored skills/contact events, so adding a scene does not require a second ID mapping in the financial UI. Omitted values inherit in journey order; `null` deliberately withholds them.
