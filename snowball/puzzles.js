// Snowball puzzles.
//
// Each puzzle has:
//   start - a three-letter word, in capitals
//   steps - three [clue, answer] pairs. Each answer is the word before it with one letter
//           added anywhere and the other letters kept in order (MAN, MANE, MANGE, MANAGE).
//
// Every game picks four of these at random. All puzzles must be original.
//
// Rules for a chain: no step may simply add a plural S or a past-tense D or ED; no chain
// may be a Whittle chain backwards; a less common word is fine when its clue defines it.
// A chain marked retired: true is left out of random play and of any day scheduled from then on.
window.SNOWBALL_PUZZLES = [
  { start: "MAN", steps: [["The long hair on a horse's neck", "MANE"], ["A skin disease of dogs and foxes", "MANGE"], ["To run a shop or a team", "MANAGE"]] },
  { start: "EAT", steps: [["Warmth", "HEAT"], ["Open land covered in heather", "HEATH"], ["Being well, not ill", "HEALTH"]] },
  { start: "RAM", steps: [["To stuff in, or to study at the last minute", "CRAM"], ["The thick top of the milk", "CREAM"], ["A loud frightened cry", "SCREAM"]] },
  { start: "TOY", steps: [["A Conservative, in Canadian politics", "TORY"], ["A tale", "STORY"], ["Wild and windy", "STORMY"]] },
  { start: "HER", steps: [["What your ears do", "HEAR"], ["It pumps your blood", "HEART"], ["Warm and generous, as a welcome", "HEARTY"]] },
  { start: "FOR", steps: [["A golfer's shout of warning", "FORE"], ["To shape hot metal, or to fake a signature", "FORGE"], ["To fail to remember", "FORGET"]] },
  { start: "LIE", steps: [["A queue, or a row of writing", "LINE"], ["Cloth for tablecloths and sheets", "LINEN"], ["A tree with heart-shaped leaves", "LINDEN"]] },
  { start: "ASH", steps: [["A whip's strike, or an eyelash", "LASH"], ["A sudden burst of light", "FLASH"], ["Showy in a cheap way", "FLASHY"]] },
  { start: "WIT", steps: [["Alongside, or by means of", "WITH"], ["She rides a broomstick", "WITCH"], ["A small sudden jerk", "TWITCH"]] },
  { start: "EVE", steps: [["At any time", "EVER"], ["To cut off", "SEVER"], ["Very serious or harsh", "SEVERE"]] },
  { start: "WIN", steps: [["A bird flies with it", "WING"], ["Still unpaid", "OWING"], ["Moving a boat with oars", "ROWING"]] },
  { start: "FIN", steps: [["Very good, or a sum paid as a penalty", "FINE"], ["Thinner, or of better quality", "FINER"], ["Someone who locates what was lost", "FINDER"]] },
  { start: "ALL", steps: [["A friend in a war", "ALLY"], ["A narrow lane behind houses", "ALLEY"], ["A ship's kitchen", "GALLEY"]] },
  { start: "ALE", steps: [["Goods offered at a cut price", "SALE"], ["No longer fresh", "STALE"], ["A main food, or a bent wire that holds pages", "STAPLE"]] },
  { start: "RIG", steps: [["Worn on a finger", "RING"], ["To twist water out of a cloth", "WRING"], ["The cables in the walls of a house", "WIRING"]] },
  { start: "TIC", steps: [["A clock's sound, or a check mark", "TICK"], ["A thin piece of wood", "STICK"], ["Tacky to the touch", "STICKY"]] },
  { start: "HOE", steps: [["You water the garden with it", "HOSE"], ["Picked", "CHOSE"], ["To pick", "CHOOSE"]] },
  { start: "RUT", steps: [["The reddish crust on old iron", "RUST"], ["Faith in someone", "TRUST"], ["Reliable", "TRUSTY"]] },
  { start: "SIN", steps: [["To make music with your voice", "SING"], ["A seat on ropes in a playground", "SWING"], ["Cutting wood with a toothed blade", "SAWING"]] },
  { start: "EAR", steps: [["A British nobleman", "EARL"], ["Before the usual time", "EARLY"], ["Once a year", "YEARLY"]] },
  { start: "AGE", steps: [["Fury", "RAGE"], ["A mountain chain, or a stove", "RANGE"], ["A country house with its farm", "GRANGE"]] },
  { start: "PEA", steps: [["A fruit with a narrow top", "PEAR"], ["A gem that grows inside an oyster", "PEARL"], ["Pale and shimmering, like that gem", "PEARLY"]] },
  { start: "SEA", steps: [["Where two pieces of cloth are stitched", "SEAM"], ["It rises from a kettle", "STEAM"], ["Hot and damp, like a bathroom after a shower", "STEAMY"]] },
  { start: "PAT", steps: [["Gone by", "PAST"], ["A small meat pie, or unhealthily pale", "PASTY"], ["Pies, tarts and croissants", "PASTRY"]] },
  { start: "HAT", steps: [["To dislike strongly", "HATE"], ["Someone who dislikes everything", "HATER"], ["Alice met a mad one at a tea party", "HATTER"]] },
  { start: "RUE", steps: [["A cunning trick", "RUSE"], ["To wake someone up", "ROUSE"], ["A plump game bird, or to grumble", "GROUSE"]] },
  { start: "ORE", steps: [["A larger amount", "MORE"], ["The code of dots and dashes", "MORSE"], ["A small bite of food", "MORSEL"]] },
  { start: "ONE", steps: [["To sharpen a blade, or a skill", "HONE"], ["You talk into it", "PHONE"], ["Fake", "PHONEY"]] },
  { start: "EEL", steps: [["A spool for fishing line, or a lively dance", "REEL"], ["To enjoy yourself noisily", "REVEL"], ["To make known", "REVEAL"]] },
  { start: "NIP", steps: [["To cut with small quick strokes", "SNIP"], ["A long-billed wading bird, or to shoot from hiding", "SNIPE"], ["A marksman who shoots from hiding", "SNIPER"]] },
  { start: "OUT", steps: [["To praise something loudly to sell it", "TOUT"], ["A freshwater fish with speckles", "TROUT"], ["A trial to make the team", "TRYOUT"]] },
  { start: "PIN", steps: [["To turn round fast", "SPIN"], ["Your backbone", "SPINE"], ["Lying flat on your back", "SUPINE"]] },
  { start: "APE", steps: [["Sticky stuff on a roll", "TAPE"], ["A slim candle, or to narrow towards one end", "TAPER"], ["To meddle with something you shouldn't", "TAMPER"]] },
  { start: "ATE", steps: [["Speed, or a price per unit", "RATE"], ["Very angry", "IRATE"], ["A robber at sea", "PIRATE"]] },
  { start: "RIM", steps: [["Stiffly proper", "PRIM"], ["The best time of life, or the first coat of paint", "PRIME"], ["A first reading book, or an undercoat of paint", "PRIMER"]] },
  { start: "ACT", steps: [["Something known to be true", "FACT"], ["One flat face of a cut gem", "FACET"], ["A tap", "FAUCET"]] },
  { start: "SEW", steps: [["Meat and vegetables cooked slowly in a pot", "STEW"], ["To scatter about", "STREW"], ["Scattered about", "STREWN"]] },
  { start: "LID", steps: [["Moved smoothly along", "SLID"], ["A playground chute", "SLIDE"], ["A small burger, or a pitch that curves late", "SLIDER"]] },
  { start: "SKI", steps: [["To hop along, or to leave out", "SKIP"], ["To spend as little as possible", "SKIMP"], ["Too small to cover much, as a swimsuit", "SKIMPY"]] },
  { start: "SPA", steps: [["A ship's pole, or to practise boxing", "SPAR"], ["An extra kept in reserve", "SPARE"], ["Thinly spread", "SPARSE"]] },
  { start: "IRE", steps: [["A racehorse's father", "SIRE"], ["A church's pointed tower", "SPIRE"], ["To aim high", "ASPIRE"]] },
  { start: "ACE", steps: [["A running contest", "RACE"], ["A tiny amount, or to copy through thin paper", "TRACE"], ["A bullet that glows in flight", "TRACER"]] },
  { start: "MAT", steps: [["A friend, or a chess ending", "MATE"], ["Dull, not shiny, as paint", "MATTE"], ["What everything is made of, or a problem", "MATTER"]] },
  { start: "LED", steps: [["Ran away", "FLED"], ["Put away in a folder", "FILED"], ["Stopped before it could happen", "FOILED"]] },
  { start: "ODE", steps: [["A vein of metal in rock", "LODE"], ["A small country house, or to make a complaint", "LODGE"], ["Someone renting a room in your house", "LODGER"]] },
  { start: "ANT", steps: [["Your mother's sister", "AUNT"], ["That sister, fondly", "AUNTY"], ["Cheerful and confident", "JAUNTY"]] },
  { start: "BEE", steps: [["A sweet red root vegetable", "BEET"], ["A soft round flat cap", "BERET"], ["Sadly deprived of something", "BEREFT"]] },
  { start: "SEE", steps: [["Someone who foretells the future", "SEER"], ["An underground drain", "SEWER"], ["A long pin for grilling meat", "SKEWER"]] },
  { start: "FRY", steps: [["Wild anger", "FURY"], ["Covered in soft hair", "FURRY"], ["A brief fall of snow", "FLURRY"]] },
  { start: "WOE", steps: [["Had on, as clothes", "WORE"], ["Less good", "WORSE"], ["To get less good", "WORSEN"]] },
  { start: "SAP", steps: [["To trade one thing for another", "SWAP"], ["Wet, spongy ground", "SWAMP"], ["Wet and spongy, as ground", "SWAMPY"]] },
  { start: "CAT", steps: [["To throw, or the actors in a play", "CAST"], ["A class in society that you are born into", "CASTE"], ["A small wheel under a chair leg", "CASTER"]] },
  { start: "RAT", steps: [["Speed, or a price per unit", "RATE"], ["To shred cheese", "GRATE"], ["The kitchen tool that shreds cheese", "GRATER"]] },
  { start: "BUS", steps: [["A shrub", "BUSH"], ["To go red in the face", "BLUSH"], ["Slightly blue", "BLUISH"]] },
  { start: "DIG", steps: [["A small dent in a car door", "DING"], ["Busy with", "DOING"], ["Napping lightly", "DOZING"]] },
  { start: "TOE", steps: [["Ripped", "TORE"], ["A shop", "STORE"], ["One floor of a building", "STOREY"]] },
  { start: "MIL", steps: [["About 1.6 kilometres", "MILE"], ["A happy look on your face", "SMILE"], ["A round yellow face that grins", "SMILEY"]] },
  { start: "SAT", steps: [["Right away, in hospital talk", "STAT"], ["Ontario or Texas, for example", "STATE"], ["A large property with land", "ESTATE"]] },
  { start: "ILL", steps: [["To make full", "FILL"], ["A ruffled edge on a dress", "FRILL"], ["Fussy with ruffles and bows", "FRILLY"]] },
  { start: "HIP", steps: [["A small piece broken off, or a fried potato slice", "CHIP"], ["A small bird's short sharp call", "CHIRP"], ["Cheerful and lively", "CHIRPY"]] },
  { start: "LAM", steps: [["Unable to walk properly", "LAME"], ["A tongue of fire", "FLAME"], ["On fire", "AFLAME"]] },
  { start: "HIT", steps: [["The smallest amount, as in \"not a ___\"", "WHIT"], ["The colour of fresh snow", "WHITE"], ["Paler than before", "WHITER"]] },
  { start: "ROE", steps: [["The flower of love", "ROSE"], ["Got up, or came into being", "AROSE"], ["To stir up a feeling", "AROUSE"]] },
  { start: "ERE", steps: [["No more than, as in \"a ___ child\"", "MERE"], ["To join together into one", "MERGE"], ["To come out into view", "EMERGE"]] }
];
