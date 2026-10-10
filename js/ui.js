/* =========================================================================
 * ui.js — landing screen, HUD, help panel, toasts and the flyover overlay
 * (picture-in-picture reference video with play/seek/mute). Boots the app.
 * App -> UI hooks: onMode(m), onFlyover(path), flyoverProgress(f, shot),
 * frame(dt), toast(msg).
 * ========================================================================= */
'use strict';
window.LSC = window.LSC || {};

(function () {
  const $ = (id) => document.getElementById(id);
  const fmt = (s) => { s = Math.max(0, s | 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  let toastTimer = 0, seeking = false;

  const UI = {
    toast(msg, secs) {
      const t = $('toast');
      t.textContent = msg; t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove('show'), (secs || 3) * 1000);
    },

    onMode(m) {
      const A = LSC.App;
      const flying = m === 'flyover';
      $('hud').classList.toggle('hidden', !(m === 'fly' || m === 'walk'));
      $('hud').classList.toggle('walk', m === 'walk');
      $('hud').classList.toggle('fly', m === 'fly');
      $('crosshair').classList.toggle('hidden', !(m === 'fly' || m === 'walk'));
      $('flyHud').classList.toggle('hidden', !flying);
      $('landing').classList.toggle('hidden', m !== 'idle');
      if (m === 'fly' || m === 'walk') {
        $('modeBadge').textContent = m === 'walk' ? 'ON FOOT' : 'FLY';
        $('btnMode').textContent = m === 'walk' ? '🕊 Fly' : '🚶 Walk';
      }
      if (!flying && A.flyover && A.flyover.video) A.flyover.video.pause();
    },

    onFlyover(path) {
      $('flyTitle').textContent = path.title;
      $('pipSeek').value = 0;
      $('pipPlay').textContent = '⏸';
      this.syncMute();
      this.toast('Auto flyover — Space pauses, Esc or any move key takes over.', 4);
    },

    flyoverProgress(f, shot) {
      const F = LSC.App.flyover, path = F.active;
      if (!path) return;
      if (!seeking) $('pipSeek').value = Math.round(f * 1000);
      $('pipTime').textContent = fmt(F.time()) + ' / ' + fmt(path.duration);
      const i = path.shots.indexOf(shot);
      $('flyShot').textContent = path.shots.length > 1 ? `· shot ${i + 1} / ${path.shots.length}` : '';
      const paused = F.useClock ? F.paused : F.video.paused;
      $('pipPlay').textContent = paused ? '▶' : '⏸';
    },

    syncMute() {
      const v = LSC.App.flyover.video;
      $('pipMute').textContent = v.muted ? '🔇' : '🔊';
    },

    frame() { /* reserved for per-frame HUD work */ },

    startFlyover(key) {
      const A = LSC.App;
      if (!A.ready || !A.flyover) return;
      $('helpPanel').classList.add('hidden');
      if (document.pointerLockElement) document.exitPointerLock();
      A.flyover.start(key);
    },
  };

  function enter(m) {
    const A = LSC.App;
    if (!A.ready) return;
    if (A.mode === 'idle') A.controls.setPose(new THREE.Vector3(-10, 30, 150), 340, -12);
    A.setMode(m);
  }

  function wire() {
    const A = LSC.App;
    $('goFly').onclick = () => enter('fly');
    $('goWalk').onclick = () => enter('walk');
    $('goA').onclick = () => UI.startFlyover('A');
    $('goB').onclick = () => UI.startFlyover('B');
    $('btnFlyA').onclick = () => UI.startFlyover('A');
    $('btnFlyB').onclick = () => UI.startFlyover('B');
    $('btnMode').onclick = () => A.setMode(A.mode === 'walk' ? 'fly' : 'walk');
    $('btnHelp').onclick = () => $('helpPanel').classList.toggle('hidden');
    $('helpClose').onclick = () => $('helpPanel').classList.add('hidden');
    $('btnMenu').onclick = () => { if (document.pointerLockElement) document.exitPointerLock(); A.setMode('idle'); };
    $('qualitySel').onchange = (e) => A.setQuality(e.target.value);

    $('flyExit').onclick = () => A.flyover.stop();
    $('pipPlay').onclick = () => A.flyover.togglePause();
    $('pipMute').onclick = () => { const v = A.flyover.video; v.muted = !v.muted; A.flyover.muted = v.muted; UI.syncMute(); };
    $('pipSize').onclick = () => $('pip').classList.toggle('big');
    const seek = $('pipSeek');
    seek.addEventListener('input', () => {
      seeking = true;
      if (A.flyover.active) A.flyover.seek(seek.value / 1000 * A.flyover.active.duration);
    });
    seek.addEventListener('change', () => { seeking = false; });

    const MOVE = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    window.addEventListener('keydown', (e) => {
      if (!A.ready || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (A.mode === 'flyover') {
        if (e.code === 'Escape' || MOVE.includes(e.code)) { A.flyover.stop(); e.preventDefault(); }
        else if (e.code === 'Space') { A.flyover.togglePause(); e.preventDefault(); }
        return;
      }
      if (e.code === 'Escape') $('helpPanel').classList.add('hidden');
      if (A.mode === 'idle') return;
      if (e.code === 'KeyF') A.setMode(A.mode === 'walk' ? 'fly' : 'walk');
      else if (e.code === 'KeyH') $('helpPanel').classList.toggle('hidden');
      else if (e.code === 'Digit1') UI.startFlyover('A');
      else if (e.code === 'Digit2') UI.startFlyover('B');
    });
  }

  LSC.UI = UI;

  window.addEventListener('DOMContentLoaded', async () => {
    try {
      await LSC.App.init();
    } catch (err) {
      $('loadLabel').textContent = 'Could not start 3D: ' + err.message;
      throw err;
    }
    wire();
    $('loading').classList.add('hidden');
    LSC.App.setMode('idle');
  });
})();
