# Puzzling Collection

A small collection of phone-first word games. Everything runs in the browser
with no server, so the site is just plain HTML, CSS and JavaScript files.

Play it here: https://bertrandgroulx-droid.github.io/puzzling-collection/

## How the files are organised

```
index.html            The home page. It links to every game.
missing-link/         One folder per game ...
minus-3/
anagrams/
plus-one/
hear-here/
swap-one/
shared-property/
mash-ups/
  index.html          ... the game page (rules, scoring, look and feel)
  puzzles.js          ... its puzzles. Edit this file to add more.
  daily-2026.js       ... and its daily puzzle schedule for one year (made by a tool, not by hand).
shared/
  style.css           The look shared by six of the games.
  game.js             The game engine shared by six of the games.
  daily.js            The daily-puzzle menu, archive and saved scores, used by all eight games.
  daily.css           The look of that menu.
  keys.js             How each game names a puzzle, so schedules can refer to it.
tools/
  check-puzzles.js    Checks every puzzle file and daily schedule for mistakes.
  make-daily.js       Makes the daily schedule for a new year.
```

Missing Link and Minus 3 are self-contained: each page holds its own styling
and code. The other six games share one stylesheet and one engine in `shared/`,
so a fix there fixes all six at once. Each game folder still has its own page
and its own puzzle file.

## Daily puzzles

Each game opens on a menu with three choices:

- **Today's puzzle.** The same set of puzzles for everyone, numbered by the day
  of the year (No. 1 is January 1) and dated. The first score a player gets on a
  day is saved on their phone and shown in the menu.
- **Practice.** A random set, as many times as you like. Nothing is saved.
- **Past 100 days.** The previous hundred daily puzzles, newest first, with the
  player's score next to any they have played. Tomorrow's puzzle cannot be opened
  early.

Each day's set is written down in advance in the game's `daily-<year>.js` file.
That file is made by a tool and should not be edited, so a day's puzzle stays
the same for everyone. Adding puzzles to `puzzles.js` does not change any day
that is already scheduled.

### Once a year: make next year's schedule

In December, run this in the project folder (it needs Node.js) and push the
result. It writes a `daily-<year>.js` file into every game folder:

```
node tools/make-daily.js 2027
```

The tool refuses to overwrite a year that already exists, so past puzzles are
safe. If a year's file is missing, the menu says so and practice still works.

## The timer switch

Minus 3, Anagrams and Swap One have a clock. Each shows a Timer switch under
its title. It is on by default; a player can turn it off for a relaxed game
with no clock and no time penalties, and the phone remembers the choice.

## Adding puzzles

Open the game's `puzzles.js`. Each line is one puzzle. Copy a line, change the
words, keep the comma at the end, and save. The top of each file explains its
format. In short:

| Game | One puzzle looks like |
| --- | --- |
| Missing Link | `{ link: "LIGHT", hint: "You flip a switch to get it.", clues: ["SUN_", "FLASH_", "_HOUSE"] }` |
| Minus 3 | `{ start: "PLANET", steps: [["Something that grows", "PLANT"], ["A scheme", "PLAN"], ["You fry an egg in it", "PAN"]] }` |
| Anagrams | `{ letters: "HEART", clues: ["The ground beneath you", "Bonus: someone full of dislike"], answers: ["EARTH", "HATER"] }` |
| Plus One | `{ clues: ["A hot drink", "A group of players"], answers: ["TEA", "TEAM"] }` |
| Hear, Here | `{ clues: ["Two of something", "A juicy fruit"], answers: ["PAIR", "PEAR"] }` |
| Swap One | `{ start: "COLD", steps: [["A length of string", "CORD"], ["It comes in a deck", "CARD"], ["Not soft", "HARD"]] }` |
| Shared Property | `{ words: ["SCAR", "CARPET", "OSCAR"], answer: "Each contains CAR", wrong: ["Each is a film term", "Each can follow RED", "Each has two syllables"] }` |
| Mash-Ups | `{ clues: ["You hit it with sticks", "It keeps the rain off"], parts: ["DRUM", "UMBRELLA"], answer: "DRUMBRELLA" }` |

Answers are written in capitals. In Missing Link, the underscore marks where
the link word goes: `"SUN_"` is SUN + LIGHT and `"_HOUSE"` is LIGHT + HOUSE.
Every game draws its puzzles at random from the whole list, so the more
puzzles a file holds, the longer before a player sees a repeat.

All puzzles must be original. The game formats are inspired by a radio show,
but none of the show's clues or answers are used.

### Checking the puzzles (optional)

If you are comfortable with a terminal and have Node.js installed, this
command checks every puzzle file for slips such as an anagram whose letters
do not match, or a Minus 3 step that removes two letters, checks the daily
schedules, and prints how many games each list can supply:

```
node tools/check-puzzles.js
```

## Publishing

The site is published with GitHub Pages from the `main` branch of this
repository. Any change pushed to `main` goes live within a minute or two.
