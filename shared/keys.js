// How each game identifies a puzzle. The daily schedules refer to puzzles by these keys,
// so a puzzle keeps its place in past daily sets even if the list is reordered.
// Used by the game pages (in the browser) and by the tools (in Node).
(function (root) {
  const KEYS = {
    "common-thread": p => String(p.link).toUpperCase(),
    "whittle": p => String(p.start).toUpperCase(),
    "tumble": p => String(p.letters).toUpperCase(),
    "stowaway": p => String(p.answers[0]).toUpperCase(),
    "soundalike": p => String(p.answers[0]).toUpperCase(),
    "switcheroo": p => String(p.start).toUpperCase(),
    "three-of-a-kind": p => p.words.map(w => String(w).toUpperCase()).join(","),
    "splice": p => String(p.answer).toUpperCase()
  };
  const GLOBALS = {
    "common-thread": "COMMON_THREAD_PUZZLES", "whittle": "WHITTLE_PUZZLES", "tumble": "TUMBLE_PUZZLES",
    "stowaway": "STOWAWAY_PUZZLES", "soundalike": "SOUNDALIKE_PUZZLES", "switcheroo": "SWITCHEROO_PUZZLES",
    "three-of-a-kind": "THREE_OF_A_KIND_PUZZLES", "splice": "SPLICE_PUZZLES"
  };
  const PER_GAME = { "common-thread": 5, "whittle": 4, "tumble": 5, "stowaway": 5, "soundalike": 5, "switcheroo": 4, "three-of-a-kind": 5, "splice": 5 };
  const out = { KEYS, GLOBALS, PER_GAME };
  if (typeof module !== "undefined" && module.exports) module.exports = out; else root.PUZZLE_KEYS = out;
})(this);
