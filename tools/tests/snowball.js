// Snowball: play a chain right, use a hint, give up, and settle; the saved score and the home card.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = require('./serve.js').ROOT, out = require('fs').mkdtempSync(require('os').tmpdir() + '/puzzling-');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f)); }).listen(0);
const fails = []; const check = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails.push(m); };
(async () => {
  const base = `http://localhost:${srv.address().port}/`; const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2 }); await require('./serve.js').kit(ctx);
  const errors = [];
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|fonts\.g/.test(m.text())) errors.push(m.text()); });
  await page.goto(base + 'snowball/'); await page.waitForTimeout(400);
  check(await page.$eval('#welcome', e => e.textContent.includes('MORSEL')), 'first visit shows the instructions block with the example');
  await page.click('#welcomeClose');
  check(await page.$eval('.instr', e => e.textContent.includes('Add one letter')), 'instruction line');
  check(await page.$eval('.progress .count', e => e.textContent === 'Puzzle 1 of 4'), 'Puzzle 1 of 4');
  const chain = await page.evaluate(() => { const set = Shell.current(); return set.items[0]; });
  const tiles = async () => page.$$eval('.tiles .tile', t => t.map(x => x.textContent).join(''));
  check((await tiles()) === chain.start, 'tiles show the start word ' + chain.start);
  check(await page.$eval('.group .lbl', e => e.textContent === 'Start with'), 'label reads Start with');
  check(await page.$eval('.field .lbl', e => e.textContent === 'Clue 1 of 3 · add one letter'), 'clue label');
  check(await page.$eval('#a0', e => e.placeholder === 'Type your answer here'), 'placeholder');
  await page.screenshot({ path: path.join(out, 'sb-start.png') });
  // a wrong length, then a wrong word, then the right one
  await page.fill('#a0', chain.start + 'XX'); await page.click('button[type=submit]');
  check(await page.$eval('#msg', e => e.textContent.includes('exactly one more letter')), 'wrong length is explained');
  await page.fill('#a0', 'Z' + chain.start); await page.click('button[type=submit]');
  check(await page.$eval('#msg', e => e.textContent === 'Not that one. Try again.'), 'wrong word');
  await page.fill('#a0', chain.steps[0][1].toLowerCase()); await page.press('#a0', 'Enter'); await page.waitForTimeout(200);
  check((await tiles()) === chain.steps[0][1] && (await page.$('.tiles .tile.new')) === null, 'right word: tiles grow, nothing coloured');
  check(await page.$eval('.group .lbl', e => e.textContent === 'The word so far'), 'label becomes The word so far');
  check(await page.$eval('.rungs', (e, want) => e.textContent.replace(/\s/g, '') === want, chain.start + '→' + chain.steps[0][1]), 'rungs show the chain so far');
  check(await page.$eval('.field .lbl', e => e.textContent === 'Clue 2 of 3 · add one letter'), 'clue 2 label');
  await page.screenshot({ path: path.join(out, 'sb-mid.png') });
  // hint marks the gap at the right place
  await page.click('#hintBtn'); await page.waitForTimeout(100);
  const gapIndex = await page.evaluate(() => [...document.querySelectorAll('.tiles > *')].findIndex(e => e.classList.contains('gap')));
  const want = chain.steps[1][1], prev = chain.steps[0][1];
  check(gapIndex >= 0 && want.slice(0, gapIndex) + want.slice(gapIndex + 1) === prev, 'hint marks the gap where the next letter goes (' + want + ')');
  check(await page.$eval('#hintBtn', b => b.disabled && b.textContent === 'Hint used'), 'hint button spent');
  await page.screenshot({ path: path.join(out, 'sb-hint.png') });
  await page.fill('#a0', want); await page.press('#a0', 'Enter'); await page.waitForTimeout(200);
  await page.fill('#a0', chain.steps[2][1]); await page.press('#a0', 'Enter'); await page.waitForTimeout(400);
  check(await page.$eval('.status', e => e.textContent === 'All three found. 2 points.'), 'settled: 3 steps minus 1 hint = 2 points');
  check(await page.$$eval('.ladder li.got', l => l.length === 3), 'all three rungs green');
  check(await page.$eval('.clue b.w', (e, s) => e.textContent === s, chain.start), 'Started from shows the start');
  await page.screenshot({ path: path.join(out, 'sb-settled.png') });
  // chain 2: give up at once scores 0
  await page.click('#nextBtn'); await page.waitForTimeout(200);
  await page.click('#giveUp'); await page.click('#giveUp'); await page.waitForTimeout(300);
  check(await page.$eval('.status', e => e.textContent === 'Given up. 0 points.'), 'give up with nothing found: 0 points');
  for (let i = 0; i < 2; i++) { await page.click('#nextBtn'); await page.waitForTimeout(200); await page.click('#giveUp'); await page.click('#giveUp'); await page.waitForTimeout(300); }
  check(await page.$eval('#nextBtn', b => b.textContent === 'See your score'), 'last chain settled');
  const pad = n => String(n).padStart(2, '0'), d = new Date(), iso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  check(await page.evaluate(k => JSON.parse(localStorage.getItem(k)).score === 2, 'snowball:daily:' + iso), 'score saved before See your score');
  await page.click('#nextBtn'); await page.waitForTimeout(2300);
  check(await page.$eval('.big', e => e.textContent.trim().startsWith('2')), 'results show 2 / 12');
  check(await page.$eval('#nextGame', a => a.textContent === 'Next game · Tumble'), 'next game after Snowball is Tumble');
  const home = await ctx.newPage(); await home.goto(base); await home.waitForTimeout(300);
  check(await home.$eval('.games a[href="snowball/"] .state', e => e.textContent.startsWith('Played today · 2 / 12')), 'home card shows Played today · 2 / 12');
  check(await home.$$eval('.games li', l => l.length === 9 && l[2].querySelector('h2').textContent === 'Snowball'), 'nine cards, Snowball third');
  check(await home.$eval('.lead', e => e.textContent.startsWith('Nine')), 'home lead says Nine');
  check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all passed');
})();
