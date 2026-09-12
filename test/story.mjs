import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source = await readFile(new URL('../src/story.js', import.meta.url), 'utf8');
const context = vm.createContext({});
vm.runInContext(source, context);
const run = code => vm.runInContext(code, context);
const eq = (code, expected) => assert.equal(run(code), expected, code);
function say(npc, card, args = '') { return run(`resolve(${npc},${card},[${args}])`); }
function tutorial(first) {
  run('state = newState()');
  eq('state.cards.join()', '0,1,2,3'); eq('Object.keys(state.known).length', 0);
  say('NARA', first);
  say('NARA', 'WHAT', 'PACKAGE'); say('NARA', 'WHO', 'ELI');
  eq('compatible(WHO,0).includes(BASEMENT)', false);
  say('NARA', 'ISIN', 'PACKAGE,BASEMENT'); say('NARA', 'HAS', 'KEY');
  say('NARA', 'WANT', 'KEY'); eq('state.key', false);
  say('NARA', 'NOT', 'WORKING'); say('NARA', 'IF', 'HELP,GETKEY');
  eq('state.key', true);
  eq('state.known[INBASE].fact', false);
}
function investigate(eliAnswer = 'NO') {
  run('greeting(ELI)'); say('ELI', eliAnswer);
  say('ELI', 'SAID', 'NARA,ELITOOK');
  eq('sourced(COURIERTOOK,ELI)', true);
  eq('state.known[ELISTEALS].fact', true);
  eq('state.known[ELITOOK].fact', false);
  run('greeting(VEE)');
  say('VEE', 'SAID', 'NARA,COURIERTOOK'); eq('state.vee', false);
  say('VEE', 'SAID', 'ELI,COURIERTOOK'); eq('state.vee', true);
  eq('state.known[COURIERTOOK].fact', true);
  eq('sourced(ORDERED,VEE)', true);
  say('VEE', 'WANT', 'SNACKS'); run('greeting(IRIS)');
  for (const c of ['NO', 'MAYBE', 'DUNNO']) { say('IRIS', c); eq('state.snack', false); }
  say('IRIS', 'YES'); eq('state.snack', true);
  say('IRIS', 'WHY', 'IRIS,MAKE'); eq('known(NOMAGIC)', false);
  say('IRIS', 'DID', 'IRIS,AUTHORIZE'); say('IRIS', 'DID', 'IRIS,MAKE');
  eq('state.iris', false);
  say('IRIS', 'DID', 'IRIS,POSE'); say('IRIS', 'DID', 'IRIS,LEAVE');
  eq('state.iris', true);
  run('learnMany([PROJECTOR,PRISM,MACHINE]); greeting(MAYOR)');
}
const evidence = [ ['SAID', 'ELI,COURIERTOOK'], ['SAID', 'VEE,ORDERED'], ['BUT', 'MAGIC,MACHINE'], ['BUT', 'CONSENT,NOCONSENT'] ];
let routes = 0;
for (const first of ['YES', 'NO', 'MAYBE', 'DUNNO']) {
  for (const end of ['YES', 'NO', 'MAYBE', 'DUNNO']) {
    tutorial(first); investigate(end);
    say('MAYOR', 'SAID', 'ELI,ORDERED'); eq('state.debate', 0);
    say('MAYOR', 'BUT', 'MAGIC,HASKEY'); eq('state.debate', 0);
    for (const [card, args] of evidence) {
      say('MAYOR', card, args);
      if (!run('state.returned')) { const previous = run('state.debate'); say('MAYOR', card, args); eq('state.debate', previous); }
    }
    eq('state.returned', true);
    say('NARA', end); eq('state.ending', run(end));
    routes++;
  }
}
function permutations(list) { return list.length ? list.flatMap((v, i) => permutations(list.filter((_, j) => i !== j)).map(t => [v, ...t])) : [[]]; }
for (const order of permutations([0, 1, 2, 3])) {
  tutorial('DUNNO'); investigate();
  for (const i of order) { const [card, args] = evidence[i]; say('MAYOR', card, args); }
  eq('state.returned', true); routes++;
}
// Check that words alone, unsupported claims and partial unicorn interviews cannot win.
tutorial('MAYBE'); run('greeting(ELI)'); say('ELI', 'WHAT', 'PACKAGE');
run('greeting(VEE)'); say('VEE', 'SAID', 'ELI,COURIERTOOK');
run('learnMany([PROJECTOR,PRISM,MACHINE]); greeting(MAYOR)');
say('MAYOR', 'BUT', 'MAGIC,MACHINE'); eq('state.debate', 0);
run('greeting(IRIS)'); say('IRIS', 'YES'); say('IRIS', 'DID', 'IRIS,AUTHORIZE');
say('MAYOR', 'BUT', 'CONSENT,NOCONSENT'); eq('state.debate', 0);
console.log(`PASS: ${routes} complete story routes, all openings/endings, evidence order, source checks and partial-evidence rejection.`);
