# Rendering direction

The current world uses Vue-rendered SVG scenery and CSS transforms. Background geometry is memoized and visible terrain/chapters are bounded, but the camera still drives a DOM/SVG render path each frame. The timing and input bugs were separate engine logic defects and are repaired in the current implementation.

## Recommendation: PixiJS for the game renderer

Keep Nuxt for the header, finance panel, accessible list, chapter dialogs and direct event pages. Put the playable scenery, terrain, courses and sprite into one client-only PixiJS canvas. PixiJS provides a 2D scene graph with WebGL/WebGPU rendering; Three.js's 3D scene model is unnecessary for this world.

Retain the tested, data-driven timeline, world geometry, movement simulation and activity rules. Feed the renderer plain snapshots from the single game loop. Do not make per-frame positions Vue component props. Vue should receive discrete chapter/progress/dialog updates, with progress throttled to display cadence.

Build one renderer adapter with layers for distant sky, hills, forest/skyline, terrain, event props, actor/shadow and activity feedback. Cache static scenery as textures; animate only transforms, opacity and sprite frames. Make era progress a renderer input rather than swapping scenes at section boundaries. Keep activity DOM controls accessible as overlays using the same world-to-screen projection.

Move the renderer as a complete vertical slice, starting with one contiguous route containing a slope, ladder, slide, chapter interaction and era boundary. Verify forward/backward travel, held inputs, multiple touch pointers, resize, visibility changes, renderer disposal and context restoration. Then migrate all scene art before removing the SVG implementation. Do not ship two active world loops.

## Alternative: Phaser

Phaser is a full 2D game framework with rendering, cameras, input and physics. Choose it if replacing the simulation/input architecture too. For the existing tested terrain and activities, PixiJS is the narrower renderer migration. No bundle-size or FPS improvement is claimed without measurements on the completed route and real iPhone Safari.

Primary references:
- https://pixijs.com/8.x/guides/concepts/architecture
- https://pixijs.com/8.x/guides/components/renderers
- https://www.phaser.io/oss/docs/

## Current travel behavior

Short timeline trips cruise after a 220ms ramp. Long trips are distance-compressed to a maximum of ten seconds, identically in either direction. Manual walking, touch swiping, wheel input and Shift sprint retain their physical speeds. Sprite cadence is capped at the normal sprint cadence during accelerated timeline travel.
