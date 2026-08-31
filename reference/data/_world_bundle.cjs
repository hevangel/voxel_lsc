/* =========================================================================
 * La Salle College — Voxel Campus
 * palette.js — material palette shared by the voxel world, minimap and UI.
 * Each entry: hex color, optional emissive flag (glows at night).
 * ========================================================================= */
'use strict';

window.LSC = window.LSC || {};

LSC.Palette = (function () {
  const entries = [
    /*  0 */ { key: 'air', color: 0x000000 },
    /*  1 */ { key: 'grassLight', color: 0x5fae4c },
    /*  2 */ { key: 'grassDark', color: 0x4e9440 },
    /*  3 */ { key: 'pitchA', color: 0x2e6b33 },
    /*  4 */ { key: 'pitchB', color: 0x357639 },
    /*  5 */ { key: 'trackRed', color: 0xb44a38 },
    /*  6 */ { key: 'trackRedDark', color: 0x9c3f30 },
    /*  7 */ { key: 'lineWhite', color: 0xf2f2ee },
    /*  8 */ { key: 'sand', color: 0xd8c48e },
    /*  9 */ { key: 'pathLight', color: 0xc9c4b4 },
    /* 10 */ { key: 'concrete', color: 0xa5a49b },
    /* 11 */ { key: 'concreteDark', color: 0x6e6e66 },
    /* 12 */ { key: 'asphalt', color: 0x3e4348 },
    /* 13 */ { key: 'asphaltLine', color: 0xc9c9c9 },
    /* 14 */ { key: 'curb', color: 0x8f8d84 },
    /* 15 */ { key: 'facade', color: 0xf2eee2 },
    /* 16 */ { key: 'facadeShade', color: 0xddd8c8 },
    /* 17 */ { key: 'facadeTrim', color: 0xc9c2ac },
    /* 18 */ { key: 'fascia', color: 0x4a4f4a },
    /* 19 */ { key: 'roofGrey', color: 0x9aa0a0 },
    /* 20 */ { key: 'roofDark', color: 0x4a4f4c },
    /* 21 */ { key: 'glassDay', color: 0x9fb6b8 },
    /* 22 */ { key: 'windowDark', color: 0x37474b },
    /* 23 */ { key: 'windowLit', color: 0xf5d98f, emissive: true },
    /* 24 */ { key: 'colonnadeGreen', color: 0x2f6e52 },
    /* 25 */ { key: 'colonnadeGreenDark', color: 0x255a42 },
    /* 26 */ { key: 'doorBrown', color: 0x6b4e33 },
    /* 27 */ { key: 'doorBlue', color: 0x3a5e78 },
    /* 28 */ { key: 'plasterWhite', color: 0xf7f4ea },
    /* 29 */ { key: 'bleacherMetal', color: 0xb9b9b2 },
    /* 30 */ { key: 'railing', color: 0x8c9296 },
    /* 31 */ { key: 'poolFloor', color: 0x8fd0dd },
    /* 32 */ { key: 'poolEdge', color: 0xcfc5a8 },
    /* 33 */ { key: 'tennisBlue', color: 0x3e6f92 },
    /* 34 */ { key: 'tennisGreen', color: 0x4c8a55 },
    /* 35 */ { key: 'tennisLine', color: 0xe8e8e2 },
    /* 36 */ { key: 'soil', color: 0x8a6b4e },
    /* 37 */ { key: 'rock', color: 0x7d7a70 },
    /* 38 */ { key: 'mountainRock', color: 0x6e6a60 },
    /* 39 */ { key: 'mountainGrass', color: 0x5c8a4a },
    /* 40 */ { key: 'trunk', color: 0x6e5136 },
    /* 41 */ { key: 'leafBanyan', color: 0x3e7c3a },
    /* 42 */ { key: 'leafLight', color: 0x6fb35a },
    /* 43 */ { key: 'palm', color: 0x55a24a },
    /* 44 */ { key: 'bush', color: 0x4e8c3f },
    /* 45 */ { key: 'flowerRed', color: 0xc94f44 },
    /* 46 */ { key: 'flowerYellow', color: 0xe9b23b },
    /* 47 */ { key: 'flowerPurple', color: 0x7a4e9e },
    /* 48 */ { key: 'plinth', color: 0xede9dc },
    /* 49 */ { key: 'bronze', color: 0x4e5a50 },
    /* 50 */ { key: 'lampPost', color: 0x55584f },
    /* 51 */ { key: 'lampLight', color: 0xffe9b0, emissive: true },
    /* 52 */ { key: 'floodPole', color: 0x9aa0a4 },
    /* 53 */ { key: 'floodLight', color: 0xfff6dd, emissive: true },
    /* 54 */ { key: 'crestGold', color: 0xe9b23b },
    /* 55 */ { key: 'crestPurple', color: 0x5b2d82 },
    /* 56 */ { key: 'crestRed', color: 0xb03028 },
    /* 57 */ { key: 'houseWall', color: 0xd9cdb8 },
    /* 58 */ { key: 'houseRoof', color: 0xb0453a },
    /* 59 */ { key: 'apartmentWall', color: 0xc9bfb0 },
    /* 60 */ { key: 'apartmentGlass', color: 0x7e9aa0 },
    /* 61 */ { key: 'skyline', color: 0x8fa2b5 },
    /* 62 */ { key: 'skylineDark', color: 0x6c7f92 },
    /* 63 */ { key: 'signRed', color: 0xb03028 },
    /* 64 */ { key: 'busStopRed', color: 0x8e3038 },
    /* 65 */ { key: 'scoreboard', color: 0x26302c },
    /* 66 */ { key: 'seatBlue', color: 0x3e5e9e },
    /* 67 */ { key: 'seatRed', color: 0xb0453a },
    /* 68 */ { key: 'grottoRock', color: 0x8b8478 },
    /* 69 */ { key: 'candle', color: 0xffc978, emissive: true },
    /* 70 */ { key: 'stepping', color: 0xb8ad94 },
    /* 71 */ { key: 'waterDeep', color: 0x2e86b0 },
    /* 72 */ { key: 'goalWhite', color: 0xf5f5f2 },
    /* 73 */ { key: 'tartanBlue', color: 0x8a4a3c },
    /* 74 */ { key: 'skylineWindow', color: 0xffe2a8, emissive: true },
    /* 75 */ { key: 'psWall', color: 0xe7e2d6 },
    /* 76 */ { key: 'psTrim', color: 0x9a948a },
    /* 77 */ { key: 'bench', color: 0x7a5c3e },
    /* 78 */ { key: 'signWhite', color: 0xfdfcf8 },
    /* 79 */ { key: 'roofTerracotta', color: 0xa8563e },
    /* 80 */ { key: 'granite', color: 0x9a9284 },
    /* 81 */ { key: 'graniteDark', color: 0x877f72 },
    /* 82 */ { key: 'ochre', color: 0xc89a6a },
    /* 83 */ { key: 'glassCurtain', color: 0x4e7e96 },
    /* 84 */ { key: 'lawn', color: 0x3f8c3c },
    /* 85 */ { key: 'courtGreen', color: 0x3f8f5a },
    /* 86 */ { key: 'courtRed', color: 0xb65a48 },
    /* 87 */ { key: 'poolWaterDeep', color: 0x1f7fa8 },
    /* 88 */ { key: 'waterShallow', color: 0x63c4de },
    /* 89 */ { key: 'gateMetal', color: 0xb9c2c6 },
    /* 90 */ { key: 'crestBronze', color: 0x6b5b33 },
    /* 91 */ { key: 'umbrella', color: 0xf0ece2 },
    /* 92 */ { key: 'planter', color: 0x8f8878 },
    /* 93 */ { key: 'canopyWhite', color: 0xf4f2ec },
    /* 94 */ { key: 'turfDark', color: 0x29602e },
    /* 95 */ { key: 'wallDark', color: 0x3c3f3d },
    /* 96 */ { key: 'houseGarden', color: 0x4a8a40 },
    /* 97 */ { key: 'roofSlab', color: 0x5d5f5e },
    /* 98 */ { key: 'slabWall', color: 0xd8cfc0 },
    /* 99 */ { key: 'slabGlass', color: 0x8ba3ad },
    /* 100 */ { key: 'hillGrass', color: 0x557f42 },
    /* 101 */ { key: 'hillTree', color: 0x3a6e33 },
    /* 102 */ { key: 'signPurple', color: 0x5b2d82 },
    /* 103 */ { key: 'fenceMesh', color: 0x6f8a72 },
    /* 104 */ { key: 'wingWhite', color: 0xe8e4d8 },
  ];
  const colors = new Uint8Array(entries.length * 3);
  const emissive = new Uint8Array(entries.length);
  const byKey = {};
  entries.forEach((e, i) => {
    colors[i * 3] = (e.color >> 16) & 255;
    colors[i * 3 + 1] = (e.color >> 8) & 255;
    colors[i * 3 + 2] = e.color & 255;
    emissive[i] = e.emissive ? 1 : 0;
    byKey[e.key] = i;
  });
  return { entries, colors, emissive, byKey, id: (k) => byKey[k] || 0 };
})();
/* =========================================================================
 * voxel.js — VoxelWorld data structure, primitives and chunk mesher.
 *
 * The world is a dense Uint8Array of material ids (0 = air). One voxel =
 * LSC.SCALE (0.5 m) so building detail reads fine. The mesher produces one
 * BufferGeometry per CHUNK×CHUNK column chunk with hidden faces culled,
 * per-face directional shading and classic corner AO baked into vertex
 * colors. Emissive materials go into a second geometry/material so they can
 * glow at night. LSC.U(m) converts metres to voxel units.
 * ========================================================================= */
