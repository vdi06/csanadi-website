import {workflowRecord} from './content-workflow-core-v1-42-25.js?v=1.43.3';
import {validateMediaRegistry,validateDocumentRegistry,deepCopy} from './editor-core.js?v=1.43.3';

const pagePath=/^json\/pages\/[a-z0-9/_-]+\.json$/;
const localPath=/^pages\/[a-z0-9/_-]+\.json$/;
const sha=/^[0-9a-f]{64}$/;
const routePattern=/#\/[a-z0-9/-]*/g;

export function indexSearchText(page){
 const parts=[page.title,page.summary];
 const visit=value=>{
  if(typeof value==='string')parts.push(value);
  else if(Array.isArray(value))value.forEach(visit);
  else if(value&&typeof value==='object')for(const [key,item] of Object.entries(value))if(!['id','mediaId','imageId','style','className','href'].includes(key))visit(item);
 };
 visit(page.blocks);
 return parts.filter(Boolean).join(' ').slice(0,45000);
}

export function synchronizePageIndex(pageIndex,pages){
 const index=deepCopy(pageIndex),updated=[];
 for(const [path,page] of pages){
  const key=path.replace(/^json\//,'');
  if(!localPath.test(key)||!index.pages[key])throw Error('Az oldal hiányzik az oldaljegyzékből: '+path);
  const current=index.pages[key];
  if(current.id!==page.id||current.schemaExtensions?.route!==page.schemaExtensions?.route)throw Error('Oldalazonosító vagy útvonal ütközés: '+path);
  const fields=['title','menuLabel','summary','lifecycle','blocks'];
  if(fields.some(field=>JSON.stringify(current[field])!==JSON.stringify(page[field]))){
   for(const field of fields)current[field]=deepCopy(page[field]);
   current.searchText=indexSearchText(page);updated.push(path);
  }
 }
 return {index,updated};
}

export function evaluateReleaseGate({drafts,sourcePages,release,storage,media,documents,originalMedia,originalDocuments,changedPaths=[]}){
 const errors=[],warnings=[],statuses={approved:0,draft:0,checked:0};
 const changes=new Set(changedPaths);
 const draftsByPath=new Map(drafts);
 for(const path of changes)if(pagePath.test(path)&&!draftsByPath.has(path))errors.push('Ismeretlen vagy nem jóváhagyott oldalmódosítás: '+path);
 for(const [path,page] of drafts){
  try{
   const original=sourcePages.get(path);if(!original)throw Error('Hiányzó eredeti oldal.');
   const record=workflowRecord(storage,release,path,original,page);
   if(record.stale||record.state!=='approved'){
    statuses[record.state]??=0;statuses[record.state]++;
    errors.push(path+': csak változatlan, helyben jóváhagyott tervezet adható ki ('+(record.stale?'módosult':record.state)+').');
   }else statuses.approved++;
  }catch(error){errors.push(path+': '+error.message);}
 }
 for(const problem of validateMediaRegistry(media))errors.push('Média: '+problem);
 for(const problem of validateDocumentRegistry(documents))errors.push('Dokumentum: '+problem);
 const oldMedia=new Map((originalMedia?.items||[]).map(item=>[item.id,item]));
 for(const item of media.items||[]){
  if(JSON.stringify(item)===JSON.stringify(oldMedia.get(item.id)))continue;
  if(item.rights?.clearance!=='verified'||!item.rights?.holder||!item.rights?.license)errors.push('Új vagy módosított kép nincs igazolt jogi állapotban: '+item.id);
 }
 const oldDocs=new Map((originalDocuments?.documents||[]).map(item=>[item.id,item]));
 for(const item of documents.documents||[]){
  if(JSON.stringify(item)===JSON.stringify(oldDocs.get(item.id)))continue;
  if(item.status==='published'&&item.official!==true)errors.push('Új vagy módosított publikált dokumentum nem hivatalosan jóváhagyott: '+item.id);
 }
 const unchangedPending=(media.items||[]).filter(item=>item.rights?.clearance==='pending'&&JSON.stringify(item)===JSON.stringify(oldMedia.get(item.id))).length;
 if(unchangedPending)warnings.push(`${unchangedPending} korábbi képnél külön intézményi jogosultsági ellenőrzés marad szükséges.`);
 return {ok:errors.length===0,errors,warnings,statuses};
}

export function validateReleaseGraph({pages,pageIndex,structure,media,documents,filePaths}){
 const errors=[],warnings=[],paths=new Set(filePaths),source=new Map(pages),menuPaths=new Set(),routes=new Map(),pageIDs=new Map(),allIDs=new Map();
 if(!structure||!Array.isArray(structure.nodes)||structure.nodes.length!==6)errors.push('A főmenük száma nem hat.');
 const walkTree=(nodes,depth)=>{
  if(!nodes?.length)return;
  if(depth>3)errors.push('Túl mély a menüstruktúra: '+depth);
  for(const node of nodes||[]){
   if(!localPath.test(node.path||'')||menuPaths.has(node.path))errors.push('Hibás vagy ismétlődő menüútvonal: '+node.path);
   menuPaths.add(node.path);
   walkTree(node.children,depth+1);
  }
 };
 walkTree(structure.nodes,1);
 menuPaths.add('pages/home.json');
 const mediaIDs=new Set((media.items||[]).map(item=>item.id));
 const documentIDs=new Set((documents.documents||[]).map(item=>item.id));
 const filePresent=p=>paths.has(p)&&!p.includes('..');
 for(const item of media.items||[])for(const variant of [item.original,...item.variants||[]])if(variant?.path&&!filePresent(variant.path))errors.push('Hiányzó képfájl: '+variant.path);
 for(const item of documents.documents||[])if(item.status!=='withdrawn'&&item.filePath&&!filePresent(item.filePath))errors.push('Hiányzó dokumentumfájl: '+item.filePath);
 const references=[];
 for(const [path,page] of pages){
  const key=path.replace(/^json\//,'');
  if(!localPath.test(key))errors.push('Érvénytelen oldalútvonal: '+path);
  if(pageIDs.has(page.id))errors.push('Ismétlődő oldalazonosító: '+page.id);else pageIDs.set(page.id,path);
  const route=page.schemaExtensions?.route;
  if(!/^#\/[a-z0-9/-]*$/.test(route||'')||routes.has(route))errors.push('Ütköző vagy hibás oldalcím: '+path);else routes.set(route,path);
  if(!pageIndex.pages[key]||!menuPaths.has(key))errors.push('Nem szerepel a menüben vagy oldaljegyzékben: '+path);
  const indexed=pageIndex.pages[key];
  for(const field of ['id','title','menuLabel','summary','lifecycle','blocks'])if(JSON.stringify(indexed?.[field])!==JSON.stringify(page[field]))errors.push('Oldaljegyzék eltérés: '+key+' · '+field);
  if(indexed?.schemaExtensions?.route!==route)errors.push('Oldaljegyzék-útvonal eltérés: '+key);
  const seen=new Set();
  const inspect=(value,field='')=>{
   if(typeof value==='string'){
    if((field==='mediaId'||field==='imageId'||field==='bannerMediaId')&&value.startsWith('media:')&&!mediaIDs.has(value))errors.push('Hiányzó médiaazonosító: '+path+' · '+value);
    if((field==='documentId')&&value.startsWith('document:')&&!documentIDs.has(value))errors.push('Hiányzó dokumentumazonosító: '+path+' · '+value);
    if(['text','href','route'].includes(field))for(const match of value.match(routePattern)||[])references.push({path,route:match});
   }else if(Array.isArray(value))value.forEach(part=>inspect(part,field));
   else if(value&&typeof value==='object')for(const [name,part] of Object.entries(value))inspect(part,name);
  };
  inspect(page);
  const blocks=value=>{for(const item of value||[]){
   if(!item?.id||seen.has(item.id))errors.push('Duplikált blokkalazonosító az oldalon: '+path+' · '+item?.id);
   seen.add(item.id);
   if(allIDs.has(item.id)&&allIDs.get(item.id)!==path)warnings.push('Korábbról ismétlődő, külön oldalakon használt blokkazonosító: '+item.id);
   else allIDs.set(item.id,path);
   if(item.children)blocks(item.children);
  }};
  blocks(page.blocks);
 }
 for(const {path,route} of references){if(route!=='#/'&&!routes.has(route))errors.push('Ismeretlen belső hivatkozás: '+path+' → '+route);}
 if(source.size!==Object.keys(pageIndex.pages||{}).length||source.size!==menuPaths.size)errors.push('Az oldalak, a menü és az oldaljegyzék darabszáma nem azonos.');
 for(const key of Object.keys(pageIndex.pages||{}))if(!source.has('json/'+key))errors.push('Az oldaljegyzékben hiányzó oldalforrás: '+key);
 return {ok:errors.length===0,errors:[...new Set(errors)],warnings:[...new Set(warnings)],counts:{pages:source.size,menus:structure.nodes.length,media:media.items.length,documents:documents.documents.length}};
}

export function reportCSV(report){
 const rows=[['Szint','Típus','Leírás']];
 for(const [kind,group] of [['hiba',report.errors||[]],['figyelmeztetés',report.warnings||[]]])for(const message of group)rows.push([kind,'kiadási ellenőrzés',message]);
 if(rows.length===1)rows.push(['sikeres','kiadási ellenőrzés','Nem található blokkoló hiba.']);
 const cell=value=>{const s=String(value);return '"'+(/^[\s]*[=+@-]/.test(s)?"'":'')+s.replaceAll('"','""')+'"';};
 return '\ufeff'+rows.map(row=>row.map(cell).join(';')).join('\r\n')+'\r\n';
}

export function validateReleaseManifest(manifest,entries){
 const errors=[];if(!/^csanadi-website-\d+\.\d+$/.test(manifest?.release||''))errors.push('Érvénytelen kiadási azonosító.');
 for(const [path,meta] of Object.entries(manifest?.files||{})){
  if(path==='release-manifest.json'||!entries.has(path))errors.push('Hiányzó vagy hibás fájllista: '+path);
  if(!Number.isInteger(meta?.sizeBytes)||meta.sizeBytes<0||!sha.test(meta?.sha256||''))errors.push('Érvénytelen fájl-metaadat: '+path);
 }
 for(const path of entries.keys())if(path!=='release-manifest.json'&&!manifest.files?.[path])errors.push('A manifestből hiányzik: '+path);
 return errors;
}
