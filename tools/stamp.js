// Stamps a new version on every file the pages load, so phones fetch the latest copy.
//
//   node tools/stamp.js
//
// Run it before pushing any change. It does two things:
//   1. Adds ?v=<version> to each page's links to its puzzles.js and to the shared/ files.
//      A browser treats a new ?v= as a new file, so a reload never mixes old and new code.
//   2. Writes shared/version.json. Each game checks that file when it is opened or brought
//      back to the front, and reloads itself (never mid-puzzle) if a newer version is out.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const { GLOBALS } = require("../shared/keys.js");

const d = new Date(), pad = n => String(n).padStart(2, "0");
const version = d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "-" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds());

// Local script and stylesheet links: puzzles.js, ../shared/x.js, shared/style.css, with or without an old ?v=.
const LINK = /((?:src|href)=")((?:\.\.\/)?shared\/[\w.-]+\.(?:js|css)|puzzles\.js)(?:\?v=[\w-]+)?(")/g;
const pages = ["index.html"].concat(Object.keys(GLOBALS).map(g => path.join(g, "index.html")));
let changed = 0;
for (const page of pages) {
  const file = path.join(root, page);
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(LINK, (m, a, url, z) => a + url + "?v=" + version + z);
  if (after !== before) { fs.writeFileSync(file, after); changed++; }
}
fs.writeFileSync(path.join(root, "shared", "version.json"), JSON.stringify({ v: version }) + "\n");
console.log("Stamped version " + version + " on " + changed + " pages and shared/version.json");
