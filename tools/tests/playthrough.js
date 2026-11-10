// Plays every game through the shell: first visit, the start card on timed games, a full daily
// game (giving up on each puzzle), the saved score, the results screen, Share, a reload, the past
// list, How to play and the timer switch, and the home page afterwards.
const { chromium } = require("playwright");
const { serve, kit, check, done, GAMES, todayIso, store } = require("./serve.js");

(async () => {
  const { srv, base } = serve();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); await kit(ctx);
  const errors = [];
  const open = async (url) => {
    const page = await ctx.newPage();
    page.on("pageerror", e => errors.push(url + ": " + e.message));
    page.on("console", m => { if (m.type() === "error" && !/favicon|fonts\.g/.test(m.text())) errors.push(url + ": " + m.text()); });
    await page.goto(base + url); await page.waitForTimeout(300);
    return page;
  };
  // Settle one puzzle by giving up (two taps), then move on. Timed games press Start first.
  // The shell's start card stays in the hidden shell section once a game starts, so check it is visible.
  const start = async (page) => { const s = await page.$("#startBtn"); if (s && await s.isVisible()) { await s.click(); await page.waitForTimeout(150); } const go = await page.$("#go"); if (go && await go.isVisible() && (await go.textContent()) === "Start") await go.click(); await page.waitForTimeout(150); };
  const giveUp = async (page) => { await page.click("#giveUp"); await page.click("#giveUp"); await page.waitForTimeout(250); };
  const nextBtn = async (page) => (await page.$("#nextBtn")) || (await page.$("#next")) || (await page.$("#go"));

  for (const g of GAMES) {
    const page = await open(g + "/");
    check(await page.$("#welcome") !== null, g + ": first visit shows the instructions block");
    await page.click("#welcomeClose");
    check(await page.$("#welcome") === null, g + ": Got it removes it");
    await start(page);
    check(await page.$eval(".progress .count", e => /^Puzzle 1 of \d$/.test(e.textContent)), g + ": Puzzle 1 of N");
    check(await page.$eval("#hintBtn", b => b.textContent === "Hint (−1 point)"), g + ": hint button");
    const n = await page.$$eval(".pip", p => p.length);
    for (let i = 0; i < n; i++) {
      await giveUp(page);
      const b = await nextBtn(page);
      check(b !== null && (await b.textContent()) === (i < n - 1 ? "Next" : "See your score"), g + ": puzzle " + (i + 1) + " settled, button reads " + (i < n - 1 ? "Next" : "See your score"));
      if (i < n - 1) { await b.click(); await page.waitForTimeout(200); await start(page); }
      else {
        const rec = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), store(g) + "daily:" + todayIso());
        check(rec && rec.score === 0 && rec.results.length === n, g + ": score saved before See your score");
        await b.click(); await page.waitForTimeout(2300);
      }
    }
    check(await page.$eval(".big", e => e.textContent.trim().startsWith("0")), g + ": results show 0");
    check(await page.$eval(".status", e => e.textContent.includes("Saved as your score for today")), g + ": results say saved for today");
    check(await page.evaluate(() => { const nx = document.getElementById("nextGame"), r = document.getElementById("randomBtn"); return nx ? nx.classList.contains("primary") && /^Next game · /.test(nx.textContent) : r.classList.contains("primary"); }), g + ": results lead with Next game, or random puzzles once all are played");
    await page.click("#shareBtn"); await page.waitForTimeout(200);
    check(await page.$eval("#shareBtn", b => /Copied|Share/.test(b.textContent)), g + ": Share works without a share sheet");
    await page.reload(); await page.waitForTimeout(400);
    check(await page.$("#shareBtn") !== null, g + ": reopening shows the results, not the puzzle");
    await page.click('a[data-go="past"]'); await page.waitForTimeout(400);
    check(await page.$$eval(".days a", a => a.length > 50) && await page.$eval(".days a.today .s", e => /0 \//.test(e.textContent)), g + ": past list shows today's score");
    await page.click("#helpBtn"); await page.waitForSelector("dialog#help[open]");
    check(await page.$eval("dialog#help h2", e => e.textContent === "How to play"), g + ": How to play opens");
    const timed = await page.$("#helpTimer");
    if (timed) { await page.click("#helpTimer"); check(await page.evaluate(() => localStorage.getItem(location.pathname.split("/").filter(Boolean).pop().replace(/-/g, "") + ":timer")) === "false", g + ": timer switch saves"); }
    await page.click("#helpClose");
    await page.goto(base + g + "/?practice"); await page.waitForTimeout(300); await start(page);
    check(await page.$eval(".daily b", e => e.textContent === "Random puzzles"), g + ": random puzzles open");
    await page.close();
  }
  const home = await open("");
  check(await home.$$eval(".games li", (l, n) => l.length === n, GAMES.length), "home shows " + GAMES.length + " cards");
  check(await home.$$eval(".games .state.done", (s, n) => s.length === n, GAMES.length), "home shows every game as played today");
  check(await home.$eval("a[href='snowball/'] .skills", e => e.textContent === "Growing words · Spotting the gap"), "home card carries the skills line");
  check(errors.length === 0, "no page errors" + (errors.length ? ": " + errors.slice(0, 3).join(" | ") : ""));
  done(srv, browser);
})();
