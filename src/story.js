// Typed vocabulary, utterances and the entire mystery. No natural-language parser.
// Knowledge tracks independent sources and confirmation; hearing a lie is not proof.
const PERSON = 1, THING = 2, PLACE = 4, ACTION = 8, CLAIM = 16, FACT = 32, CONDITION = 64;
const words = [
  ['NARA', PERSON], ['ELI', PERSON], ['VEE', PERSON], ['MAYOR', PERSON], ['IRIS', PERSON],
  ['PACKAGE', THING], ['KEY', THING], ['PRISM', THING], ['RAINBOW PROJECTOR', THING],
  ['SNACKS', THING], ['DELIVERIES', THING], ['BASEMENT', PLACE], ['2A', PLACE],
  ['TOWN HALL', PLACE], ['MARKET', PLACE], ['RAINBOW PARK', PLACE], ['RAINBOW DAY', THING],
  ['WORKING WITH ELI', CONDITION], ['I HELP NARA', CONDITION], ['I GET THE KEY', ACTION],
  ['TAKE THE PACKAGE', ACTION], ['AUTHORIZE THE TAKING', ACTION], ['MAKE THE RAINBOW', ACTION],
  ['POSE UNDER THE PROJECTOR', ACTION], ['LEAVE THE PARADE', ACTION],
  ['ELI TOOK PACKAGE', CLAIM], ['PACKAGE IN BASEMENT', CLAIM], ['NARA HAS KEY', FACT],
  ['ELI LIVES IN 2A', FACT], ['ELI STEALS DELIVERIES', CLAIM], ['COURIER TOOK PACKAGE', CLAIM],
  ['MAYOR ORDERED COURIER', CLAIM], ['PRISM POWERS PROJECTOR', CLAIM], ['IRIS MAKES RAINBOW', CLAIM],
  ['IRIS AGREED', CLAIM], ['NO RED PACKAGE HERE', FACT], ['PROJECTOR HAS PRISM', FACT],
  ['IRIS DID NOT AGREE', FACT], ['IRIS CANNOT MAKE RAINBOWS', FACT], ['IRIS HATES PROJECTOR', FACT],
  ['IRIS LEFT THE PARADE', FACT], ['PROJECTOR WAS BROKEN', FACT], ['PACKAGE RETURNED', FACT]
];
const [NARA, ELI, VEE, MAYOR, IRIS, PACKAGE, KEY, PRISM, PROJECTOR, SNACKS, DELIVERIES,
  BASEMENT, APT, HALL, MARKET, PARK, DAY, WORKING, HELP, GETKEY, TAKE, AUTHORIZE, MAKE,
  POSE, LEAVE, ELITOOK, INBASE, HASKEY, ELILIVES, ELISTEALS, COURIERTOOK, ORDERED,
  POWER, MAGIC, CONSENT, EMPTY, MACHINE, NOCONSENT, NOMAGIC, HATES, ESCAPED, BROKEN,
  RETURNED] = words.map((_, i) => i);
