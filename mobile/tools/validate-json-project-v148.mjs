/** 1.51: a szerkesztőknek is használható teljes JSON-tartalomellenőrzés. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {validateJsonShell} from '../js/json-validator-v149.js';
import {safeJsonURL} from '../js/json-dom-v149.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const exists=relative=>fs.existsSync(path.join(root,relative));
const errors=[],warnings=[],review=[];
const push=(target,code,file,detail)=>target.push({code,file,detail});
const index=read('json/page-index.json'),structure=read('json/structure.json');
const site=read('json/site-shell.json'),offline=read('json/offline-shell.json');
for(const [filename,kind,shell] of [['json/site-shell.json','site',site],
 ['json/offline-shell.json','offline',offline]]){
 const result=validateJsonShell(shell,{kind});
 for(const message of result.errors)push(errors,'INVALID_SHELL',filename,message);
 for(const message of result.warnings)push(warnings,'SHELL_WARNING',filename,message);
 for(const [group,property] of [['stylesheets','href'],['scripts','src']]){
  for(const item of shell.assets?.[group]||[]){
   const source=item[property];if(typeof source!=='string'||!safeJsonURL(source))continue;
   if(/^https?:\/\//i.test(source))continue;
   const local=source.split(/[?#]/)[0];
   if(!exists(local))push(errors,'MISSING_ASSET',filename,local);
  }
 }
}

const pagePaths=new Set(Object.keys(index.pages||{})),navPaths=new Set();
const routes=new Map(),pageIds=new Map(),blockIds=new Map();
let blockCount=0,reviewedCount=0;
function menu(nodes,depth=1){
 if(!Array.isArray(nodes)){push(errors,'MENU_STRUCTURE','json/structure.json','A menü csomópontjai nem tömbök');return}
 if(depth>3)push(errors,'MENU_DEPTH','json/structure.json','Háromnál több menüszint');
 for(const item of nodes){
  const rel=item?.path;
  if(typeof rel!=='string'||!pagePaths.has(rel))
   push(errors,'MENU_TARGET','json/structure.json',String(rel));
  if(navPaths.has(rel))push(errors,'MENU_DUPLICATE','json/structure.json',String(rel));
  navPaths.add(rel);
  if(item?.children!==undefined)menu(item.children,depth+1);
 }
}
menu(structure.nodes);
const walkBlock=(block,filename)=>{
 blockCount++;
 if(!block||typeof block!=='object'||Array.isArray(block)){
  push(errors,'BLOCK_TYPE',filename,'Nem objektum típusú blokk');return;
 }
 const id=block.id;
 if(typeof id!=='string'||!id.startsWith('block:'))
  push(errors,'BLOCK_ID',filename,`Hiányzó blokkazonosító: ${String(id)}`);
 else if(blockIds.has(id))
  push(errors,'DUPLICATE_BLOCK_ID',filename,`${id} már itt szerepel: ${blockIds.get(id)}`);
 else blockIds.set(id,filename);
 if(!Array.isArray(block.children)&&block.children!==undefined)
  push(errors,'BLOCK_CHILDREN',filename,`${id} gyerekelemei nem tömb`);
 for(const child of block.children||[])walkBlock(child,filename);
};
for(const [relative,record] of Object.entries(index.pages||{})){
 const filename='json/'+relative;
 if(!exists(filename)){push(errors,'MISSING_PAGE',filename,'Oldal JSON-ja hiányzik');continue}
 let page;try{page=read(filename)}catch(error){push(errors,'INVALID_PAGE_JSON',filename,error.message);continue}
 if(page.schemaVersion!=='1.0.0')push(errors,'PAGE_SCHEMA',filename,String(page.schemaVersion));
 if(page.id!==record.id)push(errors,'PAGE_ID_MISMATCH',filename,`${page.id} ≠ ${record.id}`);
 if(page.title!==record.title)push(errors,'PAGE_TITLE_MISMATCH',filename,`${page.title} ≠ ${record.title}`);
 if(pageIds.has(page.id))push(errors,'DUPLICATE_PAGE_ID',filename,String(page.id));
 pageIds.set(page.id,filename);
 const route=record?.schemaExtensions?.route;
 if(typeof route!=='string'||!route.startsWith('#/'))
  push(errors,'MISSING_ROUTE',filename,String(route));
 else if(routes.has(route))push(errors,'DUPLICATE_ROUTE',filename,`${route}: ${routes.get(route)}`);
 else routes.set(route,filename);
 if(page.schemaExtensions?.route!==route)
  push(errors,'ROUTE_MISMATCH',filename,'A lap és az index útvonala eltér');
 if(!Array.isArray(page.blocks))push(errors,'MISSING_BLOCKS',filename,'A blocks nem tömb');
 else for(const block of page.blocks)walkBlock(block,filename);
 if(JSON.stringify(page.blocks)!==JSON.stringify(record.blocks))
  push(errors,'STALE_SEARCH_BLOCKS',filename,'A page-index blokkadatainak újragenerálása szükséges');
 const reviewed=record?.schemaExtensions?.verifiedContent===true;
 if(reviewed)reviewedCount++;
 else review.push({file:filename,title:record.title||page.title,
  route:route||null,status:'forrásellenőrzés szükséges'});
}
for(const [relative] of Object.entries(index.pages||{})){
 if(relative!=='pages/home.json'&&!navPaths.has(relative))
  push(warnings,'UNLISTED_PAGE','json/'+relative,'Az oldal nem szerepel a menüben');
}
for(const node of site.body||[]){
 const stack=[node];while(stack.length){
  const item=stack.pop();if(!item||typeof item!=='object')continue;
  const href=item.attrs?.href;
  if(typeof href==='string'&&href.startsWith('#/')&&!routes.has(href))
   push(errors,'BROKEN_SHELL_ROUTE','json/site-shell.json',href);
  for(const child of item.children||[])stack.push(child);
 }
}
const config=read('json/config.json');
if(config.performance?.cacheVersion!=='csanadi-r-v1.51')
 push(errors,'STALE_VERSION','json/config.json',String(config.performance?.cacheVersion));
const result={schema:'csanadi-json-audit-v1',release:'1.51',
 summary:{pageCount:pagePaths.size,menuPages:navPaths.size,uniqueRoutes:routes.size,
  uniquePageIds:pageIds.size,uniqueBlockIds:blockIds.size,blockCount,
  verifiedPages:reviewedCount,requiresReview:review.length,
  errors:errors.length,warnings:warnings.length},
 errors,warnings,requiresContentReview:review};
if(process.argv.includes('--write-report')){
 const target=path.join(root,'reports/csanadi-1.51-json-audit.json');
 fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n');
 console.log('JSON minőségjelentés mentve:',path.relative(root,target));
}
console.log(JSON.stringify(result.summary,null,2));
assert.equal(errors.length,0,`${errors.length} JSON-hiba – részletek a jelentésben`);
