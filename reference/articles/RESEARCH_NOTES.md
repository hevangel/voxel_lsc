# La Salle College Hong Kong — Research Notes (rev 3, 2026-10-07)

Rev 3 replaces rev 2. Rev 2 was measured on a display-downscaled copy of the satellite mosaic
(1383 px wide instead of the true 1565 px), so every rev-2 distance was 0.884× the truth.
It also used its own origin, had the pool inside the ring, and made the main block 192 × 116 m
(true ≈ 86 × 61 m). Do not use rev-2 numbers.

Each claim is tagged: **[V]** verified this revision (source given), **[M]** measured from the
satellite and used in the model (`js/campus.js`, `js/context.js` hold the exact numbers),
**[?]** unverified / best guess.

## Sources and how to measure

- `../photos/satellite_lsc_z19.jpg` — Esri World Imagery z19, north-up, **1565 × 1774 px,
  native tiles cropped, not resampled** (`../data/fetch_satellite.py`). Ground resolution at
  lat 22.33°: 156543·cos(lat)/2¹⁹ = 0.276 m/px → **3.62 px/m** [V].
  Check: 50 m pool = 185 px long [V]; track outer length 591 px = 163 m [V].
- The capture is oblique: tall roofs appear displaced **north**, ≈ 11 m for the 33 m main
  block (≈ 1/3 of height) [M]. Measure footprints at the base. Tall roofs also hide whatever
  lies just north of them (e.g. the south edge of the pool).
- `satellite_lsc_grid.jpg` / `satellite_grid_*.jpg` (`../data/grid_satellite.py`): metric
  grid every 25 m from origin lon 114.18160 / lat 22.32650, gx east, gy north. The grid itself
  is correct (90.5 px per 25 m at full size) [V]; rev 2 went wrong by reading it off a
  downscaled display. Always measure on the full 1565-px image.
- Videos: A = school-song aerial film (`lsc_aerial_ERq74Xv4GY0.mp4`, 207.84 s, hard cuts at
  27.29 29.90 32.23 41.17 45.48 104.00 147.78 153.52 167.37 177.68 206.01 plus dissolves);
  B = FPV drone flight (`lsc_drone_flyover_d8X8myGUXjo.mp4`, 163.37 s). Both [V].
- Ground photos: `view_web_facade_crest_track.jpg`, `lsc_facade_track_edb.jpg` (south facade
  + the crest on the SW wing end, from the track) [V].
- **Elevation**: Lands Department 5 m Digital Terrain Model (CSDI dataset
  `landsd_rcd_1638158088368_93806`, HK1980 Grid, HKPD metres, ±5 m, integer metres; includes
  vegetation canopy and elevated roads, not buildings). `../data/fetch_dtm.py` crops it and
  writes `js/terrain_data.js`; world → HK1980 is an affine fitted on three points converted
  with the LandsD transform API [V].

## Ground levels (DTM, HKPD; model y = HKPD − 14)

The campus is cut into a slope that rises to the north. Sampled on the DTM [V]:
- Track and pitch **14 m** (y 0); housing estate south of the track 12–13 m.
- **La Salle Road terrace 22–23 m** (y ≈ 8.5): the ring, pool, statue garden, driveway and gate.
  La Salle Road itself falls from ≈ 24 m north of the pool to ≈ 19–20 m beside the track, so the
  track's west side is a ≈ 6 m retaining wall under the road.
- East games courts ≈ 24 m (y 10); the tree bank along Nga Tsin Wai Road 27–28 m; east of the
  track 18–26 m (the lettered east wall is a retaining wall).
- North of the pool block the ground jumps to **33–34 m** (y ≈ 19.5), so the 4-storey pool
  block backs into the hill.
- Consequence for the building [V, video A 22 s + video B 19 s, counts agree with the DTM]: the
  south face shows G + 1/F below the terrace, then 7 classroom floors; the **lower quad is at
  the terrace level (y 8.5)** with an open ground floor and six gallery floors above it; the
  upper-quad court is a half level higher (y ≈ 10.3, see Site layout 2). Model: `js/terrain.js` PADS.

## Coordinate system (same as the model)

Metres, **+x = east, +z = south, +y = up, y 0 = track level**.
Grid → world: `x = gx − 130`, `z = 260 − gy`. Full-size z19 pixel → grid:
`gx = (px − 372.6) / 3.62`, `gy = (1572.4 − py) / 3.63`. Check: track centre px (849, 838) →
world (1.6, 58), model (2, 55.85) [V]. Camera yaw = compass heading (0 = N, 90 = E).

