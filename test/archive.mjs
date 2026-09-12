import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const archive = await readFile(new URL('dist/deckbater.zip', root));
const html = await readFile(new URL('dist/index.html', root));
assert(archive.length <= 13312);
assert.equal(archive.readUInt32LE(0), 0x04034b50);
assert.equal(archive.subarray(30, 40).toString(), 'index.html');
assert.deepEqual(inflateRawSync(archive.subarray(40, 40 + archive.readUInt32LE(18))), html);
await import('../build/build.mjs');
assert.deepEqual(await readFile(new URL('dist/deckbater.zip', root)), archive, 'Build must reproduce identical ZIP bytes');
assert((await readFile(new URL('README.md', root), 'utf8')).includes(archive.length.toLocaleString('en-US') + ' / 13,312 bytes'), 'README ZIP count is stale');
// Run the same builder against an isolated, deliberately oversized game. The
// hard-limit failure must happen before any distributable can be written.
const fixture = await mkdtemp(join(tmpdir(), 'deckbater-limit-'));
try {
  await mkdir(join(fixture, 'src'));
  const noise = Array.from({ length: 1200 }, (_, i) => createHash('sha256').update('budget-test-' + i).digest('hex')).join('');
  await writeFile(join(fixture, 'src/story.js'), 'globalThis.tooLarge=' + JSON.stringify(noise) + ';');
  await writeFile(join(fixture, 'src/game.js'), '');
  await writeFile(join(fixture, 'src/index.html'), '<script>/* GAME */</script>');
  const builder = (await readFile(new URL('build/build.mjs', root), 'utf8'))
    .replace("from 'terser'", 'from ' + JSON.stringify(import.meta.resolve('terser')))
    .replace("from 'pako'", 'from ' + JSON.stringify(import.meta.resolve('pako')))
    .replace("const root = new URL('../', import.meta.url);", 'const root = new URL(' + JSON.stringify(pathToFileURL(fixture + '/').href) + ');');
  await writeFile(join(fixture, 'builder.mjs'), builder);
  console.log('Expecting a hard failure for the deliberately oversized fixture:');
  await assert.rejects(import(pathToFileURL(join(fixture, 'builder.mjs')).href), /exceeds the absolute/);
  await assert.rejects(readFile(join(fixture, 'dist/deckbater.zip')), { code: 'ENOENT' });
} finally { await rm(fixture, { recursive: true, force: true }); }
console.log('PASS: valid one-file ZIP, byte-for-byte reproduction, README size, and enforced oversize failure.');
