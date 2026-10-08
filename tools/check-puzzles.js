// Checks every puzzles.js for mistakes in the mechanics. Run: node tools/check-puzzles.js
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
let problems = 0;
const bad = (game, what, p) => { problems++; console.log("  PROBLEM in " + game + ": " + what + "  " + JSON.stringify(p)); };
function load(folder, name) {
  const window = {};
  new Function("window", fs.readFileSync(path.join(root, folder, "puzzles.js"), "utf8"))(window);
  const list = window[name];
  if (!Array.isArray(list)) { bad(folder, "puzzles.js does not define window." + name, null); return []; }
  return list;
}
const letters = s => typeof s === "string" && /^[A-Z]+$/.test(s);
const sorted = s => s.split("").sort().join("");
const oneRemoved = (a, b) => b.length === a.length - 1 && [...a].some((_, i) => a.slice(0, i) + a.slice(i + 1) === b);
const oneSwapped = (a, b) => a.length === b.length && [...a].filter((c, i) => c !== b[i]).length === 1;
function dupes(game, keys) { const seen = new Set(); for (const k of keys) { if (seen.has(k)) bad(game, "appears twice: " + k, null); seen.add(k); } }

const ML = load("common-thread", "COMMON_THREAD_PUZZLES");
for (const p of ML) {
  if (!letters(p.link)) bad("common-thread", "link must be capitals", p);
  if (!p.hint) bad("common-thread", "missing hint", p);
  if (!Array.isArray(p.clues) || p.clues.length !== 3) bad("common-thread", "needs exactly 3 clues", p);
  else for (const c of p.clues) if (!/^([A-Z]+ ?_|_ ?[A-Z]+)$/.test(c)) bad("common-thread", "clue must be like SUN_ or _HOUSE or FULL _", c);
}
dupes("common-thread", ML.map(p => p.link));

const M3 = load("whittle", "WHITTLE_PUZZLES");
for (const p of M3) {
  if (!letters(p.start) || p.start.length !== 6) bad("whittle", "start must be six capital letters", p);
  if (!Array.isArray(p.steps) || p.steps.length !== 3) { bad("whittle", "needs exactly 3 steps", p); continue; }
  let w = p.start;
  for (const [clue, ans] of p.steps) {
    if (!clue) bad("whittle", "missing clue", p);
    if (!letters(ans) || !oneRemoved(w, ans)) bad("whittle", ans + " is not " + w + " with one letter removed", p);
    w = ans;
  }
}
dupes("whittle", M3.map(p => p.start));

const AN = load("tumble", "TUMBLE_PUZZLES");
for (const p of AN) {
  if (!letters(p.letters)) bad("tumble", "letters must be capitals", p);
  if (!Array.isArray(p.clues) || p.clues.length !== 2 || !Array.isArray(p.answers) || p.answers.length !== 2) { bad("tumble", "needs 2 clues and 2 answers", p); continue; }
  for (const a of p.answers) {
    if (!letters(a) || sorted(a) !== sorted(p.letters)) bad("tumble", a + " does not use exactly the letters of " + p.letters, p);
    if (a === p.letters) bad("tumble", "answer is the same as the scrambled word", p);
  }
  if (p.answers[0] === p.answers[1]) bad("tumble", "both answers are the same", p);
}
dupes("tumble", AN.map(p => p.letters));

const PO = load("stowaway", "STOWAWAY_PUZZLES");
for (const p of PO) {
  if (!Array.isArray(p.clues) || p.clues.length !== 2 || !Array.isArray(p.answers) || p.answers.length !== 2) { bad("stowaway", "needs 2 clues and 2 answers", p); continue; }
  const [a, b] = p.answers;
  if (!letters(a) || !letters(b) || !oneRemoved(b, a)) bad("stowaway", b + " is not " + a + " with one letter added", p);
}
dupes("stowaway", PO.map(p => p.answers[0]));

const HH = load("soundalike", "SOUNDALIKE_PUZZLES");
for (const p of HH) {
  if (!Array.isArray(p.clues) || p.clues.length !== 2 || !Array.isArray(p.answers) || p.answers.length !== 2) { bad("soundalike", "needs 2 clues and 2 answers", p); continue; }
  const [a, b] = p.answers;
  if (!letters(a) || !letters(b)) bad("soundalike", "answers must be capitals", p);
  if (a === b) bad("soundalike", "the two spellings are the same", p);
}
dupes("soundalike", HH.map(p => p.answers[0]));

const SO = load("switcheroo", "SWITCHEROO_PUZZLES");
for (const p of SO) {
  if (!letters(p.start) || p.start.length !== 4) bad("switcheroo", "start must be four capital letters", p);
  if (!Array.isArray(p.steps) || p.steps.length !== 3) { bad("switcheroo", "needs exactly 3 steps", p); continue; }
  let w = p.start;
  for (const [clue, ans] of p.steps) {
    if (!clue) bad("switcheroo", "missing clue", p);
    if (!letters(ans) || !oneSwapped(w, ans)) bad("switcheroo", ans + " is not " + w + " with one letter changed", p);
    w = ans;
  }
}
dupes("switcheroo", SO.map(p => p.start));

