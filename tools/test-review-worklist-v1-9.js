/* A 55 nyitott szabály interaktív, de csak helyi szerkesztői munkalapjának tesztje. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const dataset = JSON.parse(fs.readFileSync(path.join(root, 'dokumentacio/SZABALYOK_31_ALOLDAL_V1_9.json'), 'utf8'));
const code = fs.readFileSync(path.join(__dirname, 'tartalmi-hitelesites.js'), 'utf8');
class Node {
  constructor(tag) { this.tag = tag; this.children = []; this.listeners = {}; this.value = ''; this.textContent = ''; this.dataset = {}; this.files = null; this.style = {}; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  fire(name, extra = {}) { return this.listeners[name]?.({ target: this, ...extra }); }
  setAttribute(name, value) { this[name] = value; }
  click() {}
  remove() {}
}
const nodeMap = new Map();
const get = id => { if (!nodeMap.has(id)) nodeMap.set(id, new Node('div')); return nodeMap.get(id); };
get('kind').value = 'criteria';
get('state').value = 'all';
const saved = new Map();
const blobs = [];
const context = vm.createContext({
  document: { getElementById: get, createElement: name => new Node(name), body: new Node('body') },
  localStorage: { getItem: name => saved.get(name) || null, setItem: (name, value) => saved.set(name, value) },
  fetch: async url => {
    assert.equal(url, '../dokumentacio/SZABALYOK_31_ALOLDAL_V1_9.json');
    return { ok: true, json: async () => dataset };
  },
  URL: { createObjectURL: blob => { blobs.push(blob); return 'blob:test'; }, revokeObjectURL: () => {} },
  Blob, setTimeout: () => 1, clearTimeout: () => {}, confirm: () => true, console, JSON, Date
});
async function settle() { await new Promise(resolve => setImmediate(resolve)); }
let passed = 0;
function check(title, callback) { callback(); passed++; console.log('OK', title); }
(async () => {
  vm.runInContext(code, context);
  await settle();
  check('A 65×31 mátrixból pontosan 55 nyitott tétel szerepel', () => {
    assert.equal(dataset.pages, 65);
    assert.equal(dataset.open.length, 55);
    assert.equal(get('items').children.length, 55);
    assert.match(get('status').textContent, /^55 \/ 55/);
  });
  const firstRow = () => get('items').children[0];
  const control = idx => firstRow().children[idx].children[0];
  check('Forrásútvonal és szabályazonosító az első tételben', () => {
    assert.match(firstRow().children[0].children[0].textContent, /28\. szabály/);
    assert.match(firstRow().children[1].children[0].href, /^\.\.\/json\//);
  });
  check('Jóváhagyási adat nem rögzíthető ellenőrző és bizonyíték nélkül', () => {
    const select = control(2);
    select.value = 'approved';
    select.fire('change');
    assert.equal(select.value, 'pending');
    assert.match(get('status').textContent, /bizonyíték/);
  });
  check('A három igazoló mező és a döntés azonosítója helyben tárolódik', () => {
    for (const [idx, value] of [[4, 'Iskolai felelős'], [5, 'Dokumentum-001 / 2026-11-16'], [7, 'Döntés-001']]) {
      const input = control(idx);
      input.value = value; input.fire('change');
    }
    const select = control(2);
    select.value = 'approved'; select.fire('change');
    const entries = Object.values(JSON.parse([...saved.values()][0]));
    assert.equal(entries[0].decision, 'Döntés-001');
    assert.equal(entries[0].status, 'approved');
    assert.match(get('summary').textContent, /Jóváhagyási adat rögzítve: 1/);
  });
  get('exportjson').fire('click');
  const exportData = JSON.parse(await blobs.at(-1).text());
  check('JSON-export tartalmazza az összes munkatételt, intézményi flag módosítása nélkül', () => {
    assert.equal(exportData.records.length, 55);
    assert.equal(exportData.kind, 'criteria');
    assert.equal(exportData.records.filter(x => x.status === 'approved').length, 1);
    assert.equal(dataset.items.filter(x => x.actualVerified).length, 10);
  });
  check('Keresés és munkastátusz-szűrés csökkenti a látható tételeket', () => {
    get('state').value = 'approved'; get('state').fire('change');
    assert.equal(get('items').children.length, 1);
    get('state').value = 'all'; get('state').fire('change');
    assert.equal(get('items').children.length, 55);
  });
  const importData = structuredClone(exportData);
  importData.records[0].status = 'approved';
  importData.records[0].decision = '';
  get('importjson').files = [{ size: 2048, text: async () => JSON.stringify(importData) }];
  await get('importjson').fire('change');
  check('Hiányos döntésű importot automatikusan felülvizsgálandóvá minősít', () => {
    const entries = Object.values(JSON.parse([...saved.values()][0]));
    assert.equal(entries[0].status, 'review');
    assert.equal(get('items').children.length, 55);
  });
  console.log(JSON.stringify({ passed, failed: 0, records: 55, httpWrites: 0, sourceVerifiedChanged: false }));
})().catch(error => { console.error(error); process.exitCode = 1; });
