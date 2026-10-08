// Missing Link puzzles.
//
// To add a puzzle, copy one of the lines below and change the words.
// Each puzzle has:
//   link   - the answer, in capitals
//   hint   - one short sentence shown when the player asks for a hint
//   clues  - three clue words. Write an underscore where the link word goes:
//              "SUN_"     means the link comes after  (SUN + LIGHT = SUNLIGHT)
//              "_HOUSE"   means the link comes before (LIGHT + HOUSE = LIGHTHOUSE)
//              "FULL _"   a space next to the underscore makes a two-word phrase (FULL MOON)
//              "_ TIE"    same idea, link first (BOW TIE)
//
// Every game picks five of these at random, so the more puzzles here the longer
// it takes before a player sees a repeat. All puzzles must be original.

window.MISSING_LINK_PUZZLES = [
  { link: "LIGHT", hint: "You flip a switch to get it.",        clues: ["SUN_", "FLASH_", "_HOUSE"] },
  { link: "BALL",  hint: "It bounces.",                         clues: ["SNOW_", "FOOT_", "_ROOM"] },
  { link: "FISH",  hint: "It swims.",                           clues: ["STAR_", "GOLD_", "_BOWL"] },
  { link: "DAY",   hint: "It lasts twenty-four hours.",         clues: ["BIRTH_", "_LIGHT", "_DREAM"] },
  { link: "NAIL",  hint: "A hammer drives it in.",              clues: ["FINGER_", "TOE_", "_ POLISH"] },
  { link: "BACK",  hint: "The opposite of front.",              clues: ["PAPER_", "_YARD", "_PACK"] },
  { link: "TEA",   hint: "It is brewed from leaves.",           clues: ["_SPOON", "_CUP", "_TIME"] },
  { link: "WORM",  hint: "The early bird catches it.",          clues: ["BOOK_", "EARTH_", "_HOLE"] },
  { link: "WORK",  hint: "What you do to earn a wage.",         clues: ["FIRE_", "HOME_", "_SHOP"] },
  { link: "BOW",   hint: "You tie one on a gift.",              clues: ["RAIN_", "CROSS_", "_ TIE"] },
  { link: "FALL",  hint: "The season after summer.",            clues: ["WATER_", "RAIN_", "_OUT"] },
  { link: "BAG",   hint: "You carry groceries in it.",          clues: ["HAND_", "SAND_", "_PIPE"] },
  { link: "BOARD", hint: "A flat length of wood.",              clues: ["KEY_", "CUP_", "_WALK"] },
  { link: "MOON",  hint: "It orbits the Earth.",                clues: ["HONEY_", "FULL _", "_LIGHT"] },
  { link: "STONE", hint: "A rock small enough to hold.",        clues: ["SAND_", "MILE_", "_WALL"] },
  { link: "BOOK",  hint: "You read it.",                        clues: ["NOTE_", "COOK_", "_SHELF"] },
  { link: "FIRE",  hint: "It burns.",                           clues: ["CAMP_", "WILD_", "_PLACE"] },
  { link: "WATER", hint: "You drink it.",                       clues: ["SALT_", "_PROOF", "_MELON"] },
  { link: "HORSE", hint: "You can ride it.",                    clues: ["SEA_", "_SHOE", "_POWER"] },
  { link: "PAPER", hint: "You write on it.",                    clues: ["NEWS_", "WALL_", "_CLIP"] },
  { link: "SHIP",  hint: "It sails.",                           clues: ["FRIEND_", "_WRECK", "_MATE"] },
  { link: "SNOW",  hint: "It falls in winter.",                 clues: ["_FLAKE", "_MAN", "_BOARD"] },
  { link: "HEAD",  hint: "It sits on your shoulders.",          clues: ["FORE_", "_ACHE", "_LINE"] },
  { link: "HAND",  hint: "It has five fingers.",                clues: ["SECOND_", "_SHAKE", "_WRITING"] },
  { link: "BOX",   hint: "Usually made of cardboard.",          clues: ["MAIL_", "TOOL_", "_ OFFICE"] },
  { link: "EYE",   hint: "You see with it.",                    clues: ["_BROW", "_LID", "_BALL"] },
  { link: "DOG",   hint: "It barks.",                           clues: ["HOT _", "WATCH_", "SHEEP_"] },
  { link: "ROOM",  hint: "Four walls and a door.",              clues: ["BED_", "BATH_", "_ SERVICE"] },
  { link: "CAKE",  hint: "Blow out the candles on it.",         clues: ["CHEESE_", "PAN_", "CUP_"] },
  { link: "STICK", hint: "A thin piece of wood.",               clues: ["LIP_", "CHOP_", "YARD_"] },
  { link: "FLY",   hint: "What birds do.",                      clues: ["BUTTER_", "DRAGON_", "_WHEEL"] },
  { link: "TIME",  hint: "Clocks measure it.",                  clues: ["LIFE_", "LUNCH_", "_TABLE"] },
  { link: "WOOD",  hint: "Trees are made of it.",               clues: ["DRIFT_", "_PECKER", "_LAND"] },
  { link: "BIRD",  hint: "It has feathers.",                    clues: ["BLACK_", "_CAGE", "_SEED"] },
  { link: "PLAY",  hint: "Children do it at recess.",           clues: ["_GROUND", "_PEN", "FAIR _"] },
  { link: "LINE",  hint: "Draw one with a ruler.",              clues: ["CLOTHES_", "SKY_", "OUT_"] },
  { link: "CAR",   hint: "You drive it.",                       clues: ["SIDE_", "_POOL", "_ SEAT"] },
  { link: "HOUSE", hint: "You live in it.",                     clues: ["GREEN_", "TREE_", "_BOAT"] },
  { link: "MAN",   hint: "A grown-up boy.",                     clues: ["POST_", "_HOLE", "_KIND"] },
  { link: "SUN",   hint: "It shines by day.",                   clues: ["_RISE", "_FLOWER", "_GLASSES"] },
  { link: "RAIN",  hint: "It falls from clouds.",               clues: ["_COAT", "_DROP", "_ CHECK"] },
  { link: "STAR",  hint: "It twinkles at night.",               clues: ["SUPER_", "MOVIE _", "_DUST"] },
  { link: "SEA",   hint: "Ships sail on it.",                   clues: ["_SHELL", "_WEED", "_SICK"] },
  { link: "ICE",   hint: "Frozen water.",                       clues: ["_BERG", "_ CREAM", "_ CUBE"] },
  { link: "SHOE",  hint: "You wear it on your foot.",           clues: ["_LACE", "_BOX", "_MAKER"] },
  { link: "KEY",   hint: "It opens a lock.",                    clues: ["_HOLE", "_CHAIN", "_ RING"] },
  { link: "BELL",  hint: "It rings.",                           clues: ["DOOR_", "COW_", "_BOY"] },
  { link: "MILK",  hint: "It comes from cows.",                 clues: ["_SHAKE", "_MAN", "BUTTER_"] },
  { link: "TOOTH", hint: "A dentist looks after it.",           clues: ["_BRUSH", "_PASTE", "SWEET _"] },
  { link: "BED",   hint: "You sleep in it.",                    clues: ["FLOWER_", "_BUG", "_SPREAD"] },
  { link: "POT",   hint: "You cook soup in it.",                clues: ["JACK_", "_LUCK", "_ ROAST"] },
  { link: "GAME",  hint: "You are playing one now.",            clues: ["BOARD _", "VIDEO _", "_ SHOW"] },
  { link: "CHAIR", hint: "You sit on it.",                      clues: ["ARM_", "WHEEL_", "HIGH_"] },
  { link: "BOOT",  hint: "A tall shoe.",                        clues: ["_LEG", "_STRAP", "_ CAMP"] },
  { link: "GOLD",  hint: "A precious yellow metal.",            clues: ["_MINE", "_SMITH", "_ RUSH"] },
  { link: "TRAP",  hint: "It catches animals.",                 clues: ["MOUSE_", "_DOOR", "SPEED _"] },
  { link: "WIND",  hint: "It blows.",                           clues: ["_MILL", "_SHIELD", "WHIRL_"] },
  { link: "SIDE",  hint: "Left or right.",                      clues: ["_ EFFECT", "BED_", "OUT_"] },
  { link: "LAND",  hint: "The opposite of sea.",                clues: ["_MARK", "_LORD", "WONDER_"] },
  { link: "HEART", hint: "It pumps blood.",                     clues: ["_BEAT", "_BREAK", "SWEET_"] },
  { link: "SHOP",  hint: "You buy things in it.",               clues: ["_KEEPER", "_LIFT", "PET _"] },
  { link: "WALL",  hint: "It holds up the roof.",               clues: ["SEA_", "FIRE_", "_FLOWER"] },
  { link: "PAN",   hint: "You fry an egg in it.",               clues: ["SAUCE_", "DUST_", "FRYING _"] },
  { link: "TRACK", hint: "Trains run on it.",                   clues: ["RACE_", "SOUND_", "_ SUIT"] }
];
