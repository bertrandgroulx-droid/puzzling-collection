// Daily puzzles: the menu each game opens on, the schedule lookup, and the saved scores.
//
// A game page calls Daily.init({ game, puzzles, per, onStart }). The menu offers today's
// puzzle, practice (random puzzles), and the previous 100 days. Choosing one calls
// onStart(meta): meta.mode is "daily" (with meta.items, meta.date, meta.number) or "practice".
// When a daily game ends the game calls Daily.record(meta, score, max).
// Schedules live in <game>/daily-<year>.js and are loaded when needed.
(function () {
  const $ = id => document.getElementById(id);
  const PAST_DAYS = 100;
  let cfg = null, schedules = {}, pending = {}, current = null;

  const pad = n => String(n).padStart(2, "0");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parseIso = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  const dayOfYear = d => Math.round((d - new Date(d.getFullYear(), 0, 1)) / 864e5) + 1;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const fmtLong = d => d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const fmtShort = d => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  // Load <game>/daily-<year>.js once. Resolves to the year's list, or null if there is none.
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
    if (items.length !== keys.length) return null;   // a puzzle named in the schedule is missing
    return { mode: "daily", date, iso: iso(date), number: n, year: date.getFullYear(), items };
  }

  const storeKey = d => "daily:" + cfg.game + ":" + d;
  function getRecord(isoDate) { try { return JSON.parse(localStorage.getItem(storeKey(isoDate))); } catch (e) { return null; } }
  function saveRecord(isoDate, rec) { try { localStorage.setItem(storeKey(isoDate), JSON.stringify(rec)); } catch (e) {} }

  function label(meta) {
    if (!meta || meta.mode !== "daily") return "Practice";
    return "No. " + meta.number + " · " + fmtShort(meta.date) + ", " + meta.date.getFullYear();
  }

  function showGameUi(show) {
    document.querySelectorAll("[data-game-ui]").forEach(el => { el.hidden = !show; });
    const menu = $("menu"); if (menu) menu.hidden = show;
    const back = $("backLink");
    if (back) {
      back.textContent = show ? "← Puzzles" : "← All games";
      back.href = show ? "./" : "../";
      back.onclick = show ? e => { e.preventDefault(); showMenu(); } : null;
    }
    const line = $("modeLine"); if (line) line.hidden = !show;
  }

  function start(meta) {
    current = meta;
    history.replaceState(null, "", meta.mode === "daily" ? "?daily=" + meta.iso : "?practice");
    showGameUi(true);
    const line = $("modeLine");
    if (line) line.textContent = meta.mode === "daily" ? "Daily puzzle " + label(meta) : "Practice · random puzzles";
    cfg.onStart(meta);
    window.scrollTo(0, 0);
  }

  function showMenu(notice) {
    current = null;
    history.replaceState(null, "", location.pathname);
    const t = today(), menu = $("menu");
    const years = [t.getFullYear()];
    if (dayOfYear(t) <= PAST_DAYS) years.push(t.getFullYear() - 1);
    Promise.all(years.map(loadYear)).then(() => {
      const todaySet = setFor(t), rec = todaySet && getRecord(todaySet.iso);
      let h = notice ? '<p class="msg bad">' + esc(notice) + "</p>" : "";
      h += '<div class="daycard">';
      if (todaySet) {
        h += '<small>Today · No. ' + todaySet.number + "</small><b>" + esc(fmtLong(t)) + "</b>" +
          "<span>" + cfg.per + " puzzles. Everyone gets the same set today.</span>" +
          (rec ? '<span class="done">Played · ' + rec.score + " / " + rec.max + "</span>" : "") +
          '<button class="primary" id="playToday" type="button">' + (rec ? "Play it again" : "Play today's puzzle") + "</button>";
      } else {
        h += "<small>Today</small><b>" + esc(fmtLong(t)) + "</b><span>No daily puzzle is set up for " + t.getFullYear() + " yet. Practice still works.</span>";
      }
      h += "</div>";
      h += '<button class="ghost" id="playPractice" type="button">Practice with random puzzles</button>';
      const rows = [];
      for (let i = 1; i <= PAST_DAYS; i++) {
        const d = addDays(t, -i), set = setFor(d);
        if (!set) continue;
        const r = getRecord(set.iso);
        rows.push('<li><a href="?daily=' + set.iso + '" data-daily="' + set.iso + '"><span class="n">No. ' + set.number + '</span><span class="d">' + esc(fmtShort(d)) + (d.getFullYear() !== t.getFullYear() ? ", " + d.getFullYear() : "") + '</span><span class="s' + (r ? " done" : "") + '">' + (r ? r.score + " / " + r.max : "Not played") + "</span></a></li>");
      }
      if (rows.length) h += "<h2>Past " + rows.length + " days</h2><ul class=\"days\">" + rows.join("") + "</ul>";
      menu.innerHTML = h;
      showGameUi(false);
      if ($("playToday")) $("playToday").onclick = () => start(todaySet);
      $("playPractice").onclick = () => start({ mode: "practice" });
      menu.querySelectorAll("[data-daily]").forEach(a => { a.onclick = e => { e.preventDefault(); openDate(a.dataset.daily); }; });
    });
  }

  function openDate(isoDate) {
    const d = parseIso(isoDate);
    if (!d) return showMenu();
    if (d > today()) return showMenu("That puzzle is not out yet. Come back on " + fmtShort(d) + ".");
    loadYear(d.getFullYear()).then(() => {
      const set = setFor(d);
      if (!set) return showMenu("There is no daily puzzle for " + fmtShort(d) + ", " + d.getFullYear() + ".");
      start(set);
    });
  }

  window.Daily = {
    init(settings) {
      cfg = settings;
      const q = new URLSearchParams(location.search);
      if (q.has("practice")) return start({ mode: "practice" });
      if (q.get("daily")) return openDate(q.get("daily"));
      showMenu();
    },
    // Save a finished daily game. The first score for a day is the one that is kept.
    record(meta, score, max) {
      if (!meta || meta.mode !== "daily") return false;
      if (getRecord(meta.iso)) return false;
      saveRecord(meta.iso, { score, max, at: Date.now() });
      return true;
    },
    label, showMenu, current: () => current
  };
})();
