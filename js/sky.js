/* =========================================================================
 * sky.js — daytime sky dome (gradient + sun + soft fbm cumulus), sun and
 * hemisphere lights, distance haze. Both reference videos are clear-day
 * footage, so there is a single sunny-day preset with an adjustable sun.
 * ========================================================================= */
'use strict';
window.LSC = window.LSC || {};

(function () {
  const vert = `
    varying vec3 vDir;
    void main() {
      vDir = normalize((modelMatrix * vec4(position, 1.0)).xyz - cameraPosition);
      vec4 p = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      gl_Position = p.xyww;
    }`;
  const frag = `
    varying vec3 vDir;
    uniform vec3 sunDir;
    uniform vec3 top;
    uniform vec3 horizon;
    uniform float clouds;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
    void main() {
      vec3 d = normalize(vDir);
      float h = max(d.y, 0.0);
      vec3 col = mix(horizon, top, pow(h, 0.5));
      float s = max(dot(d, sunDir), 0.0);
      col += vec3(1.0, 0.95, 0.85) * (pow(s, 600.0) * 2.0 + pow(s, 12.0) * 0.18);
      if (d.y > 0.0 && clouds > 0.0) {
        vec2 uv = d.xz / (d.y + 0.12) * 1.6;
        float c = fbm(uv + vec2(3.1, 1.7));
        c = smoothstep(0.52, 0.78, c) * clouds * smoothstep(0.0, 0.18, d.y);
        vec3 cc = mix(vec3(0.82, 0.85, 0.9), vec3(1.0), smoothstep(0.55, 0.85, fbm(uv * 1.7 + 4.0)));
        col = mix(col, cc, c);
      }
      if (d.y < 0.0) col = horizon * 0.92;
      gl_FragColor = vec4(col, 1.0);
      #include <encodings_fragment>
    }`;

  class Sky {
    constructor(scene) {
      this.scene = scene;
      this.uniforms = {
        sunDir: { value: new THREE.Vector3() },
        top: { value: new THREE.Color(0x2f6fd0) },
        horizon: { value: new THREE.Color(0xd6e3ec) },
        clouds: { value: 0.75 },
      };
      const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: this.uniforms, side: THREE.BackSide, depthWrite: false });
      this.dome = new THREE.Mesh(new THREE.SphereGeometry(10000, 32, 16), mat);
      this.dome.frustumCulled = false;
      this.dome.renderOrder = -1;
      scene.add(this.dome);

      this.hemi = new THREE.HemisphereLight(0xcfe0f2, 0x7a7564, 0.75);
      scene.add(this.hemi);
      this.sun = new THREE.DirectionalLight(0xfff4e2, 1.25);
      this.sun.castShadow = true;
      const sc = this.sun.shadow.camera;
      sc.left = -190; sc.right = 190; sc.top = 190; sc.bottom = -190; sc.near = 10; sc.far = 900;
      this.sun.shadow.mapSize.set(4096, 4096);
      this.sun.shadow.bias = -0.0004;
      this.sun.shadow.normalBias = 0.4;
      scene.add(this.sun);
      scene.add(this.sun.target);
      scene.fog = new THREE.Fog(0xd3e0ea, 1200, 13000);
      this.setSun(215, 58);
    }
    /* azimuth: compass degrees the sun is IN (180 = due south), elevation deg */
    setSun(az, el) {
      const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
      const d = new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e));
      this.uniforms.sunDir.value.copy(d);
      this.sunDirection = d;
      this.place(new THREE.Vector3(-10, 0, 10));
    }
    setHaze(color, near, far) {
      this.scene.fog.color.set(color);
      this.scene.fog.near = near; this.scene.fog.far = far;
      this.uniforms.horizon.value.set(color);
    }
    place(center) {
      this.sun.target.position.copy(center);
      this.sun.position.copy(center).addScaledVector(this.sunDirection, 450);
    }
    update(camPos) { this.dome.position.copy(camPos); }
  }

  LSC.Sky = Sky;
})();
