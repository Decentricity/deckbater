// Exercise the actual minified build over HTTP using keyboard/mouse inputs.
// The separate story model supplies card/slot indices; it never mutates browser state.
import assert from 'node:assert/strict';
import { readFile, mkdir, readdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { once } from 'node:events';
import vm from 'node:vm';
import puppeteer from 'puppeteer-core';
const root = new URL('../', import.meta.url);
const output = process.env.TEST_OUTPUT || new URL('test/output/', root).pathname;
const firefox = process.env.TEST_BROWSER === 'firefox';
await mkdir(output, { recursive: true });
if (process.platform === 'android') {
  if (firefox) throw new Error('Run Firefox in CI to preserve the Termux native-process budget.');
  let count = 0;
  for (const dir of await readdir('/proc')) {
    if (/^\d+$/.test(dir)) { try { if ((await stat('/proc/' + dir)).uid === process.getuid()) count++; } catch {} }
  }
  if (count >= 29) throw new Error(`Termux process budget: ${count} processes; browser test not started.`);
  console.log(`Termux process count: ${count}. Browser uses single-process mode, no crashpad.`);
}
const body = await readFile(new URL('dist/index.html', root));
const server = createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(body); });
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const base = process.env.TEST_URL || `http://127.0.0.1:${server.address().port}/`;
const errors = [], requests = [];
let browser;
try {
  browser = await puppeteer.launch({
    browser: firefox ? 'firefox' : 'chrome',
    executablePath: process.env.BROWSER_PATH || (process.platform === 'android' ? new URL('test/chromium-termux.sh', root).pathname : '/usr/bin/chromium'),
    headless: true, timeout: 60000,
    args: firefox ? [] : ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote', '--single-process', '--disable-crashpad-for-testing'],
    env: { ...process.env, LD_PRELOAD: '', XDG_CONFIG_HOME: '/tmp', XDG_CACHE_HOME: '/tmp' }
  });
  const page = await browser.newPage();
  console.log('Testing ' + await browser.version());
  await page.setViewport({ width: 1100, height: 760, deviceScaleFactor: 1 });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => requests.push(request.url()));
  const element = { getContext: () => ({}), style: {}, addEventListener() {} };
  const context = vm.createContext({ document: { querySelector: () => element }, window: {},
    innerWidth: 1100, innerHeight: 760, addEventListener() {}, requestAnimationFrame() {} });
  vm.runInContext(await readFile(new URL('src/story.js', root), 'utf8') + '\n' + await readFile(new URL('src/game.js', root), 'utf8'), context);
  const model = code => vm.runInContext(code, context);
  const render = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const press = async key => { await page.keyboard.press(key); await render(); };
  const click = async (x, y) => {
    const b = await page.$eval('canvas', c => { const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    await page.mouse.click(b.x + x * b.w / 256, b.y + y * b.h / 144); await render();
  };
  const screenshot = async name => { await page.screenshot({ path: `${output}/${name}.png` }); };
  const lineContains = async text => {
    const line = await page.$eval('#readout', el => el.textContent);
    assert(line.includes(text), `Expected ${JSON.stringify(text)} in ${JSON.stringify(line)}`);
  };
  let cardPage = 0, npc = 'NARA', pos = [14, 9], map = 0;
  async function open(person) { npc = person; model(`greeting(${person})`); await press('e'); cardPage = 0; }
  async function play(card, args = [], mouse = false) {
    const cards = model('state.returned && ' + npc + '===NARA ? [YES,NO,MAYBE,DUNNO] : state.cards');
    const id = model(card), index = cards.indexOf(id), target = Math.floor(index / 4), count = Math.ceil(cards.length / 4);
    assert(index >= 0, `Card not unlocked: ${card}`);
    for (let i = 0; i < (target - cardPage + count) % count; i++) await press('r');
    if (mouse) await click(30 + index % 4 * 63, 123); else await press(String(index % 4 + 1));
    for (let slot = 0; slot < args.length; slot++) {
      const list = model(`compatible(${card},${slot})`), at = list.indexOf(model(args[slot]));
      assert(at >= 0, `Incompatible ${card} slot ${slot}: ${args[slot]}`);
      for (let i = 0; i < Math.floor(at / 4); i++) await press('r');
      if (mouse) await click(30 + at % 4 * 63, 123); else await press(String(at % 4 + 1));
    }
    if (args.length) { if (mouse) await click(50, 131); else await press('Enter'); }
    model(`resolve(${npc},${card},[${args.join(',')}])`);
    cardPage = args.length ? 0 : target;
    if (model("gained.some(s => s.startsWith('CARD:'))")) cardPage = Math.floor((model('state.cards.length') - 1) / 4);
  }
  async function step(dx, dy, destination) {
    const key = dx < 0 ? 'ArrowLeft' : dx > 0 ? 'ArrowRight' : dy < 0 ? 'ArrowUp' : 'ArrowDown';
    const next = destination || [pos[0] + dx, pos[1] + dy];
    await page.keyboard.down(key);
    try {
      await page.waitForFunction(([x, y]) => {
        const d = document.querySelector('canvas').getContext('2d').getImageData(x * 8 + 4, y * 8 + 19, 1, 1).data;
        return d[0] === 118 && d[1] === 196 && d[2] === 216;
      }, { timeout: 2000, polling: 'raf' }, next);
    } finally { await page.keyboard.up(key); }
    pos = next; await render();
  }
  async function walk(x, y) {
    model(`state.map=${map}; makeMap()`);
    const queue = [[...pos, []]], visited = new Set([pos.join(',')]);
    let route;
    for (let i = 0; i < queue.length; i++) {
      const [cx, cy, path] = queue[i];
      if (cx === x && cy === y) { route = path; break; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy, hash = nx + ',' + ny;
        if (!visited.has(hash) && !model(`blocked(${nx},${ny}) || exits[state.map].some(e => e[0]===${nx} && e[1]===${ny})`)) {
          visited.add(hash); queue.push([nx, ny, [...path, [dx, dy]]]);
        }
      }
    }
    assert(route, `No route on map ${map} from ${pos} to ${x},${y}`);
    for (const [dx, dy] of route) await step(dx, dy);
  }
  await page.goto(base, { waitUntil: 'networkidle0', timeout: 60000 }); await render();
  await screenshot('01-courtyard');
  await open('NARA'); await lineContains('ten minutes');
  await screenshot('02-four-cards');
  await play('DUNNO'); await lineContains('incredibly concerning');
  await play('WHAT', ['PACKAGE'], true); await lineContains('Eli probably');
  await play('WHO', ['ELI']); await play('ISIN', ['PACKAGE', 'BASEMENT']);
  await play('HAS', ['KEY']); await play('WANT', ['KEY']);
  await play('NOT', ['WORKING']); await play('IF', ['HELP', 'GETKEY']);
  await lineContains('Take the key'); await screenshot('03-key-bargain');
  console.log('PASS: opening, typed slots, key bargain through production UI.');
  await press('Escape'); await walk(26, 7); await press('e'); pos = [3, 10]; map = 1;
  await walk(16, 8); await open('ELI'); await play('NO');
  await play('SAID', ['NARA', 'ELITOOK']); await lineContains('Not THAT package');
  await screenshot('04-eli');
  await press('Escape'); await walk(20, 8); await press('e'); await lineContains('No red package');
  model('learn(EMPTY)'); await press('Escape');
  await walk(3, 10); await press('e'); pos = [26, 7]; map = 0;
  await walk(30, 10); await step(1, 0, [1, 10]); map = 2;
  await walk(15, 8); await open('VEE');
  await play('SAID', ['ELI', 'COURIERTOOK']); await lineContains('Mayor ordered');
  await play('WANT', ['SNACKS']); await lineContains('biscuit');
  await screenshot('05-courier');
  console.log('PASS: basement, Eli testimony and courier confrontation.');
  await press('Escape'); await walk(16, 8); await walk(16, 1); await step(0, -1, [16, 13]); map = 3;
  await walk(16, 8); await open('IRIS'); await play('MAYBE'); await lineContains('still say YES');
  await play('YES'); await play('DID', ['IRIS', 'AUTHORIZE']); await play('DID', ['IRIS', 'MAKE']);
  await play('DID', ['IRIS', 'POSE']); await lineContains('relationship has deteriorated');
  await play('DID', ['IRIS', 'LEAVE']); await screenshot('06-iris');
  console.log('PASS: Iris yes/no interview and confirmed facts.');
  await press('Escape'); await walk(16, 13); await step(0, 1, [16, 1]); map = 2;
  await walk(16, 10); await walk(30, 10); await step(1, 0, [1, 10]); map = 4;
  await walk(23, 10); await walk(23, 9); await press('e'); await lineContains('Divine');
  model('learnMany([PROJECTOR,PRISM,MACHINE])'); await press('Escape');
  await walk(15, 9); await walk(15, 8); await open('MAYOR'); await screenshot('07-mayor');
  await play('SAID', ['ELI', 'COURIERTOOK']); await play('SAID', ['VEE', 'ORDERED']);
  await play('BUT', ['MAGIC', 'MACHINE']); await play('BUT', ['CONSENT', 'NOCONSENT']);
  await lineContains('I stole the prism'); await screenshot('08-confession');
  await press('Escape'); await press('n'); await screenshot('09-knowledge'); await press('Escape');
  await walk(1, 10); await step(-1, 0, [30, 10]); map = 2;
  await walk(1, 10); await step(-1, 0, [30, 10]); map = 0;
  await walk(14, 10); await walk(14, 9); await open('NARA'); await lineContains('tell the town');
  await screenshot('10-final-four'); await play('YES'); await lineContains('Prism Day');
  await screenshot('11-ending'); await press('Enter'); model('state = newState()'); pos = [14, 9];
  await open('NARA'); await lineContains('ten minutes'); await screenshot('12-restart');
  // Verify source attribution rendering, cancellation and mouse/touch-sized layout.
  await press('Escape'); await page.click('#restart'); await press('Escape');
  await page.click('#sound'); await page.click('#sound');
  await page.setViewport({ width: 390, height: 700, deviceScaleFactor: 1 }); await render();
  await screenshot('13-mobile');
  await page.reload({ waitUntil: 'networkidle0' }); await render(); await press('e'); await lineContains('ten minutes');
  assert.deepEqual(errors, [], 'Browser console errors');
  assert(requests.every(url => url === base || url.startsWith('data:')), `Unexpected network requests: ${requests.join(', ')}`);
  console.log(`PASS: complete production-build playthrough, restart, refresh, keyboard/mouse, mobile layout; ${requests.length} document requests, no external resources, no console errors.`);
} catch (error) {
  if (browser) { try { const pages = await browser.pages(); await pages.at(-1).screenshot({ path: `${output}/failure.png` }); } catch {} }
  throw error;
} finally {
  if (browser) await browser.close();
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
}
