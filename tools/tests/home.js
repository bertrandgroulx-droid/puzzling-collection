// The home page cards: state under the description, skills line last, icon spanning all rows; light and dark at 375.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = require('./serve.js').ROOT, out = require('fs').mkdtempSync(require('os').tmpdir() + '/puzzling-');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f)); }).listen(0);
const fails = []; const check = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails.push(m); };
(async () => {
  const base = `http://localhost:${srv.address().port}/`; const browser = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, colorScheme: scheme, deviceScaleFactor: 2 }); await require('./serve.js').kit(ctx);
    const page = await ctx.newPage(); await page.goto(base);
    const pad = n => String(n).padStart(2, '0'), d = new Date(), iso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    await page.evaluate(iso => { localStorage.setItem('whittle:daily:' + iso, JSON.stringify({ score: 9, max: 12 })); }, iso);
    await page.reload(); await page.waitForTimeout(600);
    const m = await page.evaluate(() => [...document.querySelectorAll('.games a')].map(a => {
      const r = s => a.querySelector(s).getBoundingClientRect();
      const ic = r('.appicon'), h = r('h2'), p = r('p'), st = r('.state'), sk = r('.skills');
      return { name: a.querySelector('h2').textContent, order: h.top < p.top && p.bottom <= st.top && st.bottom <= sk.top, iconLeft: ic.right <= h.left && ic.right <= sk.left, state: a.querySelector('.state').textContent, skills: a.querySelector('.skills').textContent, sw: document.documentElement.scrollWidth <= document.documentElement.clientWidth };
    }));
    for (const c of m) { check(c.order && c.iconLeft && c.sw, scheme + ' · ' + c.name + ': name, description, state, skills in that order beside the icon · ' + c.skills); }
    check(m.find(c => c.name === 'Whittle').state.startsWith('Played today · 9 / 12'), scheme + ': played state shows score');
    await page.screenshot({ path: path.join(out, 'home-' + scheme + '.png'), fullPage: true });
    await ctx.close();
  }
  await browser.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all passed');
})();
