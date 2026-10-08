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
  { start: "TALL", steps: [["It holds up the roof", "WALL"], ["To go on foot", "WALK"], ["To speak", "TALK"]] },
  { start: "LOVE", steps: [["To be alive", "LIVE"], ["Draw one with a ruler", "LINE"], ["One ring of a chain", "LINK"]] },
  { start: "FARM", steps: [["A document with blanks to fill in", "FORM"], ["You eat with it", "FORK"], ["It plugs a wine bottle", "CORK"]] },
  { start: "MOTH", steps: [["Sums and numbers at school", "MATH"], ["A long soak in the tub", "BATH"], ["A trail to walk along", "PATH"]] },
  { start: "FIRE", steps: [["To give someone a job", "HIRE"], ["To put out of sight", "HIDE"], ["Left or right", "SIDE"]] },
  { start: "WOLF", steps: [["A game with clubs and holes", "GOLF"], ["A large bay", "GULF"], ["To swallow fast", "GULP"]] },
  { start: "RACE", steps: [["A grain eaten with curry", "RICE"], ["Pleasant", "NICE"], ["Three times three", "NINE"]] },
  { start: "DUCK", steps: [["Where a ship ties up", "DOCK"], ["A key opens it", "LOCK"], ["To use your eyes", "LOOK"]] },
  { start: "SEAT", steps: [["To defeat", "BEAT"], ["Baked, on toast", "BEAN"], ["Unkind", "MEAN"]] },
  { start: "SHIP", steps: [["You buy things in it", "SHOP"], ["To cut with an axe", "CHOP"], ["A fried slice of potato", "CHIP"]] },
  { start: "COAT", steps: [["It floats", "BOAT"], ["A tall shoe", "BOOT"], ["The part of a plant underground", "ROOT"]] },
  { start: "LEAF", steps: [["Bread baked in one piece", "LOAF"], ["A heavy burden", "LOAD"], ["Cars drive on it", "ROAD"]] },
  { start: "SNOW", steps: [["A performance", "SHOW"], ["Not fast", "SLOW"], ["A narrow opening for coins", "SLOT"]] },
  { start: "GAME", steps: [["It swings open in a fence", "GATE"], ["After the agreed time", "LATE"], ["A big pool of fresh water", "LAKE"]] },
  { start: "HOPE", steps: [["A thick cord", "ROPE"], ["A thorny flower", "ROSE"], ["You smell with it", "NOSE"]] },
  { start: "DEEP", steps: [["A woodland animal with antlers", "DEER"], ["A cold drink by the pint", "BEER"], ["A red root vegetable", "BEET"]] },
  { start: "SALT", steps: [["Grain used for brewing", "MALT"], ["A shopping centre", "MALL"], ["It bounces", "BALL"]] },
  { start: "KING", steps: [["Worn on a finger", "RING"], ["Where you skate", "RINK"], ["Dishes are washed in it", "SINK"]] },
  { start: "TENT", steps: [["An exam", "TEST"], ["A bird builds it", "NEST"], ["Where the sun sets", "WEST"]] },
  { start: "CAKE", steps: [["To look after", "CARE"], ["The middle of an apple", "CORE"], ["A greater amount", "MORE"]] },
  { start: "PEAR", steps: [["A big furry animal", "BEAR"], ["A bird's mouth", "BEAK"], ["The top of a mountain", "PEAK"]] },
  { start: "JUMP", steps: [["It pushes up water", "PUMP"], ["A rubbish tip", "DUMP"], ["Slightly wet", "DAMP"]] },
  { start: "WAVE", steps: [["A hollow in a cliff", "CAVE"], ["A bird is kept in it", "CAGE"], ["One side of a sheet in a book", "PAGE"]] },
  { start: "TREE", steps: [["Costing nothing", "FREE"], ["To run away", "FLEE"], ["A tiny jumping pest", "FLEA"]] },
  { start: "GIRL", steps: [["A fish breathes with it", "GILL"], ["A seaside bird", "GULL"], ["Boring", "DULL"]] },
  { start: "MOST", steps: [["Soft green growth on stones", "MOSS"], ["The person in charge", "BOSS"], ["The opposite of a win", "LOSS"]] },
  { start: "STAR", steps: [["A mark left by a wound", "SCAR"], ["To fly high", "SOAR"], ["You wash with it", "SOAP"]] }
];
