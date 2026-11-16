/* 6× cél kizárólag tervezési kiindulás; fájlokat nem másol és nem publikál. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const items = JSON.parse(fs.readFileSync(path.join(root, 'json/assets-inventory.json'), 'utf8')).items;
const groups = [
  { id: 'original-images', name: 'Egyedi képek – reszponzív variánsok nélkül', paths: items.filter(x => x.type === 'image' && !x.path.includes('/responsive/')) },
  { id: 'videos', name: 'Videók', paths: items.filter(x => x.type === 'video') },
  { id: 'documents', name: 'Dokumentumok', paths: items.filter(x => x.type === 'document') },
  { id: 'nonqr-graphics', name: 'Egyéb grafikák – QR-kódok nélkül', paths: items.filter(x => x.type === 'graphic' && !x.path.startsWith('assets/qr/')) }
];
const variants = items.filter(x => x.type === 'image' && x.path.includes('/responsive/')).length;
const qr = items.filter(x => x.path.startsWith('assets/qr/')).length;
if (items.length !== 628 || qr !== 87 || variants !== 353) throw Error('Megváltozott a kiinduló médiaállomány; a bővítési tervet újra egyeztetni kell.');
const result = {
  release: 'v1.9.0', mode: 'planning-only', multiplier: 6,
  originalFileCount: items.length, derivativeImages: variants, existingQrGraphics: qr,
  source: 'json/assets-inventory.json', generatedAt: '2026-11-16',
  categories: groups.map(g => ({
    id: g.id, label: g.name, baseline: g.paths.length,
    indicativeTarget: g.paths.length * 6,
    indicativeNewApprovedItemsNeeded: g.paths.length * 5,
    status: 'várakozik',
    conditions: ['forrás és jogosult igazolása', 'intézményi döntés', 'tartalmi aktualitás', 'alt vagy dekoratív indok', 'méret és teljesítmény', 'helyi böngészős próbák']
  })),
  warning: 'A számok tervezési viszonyítási alapok, nem megrendelések és nem nyilvános tartalmak. A reszponzív variánsok és QR-kódok nem önálló új fotók.'
};
result.uniqueBaselineEstimate = result.categories.reduce((sum, x) => sum + x.baseline, 0);
result.indicativeTotalNew = result.categories.reduce((sum, x) => sum + x.indicativeNewApprovedItemsNeeded, 0);
const output = path.join(root, 'dokumentacio');
fs.writeFileSync(path.join(output, 'MEDIA_BOVITESI_KERET_V1_9.json'), JSON.stringify(result, null, 2) + '\n');
const q = x => '"' + String(x ?? '').replace(/"/g, '""') + '"';
const rows = [
  ['Kategória', 'Kiinduló egyedi tételek', 'Irányadó 6× cél', 'Lehetséges új tételek', 'Kiinduló jogállás', 'Forrás és jogosult', 'Intézményi döntés', 'Hozzájárulási/engedélyazonosító', 'Alt/akadálymentesség', 'Kapacitás és mobil teljesítmény', 'Próba', 'Döntés'],
  ...result.categories.map(g => [g.label, g.baseline, g.indicativeTarget, g.indicativeNewApprovedItemsNeeded, 'egyenként felülvizsgálandó', '', '', '', '', '', 'szükséges', 'nem indítható']),
  ['QR-kódok – kizárva', qr, 'nem 6×-ozzuk', 0, 'funkció és cél URL ellenőrizendő', '', '', '', '', '', 'szükséges', 'nincs bővítési döntés'],
  ['Reszponzív képméretek – kizárva', variants, 'eredetifotó-függő', 0, 'származtatott fájlok', '', '', '', '', '', 'szükséges', 'nincs bővítési döntés']
];
fs.writeFileSync(path.join(output, 'MEDIA_BOVITESI_KERET_V1_9.csv'), '\ufeff' + rows.map(row => row.map(q).join(';')).join('\r\n'), 'utf8');
console.log(JSON.stringify({baseline: items.length, categories: result.categories.map(g => [g.id, g.baseline]), uniqueBaselineEstimate: result.uniqueBaselineEstimate, indicativeTotalNew: result.indicativeTotalNew, variants, qr, actualNewMediaFiles: 0}));
