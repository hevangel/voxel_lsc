/* =========================================================================
 * entities.js — living details: wandering students, birds, waving flags,
 * pool water shimmer, parked + roaming car. All lightweight updates.
 * Grid units: 1 unit = 0.5 m (sizes are 2× the metre figures).
 * ========================================================================= */
'use strict';

(function () {
  const XM = (m) => 120 + Math.round(m * 2);
  const ZM = (m) => 590 - Math.round(m * 2);

  /* merged box geometry helper (vertex-colored) */
  function boxGeom(w, h, d, x, y, z, color) {
    const g = new THREE.BoxGeometry(w, h, d);
    const c = new THREE.Color(color);
    const n = g.attributes.position.count;
    const cols = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    g.translate(x, y, z);
    return g;
  }

  class Students {
    constructor(scene, world, walks) {
      this.list = [];
      const rng = Math.random;
      const skin = 0xd9a878, shirt = 0xf5f2ec, pants = 0x2e3440;
      for (let i = 0; i < 14; i++) {
        const w = walks[i % walks.length];
        const parts = [
          boxGeom(1.1, 1.1, 1.0, 0, 3.24, 0, skin),     // head
          boxGeom(1.2, 1.44, 0.84, 0, 2.0, 0, shirt),    // torso
          boxGeom(1.1, 1.24, 0.9, 0, 0.66, 0, pants),    // legs
        ];
        if (rng() < 0.5) parts.push(boxGeom(1.32, 0.6, 0.92, 0, 2.32, 0, 0x5b2d82)); // tie/sash
        const geo = mergeGeoms(parts);
        const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        const start = rng() * w.pts.length;
        this.list.push({
          mesh, walk: w, t: start, speed: 1.1 + rng() * 1.1,
          bob: rng() * Math.PI * 2, baseY: 0,
        });
        scene.add(mesh);
      }
      this.world = world;
    }
    update(dt, time) {
      for (const s of this.list) {
        const pts = s.walk.pts;   // campus metres
        const n = pts.length;
        s.t = (s.t + dt * s.speed * 0.09) % (s.walk.closed ? n : Math.max(1, n - 1));
        const i0 = Math.floor(s.t) % (s.walk.closed ? n : n - 1);
        const i1 = (i0 + 1) % n;
        const f = s.t - Math.floor(s.t);
        const gx = XM(pts[i0][0] + (pts[i1][0] - pts[i0][0]) * f);
        const gz = ZM(pts[i0][1] + (pts[i1][1] - pts[i0][1]) * f);
        const y = this.world.surfaceY(Math.round(gx), Math.round(gz));
        s.mesh.position.set(gx, (y >= 0 ? y + 2 : 20) + Math.abs(Math.sin(time * 7 + s.bob)) * 0.18, gz);
        s.mesh.rotation.y = Math.atan2(pts[i1][0] - pts[i0][0], pts[i1][1] - pts[i0][1]);
      }
    }
  }

  function mergeGeoms(list) {
    // minimal merge (positions, normals, colors, index)
    let vCount = 0, iCount = 0;
    for (const g of list) { vCount += g.attributes.position.count; iCount += g.index.count; }
    const pos = new Float32Array(vCount * 3), nor = new Float32Array(vCount * 3), col = new Float32Array(vCount * 3);
    const idx = new Uint16Array(iCount);
    let vo = 0, io = 0;
    for (const g of list) {
      const p = g.attributes.position.array, nn = g.attributes.normal.array, cc = g.attributes.color.array;
      pos.set(p, vo * 3); nor.set(nn, vo * 3); col.set(cc, vo * 3);
      const gi = g.index.array;
      for (let i = 0; i < gi.length; i++) idx[io + i] = gi[i] + vo;
      vo += g.attributes.position.count; io += gi.length;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    out.setIndex(new THREE.BufferAttribute(idx, 1));
    return out;
  }

  class Birds {
    constructor(scene) {
      this.list = [];
      for (let i = 0; i < 7; i++) {
        const g = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color: 0x3a3f46 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.44, 1.8), mat);
        const wl = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.16, 0.8), mat); wl.position.x = -1.8;
        const wr = wl.clone(); wr.position.x = 1.8;
        g.add(body, wl, wr);
        g.userData = { wl, wr, r: 60 + Math.random() * 120, h: 60 + Math.random() * 50, cx: 240 + Math.random() * 200, cz: 300 + Math.random() * 180, sp: 0.25 + Math.random() * 0.3, ph: Math.random() * 7 };
        scene.add(g);
        this.list.push(g);
      }
    }
    update(dt, t) {
      for (const b of this.list) {
        const u = b.userData;
        const a = t * u.sp + u.ph;
        b.position.set(u.cx + Math.cos(a) * u.r, u.h + Math.sin(t * 0.6 + u.ph) * 6, u.cz + Math.sin(a) * u.r);
        b.rotation.y = -a;
        const flap = Math.sin(t * 9 + u.ph) * 0.7;
        u.wl.rotation.z = flap; u.wr.rotation.z = -flap;
      }
    }
  }

  class Flags {
    constructor(scene, anchors) {
      this.flags = [];
      for (const a of anchors) {
        const g = new THREE.PlaneGeometry(8.4, 5.2, 8, 3);
        g.translate(4.2, -2.6, 0); // pivot at pole
        const mat = new THREE.MeshLambertMaterial({ color: a.color, side: THREE.DoubleSide });
        const m = new THREE.Mesh(g, mat);
        m.position.set(a.x, a.y, a.z);
        m.rotation.y = -0.9;
        m.castShadow = true;
        scene.add(m);
        this.flags.push({ mesh: m, base: g.attributes.position.array.slice(), ph: Math.random() * 7 });
      }
    }
    update(t) {
      for (const f of this.flags) {
        const p = f.mesh.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const bx = f.base[i * 3];
          f.mesh.geometry.attributes.position.setY(i, f.base[i * 3 + 1] + Math.sin(bx * 0.7 + t * 5 + f.ph) * 0.32 * bx / 8.4);
          f.mesh.geometry.attributes.position.setZ(i, Math.sin(bx * 0.45 + t * 3.4 + f.ph) * 0.68 * bx / 8.4);
        }
        p.needsUpdate = true;
      }
    }
  }

  class PoolWater {
    /* opts: { x, y, z, w, d } in grid units (w along x = lane direction) */
    constructor(scene, opts) {
      const o = opts || { x: 227, y: 16.5, z: 70, w: 104, d: 38 };
      const geo = new THREE.PlaneGeometry(o.w, o.d, 48, 20);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: { uTime: { value: 0 }, uDeep: { value: new THREE.Color(0x1f7fa8) }, uLite: { value: new THREE.Color(0x7fd4e4) } },
        vertexShader: `
          varying vec2 vUv;
          uniform float uTime;
          void main(){ vUv = uv;
            vec3 p = position;
            p.z += sin(p.x*0.45 + uTime*2.2)*0.12 + cos(p.y*0.6 + uTime*1.7)*0.10;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uTime; uniform vec3 uDeep; uniform vec3 uLite;
          void main(){
            float c = sin(vUv.x*92.0 + uTime*2.0)*sin(vUv.y*40.0 - uTime*1.4);
            float lane = step(0.5, fract(vUv.y*8.0));
            vec3 col = mix(uDeep, uLite, 0.35 + 0.25*c + lane*0.12);
            gl_FragColor = vec4(col, 0.88); }`,
      });
      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.rotation.x = -Math.PI / 2;
      this.mesh.position.set(o.x, o.y, o.z);
      scene.add(this.mesh);
    }
    update(t) { this.mesh.material.uniforms.uTime.value = t; }
  }

  class Cars {
    constructor(scene, parked, world) {
      this.list = [];
      for (const p of parked) {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.6, 8.8), new THREE.MeshLambertMaterial({ color: p.color }));
        body.position.y = 1.8;
        const cab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 4.4), new THREE.MeshLambertMaterial({ color: 0x9fd2dd }));
        cab.position.set(0, 3.2, -0.4);
        g.add(body, cab);
        for (const [wx, wz] of [[-2.1, 3.0], [2.1, 3.0], [-2.1, -3.0], [2.1, -3.0]]) {
          const w = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 1.4), new THREE.MeshLambertMaterial({ color: 0x22252a }));
          w.position.set(wx, 0.9, wz);
          g.add(w);
        }
        g.position.set(p.x, world.surfaceY(Math.round(p.x), Math.round(p.z)) + 1, p.z);
        g.rotation.y = p.rot;
        g.traverse(o => { o.castShadow = true; });
        scene.add(g);
      }
      // roaming red taxi on La Salle Road (grid x ≈ 104)
      const taxi = new THREE.Group();
      const tb = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.7, 9.2), new THREE.MeshLambertMaterial({ color: 0xb03028 }));
      tb.position.y = 1.9;
      const tc = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 4.6), new THREE.MeshLambertMaterial({ color: 0xe8e4d8 }));
      tc.position.set(0, 3.4, 0.2);
      taxi.add(tb, tc);
      taxi.position.set(104, 18, 60);
      scene.add(taxi);
      this.taxi = taxi;
      this.taxiDir = 1;
    }
    update(dt) {
      const t = this.taxi;
      t.position.z += dt * 14 * this.taxiDir;
      if (t.position.z > 555) this.taxiDir = -1;
      if (t.position.z < 40) this.taxiDir = 1;
      t.rotation.y = this.taxiDir > 0 ? 0 : Math.PI;
    }
  }

  LSC.Entities = { Students, Birds, Flags, PoolWater, Cars, mergeGeoms };
})();
