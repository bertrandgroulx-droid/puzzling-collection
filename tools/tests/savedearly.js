// The day's score is saved when the last puzzle settles, before See your score is tapped.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = require('./serve.js').ROOT, out = require('fs').mkdtempSync(require('os').tmpdir() + '/puzzling-');
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f)); }).listen(0);
const fails = []; const check = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails.push(m); };
(async () => {
  const base = `http://localhost:${srv.address().port}/`; const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } }); await require('./serve.js').kit(ctx);
  const pad = n => String(n).padStart(2, '0'), d = new Date(), iso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const giveUpAll = async (page, n, next) => { for (let i = 0; i < n; i++) { await page.click('#giveUp'); await page.click('#giveUp'); await page.waitForTimeout(250); if (i < n - 1) { await page.click(next); await page.waitForTimeout(200); } } };
  // Splice (engine), Common Thread and Whittle (own code), each with a timed start where needed
  for (const [g, n, next, store, go] of [['splice', 5, '#nextBtn', 'splice', null], ['common-thread', 5, '#next', 'commonthread', null], ['whittle', 4, '#go', 'whittle', '#go']]) {
    const page = await ctx.newPage(); await page.goto(base + g + '/');
    await page.evaluate(s => localStorage.setItem(s + ':help-seen', 'true'), store); await page.reload();
    const s = await page.$('#startBtn'); if (s) await s.click();
    for (let i = 0; i < n; i++) {
      if (go) { await page.waitForSelector(go + ':not([hidden])'); if (await page.$eval(go, b => b.textContent === 'Start')) await page.click(go); }
      await page.waitForTimeout(150); await page.click('#giveUp'); await page.click('#giveUp'); await page.waitForTimeout(300);
      if (i < n - 1) { await page.click(next); await page.waitForTimeout(200); }
    }
    // last puzzle settled, See your score NOT tapped
    const btnText = await page.$eval(next, b => b.textContent);
    check(btnText === 'See your score', g + ': last puzzle settled, button reads See your score');
    const rec = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), store + ':daily:' + iso);
    check(rec && rec.score === 0 && rec.results.length === n, g + ': score already saved before See your score');
    await page.reload(); await page.waitForTimeout(500);
    check(await page.$('#shareBtn') !== null && await page.$eval('.big', e => e.textContent.trim().startsWith('0')), g + ': reopening shows the results, not the puzzle');
    await page.close();
  }
  // Tapping See your score after the early save still reads as the first score
  const page = await ctx.newPage(); await page.goto(base + 'stowaway/'); await page.evaluate(() => localStorage.setItem('stowaway:help-seen', 'true')); await page.reload();
  await giveUpAll(page, 5, '#nextBtn'); await page.click('#nextBtn'); await page.waitForTimeout(2200);
  check(await page.$eval('.status', e => e.textContent.includes('Saved as your score for today')), 'stowaway: results say Saved as your score for today');
  const home = await ctx.newPage(); await home.goto(base); await home.waitForTimeout(300);
  check(await home.$eval('.games a[href="stowaway/"] .state', e => e.textContent.startsWith('Played today · 0 / 10')), 'home page shows Played today for stowaway');
  check(await home.$eval('.games a[href="splice/"] .state', e => e.textContent.startsWith('Played today · 0 / 10')), 'home page shows Played today for splice, saved without See your score');
  await browser.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all passed');
})();
