/* Statikus JSON-adatbetöltő és a háromszintű menü indexe. Nem futtat JSON-kódot. */
const ROOT = new URL('../json/', import.meta.url);
const PATH_RE = /^(?:oldalak\/)[a-z0-9/_-]+\.json$/;
const ACCENTS = /[\u0300-\u036f]/g;
export const norm = value => String(value ?? '').normalize('NFD').replace(ACCENTS, '').toLocaleLowerCase('hu-HU');
export const safeRoute = value => typeof value === 'string' && /^#\/[a-z0-9\-/]*$/.test(value) ? value : '#/';
export const routeFromPath = path => '#/' + path.replace(/^oldalak\//, '').replace(/\.json$/, '').replace(/\/index$/, '');
export function jsonURL(path) {
  if (!/^[a-z0-9][a-z0-9/_\-.]*\.json$/.test(path) || path.includes('..') || path.startsWith('/')) throw new Error('Érvénytelen JSON-útvonal: '+path);
  return new URL(path, ROOT).href;
}
export async function loadJSON(path) {
  const res = await fetch(jsonURL(path), {cache:'no-cache'});
  if (!res.ok) throw new Error(`Nem elérhető: ${path} (${res.status})`);
  return await res.json();
}
export function walkStructure(nodes, parent=null, depth=1, target=[]) {
  if(!Array.isArray(nodes)) return target;
  for(const node of [...nodes].sort((a,b)=>(a.order??999)-(b.order??999))) {
    if(!node || !PATH_RE.test(node.path) || depth>3) {console.warn('Hibás vagy túl mély menüelem',node);continue;}
    const item={path:node.path,order:node.order??999,parent,depth,children:[]};
    target.push(item);
    if(parent)parent.children.push(item);
    walkStructure(node.children || [], item, depth+1,target);
  }
  return target;
}
async function concurrent(items, limit, worker) {
  const out=new Array(items.length);let cursor=0;
  await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
    while(cursor<items.length){let idx=cursor++;out[idx]=await worker(items[idx],idx);}
  }));
  return out;
}
function validPage(page) {
  return !!(page && typeof page==='object' && /^page:\d{6}$/.test(page.id) &&
    typeof page.title==='string' && page.title.trim() && typeof page.menuLabel==='string' && page.menuLabel.trim() &&
    Array.isArray(page.blocks) && page.lifecycle && page.lifecycle.status==='published' &&
    safeRoute(page.schemaExtensions?.route)===page.schemaExtensions?.route);
}
export async function buildCatalog() {
  const structure=await loadJSON('structure.json');
  const config=await loadJSON('config.json');
  const items=[{path:'oldalak/kezdolap.json',depth:0,parent:null,children:[],order:0},...walkStructure(structure.nodes)];
  const loaded=await concurrent(items,Math.max(1,Math.min(8,config.refresh?.maxConcurrentRequests||4)), async item=>{
    try{const page=await loadJSON(item.path);if(!validPage(page))throw new Error('Kötelező mezők vagy publikációs állapot hibás');return page;}
    catch(e){console.error('Oldal kihagyva:',item.path,e);return null;}
  });
  for(let i=0;i<items.length;i++)items[i].page=loaded[i];
  const counts=new Map(),idCounts=new Map();
  for(const item of items){if(!item.page)continue;const r=item.page.schemaExtensions.route;counts.set(r,(counts.get(r)||0)+1);idCounts.set(item.page.id,(idCounts.get(item.page.id)||0)+1);}
  for(const item of items){if(item.page&&(counts.get(item.page.schemaExtensions.route)>1||idCounts.get(item.page.id)>1)){console.error('Ütköző oldalazonosító/útvonal; mindkét elem elrejtve:',item.path);item.page=null;}}
  const available=items.filter(x=>x.page);
  const routes=new Map(available.map(x=>[x.page.schemaExtensions.route,x]));
  const byId=new Map(available.map(x=>[x.page.id,x]));
  return {config,structure,items:available,routes,byId,roots:available.filter(x=>x.depth===1),home:available.find(x=>x.depth===0),loadedAt:Date.now()};
}
export function childrenOf(catalog,parent){return catalog.items.filter(x=>x.parent===parent).sort((a,b)=>a.order-b.order);}
export function routeTitle(item){return item?.page?.menuLabel||item?.page?.title||'';}
export function getRoute(){return safeRoute(location.hash||'#/');}
