/* v1.40.9 AA+AB+AC+AD+AE+AF: kizárólag helyi regresszió. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {recommendRelatedContent} from '../js/search-recommendations-v1-40-9.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const json=n=>JSON.parse(read(n));
const checks=[];
const test=(name,fn)=>{try{fn();checks.push({name,passed:true});}catch(e){checks.push({name,passed:false,error:String(e.message||e)});}};
test('AA · fotóforrás és engedély hiányában nincs valódi új kép',()=>{
 const x=json('dokumentacio/FOTO_STATUS_V1_40_9.json');assert.equal(x.sourcePhotoFilesReceived,0);assert.equal(x.institutionalPermissionsReceived,0);assert.equal(x.newApprovedPhotosIntegrated,0);assert.equal(x.unchangedMediaItems,174);assert.equal(x.unchangedHeroSlides,30);
});
test('AA · jóváhagyási és elhelyezési kapu megőrzése',()=>{
 const x=read('tools/photo-placement-core-v1-40-8.mjs');assert.match(x,/independentInstitutionalVerification/);assert.match(x,/publicDisplayAllowed/);assert.match(x,/approvalRequiredBeforeMerge:true/);
});
test('AB · 320, 390, 768 px és új szemantikus ellenőrzések',()=>{
 const status=json('dokumentacio/MOBIL_AKADALYMENTESSEG_STATUS_V1_40_9.json');const code=read('tools/mobil-akadalymentesseg-qa.js');assert.deepEqual(status.automatedWidths,[320,390,768]);
 for(const marker of ['h1,h2,h3,h4,h5,h6','[aria-expanded][aria-controls]','a[target="_blank"]','noopener','Duplikált ID'])assert.ok(code.includes(marker),marker);
 assert.equal(status.wcagConformanceCertified,false);assert.equal(status.actualDeviceReportsSupplied,0);
});
test('AC · minden SEO oldal noindex, nincs engedély nélküli aktiválás',()=>{
 const plan=json('dokumentacio/SEO_AKTIVALASI_TERV_V1_40_9.json');assert.equal(plan.total,71);assert.equal(plan.indexable,0);assert.equal(plan.indexingActivated,false);assert.equal(plan.publicationAuthorized,false);
 assert.ok(plan.verifiedContent>0&&plan.verifiedContent<71);assert.equal(plan.pages.filter(x=>x.robots==='noindex,nofollow').length,71);
 for(const x of json('dokumentacio/SEO_LEFEDES_V1_40_8.json').entries)assert.match(read(x.seoPath),/content="noindex,nofollow"/);
});
test('AC · kiinduló éles domain átállítása még szükséges',()=>{
 const x=json('dokumentacio/SEO_AKTIVALASI_TERV_V1_40_9.json');assert.match(x.baseUrl,/github\.io/);assert.ok(x.preconditions.some(s=>s.includes('FTP')));
});
test('AD · első hero reszponzív és csak kezdőlapon előtöltött',()=>{
 const html=read('index.html');assert.match(html,/link\.rel='preload'/);assert.match(html,/location\.hash\|\|'#\/'/);assert.match(html,/cs-gate-pending/);assert.match(html,/navigator\.connection.*saveData/);assert.match(html,/imageSrcSet/);assert.match(html,/fetchPriority='high'/);
 const performance=json('dokumentacio/TELJESITMENY_TERV_V1_40_9.json');assert.equal(performance.homeHero.preloadTargets.length,7);assert.equal(performance.realMetricsMeasured,false);
});
test('AD · egyetlen helyi CSS-kérés, Bootstrap csak fix CDN',()=>{
 const html=read('index.html').replace(/<!--[\s\S]*?-->/g,'');assert.equal([...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="(?:css|desktop|mobile)\//g)].length,1);assert.match(html,/bootstrap@5\.3\.9/);
});
const page={id:'p',type:'page',title:'Sport kosárlabda edzés',section:'sport',tags:['sport'],href:'#/sport'};
const rows=[page,{id:'n',type:'news',title:'Sport kosárlabda hírek',section:'sport',href:'#/hirek',tags:['sport']},{id:'e',type:'event',title:'Sport edzés rendezvény',section:'sport',href:'#/esemeny',verified:true},{id:'d',type:'document',title:'Sportedzés dokumentum',section:'informaciok',href:'assets/documents/edzes.pdf',tags:['sport']},{id:'x',type:'news',title:'Sport próbahír',section:'sport',href:'#/mintahir',isSample:true},{id:'u',type:'event',title:'Sport esemény ellenőrizetlen',section:'sport',href:'#/tilos',verified:false}];
test('AE · oldal, hír, esemény és dokumentum egységes ajánlása',()=>{
 const recommendations=recommendRelatedContent(page,rows,{limit:6,perType:2});assert.deepEqual(new Set(recommendations.map(x=>x.type)),new Set(['news','event','document']));
 assert.ok(!recommendations.some(x=>x.isSample||x.verified===false));
});
test('AE · relevancia, típuslimitek, minta és önajánlás kizárása',()=>{
 const lots=Array.from({length:12},(_,i)=>({id:'i'+i,type:'news',href:'#/news/'+i,title:'Sport kosárlabda '+i,section:'sport'}));
 const result=recommendRelatedContent(page,[page,...lots,...rows],{limit:5,perType:2});assert.ok(result.length<=5);assert.ok(result.filter(x=>x.type==='news').length<=2);assert.ok(!result.some(x=>x.id===page.id));
 assert.deepEqual(recommendRelatedContent(null,rows),[]);
});
test('AE · felület típusok, profilmentesség és csak hitelesített események',()=>{
 const x=read('js/search-j-2026.js');assert.match(x,/recommendRelatedContent\(seed,all/);assert.match(x,/verified:type!=='event'\|\|item\.verified===true/);assert.match(x,/Kapcsolódó ellenőrzött tartalmak/);assert.doesNotMatch(x,/localStorage\.setItem\([^\n]*query/);
});
test('AF · régi v1.40.8 ZIP hiteles SHA-256 ellenőrzött',()=>{
 const x=json('dokumentacio/FTP_STAGING_VISSZAALLITAS_V1_40_9.json');assert.equal(x.previousArchiveVerified,true);assert.equal(x.previousArchiveSha256,'e8137f7c430499ac681f6d4e8e47dd6c825550e3dfd93d1887ce3506b72521e7');
 assert.equal(x.previousRelease,'1.40.8');assert.equal(x.stagedToServer,false);assert.equal(x.productionActivated,false);
});
test('AF · megőrzött v1.40.9 alapjegyzék és aktuális cache',()=>{
 assert.equal(json('dokumentacio/BAZIS_MANIFEST_V1_40_9.json').release,'csanadi-website-v1.40.9');assert.equal(json('json/config.json').performance.cacheVersion,'csanadi-r-v1.40.10');
 assert.match(read('script.js'),/js\/app\.js\?v=1\.40\.10/);
});
const failed=checks.filter(x=>!x.passed);console.log(JSON.stringify({release:'1.40.9',checks:checks.length,passed:checks.length-failed.length,failed},null,2));if(failed.length)process.exitCode=1;
