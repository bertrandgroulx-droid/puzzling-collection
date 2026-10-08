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

const ML = load("missing-link", "MISSING_LINK_PUZZLES");
for (const p of ML) {
  if (!letters(p.link)) bad("missing-link", "link must be capitals", p);
  if (!p.hint) bad("missing-link", "missing hint", p);
  if (!Array.isArray(p.clues) || p.clues.length !== 3) bad("missing-link", "needs exactly 3 clues", p);
  else for (const c of p.clues) if (!/^([A-Z]+ ?_|_ ?[A-Z]+)$/.test(c)) bad("missing-link", "clue must be like SUN_ or _HOUSE or FULL _", c);
}
dupes("missing-link", ML.map(p => p.link));

const M3 = load("minus-3", "MINUS_3_PUZZLES");
for (const p of M3) {
  if (!letters(p.start) || p.start.length !== 6) bad("minus-3", "start must be six capital letters", p);
  if (!Array.isArray(p.steps) || p.steps.length !== 3) { bad("minus-3", "needs exactly 3 steps", p); continue; }
  let w = p.start;
  for (const [clue, ans] of p.steps) {
    if (!clue) bad("minus-3", "missing clue", p);
    if (!letters(ans) || !oneRemoved(w, ans)) bad("minus-3", ans + " is not " + w + " with one letter removed", p);
    w = ans;
  }
}
dupes("minus-3", M3.map(p => p.start));

const AN = load("anagrams", "ANAGRAMS_PUZZLES");
for (const p of AN) {
  if (!letters(p.letters)) bad("anagrams", "letters must be capitals", p);
  if (!Array.isArray(p.clues) || p.clues.length !== 2 || !Array.isArray(p.answers) || p.answers.length !== 2) { bad("anagrams", "needs 2 clues and 2 answers", p); continue; }
  for (const a of p.answers) {
    if (!letters(a) || sorted(a) !== sorted(p.letters)) bad("anagrams", a + " does not use exactly the letters of " + p.letters, p);
    if (a === p.letters) bad("anagrams", "answer is the same as the scrambled word", p);
  }
  if (p.answers[0] === p.answers[1]) bad("anagrams", "both answers are the same", p);
}
dupes("anagrams", AN.map(p => p.letters));

const PO = load("plus-one", "PLUS_ONE_PUZZLES");
for (const p of PO) {
  if (!Array.isArray(p.clues) || p.clues.length !== 2 || !Array.isArray(p.answers) || p.answers.length !== 2) { bad("plus-one", "needs 2 clues and 2 answers", p); continue; }
  const [a, b] = p.answers;
  if (!letters(a) || !letters(b) || !oneRemoved(b, a)) bad("plus-one", b + " is not " + a + " with one letter added", p);
}
dupes("plus-one", PO.map(p => p.answers[0]));

const HH = load("hear-here", "HEAR_HERE_PUZZLES");
for (const p of HH) {
  if (!Array.isArray(p.clues) || p.clues.length !== 2 || !Array.isArray(p.answers) || p.answers.length !== 2) { bad("hear-here", "needs 2 clues and 2 answers", p); continue; }
  const [a, b] = p.answers;
  if (!letters(a) || !letters(b)) bad("hear-here", "answers must be capitals", p);
  if (a === b) bad("hear-here", "the two spellings are the same", p);
}
dupes("hear-here", HH.map(p => p.answers[0]));

const SO = load("swap-one", "SWAP_ONE_PUZZLES");
for (const p of SO) {
  if (!letters(p.start) || p.start.length !== 4) bad("swap-one", "start must be four capital letters", p);
  if (!Array.isArray(p.steps) || p.steps.length !== 3) { bad("swap-one", "needs exactly 3 steps", p); continue; }
  let w = p.start;
  for (const [clue, ans] of p.steps) {
    if (!clue) bad("swap-one", "missing clue", p);
    if (!letters(ans) || !oneSwapped(w, ans)) bad("swap-one", ans + " is not " + w + " with one letter changed", p);
    w = ans;
  }
}
dupes("swap-one", SO.map(p => p.start));

const SP = load("shared-property", "SHARED_PROPERTY_PUZZLES");
for (const p of SP) {
  if (!Array.isArray(p.words) || p.words.length !== 3) bad("shared-property", "needs exactly 3 words", p);
  if (!p.answer) bad("shared-property", "missing answer", p);
  if (!Array.isArray(p.wrong) || p.wrong.length !== 3) bad("shared-property", "needs exactly 3 wrong options", p);
  else if (p.wrong.includes(p.answer)) bad("shared-property", "the answer is also listed as wrong", p);
}
dupes("shared-property", SP.map(p => (p.words || []).join(",")));

const MU = load("mash-ups", "MASH_UPS_PUZZLES");
for (const p of MU) {
  if (!Array.isArray(p.clues) || p.clues.length !== 2 || !Array.isArray(p.parts) || p.parts.length !== 2) { bad("mash-ups", "needs 2 clues and 2 parts", p); continue; }
  const [a, b] = p.parts;
  let ok = false;
  for (let k = 1; k < Math.min(a.length, b.length); k++) if (a.endsWith(b.slice(0, k)) && a + b.slice(k) === p.answer) ok = true;
  if (!letters(p.answer) || !ok) bad("mash-ups", p.answer + " is not " + a + " and " + b + " blended where they overlap", p);
}
dupes("mash-ups", MU.map(p => p.answer));

console.log([["Missing Link", ML], ["Minus 3", M3], ["Anagrams", AN], ["Plus One", PO], ["Hear, Here", HH], ["Swap One", SO], ["Shared Property", SP], ["Mash-Ups", MU]].map(([n, l]) => n + ": " + l.length + " puzzles").join("\n"));
console.log(problems ? problems + " problem(s) found." : "All puzzle files look good.");
process.exit(problems ? 1 : 0);