'use strict';

(function () {
  const SCALE = 0.5;                 // metres per voxel
  const W = 640, H = 128, D = 640;   // 320 m × 64 m × 320 m
  const CHUNK = 80;                  // 40 m chunks

  LSC.SCALE = SCALE;
  LSC.U = (m) => Math.round(m / SCALE);

  class VoxelWorld {
    constructor() {
      this.W = W; this.H = H; this.D = D; this.CHUNK = CHUNK;
      this.data = new Uint8Array(W * H * D);
      // column max height (topmost solid y + 1) to speed up meshing
      this.colTop = new Int16Array(W * D);
    }

    idx(x, y, z) { return x + z * W + y * W * D; }
    inside(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < W && y < H && z < D; }

    get(x, y, z) {
      if (!this.inside(x, y, z)) return 0;
      return this.data[x + z * W + y * W * D];
    }

    set(x, y, z, m) {
      if (!this.inside(x, y, z)) return;
      x |= 0; y |= 0; z |= 0;
      this.data[x + z * W + y * W * D] = m;
      const ci = x + z * W;
      if (m !== 0 && y + 1 > this.colTop[ci]) this.colTop[ci] = y + 1;
    }

    /* only set if the cell is currently air */
    setIfAir(x, y, z, m) { if (this.get(x, y, z) === 0) this.set(x, y, z, m); }

    solid(x, y, z) { return this.get(x, y, z) !== 0; }

    surfaceY(x, z) {
      // topmost solid voxel at column (or -1)
      if (!this.inside(x, 0, z)) return -1;
      for (let y = this.colTop[x + z * W] - 1; y >= 0; y--) {
        if (this.data[x + z * W + y * W * D] !== 0) return y;
      }
      return -1;
    }

    /* ---------------- primitives (coordinates in voxels) ---------------- */

    box(x1, y1, z1, x2, y2, z2, m, hollow) {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++)
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
          for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) {
            if (hollow && x > Math.min(x1, x2) && x < Math.max(x1, x2) &&
              y > Math.min(y1, y2) && y < Math.max(y1, y2) &&
              z > Math.min(z1, z2) && z < Math.max(z1, z2)) continue;
            this.set(x, y, z, m);
          }
    }

    boxShell(x1, y1, z1, x2, y2, z2, m) { this.box(x1, y1, z1, x2, y2, z2, m, true); }

    /* hollow room: walls + ceiling + floor of given materials, clears interior */
    room(x1, y1, z1, x2, y2, z2, wallM, floorM, ceilM) {
      this.box(x1, y1, z1, x2, y2, z2, 0); // clear
      for (let x = x1; x <= x2; x++) for (let z = z1; z <= z2; z++) {
        this.set(x, y1, z, floorM); this.set(x, y2, z, ceilM);
      }
      for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) {
        this.set(x, y, z1, wallM); this.set(x, y, z2, wallM);
      }
      for (let z = z1; z <= z2; z++) for (let y = y1; y <= y2; y++) {
        this.set(x1, y, z, wallM); this.set(x2, y, z, wallM);
      }
    }

    column(x, y1, y2, z, m) { for (let y = y1; y <= y2; y++) this.set(x, y, z, m); }

    /* vertical cylinder of radius r (filled) between y1..y2 */
    cylinder(cx, cz, r, y1, y2, m, hollowTop) {
      const r2 = r * r;
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++)
        for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++) {
          const dx = x - cx, dz = z - cz;
          if (dx * dx + dz * dz <= r2 + 0.4) {
            for (let y = y1; y <= y2; y++) this.set(x, y, z, m);
            if (hollowTop) this.set(x, y2 + 1, z, 0);
          }
        }
    }

    ellipse(cx, cz, rx, rz, y, m, fill) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
        for (let z = Math.floor(cz - rz); z <= Math.ceil(cz + rz); z++) {
          const dx = (x - cx) / rx, dz = (z - cz) / rz;
          const d = dx * dx + dz * dz;
          if (d <= 1 && (fill || d >= 0.72)) this.set(x, y, z, m);
        }
    }

    /* ellipse ring between two normalized radii (for the track) */
    ellipseRing(cx, cz, rx, rz, r0, r1, y, m) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
        for (let z = Math.floor(cz - rz); z <= Math.ceil(cz + rz); z++) {
          const dx = (x - cx) / rx, dz = (z - cz) / rz;
          const d = Math.sqrt(dx * dx + dz * dz);
          if (d >= r0 && d <= r1) this.set(x, y, z, m);
        }
    }

    /* stamp a terrain platform: fill columns up to height h (top solid = h).
       material fill = soil/rock, top = surface material. */
    platform(x1, z1, x2, z2, h, topM, fillM) {
      for (let x = x1; x <= x2; x++) for (let z = z1; z <= z2; z++) {
        if (x < 0 || z < 0 || x >= W || z >= D) continue;
        const cur = this.surfaceY(x, z);
        if (cur < h) {
          for (let y = cur + 1; y <= h; y++) this.set(x, y, z, y === h ? topM : fillM);
          if (cur >= 0 && this.get(x, cur, z) === 0) this.set(x, cur, z, fillM);
        } else {
          // dig down (keep at least y=1 bedrock)
          for (let y = cur; y > h; y--) this.set(x, y, z, 0);
          this.set(x, h, z, topM);
        }
        this.colTop[x + z * W] = h + 1;
      }
    }

    /* paint only the top surface voxel of each column in a rect (if solid) */
    paintTop(x1, z1, x2, z2, m) {
      for (let x = x1; x <= x2; x++) for (let z = z1; z <= z2; z++) {
        const y = this.surfaceY(x, z);
        if (y >= 0) this.set(x, y, z, m);
      }
    }

    /* paint surface where a predicate passes; fn(y,x,z) -> material or null */
    paintTopWhere(x1, z1, x2, z2, fn) {
      for (let x = x1; x <= x2; x++) for (let z = z1; z <= z2; z++) {
        const y = this.surfaceY(x, z);
        if (y >= 0) { const m = fn(y, x, z); if (m) this.set(x, y, z, m); }
      }
    }

    /* ---------------- mesher ---------------- */

    /* Builds chunk geometry for voxel rect [cx1..cx2]×[cz1..cz2] (arg order
       (x1, z1, x2, z2) — do not swap!). Only scans up to the tallest column. */
    buildChunkGeometry(cx1, cz1, cx2, cz2) {
      const pos = [], nor = [], col = [], ind = [];
      const epos = [], enor = [], ecol = [], eind = [];
      const P = LSC.Palette;
      const cols = P.colors, emis = P.emissive;
      const data = this.data;

      const dirs = [
        { n: [1, 0, 0], corners: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], shade: 0.86 },
        { n: [-1, 0, 0], corners: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]], shade: 0.86 },
        { n: [0, 1, 0], corners: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]], shade: 1.00 },
        { n: [0, -1, 0], corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], shade: 0.55 },
        { n: [0, 0, 1], corners: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], shade: 0.80 },
        { n: [0, 0, -1], corners: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], shade: 0.80 },
      ];

      const occ = (x, y, z) => (x >= 0 && y >= 0 && z >= 0 && x < W && y < H && z < D) ? (data[x + z * W + y * W * D] !== 0 ? 1 : 0) : 0;

      function vertAO(side1, side2, corner) {
        if (side1 && side2) return 0.62;
        return 1 - 0.16 * (side1 + side2 + corner);
      }

      // tallest column in this chunk bounds the y scan
      let yMax = 0;
      for (let z = cz1; z <= cz2; z++) {
        const base = z * W;
        for (let x = cx1; x <= cx2; x++) {
          if (this.colTop[base + x] > yMax) yMax = this.colTop[base + x];
        }
      }
      if (yMax > H) yMax = H;

      for (let y = 0; y < yMax; y++) {
        for (let z = cz1; z <= cz2; z++) {
          const rowBase = z * W + y * W * D;
          for (let x = cx1; x <= cx2; x++) {
            const m = data[x + rowBase];
            if (m === 0) continue;
            const isEm = emis[m] === 1;
            for (let d = 0; d < 6; d++) {
              const dir = dirs[d];
              if (occ(x + dir.n[0], y + dir.n[1], z + dir.n[2])) continue;
              const base = isEm ? [epos, enor, ecol, eind] : [pos, nor, col, ind];
              const Pp = base[0], Nn = base[1], Cc = base[2], Ii = base[3];
              const vi = Pp.length / 3;
              const cr = cols[m * 3] / 255, cg = cols[m * 3 + 1] / 255, cb = cols[m * 3 + 2] / 255;
              const t1a = dir.n[0] === 0 ? 0 : 1;
              const t2a = dir.n[2] === 0 ? 2 : 1;
              const ox = x + dir.n[0], oy = y + dir.n[1], oz = z + dir.n[2];
              for (let c = 0; c < 4; c++) {
                const cn = dir.corners[c];
                Pp.push(x + cn[0], y + cn[1], z + cn[2]);
                Nn.push(dir.n[0], dir.n[1], dir.n[2]);
                let ao = 1;
                if (!isEm) {
                  const o1 = [0, 0, 0], o2 = [0, 0, 0];
                  o1[t1a] = cn[t1a] * 2 - 1;
                  o2[t2a] = cn[t2a] * 2 - 1;
                  const s1 = occ(ox + o1[0], oy + o1[1], oz + o1[2]);
                  const s2 = occ(ox + o2[0], oy + o2[1], oz + o2[2]);
                  const cc = occ(ox + o1[0] + o2[0], oy + o1[1] + o2[1], oz + o1[2] + o2[2]);
                  ao = vertAO(s1, s2, cc);
                }
                const sh = isEm ? 1 : dir.shade * ao;
                Cc.push(cr * sh, cg * sh, cb * sh);
              }
              Ii.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
            }
          }
        }
      }

      function toGeom(p, n, c, i) {
        if (!p.length) return null;
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
        g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
        g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
        g.setIndex(i);
        return g;
      }
      return {
        opaque: toGeom(pos, nor, col, ind),
        emissive: toGeom(epos, enor, ecol, eind),
      };
    }
  }

  /* ---------------- scenery helpers (unit = 0.5 m) ---------------- */

  function plantTree(v, x, y, z, rng, type) {
    const t = type || (rng() < 0.62 ? 'banyan' : 'light');
    const leafM = t === 'palm' ? P.id('palm') : t === 'light' ? P.id('leafLight') : P.id('leafBanyan');
    const trunkM = P.id('trunk');
    // trunk 3.5–6 m tall
    const th = t === 'palm' ? 12 + ((rng() * 5) | 0) : 7 + ((rng() * 5) | 0);
    for (let i = 1; i <= th; i++) v.set(x, y + i, z, trunkM);
    if (t === 'palm') {
      // fronds: 6–8 radiating arcs of voxels (canopy radius ~4.5 m)
      const n = 6 + ((rng() * 2.99) | 0);
      for (let a = 0; a < n; a++) {
        const ang = a * Math.PI * 2 / n + rng() * 0.3;
        const dx = Math.cos(ang), dz = Math.sin(ang);
        for (let r = 2; r <= 9; r++) {
          const fx = x + Math.round(dx * r), fz = z + Math.round(dz * r);
          const fy = y + th + (r <= 4 ? 2 : r <= 6 ? 1 : 0) - (r >= 8 ? 1 : 0);
          v.set(fx, fy, fz, leafM);
          if (r === 5 || r === 6) v.set(fx, fy - 1, fz, leafM);
        }
      }
      v.set(x, y + th + 2, z, leafM);
    } else {
      // canopy ellipsoid, radius ~7 u (3.5 m) banyan / 5 u light
      const rw = t === 'banyan' ? 7.2 : 5.0;
      const rh = t === 'banyan' ? 6.0 : 4.6;
      for (let dx = -8; dx <= 8; dx++) for (let dy = -2; dy <= 7; dy++) for (let dz = -8; dz <= 8; dz++) {
        const d = (dx * dx) / (rw * rw) + ((dy - 1.5) * (dy - 1.5)) / (rh * rh) + (dz * dz) / (rw * rw);
        if (d <= 1 && v.get(x + dx, y + th + dy, z + dz) === 0 && rng() > d * 0.35 - 0.1) {
          v.set(x + dx, y + th + dy, z + dz, leafM);
        }
      }
      if (t === 'banyan') { // hanging aerial roots
        for (let i = 0; i < 4; i++) {
          const ax = x + ((rng() * 9) | 0) - 4, az = z + ((rng() * 9) | 0) - 4;
          if (v.get(ax, y + th - 1, az) !== 0) continue;
          for (let yy = y + th - 1; yy > y + 1 && v.get(ax, yy, az) === 0; yy--) v.set(ax, yy, az, trunkM);
        }
      }
    }
  }

  function plantPalm(v, x, y, z, rng) { plantTree(v, x, y, z, rng, 'palm'); }

  function bush(v, x, y, z, rng) {
    const m = P.id('bush');
    v.set(x, y, z, m);
    if (rng() < 0.8) v.set(x + 1, y, z, m);
    if (rng() < 0.8) v.set(x, y, z + 1, m);
    if (rng() < 0.6) v.set(x + 1, y, z + 1, m);
    if (rng() < 0.5) v.set(x, y + 1, z, m);
    if (rng() < 0.4) v.set(x - 1, y, z, m);
  }

  function flowers(v, x, y, z, rng) {
    const pick = [P.id('flowerRed'), P.id('flowerYellow'), P.id('flowerPurple')];
    v.set(x, y, z, pick[(rng() * 3) | 0]);
    if (rng() < 0.5) v.set(x + 1, y, z, pick[(rng() * 3) | 0]);
  }

  const P = LSC.Palette;
  LSC.Voxel = { VoxelWorld, CHUNK, W, H, D, SCALE, U: LSC.U, plantTree, plantPalm, bush, flowers };
})();
/* =========================================================================
 * world.js — builds the whole La Salle College voxel campus.
 *
 * Ground truth: reference/articles/RESEARCH_NOTES.md (rev 2) — drone video
 * frames, Esri satellite mosaic, OSM footprints, user's site plan.
 *
 * Grid: 640×640 columns × 128 high, 1 voxel = LSC.SCALE = 0.5 m.
 * +x = EAST, +z = SOUTH (north = −z). Campus-local METERS are authored via
 *   XM(m) = 120 + 2m   (0 m = granite wall on La Salle Road, +east)
 *   ZM(m) = 590 − 2m   (0 m = Boundary Street wall, +north)
 *   Y(m)  = 22  + 2m   (0 m = campus ground level)
 * Campus box ≈ 225 m (E-W) × 295 m (N-S): track field SOUTH, ring building
 * MIDDLE, pool quad NORTH-WEST, entrance forecourt SOUTH-WEST.
 * ========================================================================= */
