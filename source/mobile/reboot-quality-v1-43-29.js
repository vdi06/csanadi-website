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
/** M22.4: a rejtett Bootstrap panel és a hozzá tartozó vezérlő ne legyen
    a mobilos roving-keyboard léptetés célpontja. */
export function mobileActionIsVisible(node){
 if(!node||node.disabled||node.hidden||node.getAttribute?.('aria-hidden')==='true'||
  node.getAttribute?.('aria-disabled')==='true')return false;
 const hiddenAncestor=node.closest?.('[hidden],[inert],[aria-hidden="true"]');
 if(hiddenAncestor&&(hiddenAncestor.hidden||hiddenAncestor.inert||
  hiddenAncestor.getAttribute?.('aria-hidden')==='true'))return false;
 if(typeof node.getClientRects==='function'&&!node.getClientRects().length)return false;
 // visibility:hidden és content-visibility:hidden mellett a geometria nem
 // feltétlenül nulla, mégsem szabad a vezérlőre billentyűzettel lépni.
 if(typeof getComputedStyle==='function'){
  const style=getComputedStyle(node);
  if(style.visibility==='hidden'||style.visibility==='collapse'||
   style.contentVisibility==='hidden'||style.display==='none')return false;
 }
 return true;
}
export function initFreshMobileQuality(){
 const html=document.documentElement;
 if(html.dataset.csMbQuality==='1')return;
 html.dataset.csMbQuality='1';
 const mq=matchMedia('(max-width: 768px), (pointer: coarse) and (hover: none)'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let observedNotice=null,noticeObserver=null;
 // v1.43.31 / A: az aloldali három tájékoztatókártya egyetlen mobilos
 // összecsukható előnézetté válik. Desktopon visszaáll az eredeti DOM.
 function syncNoticeCompact(){
  const panel=document.querySelector?.('body > .csn20-language-bar');
  if(!panel){noticeObserver?.disconnect();noticeObserver=null;observedNotice=null;return;}
  // M21.4: a SPA később is illeszthet új közleményt a panelbe.
  // A frissen megjelent közlemények is a kinyitható törzsbe kerülnek.
  if(panel!==observedNotice&&typeof MutationObserver==='function'){
   noticeObserver?.disconnect();observedNotice=panel;
   noticeObserver=new MutationObserver(syncNoticeCompact);
   noticeObserver.observe(panel,{childList:true});
  }
  const toggle=panel.querySelector(':scope > .cs-mb-notice-toggle');
  const content=panel.querySelector(':scope > .cs-mb-notice-body');
  if(!mq.matches){
   const focusedToggle=toggle&&document.activeElement===toggle;
   if(content){while(content.firstChild)panel.insertBefore(content.firstChild,content);content.remove();}
   toggle?.remove();panel.classList.remove('cs-mb-notices-compact','cs-mb-notices-open');
   if(focusedToggle)panel.querySelector('button')?.focus?.({preventScroll:true});
   return;
  }
  if(toggle&&content){
   for(const child of [...panel.children]){
    if(child!==toggle&&child!==content)content.appendChild(child);
   }
   return;
  }
  const retainFocus=panel.contains(document.activeElement);
  const body=document.createElement('div');body.className='cs-mb-notice-body';
  body.id='cs-mb-notice-body';
  while(panel.firstChild)body.appendChild(panel.firstChild);
  const control=document.createElement('button');control.type='button';
  control.className='cs-mb-notice-toggle';control.setAttribute('aria-controls',body.id);
  const label=document.createElement('span');label.textContent='Fontos tájékoztatók';
  const hint=document.createElement('span');hint.className='cs-mb-notice-hint';
  control.append(label,hint);panel.append(control,body);
  const setOpen=open=>{
   // A programból vagy külső műveletből bezáródó panelben sem maradhat
   // fókusz egy immár rejtett link vagy gomb belsejében.
   if(!open&&body.contains(document.activeElement))control.focus({preventScroll:true});
   body.hidden=!open;control.setAttribute('aria-expanded',String(open));
   hint.textContent=open?'Bezárás ↑':'Megnyitás ↓';
   panel.classList.toggle('cs-mb-notices-open',open);
  };
  control.addEventListener('click',()=>setOpen(control.getAttribute('aria-expanded')!=='true'));
  // Escape után a fókusz a nyitógombra tér vissza; a rejtett tartalom
  // billentyűzettel nem maradhat véletlenül aktív.
  body.addEventListener('keydown',event=>{
   if(event.key!=='Escape')return;
   event.preventDefault();setOpen(false);control.focus({preventScroll:true});
  });
  panel.classList.add('cs-mb-notices-compact');setOpen(retainFocus);
 }
 syncNoticeCompact();
 if(typeof MutationObserver==='function'&&document.body){
  new MutationObserver(syncNoticeCompact).observe(document.body,{childList:true});
 }
 mq.addEventListener?.('change',syncNoticeCompact);
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
  .filter(mobileActionIsVisible);
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
