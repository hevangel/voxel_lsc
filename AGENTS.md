# AGENTS.md — Maintaining the La Salle College Voxel Campus

Guidance for AI agents (and humans) modifying this project. Read this before changing code.

## What this is

A self-contained, dependency-free (Three.js is vendored) voxel recreation of **La Salle College,
18 La Salle Road, Kowloon Tong, Hong Kong** (喇沙書院, founded 1932, motto *Fides et Opera*).
The user roams in first person, flies, or watches a guided tour. Front page: `index.html`.

Fan-made tribute — **not affiliated with the school**. Keep that disclaimer in the UI.

## Running

- Any static file server from the repo root, e.g. `node tools/dev-server.js .` (serves :8137,
  sends `Cache-Control: no-store` — use this during development or you will test stale JS),
  or `python -m http.server`.
- Opening `index.html` directly from disk also works (classic scripts, no ES modules).

## Architecture (load order matters — classic scripts, global `LSC` namespace)

```
index.html
├── js/lib/three.min.js     Three.js r149 (UMD, vendored — do not upgrade casually)
├── js/palette.js           LSC.Palette — ALL voxel materials (id, colour, emissive flag)
├── js/voxel.js             LSC.Voxel — VoxelWorld grid + primitives + chunk mesher
├── js/textures.js          LSC.Textures — canvas textures (crest, mural, clock, signs)
├── js/world.js             LSC.World.buildWorld() — the entire campus, data-driven
├── js/sky.js               LSC.Sky — sky shader, sun/moon/stars, lights, clouds, 24h cycle
├── js/entities.js          LSC.Entities — students, birds, flags, pool water, cars
├── js/player.js            LSC.Player — walk / fly / tour movement + voxel collision
├── js/ui.js                LSC.UI — landing, HUD, minimap, POI labels, panels, toasts
├── js/main.js              LSC.App — bootstrap, chunk meshing, scenery, render loop
├── css/style.css           UI theme (school colours: purple #5b2d82, red #b03028, gold #e9b23b)
└── tools/dev-server.js     dev-only static server (no-store caching)
```

### Coordinate system (critical)

- Grid: `W = D = 320`, `H = 104`, **1 voxel = 1 m**. `+x` = east, `+z` = **SOUTH** (north = −z).
- Campus origin: grid `(140, 150)`. Helpers in world.js: `X(lx) = 140 + lx`, `Z(lz) = 150 + lz`.
  **Always author structures in local coords (`lx/lz`) via X()/Z()** so the campus can be shifted.
- Terraces: La Salle Rd y8 · sports ground y10 · tennis y12 · campus plateau y14.
- A voxel at grid cell `g` occupies `[g, g+1]` — sign/decal planes must sit at `surface + 0.15…0.2`
  on the side they face, or they z-fight / hide inside walls (this bit us before).

### Voxel data & meshing

- `VoxelWorld.data` is a dense `Uint8Array` of palette ids (0 = air); `colTop` caches column height.
- The mesher (`buildChunkGeometry(x1, z1, x2, z2)` — note arg order) culls hidden faces and bakes
  per-face shade (top 1.0, x 0.86, z 0.80, bottom 0.55) + corner AO into vertex colors.
  Emissive palette entries go to a second geometry with a shared `MeshBasicMaterial`;
  `App.emissiveMat.color` scalar (sky.glow) dims/brightens all glowing voxels by time of day.
- Meshing is chunked (40×40 columns) inside `main.js finishSetup()` with `setTimeout` slicing so
  the loading bar updates. **Keep arg order `(x1, z1, x2, z2)`** — swapping x2/z1 silently
  meshes almost nothing (that bug shipped once).

### World content (world.js)

Built in phases with an `onProgress(label, frac)` callback. Layout is derived from real data —
see `reference/articles/RESEARCH_NOTES.md` (OSM footprints in campus-local metres, photo palette,
history). Key structures and their local-coord footprints:

| Structure | lx | lz | Notes |
|---|---|---|---|
| South block (iconic facade, arcade ground + 5 floors) | −45..45 | −52..−38 | window bands via `bandedWallX` |
| Crest tower (white, crest plane on south face) | −45..−31 | −54..−36 | rises to y49 |
| Central stair tower (mural plane on north face) | −8..+8 | −58..−52 | to y44 |
| West wing (School Hall) | −45..−33 | −36..−2 | |
| East wing (rooftop garden) | +33..+45 | −38..−2 | |
| North block (gate arch at lx −3..+3) | −33..+33 | −16..−2 | |
| Courtyard + 50 m pool | −29..19 | −48..−28 | water = ShaderMaterial plane in entities.js |
| Basketball court | 24..44 | 2..28 | upper quad |
| Statue plaza / gate ramp | −44..−22 / −46..−38 | 2..26 / 6..18 | statue, flags, gate pillars |
| Track oval (centre 30,95; outer 128×92) | −34..94 | 49..141 | 6 lanes, white ellipse lines |
| Football pitch | −16..84 | 63..127 | goals, boxes, centre circle |
| Tennis courts (2×2) | 94..124 | 46..104 | own terrace y12 |
| Mountains + Lion Rock | north, lz ≤ −108 | | gaussian peak at (−8, −126) |

**Movement must stay legal:** walking routes (gate ramp → plaza → lawn) are verified by test;
when adding walls, re-check that POIs/paths/walk-loops/tour points are still reachable and that
the tour spline (player.js `tourPts`) clears structures by ≥ 2 m.

### Determinism

`mulberry(19320106)` (founding date) seeds every random placement in world.js — the world is
byte-identical between loads. Don't introduce `Math.random()` into world.js (entities/sky may use
it — they're cosmetic and non-structural).

## Conventions

- No build step, no framework, no ES modules — keep it that way; `node --check js/*.js` is the CI.
- All state lives under `window.LSC`. `LSC.App` is the wiring hub the UI calls into.
- Comments only where the code can't speak (why-coordinates, layout rationale, gotchas).
- Palette is the single source of colour truth: add materials there, never inline hex in world.js.

## Known sharp edges

- **Browser cache during dev** → use `tools/dev-server.js` (no-store), else you debug stale code.
- The pool water is a shader plane at y 13.86; the basin must be carved through y14 (deck level)
  or a grass lid hides it (that bug shipped once too).
- Sign planes (`signAnchors`) need `surface + 0.15`+ offsets on the face side; voxel faces are at
  `grid + 1`.
- `requestPointerLock` must be wrapped (`App.lockPointer`) — embedded browsers throw without a
  gesture and that used to abort entering the app.
- Background/occluded tabs pause rAF; screenshots then show stale frames. Force
  `A.sky.update(0.016, A.player.pos); A.player.update(0.001); A.renderer.render(...)` before capture.
- Quality levels: Low disables shadows entirely; High = 2048 shadow map. `setQuality` may be called
  before or after boot — it guards accordingly.

## Testing checklist (manual, ~3 min)

1. Load → loading bar completes → landing shows.
2. Enter on Foot → spawn on the bleachers facing the facade; WASD walk, Space jump, walls block.
3. F (fly) → rise; no fall damage/collision; Shift speeds up.
4. T (tour) → camera flies the spline without clipping; any WASD exits.
5. Time slider → dusk ~19.4 (lit windows) and night ~22 (floodlights, stars, glowing scoreboard).
6. M → campus map renders, click to teleport. P → photo mode hides UI. Esc closes panels.
7. Minimap tracks the player; POI labels/toasts appear near landmarks.