## Key facts

- La Salle College (喇沙書院), 18 La Salle Road, Kowloon Tong. Founded 1932 by the De La Salle
  Brothers; motto *Fides et Opera*; school colours purple, red, gold/white. [?] (well-known,
  not re-checked)
- The current building opened in 1982 (the 1932 domed building was demolished). [?]
- Official description: a building of four blocks around two quadrangles — the lower with
  benches and greenery, the upper a basketball court; 50 m outdoor pool; football pitch in a
  red track; statue of St John Baptist de La Salle. All consistent with the imagery [V].

## Site layout

1. **Main block (ring)** x −66..20, z −57..4 (≈ 86 × 61 m) [M]. Seven classroom floors over a
   two-level podium: ground (open, columns) + 1/F, then 7 floors; counted on the facade
   photos [V]. Model heights: G 0–4.5, 1/F 4.5–8.5, floors every 3.5 m, roof 33 [M; total
   height is an estimate from the storey count, ±3 m].
   **Not a plain square — pinwheel corners** [V, nadir video A ≈ 179–192 s, satellite, photos;
   positions M ±2 m]: each wing runs a little past the corner it meets. **All four arms are
   classroom wing ends, built alike** — classroom facades, main roof and cap, stepped
   balconies on the face looking back along the neighbouring wing — **not separate towers**
   [V, user; nadir video A 184 s, 190 s]. (Rev 3.2 modelled NE as a bay with a stair house,
   SE as a white stair tower and SW as a taller crest tower — wrong.)
   - NW: the north wing continues west to the pool's La Salle Road block (x −79..−66,
     z −57..−47), balconies on its south face over the statue garden.
   - NE: the east wing continues north past the north face (x 1..18, z −68..−57; depth
     M ±3 m), balconies on its west face. The pool's east block beside it (x −15..1) is five
     storeys, its roof only a few metres under the main roof [V, video A 124 s, nadir 190 s;
     height M ±3 m].
   - SE: the east face is at x ≈ 18 (satellite); the south wing continues east past it to
     x ≈ 25.5 (z −10..4), the south-facade fins, stand and podium running across it,
     balconies on its north face [V, nadir video A 184 s, satellite]. East of it a two-storey
     podium with green bands and low stands (x 25.5..46) carries the east games courts along
     the track [V, video A 105 s, birds-eye rendering].
   - SW: the west wing continues south past the south face to z ≈ 9.5 (x −66..−52), on
     columns over the podium, roof at main-roof level, balconies on its east face; the crest
     is on a white panel high on its south end wall [M satellite, V photos].
   - **Open ground storey round the void** [V, video B 94–100 s, 126–137 s]: column-lined
     covered walkways under the first gallery (≈ 3–5 m headroom). The north wing is open
     through to the pool deck, the east wing through to the east games courts (picnic tables);
     the west and south wings have a colonnade along the void with rooms behind [extent M ±3 m].
2. **Central void** x −49..2, z −43..−12 [M], ringed by open galleries (white slab edges,
   railings) on most faces; some void faces are glazed classroom walls with blue-green
   window bands instead [V, video A 22 s]. Split in two [V, satellite + video A 48 s]:
   - **Lower quadrangle** (west, x −49..−20): dark slate paving, metal tables and chairs,
     planters with timber kerbs and red/green shrubs, white umbrellas in places. Its centrepiece
     is a **granite flame-urn monument on a square stone plinth** [V, video A 22 s, 34 s] —
     not a bronze crest and not the white statue.
   - **No divider block** [V, video A 46–54 s, video B 19–24 s, user]: the lower quad runs
     straight up to a dark-tiled **retaining wall at x ≈ −19** with a planter row (and a small
     lawn) at its foot, a railing on top and a ten-step stair at the south end. (Rev 3 had a
     2-storey block at x −20..−16 here, misread from the satellite — wrong.)
   - **Upper quadrangle** (east, x −19..2): basketball court on a podium a **half level
     (≈ 1.8 m, ten steps)** above the lower quad (≈ y 10.3; lower quad y 8.5) [V, video B 24 s,
     33 s; height ±0.5 m], green playing area, blue surround, red keys and centre circle,
     hoops at the N and S ends (long axis N–S). The court keeps a full-height colonnade under the
     first gallery, so the void's ground storey is tall (≈ 5 m over the lower quad) and the six
     gallery floors above are ≈ 3.25 m apart [M from video frames, ±0.5 m].
