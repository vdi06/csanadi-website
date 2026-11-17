/* A v1.39.12 vizuális és akadálymentességi megőrzési kapuja.
   Kiegészíti, nem helyettesíti a valós böngészős és képernyőolvasós próbát. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));
const css=read('css/hero-morph-v1-39-12.css');
const compact=read('js/release-v1-39-1.js');
const folding=read('js/release-v1-39-0.js');
const hero=read('js/hero-2026.js');
const form=read('tools/tartalmi-hitelesites.html');
const tool=read('tools/tartalmi-hitelesites.js');
const results=[];
function check(name,fn){try{fn();results.push({name,ok:true});}catch(error){results.push({name,ok:false,error:error.message});}}

check('A saját 1.39.12 CSS betöltése a korábbi fejlécrétegek után történik',()=>{
 const html=read('index.html');
 assert.ok(html.indexOf('home-header-polish-v1-39-11.css')<html.indexOf('hero-morph-v1-39-12.css'));
 assert.match(html,/hero-morph-v1-39-12\.css\?v=1\.39\.12/);
});
check('A kompakt gomb közvetlenül a meglévő márkasorban van, külön sor nélkül',()=>{
 assert.match(compact,/\(brandRow\|\|header\)\.append\(compact\)/);
 assert.match(read('css/home-header-polish-v1-39-11.css'),/#cs39-mini-hero > :not\(\.cs39-mini-preview\)\{display:none!important\}/);
 assert.match(css,/display:flex!important/);
 assert.match(css,/position:absolute!important/);
 assert.match(css,/left:50%!important/);
 assert.match(css,/top:50%!important/);
 assert.match(compact,/shell\.append\(header\);shell\.after\(hero\)/);
 assert.match(compact,/compact\.append\(preview\)/);
 assert.doesNotMatch(compact,/compact\.append\(previous/);
 assert.match(folding,/bottom<=84/);
 assert.match(folding,/bottom>=114/);
 assert.match(css,/max-height:none!important/);
});
check('Átmenet során a középső gomb láthatóságot és helyi skálát animál',()=>{
 assert.match(css,/opacity:0/);
 assert.match(css,/opacity:1/);
 assert.match(css,/visibility:hidden/);
 assert.match(css,/visibility:visible/);
 assert.match(css,/translate\(-50%,-50%\) scale\(\.96\)/);
 assert.match(css,/translate\(-50%,-50%\) scale\(1\)/);
});
check('A fókusz mindkét átmeneti irányban a látható elemre kerül',()=>{
 assert.match(compact,/hero\.contains\(document\.activeElement\)\)preview\.focus\(\{preventScroll:true\}\)/);
 assert.match(compact,/compact\.contains\(document\.activeElement\)/);
 assert.match(compact,/compact\.inert=!condensed/);
 assert.match(compact,/compact\.setAttribute\('aria-hidden','true'\)/);
});
check('A fejlécre és a munkalapra is van látható fókuszjelölés',()=>{
 assert.match(css,/\.cs39-mini-preview:focus-visible/);
 assert.match(form,/:focus-within/);
 assert.match(read('css/home-header-polish-v1-39-11.css'),/csn26-wing-surface:focus-visible/);
});
check('Mozgáscsökkentés és nagy kontraszt támogatott',()=>{
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.match(hero,/prefers-reduced-motion: reduce/);
});
check('Képsor akadálymentes névvel, súgóval, lapozógombokkal és élő állapottal rendelkezik',()=>{
 for(const key of ['aria-roledescription','aria-describedby','aria-controls','aria-live','aria-atomic'])assert.ok(hero.includes(key),key);
 assert.match(hero,/ArrowLeft/);
 assert.match(hero,/ArrowRight/);
});
check('A 23 és 69 tétel forrásadatban változatlan',()=>{
 assert.equal(json('dokumentacio/TARTALMI_MINOSEG_V1_39_9.json').priorities.length,23);
 assert.equal(json('json/mediatar.json').items.filter(item=>item.rights?.clearance==='pending').length,69);
});
check('Médiajogi igazolás négy releváns mezőt igényel',()=>{
 for(const field of ['entry.reviewer','entry.evidence','entry.permission','entry.decision'])assert.ok(tool.includes(field),field);
 assert.match(tool,/missingApprovalFields/);
 assert.match(tool,/Hiányzó igazoló adatok/);
});
check('A két nyitott lista összesített CSV-je exportálható',()=>{
 assert.match(form,/id="exportfocus"/);
 assert.match(tool,/csanadi_23_oldal_69_media_hitelesitesi_lista\.csv/);
 assert.match(tool,/priorities\.length!==23\|\|media\.length!==69/);
});
check('71 oldal és 748 nyilvántartott fájl továbbra is megmaradt',()=>{
 assert.equal(Object.keys(json('json/oldalindex.json').pages).length,71);
 assert.equal(json('json/assets-inventory.json').items.length,748);
});
check('Kiadási azonosító és fő belépőverzió konzisztens',()=>{
 assert.match(json('json/config.json').performance.cacheVersion,/^csanadi-r-v1\.39\.(?:12|13|14|15|16)$/);
 assert.match(read('index.html'),/script\.js\?v=1\.39\.(?:12|13|14|15|16)/);
 assert.match(read('tools/tartalmi-hitelesites.html'),/tartalmi-hitelesites\.js\?v=1\.39\.(?:12|14|15|16)/);
});
const failed=results.filter(item=>!item.ok);
console.log(JSON.stringify({release:'1.39.12',checks:results.length,passed:results.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
