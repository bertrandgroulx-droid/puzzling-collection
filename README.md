# Puzzling Collection

A small collection of phone-first word games. Everything runs in the browser
with no server, so the site is just plain HTML, CSS and JavaScript files.

Play it here: https://bertrandgroulx-droid.github.io/puzzling-collection/

## How the files are organised

```
index.html            The home page. It links to every game.
missing-link/         One folder per game.
  index.html          The game itself (rules, scoring, look and feel).
  puzzles.js          The puzzles. Edit this file to add more.
```

Each game lives entirely in its own folder, so a new game is a new folder
plus one more link on the home page.

## Adding puzzles to Missing Link

Open `missing-link/puzzles.js`. Each line is one puzzle:

```js
{ link: "LIGHT", hint: "You flip a switch to get it.", clues: ["SUN_", "FLASH_", "_HOUSE"] },
```

- `link` is the answer.
- `hint` is shown when the player asks for one (and costs them a point).
- `clues` are the three words shown. Put an underscore where the link goes:
  `"SUN_"` means SUN + LIGHT, `"_HOUSE"` means LIGHT + HOUSE. A space next to
  the underscore makes a two-word phrase, such as `"FULL _"` for FULL MOON.

Copy a line, change the words, keep the comma at the end, and save.
Every game draws five puzzles at random from the whole list.

All puzzles must be original. The game formats are inspired by a radio
show, but none of the show's clues or answers are used.

## Publishing

The site is published with GitHub Pages straight from this repository.
Any change pushed to the published branch goes live within a minute or two.
