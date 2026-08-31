# La Salle College Hong Kong — Research Notes (rev 2, 2026-08-30)

Rev 2 supersedes the rev-1 guesswork after studying: user-supplied site plan + aerial thumbnail,
two drone videos (FPV flyover d8X8myGUXjo + promo aerial ERq74Xv4GY0, frame grabs in ../video/frames*),
an Esri World-Imagery satellite mosaic of the campus (../photos/satellite_lsc_z19.jpg, north-up,
with metric grid overlays satellite_grid_*.jpg), OSM footprints, and ground-level photo hits.

## Key facts (unchanged from rev 1)
- La Salle College (喇沙書院), 18 La Salle Road, Kowloon Tong. Founded 6 Jan 1932, De La Salle Brothers.
- Motto "Fides et Opera"; colours purple/white/red. Bruce Lee old boy. 90th anniversary 2022.
- The CURRENT main building opened 19 Feb 1982 (Golden Jubilee year; the 1932 dome building was
  demolished 1979). 2005: Aimar + Cassian wing annexes. We model the CURRENT campus.
- Official self-description: "Seven-floor building with four impressive blocks surrounding two
  quadrangles — the lower with benches and greenery, the upper a standard-size basketball court";
  outdoor 50 m pool; four tennis courts; full-size football pitch in a red tartan track; statue of
  St John Baptist de La Salle at the entrance.

## GROUND-TRUE CAMPUS LAYOUT (metres; origin = SW corner where Boundary St wall meets
La Salle Rd east wall; +X = EAST, +Y = NORTH. From satellite + OSM + site plan.)

Campus box: X 0..225, Y 0..295. Bounded W by La Salle Rd, S by Boundary St, NE by Nga Tsin Wai Rd
(which runs diagonally), E by College Rd. The campus is essentially ONE level (mild slope down
toward Boundary St; keep a 1–2 m step at the forecourt only).

1. BOUNDARY ST (south edge): road, then dark boundary wall (Y 0..2) with hedges; across it, dense
   rows of Kowloon Tong garden houses (dark pitched roofs, lush trees), taller pink slab estates
   further east (SE skyline).
2. SPORTS GROUND (south half): track oval centre ≈ (108, 82), outer ≈ 165 × 122 m, 8 red lanes,
   white lines; long-jump sand pits along the east straight (white rail frames); high-jump pad NW
   inside; full-size football pitch ≈ 102 × 66 (dark artificial turf, white lines, white goals with
   nets). Small CONCRETE GRANDSTAND (4–6 stepped rows, metal rails) against the building's north
   face around X 85..135. Floodlight masts at 4 corners. Green mesh fence between track and wall.
3. MAIN BUILDING RING ("four blocks"): outer X 14..206, Y 168..284, ~7 floors, ≈ 26 m tall.
   - SOUTH WING X 14..206, Y 168..196 — the iconic face across the track: dark-GREEN podium band
     (2 open levels with railings) under ~5 floors of WHITE spandrels + dark green louvre windows,
     split into bays by white vertical fins; dark grey roof fascia; open ground colonnade.
   - WEST GABLE (crest tower): the west end (X 14..40) rises ~2 storeys above the slab as a WHITE
     tower with the full-colour CREST high on its south/west faces + dark fascia cap.
   - COURTYARD (lower quad) X 62..196, Y 196..238: grey tiled paving; central fountain/statue on a
     square granite plinth; white patio umbrellas + wooden tables (tuck shop seating) west half;
     basketball court (green key, blue surround) at the east end; planters; every floor has OPEN
     corridors ringing the court (white slabs, metal railings, ochre/tan corridor walls, classroom
     doors brown-orange).
   - NORTH-WEST POOL QUAD X 14..90, Y 238..284: sunken deck (≈2 m below ground floor) with the
     50 m pool (X 27..80, Y 250..270 per OSM; 8 lanes, bright cyan) + beige tiled deck; 2-storey
     OPEN-sided pavilion (changing/cool-down, white frame, grey columns) on the pool's south side;
     corridors/west wing overlook the water from the west; low plant block on the north.
   - NORTH WING X 90..206, Y 232..262: same banded facade facing the pool court + Nga Tsin Wai Rd.
   - EAST WING X 178..206, Y 168..262: contains the School Hall — its outer (east) face has a large
     blue reflective GLASS curtain wall with white mullions (seen in typhoon photo + f_015).
