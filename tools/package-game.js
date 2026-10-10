// Packs one game into a folder that stands on its own, ready to be dropped into another
// site (for example as its own app on shozbot.com).
//
//   node tools/package-game.js whittle            writes dist/whittle/
//   node tools/package-game.js all                packs every game
//
// The packed folder holds the game's page, its puzzles, its daily schedules and a copy of
// shared/ (the look, the shell and the engine). The page's "../shared/" links are rewritten
// to "shared/", so nothing outside the folder is needed. The copy in dist/ is a snapshot:
// fix things here in the repository, then pack again.
const fs = require("fs"), path = require("path");
const { GLOBALS } = require("../shared/keys.js");
const root = path.join(__dirname, "..");
const GAMES = Object.keys(GLOBALS);
const want = process.argv[2];
if (!want) { console.log("Usage: node tools/package-game.js <game-folder | all>\nGames: " + GAMES.join(", ")); process.exit(1); }
const list = want === "all" ? GAMES : [want];
const bad = list.filter(g => !GAMES.includes(g));
if (bad.length) { console.log("Unknown game: " + bad.join(", ") + "\nGames: " + GAMES.join(", ")); process.exit(1); }

for (const game of list) {
  const src = path.join(root, game), out = path.join(root, "dist", game);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, "shared"), { recursive: true });
  for (const f of fs.readdirSync(src)) {
    if (!/\.(html|js|css|png|svg|ico|webmanifest|json)$/.test(f)) continue;
    let text = fs.readFileSync(path.join(src, f));
    if (f.endsWith(".html")) text = Buffer.from(text.toString("utf8").replace(/(["'(])\.\.\/shared\//g, "$1shared/"));
    fs.writeFileSync(path.join(out, f), text);
  }
  for (const f of fs.readdirSync(path.join(root, "shared"))) fs.copyFileSync(path.join(root, "shared", f), path.join(out, "shared", f));
  if (fs.existsSync(path.join(src, "icons"))) fs.cpSync(path.join(src, "icons"), path.join(out, "icons"), { recursive: true });
  const files = fs.readdirSync(out).filter(f => f !== "shared").length + fs.readdirSync(path.join(out, "shared")).length;
  console.log("Packed " + game + " into dist/" + game + "/ (" + files + " files)");
}
