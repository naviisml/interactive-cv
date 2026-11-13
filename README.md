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
| `app/components/layout` | Navigation, finance placement and language selection |
| `app/components/portfolio` | Journey shell and chapter dialog |
| `app/components/game` | Canvas lifecycle, touch/keyboard hints, accessible puzzle and slideshow controls |
| `app/components/finance` | Money counters and support information |
| `app/components/ui` | Shared UI components |
| `app/content` | CV events, journey sections, logo manifest, company slides and finances |
| `app/content/locales` | Dutch CV and support-resource copy |
| `i18n/locales` | English and Dutch interface messages |
| `app/game/engine` | Movement loop, viewport and persistent activity state |
| `app/game/core` | Framework-independent movement, terrain, navigation and presentation rules |
| `app/game/rendering` | PixiJS scene graph, renderer and drawing helpers |
| `app/game/rendering/sprites` | Character atlas, scenery textures, logos, computer and company signs |
| `app/game/rendering/scenes` | Atmosphere, terrain, Skills road and interactive school/portal scenes |
| `art/scenes` | Editable source artwork; never mounted in the runtime DOM |
| `public/world/scenes` | Exported scenery textures |
| `public/sprites` | Character atlas |
| `public/skills` | Runtime textures generated from the original Figma CV assets |
| `tests` | Movement, presentation, layout, content and asset checks |

## Renderer lifecycle

`useJourney` owns the single animation loop and physics. `GameCanvas.client.vue` loads PixiJS, subscribes to that loop and disposes its subscription, observer and GPU resources on unmount. PixiJS's own ticker is disabled. `WorldRenderer` reads one plain frame snapshot; Vue does not create a component per scenery object or receive per-frame character positions.

Terrain, scenery, shadows, props and sprites share one world coordinate system. Company signs sample the ground at their post. Wide scenes declare a `span` so they stay current over their entire route. Only nearby chapter sprites are mounted. Scenery textures and logo textures use the shared asset cache. The continuous forest-to-city transition follows travelled distance and reverses with the player.

## Editing content

Add CV entries in `app/content/timeline.ts`, their IDs to a section in `app/content/journey.ts`, and Dutch copy with the same ID in `app/content/locales/nl.ts`. Set `span` for a longer scene. `presentation: 'world'` removes its modal; short milestones are tooltips. `hasDetails` is the single modal eligibility rule.

Skills are one continuous road, not Backend/Frontend/Infrastructure/Approach modals. `app/content/skills.ts` lists all 18 original Figma logos and their asset paths. `SkillLogoSprite` owns their proximity animation. Do not replace brand assets with text approximations.

Navel Development uses `ComputerSprite`. `app/content/company.ts` selects the slides from actual CV entries. At the viewing position, held walking or scrolling advances the slides while the character stays on the spot. Release to pause, reverse to rewind, or use the accessible previous/next/slide controls. At the end, walking continues along the route. Small screens show the larger title and summary rather than tiny body text.

`art/skills` retains the untouched Figma PNG originals. `npm run art:skills` makes small, aspect-preserving runtime textures so the road does not decode eighteen large source images on a phone. SVG logo files remain unchanged.

`npm run art:export` regenerates static scenery textures from `art/scenes/StoryScene.vue`. `npm run sprites:generate` rebuilds the character atlas. The source reference photos are not bundled.

## Languages and money

`@nuxtjs/i18n` loads English and Dutch messages lazily. The header language selector persists the choice in the locale cookie. UI messages live in `i18n/locales`; event translations are separate content objects so paragraphs stay readable and editable. Locale changes update signs and the computer without rebuilding physical layout or restarting the journey.

`app/content/finances.json` contains chronological financial snapshots by original event ID. `null` means undisclosed; omission carries a previous value forward. No financial amounts are invented. English and Dutch use the same figures, translated labels and locale-aware currency formatting. Support links retain the original official URLs.

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

`skillGroups` in `app/content/skills.ts` owns compact clusters and category labels. A discovery belongs to `ActivitySystem`, so culling or changing language does not reset it. `LevelEntranceScene` draws exactly one grounded arch for each section in the route.

### Character atlas

Run `npm run sprites:generate` after editing `scripts/build-character.mjs`. This authors complete 48×96 pixel poses, a shared bottom-centre anchor, `public/sprites/navi.png`, the JSON atlas manifest, and `art/character/poses.png` for review. `characterClips` is the runtime clip table. Idle/walk/run/climb/jump/fall/slide/entry are wired into the game; crouch and dance are separate authored clips available for future input bindings. Add a clip to the generator and runtime table together; never stretch individual limbs at runtime. The alpha/baseline and clip isolation tests validate the actual atlas bytes.
