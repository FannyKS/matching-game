# matching-game

A local HTML/JavaScript matching game. 20 cards on the board, 1-4 players take
turns flipping two cards at a time; matching pairs score a point and are removed.

## Playing

Open `src/index.html` in a browser. On launch, and whenever **New Game** is
clicked, a picker lists the available decks — pick one, choose the number of
players, and the game builds itself from that deck.

## Decks

Decks come from two places:

- **Image folders** — every subfolder of `Image Resources/`, all five of them
  (`Animals`, `Flowers`, `Furniture`, `Fruit`, `Travel`). Folders with no images
  are listed but greyed out and cannot be picked, so the picker always mirrors
  the folders that exist on disk.
- **Classic Emojis** — the built-in emoji set.

Games always deal 20 cards (10 pairs). A pair is built from one image, so a
folder needs 10 images to fill a board. Folders with more images deal a
randomly chosen subset of 10, which varies between games. Folders with fewer
than 10 images deal a smaller board: pairs repeat (up to 4 cards of the same
image, which resolve as two separate matches) so that every image keeps an even
count and the game can always be finished.

## Adding or changing images

In Chrome or Edge you can scan a folder directly — no build step:

1. Click **New Game**, then **Scan a folder…**
2. Pick your `Image Resources` folder
3. Click a folder to play it

The chosen folder is remembered, so **from then on a plain browser reload picks
up any images you have added** — no re-picking the folder, no rebuilding
anything. Folders read this way are marked **live**, and nothing is written to
disk, so you can point it at a completely different folder at any time.

If Chrome ever needs you to confirm access again, a **Reconnect** button
appears; **Forget folder** disconnects it entirely.

Scanning needs the File System Access API, which is Chromium-only, and it
needs a page served over `http://localhost` or `https://` (double-clicking
`index.html` from Finder cannot grant folder access). Safari, Firefox and
`file://` hide the button and fall back to the recorded folder list below.

### Fallback for every browser

Browser JavaScript cannot list a directory on its own, so the folder list is
also baked into a generated manifest (`src/games.js`). After adding, renaming
or removing images, either:

- **Double-click `tools/Update Games.command`** in Finder, then reload the page
  in your browser, or
- run this in Terminal:

  ```sh
  bash tools/generate_games.sh
  ```

Both need nothing beyond what macOS already ships — no Python, Node or npm.
Filenames with spaces are percent-encoded automatically, and the folder may sit
either inside `src/` or beside it.

**Important:** a new folder will not appear, and a folder you just filled will
keep saying "No images", until you rebuild the manifest.

## Layout

| File | Purpose |
| --- | --- |
| `src/index.html` | Markup: board, message area, and the deck / player-setup / settings modals |
| `src/script.js` | All game logic (`MatchingGame`) |
| `src/styles.css` | Styling, card flip animation, responsive grid |
| `src/games.js` | Generated deck manifest — do not edit by hand |
| `tools/generate_games.sh` | Regenerates `src/games.js` from `Image Resources/` |
| `tools/Update Games.command` | Double-clickable wrapper around the above |
