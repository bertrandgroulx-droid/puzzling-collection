// Random play never deals a retired puzzle, in Whittle or Snowball.
const { chromium } = require("playwright");
const { serve, kit, check, done, store } = require("./serve.js");

(async () => {
  const { srv, base } = serve();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } }); await kit(ctx);
  for (const g of ["whittle", "snowball"]) {
    const page = await ctx.newPage();
    await page.goto(base + g + "/?practice"); await page.evaluate(s => localStorage.setItem(s + "help-seen", "true"), store(g)); await page.reload(); await page.waitForTimeout(200);
    const retired = await page.evaluate(() => (window.WHITTLE_PUZZLES || window.SNOWBALL_PUZZLES).filter(p => p.retired).map(p => p.start.toUpperCase()));
    let dealt = 0, bad = 0;
    for (let round = 0; round < 12; round++) {
      const s = await page.$("#startBtn"); if (s) await s.click();
      await page.waitForTimeout(100);
      const go = await page.$("#go"); if (go && await go.isVisible() && (await go.textContent()) === "Start") await go.click();
      await page.waitForTimeout(100);
      const start = await page.$$eval(".tiles .tile", t => t.map(x => x.textContent).join(""));
      dealt++; if (retired.includes(start)) bad++;
      await page.goto(base + g + "/?practice"); await page.waitForTimeout(150);
    }
    check(bad === 0 && dealt === 12, g + ": " + dealt + " random first puzzles dealt, " + bad + " retired among them (" + retired.length + " retired in the list)");
    await page.close();
  }
  done(srv, browser);
})();
