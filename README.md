# Navi · Timeline engine

A Nuxt 4 starter for a playable portfolio. Original procedural pixel scenery, a replaceable SVG character, smooth camera follow, five parallax layers, keyboard + touch controls, jumping, chapter navigation, a readable list alternative, and individual event pages.

## Run

Node 22.12+ or Node 24 recommended.

```sh
npm install
npm run dev
```

Open http://localhost:3000. `npm run generate` produces a static site in `.output/public`; `npm run build` produces a server build. `npm run typecheck` and `npm test` verify the starter.

## Add an event

Edit `app/data/timeline.ts`. Append an object with a unique URL-safe `id`, `label`, `title`, `chapter`, `kind`, `summary`, `body` (paragraph array), and `accent` color. Array order determines narrative order. The world length, positions, navigation, list and `/events/[id]` page update automatically. Positions use `FIRST_EVENT_X` and `EVENT_SPACING`.

Timeline content is transcribed and translated from the current four-page Figma CV (CV 2026 — Navarone Ismail, fRNmeTPW9BxYg11rzeDezV). Employment, client work through Navel Development, and education deliberately overlap. Navel Cloud has no date in the source CV, so its chapter is labelled Own Product.

## Engine boundaries

- `composables/physics.ts`: pure movement integrator, tunable speed/acceleration/gravity/jump and bounded camera target.
- `composables/useJourney.ts`: animation loop, keyboard/touch state, proximity detection, camera, in-session position preservation, event navigation and lifecycle cleanup.
- `components/JourneyWorld.vue`: layer rendering, event objects and controls. Each layer translates at a different camera multiplier.
- `components/PixelCharacter.vue`: placeholder pixel avatar, walking cycle, facing and airborne state. Replace its SVG with your sprite sheet without changing movement logic.
- `pages/events/[id].vue`: server-rendered, addressable event pages. Extend this template by event kind or introduce project-specific components.
- `assets/css/main.css`: scenery, visual theme and responsive layouts.

Left/Right or A/D walk. Space jumps. Up/Down or W/S climb a nearby ladder; Up/W also jumps away from ladders. E opens a nearby event. All chapters can also be reached through footer buttons or the list. Touch controls use pointer capture and clear on cancellation, blur or route change. Motion pauses in list mode. Reduced-motion preferences disable the sprite animation; the list provides an alternative to travelling through the world.

Movement is continuous in CSS pixels, while artwork uses a fixed pixel grid. Physics uses elapsed time with a maximum timestep to avoid jumps after an inactive tab. Position and elevation survive client-side navigation with Nuxt useState; a reload starts a new journey. Optional platforms, ladders, and slides are defined in a world geometry map. No combat, CMS, analytics, external APIs, or persistent database is included.

## Next extensions

Replace the sample avatar/art; move chapter scenery into data-driven scene definitions; add foreground occlusion, audio with explicit opt-in, and custom product layouts. For an editor, replace the timeline import with a CMS/content adapter that validates the same schema and preserves unique IDs. Do not let content execute arbitrary code.

Fonts load from Google Fonts with system fallbacks. Self-host them for a fully offline build. No external image assets or game engine dependencies are required.


## Routes, ladders, and slides

`app/data/world.ts` defines the optional high roads between events. All dimensions are world pixels and all heights are positive upward from the **same** ground plane. Add entries to `worldGeometry`:

```ts
platforms: [{ id: 'deck', x: 1100, width: 270, height: 120 }]
ladders: [{ id: 'ladder', x: 1135, bottom: 0, top: 120 }]
slides: [{ id: 'slide', x: 1370, width: 230, from: 120, to: 0 }]
```

Platform collisions use the character’s feet; platforms can be crossed underneath. Up/Down or W/S climb nearby ladders. Let go to hold, move sideways to leave, or press Space to jump off. Touch has separate Jump and Up/Down buttons. Slides automatically carry the character down their slope and support jumping off. Position and elevation survive navigation to event pages. All routes are optional; the ground stays traversable.

The `--ground-y` CSS variable anchors the character, buildings, bushes, and route geometry on every viewport. Edit it once to adjust the ground height.

