/* Csak olvasó tartalmi és hivatkozási audit; kizárólag a jelentést írja. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const structure=load('json/structure.json');
const media=new Set(load('json/mediatar.json').items.map(x=>x.id));
const inventory=load('json/assets-inventory.json');
const assets=new Set(inventory.items.map(x=>x.path));
const paths=new Set(['oldalak/kezdolap.json']);
function collect(nodes){for(const item of nodes||[]){paths.add(item.path);collect(item.children);}}
collect(structure.nodes);
const records=[];
for(const relative of paths){
 const page=load('json/'+relative);
 records.push({file:'json/'+relative,id:page.id,title:page.title,summary:page.summary,
  route:page.schemaExtensions?.route,seo:page.seo,blocks:page.blocks,lifecycle:page.lifecycle,
  content:page});
}
const routes=new Set(records.map(r=>r.route));
const notices=[];
const push=(severity,kind,file,detail)=>notices.push({severity,kind,file,detail});
const ids=new Map(),seenRoutes=new Map();
function walk(value,visit,key='',depth=0){
 if(depth>25||value===null||value===undefined)return;
 if(typeof value==='string')return visit(key,value);
 if(Array.isArray(value)){for(const x of value)walk(x,visit,key,depth+1);return;}
 if(typeof value==='object')for(const [k,v] of Object.entries(value))walk(v,visit,k,depth+1);
}
const linkedPages=new Set();
for(const page of records){
 if(!/^page:\d{6}$/.test(page.id||''))push('error','invalid-id',page.file,page.id);
 if(ids.has(page.id))push('error','duplicate-id',page.file,ids.get(page.id));
 ids.set(page.id,page.file);
 if(seenRoutes.has(page.route))push('error','duplicate-route',page.file,seenRoutes.get(page.route));
 seenRoutes.set(page.route,page.file);
 if(!page.title?.trim()||!page.summary?.trim())push('error','missing-content',page.file,'Cím vagy összefoglaló hiányzik.');
 if(!page.seo?.description?.trim())push('review','missing-seo-description',page.file,'Nincs külön SEO-leírás.');
 if(page.lifecycle?.status!=='published')push('review','not-published',page.file,page.lifecycle?.status||'hiányzik');
 if(!Array.isArray(page.blocks))push('error','invalid-blocks',page.file,'Hiányzó tartalomblokkok.');
 walk(page.content,(key,value)=>{
  if(/\b(?:TODO|FIXME|lorem ipsum|kitöltendő)\b/i.test(value))push('review','placeholder',page.file,value.slice(0,130));
  if(['mediaId','imageId','bannerMediaId'].includes(key)&&value.startsWith('media:')&&!media.has(value))
   push('error','unknown-media-id',page.file,value);
  if(['src','path','filePath','poster'].includes(key)&&value.startsWith('assets/')&&
    !assets.has(value)&&!fs.existsSync(path.join(root,value)))push('error','missing-asset',page.file,value);
  const routePattern=/#\/[a-z0-9/-]+/g;
  for(const route of value.match(routePattern)||[]){
   if(routes.has(route))linkedPages.add(route);
   else if(!route.startsWith('#/megkozelites-es-tanulas'))push('review','unregistered-link',page.file,route);
  }
 });
}
const report={schemaVersion:'1.0.0',release:'1.39.7',date:'2026-11-17',
 auditedPages:records.length,registeredAssets:assets.size,registeredMediaIds:media.size,
 distinctRoutes:routes.size,linkedRoutes:linkedPages.size,
 errors:notices.filter(x=>x.severity==='error'),reviews:notices.filter(x=>x.severity==='review'),
 note:'A review jelölések manuális tartalmi ellenőrzést igényelnek, nem bizonyított hibák. Nem módosítjuk automatikusan az iskola hivatalos adatait.'};
fs.writeFileSync(path.join(root,'dokumentacio/TARTALMI_AUDIT_v1_39_7.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({pages:report.auditedPages,assets:report.registeredAssets,errors:report.errors.length,reviews:report.reviews.length,linkedRoutes:report.linkedRoutes}));
if(report.errors.length)process.exitCode=1;
