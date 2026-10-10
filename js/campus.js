/* =========================================================================
 * campus.js — the La Salle College campus (current 1982 building).
 *
 * WORLD COORDINATES (metres): +x = east, +z = SOUTH, +y = up, y 0 = track.
 * Derived from the Esri z19 satellite mosaic (reference/photos/
 * satellite_lsc_z19.jpg, 3.62 px/m) with the roof-lean of the oblique capture
 * removed (roofs at 33 m appear ~11 m north of their footprint), cross-checked
 * against the nadir drone frames and ground photos.
 *   world x = gx - 130,  world z = 260 - gy   (gx/gy = reference/data grid)
 *
 * Main block: a ring of seven-to-eight storey classroom wings (pinwheel corners —
 * each wing runs a little past its corner, see ring()) around a void holding the
 * LOWER quadrangle (slate paving, planters, tables) to the west and, a half level
 * up behind a retaining wall, the UPPER quadrangle (basketball court) to the
 * east — no block between them. All four corner arms are classroom wing ends (no
 * towers); the crest is on the SW arm's south end wall. The 50 m pool lies north of
 * the ring, enclosed by a 4-storey gallery block (N), a 2-storey block (E) and
 * a slim block on La Salle Road (W). Statue garden + driveway sit between the
 * west wing and La Salle Road.
 * ========================================================================= */
'use strict';
window.LSC = window.LSC || {};

