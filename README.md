# Puzzling

A collection of phone-first word games. Everything runs in the browser with no
server, so the site is just plain HTML, CSS and JavaScript files.

Play it here: https://bertrandgroulx-droid.github.io/puzzling-collection/

The games are built to one house standard, written up in the "Puzzling
Collection house standards" document: the same flow, the same words on the
buttons, the same look (the Sky palette, Bricolage Grotesque for titles and
tiles, Public Sans for everything else).

## The games

| Game | What you do | Points |
| --- | --- | --- |
| Common Thread | Find the one word that pairs with all three words shown. | 5 puzzles, 2 points each |
| Whittle | Take one letter away at a time to match three clues, against a 25-second clock. | 4 words, 3 points each |
| Tumble | An anagram game: rearrange the letters to fit the clue, then find a bonus word in the same letters, in 30 seconds. | 5 puzzles, 2 points each |
| Stowaway | Two clues, two words: the second is the first with one letter added. | 5 puzzles, 2 points each |
| Soundalike | Two clues, two words that sound the same but are spelled differently. | 5 puzzles, 2 points each |
| Switcheroo | Change one letter at a time to climb a three-step word ladder, against a 25-second clock. | 4 ladders, 3 points each |
| Three of a Kind | Three words have something in common. Spot what it is. | 5 puzzles, 2 points each |
| Splice | Two clues, two words, blended into one where they overlap. | 5 puzzles, 2 points each |

In every game, **Hint** costs 1 point (it shows the first letter, or marks the
tile to change) and **Give up**, tapped twice so a stray touch cannot end a
puzzle, shows the answer and keeps whatever has
already been scored.

## How the files are organised

```
index.html            The home page. It links to every game and shows whether
                      today's puzzle has been played, with the score and streak.
common-thread/        One folder per game ...
whittle/
tumble/
stowaway/
soundalike/
switcheroo/
three-of-a-kind/
splice/
  index.html          ... the game page (its rules, scoring and How to play text)
  puzzles.js          ... its puzzles. Edit this file to add more.
  daily-2026.js       ... and its daily puzzle schedule for one year (made by a tool, not by hand).
shared/
  style.css           The look shared by every game and the home page.
  shell.js            Everything around the puzzle: today's puzzle, past puzzles, How to play,
                      settings, results, sharing and saved scores. Used by all eight games.
  game.js             The game engine shared by six of the games.
  keys.js             How each game names a puzzle, so schedules can refer to it.
tools/
  check-puzzles.js    Checks every puzzle file and daily schedule for mistakes.
  make-daily.js       Makes the daily schedule for a new year.
  package-game.js     Packs one game into a folder that works on its own.
  stamp.js            Stamps a new version on every page before a push.
  make-icons.py       Draws every app icon and writes each game's manifest.
```

Common Thread and Whittle have their own game code inside their page. The
other six share one engine in `shared/game.js`. All eight share the stylesheet
and the shell, so a fix there fixes every game at once.

## How a game opens

A game opens straight into today's puzzle. If today's puzzle has already been
played on this phone, it opens on the results instead. Timed games show one
card first (the rules, a timer switch and a Start button) so the clock never
starts unexpectedly.

- **Today's puzzle.** The same set for everyone, numbered by the day of the
  year (No. 1 is January 1) and dated. The first score on a day is the one that
  is kept; playing it again is allowed but does not change the score.
- **Past puzzles.** Lists the previous 100 days, newest first, with the score
  beside any that have been played. Tomorrow's puzzle cannot be opened early.