const SP = load("three-of-a-kind", "THREE_OF_A_KIND_PUZZLES");
for (const p of SP) {
  if (!Array.isArray(p.words) || p.words.length !== 3) bad("three-of-a-kind", "needs exactly 3 words", p);
  if (!p.answer) bad("three-of-a-kind", "missing answer", p);
  if (!Array.isArray(p.wrong) || p.wrong.length !== 3) bad("three-of-a-kind", "needs exactly 3 wrong options", p);
  else if (p.wrong.includes(p.answer)) bad("three-of-a-kind", "the answer is also listed as wrong", p);
}
dupes("three-of-a-kind", SP.map(p => (p.words || []).join(",")));

const MU = load("splice", "SPLICE_PUZZLES");
for (const p of MU) {
  if (!Array.isArray(p.clues) || p.clues.length !== 2 || !Array.isArray(p.parts) || p.parts.length !== 2) { bad("splice", "needs 2 clues and 2 parts", p); continue; }
  const [a, b] = p.parts;
  let ok = false;
  for (let k = 1; k < Math.min(a.length, b.length); k++) if (a.endsWith(b.slice(0, k)) && a + b.slice(k) === p.answer) ok = true;
  if (!letters(p.answer) || !ok) bad("splice", p.answer + " is not " + a + " and " + b + " blended where they overlap", p);
}
dupes("splice", MU.map(p => p.answer));

// Anagram sets that use the same letters as another set are also duplicates.
dupes("anagrams (same letters)", AN.map(p => sorted(p.letters || "")));

// Daily schedules: every <game>/daily-<year>.js must name real puzzles, one set per day, all different.
const { KEYS } = require("../shared/keys.js");
const allLists = { "common-thread": ML, "whittle": M3, "tumble": AN, "stowaway": PO, "soundalike": HH, "switcheroo": SO, "three-of-a-kind": SP, "splice": MU };
const PER = { "common-thread": 5, "whittle": 4, "tumble": 5, "stowaway": 5, "soundalike": 5, "switcheroo": 4, "three-of-a-kind": 5, "splice": 5 };
const yearsFound = {};
for (const game of Object.keys(allLists)) {
  const keys = new Set(allLists[game].map(KEYS[game]));
  for (const f of fs.readdirSync(path.join(root, game)).filter(f => /^daily-\d{4}\.js$/.test(f))) {
    const year = Number(f.slice(6, 10));
    const window = { DAILY_SCHEDULE: {} };
    new Function("window", fs.readFileSync(path.join(root, game, f), "utf8"))(window);
    const list = window.DAILY_SCHEDULE[year];
    const want = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
    if (!Array.isArray(list)) { bad(game + "/" + f, "does not define a schedule for " + year, null); continue; }
    if (list.length !== want) bad(game + "/" + f, "has " + list.length + " days, expected " + want, null);
    const seen = new Set();
    list.forEach((set, i) => {
      if (!Array.isArray(set) || set.length !== PER[game]) return bad(game + "/" + f, "day " + (i + 1) + " should list " + PER[game] + " puzzles", set);
      if (new Set(set).size !== set.length) bad(game + "/" + f, "day " + (i + 1) + " repeats a puzzle", set);
      for (const k of set) if (!keys.has(k)) bad(game + "/" + f, "day " + (i + 1) + " names a puzzle that is not in puzzles.js: " + k, null);
      const id = set.slice().sort().join("|");
      if (seen.has(id)) bad(game + "/" + f, "day " + (i + 1) + " is the same set as an earlier day", set);
      seen.add(id);
    });
    (yearsFound[year] = yearsFound[year] || []).push(game);
  }
}
for (const y of Object.keys(yearsFound).sort()) console.log("Daily schedule " + y + ": " + yearsFound[y].length + " of 8 games" + (yearsFound[y].length < 8 ? " (missing: " + Object.keys(allLists).filter(g => !yearsFound[y].includes(g)).join(", ") + ")" : ""));
if (!Object.keys(yearsFound).length) console.log("No daily schedules found. Make one with: node tools/make-daily.js <year>");

// Capacity: how many games each list can supply.
// "games before a repeat" = full games played before any puzzle comes round again.
// "different games" = distinct sets of puzzles a game can be (order ignored).
const choose = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
const fmt = n => n.toLocaleString("en-CA");
const games = [["Common Thread", ML, 5], ["Whittle", M3, 4], ["Tumble", AN, 5], ["Stowaway", PO, 5], ["Soundalike", HH, 5], ["Switcheroo", SO, 4], ["Three of a Kind", SP, 5], ["Splice", MU, 5]];
console.log("Game              Puzzles  Per game  Games before a repeat  Different games");
for (const [n, l, k] of games) console.log(n.padEnd(18) + String(l.length).padStart(7) + String(k).padStart(10) + String(Math.floor(l.length / k)).padStart(23) + fmt(choose(l.length, k)).padStart(17));
console.log(problems ? problems + " problem(s) found." : "All puzzle files look good.");
process.exit(problems ? 1 : 0);
