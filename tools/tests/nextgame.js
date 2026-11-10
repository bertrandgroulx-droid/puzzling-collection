// Today's results offer the next of the eight games not yet played, and say how many are done.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = require('./serve.js').ROOT, out = require('fs').mkdtempSync(require('os').tmpdir() + '/puzzling-');
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f)); }).listen(0);
const fails = []; const check = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails.push(m); };
(async () => {
  const base = `http://localhost:${srv.address().port}/`; const browser = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, colorScheme: scheme, deviceScaleFactor: 2 }); await require('./serve.js').kit(ctx);
    const pad = n => String(n).padStart(2, '0'), d = new Date(), iso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    const y = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1), yIso = y.getFullYear() + '-' + pad(y.getMonth() + 1) + '-' + pad(y.getDate());
    const page = await ctx.newPage(); await page.goto(base + 'splice/');
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('splice:help-seen', 'true'); }); await page.reload();
    for (let i = 0; i < 5; i++) { await page.click('#giveUp'); await page.click('#giveUp'); await page.waitForTimeout(250); await page.click('#nextBtn'); await page.waitForTimeout(200); }
    await page.waitForSelector('#shareBtn'); await page.waitForTimeout(2200);
    check(await page.$eval('#nextGame', a => a.textContent === 'Next game · Common Thread' && a.getAttribute('href') === '../common-thread/' && a.classList.contains('primary')), scheme + ': after Splice, Next game is Common Thread and is the primary button');
    check(await page.$eval('.status', e => e.textContent.includes('1 of 9 games played today')), scheme + ': tally says 1 of 9');
    check(await page.$eval('#randomBtn', b => !b.classList.contains('primary')), scheme + ': random puzzles is a plain button');
    if (scheme === 'light') await page.screenshot({ path: path.join(out, 'next-' + scheme + '.png') });
    await page.click('#nextGame'); await page.waitForTimeout(400);
    check(page.url().startsWith(base + 'common-thread/') && await page.title() === 'Common Thread', scheme + ': Next game opens Common Thread');
    // mark every other game played: the next unplayed after Splice skips them
    await page.evaluate(iso => { for (const g of ['commonthread', 'whittle', 'snowball', 'tumble', 'stowaway', 'soundalike', 'switcheroo']) localStorage.setItem(g + ':daily:' + iso, JSON.stringify({ score: 5, max: 10, results: [1, 1, 1, 1, 1], recap: [] })); }, iso);
    await page.goto(base + 'splice/'); await page.waitForTimeout(400);
    check(await page.$eval('#nextGame', a => a.textContent === 'Next game · Three of a Kind'), scheme + ': the one game left is offered, in home-page order, wrapping round');
    check(await page.$eval('.status', e => e.textContent.includes('8 of 9 games played today')), scheme + ': tally says 8 of 9');
    await page.evaluate(iso => localStorage.setItem('threeofakind:daily:' + iso, JSON.stringify({ score: 5, max: 10, results: [1, 1, 1, 1, 1], recap: [] })), iso);
    await page.goto(base + 'splice/'); await page.waitForTimeout(400);
    check((await page.$('#nextGame')) === null && await page.$eval('#randomBtn', b => b.classList.contains('primary')), scheme + ': all eight played: no Next game, random puzzles is primary again');
    check(await page.$eval('.status', e => e.textContent.includes('All 9 games played today.')), scheme + ': tally says all nine');
    check(await page.$eval('a[href="../"].quiet', a => a.textContent === 'All games'), scheme + ': an All games link appears when there is nothing left');
    if (scheme === 'dark') await page.screenshot({ path: path.join(out, 'next-' + scheme + '.png') });
    // a past day's results do not offer a next game
    await page.goto(base + 'splice/?daily=' + yIso); await page.waitForTimeout(300);
    const s = await page.$('#startBtn'); if (s) await s.click();
    for (let i = 0; i < 5; i++) { await page.click('#giveUp'); await page.click('#giveUp'); await page.waitForTimeout(250); await page.click('#nextBtn'); await page.waitForTimeout(200); }
    await page.waitForSelector('#shareBtn');
    check((await page.$('#nextGame')) === null && !(await page.$eval('.status', e => e.textContent.includes('played today'))), scheme + ': a past day: no Next game and no tally');
    await ctx.close();
  }
  await browser.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all passed');
})();
