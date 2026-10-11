/* Local dev static server with no-store caching (tooling only, not part of the app). */
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2] || process.cwd());
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.md': 'text/plain', '.json': 'application/json', '.mp4': 'video/mp4' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const fp = path.resolve(ROOT, '.' + path.sep + p.replace(/^([/\\])+/, ''));
  if (fp !== ROOT && !fp.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.stat(fp, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); res.end('not found'); return; }
    const head = { 'Content-Type': types[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
    // Range support: without it Chrome cannot seek a <video>, so the flyover seek bar snaps back to 0.
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m && (m[1] || m[2])) {
      let a = m[1] ? +m[1] : st.size - +m[2], b = m[1] && m[2] ? +m[2] : st.size - 1;
      b = Math.min(b, st.size - 1);
      if (a < 0 || a > b) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); res.end(); return; }
      res.writeHead(206, { ...head, 'Content-Range': `bytes ${a}-${b}/${st.size}`, 'Content-Length': b - a + 1 });
      fs.createReadStream(fp, { start: a, end: b }).pipe(res);
      return;
    }
    res.writeHead(200, { ...head, 'Content-Length': st.size });
    fs.createReadStream(fp).pipe(res);
  });
}).listen(8137, '127.0.0.1', () => console.log('serving ' + ROOT + ' on :8137'));
