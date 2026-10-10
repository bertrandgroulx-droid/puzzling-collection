// Builds the daily puzzle schedule for one year, for every game.
//
//   node tools/make-daily.js 2027
//   node tools/make-daily.js 2026 --refresh
//
// --refresh is for when puzzles have been added part way through a year: days up to and
// including today keep exactly the sets they had (so past scores still match), and every
// day after today is dealt again from the full, larger list.
//
// Writes <game>/daily-2027.js for each game: one line per day of the year, listing that
// day's puzzles by key. Each day is a different set, and a puzzle comes round again only
// after every other puzzle has had a turn. A year that already has a schedule is left
// alone, so past daily puzzles never change; add --force to rebuild it anyway.
const fs = require("fs"), path = require("path");
const { KEYS, GLOBALS, PER_GAME } = require("../shared/keys.js");
const root = path.join(__dirname, "..");
const year = Number(process.argv[2]);
const force = process.argv.includes("--force");
const refresh = process.argv.includes("--refresh");
if (!year || year < 2000 || year > 2200) { console.log("Usage: node tools/make-daily.js <year>"); process.exit(1); }
const days = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;

// A small seeded random number generator, so the same inputs always give the same schedule.
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(list, rand) { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function loadPuzzles(game) {
  const window = {};
  new Function("window", fs.readFileSync(path.join(root, game, "puzzles.js"), "utf8"))(window);
  return window[GLOBALS[game]] || [];
}

function schedule(game, keys, seed) {
  const per = PER_GAME[game], rand = rng(hash(year + ":" + game + (seed || "")));
  const sets = [], seen = new Set();
  let pool = [];
  while (sets.length < days) {
    // Deal from a shuffled deck; when it runs low, add a fresh shuffle whose first cards
    // do not repeat what is left of the old deck.
    if (pool.length < per) {
      let next = shuffle(keys, rand);
      for (let tries = 0; tries < 50 && next.slice(0, per).some(k => pool.includes(k)); tries++) next = shuffle(keys, rand);
      pool = pool.concat(next);
    }
    const set = pool.splice(0, per);
    const id = set.slice().sort().join("|");
    if (seen.has(id)) { pool.push(set[0]); pool.unshift(...set.slice(1)); continue; } // extremely rare: nudge and retry
    seen.add(id); sets.push(set);
  }
  return sets;
}

for (const game of Object.keys(KEYS)) {
  const file = path.join(root, game, "daily-" + year + ".js");
  if (fs.existsSync(file) && !force && !refresh) { console.log(game + ": daily-" + year + ".js already exists, left as is"); continue; }
  const puzzles = loadPuzzles(game).filter(p => !p.retired), keys = puzzles.map(KEYS[game]);
  if (keys.length < PER_GAME[game] * 2) { console.log(game + ": too few puzzles to schedule"); continue; }
  let sets, kept = 0;
  if (refresh && fs.existsSync(file)) {
    // Keep every day up to today; deal the rest afresh, avoiding what the last few kept days used.
    const w = {}; new Function("window", fs.readFileSync(file, "utf8"))(w);
    const old = (w.DAILY_SCHEDULE || {})[year] || [];
    const now = new Date(), todayIndex = year < now.getFullYear() ? days : year > now.getFullYear() ? 0 : Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(year, 0, 1)) / 864e5) + 1;
    kept = Math.min(todayIndex, old.length);
    const recent = new Set(old.slice(Math.max(0, kept - 3), kept).flat());
    let fresh = null;
    for (let attempt = 0; attempt < 200; attempt++) {
      const candidate = schedule(game, keys, ":refresh" + attempt).slice(kept);
      if (!candidate.length || !candidate[0].some(k => recent.has(k))) { fresh = candidate; break; }
    }
    sets = old.slice(0, kept).concat(fresh || schedule(game, keys, ":refresh").slice(kept));
  } else sets = schedule(game, keys);
  const lines = sets.map((s, i) => {
    const d = new Date(year, 0, i + 1);
    const label = d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
    return "  " + JSON.stringify(s) + (i < sets.length - 1 ? "," : "") + "  // " + (i + 1) + " · " + label;
  });
  const out = "// Daily puzzle schedule for " + year + ". Made by: node tools/make-daily.js " + year + (kept ? " --refresh (days 1 to " + kept + " kept from the earlier schedule)" : "") + "\n" +
    "// One line per day. Day 1 is January 1. Each puzzle is named by its key (see shared/keys.js).\n" +
    "// Do not edit by hand: past days should stay as they were.\n" +
    "window.DAILY_SCHEDULE = window.DAILY_SCHEDULE || {};\n" +
    "window.DAILY_SCHEDULE[" + year + "] = [\n" + lines.join("\n") + "\n];\n";
  fs.writeFileSync(file, out);
  console.log(game + ": wrote daily-" + year + ".js with " + sets.length + " days from " + keys.length + " puzzles" + (kept ? " (kept days 1 to " + kept + ")" : ""));
}
