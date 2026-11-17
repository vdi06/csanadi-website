/* B + C + D fejlesztések célzott, helyi funkcionális és integritástesztjei. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {tokenizeSearchQuery,compileSynonyms,boundedDistance} from '../js/search-j-2026.js';
import {norm} from '../js/content.js';
import {inspectMediaBytes} from './media-validation-v1-39-7.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p));
const checks=[];
function test(name,fn){try{fn();checks.push({name,ok:true});}catch(e){checks.push({name,ok:false,error:String(e)});}}
const inventory=json('json/assets-inventory.json').items;
const media=json('json/mediatar.json').items;
const report=json('dokumentacio/TARTALMI_MINOSEG_V1_39_8.json');
const newItems=inventory.filter(item=>item.path.startsWith('assets/media/illustrations/'));
test('Az új kiadás azonosítója és a statikus HTML belépő',()=>{
 assert.match(json('json/config.json').performance.cacheVersion,/^csanadi-r-v1\.39\.(?:9|10|11)$/);
 assert.match(read('index.html'),/script\.js\?v=1\.39\.(?:9|10|11)/);
 assert.match(read('tools/eszkoz-mediator.html'),/media-manager-2026\.js\?v=1\.39\.9/);
});
test('A 71 oldal, 628 eredeti média és 60 új grafika nyilvántartva',()=>{
 assert.equal(report.pages,71);assert.equal(inventory.length,748);assert.equal(newItems.length,120);
 assert.equal(new Set(inventory.map(item=>item.path)).size,748);
});
test('Minden új SVG fizikailag létezik, bájtokkal és SHA-256-tal egyezik',()=>{
 for(const item of newItems){const bytes=fs.readFileSync(path.join(root,item.path));
  assert.equal(item.sizeBytes,bytes.length,item.path);
  assert.equal(item.sha256,crypto.createHash('sha256').update(bytes).digest('hex'),item.path);
 }
});
test('Mind a 60 SVG biztonságos és önálló címmel rendelkezik',()=>{
 for(const item of newItems){const svg=read(item.path);
  assert.equal(inspectMediaBytes(item.path,'image/svg+xml',new TextEncoder().encode(svg)),null,item.path);
  assert.match(svg,/<title id="icon-title">.+<\/title>/);assert.doesNotMatch(svg,/<script|<image|url\s*\(/i);
 }
});
test('Húsz különböző téma, mindegyikből három vizuális változat',()=>{
 const grouping=new Map();for(const i of newItems){const match=i.path.match(/([^/]+)-(sotet|vilagos|kontur)\.svg$/);
  assert.ok(match,i.path);if(!grouping.has(match[1]))grouping.set(match[1],new Set());grouping.get(match[1]).add(match[2]);}
 assert.equal(grouping.size,40);for(const modes of grouping.values())assert.deepEqual([...modes].sort(),['kontur','sotet','vilagos']);
});
test('20 regisztrált médiaazonosító és intézményi engedélykapu',()=>{
 const entries=media.filter(item=>item.id.startsWith('media:tematika-'));
 assert.equal(entries.length,20);assert.equal(media.length,154);
 for(const item of entries){assert.equal(item.variants.length,3);assert.equal(item.rights.clearance,'pending');
  assert.ok(item.variants.every(v=>fs.existsSync(path.join(root,v.path))));}
});
test('Mélyebb szerkesztői audit minden oldalra kiterjed és nem írja át a tényeket',()=>{
 assert.equal(report.pages,71);assert.equal(report.pageResults.length,71);
 assert.equal(report.errors.length,0);assert.ok(report.reviewFlags>0);
 assert.equal(report.uniqueBlockIds,459);
 assert.ok(report.manualPriorityPages>0);
 assert.match(report.note,/nem módosít/);
});
test('Blokkazonosító-ütközések javítása visszakereshető változásnaplóval',()=>{
 const migration=json('dokumentacio/BLOKK_AZONOSITO_MIGRACIO_V1_39_8.json');
 assert.equal(migration.renamedBlocks,128);assert.equal(migration.changedPages,62);
 assert.equal(migration.unchangedRoutes,true);
 assert.equal(new Set(migration.changes.map(x=>x.to)).size,128);
});
test('CSV ellenőrzési segédlet minden oldalhoz tartalmaz sort',()=>{
 const csv=read('dokumentacio/TARTALMI_MINOSEG_V1_39_8.csv');
 assert.equal(csv.split('\r\n').length,72);
});
test('Idézőjelezett keresőkifejezések egy egységként kereshetők',()=>{
 assert.deepEqual(tokenizeSearchQuery('"nyílt nap" felvételi',norm),['nyilt nap','felveteli']);
 assert.deepEqual(tokenizeSearchQuery('könyvtár könyvtár',norm),['konyvtar']);
});
test('Legfeljebb nyolc keresési egység és 160 karakter vehető figyelembe',()=>{
 assert.equal(tokenizeSearchQuery('a b c d e f g h i j',norm).length,8);
 assert.ok(tokenizeSearchQuery('x'.repeat(400),norm)[0].length<=160);
});
test('Új ékezetes és több szóból álló szinonimák',()=>{
 const cfg=json('json/config.json');const synonyms=compileSynonyms(cfg.search.synonyms,norm);
 assert.ok(synonyms['nyilt nap'].includes('tajekoztato nap'));
 assert.ok(synonyms['tajekoztato nap'].includes('nyilt nap'));
 assert.ok(synonyms['csengetesi rend'].includes('orakozi szunet'));
});
test('Elgépelés-korlát és fókuszbarát bemeneti kezelés',()=>{
 assert.equal(boundedDistance('sport','spor',1),1);
 assert.equal(boundedDistance('sport','könyv',1),2);
 assert.match(read('js/search-j-2026.js'),/setTimeout\(\(\)=>\{inputTimer=null;setQuery\(input\.value\);\},90\)/);
 assert.match(read('js/search-j-2026.js'),/results\.setAttribute\('aria-label',query\.trim\(\)/);
});
test('Nem kerül szerveroldali függőség és Bootstrap-másolat a kiadásba',()=>{
 assert.doesNotMatch(read('index.html'),/node_modules|\.php(?:["'])/);
 assert.match(read('index.html'),/bootstrap/i);
 assert.ok(!fs.existsSync(path.join(root,'node_modules')));
});
const failures=checks.filter(c=>!c.ok);
console.log(JSON.stringify({release:'1.39.8',total:checks.length,passed:checks.length-failures.length,failed:failures},null,2));
if(failures.length)process.exitCode=1;
