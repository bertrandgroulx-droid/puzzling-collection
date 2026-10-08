// Anagrams puzzles.
//
// Each puzzle has:
//   letters - the scrambled word shown on the tiles, in capitals
//   clues   - two clues: the first for the main word, the second for the bonus word
//   answers - the two answers, in the same order. Both must use exactly the letters above.
//
// Every game picks five of these at random. All puzzles must be original.

window.ANAGRAMS_PUZZLES = [
  { letters: "HEART", clues: ["The ground beneath you", "Bonus: someone full of dislike"], answers: ["EARTH", "HATER"] },
  { letters: "NOTES", clues: ["A rock", "Bonus: the start of something"], answers: ["STONE", "ONSET"] },
  { letters: "PARSE", clues: ["A weapon you throw", "Bonus: an extra one, kept in reserve"], answers: ["SPEAR", "SPARE"] },
  { letters: "SKATE", clues: ["A cut of beef", "Bonus: a wooden post"], answers: ["STEAK", "STAKE"] },
  { letters: "REACT", clues: ["A wooden shipping box", "Bonus: to follow a trail"], answers: ["CRATE", "TRACE"] },
  { letters: "ANGEL", clues: ["Measured in degrees", "Bonus: to gather, bit by bit"], answers: ["ANGLE", "GLEAN"] },
  { letters: "TEAMS", clues: ["It rises from a kettle", "Bonus: friends, in Britain"], answers: ["STEAM", "MATES"] },
  { letters: "SMILE", clues: ["Green citrus fruits", "Bonus: long distances"], answers: ["LIMES", "MILES"] },
  { letters: "BELOW", clues: ["The joint in your arm", "Bonus: part of the gut"], answers: ["ELBOW", "BOWEL"] },
  { letters: "SPOTS", clues: ["Comes to a halt", "Bonus: fence uprights"], answers: ["STOPS", "POSTS"] },
  { letters: "LEAST", clues: ["To take what is not yours", "Bonus: grey rock used for roofing"], answers: ["STEAL", "SLATE"] },
  { letters: "STARE", clues: ["Prices", "Bonus: they fall when you cry"], answers: ["RATES", "TEARS"] },
  { letters: "NAILS", clues: ["A slow creature with a shell", "Bonus: killed, in old stories"], answers: ["SNAIL", "SLAIN"] },
  { letters: "PALES", clues: ["Jumps", "Bonus: a slip, or a gap in time"], answers: ["LEAPS", "LAPSE"] },
  { letters: "LAMPS", clues: ["Tropical trees, or parts of your hands", "Bonus: a song from the Bible"], answers: ["PALMS", "PSALM"] },
  { letters: "SHEAR", clues: ["To divide between people", "Bonus: long-eared animals like big rabbits"], answers: ["SHARE", "HARES"] },
  { letters: "WEIRD", clues: ["Connected by cables", "Bonus: broader"], answers: ["WIRED", "WIDER"] },
  { letters: "COAST", clues: ["Mexican food in folded shells", "Bonus: winter outerwear"], answers: ["TACOS", "COATS"] },
  { letters: "POOLS", clues: ["Thread is wound onto it", "Bonus: circles in a rope"], answers: ["SPOOL", "LOOPS"] },
  { letters: "ITEMS", clues: ["Occasions", "Bonus: tiny bugs"], answers: ["TIMES", "MITES"] },
  { letters: "LOVES", clues: ["To work out a puzzle", "Bonus: small mouse-like animals"], answers: ["SOLVE", "VOLES"] },
  { letters: "DEALS", clues: ["Goes in front", "Bonus: valleys"], answers: ["LEADS", "DALES"] },
  { letters: "FLOWS", clues: ["Farm birds", "Bonus: eats greedily"], answers: ["FOWLS", "WOLFS"] },
  { letters: "BAKER", clues: ["It slows a car", "Bonus: to snap in two"], answers: ["BRAKE", "BREAK"] },
  { letters: "GROAN", clues: ["It is played in church", "Bonus: a gas used in light bulbs"], answers: ["ORGAN", "ARGON"] },
  { letters: "ROBES", clues: ["Not drunk", "Bonus: dull people"], answers: ["SOBER", "BORES"] },
  { letters: "PETAL", clues: ["You eat from it", "Bonus: jumped, in the past"], answers: ["PLATE", "LEAPT"] },
  { letters: "RESIN", clues: ["A loud warning sound", "Bonus: to wash with water"], answers: ["SIREN", "RINSE"] },
  { letters: "STRAP", clues: ["Pieces", "Bonus: they catch animals"], answers: ["PARTS", "TRAPS"] },
  { letters: "IDEAS", clues: ["Out of the way", "Bonus: helpers"], answers: ["ASIDE", "AIDES"] },
  { letters: "EARLY", clues: ["One thickness of something", "Bonus: a race run in stages"], answers: ["LAYER", "RELAY"] },
  { letters: "VERSE", clues: ["To hand out food", "Bonus: to cut through"], answers: ["SERVE", "SEVER"] },
  { letters: "ALERT", clues: ["To change", "Bonus: afterwards"], answers: ["ALTER", "LATER"] },
  { letters: "SHAPE", clues: ["A stage", "Bonus: piles"], answers: ["PHASE", "HEAPS"] },
  { letters: "CARES", clues: ["To frighten", "Bonus: running contests"], answers: ["SCARE", "RACES"] },
  { letters: "HEATS", clues: ["Hurry", "Bonus: dislikes strongly"], answers: ["HASTE", "HATES"] },
  { letters: "NAMES", clues: ["Methods", "Bonus: the hair on lions' necks"], answers: ["MEANS", "MANES"] },
  { letters: "TRIES", clues: ["Rows, one above another", "Bonus: ceremonies"], answers: ["TIERS", "RITES"] },
  { letters: "SPACE", clues: ["Steps", "Bonus: cloaks"], answers: ["PACES", "CAPES"] },
  { letters: "BEAST", clues: ["Rhythms", "Bonus: to spoon juices over a roast"], answers: ["BEATS", "BASTE"] },
  { letters: "DIETS", clues: ["The sea's daily rise and fall", "Bonus: corrects text"], answers: ["TIDES", "EDITS"] },
  { letters: "SWEAR", clues: ["Has on, as clothes", "Bonus: goods for sale"], answers: ["WEARS", "WARES"] }
];
