/* V1.40.9: helyi integritás, SEO, teljesítmény, fotójogok és kézi kiadási kapu. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const manifest=read('release-manifest.json'),config=read('json/config.json'),index=read('json/oldalindex.json');
const inventory=read('json/assets-inventory.json'),media=read('json/mediatar.json');
const seo=read('dokumentacio/SEO_LEFEDES_V1_40_8.json'),perf=read('dokumentacio/TELJESITMENY_AUDIT_V1_40_8.json');
const diff=read('dokumentacio/KIADASI_ELTERESEK_V1_40_9.json'),rollback=read('dokumentacio/FTP_STAGING_VISSZAALLITAS_V1_40_9.json');
const seoPlan=read('dokumentacio/SEO_AKTIVALASI_TERV_V1_40_9.json'),mobile=read('dokumentacio/MOBIL_AKADALYMENTESSEG_STATUS_V1_40_9.json');
const photos=read('dokumentacio/FOTO_STATUS_V1_40_9.json'),performance=read('dokumentacio/TELJESITMENY_TERV_V1_40_9.json');
const problems=[];
for(const [name,entry] of Object.entries(manifest.files||{})){
 const filename=path.resolve(root,name);
 if(!filename.startsWith(root+path.sep)||!fs.existsSync(filename)){problems.push('Hiányzó vagy érvénytelen útvonal: '+name);continue;}
 const bytes=fs.readFileSync(filename);
 if(bytes.length!==entry.sizeBytes||createHash('sha256').update(bytes).digest('hex')!==entry.sha256)problems.push('SHA/byte eltérés: '+name);
}
for(const name of Object.keys(index.pages||{}))if(!fs.existsSync(path.join(root,'json',name)))problems.push('Hiányzó oldal: '+name);
for(const entry of inventory.items||[])if(entry.path&&!fs.existsSync(path.join(root,entry.path)))problems.push('Hiányzó asset: '+entry.path);
if(manifest.release!=='csanadi-website-v1.40.9'||config.performance.cacheVersion!=='csanadi-r-v1.40.9')problems.push('Verzió- vagy gyorsítótár-eltérés');
if(diff.from!=='csanadi-website-v1.40.8'||diff.to!==manifest.release||rollback.previousRelease!=='1.40.8'||!rollback.previousArchiveVerified)problems.push('Összehasonlítási/visszaállítási hiba');
if(seo.total!==71||seo.indexable!==0||perf.css.currentLocalRequests!==1||seoPlan.indexable!==0)problems.push('SEO- vagy CSS-regresszió');
if(photos.newApprovedPhotosIntegrated!==0||mobile.wcagConformanceCertified||performance.realMetricsMeasured)problems.push('Igazolatlan külső megfelelőség állítása');
const passed=!problems.length;
const report={release:'1.40.9',date:'2026-11-18',publicationPerformed:false,
 packageIntegrity:{passed,checked:Object.keys(manifest.files||{}).length,issues:problems.slice(0,100),jsonPages:Object.keys(index.pages||{}).length,assets:inventory.items.length,media:media.items.length},
 releaseComparison:{from:diff.from,to:diff.to,added:diff.totals.added,changed:diff.totals.changed,removed:diff.totals.removed,reviewRequired:diff.reviewRequired},
 rollout:{archivedPreviousVersion:rollback.previousRelease,verifiedRollbackArchive:rollback.previousArchiveVerified,automaticPublication:false},
 releaseGates:[
  {id:'file-integrity',passed},
  {id:'cross-content-recommendations',passed:true},
  {id:'seo-static',passed:seo.total===71,requires:'Az oldalak noindex állapotának megváltoztatása csak külön intézményi döntéssel történhet.'},
  {id:'css-bundle',passed:perf.css.currentLocalRequests===1,requires:'Valós böngészős vizuális ellenőrzés a feltöltés előtt.'},
  {id:'photo-rights',passed:false,requires:'Eredeti fotók, jogi/adatvédelmi jóváhagyás és helyes képleírások.'},
  {id:'physical-qa',passed:false,requires:'Valós telefon/tablet és képernyőolvasó mérési jegyzőkönyv.'},
  {id:'seo-activation',passed:false,requires:'Intézményi ellenőrzés és manuális indexelési engedély; a 71 oldal változatlanul noindex.'},
  {id:'performance-field',passed:false,requires:'Valós LCP, INP, CLS és hálózati mérési jegyzőkönyv.'},
  {id:'manual-publication',passed:false,requires:'A felhasználó külön kifejezett közzétételi jóváhagyása.'}
 ],
 readyForPublicRelease:false,
 note:'Helyi statikus kiadás: a technikai integritás nem jelenti a tartalom intézményi vagy jogi jóváhagyását.'};
fs.writeFileSync(path.join(root,'dokumentacio/KIADASI_KAPU_V1_40_9.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({integrity:passed,files:report.packageIntegrity.checked,pages:report.packageIntegrity.jsonPages,assets:report.packageIntegrity.assets,publicReady:false}));
if(!passed)process.exitCode=1;
