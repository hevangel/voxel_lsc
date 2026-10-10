/* =========================================================================
 * controls.js — first-person WALK and free FLY controls with AABB collision.
 * Mouse look uses pointer lock when available, else click-drag.
 * Angles: yaw = compass heading in degrees (0 = north / -z, 90 = east / +x),
 * pitch = degrees above the horizon. Same convention as the flyover paths.
 * ========================================================================= */
'use strict';
window.LSC = window.LSC || {};

(function () {
  const RAD = Math.PI / 180;

  function applyCamera(cam, pos, yaw, pitch, roll) {
    cam.position.copy(pos);
    cam.rotation.order = 'YXZ';
    cam.rotation.set(pitch * RAD, -yaw * RAD, -(roll || 0) * RAD);
  }

  class Controls {
    constructor(camera, dom, colliders) {
      this.cam = camera; this.dom = dom; this.col = colliders;
      this.pos = new THREE.Vector3(-20, 1.7, 20);
      this.vel = new THREE.Vector3();
      this.yaw = 0; this.pitch = 0;
      this.mode = 'fly';
      this.keys = {};
      this.enabled = false;
      this.onGround = false;
      this.tmp = [];
      this.radius = 0.35;
      window.addEventListener('keydown', (e) => { if (!this.enabled) return; this.keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); });
      window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
      window.addEventListener('blur', () => { this.keys = {}; });
      let drag = null;
      dom.addEventListener('mousedown', (e) => {
        if (!this.enabled) return;
        if (document.pointerLockElement !== dom) {
          drag = { x: e.clientX, y: e.clientY };
          try { const p = dom.requestPointerLock && dom.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (err) { /* embedded browsers */ }
        }
      });
      window.addEventListener('mouseup', () => { drag = null; });
      window.addEventListener('mousemove', (e) => {
        if (!this.enabled) return;
        let dx = 0, dy = 0;
        if (document.pointerLockElement === dom) { dx = e.movementX; dy = e.movementY; }
        else if (drag) { dx = e.clientX - drag.x; dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY }; }
        else return;
        this.yaw = (this.yaw + dx * 0.12 + 360) % 360;
        this.pitch = Math.max(-89, Math.min(89, this.pitch - dy * 0.12));
      });
    }
    setPose(p, yaw, pitch) { this.pos.copy(p); this.yaw = yaw; this.pitch = pitch || 0; this.vel.set(0, 0, 0); }
    setMode(m) { this.mode = m; this.vel.set(0, 0, 0); }
    anyMoveKey() { const k = this.keys; return k.KeyW || k.KeyA || k.KeyS || k.KeyD || k.ArrowUp || k.ArrowDown || k.ArrowLeft || k.ArrowRight; }

    /* move the player box by d along one axis, stopping at colliders */
    sweep(axis, d, half, h) {
      if (d === 0) return false;
      const p = this.pos;
      const next = p.clone(); next.setComponent(axis, next.getComponent(axis) + d);
      const feet = this.mode === 'walk' ? next.y - 1.6 : next.y - 0.4, head = this.mode === 'walk' ? next.y + 0.15 : next.y + 0.4;
      const list = this.col.query(next.x - half, next.z - half, next.x + half, next.z + half, this.tmp);
      let hit = false;
      for (const b of list) {
        if (next.x + half <= b[0] || next.x - half >= b[3] || next.z + half <= b[2] || next.z - half >= b[5]) continue;
        if (head <= b[1] || feet >= b[4]) continue;
        // step up small ledges while walking
        if (this.mode === 'walk' && axis !== 1 && b[4] - feet <= 0.55 && this.onGround) { next.y = b[4] + 1.6 + 0.01; continue; }
        hit = true;
        if (axis === 1) {
          if (d < 0) { next.y = b[4] + (this.mode === 'walk' ? 1.6 : 0.4) + 0.001; this.onGround = true; }
          else next.y = b[1] - (this.mode === 'walk' ? 0.15 : 0.4) - 0.001;
        } else {
          const lo = axis === 0 ? b[0] : b[2], hi = axis === 0 ? b[3] : b[5];
          next.setComponent(axis, d > 0 ? lo - half - 0.001 : hi + half + 0.001);
        }
      }
      p.copy(next);
      return hit;
    }

    update(dt) {
      const k = this.keys, fast = k.ShiftLeft || k.ShiftRight;
      const fwd = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
      const str = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
      const ya = this.yaw * RAD, pa = this.pitch * RAD;
      const half = this.radius;
      if (this.mode === 'fly') {
        const speed = fast ? 40 : 12;
        const dir = new THREE.Vector3(Math.sin(ya) * Math.cos(pa), Math.sin(pa), -Math.cos(ya) * Math.cos(pa));
        const right = new THREE.Vector3(Math.cos(ya), 0, Math.sin(ya));
        const want = dir.multiplyScalar(fwd).addScaledVector(right, str);
        want.y += (k.Space ? 1 : 0) - (k.KeyC || k.ControlLeft ? 1 : 0);
        if (want.lengthSq() > 1) want.normalize();
        this.vel.lerp(want.multiplyScalar(speed), Math.min(1, dt * 6));
        this.sweep(0, this.vel.x * dt, half);
        this.sweep(2, this.vel.z * dt, half);
        this.sweep(1, this.vel.y * dt, half);
        if (this.pos.y < LSC.Terrain.ground(this.pos.x, this.pos.z) + 0.5) this.pos.y = LSC.Terrain.ground(this.pos.x, this.pos.z) + 0.5;
      } else {
        const speed = fast ? 7 : 3.6;
        const vx = (Math.sin(ya) * fwd + Math.cos(ya) * str), vz = (-Math.cos(ya) * fwd + Math.sin(ya) * str);
        const l = Math.hypot(vx, vz) || 1;
        this.vel.x = vx / l * speed * Math.min(1, Math.hypot(fwd, str));
        this.vel.z = vz / l * speed * Math.min(1, Math.hypot(fwd, str));
        if (k.Space && this.onGround) { this.vel.y = 5.2; this.onGround = false; }
        this.vel.y -= 18 * dt;
        this.sweep(0, this.vel.x * dt, half);
        this.sweep(2, this.vel.z * dt, half);
        this.onGround = false;
        if (this.sweep(1, this.vel.y * dt, half) && this.vel.y < 0) { this.vel.y = 0; this.onGround = true; }
        const gy = LSC.Terrain.ground(this.pos.x, this.pos.z);
        if (this.pos.y < gy + 1.6) { this.pos.y = gy + 1.6; this.vel.y = 0; this.onGround = true; }
      }
      applyCamera(this.cam, this.pos, this.yaw, this.pitch, 0);
    }
  }

  LSC.Controls = Controls;
  LSC.applyCamera = applyCamera;
})();
