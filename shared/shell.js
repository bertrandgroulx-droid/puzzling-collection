// The shell every Puzzling game runs inside. It owns everything around the puzzle itself:
// which puzzle is showing (today's, a past day, or practice), the Past puzzles list,
// the How to play panel with its settings, the results screen, sharing, and saved scores.
//
// A game page calls Shell.init({...}) once. The shell opens straight into today's puzzle
// (or today's results if it was already played) and calls onStart(meta) when a game should
// begin: meta.mode is "daily" (with meta.items, meta.number, meta.date) or "practice".
// When the game ends it calls Shell.finish({ score, max, results, recap, meta }).
//
// Daily schedules live in <game>/daily-<year>.js and are loaded when needed.
(function () {
  const $ = id => document.getElementById(id);
  // The version this page was loaded with, read from this script's own ?v= (see tools/stamp.js).
  const SELF = document.currentScript ? document.currentScript.src : "";
  const VERSION = SELF ? (new URL(SELF).searchParams.get("v") || "") : "";
  const PAST_DAYS = 100;
  let cfg = null, schedules = {}, pending = {}, current = null, store = "", busy = false;

  const pad = n => String(n).padStart(2, "0");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parseIso = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  const dayOfYear = d => Math.round((d - new Date(d.getFullYear(), 0, 1)) / 864e5) + 1;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const fmtLong = d => d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const fmtShort = d => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const fmtTiny = d => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function read(key, fallback) { try { const v = localStorage.getItem(store + key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } }
  function write(key, value) { try { localStorage.setItem(store + key, JSON.stringify(value)); } catch (e) {} }

  // ---- schedules ----
  function loadYear(y) {
    if (schedules[y] !== undefined) return Promise.resolve(schedules[y]);
    if (pending[y]) return pending[y];
    pending[y] = new Promise(resolve => {
      const s = document.createElement("script");
      s.src = "daily-" + y + ".js" + (VERSION ? "?v=" + VERSION : "");
      s.onload = () => { schedules[y] = (window.DAILY_SCHEDULE || {})[y] || null; resolve(schedules[y]); };
      s.onerror = () => { schedules[y] = null; resolve(null); };
      document.head.appendChild(s);
    });
    return pending[y];
  }
  function keyOf(p) { return window.PUZZLE_KEYS.KEYS[cfg.game](p); }
  function setFor(date) {
    const list = schedules[date.getFullYear()];
    if (!list) return null;
    const n = dayOfYear(date), keys = list[n - 1];
    if (!keys) return null;
    const byKey = {}; cfg.puzzles.forEach(p => { byKey[keyOf(p)] = p; });
    const items = keys.map(k => byKey[k]).filter(Boolean);
    if (items.length !== keys.length) return null;
    return { mode: "daily", date, iso: iso(date), number: n, items };
  }
  const recordOf = isoDate => read("daily:" + isoDate, null);
  function streak() {
    const t = today();
    let d = recordOf(iso(t)) ? t : addDays(t, -1), n = 0;
    while (recordOf(iso(d))) { n++; d = addDays(d, -1); }
    return n;
  }

  // ---- settings ----
  function timerOn() { return read("timer", true) !== false; }

  // ---- labels ----
  function label(meta) {
    if (!meta || meta.mode !== "daily") return "Random puzzles";
    return "No. " + meta.number + " · " + fmtShort(meta.date);
  }
  // The line under the title: what is showing, and links to the other two places to go.
  const PLACES = {
    today: ["Today’s puzzle", "./", () => openToday()],
    past: ["Past puzzles", "?past", () => showPast()],
    random: ["Random puzzles", "?practice", () => startGame({ mode: "practice" })]
  };
  function setDailyLine(text, places) {
    $("dailyText").innerHTML = text;
    $("links").innerHTML = places.map(k => '<a href="' + PLACES[k][1] + '" data-go="' + k + '">' + PLACES[k][0] + "</a>").join("");
    bindPlaces($("links"));
  }
  function bindPlaces(root) {
    root.querySelectorAll("[data-go]").forEach(a => { a.onclick = e => { e.preventDefault(); PLACES[a.dataset.go][2](); }; });
  }
  const lineFor = meta => meta && meta.mode === "daily" ? "<b>Daily No. " + meta.number + "</b> · " + esc(fmtShort(meta.date)) : "<b>Random puzzles</b>";

  // ---- screens ----
  function showGame(show) {
    document.querySelectorAll("[data-game-ui]").forEach(el => { el.hidden = !show; });
    $("shell").hidden = show;
  }
  function shellHTML(html) { showGame(false); $("shell").classList.remove("reveal"); $("shell").innerHTML = html; window.scrollTo(0, 0); }

  function startGame(meta) {
    current = meta;
    history.replaceState(null, "", meta.mode === "daily" ? "?daily=" + meta.iso : "?practice");
    setDailyLine(lineFor(meta), meta.mode === "daily" ? ["past", "random"] : ["today", "past"]);
    if (cfg.timed) return startCard(meta);
    showGame(true);
    busy = true;
    cfg.onStart(meta);
    window.scrollTo(0, 0);
    maybeHelp();
  }

  // Timed games show one card before the clock can start, so the rules are read first.
  function startCard(meta) {
    const t = cfg.timed;
    shellHTML('<div class="card"><small>' + (meta.mode === "daily" ? "Today’s puzzle · No. " + meta.number : "Random puzzles") + "</small>" +
      "<b>" + esc(t.title) + "</b><p>" + esc(t.rules) + "</p>" +
      '<label class="toggle"><span>Timer<small>Off means no clock and no penalties</small></span><input type="checkbox" id="timerToggle" role="switch"' + (timerOn() ? " checked" : "") + "></label>" +
      '<button class="primary" id="startBtn" type="button">Start</button></div>');
    $("timerToggle").onchange = e => write("timer", e.target.checked);
    $("startBtn").onclick = () => { showGame(true); busy = true; cfg.onStart(meta); window.scrollTo(0, 0); };
    $("startBtn").focus();
    maybeHelp();
  }

  function showPast() {
    current = null; busy = false;
    history.replaceState(null, "", "?past");
    const t = today(), years = [t.getFullYear()];
    if (dayOfYear(t) <= PAST_DAYS) years.push(t.getFullYear() - 1);
    setDailyLine("<b>Past puzzles</b> · the previous " + PAST_DAYS + " days", ["today", "random"]);
    Promise.all(years.map(loadYear)).then(() => {
      const rows = [];
      for (let i = 0; i <= PAST_DAYS; i++) {
        const d = addDays(t, -i), set = setFor(d);
        if (!set) continue;
        const r = recordOf(set.iso);
        rows.push('<li><a href="?daily=' + set.iso + '" data-daily="' + set.iso + '"' + (i === 0 ? ' class="today"' : "") + '><span class="n">No. ' + set.number + '</span><span class="d">' + (i === 0 ? "Today, " : "") + esc(fmtTiny(d)) + (d.getFullYear() !== t.getFullYear() ? ", " + d.getFullYear() : "") + '</span><span class="s' + (r ? " done" : "") + '">' + (r ? r.score + " / " + r.max : "Not played") + "</span></a></li>");
      }
      shellHTML('<p class="lead">Each day has its own set, numbered by the day of the year. Your score is kept beside any you have played. Tap a day to play it.</p>' +
        '<div class="row"><a class="btn" href="?practice" data-go="random">Play random puzzles instead</a></div>' +
        (rows.length ? '<ul class="days">' + rows.join("") + "</ul>" : '<p class="note">No daily puzzles are set up for this year yet.</p>') +
        '<div class="row"><a class="quiet btn" href="../">All games</a></div>');
      bindPlaces($("shell"));
      $("shell").querySelectorAll("[data-daily]").forEach(a => { a.onclick = e => { e.preventDefault(); openDate(a.dataset.daily); }; });
    });
  }

  // A day that has already been played opens on its results; Play it again starts it over.
  function openDate(isoDate) {
    const d = parseIso(isoDate);
    if (!d) return openToday();
    if (d > today()) return showPast();
    loadYear(d.getFullYear()).then(() => {
      const set = setFor(d);
      if (!set) return showPast();
      const r = recordOf(set.iso);
      if (r) return showResults(Object.assign({ meta: set, saved: true }, r));
      startGame(set);
    });
  }
  function openToday() {
    history.replaceState(null, "", "./");
    const t = today();
    loadYear(t.getFullYear()).then(() => {
      const set = setFor(t);
      if (!set) return startGame({ mode: "practice" });
      const r = recordOf(set.iso);
      if (r) return showResults(Object.assign({ meta: set, saved: true }, r));
      startGame(set);
    });
  }

  // ---- results ----
  function squares(results, max) { return results.map(r => r === max ? "🟩" : r > 0 ? "🟨" : "⬜").join(""); }
  function shareText(res) {
    const meta = res.meta, head = cfg.title + " " + (meta && meta.mode === "daily" ? "No. " + meta.number + " · " + fmtTiny(meta.date) : "random puzzles");
    const link = /^https?:$/.test(location.protocol) ? "\n" + location.origin + location.pathname : "";
    return head + "\n" + res.score + "/" + res.max + " " + squares(res.results, cfg.max) + link;
  }
  function share(res, btn) {
    const text = shareText(res);
    const done = () => { btn.textContent = "Copied"; setTimeout(() => { btn.textContent = "Share"; }, 1600); };
    if (navigator.share) { navigator.share({ text }).catch(() => {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallback(text));
    else fallback(text);
    function fallback(t) { const ta = document.createElement("textarea"); ta.value = t; ta.readOnly = true; ta.style.cssText = "width:100%;margin-top:8px;font:inherit;font-size:0.85rem;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink)"; btn.parentNode.insertAdjacentElement("afterend", ta); ta.select(); }
  }

  function showResults(res, animate) {
    const meta = res.meta, daily = meta && meta.mode === "daily";
    busy = !daily;
    current = null;
    history.replaceState(null, "", daily ? "?daily=" + meta.iso : "?practice");
    setDailyLine(lineFor(meta), daily ? ["past", "random"] : ["today", "past"]);
    const ratio = res.score / res.max;
    const verdict = ratio === 1 ? "A perfect game." : ratio >= 0.7 ? "A strong game." : ratio >= 0.4 ? "A fair game." : (daily ? "A tough one. Tomorrow’s is different." : "A tough one. The next set is different.");
    const saved = daily ? (res.first ? "Saved as your score for " + (meta.iso === iso(today()) ? "today" : "this day") + "." : "Your first score for this puzzle is the one that is kept.") : "Random puzzle scores are not saved.";
    const pips = res.results.map((r, i) => '<span class="pip ' + (r === cfg.max ? "full" : r > 0 ? "half" : "zero") + '" style="animation-delay:' + (0.15 + i * 0.2) + 's"></span>').join("");
    const run = daily && meta.iso === iso(today()) ? streak() : 0;
    shellHTML('<div class="pips" aria-hidden="true">' + pips + "</div>" +
      '<div class="big"><span id="scoreNum">' + res.score + "</span> <small>/ " + res.max + "</small></div>" +
      '<p class="lead">' + verdict + "</p>" +
      (run >= 2 ? '<p class="streakRow"><span class="streak">' + run + " days in a row</span></p>" : "") +
      '<p class="status ' + (daily && res.first ? "good" : "note") + '">' + saved + "</p>" +
      '<ul class="recap">' + res.recap.map(r => "<li><span>" + esc(r[0]) + "</span><span>" + r[1] + (r[1] === 1 ? " pt" : " pts") + "</span></li>").join("") + "</ul>" +
      '<button class="primary" id="randomBtn" type="button">' + (daily ? "Play random puzzles" : "More random puzzles") + "</button>" +
      '<div class="row"><button id="shareBtn" type="button">Share</button><a class="btn" href="?past" data-go="past">Past puzzles</a></div>' +
      '<div class="row">' + (daily ? '<button class="quiet" id="againBtn" type="button">Play it again</button>' : '<a class="quiet btn" href="./" data-go="today">Today’s puzzle</a>') + "</div>");
    $("randomBtn").onclick = () => startGame({ mode: "practice" });
    $("shareBtn").onclick = () => share(res, $("shareBtn"));
    if ($("againBtn")) $("againBtn").onclick = () => startGame(meta);
    bindPlaces($("shell"));
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (animate && !reduce) {
      $("shell").classList.add("reveal");
      $("shell").style.setProperty("--after", (0.3 + res.results.length * 0.2) + "s");
      const el = $("scoreNum"), total = res.score, ms = Math.max(400, Math.min(1200, res.results.length * 200)), t0 = performance.now();
      el.textContent = "0";
      (function tick() { const f = Math.min(1, (performance.now() - t0) / ms); el.textContent = Math.round(f * total); if (f < 1) requestAnimationFrame(tick); })();
    }
    $("randomBtn").focus();
  }

  // ---- How to play ----
  function buildHelp() {
    const h = cfg.how;
    $("help").innerHTML = "<h2>How to play</h2>" +
      '<p class="goal">' + esc(h.goal) + "</p>" +
      "<ul>" + h.steps.map(s => "<li>" + s + "</li>").join("") + "</ul>" +
      (h.example ? '<div class="example">' + h.example + "</div>" : "") +
      (cfg.timed ? '<h3>Settings</h3><div class="settings"><label class="toggle"><span>Timer<small>Off means no clock and no penalties. Applies from the next puzzle.</small></span><input type="checkbox" id="helpTimer" role="switch"></label></div>' : "") +
      '<p class="credit">Inspired by <i>That’s Puzzling!</i> on CBC Radio’s <i>The Sunday Magazine</i>. Not affiliated with CBC.</p>' +
      '<div class="foot"><a href="../">All games</a><button class="primary" id="helpClose" type="button">Got it</button></div>' +
      (VERSION ? '<p class="ver">Version ' + esc(VERSION) + "</p>" : "");
    if ($("helpTimer")) $("helpTimer").onchange = e => { write("timer", e.target.checked); const t = $("timerToggle"); if (t) t.checked = e.target.checked; };
    $("helpClose").onclick = () => { $("help").close(); write("help-seen", true); const w = $("welcome"); if (w) w.remove(); };
  }
  function showHelp() {
    if ($("helpTimer")) $("helpTimer").checked = timerOn();
    $("help").showModal();
  }
  // A first visit gets a short welcome card above the puzzle instead of a pop-up: the goal in one
  // line, the example, and a Got it link. The How to play button still opens the full panel.
  function maybeHelp() {
    if (read("help-seen", false) || $("welcome")) return;
    const h = cfg.how, card = document.createElement("div");
    card.id = "welcome"; card.className = "welcome";
    card.innerHTML = "<b>First time? Here is the idea</b><p>" + esc(h.goal) + "</p>" + (h.example ? '<div class="example">' + h.example + "</div>" : "") +
      '<button class="link" id="welcomeClose" type="button">Got it</button>';
    $("shell").insertAdjacentElement("beforebegin", card);
    $("welcomeClose").onclick = () => { write("help-seen", true); card.remove(); };
  }

  // ---- staying up to date ----
  // A phone can keep an old copy of a game for a while, or bring back a tab without reloading it.
  // When the game is opened or brought back to the front, ask the site which version is current;
  // if it is newer and no puzzle is under way, reload. Each new version is tried once per tab,
  // so a page still being served from a cache can never loop.
  function checkForUpdate() {
    if (!VERSION || !window.fetch || busy) return;
    fetch(new URL("version.json", SELF).href + "?t=" + Date.now(), { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (!j || !j.v || j.v === VERSION || busy) return;
        let tried = null; try { tried = sessionStorage.getItem("puzzling:reloaded-for"); } catch (e) {}
        if (tried === j.v) return;
        try { sessionStorage.setItem("puzzling:reloaded-for", j.v); } catch (e) {}
        location.reload();
      })
      .catch(() => {});
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkForUpdate(); });
  window.addEventListener("pageshow", e => { if (e.persisted) checkForUpdate(); });

  // Give up asks for a second tap, so a stray touch cannot end a puzzle.
  function confirmGiveUp(btn, fn) {
    let armed = 0;
    btn.onclick = () => {
      if (armed) { clearTimeout(armed); armed = 0; btn.textContent = "Give up"; btn.classList.remove("confirm"); fn(); return; }
      btn.textContent = "Tap again to give up"; btn.classList.add("confirm");
      armed = setTimeout(() => { armed = 0; btn.textContent = "Give up"; btn.classList.remove("confirm"); }, 3000);
    };
  }

  window.Shell = {
    init(settings) {
      cfg = settings;
      store = cfg.game.replace(/-/g, "") + ":";
      checkForUpdate();
      buildHelp();
      $("helpBtn").onclick = showHelp;
      const q = new URLSearchParams(location.search);
      if (q.has("past")) return showPast();
      if (q.has("practice")) return startGame({ mode: "practice" });
      if (q.get("daily")) return openDate(q.get("daily"));
      openToday();
    },
    finish(res) {
      const meta = res.meta;
      let first = false;
      if (meta && meta.mode === "daily" && !recordOf(meta.iso)) { write("daily:" + meta.iso, { score: res.score, max: res.max, results: res.results, recap: res.recap, at: Date.now() }); first = true; }
      showResults(Object.assign({ first }, res), true);
    },
    timerOn, label, showPast, showHelp, confirmGiveUp, streak, current: () => current
  };
})();
