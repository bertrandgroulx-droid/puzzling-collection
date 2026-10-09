// Shared game engine for Tumble, Stowaway, Soundalike, Switcheroo, Three of a Kind and Splice.
// Each game's index.html calls startGame({...}) with its settings and its puzzle list.
// The shell (shared/shell.js) decides which puzzles to play and shows the results; this file
// plays them. Puzzles are written in the friendly formats described in each game's puzzles.js;
// prepare() below turns them into what the engine needs.
(function () {
  const $ = id => document.getElementById(id);
  let S = null, G = null, stage = null, queue = [];
  let clockEnd = 0, clockRaf = 0, clockTotal = 1, clockCb = null;

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function up(s) { return String(s).toUpperCase().replace(/[^A-Z]/g, ""); }
  function val(id) { const el = $(id); return el ? up(el.value) : ""; }
  function say(text, cls) { const m = $("msg"); if (m) { m.textContent = text; m.className = "status " + (cls || ""); } }
  function bump(el) { if (!el) return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); el.focus(); el.select && el.select(); }
  function pattern(a) { return a[0] + " _".repeat(a.length - 1); }

  // Turn a puzzle from puzzles.js into the shape the engine uses.
  function prepare(p, type) {
    if (type === "choice") return { words: p.words.map(w => String(w).toUpperCase()), options: [p.answer].concat(p.wrong) };
    if (type === "swap") return { start: up(p.start), steps: p.steps.map(s => [s[0], up(s[1])]) };
    if (p.parts) return { lead: p.clues, parts: p.parts.map(up), answers: [up(p.answer)] };
    if (p.letters) return { given: up(p.letters), clues: p.clues, answers: p.answers.map(up) };
    return { clues: p.clues, answers: p.answers.map(up) };
  }

  // ---- the clock ----
  function timed() { return !!G.timer && Shell.timerOn(); }
  function startClock(sec, cb) { clockTotal = sec; clockEnd = performance.now() + sec * 1000; clockCb = cb; cancelAnimationFrame(clockRaf); tickClock(); }
  function stopClock() { cancelAnimationFrame(clockRaf); clockCb = null; }
  function tickClock() {
    const left = clockEnd - performance.now(), f = $("barFill"), s = $("secs");
    if (f) { f.style.width = Math.max(0, Math.min(100, left / (10 * clockTotal))) + "%"; f.parentNode.className = "bar" + (left <= 7000 ? " low" : ""); }
    if (s) s.textContent = Math.max(0, Math.ceil(left / 1000));
    if (left <= 0) { const cb = clockCb; clockCb = null; if (cb) cb(); return; }
    clockRaf = requestAnimationFrame(tickClock);
  }
  const CLOCK = '<div class="clock"><div class="bar"><span id="barFill"></span></div><div class="secs" id="secs"></div></div>';

  // ---- the parts every puzzle screen shares ----
  function pipClass(r, j) { return r === undefined ? (j === S.i ? "now" : "") : r === G.max ? "full" : r > 0 ? "half" : "zero"; }
  // The instruction block pulses once when it appears or its text changes, not on every redraw.
  let lastInstruction = null;
  function head(instruction) {
    if (instruction === undefined) instruction = G.instruction;
    const changed = instruction !== lastInstruction;
    lastInstruction = instruction;
    return '<div class="pips" aria-hidden="true">' + S.items.map((_, j) => '<span class="pip ' + pipClass(S.results[j], j) + '"></span>').join("") + "</div>" +
      (instruction ? '<p class="instr' + (changed ? " pulse" : "") + '">' + esc(instruction) + "</p>" : "");
  }
  function rows(list) { return '<ul class="ladder">' + list.map(r => '<li class="' + (r[2] ? "got" : "miss") + '"><span class="w">' + esc(r[0]) + '</span><span class="d">' + esc(r[1]) + "</span></li>").join("") + "</ul>"; }
  function label(p) { return p.words ? p.words.join(", ") : p.start ? p.start + " → " + p.steps[2][1] : p.given ? p.given + " → " + p.answers.join(", ") : p.answers.join(" / "); }
  function buttons(hintLabel) {
    return '<div class="row">' + (hintLabel ? '<button id="hintBtn" type="button">' + hintLabel + "</button>" : "") + '<button id="giveUp" type="button">Give up</button></div>';
  }

  function newGame(meta) {
    let items;
    if (meta && meta.mode === "daily") items = meta.items.map(p => prepare(p, G.type));
    else {
      if (queue.length < G.per) queue = shuffle(G.items.map((_, i) => i));
      items = queue.splice(0, G.per).map(i => G.items[i]);
    }
    S = { items, i: 0, score: 0, results: [], meta: meta && meta.mode === "daily" ? meta : null };
    next();
  }
  function next() {
    stage.onclick = null;
    if (S.i >= S.items.length) return endGame();
    ENGINES[G.type](S.items[S.i]);
  }
  // Close a puzzle: record its points, show the answer, and offer Next.
  function settle(points, revealHTML, text) {
    stopClock(); stage.onclick = null;
    S.results.push(points); S.score += points;
    const cls = points === G.max ? "good" : points > 0 ? "part" : "bad";
    stage.innerHTML = head(null) + revealHTML + '<p class="status ' + cls + '">' + esc(text) + " " + points + (points === 1 ? " point." : " points.") + "</p>" +
      '<button class="primary" id="nextBtn" type="button">' + (S.i + 1 < S.items.length ? "Next" : "See your score") + "</button>";
    $("nextBtn").onclick = () => { S.i++; next(); };
    $("nextBtn").focus();
  }
  function endGame() {
    Shell.finish({ score: S.score, max: S.items.length * G.max, results: S.results, recap: S.items.map((p, j) => [label(p), S.results[j]]), meta: S.meta });
  }

  const ENGINES = {
    // Typed answers. "each" mode (Tumble) scores every word on its own against one clock;
    // otherwise every field must be right together.
    typed(p) {
      let hinted = false, k = 0, found = 0, hints = 0;
      const n = p.answers.length;
      const pointsNow = () => G.each ? Math.max(0, found - hints) : (hinted ? 1 : 2);
      const reveal = () => (p.parts ? '<p class="clue"><span>The two words</span><b>' + esc(p.parts.join(" + ")) + "</b></p>" : "") +
        (p.given ? '<div class="tiles row">' + p.given.split("").map(c => '<div class="tile">' + c + "</div>").join("") + "</div>" : "") +
        rows(p.answers.map((a, j) => [a, p.clues ? p.clues[j] : p.lead.join(" + "), G.each ? j < found : true]));
      const draw = () => {
        let h = head();
        if (timed()) h += CLOCK;
        if (p.given) h += '<div class="tiles row">' + p.given.split("").map(c => '<div class="tile">' + c + "</div>").join("") + "</div>";
        if (p.lead) h += '<div class="words">' + p.lead.map(t => '<p class="clue"><b>' + esc(t) + "</b></p>").join("") + "</div>";
        h += '<form id="f" autocomplete="off">';
        const labels = p.clues || ["The two words blended into one"];
        labels.forEach((c, j) => {
          if (G.each && j > k) return;
          const done = G.each && j < k;
          h += '<label class="field"><span>' + esc(c) + '</span><input type="text" id="a' + j + '"' + (done ? ' disabled value="' + p.answers[j] + '"' : "") + ' autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="go"></label>';
        });
        h += '<p class="hint" id="hint" hidden></p><button class="primary" type="submit">Check</button></form><p class="status" id="msg" aria-live="polite"></p>' + buttons("Hint · 1 point");
        stage.innerHTML = h;
        $("f").onsubmit = e => {
          e.preventDefault();
          if (G.each) {
            if (val("a" + k) === p.answers[k]) {
              found++; k++;
              if (k === n) return settle(pointsNow(), reveal(), "Both found.");
              draw(); say("Right. Now the bonus word.", "good"); $("a" + k).focus();
            } else { say("Not that one. Try again.", "bad"); bump($("a" + k)); }
            return;
          }
          const wrong = p.answers.map((a, j) => val("a" + j) === a ? -1 : j).filter(j => j >= 0);
          p.answers.forEach((_, j) => $("a" + j).classList.toggle("wrong", wrong.includes(j)));
          if (!wrong.length) return settle(pointsNow(), reveal(), hinted ? "Correct, with a hint." : "Correct.");
          say(n > 1 && wrong.length === 1 ? "One of the two is right. Fix the other." : "Not that one. Try again.", "bad");
          bump($("a" + wrong[0]));
        };
        $("hintBtn").onclick = () => {
          if (G.each) { hints++; $("hint").textContent = pattern(p.answers[k]); }
          else { hinted = true; $("hint").textContent = p.answers.map(pattern).join("   ·   "); }
          $("hint").hidden = false;
          $("hintBtn").disabled = true; $("hintBtn").textContent = "Hint used";
          $("a" + k).focus();
        };
        $("giveUp").onclick = () => settle(G.each ? pointsNow() : 0, reveal(), G.each ? "Given up." : (n > 1 ? "The answers were " + p.answers.join(" and ") + "." : "The answer was " + p.answers[0] + "."));
      };
      draw();
      if (timed()) startClock(G.timer, () => settle(pointsNow(), reveal(), "Time ran out."));
      $("a" + k).focus();
    },

    // Pick the connection from four options. Two tries. Hint removes a wrong option for a point.
    choice(p) {
      let tries = 0, hinted = false;
      const opts = shuffle(p.options.slice());
      const reveal = () => '<div class="words wrap">' + p.words.map(w => '<div class="word">' + esc(w) + "</div>").join("") + '</div><p class="clue"><span>What they share</span><b>' + esc(p.options[0]) + "</b></p>";
      stage.innerHTML = head() + '<div class="words wrap">' + p.words.map(w => '<div class="word">' + esc(w) + "</div>").join("") + '</div><div class="opts" id="opts">' +
        opts.map(o => '<button class="opt" type="button">' + esc(o) + "</button>").join("") + '</div><p class="status" id="msg" aria-live="polite"></p>' + buttons("Hint · 1 point");
      const points = () => Math.max(0, (tries === 0 ? 2 : 1) - (hinted ? 1 : 0));
      $("opts").onclick = e => {
        const b = e.target.closest(".opt");
        if (!b || b.disabled) return;
        if (b.textContent === p.options[0]) return settle(points(), reveal(), tries === 0 ? (hinted ? "Correct, with a hint." : "Correct.") : "Correct on the second try.");
        tries++; b.disabled = true; b.classList.add("wrong");
        if (tries >= 2) return settle(0, reveal(), "Two misses.");
        say("Not that one. One more try.", "bad");
      };
      $("hintBtn").onclick = () => {
        hinted = true;
        const wrongBtn = [...$("opts").querySelectorAll(".opt")].find(b => !b.disabled && b.textContent !== p.options[0]);
        if (wrongBtn) { wrongBtn.disabled = true; wrongBtn.classList.add("wrong"); }
        $("hintBtn").disabled = true; $("hintBtn").textContent = "Hint used";
        say("One wrong answer removed.", "part");
      };
      $("giveUp").onclick = () => settle(0, reveal(), "The connection was: " + p.options[0].toLowerCase() + ".");
    },

    // Word ladder: tap a tile, then pick its replacement letter. Hint marks the tile to change.
    swap(p) {
      let step = 0, word = p.start, sel = -1, pts = 0, hints = 0, started = !timed(), hintedTile = -1;
      const reveal = () => '<p class="clue"><span>Started from</span><b>' + p.start + "</b></p>" + rows(p.steps.map((s, j) => [s[1], s[0], j < pts]));
      const points = () => Math.max(0, pts - hints);
      const draw = () => {
        let h = head(started ? undefined : "Read the word, then tap Start. " + G.timer + " seconds for three clues.") + (started && timed() ? CLOCK : "");
        if (started) h += '<p class="clue"><span>Clue ' + (step + 1) + " of 3</span><b>" + esc(p.steps[step][0]) + "</b></p>";
        h += '<div class="tiles row">' + word.split("").map((c, i) => '<button class="tile' + (i === sel ? " sel" : "") + (i === hintedTile ? " hinted" : "") + '" type="button" data-i="' + i + '"' + (started ? "" : " disabled") + ' aria-label="Letter ' + c + '">' + c + "</button>").join("") + "</div>";
        h += '<p class="status" id="msg" aria-live="polite">' + (started ? (sel < 0 ? "Tap the letter to change." : "Now tap its replacement.") : "") + "</p>";
        if (started) h += '<div class="keys">' + ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map(row => '<div class="keyrow">' + row.split("").map(c => '<button class="key" type="button" data-k="' + c + '"' + (sel < 0 ? " disabled" : "") + ">" + c + "</button>").join("") + "</div>").join("") + "</div>";
        else h += '<button class="primary" id="go" type="button">Start</button>';
        if (pts) h += '<p class="rungs">' + [p.start].concat(p.steps.slice(0, pts).map(s => "<b>" + s[1] + "</b>")).join(" → ") + "</p>";
        if (started) h += buttons("Hint · 1 point");
        stage.innerHTML = h;
        if (!started) { $("go").onclick = () => { started = true; draw(); startClock(G.timer, () => settle(points(), reveal(), "Time ran out.")); }; return; }
        $("hintBtn").onclick = () => {
          hints++;
          hintedTile = [...word].findIndex((c, i) => c !== p.steps[step][1][i]);
          sel = hintedTile; draw(); say("Change the marked letter.", "part");
        };
        $("giveUp").onclick = () => settle(points(), reveal(), "Given up.");
      };
      stage.onclick = e => {
        if (!started) return;
        const t = e.target.closest(".tile"), key = e.target.closest("[data-k]");
        if (t) { sel = Number(t.dataset.i); draw(); return; }
        if (!key || sel < 0) return;
        const cand = word.slice(0, sel) + key.dataset.k + word.slice(sel + 1);
        if (cand === p.steps[step][1]) {
          pts++; word = cand; step++; sel = -1; hintedTile = -1;
          if (step === 3) return settle(points(), reveal(), "Ladder complete.");
          draw(); say(cand + " is right. Tap the next letter to change.", "good");
        } else {
          sel = -1; draw();
          if (timed()) { clockEnd -= 3000; say(cand + " does not fit. 3 seconds lost.", "bad"); }
          else say(cand + " does not fit. Try again.", "bad");
        }
      };
      draw();
    }
  };

  // Called once by each game's page.
  window.startGame = function (settings) {
    G = Object.assign({}, settings);
    G.items = (settings.puzzles || []).map(p => prepare(p, G.type));
    stage = $("stage");
    if (!G.items.length) { stage.innerHTML = '<p class="lead">No puzzles found. Check puzzles.js.</p>'; return; }
    Shell.init({ game: G.game, title: G.title, puzzles: settings.puzzles, per: G.per, max: G.max, timed: G.timed, how: G.how, onStart: newGame });
  };
})();
