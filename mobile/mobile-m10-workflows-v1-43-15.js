/** M10/D – mobilos szűrés, fókusz, témakörváltás és billentyűzetes munkafolyamatok. */
const FILTER_GROUPS='.media26-albums,.media26-sport-filters,.media26-tabs,.r10-video-playlists,.doc-view-control';
export function mobileM10NextIndex(index,count,key){
 if(!count)return -1;
 if(key==='Home')return 0;
 if(key==='End')return count-1;
 if(key==='ArrowRight'||key==='ArrowDown')return (index+1+count)%count;
 if(key==='ArrowLeft'||key==='ArrowUp')return (index-1+count)%count;
 return -1;
}

export function mobileM10ShouldAssistFocus({mobile=true,active=true,top=0,bottom=0,
 viewportTop=0,viewportHeight=0,margin=24}={}){
 if(!mobile||!active||!viewportHeight)return false;
 return top<viewportTop+margin||bottom>viewportTop+viewportHeight-margin;
}

export function initMobileWorkflowsM10(){
 const root=document.documentElement;
 if(root.dataset.m10Ready==='1')return;
 root.dataset.m10Ready='1';
 const mobile=matchMedia('(max-width: 768px)');
 const controlsOf=group=>[...group.querySelectorAll('button:not(:disabled),a[href]')]
  .filter(node=>!node.hidden&&node.getAttribute('aria-hidden')!=='true');

 // A galéria és a dokumentumtár a szűrők megnyomásakor újrarajzolja a gombokat.
 // Visszaadjuk a fókuszt az új megfelelőnek, hogy érintéssel és billentyűzettel
 // se legyen szükség a teljes oldal újbóli bejárására.
 document.addEventListener('click',event=>{
  if(!mobile.matches)return;
  const pressed=event.target.closest?.('button');
  const group=pressed?.closest?.(FILTER_GROUPS);
  if(!group||!group.closest('#app'))return;
  const old=controlsOf(group),at=old.indexOf(pressed);
  if(at<0)return;
  const label=pressed.getAttribute('aria-label')||pressed.textContent?.trim()||'';
  queueMicrotask(()=>{
   if(!mobile.matches||!group.isConnected||pressed.isConnected)return;
   const current=controlsOf(group);
   const match=current.find(node=>(node.getAttribute('aria-label')||node.textContent?.trim()||'')===label);
   (match||current[Math.min(at,current.length-1)])?.focus({preventScroll:true});
  });
 },true);

 document.addEventListener('keydown',event=>{
  if(!mobile.matches||!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  const source=event.target;
  const group=source.closest?.(FILTER_GROUPS);
  if(!group||!group.closest('#app'))return;
  const buttons=controlsOf(group),at=buttons.indexOf(source);
  if(at<0)return;
  const next=mobileM10NextIndex(at,buttons.length,event.key);
  if(next<0)return;
  event.preventDefault();buttons[next]?.focus({preventScroll:true});
 });

 // Az útvonalváltás képernyőolvasónál is jelöli az aktív belső hivatkozást.
 function updateActiveLinks(){
  if(!mobile.matches){
   for(const link of document.querySelectorAll('[data-cs-m10-current="1"]')){
    link.removeAttribute('data-cs-m10-current');
    link.removeAttribute('aria-current');
   }
   return;
  }
  const current=(location.hash||'#/').split('?')[0];
  for(const link of document.querySelectorAll('#site-header a[href^="#/"],#app nav a[href^="#/"],.site-footer a[href^="#/"]')){
   const href=link.getAttribute('href');
   if(href===current){
    if(!link.hasAttribute('aria-current'))link.dataset.csM10Current='1';
    link.setAttribute('aria-current','page');
   }else if(link.dataset.csM10Current==='1'){
    link.removeAttribute('aria-current');link.removeAttribute('data-cs-m10-current');
   }
  }
 }
 document.addEventListener('csanadi:route-rendered',updateActiveLinks);
 mobile.addEventListener?.('change',updateActiveLinks);
 updateActiveLinks();

 // A virtuális billentyűzet csak akkor mozgassa a tartalmat, ha a fókuszban
 // lévő mezőt ténylegesen kitakarja; a kézi görgetést nem írja felül.
 document.addEventListener('focusin',event=>{
  if(!mobile.matches)return;
  const field=event.target;
  if(!field.matches?.('input,textarea,select,[contenteditable="true"]'))return;
  if(!field.closest?.('#app,#search-panel,.cs43-viewer'))return;
  setTimeout(()=>{
   if(!mobile.matches||document.activeElement!==field||!field.isConnected)return;
   const viewport=window.visualViewport;
   const offset=viewport?.offsetTop||0;
   const height=viewport?.height||window.innerHeight||0;
   const rect=field.getBoundingClientRect();
   if(mobileM10ShouldAssistFocus({mobile:true,active:true,top:rect.top,bottom:rect.bottom,
    viewportTop:offset,viewportHeight:height,margin:32})){
    field.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});
   }
  },160);
 });
}
