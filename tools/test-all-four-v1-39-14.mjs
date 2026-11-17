/* v1.39.14 – A+B+C+D: animáció, mobil/a11y, minőségkapu, kiadási megőrzés. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const data=name=>JSON.parse(read(name));
const tests=[];
function test(name,run){try{run();tests.push({name,ok:true});}catch(error){tests.push({name,ok:false,error:error.message});}}
const html=read('index.html'),motion=read('js/subpage-header-motion.js'),style=read('css/subpage-interaction-v1-39-14.css');
const review=read('tools/tartalmi-hitelesites.js'),quality=read('tools/minosegkapu-2026.js');

test('A · 1.39.14 belépő modul és gyorsítótár beállítva',()=>{
 assert.match(html,/script\.js\?v=1\.39\.1[456]/);
 assert.match(read('script.js'),/app\.js\?v=1\.39\.1[456]/);
 assert.ok(['csanadi-r-v1.39.14','csanadi-r-v1.39.16'].includes(data('json/config.json').performance.cacheVersion));
});
test('A · minden új képesség statikus CDN/FTP-kompatibilis',()=>{
 assert.match(html,/bootstrap@5\.3\.9/);
 assert.doesNotMatch(style,/@import\s|https?:\/\//);
 assert.doesNotMatch(quality,/fetch\(\s*['"]https?:\/\//);
});
test('B · a mobil is az eredeti márkasorba helyezi az animációt',()=>{
 assert.match(motion,/brandRow\.prepend\(region\)/);
 assert.match(read('css/subpage-morph-v1-39-13.css'),/body\.cs-inner-page #site-header \.brand-row/);
 assert.match(html,/subpage-interaction-v1-39-14\.css\?v=1\.39\.14/);
});
test('B · tematikus sportképek és konfigurált profilok megmaradnak',()=>{
 const scenes=['digital','eco','medal','sprint','contact','news'];
 scenes.forEach(scene=>assert.ok(style.includes(`data-scene="${scene}"`),scene));
 assert.ok(Object.keys(data('json/config.json').runtime.subpageHeaderMotion.profiles).length>=20);
});
test('B · az animáció nem szűnik meg a kompakt fejléccel',()=>{
 const sync=motion.split('const sync=()=>{')[1].split('};')[0];
 assert.doesNotMatch(sync,/cs-header-condensed/);
 assert.match(sync,/document\.hidden/);
});
test('B · külön témákhoz előre definiált SVG motívumok',()=>{
 for(const scene of ['dribble','bookjump','hurdle','sprint','relay','medal','goal','calendar','digital','eco'])assert.match(motion,new RegExp(scene+':'));
});
test('C · mobilon valódi gomb az egész sportjelenet',()=>{
 assert.match(motion,/document\.createElement\('button'\);scene\.type='button'/);
 assert.match(motion,/mobilePreference=matchMedia\('\(max-width: 768px\)'\)/);
 assert.match(motion,/scene\.addEventListener\('click'/);
 assert.match(style,/min-height:44px!important/);
});
test('C · a dupla mobil pause-gomb nem foglal helyet',()=>{
 assert.match(motion,/pause\.hidden=!autoplay\|\|motionPreference\.matches\|\|mobilePreference\.matches/);
 assert.match(style,/\.cs-subpage-motion-pause\{display:none!important\}/);
});
test('C · a mobil gomb fókusza és állapota felolvastatható',()=>{
 assert.match(motion,/scene\.tabIndex=sceneControl\?0:-1/);
 assert.match(motion,/scene\.setAttribute\('aria-label'/);
 assert.match(motion,/scene\.setAttribute\('aria-pressed'/);
 assert.match(style,/\.cs-mini-scene:focus-visible/);
});
test('C · a képernyőméret-váltás állapota újraszinkronizál',()=>{
 assert.match(motion,/mobilePreference\.addEventListener\('change',sync\)/);
 assert.match(style,/@media\(max-width:540px\)/);
 assert.match(style,/@media\(max-width:768px\)/);
});
test('C · reduced motion és magas kontraszt támogatott',()=>{
 assert.match(style,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(style,/@media\(prefers-contrast:more\)/);
 assert.match(style,/@media\(forced-colors:active\)/);
 assert.match(motion,/motionPreference\.matches/);
});
test('D · 23 tartalom ellenőrzése a kiadási kapuban',()=>{
 assert.equal(data('dokumentacio/TARTALMI_MINOSEG_V1_39_9.json').priorities.length,23);
 assert.match(quality,/Tartalmi jóváhagyás még szükséges/);
 assert.match(quality,/TARTALMI_MINOSEG_V1_39_9\.json/);
});
test('D · 69 rendezetlen médiajog nyílt figyelmeztetés',()=>{
 assert.equal(data('json/mediatar.json').items.filter(x=>x.rights?.clearance==='pending').length,69);
 assert.match(quality,/Média jóváhagyásra vár/);
 assert.match(quality,/pending\|\|rightsMissing\?'warning':'ok'/);
});
test('D · helyi munkajegyzetet nem kever intézményi engedéllyel',()=>{
 assert.match(quality,/institutionalApprovalVerified:false,ftpPublished:false/);
 assert.match(read('tools/minosegkapu.html'),/A helyi jóváhagyási adat nem jogosít publikálásra/);
 assert.match(quality,/localReviewEvidence/);
});
test('D · CSV képletbefecskendezés elleni szövegesítés mindkét exportban',()=>{
 assert.match(quality,/csvSafe/);
 assert.match(review,/A munkalap szabad szövege CSV-olvasóban ne válhasson képletté/);
 assert.match(review,/\[=\+\\-@\]/);
});
test('D · JSON jelentésben a kiadási döntési állapot is ott van',()=>{
 assert.match(quality,/readiness:state\.readiness,records:state\.records/);
 assert.match(read('tools/minosegkapu.html'),/id="publication-gate-status"/);
});
test('Megőrzés · a 71 JSON-oldal és 748 assets-tétel változatlan',()=>{
 assert.equal(Object.keys(data('json/oldalindex.json').pages).length,71);
 assert.equal(data('json/config.json').runtime.release.expectedPageCount,71);
 assert.equal(data('json/assets-inventory.json').items.length,748);
 assert.ok(read('index.html').includes('hero-morph-v1-39-12.css'));
});
test('D · média és dokumentum ellenőrzőösszegek a tényleges állományhoz illeszkednek',()=>{
 const files=[];
 for(const item of data('json/mediatar.json').items){if(item.original)files.push(item.original);files.push(...(item.variants||[]));}
 for(const item of data('json/adatok/dokumentumok.json').documents)if(item.filePath)files.push({path:item.filePath,sha256:item.sha256});
 for(const file of files){
  if(!file.path||!file.sha256)continue;
  const bytes=fs.readFileSync(path.join(root,file.path));
  assert.equal(file.sha256,crypto.createHash('sha256').update(bytes).digest('hex'),file.path);
 }
});
const failed=tests.filter(x=>!x.ok);
console.log(JSON.stringify({release:'1.39.14',checks:tests.length,passed:tests.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