(function () {
  const F0 = 8.5, FH = 3.5, NF = 7, ROOF = F0 + NF * FH; // 33 m
  const RING = { x1: -66, x2: 18, z1: -57, z2: 4 };
  const VOID = { x1: -49, x2: 2, z1: -43, z2: -12 };
  const GD = 2.2; // gallery depth
  // The lower quad and the basketball court are NOT split by a block: the court
  // is a raised podium whose west edge is a one-storey retaining wall with a
  // planter row at its foot (video B 0:19, nadir video A 2:59: edge at x ≈ −19).
  const STEP_X = -19;
  // The ring is not a plain square: each wing runs a little past the corner it
  // meets (pinwheel), seen in the nadir frame of video A (2:59) and the satellite.
  //   NW  north wing continues west to the pool's La Salle Road block, terraced
  //       south face over the statue garden (also the stepped wing left of the
  //       crest tower in the track-side photos)
  // All four arms are the SAME thing — the end of a classroom wing carried past the
  // corner (user correction; nadir video A 3:04 / 3:10): classroom facades on every
  // face, the main roof and cap, stepped balconies on the face that looks back along
  // the wing it overhangs. No separate towers.
  //   NE  east wing carried north past the north face (x 1..18, ≈ 11 m; nadir 3:10),
  //       balconies on its west face over the pool's east block (5 storeys, video A 2:04)
  //   SE  south wing carried east past the east face (x 18 → 25.5), south facade fins
  //       and stands continue across it, balconies on its north face; a two-storey green
  //       podium carrying the east games courts continues east along the track (video A 1:45)
  //   SW  west wing carried south past the south face (z 4 → 9.5, satellite), balconies
  //       on its east face over the stands; the crest is on its south end wall (photos)
  const EW = RING.x2;                              // east wing outer face
  const NW = { x1: -79, z1: -57, z2: -47 };        // NW arm (x2 = RING.x1)
  const NE = { x1: 1, x2: 18, z1: -68 };           // NE arm (z2 = RING.z1)
  const SE = { x2: 25.5, z1: -9.8 };               // SE arm (x1 = EW, z2 = RING.z2)
  const SW = { x1: -66, x2: -52, z2: 9.5 };        // SW arm (z1 = RING.z2)
  // Levels (LandsD DTM, see terrain.js): the track terrace is y 0; the La Salle
  // Road terrace that carries the ring, pool and garden is y 8.5 (= F0), so the
  // south face shows G + 1/F below it while the void shows an open ground floor
  // plus six gallery floors above the lower quad (video A 22 s, video B 19 s).
  const GL = LSC.Terrain.TERRACE;     // lower quad, pool deck, garden, driveway
  const EY = LSC.Terrain.EAST;        // east games courts
  const STAND_Y = 4.5;                // 1/F stand slab on the track side
  // Upper quad: a half-level (~1.8 m, ten steps, video B 0:24 / 0:33, video A 0:48) above
  // the lower quad. Its colonnade still has full headroom, so the void's ground storey is
  // tall (~5 m over the lower quad) and the six gallery floors above it are ~3.25 m apart.
  const COURT_Y = GL + 1.8;
  const GALLERY0 = COURT_Y + 3.2, GFH = (ROOF - GALLERY0) / 6;

  function mats() {
    const D = LSC.Geo.defMat;
    D('classroom', { tex: 'classroom', y0: F0 });
    D('gallery', { tex: 'gallery', y0: F0 });
    D('galleryV', { tex: 'gallery', y0: GALLERY0 - GFH, th: 2 * GFH }); // void faces, 3.25 m floors
    D('white', { color: 0xf0eee6 });
    D('cream', { color: 0xe2dcc8 });
    D('darkcap', { color: 0x4b4e50 });
    D('roof', { tex: 'roof' });
    D('parapet', { color: 0xc4c2b8 });
    D('green', { color: 0x2c6a52 });
    D('greyPod', { tex: 'podiumGrey', y0: 0 });
    D('darkGrey', { color: 0x3c3f41 });
    D('concrete', { color: 0xa19e95 });
    D('railPanel', { color: 0xd8dde0, transparent: true, opacity: 0.5, double: true, noShadow: true });
    D('fence', { color: 0x5f6b62, transparent: true, opacity: 0.35, double: true, noShadow: true });
    D('tiles', { tex: 'tiles' });
    D('slate', { tex: 'slate' });
    D('grass', { tex: 'grass' });
    D('redcourt', { tex: 'redcourt' });
    D('asphalt', { tex: 'asphalt' });
    D('sports', { tex: 'sports' });
    D('court', { tex: 'court' });
    D('greencourt', { color: 0x3f8a52 });
    D('pool', { tex: 'pool' });
    D('crest', { tex: 'crest', transparent: true, alphaTest: 0.3, depthWrite: true, noShadow: true });
    D('wallSign', { tex: 'wallSign', noShadow: true });
    D('tree', { color: 0x3f6e2f });
    D('treeDark', { color: 0x2f5a26 });
    D('palm', { color: 0x5b8a3a, double: true });
    D('trunk', { color: 0x6d5640 });
    D('statue', { color: 0xf4f3ee });
    D('granite', { color: 0xbfb39a });
    D('metal', { color: 0xb9bec2 });
    D('seat', { color: 0x9aa3a8 });
    D('umbrella', { color: 0xf3f1ea, double: true });
    D('planter', { color: 0xc98a3a });
    D('ac', { color: 0xc9cbc6 });
    D('glass', { color: 0x4f5e6a });
    D('blueSeat', { color: 0x2f4fa8 });
    D('net', { color: 0xffffff, transparent: true, opacity: 0.45, double: true, noShadow: true });
  }

  /* ---------- small furniture helpers ---------- */
  function tree(B, x, z, s, dark, y) {
    s = s || 1; y = y || 0;
    B.box('trunk', x - 0.18 * s, y, z - 0.18 * s, x + 0.18 * s, y + 2.6 * s, z + 0.18 * s, { solid: true });
    const g = new THREE.IcosahedronGeometry(2.4 * s, 1);
    const m = new THREE.Matrix4().makeScale(1, 0.8, 1).setPosition(x, y + 4.2 * s, z);
    B.geom(dark ? 'treeDark' : 'tree', g, m);
  }
  function palm(B, x, z, h, y) {
    h = h || 7; y = y || 0;
    B.box('trunk', x - 0.15, y, z - 0.15, x + 0.15, y + h, z + 0.15);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      const g = new THREE.PlaneGeometry(3.4, 0.7);
      const m = new THREE.Matrix4()
        .makeRotationY(-a)
        .multiply(new THREE.Matrix4().makeRotationZ(-0.45))
        .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))
        .multiply(new THREE.Matrix4().makeTranslation(1.6, 0, 0));
      m.setPosition(x, y + h, z);
      B.geom('palm', g, m);
    }
  }
  function umbrellaTable(B, x, z, y) {
    y = y || 0;
    B.box('trunk', x - 0.04, y, z - 0.04, x + 0.04, y + 2.3, z + 0.04, { solid: false });
    const g = new THREE.ConeGeometry(1.5, 0.5, 8, 1, true);
    B.geom('umbrella', g, new THREE.Matrix4().setPosition(x, y + 2.4, z));
    B.box('metal', x - 0.6, y + 0.7, z - 0.6, x + 0.6, y + 0.75, z + 0.6, { solid: false });
  }
  /* Granite flame-urn monument at the centre of the lower quadrangle (video A
     22 s, 34 s): square stone pad, pedestal, bowl with four corner posts, flame. */
  function flameUrn(B, x, z, y0) {
    B.box('granite', x - 2.2, y0, z - 2.2, x + 2.2, y0 + 0.15, z + 2.2);
    B.box('granite', x - 0.9, y0 + 0.15, z - 0.9, x + 0.9, y0 + 1.1, z + 0.9);
    const lathe = (pts, y, ox, oz) => {
      const g = new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), 16);
      B.geom('granite', g, new THREE.Matrix4().setPosition(x + (ox || 0), y0 + y, z + (oz || 0)));
    };
    lathe([[0.55, 0], [0.45, 0.4], [0.7, 0.7], [1.15, 1.0], [1.25, 1.5], [1.1, 1.75], [0, 1.75]], 1.1);
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      B.box('granite', x + sx * 1.05 - 0.28, y0 + 1.1, z + sz * 1.05 - 0.28, x + sx * 1.05 + 0.28, y0 + 3.0, z + sz * 1.05 + 0.28, { solid: false });
      lathe([[0.25, 0], [0.18, 0.25], [0, 0.45]], 3.0, sx * 1.05, sz * 1.05);
    }
    lathe([[0.6, 0], [0.5, 0.5], [0.3, 1.0], [0, 1.5]], 2.85);
  }
  function goal(B, x, z, dir) {
    const d = 1.8 * dir, w = 3.66, h = 2.44;
    B.box('white', x - 0.06, 0, z - w - 0.06, x + 0.06, h, z - w + 0.06, { solid: false });
    B.box('white', x - 0.06, 0, z + w - 0.06, x + 0.06, h, z + w + 0.06, { solid: false });
    B.box('white', x - 0.06, h - 0.12, z - w, x + 0.06, h, z + w, { solid: false });
    B.box('net', Math.min(x, x + d), 0, z - w, Math.max(x, x + d), h, z + w, { solid: false, skip: (dir > 0 ? 'w' : 'e') + 'b' });
  }
  function railing(B, x1, z1, x2, z2, y, h) {
    h = h || 1.1;
    const t = 0.05;
    if (Math.abs(x2 - x1) > Math.abs(z2 - z1)) {
      B.box('railPanel', x1, y + 0.1, z1 - 0.01, x2, y + h - 0.08, z1 + 0.01, { solid: false });
      B.box('white', x1, y + h - 0.08, z1 - t, x2, y + h, z1 + t, { solid: false });
    } else {
      B.box('railPanel', x1 - 0.01, y + 0.1, z1, x1 + 0.01, y + h - 0.08, z2, { solid: false });
      B.box('white', x1 - t, y + h - 0.08, z1, x1 + t, y + h, z2, { solid: false });
    }
  }
  function acUnits(B, x, z, nx, nz) {
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const ax = x + i * 1.6, az = z + j * 1.4;
      B.box('ac', ax, ROOF, az, ax + 1.1, ROOF + 1.0, az + 0.9, { solid: false });
    }
  }
  function polyFlat(B, key, pts, y) {
    y += B.dy || 0;
    const v2 = pts.map((p) => new THREE.Vector2(p[0], p[1]));
    const tris = THREE.ShapeUtils.triangulateShape(v2, []);
    for (const t of tris) {
      const a = pts[t[0]], b = pts[t[1]], c = pts[t[2]];
      // ensure counter-clockwise seen from above (+y normal)
      const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      const M = LSC.Geo.MATS[key], BB = B.b(key);
      const tri = cross < 0 ? [a, b, c] : [a, c, b];
      for (const p of tri) {
        BB.pos.push(p[0], y, p[1]); BB.nor.push(0, 1, 0);
        BB.uv.push(p[0] / M.tw, -p[1] / M.th);
      }
    }
  }

  /* Builder view that raises everything by dy — the pool, garden and courts are
     laid out relative to their own terrace (see terrain.js PADS). */
  function lifted(B, dy) {
    const T = new THREE.Matrix4().makeTranslation(0, dy, 0);
    return {
      dy,
      b: (k) => B.b(k),
      box: (m, x1, y1, z1, x2, y2, z2, o) => B.box(m, x1, y1 + dy, z1, x2, y2 + dy, z2, o),
      flat: (k, x1, z1, x2, z2, y) => B.flat(k, x1, z1, x2, z2, y + dy),
      decal: (k, c, n) => B.decal(k, c.map((p) => [p[0], p[1] + dy, p[2]]), n),
      geom: (k, g, m) => B.geom(k, g, m ? T.clone().multiply(m) : T),
      obox: (k, cx, cz, len, wid, y1, y2, a, o) => B.obox(k, cx, cz, len, wid, y1 + dy, y2 + dy, a, o),
    };
  }

  /* ---------- the main ring building ---------- */
  function ring(B) {
    const R = RING, V = VOID;
    const cS = V.z2 + GD, cN = V.z1 - GD, cW = V.x1 - GD, cE = V.x2 + GD;
    const outer = { side: 'classroom', top: 'roof', bottom: 'white' };

    // Wing cores. Their ground storey around the void is OPEN (video B 0:94–1:00 and
    // 2:06–2:13: the drone flies under column-lined covered walkways): the north wing
    // is pilotis right through to the pool deck west of the pool's east block, the
    // east wing right through to the east games courts (picnic tables), the west and
    // south wings have a 6 m colonnade along the void with rooms behind it.
    const OT = GALLERY0 - 0.35;                     // underside of the first gallery slab
    const lowFloor = (x) => (x < STEP_X ? GL : COURT_Y);
    B.box({ n: 'classroom', s: 'galleryV', e: 'classroom', w: 'classroom', top: 'roof', bottom: 'white' }, R.x1, OT, R.z1, EW, ROOF, cN);
    B.box({ w: 'classroom', e: 'galleryV', top: 'roof', bottom: 'white', side: 'classroom' }, R.x1, OT, cN, cW, ROOF, cS, { skip: 'ns' });
    B.box({ e: 'classroom', w: 'galleryV', top: 'roof', bottom: 'white', side: 'classroom' }, cE, OT, cN, EW, ROOF, cS, { skip: 'ns' });
    // plinths up to each open floor (lower quad level W of the retaining wall, court level E)
    B.box({ side: 'darkGrey', top: 'tiles' }, R.x1, 0, R.z1, STEP_X, GL, cS, { skip: 't' }); // terrace pad shows on top
    B.box({ side: 'darkGrey', top: 'tiles' }, STEP_X, 0, R.z1, EW, COURT_Y, cN, { skip: 'w' });
    B.box({ side: 'darkGrey', top: 'tiles' }, cE, 0, cN, EW, COURT_Y, cS, { skip: 'w' });
    B.box({ side: 'darkGrey', top: 'tiles' }, V.x2, 0, cN, cE, COURT_Y, cS, { skip: 'ewns' });
    B.box({ side: 'darkGrey', top: 'tiles' }, STEP_X, GL, cN, V.x2, COURT_Y, V.z1, { skip: 'ens' });
    B.box({ side: 'darkGrey', top: 'tiles' }, STEP_X, GL, V.z2, V.x2, COURT_Y, cS, { skip: 'ens' });
    // enclosed ground-storey rooms: NE corner behind the pool's east block, and the
    // rooms behind the west / south colonnades
    B.box({ side: 'gallery', top: 'white' }, -15, COURT_Y, R.z1, EW, OT, cN - 5, { skip: 't' });
    B.box({ side: 'gallery', top: 'white' }, R.x1, GL, cN, cW - 6, OT, cS, { skip: 't' });
    // columns of the open ground storey (≈ 7 m grid)
    const col = (x, z, y0) => B.box('white', x - 0.4, y0, z - 0.4, x + 0.4, OT, z + 0.4);
    for (let x = R.x1 + 1; x <= -15; x += 7) { col(x, R.z1 + 0.6, GL); col(x, (R.z1 + cN) / 2, lowFloor(x)); }
    for (let x = R.x1 + 1; x < EW; x += 7) col(x, cN - 0.4, lowFloor(x));
    for (let z = cN + 3; z < cS; z += 7) {
      col(cW - 0.4, z, GL); col(cE + 0.4, z, COURT_Y);
      col((cE + EW) / 2, z, COURT_Y); col(EW - 0.6, z, COURT_Y);
    }
    // a few picnic tables under the east wing (video B 2:06)
    for (const [tx, tz] of [[9, -36], [9, -28], [9, -20], [13, -32], [13, -24]]) {
      B.box('metal', tx - 0.9, COURT_Y + 0.7, tz - 0.4, tx + 0.9, COURT_Y + 0.76, tz + 0.4, { solid: false });
      B.box('metal', tx - 0.9, COURT_Y + 0.42, tz - 0.75, tx + 0.9, COURT_Y + 0.46, tz - 0.55, { solid: false });
      B.box('metal', tx - 0.9, COURT_Y + 0.42, tz + 0.55, tx + 0.9, COURT_Y + 0.46, tz + 0.75, { solid: false });
    }
    // Corner arms (pinwheel): each is a wing end carried past the corner, built the same
    // way — classroom block to the main roof, overhanging dark cap, and stepped balcony
    // slabs with railings on every classroom floor along one face. `face` names that
    // face; `from`/`to` trim the balcony run where it meets the neighbouring wing.
    function arm(x1, z1, x2, z2, y0, skip, face, from, to) {
      B.box({ side: 'classroom', top: 'roof', bottom: 'white' }, x1, y0, z1, x2, ROOF, z2, { skip });
      for (let k = 1; k < NF; k++) {
        const y = F0 + k * FH;
        const S = { top: 'tiles', side: 'white', bottom: 'white' };
        if (face === 's') { B.box(S, from, y - 0.3, z2, to, y, z2 + 1.6); railing(B, from, z2 + 1.6, to, z2 + 1.6, y); }
        if (face === 'n') { B.box(S, from, y - 0.3, z1 - 1.6, to, y, z1); railing(B, from, z1 - 1.6, to, z1 - 1.6, y); }
        if (face === 'w') { B.box(S, x1 - 1.6, y - 0.3, from, x1, y, to); railing(B, x1 - 1.6, from, x1 - 1.6, to, y); }
        if (face === 'e') { B.box(S, x2, y - 0.3, from, x2 + 1.6, y, to); railing(B, x2 + 1.6, from, x2 + 1.6, to, y); }
      }
      B.box({ top: 'roof', side: 'darkcap', bottom: 'darkcap' }, x1 - 0.6, ROOF - 0.9, z1 - 0.6, x2 + 0.6, ROOF + 0.25, z2 + 0.6, { skip: '' });
    }
    // NW: north wing carried west over the garden, balconies on the south face
    arm(NW.x1, NW.z1, R.x1, NW.z2, 0, 'e', 's', NW.x1, R.x1);
    B.box('white', NW.x1, F0, NW.z2, R.x1, F0 + 0.35, NW.z2 + 3.2); // canopy over the garden
    // NE: east wing carried north, balconies on the west face over the pool's east block
    arm(NE.x1, NE.z1, NE.x2, R.z1, COURT_Y, 's', 'w', NE.z1, R.z1);
    B.box({ side: 'darkGrey', top: 'tiles' }, NE.x1, 0, NE.z1, NE.x2, COURT_Y, R.z1, { skip: 's' });
    // SE: south wing carried east; below F0 it shares the south wing's podium and stand
    // (built with the south facade), balconies on the north face over the east courts
    arm(EW, SE.z1, SE.x2, R.z2, F0, 'w', 'n', EW + 0.6, SE.x2);
    // SW: west wing carried south past the south face, on columns over the podium
    // lawn; balconies on the east face over the stands, crest on its south end wall
    arm(SW.x1, cS, SW.x2, SW.z2, 12, 'n', 'e', 4.8, SW.z2);
    // South wing above the podium (x from the crest tower to the east end); its void
    // storey is a 6 m colonnade between the west and east wings, rooms behind
    B.box({ s: 'classroom', n: 'galleryV', e: 'classroom', w: 'classroom', top: 'roof', bottom: 'white' }, -52, OT, cS, R.x2, ROOF, R.z2);
    B.box({ s: 'classroom', side: 'gallery', top: 'white' }, -52, F0, cS + 6, R.x2, OT, R.z2, { skip: 't' });
    B.box({ side: 'gallery', top: 'white' }, cE, F0, cS, R.x2, OT, cS + 6, { skip: 'ts' });
    B.box({ side: 'darkGrey', top: 'tiles' }, STEP_X, F0, cS, cE, COURT_Y, cS + 6, { skip: 's' });
    for (let x = cW + 3; x < cE; x += 7) col(x, cS + 0.4, lowFloor(x));
    // South wing ground + first floor (rooms behind the open stand)
    B.box({ side: 'greyPod', n: 'gallery', top: 'white' }, -52, 0, cS, SE.x2, F0, -4);
    B.box('darkGrey', -52, STAND_Y, -4, SE.x2, F0, -2, { skip: 'b' });
    // under-tower recess + west part of the south wing at podium level
    B.box('darkGrey', -65, 8, -9.5, -53, 12, 2, { skip: 'b' });
    B.box({ side: 'gallery', top: 'white' }, R.x1, 0, cS, -52, 8, -6);

    // Galleries around the void: slab edges each floor, railings, columns
    const levels = [];
    for (let k = 0; k <= 6; k++) levels.push(GALLERY0 + k * GFH);
    for (const y of levels) {
      const t = 0.35, top = y === ROOF;
      const mat = top ? { top: 'roof', side: 'white', bottom: 'white' } : { top: 'tiles', side: 'white', bottom: 'white' };
      B.box(mat, cW, y - t, V.z2, cE, y, cS);      // south gallery
      B.box(mat, cW, y - t, cN, cE, y, V.z1);      // north gallery
      B.box(mat, cW, y - t, V.z1, V.x1, y, V.z2);  // west gallery
      B.box(mat, V.x2, y - t, V.z1, cE, y, V.z2);  // east gallery
      if (!top) {
        railing(B, V.x1, V.z2, V.x2, V.z2, y);
        railing(B, V.x1, V.z1, V.x2, V.z1, y);
        railing(B, V.x1, V.z1, V.x1, V.z2, y);
        railing(B, V.x2, V.z1, V.x2, V.z2, y);
      }
    }
    // white floor-edge bands on the void face (seen in every courtyard shot)
    for (let x = V.x1; x <= V.x2 + 0.01; x += (V.x2 - V.x1) / 12) {
      B.box('white', x - 0.22, GL, V.z2 - 0.22, x + 0.22, ROOF, V.z2 + 0.22);
      B.box('white', x - 0.22, GL, V.z1 - 0.22, x + 0.22, ROOF, V.z1 + 0.22);
    }
    for (let z = V.z1 + (V.z2 - V.z1) / 8; z < V.z2 - 0.01; z += (V.z2 - V.z1) / 8) {
      B.box('white', V.x1 - 0.22, GL, z - 0.22, V.x1 + 0.22, ROOF, z + 0.22);
      B.box('white', V.x2 - 0.22, GL, z - 0.22, V.x2 + 0.22, ROOF, z + 0.22);
    }

    // Quadrangle floors (the void below GL is solid podium)
    B.box('greyPod', V.x1, 0, V.z1, V.x2, GL, V.z2, { skip: 'tnsewb' });
    B.flat('slate', V.x1, V.z1, STEP_X, V.z2, GL + 0.02);
    // raised court podium: dark retaining wall onto the lower quad, railing on top,
    // a planter row at its foot and a stair up at the south end
    B.box({ side: 'darkGrey', top: 'tiles' }, STEP_X, GL, V.z1, V.x2, COURT_Y - 0.36, V.z2, { skip: 't' });
    B.box('white', STEP_X, COURT_Y - 0.36, V.z1, V.x2, COURT_Y, V.z2, { skip: 't' });
    railing(B, STEP_X, V.z1, STEP_X, V.z2 - 3, COURT_Y);
    for (let z = V.z1 + 1; z < V.z2 - 4.5; z += 2.2) {
      B.box('white', STEP_X - 1.4, GL, z, STEP_X - 0.2, GL + 0.6, z + 1.6);
      B.box('tree', STEP_X - 1.3, GL + 0.6, z + 0.1, STEP_X - 0.3, GL + 1.3, z + 1.5, { solid: false });
    }
    for (let i = 0; i < 10; i++) {
      const y = GL + (i + 1) * (COURT_Y - GL) / 10;
      B.box('concrete', STEP_X - 3 + i * 0.3, GL, V.z2 - 2.8, STEP_X - 2.7 + i * 0.3, y, V.z2 - 0.2);
    }
    B.decal('court', [[STEP_X, COURT_Y + 0.01, V.z2], [V.x2, COURT_Y + 0.01, V.z2], [V.x2, COURT_Y + 0.01, V.z1], [STEP_X, COURT_Y + 0.01, V.z1]], [0, 1, 0]);
    // basketball hoops at both ends of the court (long axis N-S)
    for (const s of [-1, 1]) {
      const cz = (V.z1 + V.z2) / 2 + s * 13.2, cx = (STEP_X + V.x2) / 2;
      B.box('metal', cx - 0.1, COURT_Y, cz + s * 1.2 - 0.1, cx + 0.1, COURT_Y + 3.4, cz + s * 1.2 + 0.1);
      B.box('white', cx - 0.9, COURT_Y + 2.9, cz - 0.03, cx + 0.9, COURT_Y + 3.95, cz + 0.03, { solid: false });
    }
    // lower quadrangle: planters (green beds with orange kerbs), tables, trees
    const planters = [[-44, -38], [-37, -38], [-30, -38], [-44, -30], [-30, -30]];
    for (const [px, pz] of planters) {
      B.box('planter', px - 1.6, GL, pz - 1.6, px + 1.6, GL + 0.5, pz + 1.6, { skip: 't' });
      B.flat('grass', px - 1.4, pz - 1.4, px + 1.4, pz + 1.4, GL + 0.5);
    }
    for (const [ux, uz] of [[-42, -22], [-36, -19], [-30, -23], [-25, -17], [-40, -15], [-26, -27]]) umbrellaTable(B, ux, uz, GL);
    for (const [tx, tz] of [[-45, -17], [-23, -36], [-44, -24]]) tree(B, tx, tz, 0.55, true, GL);
    flameUrn(B, -34.5, -27.5, GL);

    // Roof: dark overhanging cap, parapets, AC plant, stair houses
    const cap = (x1, z1, x2, z2) => B.box({ top: 'roof', side: 'darkcap', bottom: 'darkcap' }, x1, ROOF - 0.9, z1, x2, ROOF + 0.25, z2, { skip: '' });
    cap(R.x1 - 0.6, R.z1 - 0.6, EW + 0.6, cN);
    cap(R.x1 - 0.6, cS, R.x2 + 0.6, R.z2 + 0.7);
    cap(R.x1 - 0.6, cN, cW, cS);
    cap(cE, cN, EW + 0.6, cS);
    acUnits(B, -40, -6, 6, 2); acUnits(B, -10, -6, 5, 2); acUnits(B, 8, -30, 2, 6);
    acUnits(B, -62, -36, 2, 5); acUnits(B, -30, -55, 6, 2);
    B.box('white', -24, ROOF, -54, -14, ROOF + 3, -47);
    B.box('white', 8, ROOF, -54, 15, ROOF + 3, -48);
    B.box('white', -2, ROOF, -6, 6, ROOF + 2.6, 1);

    // ---- South facade: podium, stands, fins ----
    const SX1 = -52, SX2 = SE.x2; // south facade runs across the SE arm
    // ground floor: open, columns on the track side
    B.flat('tiles', SX1, -4, SX2, 9, 0.02);
    for (let x = SX1 + 2; x < SX2; x += 8) B.box('white', x - 0.35, 0, 2.9, x + 0.35, STAND_Y, 3.6);
    // first-floor stand: floor slab, stepped seating, green parapet band
    B.box({ top: 'concrete', side: 'white', bottom: 'white' }, SX1, STAND_Y - 0.35, -4, SX2, STAND_Y, 8.7);
    for (let i = 0; i < 4; i++) B.box('concrete', SX1, STAND_Y, -2 + i * 2, SX2, STAND_Y + 0.45 * (4 - i), -2 + (i + 1) * 2);
    B.box('green', SX1, STAND_Y, 8.4, SX2, STAND_Y + 1.15, 8.75);
    // second-floor deep fascia (upper green band) under the slab
    B.box('green', SX1, F0 - 1.15, 4, SX2, F0, 6.3);
    for (let x = SX1 + 2; x < SX2; x += 8) B.box('white', x - 0.3, STAND_Y, 5.6, x + 0.3, F0 - 1.15, 6.2);
    // vertical fins + thin sun ledges on the classroom floors
    for (let x = SX1; x <= SX2 + 0.01; x += 4) B.box('white', x - 0.15, F0, 4, x + 0.15, ROOF - 0.9, 4.75);
    for (let k = 0; k < NF; k++) {
      const y = F0 + k * FH + 1.05;
      B.box('white', SX1, y - 0.1, 4, SX2, y + 0.02, 4.5, { solid: false });
    }
    // ground-level bleachers along the track
    for (let i = 0; i < 3; i++) B.box({ top: 'seat', side: 'metal' }, SX1 + 3, 0, 9 + i * 0.75, SX2 - 6, 0.45 * (3 - i), 9.75 + i * 0.75, { solid: i === 0 });

    // ---- SW arm (built in ring()): columns under it and the crest on its south end ----
    for (const x of [-63.5, -54.5]) B.box('white', x - 0.7, 0, 7.7, x + 0.7, 12, 9.1);
    // crest high on the south end wall, on a white panel, just under the roof cap (photos)
    B.box('white', -64.2, 21.4, 9.5, -53.8, 32.1, 9.65);
    B.decal('crest', [[-63.4, 22.2, 9.7], [-54.6, 22.2, 9.7], [-54.6, 31.5, 9.7], [-63.4, 31.5, 9.7]], [0, 0, 1]);

    // ---- East of the SE arm a two-storey podium with green bands carries the east games
    // courts (y EY) along the track, low stands at its foot (video A 1:45, birds-eye rendering) ----
    B.box({ side: 'greyPod', top: 'redcourt' }, SE.x2, 0, RING.z2 - 1, 46, EY, 8.8, { skip: 't' });
    B.box('green', SE.x2, 4.2, 8.8, 46, 5.4, 9.1);
    B.box('green', SE.x2, EY - 1.2, 8.8, 46, EY, 9.1);
    for (let x = SE.x2 + 4; x < 46; x += 7) B.box('white', x - 0.3, 0, 8.8, x + 0.3, EY, 9.2);
    for (let i = 0; i < 3; i++) B.box({ top: 'seat', side: 'metal' }, SE.x2 + 2, 0, 9.3 + i * 0.75, 44, 0.45 * (3 - i), 10.05 + i * 0.75, { solid: i === 0 });
    railing(B, SE.x2, 9.0, 46, 9.0, EY);

    // ---- Grey podium west of the crest tower: retains the terrace, lawn on top ----
    B.box({ side: 'greyPod', top: 'concrete' }, -80, 0, -6, -52, GL, 9);
    B.flat('grass', -78, -4, -67, 7, GL + 0.03);
    railing(B, -80, 9, -52, 9, GL);
    // white pergola frame on the podium's west end (seen from the track)
    for (let i = 0; i < 5; i++) B.box('white', -79.5 + i * 1.6, GL, 6, -79.3 + i * 1.6, GL + 2.5, 9, { solid: false });
  }

  /* ---------- pool complex north of the ring ---------- */
  function poolComplex(B) {
    const z1 = -84, z2 = RING.z1, x1 = -74, x2 = -17;
    B.flat('tiles', x1, z1, x2, z2, 0.02);
    B.box('white', -72.6, 0, -81.1, -21.4, 0.06, -60.9, { skip: 't', solid: false });
    B.decal('pool', [[-72, 0.07, -61.5], [-22, 0.07, -61.5], [-22, 0.07, -80.5], [-72, 0.07, -80.5]], [0, 1, 0]);
    // north block: 4 storeys, galleries facing the pool, white slab bands
    const nz = -98, ncore = -86.2;
    B.box({ side: 'classroom', s: 'gallery', top: 'roof' }, -81, 0, nz, x2, 15, ncore);
    for (const y of [3.75, 7.5, 11.25, 15]) {
      B.box({ top: y === 15 ? 'roof' : 'tiles', side: 'white', bottom: 'white' }, -81, y - 0.45, ncore, x2, y, z1);
      if (y < 15) railing(B, -74, z1, x2, z1, y);
    }
    for (let x = -73; x < x2; x += 6) B.box('white', x - 0.2, 0, z1 - 0.4, x + 0.2, 15, z1);
    B.box('darkcap', -81.4, 15, nz - 0.4, x2 + 0.4, 15.6, z1 + 0.3);
    // east block: five storeys with galleries onto the pool deck, its roof a few metres
    // under the main roof (video A 2:04 / 2:12, nadir 3:10)
    const EH = 18;
    B.box({ side: 'classroom', w: 'gallery', top: 'roof' }, -14.8, 0, -91, 1, EH, RING.z1);
    for (let y = EH / 5; y <= EH + 0.01; y += EH / 5) {
      B.box({ top: y > EH - 0.1 ? 'roof' : 'tiles', side: 'white', bottom: 'white' }, x2, y - 0.4, z1, -14.8, y, RING.z1);
      if (y < EH - 0.1) railing(B, x2, z1, x2, RING.z1, y);
    }
    for (let z = z1 + 3; z < RING.z1; z += 6) B.box('white', x2 - 0.2, 0, z - 0.2, x2 + 0.2, EH, z + 0.2);
    B.box('darkcap', -15.2, EH, -91.4, 1.4, EH + 0.6, RING.z1);
    // west block on La Salle Road
    B.box({ side: 'classroom', top: 'roof' }, -81, 0, z1, -74.4, 16, z2);
    B.box('darkcap', -81.4, 16, z1 - 0.3, -74, 16.6, z2 + 0.3);
    // spectator stand + changing-room canopy on the deck
    for (let i = 0; i < 3; i++) B.box('blueSeat', -70 + i * 0, 0, -59.6 + i * 0.7 - 1.4, -26, 0.4 * (3 - i), -58.9 + i * 0.7 - 1.4, { solid: false });
  }

  /* ---------- statue garden + driveway (between west wing and La Salle Rd) ---------- */
  function garden(B) {
    B.flat('tiles', -81, RING.z1, RING.x1, -6, 0.02);
    B.flat('grass', -79.5, -45, -74, -40, 0.04);
    // round lawn with the statue of St John Baptist de La Salle
    const cx = -73, cz = -27;
    const lawn = [];
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; lawn.push([cx + Math.cos(a) * 5.5, cz + Math.sin(a) * 5.5]); }
    polyFlat(B, 'grass', lawn, 0.05);
    B.box('concrete', cx - 1.3, 0, cz - 1.3, cx + 1.3, 2.4, cz + 1.3);
    B.box('statue', cx - 0.5, 2.4, cz - 0.45, cx + 0.5, 4.0, cz + 0.45);
    B.box('statue', cx - 0.35, 4.0, cz - 0.3, cx + 0.35, 4.9, cz + 0.3);
    B.geom('statue', new THREE.SphereGeometry(0.28, 10, 8), new THREE.Matrix4().setPosition(cx, 5.15, cz));
    B.box('statue', cx + 0.5, 2.4, cz - 0.25, cx + 1.0, 3.4, cz + 0.25); // the child beside him
    // stone urns either side (video A 0:20)
    for (const [ux, uz] of [[-77.5, -18], [-77.5, -36]]) {
      B.box('concrete', ux - 0.6, 0, uz - 0.6, ux + 0.6, 1.0, uz + 0.6);
      B.geom('concrete', new THREE.CylinderGeometry(0.7, 0.4, 1.0, 10), new THREE.Matrix4().setPosition(ux, 1.5, uz));
    }
    palm(B, -77, -31, 8); palm(B, -69, -20, 7.5); palm(B, -77.5, -13, 8.5); palm(B, -69.5, -35, 7);
  }

  /* ---------- courts east of the ring (inside the diagonal boundary) ---------- */
  function eastCourts(B) {
    polyFlat(B, 'redcourt', [[20, -60], [20.5, -60], [83, 8.5], [20, 8.5]], 0.02);
    B.flat('greencourt', 25, -47, 37, -31, 0.04);
    B.flat('grass', 23, -14, 50, -3, 0.04);
    for (const [x, z] of [[25, -31], [37, -31], [25, -47], [37, -47]]) B.box('fence', x - 0.02, 0, z - 0.02, x + 0.02, 3, z + 0.02, { solid: false });
    // diagonal boundary wall (Nga Tsin Wai Road side) with a tree belt
    const ax = 20.5, az = -62, bx = 84, bz = 8.5;
    const len = Math.hypot(bx - ax, bz - az), ang = Math.atan2(bz - az, bx - ax);
    B.obox('white', (ax + bx) / 2, (az + bz) / 2, len, 0.4, 0, 3, ang, { solid: true });
    for (let t = 0.05; t < 1; t += 0.09) tree(B, ax + (bx - ax) * t + 3.5, az + (bz - az) * t - 3.2, 0.9, true);
  }

  /* ---------- sports ground: track, pitch, goals, east court, walls ---------- */
  function sportsGround(B) {
    const S = LSC.Tex.get('sports');
    const y = 0.03, X0 = S.x0, Z0 = S.z0, X1 = X0 + S.w, Z1 = Z0 + S.h;
    B.decal('sports', [[X0, y, Z1], [X1, y, Z1], [X1, y, Z0], [X0, y, Z0]], [0, 1, 0]);
    const T = LSC.Tex.TRACK;
    const gx0 = T.fx0 + 1.5, gx1 = T.fx1 - 1.5, mz = (T.fz0 + T.fz1) / 2;
    goal(B, gx0, mz, -1); goal(B, gx1, mz, 1);
    // training goals parked on the touchline
    goal(B, -10, 22.6, -1); goal(B, 20, 22.6, -1);
    // fenced court at the east end
    const ec = T.eastCourt;
    for (const [a, b, c, d] of [[ec[0] - 1.5, ec[1] - 1.5, ec[2] + 1.5, ec[1] - 1.5], [ec[0] - 1.5, ec[3] + 1.5, ec[2] + 1.5, ec[3] + 1.5]])
      B.box('fence', a, 0, b - 0.03, c, 4, d + 0.03, { solid: true });
    for (const x of [ec[0] - 1.5, ec[2] + 1.5]) B.box('fence', x - 0.03, 0, ec[1] - 1.5, x + 0.03, 4, ec[3] + 1.5, { solid: true });
    // south boundary wall against the housing estate
    B.box('white', -81, 0, 100.5, 88.5, 3.2, 101.2);
    // east retaining wall with the "La Salle College" lettering + crest
    B.box('white', 88, 0, 6, 89, 6.5, 101.2);
    B.decal('wallSign', [[87.95, 2.6, T.cz + 12], [87.95, 2.6, T.cz - 12], [87.95, 5.6, T.cz - 12], [87.95, 5.6, T.cz + 12]], [-1, 0, 0]);
    // west boundary along La Salle Road: a retaining wall from the inner level up to
    // the road (which falls from ≈ +9 by the pool to ≈ +5 by the track, DTM) with a
    // white lattice parapet on top; the driveway gate (z −46..−35) is at road level
    for (let z = -100; z < 100.5; z += 5) {
      const za = z, zb = Math.min(100.5, z + 5);
      if (zb > -46 && za < -35) continue;
      const inner = za + 2.5 < 9 ? GL : 0;
      const road = LSC.Terrain.raw(-90, (za + zb) / 2);
      const top = Math.max(inner, road) + 1.2;
      B.box('white', -82, Math.min(inner, road) - 0.5, za, -81, top, zb);
      B.box('railPanel', -81.8, top, za, -81.6, top + 1.2, zb, { solid: true });
    }
    for (const z of [-46.6, -35.4]) B.box('concrete', -82.6, GL, z - 0.6, -81.2, GL + 3, z + 0.6);
    // retaining wall between the east games courts and the sports ground
    B.box('white', 46, 0, 8.2, 88, EY + 0.1, 8.8);
    railing(B, 46, 8.5, 88, 8.5, EY);
    B.box('white', 19.8, GL, -60, 20.2, EY + 0.1, SE.z1);
  }

  function ground(B) {
    // campus aprons (concrete) on each terrace, inside the boundary
    for (const p of LSC.Terrain.PADS) if (p.name !== 'east') polyFlat(B, 'concrete', p.pts, p.y);
  }

  function build(scene, colliders) {
    mats();
    const B = new LSC.Geo.Builder({ cast: true, receive: true, colliders });
    ground(B);
    ring(B);
    poolComplex(lifted(B, GL));
    garden(lifted(B, GL));
    eastCourts(lifted(B, EY));
    sportsGround(B);
    const group = new THREE.Group();
    group.name = 'campus';
    B.build(group);
    scene.add(group);
    return group;
  }

  LSC.Campus = {
    build, RING, VOID, ROOF, F0, FH, COURT_Y,
    // landmarks for the HUD / map (x, z, label)
    POIS: [
      { x: -59, z: 9, y: 20, en: 'School Crest (SW wing)', zh: '校徽' },
      { x: -30, z: -27, y: 11.5, en: 'Lower Quadrangle', zh: '下操場' },
      { x: -7, z: -27, y: 15, en: 'Upper Quadrangle · Basketball', zh: '上操場 · 籃球場' },
      { x: -47, z: -71, y: 10.5, en: '50 m Swimming Pool', zh: '五十米泳池' },
      { x: -73, z: -27, y: 13.5, en: 'Statue of St John Baptist de La Salle', zh: '喇沙會祖像' },
      { x: 2, z: 56, y: 2, en: 'Football Pitch & Track', zh: '足球場及跑道' },
      { x: 63, z: 56, y: 3, en: 'Tennis Court', zh: '網球場' },
      { x: 36, z: -30, y: 12, en: 'Games Courts', zh: '球場' },
    ],
  };
})();
