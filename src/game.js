// All graphics, including the 3x5 font, are drawn from compact procedural data.
const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
const ink = '#191827', paper = '#fff1cb', shade = '#34364e', stone = '#69718b';
const rainbow = ['#f17677', '#eea35a', '#f4d35e', '#91c978', '#76c4d8', '#8390e8', '#c792df'];
const palette = [ink, paper, shade, stone, ...rainbow];
const glyphs = {};
('A25755 B65656 C34443 D65556 E74647 F74644 G34553 H55755 I72227 J11152 K55655 L44447 M57755 N57775 O25552 P65644 Q25573 R65655 S34116 T72222 U55557 V55552 W55775 X55255 Y55222 Z71247 ' +
 '025552 126227 261247 371716 455711 574616 634652 771222 825252 925311 .00002 ,00024 :02020 !22202 ?61202 -00700 /11244 [64446 ]31113 (12221 )42224 +02720 =07070 <12421 >42124 \'22000 "55000 *05250 _00007 %51245').split(' ').forEach(s => glyphs[s[0]] = s.slice(1).padStart(5, '0'));
function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x | 0, y | 0, w, h); }
function text(value, x, y, color = paper, max = 64) {
  String(value).toUpperCase().slice(0, max).split('').forEach((ch, n) => {
    const rows = glyphs[ch];
    if (rows) for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++)
      if ((+rows[j]) & (4 >> i)) rect(x + n * 4 + i, y + j, 1, 1, color);
  });
}
function wrap(value, x, y, width, color = paper, maxLines = 4) {
  const lines = [''];
  for (const word of String(value).toUpperCase().split(' ')) {
    let n = lines.length - 1;
    if ((lines[n] + ' ' + word).trim().length * 4 > width && lines[n]) { lines.push(''); n++; }
    lines[n] += (lines[n] ? ' ' : '') + word;
  }
  lines.slice(0, maxLines).forEach((line, i) => text(line, x, y + i * 7, color));
  return lines.length;
}
function box(x, y, w, h, color = stone) {
  rect(x, y, w, h, color); rect(x + 1, y + 1, w - 2, h - 2, ink);
}
function category(id) {
  const k = state.known[id];
  if (k?.fact) return 5;
  return { [PERSON]: 0, [THING]: 1, [PLACE]: 2, [ACTION]: 3, [CLAIM]: 4, [FACT]: 5, [CONDITION]: 6 }[words[id][1]];
}
// Map coordinates are in 8px tiles. Walkable paths connect five compact screens.
const areaNames = ['APARTMENT COURTYARD', 'BASEMENT', 'MARKET STREET', 'RAINBOW PARK', 'TOWN HALL SQUARE'];
const actors = [
  [[NARA, 14, 8], ['door', 26, 6], ['sign', 5, 10]],
  [[ELI, 16, 7], ['boxes', 20, 7], ['stairs', 3, 11]],
  [[VEE, 15, 7], ['sign', 25, 5]],
  [[IRIS, 16, 7], ['sign', 9, 8]],
  [[MAYOR, 15, 7], ['projector', 23, 8], ['sign', 7, 10]]
];
// Exits [tile x, tile y, destination map, destination x, destination y].
const exits = [ [[31, 10, 2, 1, 10]], [],
  [[0, 10, 0, 30, 10], [31, 10, 4, 1, 10], [16, 0, 3, 16, 13]],
  [[16, 14, 2, 16, 1]], [[0, 10, 2, 30, 10]] ];
