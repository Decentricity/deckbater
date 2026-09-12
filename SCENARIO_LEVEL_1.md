# Level 1 MVP — The Red Package

## Purpose

Teach the complete Deckbater loop with one NPC and one tiny environment:

**hear words -> collect concepts -> gain grammar cards -> combine cards + concepts -> gain access -> continue**

No combat. No conventional dialogue menu.

## Location

Hallway outside Apartment 3B, 1:17 AM.

Nara is standing near the elevator holding a torn-open courier envelope. A basement door is nearby but locked.

## Starting hand

The player knows only:

- `YES`
- `NO`
- `MAYBE`
- `I DUNNO`

No keyword inventory is available at the start.

---

## Turn 1

**NARA**

> You. Were you downstairs ten minutes ago?

New concepts:

- `DOWNSTAIRS`
- `TEN MINUTES AGO`

Player may answer only with one of the four starting cards.

### YES

**PLAYER**

> Yes.

**NARA**

> Then you must have seen him.

Unlock:

- `HIM`

Trust +1.

### NO

**PLAYER**

> No.

**NARA**

> Then somebody else was down there.

Unlock:

- `SOMEBODY ELSE`

### MAYBE

**PLAYER**

> Maybe.

**NARA**

> You don't know whether you were downstairs ten minutes ago?

Trust -1.

### I DUNNO

**PLAYER**

> I don't know.

**NARA**

> That's an incredibly concerning answer.

Trust -1.

Regardless of response:

**NARA**

> Someone took my package.

Unlock:

- `PACKAGE`

Acquire card:

`WHAT IS [THING]?`

Tutorial beat: cards can contain typed slots; concepts fill those slots.

---

## Turn 2

Suggested construction:

`WHAT IS [PACKAGE]?`

**PLAYER**

> What is the package?

**NARA**

> A red courier box. About this big. It was outside my door. Now it's gone.

Unlock:

- `RED`
- `COURIER BOX`
- `MY DOOR`
- `GONE`

Nara continues:

> Eli probably took it.

Unlock:

- `ELI`
- claim: `NARA BELIEVES ELI TOOK PACKAGE`

Acquire card:

`WHO IS [PERSON]?`

---

## Turn 3

Suggested construction:

`WHO IS [ELI]?`

**PLAYER**

> Who is Eli?

**NARA**

> The idiot in 2A. He steals everyone's deliveries and hides them in the basement until people pay him.

Unlock:

- `2A`
- `STEALS`
- `DELIVERIES`
- `BASEMENT`
- `PAY`

Potential facts/claims:

- `ELI LIVES IN 2A`
- claim: `ELI STEALS DELIVERIES`
- claim: `ELI HIDES DELIVERIES IN BASEMENT`

Acquire card:

`IS [THING] IN [PLACE]?`

---

## Turn 4

Suggested construction:

`IS [PACKAGE] IN [BASEMENT]?`

**PLAYER**

> Is the package in the basement?

**NARA**

> Probably. But the basement door is locked.

Unlock:

- `BASEMENT DOOR`
- `LOCKED`
- contextual concept: `KEY`

Mark `PACKAGE IN BASEMENT` as unconfirmed.

Acquire card:

`WHO HAS [THING]?`

---

## Turn 5

The UI should permit bad attempts so typed-slot semantics become visible.

Example invalid construction:

`WHO HAS [BASEMENT DOOR]?`

The card rejects the slot or shakes.

Tutorial implication:

> slots care about meaning, not only grammar.

Suggested valid construction:

`WHO HAS [KEY]?`

**PLAYER**

> Who has the key?

**NARA**

> I do. Why?

Establish fact:

- `NARA HAS KEY`

Acquire card:

`I WANT [THING].`

---

## Turn 6

Suggested construction:

`I WANT [KEY].`

**PLAYER**

> I want the key.

**NARA**

> No. I'm not giving my basement key to someone who might be working with Eli.

Unlock:

- `WORKING WITH ELI`

Acquire card:

`I AM NOT [CONCEPT].`

Important UI beat: Nara's `NO` should visibly resemble the player's own primitive card, suggesting NPCs also operate through conversational actions.

---

## Turn 7

Suggested construction:

`I AM NOT [WORKING WITH ELI].`

**PLAYER**

> I am not working with Eli.

**NARA**

> That's exactly what someone working with Eli would say.

No effect.

Teach implicitly:

> statements are not evidence.

Nara continues:

> If you weren't helping him, you'd help me find my package.

Unlock:

- `HELP NARA`

Acquire card:

`IF [CONDITION], THEN [ACTION].`

This is the first two-slot reasoning card.

---

## Turn 8

Suggested construction:

`IF [HELP NARA], THEN [I WANT KEY].`

Surface rendering may normalize grammar to:

**PLAYER**

> If I help you, then I want the key.

**NARA**

> Fine.

Acquire item:

- `BASEMENT KEY`

Trust +1.

Nara adds:

> But if Eli is down there, don't tell him I sent you.

Unlock:

- `NARA SENT ME`

Acquire card:

`[PERSON] SAID [CLAIM].`

The game does not need to explain this card yet.

---

## End of hallway encounter

The basement door becomes interactable.

Objective:

> Find the red package.

Persistent knowledge should include at least:

- `NARA HAS KEY`
- `ELI LIVES IN 2A`
- claim: `ELI STEALS DELIVERIES`
- claim: `NARA BELIEVES PACKAGE IS IN BASEMENT`
- `NARA DOES NOT WANT ELI TO KNOW SHE SENT PLAYER`

The player unlocks the basement and enters.

---

## Stinger

The basement contains Eli and six unopened packages.

**ELI**

> Did Nara send you?

The original four caveman cards are shown prominently again:

- YES
- NO
- MAYBE
- I DUNNO

All newly learned cards remain available underneath.

Cut to black / demo end.

The punchline is mechanical: the player has gained sophisticated language, but sometimes the primitive `NO` card is still exactly what they need.
