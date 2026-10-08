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
  { link: "LINE",  hint: "Draw one with a ruler.",              clues: ["CLOTHES_", "SKY_", "OUT_"] }
];
