// Single-file contest build; fixed ZIP metadata and raw DEFLATE give repeatable bytes.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
// Native zlib differs between Node distributions (e.g. Android and official Linux).
// Pin the JS compressor so the submitted archive is identical on both.
import { deflateRaw } from 'pako';
import { minify } from 'terser';
const limit = 13312;
const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');
const source = await read('src/story.js') + '\n' + await read('src/game.js');
const result = await minify(source, { module: false, toplevel: true,
  compress: { passes: 3, unsafe_arrows: true }, mangle: true, format: { comments: false } });
const html = (await read('src/index.html')).replace('/* GAME */', result.code).replace(/\n\s*/g, '');
const payload = Buffer.from(html), compressed = Buffer.from(deflateRaw(payload, { level: 9 }));
let crc = 0xffffffff;
for (const byte of payload) {
  crc ^= byte;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
}
crc = (crc ^ 0xffffffff) >>> 0;
const filename = Buffer.from('index.html');
const local = Buffer.alloc(30);
local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt16LE(8, 8);
local.writeUInt16LE(33, 12); // 1980-01-01, midnight
local.writeUInt32LE(crc, 14); local.writeUInt32LE(compressed.length, 18);
local.writeUInt32LE(payload.length, 22); local.writeUInt16LE(filename.length, 26);
const central = Buffer.alloc(46);
central.writeUInt32LE(0x02014b50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
central.writeUInt16LE(8, 10); central.writeUInt16LE(33, 14); central.writeUInt32LE(crc, 16);
central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(payload.length, 24);
central.writeUInt16LE(filename.length, 28);
const end = Buffer.alloc(22), start = local.length + filename.length + compressed.length;
end.writeUInt32LE(0x06054b50); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10);
end.writeUInt32LE(central.length + filename.length, 12); end.writeUInt32LE(start, 16);
const zip = Buffer.concat([local, filename, compressed, central, filename, end]);
console.log(`DECKBATER: ${zip.length} / ${limit} bytes (${limit - zip.length} free)`);
if (zip.length > limit) throw new Error('Competition ZIP exceeds the absolute 13,312-byte limit.');
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/index.html', root), payload);
await writeFile(new URL('dist/deckbater.zip', root), zip);
