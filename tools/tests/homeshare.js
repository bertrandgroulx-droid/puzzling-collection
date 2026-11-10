// The collection page: the share icon beside the title, the copy path, and the preview tags on every page.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = require('./serve.js').ROOT, out = require('fs').mkdtempSync(require('os').tmpdir() + '/puzzling-');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f)); }).listen(0);
const fails = []; const check = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails.push(m); };
(async () => {
  const base = `http://localhost:${srv.address().port}/`; const browser = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, permissions: ['clipboard-read', 'clipboard-write'], colorScheme: scheme, deviceScaleFactor: 2 }); await require('./serve.js').kit(ctx);
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base); await page.waitForTimeout(600);
    const m = await page.evaluate(() => { const s = document.getElementById('shareIcon').getBoundingClientRect(), h = document.querySelector('.name h1').getBoundingClientRect(), t = document.querySelector('.top').getBoundingClientRect(); return { sw: document.documentElement.scrollWidth <= document.documentElement.clientWidth, size: s.width === 34 && s.height === 34, right: Math.abs(s.right - t.right) < 1, centred: Math.abs((s.top + s.height / 2) - (h.top + h.height / 2)) < 2, afterName: s.left > h.right }; });
    check(m.sw, scheme + ': nothing scrolls sideways');
    check(m.size, scheme + ': icon is 34x34');
    check(m.right && m.afterName, scheme + ': icon sits at the right end of the title row');
    check(m.centred, scheme + ': icon is centred on the title');
    await (await page.$('.top')).screenshot({ path: path.join(out, 'home-share-' + scheme + '.png') });
    await page.click('#shareIcon'); await page.waitForTimeout(150);
    check(await page.$eval('#toast', e => e.classList.contains('show') && e.textContent === 'Link copied'), scheme + ': tap copies and shows Link copied');
    check((await page.evaluate(() => navigator.clipboard.readText())) === 'https://shozbot.com/puzzling/', scheme + ': clipboard holds the plain collection address');
    check(errors.length === 0, scheme + ': no page errors');
    await ctx.close();
  }
  // the preview tags, read from the files
  const og = (file) => { const s = fs.readFileSync(path.join(root, file), 'utf8'); const g = (k) => (s.match(new RegExp('<meta (?:property|name)="' + k + '" content="([^"]*)"')) || [])[1]; return { url: g('og:url'), title: g('og:title'), desc: g('og:description'), img: g('og:image'), w: g('og:image:width'), h: g('og:image:height'), card: g('twitter:card'), canon: (s.match(/<link rel="canonical" href="([^"]*)">/) || [])[1] }; };
  const h = og('index.html');
  check(h.url === 'https://shozbot.com/puzzling/' && h.title === 'Puzzling — nine daily word games' && h.img === 'https://shozbot.com/assets/og-puzzling.png' && h.w === '1200' && h.h === '630' && h.card === 'summary_large_image', 'collection page carries the preview tags as specified');
  for (const g of ['common-thread', 'whittle', 'snowball', 'tumble', 'stowaway', 'soundalike', 'switcheroo', 'three-of-a-kind', 'splice']) { const t = og(g + '/index.html'); check(t.url === t.canon && /— a daily word game from Puzzling$/.test(t.title) && t.desc && t.img === h.img && t.card === 'summary_large_image', g + ': preview tags with its own name and address, the shared image'); }
  await browser.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all passed');
})();
