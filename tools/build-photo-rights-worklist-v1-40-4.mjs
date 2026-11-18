/* A médiák jogi státuszának kizárólag olvasásból összeállított helyi munkalistája.
   Az export NEM jóváhagyás, és NEM írja át a médiatári forrást. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const load=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const items=load('json/mediatar.json').items;
const slides=load('json/oldalak/kezdolap.json').blocks.find(block=>block.id==='block:home-hero').data.slides;
const heroPositions=new Map(slides.map((slide,i)=>[slide.mediaId,i+1]));
const classes={generated:'Generált, fiktív illusztráció',pending:'Eredet vagy felhasználás nem igazolt',
 'preview-only':'Csak belső előnézet', 'user-provided':'Felhasználó által megadott; intézményi döntés szükséges'};
const entries=items.map(item=>{
 const clearance=item.rights?.clearance||'missing';
 const hero=heroPositions.get(item.id)||null;
 const approvalVerified=clearance==='approved'&&Boolean(item.rights?.evidence&&item.rights?.reviewer&&item.rights?.permission);
 const needsReview=!approvalVerified;
 return {
  id:item.id, heroPosition:hero, title:item.caption||item.alt||item.id,
  file:item.original?.path||'', width:item.original?.width||0,height:item.original?.height||0,
  sha256:item.original?.sha256||'', clearance,classification:classes[clearance]||'Ismeretlen státusz',
  rightsHolder:item.rights?.holder||'', rightsNote:item.rights?.license||'',
  approvalVerified,needsReview,
  requestedEvidence:['Forrás és készítés dátuma','A jogosult személye és írásos engedélye',
   'Az intézményi felelős dokumentált döntése','Személyeket, különösen kiskorúakat ábrázoló valódi kép esetén az érintett adatvédelmi jogalapja'],
  suggestedAction:hero?'Kezdőlap: csak igazolt jogok után végleges fotóként használható; addig illusztrációként jelölendő.':
   'Közzététel előtt ellenőrizni kell a forrást, jogosultságot és az intézményi döntést.'
 };
});
const statuses=Object.fromEntries([...new Set(entries.map(x=>x.clearance))].sort().map(s=>[s,entries.filter(x=>x.clearance===s).length]));
const report={schemaVersion:'1.0.0',release:'1.40.4',createdOn:'2026-11-18',
 source:'json/mediatar.json',heroSource:'json/oldalak/kezdolap.json',
 institutionalApprovalVerified:false,externalPublicationPerformed:false,
 warning:'Ez kizárólag ellenőrzési munkalap: egyik státusz sem jelent önmagában intézményi vagy adatvédelmi jóváhagyást.',
 statistics:{allMedia:entries.length,rightsReview:entries.filter(x=>x.needsReview).length,
  heroSlides:slides.length,heroReview:entries.filter(x=>x.heroPosition!==null&&x.needsReview).length,statuses},
 heroItems:entries.filter(x=>x.heroPosition!==null).sort((a,b)=>a.heroPosition-b.heroPosition),
 items:entries};
const out=path.join(root,'dokumentacio/KEP_ES_MEDIA_JOGTISZTAZAS_V1_40_4.json');
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
const quote=v=>{const val=String(v??'');return '"'+(/^[\s\uFEFF]*[=+\-@]/.test(val)?"'"+val:val).replace(/"/g,'""')+'"';};
const fields=['heroPosition','id','file','clearance','classification','rightsHolder','rightsNote','approvalVerified','needsReview','suggestedAction'];
const csv=['\ufeff'+fields.map(quote).join(';'),...entries.sort((a,b)=>(a.heroPosition===null?999:a.heroPosition)-(b.heroPosition===null?999:b.heroPosition)).map(x=>fields.map(k=>quote(x[k]??'')).join(';'))].join('\r\n');
fs.writeFileSync(path.join(root,'dokumentacio/KEP_ES_MEDIA_JOGTISZTAZAS_V1_40_4.csv'),csv+'\r\n');
console.log(JSON.stringify(report.statistics));
