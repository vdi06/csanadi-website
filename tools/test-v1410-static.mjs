/* v1.40.10 AG+AH+AI+AJ+AK+AL: új, automatizált offline funkciótesztek. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {assessOfficialPhotos} from './official-photo-validation-v1-40-10.mjs';
import {planQaRemediation} from './qa-remediation-core-v1-40-10.mjs';
import {planSeoActivation} from './seo-consent-core-v1-40-10.mjs';
import {assessWebVitals} from './vitals-review-core-v1-40-10.mjs';
import {recommendRelatedContent,validateEditorialRules} from '../js/search-recommendations-v1-40-9.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const json=name=>JSON.parse(read(name));
const checks=[];
const test=(name,fn)=>{try{fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:error.message});}};
const png=Buffer.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,4,0,0,0,3,0,8,2,0,0,0,0,0,0,0]);
const photo={fileName:'iskolai-edzes.png',mimeType:'image/png',sha256:createHash('sha256').update(png).digest('hex'),width:1024,height:768,
 alt:'Diákok és edzők közös kosárlabdás foglalkozáson',containsIdentifiableMinors:true,
 approval:{holder:'Iskola',licenseEvidenceId:'L1',privacyEvidenceId:'P1',reviewedBy:'Független ellenőr',decisionId:'D1',reviewedAt:'2026-11-18',publicDisplayAllowed:true,independentInstitutionalVerification:true,minorConsentEvidenceVerified:true}};
test('AG · jóváhagyási adatok + eredeti képbájt megvannak',()=>{
 const result=assessOfficialPhotos({photos:[photo]},[{name:photo.fileName,bytes:png}],[]);
 assert.equal(result.readyForIndependentReview,true);assert.equal(result.publicationApproved,false);assert.equal(result.publicationPerformed,false);
});
test('AG · kiskorúi engedély és SHA nélkül blokkol',()=>{
 const invalid={...photo,sha256:'0'.repeat(64),approval:{...photo.approval,minorConsentEvidenceVerified:false}};
 const result=assessOfficialPhotos({photos:[invalid]},[{name:photo.fileName,bytes:png}],[]);
 assert.equal(result.readyForIndependentReview,false);assert.ok(result.issues.some(x=>x.includes('SHA-256')));assert.ok(result.issues.some(x=>x.includes('kiskorú')));
});
test('AG · nincs mellékelt fotó, nincs képtári módosítás',()=>{
 const result=json('dokumentacio/FOTO_ELLENORZES_V1_40_10.json');assert.equal(result.originals,0);assert.equal(result.mediaRegistryModified,false);assert.equal(result.priorMediaItems,174);
});
test('AH · tényleges QA-adatokból javítási feladatsor keletkezik',()=>{
 const before={release:'1.40.9',results:[{route:'#/sport',width:390,actual:350,overflow:12,aria:false,tinyTargets:['menü'],headerOverlaps:[],a11yIssues:['Üres név']}]};
 const result=planQaRemediation(before);
 assert.ok(result.issues.length>=4);assert.ok(result.issues.some(x=>x.priority==='magas'));assert.equal(result.wcagConformanceCertified,false);
 assert.ok(result.issues.every(x=>!x.verifiedFixed));
});
test('AH · valós eredmény nélkül nulla igazolt javítás',()=>{
 const result=json('dokumentacio/MOBIL_HIBAJAVITASI_TERV_V1_40_10.json');assert.equal(result.actualReportsProvided,0);assert.equal(result.itemsFixedFromEvidence,0);assert.equal(result.physicalTestingPerformed,false);
});
const seoPage={title:'Bemutatkozás',lifecycle:{status:'published'},seo:{title:'Csanádi Sportiskola',description:'A sportiskola bemutatkozása.',robots:'noindex,nofollow'},schemaExtensions:{route:'#/rolunk',verifiedContent:true}};
const approval={route:'#/rolunk',contentReviewer:'Tartalmi ellenőr',privacyReviewer:'Adatvédelmi ellenőr',seoApprover:'SEO-felelős',approvalId:'SEO-2026-01',reviewedAt:'2026-11-18',explicitIndexingConsent:true};
test('AI · hiteles jóváhagyásnál csak kézi feloldás válik lehetségessé',()=>{
 const report=planSeoActivation([seoPage],[approval],{baseUrl:'https://csanadi-bp.edu.hu/',domainApproved:true});
 assert.equal(report.eligible,1);assert.equal(report.items[0].currentlyNoindex,true);
 assert.equal(report.publicIndexingActivated,false);assert.equal(report.robotsFilesChanged,false);
});
test('AI · domain- vagy oldalszintű jóváhagyás nélkül tilos',()=>{
 assert.equal(planSeoActivation([seoPage],[],{baseUrl:'https://example.org/',domainApproved:true}).eligible,0);
 assert.equal(planSeoActivation([seoPage],[approval],{baseUrl:'http://example.org/',domainApproved:true}).eligible,0);
 assert.equal(planSeoActivation([seoPage],[approval],{baseUrl:'https://example.org/',domainApproved:false}).eligible,0);
});
test('AI · a 71 oldal indexelése nem aktivált',()=>{
 const report=json('dokumentacio/SEO_ENGEDELYEZES_V1_40_10.json');assert.equal(report.pages,71);assert.equal(report.indexableNow,0);assert.equal(report.publicIndexingActivated,false);
});
test('AJ · p75 határértékek és mérési források értelmezése',()=>{
 const ok=assessWebVitals({routes:[{route:'#/sport',source:'field',sampleCount:101,p75:{LCP:2499,INP:200,CLS:0.1}}]});
 assert.equal(ok.rows[0].pass,true);assert.equal(ok.verifiedFieldMeasurementCount,1);assert.equal(ok.automaticallyCertified,false);
 const slow=assessWebVitals({routes:[{route:'#/sport',source:'lab',sampleCount:1,p75:{LCP:2600,INP:240,CLS:0.13}}]});assert.equal(slow.rows[0].pass,false);assert.equal(slow.verifiedFieldMeasurementCount,0);
});
test('AJ · hibás mérés és hiányzó terepadat nem hitelesített',()=>{
 const bad=assessWebVitals({routes:[{route:'#/sport',source:'unknown',sampleCount:0,p75:{LCP:-1,INP:NaN}}]});assert.equal(bad.rows[0].pass,false);
 assert.equal(json('dokumentacio/WEB_VITALS_TERV_V1_40_10.json').realDeviceLogsReceived,0);
});
const seed={id:'p',type:'page',title:'Kosárlabda a csapatnak',section:'sport',tags:['edzés'],href:'#/sport'};
const news={id:'n',type:'news',title:'Közösségi hír a tanároknak',section:'oktatás',href:'#/hirek'};
const event={id:'e',type:'event',title:'Tábori találkozó',section:'sport',href:'#/esemeny'};
const doc={id:'d',type:'document',title:'Sportedzések ismertető',section:'informacio',href:'assets/documents/iskola.pdf'};
const entries=[seed,news,event,doc];
test('AK · jóváhagyott kiemelés relevanciát felülírhat',()=>{
 const rules=[{sourceType:'page',sourceId:'p',targetType:'news',targetId:'n',action:'boost',priority:20,approved:true}];
 assert.equal(validateEditorialRules(rules,entries).valid.length,1);
 const results=recommendRelatedContent(seed,entries,{limit:4,curationRules:rules});assert.equal(results[0].id,'n');
});
test('AK · jóváhagyott elrejtés kizárja az adott célpontot',()=>{
 const rules=[{sourceType:'page',sourceId:'p',targetType:'event',targetId:'e',action:'suppress',approved:true}];
 assert.ok(!recommendRelatedContent(seed,entries,{curationRules:rules}).some(x=>x.id==='e'));
});
test('AK · jóváhagyás nélkül és mintacélra nincs érvényes szabály',()=>{
 const sample={...news,isSample:true};
 const attempt={sourceType:'page',sourceId:'p',targetType:'news',targetId:'n',action:'boost',priority:4,approved:true};
 assert.equal(validateEditorialRules([attempt],[seed,sample]).valid.length,0);
 assert.equal(validateEditorialRules([{...attempt,approved:false}],entries).valid.length,0);
 assert.equal(json('json/adatok/ajanlasi-szabalyok-v1-40-10.json').rules.length,0);
});
test('AK · kereső ténylegesen betölti az exportált szerkesztői szabályokat',()=>{
 const search=read('js/search-j-2026.js');assert.match(search,/ajanlasi-szabalyok-v1-40-10\.json/);assert.match(search,/curationRules/);
 assert.ok(!search.includes('localStorage.setItem("query"'));
});
test('AL · előző csomag bájthash és teljes staging/rollback ellenőrzött',()=>{
 const r=json('dokumentacio/FTP_HELYI_PROBA_V1_40_10.json');
 assert.equal(r.previousZipVerified,true);assert.equal(r.success,true);assert.equal(r.staging.checked,r.staging.expected);assert.equal(r.rollback.checked,r.rollback.expected);
 assert.equal(r.ftpStagingPerformed,false);assert.equal(r.githubPublicationPerformed,false);assert.equal(r.publicationPerformed,false);
});
test('AL · manifest bázis és kiadási eltérések megfelelnek',()=>{
 assert.equal(json('dokumentacio/BAZIS_MANIFEST_V1_40_9.json').release,'csanadi-website-v1.40.9');
 assert.equal(json('release-manifest.json').release,'csanadi-website-v1.40.10');
 const r=json('dokumentacio/KIADASI_ELTERESEK_V1_40_10.json');assert.equal(r.from,'csanadi-website-v1.40.9');assert.equal(r.to,'csanadi-website-v1.40.10');
});
test('Regresszió · 71 oldal, 769 asset, 174 média, 30 dia, fix CDN',()=>{
 assert.equal(Object.keys(json('json/oldalindex.json').pages).length,71);assert.equal(json('json/assets-inventory.json').items.length,769);
 assert.equal(json('json/mediatar.json').items.length,174);assert.equal(json('json/oldalak/kezdolap.json').blocks.find(x=>x.id==='block:home-hero').data.slides.length,30);
 assert.match(read('index.html'),/bootstrap@5\.3\.9/);assert.equal(json('json/config.json').performance.cacheVersion,'csanadi-r-v1.40.10');
});
test('Felületek · AG–AL munkalap, bizonyítékkapu, szerkesztő elérhető',()=>{
 const landing=read('tools/index.html');for(const f of ['v14010-kiadasi-munkalap.html','v14010-bizonyitek-kapu.html','ajanlasok-szerkeszto-v1-40-10.html']){
  assert.ok(landing.includes(f));assert.ok(fs.existsSync(path.join(root,'tools',f)));
 }
});
const failed=checks.filter(x=>!x.passed);
console.log(JSON.stringify({release:'1.40.10',checks:checks.length,passed:checks.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
