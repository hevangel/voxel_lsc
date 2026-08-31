/* =========================================================================
 * textures.js — procedural CanvasTextures used on building planes:
 * crest (crest tower + plaques), bronze gate lettering, field-wall
 * lettering, and the sports-ground scoreboard.
 * ========================================================================= */
'use strict';

(function () {
  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return [c, c.getContext('2d')];
  }

  function tex(canvas, rx, ry) {
    const t = new THREE.CanvasTexture(canvas);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    if (rx !== undefined && ry !== undefined) t.repeat.set(rx, ry);
    return t;
  }

  /* The La Salle College crest: quarterly shield (purple book / red torch),
     gold star with rays, laurel wreath, "FIDES ET OPERA" banner. */
  function drawCrest(ctx, cx, cy, s) {
    // star with rays (Signum Fidei)
    ctx.save();
    ctx.translate(cx, cy - s * 0.52);
    ctx.fillStyle = '#f5d06a';
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.06);
      ctx.lineTo(s * 0.34, -s * 0.02);
      ctx.lineTo(0, s * 0.06);
      ctx.closePath();
      ctx.fill();
    }
    // 8-point star
    ctx.fillStyle = '#e9b23b';
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const r = i % 2 === 0 ? s * 0.17 : s * 0.075;
      const a = (i * Math.PI) / 8 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b03028'; ctx.lineWidth = s * 0.02; ctx.stroke();
    ctx.restore();

    // laurel wreath
    ctx.strokeStyle = '#3e7c3a';
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.02, s * 0.46, Math.PI * 0.25, Math.PI * 0.75, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.02, s * 0.46, Math.PI * 1.25, Math.PI * 1.75, false);
    ctx.stroke();
    ctx.fillStyle = '#3e7c3a';
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * (0.3 + i * 0.08);
      for (const sgn of [1, -1]) {
        ctx.save();
        ctx.translate(cx + Math.cos(a) * s * 0.46 * sgn, cy - s * 0.02 + Math.sin(a) * s * 0.4);
        ctx.rotate(sgn * -a + Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.05, s * 0.025, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // shield: quarterly purple/red with star, book and torch
    const top = cy - s * 0.30, bot = cy + s * 0.30, hw = s * 0.30, hh = s * 0.30;
    function shieldPath() {
      ctx.beginPath();
      ctx.moveTo(cx - hw, top);
      ctx.lineTo(cx + hw, top);
      ctx.lineTo(cx + hw, bot - hh * 0.5);
      ctx.quadraticCurveTo(cx + hw * 0.7, bot + hh * 0.15, cx, bot + hh * 0.35);
      ctx.quadraticCurveTo(cx - hw * 0.7, bot + hh * 0.15, cx - hw, bot - hh * 0.5);
      ctx.closePath();
    }
    shieldPath();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#5b2d82'; ctx.fillRect(cx - hw, top, hw, hh * 1.4);
    ctx.fillStyle = '#b03028'; ctx.fillRect(cx, top, hw, hh * 1.4);
    ctx.fillStyle = '#b03028'; ctx.fillRect(cx - hw, top + hh * 0.7, hw, hh);
    ctx.fillStyle = '#5b2d82'; ctx.fillRect(cx, top + hh * 0.7, hw, hh);
    // gold star
    ctx.fillStyle = '#e9b23b';
    ctx.save(); ctx.translate(cx, top + hh * 0.7);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? s * 0.09 : s * 0.04;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
    // open book (white) on top-left purple
    ctx.fillStyle = '#fdfcf8';
    ctx.save(); ctx.translate(cx - hw * 0.5, top + hh * 0.42);
    ctx.beginPath();
    ctx.moveTo(-s * 0.11, -s * 0.05); ctx.quadraticCurveTo(0, -s * 0.10, 0, -s * 0.02);
    ctx.quadraticCurveTo(0, -s * 0.10, s * 0.11, -s * 0.05);
    ctx.lineTo(s * 0.11, s * 0.05); ctx.quadraticCurveTo(0, s * 0.0, -s * 0.11, s * 0.05);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5b2d82'; ctx.lineWidth = s * 0.012;
    ctx.beginPath(); ctx.moveTo(0, -s * 0.02); ctx.lineTo(0, s * 0.045); ctx.stroke();
    ctx.restore();
    // torch (gold) bottom-right
    ctx.strokeStyle = '#e9b23b'; ctx.lineWidth = s * 0.035;
    ctx.beginPath();
    ctx.moveTo(cx + hw * 0.5, top + hh * 1.05); ctx.lineTo(cx + hw * 0.5, top + hh * 1.28);
    ctx.stroke();
    ctx.fillStyle = '#e9b23b';
    ctx.beginPath();
    ctx.moveTo(cx + hw * 0.5, top + hh * 0.92);
    ctx.quadraticCurveTo(cx + hw * 0.28, top + hh * 1.02, cx + hw * 0.5, top + hh * 1.10);
    ctx.quadraticCurveTo(cx + hw * 0.72, top + hh * 1.02, cx + hw * 0.5, top + hh * 0.92);
    ctx.fill();
    ctx.restore(); // clip
    shieldPath();
    ctx.strokeStyle = '#e9b23b'; ctx.lineWidth = s * 0.028; ctx.stroke();

    // banner "FIDES ET OPERA"
    ctx.fillStyle = '#b03028';
    const bw = s * 0.78, bh = s * 0.16, by = bot + hh * 0.28;
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2, by);
    ctx.lineTo(cx + bw / 2, by);
    ctx.lineTo(cx + bw / 2 + s * 0.05, by + bh / 2);
    ctx.lineTo(cx + bw / 2, by + bh);
    ctx.lineTo(cx - bw / 2, by + bh);
    ctx.lineTo(cx - bw / 2 - s * 0.05, by + bh / 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e9b23b'; ctx.lineWidth = s * 0.014; ctx.stroke();
    ctx.fillStyle = '#fdfcf8';
    ctx.font = `700 ${Math.max(8, s * 0.105)}px Georgia, serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('FIDES  ET  OPERA', cx, by + bh / 2 + s * 0.005);
  }

  /* Crest alone on transparent background — for the white crest tower face
     and the wall plaque. */
  function crestTexture() {
    const [c, ctx] = makeCanvas(512, 640);
    ctx.clearRect(0, 0, 512, 640);
    drawCrest(ctx, 256, 300, 430);
    return tex(c);
  }

  /* Bronze lettering on transparent background, overlaid on the granite
     gate wall: 喇沙書院 / LA SALLE COLLEGE / 18 La Salle Road. */
  function gateNameTexture() {
    const [c, ctx] = makeCanvas(1024, 512);
    ctx.clearRect(0, 0, 1024, 512);
    ctx.fillStyle = '#4f4530';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 96px "Microsoft YaHei", "PingFang HK", "Noto Sans TC", sans-serif';
    ctx.fillText('喇 沙 書 院', 512, 120);
    ctx.fillStyle = '#5c5138';
    ctx.font = '700 74px Georgia, serif';
    ctx.fillText('LA SALLE COLLEGE', 512, 260);
    ctx.font = '400 44px Georgia, serif';
    ctx.fillText('18 La Salle Road', 512, 350);
    return tex(c);
  }

  /* "La Salle College" lettering + crest plaque for the boundary wall the
     track faces — dark serif capitals on transparent. */
  function fieldWallTexture() {
    const [c, ctx] = makeCanvas(1024, 256);
    ctx.clearRect(0, 0, 1024, 256);
    ctx.fillStyle = '#2e2f2c';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 108px Georgia, "Times New Roman", serif';
    ctx.fillText('La Salle College', 560, 140);
    // small crest plaque to the left of the text
    ctx.save();
    ctx.translate(120, 118);
    ctx.scale(0.42, 0.42);
    ctx.translate(-256, -300);
    drawCrest(ctx, 256, 300, 430);
    ctx.restore();
    return tex(c);
  }

  function scoreboardTexture() {
    const [c, ctx] = makeCanvas(512, 256);
    const t = tex(c);
    const draw = (home, away, clock) => {
      ctx.fillStyle = '#101815';
      ctx.fillRect(0, 0, 512, 256);
      ctx.strokeStyle = '#2c3a34'; ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, 500, 244);
      ctx.fillStyle = '#39d353';
      ctx.font = '700 64px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${home} - ${away}`, 256, 108);
      ctx.font = '700 72px "Courier New", monospace';
      ctx.fillText(clock, 256, 200);
      ctx.fillStyle = '#7a5c3e';
      ctx.font = '700 30px Georgia, serif';
      ctx.fillText('LA SALLE COLLEGE SPORTS GROUND', 256, 36);
      t.needsUpdate = true;
    };
    draw('LSC', 'OPP', '00:00');
    return { texture: t, draw };
  }

  LSC.Textures = { crestTexture, gateNameTexture, fieldWallTexture, scoreboardTexture, tex, drawCrest };
})();