const templates = [
  ['YES', []], ['NO', []], ['MAYBE', []], ['I DUNNO', []],
  ['WHAT IS [THING]?', [THING]], ['WHO IS [PERSON]?', [PERSON]],
  ['IS [THING] IN [PLACE]?', [THING, PLACE]], ['WHO HAS [THING]?', [THING]],
  ['I WANT [THING].', [THING]], ['I AM NOT [CONDITION].', [CONDITION]],
  ['IF [CONDITION], THEN [ACTION].', [CONDITION, ACTION]],
  ['[PERSON] SAID [CLAIM].', [PERSON, CLAIM | FACT]],
  ['DID [PERSON] [ACTION]?', [PERSON, ACTION]], ['WHY DID [PERSON] [ACTION]?', [PERSON, ACTION]],
  ['YOU SAID [CLAIM], BUT [FACT].', [CLAIM, FACT]]
];
const [YES, NO, MAYBE, DUNNO, WHAT, WHO, ISIN, HAS, WANT, NOT, IF, SAID, DID, WHY, BUT] = templates.map((_, i) => i);
const endings = [
  'The fraud is exposed. Rainbow Day becomes Prism Day. Iris becomes MORE popular. Nobody knows why.',
  'The fake miracle continues. Iris negotiates snacks, shade and a four-day work year.',
  'The newspaper prints: LOCAL RAINBOW ORIGIN UNCLEAR. Iris eats the newspaper.',
  'Everyone stares at you. For a very long time. Iris nods. Finally, someone who gets it.'
];
function newState() {
  return { map: 0, x: 14, y: 9, cards: [YES, NO, MAYBE, DUNNO], known: {},
    nara: 0, key: false, eli: false, vee: false, snack: false, iris: false,
    offer: false, offered: false, debate: 0, returned: false, ending: -1 };
}
let state = newState();
let gained = [];
function learn(id, source = -1, confirmed = false) {
  const old = state.known[id];
  if (!old) {
    state.known[id] = { sources: [], fact: !!(words[id][1] & FACT) };
    gained.push(words[id][0]);
  }
  const entry = state.known[id];
  if (source >= 0 && !entry.sources.includes(source)) entry.sources.push(source);
  if (confirmed && !entry.fact) { entry.fact = true; gained.push('PROVED: ' + words[id][0]); }
}
function learnMany(ids, source = -1) { ids.forEach(id => learn(id, source)); }
function unlock(id) {
  if (!state.cards.includes(id)) { state.cards.push(id); gained.push('CARD: ' + templates[id][0]); }
}
function known(id) { return !!state.known[id]; }
function sourced(id, source) { return !!state.known[id]?.sources.includes(source); }
function compatible(card, slot) {
  return Object.keys(state.known).map(Number).filter(id => {
    const mask = words[id][1] | (state.known[id].fact ? FACT : 0);
    return mask & templates[card][1][slot];
  });
}
function utterance(card, args = []) {
  let slot = 0;
  return templates[card][0].replace(/\[[^\]]+\]/g, () => args[slot] === undefined ? '[...]' : words[args[slot++]][0]);
}
function objective() {
  if (state.ending >= 0) return 'A SMALL GAME ABOUT BIG WORDS.';
  if (state.returned) return 'NARA HAS ONE LAST QUESTION.';
  if (!state.key) return 'NARA LOST A PACKAGE. FIND THE WORDS.';
  if (!sourced(COURIERTOOK, ELI)) return 'BASEMENT: ASK ELI ABOUT THE PACKAGE.';
  if (!state.vee) return 'MARKET: BRING ELI\'S WORDS TO VEE.';
  if (!state.iris) return 'PARK: SNACKS FIRST. ASK IRIS YES/NO QUESTIONS.';
  if (!known(MACHINE)) return 'SQUARE: EXAMINE THE RAINBOW PROJECTOR.';
  return 'MAYOR: TEST HIS STORY WITH YOUR EVIDENCE.';
}
function greeting(npc) {
  if (npc === NARA) {
    if (state.returned) return 'My prism! My damn package! One last thing. Will you tell the town the truth?';
    return state.nara ? (state.key ? 'Found my package? Eli charges storage fees. For theft.' : 'My package is still missing. Your vocabulary looks less missing.') : 'You. Were you downstairs ten minutes ago?';
  }
  if (npc === ELI) {
    if (!state.eli) { state.eli = true; learnMany([ELI, DELIVERIES, TAKE], ELI); unlock(DID); }
    return 'Did Nara send you? These are NOT stolen packages. They are surprise rent.';
  }
  if (npc === VEE) {
    learnMany([VEE, MARKET, SNACKS], VEE);
    return state.vee ? 'Municipal orders. Very official. In hindsight, the glitter was a red flag.' : 'Vee. Courier. If this is about a delivery, please bring a witness. Or a chair.';
  }
  if (npc === IRIS) {
    learnMany([IRIS, PARK, SNACKS], IRIS);
    state.offer = !state.snack;
    return state.snack ? '*IRIS perks up. She can answer YES or NO with her hooves.*' : '*IRIS eyes your pocket. Then a sign: SNACKS? She taps YES with a hoof.*';
  }
  learnMany([MAYOR, MAGIC, CONSENT], MAYOR);
  return state.debate ? mayorHint() : 'Iris makes our rainbow. Iris agreed to everything. Any other allegations require an actual witness.';
}
function mayorHint() {
  if (!(state.debate & 1)) return 'Who actually SAID a courier took the package? Name your source.';
  if (!(state.debate & 2)) return 'A courier taking a box proves nothing. Who SAID I ordered it?';
  if (!(state.debate & 4)) return 'Iris makes our rainbow. Have you personally examined the alleged projector?';
  return 'Iris agreed. Unless you asked the unicorn herself, that claim stands.';
}
// Only these authored responses advance the world. Any compatible utterance can be
// attempted anywhere; unrelated or mistaken combinations get recoverable feedback.
function resolve(npc, card, args = []) {
  gained = [];
  if (!state.cards.includes(card) || args.length !== templates[card][1].length ||
      args.some((id, slot) => !compatible(card, slot).includes(id))) return 'That slot needs a different kind of word.';
  const [a, b] = args;
  if (npc === NARA && state.returned && card < 4) {
    state.ending = card;
    return endings[card];
  }
  if (npc === NARA) {
    if (!state.nara && card < 4) {
      state.nara = 1; learnMany([NARA, PACKAGE], NARA); unlock(WHAT);
      return ['Then you must have seen him.', 'Then somebody else was down there.', 'You are uncertain about your own location?', "That's an incredibly concerning answer."][card] + ' Someone took my package.';
    }
    if (card === WHAT && a === PACKAGE) {
      learnMany([ELI, ELITOOK], NARA); unlock(WHO); state.nara = Math.max(2, state.nara);
      return 'A red courier box. Outside 3B. Now gone. Eli probably took it. Ask me who Eli is.';
    }
    if (card === WHO && a === ELI) {
      learnMany([APT, BASEMENT, ELILIVES, ELISTEALS, DELIVERIES], NARA); unlock(ISIN);
      return 'The idiot in 2A. He hides deliveries in the basement until people pay. Perhaps my package is there.';
    }
    if (card === ISIN && a === PACKAGE && b === BASEMENT) {
      learnMany([INBASE, KEY], NARA); unlock(HAS);
      return 'Probably. That is a suspicion, not a fact. The basement is locked. You need a key.';
    }
    if (card === HAS && a === KEY) {
      learn(HASKEY, NARA); unlock(WANT); return 'I do. Why?';
    }
    if (card === WANT && a === KEY) {
      if (state.key) return 'You already have it. Check your tiny trousers.';
      learn(WORKING, NARA); unlock(NOT);
      return "NO. I'm not giving a key to someone who might be working with Eli.";
    }
    if (card === NOT && a === WORKING) {
      learnMany([HELP, GETKEY], NARA); unlock(IF);
      return "That's exactly what someone working with Eli would say. Help me, and you can have the key. IF. THEN.";
    }
    if (card === IF && a === HELP && b === GETKEY) {
      state.key = true; unlock(SAID);
      return "Fine. Take the key. Basement door, east wall. Don't tell Eli I sent you.";
    }
    if (card === SAID && a === ELI && b === COURIERTOOK && sourced(b, a)) return 'So he is a thief, but not MY thief. Comforting. Find that courier.';
    if (card === WHAT && a === PRISM) return 'My prism. I ordered a sun catcher. Apparently I funded a religion.';
  }
  if (npc === ELI) {
    if (card < 4) return ['I respect a bad liar.', 'Good. A normal amount of lying.', 'Legally, my favorite answer.', 'Finally. Someone less organized than me.'][card] + ' Ask about the package.';
    if ((card === WHAT && a === PACKAGE) || (card === ISIN && a === PACKAGE && b === BASEMENT) ||
        (card === DID && a === ELI && b === TAKE) || (card === SAID && a === NARA && b === ELITOOK && sourced(b, a))) {
      learnMany([COURIERTOOK, HALL, PRISM, DAY], ELI); unlock(WHY); unlock(DID);
      learn(ELISTEALS, ELI, true);
      return 'I steal packages. Not THAT package. Saw a courier take the red one. Said: prism, Town Hall, Rainbow Day. Try the market.';
    }
    if (card === WHY && a === ELI && b === TAKE) return 'Redistribution. Temporarily. Until the original owner pays redistribution fees.';
    if (card === WHAT && a === PRISM) return 'Bends light. Expensive. Nara was expecting one. My boxes contain six identical toilet brushes.';
    if (card === WHO && a === VEE) return 'Yes! Vee. That courier. Boots louder than my conscience.';
  }
  if (npc === VEE) {
    if (card === WANT && a === SNACKS) {
      state.offered = true;
      return 'Have a biscuit. For Iris in the park. Offer it; let her answer your questions. Union rules.';
    }
    if (card === SAID && a === ELI && b === COURIERTOOK && sourced(b, a)) {
      state.vee = true;
      learn(COURIERTOOK, VEE, true);
      learnMany([MAYOR, ORDERED, POWER, PRISM, PROJECTOR, DAY, IRIS, HALL, PARK, AUTHORIZE, MAKE, POSE, LEAVE], VEE);
      unlock(DID); unlock(WHY); unlock(BUT);
      return 'Yes, I took it. Mayor ordered that exact prism for his rainbow projector. Said municipal property. Ask Iris in the park.';
    }
    if (state.vee && ((card === WHY && a === VEE && b === TAKE) || (card === WHO && a === MAYOR)))
      return 'He knew the box held a prism before I opened it. I assumed a sash meant legal authority. Apparently anyone can buy one.';
    if (card === WHAT && a === PROJECTOR && state.vee) return 'Big machine by Town Hall. Pointed at a unicorn. Seems excessive. You should examine it.';
    if (card === WHAT && a === SNACKS) return 'Biscuits. Want one? Iris accepts these instead of complicated sentences.';
    if (card === DID && a === VEE && b === TAKE && !state.vee) return 'Name your witness. Put their words in a SAID card. My union demands a proper accusation.';
  }
  if (npc === IRIS) {
    if (state.offer && card < 4) {
      if (card === YES) {
        state.snack = true; state.offer = false;
        return state.offered ? '*YES. Iris eats Vee\'s biscuit. One hoof: yes. Two: no. Ask DID IRIS...*' : '*YES. Iris extracts an emergency biscuit from your pocket. One hoof: yes. Two: no. Ask DID IRIS...*';
      }
      return '*IRIS waits beside SNACKS? Even a sophisticated person can still say YES.*';
    }
    if (!state.snack) return '*IRIS taps the SNACKS? sign again. The correct grammar here is YES.*';
    if (card === DID && a === IRIS) {
      if (b === AUTHORIZE || b === TAKE) { learn(NOCONSENT, IRIS); }
      if (b === MAKE) { learn(NOMAGIC, IRIS); }
      if (b === POSE) { learn(HATES, IRIS); }
      if (b === LEAVE) { learn(ESCAPED, IRIS); }
      state.iris = known(NOCONSENT) && known(NOMAGIC) && known(HATES);
      if (b === MAKE) return '*NO. Two firm stamps. Iris points at the projector on a poster. Then at a very ordinary unicorn: herself.*';
      if (b === AUTHORIZE || b === TAKE) return '*NO. Two stamps. She crosses out her supposed signature with a hoof. Not subtle.*';
      if (b === POSE) return '*NO! She kicks the poster of herself under the projector. The employment relationship has deteriorated.*';
      if (b === LEAVE) return '*YES. She indicates the exit. Then the snacks. A complete account of her motives.*';
    }
    if (card === WHY || card === SAID || card === BUT) return '*... Iris chews. This is a YES/NO unicorn. Try DID IRIS, then an action.*';
    if (card < 4) return '*Iris nods. Two beings of almost identical eloquence. Try a yes/no question.*';
    return '*IRIS tilts her head. One subject: IRIS. One action. One yes/no question.*';
  }
  if (npc === MAYOR) {
    let bit = 0;
    if (card === SAID && a === ELI && b === COURIERTOOK && sourced(b, a)) bit = 1;
    if (card === SAID && a === VEE && b === ORDERED && sourced(b, a)) bit = 2;
    if (card === BUT && a === MAGIC && b === MACHINE && known(NOMAGIC) && known(MACHINE)) bit = 4;
    if (card === BUT && a === CONSENT && b === NOCONSENT && known(NOCONSENT) && known(HATES)) bit = 8;
    if (bit) {
      const repeated = state.debate & bit;
      state.debate |= bit;
      if (state.debate === 15 && !state.returned) {
        state.returned = true;
        learnMany([BROKEN, RETURNED], MAYOR);
        return 'FINE. The projector broke. I stole the prism. Iris never made rainbows. Tourism is expensive! Take the box back to Nara.';
      }
      if (repeated) return 'That point is already conceded. ' + mayorHint();
      return { 1: 'A witness. Fine. The courier took it. ', 2: 'Fine. I ordered it. In a municipal capacity. ',
        4: 'Fine. The rainbow comes from a machine. The unicorn is... branding. ',
        8: 'Fine. Iris never agreed. I may have translated a sneeze. ' }[bit] + mayorHint();
    }
    if (card === BUT && a === MAGIC && b === MACHINE && !known(NOMAGIC)) return 'Have you asked Iris whether she makes rainbows? A machine alone could just be an accessory.';
    if (card === BUT && a === CONSENT && b === NOCONSENT && !known(HATES)) return 'But did she want to pose under the projector? Ask her. In terms she understands.';
    if (card === WHAT && a === PROJECTOR) return 'Atmospheric equipment. Unicorn-adjacent. Do not examine it too closely.';
    return mayorHint();
  }
  if (card === SAID && !sourced(b, a)) return 'That is not what that person told you. Check the source in your knowledge book [N].';
  if (card < 4) return npc === NARA ? 'A strong position. Perhaps ask about a word I mentioned. The next card page has your new grammar.' : 'Noted. Try asking about the package, or tell me who said what.';
  return 'That sentence works. It does not answer this mystery. Ask about a recent word, or check your knowledge [N].';
}
