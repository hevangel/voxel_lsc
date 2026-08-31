/* =========================================================================
 * player.js — camera controls: Walk (pointer lock + gravity + voxel
 * collision), Fly (no collision), and an auto Guided Tour along a spline.
 *
 * All coordinates are voxel-grid units (1 unit = LSC.SCALE = 0.5 m).
 * ========================================================================= */
'use strict';

(function () {
  const EYE = 3.24;   // 1.62 m eye height

  class Player {
    constructor(camera, dom, world, opts) {
      this.camera = camera;
      this.dom = dom;
      this.world = world;          // VoxelWorld
      this.mode = 'walk';          // walk | fly | tour
      this.onMode = opts.onMode || (() => {});
      this.onTourProgress = opts.onTourProgress || (() => {});

      this.pos = new THREE.Vector3(108, 20, 250); // La Salle Rd by the gate
      this.vel = new THREE.Vector3();
      this.yaw = Math.PI * 0.5;    // facing east into the campus
      this.pitch = -0.05;
      this.keys = {};
      this.sprinting = false;
      this.onGround = true;
      this.frozen = false;

      /* tour spline around the campus (grid units), kept clear of structures.
         XM(m)=120+2m, ZM(m)=590−2m; ground y=22, roofs ~74, tower cap ~90 */
      const M = (mx, my, mz) => new THREE.Vector3(120 + mx * 2, 22 + my * 2, 590 - mz * 2);
      this.tourPts = [
        M(-8, 4, 174),       // over La Salle Rd at the granite gate
        M(10, 5, 182),       // through the gate, on the drive
        M(26, 7, 198),       // forecourt garden + statue
        M(58, 16, 148),      // swing out facing the crest tower
        M(52, 12, 100),      // above the field's west end
        M(108, 9, 80),       // centre of the track
        M(158, 12, 112),     // east curve + long jump
        M(196, 13, 158),     // tennis courts
        M(206, 24, 220),     // rise beside the hall glass wall
        M(196, 26, 268),     // over the north wing
        M(120, 15, 262),     // descend toward the pool quad
        M(56, 12, 259),      // along the 50 m pool
        M(52, 20, 282),      // over the pool's north wing
        M(120, 28, 226),     // glide above the courtyard
        M(120, 15, 214),     // dip into the courtyard by the fountain
        M(60, 13, 200),      // out over the lobby corner
        M(24, 20, 160),      // above the forecourt canopy
        M(-6, 14, 128),      // long view down La Salle Road
        M(-8, 6, 176),       // back to the gate
      ];
      this.tourCurve = new THREE.CatmullRomCurve3(this.tourPts, true, 'centripetal');
      this.tourT = 0;
      this.tourLook = new THREE.Vector3();
      this.tourLookT = 0.02;

      this._fwd = new THREE.Vector3();
      this._right = new THREE.Vector3();

      document.addEventListener('keydown', (e) => {
        this.keys[e.code] = true;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.sprinting = true;
      });
      document.addEventListener('keyup', (e) => {
        this.keys[e.code] = false;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.sprinting = false;
      });
      document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement !== this.dom || this.mode === 'tour' || this.frozen) return;
        this.yaw -= e.movementX * 0.0023;
        this.pitch -= e.movementY * 0.0021;
        this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch));
      });
    }

    setMode(m) {
      this.mode = m;
      if (m !== 'tour') this.tourT = 0;
      this.vel.set(0, 0, 0);
      this.onMode(m);
    }

    teleport(x, y, z) {
      this.pos.set(x, y, z);
      this.vel.set(0, 0, 0);
    }

    lookAtGrid(gx, gy, gz) {
      const dx = gx - this.pos.x, dz = gz - this.pos.z;
      this.yaw = Math.atan2(-dx, -dz);
      const dy = gy - this.pos.y;
      this.pitch = Math.max(-1.2, Math.min(1.2, Math.atan2(dy, Math.hypot(dx, dz))));
    }

    /* -------- voxel collision helpers -------- */
    solidAt(x, y, z) {
      return this.world.solid(Math.floor(x), Math.floor(y), Math.floor(z));
    }
    /* capsule collision: cylinder r=0.68, height 3.5 (1.75 m), feet at pos.y */
    collide(nx, ny, nz) {
      const r = 0.68;
      const feet = ny, head = ny + 3.5;
      for (const [ox, oz] of [[r, 0], [-r, 0], [0, r], [0, -r], [r * 0.71, r * 0.71], [-r * 0.71, r * 0.71], [r * 0.71, -r * 0.71], [-r * 0.71, -r * 0.71]]) {
        for (let y = Math.floor(feet + 0.2); y <= Math.floor(head); y++) {
          if (this.solidAt(nx + ox, y, nz + oz)) return true;
        }
      }
      return false;
    }
    groundAt(x, z, fromY) {
      // highest surface below fromY+1.2
      for (let y = Math.floor(fromY + 1.2); y >= 0; y--) {
        if (this.solidAt(x, y, z)) return y + 1;
      }
      return 0;
    }

    update(dt) {
      if (this.frozen) { this.applyCamera(); return; }
      if (this.mode === 'tour') return this.updateTour(dt);
      if (this.mode === 'fly') return this.updateFly(dt);
      this.updateWalk(dt);
    }

    updateWalk(dt) {
      const sp = this.sprinting ? 21 : 10.4;    // 5.2 m / 10.4 km jog
      this._fwd.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      this._right.set(-this._fwd.z, 0, this._fwd.x);
      const mv = new THREE.Vector3();
      if (this.keys['KeyW'] || this.keys['ArrowUp']) mv.add(this._fwd);
      if (this.keys['KeyS'] || this.keys['ArrowDown']) mv.sub(this._fwd);
      if (this.keys['KeyD'] || this.keys['ArrowRight']) mv.add(this._right);
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) mv.sub(this._right);
      if (mv.lengthSq() > 0) mv.normalize().multiplyScalar(sp);

      // horizontal move with axis separation + step-up (≤ 2 units = 1 m)
      let nx = this.pos.x + mv.x * dt;
      if (this.collide(nx, this.pos.y, this.pos.z)) {
        const gN = this.groundAt(nx, this.pos.z, this.pos.y + 3.2);
        if (this.onGround && gN > 0 && gN - this.pos.y <= 2.1 && !this.collide(nx, gN, this.pos.z)) {
          this.pos.y = gN;
          if (this.collide(nx, this.pos.y, this.pos.z)) nx = this.pos.x;
        } else nx = this.pos.x;
      }
      let nz = this.pos.z + mv.z * dt;
      if (this.collide(nx, this.pos.y, nz)) {
        const gN = this.groundAt(nx, nz, this.pos.y + 3.2);
        if (this.onGround && gN > 0 && gN - this.pos.y <= 2.1 && !this.collide(nx, gN, nz)) {
          this.pos.y = gN;
          if (this.collide(nx, this.pos.y, nz)) nz = this.pos.z;
        } else nz = this.pos.z;
      }
      this.pos.x = nx; this.pos.z = nz;

      // gravity / jump
      const g = 44;
      this.vel.y -= g * dt;
      if ((this.keys['Space']) && this.onGround) { this.vel.y = 16.4; this.onGround = false; }
      let ny = this.pos.y + this.vel.y * dt;
      if (this.vel.y <= 0) {
        const gy = this.groundAt(Math.round(this.pos.x), Math.round(this.pos.z), this.pos.y + 0.8);
        const gyC = this.groundAt(this.pos.x, this.pos.z, this.pos.y + 0.8);
        const target = Math.max(gy, gyC);
        if (ny <= target) { ny = target; this.vel.y = 0; this.onGround = true; }
        else this.onGround = false;
      } else {
        if (this.collide(this.pos.x, ny, this.pos.z) && !this.collide(this.pos.x, this.pos.y, this.pos.z)) {
          ny = this.pos.y; this.vel.y = 0; // head bump
        }
        this.onGround = false;
      }
      // stuck inside geometry (e.g. teleport) → nudge up, never more than 1.5 m
      let guard = 0;
      while (this.collide(this.pos.x, ny, this.pos.z) && guard++ < 3) ny += 2;
      if (this.collide(this.pos.x, ny, this.pos.z)) { ny = this.pos.y; this.vel.y = 0; }
      this.pos.y = ny;
      this.applyCamera();
    }

    updateFly(dt) {
      const sp = this.sprinting ? 84 : 28;
      this._fwd.set(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch));
      this._right.set(-this._fwd.z, 0, this._fwd.x).normalize();
      const mv = new THREE.Vector3();
      if (this.keys['KeyW'] || this.keys['ArrowUp']) mv.add(this._fwd);
      if (this.keys['KeyS'] || this.keys['ArrowDown']) mv.sub(this._fwd);
      if (this.keys['KeyD'] || this.keys['ArrowRight']) mv.add(this._right);
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) mv.sub(this._right);
      if (this.keys['Space']) mv.y += 1;
      if (this.keys['KeyC'] || this.keys['ControlLeft']) mv.y -= 1;
      if (mv.lengthSq() > 0) mv.normalize().multiplyScalar(sp);
      this.pos.addScaledVector(mv, dt);
      this.pos.y = Math.max(2, Math.min(360, this.pos.y));
      this.applyCamera();
    }

    updateTour(dt) {
      this.tourT = (this.tourT + dt * 0.0042) % 1;
      const p = this.tourCurve.getPointAt(this.tourT);
      const look = this.tourCurve.getPointAt((this.tourT + 0.012) % 1);
      const sway = Math.sin(this.tourT * Math.PI * 2 * 9) * 1.2;
      this.camera.position.set(p.x, p.y + 2.8 + Math.sin(this.tourT * 40) * 0.24, p.z + sway * 0.4);
      this.camera.lookAt(look.x, look.y + 2.4, look.z);
      this.pos.copy(p); // for shadow focus + minimap
      this.yaw = Math.atan2(-(look.x - p.x), -(look.z - p.z));
      this.onTourProgress(this.tourT);
    }

    applyCamera() {
      this.camera.position.set(this.pos.x, this.pos.y + EYE, this.pos.z);
      this.camera.rotation.set(0, 0, 0);
      this.camera.rotateY(this.yaw);
      this.camera.rotateX(this.pitch);
    }
  }

  LSC.Player = Player;
})();
