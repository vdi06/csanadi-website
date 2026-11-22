/** M17.4: minden regisztrált aloldal és médiakapcsolat forrásintegritása
 * telefonon és asztalon közösen. Nem helyettesít valós renderelési tesztet. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const rel = file => path.join(root, file);
const readJSON = file => JSON.parse(fs.readFileSync(rel(file), 'utf8'));
const catalog = readJSON('json/structure.json');
const knownRoutes = new Map();
const knownPages = new Set();
let blockCount = 0;

function inspect(nodes, depth = 1) {
  if (!nodes.length) return;
  assert.ok(depth <= 3, 'A menü maximális mélysége három');
  for (const node of nodes) {
    assert.match(node.path, /^pages\/[a-z0-9/\-]+\.json$/i);
    const filename = 'json/' + node.path;
    assert.ok(fs.existsSync(rel(filename)), 'Hiányzó oldal: ' + filename);
    assert.ok(!knownPages.has(filename), 'Duplikált oldal: ' + filename);
    knownPages.add(filename);
    const page = readJSON(filename);
    assert.ok(page.title?.trim(), 'Hiányzó oldalcím: ' + filename);
    assert.ok(Array.isArray(page.blocks), 'Hiányzó blokksor: ' + filename);
    blockCount += page.blocks.length;
    const route = page.schemaExtensions?.route;
    if (route) {
      assert.match(route, /^#\//);
      assert.ok(!knownRoutes.has(route), 'Duplikált útvonal: ' + route);
      knownRoutes.set(route, filename);
    }
    inspect(node.children || [], depth + 1);
  }
}
inspect(catalog.nodes);
assert.equal(knownPages.size, 78, 'A teljes, jóváhagyott 78 oldalas struktúra');
assert.equal(blockCount, 254, 'A jóváhagyott 254 fő tartalmi blokk');

const jsonFiles = [];
function listJSON(dir) {
  for (const entry of fs.readdirSync(rel(dir), { withFileTypes: true })) {
    const name = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) listJSON(name);
    else if (name.endsWith('.json')) jsonFiles.push(name);
  }
}
listJSON('json');
let referencedFiles = 0;
const localAsset = /(?:assets|json)\/[a-zA-Z0-9_\-./]+\.(?:webp|png|jpe?g|svg|gif|mp4|webm|pdf|json)/g;
function visit(data, filename) {
  if (Array.isArray(data)) return data.forEach(value => visit(value, filename));
  if (data && typeof data === 'object') return Object.values(data).forEach(value => visit(value, filename));
  if (typeof data !== 'string') return;
  for (const match of data.matchAll(localAsset)) {
    referencedFiles++;
    assert.ok(fs.existsSync(rel(match[0])), `Hiányzó hivatkozás: ${filename} -> ${match[0]}`);
  }
}
for (const filename of jsonFiles) visit(readJSON(filename), filename);

const registry = readJSON('json/media-library.json');
let mediaReferences = 0;
for (const media of registry.items) {
  for (const resource of [media.original, ...(media.variants || [])]) {
    if (!resource?.path) continue;
    mediaReferences++;
    assert.ok(fs.existsSync(rel(resource.path)), `Hiányzó médiaváltozat: ${resource.path}`);
  }
}

const html = fs.readFileSync(rel('index.html'), 'utf8');
for (const id of ['site-header', 'desktop-navigation', 'global-hero', 'app', 'site-map-overlay']) {
  assert.match(html, new RegExp(`id="${id}"`), `Közös/asztali alap hiánya: ${id}`);
}
assert.match(html, /media="screen and \(min-width: 769px\)"/);
assert.match(html, /media="screen and \(max-width: 768px\)"/);
assert.match(html, /data-bs-theme/);
assert.match(html, /bootstrap\.bundle\.min\.js/);

console.log(`M17.4 telefon+asztal forrásintegritás OK: ${knownPages.size} aloldal, ` +
  `${knownRoutes.size} egyedi útvonal, ${blockCount} fő blokk, ${jsonFiles.length} JSON, ` +
  `${referencedFiles} helyi fájlhivatkozás, ${registry.items.length} médiatétel, ` +
  `${mediaReferences} médiaváltozat; 768/769px határ és közös asztali komponensek`);
