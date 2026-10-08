// Minus 3 puzzles.
//
// Each puzzle has:
//   start - a six-letter word, in capitals
//   steps - three [clue, answer] pairs. Each answer is the word before it with one letter
//           removed and the other letters kept in the same order (PLANET, PLANT, PLAN, PAN).
//
// Every game picks four of these at random. All puzzles must be original.

window.MINUS_3_PUZZLES = [
  { start: "PLANET", steps: [["Something that grows in soil", "PLANT"], ["A scheme", "PLAN"], ["You fry an egg in it", "PAN"]] },
  { start: "STRAIN", steps: [["It runs on rails", "TRAIN"], ["It falls from clouds", "RAIN"], ["Moved fast on foot", "RAN"]] },
  { start: "BRANDY", steps: [["A company's name and logo", "BRAND"], ["The husk of a grain", "BRAN"], ["To forbid", "BAN"]] },
  { start: "SPRINT", steps: [["To put ink on paper", "PRINT"], ["A measure of beer", "PINT"], ["It holds fabric in place", "PIN"]] },
  { start: "CHEATS", steps: [["To break the rules", "CHEAT"], ["Warmth", "HEAT"], ["Worn on the head", "HAT"]] },
  { start: "PAINTS", steps: [["To coat a wall with colour", "PAINT"], ["To breathe hard", "PANT"], ["A small insect", "ANT"]] },
  { start: "STABLE", steps: [["You eat dinner at it", "TABLE"], ["A story", "TALE"], ["A kind of beer", "ALE"]] },
  { start: "SCARED", steps: [["To frighten", "SCARE"], ["To look after", "CARE"], ["You drive it", "CAR"]] },
  { start: "BOARDS", steps: [["A flat length of wood", "BOARD"], ["A wild pig", "BOAR"], ["It rows a boat", "OAR"]] },
  { start: "PLEASE", steps: [["Appeals or requests", "PLEAS"], ["What a defendant enters in court", "PLEA"], ["A small green vegetable", "PEA"]] },
  { start: "FRIEND", steps: [["A demon or villain", "FIEND"], ["To locate", "FIND"], ["A fish steers with it", "FIN"]] },
  { start: "CHARTS", steps: [["A map for sailors", "CHART"], ["A friendly talk", "CHAT"], ["A pet that purrs", "CAT"]] },
  { start: "SWINGS", steps: [["It hangs in a playground", "SWING"], ["A bird flaps it", "WING"], ["To come first", "WIN"]] },
  { start: "THINKS", steps: [["To use your mind", "THINK"], ["Not thick", "THIN"], ["A metal used for cans", "TIN"]] },
  { start: "STRIPE", steps: [["To peel away", "STRIP"], ["A journey", "TRIP"], ["A waiter hopes for one", "TIP"]] },
  { start: "CRATES", steps: [["A wooden shipping box", "CRATE"], ["A speed or a price", "RATE"], ["A rodent", "RAT"]] },
  { start: "GRAINS", steps: [["One seed of wheat", "GRAIN"], ["To get more of something", "GAIN"], ["A spirit mixed with tonic", "GIN"]] },
  { start: "SPARKS", steps: [["A tiny flash from a fire", "SPARK"], ["A green space in town", "PARK"], ["Noah built one", "ARK"]] },
  { start: "CLEANS", steps: [["Not dirty", "CLEAN"], ["A family group, in Scotland", "CLAN"], ["Beans come in one", "CAN"]] },
  { start: "FLOATS", steps: [["To stay on the surface", "FLOAT"], ["Level, with no bumps", "FLAT"], ["Not thin", "FAT"]] },
  { start: "SHEARS", steps: [["To clip a sheep's wool", "SHEAR"], ["To use your ears", "HEAR"], ["It is on the side of your head", "EAR"]] },
  { start: "BRINGS", steps: [["To carry something here", "BRING"], ["Worn on a finger", "RING"], ["A drilling platform at sea", "RIG"]] },
  { start: "SLEEPS", steps: [["What you do at night", "SLEEP"], ["To leak slowly through", "SEEP"], ["To use your eyes", "SEE"]] },
  { start: "STEAMS", steps: [["It rises from a kettle", "STEAM"], ["Where two pieces of cloth are stitched", "SEAM"], ["Ships sail on it", "SEA"]] },
  { start: "BRIDGE", steps: [["She walks down the aisle", "BRIDE"], ["A trip on a bike or a horse", "RIDE"], ["To be free of something", "RID"]] },
  { start: "TRAILS", steps: [["A path through the woods", "TRAIL"], ["A dog wags it", "TAIL"], ["To be unwell", "AIL"]] }
];
