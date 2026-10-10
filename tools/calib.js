/* Dev tool (not part of the app): renders the model at camera poses next to
 * the matching reference-video frames, as one contact sheet, so the flyover
 * keys in js/paths.js can be checked by eye.
 *
 *   node tools/calib.js --path A --range 10:20:2 --out sheet.jpg [--cols 3] [--overlay]
 *   node tools/calib.js --path B --times 4,8,12 --out sheet.jpg
 *   node tools/calib.js --poses poses.json --out views.jpg      (free views, no video)
 *
 * Needs ffmpeg on PATH and the Playwright install that ships with
 * @playwright/cli (PLAYWRIGHT_CORE env var overrides its location).
 */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const PW = process.env.PLAYWRIGHT_CORE || path.join(process.env.APPDATA || '', 'npm', 'node_modules', '@playwright', 'cli', 'node_modules', 'playwright-core');
const { chromium } = require(PW);

const VIDEOS = { A: 'reference/video/lsc_aerial_ERq74Xv4GY0.mp4', B: 'reference/video/lsc_drone_flyover_d8X8myGUXjo.mp4' };
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) { const k = a.slice(2); const v = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true; args[k] = v; }
}
const cache = path.join(process.env.KIROCREW_SCRATCH || process.env.TEMP || ROOT, 'lsc_calib_frames');
fs.mkdirSync(cache, { recursive: true });

function frame(key, t) {
  const f = path.join(cache, `${key}_${t.toFixed(2)}.jpg`);
  if (!fs.existsSync(f)) {
    cp.execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(t), '-i', path.join(ROOT, VIDEOS[key]), '-frames:v', '1', '-vf', 'scale=640:-1', f]);
  }
  return 'file:///' + f.replace(/\\/g, '/');
}

(async () => {
  let items = [];
  if (args.poses) {
    items = JSON.parse(fs.readFileSync(args.poses, 'utf8')).map((p, i) => ({ pose: Object.assign({ roll: 0, fov: 60 }, p), label: p.label || String(i) }));
  } else {
    let times = [];
    if (args.times) times = String(args.times).split(',').map(Number);
    if (args.range) { const [a, b, s] = String(args.range).split(':').map(Number); for (let t = a; t <= b + 1e-6; t += s) times.push(+t.toFixed(2)); }
    items = times.map((t) => ({ path: args.path, t, frame: frame(args.path, t), label: args.path }));
  }
  const cols = +(args.cols || 3), cw = +(args.w || 480), ch = Math.round(cw * 9 / 16);
  const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: cw, height: ch } });
  page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto('file:///' + path.join(ROOT, 'tools', 'calib.html').replace(/\\/g, '/'));
  await page.waitForFunction(() => window.calibReady && window.LSC && LSC.App.ready, null, { timeout: 180000 });
  const url = await page.evaluate(([it, c, w, h, m]) => window.calibSheet(it, c, w, h, m), [items, cols, cw, ch, (args.overlay || args.poses) ? 'overlay' : 'pair']);
  fs.writeFileSync(args.out || path.join(cache, 'sheet.jpg'), Buffer.from(url.split(',')[1], 'base64'));
  await browser.close();
  console.log('wrote', args.out);
})().catch((e) => { console.error(e); process.exit(1); });
