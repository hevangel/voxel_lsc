/* =========================================================================
 * ui.js — landing menu, HUD, minimap, POI labels/toasts, time controls,
 * help + photo modes, EN/繁體中文 language toggle. Talks to the app
 * through LSC.App hooks.
 * ========================================================================= */
'use strict';

(function () {
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };

  /* ---------------- i18n (English default, 繁體中文 toggle) ---------------- */
  const I18N = {
    en: {
      brandSub: '喇沙書院 · Voxel Campus',
      modeWalk: 'ON FOOT', modeFly: 'FLY MODE', modeTour: 'GUIDED TOUR',
      btnTour: 'Tour', btnFly: 'Fly', btnWalk: 'Walk', btnMap: 'Map', btnPhoto: 'Photo', btnHelp: 'Help',
      hintMove: 'move', hintSprint: 'sprint', hintJump: 'jump / up', hintDown: 'down (fly)',
      hintFly: 'fly', hintTour: 'tour', hintPhoto: 'photo', hintMap: 'map',
      hintMove2: 'move', hintSprint2: 'sprint', hintJump2: 'jump/up', hintFly2: 'fly', hintTour2: 'tour', hintPhoto2: 'photo',
      mapNote: 'M for full map', timeFlows: 'time flows', takeOver: '✕ Take over',
      mapTitle: 'Campus Map', mapHint: 'Click anywhere on the map to beam there (fly mode).',
      helpTitle: 'Help',
      helpWalk: 'walk (click view to lock mouse)', helpShift: 'sprint / fly fast',
      helpSpace: 'jump · fly up', helpC: 'fly down', helpF: 'switch walk ⇄ fly',
      helpT: 'guided tour (any move key exits)', helpM: 'campus map (click to teleport)',
      helpP: 'photo mode (hide UI)', helpEsc: 'release mouse / close panels',
      helpAbout: 'A fan-made voxel tribute to La Salle College, 18 La Salle Road, Kowloon Tong — founded 1932 by the De La Salle Brothers.',
      helpAffil: 'Not affiliated with the school.',
      loadingSub: 'Voxels being laid, one by one…',
      tagline: 'A voxel world of the campus on La Salle Road, Kowloon Tong — roam the field, the pool, the courtyard and the shadow of Lion Rock. <em>Fides et Opera · 1932.</em>',
      enterWalk: '🚶 Enter on Foot', enterFly: '🛸 Fly Mode', enterTour: '🎬 Guided Tour',
      graphics: 'Graphics', langTo: '中文', tipFly: 'Tip: fly mode is the fastest way to see the whole campus.',
      credit: 'Fan-made tribute · not affiliated with La Salle College · built with Three.js · references in /reference',
      toastTour: 'Guided tour — press any move key or ✕ to take over',
      toastTourOn: 'Guided tour — sit back & enjoy',
      toastWelcome: 'Welcome to La Salle College · 喇沙書院',
      toastPointer: 'Click the view to grab the mouse · press F to fly',
      toastPhotoOn: 'Photo mode — press P to bring the UI back',
      toastPhotoOff: 'UI restored',
      toastBeam: 'Beamed to',
      preparing: 'Preparing…',
    },
    zh: {
      brandSub: '喇沙書院 · 體素校園',
      modeWalk: '步行', modeFly: '飛行', modeTour: '導覽',
      btnTour: '導覽', btnFly: '飛行', btnWalk: '步行', btnMap: '地圖', btnPhoto: '拍照', btnHelp: '說明',
      hintMove: '移動', hintSprint: '加速', hintJump: '跳躍／上升', hintDown: '下降（飛行）',
      hintFly: '飛行', hintTour: '導覽', hintPhoto: '拍照', hintMap: '地圖',
      hintMove2: '移動', hintSprint2: '加速', hintJump2: '跳躍／上升', hintFly2: '飛行', hintTour2: '導覽', hintPhoto2: '拍照',
      mapNote: '按 M 開啟全圖', timeFlows: '時間流逝', takeOver: '✕ 接管',
      mapTitle: '校園地圖', mapHint: '點擊地圖任意位置即可傳送（飛行模式）。',
      helpTitle: '說明',
      helpWalk: '步行（點擊畫面鎖定滑鼠）', helpShift: '加速／快速飛行',
      helpSpace: '跳躍 · 上升', helpC: '下降', helpF: '切換步行 ⇄ 飛行',
      helpT: '自動導覽（按任何移動鍵退出）', helpM: '校園地圖（點擊傳送）',
      helpP: '拍照模式（隱藏介面）', helpEsc: '釋放滑鼠／關閉面板',
      helpAbout: '本站為喇沙書院（九龍仔喇沙利道18號，1932年聖喇沙修士會創校）的體素風非官方致敬作品。',
      helpAffil: '與學校無隸屬關係。',
      loadingSub: '體素一磚一瓦搭建中……',
      tagline: '以體素重塑喇沙利道校園——在操場、泳池、庭院與獅子山的影子之間自由漫遊。<em>Fides et Opera · 1932。</em>',
      enterWalk: '🚶 步行入校', enterFly: '🛸 飛行模式', enterTour: '🎬 自動導覽',
      graphics: '畫質', langTo: 'English', tipFly: '小提示：飛行模式最快睇勻整個校園。',
      credit: '非官方粉絲致敬作品 · 與喇沙書院無隸屬關係 · 以 Three.js 建構 · 參考資料見 /reference',
      toastTour: '自動導覽中——按任何移動鍵或 ✕ 接管',
      toastTourOn: '自動導覽——請欣賞校園景色',
      toastWelcome: '歡迎蒞臨喇沙書院 · La Salle College',
      toastPointer: '點擊畫面鎖定滑鼠 · 按 F 切換飛行',
      toastPhotoOn: '拍照模式——按 P 恢復介面',
      toastPhotoOff: '介面已恢復',
      toastBeam: '已傳送至',
      preparing: '準備中……',
    },
  };

  class UI {
    constructor(app) {
      this.app = app;
      this.lang = localStorage.getItem('lscLang') === 'zh' ? 'zh' : 'en';
      this.poiEls = [];
      this.pois = [];
      this.lastPoi = null;
      this.photoMode = false;
      this.applyLang();
      this.bindButtons();
      this.buildMinimap();
    }

    t(key) { return (I18N[this.lang] && I18N[this.lang][key]) || I18N.en[key] || key; }

    applyLang() {
      document.documentElement.lang = this.lang === 'zh' ? 'zh-Hant' : 'en';
      for (const n of document.querySelectorAll('[data-i18n]')) {
        const k = n.getAttribute('data-i18n');
        const v = this.t(k);
        if (n.tagName === 'EM' || n.innerHTML.includes('<em>')) n.innerHTML = v; // tagline keeps <em>
        else n.textContent = v;
      }
      const lbl = $('#langLabel') || el('span');
      lbl.textContent = this.lang === 'en' ? '繁' : 'EN';
    }

    setLang(l) {
      this.lang = l;
      localStorage.setItem('lscLang', l);
      this.applyLang();
      this.renderPoiLabels();
      this.setModeUI(this.app.player ? this.app.player.mode : 'walk');
    }

    /* ---------- boot / landing ---------- */
    setProgress(pct, label) {
      $('#loadBar').style.width = `${Math.round(pct * 100)}%`;
      $('#loadLabel').textContent = label || this.t('preparing');
    }

    showLanding() {
      $('#loading').classList.add('hidden');
      $('#landing').classList.remove('hidden');
    }

    hideMenus() {
      $('#landing').classList.add('hidden');
      $('#loading').classList.add('hidden');
      $('#hud').classList.remove('hidden');
    }

    enterMode(mode) {
      this.app.setQuality($('#qualitySel').value);
      this.hideMenus();
      this.app.enter(mode);
      this.toast(mode === 'tour' ? this.t('toastTourOn') : this.t('toastWelcome'), 3200);
    }

    /* ---------- HUD ---------- */
    bindButtons() {
      $('#btnLang').onclick = () => this.setLang(this.lang === 'en' ? 'zh' : 'en');
      const ll = $('#btnLangLanding');
      if (ll) ll.onclick = () => this.setLang(this.lang === 'en' ? 'zh' : 'en');
      $('#btnTour').onclick = () => { this.app.toggleTour(); };
      $('#btnWalkFly').onclick = () => {
        const m = this.app.player.mode;
        this.app.setMode(m === 'fly' ? 'walk' : 'fly');
      };
      $('#btnMap').onclick = () => this.togglePanel('mapPanel');
      $('#btnHelp').onclick = () => this.togglePanel('helpPanel', true);
      $('#btnPhoto').onclick = () => this.togglePhoto();
      $('#btnFull').onclick = () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
      };
      $('#timeSlider').oninput = (e) => {
        this.app.sky.auto = false;
        $('#autoTime').checked = false;
        this.app.sky.time = parseFloat(e.target.value);
      };
      $('#autoTime').onchange = (e) => { this.app.sky.auto = e.target.checked; };
      $('#tourExit').onclick = () => this.app.setMode(this._lastFreeMode || 'walk');
      document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyM') this.togglePanel('mapPanel');
        if (e.code === 'KeyH') this.togglePanel('helpPanel', true);
        if (e.code === 'KeyP') this.togglePhoto();
        if (e.code === 'KeyT') this.app.toggleTour();
        if (e.code === 'KeyF') this.app.setMode(this.app.player.mode === 'fly' ? 'walk' : 'fly');
        if (e.code === 'Escape') {
          this.closePanels();
        }
      });
    }

    togglePanel(id, exclusive) {
      const p = $('#' + id);
      const open = !p.classList.contains('hidden');
      if (exclusive) { this.closePanels(); }
      else if (open) { p.classList.add('hidden'); return; }
      else this.closePanels();
      if (!open) p.classList.remove('hidden');
      if (id === 'mapPanel' && !open) this.renderBigMap();
    }

    closePanels() {
      for (const id of ['mapPanel', 'helpPanel']) $('#' + id).classList.add('hidden');
    }

    togglePhoto() {
      this.photoMode = !this.photoMode;
      document.body.classList.toggle('photo', this.photoMode);
      this.toast(this.photoMode ? this.t('toastPhotoOn') : this.t('toastPhotoOff'), 2200);
    }

    /* ---------- minimap ---------- */
    buildMinimap() {
      const W = LSC.Voxel.W, D = LSC.Voxel.D;
      this.mapCanvas = document.createElement('canvas');
      this.mapCanvas.width = W; this.mapCanvas.height = D;
      this.mapCtx = this.mapCanvas.getContext('2d');
    }

    paintMinimapBase(mapColors) {
      const W = LSC.Voxel.W, D = LSC.Voxel.D, P = LSC.Palette;
      const img = this.mapCtx.createImageData(W, D);
      for (let i = 0; i < W * D; i++) {
        const m = mapColors[i];
        const o = i * 4;
        if (m === 0) { img.data[o + 3] = 0; continue; }
        img.data[o] = P.colors[m * 3];
        img.data[o + 1] = P.colors[m * 3 + 1];
        img.data[o + 2] = P.colors[m * 3 + 2];
        img.data[o + 3] = 255;
      }
      this.mapCtx.putImageData(img, 0, 0);
      this.mapBase = document.createElement('canvas');
      this.mapBase.width = W; this.mapBase.height = D;
      this.mapBase.getContext('2d').drawImage(this.mapCanvas, 0, 0);
    }

    drawMinimap() {
      const cvs = $('#minimap');
      const ctx = cvs.getContext('2d');
      const size = cvs.width;
      const view = 130; // grid units visible (~65 m)
      const p = this.app.player.pos;
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2); ctx.clip();
      const sx = p.x - view / 2, sy = p.z - view / 2;
      ctx.drawImage(this.mapBase, sx, sy, view, view, 0, 0, size, size);
      // POI dots
      ctx.fillStyle = 'rgba(233,178,59,.9)';
      for (const poi of this.pois) {
        const x = (poi.x - p.x + view / 2) * (size / view);
        const y = (poi.z - p.z + view / 2) * (size / view);
        if (x < 0 || y < 0 || x > size || y > size) continue;
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
      // player arrow
      const cx = size / 2, cy = size / 2;
      ctx.translate(cx, cy);
      ctx.rotate(-this.app.player.yaw + Math.PI);
      ctx.fillStyle = '#ff5757';
      ctx.beginPath();
      ctx.moveTo(0, -7); ctx.lineTo(5, 6); ctx.lineTo(0, 3); ctx.lineTo(-5, 6);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    renderBigMap() {
      const cvs = $('#bigmap');
      cvs.width = 560; cvs.height = 560;
      const ctx = cvs.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.mapBase, 0, 0, 560, 560);
      ctx.fillStyle = '#ff5757';
      const p = this.app.player.pos;
      ctx.beginPath(); ctx.arc(p.x / LSC.Voxel.W * 560, p.z / LSC.Voxel.D * 560, 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = '13px system-ui';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'rgba(0,0,0,.7)';
      ctx.lineWidth = 3;
      for (const poi of this.pois) {
        const x = poi.x / LSC.Voxel.W * 560, y = poi.z / LSC.Voxel.D * 560;
        ctx.strokeText(poi.icon, x - 8, y + 5);
        ctx.fillText(poi.icon, x - 8, y + 5);
      }
      cvs.onclick = (e) => {
        const r = cvs.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
        const wx = mx * LSC.Voxel.W, wz = my * LSC.Voxel.D;
        const y = this.app.world.world.surfaceY(Math.round(wx), Math.round(wz));
        this.app.player.setMode('fly');
        this.app.player.teleport(wx, y + 4, wz);
        this.closePanels();
        this.toast(`${this.t('toastBeam')} ${Math.round(wx)}, ${Math.round(wz)}`, 1600);
      };
    }

    /* ---------- POI labels ---------- */
    attachPois(pois) {
      this.pois = pois.map((p) => Object.assign({}, p));
      this.renderPoiLabels();
    }

    renderPoiLabels() {
      const layer = $('#poiLayer');
      layer.innerHTML = '';
      this.poiEls = this.pois.map((poi) => {
        const name = this.lang === 'zh' ? `${poi.zh} · ${poi.name}` : poi.name;
        const d = el('div', 'poi-label', `<span class="poi-icon">${poi.icon}</span><span>${name}</span>`);
        layer.appendChild(d);
        return { poi, d };
      });
      this.lastPoi = null;
    }

    updatePoiLabels(camera) {
      const v = new THREE.Vector3();
      let nearest = null, nearestD = 1e9;
      for (const { poi, d } of this.poiEls) {
        v.set(poi.x + 0.5, poi.y + 10, poi.z + 0.5);
        const range = poi.r * 2.2;
        const dist = v.distanceTo(camera.position);
        if (dist < range && dist < nearestD) { nearest = poi; nearestD = dist; }
        if (dist < range) {
          v.project(camera);
          if (v.z < 1) {
            const sx = (v.x * 0.5 + 0.5) * innerWidth;
            const sy = (-v.y * 0.5 + 0.5) * innerHeight;
            d.style.transform = `translate(-50%,-100%) translate(${sx}px,${sy}px)`;
            d.style.opacity = Math.max(0.25, 1 - dist / range);
            d.style.display = 'block';
            continue;
          }
        }
        d.style.display = 'none';
      }
      if (nearest !== this.lastPoi) {
        if (nearest) this.toast(`${nearest.icon} ${this.lang === 'zh' ? nearest.zh : nearest.name}`, 2400);
        this.lastPoi = nearest;
      }
    }

    toast(msg, ms) {
      const t = $('#toast');
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(this._tt);
      this._tt = setTimeout(() => t.classList.remove('show'), ms || 2600);
    }

    setClock(h, m) {
      $('#hudClock').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const icon = (h >= 6 && h < 18) ? '☀️' : (h >= 18 && h < 20) ? '🌇' : '🌙';
      $('#hudDayIcon').textContent = icon;
      if (document.activeElement !== $('#timeSlider')) $('#timeSlider').value = h + m / 60;
    }

    setModeUI(mode) {
      if (mode !== 'tour') this._lastFreeMode = mode;
      $('#walkFlyLabel').textContent = mode === 'fly' ? this.t('btnWalk') : this.t('btnFly');
      $('#modeBadge').textContent = mode === 'tour' ? this.t('modeTour') : mode === 'fly' ? this.t('modeFly') : this.t('modeWalk');
      $('#tourExit').classList.toggle('hidden', mode !== 'tour');
      $('#crosshair').style.display = mode === 'tour' ? 'none' : 'block';
      document.body.classList.toggle('touring', mode === 'tour');
    }

    setTourProgress(t) {
      $('#tourBar').style.width = `${(t * 100).toFixed(1)}%`;
    }
  }

  LSC.UI = UI;
})();
