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
| Tumble | Rearrange the letters to fit the clue, then find a bonus word in the same letters, in 30 seconds. | 5 puzzles, 2 points each |
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
index.html            The home page. It links to every game.
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
- **How to play.** The **?** button. It opens by itself on a first visit. On
  timed games it also holds the timer switch.
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
answers are used, and the show's name appears nowhere in the games.

## Where the games came from

Each game was first built under the name of the format it copies, which is
the segment name used on CBC Radio's *That's Puzzling!*. The games were
renamed when the collection became Puzzling, so each could stand as its own
app. The original names are kept here for reference; neither they nor the
show's name appear in the games.

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

### Packing one game as its own app

Each game is meant to become its own app on shozbot.com. This command copies
a game and everything it needs into `dist/<game>/`, a folder that works on
its own and can be dropped into another site:

```
node tools/package-game.js whittle
node tools/package-game.js all
```

The `dist/` folder is a snapshot and is not kept in the repository. Make
changes here, then pack again.
