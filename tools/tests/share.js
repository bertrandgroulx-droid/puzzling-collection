// The header share icon: link and title per state, the copy path, and the header at 375 wide.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = require('./serve.js').ROOT, out = require('fs').mkdtempSync(require('os').tmpdir() + '/puzzling-');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f));
}).listen(0);
const fails = [];
const check = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails.push(m); };
(async () => {
  const base = `http://localhost:${srv.address().port}/`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, permissions: ['clipboard-read', 'clipboard-write'], deviceScaleFactor: 2 });
  await require('./serve.js').kit(ctx);
  const games = ['common-thread', 'whittle', 'snowball', 'tumble', 'stowaway', 'soundalike', 'switcheroo', 'three-of-a-kind', 'splice'];
  const link = p => p.evaluate(() => Shell.shareLink());
  const pad = n => String(n).padStart(2, '0'), d0 = new Date(), d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate());
  const todayIso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const y = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1), yIso = y.getFullYear() + '-' + pad(y.getMonth() + 1) + '-' + pad(y.getDate());
  const doy = x => Math.round((x - new Date(x.getFullYear(), 0, 1)) / 864e5) + 1;
  // header fit and icon placement, every game
  const strip = [];
  for (const g of games) {
    const page = await ctx.newPage();
    await page.goto(base + g + '/'); await page.waitForTimeout(600);
    const m = await page.evaluate(() => {
      const s = document.getElementById('shareIcon').getBoundingClientRect(), h = document.getElementById('helpBtn').getBoundingClientRect(), n = document.querySelector('.name h1').getBoundingClientRect();
      return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sx: s.x, sw2: s.width, sh: s.height, sy: s.y + s.height / 2, hx: h.x, hy: h.y + h.height / 2, nameRight: n.right, oneLine: n.height < 1.6 * parseFloat(getComputedStyle(document.querySelector('.name h1')).fontSize), topH: document.querySelector('.top').getBoundingClientRect().height };
    });
    check(m.sw <= m.cw, g + ': nothing scrolls sideways');
    check(m.sw2 === 34 && m.sh === 34, g + ': icon hit area is 34x34');
    check(m.sx + 34 <= m.hx && m.hx - (m.sx + 34) <= 12, g + ': icon sits just left of How to play');
    check(Math.abs(m.sy - m.hy) < 1, g + ': icon and pill share a centre');
    check(m.nameRight <= m.sx, g + ': name does not run under the icon');
    check(m.oneLine, g + ': name is on one line');
    const top = await page.$('.top'); strip.push({ g, buf: await top.screenshot(), h: m.topH });
    await page.close();
  }
  // links and titles per state (Splice)
  const page = await ctx.newPage();
  await page.goto(base + 'splice/'); await page.waitForTimeout(400);
  let l = await link(page); console.log('today, in play       ', l.title, l.url);
  check(l.url === 'https://shozbot.com/puzzling/splice/?daily=' + todayIso && l.title === 'Splice · Daily No. ' + doy(d), 'today in play: dated link from canonical');
  // copy path: no navigator.share in headless Chromium, so the link is copied and the toast shows
  await page.click('#shareIcon'); await page.waitForTimeout(150);
  check(await page.$eval('#toast', e => e.classList.contains('show') && e.textContent === 'Link copied'), 'tap copies and shows Link copied');
  check((await page.evaluate(() => navigator.clipboard.readText())) === l.url, 'clipboard holds the dated link');
  await page.waitForTimeout(2000);
  check(await page.$eval('#toast', e => !e.classList.contains('show')), 'toast goes away after about 1.8s');
  // results of today
  const close = await page.$('#welcomeClose'); if (close) await close.click();
  for (let i = 0; i < 5; i++) { await page.click('#giveUp'); await page.click('#giveUp'); await page.waitForTimeout(300); await page.click('#nextBtn'); await page.waitForTimeout(200); }
  await page.waitForSelector('#shareBtn');
  l = await link(page); console.log('today, results       ', l.title, l.url);
  check(l.url.endsWith('?daily=' + todayIso) && /Daily No\. \d+$/.test(l.title), 'today results: dated link');
  await page.goto(base + 'splice/?daily=' + yIso); await page.waitForTimeout(400);
  l = await link(page); console.log('past day             ', l.title, l.url);
  check(l.url.endsWith('?daily=' + yIso) && l.title === 'Splice · Daily No. ' + doy(y), 'past day: its own dated link');
  await page.goto(base + 'splice/?practice'); await page.waitForTimeout(400);
  l = await link(page); console.log('random               ', l.title, l.url);
  check(l.url === 'https://shozbot.com/puzzling/splice/' && l.title === 'Splice', 'random: plain link, no seed');
  await page.goto(base + 'splice/?past'); await page.waitForTimeout(400);
  l = await link(page); console.log('past list            ', l.title, l.url);
  check(l.url === 'https://shozbot.com/puzzling/splice/' && l.title === 'Splice', 'past list: plain link');
  await page.goto(base + 'whittle/?practice'); await page.waitForSelector('#startBtn');
  l = await link(page); console.log('random start card    ', l.title, l.url);
  check(l.url === 'https://shozbot.com/puzzling/whittle/' && l.title === 'Whittle', 'random start card: plain link');
  await page.goto(base + 'whittle/'); await page.waitForSelector('#startBtn');
  l = await link(page); console.log('daily start card     ', l.title, l.url);
  check(l.url.endsWith('?daily=' + todayIso), 'daily start card: dated link');
  await page.close();
  // dark header too
  const dark = await browser.newContext({ viewport: { width: 375, height: 667 }, colorScheme: 'dark', deviceScaleFactor: 2 }); await require('./serve.js').kit(dark);
  const dp = await dark.newPage(); await dp.goto(base + 'three-of-a-kind/'); await dp.waitForTimeout(600);
  strip.push({ g: 'three-of-a-kind (dark)', buf: await (await dp.$('.top')).screenshot() }); await dark.close();
  fs.writeFileSync(path.join(out, 'headers.json'), JSON.stringify(strip.map(s => s.g)));
  strip.forEach(s => fs.writeFileSync(path.join(out, 'hdr-' + s.g.replace(/[^a-z0-9]+/gi, '-') + '.png'), s.buf));
  await browser.close(); srv.close();
  console.log(fails.length ? fails.length + ' FAILED' : 'all passed');
})();
