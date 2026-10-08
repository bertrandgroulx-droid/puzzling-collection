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
  const PAST_DAYS = 100;
  let cfg = null, schedules = {}, pending = {}, current = null, store = "";

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
      s.src = "daily-" + y + ".js";
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

  // ---- settings ----
  function timerOn() { return read("timer", true) !== false; }

  // ---- labels ----
  function label(meta) {
    if (!meta || meta.mode !== "daily") return "Practice";
    return "No. " + meta.number + " · " + fmtShort(meta.date);
  }
  function setDailyLine(text, linkText, linkHref) {
    $("dailyText").innerHTML = text;
    const a = $("pastLink"); a.textContent = linkText; a.href = linkHref;
  }

  // ---- screens ----
  function showGame(show) {
    document.querySelectorAll("[data-game-ui]").forEach(el => { el.hidden = !show; });
    $("shell").hidden = show;
  }
  function shellHTML(html) { showGame(false); $("shell").innerHTML = html; window.scrollTo(0, 0); }

  function startGame(meta) {
    current = meta;
    history.replaceState(null, "", meta.mode === "daily" ? "?daily=" + meta.iso : "?practice");
    if (meta.mode === "daily") setDailyLine("<b>Daily No. " + meta.number + "</b> · " + esc(fmtShort(meta.date)), "Past puzzles", "?past");
    else setDailyLine("<b>Practice</b> · random puzzles", "Today’s puzzle", "./");
    if (cfg.timed) return startCard(meta);
    showGame(true);
    cfg.onStart(meta);
    window.scrollTo(0, 0);
    maybeHelp();
  }

  // Timed games show one card before the clock can start, so the rules are read first.
  function startCard(meta) {
    const t = cfg.timed;
    shellHTML('<div class="card"><small>' + (meta.mode === "daily" ? "Today’s puzzle · No. " + meta.number : "Practice") + "</small>" +
      "<b>" + esc(t.title) + "</b><p>" + esc(t.rules) + "</p>" +
      '<label class="toggle"><span>Timer<small>Off means no clock and no penalties</small></span><input type="checkbox" id="timerToggle" role="switch"' + (timerOn() ? " checked" : "") + "></label>" +
      '<button class="primary" id="startBtn" type="button">Start</button></div>');
    $("timerToggle").onchange = e => write("timer", e.target.checked);
    $("startBtn").onclick = () => { showGame(true); cfg.onStart(meta); window.scrollTo(0, 0); };
    $("startBtn").focus();
    maybeHelp();
  }

  function showPast() {
    current = null;
    history.replaceState(null, "", "?past");
    const t = today(), years = [t.getFullYear()];
    if (dayOfYear(t) <= PAST_DAYS) years.push(t.getFullYear() - 1);
    setDailyLine("<b>Past puzzles</b> · the previous " + PAST_DAYS + " days", "Today’s puzzle", "./");
    Promise.all(years.map(loadYear)).then(() => {
      const rows = [];
      for (let i = 0; i <= PAST_DAYS; i++) {
        const d = addDays(t, -i), set = setFor(d);
        if (!set) continue;
        const r = recordOf(set.iso);
        rows.push('<li><a href="?daily=' + set.iso + '" data-daily="' + set.iso + '"' + (i === 0 ? ' class="today"' : "") + '><span class="n">No. ' + set.number + '</span><span class="d">' + (i === 0 ? "Today, " : "") + esc(fmtTiny(d)) + (d.getFullYear() !== t.getFullYear() ? ", " + d.getFullYear() : "") + '</span><span class="s' + (r ? " done" : "") + '">' + (r ? r.score + " / " + r.max : "Not played") + "</span></a></li>");
      }
      shellHTML('<p class="lead">Each day has its own set, numbered by the day of the year. Your score is kept beside any you have played.</p>' +
        (rows.length ? '<ul class="days">' + rows.join("") + "</ul>" : '<p class="note">No daily puzzles are set up for this year yet.</p>') +
        '<div class="row"><a class="quiet btn" href="?practice">Practice with random puzzles</a><a class="quiet btn" href="../">All games</a></div>');
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
    const meta = res.meta, head = cfg.title + " " + (meta && meta.mode === "daily" ? "No. " + meta.number + " · " + fmtTiny(meta.date) : "practice");
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

  function showResults(res) {
    const meta = res.meta, daily = meta && meta.mode === "daily";
    current = null;
    if (daily) { history.replaceState(null, "", "?daily=" + meta.iso); setDailyLine("<b>Daily No. " + meta.number + "</b> · " + esc(fmtShort(meta.date)), "Past puzzles", "?past"); }
    else { history.replaceState(null, "", "?practice"); setDailyLine("<b>Practice</b> · random puzzles", "Today’s puzzle", "./"); }
    const ratio = res.score / res.max;
    const verdict = ratio === 1 ? "A perfect game." : ratio >= 0.7 ? "A strong game." : ratio >= 0.4 ? "A fair game." : (daily ? "A tough one. Tomorrow’s is different." : "A tough one. The next set is different.");
    const saved = daily ? (res.first ? "Saved as your score for " + (meta.iso === iso(today()) ? "today" : "this day") + "." : "Your first score for this puzzle is the one that is kept.") : "Practice scores are not saved.";
    const pips = res.results.map(r => '<span class="pip ' + (r === cfg.max ? "full" : r > 0 ? "half" : "zero") + '"></span>').join("");
    shellHTML('<div class="pips" aria-hidden="true">' + pips + "</div>" +
      '<div class="big">' + res.score + " <small>/ " + res.max + "</small></div>" +
      '<p class="lead">' + verdict + "</p>" +
      '<p class="status ' + (daily && res.first ? "good" : "note") + '">' + saved + "</p>" +
      '<ul class="recap">' + res.recap.map(r => "<li><span>" + esc(r[0]) + "</span><span>" + r[1] + (r[1] === 1 ? " pt" : " pts") + "</span></li>").join("") + "</ul>" +
      '<div class="row"><button class="primary" id="shareBtn" type="button">Share</button><a class="btn" href="?past">Past puzzles</a></div>' +
      '<div class="row"><button class="quiet" id="againBtn" type="button">' + (daily ? "Play it again" : "Play again") + '</button><a class="quiet btn" href="' + (daily ? "?practice" : "./") + '">' + (daily ? "Practice" : "Today’s puzzle") + "</a></div>");
    $("shareBtn").onclick = () => share(res, $("shareBtn"));
    $("againBtn").onclick = () => startGame(daily ? meta : { mode: "practice" });
    $("shell").querySelector('a[href="?past"]').onclick = e => { e.preventDefault(); showPast(); };
    $("shareBtn").focus();
  }

  // ---- How to play ----
  function buildHelp() {
    const h = cfg.how;
    $("help").innerHTML = "<h2>How to play</h2>" +
      '<p class="goal">' + esc(h.goal) + "</p>" +
      "<ul>" + h.steps.map(s => "<li>" + s + "</li>").join("") + "</ul>" +
      (h.example ? '<div class="example">' + h.example + "</div>" : "") +
      (cfg.timed ? '<h3>Settings</h3><div class="settings"><label class="toggle"><span>Timer<small>Off means no clock and no penalties. Applies from the next puzzle.</small></span><input type="checkbox" id="helpTimer" role="switch"></label></div>' : "") +
      '<div class="foot"><a href="../">All games</a><button class="primary" id="helpClose" type="button">Got it</button></div>';
    if ($("helpTimer")) $("helpTimer").onchange = e => { write("timer", e.target.checked); const t = $("timerToggle"); if (t) t.checked = e.target.checked; };
    $("helpClose").onclick = () => { $("help").close(); write("help-seen", true); };
  }
  function showHelp() {
    if ($("helpTimer")) $("helpTimer").checked = timerOn();
    $("help").showModal();
  }
  function maybeHelp() { if (!read("help-seen", false)) { showHelp(); } }

  window.Shell = {
    init(settings) {
      cfg = settings;
      store = cfg.game.replace(/-/g, "") + ":";
      buildHelp();
      $("helpBtn").onclick = showHelp;
      $("pastLink").onclick = e => { if ($("pastLink").getAttribute("href") === "?past") { e.preventDefault(); showPast(); } };
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
      showResults(Object.assign({ first }, res));
    },
    timerOn, label, showPast, showHelp, current: () => current
  };
})();
