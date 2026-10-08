// Swap One puzzles.
//
// Each puzzle has:
//   start - a four-letter word, in capitals
//   steps - three [clue, answer] pairs. Each answer changes exactly one letter of the
//           word before it, in any position.
//
// Every game picks four of these at random. All puzzles must be original.

window.SWAP_ONE_PUZZLES = [
  { start: "COLD", steps: [["A length of string", "CORD"], ["It comes in a deck", "CARD"], ["Not soft", "HARD"]] },
  { start: "WARM", steps: [["A hospital room", "WARD"], ["You are reading one", "WORD"], ["A nobleman", "LORD"]] },
  { start: "FISH", steps: [["You serve food on it", "DISH"], ["A short fast run", "DASH"], ["Paper money", "CASH"]] },
  { start: "BOOK", steps: [["To make a meal", "COOK"], ["Slightly cold", "COOL"], ["You swim in it", "POOL"]] },
  { start: "LAMP", steps: [["To walk unevenly", "LIMP"], ["A green citrus fruit", "LIME"], ["A clock tells it", "TIME"]] },
  { start: "MOON", steps: [["How you feel", "MOOD"], ["You eat it", "FOOD"], ["It goes in a shoe", "FOOT"]] },
  { start: "SAND", steps: [["It has five fingers", "HAND"], ["A group of musicians", "BAND"], ["To tie up", "BIND"]] },
  { start: "RAIN", steps: [["The most important", "MAIN"], ["Letters and parcels", "MAIL"], ["It catches the wind", "SAIL"]] },
  { start: "HEAD", steps: [["To get better after an injury", "HEAL"], ["The back of your foot", "HEEL"], ["To touch, or to sense", "FEEL"]] },
  { start: "MILK", steps: [["A smooth, shiny fabric", "SILK"], ["The ledge under a window", "SILL"], ["To exchange for money", "SELL"]] },
  { start: "BARK", steps: [["With no light", "DARK"], ["A small arrow thrown at a board", "DART"], ["A piece of something", "PART"]] },
  { start: "GOLD", steps: [["Brave", "BOLD"], ["It fastens with a nut", "BOLT"], ["Worn around the waist", "BELT"]] },
  { start: "WIND", steps: [["Made from grapes", "WINE"], ["Belonging to me", "MINE"], ["A fresh-tasting herb", "MINT"]] },
  { start: "SOCK", steps: [["A stone", "ROCK"], ["A chess piece shaped like a castle", "ROOK"], ["Four walls and a door", "ROOM"]] },
  { start: "PINK", steps: [["An evergreen tree", "PINE"], ["A heap", "PILE"], ["Just over 1.6 kilometres", "MILE"]] },
  { start: "CORN", steps: [["A bull has two", "HORN"], ["Came into the world", "BORN"], ["Where hay is stored", "BARN"]] },
  { start: "TALL", steps: [["It holds up the roof", "WALL"], ["To go on foot", "WALK"], ["To speak", "TALK"]] }
];
