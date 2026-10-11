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

  /* ---------------------------------------------------------------------
   * YouTube stand-in for the <video> element. The reference .mp4 files are
   * gitignored, so on GitHub Pages the clip comes from YouTube instead. This
   * exposes the subset of HTMLMediaElement that Flyover and ui.js use
   * (currentTime, paused, muted, readyState, play, pause, onended, onerror),
   * so nothing else needs to know which source is playing.
   * The IFrame API only refreshes getCurrentTime() a few times a second, so
   * currentTime is extrapolated from the last report to keep the camera smooth.
   * ------------------------------------------------------------------- */
  let ytApi = null;
  function loadYouTubeApi() {
    if (ytApi) return ytApi;
    ytApi = new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) { resolve(window.YT); return; }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(window.YT); };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      s.onerror = () => { ytApi = null; reject(new Error('YouTube API failed to load')); };
      document.head.appendChild(s);
      setTimeout(() => reject(new Error('YouTube API timed out')), 15000);
    });
    return ytApi;
  }

  class YouTubeVideo {
    constructor(host, id, muted) {
      this.onended = null; this.onerror = null;
      this.readyState = 0;
      this._muted = !!muted;
      this._want = true;              // play() requested and not since paused
      this._state = -1;
      this._base = 0; this._stamp = performance.now(); this._last = 0;
      this._dead = false;
      const el = document.createElement('div');
      host.innerHTML = ''; host.appendChild(el);
      loadYouTubeApi().then((YT) => {
        if (this._dead) return;
        this.player = new YT.Player(el, {
          videoId: id, width: '100%', height: '100%',
          playerVars: {
            autoplay: 1, controls: 0, disablekb: 1, fs: 0, rel: 0, playsinline: 1,
            modestbranding: 1, iv_load_policy: 3, mute: this._muted ? 1 : 0, origin: location.origin,
          },
          events: {
            onReady: () => {
              this.readyState = 1;
              if (this._muted) this.player.mute(); else this.player.unMute();
              if (this._base > 0) this.player.seekTo(this._base, true);
              if (this._want) this._kick();
            },
            onStateChange: (e) => {
              this._state = e.data;
              this._sync(true);
              if (e.data === 0 && this.onended) this.onended();
            },
            onError: () => this._fail(),
          },
        });
      }, () => this._fail());
    }
    _fail() { if (!this._dead && this.onerror) this.onerror(); }
    // Browsers may refuse autoplay with sound; if it has not started shortly, retry muted.
    _kick() {
      this.player.playVideo();
      clearTimeout(this._kickT);
      this._kickT = setTimeout(() => {
        if (this._dead || !this._want || this._state === 1 || this._state === 3) return;
        this.muted = true;
        this.player.playVideo();
        if (LSC.UI) { LSC.UI.toast('Video started muted — the browser blocked sound.'); LSC.UI.syncMute(); }
      }, 1500);
    }
    _sync(force) {
      if (!this.player || !this.player.getCurrentTime) return;
      const t = this.player.getCurrentTime() || 0;
      if (force || t !== this._reported) { this._reported = t; this._base = t; this._stamp = performance.now(); }
    }
    get currentTime() {
      this._sync(false);
      let t = this._base;
      if (this._state === 1) t += (performance.now() - this._stamp) / 1000;
      // never step backwards by a few frames when a fresh (slightly lower) report lands
      if (this._state === 1 && t < this._last && this._last - t < 0.5) t = this._last;
      this._last = t;
      return t;
    }
    set currentTime(t) {
      this._base = t; this._last = t; this._stamp = performance.now();
      if (this.player && this.player.seekTo) this.player.seekTo(t, true);
    }
    get paused() { return this.player && this.readyState ? this._state !== 1 && this._state !== 3 : !this._want; }
    get muted() { return this._muted; }
    set muted(m) {
      this._muted = !!m;
      if (this.player && this.player.mute) { if (m) this.player.mute(); else this.player.unMute(); }
    }
    play() {
      this._want = true;
      if (this.player && this.readyState) this._kick();
      return Promise.resolve();
    }
    pause() {
      this._want = false;
      clearTimeout(this._kickT);
      if (this.player && this.player.pauseVideo) this.player.pauseVideo();
    }
    destroy() {
      this._dead = true;
      clearTimeout(this._kickT);
      if (this.player && this.player.destroy) this.player.destroy();
      this.player = null;
    }
  }

  /* Which source to play: ?video=youtube|local forces one. Otherwise GitHub Pages
   * uses YouTube (the .mp4s are not published) and everything else tries the
   * local .mp4 first, falling back to YouTube over http and to a timer from disk. */
  function videoPreference() {
    const q = new URLSearchParams(location.search).get('video');
    if (q === 'youtube' || q === 'local') return q;
    return /\.github\.io$/i.test(location.hostname) ? 'youtube' : 'local';
  }

  class Flyover {
    constructor(app) {
      this.app = app;
      this.active = null;
      this.localVideo = document.getElementById('pipVideo');
      this.ytHost = document.getElementById('pipYT');
      this.video = this.localVideo;
      this.clock = 0;
      this.useClock = false;
    }
    start(key) {
      const path = LSC.PATHS[key];
      if (!path) return;
      this.key = key; this.active = path; this.clock = 0; this.useClock = false; this.paused = false;
      const pref = videoPreference();
      const canYT = !!(path.youtube && this.ytHost && location.protocol !== 'file:');
      if (pref === 'youtube' && canYT) this.playYouTube(path);
      else this.playLocal(path, canYT && pref !== 'local');
      this.app.setMode('flyover');
      if (LSC.UI) LSC.UI.onFlyover(path);
    }
    showSource(yt) {
      if (this.localVideo) this.localVideo.classList.toggle('hidden', yt);
      if (this.ytHost) this.ytHost.classList.toggle('hidden', !yt);
    }
    dropYouTube() {
      if (this.yt) { this.yt.destroy(); this.yt = null; }
    }
    toTimer(msg) {
      this.useClock = true;
      if (LSC.UI) { LSC.UI.toast(msg); LSC.UI.syncMute(); }
    }
    playLocal(path, ytFallback) {
      this.dropYouTube();
      const v = this.localVideo;
      this.video = v;
      if (!v) { this.useClock = true; return; }
      this.showSource(false);
      const active = path;
      v.onerror = () => {
        if (this.active !== active) return;
        if (ytFallback) this.playYouTube(path, this.time());
        else this.toTimer('Reference video not found — flying the path on a timer.');
      };
      v.onended = () => this.finish();
      v.src = path.video;
      v.currentTime = 0;
      v.muted = !!this.muted;
      const p = v.play();
      if (p && p.catch) p.catch((err) => {
        if (this.active !== active || (err && err.name !== 'NotAllowedError')) return;
        v.muted = true; this.muted = true;
        if (LSC.UI) LSC.UI.syncMute();
        v.play().catch(() => {});
      });
    }
    playYouTube(path, at) {
      if (this.localVideo) { this.localVideo.onerror = null; this.localVideo.pause(); this.localVideo.removeAttribute('src'); this.localVideo.load(); }
      this.dropYouTube();
      this.showSource(true);
      const active = path;
      const yt = new YouTubeVideo(this.ytHost, path.youtube, this.muted);
      if (at) yt.currentTime = at;
      yt.onended = () => { if (this.active === active) this.finish(); };
      yt.onerror = () => {
        if (this.active !== active || this.yt !== yt) return;
        this.showSource(false);
        this.toTimer('YouTube video unavailable — flying the path on a timer.');
      };
      this.yt = yt; this.video = yt;
    }
    time() {
      // the YouTube stand-in already holds the intended time while it loads
      if (!this.useClock && this.video && (this.video.readyState >= 1 || this.video === this.yt)) return this.video.currentTime;
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
