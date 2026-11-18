/* I+J+K+L: a teljes kiadásnak a korábbi funkciókat és új eszközöket is tartalmaznia kell. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {analyzeContentPages,contentAuditCsv} from './content-quality-core-v1-40-5.mjs';
import {sha256Bytes} from './sha256-local-v1-40-5.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const json=name=>JSON.parse(read(name));
const checks=[];
function test(name,fn){try{fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:String(error.message||error).slice(0,400)});}}
const index=json('json/oldalindex.json'),home=json('json/oldalak/kezdolap.json');
const pages=Object.keys(index.pages).map(file=>({path:file,page:json('json/'+file)}));
const media=json('json/mediatar.json').items,inventory=json('json/assets-inventory.json').items;
const generated=json('dokumentacio/TARTALOM_KERESES_AUDIT_V1_40_5.json');

test('H: v1.40.5 indítókód és változatlan CDN alapok',()=>{
 assert.equal(json('json/config.json').performance.cacheVersion,'csanadi-r-v1.40.10');
 assert.match(read('index.html'),/script\.js\?v=1\.40\.10/);
 assert.match(read('script.js'),/app\.js\?v=1\.40\.10/);
 assert.match(read('js/app.js'),/blocks\.js\?v=1\.40\.10/);
 assert.match(read('index.html'),/bootstrap@5\.3\.9/);
});
test('Megőrzés: mind a 71 oldal, 769 asset, 174 média és 30 kezdőkép',()=>{
 assert.equal(pages.length,71);assert.equal(inventory.length,769);
 assert.equal(media.length,174);assert.equal(home.blocks.find(b=>b.id==='block:home-hero').data.slides.length,30);
 for(const item of inventory)assert.ok(fs.existsSync(path.join(root,item.path)),item.path);
});
test('I: intézményi fotók csak tényleges írásos jogalappal',()=>{
 const html=read('tools/iskolai-fotok-jovahagyasa.html'),js=read('tools/iskolai-fotok-jovahagyasa.js');
 for(const field of ['photos-holder','photos-evidence','photos-reviewer','photos-decision','photos-privacy','photos-institution-confirm'])assert.ok(html.includes('id="'+field+'"'),field);
 assert.match(js,/crypto\.subtle\.digest\('SHA-256'/);assert.match(js,/reportValidity\(\)/);
 assert.match(js,/sha256-local-v1-40-5\.mjs/);
 assert.match(js,/uploadedToServer:false/);assert.match(js,/externallyVerifiedBySystem:false/);
 assert.doesNotMatch(js,/method:\s*['"](?:POST|PUT|DELETE|PATCH)/i);
 assert.ok(media.every(item=>item.rights?.clearance!=='approved'));
});
test('I: HTTP/FTP-kompatibilis SHA-256 ismert tesztvektorokra',()=>{
 for(const value of ['', 'abc', 'Csanádi Sportiskola', 'x'.repeat(1024)]){
  const expected=createHash('sha256').update(value).digest('hex');
  assert.equal(sha256Bytes(new TextEncoder().encode(value)),expected);
 }
});
test('J: 320/390/768 mobil QA tényleges iframe-es mérési kerettel',()=>{
 const html=read('tools/mobil-akadalymentesseg-qa.html'),js=read('tools/mobil-akadalymentesseg-qa.js');
 assert.match(js,/widths=\[320,390,768\]/);assert.match(js,/frame\.contentWindow/);
 assert.match(js,/root\.scrollWidth/);assert.match(js,/getBoundingClientRect/);
 assert.match(js,/qa-json/);assert.match(js,/manualScreenReaderCertified:false/);
 assert.match(html,/qa-frame/);assert.match(html,/NVDA/);assert.match(html,/VoiceOver/);
});
test('K: egységes, teljes és akadálymentes segédprogram-navigáció',()=>{
 const html=read('tools/index.html'),ui=read('tools/tool-ui-2026.js'),css=read('css/tools-unified-v1-40-5.css');
 for(const name of ['iskolai-fotok-jovahagyasa.html','mobil-akadalymentesseg-qa.html','tartalom-kereses-audit.html']){
  assert.ok(html.includes(name));assert.ok(ui.includes(name));assert.ok(fs.existsSync(path.join(root,'tools',name)));
 }
 assert.match(ui,/cs-tools-global-nav/);assert.match(css,/:focus-visible/);
 assert.match(css,/@media\(max-width:780px\)/);assert.match(css,/@media\(forced-colors:active\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
test('K: a nyitó karbantartási munkaközpont elavult 69-es médiadarabszáma megszűnt',()=>{
 const html=read('tools/index.html');assert.doesNotMatch(html,/69 médiajog|55 nyitott tétel/);
});
test('L: minden oldal tartalmi szerkezete és keresőindexe ellenőrzött',()=>{
 const report=analyzeContentPages(pages,index);assert.equal(report.totals.pages,71);
 assert.equal(report.totals.error,0);assert.equal(report.totals.warning,0);
 assert.deepEqual(report,generated);
 assert.equal(contentAuditCsv(report),read('dokumentacio/TARTALOM_KERESES_AUDIT_V1_40_5.csv'));
});
test('L: a tíz kezdőképes hivatkozás már csak létező oldalra mutat',()=>{
 const slides=home.blocks.find(b=>b.id==='block:home-hero').data.slides;
 const routes=new Set(pages.map(e=>e.page.schemaExtensions.route));
 for(const slide of slides)for(const button of slide.buttons||[])assert.ok(routes.has(button.href),button.href);
 assert.ok(!read('json/oldalak/kezdolap.json').includes('#/iskolank/kozosseg'));
});
test('L: a böngészős keresési audit nem módosít szerveres JSON-t',()=>{
 const js=read('tools/tartalom-kereses-audit.js'),core=read('tools/content-quality-core-v1-40-5.mjs');
 assert.match(js,/fetch\(url,\{cache:'no-store'\}\)/);assert.match(js,/textContent/);
 assert.doesNotMatch(js,/method:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
 assert.match(core,/OLD_SITE_LINK/);assert.match(core,/UNKNOWN_INTERNAL_ROUTE/);
});
test('K+H: minden új forrás beépült a kiadásellenőrzésbe',()=>{
 const source=read('tools/check-release-target-v1-40-5.mjs');
 assert.match(source,/csanadi-website-v1\.40\.5/);
 assert.match(source,/expectedPages/);assert.match(source,/expectedAssets/);
 assert.match(source,/content-quality-core-v1-40-5/);
 assert.doesNotMatch(source,/method:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
});
test('Biztonság: a HTML-eszközök egyike sem publikál automatikusan',()=>{
 for(const script of ['tools/iskolai-fotok-jovahagyasa.js','tools/mobil-akadalymentesseg-qa.js','tools/tartalom-kereses-audit.js']){
  assert.doesNotMatch(read(script),/fetch\([^\n]*method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)/i,script);
 }
});
const failed=checks.filter(x=>!x.passed);
console.log(JSON.stringify({release:'1.40.5',total:checks.length,passed:checks.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
