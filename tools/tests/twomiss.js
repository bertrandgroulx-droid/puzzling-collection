// Whittle and Switcheroo: a first wrong tap is a warning, a second on the same clue loses it. Clock off.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = require('./serve.js').ROOT, out = require('fs').mkdtempSync(require('os').tmpdir() + '/puzzling-');
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f)); }).listen(0);
const fails = []; const check = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails.push(m); };
(async () => {
  const base = `http://localhost:${srv.address().port}/`; const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } }); await require('./serve.js').kit(ctx);
  const errors = [];
  // ---- Whittle ----
  let page = await ctx.newPage(); page.on('pageerror', e => errors.push('whittle: ' + e.message));
  await page.goto(base + 'whittle/'); await page.evaluate(() => { localStorage.setItem('whittle:help-seen', 'true'); localStorage.setItem('whittle:timer', 'false'); }); await page.reload();
  await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForTimeout(300);
  const chain = await page.evaluate(() => Shell.current().items[0]);
  const wrongIndex = (w, want) => [...w].findIndex((_, i) => w.slice(0, i) + w.slice(i + 1) !== want);
  let word = chain.start;
  let wi = wrongIndex(word, chain.steps[0][1]);
  await page.click(`.tile[data-i="${wi}"]`); await page.waitForTimeout(100);
  check(await page.$eval('#msg', e => e.textContent === 'Not that letter. One more try.'), 'whittle: first wrong tap is a warning (clock off, no seconds lost)');
  check(await page.$eval('#clueLabel', e => e.textContent === 'Clue 1 of 3'), 'whittle: still on clue 1');
  wi = wrongIndex(word, chain.steps[0][1]);
  await page.click(`.tile[data-i="${wi}"]`); await page.waitForTimeout(100);
  check(await page.$eval('#msg', (e, w) => e.textContent === 'Not that one either. It was ' + w + '. No point for this clue.', chain.steps[0][1]), 'whittle: second wrong tap loses the clue and shows the word');
  check(await page.$eval('#clueLabel', e => e.textContent === 'Clue 2 of 3'), 'whittle: moved on to clue 2');
  check(await page.$$eval('.tile', t => t.map(x => x.textContent).join('')) === chain.steps[0][1], 'whittle: tiles show the clue\'s word');
  // now get clues 2 and 3 right
  word = chain.steps[0][1];
  for (const k of [1, 2]) { const want = chain.steps[k][1]; const ri = [...word].findIndex((_, i) => word.slice(0, i) + word.slice(i + 1) === want); await page.click(`.tile[data-i="${ri}"]`); await page.waitForTimeout(150); word = want; }
  check(await page.$eval('#msg', e => e.textContent === 'Done. 2 points.'), 'whittle: chain settles with 2 of 3 points');
  check(await page.$$eval('.ladder li', l => l.map(x => x.className).join(',') === 'miss,got,got'), 'whittle: ladder shows miss, got, got');
  await page.close();
  // ---- Switcheroo ----
  page = await ctx.newPage(); page.on('pageerror', e => errors.push('switcheroo: ' + e.message));
  await page.goto(base + 'switcheroo/'); await page.evaluate(() => { localStorage.setItem('switcheroo:help-seen', 'true'); localStorage.setItem('switcheroo:timer', 'false'); }); await page.reload();
  await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForTimeout(300);
  const lad = await page.evaluate(() => Shell.current().items[0]);
  const diff = (a, b) => [...a].findIndex((c, i) => c !== b[i]);
  let w = lad.start, want = lad.steps[0][1], di = diff(w, want);
  const wrongKey = want[di] === 'Q' ? 'W' : 'Q';
  await page.click(`.tile[data-i="${di}"]`); await page.click(`[data-k="${wrongKey}"]`); await page.waitForTimeout(100);
  check(await page.$eval('#msg', e => / does not fit\. One more try\.$/.test(e.textContent)), 'switcheroo: first wrong letter is a warning');
  check(await page.$eval('.clue span', e => e.textContent === 'Clue 1 of 3'), 'switcheroo: still on clue 1');
  await page.click(`.tile[data-i="${di}"]`); await page.click(`[data-k="${wrongKey}"]`); await page.waitForTimeout(100);
  check(await page.$eval('#msg', (e, w) => e.textContent.endsWith('It was ' + w + '. No point for this rung.'), want), 'switcheroo: second wrong letter loses the rung');
  check(await page.$eval('.clue span', e => e.textContent === 'Clue 2 of 3'), 'switcheroo: moved on to clue 2');
  check(await page.$$eval('.tile', t => t.map(x => x.textContent).join('')) === want, 'switcheroo: tiles show the rung\'s word');
  w = want;
  for (const k of [1, 2]) { want = lad.steps[k][1]; di = diff(w, want); await page.click(`.tile[data-i="${di}"]`); await page.click(`[data-k="${want[di]}"]`); await page.waitForTimeout(150); w = want; }
  check(await page.$eval('.status', e => e.textContent === 'Ladder complete. 2 points.'), 'switcheroo: ladder settles with 2 of 3 points');
  check(await page.$$eval('.ladder li', l => l.map(x => x.className).join(',') === 'miss,got,got'), 'switcheroo: ladder shows miss, got, got');
  check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all passed');
})();
