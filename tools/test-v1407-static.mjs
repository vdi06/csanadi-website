/* v1.40.7 Q+R+S+T: biztonságos, offline, újrafuttatható tesztek. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildPhotoStagingPlan} from './photo-staging-core-v1-40-7.mjs';
import {compareMobileQaReports} from './qa-diff-core-v1-40-7.mjs';
import {compareReleaseManifests} from './release-diff-core-v1-40-7.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const json=name=>JSON.parse(read(name));
const checks=[];
const test=(name,fn)=>{try{fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:String(error.message||error).slice(0,500)});}};
const image={name:'valodi.jpg',mimeType:'image/jpeg',sizeBytes:234567,width:1200,height:800,sha256:'a'.repeat(64)};
const approval=Object.fromEntries(['holder','permission','evidenceId','reviewer','decisionId','sourceDate','privacyBasis'].map(x=>[x,'helyi próba']));
const photoReport={approval,images:[image]};
const mobile=overrides=>[320,390,768].map(width=>({width,actual:width,route:'#/',overflow:0,tinyTargets:[],headerOverlaps:[],aria:true,...overrides?.[width]}));
const manifest=(release,files)=>({release,files:Object.fromEntries(Object.entries(files).map(([p,n])=>[p,{sizeBytes:n.size,sha256:n.hash}]))});
const h=char=>char.repeat(64);
test('Q · hiteles fájl–nyilatkozat egyezés után függő médiatári terv',()=>{
 const result=buildPhotoStagingPlan(photoReport,[image],[]);assert.equal(result.ready,true);assert.equal(result.publicationApproved,false);
 assert.equal(result.items.length,1);assert.equal(result.items[0].rights.clearance,'pending');
 assert.equal(result.items[0].staging.publicDisplayAllowed,false);assert.equal(result.items[0].alt,'');
 assert.match(result.items[0].original.path,/^assets\/media\/intezmenyi-ellenorzesre\//);
});
test('Q · hibás jóváhagyás vagy eltérő eredeti kép nem készíthet importtervet',()=>{
 assert.equal(buildPhotoStagingPlan({...photoReport,approval:{}},[image],[]).ready,false);
 assert.equal(buildPhotoStagingPlan(photoReport,[{...image,sha256:h('b')}],[]).ready,false);
});
test('Q · már nyilvántartott kép nem kap második médiasort',()=>{
 const result=buildPhotoStagingPlan(photoReport,[image],[{id:'media:existing',original:{sha256:image.sha256}}]);
 assert.equal(result.ready,false);assert.equal(result.items.length,0);assert.ok(result.issues.some(x=>x.includes('már szerepel')));
});
test('Q · eszközben a felhasználó indítja az exportot, nincs publikálás',()=>{
 const html=read('tools/iskolai-fotok-jovahagyasa.html'),code=read('tools/iskolai-fotok-jovahagyasa.js');
 assert.match(html,/photos-stage-export/);assert.match(code,/buildPhotoStagingPlan/);assert.match(code,/uploadedToServer:false/);
 assert.doesNotMatch(code,/method:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
});
test('R · megszűnt, új és fennmaradó mobilos hibák elkülönítése',()=>{
 const before={release:'1.40.6',manualScreenReaderCertified:false,results:mobile({320:{overflow:20,tinyTargets:['menu']},390:{aria:false}})};
 const after={release:'1.40.7',manualScreenReaderCertified:false,results:mobile({320:{tinyTargets:['menu']},768:{headerOverlaps:['brand/search']}})};
 const result=compareMobileQaReports(before,after);
 assert.ok(result.resolved.some(x=>x.issue==='VÍZSZINTES_TÚLCSORDULÁS'));
 assert.ok(result.resolved.some(x=>x.issue==='ARIA_HIÁNYOSSÁG'));
 assert.ok(result.persistent.some(x=>x.issue==='KIS_CÉLFELÜLET:menu'));
 assert.ok(result.introduced.some(x=>x.issue.includes('FEJLÉCÁTFEDÉS')));
 assert.equal(result.manualCertificationMissing,true);
});
test('R · hiányzó új mérés soha nem számít megjavítottnak',()=>{
 const result=compareMobileQaReports({results:mobile({320:{overflow:12}})},{results:mobile().slice(1)});
 assert.equal(result.comparisonComplete,false);assert.ok(result.coverageGaps.some(x=>x.scope.endsWith('|320')));
 assert.equal(result.resolved.length,0);
});
test('R · QA-eszközben két JSON-import, elemzés és saját export',()=>{
 const html=read('tools/mobil-akadalymentesseg-qa.html'),code=read('tools/mobil-akadalymentesseg-qa.js');
 for(const token of ['qa-after-import','qa-diff-list','qa-diff-export'])assert.ok(html.includes(token));
 assert.match(code,/compareMobileQaReports/);assert.match(code,/qa-diff-export/);
});
test('S · kereső billentyűzetes súgó, Home/End navigáció és fókusz',()=>{
 const code=read('js/search-j-2026.js'),style=read('css/search-ux-v1-40-7.css');
 for(const fragment of ['j-search-keyboard-help','ArrowDown','ArrowUp','Home','End','aria-keyshortcuts'])assert.ok(code.includes(fragment));
 assert.match(style,/:focus-visible/);assert.match(style,/min-height:44px/);
 assert.match(read('index.html'),/search-ux-v1-40-7\.css/);
});
test('S · tartalomtípus- és témakörszűrők valós elemszámmal',()=>{
 const code=read('js/search-j-2026.js');assert.match(code,/function refreshFilterCounts\(\)/);
 assert.match(code,/for\(const entry of all\)/);assert.match(code,/refreshFilterCounts\(\)/);
 assert.match(code,/order!=='relevance'/);
 assert.doesNotMatch(code,/localStorage\.setItem\([^\n]*query/);
});
test('T · manifestek pontos új/módosult/eltűnt összevetése',()=>{
 const old=manifest('v1',{a:{size:2,hash:h('a')},b:{size:3,hash:h('b')},c:{size:5,hash:h('c')}});
 const next=manifest('v2',{a:{size:2,hash:h('a')},b:{size:6,hash:h('d')},d:{size:9,hash:h('e')}});
 const delta=compareReleaseManifests(old,next);assert.deepEqual([delta.totals.added,delta.totals.changed,delta.totals.removed,delta.totals.unchanged],[1,1,1,1]);
 assert.equal(delta.totals.byteDelta,7);
});
test('T · hibás vagy veszélyes fájlutak elutasítva',()=>{
 assert.throws(()=>compareReleaseManifests(manifest('a',{'../secret':{size:1,hash:h('a')}}),manifest('b',{})));
 assert.throws(()=>compareReleaseManifests({release:'a',files:{x:{sizeBytes:1,sha256:'not-a-hash'}}},manifest('b',{})));
});
test('T · éles baseline és új eltérésjelentés összehangolva',()=>{
 const base=json('dokumentacio/BAZIS_MANIFEST_V1_40_6.json'),current=json('dokumentacio/BAZIS_MANIFEST_V1_40_7.json');
 const diff=json('dokumentacio/KIADASI_ELTERESEK_V1_40_7.json');
 assert.equal(base.release,'csanadi-website-v1.40.6');assert.equal(current.release,'csanadi-website-v1.40.7');
 const computed=compareReleaseManifests(base,current);
 assert.deepEqual(diff.totals,computed.totals);assert.deepEqual(diff.flagged,computed.flagged);
});
test('T · kiadási kapu integritása megfelelő, jóváhagyás továbbra sincs',()=>{
 const gate=json('dokumentacio/KIADASI_KAPU_V1_40_7.json');
 assert.equal(gate.packageIntegrity.passed,true);assert.equal(gate.readyForPublicRelease,false);
 assert.equal(gate.publicationPerformed,false);
 assert.equal(gate.versionComparison.baseline,'csanadi-website-v1.40.6');
 assert.equal(gate.releaseGates.find(item=>item.id==='photo-rights').passed,false);
 assert.equal(gate.releaseGates.find(item=>item.id==='physical-qa').passed,false);
});
test('T · helyi és távoli célhely-ellenőrző, mutáló hálózati kérés nélkül',()=>{
 const code=read('tools/check-release-target-v1-40-7.mjs');assert.match(code,/csanadi-website-v1\.40\.7/);
 assert.match(code,/KIADASI_ELTERESEK_V1_40_7/);assert.doesNotMatch(code,/method:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
 for(const script of ['tools/kiadas-osszehasonlitas-v1-40-7.js','tools/kiadasi-kapu-v1-40-7.js'])assert.doesNotMatch(read(script),/method:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
});
test('Megőrzés · oldalak, médiák, kezdőképek, Bootstrap és cache-verzió',()=>{
 assert.equal(Object.keys(json('json/oldalindex.json').pages).length,71);
 assert.equal(json('json/assets-inventory.json').items.length,769);
 assert.equal(json('json/mediatar.json').items.length,174);
 assert.equal(json('json/oldalak/kezdolap.json').blocks.find(b=>b.id==='block:home-hero').data.slides.length,30);
 assert.match(read('index.html'),/bootstrap@5\.3\.9/);
 assert.equal(json('json/config.json').performance.cacheVersion,'csanadi-r-v1.40.10');
});
const failed=checks.filter(item=>!item.passed);
console.log(JSON.stringify({release:'1.40.7',total:checks.length,passed:checks.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
