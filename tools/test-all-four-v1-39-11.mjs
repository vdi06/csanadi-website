/* v1.39.11: négyes fejlesztési csomag regressziós és megőrzési ellenőrzése.
   A tényleges Chromium-megjelenítési próbák külön átadási jegyzőkönyvben vannak. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));
const results=[];
function test(name,fn){try{fn();results.push({name,ok:true});}catch(error){results.push({name,ok:false,error:error.message});}}

const hero=read('js/hero-2026.js');
const header=read('js/release-v1-39-0.js');
const compact=read('js/release-v1-39-1.js');
const css=read('css/home-header-polish-v1-39-11.css');
const tool=read('tools/tartalmi-hitelesites.js');
const form=read('tools/tartalmi-hitelesites.html');

test('71 oldal és 748 fájl megmaradt',()=>{
 assert.equal(Object.keys(json('json/oldalindex.json').pages).length,71);
 assert.equal(json('json/assets-inventory.json').items.length,748);
});
test('A médiakönyvtár 154 azonosítót őriz',()=>{
 const items=json('json/mediatar.json').items;
 assert.equal(items.length,154);
 assert.equal(new Set(items.map(item=>item.id)).size,154);
});
test('A 23 kézi hitelesítést igénylő oldal tényleg rendelkezésre áll',()=>{
 const report=json('dokumentacio/TARTALMI_MINOSEG_V1_39_9.json');
 assert.equal(report.manualPriorityPages,23);
 assert.equal(report.priorities.length,23);
 for(const item of report.priorities){
  assert.ok(item.file.startsWith('json/oldalak/'));
  assert.ok(fs.existsSync(path.join(root,item.file)),item.file);
  assert.ok(item.manualApproval?.length>0,item.file);
 }
});
test('69 média felhasználási joga még intézményi felülvizsgálatra vár',()=>{
 assert.equal(json('json/mediatar.json').items.filter(item=>item.rights?.clearance==='pending').length,69);
});
test('A látható három soros bevezető eltűnt, a rejtett H1 megmaradt',()=>{
 for(const unwanted of ['SPORT · TUDÁS · KÖZÖSSÉG','Fedezd fel a Csanádi Sportiskolát','Asztalon a két kép együtt lapozható'])assert.ok(!hero.includes(unwanted));
 assert.match(hero,/el\('h1','visually-hidden','Csanádi Árpád Sportiskola'\)/);
});
test('A képsor címezett és élőállapot-közlő',()=>{
 for(const required of ['aria-roledescription','csn26-carousel-help','aria-describedby','aria-live','aria-atomic','aria-controls'])assert.ok(hero.includes(required),required);
 assert.match(hero,/ArrowLeft/);
 assert.match(hero,/ArrowRight/);
});
test('A nagy képeken és az irányítónyilakon nincs lekerekítés vagy hézag',()=>{
 const base=read('css/home-header-ribbon-v1-39-10.css');
 assert.match(base,/border-radius:0!important/);
 assert.match(base,/gap:0!important/);
 assert.match(css,/--cs10-rail-width:44px!important/);
});
test('A mobilnyilak és a fókuszjelölések érinthetők és láthatók',()=>{
 assert.match(css,/focus-visible/);
 assert.match(css,/touch-action:manipulation/);
 assert.match(css,/@media\(forced-colors:active\)/);
});
test('Csak a középső gomb jelenik meg összehúzott fejlécben',()=>{
 assert.match(css,/#cs39-mini-hero > :not\(\.cs39-mini-preview\)\{display:none!important\}/);
 assert.match(css,/justify-self:center/);
 assert.match(compact,/header\.append\(compact\)/);
});
test('A villódzás elleni hiszterézis két külön küszöböt használ',()=>{
 assert.match(header,/homeHeroFolded/);
 assert.match(header,/Math\.max\(390,expanded\+145\)/);
 assert.match(header,/scrollY<=18/);
 assert.match(css,/max-height \.18s ease-out/);
});
test('Az eltűnő képsor billentyűzetről nem fókuszálható',()=>{
 assert.match(compact,/hero\.inert=condensed/);
 assert.match(compact,/hero\.setAttribute\('aria-hidden','true'\)/);
 assert.match(compact,/preview\.focus\(\{preventScroll:true\}\)/);
});
test('A helyi hitelesítő két új forráslistát is megjelenít',()=>{
 for(const kind of ['priority','mediaRights']){
  assert.match(tool,new RegExp(kind));
  assert.match(form,new RegExp('value="'+kind+'"'));
 }
});
test('Az engedély nélküli jóváhagyási állapot nem fogadható el',()=>{
 assert.match(tool,/completeApproval\(row,entry\)/);
 assert.match(tool,/entry\.reviewer && entry\.evidence && entry\.decision/);
 assert.match(tool,/\['assets', 'mediaRights'\]\.includes\(state\.kind\)/);
 assert.match(tool,/entry\.status==='approved'&&!completeApproval/);
});
test('A kiadás saját CSS-ét és új modulverzióit tölti',()=>{
 const html=read('index.html');
 assert.match(html,/home-header-polish-v1-39-11\.css\?v=1\.39\.11/);
 assert.match(html,/script\.js\?v=1\.39\.11/);
 assert.match(read('js/blocks.js'),/hero-2026\.js\?v=1\.39\.11/);
 assert.equal(json('json/config.json').performance.cacheVersion,'csanadi-r-v1.39.11');
});

const failed=results.filter(item=>!item.ok);
console.log(JSON.stringify({release:'1.39.11',checks:results.length,passed:results.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
