/** Frissen írt mobilos hozzáférhetőség és készülékterhelés-kezelés. */
const FILTERS='.media26-albums,.media26-tabs,.media26-sport-filters,.r10-video-playlists,.doc-view-control';
export function mobileIndexForKey(index,length,key){
 if(length<=0)return -1;
 const map={Home:0,End:length-1};if(key in map)return map[key];
 if(key==='ArrowLeft'||key==='ArrowUp')return(index+length-1)%length;
 if(key==='ArrowRight'||key==='ArrowDown')return(index+1)%length;
 return -1;
}
export function mobileResourceProfile({mobile=true,motion=false,saveData=false,network='',memory=null,cores=null}={}){
 const limited=Boolean(saveData||/^(?:slow-2g|2g)$/.test(network)||
  (Number.isFinite(memory)&&memory>0&&memory<=2)||
  (Number.isFinite(cores)&&cores>0&&cores<=2));
 return {active:Boolean(mobile),limited:Boolean(mobile&&limited),quiet:Boolean(mobile&&(motion||limited))};
}
export function initFreshMobileQuality(){
 const html=document.documentElement;
 if(html.dataset.csMbQuality==='1')return;
 html.dataset.csMbQuality='1';
 const mq=matchMedia('(max-width: 768px)'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 const connection=navigator.connection;
 const profile=()=>mobileResourceProfile({mobile:mq.matches,motion:motion.matches,
  saveData:Boolean(connection?.saveData),network:connection?.effectiveType||'',
  memory:navigator.deviceMemory,cores:navigator.hardwareConcurrency});
 const retained=new Set();
 const changedScrollRegions=new Map();
 const changedViewerLabels=new Map();
 const changedImages=new Map();
 const restoreImage=image=>{
  const prior=changedImages.get(image);if(!prior)return;
  // A mobilos lazy/async beállítás nem szivároghat át desktop szélességre.
  image.loading=prior.loadingValue;image.decoding=prior.decodingValue;
  for(const name of ['loading','decoding']){
   const value=prior[name];
   if(value===null)image.removeAttribute(name);
   else image.setAttribute(name,value);
  }
  changedImages.delete(image);
 };
 const restoreViewerLabel=node=>{
  const prior=changedViewerLabels.get(node);if(!prior)return;
  for(const [name,value] of Object.entries(prior)){
   if(value===null)node.removeAttribute(name);
   else node.setAttribute(name,value);
  }
  changedViewerLabels.delete(node);
 };
 const restoreScrollRegion=node=>{
  const prior=changedScrollRegions.get(node);if(!prior)return;
  for(const [name,value] of Object.entries(prior)){
   if(value===null)node.removeAttribute(name);
   else node.setAttribute(name,value);
  }
  changedScrollRegions.delete(node);
 };
 let queued=false;
 function apply(){
  queued=false;const mode=profile();
  html.toggleAttribute('data-cs-mb-limited',mode.limited);
  html.toggleAttribute('data-cs-mb-quiet',mode.quiet);
  for(const video of retained){
   if(!video.isConnected){retained.delete(video);continue;}
   if(!mode.quiet){video.autoplay=true;video.setAttribute('autoplay','');
    retained.delete(video);}
  }
  if(!mode.active){
   for(const node of changedScrollRegions.keys())restoreScrollRegion(node);
   for(const node of changedViewerLabels.keys())restoreViewerLabel(node);
   for(const image of changedImages.keys())restoreImage(image);
   return;
  }
  const scrollRegions=document.querySelectorAll(
   '#app .hub26-calendar,#app .cs-data-scroll,#app .table-responsive,#app .table-scroll,.cs43-document-viewer .cs43-paper');
  const availableRegions=new Set(scrollRegions);
  for(const node of scrollRegions){
   if(node.scrollWidth<=node.clientWidth+2){restoreScrollRegion(node);continue;}
   if(changedScrollRegions.has(node))continue;
   changedScrollRegions.set(node,Object.fromEntries(['tabindex','role','aria-label']
    .map(name=>[name,node.getAttribute(name)])));
   if(!node.hasAttribute('tabindex'))node.setAttribute('tabindex','0');
   if(!node.hasAttribute('role'))node.setAttribute('role','region');
   if(!node.hasAttribute('aria-label'))node.setAttribute('aria-label',
    node.closest?.('.cs43-document-viewer')?'PDF-dokumentum – vízszintesen görgethető':
     'Széles tartalom – vízszintesen görgethető');
  }
  for(const node of [...changedScrollRegions.keys()]){
   if(!node.isConnected)changedScrollRegions.delete(node);
   else if(!availableRegions.has(node))restoreScrollRegion(node);
  }
  // Egyetlen udvarias bejelentés képenként; a számláló külön felolvasható,
  // de nem küldünk két egymásra torlódó élő üzenetet.
  const viewerLabels=document.querySelectorAll('.cs43-image-viewer .cs43-gallery-caption');
  for(const node of viewerLabels){
   if(changedViewerLabels.has(node))continue;
   changedViewerLabels.set(node,Object.fromEntries(['aria-live','aria-atomic']
    .map(name=>[name,node.getAttribute(name)])));
   if(!node.hasAttribute('aria-live'))node.setAttribute('aria-live','polite');
   if(!node.hasAttribute('aria-atomic'))node.setAttribute('aria-atomic','true');
  }
  for(const node of [...changedViewerLabels.keys()]){
   if(!node.isConnected)changedViewerLabels.delete(node);
   else if(![...viewerLabels].includes(node))restoreViewerLabel(node);
  }
  for(const image of document.querySelectorAll('#app img')){
   if(image.closest?.('.page-banner,.media26-tile,.cs-mb-cinema'))continue;
   if(image.getAttribute('loading')==='eager'||image.getAttribute('fetchpriority')==='high')continue;
   if(!changedImages.has(image)&&(!image.hasAttribute('loading')||!image.hasAttribute('decoding'))){
    changedImages.set(image,{loading:image.getAttribute('loading'),
     decoding:image.getAttribute('decoding'),
     loadingValue:image.loading,decodingValue:image.decoding});
   }
   if(!image.hasAttribute('loading'))image.loading='lazy';
   if(!image.hasAttribute('decoding'))image.decoding='async';
  }
  for(const image of changedImages.keys())if(!image.isConnected)changedImages.delete(image);
  // M15.3: nemcsak az adatforgalom-kímélés, a kért mozgáscsökkentés is
  // letiltja az automatikusan induló videókat a kizárólag mobilos nézetben.
  if(mode.quiet)for(const video of document.querySelectorAll('#app video[autoplay]')){
   retained.add(video);video.autoplay=false;video.removeAttribute('autoplay');
  }
 }
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(apply)}};
 document.addEventListener('csanadi:route-rendered',schedule);
 // A saját Bootstrap-modálok a kezdő DOM után keletkeznek.
 document.addEventListener('shown.bs.modal',schedule);
 document.addEventListener('hidden.bs.modal',schedule);
 document.addEventListener('slid.bs.carousel',schedule);
 document.addEventListener('visibilitychange',()=>{
  if(mq.matches&&document.hidden)for(const video of document.querySelectorAll('#app video')){
   if(!video.paused)video.pause();
  }else schedule();
 });
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('orientationchange',schedule,{passive:true});
 // M15.1/M15.3: soft keyboard, nagyítás és BFCache után is frissüljenek
 // a ténylegesen görgethető régiók és az elérhető kontrollok jelölései.
 window.visualViewport?.addEventListener?.('resize',schedule,{passive:true});
 window.addEventListener('pageshow',schedule,{passive:true});
 mq.addEventListener?.('change',schedule);motion.addEventListener?.('change',schedule);
 connection?.addEventListener?.('change',schedule);

 const buttons=group=>[...group.querySelectorAll('button:not(:disabled),a[href]')]
  .filter(node=>!node.hidden&&node.getAttribute('aria-hidden')!=='true');
 document.addEventListener('click',event=>{
  if(!mq.matches)return;
  const source=event.target.closest?.('button');
  const group=source?.closest?.(FILTERS);
  if(!group?.closest('#app'))return;
  const list=buttons(group),position=list.indexOf(source);
  if(position<0)return;
  const text=source.getAttribute('aria-label')||source.textContent?.trim()||'';
  queueMicrotask(()=>{
   if(!mq.matches||!group.isConnected||source.isConnected)return;
   const latest=buttons(group);
   const match=latest.find(el=>(el.getAttribute('aria-label')||el.textContent?.trim()||'')===text);
   (match||latest[Math.min(position,latest.length-1)])?.focus({preventScroll:true});
  });
 },true);
 document.addEventListener('keydown',event=>{
  if(!mq.matches)return;
  const group=event.target.closest?.(FILTERS);if(!group?.closest('#app'))return;
  const all=buttons(group),index=all.indexOf(event.target);
  const next=mobileIndexForKey(index,all.length,event.key);
  if(index<0||next<0)return;
  event.preventDefault();all[next].focus({preventScroll:true});
 });
 document.addEventListener('focusin',event=>{
  if(!mq.matches||!event.target.matches?.('input,textarea,select,[contenteditable="true"]'))return;
  if(!event.target.closest?.('#app,#search-panel,.cs43-viewer'))return;
  const field=event.target;
  setTimeout(()=>{
   if(!mq.matches||document.activeElement!==field||!field.isConnected)return;
   const rect=field.getBoundingClientRect();
   const viewport=window.visualViewport;
   const top=viewport?.offsetTop||0,height=viewport?.height||window.innerHeight;
   if(rect.top<top+30||rect.bottom>top+height-30)
    field.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});
  },160);
 });
 apply();
 return {profile,refresh:schedule};
}
