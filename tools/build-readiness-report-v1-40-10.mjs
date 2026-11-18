/* v1.40.10: kizárólag helyi állomány- és bizonyítékalapú kiadási kapu. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const manifest=read('release-manifest.json'),config=read('json/config.json'),index=read('json/oldalindex.json');
const inventory=read('json/assets-inventory.json'),media=read('json/mediatar.json');
const seoBaseline=read('dokumentacio/SEO_LEFEDES_V1_40_8.json'),perfBaseline=read('dokumentacio/TELJESITMENY_AUDIT_V1_40_8.json');
const diff=read('dokumentacio/KIADASI_ELTERESEK_V1_40_10.json');
const rehearsal=read('dokumentacio/FTP_HELYI_PROBA_V1_40_10.json');
const photos=read('dokumentacio/FOTO_ELLENORZES_V1_40_10.json');
const qa=read('dokumentacio/MOBIL_HIBAJAVITASI_TERV_V1_40_10.json');
const seo=read('dokumentacio/SEO_ENGEDELYEZES_V1_40_10.json');
const vitals=read('dokumentacio/WEB_VITALS_TERV_V1_40_10.json');
const curation=read('dokumentacio/AJANLASOK_STATUS_V1_40_10.json');
const problems=[];
for(const [name,entry] of Object.entries(manifest.files||{})){
 const filename=path.resolve(root,name);
 if(!filename.startsWith(root+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){
  problems.push('Hiányzó vagy érvénytelen útvonal: '+name);continue;
 }
 const bytes=fs.readFileSync(filename);
 if(bytes.length!==entry.sizeBytes||createHash('sha256').update(bytes).digest('hex')!==entry.sha256)problems.push('SHA/byte eltérés: '+name);
}
for(const name of Object.keys(index.pages||{}))if(!fs.existsSync(path.join(root,'json',name)))problems.push('Hiányzó oldal: '+name);
for(const entry of inventory.items||[])if(entry.path&&!fs.existsSync(path.join(root,entry.path)))problems.push('Hiányzó asset: '+entry.path);
if(manifest.release!=='csanadi-website-v1.40.10'||config.performance.cacheVersion!=='csanadi-r-v1.40.10')problems.push('Verzió- vagy gyorsítótár-eltérés');
if(diff.from!=='csanadi-website-v1.40.9'||diff.to!==manifest.release||rehearsal.previous!=='1.40.9'||!rehearsal.success||!rehearsal.previousZipVerified||rehearsal.ftpStagingPerformed)problems.push('Összehasonlítási/visszaállítási eltérés');
if(seoBaseline.total!==71||seoBaseline.indexable!==0||perfBaseline.css.currentLocalRequests!==1)problems.push('SEO/CSS bázisregresszió');
if(seo.pages!==Object.keys(index.pages).length||seo.eligible!==0||seo.publicIndexingActivated||seo.indexableNow!==0)problems.push('Nem engedélyezett indexelés vagy hiányos SEO-kapu');
if(photos.originals!==0||photos.publicationApproved||qa.physicalDeviceEvidenceProvided||qa.wcagConformanceCertified||vitals.verifiedFieldMeasurementCount!==0||curation.verifiedEditorialApprovals!==0)problems.push('Igazolatlan külső megfelelőségi állítás');
const passed=problems.length===0;
const report={release:'1.40.10',date:'2026-11-18',publicationPerformed:false,
 packageIntegrity:{passed,checked:Object.keys(manifest.files||{}).length,issues:problems.slice(0,100),jsonPages:Object.keys(index.pages||{}).length,assets:inventory.items.length,media:media.items.length},
 releaseComparison:{from:diff.from,to:diff.to,added:diff.totals.added,changed:diff.totals.changed,removed:diff.totals.removed,reviewRequired:diff.reviewRequired},
 rollout:{archivedPreviousVersion:'1.40.9',verifiedRollbackArchive:rehearsal.previousZipVerified,stageVerifiedFiles:rehearsal.staging.checked,rollbackVerifiedFiles:rehearsal.rollback.checked,automaticPublication:false},
 releaseGates:[
  {id:'file-integrity',passed},
  {id:'editorial-recommendation-config',passed:true,requires:'Új, jóváhagyott szerkesztői szabályok hiányában az alap ajánlások működnek.'},
  {id:'seo-noindex-conservation',passed:seo.pages===71&&seo.indexableNow===0},
  {id:'css-bundle',passed:perfBaseline.css.currentLocalRequests===1},
  {id:'offline-staging-and-rollback',passed:rehearsal.success},
  {id:'photo-rights',passed:false,requires:'Jogszerű eredeti fotók, intézményi és adatvédelmi bizonyítékok.'},
  {id:'physical-qa',passed:false,requires:'Valódi telefon, billentyűzet és képernyőolvasó előtte/utána jegyzőkönyv.'},
  {id:'seo-activation',passed:false,requires:'Jóváhagyott domain és oldalankénti SEO-feloldás kézi ellenőrzéssel.'},
  {id:'performance-field',passed:false,requires:'Valós, ellenőrizhető LCP, INP, CLS mérési sorok.'},
  {id:'manual-publication',passed:false,requires:'A felhasználó kifejezett élesítési jóváhagyása.'}
 ],readyForPublicRelease:false,
 note:'A fájl- és rollback-integritás átmenetele nem váltja ki a fotójogi, mobilos, SEO és intézményi közzétételi jóváhagyást.'};
fs.writeFileSync(path.join(root,'dokumentacio/KIADASI_KAPU_V1_40_10.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({integrity:passed,files:report.packageIntegrity.checked,pages:report.packageIntegrity.jsonPages,assets:report.packageIntegrity.assets,publicReady:false}));
if(!passed)process.exitCode=1;
