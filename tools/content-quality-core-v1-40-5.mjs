/* v1.40.5 – tiszta, Node-ban és böngészőben azonosan futó tartalomellenőrzés. */
const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const oldHosts=['csanadi-bp.edu.hu','www.csanadi-bp.edu.hu'];
const legacyNames=/\b(lorem ipsum|tesztsz[oö]veg|mintaoldal)\b/i;
const STR_FIELDS=new Set(['href','url','src','filePath','link','target','route']);
function linksFrom(source,results=[],depth=0){
 if(depth>30||results.length>4000)return results;
 if(Array.isArray(source)){for(const x of source)linksFrom(x,results,depth+1);return results;}
 if(!source||typeof source!=='object')return results;
 for(const [key,value] of Object.entries(source)){
  if(typeof value==='string'&&STR_FIELDS.has(key))results.push({key,value});
  else if(value&&typeof value==='object')linksFrom(value,results,depth+1);
 }
 return results;
}
function normalizeRoute(value){const text=String(value||'').trim();if(text==='#/')return '#/';return text.replace(/\/+$/,'')||'#/';}
export function analyzeContentPages(entries,index){
 const issues=[],pages=(entries||[]).filter(entry=>entry&&entry.page);
 const knownRoutes=new Map();const knownTitles=new Map();
 const reported=(entry,severity,code,detail)=>issues.push({path:entry.path,route:entry.page?.schemaExtensions?.route||'',title:entry.page?.title||'',severity,code,detail});
 for(const entry of pages){const p=entry.page,route=normalizeRoute(p.schemaExtensions?.route),title=fold(p.title);
  if(knownRoutes.has(route)){reported(entry,'error','DUPLICATE_ROUTE','Az útvonal másik oldalon is szerepel: '+knownRoutes.get(route));}
  else knownRoutes.set(route,entry.path);
  if(title){const names=knownTitles.get(title)||[];names.push(entry.path);knownTitles.set(title,names);}
 }
 for(const entry of pages){
  const p=entry.page,route=normalizeRoute(p.schemaExtensions?.route),summary=String(p.summary||'').trim();
  const indexed=index?.pages?.[entry.path];
  if(p.lifecycle?.status!=='published')reported(entry,'error','UNPUBLISHED','Nem publikált oldal szerepel a nyilvános oldaljegyzékben.');
  if(!p.title?.trim())reported(entry,'error','TITLE_MISSING','Nincs oldalmegjelenítő cím.');
  if(!/^#\/[a-z0-9/-]*$/.test(route))reported(entry,'error','ROUTE_INVALID','Érvénytelen hash-útvonal.');
  if(!indexed)reported(entry,'error','INDEX_MISSING','A JSON-oldal nincs az oldalindexben.');
  else{
   if(indexed.id!==p.id||normalizeRoute(indexed.schemaExtensions?.route)!==route)reported(entry,'error','INDEX_MISMATCH','Az oldalindex azonosítója vagy útvonala eltér a tényleges JSON-tól.');
   if(!String(indexed.searchText||'').trim())reported(entry,'warning','SEARCH_EMPTY','A keresőindex szövegmezője üres.');
   if(fold(indexed.title)!==fold(p.title))reported(entry,'warning','SEARCH_TITLE_STALE','A keresőindex címe elavult.');
  }
  if(summary.length<55)reported(entry,'warning','SUMMARY_SHORT','Az összefoglaló 55 karakternél rövidebb.');
  if(summary.length>310)reported(entry,'advice','SUMMARY_LONG','Az összefoglaló 310 karakternél hosszabb.');
  if(!p.seo?.description?.trim())reported(entry,'warning','SEO_DESCRIPTION_MISSING','Hiányzik az önálló SEO-leírás.');
  if(!Array.isArray(p.categories)||!p.categories.length)reported(entry,'warning','CATEGORY_MISSING','Nincs tartalmi kategória.');
  if(!Array.isArray(p.blocks)||!p.blocks.length)reported(entry,'error','NO_BLOCKS','Nincs megjeleníthető tartalmi blokk.');
  if(legacyNames.test(p.title||''))reported(entry,'advice','SAMPLE_TITLE','A cím mintaszövegre utal; emberi felülvizsgálat szükséges.');
  for(const link of linksFrom({blocks:p.blocks,related:p.related})){
   const value=link.value.trim();if(!value)continue;
   try{
    if(/^https?:\/\//i.test(value)){
     const host=new URL(value).hostname.toLowerCase();
     if(oldHosts.includes(host))reported(entry,'warning','OLD_SITE_LINK','Régi honlapcím szerepel a(z) '+link.key+' mezőben: '+value.slice(0,160));
    }else if(value.startsWith('#/')){
     if(!knownRoutes.has(normalizeRoute(value))&&!value.includes('?'))reported(entry,'warning','UNKNOWN_INTERNAL_ROUTE','Nem regisztrált belső hivatkozás: '+value.slice(0,160));
    }
   }catch{reported(entry,'warning','INVALID_LINK','Nem feldolgozható hivatkozás: '+value.slice(0,160));}
  }
 }
 for(const [title,paths] of knownTitles)if(paths.length>1){
  for(const path of paths){const entry=pages.find(x=>x.path===path);reported(entry,'advice','DUPLICATE_TITLE',`Azonos cím ${paths.length} oldalon: ${title}`);}
 }
 const counts={error:issues.filter(x=>x.severity==='error').length,warning:issues.filter(x=>x.severity==='warning').length,advice:issues.filter(x=>x.severity==='advice').length};
 issues.sort((a,b)=>a.path.localeCompare(b.path,'hu')||a.code.localeCompare(b.code));
 return {release:'1.40.5',date:'2026-11-18',schemaVersion:'1.0.0',published:false,source:'json/oldalindex.json és 71 oldal-JSON',
  note:'Az ellenőrzés a csomag saját adatait vizsgálja; a személyes adatok, képfelhasználási engedélyek és intézményi állítások tényleges helyességét nem igazolja.',
  totals:{pages:pages.length,registered:Object.keys(index?.pages||{}).length,issues:issues.length,...counts},issues};
}
export function contentAuditCsv(report){
 const columns=['severity','code','path','route','title','detail'];
 const quote=value=>'"'+String(value??'').replace(/^[\s]*[=+\-@]/,"'$&").replace(/"/g,'""')+'"';
 return '\ufeff'+[columns,...report.issues.map(x=>columns.map(key=>x[key]))].map(row=>row.map(quote).join(';')).join('\r\n')+'\r\n';
}