'use strict';

(function () {
  const P = LSC.Palette;
  const id = P.id;
  const W = LSC.Voxel.W, D = LSC.Voxel.D;

  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* accumulators filled during build */
  const worldFlags = [];
  const signAnchors = [];
  const parkedCars = [];

  function buildWorld(onProgress) {
    const v = new LSC.Voxel.VoxelWorld();
    const XM = (m) => 120 + Math.round(m * 2);
    const ZM = (m) => 590 - Math.round(m * 2);
    const Y = (m) => 22 + Math.round(m * 2); // campus-relative height
    const rng = mulberry(19320106);
    const step = (name, frac) => { if (onProgress) onProgress(name, frac); };

    const yGround = Y(0);            // 22 campus ground
    const yRoadS = Y(-3);            // Boundary St level
    const yRoadW = Y(-2);            // La Salle Rd level
    const yPool = Y(-2);             // pool deck (sunken 2 m)
    const yWater = Y(-2.75);         // pool water

    /* box in campus metres: (x west..east, z north..south) + campus-relative y */
    const boxM = (x1, z1, x2, z2, y1, y2, m, hollow) =>
      v.box(XM(Math.min(x1, x2)), Y(y1), ZM(Math.max(z1, z2)),
            XM(Math.max(x1, x2)), Y(y2), ZM(Math.min(z1, z2)), m, hollow);
    const floorAt = (x1, z1, x2, z2, h, topM, fillM) =>
      v.platform(XM(Math.min(x1, x2)), ZM(Math.max(z1, z2)),
                 XM(Math.max(x1, x2)), ZM(Math.min(z1, z2)), Y(h), topM, fillM);
    const paintM = (x1, z1, x2, z2, m) =>
      v.paintTop(XM(Math.min(x1, x2)), ZM(Math.max(z1, z2)),
                 XM(Math.max(x1, x2)), ZM(Math.min(z1, z2)), m);
    const colM = (x, z, y1, y2, m) => v.column(XM(x), Y(y1), Y(y2), ZM(z), m);
    const surfM = (x, z) => {
      const y = v.surfaceY(XM(x), ZM(z));
      return (y - yGround) / 2; // metres relative to campus ground
    };

    /* ------------------------------------------------ base terrain */
    step('Surveying the hillside…', 0.02);
    for (let gx = 0; gx < W; gx++) {
      for (let gz = 0; gz < D; gz++) {
        for (let y = 1; y <= 8; y++) v.set(gx, y, gz, y === 8 ? id('grassDark') : id('soil'));
      }
    }

    /* campus ground (slight rise toward north) */
    floorAt(0, -2, 230, 295, 0, id('grassLight'), id('soil'));
    /* Boundary St + south strip */
    floorAt(-20, -22, 260, 0, -3, id('grassDark'), id('soil'));
    /* west strip across La Salle Rd (LSPS side) */
    floorAt(-60, 0, -14, 240, -1, id('grassLight'), id('soil'));
    /* north strip: Nga Tsin Wai Rd + screen */
    floorAt(0, 284, 230, 295, -1, id('grassLight'), id('soil'));
    /* east strip: College Rd + slab base */
    floorAt(225, 40, 260, 295, -1, id('grassLight'), id('soil'));

    /* north hillside screen (dense green, rises ~14 m) */
    step('Raising the green backdrop…', 0.05);
    for (let x = -20; x <= 250; x += 1) {
      for (let z = 284; z <= 295; z += 1) {
        const gx = XM(x), gz = ZM(z);
        const cur = v.surfaceY(gx, gz);
        const hM = 2 + (z - 284) * 0.9 + Math.sin(x * 0.13) * 1.5 + rng() * 1.2;
        const h = Y(Math.min(hM, 13));
        if (cur < h) for (let y = cur + 1; y <= h; y++)
          v.set(gx, y, gz, y === h ? (rng() < 0.75 ? id('hillTree') : id('hillGrass')) : id('soil'));
      }
    }

    /* ------------------------------------------- roads */
    step('Tarmacking the streets…', 0.08);
    const asphaltRect = (x1, z1, x2, z2, h) => {
      floorAt(x1, z1, x2, z2, h, id('asphalt'), id('soil'));
    };
    /* Boundary Street (E-W) */
    asphaltRect(-20, -8, 260, -2, -3);
    for (let x = -20; x <= 260; x += 2) if ((x % 4) < 2) paintM(x, -5, x + 1, -5, id('asphaltLine'));
    /* La Salle Road (N-S) — climbs gently north */
    asphaltRect(-14, -8, -2, 295, -2);
    for (let z = -8; z <= 295; z += 2) if ((z % 4) < 2) paintM(-8, z, -8, z + 1, id('asphaltLine'));
    /* sidewalks */
    for (let z = -8; z <= 295; z++) { paintM(-2, z, -1, z, id('pathLight')); paintM(-14, z, -13, z, id('pathLight')); }
    /* College Road (E) */
    asphaltRect(226, 30, 234, 295, -1);
    /* Nga Tsin Wai Road (N, slight diagonal feel via two bands) */
    asphaltRect(0, 286, 150, 292, -1);
    asphaltRect(150, 282, 230, 288, -1);

    /* ------------------------------------------------ boundary walls */
    /* south: dark wall + hedge (the thick black line in the site plan) */
    boxM(-20, 0, 260, 1.5, 0, 3.5, id('wallDark'));
    for (let x = -20; x <= 258; x += 1.5) LSC.Voxel.bush(v, XM(x), Y(3.5), ZM(2), rng);
    /* west: granite ashlar wall along La Salle Rd with gate opening (y 175..190) */
    const graniteWall = (z1, z2) => {
      for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z += 0.5) {
        for (let x = 0; x <= 2; x += 0.5) {
          const m = (Math.floor(z * 2) % 7 < 2 || Math.floor(x * 2) % 5 === 0)
            ? id('graniteDark') : id('granite');
          v.set(XM(x), yRoadW + 5, ZM(z), m);
          if (z % 2 < 1) v.set(XM(x), yRoadW + 4, ZM(z), m);
        }
      }
      boxM(0, Math.min(z1, z2), 2, Math.max(z1, z2), -2, 1.5, id('granite'));
    };
    graniteWall(2, 175); graniteWall(190, 295);
    /* wall cap (white tiled coping) */
    boxM(0, 2, 2, 175, 1.5, 2, id('signWhite'));
    boxM(0, 190, 2, 295, 1.5, 2, id('signWhite'));
    /* gate piers + sliding gate (metal, crest cutouts) */
    for (const gz of [174, 191]) {
      boxM(0, gz - 1, 2.5, gz + 1, -2, 4.5, id('graniteDark'));
      boxM(0, gz - 0.5, 2.5, gz + 0.5, 4.5, 5.5, id('signWhite'));
    }
    boxM(2.5, 175, 2.5, 190, -2, 3.5, id('gateMetal'));
    /* east boundary: low wall + fence along College Rd */
    boxM(224, 40, 225, 284, 0, 1.5, id('concreteDark'));

    /* ------------------------------------------------ main building ring */
    step('Building the classroom ring…', 0.14);
    const facade = id('facade'), facadeSh = id('facadeShade');
    const glass = id('glassDay'), glassLit = id('windowLit'), winDark = id('windowDark');
    const fin = id('signWhite');
    const green = id('colonnadeGreen'), greenDark = id('colonnadeGreenDark');
    const fascia = id('fascia'), roofDeck = id('roofGrey');
    const ochre = id('ochre');

    /* floors: ground colonnade 22..31, then 6 floors of 7u to y73, fascia 73..74
       (campus-relative metres: ground 0..4.5, floors ~3.5 m) */
    const FLOOR_TOPS = [31, 38, 45, 52, 59, 66, 73];
    /* wing box builder: solid slabs + banded outer faces + carved corridor side
       corridorSide: which face opens onto the courtyard (+z/-z/+x/-x in metres) */
    const FLOORS_N = 6;

    /* banded wall along an x-run at metre-z, facing +z (south) or -z (north) */
    const bandedX = (x1, x2, z, yFloor, faceS, litSeed) => {
      const y1 = FLOOR_TOPS[yFloor - 1] + 1, y2 = FLOOR_TOPS[yFloor] - 1;
      for (let x = x1; x <= x2; x += 0.5) {
        const isFin = Math.round(x * 2) % 7 === 0;
        for (let y = y1; y <= y2; y++) {
          let m;
          if (isFin) m = fin;
          else if (y <= y1 + 1) m = facade;                       // spandrel
          else m = ((Math.round(x * 2) + yFloor * 3 + litSeed) % 11 < 4) ? winDark
            : (((Math.round(x * 2) * 5 + yFloor) % 37 === 0) ? glassLit : glass);
          v.set(XM(x), y, ZM(z), m);
        }
      }
    };
    /* banded wall along a z-run at metre-x, facing +x (east) or -x (west) */
    const bandedZ = (z1, z2, x, yFloor, litSeed) => {
      const y1 = FLOOR_TOPS[yFloor - 1] + 1, y2 = FLOOR_TOPS[yFloor] - 1;
      for (let z = z1; z <= z2; z += 0.5) {
        const isFin = Math.round(z * 2) % 7 === 0;
        for (let y = y1; y <= y2; y++) {
          let m;
          if (isFin) m = fin;
          else if (y <= y1 + 1) m = facade;
          else m = ((Math.round(z * 2) + yFloor * 3 + litSeed) % 11 < 4) ? winDark
            : (((Math.round(z * 2) * 5 + yFloor) % 41 === 0) ? glassLit : glass);
          v.set(XM(x), y, ZM(z), m);
        }
      }
    };
    /* green podium: open ground colonnade + railed level-1 walkway on a face */
    const podiumX = (x1, x2, z, depth) => {
      // columns at ground, open air between; back wall with doors
      for (let x = x1; x <= x2; x += 3.5) colM(x, z, 0, 4.5, green);
      for (let x = x1; x <= x2; x += 0.5) {
        v.set(XM(x), Y(4.5), ZM(z), green);                        // walkway slab edge
        const rail = Math.round(x * 2) % 3 !== 0;
        if (rail) { v.set(XM(x), Y(5), ZM(z), id('railing')); v.set(XM(x), Y(5.5), ZM(z), id('railing')); }
        for (let y = Y(5.5) + 1; y < Y(9); y++) v.set(XM(x), y, ZM(z), facade);
      }
      for (let x = x1; x <= x2; x += 0.5) for (let d = 1; d <= depth; d += 0.5)
        for (let y = Y(0) + 1; y <= Y(4.5); y++) v.set(XM(x + 0), y, ZM(z), v.get(XM(x), y, ZM(z)));
      // recessed dark reveal behind columns
      for (let x = x1; x <= x2; x += 0.5) for (let y = Y(0) + 1; y <= Y(4); y++) {
        const gx = XM(x), gz = ZM(z) + (ZM(z) > ZM(196) ? 1 : -1);
        if (v.get(gx, y, gz) === 0) v.set(gx, y, gz, greenDark);
      }
    };

    /* --- south wing: x 48..206, z 168..196 (the iconic face across the track) */
    const SW = { x1: 48, x2: 206, z1: 168, z2: 196 };
    boxM(SW.x1, SW.z1, SW.x2, SW.z2, 0, 4.5, id('pathLight'));     // ground slab
    for (let k = 0; k < FLOORS_N; k++) {
      const yB = FLOOR_TOPS[k], yT = FLOOR_TOPS[k + 1];
      // massifs: front/back walls + solid core between
      boxM(SW.x1, SW.z1 + 1, SW.x2, SW.z2 - 1, (yB - yGround) / 2 + 0.1, (yT - yGround) / 2, facadeSh);
      boxM(SW.x1, SW.z1, SW.x2, SW.z2, (yB - yGround) / 2, (yB - yGround) / 2 + 0.05, facadeSh); // slab
      if (k === 0) {
        podiumX(SW.x1 + 2, SW.x2 - 2, SW.z2, 3);                   // green podium colonnade (south)
        for (let x = SW.x1; x <= SW.x2; x += 0.5) for (let y = Y(0) + 1; y <= Y(4.5); y++)
          v.set(XM(x), y, ZM(SW.z2), v.get(XM(x), y, ZM(SW.z2)) || green);
        for (let x = SW.x1; x <= SW.x2; x += 0.5) for (let z = SW.z2 - 3; z < SW.z2; z += 0.5)
          for (let y = Y(0) + 1; y <= Y(4); y++) if (v.get(XM(x), y, ZM(z)) === 0) v.set(XM(x), y, ZM(z), greenDark);
      } else {
        bandedX(SW.x1 + 1, SW.x2 - 1, SW.z2, k, 0);
        bandedX(SW.x1 + 1, SW.x2 - 1, SW.z1, k, 1);
      }
    }
    boxM(SW.x1, SW.z1, SW.x2, SW.z2, 25.5, 26, fascia);            // roof fascia band
    boxM(SW.x1 + 1, SW.z1 + 1, SW.x2 - 1, SW.z2 - 1, 26, 26.4, roofDeck);
    for (let i = 0; i < 14; i++) {                                  // rooftop AC
      const rx = SW.x1 + 4 + rng() * (SW.x2 - SW.x1 - 8), rz = SW.z1 + 3 + rng() * (SW.z2 - SW.z1 - 6);
      boxM(rx, rz, rx + 1.5, rz + 1, 26.4, 27.6, id('roofGrey'));
    }

    /* --- crest tower: west end of south wing, x 48..84, rising 2 extra floors */
    const CT = { x1: 48, x2: 84 };
    boxM(CT.x1, SW.z1, CT.x2, SW.z2, 0, 33, id('plasterWhite'));
    for (let k = 1; k <= 6; k++) {                                  // slim window slots
      bandedX(CT.x1 + 3, CT.x2 - 3, SW.z2, k, 0);
      bandedX(CT.x1 + 3, CT.x2 - 3, SW.z2, k, 0);
    }
    // re-face the tower white with narrow vertical window strips
    for (let x = CT.x1; x <= CT.x2; x += 0.5) for (let y = Y(0) + 1; y <= Y(33); y++) {
      v.set(XM(x), y, ZM(SW.z2), id('plasterWhite'));
      v.set(XM(x), y, ZM(SW.z1), id('plasterWhite'));
    }
    for (const xEdge of [CT.x1, CT.x2]) for (let z = SW.z1; z <= SW.z2; z += 0.5)
      for (let y = Y(0) + 1; y <= Y(33); y++) v.set(XM(xEdge), y, ZM(z), id('plasterWhite'));
    for (let k = 0; k < 4; k++) {                                   // vertical slot windows
      const wx = 56 + k * 6;
      for (let y = Y(11); y <= Y(24); y++) for (let dz = 0; dz <= 0; dz += 0.5)
        v.set(XM(wx), y, ZM(SW.z2), winDark);
    }
    boxM(CT.x1 - 0.5, SW.z1, CT.x2 + 0.5, SW.z2, 33, 34, fascia);   // tower cap band
    boxM(CT.x1 + 1, SW.z1 + 1, CT.x2 - 1, SW.z2 - 1, 34, 34.4, roofDeck);

    /* --- west block: x 14..48, z 168..244 (lobby + corridor spine; pool
       overlook on its east face) — but south-west corner is forecourt, so the
       block proper starts at z 196: the lobby wing x 34..62 z 196..244 and the
       narrow walkway spine x 14..34 z 196..284 */
    const LOBBY = { x1: 34, x2: 62, z1: 196, z2: 244 };
    boxM(LOBBY.x1, LOBBY.z1, LOBBY.x2, LOBBY.z2, 0, 26, facadeSh);
    boxM(LOBBY.x1, LOBBY.z1, LOBBY.x2, LOBBY.z2, 25.5, 26, fascia);
    for (let k = 1; k <= 5; k++) bandedZ(LOBBY.z1 + 1, LOBBY.z2 - 1, LOBBY.x1, k, 2);
    // entrance porch from forecourt (west face, glazed doors)
    boxM(LOBBY.x1 - 1.5, 214, LOBBY.x1, 226, 0, 4.5, id('canopyWhite'));
    boxM(LOBBY.x1, 216, LOBBY.x1 + 0.5, 224, 0, 4, id('glassDay'));
    // covered ramp/stair from forecourt ground up to lobby
    for (let i = 0; i <= 8; i++) {
      const x = 14 + i * 2.4, hY = (i / 8) * 1.6;
      boxM(x, 214, x + 2.2, 226, -1.5 + hY * 0, -1.5 + 0 + hY, id('concrete'));
    }
    boxM(10, 210, 36, 230, 5.2, 5.7, id('canopyWhite'));            // porch canopy
    for (const px of [12, 34]) for (const pz of [212, 228]) colM(px, pz, 0, 5.2, id('signWhite'));

    /* --- spine block west of pool: x 14..27, z 196..284, corridors overlook pool */
    boxM(14, 196, 27, 284, 0, 26, facadeSh);
    boxM(14, 196, 27, 284, 25.5, 26, fascia);
    for (let k = 1; k <= 6; k++) bandedZ(200, 280, 14, k, 3);       // west face windows
    for (let k = 1; k <= 6; k++) {                                  // east face: open walkways
      const y1 = FLOOR_TOPS[k - 1] + 1;
      for (let z = 200; z <= 280; z += 0.5) {
        v.set(XM(27), y1, ZM(z), facadeSh);
        v.set(XM(27), y1 + 3, ZM(z), facadeSh);
        if (Math.round(z * 2) % 4 !== 0) { v.set(XM(27.5), y1 + 1, ZM(z), id('railing')); v.set(XM(27.5), y1 + 2, ZM(z), id('railing')); }
      }
    }

    /* --- east wing (hall): x 178..206, z 168..284, glass curtain east face */
    boxM(178, SW.z1, 206, 284, 0, 26, facadeSh);
    for (let k = 1; k <= 6; k++) { bandedZ(SW.z1 + 1, 283, 206, k, 4); bandedX(179, 205, 284, k, 5); }
    // east glass curtain wall (hall foyer), floors 1-3
    for (let z = 172; z <= 280; z += 0.5) for (let y = Y(9.5); y <= Y(19); y++)
      v.set(XM(206), y, ZM(z), (Math.round(z * 3) % 2 === 0) ? id('glassCurtain') : fin);
    boxM(178, SW.z1, 206, 284, 25.5, 26, fascia);
    boxM(179, SW.z1 + 1, 205, 283, 26, 26.4, roofDeck);
    for (let i = 0; i < 6; i++) {                                   // roof garden planters
      const rz = SW.z1 + 4 + i * 14;
      boxM(181, rz, 203, rz + 1.5, 26.4, 27.2, id('planter'));
      for (let x = 181.5; x <= 202; x += 1) v.set(XM(x), Y(27.2), ZM(rz), id('bush'));
    }

    /* --- north wing: x 62..178, z 242..270 */
    const NW = { x1: 62, x2: 178, z1: 242, z2: 270 };
    boxM(NW.x1, NW.z1, NW.x2, NW.z2, 0, 26, facadeSh);
    for (let k = 1; k <= 6; k++) { bandedX(NW.x1 + 1, NW.x2 - 1, NW.z1, k, 6); bandedZ(NW.z1, NW.z2, NW.x2, k, 7); }
    for (let k = 0; k < FLOORS_N; k++) {                            // courtyard side: open walkways
      const y1 = FLOOR_TOPS[k] + 1, y2 = FLOOR_TOPS[k + 1];
      for (let x = NW.x1; x <= NW.x2; x += 0.5) {
        v.set(XM(x), y1, ZM(NW.z1), facadeSh);
        v.set(XM(x), y2 - 1, ZM(NW.z1), facadeSh);
        for (let y = y1 + 1; y < y2 - 1; y++)
          v.set(XM(x), y, ZM(NW.z1) + 1, (Math.round(x * 2) % 9 === 0) ? ochre : 0);
        if (Math.round(x * 2) % 3 !== 0 && k > 0) { v.set(XM(x), y1 + 1, ZM(NW.z1) - 1, id('railing')); v.set(XM(x), y1 + 2, ZM(NW.z1) - 1, id('railing')); }
      }
    }
    boxM(NW.x1, NW.z1, NW.x2, NW.z2, 25.5, 26, fascia);

    /* --- north-west block behind pool: x 14..90, z 270..284 */
    boxM(14, 270, 90, 284, 0, 26, facadeSh);
    for (let k = 1; k <= 6; k++) { bandedX(15, 89, 284, k, 8); bandedZ(270, 284, 14, k, 9); }
    boxM(14, 270, 90, 284, 25.5, 26, fascia);

    /* --- south wing courtyard face (z=196): open walkways each floor */
    for (let k = 0; k < FLOORS_N; k++) {
      const y1 = FLOOR_TOPS[k] + 1, y2 = FLOOR_TOPS[k + 1];
      for (let x = 62; x <= 178; x += 0.5) {
        v.set(XM(x), y1, ZM(196), facadeSh);
        v.set(XM(x), y2 - 1, ZM(196), facadeSh);
        for (let y = y1 + 1; y < y2 - 1; y++)
          v.set(XM(x), y, ZM(196) - 1, (Math.round(x * 2) % 9 === 0) ? ochre : 0);
        if (Math.round(x * 2) % 3 !== 0) { v.set(XM(x), y1 + 1, ZM(196) + 1, id('railing')); v.set(XM(x), y1 + 2, ZM(196) + 1, id('railing')); }
      }
    }
    /* courtyard-facing ground colonnade columns along south wing + lobby */
    for (let x = 62; x <= 178; x += 3.5) colM(x, 196.5, 0, 4.5, green);
    for (let z = 196; z <= 242; z += 3.5) colM(62, z, 0, 4.5, green);
    for (let z = 196; z <= 242; z += 3.5) colM(178, z, 0, 4.5, green);

    /* ------------------------------------------------ courtyard */
    step('Paving the courtyard…', 0.26);
    paintM(62, 196, 178, 242, id('concrete'));
    for (let x = 62; x <= 178; x += 2) for (let z = 196; z <= 242; z += 2)
      if ((Math.round(x) + Math.round(z)) % 4 === 0) paintM(x, z, x + 1, z, id('pathLight'));
    // central fountain: square granite plinth + bronze statue + jet
    boxM(96, 214, 104, 222, 0.4, 1.2, id('plinth'));
    boxM(98.5, 216.5, 101.5, 219.5, 1.2, 2.2, id('graniteDark'));
    colM(100, 218, 2.2, 3.4, id('bronze'));
    v.set(XM(100), Y(3.4), ZM(218), id('bronze'));
    v.set(XM(99.4), Y(2.6), ZM(218), id('signWhite')); // book
    for (let a = 0; a < 8; a++) {
      const fx = 100 + Math.cos(a * Math.PI / 4) * 5.5, fz = 218 + Math.sin(a * Math.PI / 4) * 5.5;
      v.set(XM(fx), Y(1.2), ZM(fz), id('waterShallow'));
    }
    // tuck shop seating west half: umbrellas + benches
    for (const [ux, uz] of [[72, 210], [80, 210], [72, 226], [80, 226], [64, 218], [88, 218]]) {
      colM(ux, uz, 0, 2.2, id('floodPole'));
      boxM(ux - 1.5, uz - 1.5, ux + 1.5, uz + 1.5, 2.2, 2.6, id('umbrella'));
      boxM(ux - 1.2, uz - 0.4, ux + 1.2, uz + 0.4, 0.5, 0.8, id('bench'));
    }
    for (const [bx, bz] of [[90, 204], [110, 204], [130, 204], [150, 236], [120, 236]])
      boxM(bx, bz, bx + 3, bz + 0.8, 0.5, 0.9, id('bench'));
    // planters with shrubs along edges
    for (let x = 64; x <= 176; x += 8) { boxM(x, 198, x + 2.5, 199.5, 0.3, 0.9, id('planter')); LSC.Voxel.bush(v, XM(x + 1), Y(0.9), ZM(198.7), rng); }
    // basketball court at east end (28×15 m, green key + blue surround)
    for (let x = 140; x <= 174; x += 0.5) for (let z = 204; z <= 234; z += 0.5)
      paintM(x, z, x, z, ((x >= 146 && x <= 168 && z >= 210 && z <= 228)) ? id('courtGreen') : id('tennisBlue'));
    const courtLine = (x, z) => paintM(x, z, x, z, id('lineWhite'));
    for (let z = 210; z <= 228; z += 0.5) { courtLine(146, z); courtLine(168, z); }
    for (let x = 146; x <= 168; x += 0.5) { courtLine(x, 210); courtLine(x, 228); courtLine(x, 219); }
    for (let x = 146; x <= 153; x += 0.5) { courtLine(x, 214); courtLine(x, 224); }
    for (let x = 161; x <= 168; x += 0.5) { courtLine(x, 214); courtLine(x, 224); }
    const hoop = (hx, hz, dir) => {
      colM(hx, hz, 0, 3.2, id('floodPole'));
      boxM(hx - 0.2, hz, hx + 0.2, hz + dir * 1, 2.6, 3.2, id('signWhite'));
    };
    hoop(143, 219, 1); hoop(171, 219, -1);

    /* ------------------------------------------------ pool quad (north-west) */
    step('Filling the pool…', 0.34);
    // sunken court: clear soil down, then lay deck 2 m below campus level
    boxM(16, 244, 90, 270, -5, 0.6, 0);
    boxM(16, 244, 90, 270, -5, -2.05, id('soil'));
    boxM(16, 244, 90, 270, -2.05, -2, id('poolEdge'));
    // basin 27..80 × 250..270 (50×20 m), 8 lanes E-W
    boxM(27.5, 250.5, 79.5, 269.5, -2, -4.4, 0);
    boxM(27.5, 250.5, 79.5, 269.5, -4.4, -4.2, id('poolFloor'));
    boxM(27.5, 250.5, 79.5, 269.5, -4.2, -4.2, id('poolWaterDeep'));
    for (let lz = 251; lz <= 269; lz += 1) for (let lx = 28; lx <= 79; lx += 7)
      v.set(XM(lx), Y(-4.2), ZM(lz), id('poolFloor'));
    // lane-line anchors + starting blocks along south edge
    for (let lx = 28; lx <= 79; lx += 7) boxM(lx - 0.3, 248.4, lx + 0.3, 249.2, -2, -1.4, id('signWhite'));
    // lifeguard chair
    colM(84, 254, -2, -0.4, id('floodPole'));
    boxM(83.4, 253.4, 84.6, 254.6, -0.4, 0.2, id('seatRed'));
    // 2-storey open pavilion on the court's south side (changing/cool-down)
    for (let px = 31; px <= 79; px += 3.5) { colM(px, 234.5, -2, 1.6, id('signWhite')); colM(px, 243, -2, 1.6, id('signWhite')); }
    for (let pz = 235; pz <= 243; pz += 3) { colM(31, pz, -2, 1.6, id('signWhite')); colM(79, pz, -2, 1.6, id('signWhite')); }
    boxM(29.5, 234, 80.5, 243.5, 1.6, 2.2, id('canopyWhite'));      // pavilion roof
    for (let k = 1; k <= 2; k++) bandedX(31, 79, 243.5, k, 10);     // back wall windows
    // stairs from courtyard level down to deck (east side)
    for (let i = 0; i < 4; i++) boxM(86 + i * 0.5, 240, 90, 246, -2 + i * 0.5, -2 + (i + 1) * 0.5, id('concrete'));

    /* ------------------------------------------------ sports ground (south) */
    step('Painting the track…', 0.44);
    const TCX = 108, TCZm = 80;                                     // track centre (m)
    const outRx = 82.5, outRz = 61, lane = 10;                      // 8 lanes ≈ 10 m band
    const inRx = outRx - lane, inRz = outRz - lane;
    for (let x = 20; x <= 196; x += 0.5) for (let z = 14; z <= 148; z += 0.5) {
      const dx = (x - TCX) / outRx, dz = (z - TCZm) / outRz;
      const dO = dx * dx + dz * dz;
      const dx2 = (x - TCX) / inRx, dz2 = (z - TCZm) / inRz;
      const dI = dx2 * dx2 + dz2 * dz2;
      if (dO <= 1 && dI >= 1) paintM(x, z, x, z, id('trackRed'));
      else if (dI < 1) {
        const stripe = (Math.floor((x + 24) / 8) % 2 === 0) && x >= 54 && x <= 162 && z >= 46 && z <= 114;
        paintM(x, z, x, z, stripe ? id('pitchA') : id('pitchB'));
      }
    }
    /* lane lines: 3 white ellipse rings mid-band */
    for (const rr of [0.33, 0.66, 0.99]) {
      const rx = inRx + (outRx - inRx) * rr, rz = inRz + (outRz - inRz) * rr;
      for (let x = TCX - outRx - 2; x <= TCX + outRx + 2; x += 0.5)
        for (let z = TCZm - outRz - 2; z <= TCZm + outRz + 2; z += 0.5) {
          const dx = (x - TCX) / rx, dz = (z - TCZm) / rz;
          if (Math.abs(Math.sqrt(dx * dx + dz * dz) - 1) < 0.012) paintM(x, z, x, z, id('lineWhite'));
        }
    }
    /* finish line on north straight */
    for (let z = TCZm - outRz; z <= TCZm - inRz; z += 0.5) paintM(TCX, z, TCX + 0.5, z, id('lineWhite'));
    /* football pitch markings 102×66 at centre */
    const pl = (x, z) => paintM(x, z, x, z, id('lineWhite'));
    const PX1 = 57, PX2 = 159, PZ1 = 47, PZ2 = 113;
    for (let x = PX1; x <= PX2; x += 0.5) { pl(x, PZ1); pl(x, PZ2); }
    for (let z = PZ1; z <= PZ2; z += 0.5) { pl(PX1, z); pl(PX2, z); pl((PX1 + PX2) / 2, z); }
    for (let a = 0; a < 360; a += 4) {
      const r = 9.15;
      pl(Math.round((PX1 + PX2) / 2 + Math.cos(a * Math.PI / 180) * r), Math.round(TCZm + Math.sin(a * Math.PI / 180) * r));
    }
    for (let z = TCZm - 18; z <= TCZm + 18; z += 0.5) { pl(PX1, z); pl(PX2, z); }
    for (let x = PX1; x <= PX1 + 16; x += 0.5) { pl(x, TCZm - 18); pl(x, TCZm + 18); }
    for (let x = PX2 - 16; x <= PX2; x += 0.5) { pl(x, TCZm - 18); pl(x, TCZm + 18); }
    /* goals (white, net posts) */
    const goalAt = (gx0) => {
      for (const gz of [TCZm - 3.66, TCZm + 3.66]) { colM(gx0, gz, 0, 2.4, id('goalWhite')); }
      for (let z = TCZm - 3.66; z <= TCZm + 3.66; z += 0.5) v.set(XM(gx0), Y(2.4), ZM(z), id('goalWhite'));
      for (let d = 1; d <= 2; d += 0.5) for (const gz of [TCZm - 3.66, TCZm + 3.66])
        v.set(XM(gx0 + (gx0 < TCX ? -d : d)), Y(1.5), ZM(gz), id('goalWhite'));
    };
    goalAt(PX1); goalAt(PX2);
    /* long jump pits along the east straight */
    for (const jz of [42, 118]) {
      boxM(160, jz, 178, jz + 1.2, -0.1, 0, id('pathLight'));
      boxM(180, jz - 0.8, 188, jz + 2, -0.35, 0, id('sand'));
    }
    /* high-jump pad west end */
    boxM(38, 62, 44, 70, -0.1, 0.35, id('seatBlue'));
    /* concrete grandstand against the building (north side, x 85..135) */
    for (let r = 0; r < 6; r++) {
      boxM(85, 150 + r * 1.4, 135, 151.4 + r * 1.4, 0.4 + r * 0.7, 0.8 + r * 0.7, id('concrete'));
      if (r % 2 === 0) for (let x = 86; x <= 134; x += 2.4)
        v.set(XM(x), Y(1.5 + r * 0.7), ZM(150.7 + r * 1.4), r % 4 === 0 ? id('seatBlue') : id('bleacherMetal'));
    }
    boxM(84, 149, 136, 159.5, 5.2, 5.7, id('fascia'));              // canopy over stand
    for (const px of [86, 110, 134]) for (const pz of [150, 158]) colM(px, pz, 1, 5.2, id('signWhite'));
    /* scoreboard on the south boundary wall (faces north) */
    boxM(92, 1.2, 108, 1.6, 3.5, 8.5, id('scoreboard'));
    signAnchors.push({
      kind: 'scoreboard', x: XM(100), y: Y(6), z: ZM(1.2) - 0.3,
      w: 16, h: 5, tex: 'scoreboard', ry: Math.PI
    });
    /* floodlight masts */
    const mastM = (mx, mz, hM) => {
      colM(mx, mz, 0, hM, id('floodPole'));
      boxM(mx - 1, mz - 1, mx + 1, mz + 1, hM, hM + 0.5, id('floodPole'));
      for (const [dx, dz] of [[-0.8, 0], [0.8, 0], [0, -0.8], [0, 0.8]])
        v.set(XM(mx + dx), Y(hM + 0.8), ZM(mz + dz), id('floodLight'));
    };
    mastM(34, 22, 17); mastM(182, 22, 17); mastM(34, 140, 17); mastM(182, 140, 17);
    /* green mesh fence posts around the ground perimeter */
    for (let x = 24; x <= 192; x += 3) { v.set(XM(x), Y(0.5), ZM(10), id('fenceMesh')); v.set(XM(x), Y(1.5), ZM(10), id('fenceMesh')); }
    for (let z = 12; z <= 146; z += 3) { v.set(XM(23), Y(0.5), ZM(z), id('fenceMesh')); v.set(XM(23), Y(1.5), ZM(z), id('fenceMesh')); }

    /* ------------------------------------------------ east courts (tennis + basketball) */
    step('Stringing the nets…', 0.52);
    /* 2 tennis courts x 186..220, z 150..192 (each 16×11 m across) */
    for (const tz of [152, 174]) {
      for (let x = 186; x <= 220; x += 0.5) for (let z = tz; z <= tz + 18; z += 0.5)
        paintM(x, z, x, z, (x >= 189 && x <= 217 && z >= tz + 1.5 && z <= tz + 16.5) ? id('tennisBlue') : id('tennisGreen'));
      for (let x = 189; x <= 217; x += 0.5) { paintM(x, tz + 1.5, x, tz + 1.5, id('tennisLine')); paintM(x, tz + 16.5, x, tz + 16.5, id('tennisLine')); }
      for (let z = tz + 1.5; z <= tz + 16.5; z += 0.5) { paintM(189, z, 189, z, id('tennisLine')); paintM(217, z, 217, z, id('tennisLine')); }
      const mid = tz + 9;
      for (let x = 188; x <= 218; x += 0.5) v.set(XM(x), Y(0.9), ZM(mid), id('lineWhite'));
      colM(188, mid, 0, 1.2, id('floodPole')); colM(218, mid, 0, 1.2, id('floodPole'));
      // mesh fence around
      for (let x = 185; x <= 221; x += 2) { v.set(XM(x), Y(1.5), ZM(tz - 1), id('fenceMesh')); v.set(XM(x), Y(2.5), ZM(tz - 1), id('fenceMesh')); v.set(XM(x), Y(1.5), ZM(tz + 19), id('fenceMesh')); v.set(XM(x), Y(2.5), ZM(tz + 19), id('fenceMesh')); }
    }
    /* 2 basketball half-courts x 186..220, z 196..230 (red/green) */
    for (const bz of [198, 216]) {
      for (let x = 186; x <= 220; x += 0.5) for (let z = bz; z <= bz + 14; z += 0.5)
        paintM(x, z, x, z, id('courtRed'));
      for (let x = 190; x <= 208; x += 0.5) for (let z = bz + 2; z <= bz + 12; z += 0.5)
        paintM(x, z, x, z, id('courtGreen'));
      for (let z = bz + 2; z <= bz + 12; z += 0.5) { paintM(190, z, 190, z, id('lineWhite')); paintM(208, z, 208, z, id('lineWhite')); }
      for (let x = 190; x <= 208; x += 0.5) { paintM(x, bz + 2, x, bz + 2, id('lineWhite')); paintM(x, bz + 12, x, bz + 12, id('lineWhite')); }
      colM(219, bz + 7, 0, 3.2, id('floodPole'));
      boxM(219, bz + 7, 218, bz + 7, 2.6, 3.2, id('signWhite'));
    }
    mastM(222, 172, 14); mastM(222, 224, 14);

    /* ------------------------------------------------ forecourt garden (SW) */
    step('Laying the forecourt garden…', 0.58);
    // paved forecourt x 2..48, z 150..212
    paintM(2, 150, 48, 212, id('stepping'));
    // circular driveway
    for (let a = 0; a < 360; a += 3) {
      const dx = 26 + Math.cos(a * Math.PI / 180) * 15, dz = 182 + Math.sin(a * Math.PI / 180) * 12;
      paintM(dx, dz, dx + 1.5, dz + 1.5, id('pathLight'));
    }
    // sunken lawn with white kerb + palms + De La Salle statue
    boxM(12, 192, 40, 208, -0.4, -0.1, id('lawn'));
    boxM(11.5, 191.5, 40.5, 208.5, 0, 0.1, id('signWhite'));
    for (const [px, pz] of [[15, 196], [15, 205], [37, 196], [37, 205]])
      LSC.Voxel.plantPalm(v, XM(px), Y(-0.1), ZM(pz), rng);
    // statue on plinth at lawn centre-west
    boxM(22, 198, 26, 202, -0.1, 1.6, id('plinth'));
    boxM(23, 199, 25, 201, 1.6, 3.4, id('bronze'));
    v.set(XM(24), Y(3.4), ZM(200), id('bronze'));
    v.set(XM(23.4), Y(2.6), ZM(200), id('signWhite'));
    // gate drive from gate (y175..190) to driveway
    paintM(2.5, 175, 12, 190, id('pathLight'));
    // hedges + flowerbeds along the wall
    for (let z = 152; z <= 210; z += 1.5) if (z < 174 || z > 191) LSC.Voxel.bush(v, XM(4), Y(0), ZM(z), rng);
    for (let i = 0; i < 24; i++) {
      const fx = 6 + rng() * 38, fz = 152 + rng() * 56;
      if (rng() < 0.5) LSC.Voxel.flowers(v, XM(fx), Y(0), ZM(fz), rng);
    }
    // two flagpoles at the gate
    for (const [fz, col] of [[172, id('crestPurple')], [193, id('signRed')]]) {
      colM(6, fz, 0, 11, id('lampPost'));
      worldFlags.push({ x: XM(6) + 0.5, y: Y(10.5), z: ZM(fz) + 0.5, color: col });
    }
    // gate name sign on the OUTER (west) granite face
    signAnchors.push({
      kind: 'gate', x: XM(0) - 0.3, y: yRoadW + 3.2, z: ZM(182.5),
      w: 30, h: 15, tex: 'gateName', ry: -Math.PI / 2
    });
    // field-side lettering on the granite wall inner face (seen across the field)
    signAnchors.push({
      kind: 'wallName', x: XM(2) + 0.3, y: yRoadW + 4.5, z: ZM(130),
      w: 44, h: 11, tex: 'wallName', ry: Math.PI / 2
    });

    /* ------------------------------------------------ greenery */
    step('Planting banyans and palms…', 0.66);
    const treeAt = (x, z, type) => {
      const gx = XM(x), gz = ZM(z);
      const y = v.surfaceY(gx, gz);
      if (y < 4) return;
      LSC.Voxel.plantTree(v, gx, y, gz, rng, type);
    };
    // mature banyans inside the west wall
    for (let z = 10; z <= 290; z += 7) if (z < 170 || z > 196) treeAt(4.5, z, 'banyan');
    // trees along the building's south face + service road
    for (let x = 52; x <= 204; x += 9) treeAt(x, 163, rng() < 0.5 ? 'banyan' : 'light');
    // field perimeter trees (south + east)
    for (let x = 24; x <= 190; x += 8) treeAt(x, 7, 'light');
    for (let z = 20; z <= 140; z += 8) treeAt(196, z, 'banyan');
    // north screen already has hill trees; add garden layer behind pool block
    for (let x = 16; x <= 88; x += 8) treeAt(x, 286.5, 'light');
    // east courts green edge
    for (let z = 148; z <= 232; z += 9) treeAt(222, z, 'light');
    // courtyard trees in big pots (west end)
    for (const [px, pz] of [[66, 238], [66, 200]]) LSC.Voxel.bush(v, XM(px), Y(0.9), ZM(pz), rng);

    /* ------------------------------------------------ context: neighbours */
    step('Building the neighbourhood…', 0.72);
    /* La Salle Primary School across La Salle Rd (simplified): slab + courts */
    boxM(-52, 60, -22, 108, -1, 13, id('psWall'));
    for (let k = 1; k <= 3; k++) {
      for (let x = -52; x <= -22; x += 0.5) for (let y = Y(-1) + 2 + k * 8; y <= Y(-1) + 6 + k * 8; y++)
        for (let z = 60; z <= 108; z += 6) if (z % 6 < 4.5) v.set(XM(x), y, ZM(z), id('apartmentGlass'));
    }
    boxM(-52, 60, -22, 108, 13, 13.5, id('psTrim'));
    paintM(-52, 26, -22, 56, id('courtRed'));
    for (let x = -48; x <= -26; x += 0.5) for (let z = 30; z <= 52; z += 0.5)
      paintM(x, z, x, z, id('courtGreen'));
    /* garden-house rows south of Boundary St (dark pitched roofs in lush lots) */
    for (let row = 0; row < 2; row++) {
      for (let hx = -16; hx <= 240; hx += 13) {
        const hz = -8 - row * 9 - (rng() * 2 | 0);
        if (hx > 40 && hx < 120 && row === 0) continue;             // leave a gap at the axis
        const floors = 2 + (rng() * 2 | 0);
        boxM(hx, hz - 4, hx + 9, hz + 4, -3, -3 + floors * 1.8, id('houseWall'));
        boxM(hx - 0.5, hz - 4.5, hx + 9.5, hz + 4.5, -3 + floors * 1.8, -3 + floors * 1.8 + 1, id('houseRoof'));
        treeAt(hx + 11, hz, 'banyan');
      }
    }
    /* pink slab estate SE across Boundary St */
    for (const [sx, sz, hM] of [[150, -34, 42], [176, -36, 48], [202, -32, 39], [228, -36, 52]]) {
      boxM(sx, sz, sx + 22, sz + 12, -3, hM, id('slabWall'));
      for (let y = -2; y < hM; y += 1.5) for (let x = sx; x <= sx + 22; x += 0.5)
        for (let z = sz; z <= sz + 12; z += 3) if (v.get(XM(x), Y(y), ZM(z)) === id('slabWall'))
          v.set(XM(x), Y(y), ZM(z), (x + y * 7) % 5 < 2 ? id('slabGlass') : id('slabWall'));
    }
    /* tall residential slab east of College Rd */
    boxM(252, 120, 292, 240, -1, 44, id('apartmentWall'));
    for (let y = 0; y < 44; y += 1.5) for (let z = 122; z <= 238; z += 0.5)
      for (let x = 252; x <= 292; x += 4) v.set(XM(x), Y(y), ZM(z), ((x + z) | 0) % 3 ? id('slabGlass') : id('apartmentWall'));
    /* Nga Tsin Wai houses north (5-storey row) + sitting-out garden NE */
    for (let hx = 16; hx <= 130; hx += 18) {
      boxM(hx, 296, hx + 13, 308, -1, 11, id('houseWall'));
      for (let y = 0; y < 11; y += 2) for (let x = hx; x <= hx + 13; x += 0.5)
        v.set(XM(x), Y(y), ZM(296), ((x + y) | 0) % 3 ? id('apartmentGlass') : id('houseWall'));
      boxM(hx, 296, hx + 13, 308, 11, 11.5, id('houseRoof'));
    }
    paintM(150, 294, 224, 294 + 22, id('grassLight'));
    for (let x = 158; x <= 216; x += 0.5) for (let z = 298; z <= 312; z += 0.5)
      paintM(x, z, x, z, (x >= 164 && x <= 206 && z >= 301 && z <= 309) ? id('courtGreen') : id('grassLight'));
    for (let x = 164; x <= 206; x += 0.5) { paintM(x, 301, x, 301, id('lineWhite')); paintM(x, 309, x, 309, id('lineWhite')); }
    for (let z = 301; z <= 309; z += 0.5) { paintM(164, z, 164, z, id('lineWhite')); paintM(206, z, 206, z, id('lineWhite')); }
    /* street lamps */
    const lampM = (x, z) => {
      const gx = XM(x), gz = ZM(z);
      const y = v.surfaceY(gx, gz);
      if (y < 4) return;
      v.box(gx, y + 1, gz, gx, y + 6, gz, id('lampPost'));
      v.set(gx, y + 7, gz, id('lampLight'));
    };
    for (let z = 0; z <= 290; z += 14) { lampM(-3, z); lampM(-13, z + 7); }
    for (let x = -12; x <= 256; x += 14) lampM(x, -9);
    /* parked cars on La Salle Rd + forecourt (meshes via entities) */
    parkedCars.push({ x: XM(-6) + 0.5, z: ZM(40) + 0.5, color: 0xc9c9c4, rot: 0 });
    parkedCars.push({ x: XM(-6) + 0.5, z: ZM(120) + 0.5, color: 0x3e5e9e, rot: 0 });
    parkedCars.push({ x: XM(-6) + 0.5, z: ZM(210) + 0.5, color: 0xb0453a, rot: 0 });
    parkedCars.push({ x: XM(30) + 0.5, z: ZM(180) + 0.5, color: 0x2e4a6b, rot: Math.PI / 2 });

    /* ------------------------------------------------ crest tower sign */
    step('Hanging the crest…', 0.8);
    signAnchors.push({
      kind: 'crest', x: XM(66), y: Y(27), z: ZM(SW.z2) + 0.35,
      w: 20, h: 25, tex: 'crest', ry: 0
    });
    signAnchors.push({
      kind: 'crestW', x: XM(CT.x1) - 0.35, y: Y(27), z: ZM(182),
      w: 20, h: 25, tex: 'crest', ry: -Math.PI / 2
    });

    /* ------------------------------------------------ POIs */
    const pois = [
      { name: 'Main Gate — 18 La Salle Road', zh: '正門（喇沙利道18號）', x: XM(-4), z: ZM(182), y: yRoadW + 3, icon: '🚪', r: 14 },
      { name: 'Forecourt Garden & De La Salle Statue', zh: '前庭花園與聖喇沙像', x: XM(24), z: ZM(196), y: yGround + 2, icon: '🗿', r: 12 },
      { name: 'Crest Tower', zh: '校徽塔', x: XM(66), z: ZM(196), y: yGround + 8, icon: '🏫', r: 18 },
      { name: 'School Hall (East Wing)', zh: '禮堂（東翼）', x: XM(192), z: ZM(226), y: yGround + 4, icon: '🎭', r: 14 },
      { name: 'The Courtyard', zh: '中央庭院', x: XM(110), z: ZM(219), y: yGround + 2, icon: '⛲', r: 16 },
      { name: 'Swimming Pool', zh: '游泳池', x: XM(54), z: ZM(260), y: yPool + 3, icon: '🏊', r: 16 },
      { name: 'Sports Ground — Track & Football', zh: '運動場（跑道及足球場）', x: XM(108), z: ZM(80), y: yGround + 2, icon: '🏃', r: 26 },
      { name: 'Grandstand', zh: '看台', x: XM(110), z: ZM(152), y: yGround + 3, icon: '🪑', r: 10 },
      { name: 'Tennis & Basketball Courts', zh: '網球及籃球場', x: XM(203), z: ZM(180), y: yGround + 2, icon: '🎾', r: 14 },
      { name: 'La Salle Primary School', zh: '喇沙小學', x: XM(-37), z: ZM(84), y: yGround + 2, icon: '🏫', r: 16 },
      { name: 'Boundary Street Garden Houses', zh: '界限街花園洋房', x: XM(60), z: ZM(-16), y: yRoadS + 2, icon: '🏘️', r: 14 },
      { name: 'Kowloon Tsai hillside', zh: '九龍仔山丘', x: XM(115), z: ZM(290), y: yGround + 4, icon: '🌳', r: 16 },
    ];

    /* student waypoint loops (campus metres) */
    const walks = [
      { pts: [[8, 182], [24, 182], [30, 190], [24, 205], [8, 200]], closed: true },     // forecourt loop
      { pts: [[66, 202], [170, 202], [174, 236], [66, 236]], closed: true },            // courtyard ring
      { pts: [[30, 218], [56, 218]], closed: false },                                   // courtyard west stroll
      { pts: [[88, 246], [88, 268], [30, 268], [30, 248]], closed: true },              // pool deck ring
      { pts: [[25, 80], [108, 22], [190, 80], [108, 138]], closed: true },              // track lap
      { pts: [[188, 156], [188, 190]], closed: true },                                  // east courts
    ];

    step('Colouring the map…', 0.86);
    const mapColors = new Uint8Array(W * D);
    for (let gx = 0; gx < W; gx++) for (let gz = 0; gz < D; gz++) {
      const y = v.surfaceY(gx, gz);
      mapColors[gx + gz * W] = y >= 0 ? v.get(gx, y, gz) : 0;
    }

    return {
      world: v,
      pois,
      walks,
      flags: worldFlags,
      signs: signAnchors,
      parkedCars,
      mapColors,
      levels: { yGround, yRoadS, yRoadW, yPool, yWater },
    };
  }

  LSC.World = { buildWorld };
})();
