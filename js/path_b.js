'use strict';
// Camera path for "video B" — FPV drone flyover of La Salle College.
// World: +x east, +z south, +y up. yaw 0=N(-z) 90=E(+x) 180=S(+z) 270=W(-x).
// pitch = deg above horizon (neg = looking down). roll deg.
LSC.PATHS.B = {
  title: "FPV drone flyover",
  video: "reference/video/lsc_drone_flyover_d8X8myGUXjo.mp4",
  duration: 163.37,
  vfov: 74,
  shots: [
    // 0-8.37: open high and SOUTH of the campus looking N (Lion Rock ridge on the
    // horizon, red track + green pitch below-centre), descend NW over the west side
    // so the track slides to the left and the main block fills the frame (video 1-8 s).
    // 0-8.37: high (~70 m) over the La Salle Road / west side, looking NE across the
    // city with Lion Rock on the horizon; the red track + crest-tower block sit low in
    // the frame on the RIGHT. Drift N and descend a little (video 1-8 s).
    { t0: 0, t1: 8.37, keys: [
      [0, -60, 74, 58, 27, -20, 0, 82],
      [2, -63, 72, 50, 28, -20, -1, 82],
      [4, -66, 70, 40, 29, -19, -2, 82],
      [6, -70, 67, 28, 30, -18, -2, 82],
      [8.37, -74, 63, 14, 31, -17, -2, 82],
    ]},
    // 8.37-23: keep descending N over the west rooftops (campus roof low on the right),
    // then bank E over the NW corner and nose down into the main quad / basketball
    // court toward ground level (video 8-23 s).
    { t0: 8.37, t1: 23, keys: [
      [8.37, -74, 63, 14, 31, -17, -2, 82],
      [10.5, -78, 56, -2, 33, -16, -3, 82],
      [12.5, -80, 48, -18, 40, -18, -4, 80],
      [14.5, -72, 44, -40, 70, -24, -5, 80],
      [16, -40, 48, -58, 110, -30, -4, 78],
      [18, -22, 44, -46, 155, -44, 0, 76],
      [20, -22, 32, -28, 184, -56, 0, 76],
      [23, -14, 13, -24, 188, -30, 0, 74],
    ]},
    { t0: 23, t1: 36, keys: [
      [23, -14, 13, -24, 188, -30, 0, 74],
      [25, -8, 15.5, -24, 182, -30, 0, 76],
      [27, -8, 16.5, -20, 170, -16, -3, 78],
      [29, -6, 20, -16, 150, -12, -6, 80],
      // drop into the open ground storey (court level y10.3) and slip E through the
      // east wing's pilotis in the open picnic bay (z<-10, clear of the enclosed NE
      // room z-9.8..-3.8), out past the stair tower onto the east games courts, then
      // low over the red/green courts looking SE at the estate (video 33 s).
      [31, 0, 11.6, -16, 130, -6, -4, 80],
      [32.5, 11, 11.6, -24, 110, -4, -2, 80],
      [33.5, 26, 10.5, -22, 150, -5, 0, 80],
      [34.5, 30, 11.6, -2, 172, -5, 0, 80],
      [34.95, 30, 11.2, 9.6, 182, -6, 0, 81],
      [35.2, 30, 4, 14, 190, -4, 0, 82],
      // slide W and a touch N UNDER the open first-floor stand (slab underside y4.15),
      // staying low (y3.2) the whole way so the slab edge is never clipped; look S out
      // through the columns at the track + estate (video 36 s).
      [36, 12, 3.2, 7, 186, -3, 0, 82],
    ]},
    { t0: 36, t1: 54, keys: [
      [36, 12, 3.2, 7, 186, -3, 0, 82],
      // out from under the stand, low over the track's east end, swinging SW onto the
      // pitch (video 36-42 is low under/at the stand, then the GOOD 42-75 south sweep).
      [38, 20, 6, 18, 205, -5, 0, 82],
      [40, 24, 9, 26, 215, -6, 3, 80],
      [43, 12, 6, 42, 240, -5, 3, 80],
      [46, -4, 6, 56, 258, -5, 2, 80],
      [49, -18, 7, 66, 275, -5, -2, 80],
      [51, -19.76, 4.14, 73.64, 304.23, -4.56, -4.29, 80.76],
      [54, -16.59, 5.98, 74.22, 322.81, -0.13, -8.46, 82.72],
    ]},
    { t0: 54, t1: 79.33, keys: [
      [54, -16.59, 5.98, 74.22, 322.81, -0.13, -8.46, 82.72],
      [57, -2.01, 8.25, 64.57, 313.37, -10.8, -8.58, 80.92],
      [60, -10.5, 8.43, 43.65, 311.13, -16.54, -1.15, 79.35],
      [63, -28.08, 13.62, 47.06, 295.79, -10.98, 2.69, 79.59],
      [66, -49.13, 12.67, 42.73, 302.56, 0.91, 4.49, 76.92],
      [69, -55.91, 22.71, 46.09, 288.25, -11.39, 8.11, 79.83],
      // 72-79.33: stay LOW over the pitch/track looking N at the W wing + crest tower
      // (video 72-79 is oblique at the facade, NOT the old top-down into the quad),
      // then rise toward the quad edge.
      [72, -54, 16, 40, 315, -6, -4, 78],
      [75, -49, 16, 28, 345, -6, -3, 78],
      [77, -43, 17, 20, 358, -8, -2, 78],
      [79.33, -37, 21, 9, 20, -8, 0, 76],
    ]},
    { t0: 79.33, t1: 106.03, keys: [
      [79.33, -37, 21, 9, 20, -8, 0, 76],
      // The void is walled off from the track at every height except over the roof
      // (south wing core y13.15..33, z-9.8..4; rooms + podium below). So climb over the
      // south wing (y>34, z>3) until PAST the core's north edge (z<-9.8), THEN dive deep
      // into the open void and pull the nose UP: the camera ends low (y~11) in the void
      // looking UP at the six wrap-around gallery floors (video 78-93 s), court below.
      [80.3, -34, 36, 3, 55, -16, 2, 74],
      [81.3, -33, 36, -11, 95, -22, 2, 74],
      [82.5, -33, 22, -16, 135, -4, 0, 76],
      [84, -31, 12, -20, 20, 26, 0, 78],
      [87, -24, 11, -24, 70, 26, 0, 78],
      [90, -20, 11, -26, 112, 24, 0, 78],
      [93, -16, 11.5, -28, 150, 20, 0, 78],
      // 94-105: indoor corridor / nearest open gallery (approximate per brief).
      [95.5, -12, 14, -30, 195, -4, 0, 78],
      [97, -8, 14.5, -32, 215, -8, 0, 78],
      [100, -6, 14.5, -36, 235, -6, 0, 78],
      [103, -8, 15.5, -41.3, 260, -8, 2, 76],
      [106.03, -18, 20.5, -41.3, 290, -14, 0, 74],
    ]},
    { t0: 106.03, t1: 157.03, keys: [
      [106.03, -18, 20.5, -41.3, 290, -14, 0, 74],
      [107, -28, 38, -46, 320, -6, 0, 74],
      [108.5, -42, 40, -58, 350, -10, 0, 76],
      [110, -39.22, 20, -60.17, 9.12, -13.17, -9.54, 85.25],
      [112, -46.9, 17, -65.34, 4.81, -1.96, -5.66, 83.17],
      [114, -39.49, 15, -75.26, 353.82, -5, 4.43, 85.76],
      [118, -35.37, 30.68, -59.8, 314.37, -38.95, 0.32, 64.45],
      [122, -58.65, 20.94, -60.83, 12.04, -14.57, -8.91, 70.88],
      // leave the pool, drop to pilotis level (y~12) over the pool deck, then run S under
      // the north wing's open ground storey (core y13.15..33 above; columns on a 7 m grid,
      // so hold x-54.5, off the grid) into the OPEN void, then E under the east wing's
      // pilotis out onto the red/green east games courts (video 126-133 covered walkway).
      [123, -54.5, 12.5, -57.5, 100, -8, 0, 76],
      [124, -54.5, 12, -47, 110, -6, 0, 78],
      [125, -50, 12, -44, 110, -5, 0, 80],
      [126, -40, 12, -40, 105, -5, 0, 80],
      [128, -18, 11.5, -34, 100, -4, 0, 80],
      [130, 4, 11.5, -32, 105, -4, 0, 80],
      [131.5, 14, 11.5, -28, 115, -4, 0, 80],
      [133, 24, 11, -22, 145, -5, 0, 80],
      [134.5, 32, 11, -8, 165, -6, 0, 80],
      [136, 32, 11, 20, 205, -7, 0, 80],
      [138, 24, 8, 42, 250, -7, 0, 82],
      // 138-157: drop LOW (~4-6 m) over the track and fly S along the lanes, nose roughly
      // down-track (yaw ~180-210) so the lanes run into frame, the estate slabs flank both
      // sides and the city skyline sits in the gap at the end (video 138-162). NOT the old
      // estate-wall head-on.
      [140, 14, 6, 50, 230, -6, 0, 82],
      [142, 8, 5, 55, 210, -5, 0, 82],
      [144, 6, 5, 56, 200, -5, 0, 82],
      [147, 3, 4, 56, 188, -4, 0, 82],
      [150, 2, 4, 56, 182, -4, 0, 82],
      [153, 2, 4, 60, 180, -3, 0, 82],
      [157.03, -1, 4.5, 64, 182, -4, 0, 82],
    ]},
    { t0: 157.03, t1: 163.37, keys: [
      [157.03, -1, 4.5, 64, 182, -4, 0, 82],
      [159, -2, 5, 70, 184, -5, 0, 82],
      [161, -3, 5.5, 76, 186, -6, 0, 82],
      [163.37, -4, 6, 82, 188, -7, 0, 80],
    ]},
  ],
};
