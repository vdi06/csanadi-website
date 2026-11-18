/* v1.40.8 U+V+W+X+Y+Z – összetevők és veszteségmentes kiadás, helyben. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {recommendRelatedEntries} from '../js/search-recommendations-v1-40-8.js';
import {planApprovedPhotoPlacement} from './photo-placement-core-v1-40-8.mjs';
import {compareReleaseManifests} from './release-diff-core-v1-40-7.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=p=>JSON.parse(read(p));
const checks=[];
function test(name,fn){try{fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:String(error.message||error)});}}
const h='a'.repeat(64),sha=value=>crypto.createHash('sha256').update(value).digest('hex');
test('U · eredeti képek hiányában nincs kitalált intézményi fotó',()=>{const x=data('dokumentacio/FOTO_STATUS_V1_40_8.json');assert.equal(x.sourcePhotoFilesReceived,0);assert.equal(x.newApprovedPhotosIntegrated,0);assert.equal(data('json/mediatar.json').items.length,174);});
test('U · fotóelhelyezés kizárólag teljes jóváhagyással',()=>{
 const original={id:'media:approved',kind:'image',original:{path:'assets/media/p.jpg',sha256:h},rights:{clearance:'approved'},staging:{independentInstitutionalVerification:true,publicDisplayAllowed:true}};
 const base={media:[original],heroSlides:[{id:'slide-1'}],placements:[{mediaId:'media:approved',destination:'hero',slideId:'slide-1',alt:'Tanulók egy engedélyezett közös sporteseményen'}]};
 assert.equal(planApprovedPhotoPlacement(base).ready,true);
 assert.equal(planApprovedPhotoPlacement({...base,media:[{...original,rights:{clearance:'pending'}}]}).ready,false);
 assert.equal(planApprovedPhotoPlacement({...base,placements:[{...base.placements[0],alt:''}]}).ready,false);
});
test('V · bővített mobil QA: alt, címke, duplikált ID és három méret',()=>{const s=read('tools/mobil-akadalymentesseg-qa.js');for(const x of ['[id]','img:not([alt])','a11yIssues','320,390,768','labels?.length'])assert.ok(s.includes(x),x);assert.match(read('tools/mobil-akadalymentesseg-qa.html'),/Képek, címkék, ID-k/);});
test('V · továbbra sincs hamis képernyőolvasós megfelelőségi igazolás',()=>{const r=data('dokumentacio/KIADASI_KAPU_V1_40_8.json');assert.equal(r.releaseGates.find(x=>x.id==='physical-qa').passed,false);});
test('W · rangsorolt ajánlások, duplikáció és mintahír kizárva',()=>{const seed={id:'1',href:'#/sport',title:'Kosárlabda sportágak',type:'page',section:'sport',tags:['sport']};const rows=[seed,{id:'2',href:'#/sport/edzes',title:'Kosárlabda edzés',type:'page',section:'sport',tags:['sport']},{id:'3',href:'#/oktatas',title:'Oktatás',type:'page',section:'oktatas',tags:[]},{id:'4',href:'#/hirek',title:'Hír',type:'news',section:'sport',isSample:true}];assert.deepEqual(recommendRelatedEntries(seed,rows).map(x=>x.id),['2']);});
test('W · kereső kezelőfelületén kapcsolódó tartalmak és adatvédelmi védelem',()=>{const s=read('js/search-j-2026.js');assert.match(s,/recommendRelatedContent\(seed,all/);assert.match(s,/Kapcsolódó ellenőrzött tartalmak/);assert.doesNotMatch(s,/localStorage\.setItem\([^\n]*query/);});
test('X · visszaállítási baseline és hiteles SHA megőrzése',()=>{const a=data('dokumentacio/BAZIS_MANIFEST_V1_40_7.json'),b=data('dokumentacio/BAZIS_MANIFEST_V1_40_8.json'),p=data('dokumentacio/VISSZAALLITASI_TERV_V1_40_8.json');assert.equal(a.release,'csanadi-website-v1.40.7');assert.equal(b.release,'csanadi-website-v1.40.8');assert.equal(p.previousArchiveSha256,'5d969c2162349431f5923aea92c0dc85db52812eb6bc9e191387d916909aa28a');assert.equal(p.archiveVerified,true);assert.equal(p.publicationPerformed,false);assert.deepEqual(p.totals,compareReleaseManifests(b,a).totals);});
test('X · tilos automatikus FTP- vagy GitHub-közzététel',()=>{const code=read('tools/build-rollback-plan-v1-40-8.mjs');assert.doesNotMatch(code,/\b(?:POST|PUT|PATCH|DELETE)\b\s*:/);assert.equal(data('dokumentacio/KIADASI_KAPU_V1_40_8.json').readyForPublicRelease,false);});
test('Y · 71 oldalhoz 71 valós statikus HTML-előnézet',()=>{const report=data('dokumentacio/SEO_LEFEDES_V1_40_8.json');assert.equal(report.total,71);for(const x of report.entries){const html=read(x.seoPath);assert.match(html,/<html lang="hu">/);assert.match(html,/<title>/);assert.match(html,/<meta property="og:title"/);assert.match(html,/<script type="application\/ld\+json">/);assert.match(html,/href="https:\/\/vdi06\.github\.io\/csanadi-website\/index\.html#\//);}});
test('Y · minden oldal noindex maradt, sitemap sem állít hamis indexelhetőséget',()=>{const report=data('dokumentacio/SEO_LEFEDES_V1_40_8.json');assert.equal(report.indexable,0);for(const x of report.entries)assert.match(read(x.seoPath),/<meta name="robots" content="noindex,nofollow">/);assert.doesNotMatch(read('sitemap.xml'),/<url>/);assert.match(read('robots.txt'),/Sitemap:/);});
test('Z · 95 helyi CSS-kérés helyett egyetlen, Bootstrap CDN mellett',()=>{const html=read('index.html'),map=data('dokumentacio/CSS_FORRASJEGYZEK_V1_40_8.json');const tags=html.replace(/<!--[\s\S]*?-->/g,'');const local=[...tags.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].filter(m=>/href="(?:css|desktop|mobile)\//.test(m[0]));assert.equal(local.length,1);assert.equal(map.requestCountBefore,95);assert.match(local[0][0],/site-bundle-v1-40-8\.css/);assert.match(html,/bootstrap@5\.3\.9/);});
test('Z · eredeti CSS-kód és médiafeltételek sorrendje bizonyítható',()=>{const map=data('dokumentacio/CSS_FORRASJEGYZEK_V1_40_8.json'),bundle=read(map.generatedFile);let last=-1;for(const entry of map.sources){assert.ok(fs.existsSync(path.join(root,entry.path)));const open=bundle.indexOf('/* START '+entry.path+' */');assert.ok(open>last,entry.path);last=open;if(entry.media)assert.ok(bundle.slice(open,open+220).includes('@media '+entry.media));}assert.equal(sha(bundle),map.sha256);});
test('Megőrzés · 71 oldal, 769 asset, 174 média, 30 dia, új cache-verzió',()=>{assert.equal(Object.keys(data('json/oldalindex.json').pages).length,71);assert.equal(data('json/assets-inventory.json').items.length,769);assert.equal(data('json/mediatar.json').items.length,174);assert.equal(data('json/oldalak/kezdolap.json').blocks.find(x=>x.id==='block:home-hero').data.slides.length,30);assert.equal(data('json/config.json').performance.cacheVersion,'csanadi-r-v1.40.10');});
const failed=checks.filter(x=>!x.passed);console.log(JSON.stringify({release:'1.40.8',checks:checks.length,passed:checks.length-failed.length,failed},null,2));if(failed.length)process.exitCode=1;