- **Random puzzles.** As many sets as you like. Nothing is saved.
- **Getting around.** The line under the title always shows two links to the
  other places you can go (for example "Past puzzles" and "Random puzzles"
  while on today's puzzle). After a puzzle, the main button on the results
  screen is Play random puzzles.
- **First visit.** A short welcome card sits above the first puzzle: the
  goal in one line, the example, and Got it. Nothing pops up over the game.
- **How to play.** The **How to play** button at the top opens the full panel. On timed games it
  also holds the timer switch.
- **Streaks.** Days in a row with today's puzzle played. Shown on the results
  screen and on the home page once it reaches two. Missing a day resets it;
  playing a past day does not count.
- **Share.** The results screen has a Share button that copies a short text:
  the game, its number and date, the score, and one square per puzzle.

Scores and settings are saved on the phone only, under the game's own name,
so nothing leaves the device.

## Daily puzzles

Each day's set is written down in advance in the game's `daily-<year>.js`
file. That file is made by a tool and should not be edited, so a day's puzzle
stays the same for everyone. Adding puzzles to `puzzles.js` does not change
any day that is already scheduled.

### Once a year: make next year's schedule

In December, run this in the project folder (it needs Node.js) and push the
result. It writes a `daily-<year>.js` file into every game folder:

```
node tools/make-daily.js 2027
```

The tool refuses to overwrite a year that already exists, so past puzzles are
safe. If a year's file is missing, the game offers random puzzles instead.

### After adding puzzles part way through a year

New puzzles reach random play at once, but a day's set is fixed when the
schedule is made. To let the new puzzles into the daily sets from tomorrow
on, without touching any day already played:

```
node tools/make-daily.js 2026 --refresh
```

Days up to and including today keep exactly the sets they had, so saved
scores still match. Every later day is dealt again from the full list.

## Adding puzzles

Open the game's `puzzles.js`. Each line is one puzzle. Copy a line, change the
words, keep the comma at the end, and save. The top of each file explains its
format. In short:

| Game | One puzzle looks like |
| --- | --- |
| Common Thread | `{ link: "LIGHT", hint: "You flip a switch to get it.", clues: ["SUN_", "FLASH_", "_HOUSE"] }` |
| Whittle | `{ start: "PLANET", steps: [["Something that grows", "PLANT"], ["A scheme", "PLAN"], ["You fry an egg in it", "PAN"]] }` |

In Whittle, no step may simply drop a plural S (CHATS to CHAT is not a
whittle). The checker refuses such a chain. A puzzle marked `retired: true`
is left out of random play and of any schedule made from then on; it stays in
the file only for reference. Whittle's 2026 schedule was re-dealt from scratch
on 10 October, so no day uses a retired chain. To re-deal one game's schedule
without touching the others:

```
node tools/make-daily.js 2026 --force --only whittle
```
| Tumble | `{ letters: "HEART", clues: ["The ground beneath you", "Bonus: someone full of dislike"], answers: ["EARTH", "HATER"] }` |
| Stowaway | `{ clues: ["A hot drink", "A group of players"], answers: ["TEA", "TEAM"] }` |
| Soundalike | `{ clues: ["Two of something", "A juicy fruit"], answers: ["PAIR", "PEAR"] }` |
| Switcheroo | `{ start: "COLD", steps: [["A length of string", "CORD"], ["It comes in a deck", "CARD"], ["Not soft", "HARD"]] }` |
| Three of a Kind | `{ words: ["SCAR", "CARPET", "OSCAR"], answer: "Each contains CAR", wrong: ["Each is a film term", "Each can follow RED", "Each has two syllables"] }` |
| Splice | `{ clues: ["You hit it with sticks", "It keeps the rain off"], parts: ["DRUM", "UMBRELLA"], answer: "DRUMBRELLA" }` |

Answers are written in capitals. In Common Thread, the underscore marks where
the missing word goes: `"SUN_"` is SUN + LIGHT and `"_HOUSE"` is LIGHT + HOUSE.
The `hint` text in Common Thread is kept in the file but the game shows the
first letter instead, like every other game.

All puzzles must be original. The game formats are inspired by the puzzle
segments on CBC Radio's *That's Puzzling!*, but none of the show's clues or
answers are used. The credit is public and plain, and lives on the studio
site, as a line under the Puzzling shelf on shozbot.com:

> Inspired by *That's Puzzling!* on CBC Radio's *The Sunday Magazine*, where
> puzzle master Peter Brown sets the games. Every clue and answer here is
> original, and Shozbot is not affiliated with CBC.

Nothing inside the games carries it for now.

## Where the games came from

Each game was first built under the name of the format it copies, which is
the segment name used on CBC Radio's *That's Puzzling!*. The games were
renamed when the collection became Puzzling, so each could stand as its own
app. The original names are kept here for reference and do not appear in
the games.

| Game now | Original name | Format |
| --- | --- | --- |
| Common Thread | Missing Link | Three words, one missing word that pairs with each (*That's Puzzling!*) |
| Whittle | Minus 3 | Take one letter away at a time to match three clues (*That's Puzzling!*) |
| Tumble | Anagrams | Rearrange the letters to fit a clue, then a bonus word (*That's Puzzling!*) |
| Stowaway | Plus One | Two clues, two words, the second with one letter added (*That's Puzzling!*) |
| Soundalike | Hear, Here | Two clues, two words that sound the same (*That's Puzzling!*) |
| Switcheroo | Swap One | Change one letter at a time to climb a word ladder (*That's Puzzling!*) |
| Three of a Kind | Shared Property | Three words with something in common (*That's Puzzling!*) |
| Splice | Mash-Ups | Two words blended into one where they overlap (*That's Puzzling!*) |

### Checking the puzzles (optional)

If you are comfortable with a terminal and have Node.js installed, this
command checks every puzzle file for slips such as an anagram whose letters
do not match, or a Whittle step that removes two letters, checks the daily
schedules, and prints how many games each list can supply:

```
node tools/check-puzzles.js
```

## Publishing

The site is published with GitHub Pages from the `main` branch of this
repository. Any change pushed to `main` goes live within a minute or two.

### On shozbot.com

The studio site serves this whole repository under one prefix:
`shozbot.com/puzzling/` is the collection page, and each game lives at
`shozbot.com/puzzling/<folder>/`, so `../shared/` resolves on its own. Every
page carries, as the studio's other apps do:

- a canonical link to its shozbot.com address;
- a small script that moves anyone arriving at the old github.io address
  across, swapping `/puzzling-collection/` for `/puzzling/` and keeping the
  rest of the path, the query and the hash. Its hostname test stops it firing
  at shozbot.com, where the same file is served through the rewrite. Do not
  remove that test;
- the studio kit, which puts "by shozbot" under the game's name and counts
  the visit.

GitHub Pages still serves the files; shozbot.com shows them under its own
address. Scores and streaks are saved per address, which is why the old
address forwards.

Before pushing a change, stamp a new version:

```
node tools/stamp.js
```

It tags every file the pages load with the new version, so a reload never
mixes old and new code, and writes `shared/version.json`. A game that is
already open on a phone checks that file when it is opened or brought back to
the front, and refreshes itself if a newer version is out. It never refreshes
in the middle of a puzzle. GitHub can take up to ten minutes to hand out the
new version everywhere.

### App icons

Each game folder has an `icons/` folder and a `manifest.webmanifest`, so
"Add to Home Screen" installs it as its own app with its own name and icon.
The icons follow the studio's style: one bold glyph of flat blocks, azure on
near-black. In every icon the single white piece is the move the game asks
of you. They are all drawn by one tool; edit a glyph there and run:

```
pip install cairosvg pillow
python3 tools/make-icons.py
```

It rewrites every icon size and manifest, and saves a contact sheet of all
of them to `tools/icons-preview.png` for a quick look.

### Packing one game as its own app

Not needed for shozbot.com, which serves the repository as it is. Kept for
putting one game somewhere else on its own. This command copies
a game and everything it needs into `dist/<game>/`, a folder that works on
its own and can be dropped into another site:

```
node tools/package-game.js whittle
node tools/package-game.js all
```

The `dist/` folder is a snapshot and is not kept in the repository. Make
changes here, then pack again.