List mode is a scrollable reading timeline. The sticky progress navigator tracks the active chapter and percentage from the actual row positions. Its buttons scroll within the list. Returning to the world starts at the chapter being read; returning from a detail page restores the reading chapter. Game keyboard handlers pause in list mode so arrow keys and Space retain normal document scrolling.


## Landscape and CV content

The timeline contains the real CV history: early programming, Panta Rhei, Navel Development, ROC Hilversum, GmodStore, Coding College Amsterdam, Q-Lite, Shopify assignments, Fletcher Holdings BV, Fifty Five, Aquablu, Get-E, Appjection, and Navel Cloud. Events have optional `role`, `period`, `location`, `via`, and `tags`, plus a `landmark` art type. Every detail page is generated from that same source.

`data/world.ts` generates level clearings at each event and continuous hillside ramps between them. `terrainHeight` is shared by collision physics, landmark placement, and route generation so the artwork and walkable surface agree. `WorldTerrain.vue` draws the actual surface and rock strata; `WorldAtmosphere.vue` provides clouds, mountains, valley water, two forest depths, and haze; the foreground canopy occludes parts of the world at a faster parallax rate. `ChapterLandmark.vue` supplies original SVG scenery with lit interiors, roof planes, and side faces.


## Return travel and mobile gestures

The Fletcher leadership details are included in its main chapter. Short milestone/education events use proximity tooltips and do not interrupt travel with a detail-page prompt.

Swipe left/right anywhere in the world outside controls to move through the timeline. Trackpads and horizontal mouse-wheel input work too (Shift+wheel is supported). Vertical touch scrolling and pinch zoom stay native. Buttons remain available. Reverse input immediately cancels a slide, and the return journey bypasses platforms, ladders, and slide triggers until forward input is given again.

One Tutorial sign appears near the start. The character is a taller, slim pixel silhouette based on the supplied portrait references, with dark textured hair, short facial hair, a black jacket, navy shirt and long trousers. Reference photos are not bundled in the project. The jump shadow is a separate world object projected onto the support below the character, with size/opacity based on height.

Safari touch scrolling uses a non-passive native `touchmove` listener on the world, installed before interaction starts. A swipe locks to its initial direction: horizontal travel cancels page panning for the rest of that gesture; a vertical start stays native. Pinch gestures, controls, and list-mode scrolling remain separate. Touch listeners are removed when the world is hidden or unmounted.

## Money through the years

Edit `app/data/finances.json`. Each chapter ID has independent `debt` and `savings` balances, a `featured` choice (`debt` or `savings`), and `yearlyIncome`. Amounts are in the root `currency` (EUR by default). `null` means undisclosed; an omitted field carries the previous chapter’s value forward. An income entry must provide `amount`, `year`, and `basis` (`gross` or `net`). Actual balances have intentionally been left unset.

The header follows both walking and list progress. The info panel keeps debt, savings and income separate and links to verified support resources for the Netherlands, Flanders, Germany, the UK and the US. The country selector uses a saved selection or a supported browser-locale region as a suggestion; it does not perform an IP-location lookup.

## Scenery and animation alignment

`terrainPlacement.ts` aligns rocks to the slope and keeps them away from sharp terrain corners. Plants have their own terrain anchors. `WorldCourse.vue` draws decks, posts, ladders, slides, and the single tutorial board in the same world coordinates as the physics; support posts end at the sampled terrain under each post.

The character has four pixel poses selected by distance travelled, with a planted foot baseline. There is no CSS bobbing, whole-body rotation, or competing animation loop. Swipe input is buffered and consumed by the same elapsed-time movement step as keys, at a capped pace; lifting a finger clears pending travel. Decorative courses appear only between selected chapters.

## Connected character rig

`characterRig.ts` computes each upper/lower limb from a shared shoulder or hip and a hand/foot target. Segment lengths remain fixed across the eight-frame walk cycle and the idle, climbing, jumping, falling and sliding actions. This replaces the old unrelated leg polygons and arm translations. Reduced-motion preferences freeze the cycle without moving limbs away from their joints.
