/* =========================================================================
 * main.js — bootstrap: renderer, scene, campus + context build, render loop,
 * mode switching (fly / walk / flyover). LSC.App is the wiring hub.
 * ========================================================================= */
'use strict';
window.LSC = window.LSC || {};

(function () {
  const App = {
    mode: 'idle',
    ready: false,
    quality: 'high',
  };

  function setLoad(label, f) {
    const bar = document.getElementById('loadBar'), lab = document.getElementById('loadLabel');
    if (bar) bar.style.width = Math.round(f * 100) + '%';
    if (lab) lab.textContent = label;
  }
  const tick = () => new Promise((r) => setTimeout(r, 0));

  App.init = async function (opts) {
    opts = opts || {};
    const host = document.getElementById('gl');
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !!opts.preserve });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.pixelRatio || 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    App.renderer = renderer;

    const scene = new THREE.Scene();
    App.scene = scene;
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.15, 12000);
    App.camera = camera;

    setLoad('Loading crest…', 0.05); await new Promise((r) => LSC.Tex.preload(r));
    App.sky = new LSC.Sky(scene);
    App.colliders = new LSC.Geo.Colliders(8);
    setLoad('Building the main block…', 0.2); await tick();
    LSC.Campus.build(scene, App.colliders);
    setLoad('Laying out Kowloon Tong…', 0.55); await tick();
    LSC.Context.build(scene, App.colliders);
    setLoad('Lighting…', 0.9); await tick();

    App.controls = new LSC.Controls(camera, renderer.domElement, App.colliders);
    App.controls.setPose(new THREE.Vector3(-10, 30, 150), 340, -12);
    App.controls.update(0);
    if (LSC.Flyover) App.flyover = new LSC.Flyover(App);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    App.ready = true;
    setLoad('Ready', 1);
    if (!opts.noLoop) App.loop();
    return App;
  };

  App.setQuality = function (q) {
    App.quality = q;
    if (!App.renderer) return;
    App.renderer.shadowMap.enabled = q !== 'low';
    App.sky.sun.castShadow = q !== 'low';
    const s = q === 'high' ? 4096 : 2048;
    if (App.sky.sun.shadow.map) { App.sky.sun.shadow.map.dispose(); App.sky.sun.shadow.map = null; }
    App.sky.sun.shadow.mapSize.set(s, s);
    App.renderer.setPixelRatio(q === 'high' ? Math.min(window.devicePixelRatio, 2) : 1);
    App.scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  };

  App.setMode = function (m) {
    App.mode = m;
    if (m === 'fly' || m === 'walk') {
      App.controls.enabled = true;
      const p = App.controls.pos;
      if (m === 'walk' && App.controls.mode !== 'walk') {
        // drop to the ground where we are (or at the track if airborne over a roof)
        if (p.y - LSC.Terrain.ground(p.x, p.z) > 3) p.set(-20, 1.7, 14);
        App.controls.pitch = 0;
      }
      App.controls.setMode(m);
    } else App.controls.enabled = false;
    if (LSC.UI) LSC.UI.onMode(m);
  };

  App.render = function () {
    App.sky.update(App.camera.position);
    App.renderer.render(App.scene, App.camera);
  };

  App.loop = function () {
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (App.mode === 'flyover' && App.flyover) App.flyover.update(dt);
      else if (App.mode === 'fly' || App.mode === 'walk') App.controls.update(dt);
      else if (App.mode === 'idle') { // landing backdrop: slow orbit
        const t = now / 1000 * 0.03;
        const p = new THREE.Vector3(-10 + Math.sin(t) * 210, 85, 10 + Math.cos(t) * 210);
        App.camera.position.copy(p);
        App.camera.lookAt(-15, 10, 5);
      }
      if (LSC.UI) LSC.UI.frame(dt);
      App.render();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  LSC.App = App;
})();
