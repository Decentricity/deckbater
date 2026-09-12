# DECKBATER implementation rules

## Source of truth and delivery

- Canonical development: `Decentricity/deckbater`. Read `README.md`, `src/story.js`, `src/game.js` and the relevant tests before changing behavior.
- Deployment only: `deckbater/deckbater.github.io`. Its root `index.html` must be an exact copy of the latest valid `dist/index.html`; no divergent code or extra gameplay dependencies.
- After production changes, run `npm test`, `npm run size`, and the browser suite when behavior/UI changed. Update the exact ZIP size in README. Commit source and generated artifacts; copy and push the valid build to the Pages repository.
- `site/index.html` is a redirect for the old prototype entry point. Edit `src/`, never generated `dist/` or deployed `index.html` by hand.

## Hard competition budget

- js13kGames 2026, theme **Unicorns and Rainbows**. Absolute limit: **13,312 ZIP bytes**, including ZIP headers. Aim below 11.5 KiB when possible.
- `npm run build` and `npm run size` must create `dist/deckbater.zip`, report its exact byte count and exit nonzero above the limit. Never bypass the guard or hide files outside the archive.
- Everything needed to play ships in one `index.html`: vanilla JS, Canvas 2D, procedural art/font/audio. No network, APIs, external fonts, assets, runtime packages or frameworks.
- Development dependencies do not ship. Keep source readable and let Terser/DEFLATE do the golfing. Measure every production change.

## Preserve the game

- This is a COMPLETE short RPG, not a Level 1 demo. Preserve the Nara → Eli → Vee → Iris → Mayor → Nara ending loop and restart.
- Start with exactly YES / NO / MAYBE / I DUNNO and no vocabulary. Return to those four cards for the final decision.
- Conversation is reusable templates + compatible learned concepts. Do not replace it with prefilled dialogue choices, a natural-language parser, free typing, combat, or an LLM.
- Keep concept, sourced claim, and confirmed fact distinct. A source must actually have said a claim before attributed testimony advances the story.
- The Mayor requires evidence from Eli, Vee and Iris plus the examined projector. Repeated evidence must not stack. Evidence may be played in any order.
- All opening replies must permit completion. Wrong cards, wrong sources, leaving a conversation, and canceling a slot must be recoverable. Never consume essential knowledge.
- Iris answers yes/no questions. Her simple communication mirrors the player at the opening. Unicorns and rainbows are central to the mystery and knowledge categories.
- Keep dry, short writing, fast walking, 256×144 pixel rendering, small expressive sprites and a limited palette. Desktop first; mobile/save extras must earn their compressed bytes.

## Implementation map

- `src/story.js`: typed vocabulary, grammar, knowledge provenance, dialogue resolver and quest flags. IDs are array indices; keep destructuring aligned with the dictionaries.
- `src/game.js`: five tile maps, collision, inspection, bitmap drawing, card/slot UI, keyboard/pointer input and optional bleeps.
- `src/index.html`: minimal shell; `/* GAME */` is replaced at build time.
- `build/build.mjs`: Terser and deterministic single-entry ZIP, strict size guard.
- `test/story.mjs`: complete story routes and evidence invariants.
- `test/archive.mjs`: ZIP integrity/reproduction, current README size and an oversized-build rejection test.
- `test/browser.mjs`: drives the actual minified game with ordinary inputs; its separate planning model must never mutate browser game state.
- `.github/workflows/check.yml`: build, story tests, then Chrome and Firefox playthroughs in sequence.

## This Termux installation

- Preserve the parent process budget. Do not spawn subagents. Run shell/process tools sequentially, use one test/browser at a time, and never leave servers or watchers running.
- Before heavy commands count same-UID processes; at 29 or more, stop that command. Keep transient native children to at most three.
- Run browser tests via `node test/browser.mjs` here, avoiding npm's extra shell. The supplied Chromium adapter is phone-specific. Run Firefox in CI rather than starting a multiprocess Firefox on this phone.
- Store screenshots, downloadable ZIP copies and other user-facing outputs under `/storage/emulated/0/Download/`; source and generated repository artifacts remain in their requested repo paths.
