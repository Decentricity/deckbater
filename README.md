# DECKBATER

**[Play at deckbater.github.io](https://deckbater.github.io/)** — you debate with a deck.

A complete, tiny retraux RPG about a missing red package, an extremely guilty goblin, and a unicorn with absolutely no rainbow qualifications. Five compact areas, five characters, one mystery, four endings. Made for js13kGames 2026's **Unicorns and Rainbows** theme.

Start with `YES`, `NO`, `MAYBE`, and `I DUNNO`. Learn reusable sentence cards and fill their typed slots with words discovered around town. Carry one person's testimony into another conversation. Separate claims from confirmed facts, question Iris in terms she understands, and dismantle the Mayor's excuses with evidence from different sources.

**Knowledge is inventory. Grammar is progression.** This is a card-and-concept system, not a menu of prewritten dialogue choices: 15 card structures and 43 vocabulary/evidence entries. Rainbow colors identify people, objects, places, actions, claims, facts and conditions; the knowledge book also labels their type and source in text.

## Controls

- WASD / arrows: walk. E / Enter / Space: interact with the adjacent character or object.
- 1–4: choose a visible card or compatible concept. Fill each slot, then Enter to play the assembled sentence.
- Q / R or Page Up / Down: change card/concept pages. Arrows / Tab: navigate cards. Mouse: click cards, words and page arrows.
- Esc: cancel a sentence or leave a conversation. N: knowledge and current lead. M: optional sound.
- Restart button: start over; Enter restarts after the credits. Progress is not saved across refreshes.
- Touch: tap toward a destination to step; tap an adjacent character to talk. Desktop is the primary target.

## Build and test

Requires Node.js 24 (build verified with 24.13.0). Dependencies are development-only.

```sh
npm ci --ignore-scripts
npm test
npm run build
npm run size
```

Current submission ZIP: **11,591 / 13,312 bytes**. `build` and `size` both regenerate `dist/index.html` and `dist/deckbater.zip`, print exact archive bytes, and fail above the absolute 13,312-byte ceiling. Terser minifies readable sources; pinned Pako compression and fixed ZIP metadata reproduce the archive across platforms without depending on the host's zlib. The ZIP contains only `index.html`, including all code, maps, pixel glyphs, graphics and procedural audio. No runtime downloads, external requests, fonts, assets, libraries or backend.

Open `dist/index.html` directly, or serve `dist/` with any static server. `site/index.html` redirects to this build for the original prototype's entry point.

`npm test` covers 40 complete story routes, every opening/ending, evidence order, and rejection of unsupported testimony. It also checks ZIP reproduction, README size and the hard-limit failure using an oversized fixture. For an actual production-build playthrough in an installed browser:

```sh
BROWSER_PATH=/usr/bin/chromium npm run test:browser
TEST_BROWSER=firefox BROWSER_PATH=/path/to/firefox npm run test:browser
```

The browser suite serves the minified build over HTTP, walks all five maps, uses keyboard and mouse inputs, constructs every required sentence, checks the ending/restart/refresh, captures screenshots and rejects console errors or external requests. Chrome and Firefox run sequentially in GitHub Actions. On Termux, use `TEST_OUTPUT=/storage/emulated/0/Download/deckbater-test node test/browser.mjs` directly to save process overhead; its adapter uses the installed Debian Chromium, with one process and no crashpad. Firefox testing runs in CI. All temporary servers and browsers close when tests finish.

## Source and publishing

This repository, **[Decentricity/deckbater](https://github.com/Decentricity/deckbater)**, owns `src/`, `build/`, tests, and the generated competition artifacts. `SCENARIO_LEVEL_1.md` preserves the original Nara design and documents its continuation.

**[deckbater/deckbater.github.io](https://github.com/deckbater/deckbater.github.io)** is only the deployment target. Its root `index.html` is a byte-for-byte copy of `dist/index.html`, published from `main` by GitHub Pages. Make changes here, pass tests and size checks, then copy the valid build there and commit/push both repositories. Never maintain a separate Pages implementation.
