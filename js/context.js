/* =========================================================================
 * context.js — everything outside the school wall: streets, the housing
 * estate south of the track, the towers to the east, Kowloon Tong villas,
 * the denser Kowloon skyline beyond, and the Lion Rock / Beacon Hill ridge
 * to the north (Hong Kong Island hills far to the south).
 * Neighbour placement is procedural but seeded, so it is identical per load.
 * ========================================================================= */
'use strict';
window.LSC = window.LSC || {};

(function () {
  const NTW = { ox: 1.6, oz: -110, dx: 0.684, dz: 0.729 }; // Nga Tsin Wai Rd axis

  function mats() {
    const D = LSC.Geo.defMat;
    D('estate', { tex: 'estate' });
    D('towerWhite', { tex: 'towerWhite' });
    D('towerBeige', { tex: 'towerBeige' });
    D('towerPink', { tex: 'towerPink' });
    D('towerGrey', { tex: 'towerGrey' });
    D('villa', { tex: 'villa' });
    D('roofLight', { color: 0xb8b6ae });
    D('cityGround', { tex: 'city' });
    D('road', { color: 0x5a5b5c });
    D('pitchGreen', { color: 0x4f9a55 });
    D('mountain', { color: 0xffffff });
  }

  // keep-out rectangles [x1, z1, x2, z2] (campus, roads, explicit blocks)
  const KEEP = [
    [-84, -102, 90, 102],      // campus box (diagonal handled separately)
    [-100, -900, -84, 900],    // La Salle Rd + verges
    [-900, 174, 900, 196],     // Boundary St
    [128, -900, 144, 900],     // College Rd
    [-900, -182, 400, -168],   // road north of the campus
    [-64, 102, 98, 150],       // housing estate
    [-235, 8, -148, 102],      // La Salle Primary pitch
  ];
  function inKeep(x1, z1, x2, z2) {
    for (const k of KEEP) if (x1 < k[2] && x2 > k[0] && z1 < k[3] && z2 > k[1]) return true;
    // Nga Tsin Wai Road corridor (diagonal)
    for (const [x, z] of [[x1, z1], [x2, z1], [x1, z2], [x2, z2], [(x1 + x2) / 2, (z1 + z2) / 2]]) {
      const rx = x - NTW.ox, rz = z - NTW.oz;
      const along = rx * NTW.dx + rz * NTW.dz, across = -rx * NTW.dz + rz * NTW.dx;
      if (along > -260 && along < 200 && Math.abs(across) < 9) return true;
    }
    return false;
  }

  /* Buildings sit on the lowest DTM point under their footprint (so a block on
     a slope is buried on its uphill side rather than floating downhill). */
  function block(B, mat, x1, z1, x2, z2, h) {
    const y0 = LSC.Terrain.minUnder(x1, z1, x2, z2) - 0.3;
    B.box({ side: mat, top: 'roofLight', bottom: 'roofLight' }, x1, y0, z1, x2, y0 + h, z2, { skip: 'b' });
  }

  /* Ground-hugging strip: P(u, v) -> [x, z] over u, v in 0..1, nu × nv quads,
     each vertex at DTM height + off. */
  function drape(B, key, P, nu, nv, off) {
    const M = LSC.Geo.MATS[key], BB = B.b(key), T = LSC.Terrain;
    const V = (i, j) => { const [x, z] = P(i / nu, j / nv); return [x, T.raw(x, z) + off, z]; };
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const a = V(i, j), b = V(i + 1, j), c = V(i + 1, j + 1), d = V(i, j + 1);
      // keep the triangles facing up whichever way P runs
      const up = (b[0] - a[0]) * (d[2] - a[2]) - (b[2] - a[2]) * (d[0] - a[0]) < 0;
      for (const p of up ? [a, b, c, a, c, d] : [a, c, b, a, d, c]) {
        BB.pos.push(p[0], p[1], p[2]); BB.nor.push(0, 1, 0); BB.uv.push(p[0] / M.tw, -p[2] / M.th);
      }
    }
  }
  function drapeRect(B, key, x1, z1, x2, z2, off) {
    drape(B, key, (u, v) => [x1 + (x2 - x1) * u, z1 + (z2 - z1) * v],
      Math.max(1, Math.ceil(Math.abs(x2 - x1) / 5)), Math.max(1, Math.ceil(Math.abs(z2 - z1) / 5)), off);
  }

  function streets(B) {
    const y = 0.12;
    drapeRect(B, 'road', -96, -900, -87, 400, y);
    drapeRect(B, 'road', -900, 178, 900, 192, y);
    drapeRect(B, 'road', 132, -900, 140, 900, y);
    drapeRect(B, 'road', -900, -178, 400, -171, y);
    // Nga Tsin Wai Road (diagonal), 10 m wide, outside the campus' NE wall
    const len = 460, cx = NTW.ox + NTW.dx * -30, cz = NTW.oz + NTW.dz * -30;
    drape(B, 'road', (u, v) => {
      const a = (u - 0.5) * len, c = (v - 0.5) * 10;
      return [cx + NTW.dx * a - NTW.dz * c, cz + NTW.dz * a + NTW.dx * c];
    }, Math.ceil(len / 5), 2, y);
    drapeRect(B, 'pitchGreen', -232, 12, -152, 98, 0.1);
  }

  function explicitBlocks(B) {
    // Housing estate directly south of the track (two rows of 12-13 storey slabs)
    const segs = [[-62, -33], [-29, 0], [4, 33], [37, 66], [70, 96]];
    segs.forEach(([a, b], i) => {
      block(B, 'estate', a, 103, b, 121, 36 + (i % 2) * 3);
      block(B, 'estate', a + 2, 127, b + 2, 146, 39 - (i % 2) * 3);
    });
    // Tall residential tower beyond the track's NE corner, and the towers east
    block(B, 'towerWhite', 76, -48, 93, -17, 74);
    block(B, 'towerGrey', 98, 6, 124, 26, 58);
    block(B, 'towerBeige', 98, 36, 122, 58, 52);
    block(B, 'towerGrey', 98, 66, 124, 92, 64);
    // La Salle Primary School (long white block south-west)
    block(B, 'towerWhite', -192, 104, -158, 146, 22);
    // Apartments lining the west side of La Salle Road
    const r = LSC.Tex.rng(1932);
    for (let z = -240; z < 170; z += 22 + r() * 8) {
      const d = 14 + r() * 10, h = 16 + r() * 18;
      const m = ['towerWhite', 'towerPink', 'villa', 'towerBeige'][Math.floor(r() * 4)];
      block(B, m, -100 - d - r() * 4, z, -101, z + 13 + r() * 6, h);
    }
    // Villas between the diagonal campus wall and Nga Tsin Wai Road
    for (let t = -40; t < 70; t += 16) {
      const x = 20.5 + (84 - 20.5) * (t + 40) / 110 + 10, z = -62 + 70.5 * (t + 40) / 110 - 9;
      block(B, r() < 0.5 ? 'villa' : 'towerBeige', x, z - 6, x + 11, z + 4, 10 + r() * 8);
    }
  }

  /* Procedural neighbourhood: low villas in Kowloon Tong (N/W/NE), high-rise
     to the east and south (Kowloon City), taller and sparser further out. */
  function neighbourhood(B) {
    const r = LSC.Tex.rng(6011932);
    const mats = ['towerWhite', 'towerBeige', 'towerPink', 'towerGrey', 'villa'];
    const step = 26;
    for (let gx = -900; gx < 900; gx += step) {
      for (let gz = -900; gz < 900; gz += step) {
        const cx = gx + r() * 8, cz = gz + r() * 8;
        const dist = Math.hypot(cx - 5, cz - 20);
        if (dist < 120) continue;
        if (r() < 0.18) continue;
        const w = 10 + r() * 12, d = 10 + r() * 12;
        const x1 = cx, z1 = cz, x2 = cx + w, z2 = cz + d;
        if (inKeep(x1 - 2, z1 - 2, x2 + 2, z2 + 2)) continue;
        let h;
        const south = cz > 196, east = cx > 144;
        if (south || east) h = 30 + r() * 55 + (dist > 500 ? r() * 40 : 0);
        else h = 9 + r() * 14 + (dist > 450 ? r() * 30 : 0);
        if (dist > 700 && r() < 0.5) continue;
        const m = (south || east) ? mats[Math.floor(r() * 4)] : (r() < 0.6 ? 'villa' : mats[Math.floor(r() * 4)]);
        block(B, m, x1, z1, x2, z2, h);
      }
    }
  }

  /* Mountains: a height field north of the city with the main named summits,
     vertex-coloured (vegetation green, rocky crown on Lion Rock). */
  function mountains(scene) {
    const D0 = window.LSC_DTM.trackHKPD;           // model y of sea level is −D0
    const peaks = [
      // [x, z, height, sigma]
      [400, -2560, 455, 430],      // Lion Rock massif
      [430, -2565, 80, 110],       // the "lion's head" rock crown
      [-1350, -2300, 420, 480],    // Beacon Hill
      [-450, -2450, 300, 420],     // saddle ridge between them
      [1500, -2500, 380, 500],     // Unicorn Ridge / Shatin Pass
      [2400, -2650, 560, 650],     // Tate's Cairn
      [3900, -1900, 590, 750],     // Kowloon Peak (Fei Ngo Shan)
      [-3200, -2600, 430, 900],    // Golden Hill / Smugglers' Ridge
      [-5400, -2900, 520, 1100],   // Tai Mo Shan shoulder (far NW)
      [600, -4200, 520, 1400],     // hills behind (Shatin side)
    ];
    function h(x, z) {
      let v = 0;
      for (const p of peaks) {
        const dx = x - p[0], dz = z - p[1];
        v += p[2] * Math.exp(-(dx * dx + dz * dz) / (2 * p[3] * p[3]));
      }
      v += 18 * Math.sin(x * 0.004) * Math.cos(z * 0.0037) + 9 * Math.sin(x * 0.011 + z * 0.007);
      return Math.max(0, v - 25);
    }
    function sheet(xa, xb, za, zb, nx, nz, fn) {
      const g = new THREE.PlaneGeometry(xb - xa, zb - za, nx, nz);
      g.rotateX(-Math.PI / 2);
      g.translate((xa + xb) / 2, 0, (za + zb) / 2);
      const p = g.attributes.position, col = [];
      const cLow = new THREE.Color(0x4f6f45), cHigh = new THREE.Color(0x6b7d5c), cRock = new THREE.Color(0x8d8a7f);
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), z = p.getZ(i), y = fn(x, z);
        p.setY(i, y);
        const c = cLow.clone().lerp(cHigh, Math.min(1, y / 500));
        if (y > 420 && Math.hypot(x - 430, z + 2565) < 260) c.lerp(cRock, 0.7);
        col.push(c.r, c.g, c.b);
      }
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
      m.receiveShadow = false;
      return m;
    }
    // Inside the DTM window the real terrain (terrain.js) is the ground; this
    // procedural sheet only fills the horizon beyond it, meeting its edge.
    const T = LSC.Terrain;
    scene.add(sheet(-9000, 9000, -7000, -950, 180, 70, (x, z) => (T.inFar(x, z) ? T.raw(x, z) - 3 : h(x, z) - D0)));
    // Hong Kong Island hills across the harbour, ~8 km south
    const island = [[-3600, 8400, 540, 900], [-1200, 8900, 430, 900], [1800, 8700, 500, 1000], [4300, 9200, 450, 1100]];
    scene.add(sheet(-9000, 9000, 6200, 11000, 120, 30, (x, z) => {
      let v = 0;
      for (const p of island) { const dx = x - p[0], dz = z - p[1]; v += p[2] * Math.exp(-(dx * dx + dz * dz) / (2 * p[3] * p[3])); }
      return Math.max(0, v - 20) - D0;
    }));
  }

  /* Distant city: low-detail boxes in a ring 0.9–3.5 km out, so the skyline in
     every video frame (Kowloon high-rise in all directions) is filled in. */
  function farCity(scene) {
    const r = LSC.Tex.rng(42);
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    const n = 1800;
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const inst = new THREE.InstancedMesh(g, mat, n);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    const palette = [0xdcd8cf, 0xcfc6b4, 0xe2d5cf, 0xb9bcc0, 0xeeeeea, 0xc8b9a0];
    let k = 0;
    while (k < n) {
      const a = r() * Math.PI * 2, d = 900 + Math.pow(r(), 0.8) * 2600;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (z < -1600) continue;                      // mountains there
      if (z < -900 && Math.abs(x) < 2500 && r() < 0.6) continue;
      const w = 18 + r() * 30, dd = 18 + r() * 30, h = 25 + r() * (z > 0 ? 110 : 70);
      const gy = LSC.Terrain.raw(x, z);
      if (gy > 45) continue;                        // wooded hillside, not city
      m.makeScale(w, h, dd).setPosition(x, gy - 1, z);
      inst.setMatrixAt(k, m);
      inst.setColorAt(k, c.setHex(palette[Math.floor(r() * palette.length)]));
      k++;
    }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    scene.add(inst);
  }

  function build(scene, colliders) {
    mats();
    // DTM ground (replaces the old flat city plane)
    LSC.Terrain.build(scene);
    const B = new LSC.Geo.Builder({ cast: true, receive: true, colliders });
    streets(B);
    explicitBlocks(B);
    neighbourhood(B);
    const group = new THREE.Group();
    group.name = 'context';
    B.build(group);
    scene.add(group);
    mountains(scene);
    farCity(scene);
    // trees along La Salle Road (both verges) and the campus edge
    const T = new LSC.Geo.Builder({ cast: true, receive: false, colliders });
    for (let z = -240; z < 170; z += 8.5) {
      treeAt(T, -98.5, z + 3);
      if (z > -100 && z < 100) treeAt(T, -84.5, z);
    }
    T.build(group);
  }
  function treeAt(B, x, z) {
    const y = LSC.Terrain.ground(x, z);
    B.box('trunk', x - 0.2, y, z - 0.2, x + 0.2, y + 3, z + 0.2);
    const g = new THREE.IcosahedronGeometry(3.2, 1);
    B.geom('tree', g, new THREE.Matrix4().makeScale(1, 0.85, 1).setPosition(x, y + 5.6, z));
  }

  LSC.Context = { build, NTW };
})();
