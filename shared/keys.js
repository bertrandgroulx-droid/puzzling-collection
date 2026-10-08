// How each game identifies a puzzle. The daily schedules refer to puzzles by these keys,
// so a puzzle keeps its place in past daily sets even if the list is reordered.
// Used by the game pages (in the browser) and by the tools (in Node).
(function (root) {
  const KEYS = {
    "missing-link": p => String(p.link).toUpperCase(),
    "minus-3": p => String(p.start).toUpperCase(),
    "anagrams": p => String(p.letters).toUpperCase(),
    "plus-one": p => String(p.answers[0]).toUpperCase(),
    "hear-here": p => String(p.answers[0]).toUpperCase(),
    "swap-one": p => String(p.start).toUpperCase(),
    "shared-property": p => p.words.map(w => String(w).toUpperCase()).join(","),
    "mash-ups": p => String(p.answer).toUpperCase()
  };
  const GLOBALS = {
    "missing-link": "MISSING_LINK_PUZZLES", "minus-3": "MINUS_3_PUZZLES", "anagrams": "ANAGRAMS_PUZZLES",
    "plus-one": "PLUS_ONE_PUZZLES", "hear-here": "HEAR_HERE_PUZZLES", "swap-one": "SWAP_ONE_PUZZLES",
    "shared-property": "SHARED_PROPERTY_PUZZLES", "mash-ups": "MASH_UPS_PUZZLES"
  };
  const PER_GAME = { "missing-link": 5, "minus-3": 4, "anagrams": 5, "plus-one": 5, "hear-here": 5, "swap-one": 4, "shared-property": 5, "mash-ups": 5 };
  const out = { KEYS, GLOBALS, PER_GAME };
  if (typeof module !== "undefined" && module.exports) module.exports = out; else root.PUZZLE_KEYS = out;
})(this);
