/* =========================================================================
 * solve_pose.js — recover a flyover camera key from landmark correspondences.
 *
 * Instead of eyeballing [t, x, y, z, yaw, pitch, roll, vfov] keys for
 * js/paths.js, mark where known 3D landmarks (tools/landmarks.json) land in a
 * video frame and let this solve the pose by non-linear least squares
 * (Levenberg-Marquardt) that minimises the reprojection error in pixels.
 *
 * The projection is Three.js r149's own: a PerspectiveCamera with
 * rotation.order 'YXZ' and rotation.set(pitch, -yaw, -roll) — i.e. identical
 * to LSC.applyCamera in js/controls.js — fed through project(). So a pose that
 * fits here renders in the same place in tools/calib.js.
 *
 * ---------------------------------------------------------------------------
 * USAGE
 *   node tools/solve_pose.js obs.json
 *
 * obs.json is an ARRAY of entries, one per frame to solve:
 *   [
 *     {
 *       "t":   57,                 // key time (seconds); echoed into the key line
 *       "w":   1920, "h": 1080,    // the pixel size of the frame u,v were read in
 *       "pts": {                   // landmarkName -> [u, v], pixels, origin TOP-LEFT
 *         "crest_centre":   [612, 388],
 *         "track_centre":   [980, 742],
 *         "ring_roof_SW":   [410, 300],
 *         "pitch_centre_spot":[1001, 690],
 *         "wall_sign_N_top":[1500, 455]
 *       },
 *       "init":  { "x":-20,"y":120,"z":180,"yaw":350,"pitch":-35,"roll":0,"fov":52 }, // optional seed
 *       "fixFov": 52               // optional: lock vfov to this and DON'T solve it
 *     }
 *   ]
 *
 *   - Landmark names must exist in tools/landmarks.json.
 *   - Need >= 5 points to solve fov too, or >= 4 points when fov is fixed
 *     (fixFov given, or init.fov given with "fixFov": true-ish). 6+ is better.
 *   - u,v are in the frame's own pixels (w x h). Frames are 16:9; the solver
 *     works in normalised image coords so any 16:9 size is fine.
 *   - With no init, the solver tries many random/heuristic restarts.
 *
 * OUTPUT (per entry): solved pose, RMS pixel error (normalised to a 1920x1080
 * frame), per-point residuals, and a ready-to-paste key line
 *   [t, x, y, z, yaw, pitch, roll, fov],
 * ready for a shot's keys[] in js/paths.js (drop the trailing fov if the shot's
 * vfov is global).
 *
 * Depends only on js/lib/three.min.js (required directly; it is UMD).
 * ========================================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const THREE = require(path.join(__dirname, '..', 'js', 'lib', 'three.min.js'));

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

// ---- projection: identical to LSC.applyCamera + PerspectiveCamera ----------
// Reuse one camera; set pose, project each landmark to pixels in a WxH frame.
const _cam = new THREE.PerspectiveCamera(60, 16 / 9, 0.15, 12000);
_cam.rotation.order = 'YXZ';
const _v = new THREE.Vector3();

function project(P, X, Y, Z, w, h) {
  // P = {x,y,z,yaw,pitch,roll,fov}; returns [u, v, inFront]
  _cam.fov = P.fov;
  _cam.aspect = w / h;
  _cam.position.set(P.x, P.y, P.z);
  _cam.rotation.set(P.pitch * RAD, -P.yaw * RAD, -(P.roll || 0) * RAD);
  _cam.updateMatrixWorld(true);
  _cam.updateProjectionMatrix();
  _v.set(X, Y, Z).project(_cam);
  const u = (_v.x * 0.5 + 0.5) * w;
  const v = (1 - (_v.y * 0.5 + 0.5)) * h;
  // _v.z in NDC < 1 roughly means in front & within far plane; a point behind
  // the camera projects with |ndc| blowing up / sign flipping — guard on it.
  return [u, v, _v.z < 1 && _v.z > -1];
}

// Parameter vector <-> pose. Order: [x, y, z, yaw, pitch, roll] (+ [fov] if solving fov).
function vecToPose(vec, solveFov, fixedFov) {
  const P = { x: vec[0], y: vec[1], z: vec[2], yaw: vec[3], pitch: vec[4], roll: vec[5] };
  P.fov = solveFov ? vec[6] : fixedFov;
  return P;
}
function poseToVec(P, solveFov) {
  const v = [P.x, P.y, P.z, P.yaw, P.pitch, P.roll];
  if (solveFov) v.push(P.fov);
  return v;
}

// Residuals in NORMALISED frame units (fraction of frame height), so RMS is
// scale-independent; multiply by 1080 at the end to report "px on a 1080p frame".
function residuals(vec, obs, solveFov, fixedFov) {
  const P = vecToPose(vec, solveFov, fixedFov);
  const r = [];
  for (const o of obs) {
    const [u, v, ok] = project(P, o.X, o.Y, o.Z, o.w, o.h);
    if (!ok || !isFinite(u) || !isFinite(v)) { r.push(1e3, 1e3); continue; }
    r.push((u - o.u) / o.h, (v - o.v) / o.h);
  }
  return r;
}

function cost(res) { let s = 0; for (const e of res) s += e * e; return s; }

// ---- small dense linear algebra (normal equations with LM damping) --------
function solveLinear(A, b) {
  // Solve (A) x = b for symmetric positive-ish A (n x n) via Gaussian elim with
  // partial pivoting. Returns null if singular.
  const n = b.length;
  const M = A.map((row, i) => row.slice().concat(b[i]));
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    if (Math.abs(M[piv][col]) < 1e-12) return null;
    [M[col], M[piv]] = [M[piv], M[col]];
    const d = M[col][col];
    for (let c = col; c <= n; c++) M[col][c] /= d;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col];
      if (f === 0) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row) => row[n]);
}

// Numerical Jacobian: d(residual_i)/d(param_j), forward differences with
// per-parameter step sizes (metres vs degrees vs fov differ in scale).
function jacobian(vec, obs, solveFov, fixedFov, r0) {
  const n = vec.length, m = r0.length;
  const steps = [0.05, 0.05, 0.05, 0.02, 0.02, 0.02, 0.02]; // m, m, m, deg, deg, deg, fov-deg
  const J = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    const hStep = steps[j];
    const vp = vec.slice(); vp[j] += hStep;
    const rp = residuals(vp, obs, solveFov, fixedFov);
    for (let i = 0; i < m; i++) J[i][j] = (rp[i] - r0[i]) / hStep;
  }
  return J;
}

// One Levenberg-Marquardt optimisation from a starting vector.
function lm(vec0, obs, solveFov, fixedFov, opts) {
  opts = opts || {};
  const maxIter = opts.maxIter || 120;
  let vec = vec0.slice();
  let lambda = opts.lambda0 || 1e-3;
  let r = residuals(vec, obs, solveFov, fixedFov);
  let c = cost(r);
  const n = vec.length;
  for (let iter = 0; iter < maxIter; iter++) {
    const J = jacobian(vec, obs, solveFov, fixedFov, r);
    // Normal equations: (JtJ + lambda*diag(JtJ)) dx = -Jt r
    const JtJ = Array.from({ length: n }, () => new Array(n).fill(0));
    const Jtr = new Array(n).fill(0);
    for (let i = 0; i < r.length; i++) {
      for (let a = 0; a < n; a++) {
        Jtr[a] += J[i][a] * r[i];
        for (let b = a; b < n; b++) JtJ[a][b] += J[i][a] * J[i][b];
      }
    }
    for (let a = 0; a < n; a++) for (let b = 0; b < a; b++) JtJ[a][b] = JtJ[b][a];

    let improved = false;
    for (let tries = 0; tries < 8; tries++) {
      const A = JtJ.map((row, a) => row.map((val, b) => val + (a === b ? lambda * (JtJ[a][a] || 1) : 0)));
      const neg = Jtr.map((x) => -x);
      const dx = solveLinear(A, neg);
      if (!dx) { lambda *= 10; continue; }
      const cand = vec.map((x, i) => x + dx[i]);
      // keep angles sane
      cand[3] = ((cand[3] % 360) + 360) % 360;         // yaw 0..360
      cand[4] = Math.max(-89.9, Math.min(89.9, cand[4])); // pitch
      cand[5] = Math.max(-80, Math.min(80, cand[5]));     // roll
      if (solveFov) cand[6] = Math.max(10, Math.min(120, cand[6]));
      const rc = residuals(cand, obs, solveFov, fixedFov);
      const cc = cost(rc);
      if (cc < c) {
        vec = cand; r = rc; c = cc; lambda = Math.max(1e-9, lambda * 0.4);
        improved = true; break;
      } else {
        lambda *= 4;
      }
    }
    if (!improved) break;
    if (c < 1e-10) break;
  }
  return { vec, cost: c };
}

// ---- restart seeding -------------------------------------------------------
function centroid(obs) {
  let x = 0, y = 0, z = 0;
  for (const o of obs) { x += o.X; y += o.Y; z += o.Z; }
  return [x / obs.length, y / obs.length, z / obs.length];
}

function makeSeeds(obs, solveFov, fixedFov, userInit, rng) {
  const seeds = [];
  const [cx, cy, cz] = centroid(obs);
  const fovGuess = solveFov ? 55 : fixedFov;
  if (userInit) {
    seeds.push(poseToVec({
      x: userInit.x, y: userInit.y, z: userInit.z,
      yaw: userInit.yaw, pitch: userInit.pitch, roll: userInit.roll || 0,
      fov: solveFov ? (userInit.fov || fovGuess) : fixedFov,
    }, solveFov));
  }
  // Heuristic aerial seeds: ring of camera positions around the scene
  // centroid, at a few radii and heights, each aimed at the centroid.
  const radii = [120, 200, 300];
  const heights = [60, 110, 170];
  for (const R of radii) {
    for (const H of heights) {
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * Math.PI * 2;
        const px = cx + Math.sin(a) * R;
        const pz = cz + Math.cos(a) * R;
        const py = cy + H;
        // yaw to look from (px,pz) toward (cx,cz): heading where 0=-z,90=+x
        const yaw = ((Math.atan2(cx - px, -(cz - pz)) * DEG) + 360) % 360;
        const horiz = Math.hypot(cx - px, cz - pz);
        const pitch = Math.atan2(-(py - cy), horiz) * DEG; // look down toward centre
        for (const fov of (solveFov ? [40, 55, 75] : [fixedFov])) {
          seeds.push(poseToVec({ x: px, y: py, z: pz, yaw, pitch, roll: 0, fov }, solveFov));
        }
      }
    }
  }
  // A few fully random seeds for robustness
  for (let i = 0; i < 20; i++) {
    const a = rng() * Math.PI * 2, R = 80 + rng() * 320, H = 20 + rng() * 220;
    const px = cx + Math.sin(a) * R, pz = cz + Math.cos(a) * R, py = cy + H;
    const yaw = ((Math.atan2(cx - px, -(cz - pz)) * DEG) + (rng() - 0.5) * 60 + 360) % 360;
    const horiz = Math.hypot(cx - px, cz - pz);
    const pitch = Math.atan2(-(py - cy), horiz) * DEG + (rng() - 0.5) * 20;
    const fov = solveFov ? 35 + rng() * 60 : fixedFov;
    seeds.push(poseToVec({ x: px, y: py, z: pz, yaw, pitch, roll: (rng() - 0.5) * 20, fov }, solveFov));
  }
  return seeds;
}

// deterministic RNG so restarts are reproducible
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- solve one observation entry ------------------------------------------
function solveEntry(entry, landmarks) {
  const w = entry.w, h = entry.h;
  const names = Object.keys(entry.pts || {});
  const obs = [];
  const missing = [];
  for (const nm of names) {
    const L = landmarks[nm];
    if (!L || nm.startsWith('_')) { missing.push(nm); continue; }
    const [u, v] = entry.pts[nm];
    obs.push({ name: nm, X: L[0], Y: L[1], Z: L[2], u, v, w, h });
  }

  const hasFixFov = entry.fixFov !== undefined && entry.fixFov !== null && entry.fixFov !== false;
  const fixedFov = hasFixFov ? +entry.fixFov : (entry.init && entry.init.fov) || 55;
  const solveFov = !hasFixFov;

  const need = solveFov ? 5 : 4;
  const result = { t: entry.t, obs, missing, solveFov, fixedFov, w, h };
  if (obs.length < need) {
    result.error = `need >= ${need} points ${solveFov ? '(solving fov)' : '(fixed fov)'}, got ${obs.length}`;
    return result;
  }

  const rng = mulberry32(0x5a1e + Math.round((entry.t || 0) * 1000));
  const seeds = makeSeeds(obs, solveFov, fixedFov, entry.init, rng);

  let best = null;
  for (const s of seeds) {
    const out = lm(s, obs, solveFov, fixedFov, { maxIter: 80 });
    if (!best || out.cost < best.cost) best = out;
    // early exit once we have a clearly good fit (RMS < ~0.5 px on 1080p)
    if (best && Math.sqrt(best.cost / (obs.length * 2)) * 1080 < 0.5) break;
  }
  // polish the best with more iterations
  best = lm(best.vec, obs, solveFov, fixedFov, { maxIter: 200, lambda0: 1e-4 });

  const P = vecToPose(best.vec, solveFov, fixedFov);
  const rmsNorm = Math.sqrt(best.cost / (obs.length * 2));
  const rmsPx1080 = rmsNorm * 1080; // report on a 1080p-equivalent frame

  // per-point residuals (in the frame's own pixels)
  const perPoint = obs.map((o) => {
    const [pu, pv, ok] = project(P, o.X, o.Y, o.Z, o.w, o.h);
    return {
      name: o.name,
      meas: [o.u, o.v],
      proj: [+pu.toFixed(1), +pv.toFixed(1)],
      err: ok ? +Math.hypot(pu - o.u, pv - o.v).toFixed(2) : Infinity,
      inFront: ok,
    };
  });

  result.pose = {
    x: +P.x.toFixed(3), y: +P.y.toFixed(3), z: +P.z.toFixed(3),
    yaw: +(((P.yaw % 360) + 360) % 360).toFixed(3),
    pitch: +P.pitch.toFixed(3), roll: +P.roll.toFixed(3), fov: +P.fov.toFixed(3),
  };
  result.rmsPx1080 = +rmsPx1080.toFixed(3);
  result.perPoint = perPoint;
  return result;
}

// ---- CLI -------------------------------------------------------------------
function fmtKey(P, t) {
  const n = (x, d = 2) => {
    const r = +x.toFixed(d);
    return Object.is(r, -0) ? 0 : r;
  };
  return `[${n(t ?? 0, 2)}, ${n(P.x)}, ${n(P.y)}, ${n(P.z)}, ${n(P.yaw)}, ${n(P.pitch)}, ${n(P.roll)}, ${n(P.fov)}],`;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: node tools/solve_pose.js obs.json   (see header comment for obs.json shape)');
    process.exit(2);
  }
  const landmarks = JSON.parse(fs.readFileSync(path.join(__dirname, 'landmarks.json'), 'utf8'));
  let entries = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(entries)) entries = [entries];

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const res = solveEntry(e, landmarks);
    console.log('');
    console.log(`=== entry ${i}  (t=${res.t ?? '?'}, ${res.obs.length} pts, frame ${res.w}x${res.h}, fov ${res.solveFov ? 'solved' : 'fixed=' + res.fixedFov}) ===`);
    if (res.missing && res.missing.length) console.log('  (ignored unknown landmark names: ' + res.missing.join(', ') + ')');
    if (res.error) { console.log('  ERROR: ' + res.error); continue; }
    const P = res.pose;
    console.log(`  pose:  x=${P.x}  y=${P.y}  z=${P.z}   yaw=${P.yaw}  pitch=${P.pitch}  roll=${P.roll}  fov=${P.fov}`);
    console.log(`  RMS reprojection error: ${res.rmsPx1080} px (on a 1920x1080 frame)`);
    console.log('  per-point residual (px):');
    for (const pp of res.perPoint) {
      console.log(`    ${pp.name.padEnd(22)} meas (${pp.meas[0]},${pp.meas[1]})  proj (${pp.proj[0]},${pp.proj[1]})  err ${pp.err}${pp.inFront ? '' : '  [BEHIND CAMERA]'}`);
    }
    console.log('  key line (paste into a shot keys[] in js/paths.js):');
    console.log('    ' + fmtKey(P, res.t));
  }
}

if (require.main === module) main();

module.exports = { project, solveEntry, lm, fmtKey };