let tiles = [];
function makeMap() {
  tiles = Array.from({ length: 15 }, (_, y) => Array.from({ length: 32 }, (_, x) => x === 0 || x === 31 || y === 0 || y === 14 ? 1 : 0));
  const fill = (x, y, w, h, type) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) tiles[j][i] = type; };
  fill(1, 10, 30, 2, 2);
  if (state.map === 0) { fill(8, 2, 15, 5, 3); fill(25, 3, 4, 3, 3); }
  if (state.map === 1) { fill(1, 1, 30, 13, 2); fill(7, 3, 4, 2, 4); fill(21, 3, 5, 2, 4); fill(7, 9, 3, 2, 4); }
  if (state.map === 2) { fill(4, 3, 7, 4, 3); fill(21, 2, 6, 3, 3); fill(16, 0, 2, 10, 2); }
  if (state.map === 3) { fill(3, 3, 6, 3, 5); fill(22, 8, 5, 3, 5); fill(15, 10, 3, 5, 2); }
  if (state.map === 4) { fill(9, 1, 15, 5, 3); fill(13, 6, 5, 4, 2); }
  for (const [x, y] of exits[state.map]) tiles[y][x] = 2;
}
function blocked(x, y) {
  return x < 0 || y < 0 || x > 31 || y > 14 || ![0, 2].includes(tiles[y][x]) || actors[state.map].some(a => a[1] === x && a[2] === y);
}
let time = 0, walking = 0;
function person(x, y, who, animate = true) {
  const bob = animate ? ((time / 450 + who) | 0) % 2 : 0;
  rect(x - 4, y + 3, 9, 2, shade);
  if (who === IRIS) {
    rect(x - 5, y - 4, 10, 6, paper); rect(x + 3, y - 8, 4, 7, paper);
    rect(x + 5, y - 12, 1, 5, rainbow[2]); rect(x + 6, y - 7, 1, 1, ink);
    rect(x - 5, y + 2, 2, 3 - bob, paper); rect(x + 2, y + 2, 2, 3, paper);
    rect(x - 7, y - 4, 2, 5 + bob, rainbow[6]); rect(x + 2, y - 8, 2, 4, rainbow[6]);
  } else {
    rect(x - 3, y - 10 - bob, 6, 5, rainbow[1]);
    rect(x - 4, y - 11 - bob, 7, 2, who === ELI ? rainbow[3] : shade);
    rect(x - 2, y - 8 - bob, 1, 1, ink); rect(x + 1, y - 8 - bob, 1, 1, ink);
    rect(x - 4, y - 5 - bob, 8, 6, who < 0 ? rainbow[4] : rainbow[who % 7]);
    rect(x - 3, y + 1, 2, 3 + bob, ink); rect(x + 1, y + 1, 2, 4 - bob, ink);
    if (who === MAYOR) { rect(x - 3, y - 14 - bob, 6, 3, ink); rect(x - 3, y - 3 - bob, 6, 1, paper); }
    if (who === VEE) rect(x + 2, y - 4, 4, 5, rainbow[1]);
    if (who === NARA) rect(x + 4, y - 3, 4, 3, state.returned ? rainbow[0] : paper);
  }
}
function drawWorld() {
  const map = state.map;
  for (let y = 0; y < 15; y++) for (let x = 0; x < 32; x++) {
    const px = x * 8, py = y * 8 + 16, type = tiles[y][x];
    rect(px, py, 8, 8, type === 0 ? (map === 3 ? '#365c47' : '#42584c') : type === 1 ? shade : type === 2 ? (map === 1 ? shade : '#88745d') : type === 5 ? rainbow[5] : stone);
    if (type === 0 && (x * 7 + y * 11) % 9 === 0) { rect(px + 2, py + 3, 1, 2, rainbow[3]); rect(px + 4, py + 2, 1, 2, rainbow[3]); }
    if (type === 1 && map !== 1) { rect(px + 1, py, 6, 5, '#365c47'); rect(px + 3, py + 5, 2, 2, '#88745d'); }
    if (type === 2) rect(px, py + 7, 7, 1, map === 1 ? stone : '#6e6054');
    if (type === 3) { rect(px + 1, py + 1, 6, 6, shade); if (y % 2) rect(px + 2, py + 2, 4, 3, rainbow[2]); }
    if (type === 4) { rect(px + 1, py + 1, 6, 6, rainbow[1]); rect(px + 3, py + 1, 1, 6, paper); }
    if (type === 5) rect(px + ((time / 500 + y) | 0) % 5, py + 4, 3, 1, rainbow[4]);
  }
  if (map === 0) { text('3B', 106, 37); text('2A', 151, 37); text('BASEMENT', 199, 31); text('MARKET >', 208, 117); }
  if (map === 1) { text('SURPRISE RENT', 99, 31, rainbow[1]); text('UP', 22, 95); }
  if (map === 2) { text('BAKERY', 35, 35); text('PARK ^', 117, 26); text('< APTS', 7, 116); text('HALL >', 227, 116); }
  if (map === 3) {
    text('RAINBOW PARK', 76, 30); text('MARKET V', 113, 118);
    for (let i = 0; i < 7; i++) { rect(190 + i * 2, 40 - i * 2, 22 - i * 2, 2, rainbow[i]); rect(210 - i * 2, 42 - i * 2, 2, 12 + i * 2, rainbow[i]); }
  }
  if (map === 4) {
    text('TOWN HALL', 98, 24); text('RAINBOW DAY', 94, 64, rainbow[(time / 500 | 0) % 7]);
    for (let i = 0; i < 7; i++) rect(190 + i, 38 + i * 2, 36 - i, 2, rainbow[i]);
  }
  for (const [id, x, y] of actors[map]) {
    const px = x * 8 + 4, py = y * 8 + 20;
    if (typeof id === 'number') person(px, py, id);
    else if (id === 'projector') {
      rect(px - 5, py - 7, 10, 9, stone); rect(px - 2, py - 5, 4, 4, state.returned ? ink : rainbow[0]);
      rect(px + 5, py - 6, 3, 6, rainbow[2]); rect(px - 4, py + 2, 2, 4, ink); rect(px + 2, py + 2, 2, 4, ink);
    } else if (id === 'boxes') {
      rect(px - 7, py - 7, 14, 9, rainbow[1]); rect(px - 1, py - 7, 2, 9, paper);
    } else if (id === 'door' || id === 'stairs') {
      rect(px - 5, py - 10, 10, 14, ink);
      if (id === 'door') { rect(px - 4, py - 9, 8, 12, shade); rect(px + 2, py - 3, 1, 2, state.key ? rainbow[3] : rainbow[0]); }
      else for (let i = 0; i < 4; i++) rect(px - 4, py - 7 + i * 3, 8, 1, paper);
    } else { rect(px - 1, py - 3, 2, 7, shade); rect(px - 5, py - 8, 10, 7, rainbow[1]); text('?', px - 1, py - 7, ink); }
  }
  person(state.x * 8 + 4, state.y * 8 + 20, -1, walking > time);
  const target = nearby();
  if (target && mode === 'world') { box(target[1] * 8, target[2] * 8 + 2, 8, 8, paper); text('E', target[1] * 8 + 2, target[2] * 8 + 3); }
  rect(0, 0, 256, 14, ink); text('DECKBATER', 4, 2, rainbow[2]); text(areaNames[map], 48, 2);
  text(state.key ? 'KEY +' : 'KEY -', 4, 9, state.key ? rainbow[3] : stone);
  text('N: WORDS ' + Object.keys(state.known).length + '  M: SOUND', 48, 9, stone);
  rect(0, 136, 256, 8, ink); text(target ? 'E: ' + (typeof target[0] === 'number' ? 'TALK TO ' + words[target[0]][0] : 'EXAMINE') : 'WALK: WASD/ARROWS   TAP: WALK/TALK', 4, 138);
}
let mode = 'world', npc = -1, line = '', said = '', selected = -1, args = [], page = 0, focus = 0;
let buttons = [], choices = [], toast = [], toastUntil = 0, lastMode = 'world', restartMode = 'world';
let dealt = 0;
let audio, muted = true;
function beep(note = 0) {
  if (muted) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume().catch(() => {});
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = 'square'; oscillator.frequency.value = 220 * 2 ** (note / 12);
    gain.gain.setValueAtTime(.025, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .09);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .1);
  } catch { /* Audio must never block a turn. */ }
}
function announce() {
  document.querySelector('#readout').textContent = line + ' ' + gained.join('. ');
  if (gained.length) { toast = [...gained]; toastUntil = time + Math.max(2800, toast.length * 1100); beep(12); }
}
function nearby() { return actors[state.map].find(a => Math.abs(a[1] - state.x) + Math.abs(a[2] - state.y) <= 1); }
function enter(map, x, y) { state.map = map; state.x = x; state.y = y; makeMap(); beep(5); }
function move(dx, dy) {
  if (mode !== 'world') return;
  const x = state.x + dx, y = state.y + dy;
  if (blocked(x, y)) return;
  state.x = x; state.y = y; walking = time + 140;
  const exit = exits[state.map].find(a => a[0] === x && a[1] === y);
  if (exit) enter(exit[2], exit[3], exit[4]);
}
function talk() {
  const target = nearby();
  if (!target) return;
  const id = target[0];
  gained = []; said = ''; page = focus = 0; selected = -1;
  if (typeof id === 'number') {
    npc = id; mode = 'talk'; line = greeting(id);
  } else if (id === 'door' && state.key) { enter(1, 3, 10); return; }
  else if (id === 'stairs') { enter(0, 26, 7); return; }
  else {
    npc = -1; mode = 'inspect';
    if (id === 'door') line = 'Locked. Nara knows who has the key. Ask her about the package first.';
    if (id === 'boxes') { learn(EMPTY); line = 'Six unopened boxes. All beige. Six toilet brushes. No red package. Eli is guilty of something else.'; }
    if (id === 'projector') {
      if (state.returned) line = 'The machine is dark. A small plaque says: MIRACLE, ELECTRIC. Nara has your last conversation.';
      else { learnMany([PROJECTOR, PRISM, MACHINE]); line = 'A rainbow PROJECTOR. Inside: a prism in a red box addressed to NARA, 3B. The cable goes to a wall socket. Divine.'; }
    }
    if (id === 'sign') {
      if (state.map === 0) line = 'APARTMENTS. 3B: Nara. 2A: Eli. Basement: locked. Market: east. Please stop mailing toilet brushes.';
      if (state.map === 2) { learnMany([DAY, PARK, HALL]); line = 'RAINBOW DAY! Iris makes miracles! Park north. Town Hall east. All purchases final, including miracles.'; }
      if (state.map === 3) { learnMany([SNACKS, IRIS]); line = 'IRIS. Do not feed complicated questions. YES/NO questions welcome. Snacks extremely welcome.'; }
      if (state.map === 4) { learn(MAGIC, MAYOR); line = 'BY ORDER OF THE MAYOR: Iris makes our rainbow. Please credit the unicorn in all photographs.'; }
    }
  }
  dealt = time; announce(); beep();
}
function hand() { return state.returned && npc === NARA ? [YES, NO, MAYBE, DUNNO] : state.cards; }
function play(card, values) {
  said = utterance(card, values);
  line = resolve(npc, card, values);
  selected = -1; args = []; mode = state.ending >= 0 ? 'ending' : 'talk';
  // Newly learned grammar is dealt immediately. All prior cards remain in the deck.
  if (gained.some(s => s.startsWith('CARD:'))) page = Math.floor((hand().length - 1) / 4);
  dealt = time; focus = 0; announce(); beep(7);
}
function choose(index) {
  const id = choices[index];
  if (id === undefined) return;
  focus = index; beep(2);
  if (mode === 'talk') {
    if (!templates[id][1].length) play(id, []);
    else { selected = id; args = []; mode = 'slot'; page = focus = 0; }
  } else if (mode === 'slot') {
    args.push(id);
    if (args.length === templates[selected][1].length) { mode = 'confirm'; page = focus = 0; }
    else { page = focus = 0; }
  }
}
function changePage(delta) {
  const all = mode === 'talk' ? hand() : mode === 'slot' ? compatible(selected, args.length) : Object.keys(state.known).map(Number);
  const count = mode === 'talk' ? 4 : 4;
  page = (page + delta + Math.max(1, Math.ceil(all.length / count))) % Math.max(1, Math.ceil(all.length / count));
  focus = 0;
}
function back() {
  if (mode === 'restart') { mode = restartMode; return; }
  if (mode === 'book') { mode = lastMode; page = focus = 0; return; }
  if (mode === 'slot' || mode === 'confirm') { mode = 'talk'; selected = -1; args = []; page = focus = 0; return; }
  if (mode === 'ending') return;
  mode = 'world'; npc = -1; selected = -1;
}
function notebook() {
  if (mode === 'restart') return;
  if (mode === 'book') { back(); return; }
  lastMode = mode; mode = 'book'; page = focus = 0;
}
function restart() {
  state = newState(); mode = 'world'; npc = -1; said = line = ''; selected = -1;
  args = []; page = focus = 0; toast = []; gained = []; held = {}; makeMap(); announce();
}
function askRestart() { if (mode === 'ending') restart(); else if (mode !== 'restart') { restartMode = mode; mode = 'restart'; } }
function button(x, y, w, h, title, action, color = paper, active = false) {
  box(x, y, w, h, active ? rainbow[2] : color);
  wrap(title, x + 3, y + 3, w - 6, color, 4);
  buttons.push({ x, y, w, h, action });
}
function drawUI() {
  buttons = []; choices = [];
  if (mode === 'ending') {
    rect(0, 14, 256, 130, ink);
    for (let i = 0; i < 7; i++) rect(13, 20 + i * 2, 230, 2, rainbow[i]);
    text('DECKBATER', 110, 23, ink); text('YOU DEBATE WITH A DECK.', 86, 38, rainbow[2]);
    wrap(endings[state.ending], 16, 54, 224, paper, 5);
    text('PACKAGE: RETURNED. UNICORN: JUST A UNICORN.', 16, 91, rainbow[3]);
    text('BY DECENTRICITY / JS13KGAMES 2026', 16, 102, stone);
    text('THANK YOU FOR FINDING THE WORDS.', 16, 111);
    button(80, 122, 96, 16, 'ENTER: PLAY AGAIN', restart, rainbow[2]); return;
  }
  if (mode === 'restart') {
    box(24, 48, 208, 55, paper); text('RESTART AND LOSE THIS RUN?', 36, 57);
    button(36, 75, 88, 18, 'ENTER: RESTART', restart, rainbow[0]);
    button(132, 75, 88, 18, 'ESC: CANCEL', back); return;
  }
  if (mode === 'book') {
    box(2, 16, 252, 126, paper); text('KNOWLEDGE / ESC: BACK', 8, 21, rainbow[2]);
    wrap(objective(), 8, 30, 240, paper, 2);
    const ids = Object.keys(state.known).map(Number), total = Math.max(1, Math.ceil(ids.length / 4));
    page %= total;
    ids.slice(page * 4, page * 4 + 4).forEach((id, i) => {
      const k = state.known[id], y = 48 + i * 19;
      rect(8, y, 2, 13, rainbow[category(id)]); text(words[id][0], 14, y, rainbow[category(id)]);
      text((k.fact ? 'FACT' : words[id][1] === CLAIM ? 'CLAIM' : 'WORD') + ' / ' + (k.sources.map(s => words[s][0]).join(', ') || 'EXAMINED'), 14, y + 7, stone);
    });
    if (!ids.length) wrap('Empty pockets. Empty vocabulary. Talk to Nara.', 10, 52, 230);
    button(8, 125, 40, 12, '< PREV', () => changePage(-1));
    text(page + 1 + '/' + total + '    WORD / CLAIM / FACT', 56, 128, stone);
    button(208, 125, 40, 12, 'NEXT >', () => changePage(1)); return;
  }
  if (mode === 'world') {
    if (time < 9000 && !state.nara) { box(9, 116, 238, 17); text('YOU DEBATE WITH A DECK. E: TALK TO NARA.', 15, 122, rainbow[2]); }
  } else {
    const preview = mode === 'slot' || mode === 'confirm' ? utterance(selected, args) : said;
    rect(2, 32, 252, 15, ink); wrap(preview ? '> ' + preview : 'YOU DEBATE WITH A DECK.', 7, 34, 240, rainbow[4], 2);
    box(2, 48, 252, 47, paper);
    text(npc >= 0 ? words[npc][0] : 'EXAMINE', 8, 51, rainbow[2]);
    if (npc === MAYOR) text('EXCUSES ' + (4 - state.debate.toString(2).replace(/0/g, '').length) + '/4', 150, 51, rainbow[0]);
    text('ESC: LEAVE', 208, 51, stone);
    wrap(line, 8, 61, 240, paper, 4);
    rect(0, 96, 256, 48, ink);
    if (mode === 'inspect') { button(85, 110, 87, 22, 'ENTER: BACK', back); return; }
    if (mode === 'confirm') {
      wrap(utterance(selected, args), 7, 98, 242, rainbow[4], 3);
      button(7, 122, 118, 19, 'ENTER: PLAY SENTENCE', () => play(selected, args), rainbow[2]);
      button(131, 122, 118, 19, 'ESC: CANCEL', back); return;
    }
    const all = mode === 'slot' ? compatible(selected, args.length) : hand(), total = Math.max(1, Math.ceil(all.length / 4));
    page %= total; choices = all.slice(page * 4, page * 4 + 4);
    button(2, 97, 20, 9, '<', () => changePage(-1), stone);
    text(mode === 'slot' ? 'SLOT ' + (args.length + 1) + ': ' + templates[selected][0].match(/\[([^\]]+)\]/g)[args.length] : 'YOUR DECK', 26, 99, rainbow[2]);
    text((page + 1) + '/' + total + '  Q/R: PAGE', 169, 99, stone);
    button(236, 97, 18, 9, '>', () => changePage(1), stone);
    choices.forEach((id, i) => {
      const x = 2 + i * 63, color = mode === 'slot' ? rainbow[category(id)] : rainbow[(id < 4 ? 6 : templates[id][1][0] === PERSON ? 0 : id >= 10 ? 6 : 1)];
      const title = mode === 'slot' ? words[id][0] : templates[id][0];
      const lift = mode === 'talk' ? Math.max(0, 7 - (time - dealt - i * 25) / 20) | 0 : 0;
      button(x, 108 + lift, 61, 34, (i + 1) + '. ' + title, () => choose(i), color, i === focus);
    });
    if (!choices.length) text('NO MATCHING WORDS YET. ESC TO EXPLORE.', 7, 120, stone);
  }
  if (toastUntil > time && toast.length) {
    const i = Math.min(toast.length - 1, Math.floor((time - (toastUntil - Math.max(2800, toast.length * 1100))) / 1100));
    const y = mode === 'world' && state.y < 3 ? 119 : 16;
    box(3, y, 250, 13, rainbow[3]); text('+ ' + toast[Math.max(0, i)], 7, y + 4, rainbow[3], 60);
  }
}
let held = {}, nextStep = 0;
function key(event) {
  const k = event.key.toLowerCase();
  if (event.target?.tagName === 'BUTTON') return;
  if (['tab', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) event.preventDefault();
  if (event.repeat) return;
  held[k] = true;
  if (k === 'm') { toggleSound(); return; }
  if (k === 'n') { notebook(); return; }
  if (k === 'escape') { back(); return; }
  const action = k === 'enter' || k === ' ' || k === 'e';
  if (mode === 'world') { if (action) talk(); return; }
  if (mode === 'ending') { if (action) restart(); return; }
  if (mode === 'restart') { if (action) restart(); return; }
  if (mode === 'inspect') { if (action) back(); return; }
  if (mode === 'confirm') { if (action) play(selected, args); return; }
  if (k === 'q' || k === 'pageup') { changePage(-1); return; }
  if (k === 'r' || k === 'pagedown') { changePage(1); return; }
  if (mode === 'book') { if (k.startsWith('arrow')) changePage(k === 'arrowleft' || k === 'arrowup' ? -1 : 1); return; }
  if (k === 'arrowleft' || k === 'arrowup') { if (focus > 0) focus--; else { changePage(-1); focus = 3; } return; }
  if (k === 'tab' || k === 'arrowright' || k === 'arrowdown') {
    if (focus + 1 < choices.length) focus++; else { changePage(1); focus = 0; } return;
  }
  if ('1234'.includes(k) && k.length === 1) choose(+k - 1);
  else if (action) choose(Math.min(focus, choices.length - 1));
}
function toggleSound() {
  muted = !muted; document.querySelector('#sound').textContent = 'M: sound ' + (muted ? 'off' : 'on'); beep(12);
}
addEventListener('keydown', key);
addEventListener('keyup', e => delete held[e.key.toLowerCase()]);
addEventListener('blur', () => held = {});
document.querySelector('#book').onclick = () => { notebook(); canvas.focus(); };
document.querySelector('#sound').onclick = () => { toggleSound(); canvas.focus(); };
document.querySelector('#restart').onclick = () => { askRestart(); canvas.focus(); };
canvas.addEventListener('pointerdown', e => {
  e.preventDefault(); canvas.focus();
  const bounds = canvas.getBoundingClientRect(), x = (e.clientX - bounds.left) * 256 / bounds.width, y = (e.clientY - bounds.top) * 144 / bounds.height;
  const b = buttons.find(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
  if (b) { b.action(); return; }
  if (mode !== 'world') return;
  const dx = Math.round((x - 4) / 8) - state.x, dy = Math.round((y - 20) / 8) - state.y;
  if (nearby() && Math.abs(dx) + Math.abs(dy) <= 2) talk();
  else if (Math.abs(dx) > Math.abs(dy)) move(Math.sign(dx), 0);
  else if (dy) move(0, Math.sign(dy));
});
function resize() {
  const scale = Math.min(innerWidth / 256, Math.max(1, (innerHeight - 72) / 144));
  const integer = scale >= 1 ? Math.floor(scale) : scale;
  canvas.style.width = 256 * integer + 'px'; canvas.style.height = 144 * integer + 'px';
}
addEventListener('resize', resize);
function frame(t) {
  time = t;
  if (mode === 'world' && t >= nextStep) {
    let dx = (held.d || held.arrowright ? 1 : 0) - (held.a || held.arrowleft ? 1 : 0);
    let dy = (held.s || held.arrowdown ? 1 : 0) - (held.w || held.arrowup ? 1 : 0);
    if (dx || dy) { if (dx) dy = 0; move(dx, dy); nextStep = t + 95; }
  }
  ctx.imageSmoothingEnabled = false; drawWorld(); drawUI(); requestAnimationFrame(frame);
}
makeMap(); resize(); requestAnimationFrame(frame);
