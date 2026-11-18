/* M+N+O+P: tiszta függvényes és állományalapú regresszió, szerverírás nélkül. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validFeaturedRoutes,isFeaturedHit,uniqueSearchEntries,sortSearchHits} from '../js/search-policies-v1-40-6.js';
import {verifyPhotoApproval} from './photo-approval-core-v1-40-6.mjs';
import {analyzeMobileQa} from './qa-import-core-v1-40-6.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8'),json=name=>JSON.parse(read(name));
const tests=[];
const test=(name,fn)=>{try{fn();tests.push({name,passed:true});}catch(error){tests.push({name,passed:false,error:String(error.message||error)});}};
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const pages=json('json/oldalindex.json').pages;
test('M · egyedi SHA-256 jegyzék kontrollja jóváhagyási tényállítás nélkül',()=>{
 const file={name:'teszt.jpg',mimeType:'image/jpeg',sizeBytes:128,width:800,height:600,sha256:'a'.repeat(64)};
 const approval=Object.fromEntries(['holder','permission','evidenceId','reviewer','decisionId','sourceDate','privacyBasis'].map(key=>[key,'próba']));
 const manifest={approval,images:[file]};
 assert.equal(verifyPhotoApproval(manifest,[file]).matched,true);
 assert.equal(verifyPhotoApproval(manifest,[{...file,sha256:'b'.repeat(64)}]).matched,false);
 assert.equal(verifyPhotoApproval({...manifest,approval:{}},[file]).matched,false);
 assert.equal(verifyPhotoApproval({...manifest,images:[file,file]},[file]).matched,false);
});
test('M · fotó-regisztráció nem publikál és tartalmaz jóváhagyási figyelmeztetést',()=>{
 const js=read('tools/iskolai-fotok-jovahagyasa.js');assert.match(js,/verifyPhotoApproval/);
 assert.match(read('tools/photo-approval-core-v1-40-6.mjs'),/nem igazolja a tényleges intézményi engedély/);
 assert.doesNotMatch(js,/method:\s*['"](?:POST|PUT|PATCH|DELETE)/);
});
test('N · mindhárom mobilnézet jegyzőkönyv-feldolgozásában szerepel',()=>{
 const results=[320,390,768].map(width=>({width,actual:width,route:'#/',overflow:0,tinyTargets:[],headerOverlaps:[],aria:true,passed:true}));
 assert.equal(analyzeMobileQa({release:'1.40.6',manualScreenReaderCertified:true,results}).passed,true);
 assert.equal(analyzeMobileQa({release:'1.40.6',manualScreenReaderCertified:false,results}).passed,false);
 assert.ok(analyzeMobileQa({release:'1.40.6',manualScreenReaderCertified:true,results:results.slice(1)}).issues.some(x=>x.includes('320')));
 assert.ok(analyzeMobileQa({release:'1.40.6',manualScreenReaderCertified:true,results:[{...results[0],headerOverlaps:['a/b']},...results.slice(1)]}).issues.some(x=>x.includes('fejlécátfedés')));
});
test('N · valós iframe-mérések, import és fejlécátfedés látható',()=>{
 const js=read('tools/mobil-akadalymentesseg-qa.js'),html=read('tools/mobil-akadalymentesseg-qa.html');
 for(const fragment of ['qa-import','qa-import-issues','Fejlécátfedés','qa-frame'])assert.ok(html.includes(fragment));
 for(const fragment of ['headerOverlaps','getBoundingClientRect','frame.contentWindow','qa-import-core-v1-40-6.mjs'])assert.ok(js.includes(fragment));
});
test('O · kiemelt keresési útvonalak biztonságosak, valós oldalak',()=>{
 const routes=validFeaturedRoutes({...json('json/config.json').search.featuredRoutes,evil:'https://example.com/x'});
 assert.equal('evil' in routes,false);
 const existing=new Set(Object.values(pages).map(page=>page.schemaExtensions.route));
 for(const route of Object.values(routes))assert.ok(existing.has(route),route);
});
test('O · csak tényleges releváns keresés emel ki teljes céloldalt',()=>{
 const entry={type:'page',href:'#/oktatas/felveteli'};
 assert.equal(isFeaturedHit(entry,['felveteli'],{felveteli:entry.href},norm),true);
 assert.equal(isFeaturedHit(entry,['sport'],{felveteli:entry.href},norm),false);
 assert.equal(isFeaturedHit({...entry,type:'news'},['felveteli'],{felveteli:entry.href},norm),false);
});
test('O · duplikációk szűrése és magyar címsorrend mindkét irányban',()=>{
 const a={id:'a',title:'Általános',href:'#/a',type:'page'},b={id:'b',title:'Zárás',href:'#/b',type:'page'};
 assert.equal(uniqueSearchEntries([a,b,{...a}]).length,2);
 assert.deepEqual(sortSearchHits([{x:b,score:5},{x:a,score:9}],'title-asc').map(x=>x.x.id),['a','b']);
 assert.deepEqual(sortSearchHits([{x:b,score:5},{x:a,score:9}],'title-desc').map(x=>x.x.id),['b','a']);
 assert.equal(sortSearchHits([{x:b,score:5},{x:a,score:9}])[0].x.id,'a');
});
test('O · keresési kezelőben szerepel relevancia, szűrés, mentett rendezés',()=>{
 const code=read('js/search-j-2026.js');
 for(const fragment of ['validFeaturedRoutes','uniqueSearchEntries','orderSelect','title-asc','title-desc','snapshot(){return {query,type,section,order,max}'])assert.ok(code.includes(fragment));
 assert.ok(read('index.html').includes('search-polish-v1-40-6.css'));
});
test('P · statikus, csak olvasó kiadási kapu minden új eszközzel',()=>{
 const html=read('tools/index.html'),ui=read('tools/tool-ui-2026.js'),gate=read('tools/kiadasi-kapu-v1-40-6.js');
 assert.ok(html.includes('kiadasi-kapu-v1-40-7.html'));assert.ok(ui.includes('kiadasi-kapu-v1-40-7.html'));
 assert.match(gate,/KIADASI_KAPU_V1_40_6/);assert.doesNotMatch(gate,/method:\s*['"](?:POST|PUT|PATCH|DELETE)/);
});
test('P · kiadási kapu függetlenül blokkolja az intézményi jóváhagyást',()=>{
 const gate=json('dokumentacio/KIADASI_KAPU_V1_40_6.json');
 assert.equal(gate.readyForPublicRelease,false);assert.equal(gate.publicationPerformed,false);
 assert.equal(gate.releaseGates.find(x=>x.id==='photo-rights').passed,false);
 assert.equal(gate.releaseGates.find(x=>x.id==='physical-qa').passed,false);
 assert.equal(gate.packageIntegrity.passed,true);
});
test('P · csak statikus fájlok, verziózott CDN, változatlan tartalomkészlet',()=>{
 assert.ok(read('index.html').includes('bootstrap@5.3.9'));
 assert.equal(json('json/config.json').performance.cacheVersion,'csanadi-r-v1.40.10');
 assert.equal(Object.keys(pages).length,71);assert.equal(json('json/assets-inventory.json').items.length,769);
 assert.equal(json('json/mediatar.json').items.length,174);
 assert.equal(json('json/oldalak/kezdolap.json').blocks.find(b=>b.id==='block:home-hero').data.slides.length,30);
});
test('P · kiadási cél-ellenőrző megléte és kizárólag lekérései',()=>{
 const code=read('tools/check-release-target-v1-40-6.mjs');assert.match(code,/csanadi-website-v1\.40\.6/);
 assert.match(code,/criticalFiles/);assert.match(code,/manifest\.files/);
 assert.doesNotMatch(code,/method:\s*['"](?:POST|PUT|PATCH|DELETE)/);
});
const failures=tests.filter(test=>!test.passed);
console.log(JSON.stringify({release:'1.40.6',total:tests.length,passed:tests.length-failures.length,failed:failures},null,2));
if(failures.length)process.exitCode=1;
