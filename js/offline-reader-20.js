import {formatBytes} from './format-bytes.js?v=csanadi-r29n-20261115';
const $=id=>document.getElementById(id);const root=new URL('../',import.meta.url),selected=new Set();let cfg=null,pages=[],manifest=null;
const status=message=>$('offline-status').textContent=message;
async function load(path){const url=new URL(path,root);try{const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);return response.json();}catch(error){const cached=await caches.match(url,{ignoreSearch:true});if(cached)return cached.json();throw error;}}
function cacheName(){return 'csanadi-user-offline-pages';}
async function refreshStats(){if(!cfg)return;const cache=await caches.open(cacheName()),keys=await cache.keys(),total=keys.reduce((sum,req)=>sum+(manifest?.files?.[new URL(req.url).pathname.slice(root.pathname.length)]?.sizeBytes||0),0);let quota='';if(navigator.storage?.estimate){const estimate=await navigator.storage.estimate();quota=` · Böngésző: ${formatBytes(estimate.usage||0)} / ${formatBytes(estimate.quota||0)}`;}$('offline-budget').textContent=`Mentett fájlok: ${keys.length} · becsült nyers méret: ${formatBytes(total)} / ${formatBytes(cfg.runtime.offlineReader.maximumStorageBytes)}${quota}`;const saved=new Set(keys.map(x=>new URL(x.url).pathname));for(const box of $('offline-pages').querySelectorAll('label[data-path]')){const path=new URL(box.dataset.path,root).pathname;box.querySelector('small').textContent=saved.has(path)?'Offline mentve':'Még nincs külön mentve';}}
function buildList(){const target=$('offline-pages');target.replaceChildren();for(const page of pages){const box=document.createElement('article');const label=document.createElement('label'),input=document.createElement('input'),name=document.createElement('strong'),detail=document.createElement('small');box.dataset.path=page.path;label.dataset.path=page.path;input.type='checkbox';input.checked=selected.has(page.path);input.addEventListener('change',()=>{if(input.checked)selected.add(page.path);else selected.delete(page.path);});name.textContent=page.title;detail.textContent='Mentési állapot ellenőrzése…';label.append(input,name,detail);box.append(label);target.append(box);}}
async function transfer(remove=false){
 if(!cfg||!pages.length)return;
 const entries=[...selected],limit=cfg.runtime.offlineReader.maxSelectedPages;
 if(!entries.length){$('offline-progress').textContent='Jelölj ki legalább egy oldalt.';return;}
 if(entries.length>limit){$('offline-progress').textContent=`Legfeljebb ${limit} oldal jelölhető ki egyszerre.`;return;}
 for(const id of ['offline-refresh','offline-remove'])$(id).disabled=true;
 let stored=0;const failed=[];
 try{
  const cache=await caches.open(cacheName()),existing=await cache.keys();
  // A kvóta a korábban mentett összes oldalra, nem csak az aktuális kijelölésre vonatkozik.
  let total=existing.reduce((sum,request)=>sum+(manifest.files?.[new URL(request.url).pathname.slice(root.pathname.length)]?.sizeBytes||0),0);
  for(const path of entries){
   const full='json/'+path,bytes=manifest.files?.[full]?.sizeBytes;
   const url=new URL(full,root);
   try{
    if(remove){if(await cache.delete(url)){stored++;total=Math.max(0,total-(bytes||0));}else failed.push(path+': nincs külön mentve');continue;}
    if(!Number.isSafeInteger(bytes)||bytes<=0){failed.push(path+': hiányzó fájlméret');continue;}
    if(bytes>cfg.runtime.offlineReader.maxFileBytes){failed.push(path+' túl nagy');continue;}
    const alreadySaved=!!(await cache.match(url));
    if(total-(alreadySaved?bytes:0)+bytes>cfg.runtime.offlineReader.maximumStorageBytes){failed.push(path+' tárhelykorlát');continue;}
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok)throw Error('HTTP '+response.status);
    await cache.put(url,response);total=total-(alreadySaved?bytes:0)+bytes;stored++;
   }catch(error){failed.push(path+': '+error.message);}
  }
  $('offline-progress').textContent=`${stored} oldal ${remove?'törölve':'frissítve'}; ${failed.length} kihagyva. ${failed.slice(0,3).join('; ')}`;
 }finally{
  for(const id of ['offline-refresh','offline-remove'])$(id).disabled=false;
  await refreshStats();
 }
}
export async function mountOfflineReader(){
 selected.clear();
 $('offline-refresh').addEventListener('click',()=>transfer(false));
 $('offline-remove').addEventListener('click',()=>transfer(true));
 $('offline-select').addEventListener('click',()=>{selected.clear();buildList();refreshStats();});
 try{
  if(!('caches'in window)||!window.isSecureContext){status('Az offline mentéshez HTTPS vagy localhost és egy modern böngésző szükséges. A honlap online továbbra is használható.');return;}
  [cfg,manifest]=await Promise.all([load('json/config.json'),load('release-manifest.json')]);
  if(!$('offline-status'))return;
  const index=await load('json/oldalindex.json');
  pages=Object.entries(index.pages||{}).filter(([,p])=>p.lifecycle?.status==='published').map(([path,page])=>({path,title:page.menuLabel||page.title})).sort((a,b)=>a.title.localeCompare(b.title,'hu'));
  status(`${pages.length} nyilvános oldal. Kijelölés után a Mentés/frissítés gombbal külön offline másolat készíthető.`);
  buildList();await refreshStats();
 }catch(error){if($('offline-status'))status('Az offline központ nem tölthető be: '+error.message);}
}
if(location.pathname.endsWith('/#/informaciok/offline-olvaso'))void mountOfflineReader();
