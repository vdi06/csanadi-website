/* A+B+C+D 1.39.9 kiadás tesztjei: valódi böngészős megfigyelések külön jegyzőkönyvben. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {tokenizeSearchQuery,compileSynonyms} from '../js/search-j-2026.js';
import {norm} from '../js/content.js';
import {inspectMediaBytes} from './media-validation-v1-39-7.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p));
const tests=[];
function test(name,fn){try{fn();tests.push({name,ok:true});}catch(error){tests.push({name,ok:false,error:String(error.message||error)});}}
const catalog=json('json/oldalindex.json'),inventory=json('json/assets-inventory.json').items;
const media=json('json/mediatar.json').items,report=json('dokumentacio/TARTALMI_MINOSEG_V1_39_9.json');
const edits=json('dokumentacio/METAADAT_JAVITAS_V1_39_9.json');
const newGraphics=inventory.filter(item=>/^assets\/media\/illustrations\/uj-/.test(item.path));
test('A 71 oldal megmaradt és mind publikált',()=>{assert.equal(report.pages,71);assert.equal(Object.keys(catalog.pages).length,71);for(const page of Object.values(catalog.pages))assert.equal(page.lifecycle.status,'published');});
test('66 oldal metaadatai célzottan bővültek',()=>{assert.equal(edits.pagesChanged,66);assert.equal(edits.changes.length,66);assert.equal(edits.summaries,47);assert.equal(edits.descriptions,66);});
test('Minden érintett leírás releváns, egyedi és elegendő hosszúságú',()=>{
 const seen=new Set();for(const edit of edits.changes){const page=json(edit.file);
  assert.equal(page.summary,edit.summaryAfter);assert.equal(page.seo.description,edit.seoAfter);
  assert.ok(page.summary.length>=75);assert.ok(page.seo.description.length>=90&&page.seo.description.length<=165);
  assert.ok(!seen.has(page.seo.description),edit.file);seen.add(page.seo.description);
 }
});
test('Az oldalindex a metaadatjavítást és az életciklus-revíziót követi',()=>{
 for(const edit of edits.changes){const page=json(edit.file),key=edit.file.replace(/^json\//,'');
  assert.equal(catalog.pages[key].summary,page.summary);assert.equal(catalog.pages[key].lifecycle.revision,page.lifecycle.revision);
 }
});
test('A mélyebb audit szerkezeti és szöveghossz-hiba nélkül lefutott',()=>{
 assert.equal(report.errors.length,0);assert.equal(report.reviewFlags,0);assert.equal(report.pageResults.length,71);
 assert.equal(report.uniqueBlockIds,459);
});
test('A 23 intézményi kézi hitelesítési feladat nincs automatikusan jóváhagyva',()=>{
 assert.equal(report.manualPriorityPages,23);assert.match(edits.policy,/kézi intézményi/);
});
test('A médiatár 628 kiinduló és 120 új vektoros állományt tartalmaz',()=>{
 assert.equal(inventory.length,748);assert.equal(inventory.filter(i=>!i.path.startsWith('assets/media/illustrations/')).length,628);
 assert.equal(inventory.filter(i=>i.path.startsWith('assets/media/illustrations/')).length,120);
 assert.equal(newGraphics.length,60);
});
test('Mind a 60 új SVG bájt- és SHA-256 egyezése helyes',()=>{
 for(const item of newGraphics){const bytes=fs.readFileSync(path.join(root,item.path));
  assert.equal(item.sizeBytes,bytes.length,item.path);
  assert.equal(item.sha256,crypto.createHash('sha256').update(bytes).digest('hex'),item.path);
 }
});
test('Az új grafikai elemek biztonságos, önálló SVG-k',()=>{
 for(const item of newGraphics){const bytes=fs.readFileSync(path.join(root,item.path));
  assert.equal(inspectMediaBytes(item.path,'image/svg+xml',bytes),null,item.path);
  const svg=bytes.toString('utf8');assert.match(svg,/<title id="icon-title">/);
  assert.doesNotMatch(svg,/<script|<image|<foreignObject|url\s*\(/i);
 }
});
test('Húsz új téma három változatban, névütközés nélkül',()=>{
 const ids=new Set();for(const item of newGraphics){const m=item.path.match(/\/uj-([^/]+)-(sotet|vilagos|kontur)\.svg$/);
  assert.ok(m,item.path);ids.add(m[1]);}assert.equal(ids.size,20);
 assert.equal(new Set(inventory.map(x=>x.path)).size,748);
});
test('Az új médiaazonosítók kizárólag belső előnézeti státuszúak',()=>{
 const entries=media.filter(m=>m.id.startsWith('media:tematika2-'));
 assert.equal(media.length,154);assert.equal(entries.length,20);
 for(const item of entries){assert.equal(item.variants.length,3);assert.equal(item.rights.clearance,'pending');}
});
test('A hatszoros egyedi média tervet nem tekintjük teljesítettnek',()=>{
 const plan=json('dokumentacio/MEDIA_BOVITESI_KERET_V1_9.json');
 assert.equal(plan.currentFileCount,748);assert.equal(plan.newEditorialIllustrations,120);
 assert.ok(plan.indicativeTotalNew>0);assert.match(plan.warning,/nem teljesült/);
});
test('A kereső idézőjeles, ékezetes, korlátos bemenetet fogad',()=>{
 assert.deepEqual(tokenizeSearchQuery('"nyílt nap" felvételi',norm),['nyilt nap','felveteli']);
 assert.equal(tokenizeSearchQuery('a b c d e f g h i',norm).length,8);
});
test('A keresési sorrend a típus- és témaszűréskor újrahasznosul',()=>{
 const src=read('js/search-j-2026.js');
 assert.match(src,/cachedQuery!==q/);assert.match(src,/cachedHits\.filter\(/);
 assert.match(src,/all=indexed\.map\(x=>buildEntry\(x,norm\)\);cachedQuery=null/);
});
test('A fiktív hírek egyértelmű feliratot és alacsonyabb rangot kapnak',()=>{
 const src=read('js/search-j-2026.js');assert.match(src,/isSample:type==='news'&&item\.status==='sample'/);
 assert.match(src,/Fiktív minta · Hír/);assert.match(src,/Math\.max\(0,points-16\)/);
});
test('A témaválasztó a beágyazott szakaszcímet is kezeli',()=>{
 const src=read('js/page-templates-v1-39-2.js');assert.match(src,/h2, h3, summary, \[data-section-heading\]/);
 assert.match(src,/heading\.focus\(\{preventScroll:true\}\)/);
});
test('Az oldalak és az erőforrások verziója egységes',()=>{
 assert.match(json('json/config.json').performance.cacheVersion,/^csanadi-r-v1\.39\.(?:9|10|11|12|13|14|15|16)$/);
 assert.match(read('index.html'),/script\.js\?v=1\.39\.(?:9|10|11|12|13|14|15|16)/);
 assert.match(read('tools/eszkoz-mediator.html'),/media-manager-2026\.js\?v=1\.39\.9/);
 for(const p of report.pageResults){const page=json(p.file);assert.equal(page.seo.robots,'noindex,nofollow');}
});
test('A kiadás továbbra is csak statikus kiszolgálást igényel',()=>{
 assert.ok(!fs.existsSync(path.join(root,'node_modules')));
 assert.doesNotMatch(read('index.html'),/node_modules|\.php(?:["'])/);
 assert.match(read('index.html'),/bootstrap/i);
});
const failed=tests.filter(t=>!t.ok);
console.log(JSON.stringify({release:'1.39.9',total:tests.length,passed:tests.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
