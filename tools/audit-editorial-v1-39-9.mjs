/* A 71 oldal szerkesztői minőségjelzése; hivatalos tényeket nem ír át. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const structure=load('json/structure.json'),registry=load('json/mediatar.json'),inventory=load('json/assets-inventory.json');
const files=['oldalak/kezdolap.json'];
function descend(nodes){for(const n of nodes||[]){files.push(n.path);descend(n.children);}}
descend(structure.nodes);
const pages=files.map(f=>({...load('json/'+f),file:'json/'+f}));
const routes=new Set(pages.map(p=>p.schemaExtensions?.route));
const ids=new Set(),blockIds=new Map(),mediaIds=new Set(registry.items.map(m=>m.id)),registered=new Set(inventory.items.map(i=>i.path));
const errors=[],notes=[],pagesOut=[];
const emit=(level,category,file,message)=>({level,category,file,message});
const highRisk=/felveteli|beiratkoz|nyilt-nap|hatarid|tanev|vizsg|kozossegi-szolgalat|csenget|dokumentumtar|kozerdeku|hazirend|adatkezeles/i;
const words=content=>{const parts=[];function visit(x,key='',depth=0){if(depth>30||x==null)return;
 if(typeof x==='string'){if(['title','text','body','lead','summary','heading','subtitle','description','content','caption','label'].includes(key))parts.push(x);return;}
 if(Array.isArray(x)){for(const v of x)visit(v,key,depth+1);return;}
 if(typeof x==='object')for(const [k,v] of Object.entries(x))visit(v,k,depth+1);
 }visit(content);return parts.join(' ').replace(/\s+/g,' ').trim();};
const seoDescs=new Map();
for(const page of pages){
 const route=page.schemaExtensions?.route||'',file=page.file,pageIssues=[],manual=[];
 function flag(level,kind,message){const issue=emit(level,kind,file,message);pageIssues.push(issue);(level==='error'?errors:notes).push(issue);}
 if(ids.has(page.id))flag('error','duplicate-page-id','Ismétlődő oldalazonosító: '+page.id);ids.add(page.id);
 if(!/^#\/[a-z0-9/-]*$/.test(route))flag('error','invalid-route','Érvénytelen hash-útvonal: '+route);
 if(!page.title?.trim()||!page.summary?.trim()||!Array.isArray(page.blocks))flag('error','missing-essential','Cím, leírás vagy blokkok hiányoznak.');
 function scanBlocks(node,depth=0){if(depth>40||node==null||typeof node!=='object')return;
  if(Array.isArray(node)){for(const child of node)scanBlocks(child,depth+1);return;}
  if(typeof node.id==='string'&&node.id.startsWith('block:')){
   if(blockIds.has(node.id))flag('error','duplicate-block-id',`Másik oldalon is használt blokkazonosító: ${node.id} (${blockIds.get(node.id)})`);
   else blockIds.set(node.id,file);
  }
  for(const [k,v] of Object.entries(node))if(k!=='id')scanBlocks(v,depth+1);
 }scanBlocks(page.blocks);
 if(page.lifecycle?.status!=='published')flag('review','lifecycle','Az oldal nem publikált állapotú.');
 if(page.summary?.length<75)flag('review','short-summary','Rövid összefoglaló; szerkesztői kiegészítés javasolt.');
 if(page.seo?.description?.length<90)flag('review','short-seo','A keresési leírás rövid, érdemes egyedibbé tenni.');
 const text=words(page.blocks);if(text.length<200)flag('review','thin-content','Kevés kereshető tartalmi szöveg: '+text.length+' karakter.');
 const seo=page.seo?.description?.trim();if(seo){if(seoDescs.has(seo))flag('review','duplicate-seo','Másik oldallal azonos SEO-leírás: '+seoDescs.get(seo));else seoDescs.set(seo,file);}
 const serialized=JSON.stringify(page.blocks);
 for(const match of serialized.matchAll(/#\/[a-z0-9/-]+/g))if(!routes.has(match[0]))flag('error','broken-internal-link','Hiányzó útvonal: '+match[0]);
 for(const match of serialized.matchAll(/media:[a-z0-9.-]+/g))if(!mediaIds.has(match[0]))flag('error','broken-media-id','Hiányzó médiaazonosító: '+match[0]);
 if(highRisk.test(route)){manual.push('Érvényességi idő, hivatalos forrás és intézményi felelős megerősítése.');}
 if(/minta|szemléltető|példaként/i.test(text))manual.push('A mintaként jelölt tartalom ne tűnjön hivatalos tájékoztatásnak.');
 const score=Math.max(0,100-pageIssues.reduce((sum,i)=>sum+(i.level==='error'?25:7),0));
 pagesOut.push({file,title:page.title,route,score,characters:text.length,blocks:page.blocks?.length||0,
  issues:pageIssues.map(x=>({severity:x.level,category:x.category,message:x.message})),manualApproval:manual});
}
for(const item of inventory.items){if(!registered.has(item.path)||!fs.existsSync(path.join(root,item.path)))errors.push(emit('error','missing-file',item.path,'Hiányzó médiatartalom.'));}
const rights={pending:0,cleared:0,other:0};
for(const item of registry.items){const state=item.rights?.clearance;if(state==='pending')rights.pending++;else if(state==='user-provided'||state==='cleared')rights.cleared++;else rights.other++;}
const report={schemaVersion:'1.0.0',release:'1.39.9',date:'2026-11-17',pages:pages.length,
 assets:inventory.items.length,canonicalMedia:registry.items.length,uniqueBlockIds:blockIds.size,rights,
 errors,reviewFlags:notes.length,manualPriorityPages:pagesOut.filter(p=>p.manualApproval.length).length,
 priorities:pagesOut.filter(p=>p.manualApproval.length||p.score<86).sort((a,b)=>a.score-b.score||a.title.localeCompare(b.title,'hu')),
 pageResults:pagesOut,note:'Automatikus szerkesztői minőség- és szerkezetvizsgálat. A figyelmeztetések ellenőrzendő feladatok, nem megállapított tényhibák. Személyes adatokat és hivatalos információkat nem módosít.'};
const dest=path.join(root,'dokumentacio');fs.mkdirSync(dest,{recursive:true});
fs.writeFileSync(path.join(dest,'TARTALMI_MINOSEG_V1_39_9.json'),JSON.stringify(report,null,2)+'\n');
const quote=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
const rows=[['Oldal','Útvonal','Minőségi pontszám','Szövegkarakter','Blokkok','Gépi jelzések','Kézi ellenőrzés'],...pagesOut.map(p=>[p.title,p.route,p.score,p.characters,p.blocks,p.issues.map(i=>i.category).join(', '),p.manualApproval.join(' ')])];
fs.writeFileSync(path.join(dest,'TARTALMI_MINOSEG_V1_39_9.csv'),'\ufeff'+rows.map(r=>r.map(quote).join(';')).join('\r\n'),'utf8');
console.log(JSON.stringify({pages:report.pages,assets:report.assets,canonicalMedia:report.canonicalMedia,errors:errors.length,reviewFlags:notes.length,manualPriorityPages:report.manualPriorityPages,rights}));
if(errors.length)process.exitCode=1;
