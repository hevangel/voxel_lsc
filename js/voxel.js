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
