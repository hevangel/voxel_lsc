/* =========================================================================
 * autoalign.js — AUTOMATIC camera-pose aligner for the flyover paths.
 *
 * Fits a model render to a real reference-video frame by IMAGE SIMILARITY, so
 * flyover keys stop depending on eyeballing or hand-read landmark pixels (an
 * LLM cannot read landmark pixels reliably; this scores whole-frame agreement
 * instead).
 *
 * How it works
 *   1. Extract the real frame (ffmpeg) and classify every pixel into a small
 *      set of SEMANTIC CLASSES by colour: sky, red (track/courts), green
 *      (turf/grass/trees), cyan (pool), white/cream (building), dark
 *      (roof/shadow), grey (paving/road/estate). Uncertain pixels and the
 *      burnt-in subtitle band of video A are marked 'ignore' and never scored.
 *   2. Render the model as a flat class map at the SAME low resolution via a
 *      dedicated class pass (tools/autoalign.html: every mesh material replaced
 *      by a flat class colour, sky dome hidden, pitch/pool overlaid). Many
 *      candidate poses are rendered per page.evaluate for speed.
 *   3. Score = weighted class agreement (per-pixel match, class-balanced so the
 *      sky/turf do not dominate) + a small Sobel edge-agreement term.
 *   4. Optimise x,y,z,yaw,pitch,roll(,vfov) with Nelder-Mead, bounded around
 *      the current path key, coarse-to-fine in resolution, rejecting poses that
 *      fall inside solid geometry (collider AABBs).
 *
 * CLI
 *   node tools/autoalign.js --path B --times 57,60,63 --out solved.json
 *   node tools/autoalign.js --path A --range 90:95:5 --out solved.json
 *   node tools/autoalign.js --path B --times 57 --init path --out s.json   (seed = current key; default)
 *   node tools/autoalign.js --path B --times 57 --init '{"x":-14,...}' --out s.json
 *   node tools/autoalign.js --path B --times 57 --out s.json --apply [--apply-target <file>]
 *     --apply rewrites the matching keys in js/path_X.js. SAFETY: without
 *     --apply-target it refuses to touch the real repo file unless
 *     --force-real is also given. Pass --apply-target <copy> to write a copy.
 *
 * Also writes a verification sheet [real | render | class-overlay] per time to
 * <scratch>/autoalign_sheets/<path>_<out>.jpg (or --sheet <file>).
 *
 * Needs ffmpeg on PATH and the Playwright bundled with @playwright/cli
 * (PLAYWRIGHT_CORE overrides its location) — same as tools/calib.js.
 * ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PW = process.env.PLAYWRIGHT_CORE || path.join(process.env.APPDATA || '', 'npm', 'node_modules', '@playwright', 'cli', 'node_modules', 'playwright-core');
const { chromium } = require(PW);

const VIDEOS = { A: 'reference/video/lsc_aerial_ERq74Xv4GY0.mp4', B: 'reference/video/lsc_drone_flyover_d8X8myGUXjo.mp4' };
const SCRATCH = process.env.KIROCREW_SCRATCH || process.env.TEMP || ROOT;

// ---- class ids (MUST match AA_CLASSES id in autoalign.html) ---------------
const CLS = { ignore: 0, sky: 1, red: 2, green: 3, cyan: 4, white: 5, dark: 6, grey: 7 };
const CLS_NAMES = Object.keys(CLS);

// ---- args -----------------------------------------------------------------
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    const k = a.slice(2);
    const v = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true;
    args[k] = v;
  }
}

function die(msg) { console.error('autoalign: ' + msg); process.exit(2); }

// ---- frame extraction + real-frame classification -------------------------
const frameCache = path.join(SCRATCH, 'autoalign_frames');
fs.mkdirSync(frameCache, { recursive: true });

// Extract a frame at time t, scaled to WxH (16:9), as raw RGB bytes.
function extractFrameRGB(pathKey, t, w, h) {
  const png = path.join(frameCache, `${pathKey}_${t.toFixed(2)}_${w}x${h}.png`);
  if (!fs.existsSync(png)) {
    cp.execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(t),
      '-i', path.join(ROOT, VIDEOS[pathKey]), '-frames:v', '1',
      '-vf', `scale=${w}:${h}`, png]);
  }
  // decode PNG to raw rgb via ffmpeg (rawvideo rgb24 to stdout)
  const raw = cp.execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error',
    '-i', png, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { maxBuffer: 1 << 28 });
  return { rgb: raw, w, h, png };
}

// Classify one RGB pixel into a semantic class id. Thresholds tuned on real
// frames from both videos (B t=57/60/63 pitch+track+facade, A t=90/95 facade,
// A t=192 top-down). HSV-ish reasoning in 0..255 space.
function classifyReal(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const sat = mx === 0 ? 0 : (mx - mn) / mx;      // 0..1
  const v = mx / 255;                              // 0..1

  // SKY: bright, blue dominant, low-ish saturation to mid; b clearly > r.
  if (b > 110 && b >= g && b - r > 18 && v > 0.5 && g > 90) return CLS.sky;
  // very pale washed-out sky near the sun/horizon: very bright, near-neutral,
  // slight blue — but this collides with white building; require b>=r and high v
  if (v > 0.85 && sat < 0.08 && b >= r && b >= g && (b - r) >= 0) {
    // ambiguous bright neutral: lean sky only if truly bluish, else white below
  }

  // CYAN pool: strong green+blue, red low.
  if (b > 110 && g > 110 && r < g - 20 && r < b - 20 && (g + b) / 2 - r > 35) return CLS.cyan;

  // RED track / courts: red clearly dominant, warm.
  if (r > 90 && r - g > 28 && r - b > 30 && g >= b - 25) return CLS.red;

  // GREEN turf/grass/trees: green dominant.
  if (g > 55 && g - r > 10 && g - b > 8) return CLS.green;
  // darker olive turf (shadowed pitch): green biggest but dim
  if (g >= r && g >= b && g - b > 6 && r - g < 6 && v < 0.5 && sat > 0.12) return CLS.green;

  // Now neutral-ish (low saturation) surfaces split by brightness:
  if (sat < 0.22) {
    if (v > 0.72) return CLS.white;   // white/cream building, bright paving
    if (v < 0.30) return CLS.dark;    // dark roofs / shadow / window bands
    return CLS.grey;                  // mid concrete / paving / estate walls
  }
  // warm cream (building) with a little saturation
  if (r >= g && g >= b && v > 0.6 && r - b < 60) return CLS.white;
  // leftover warm mid tones -> grey
  if (v > 0.35) return CLS.grey;
  return CLS.dark;
}

// Build the real-frame class grid, with 'ignore' for the subtitle band on A.
function classifyRealFrame(frame, pathKey) {
  const { rgb, w, h } = frame;
  const grid = new Uint8Array(w * h);
  for (let i = 0; i < grid.length; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    grid[i] = classifyReal(r, g, b);
  }
  // Subtitle mask: video A burns cream/gold karaoke lyrics across the lower
  // third, horizontally centred. Mark that band 'ignore' so it never scores.
  if (pathKey === 'A') {
    const y0 = Math.floor(h * 0.72), y1 = h;              // bottom ~28%
    const x0 = Math.floor(w * 0.08), x1 = Math.ceil(w * 0.92);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) grid[y * w + x] = CLS.ignore;
  }
  return grid;
}

function b64ToGrid(b64) {
  const buf = Buffer.from(b64, 'base64');
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
}

// ---- class-boundary edge map (edge where a 4-neighbour is a different class)-
function edgeMap(grid, w, h) {
  const e = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, c = grid[i];
    if (c === CLS.ignore) continue;
    const up = grid[i - w], dn = grid[i + w], lf = grid[i - 1], rt = grid[i + 1];
    if ((up && up !== c) || (dn && dn !== c) || (lf && lf !== c) || (rt && rt !== c)) e[i] = 1;
  }
  return e;
}

// Two-pass (chamfer 3-4) distance transform: for every cell, the distance to
// the nearest set cell in `mask`. Lets edge matching be position-tolerant so a
// render edge 1-2 px off a real edge still scores well — that is what makes the
// edge term reward STRUCTURE (where building meets sky, track meets turf) rather
// than demanding pixel-exact overlap, which no pose achieves.
function distanceTransform(mask, w, h) {
  const INF = 1e6, d = new Float32Array(w * h);
  for (let i = 0; i < d.length; i++) d[i] = mask[i] ? 0 : INF;
  const upd = (i, j, c) => { if (d[j] + c < d[i]) d[i] = d[j] + c; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (y > 0) upd(i, i - w, 3);
    if (x > 0) upd(i, i - 1, 3);
    if (y > 0 && x > 0) upd(i, i - w - 1, 4);
    if (y > 0 && x < w - 1) upd(i, i - w + 1, 4);
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x;
    if (y < h - 1) upd(i, i + w, 3);
    if (x < w - 1) upd(i, i + 1, 3);
    if (y < h - 1 && x < w - 1) upd(i, i + w + 1, 4);
    if (y < h - 1 && x > 0) upd(i, i + w - 1, 4);
  }
  for (let i = 0; i < d.length; i++) d[i] /= 3; // back to ~pixel units
  return d;
}

// ---- scoring ---------------------------------------------------------------
// Similarity in [0,1] from three terms, returned as cost = 1 - sim to minimise:
//   balanced : class-balanced F1 over the classes present in the real frame
//              (so a few huge regions do not dominate; sky is down-weighted
//              because it is a trivially matched area the optimiser could spend
//              elsewhere), + per-pixel accuracy.
//   edge     : position-TOLERANT boundary agreement via a distance transform —
//              this is what pins landmark STRUCTURE in place. Weighted high.
// Class weights let sky count for little; building / track / turf / pool count
// full because their boundaries are the real landmarks.
const CLASS_W = { 1: 0.25, 2: 1.0, 3: 0.9, 4: 1.2, 5: 1.0, 6: 0.8, 7: 0.7 }; // by CLS id
function makeScorer(realGrid, w, h, opts) {
  opts = opts || {};
  const edgeW = opts.edgeW !== undefined ? opts.edgeW : 0.6;
  const tol = opts.edgeTol !== undefined ? opts.edgeTol : 2.5; // px tolerance
  const realEdge = edgeMap(realGrid, w, h);
  const realDT = distanceTransform(realEdge, w, h);
  const realCount = new Array(8).fill(0);
  let valid = 0, realEdgeN = 0;
  for (let i = 0; i < realGrid.length; i++) {
    const c = realGrid[i];
    if (c === CLS.ignore) continue;
    realCount[c]++; valid++;
  }
  for (let i = 0; i < realEdge.length; i++) if (realEdge[i]) realEdgeN++;

  return function score(renderGrid) {
    const inter = new Array(8).fill(0);
    const rendCount = new Array(8).fill(0);
    let correct = 0;
    const renderEdge = edgeMap(renderGrid, w, h);
    for (let i = 0; i < realGrid.length; i++) {
      const rc = realGrid[i];
      if (rc === CLS.ignore) continue;
      const mc = renderGrid[i];
      rendCount[mc]++;
      if (mc === rc) { inter[rc]++; correct++; }
    }
    const acc = valid ? correct / valid : 0;
    // class-weighted F1 over classes present in the real frame
    let rsum = 0, wsum = 0;
    for (let c = 1; c <= 7; c++) {
      if (realCount[c] < Math.max(4, valid * 0.004)) continue;
      const tp = inter[c], prec = rendCount[c] ? tp / rendCount[c] : 0, rec = realCount[c] ? tp / realCount[c] : 0;
      const f1 = (prec + rec) ? 2 * prec * rec / (prec + rec) : 0;
      const cw = CLASS_W[c] || 1;
      rsum += cw * f1; wsum += cw;
    }
    const balanced = wsum ? rsum / wsum : 0;

    // position-tolerant edge agreement: for each render edge pixel, how close
    // is the nearest real edge (precision); and build the render DT once for
    // recall (how close each real edge is to a render edge). Converted to a
    // 0..1 score via a soft falloff with the tolerance.
    const renderDT = distanceTransform(renderEdge, w, h);
    let eprecSum = 0, eprecN = 0, erecSum = 0, erecN = 0;
    for (let i = 0; i < renderEdge.length; i++) {
      if (renderEdge[i]) { eprecSum += Math.max(0, 1 - realDT[i] / tol); eprecN++; }
      if (realEdge[i]) { erecSum += Math.max(0, 1 - renderDT[i] / tol); erecN++; }
    }
    const eprec = eprecN ? eprecSum / eprecN : 0;
    const erec = erecN ? erecSum / erecN : 0;
    const edge = (eprec + erec) ? 2 * eprec * erec / (eprec + erec) : 0;

    const sim = (0.40 * balanced + 0.18 * acc + edgeW * edge) / (0.40 + 0.18 + edgeW);
    return { cost: 1 - sim, sim, acc, balanced, edge };
  };
}

// ---- collider rejection ----------------------------------------------------
function makeInsideSolid(colliders) {
  return function insideSolid(p) {
    const x = p.x, y = p.y, z = p.z, m = 0.4;
    for (const b of colliders) {
      if (x > b[0] - m && x < b[3] + m && y > b[1] - m && y < b[4] + m && z > b[2] - m && z < b[5] + m) return true;
    }
    return false;
  };
}

// ---- Nelder-Mead ----------------------------------------------------------
// The optimiser is nelderMeadAsync (defined near the bottom): its evalBatch
// renders a whole wave of candidate poses in one page.evaluate round-trip, so
// each simplex step costs one bridge crossing. The heavy speedup is that plus
// coarse-to-fine resolution and a seed from the current path key.

// pose vector <-> object
function vecToPose(v, solveFov, fixedFov) {
  return { x: v[0], y: v[1], z: v[2], yaw: ((v[3] % 360) + 360) % 360, pitch: v[4], roll: v[5], fov: solveFov ? v[6] : fixedFov };
}
function poseToVec(p, solveFov) {
  const v = [p.x, p.y, p.z, p.yaw, p.pitch, p.roll];
  if (solveFov) v.push(p.fov);
  return v;
}

// ---- path file read / key apply (string-surgical, preserves formatting) ----
function loadPathModule(pathKey) {
  // read path_X.js in a sandbox to get LSC.PATHS.X
  const file = path.join(ROOT, 'js', `path_${pathKey.toLowerCase()}.js`);
  const src = fs.readFileSync(file, 'utf8');
  const LSC = { PATHS: {} };
  const fn = new Function('LSC', src.replace(/^'use strict';?/, '') + '\nreturn LSC;');
  return { def: fn(LSC).PATHS[pathKey], file, src };
}

// Find the shot a time belongs to, and whether an exact key exists at that time.
function locateKey(def, t) {
  for (const s of def.shots) {
    if (t >= s.t0 - 1e-6 && t <= s.t1 + 1e-6) {
      let exact = -1;
      for (let i = 0; i < s.keys.length; i++) if (Math.abs(s.keys[i][0] - t) < 0.051) { exact = i; break; }
      return { shot: s, exact };
    }
  }
  return null;
}

function fmtNum(x, d = 2) { const r = +(+x).toFixed(d); return Object.is(r, -0) ? 0 : r; }
function keyLine(t, p, def, keepFov) {
  const base = `[${fmtNum(t)}, ${fmtNum(p.x)}, ${fmtNum(p.y)}, ${fmtNum(p.z)}, ${fmtNum(p.yaw)}, ${fmtNum(p.pitch)}, ${fmtNum(p.roll)}`;
  return keepFov ? `${base}, ${fmtNum(p.fov)}]` : `${base}]`;
}

// Rebuild a path file's source with solved keys applied, by regenerating the
// whole LSC.PATHS.X object literal from the (mutated) def. Formatting is our
// own canonical pretty-print; shots/cuts (t0,t1) and order are preserved.
function applyToSource(def, src, solutions, pathKey) {
  // mutate def: for each solution, replace an exact key or insert a new key
  // into the shot that owns its time, keeping keys sorted by t.
  for (const sol of solutions) {
    const loc = locateKey(def, sol.t);
    if (!loc) { console.error(`  --apply: t=${sol.t} is not inside any shot; skipped`); continue; }
    const hasGlobalFov = true; // paths use a global vfov; keep per-key fov only if solved
    const k = [sol.t, fmtNum(sol.pose.x), fmtNum(sol.pose.y), fmtNum(sol.pose.z),
      fmtNum(sol.pose.yaw), fmtNum(sol.pose.pitch), fmtNum(sol.pose.roll)];
    if (sol.solveFov) k.push(fmtNum(sol.pose.fov));
    if (loc.exact >= 0) {
      // keep existing fov slot presence if the old key had one and we didn't solve it
      if (!sol.solveFov && loc.shot.keys[loc.exact].length > 7) k.push(loc.shot.keys[loc.exact][7]);
      loc.shot.keys[loc.exact] = k;
    } else {
      loc.shot.keys.push(k);
      loc.shot.keys.sort((a, b) => a[0] - b[0]);
    }
  }
  // regenerate the object literal
  const lines = [];
  lines.push(`LSC.PATHS.${pathKey} = {`);
  lines.push(`  title: ${JSON.stringify(def.title)},`);
  lines.push(`  video: ${JSON.stringify(def.video)},`);
  if (def.youtube) lines.push(`  youtube: ${JSON.stringify(def.youtube)},`);
  lines.push(`  duration: ${def.duration},`);
  lines.push(`  vfov: ${def.vfov},`);
  lines.push('  shots: [');
  for (const s of def.shots) {
    lines.push(`    { t0: ${s.t0}, t1: ${s.t1}, keys: [`);
    for (const key of s.keys) lines.push(`      [${key.map((x) => fmtNum(x)).join(', ')}],`);
    lines.push('    ]},');
  }
  lines.push('  ],');
  lines.push('};');
  // preserve the file header comment block (everything up to "LSC.PATHS")
  const headerEnd = src.indexOf(`LSC.PATHS.${pathKey}`);
  const header = headerEnd > 0 ? src.slice(0, headerEnd) : "'use strict';\n";
  return header + lines.join('\n') + '\n';
}

// ---- verification sheet ----------------------------------------------------
async function buildSheet(page, items, outPath, cw) {
  cw = cw || 480; const ch = Math.round(cw * 9 / 16);
  const dataUrl = await page.evaluate(async ([items, cw, ch]) => {
    function loadImg(src) { return new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }); }
    const cols = 3, rows = items.length;
    const out = document.createElement('canvas');
    out.width = cols * cw; out.height = rows * ch;
    const g = out.getContext('2d');
    g.font = 'bold 15px sans-serif';
    for (let r = 0; r < items.length; r++) {
      const it = items[r], oy = r * ch;
      const real = await loadImg(it.realUrl);
      if (real) g.drawImage(real, 0, oy, cw, ch);
      const cls = await loadImg(it.classUrl);
      if (cls) g.drawImage(cls, cw, oy, cw, ch);
      // overlay column: real with class edges? just blend real + class 50%
      if (real) g.drawImage(real, 2 * cw, oy, cw, ch);
      if (cls) { g.globalAlpha = 0.5; g.drawImage(cls, 2 * cw, oy, cw, ch); g.globalAlpha = 1; }
      g.fillStyle = '#000'; g.fillRect(0, oy, 210, 40);
      g.fillStyle = '#ff0';
      g.fillText(`${it.label} t=${it.t}s`, 4, oy + 16);
      g.fillText(`sim ${it.sim.toFixed(3)} (${it.phase})`, 4, oy + 33);
      g.fillStyle = '#9ef'; g.fillText('real', cw + 4, oy + 16);
      g.fillStyle = '#9ef'; g.fillText('class render', 2 * cw + 4, oy + 16);
    }
    return out.toDataURL('image/jpeg', 0.85);
  }, [items, cw, ch]);
  fs.writeFileSync(outPath, Buffer.from(dataUrl.split(',')[1], 'base64'));
  return outPath;
}

// ---- main solve ------------------------------------------------------------
async function main() {
  const pathKey = (args.path || '').toUpperCase();
  if (pathKey !== 'A' && pathKey !== 'B') die('need --path A|B');
  if (!VIDEOS[pathKey]) die('unknown path ' + pathKey);

  // times
  let times = [];
  if (args.times) times = String(args.times).split(',').map(Number);
  if (args.range) { const [a, b, s] = String(args.range).split(':').map(Number); for (let t = a; t <= b + 1e-6; t += s) times.push(+t.toFixed(2)); }
  if (!times.length) die('need --times a,b,c or --range a:b:s');

  const { def, file: pathFile, src: pathSrc } = loadPathModule(pathKey);

  // init mode
  let initMode = args.init || 'path';
  let initObj = null;
  if (typeof initMode === 'string' && initMode[0] === '{') { initObj = JSON.parse(initMode); initMode = 'json'; }

  const solveFov = !args['fix-fov'];

  // resolution schedule (coarse -> fine). aspect 16:9. The seed is the current
  // path key and is usually close, so this REFINES: modest iters, shrinking
  // bounds. edgeTol loosens on coarse grids (fewer px) and tightens as we refine.
  const stages = [
    { w: 96, h: 54, iters: 70, bound: 1.0, edgeTol: 3.0 },
    { w: 160, h: 90, iters: 55, bound: 0.45, edgeTol: 2.5 },
    { w: 240, h: 135, iters: 40, bound: 0.22, edgeTol: 2.0 },
  ];

  const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 160, height: 90 } });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
  await page.goto('file:///' + path.join(ROOT, 'tools', 'autoalign.html').replace(/\\/g, '/'));
  await page.waitForFunction(() => window.aaReady && window.LSC && LSC.App.ready, null, { timeout: 180000 });
  await page.evaluate(() => window.aaReady);
  const colliders = await page.evaluate(() => window.aaColliders());
  const insideSolid = makeInsideSolid(colliders);

  // batched class-render helper
  async function renderBatch(poses, w, h) {
    const b64s = await page.evaluate(([p, w, h]) => window.aaRenderClassBatch(p, w, h), [poses, w, h]);
    return b64s.map(b64ToGrid);
  }

  const solutions = [];
  let prevPose = null;
  const smooth = !!args.smooth;

  for (const t of times) {
    const tStart = Date.now();
    // seed pose
    let seed;
    if (initMode === 'json') seed = Object.assign({ roll: 0, fov: def.vfov }, initObj);
    else if (smooth && prevPose) seed = Object.assign({}, prevPose);
    else seed = LSC_sample(def, t);
    const fixedFov = seed.fov || def.vfov;

    // bounds around the seed (metres / degrees). The score is multimodal, so a
    // tight box around a good seed avoids drifting into a wrong basin that only
    // matches blob AREAS. Widen with --range-m / --range-deg if the seed is poor.
    const bm = +(args['range-m'] || 25), bd = +(args['range-deg'] || 25), bf = +(args['range-fov'] || 15);
    const baseLo = [seed.x - bm, Math.max(1, seed.y - bm), seed.z - bm, seed.yaw - bd, seed.pitch - bd, seed.roll - 12];
    const baseHi = [seed.x + bm, seed.y + bm, seed.z + bm, seed.yaw + bd, seed.pitch + bd, seed.roll + 12];
    if (solveFov) { baseLo.push(Math.max(20, fixedFov - bf)); baseHi.push(Math.min(100, fixedFov + bf)); }
    const seedVec = poseToVec(seed, solveFov);
    // regularisation scale per parameter (metres / degrees), for a soft pull to
    // the seed so an equally-good-looking far pose loses to the near one.
    const regScale = solveFov ? [bm, bm, bm, bd, bd, bd, bf] : [bm, bm, bm, bd, bd, bd];

    let cur = poseToVec(seed, solveFov);
    let lastSim = 0, lastBreak = null;

    for (const stage of stages) {
      const frame = extractFrameRGB(pathKey, t, stage.w, stage.h);
      const realGrid = classifyRealFrame(frame, pathKey);
      const scorer = makeScorer(realGrid, stage.w, stage.h, { edgeW: 0.6, edgeTol: stage.edgeTol });

      // per-stage bounds shrink around current best
      const lo = cur.map((c, i) => Math.max(baseLo[i], c - (baseHi[i] - baseLo[i]) * stage.bound * 0.5));
      const hi = cur.map((c, i) => Math.min(baseHi[i], c + (baseHi[i] - baseLo[i]) * stage.bound * 0.5));

      // small quadratic pull toward the seed (lambda in sim units at 1 range
      // unit of displacement); keeps a tie from wandering far from the key.
      const lambda = +(args['reg'] !== undefined ? args['reg'] : 0.04);
      const regCost = (vec) => {
        let s = 0;
        for (let i = 0; i < vec.length; i++) { const d = (vec[i] - seedVec[i]) / regScale[i]; s += d * d; }
        return lambda * s / vec.length;
      };

      // NM runs in waves: evalBatch renders all requested poses in one
      // page.evaluate round-trip, rejecting any inside solid geometry.
      const res = await nelderMeadAsync(cur, lo, hi, async (vecs) => {
        const poses = vecs.map((v) => vecToPose(v, solveFov, fixedFov));
        const need = [], needIdx = [];
        const costs = new Array(vecs.length).fill(null);
        poses.forEach((p, i) => { if (insideSolid(p)) costs[i] = 1.8; else { need.push(p); needIdx.push(i); } });
        if (need.length) {
          const grids = await renderBatch(need, stage.w, stage.h);
          grids.forEach((grd, k) => { costs[needIdx[k]] = scorer(grd).cost + regCost(vecs[needIdx[k]]); });
        }
        return costs;
      }, { maxIter: stage.iters, tol: 1e-4 });
      cur = res.x;
      const finalPose = vecToPose(cur, solveFov, fixedFov);
      const grid = (await renderBatch([finalPose], stage.w, stage.h))[0];
      lastBreak = scorer(grid); lastSim = lastBreak.sim;
    }

    const pose = vecToPose(cur, solveFov, fixedFov);
    const roundP = {
      x: fmtNum(pose.x), y: fmtNum(pose.y), z: fmtNum(pose.z),
      yaw: fmtNum(pose.yaw), pitch: fmtNum(pose.pitch), roll: fmtNum(pose.roll), fov: fmtNum(pose.fov),
    };
    const ms = Date.now() - tStart;
    const seedPose = (initMode === 'json') ? Object.assign({ roll: 0, fov: def.vfov }, initObj) : LSC_sample(def, t);
    // seed score at finest res for before/after
    const fineFrame = extractFrameRGB(pathKey, t, 160, 90);
    const fineReal = classifyRealFrame(fineFrame, pathKey);
    const fineScorer = makeScorer(fineReal, 160, 90, { edgeW: 0.6, edgeTol: 2.5 });
    const seedGrid = (await renderBatch([seedPose], 160, 90))[0];
    const seedScore = fineScorer(seedGrid);
    const solvedGrid = (await renderBatch([pose], 160, 90))[0];
    const solvedScore = fineScorer(solvedGrid);

    solutions.push({
      t, pose: roundP, solveFov,
      key: keyLine(t, roundP, def, solveFov),
      before: { sim: +seedScore.sim.toFixed(4), acc: +seedScore.acc.toFixed(4), balanced: +seedScore.balanced.toFixed(4), edge: +seedScore.edge.toFixed(4) },
      after: { sim: +solvedScore.sim.toFixed(4), acc: +solvedScore.acc.toFixed(4), balanced: +solvedScore.balanced.toFixed(4), edge: +solvedScore.edge.toFixed(4) },
      seedPose: { x: fmtNum(seedPose.x), y: fmtNum(seedPose.y), z: fmtNum(seedPose.z), yaw: fmtNum(seedPose.yaw), pitch: fmtNum(seedPose.pitch), roll: fmtNum(seedPose.roll), fov: fmtNum(seedPose.fov) },
      ms,
    });
    prevPose = pose;
    console.log(`t=${t}  before sim ${seedScore.sim.toFixed(3)} -> after ${solvedScore.sim.toFixed(3)}   ${ms}ms   ${keyLine(t, roundP, def, solveFov)}`);
  }

  // ---- verification sheet ----
  const sheetDir = path.join(SCRATCH, 'autoalign_sheets');
  fs.mkdirSync(sheetDir, { recursive: true });
  const sheetItems = [];
  for (const sol of solutions) {
    const realFrame = extractFrameRGB(pathKey, sol.t, 480, 270);
    const realUrl = 'file:///' + realFrame.png.replace(/\\/g, '/');
    // class render preview at display size for both seed and solved
    const classUrlSolved = await page.evaluate(([p, w, h]) => window.aaRenderClassImage(p, w, h), [sol.pose, 480, 270]);
    const classUrlSeed = await page.evaluate(([p, w, h]) => window.aaRenderClassImage(p, w, h), [sol.seedPose, 480, 270]);
    sheetItems.push({ label: pathKey + ' BEFORE', t: sol.t, realUrl, classUrl: classUrlSeed, sim: sol.before.sim, phase: 'seed' });
    sheetItems.push({ label: pathKey + ' AFTER', t: sol.t, realUrl, classUrl: classUrlSolved, sim: sol.after.sim, phase: 'solved' });
  }
  const sheetPath = args.sheet || path.join(sheetDir, `${pathKey}_${path.basename(String(args.out || 'solved'), '.json')}.jpg`);
  await buildSheet(page, sheetItems, sheetPath, 480);

  await browser.close();

  // ---- write output ----
  const outDoc = {
    path: pathKey, generated: new Date().toISOString(), solveFov,
    sheet: sheetPath,
    solutions: solutions.map((s) => ({ t: s.t, pose: s.pose, key: s.key, before: s.before, after: s.after, ms: s.ms })),
  };
  const outFile = args.out || path.join(SCRATCH, `autoalign_${pathKey}.json`);
  fs.writeFileSync(outFile, JSON.stringify(outDoc, null, 2));
  console.log('\nwrote solved keys ->', outFile);
  console.log('wrote verification sheet ->', sheetPath);

  // ---- optional --apply ----
  if (args.apply) {
    const target = args['apply-target'];
    if (!target && !args['force-real']) {
      die(`--apply refused: writing the real repo file ${pathFile} needs --force-real.\n` +
        `       pass --apply-target <copy.js> to write a copy instead (recommended).`);
    }
    const dest = target ? path.resolve(target) : pathFile;
    const newSrc = applyToSource(def, pathSrc, solutions, pathKey);
    fs.writeFileSync(dest, newSrc);
    console.log('applied solved keys ->', dest);
  }
}

// LSC.Flyover.sample reimplemented in Node (no DOM) for seed poses.
function LSC_sample(path, t) {
  function cr(p0, p1, p2, p3, u) {
    const u2 = u * u, u3 = u2 * u;
    return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
  }
  function unwrap(keys) {
    const out = keys.map((k) => k.slice());
    for (let i = 1; i < out.length; i++) {
      let d = out[i][4] - out[i - 1][4];
      while (d > 180) { out[i][4] -= 360; d -= 360; }
      while (d < -180) { out[i][4] += 360; d += 360; }
    }
    return out;
  }
  const shots = path.shots;
  let shot = null;
  for (const s of shots) if (t >= s.t0 && t < s.t1) { shot = s; break; }
  if (!shot) shot = t < shots[0].t0 ? shots[0] : shots[shots.length - 1];
  const k = unwrap(shot.keys);
  const def = path.vfov || 55;
  const pose = (key) => ({ x: key[1], y: key[2], z: key[3], yaw: key[4], pitch: key[5], roll: key[6], fov: key[7] || def });
  if (k.length === 1 || t <= k[0][0]) return pose(k[0]);
  if (t >= k[k.length - 1][0]) return pose(k[k.length - 1]);
  let i = 0;
  while (i < k.length - 2 && t > k[i + 1][0]) i++;
  const a = k[Math.max(0, i - 1)], b = k[i], c = k[i + 1], d = k[Math.min(k.length - 1, i + 2)];
  const u = (t - b[0]) / (c[0] - b[0]);
  const v = [];
  for (let j = 1; j <= 6; j++) v[j] = cr(a[j], b[j], c[j], d[j], u);
  const fb = b[7] || def, fc = c[7] || def;
  return { x: v[1], y: v[2], z: v[3], yaw: ((v[4] % 360) + 360) % 360, pitch: v[5], roll: v[6], fov: fb + (fc - fb) * u };
}

// Async Nelder-Mead: eval(vecs[])->Promise<cost[]> so renders batch per wave.
async function nelderMeadAsync(x0, lo, hi, evalBatch, opts) {
  opts = opts || {};
  const n = x0.length;
  const maxIter = opts.maxIter || 150;
  const step = x0.map((_, i) => (hi[i] - lo[i]) * 0.18 + 1e-6);
  const clamp = (v) => v.map((x, i) => Math.max(lo[i], Math.min(hi[i], x)));

  let simplex = [clamp(x0.slice())];
  for (let i = 0; i < n; i++) { const p = x0.slice(); p[i] += step[i]; simplex.push(clamp(p)); }
  let f = await evalBatch(simplex);

  const order = () => {
    const idx = f.map((_, i) => i).sort((a, b) => f[a] - f[b]);
    simplex = idx.map((i) => simplex[i]); f = idx.map((i) => f[i]);
  };
  order();

  for (let iter = 0; iter < maxIter; iter++) {
    order();
    if (f[n] - f[0] < (opts.tol || 1e-4)) break;
    const c = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += simplex[i][j] / n;
    const worst = simplex[n];
    const reflect = clamp(c.map((cj, j) => cj + 1.0 * (cj - worst[j])));
    const expand = clamp(c.map((cj, j) => cj + 2.0 * (cj - worst[j])));
    const [fr, fe] = await evalBatch([reflect, expand]);
    if (fr < f[0]) {
      if (fe < fr) { simplex[n] = expand; f[n] = fe; } else { simplex[n] = reflect; f[n] = fr; }
    } else if (fr < f[n - 1]) {
      simplex[n] = reflect; f[n] = fr;
    } else {
      const contract = clamp(c.map((cj, j) => cj + 0.5 * (worst[j] - cj)));
      const [fc] = await evalBatch([contract]);
      if (fc < f[n]) { simplex[n] = contract; f[n] = fc; }
      else {
        for (let i = 1; i <= n; i++) simplex[i] = clamp(simplex[i].map((x, j) => simplex[0][j] + 0.5 * (x - simplex[0][j])));
        const fs2 = await evalBatch(simplex.slice(1));
        for (let i = 1; i <= n; i++) f[i] = fs2[i - 1];
      }
    }
  }
  order();
  return { x: simplex[0], cost: f[0] };
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
module.exports = { classifyReal, makeScorer, nelderMeadAsync, applyToSource, LSC_sample };
