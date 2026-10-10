/* =========================================================================
 * textures.js — procedural CanvasTextures for the mesh campus.
 * Every facade texture is authored in METRES: LSC.Tex.get(name) returns
 * { map, w, h } where w/h are the real-world size one texture repeat covers.
 * The geometry builder (geo.js) derives UVs from world coordinates, so floor
 * bands line up across separate boxes.
 * ========================================================================= */
'use strict';
window.LSC = window.LSC || {};

(function () {
  // Deterministic RNG so the textures are identical on every load.
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return [c, c.getContext('2d')];
  }

  function toTex(c, repeat) {
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    if (repeat !== false) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    t.needsUpdate = true;
    return t;
  }

  function noise(ctx, w, h, amt, r, alpha) {
    for (let i = 0; i < amt; i++) {
      const v = r() < 0.5 ? 0 : 255;
      ctx.fillStyle = `rgba(${v},${v},${v},${alpha * r()})`;
      ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
    }
  }

  const PPM = 32; // pixels per metre for facade textures
  const lib = {};

  /* Classroom slab: 4 m bays x 3.5 m floors. Photos show white vertical fins,
     cream spandrel bands and long ribbons of grey-glazed windows with
     occasional pale louvre panels. 8 bays x 4 floors per repeat. */
  lib.classroom = function () {
    const bw = 4, fh = 3.5, nx = 8, ny = 4;
    const [c, g] = canvas(bw * nx * PPM, fh * ny * PPM);
    const r = rng(1932);
    for (let fy = 0; fy < ny; fy++) {
      for (let bx = 0; bx < nx; bx++) {
        const x0 = bx * bw * PPM, y0 = (ny - 1 - fy) * fh * PPM;
        // spandrel (bottom 1.05 m of each floor)
        g.fillStyle = '#e9e5d6';
        g.fillRect(x0, y0 + 2.45 * PPM, bw * PPM, 1.05 * PPM);
        g.fillStyle = 'rgba(0,0,0,0.10)';
        g.fillRect(x0, y0 + 2.45 * PPM, bw * PPM, 3);
        // window ribbon
        const shade = 50 + r() * 30;
        g.fillStyle = `rgb(${shade},${shade + 8},${shade + 16})`;
        g.fillRect(x0, y0, bw * PPM, 2.45 * PPM);
        // curtains / blinds / louvre panels
        const kind = r();
        if (kind < 0.18) {
          g.fillStyle = '#c9c2a8';
          g.fillRect(x0 + 0.4 * PPM, y0 + 0.3 * PPM, 3.2 * PPM, 1.9 * PPM);
          g.fillStyle = 'rgba(0,0,0,0.15)';
          for (let k = 0; k < 12; k++) g.fillRect(x0 + 0.4 * PPM, y0 + 0.3 * PPM + k * 5, 3.2 * PPM, 1);
        } else if (kind < 0.45) {
          g.fillStyle = 'rgba(225,225,215,0.55)';
          g.fillRect(x0 + (0.3 + r() * 1.5) * PPM, y0 + 0.25 * PPM, (0.8 + r()) * PPM, 2.0 * PPM);
        }
        // sky reflection
        g.fillStyle = 'rgba(170,190,210,0.18)';
        g.fillRect(x0, y0, bw * PPM, 0.7 * PPM);
        // mullions
        g.fillStyle = '#d8d6cc';
        for (let m = 1; m < 4; m++) g.fillRect(x0 + m * PPM - 1, y0, 2, 2.45 * PPM);
        g.fillRect(x0, y0 + 1.2 * PPM, bw * PPM, 2);
        // fin
        g.fillStyle = '#f4f2ea';
        g.fillRect(x0, y0, 0.35 * PPM, fh * PPM);
        g.fillStyle = 'rgba(0,0,0,0.12)';
        g.fillRect(x0 + 0.35 * PPM, y0, 2, fh * PPM);
      }
    }
    noise(g, c.width, c.height, 2500, r, 0.06);
    return { map: toTex(c), w: bw * nx, h: fh * ny };
  };

  /* Inner gallery wall (behind the open corridors): cream wall, classroom doors,
     high windows. 4 m bays x 3.5 m floors. */
  lib.gallery = function () {
    const bw = 4, fh = 3.5, nx = 8, ny = 2;
    const [c, g] = canvas(bw * nx * PPM, fh * ny * PPM);
    const r = rng(77);
    g.fillStyle = '#e6e0cf'; g.fillRect(0, 0, c.width, c.height);
    for (let fy = 0; fy < ny; fy++) {
      for (let bx = 0; bx < nx; bx++) {
        const x0 = bx * bw * PPM, y0 = (ny - 1 - fy) * fh * PPM;
        // ceiling slab shadow
        g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x0, y0, bw * PPM, 0.35 * PPM);
        if (r() < 0.35) {
          g.fillStyle = '#9a6b3c';
          g.fillRect(x0 + 0.5 * PPM, y0 + 1.1 * PPM, 1.0 * PPM, 2.4 * PPM);
        }
        g.fillStyle = '#4b5763';
        g.fillRect(x0 + 1.8 * PPM, y0 + 0.7 * PPM, 1.9 * PPM, 1.3 * PPM);
        g.fillStyle = '#c8c2b0';
        g.fillRect(x0 + 2.75 * PPM, y0 + 0.7 * PPM, 2, 1.3 * PPM);
        // notice boards
        if (r() < 0.2) { g.fillStyle = ['#c0392b', '#2e86c1', '#f1c40f'][Math.floor(r() * 3)]; g.fillRect(x0 + 0.3 * PPM, y0 + 1.3 * PPM, 0.8 * PPM, 0.6 * PPM); }
        g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(x0, y0 + 3.3 * PPM, bw * PPM, 0.2 * PPM);
      }
    }
    noise(g, c.width, c.height, 1500, r, 0.05);
    return { map: toTex(c), w: bw * nx, h: fh * ny };
  };

  /* Dark grey podium (west of the crest tower) with a ribbon of small windows. */
  lib.podiumGrey = function () {
    const [c, g] = canvas(16 * PPM, 4 * PPM);
    const r = rng(5);
    g.fillStyle = '#5c605e'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#cfd3d0';
    for (let i = 0; i < 8; i++) {
      g.fillRect(i * 2 * PPM + 6, 1.3 * PPM, 2 * PPM - 12, 1.1 * PPM);
      g.fillStyle = '#3d4447'; g.fillRect(i * 2 * PPM + 10, 1.4 * PPM, 2 * PPM - 20, 0.9 * PPM);
      g.fillStyle = '#cfd3d0';
    }
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 3.7 * PPM, c.width, 0.3 * PPM);
    noise(g, c.width, c.height, 1500, r, 0.08);
    return { map: toTex(c), w: 16, h: 4 };
  };

  /* Residential estate south of the track: brown-grey slabs, window grid with
     white balcony rails (3 m x 2.9 m cells). */
  function residential(seed, base, trim, win) {
    return function () {
      const cw = 3, ch = 2.9, nx = 8, ny = 6;
      const [c, g] = canvas(cw * nx * 24, ch * ny * 24);
      const P = 24, r = rng(seed);
      g.fillStyle = base; g.fillRect(0, 0, c.width, c.height);
      for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
        const x0 = x * cw * P, y0 = y * ch * P;
        g.fillStyle = win; g.fillRect(x0 + 0.35 * P, y0 + 0.5 * P, 2.3 * P, 1.5 * P);
        if (r() < 0.5) { g.fillStyle = 'rgba(230,230,220,0.5)'; g.fillRect(x0 + 0.35 * P, y0 + 0.5 * P, (0.5 + r()) * P, 1.5 * P); }
        g.fillStyle = trim; g.fillRect(x0 + 0.2 * P, y0 + 2.0 * P, 2.6 * P, 0.25 * P);
        if (r() < 0.25) { g.fillStyle = '#888'; g.fillRect(x0 + 2.2 * P, y0 + 2.25 * P, 0.6 * P, 0.4 * P); }
      }
      noise(g, c.width, c.height, 1500, r, 0.08);
      return { map: toTex(c), w: cw * nx, h: ch * ny };
    };
  }
  lib.estate = residential(11, '#7a6a5e', '#d9d4c8', '#3b3a3c');
  lib.towerWhite = residential(12, '#d8d5cc', '#f2f0ea', '#4a5866');
  lib.towerBeige = residential(13, '#cdb894', '#efe6d2', '#4a4e55');
  lib.towerPink = residential(14, '#d9b1aa', '#f0e4e0', '#4d4f58');
  lib.towerGrey = residential(15, '#9a9c9e', '#e0e0dc', '#3a4048');
  lib.villa = residential(16, '#e8e2d2', '#ffffff', '#56606a');

  /* Concrete roof: dark grey tiles with stains. */
  lib.roof = function () {
    const [c, g] = canvas(256, 256);
    const r = rng(9);
    g.fillStyle = '#6b6d6b'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 1;
    for (let i = 0; i <= 256; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(30,30,25,${0.05 + r() * 0.1})`; g.beginPath(); g.arc(r() * 256, r() * 256, 5 + r() * 25, 0, 7); g.fill(); }
    noise(g, 256, 256, 3000, r, 0.1);
    return { map: toTex(c), w: 8, h: 8 };
  };

  lib.tiles = function () { // light paving (pool deck, quad, plaza)
    const [c, g] = canvas(256, 256);
    const r = rng(21);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const v = 196 + r() * 22;
      g.fillStyle = `rgb(${v},${v - 4},${v - 12})`; g.fillRect(x * 32, y * 32, 32, 32);
    }
    g.strokeStyle = 'rgba(80,70,60,0.35)';
    for (let i = 0; i <= 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
    noise(g, 256, 256, 2000, r, 0.08);
    return { map: toTex(c), w: 4, h: 4 };
  };

  lib.slate = function () { // grey slate quad paving (lower quadrangle)
    const [c, g] = canvas(256, 256);
    const r = rng(22);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const v = 112 + r() * 34;
      g.fillStyle = `rgb(${v},${v + 2},${v + 4})`; g.fillRect(x * 32, y * 32, 32, 32);
    }
    g.strokeStyle = 'rgba(40,40,40,0.4)';
    for (let i = 0; i <= 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
    return { map: toTex(c), w: 5, h: 5 };
  };

  lib.grass = function () {
    const [c, g] = canvas(256, 256);
    const r = rng(23);
    g.fillStyle = '#5c8f3e'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${40 + r() * 60},${100 + r() * 60},${30 + r() * 30},0.5)`; g.fillRect(r() * 256, r() * 256, 2, 3); }
    return { map: toTex(c), w: 6, h: 6 };
  };

  lib.asphalt = function () {
    const [c, g] = canvas(256, 256);
    const r = rng(24);
    g.fillStyle = '#58595a'; g.fillRect(0, 0, 256, 256);
    noise(g, 256, 256, 6000, r, 0.12);
    return { map: toTex(c), w: 8, h: 8 };
  };

  lib.city = function () { // generic ground between buildings
    const [c, g] = canvas(256, 256);
    const r = rng(25);
    g.fillStyle = '#7d7b74'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${60 + r() * 40},${90 + r() * 50},${50 + r() * 20},0.6)`; g.beginPath(); g.arc(r() * 256, r() * 256, 6 + r() * 20, 0, 7); g.fill(); }
    noise(g, 256, 256, 4000, r, 0.1);
    return { map: toTex(c), w: 40, h: 40 };
  };

  /* The sports ground: track, pitch, D zones and the fenced east court, drawn
     once into a 2048x1024 canvas covering x -84..88, z 9..103 (world metres). */
  lib.sports = function () {
    const X0 = -84, X1 = 88, Z0 = 9, Z1 = 103;
    const W = 2048, H = 1024, sx = W / (X1 - X0), sz = H / (Z1 - Z0);
    const [c, g] = canvas(W, H);
    const px = (x) => (x - X0) * sx, pz = (z) => (z - Z0) * sz;
    const T = LSC.Tex.TRACK;
    g.fillStyle = '#8f8a7c'; g.fillRect(0, 0, W, H); // concrete apron
    function stadium(R) {
      g.beginPath();
      g.ellipse(px(T.cx + T.L), pz(T.cz), R * sx, R * sz, 0, -Math.PI / 2, Math.PI / 2);
      g.ellipse(px(T.cx - T.L), pz(T.cz), R * sx, R * sz, 0, Math.PI / 2, Math.PI * 1.5);
      g.closePath();
    }
    // tartan
    stadium(T.R); g.fillStyle = '#b4493b'; g.fill();
    const r = rng(30);
    for (let i = 0; i < 30000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 90 : 220},40,30,0.08)`; g.fillRect(r() * W, r() * H, 2, 2); }
    // lane lines
    g.strokeStyle = 'rgba(245,245,240,0.9)'; g.lineWidth = 2;
    for (let k = 0; k <= 6; k++) { stadium(T.R - 1.0 - k * 1.22); g.stroke(); }
    // inner field: red D zones, then the turf rectangle clipped to the inner kerb
    const Rin = T.R - 1.0 - 6 * 1.22 - 0.2;
    g.save(); stadium(Rin); g.clip();
    g.fillStyle = '#b04637'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#3f7d36';
    g.fillRect(px(T.fx0), pz(T.fz0), (T.fx1 - T.fx0) * sx, (T.fz1 - T.fz0) * sz);
    // mowing stripes
    for (let i = 0; i < 12; i++) {
      g.fillStyle = i % 2 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)';
      const w = (T.fx1 - T.fx0) / 12;
      g.fillRect(px(T.fx0 + i * w), pz(T.fz0), w * sx, (T.fz1 - T.fz0) * sz);
    }
    // pitch lines
    const gx0 = T.fx0 + 1.5, gx1 = T.fx1 - 1.5, gz0 = T.fz0 + 1.5, gz1 = T.fz1 - 1.5;
    const mx = (gx0 + gx1) / 2, mz = (gz0 + gz1) / 2;
    g.strokeStyle = '#f2f2ea'; g.lineWidth = 3;
    g.strokeRect(px(gx0), pz(gz0), (gx1 - gx0) * sx, (gz1 - gz0) * sz);
    g.beginPath(); g.moveTo(px(mx), pz(gz0)); g.lineTo(px(mx), pz(gz1)); g.stroke();
    g.beginPath(); g.ellipse(px(mx), pz(mz), 9.15 * sx, 9.15 * sz, 0, 0, 7); g.stroke();
    for (const s of [-1, 1]) {
      const gx = s < 0 ? gx0 : gx1;
      g.strokeRect(px(s < 0 ? gx : gx - 16.5), pz(mz - 20.15), 16.5 * sx, 40.3 * sz);
      g.strokeRect(px(s < 0 ? gx : gx - 5.5), pz(mz - 9.15), 5.5 * sx, 18.3 * sz);
      g.beginPath(); g.ellipse(px(gx - s * 11), pz(mz), 9.15 * sx, 9.15 * sz, 0, s < 0 ? -0.93 : Math.PI - 0.93, s < 0 ? 0.93 : Math.PI + 0.93); g.stroke();
    }
    g.restore();
    // east D: fenced tennis / futsal court (light green, red surround)
    const ec = T.eastCourt;
    g.fillStyle = '#b8473a'; g.fillRect(px(ec[0] - 1.5), pz(ec[1] - 1.5), (ec[2] - ec[0] + 3) * sx, (ec[3] - ec[1] + 3) * sz);
    g.fillStyle = '#6fae5a'; g.fillRect(px(ec[0]), pz(ec[1]), (ec[2] - ec[0]) * sx, (ec[3] - ec[1]) * sz);
    g.strokeStyle = '#f4f4ee'; g.lineWidth = 2;
    g.strokeRect(px(ec[0] + 1), pz(ec[1] + 1), (ec[2] - ec[0] - 2) * sx, (ec[3] - ec[1] - 2) * sz);
    g.beginPath(); g.moveTo(px(ec[0] + 1), pz((ec[1] + ec[3]) / 2)); g.lineTo(px(ec[2] - 1), pz((ec[1] + ec[3]) / 2)); g.stroke();
    // long-jump sand pit / high-jump mat in the west D (blue mat seen in every aerial)
    g.fillStyle = '#3d74c6'; g.fillRect(px(-61), pz(45), 6 * sx, 4 * sz);
    const t = toTex(c, false);
    return { map: t, w: X1 - X0, h: Z1 - Z0, x0: X0, z0: Z0 };
  };

  /* Basketball court (upper quadrangle): green court, blue run-off, red keys and
     red centre circle — as in both videos. 1 texture = whole court area 18 x 31 m. */
  lib.court = function () {
    const W = 18, D = 31, P = 32;
    const [c, g] = canvas(W * P, D * P);
    g.fillStyle = '#2f6fb4'; g.fillRect(0, 0, c.width, c.height);
    const x0 = 1.5 * P, z0 = 1.5 * P, cw = 15 * P, cd = 28 * P;
    g.fillStyle = '#3f8f52'; g.fillRect(x0, z0, cw, cd);
    g.fillStyle = '#c0453a';
    g.fillRect(x0 + (cw - 4.9 * P) / 2, z0, 4.9 * P, 5.8 * P);
    g.fillRect(x0 + (cw - 4.9 * P) / 2, z0 + cd - 5.8 * P, 4.9 * P, 5.8 * P);
    g.beginPath(); g.arc(x0 + cw / 2, z0 + cd / 2, 1.8 * P, 0, 7); g.fill();
    g.strokeStyle = '#f5f5f0'; g.lineWidth = 3;
    g.strokeRect(x0, z0, cw, cd);
    g.beginPath(); g.moveTo(x0, z0 + cd / 2); g.lineTo(x0 + cw, z0 + cd / 2); g.stroke();
    g.beginPath(); g.arc(x0 + cw / 2, z0 + cd / 2, 1.8 * P, 0, 7); g.stroke();
    for (const e of [0, 1]) {
      const zb = e ? z0 + cd : z0, sg = e ? -1 : 1;
      g.beginPath(); g.arc(x0 + cw / 2, zb + sg * 1.6 * P, 6.75 * P, e ? Math.PI + 0.2 : 0.2, e ? 2 * Math.PI - 0.2 : Math.PI - 0.2); g.stroke();
      g.strokeRect(x0 + (cw - 4.9 * P) / 2, e ? zb - 5.8 * P : zb, 4.9 * P, 5.8 * P);
    }
    return { map: toTex(c, false), w: W, h: D };
  };

  lib.redcourt = function () { // the red/green games courts east of the main block
    const [c, g] = canvas(256, 256);
    const r = rng(40);
    g.fillStyle = '#b8493d'; g.fillRect(0, 0, 256, 256);
    noise(g, 256, 256, 5000, r, 0.08);
    return { map: toTex(c), w: 8, h: 8 };
  };

  lib.pool = function () { // 50 m pool, 8 lanes, lane ropes and black lane lines
    const W = 50, D = 19, P = 20;
    const [c, g] = canvas(W * P, D * P);
    const grd = g.createLinearGradient(0, 0, 0, c.height);
    grd.addColorStop(0, '#2c8fd8'); grd.addColorStop(1, '#3aa6e6');
    g.fillStyle = grd; g.fillRect(0, 0, c.width, c.height);
    const lw = D / 8;
    for (let i = 0; i < 8; i++) {
      g.fillStyle = 'rgba(10,30,90,0.7)';
      g.fillRect(2 * P, (i + 0.5) * lw * P - 3, (W - 4) * P, 6);
      g.fillRect(2 * P - 12, (i + 0.5) * lw * P - 14, 6, 28);
      g.fillRect((W - 2) * P + 6, (i + 0.5) * lw * P - 14, 6, 28);
    }
    for (let i = 1; i < 8; i++) {
      for (let x = 0; x < W * P; x += 10) {
        const end = x < 5 * P || x > (W - 5) * P;
        g.fillStyle = end ? '#d23b3b' : ((x / 10) % 2 ? '#f2f2f2' : '#1f5fbf');
        g.fillRect(x, i * lw * P - 2, 9, 4);
      }
    }
    return { map: toTex(c, false), w: W, h: D };
  };

  /* Lettering for the east retaining wall: crest + "La Salle College". */
  lib.wallSign = function () {
    const [c, g] = canvas(1024, 128);
    g.fillStyle = '#efeee8'; g.fillRect(0, 0, 1024, 128);
    g.fillStyle = '#2b2f5a';
    g.font = 'bold 74px Georgia, "Times New Roman", serif';
    g.textBaseline = 'middle';
    g.fillText('La Salle College', 250, 68);
    const img = LSC.Tex.crestImg;
    if (img && img.complete && img.naturalWidth) g.drawImage(img, 120, 6, 108, 116);
    const t = toTex(c, false);
    if (img && !img.complete) img.addEventListener('load', () => { g.drawImage(img, 120, 6, 108, 116); t.needsUpdate = true; });
    return { map: t, w: 24, h: 3 };
  };

  lib.crest = function () {
    const img = LSC.Tex.crestImg;
    const t = new THREE.Texture(img);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    if (img.complete) t.needsUpdate = true; else img.addEventListener('load', () => { t.needsUpdate = true; });
    return { map: t, w: 1, h: 1 };
  };

  const cache = {};
  LSC.Tex = {
    rng,
    crestImg: null,
    // Track geometry shared by the texture and the 3D builder.
    TRACK: {
      cx: 2, cz: 55.85, L: 37.5, R: 44.15,
      fx0: -48.5, fx1: 51, fz0: 24.5, fz1: 87.5,
      eastCourt: [55, 40, 72, 72],
    },
    get(name) {
      if (!cache[name]) cache[name] = lib[name]();
      return cache[name];
    },
    preload(done) {
      const img = new Image();
      LSC.Tex.crestImg = img;
      img.onload = img.onerror = () => done();
      // data URI first: a file:// PNG is cross-origin to WebGL and silently drops the crest
      img.src = window.LSC_CREST_DATA || ((window.LSC_BASE || '') + 'assets/crest.png');
    },
  };
})();
