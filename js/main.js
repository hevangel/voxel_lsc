/* =========================================================================
 * main.js — bootstrap: renderer, voxel mesh chunks, distant scenery,
 * game loop, and the LSC.App controller the UI talks to.
 * ========================================================================= */
'use strict';

(function () {
  const App = {
    quality: 'high',
    scene: null, camera: null, renderer: null,
    sky: null, player: null, ui: null,
    worldData: null, world: null,
    entities: {},
    started: false,
    clock: new THREE.Clock(),

    init() {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(innerWidth, innerHeight);
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      document.getElementById('gl').appendChild(this.renderer.domElement);

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, 0.1, 3600);

      addEventListener('resize', () => {
        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(innerWidth, innerHeight);
      });

      this.ui = new LSC.UI(this);

      // build the world in idle chunks so the loading bar can breathe
      const phases = [];
      this.worldData = LSC.World.buildWorld((label, frac) => {
        this.ui.setProgress(frac * 0.9, label);
      });
      this.world = this.worldData.world;
      this.ui.setProgress(0.92, 'Weaving voxel meshes…');

      setTimeout(() => this.finishSetup(), 30);
    },

    finishSetup() {
      const v = this.world;

      // chunk meshes
      const CH = v.CHUNK;
      const opaqueMat = new THREE.MeshLambertMaterial({ vertexColors: true });
      const emissiveMat = new THREE.MeshBasicMaterial({ vertexColors: true });
      this.emissiveMat = emissiveMat;
      const meshes = [];
      const jobs = [];
      for (let cz = 0; cz < v.D; cz += CH) {
        for (let cx = 0; cx < v.W; cx += CH) {
          jobs.push([cx, Math.min(cx + CH - 1, v.W - 1), cz, Math.min(cz + CH - 1, v.D - 1)]);
        }
      }
      let ji = 0;
      const runJobs = () => {
        const t0 = performance.now();
        while (ji < jobs.length && performance.now() - t0 < 40) {
          const [x1, x2, z1, z2] = jobs[ji++];
          const g = v.buildChunkGeometry(x1, z1, x2, z2);
          if (g.opaque) {
            const m = new THREE.Mesh(g.opaque, opaqueMat);
            m.castShadow = true; m.receiveShadow = true;
            this.scene.add(m); meshes.push(m); this.opaqueMeshes = this.opaqueMeshes || []; this.opaqueMeshes.push(m);
          }
          if (g.emissive) {
            const m = new THREE.Mesh(g.emissive, emissiveMat);
            this.scene.add(m); meshes.push(m);
          }
        }
        this.ui.setProgress(0.92 + 0.08 * (ji / jobs.length), `Weaving voxel meshes… ${ji}/${jobs.length}`);
        if (ji < jobs.length) setTimeout(runJobs, 0);
        else this.afterMesh();
      };
      setTimeout(runJobs, 0);
      this.chunkMeshes = meshes;
    },

    afterMesh() {
      // sky + lighting
      this.sky = new LSC.Sky(this.scene, { quality: this.quality, startTime: 10.5 });

      // distant scenery (beyond voxel grid)
      this.buildDistantScenery();

      // signage planes
      this.buildSigns();

      // floodlight spotlights (track masts, pool deck, east courts)
      const T = (mx, my, mz) => new THREE.Vector3(120 + mx * 2, 22 + my * 2, 590 - mz * 2);
      const spots = [
        { pos: T(34, 17.6, 22), target: T(108, 0, 80) },
        { pos: T(182, 17.6, 22), target: T(108, 0, 80) },
        { pos: T(34, 17.6, 140), target: T(108, 0, 80) },
        { pos: T(182, 17.6, 140), target: T(108, 0, 80) },
        { pos: T(20, 24, 246), target: T(54, -2, 260) },
        { pos: T(86, 24, 246), target: T(54, -2, 260) },
        { pos: T(222, 14.5, 172), target: T(203, 0, 180) },
      ];
      this.sky.addFloodSpots(spots);

      // entities
      const E = LSC.Entities;
      this.entities.students = new E.Students(this.scene, this.world, this.worldData.walks);
      this.entities.birds = new E.Birds(this.scene);
      this.entities.flags = new E.Flags(this.scene, this.worldData.flags);
      this.entities.water = new E.PoolWater(this.scene, { x: 227, y: 16.5, z: 70, w: 104, d: 38 });
      this.entities.cars = new E.Cars(this.scene, this.worldData.parkedCars, this.world);

      // player + controls
      this.player = new LSC.Player(this.camera, this.renderer.domElement, this.world, {
        onMode: (m) => this.ui.setModeUI(m),
      });
      this.player.teleport(168, 24, 214); // forecourt driveway, facing the crest tower
      this.player.lookAtGrid(252, 62, 226);
      this.player.setMode('walk');

      this.ui.paintMinimapBase(this.worldData.mapColors);
      this.ui.attachPois(this.worldData.pois);
      this.ui.setProgress(1, 'Ready!');
      this.ui.showLanding();

      // pointer lock on click (walk mode)
      const canvas = this.renderer.domElement;
      canvas.addEventListener('click', () => {
        if (this.started && this.player.mode === 'walk' && document.pointerLockElement !== canvas) {
          this.lockPointer();
        }
      });
      document.addEventListener('pointerlockchange', () => {
        if (this.started && this.player.mode === 'walk' && document.pointerLockElement !== canvas) {
          this.ui.toast('Click the view to grab the mouse · press F to fly', 3000);
        }
      });

      // any WASD press during tour exits it
      document.addEventListener('keydown', (e) => {
        if (!this.started) return;
        if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code) && this.player.mode === 'tour') {
          this.setMode(this.ui._lastFreeMode || 'walk');
          if (this.player.mode === 'walk') this.lockPointer();
        }
      });

      this.started = true;
      this.animate();
    },

    buildSigns() {
      const T = LSC.Textures;
      this.dynamicTex = {};
      for (const s of this.worldData.signs) {
        let mat;
        if (s.tex === 'crest') mat = new THREE.MeshBasicMaterial({ map: T.crestTexture(), transparent: true });
        else if (s.tex === 'gateName') mat = new THREE.MeshBasicMaterial({ map: T.gateNameTexture(), transparent: true });
        else if (s.tex === 'wallName') mat = new THREE.MeshBasicMaterial({ map: T.fieldWallTexture(), transparent: true });
        else if (s.tex === 'scoreboard') {
          const sb = T.scoreboardTexture();
          this.dynamicTex.scoreboard = sb;
          mat = new THREE.MeshBasicMaterial({ map: sb.texture });
        }
        else mat = new THREE.MeshBasicMaterial({ map: T.crestTexture(), transparent: true });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.h), mat);
        mesh.position.set(s.x, s.y, s.z);
        mesh.rotation.y = s.ry;
        this.scene.add(mesh);
      }
      // occasional scoreboard updates
      setInterval(() => {
        if (!this.dynamicTex.scoreboard) return;
        const goals = ['LSC', 'OBA'];
        this.dynamicTex.scoreboard.draw(
          goals[(Math.random() * 2) | 0] === 'LSC' ? 'LSC' : 'OBA',
          'OPP',
          `${String((Math.random() * 90) | 0).padStart(2, '0')}'`
        );
      }, 12000);
    },

    buildDistantScenery() {
      const group = new THREE.Group();
      const CX = 345, CZ = 320; // campus centre in grid units
      const mkBox = (w, h, d, x, y, z, color) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
        m.position.set(x, y, z);
        group.add(m);
      };
      // Kowloon skyline to the south
      let seed = 987654321;
      const rng = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      const towers = [
        [180, 190, 52, 60, 0x8fa2b5], [260, 260, 44, 72, 0x7c8fa6], [330, 168, 60, 52, 0x94a7ba],
        [420, 296, 48, 84, 0x6c7f92], [520, 220, 56, 64, 0x8fa2b5], [620, 340, 52, 96, 0x5e718a],
        [740, 240, 48, 68, 0x7c8fa6], [-160, 220, 52, 64, 0x7c8fa6], [-260, 300, 48, 88, 0x6c7f92],
        [-380, 192, 60, 56, 0x94a7ba], [-500, 264, 48, 76, 0x7c8fa6], [-640, 320, 56, 92, 0x5e718a],
      ];
      for (const [dx, h, w, d, col] of towers) {
        mkBox(w, h, d, CX + dx, h / 2, CZ + 560 + rng() * 260, col);
      }
      // Lion Rock — the famous lion-shaped granite peak NNE of the school
      const rock = new THREE.MeshLambertMaterial({ color: 0x746b5e });
      const lionBody = new THREE.Mesh(new THREE.ConeGeometry(300, 380, 6), rock);
      lionBody.position.set(CX + 240, 140, CZ - 1350);
      lionBody.rotation.y = 0.5;
      group.add(lionBody);
      const lionHead = new THREE.Mesh(new THREE.BoxGeometry(150, 130, 110), rock);
      lionHead.position.set(CX + 210, 330, CZ - 1290);
      lionHead.rotation.y = 0.5;
      group.add(lionHead);
      // far mountain ranges east + west + north horizon
      const ridge = (x, z, w, h, d, color) => {
        const m = new THREE.Mesh(new THREE.ConeGeometry(w, h, 4), new THREE.MeshLambertMaterial({ color }));
        m.position.set(x, h / 2 - 12, z);
        m.rotation.y = rng() * 3;
        m.scale.z = 0.5;
        group.add(m);
      };
      for (let i = 0; i < 7; i++) ridge(CX - 1000 - i * 320, CZ - 520 + i * 240, 380, 240 + rng() * 280, 380, 0x66625a);
      for (let i = 0; i < 7; i++) ridge(CX + 1400 + i * 340, CZ - 640 + i * 260, 400, 220 + rng() * 300, 400, 0x66625a);
      for (let i = 0; i < 9; i++) ridge(CX - 1200 + i * 380, CZ - 1800 - rng() * 320, 480, 180 + rng() * 240, 440, 0x5e5b54);
      this.scene.add(group);
    },

    setQuality(q) {
      this.quality = q;
      if (!this.renderer) return;
      this.renderer.setPixelRatio(q === 'low' ? 1 : q === 'medium' ? Math.min(devicePixelRatio, 1.25) : Math.min(devicePixelRatio, 1.75));
      this.renderer.shadowMap.enabled = q !== 'low';
      if (this.sky) {
        this.sky.quality = q;
        this.sky.sun.castShadow = q !== 'low';
      }
      for (const m of this.opaqueMeshes || []) m.castShadow = q !== 'low';
    },

    enter(mode) {
      this.started = true;
      if (this.ui) this.ui.hideMenus();
      this.setMode(mode === 'tour' ? 'tour' : mode);
    },

    lockPointer() {
      try {
        const p = this.renderer.domElement.requestPointerLock();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (e) { /* pointer lock unavailable (e.g. embedded view) */ }
    },

    setMode(m) {
      this.player.setMode(m);
      if (m === 'walk') this.lockPointer();
      else if (document.pointerLockElement) document.exitPointerLock();
    },

    toggleTour() {
      if (this.player.mode === 'tour') this.setMode(this.ui._lastFreeMode || 'walk');
      else {
        this.setMode('tour');
        this.ui.toast('Guided tour — press any move key or ✕ to take over', 3600);
      }
    },

    animate() {
      requestAnimationFrame(() => this.animate());
      const dt = Math.min(0.05, this.clock.getDelta());
      const t = this.clock.elapsedTime;

      const clock = this.sky.update(dt, this.player ? this.player.pos : null);
      this.ui.setClock(clock.h, clock.m);
      this.emissiveMat.color.setScalar(this.sky.glow);

      if (this.player) {
        this.player.update(dt);
        this.entities.students.update(dt, t);
        this.entities.birds.update(dt, t);
        this.entities.flags.update(t);
        this.entities.water.update(t);
        this.entities.cars.update(dt);
        this.ui.drawMinimap();
        this.ui.updatePoiLabels(this.camera);
        if (this.player.mode === 'tour') this.ui.setTourProgress(this.player.tourT);
      }

      this.renderer.render(this.scene, this.camera);
    },
  };

  window.LSC = window.LSC || {};
  LSC.App = App;

  window.addEventListener('DOMContentLoaded', () => {
    // let the loading screen paint first
    setTimeout(() => App.init(), 60);
  });
})();
