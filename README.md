# Deckbater

**Deckbater** is a dialogue-heavy retraux RPG where conversation is played with a deck.

Instead of choosing between authored dialogue options A/B/C, the player builds responses from **sentence cards** plus **concepts/keywords** learned from the world.

The name is literal: you debate with a deck.

## Core idea

The player begins socially helpless, with only four caveman cards:

- `YES`
- `NO`
- `MAYBE`
- `I DUNNO`

Talking to people unlocks both:

1. **Concepts** — people, places, objects, claims, motives, events, relationships.
2. **Grammar cards** — reusable sentence structures with typed slots.

Examples:

- `WHAT IS [THING]?`
- `WHO IS [PERSON]?`
- `IS [THING] IN [PLACE]?`
- `WHO HAS [THING]?`
- `I WANT [THING].`
- `I AM NOT [CONCEPT].`
- `IF [CONDITION], THEN [ACTION].`
- `[PERSON] SAID [CLAIM].`

The player therefore does not unlock dialogue lines. They unlock **language**.

## Knowledge is inventory

Anything meaningful heard in conversation can become a reusable concept.

Example:

> Nara: “Eli probably took my package.”

The player may acquire:

- `ELI`
- `PACKAGE`
- `TOOK`
- an unconfirmed claim tying Eli to the package

Later, those concepts can be inserted into unrelated sentence cards.

This allows the player to construct lines the writer never authored verbatim, while still keeping the game deterministic and compact.

## Facts vs concepts

Deckbater distinguishes between ordinary concepts and stronger knowledge objects.

### Concepts
Reusable semantic tokens:

- `PACKAGE`
- `BASEMENT`
- `ELI`
- `KEY`

### Facts
Persistent structured knowledge:

- `NARA HAS KEY`
- `ELI LIVES IN 2A`
- `NARA BELIEVES PACKAGE IS IN BASEMENT`

Facts can unlock stronger dialogue constructions later.

### Confidence
Claims may be:

- confirmed
- unconfirmed
- contradicted
- hearsay

A sentence is not automatically evidence just because the player can say it.

## NPCs have decks too

NPC dialogue should feel like it follows the same conceptual machinery.

An NPC can effectively answer with:

- YES
- NO
- DEFLECT
- LIE
- ASK BACK
- THREATEN
- BARGAIN
- REVEAL

The player gradually learns to recognize conversational patterns as systems rather than menus.

## Overworld

The game has a small top-down 8-bit-style overworld.

Target feel:

- Game Boy / early NES / tiny JRPG
- a handful of compact screens
- chunky 8x8 or 8x16 sprites
- very small palette
- tile-based movement
- NPCs, doors, signs, inspectable objects
- no large art assets

The overworld is not filler: walking around lets the player discover vocabulary before using it in conversations.

Examples:

- read a sign -> learn a place name
- inspect a package -> learn a brand or color
- overhear two NPCs -> acquire a claim
- enter a room -> learn a new location concept

## MVP

The MVP should prove one loop:

**walk -> talk -> hear concepts -> gain cards -> recombine knowledge -> unlock access -> continue**

Level 1 is **The Red Package**.

The player encounters Nara in a hallway. She claims someone stole her red courier package and suspects Eli. The player begins with only `YES / NO / MAYBE / I DUNNO`, then learns progressively stronger grammar until they can negotiate for the basement key.

The level ends when the player enters the basement and meets Eli beside six unopened packages.

See `SCENARIO_LEVEL_1.md`.

## Retr(8)aux presentation

The art direction should be deliberately fake-old rather than slavishly hardware-accurate.

Priorities:

- crisp nearest-neighbor pixel scaling
- minimal animation frames
- expressive portraits or tiny sprites
- simple card UI layered over the retro world
- slightly absurd UI typography and sound cues
- dialogue as the star

The contrast is intentional: an extremely primitive-looking RPG interface hiding a surprisingly expressive language system.

## js13kGames target

Deckbater is being designed for a js13kGames demo, so the architecture should assume an extremely small compressed bundle.

Preferred technical direction:

- vanilla JavaScript
- one `index.html` for the final build if practical
- Canvas 2D
- no external libraries
- no external assets
- procedural or bit-packed sprites
- compact tile maps
- Web Audio-generated bleeps/chiptune
- tiny state machine for conversations
- token IDs instead of repeated prose where useful
- reusable grammar functions instead of storing every possible sentence

The final demo should remain deterministic and playable offline.

## Suggested data model

Cards can be compact templates:

```js
{
  id: 7,
  text: "IS {thing} IN {place}?",
  slots: ["thing", "place"]
}
```

Concepts:

```js
{
  id: 12,
  type: "place",
  text: "BASEMENT"
}
```

A player utterance can then be represented as IDs rather than stored prose:

```js
[7, 3, 12]
```

Meaning:

> IS [PACKAGE] IN [BASEMENT]?

NPC responses should operate on structured intent and world state rather than exact strings.

## Design principle

Deckbater should make the player feel like they are slowly learning how to speak.

Early game:

> YES.

Mid game:

> WHO HAS [KEY]?

Later game:

> IF [CLAIM A] AND [CLAIM B], WHY DID [PERSON] SAY [CONTRADICTORY CLAIM]?

Conversation becomes a form of programming.

## Current repository plan

- `README.md` — concept and direction
- `AGENTS.md` — implementation brief for coding agents
- `SCENARIO_LEVEL_1.md` — scripted MVP encounter
- `site/index.html` — tiny playable browser stub

The production target should eventually live at the `deckbater.github.io` organization Pages repository.