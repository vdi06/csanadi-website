/* v1.39.15 – A+B+C+D célzott regressziós és forrás-ellenőrzési kapu. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectNewsCollection} from '../js/news-policy-2026.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const data=name=>JSON.parse(read(name));
const results=[];
function test(name,run){try{run();results.push({name,ok:true});}catch(error){results.push({name,ok:false,error:error.message});}}
const html=read('index.html'),code=read('js/release-v1-39-1.js'),css=read('css/header-mobile-polish-v1-39-15.css');
const review=read('tools/tartalmi-hitelesites.js'),gate=read('tools/minosegkapu-2026.js');

test('A · egységes 1.39.15 belépő és cache',()=>{
 assert.match(html,/script\.js\?v=1\.39\.(?:15|16)/);
 assert.match(read('script.js'),/app\.js\?v=1\.39\.(?:15|16)/);
 assert.equal(data('json/config.json').performance.cacheVersion,'csanadi-r-v1.39.16');
});
test('A · public vs local URL ellenőrző tisztán olvas',()=>{
 const cli=read('tools/check-release-target-v1-39-15.mjs');
 assert.match(cli,/manifest\.release/);
 assert.match(cli,/inspectMany\(pagePaths,'pages'\)/);
 assert.match(cli,/inspectMany\(assetPaths,'assets'\)/);
 assert.doesNotMatch(cli,/writeFile|unlink|exec\(/);
});
test('A · HTTP(S) kiadási gyökér és 71/748 ellenőrzés',()=>{
 const cli=read('tools/check-release-target-v1-39-15.mjs');
 assert.match(cli,/\['http:','https:'\]/);
 assert.match(cli,/pages\.checked===71/);
 assert.match(cli,/assets\.checked===748/);
});
test('B · a képsáv dokumentumfolyamban marad, méretvisszacsatolás nélkül',()=>{
 assert.match(code,/shell\.append\(header\);shell\.after\(hero\)/);
 assert.doesNotMatch(code,/ResizeObserver\(queue\)\.observe\(hero\)/);
 assert.doesNotMatch(code,/hero\.style\.setProperty\('--cs39-hero-expanded'/);
 assert.match(css,/max-height:none!important;opacity:1!important;transition:none!important/);
});
test('B · egy középső gomb, 30 px-es hiszterézis',()=>{
 assert.match(code,/compact\.append\(preview\)/);
 assert.match(read('js/release-v1-39-0.js'),/bottom<=84/);
 assert.match(read('js/release-v1-39-0.js'),/bottom>=114/);
 assert.match(css,/#cs39-mini-hero/);
});
test('B · aloldalon nincs második sor, a sportanimáció fejlécben marad',()=>{
 assert.match(read('js/subpage-header-motion.js'),/brandRow\.prepend\(region\)/);
 assert.match(css,/body\.cs-inner-page #site-header \.cs-subpage-motion/);
 assert.match(read('css/subpage-morph-v1-39-13.css'),/#cs39-mobile-route\{display:none!important\}/);
});
test('B · az animáció csökkentett mozgás, rejtett lap és kézi szünet állapotát követi',()=>{
 const motion=read('js/subpage-header-motion.js');
 assert.match(motion,/document\.hidden/);
 assert.match(motion,/motionPreference\.matches/);
 assert.match(motion,/dataset\.motionState=stopped\?'paused':'playing'/);
 assert.match(motion,/scene\.addEventListener\('click'/);
});
test('C · mobilmenü és keresés overlay mellett a gyorssáv nem takar ki',()=>{
 assert.match(css,/#ext26-mobile-nav button\{min-width:44px!important;min-height:48px!important/);
 assert.match(css,/body:has\(#search-panel:not\(\[hidden\]\)\) #ext26-mobile-nav/);
 assert.match(css,/#ext26-mobile-nav button:focus-visible/);
});
test('C · mobilon a hírek egy oszlopba rendeződnek',()=>{
 assert.match(css,/@media\(max-width:480px\)/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/\.cs-news-card:last-child:nth-child\(odd\)/);
});
test('C · kártya és galéria kép-rács keskeny képernyőn is méreteződik',()=>{
 assert.match(css,/\.media26-grid/);
 assert.match(css,/repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:355px\)/);
});
test('D · öt intézményi hírt külön listáz, nem tekinti igazoltnak',()=>{
 const items=data('json/adatok/hirek-hivatalos.json').items;
 const verified=items.filter(item=>item.status==='verified');
 assert.equal(verified.length,5);
 assert.equal(inspectNewsCollection(data('json/adatok/hirek-hivatalos.json'),data('json/config.json')).length,5);
 assert.match(review,/newsSources: '\.\.\/json\/adatok\/hirek-hivatalos\.json'/);
 assert.match(review,/sourceStatus:'A verified jelölés NEM igazolás/);
});
test('D · forrásellenőrzés kizárólag hivatalos HTTPS URL-t és dátumot fogad',()=>{
 assert.match(review,/url\.protocol==='https:'&&url\.hostname==='csanadi-bp\.edu\.hu'/);
 assert.match(review,/intézményi HTTPS-forráscím/);
 assert.match(review,/ellenőrzés dátuma/);
 assert.match(gate,/localNewsEvidence/);
});
test('D · 23+69+5 külön CSV és régi 23+69 export megmarad',()=>{
 assert.match(read('tools/tartalmi-hitelesites.html'),/id="exportall"/);
 assert.match(review,/csanadi_23_oldal_69_media_5_hir_jovahagyasi_lista\.csv/);
 assert.match(review,/csanadi_23_oldal_69_media_hitelesitesi_lista\.csv/);
 assert.match(review,/rows\.map\(cells=>cells\.map\(quote\)/);
});
test('D · helyi jegyzet nem jelent publikálást vagy intézményi engedélyt',()=>{
 assert.match(gate,/institutionalApprovalVerified:false,ftpPublished:false/);
 assert.equal(data('json/mediatar.json').items.filter(item=>item.rights?.clearance==='pending').length,69);
 assert.equal(data('dokumentacio/TARTALMI_MINOSEG_V1_39_9.json').priorities.length,23);
});
test('Megőrzés · 71 oldal, 748 assets, CDN és FTP',()=>{
 assert.equal(Object.keys(data('json/oldalindex.json').pages).length,71);
 assert.equal(data('json/assets-inventory.json').items.length,748);
 assert.match(html,/bootstrap@5\.3\.9/);
 assert.match(html,/header-mobile-polish-v1-39-15\.css\?v=1\.39\.(?:15|16)/);
});
const failed=results.filter(result=>!result.ok);
console.log(JSON.stringify({release:'1.39.15',checks:results.length,passed:results.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
