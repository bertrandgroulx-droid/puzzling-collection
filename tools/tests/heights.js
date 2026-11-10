// Every play, settled and results screen must fit a small phone (375 by 667) without scrolling.
// Prints the height of each screen. The home page, and a first visit with the one-time
// instructions block open above the puzzle, are allowed to scroll.
const { chromium } = require("playwright");
const { serve, kit, check, done, GAMES } = require("./serve.js");
const H = 667;

(async () => {
  const { srv, base } = serve();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: H } }); await kit(ctx);
  const page = await ctx.newPage();
  const fits = async (label) => { const sh = await page.evaluate(() => document.documentElement.scrollHeight); console.log((sh > H ? "SCROLL " : "fits   ") + String(sh).padStart(4) + "  " + label); return sh <= H; };
  let ok = true;
  for (const g of GAMES) {
    await page.goto(base + g + "/"); await page.waitForTimeout(300);
    await fits(g + " first visit (the one-time instructions block open; may scroll)");
    await page.click("#welcomeClose");
    const s = await page.$("#startBtn");
    if (s) { ok = await fits(g + " start card") && ok; await s.click(); await page.waitForTimeout(150); }
    const go = await page.$("#go"); if (go && await go.isVisible() && (await go.textContent()) === "Start") { ok = await fits(g + " before start") && ok; await go.click(); }
    await page.waitForTimeout(150);
    ok = await fits(g + " play") && ok;
    if (await page.$("#hintBtn")) { await page.click("#hintBtn"); ok = await fits(g + " play with a hint") && ok; }
    await page.click("#giveUp"); await page.click("#giveUp"); await page.waitForTimeout(300);
    ok = await fits(g + " settled") && ok;
  }
  // results, on the game with the longest recap
  await page.goto(base + "splice/"); await page.waitForTimeout(300);
  for (let i = 0; i < 5; i++) { await page.click("#giveUp"); await page.click("#giveUp"); await page.waitForTimeout(200); await page.click("#nextBtn"); await page.waitForTimeout(200); }
  await page.waitForTimeout(2300);
  ok = await fits("splice results") && ok;
  await page.goto(base); await page.waitForTimeout(300); await fits("home (may scroll)");
  check(ok, "every play, settled and results screen fits 375 by 667");
  done(srv, browser);
})();
