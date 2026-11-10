// Shared bits for the browser tests: a static server for the repository, a stand-in for the
// studio kit, and a tiny check() helper. Run any test with: node tools/tests/<name>.js
//
// The tests need Playwright with Chromium (npm install playwright, then npx playwright install
// chromium, or a PLAYWRIGHT_BROWSERS_PATH that already holds it).
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".webmanifest": "application/manifest+json" };

function serve() {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "text/plain" }); res.end(fs.readFileSync(f));
  }).listen(0);
  return { srv, base: "http://localhost:" + srv.address().port + "/" };
}

// The studio kit puts "by shozbot" on its own line under the element data-by names. This stand-in
// does the same, so header measurements match the live page, and it swallows the visitor counter.
const KIT_JS = "(function(){var s=document.currentScript;var sel=s.getAttribute('data-by');var block=s.hasAttribute('data-by-block');var host=sel&&document.querySelector(sel);if(!host)return;var wrap=document.createElement(block?'div':'span');wrap.className='shozkit-by'+(block?' shozkit-by--block':'');var a=document.createElement('a');a.href='https://shozbot.com/';a.textContent='by shozbot';wrap.appendChild(a);host.parentNode.insertBefore(wrap,host.nextSibling);})();";
const KIT_CSS = ".shozkit-by{font-family:ui-monospace,Menlo,monospace;font-size:.8rem;margin-left:8px}.shozkit-by--block{display:block;margin:4px 0 0}.shozkit-by a{color:#6b6b70;text-decoration:underline;text-underline-offset:3px}";
async function kit(ctx) {
  await ctx.route("https://shozbot.com/kit/**", r => { const u = r.request().url(); r.fulfill({ status: 200, contentType: u.endsWith(".css") ? "text/css" : "text/javascript", body: u.endsWith(".css") ? KIT_CSS : KIT_JS }); });
  await ctx.route("https://shozbot.com/assets/**", r => r.fulfill({ status: 200, contentType: "text/plain", body: "" }));
  await ctx.route(/goatcounter|gc\.zgo\.at/, r => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
}

const fails = [];
const check = (cond, msg) => { console.log((cond ? "ok   " : "FAIL ") + msg); if (!cond) fails.push(msg); };
const done = (srv, browser) => { srv.close(); if (browser) browser.close(); console.log(fails.length ? fails.length + " FAILED" : "all passed"); process.exitCode = fails.length ? 1 : 0; };

const GAMES = ["common-thread", "whittle", "snowball", "tumble", "stowaway", "soundalike", "switcheroo", "three-of-a-kind", "splice"];
const pad = n => String(n).padStart(2, "0");
const todayIso = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
const store = g => g.replace(/-/g, "") + ":";

module.exports = { ROOT, serve, kit, check, done, fails, GAMES, todayIso, store };
