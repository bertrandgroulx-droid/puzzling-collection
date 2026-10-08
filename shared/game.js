// Shared game engine for Anagrams, Plus One, Hear Here, Swap One, Shared Property and Mash-Ups.
// Each game's index.html calls startGame({...}) with its settings and its puzzle list.
// Puzzles are written in the friendly formats described in each game's puzzles.js;
// prepare() below turns them into what the engine needs.
(function () {
  const $ = id => document.getElementById(id);
  let S = null, G = null, stage = null, queue = [], timerOn = true, redrawReady = null;
  let clockEnd = 0, clockRaf = 0, clockTotal = 1, clockCb = null;

  // The timer switch. On by default; the choice is remembered on this device.
  function storageKey() { return "timer:" + location.pathname; }
  function loadTimerChoice() { try { timerOn = localStorage.getItem(storageKey()) !== "off"; } catch (e) { timerOn = true; } }
  function saveTimerChoice() { try { localStorage.setItem(storageKey(), timerOn ? "on" : "off"); } catch (e) {} }
  function useTimer() { return !!G.timer && timerOn; }
  function drawToggle() {
    if (!G.timer || $("timerToggle")) return;
    stage.insertAdjacentHTML("beforebegin", '<label class="toggle"><span>Timer <small id="timerNote"></small></span><input type="checkbox" id="timerToggle" role="switch"' + (timerOn ? " checked" : "") + "></label>");
    $("timerToggle").onchange = e => { timerOn = e.target.checked; saveTimerChoice(); if (redrawReady) redrawReady(); };
  }
  // The switch is locked while a clock is running; the change applies from the next puzzle.
  function lockToggle(locked) {
    const t = $("timerToggle"); if (!t) return;
    t.disabled = locked;
    $("timerNote").textContent = locked ? "(change applies to the next puzzle)" : "";
  }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function up(s) { return String(s).toUpperCase().replace(/[^A-Z]/g, ""); }
  function val(id) { const el = $(id); return el ? up(el.value) : ""; }
  function say(text, cls) { const m = $("msg"); if (m) { m.textContent = text; m.className = "msg " + (cls || ""); } }
  function bump(el) { if (!el) return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); el.focus(); }

  // Turn a puzzle from puzzles.js into the shape the engine uses.
  function prepare(p, type) {
    if (type === "choice") return { words: p.words.map(w => String(w).toUpperCase()), options: [p.answer].concat(p.wrong) };
    if (type === "swap") return { start: up(p.start), steps: p.steps.map(s => [s[0], up(s[1])]) };
    if (p.parts) return { lead: p.clues, parts: p.parts.map(up), answers: [up(p.answer)] };
    if (p.letters) return { given: up(p.letters), clues: p.clues, answers: p.answers.map(up) };
    return { clues: p.clues, answers: p.answers.map(up) };
  }

  function startClock(sec, cb) { clockTotal = sec; clockEnd = performance.now() + sec * 1000; clockCb = cb; cancelAnimationFrame(clockRaf); lockToggle(true); tickClock(); }
  function stopClock() { cancelAnimationFrame(clockRaf); clockCb = null; lockToggle(false); }
  function tickClock() {
    const left = clockEnd - performance.now(), f = $("barFill"), s = $("secs");
    if (f) { f.style.width = Math.max(0, Math.min(100, left / (10 * clockTotal))) + "%"; f.parentNode.className = "bar" + (left <= 7000 ? " low" : ""); }
    if (s) s.textContent = Math.max(0, Math.ceil(left / 1000));
    if (left <= 0) { const cb = clockCb; clockCb = null; lockToggle(false); if (cb) cb(); return; }
    clockRaf = requestAnimationFrame(tickClock);
  }
  const CLOCK = '<div class="clock"><div class="bar"><span id="barFill"></span></div><div class="secs" id="secs"></div></div>';

  function head() {
    const pips = S.items.map((_, j) => {
      const r = S.results[j];
      return '<span class="pip ' + (r === undefined ? (j === S.i ? "now" : "") : r === G.max ? "full" : r > 0 ? "part" : "zero") + '"></span>';
    }).join("");
    return '<div class="pips" aria-hidden="true">' + pips + '</div><p class="lead">Puzzle ' + (S.i + 1) + " of " + G.per + ". " + esc(G.timer && !timerOn && G.rulesUntimed ? G.rulesUntimed : G.rules) + "</p>";
  }
  function rows(list) { return '<ul class="ladder">' + list.map(r => '<li class="' + (r[2] ? "got" : "miss") + '"><span class="w">' + esc(r[0]) + '</span><span class="d">' + esc(r[1]) + "</span></li>").join("") + "</ul>"; }
  function label(p) { return p.words ? p.words.join(", ") : p.start ? p.start + " → " + p.steps[2][1] : p.given ? p.given + " → " + p.answers.join(", ") : p.answers.join(" / "); }

  function newGame() {
    if (queue.length < G.per) queue = shuffle(G.items.map((_, i) => i));
    S = { items: queue.splice(0, G.per).map(i => G.items[i]), i: 0, score: 0, results: [] };
    $("score").textContent = 0; $("max").textContent = G.per * G.max;
    next();
  }
  function next() {
    stage.onclick = null;
    if (S.i >= G.per) return endGame();
    ENGINES[G.type](S.items[S.i]);
  }
  function settle(points, revealHTML, text) {
    stopClock(); stage.onclick = null; redrawReady = null;
    S.results.push(points); S.score += points; $("score").textContent = S.score;
    stage.innerHTML = head() + revealHTML + '<p class="msg ' + (points === G.max ? "good" : "") + '">' + esc(text) + " " + points + (points === 1 ? " point." : " points.") + '</p><button class="primary" id="nextBtn" type="button">' + (S.i + 1 < G.per ? "Next puzzle" : "See your score") + "</button>";
    $("nextBtn").onclick = () => { S.i++; next(); };
    $("nextBtn").focus();
  }
  function endGame() {
    const total = G.per * G.max, ratio = S.score / total;
    const verdict = ratio === 1 ? "A perfect game." : ratio >= 0.7 ? "A strong game." : ratio >= 0.4 ? "A fair game." : "A tough set. The next ones are different.";
    stage.innerHTML = '<div class="pips" aria-hidden="true">' + S.results.map(r => '<span class="pip ' + (r === G.max ? "full" : r > 0 ? "part" : "zero") + '"></span>').join("") + "</div>" +
      '<div class="big">' + S.score + " <small>/ " + total + '</small></div><p class="lead">' + verdict + '</p><ul class="recap">' +
      S.items.map((p, j) => "<li><span>" + esc(label(p)) + "</span><span>" + S.results[j] + " / " + G.max + "</span></li>").join("") +
      '</ul><div class="row"><button class="primary" id="againBtn" type="button">Play again</button><a class="ghost btn" href="../">All games</a></div>';
    $("againBtn").onclick = newGame;
    $("againBtn").focus();
  }

  const ENGINES = {
    // Typed answers. "each" mode scores every field separately against a clock; otherwise all fields must be right together.
    typed(p) {
      let hinted = false, k = 0, pts = 0;
      const reveal = () => (p.parts ? '<p class="clue"><span>Blend</span><b>' + esc(p.parts.join(" + ")) + "</b></p>" : "") +
        rows(p.answers.map((a, j) => [a, p.clues ? p.clues[j] : p.lead.join(" + "), G.each ? j < pts : true]));
      const draw = () => {
        let h = head();
        if (useTimer()) h += CLOCK;
        if (p.given) h += '<div class="tiles">' + p.given.split("").map(c => '<div class="tile">' + c + "</div>").join("") + "</div>";
        if (p.lead) h += '<div class="words">' + p.lead.map(t => '<p class="clue" style="margin:0"><b>' + esc(t) + "</b></p>").join("") + "</div>";
        h += '<form id="f" class="stack" autocomplete="off">';
        const labels = p.clues || ["The two words blended into one"];
        labels.forEach((c, j) => {
          if (G.each && j > k) return;
          const done = G.each && j < k;
          h += '<label class="field"><span>' + esc(c) + '</span><input type="text" id="a' + j + '"' + (done ? ' disabled value="' + p.answers[j] + '"' : "") + ' autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="go"></label>';
        });
        h += '<p class="hint" id="hint" hidden></p><p class="msg" id="msg" aria-live="polite"></p><button class="primary" type="submit">Check</button></form><div class="row">' +
          (G.each ? "" : '<button class="ghost" id="hintBtn" type="button">Hint (costs 1 point)</button>') +
          '<button class="ghost" id="giveUp" type="button">' + (G.each ? "Stop here" : "Show answer") + "</button></div>";
        stage.innerHTML = h;
        $("f").onsubmit = e => {
          e.preventDefault();
          if (G.each) {
            if (val("a" + k) === p.answers[k]) {
              pts++; k++;
              if (k === p.answers.length) return settle(pts, reveal(), "Both found.");
              draw(); say("Right. Now the bonus word.", "good"); $("a" + k).focus();
            } else { say("Not that one. Keep trying.", "bad"); bump($("a" + k)); }
            return;
          }
          const wrong = p.answers.map((a, j) => val("a" + j) === a ? -1 : j).filter(j => j >= 0);
          p.answers.forEach((_, j) => $("a" + j).classList.toggle("wrong", wrong.includes(j)));
          if (!wrong.length) return settle(hinted ? 1 : 2, reveal(), hinted ? "Correct with a hint." : "Correct.");
          say(p.answers.length > 1 && wrong.length === 1 ? "One of the two is right. Fix the other." : "Not yet. Try again.", "bad");
          bump($("a" + wrong[0]));
        };
        if (!G.each) $("hintBtn").onclick = () => {
          hinted = true; $("hint").hidden = false;
          $("hint").textContent = p.answers.map(a => a[0] + " _".repeat(a.length - 1)).join("   ·   ");
          $("hintBtn").disabled = true; $("hintBtn").textContent = "Hint used";
        };
        $("giveUp").onclick = () => settle(G.each ? pts : 0, reveal(), G.each ? "Stopped." : "Answer shown.");
      };
      draw();
      if (useTimer()) startClock(G.timer, () => settle(pts, reveal(), "Time ran out."));
      $("a" + k).focus();
    },
    // Pick the connection from four options. Two tries.
    choice(p) {
      let tries = 0;
      const opts = shuffle(p.options.slice());
      stage.innerHTML = head() + '<div class="words">' + p.words.map(w => '<div class="word">' + esc(w) + "</div>").join("") + '</div><div class="stack" id="opts">' +
        opts.map(o => '<button class="ghost opt" type="button">' + esc(o) + "</button>").join("") + '</div><p class="msg" id="msg" aria-live="polite"></p>';
      const reveal = () => '<div class="words">' + p.words.map(w => '<div class="word">' + esc(w) + "</div>").join("") + '</div><p class="clue"><span>The connection</span><b>' + esc(p.options[0]) + "</b></p>";
      $("opts").onclick = e => {
        const b = e.target.closest(".opt");
        if (!b || b.disabled) return;
        if (b.textContent === p.options[0]) return settle(tries === 0 ? 2 : 1, reveal(), tries === 0 ? "Correct." : "Correct on the second try.");
        tries++; b.disabled = true; b.classList.add("wrong");
        if (tries >= 2) return settle(0, reveal(), "Two misses.");
        say("Not that one. One more try, for 1 point.", "bad");
      };
    },
    // Word ladder: select a tile, then pick its replacement letter.
    swap(p) {
      let step = 0, word = p.start, sel = -1, pts = 0, started = false, timed = useTimer();
      const reveal = () => '<p class="clue"><span>Started from</span><b>' + p.start + "</b></p>" + rows(p.steps.map((s, j) => [s[1], s[0], j < pts]));
      const draw = () => {
        if (!started) timed = useTimer();   // the switch can change until Start is pressed
        redrawReady = started ? null : draw;
        let h = head() + (timed ? CLOCK : "");
        h += '<p class="clue"><span>' + (started ? "Clue " + (step + 1) + " of 3" : "Four letters") + "</span><b>" + (started ? esc(p.steps[step][0]) : "Change one letter at a time to match each clue.") + "</b></p>";
        h += '<div class="tiles">' + word.split("").map((c, i) => '<button class="tile' + (i === sel ? " sel" : "") + '" type="button" data-i="' + i + '"' + (started ? "" : " disabled") + ' aria-label="Letter ' + c + '">' + c + "</button>").join("") + "</div>";
        h += '<p class="msg" id="msg" aria-live="polite">' + (started ? (sel < 0 ? "Tap the letter to change." : "Now pick its replacement.") : "") + "</p>";
        if (started) h += '<div class="keys">' + "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(c => '<button type="button" data-k="' + c + '"' + (sel < 0 ? " disabled" : "") + ">" + c + "</button>").join("") + "</div>";
        else h += '<button class="primary" id="go" type="button">' + (timed ? "Start the clock" : "Start") + "</button>";
        if (pts) h += rows(p.steps.slice(0, pts).map(s => [s[1], s[0], true]));
        if (started && !timed) h += '<button class="ghost" id="stopBtn" type="button">Stop here</button>';
        stage.innerHTML = h;
        if (!started) { if (timed) $("secs").textContent = G.timer; $("go").onclick = () => { started = true; draw(); if (timed) startClock(G.timer, () => settle(pts, reveal(), "Time ran out.")); }; }
        if (started && !timed) $("stopBtn").onclick = () => settle(pts, reveal(), "Stopped.");
      };
      stage.onclick = e => {
        if (!started) return;
        const t = e.target.closest(".tile"), key = e.target.closest("[data-k]");
        if (t) { sel = Number(t.dataset.i); draw(); return; }
        if (!key || sel < 0) return;
        const cand = word.slice(0, sel) + key.dataset.k + word.slice(sel + 1);
        if (cand === p.steps[step][1]) {
          pts++; word = cand; step++; sel = -1;
          if (step === 3) return settle(pts, reveal(), "Ladder complete.");
          draw(); say(cand + " is right. Tap the next letter to change.", "good");
        } else {
          sel = -1; draw();
          if (timed) { clockEnd -= 3000; say(cand + " does not fit. 3 seconds lost.", "bad"); }
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
    loadTimerChoice(); drawToggle();
    newGame();
  };
})();
