/* =========================================================================
 * geo.js — batched geometry builder + AABB collision world.
 * All geometry is pushed into per-material buckets and merged into one mesh
 * per material at the end (a few dozen draw calls for the whole campus).
 * UVs come from WORLD coordinates divided by the texture's metre size, so
 * facade floor bands stay aligned across separate boxes.
 * ========================================================================= */
'use strict';
window.LSC = window.LSC || {};

(function () {
  const MATS = {};

  /* Register a material. spec: { tex, color, y0 (v origin in metres), u0,
     transparent, opacity, double, emissive, unlit } */
  function defMat(key, spec) {
    let tex = null, tw = 1, th = 1;
    if (spec.tex) { const t = LSC.Tex.get(spec.tex); tex = t.map; tw = t.w; th = t.h; }
    const P = {
      color: spec.color !== undefined ? spec.color : 0xffffff,
      map: tex,
      side: spec.double ? THREE.DoubleSide : THREE.FrontSide,
    };
    if (spec.transparent) { P.transparent = true; P.opacity = spec.opacity !== undefined ? spec.opacity : 1; P.depthWrite = !!spec.depthWrite; }
    if (spec.alphaTest) P.alphaTest = spec.alphaTest;
    const m = spec.unlit ? new THREE.MeshBasicMaterial(P) : new THREE.MeshLambertMaterial(P);
    if (spec.emissive) m.emissive = new THREE.Color(spec.emissive);
    MATS[key] = { mat: m, tw: spec.tw || tw, th: spec.th || th, y0: spec.y0 || 0, u0: spec.u0 || 0, noShadow: !!spec.noShadow };
    return MATS[key];
  }

  class Bucket {
    constructor() { this.pos = []; this.nor = []; this.uv = []; }
  }

  class Builder {
    constructor(opts) {
      this.buckets = {};
      this.cast = opts && opts.cast !== undefined ? opts.cast : true;
      this.receive = opts && opts.receive !== undefined ? opts.receive : true;
      this.colliders = opts && opts.colliders;
    }
    b(key) {
      if (!MATS[key]) throw new Error('unknown material ' + key);
      return this.buckets[key] || (this.buckets[key] = new Bucket());
    }
    /* One quad from 4 corners (counter-clockwise seen from the front). */
    quadPts(key, a, b, c, d, n) {
      const M = MATS[key], B = this.b(key);
      const pts = [a, b, c, d];
      const uvs = pts.map((p) => {
        let u, v;
        if (Math.abs(n[1]) > 0.7) { u = p[0]; v = -p[2]; }
        else if (Math.abs(n[0]) > 0.7) { u = n[0] > 0 ? -p[2] : p[2]; v = p[1]; }
        else { u = n[2] > 0 ? p[0] : -p[0]; v = p[1]; }
        return [(u - M.u0) / M.tw, (v - M.y0) / M.th];
      });
      for (const i of [0, 1, 2, 0, 2, 3]) {
        B.pos.push(pts[i][0], pts[i][1], pts[i][2]);
        B.nor.push(n[0], n[1], n[2]);
        B.uv.push(uvs[i][0], uvs[i][1]);
      }
    }
    /* Axis-aligned box. mat: key or {top, bottom, side, n, s, e, w}.
       opts.skip: string of faces to omit ('t','b','n','s','e','w').
       opts.solid (default true) registers a collider. */
    box(mat, x1, y1, z1, x2, y2, z2, opts) {
      opts = opts || {};
      if (x1 > x2) [x1, x2] = [x2, x1];
      if (y1 > y2) [y1, y2] = [y2, y1];
      if (z1 > z2) [z1, z2] = [z2, z1];
      const m = typeof mat === 'string' ? { top: mat, bottom: mat, side: mat } : mat;
      const side = (f) => m[f] || m.side || m.top;
      const skip = opts.skip || '';
      if (!skip.includes('t')) this.quadPts(m.top || side('top'), [x1, y2, z2], [x2, y2, z2], [x2, y2, z1], [x1, y2, z1], [0, 1, 0]);
      if (!skip.includes('b')) this.quadPts(m.bottom || side('bottom'), [x1, y1, z1], [x2, y1, z1], [x2, y1, z2], [x1, y1, z2], [0, -1, 0]);
      if (!skip.includes('s')) this.quadPts(side('s'), [x1, y1, z2], [x2, y1, z2], [x2, y2, z2], [x1, y2, z2], [0, 0, 1]);
      if (!skip.includes('n')) this.quadPts(side('n'), [x2, y1, z1], [x1, y1, z1], [x1, y2, z1], [x2, y2, z1], [0, 0, -1]);
      if (!skip.includes('e')) this.quadPts(side('e'), [x2, y1, z2], [x2, y1, z1], [x2, y2, z1], [x2, y2, z2], [1, 0, 0]);
      if (!skip.includes('w')) this.quadPts(side('w'), [x1, y1, z1], [x1, y1, z2], [x1, y2, z2], [x1, y2, z1], [-1, 0, 0]);
      if (opts.solid !== false && this.colliders) this.colliders.add(x1, y1, z1, x2, y2, z2);
    }
    /* Horizontal rectangle at height y (top-facing). */
    flat(key, x1, z1, x2, z2, y) {
      if (x1 > x2) [x1, x2] = [x2, x1];
      if (z1 > z2) [z1, z2] = [z2, z1];
      this.quadPts(key, [x1, y, z2], [x2, y, z2], [x2, y, z1], [x1, y, z1], [0, 1, 0]);
    }
    /* Flat quad with explicit 0..1 UVs (decals: crest, signs, court, pool). */
    decal(key, corners, n) {
      const B = this.b(key);
      const uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
      for (const i of [0, 1, 2, 0, 2, 3]) {
        B.pos.push(...corners[i]); B.nor.push(...n); B.uv.push(...uv[i]);
      }
    }
    /* Merge an arbitrary geometry (already positioned) into a bucket. */
    geom(key, g, matrix) {
      const B = this.b(key);
      let gg = g.index ? g.toNonIndexed() : g.clone();
      if (matrix) gg.applyMatrix4(matrix);
      const p = gg.attributes.position.array, n = gg.attributes.normal.array;
      const u = gg.attributes.uv ? gg.attributes.uv.array : null;
      for (let i = 0; i < p.length; i++) { B.pos.push(p[i]); B.nor.push(n[i]); }
      for (let i = 0; i < p.length / 3; i++) { if (u) B.uv.push(u[i * 2], u[i * 2 + 1]); else B.uv.push(0, 0); }
    }
    /* Box rotated about Y (for diagonal walls / roads). */
    obox(key, cx, cz, len, wid, y1, y2, angle, opts) {
      const g = new THREE.BoxGeometry(len, y2 - y1, wid);
      const m = new THREE.Matrix4().makeRotationY(-angle).setPosition(cx, (y1 + y2) / 2, cz);
      // world-metre UVs on the long faces so textures tile instead of stretching
      const uv = g.attributes.uv;
      const M = MATS[key];
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, uv.getX(i) * len / M.tw, uv.getY(i) * (y2 - y1) / M.th);
      }
      this.geom(key, g, m);
      if (opts && opts.solid && this.colliders) {
        // approximate a diagonal wall with a chain of small AABBs
        const n = Math.ceil(len / 2);
        for (let i = 0; i < n; i++) {
          const t = (i + 0.5) / n - 0.5;
          const x = cx + Math.cos(angle) * len * t, z = cz + Math.sin(angle) * len * t;
          this.colliders.add(x - 1, y1, z - 1, x + 1, y2, z + 1);
        }
      }
    }
    build(parent) {
      const meshes = [];
      for (const key in this.buckets) {
        const B = this.buckets[key];
        if (!B.pos.length) continue;
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(B.pos, 3));
        g.setAttribute('normal', new THREE.Float32BufferAttribute(B.nor, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
        g.computeBoundingSphere();
        const mesh = new THREE.Mesh(g, MATS[key].mat);
        mesh.castShadow = this.cast && !MATS[key].noShadow;
        mesh.receiveShadow = this.receive;
        mesh.name = key;
        parent.add(mesh);
        meshes.push(mesh);
      }
      this.buckets = {};
      return meshes;
    }
  }

  /* Uniform-grid AABB store for player collision. */
  class Colliders {
    constructor(cell) { this.cell = cell || 8; this.list = []; this.grid = new Map(); }
    add(x1, y1, z1, x2, y2, z2) {
      const i = this.list.length;
      this.list.push([x1, y1, z1, x2, y2, z2]);
      const c = this.cell;
      for (let gx = Math.floor(x1 / c); gx <= Math.floor(x2 / c); gx++)
        for (let gz = Math.floor(z1 / c); gz <= Math.floor(z2 / c); gz++) {
          const k = gx * 73856093 ^ gz * 19349663;
          let a = this.grid.get(k); if (!a) { a = []; this.grid.set(k, a); }
          a.push(i);
        }
    }
    query(x1, z1, x2, z2, out) {
      const c = this.cell, seen = new Set();
      out.length = 0;
      for (let gx = Math.floor(x1 / c); gx <= Math.floor(x2 / c); gx++)
        for (let gz = Math.floor(z1 / c); gz <= Math.floor(z2 / c); gz++) {
          const a = this.grid.get(gx * 73856093 ^ gz * 19349663);
          if (!a) continue;
          for (const i of a) if (!seen.has(i)) { seen.add(i); out.push(this.list[i]); }
        }
      return out;
    }
  }

  LSC.Geo = { defMat, Builder, Colliders, MATS };
})();