4. ENTRANCE FORECOURT X 0..62, Y 168..240 (west of south wing): GREY GRANITE ASHLAR boundary wall
   along La Salle Rd with cast-bronze lettering "喇沙書院 / LA SALLE COLLEGE / 18 La Salle Road"
   (lettering section near Y 150..180, crest plaque nearby), stainless gate with crest cutouts;
   paving + driveway; sunken rectangular LAWN garden with white kerb, palms + banyans; covered
   stair/ramp up to the podium (white canopy); De La Salle statue on plinth near the lobby.
5. EAST COURTS X 186..225, Y 148..192: 2 tennis courts (green/blue, nets, fences) + basketball
   courts (red/green) + floodlights — NE of the track, south of the east wing.
6. WEST STRIP: granite wall + mature trees along La Salle Rd (road climbs N, ~3 lanes, KMB stop);
   across the road at the SW: LA SALLE PRIMARY SCHOOL (own campus + red/green courts), then
   garden houses.
7. NORTH STRIP: Nga Tsin Wai Rd diagonal Y≈288..300; sitting-out garden + 5-a-side pitch NE;
   row of 5-storey houses (Amber/Emerald/Pearl) NW across the road; Kowloon Tsai park hillside
   (dense trees) rising behind; Lion Rock visible N–NE on the horizon.
8. EAST STRIP: College Rd (X 228..236), trees, one tall beige residential slab beyond (25 fl).

## FACADE SPEC (from view_web_facade_crest_track + drone frames)
- Storeys: ground colonnade ≈ 4 m, floors 1–6 ≈ 3.4 m each, roof fascia ≈ 1.5 m → ≈ 26 m total;
  crest tower top ≈ 33 m.
- Window bands: white spandrel ≈ 1.2 m between floors; windows dark green-grey louvres with thin
  white vertical fins every ≈ 3.5 m; some windows open/AC units.
- Podium: DARK GREEN (≈ #2F6E52) 2-storey band with horizontal white/green railing lines; open
  colonnade at ground; ramps/stairs down to track level.
- Roof: dark grey fascia (≈ #4A4F4A), light grey roof deck, AC units, white rooftop structures.
- Corridors (courtyard side): ochre/tan walls (≈ #C89A6A), grey tiled floors, white columns.
- Track terracotta red (≈ #B44A38), turf dark green (≈ #2E6B33), pool cyan (≈ #2FA8CF).

## Rev-1 corrections (what the old world got wrong)
- Building was a U with pool in the MIDDLE courtyard → real: closed ring, pool quad at NW,
  garden/basketball courtyard in the middle, forecourt garden at SW.
- Facade faced south with red-brick accents, mural + clock towers → real: white banded slab,
  green podium, crest tower at WEST end, no clock tower, no mural (Signum Fidei star small).
- Field was too small/oval-only; real track is a big 8-lane oval with full pitch + grandstand
  against the building.
- Tennis was far east on its own terrace; real courts sit NE of the track by College Rd.
- Missing: granite gate wall + lettering, forecourt sunken lawn + palms, courtyard fountain +
  umbrellas, pool pavilion, hall glass curtain wall, garden-house rows south, Nga Tsin Wai Rd.

## Colour palette (photos)
- Facade white/ivory #F2EEE2, shaded #D9D4C4; fins white; roof fascia #4A4F4A; roof deck #9AA0A0.
- Podium green #2F6E52 (railing lighter #7FA98F); corridor ochre #C89A6A; classroom door #A4622E.
- Window glass #37474B (dark), lit warm #F5D98F; glass curtain wall #4E7E96.
- Track #B44A38; turf #2E6B33; lines white; pool water #2FA8CF; pool deck #CFC5A8.
- Granite wall #9A9284 / #877F72; bronze letters #6B5B33; lawn #3F8C3C; palms #4F9A44.
- School colours purple #5B2D82, red #B03028, gold #E9B23B.
