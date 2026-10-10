/* =========================================================================
 * flyover.js — replays a reference video's camera path through the model,
 * locked to the video's own clock, with the clip playing picture-in-picture
 * in the bottom-right corner.
 *
 * Path data lives in paths.js (LSC.PATHS). A path is a list of SHOTS
 * (continuous camera moves between cuts/dissolves); each shot holds keys
 *   [t, x, y, z, yaw, pitch, roll, vfov]
 * t = video seconds, yaw = compass heading deg (0 = N, 90 = E), pitch deg up,
 * roll deg (+ = bank left, horizon rises on the right; verified by render), vfov = vertical field of view deg.
 * Inside a shot keys are interpolated with Catmull-Rom; between shots the
 * camera cuts, exactly like the edit of the video.
 * ========================================================================= */
'use strict';
window.LSC = window.LSC || {};

(function () {
  function cr(p0, p1, p2, p3, t) {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }
  function unwrapKeys(keys) {
    // make yaw continuous so interpolation never spins the long way round
    const out = keys.map((k) => k.slice());
    for (let i = 1; i < out.length; i++) {
      let d = out[i][4] - out[i - 1][4];
      while (d > 180) { out[i][4] -= 360; d -= 360; }
      while (d < -180) { out[i][4] += 360; d += 360; }
    }
    return out;
  }

  /* Sample a path at video time t -> {x,y,z,yaw,pitch,roll,fov,shot} or null. */
  function sample(path, t) {
    const shots = path.shots;
    let shot = null;
    for (const s of shots) if (t >= s.t0 && t < s.t1) { shot = s; break; }
    if (!shot) shot = t < shots[0].t0 ? shots[0] : shots[shots.length - 1];
    if (!shot._k) shot._k = unwrapKeys(shot.keys);
    const k = shot._k;
    const def = path.vfov || 55;
    if (k.length === 1 || t <= k[0][0]) return pose(k[0], def, shot);
    if (t >= k[k.length - 1][0]) return pose(k[k.length - 1], def, shot);
    let i = 0;
    while (i < k.length - 2 && t > k[i + 1][0]) i++;
    const a = k[Math.max(0, i - 1)], b = k[i], c = k[i + 1], d = k[Math.min(k.length - 1, i + 2)];
    const u = (t - b[0]) / (c[0] - b[0]);
    const v = [];
    for (let j = 1; j <= 6; j++) v[j] = cr(a[j], b[j], c[j], d[j], u);
    const fb = b[7] || def, fc = c[7] || def;
    return { x: v[1], y: v[2], z: v[3], yaw: v[4], pitch: v[5], roll: v[6], fov: fb + (fc - fb) * u, shot };
  }
  function pose(k, def, shot) {
    return { x: k[1], y: k[2], z: k[3], yaw: k[4], pitch: k[5], roll: k[6], fov: k[7] || def, shot };
  }

  class Flyover {
    constructor(app) {
      this.app = app;
      this.active = null;
      this.video = document.getElementById('pipVideo');
      this.clock = 0;
      this.useClock = false;
    }
    start(key) {
      const path = LSC.PATHS[key];
      if (!path) return;
      this.key = key; this.active = path; this.clock = 0; this.useClock = false;
      const v = this.video;
      if (v) {
        v.src = path.video;
        v.currentTime = 0;
        v.muted = !!this.muted;
        const p = v.play();
        if (p && p.catch) p.catch(() => { v.muted = true; this.muted = true; v.play().catch(() => { this.useClock = true; }); });
        v.onerror = () => { this.useClock = true; if (LSC.UI) LSC.UI.toast('Reference video not found — flying the path on a timer.'); };
        v.onended = () => this.finish();
      } else this.useClock = true;
      this.app.setMode('flyover');
      if (LSC.UI) LSC.UI.onFlyover(path);
    }
    time() {
      if (!this.useClock && this.video && this.video.readyState >= 1) return this.video.currentTime;
      return this.clock;
    }
    togglePause() {
      const v = this.video;
      if (this.useClock) { this.paused = !this.paused; return; }
      if (v.paused) v.play(); else v.pause();
    }
    seek(t) {
      if (this.useClock) this.clock = t; else this.video.currentTime = t;
    }
    stop() {
      if (this.video) { this.video.pause(); }
      // hand the camera over to free flight exactly where the flyover was
      const c = this.app.camera, ctl = this.app.controls;
      const e = new THREE.Euler().setFromQuaternion(c.quaternion, 'YXZ');
      ctl.setPose(c.position.clone(), (-e.y * 180 / Math.PI + 360) % 360, e.x * 180 / Math.PI);
      this.active = null;
      c.fov = 60; c.updateProjectionMatrix();
      this.app.setMode('fly');
    }
    finish() {
      if (LSC.UI) LSC.UI.toast('Flyover finished — you have the controls.');
      this.stop();
    }
    update(dt) {
      if (!this.active) return;
      if (this.useClock && !this.paused) {
        this.clock += dt;
        if (this.clock >= this.active.duration) { this.finish(); return; }
      }
      const p = sample(this.active, this.time());
      const cam = this.app.camera;
      if (Math.abs(cam.fov - p.fov) > 0.01) { cam.fov = p.fov; cam.updateProjectionMatrix(); }
      LSC.applyCamera(cam, new THREE.Vector3(p.x, p.y, p.z), p.yaw, p.pitch, p.roll);
      if (LSC.UI) LSC.UI.flyoverProgress(this.time() / this.active.duration, p.shot);
    }
  }

  Flyover.sample = sample;
  LSC.Flyover = Flyover;
})();
