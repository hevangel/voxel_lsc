/* =========================================================================
 * sky.js — gradient sky dome with sun/moon/stars shader, lighting rig and
 * drifting voxel clouds. Driven by a 24h time-of-day value.
 * ========================================================================= */
'use strict';

(function () {
  const skyVert = `
    varying vec3 vWorldPos;
    void main() {
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;

  const skyFrag = `
    varying vec3 vWorldPos;
    uniform vec3 topColor;
    uniform vec3 horizonColor;
    uniform vec3 sunDir;
    uniform vec3 sunColor;
    uniform vec3 moonDir;
    uniform float nightness;
    uniform float hazeStrength;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    void main() {
      vec3 dir = normalize(vWorldPos);
      float h = clamp(dir.y, -0.05, 1.0);
      vec3 col = mix(horizonColor, topColor, pow(max(h, 0.0), 0.62));
      // sun glow + disc
      float sd = max(dot(dir, sunDir), 0.0);
      col += sunColor * (pow(sd, 350.0) * 1.2 + pow(sd, 24.0) * 0.24 * (1.0 - nightness));
      // moon
      float md = max(dot(dir, moonDir), 0.0);
      vec3 moonCol = vec3(0.92, 0.94, 1.0);
      col += moonCol * (smoothstep(0.9997, 0.99985, md) * (0.85) + pow(md, 900.0) * 0.4) * nightness;
      // stars
      if (nightness > 0.02 && dir.y > 0.02) {
        vec2 sp = dir.xz / (dir.y + 0.22) * 38.0;
        float st = step(0.9975, hash(floor(sp)));
        float tw = 0.55 + 0.45 * sin(hash(floor(sp)) * 91.7);
        col += vec3(0.9, 0.93, 1.0) * st * tw * nightness * smoothstep(0.02, 0.24, dir.y);
      }
      gl_FragColor = vec4(col, 1.0);
    }`;

  /* key lighting stops across the day (t = hours 0-24) */
  const STOPS = [
    { t: 0.0, top: 0x0b1026, hor: 0x18203a, sun: 0x223, sunI: 0.10, hemiSky: 0x2a3455, hemiGnd: 0x1c2030, hemiI: 0.42, fog: 0x141a2c, night: 1.0 },
    { t: 5.5, top: 0x1b2440, hor: 0x59455c, sun: 0xff9c6b, sunI: 0.22, hemiSky: 0x4a4a68, hemiGnd: 0x33303c, hemiI: 0.5, fog: 0x4a3c4e, night: 0.75 },
    { t: 6.8, top: 0x4a6ea8, hor: 0xf2b083, sun: 0xffb379, sunI: 0.85, hemiSky: 0x8fa3c4, hemiGnd: 0x5c5548, hemiI: 0.62, fog: 0xe8b48f, night: 0.12 },
    { t: 9.0, top: 0x3f77c9, hor: 0xcfe3ec, sun: 0xfff2d8, sunI: 1.22, hemiSky: 0xbdd4e8, hemiGnd: 0x6f6a55, hemiI: 0.72, fog: 0xd3e2ea, night: 0.0 },
    { t: 12.0, top: 0x2f6fd0, hor: 0xdcedf6, sun: 0xffffff, sunI: 1.32, hemiSky: 0xcfe2f2, hemiGnd: 0x77715c, hemiI: 0.78, fog: 0xdcedf6, night: 0.0 },
    { t: 16.5, top: 0x3c74c4, hor: 0xd8e4ea, sun: 0xfff0d0, sunI: 1.15, hemiSky: 0xc2d6e8, hemiGnd: 0x716b56, hemiI: 0.7, fog: 0xd9e5eb, night: 0.0 },
    { t: 18.4, top: 0x3d5e9e, hor: 0xf7b26b, sun: 0xffa54d, sunI: 0.8, hemiSky: 0x9aa0c0, hemiGnd: 0x5c5142, hemiI: 0.6, fog: 0xeda868, night: 0.05 },
    { t: 19.6, top: 0x1f2a52, hor: 0xd4695a, sun: 0xff7f50, sunI: 0.35, hemiSky: 0x55567c, hemiGnd: 0x3a3440, hemiI: 0.5, fog: 0x8a5a58, night: 0.45 },
    { t: 21.0, top: 0x101733, hor: 0x27304e, sun: 0x334, sunI: 0.12, hemiSky: 0x2c3654, hemiGnd: 0x20222e, hemiI: 0.44, fog: 0x1a2136, night: 0.92 },
    { t: 24.0, top: 0x0b1026, hor: 0x18203a, sun: 0x223, sunI: 0.10, hemiSky: 0x2a3455, hemiGnd: 0x1c2030, hemiI: 0.42, fog: 0x141a2c, night: 1.0 },
  ];

  function lerpColor(out, a, b, f) {
    out.setRGB(
      a.r + (b.r - a.r) * f,
      a.g + (b.g - a.g) * f,
      a.b + (b.b - a.b) * f
    );
    return out;
  }

  class SkySystem {
    constructor(scene, opts) {
      this.scene = scene;
      this.quality = opts.quality || 'high';
      this.time = opts.startTime !== undefined ? opts.startTime : 10.5; // hours
      this.auto = false;
      this.autoSpeed = 24 / 180; // full day in 3 minutes

      // sky dome
      const uniforms = {
        topColor: { value: new THREE.Color(0x2f6fd0) },
        horizonColor: { value: new THREE.Color(0xdcedf6) },
        sunDir: { value: new THREE.Vector3(0.4, 0.8, 0.3) },
        sunColor: { value: new THREE.Color(0xffffff) },
        moonDir: { value: new THREE.Vector3(-0.4, -0.8, -0.3) },
        nightness: { value: 0 },
      };
      this.uniforms = uniforms;
      const geo = new THREE.SphereGeometry(2600, 32, 18);
      const mat = new THREE.ShaderMaterial({
        uniforms, vertexShader: skyVert, fragmentShader: skyFrag,
        side: THREE.BackSide, depthWrite: false, fog: false,
      });
      this.dome = new THREE.Mesh(geo, mat);
      this.dome.frustumCulled = false;
      scene.add(this.dome);

      // lights
      const shadowSize = this.quality === 'high' ? 2048 : this.quality === 'medium' ? 1024 : 0;
      this.sun = new THREE.DirectionalLight(0xffffff, 1.2);
      this.sun.castShadow = shadowSize > 0;
      if (shadowSize > 0) {
        this.sun.shadow.mapSize.set(shadowSize, shadowSize);
        const c = this.sun.shadow.camera;
        c.left = -190; c.right = 190; c.top = 190; c.bottom = -190;
        c.near = 80; c.far = 920;
        this.sun.shadow.bias = -0.0006;
        this.sun.shadow.normalBias = 1.0;
      }
      scene.add(this.sun);
      scene.add(this.sun.target);
      this.moon = new THREE.DirectionalLight(0x8fa5d0, 0.0);
      scene.add(this.moon);
      this.hemi = new THREE.HemisphereLight(0xcfe2f2, 0x77715c, 0.75);
      scene.add(this.hemi);

      scene.fog = new THREE.Fog(0xdcedf6, 340, 2600);

      // clouds
      this.clouds = new THREE.Group();
      const rng = () => Math.random();
      const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 });
      const cloudMatLow = new THREE.MeshLambertMaterial({ color: 0xe8edf2, transparent: true, opacity: 0.85 });
      for (let i = 0; i < 14; i++) {
        const g = new THREE.Group();
        const puffs = 3 + (rng() * 4 | 0);
        for (let p = 0; p < puffs; p++) {
          const w = 20 + rng() * 40, d = 16 + rng() * 28, h = 6 + rng() * 6.8;
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), rng() < 0.6 ? cloudMat : cloudMatLow);
          m.position.set((rng() - 0.5) * 60, (rng() - 0.5) * 6, (rng() - 0.5) * 36);
          g.add(m);
        }
        g.position.set((rng() - 0.5) * 1800, 210 + rng() * 50, (rng() - 0.5) * 1400 - 120);
        this.clouds.add(g);
      }
      scene.add(this.clouds);

      // pool-light spots (created by world builder flags; enabled at night)
      this.spots = [];
      this._tmpC1 = new THREE.Color(); this._tmpC2 = new THREE.Color();
      this._lastH = -1;
    }

    addFloodSpots(list) {
      for (const s of list) {
        const sp = new THREE.SpotLight(0xfff2cc, 0, 260, 0.62, 0.5, 1.2);
        sp.position.copy(s.pos);
        sp.target.position.copy(s.target);
        this.scene.add(sp); this.scene.add(sp.target);
        this.spots.push(sp);
      }
    }

    /* update lights/sky for current time; target = shadow focus point */
    update(dt, focus) {
      if (this.auto) this.time = (this.time + dt * this.autoSpeed) % 24;
      const t = this.time;
      // interpolate stops
      let a = STOPS[0], b = STOPS[STOPS.length - 1];
      for (let i = 0; i < STOPS.length - 1; i++) {
        if (t >= STOPS[i].t && t <= STOPS[i + 1].t) { a = STOPS[i]; b = STOPS[i + 1]; break; }
      }
      const f = (t - a.t) / Math.max(0.0001, b.t - a.t);
      const U = this.uniforms;
      lerpColor(U.topColor.value, this._c(a.top), this._c(b.top), f);
      lerpColor(U.horizonColor.value, this._c(a.hor), this._c(b.hor), f);
      lerpColor(U.sunColor.value, this._c(a.sun), this._c(b.sun), f);
      const sunI = a.sunI + (b.sunI - a.sunI) * f;
      const hemiI = a.hemiI + (b.hemiI - a.hemiI) * f;
      const night = a.night + (b.night - a.night) * f;
      U.nightness.value = night;

      // sun direction: rises east (+x), sets west (-x), arcs through the SOUTHERN sky (+z)
      const ang = ((t - 6) / 12) * Math.PI; // 6h → 0, 18h → π
      const elev = Math.sin(ang) * 1.05;
      const sx = Math.cos(ang);
      const sz = 0.42; // lean from the south (HK is at 22°N)
      const sdir = new THREE.Vector3(sx, elev, sz).normalize();
      U.sunDir.value.copy(sdir);
      U.moonDir.value.copy(sdir).multiplyScalar(-1);

      const focusP = focus || new THREE.Vector3(345, 22, 320);
      this.dome.position.set(focusP.x, 0, focusP.z);
      this.clouds.position.y = 0;

      // position sun light
      if (elev > 0.02) {
        this.sun.position.copy(focusP).addScaledVector(sdir, 460);
        this.sun.target.position.copy(focusP);
        this.sun.intensity = sunI;
        this.sun.color.copy(U.sunColor.value);
        this.sun.castShadow = this.quality !== 'low' && elev > 0.06;
        this.moon.intensity = 0;
      } else {
        this.moon.position.copy(focusP).addScaledVector(U.moonDir.value, 460);
        this.moon.target.position.copy(focusP);
        this.moon.intensity = 0.22 * night;
        this.sun.intensity = 0;
        this.sun.castShadow = false;
      }
      lerpColor(this.hemi.color, this._c(a.hemiSky), this._c(b.hemiSky), f);
      lerpColor(this.hemi.groundColor, this._c(a.hemiGnd), this._c(b.hemiGnd), f);
      this.hemi.intensity = hemiI;

      lerpColor(this.scene.fog.color, this._c(a.fog), this._c(b.fog), f);

      // clouds drift & tint
      this.clouds.children.forEach((g, i) => {
        g.position.x += dt * (4.4 + (i % 3) * 2);
        if (g.position.x > 960) g.position.x = -960;
        const m = g.children[0].material;
        const bright = 1 - night * 0.75;
        m.color.setScalar(bright);
      });

      // floodlights at night
      const spotI = night > 0.4 ? (night - 0.4) / 0.6 * 1.5 : 0;
      for (const s of this.spots) s.intensity = spotI;

      // emissive glow factor for window/lamp material
      this.glow = 0.22 + night * 0.9;

      const hh = Math.floor(t), mm = Math.floor((t - hh) * 60);
      this.clock = { h: hh, m: mm };
      return this.clock;
    }

    _c(hex) {
      this._tmp = this._tmp || {};
      if (!this._tmp[hex]) this._tmp[hex] = new THREE.Color(hex);
      return this._tmp[hex];
    }
  }

  LSC.Sky = SkySystem;
})();
