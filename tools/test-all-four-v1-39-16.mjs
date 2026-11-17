/* v1.39.16 · A+B+C+D és a kétállapotú elrendezéstervező statikus regressziós kapuja. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectNewsCollection} from '../js/news-policy-2026.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const json=name=>JSON.parse(read(name));
const tests=[];
function test(name,run){try{run();tests.push({name,ok:true});}catch(error){tests.push({name,ok:false,error:error.message});}}
const html=read('index.html'),planner=read('tools/kezdolap-elrendezes-tervezo.js'),panel=read('tools/kezdolap-elrendezes-tervezo.html'),css=read('css/header-polish-v1-39-16.css');
const check=read('tools/check-release-target-v1-39-16.mjs'),review=read('tools/tartalmi-hitelesites.js');
test('A · egységes 1.39.16 belépőverzió',()=>{
 assert.match(html,/script\.js\?v=1\.39\.16/);
 assert.equal(json('json/config.json').performance.cacheVersion,'csanadi-r-v1.39.16');
 assert.match(read('script.js'),/app\.js\?v=1\.39\.16/);
});
test('A · 71 oldal és 748 állomány megmaradt',()=>{
 assert.equal(Object.keys(json('json/oldalindex.json').pages).length,71);
 assert.equal(json('json/assets-inventory.json').items.length,748);
});
test('A · a céloldal 71 és 748 hivatkozását ellenőrzi',()=>{
 assert.match(check,/inspectMany\(pagePaths,'pages'\)/);
 assert.match(check,/inspectMany\(assetPaths,'assets'\)/);
 assert.match(check,/result\.pages\.checked===71/);
 assert.match(check,/result\.assets\.checked===748/);
});
test('A · 10 kritikus kód SHA-256 és 11 minta JSON feldolgozás',()=>{
 assert.match(check,/createHash\('sha256'\)/);
 assert.match(check,/result\.criticalFiles\.checked===10/);
 assert.match(check,/result\.samplePages\.checked===11/);
 assert.match(check,/manifest\.files\?\.\[name\]\?\.sha256/);
});
test('A · az ellenőrzés nem ír hálózati változásokat',()=>{
 assert.doesNotMatch(check,/method:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
 assert.doesNotMatch(check,/writeFileSync|unlinkSync/);
});
test('B · a stabil, egysoros fejléc és szögletes képek megmaradnak',()=>{
 assert.match(html,/header-polish-v1-39-16\.css\?v=1\.39\.16/);
 assert.match(css,/#cs39-mini-hero/);
 assert.match(css,/border-radius:0!important/);
 assert.match(read('js/release-v1-39-1.js'),/brandRow\|\|header/);
});
test('B · a nagy képsáv nem változtatja a dokumentum magasságát',()=>{
 assert.doesNotMatch(read('js/release-v1-39-1.js'),/ResizeObserver\(queue\)\.observe\(hero\)/);
 assert.match(read('css/header-mobile-polish-v1-39-15.css'),/max-height:none!important;opacity:1!important;transition:none!important/);
});
test('B · a két görgetési állapot nem tud azonnal visszaváltani',()=>{
 const motion=read('js/release-v1-39-0.js');assert.match(motion,/bottom<=84/);assert.match(motion,/bottom>=114/);
 assert.match(css,/opacity \.09s linear/);
});
test('B · az aloldali sportanimáció a felhasználói kérés szerint kikapcsolva',()=>{
 const code=read('js/subpages-v1.js');
 assert.equal(json('json/config.json').runtime.subpageHeaderMotion.enabled,false);
 assert.equal(json('json/config.json').runtime.subpageHeaderMotion.autoplay,false);
 assert.match(code,/const sportAnimationEnabled=false/);
 assert.match(code,/\{render\(\)\{\},sync\(\)\{\},updateReading\(\)\{\}\}/);
});
test('C · mobilos gombok legalább 44 px-es célpontok',()=>{
 assert.match(css,/#mobile-menu-toggle,#search-open,#theme-toggle\{min-width:44px!important;min-height:44px!important/);
 assert.match(css,/#cs39-mini-hero \.cs39-mini-preview\{min-width:44px!important;min-height:44px!important/);
});
test('C · keskeny hírkártyák és média-rács reszponzív',()=>{
 const older=read('css/header-mobile-polish-v1-39-15.css');
 assert.match(older,/@media\(max-width:480px\)/);assert.match(older,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(older,/repeat\(2,minmax\(0,1fr\)\)/);
});
test('C · fókusz és csökkentett mozgás megmarad',()=>{
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(planner,/ArrowLeft/);assert.match(planner,/event\.shiftKey\?5:1/);
});
test('D · öt hivatalos HTTPS-forrás nélküli hír továbbra sem automatikusan hiteles',()=>{
 const news=json('json/adatok/hirek-hivatalos.json');
 assert.equal(news.items.filter(item=>item.status==='verified').length,5);
 assert.equal(inspectNewsCollection(news,json('json/config.json')).length,5);
});
test('D · a 23+69+5 listák és a régi CSV-exportok megmaradtak',()=>{
 assert.equal(json('dokumentacio/TARTALMI_MINOSEG_V1_39_9.json').priorities.length,23);
 assert.equal(json('json/mediatar.json').items.filter(item=>item.rights?.clearance==='pending').length,69);
 assert.match(review,/csanadi_23_oldal_69_media_hitelesitesi_lista\.csv/);
 assert.match(review,/csanadi_23_oldal_69_media_5_hir_jovahagyasi_lista\.csv/);
});
test('D · géppel feldolgozható 97 tételes audit-JSON és jóváhagyási figyelmeztetés',()=>{
 assert.match(read('tools/tartalmi-hitelesites.html'),/id="exportaudit"/);assert.match(review,/sourceRows\.length!==97/);
 assert.match(review,/institutionalApprovalVerified:false,ftpPublished:false/);
 assert.match(review,/csanadi_97_teteles_helyi_audit_v1_39_16\.json/);
});
test('Tervező · két külön szerkeszthető állapot és húzás',()=>{
 assert.match(panel,/data-mode="normal"/);assert.match(panel,/data-mode="scrolled"/);
 assert.match(planner,/setPointerCapture/);assert.match(planner,/pointermove/);
 assert.match(planner,/model\.states\[activeMode\]/);
});
test('Tervező · összehasonlítás, helyi mentés és JSON-import',()=>{
 assert.match(panel,/data-view="compare"/);assert.match(planner,/localStorage\.setItem/);
 assert.match(planner,/const normalize=data/);assert.match(panel,/id="plan-file"/);
});
test('Tervező · másolás, letöltés, nyomtatás és HTTPS-külső függés nélkül',()=>{
 assert.match(planner,/navigator\.clipboard/);assert.match(planner,/URL\.createObjectURL/);
 assert.match(planner,/window\.print/);assert.doesNotMatch(planner,/fetch\(/);
});
test('Megőrzés · kizárólag Bootstrap CDN, nem helyi Bootstrap',()=>{
 assert.match(html,/bootstrap@5\.3\.9/);
 assert.doesNotMatch(html,/href="(?:\.\/)?(?:assets|vendor)\/bootstrap/);
});
const failed=tests.filter(entry=>!entry.ok);
console.log(JSON.stringify({release:'1.39.16',checks:tests.length,passed:tests.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
