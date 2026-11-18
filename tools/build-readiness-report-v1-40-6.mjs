/** v1.40.6 – kizárólag helyi, olvasó kiadási kapu. NEM publikál. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const present=name=>fs.existsSync(path.join(root,name));
const manifest=read('release-manifest.json');
const config=read('json/config.json');
const index=read('json/oldalindex.json');
const inventory=read('json/assets-inventory.json');
const media=read('json/mediatar.json');
const issues=[];
const entries=Object.entries(manifest.files||{});
let hashesChecked=0;
for(const [name,metadata] of entries){
 if(!present(name)){issues.push(`Hiányzó állomány: ${name}`);continue;}
 const bytes=fs.readFileSync(path.join(root,name));hashesChecked++;
 if(bytes.length!==metadata.sizeBytes||createHash('sha256').update(bytes).digest('hex')!==metadata.sha256)
  issues.push(`Megváltozott állomány a manifesthez képest: ${name}`);
}
const routeSet=new Set(Object.values(index.pages||{}).map(page=>page?.schemaExtensions?.route).filter(Boolean));
for(const [keyword,route] of Object.entries(config.search?.featuredRoutes||{}))if(!routeSet.has(route))issues.push(`Nem létező kiemelt keresési útvonal: ${keyword} → ${route}`);
for(const pagePath of Object.keys(index.pages||{}))if(!present('json/'+pagePath))issues.push(`Hiányzó oldal-JSON: json/${pagePath}`);
for(const asset of inventory.items||[])if(typeof asset.path==='string'&&!present(asset.path))issues.push(`Hiányzó média-/dokumentumfájl: ${asset.path}`);
if(manifest.release!=='csanadi-website-v1.40.6')issues.push('A kiadási manifest verziója eltér.');
if(config.performance?.cacheVersion!=='csanadi-r-v1.40.6')issues.push('A böngésző gyorsítótár-verziója eltér.');
const result={release:'1.40.6',createdAt:'2026-11-18',mode:'local-read-only',publicationPerformed:false,
 packageIntegrity:{passed:issues.length===0,manifestEntries:entries.length,hashesChecked,
  jsonPages:Object.keys(index.pages||{}).length,assetFiles:inventory.items.length,mediaRegistryItems:media.items.length,issues:issues.slice(0,200)},
 externalEvidence:{institutionApprovedNewPhotosProvided:false,approvedNewPhotosIntegrated:0,
  physicalPhoneQaProvided:false,screenReaderQaProvided:false},
 releaseGates:[
  {id:'files',name:'Teljes helyi fájlintegritás',passed:issues.length===0},
  {id:'search',name:'Kiemelt keresési útvonalak léteznek',passed:!issues.some(issue=>issue.startsWith('Nem létező kiemelt'))},
  {id:'photo-rights',name:'Új intézményi fotók engedélye és forrása igazolt',passed:false,requires:'Eredeti fotók, írásos jogi és adatvédelmi jóváhagyás'},
  {id:'physical-qa',name:'Valós mobil- és képernyőolvasós teszt',passed:false,requires:'320/390/768 px tényleges mérési és kézi ellenőrzési jegyzőkönyv'},
  {id:'manual-activation',name:'Kifejezett kiadási jóváhagyás',passed:false,requires:'Külön, a felhasználó által kezdeményezett publikálás'}
 ],readyForPublicRelease:false,
 note:'A technikailag ép ZIP nem jelent automatikus intézményi, adatvédelmi vagy közzétételi jóváhagyást.'};
const target=path.join(root,'dokumentacio/KIADASI_KAPU_V1_40_6.json');
fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({release:result.release,integrity:result.packageIntegrity.passed,files:hashesChecked,issues:issues.length,readyForPublicRelease:false},null,2));
if(issues.length)process.exitCode=1;