3. **South facade** faces the track at z ≈ 4 [M]: white vertical fins and cream spandrels with
   window bands; green-painted podium bands (stand at 1/F with railings and blue seats); open
   ground floor; low bleachers along the track [V, photos].
4. **Crest** on the south end wall of the SW arm (x −66..−52, z ≈ 9.5), high under the roof
   cap, on a white panel [V, photos]. The arm stands on columns over an open ground level.
5. **Grey podium** west of the SW arm, x −80..−52, z −6..9, 2 storeys, dark grey [V photo,
   M position].
6. **SE arm** — see the pinwheel corners above (rev 3.2 called its south end a stair tower).
7. **Statue garden + driveway** between the west wing and La Salle Road, x −81..−66,
   z −57..−6 [M]. White statue of De La Salle with two children on a granite pedestal over
   stone steps, lawn, small octagonal fountain/planter, tall palms, paved driveway against the
   open ground floor of the west wing [V, video A 30 s]. Statue ≈ (−73, −27) [M].
8. **Pool complex north of the ring** (not inside it) [V, satellite]: 50 m pool, water
   x −72..−22, z −80.5..−61.5, ≈ 8 lanes [V length, M width — the visible width is ≈ 16 m, the
   rest hidden by roof lean]. Enclosed by a 4-storey gallery block on the north
   (x −81..−17, z −98..−84), a 2-storey block on the east (x −17..2, z −91..−57, dark roof,
   tan walls, columned walkway on its west side [V video B 110–124 s]) and a slim block on
   La Salle Road (x −81..−74, z −84..−57) [M].
9. **Games courts east of the ring**, red surface with green courts, x 20..84, cut off by a
   diagonal boundary wall along Nga Tsin Wai Road (≈ (20.5, −62) → (84, 8.5)) [M; road name ?].
10. **Sports ground** south of the main block [V]: stadium-shaped red track centred (2, 55.85),
    straights x −35.5..39.5, outer radius 44.15, outer extent x −80..84, z 11.7..100 [M].
    Lane count is not resolvable on the satellite (straight band ≈ 10 m); model uses 6 [?].
    Dark artificial-turf football pitch x −48.5..51, z 24.5..87.5 [M]; a separate light-green
    fenced futsal/tennis court inside the east end, x 55..72, z 40..72 [V satellite, M].
    Retaining wall on the east side with "La Salle College" lettering and crest [V, videos].
11. **South of the track**: wall at z ≈ 100.5, then a housing estate of two rows of
    12–13 storey slabs (z ≈ 103..146) [V satellite + video B]; estate name [?].
12. **West**: La Salle Road (x ≈ −96..−87) with tree rows, apartments and another school with
    green pitches and courts across the road [V satellite; identity of that school ?].
13. **East / NE**: a tall residential tower beyond the NE corner (x 76..93, z −48..−17, ≈ 74 m)
    and further towers east of the track [M heights ?]; low-rise Kowloon Tong houses NE across
    Nga Tsin Wai Road [V satellite].
14. **Horizon**: Lion Rock ridge to the north / north-east [V, video B opening].

## Colours (sampled from photos and video)

- Facade white/cream #F2EEE2 / #E2DCC8; fins white; roof fascia dark grey #4B4E50.
- Podium green #2C6A52; grey podium #3C3F41.
- Slate paving dark grey; planter kerbs timber/orange; court green #3F8A52, surround blue.
- Track #B44A38; turf dark green; pool water bright cyan with lane lines.
- School colours purple #5B2D82, red #B03028, gold #E9B23B.

## What rev 2 got wrong (for reference)

- Scale 0.884× (downscaled image); own origin (SW corner, +Y north) instead of the model frame.
- Main block 192 × 116 m → true ≈ 86 × 61 m. Height 26 m with 7 floors → 2-level podium +
  7 floors, ≈ 33 m.
- "Pool quad inside the ring at the NW" → the pool is north of the ring in its own enclosure.
- "Central fountain/statue" in the courtyard → a granite flame-urn monument; the white statue
  is in the west garden.
- 8-lane track and 102 × 66 m pitch were not measurable as claimed.
