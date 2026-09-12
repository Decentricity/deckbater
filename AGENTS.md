# AGENTS.md

This repository is the source-of-truth design and prototype workspace for **Deckbater**.

## Product definition

Deckbater is a retraux top-down RPG in which conversation is performed by **playing dialogue cards** and filling their semantic slots with concepts learned from the world.

The player must never be presented with a conventional A/B/C dialogue menu as the core mechanic.

The central loop is:

1. explore a tiny 8-bit-style overworld
2. inspect/talk/overhear
3. acquire concepts and facts
4. acquire reusable grammar cards
5. construct utterances from cards + concepts
6. alter NPC state/world state
7. unlock new areas, concepts, facts, and cards

## MVP scope

Implement only enough to prove the loop.

Required:

- top-down tile movement
- one small hallway/overworld area
- one NPC: Nara
- one locked basement entrance
- starting hand: YES / NO / MAYBE / I DUNNO
- concept acquisition from NPC speech
- at least these grammar cards:
  - WHAT IS [THING]?
  - WHO IS [PERSON]?
  - IS [THING] IN [PLACE]?
  - WHO HAS [THING]?
  - I WANT [THING].
  - I AM NOT [CONCEPT].
  - IF [CONDITION], THEN [ACTION].
  - [PERSON] SAID [CLAIM].
- typed slot validation
- Nara can give the basement key
- entering the basement ends the MVP on Eli's question: “Did Nara send you?”

Reference `SCENARIO_LEVEL_1.md` for intended beats.

## Technical constraints

This project targets a js13kGames-style build.

Prefer:

- vanilla JS
- Canvas 2D
- single-page app
- no framework
- no dependency unless there is a compelling size reason
- no remote assets
- no runtime network requirement
- generated/procedural sound via Web Audio
- bit-packed or inline sprite/map data
- deterministic state machine
- keyboard controls first
- touch controls optional but desirable

The final production bundle should be aggressively compressible.

Do not prematurely optimize source readability. Keep development source understandable, then produce a minified contest build separately.

## Visual direction

“Retr(8)aux”: fake 8-bit, not strict hardware emulation.

- logical canvas around 160x144, 256x144, or similarly tiny
- integer nearest-neighbor scale
- tiny palette
- chunky characters
- tile-based world
- card UI may be slightly more elaborate than the world
- avoid antialiased vector-looking art

The point is to look like a forgotten cartridge RPG whose conversation system is strangely sophisticated.

## Game-state model

Keep knowledge structured.

Suggested conceptual state:

```js
state = {
  cards: Set<number>,
  concepts: Set<number>,
  facts: Set<number>,
  items: Set<number>,
  flags: Uint8Array(...),
  trust: { nara: 0 },
  player: { x: 0, y: 0 },
  scene: "hall"
}
```

A concept should have a semantic type such as:

- person
- place
- thing
- action
- claim
- condition
- relationship

A card should define compatible slot types.

Do not make slot compatibility purely textual.

## Dialogue engine

Dialogue should be intent/state driven, not string-match driven.

Example utterance representation:

```js
{
  card: CARD_IS_THING_IN_PLACE,
  args: [CONCEPT_PACKAGE, CONCEPT_BASEMENT]
}
```

Then route through a resolver:

```js
resolveUtterance(utterance, npc, state)
```

The resolver updates state and returns one or more NPC beats and unlocks.

Keep narrative text separate enough that later agents can rewrite prose without rewriting game logic.

## Knowledge rules

Hearing a word does not necessarily create a fact.

Distinguish:

- concept discovered
- claim heard
- fact established
- contradiction discovered

Claims can carry metadata such as source and confidence.

This distinction is important to later deduction mechanics.

## UX rule

The interface should make acquisition satisfying but fast.

When a new concept is heard, briefly flash/highlight it and add it to the concept inventory.

When a new card is learned, make it visually obvious that the player's expressive ability has expanded.

Avoid tutorial walls of text.

## Level 1 success criterion

A fresh player should understand, without documentation, that:

> words are inventory and sentence structures are equipment.

If that realization lands, the MVP works.

## Repository split

This repository contains design, scenario, experiments, and a tiny prototype.

The public playable build should ultimately live in the organization Pages repository:

`deckbater/deckbater.github.io`

Until that repo exists/is writable, `site/index.html` is the canonical web stub to copy there.

## Agent behavior

When modifying the project:

- preserve the core mechanic
- keep the build tiny
- prefer systemic solutions over authored dialogue-option trees
- do not replace card construction with normal dialogue choices
- do not add large libraries for convenience
- keep Level 1 playable after every major change
- update README/SCENARIO docs when mechanics materially change
