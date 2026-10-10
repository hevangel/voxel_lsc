'use strict';
// Camera path for "video A" — School Song aerial film of La Salle College.
// World: +x east, +z south, +y up. yaw 0=N(-z) 90=E(+x) 180=S(+z) 270=W(-x).
// pitch = deg above horizon (neg = looking down). roll deg (positive banks LEFT).
LSC.PATHS.A = {
  title: 'School Song aerial film',
  video: 'reference/video/lsc_aerial_ERq74Xv4GY0.mp4',
  duration: 207.84,
  vfov: 50,
  shots: [
    // ---- Shot 1 (0–5): title card — crest + "La Salle College School Song" on black.
    // No campus visible; hold a wide, far S-facade view (over the track) so the model shows something. ----
    { t0: 0, t1: 5.0, keys: [
      [0.0, 12, 15, 68, 338, 4, 0, 52],
      [5.0, 11, 14, 63, 339, 3, 0, 52],
    ]},
    // ---- Shot 2a (5–13): S facade seen FAR away, below roof height — upper storeys + roofline + lots of sky,
    // facade angled (camera SE of facade over the track, looking NW), the whole block + stand + track in
    // frame. Was too close; pulled back (z ~62→46, higher, fov 50-52). ----
    { t0: 5.0, t1: 13.0, keys: [
      [5.0,  10, 14, 62, 338, 3, 0, 52],   // far, over the track; whole block + crest tower + sky
      [8.0,  2,  15, 58, 344, 4, 0, 50],
      [11.0, -4, 13, 52, 347, 4, 0, 50],
      [13.0, -8, 11, 46, 349, 2, -1, 50],  // starting to push in, crest tower + palms low-left
    ]},
    // ---- Shot 2b (13–20): dropping low and pushing in; facade fills more, palms at base, sun flare top,
    // strong up-angle. ----
    { t0: 13.0, t1: 20.0, keys: [
      [13.0, -8, 11, 46, 349, 2, -1, 50],
      [16.0, -10, 7,  34, 352, 10, -1, 50],
      [20.0, -12, 5, 24, 356, 24, 0, 50],  // low, looking up the towering facade (sun flare)
    ]},
    // ---- Shot 2c (20–27.29): low in a courtyard looking up at a crest MONUMENT with gallery wings behind
    // and sky above. The model has NO such sculpture — route the camera into the lower quad (void SW edge)
    // looking up/across a curved gallery wing to frame it the same way; wide up-angle. ----
    { t0: 20.0, t1: 27.29, keys: [
      [20.0, -36, 9.8, -16, 355, 16, 0, 52],
      [23.0, -33.5, 10.3, -21.5, 2, 14, 0, 52],   // lower quad, just S of the flame urn, looking N up at the galleries (video 22–26 s)
      [27.29,-30, 12.5, -16, 40, 14, 0, 52],  // courtyard, looking up/NE at the gallery wing
    ]},
    // ---- Shot 3 (27.29–29.90): low facing a grey ASHLAR wall, close & nearly head-on, cone at base,
    // towers behind on the right. Route to the void NE corner looking across at a gallery/wall. ----
    { t0: 27.29, t1: 29.90, keys: [
      [27.29, -24, 11.5, -20, 70, -4, 0, 48],
      [29.90, -22, 11.5, -22, 75, -6, 0, 48],
    ]},
    // ---- Shot 4 (29.90–32.23): white STATUE + palms + round lawn — the statue garden (W, statue at -73,-27).
    // Low, looking N up the driveway at the statue. ----
    { t0: 29.90, t1: 32.23, keys: [
      [29.90, -73, 19.5, -14, 180, -8, 0, 46],   // facing N at the statue, palms flanking, lawn
      [32.23, -73, 18.5, -17, 180, -10, 0, 46],
    ]},
    // ---- Shot 5 (32.23–41.17): a stone sculpture on a square plinth, high top-down onto dark paving with
    // benches/planters/trees around it (lower-quad corner). Slow top-down drift + gentle rotation. ----
    { t0: 32.23, t1: 41.17, keys: [
      [32.23, -40, 22.5, -20, 180, -58, 0, 48],
      [35.0,  -40, 22.5, -20, 195, -62, 0, 48],
      [38.0,  -41, 21.5, -21, 210, -60, 1, 48],
      [41.17, -42, 21.5, -22, 225, -56, 0, 48],
    ]},
    // ---- Shot 6 (41.17–45.48): high top-down onto dark paving — framed-picture wall, benches, umbrellas
    // (lower quad). Note: 37–40s is a ground-level covered walkway; the dominant 41–45 look is top-down. ----
    { t0: 41.17, t1: 45.48, keys: [
      [41.17, -34, 20.5, -28, 250, -62, 0, 48],
      [45.48, -32, 19.5, -30, 265, -58, 0, 48],
    ]},
    // ---- Shot 7 (45.48–55): from the west side of the lower quad across the planter row and the
    // half-level retaining wall to the raised court, then rising to look down on the court with the
    // lower quad at the bottom of frame (video 46 / 49 / 52 / 54.5 s). ----
    { t0: 45.48, t1: 55.0, keys: [
      [45.48, -46, 14, -24, 95, -12, 0, 54],
      [49.0,  -36, 21, -27, 92, -33, 0, 54],
      [52.0,  -27, 31, -27, 90, -62, 0, 54],
      [55.0,  -25, 44, -27, 90, -70, 0, 54],
    ]},
    // ---- Shot 8 (55–61.5): covered walkway looking out toward the courts and the track (video 56,
    // 60 s). The model has no interior here, so the camera runs along the open 1/F stand. ----
    { t0: 55.0, t1: 61.5, keys: [
      [55.0, -20, 6.2, 7.3, 95, -3, 0, 52],
      [58.0,  -5, 6.2, 7.3, 105, -3, 0, 52],
      [61.5,   8, 6.2, 7.3, 120, -4, 0, 52],
    ]},
    // ---- Shot 9 (61.5–71): first along the covered stand (facing NW, "La Salle Colleg" on the parapet,
    // estate behind), then swing to the grey EAST WALL (x=87.95 wallSign, crest + lettering), close & head-on,
    // east towers behind. ----
    { t0: 61.5, t1: 71.0, keys: [
      [61.5,  10, 7, 14, 300, -2, 0, 52],   // on the track, facing NW along the green stand/facade
      [63.5,  18, 6.5, 28, 10, -1, 0, 50],  // swinging E over the track east end toward the wall
      [65.0,  44, 5.5, 50, 72, 1, 0, 46],   // the east wall (x88 wallSign, z44-68) fills the frame
      [67.5,  56, 5, 55, 88, 2, 0, 42],     // crest + "La Salle College" lettering centred, head-on
      [69.0,  62, 5, 56, 91, 3, 0, 40],     // head-on at the lettered wall, estate towers rising behind
      [71.0,  66, 4.8, 56, 92, 3, 0, 38],   // closer, "La Salle College" large, towers behind
    ]},
    // ---- Shot 10 (71–104): rising aerial of the S facade from the W/SW track corner — lower & closer, the
    // facade RECEDING DIAGONALLY to the right (E), pitch/track filling the lower half; slow climb. ----
    { t0: 71.0, t1: 104.0, keys: [
      [71.0,  -48, 14, 46, 60, -8, 0, 54],   // SW track corner, facade recedes right (E), crest tower near
      [76.0,  -46, 18, 48, 62, -9, 0, 54],
      [82.0,  -44, 24, 50, 64, -10, 0, 55],  // climbing, whole block diagonal, estate behind right
      [88.0,  -42, 32, 52, 66, -12, 0, 55],
      [94.0,  -40, 40, 54, 68, -13, 0, 56],  // higher, Lion Rock ridge far behind
      [100.0, -38, 46, 54, 70, -14, 0, 56],
      [104.0, -36, 50, 54, 72, -15, 0, 56],
    ]},
    // ---- Shot 11 (104–147.78): birds-eye orbit over ring + void + track + pool. Keep it OBLIQUE with the
    // city skyline on the horizon mid-shot (117s near-horizontal), not top-down; drifts over pool then back
    // toward the track. Ends high over the pool/track (144–147 is a high top-down of pool+track+estate). ----
    { t0: 104.0, t1: 147.78, keys: [
      [104.0, -18, 40, 10, 20, -30, 0, 54],   // oblique over the ring, void + track below, estate+sky top
      // 108-120: over the NE / E roof corner looking SW/W ACROSS the roof INTO the void
      // (open galleries + court below), the city skyline + hills behind (video 108-120).
      [108.0, 26, 42, -18, 248, -26, 0, 54],
      [112.0, 22, 46, -26, 244, -28, 0, 55],
      [116.0, 18, 50, -32, 240, -30, 0, 56],
      [120.0, 12, 52, -36, 234, -30, 0, 56],
      [124.0, -14, 50, -52, 295, -24, 0, 54], // swinging W over the void toward the pool
      [131.0, -48, 48, -58, 260, -30, 0, 54], // over the pool, N blocks + skyline
      [138.0, -40, 52, -30, 200, -46, 0, 54], // climbing, nose S over the void toward the track
      [143.0, -30, 56, 8, 185, -56, 0, 54],   // high top-down of pool+track+estate (144–147 look)
      [147.78,-20, 58, 30, 180, -58, 0, 54],
    ]},
    // ---- Shot 12 (147.78–167.37): high aerial over the TRACK + football pitch + main block, then descending
    // along the tree-lined driveway/avenue; crest banners hang on the inner facade, trees frame the sides,
    // looking N/NW at the main block over the red track. ----
    { t0: 147.78, t1: 167.37, keys: [
      [147.78, -16, 56, 40, 350, -42, 0, 54],  // high oblique: red track + green pitch + block, estate behind
      [151.0,  -14, 50, 44, 352, -36, 0, 52],  // "and strive that" — block diagonal, track below
      [155.0,  -30, 40, 48, 20, -22, 0, 50],  // descending SW of the track, looking NE at the crest-tower end, avenue+trees on the left
      [159.0,  -44, 30, 44, 18, -16, 0, 48],  // ~40 m up over La Salle Rd, crest tower + banners ahead (NE), trees left
      [163.0,  -52, 22, 36, 14, -10, 0, 46],  // lower over the avenue toward the crest tower, trees framing left
      [167.37, -62, 15, 24, 8,  -6, 0, 46],   // drifting W toward the statue garden, crest tower + trees
    ]},
    // ---- Shot 13 (167.37–177.68): the STATUE garden — white Founder statue LARGE in frame, palms flanking,
    // driveway + W wing facade behind; low & close, looking N, slow push then hold. ----
    { t0: 167.37, t1: 177.68, keys: [
      [167.37, -73, 13, -2, 0, -9, 0, 46],    // statue garden from above the driveway: statue + lawn + palms + facade
      [170.0,  -73, 10.5, -9, 0, -4, 0, 42],
      [173.0,  -73, 9.5, -13, 0, -1, 0, 40],   // close hold on the statue, W wing facade + flags behind
      [177.68, -73, 9, -15, 0, -1, 0, 40],
    ]},
    // ---- Shot 13b removed: statue now occupies 167.37–177.68 (shot 13); top-down starts at the 177.68 cut. ----
    // ---- Shot 14 (177.68–206.01): high top-down birds-eye climbing/rotating over the whole campus. Frame
    // centre on the ring/void; court+pool+pitch rotate CW; city grid around. 177–179 is a tighter top-down
    // of the ring/void, widening to the whole campus. ----
    { t0: 177.68, t1: 206.01, keys: [
      [177.68, -24, 70, -24, 185, -82, 0, 50],  // tighter top-down over the ring + void (dark paving)
      [183.0,  -24, 92, -24, 155, -85, 0, 54],  // widening + climbing, pool+track+pitch, slow CW rotation
      [189.0,  -24, 116, -26, 120, -87, 0, 58],  // almost straight down, city grid around
      [195.0,  -22, 134, -28, 85, -88, 0, 60],   // credit card era, very high top-down
      [201.0,  -22, 146, -28, 55, -88, 0, 62],
      [206.01, -22, 156, -28, 35, -89, 0, 64],
    ]},
    // ---- Shot 15 (206.01–207.84): tail / fade; hold the high top-down. ----
    { t0: 206.01, t1: 207.84, keys: [
      [206.01, -22, 156, -28, 35, -89, 0, 64],
      [207.84, -22, 158, -28, 32, -89, 0, 64],
    ]},
  ],
};
