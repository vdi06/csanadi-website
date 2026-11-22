/** Új mobilos filmes nyitófelület; nem használ régi kapu- vagy képváltó modult. */
const make=(tag,cls='',value='')=>{
 const el=document.createElement(tag);if(cls)el.className=cls;
 if(value)el.textContent=value;return el;
};
export const mobileSlideIndex=(index,total)=>total?((index%total)+total)%total:0;
/** M21.3: a hibásan betöltődő diák rövid ideig kimaradnak; ezalatt a
    következő használható kép választható. Az időkorlát után újrapróbálhatók. */
export function mobileNextAvailableSlide(index,direction,total,blockedUntil=new Map(),now=Date.now()){
 if(total<2)return -1;
 const step=direction<0?-1:1;
 for(let offset=1;offset<total;offset++){
  const candidate=mobileSlideIndex(index+step*offset,total);
  if((blockedUntil.get(candidate)||0)<=now)return candidate;
 }
 return -1;
}
export const mobileAutoPlayAllowed=({mobile=true,reduce=false,limit=false,visible=true,
 hidden=false,paused=false,overlay=false,interacting=false}={})=>
 Boolean(mobile&&!reduce&&!limit&&visible&&!hidden&&!paused&&!overlay&&!interacting);
/** Kézi lapozás után csak egy teljes új időköz elteltével léphet automatikusan. */
export const mobileShouldAutoAdvance=(now,lastManualAt,step)=>now-lastManualAt>=step;

function imageLoaded(picture){
 const img=picture?.querySelector('img');if(!img)return Promise.resolve(false);
 if(img.complete)return Promise.resolve(img.naturalWidth>0);
 return new Promise(resolve=>{
  let settled=false;
  const done=success=>{if(settled)return;settled=true;clearTimeout(timeout);
   img.removeEventListener('load',onLoad);img.removeEventListener('error',onError);resolve(success);};
  const onLoad=()=>done(img.naturalWidth>0),onError=()=>done(false);
  img.addEventListener('load',onLoad,{once:true});img.addEventListener('error',onError,{once:true});
  const timeout=setTimeout(()=>done(false),5500);
  // A betöltés az első ellenőrzés és az eseményfigyelők felhelyezése
  // között is befejeződhet; ekkor már nem feltétlenül érkezik új load.
  if(img.complete)done(img.naturalWidth>0);
 });
}
/** M20.2: Safari háttérbe helyezett lapján a decode() várakozása nem
    tarthatja végtelenségig letiltva a képváltót. A betöltött kép marad. */
async function waitForDecoded(picture,timeoutMs=1400){
 const img=picture?.querySelector('img');if(typeof img?.decode!=='function')return;
 let timer;
 try{
  await Promise.race([
   Promise.resolve().then(()=>img.decode()).catch(()=>{}),
   new Promise(resolve=>{timer=setTimeout(resolve,timeoutMs);})
  ]);
 }finally{clearTimeout(timer);}
}
const routeOf=slide=>/^#\/[a-z0-9/\-]*$/i.test(slide?.buttons?.[0]?.href||'')?
 slide.buttons[0].href:'#/iskolank';

export function createFreshMobileHero({slides=[],createPicture,mediaItem,intervalMs=8000,ui={}}={}){
 const label=(key,fallback)=>typeof ui?.[key]==='string'&&ui[key].trim()?ui[key]:fallback;
 const valid=slides.filter(slide=>slide&&typeof slide.mediaId==='string'&&
  mediaItem(slide.mobileMediaId||slide.mediaId));
 const entrance=valid.find(slide=>(slide.mobileMediaId||slide.mediaId)==='media:bejarat');
 const items=entrance?[entrance,...valid.filter(x=>x!==entrance)]:valid;
 // B változat: a képváltó a KEZDŐLAP filmes nyitórészének része, nem
 // fejléc-, lebegő vagy aloldali vezérlő. A normál oldalgörgetés viszi ki.
 const root=make('section','cs-mb-cinema');root.setAttribute('aria-label',label('sectionLabel','Mobilos iskolabemutató'));
 root.dataset.csMbPlacement='home-hero-only';
 // M17.1: a mobil CSS desktopon nem töltődik be, és a 'hidden' állapotot
 // egy erősebb, külső display-szabály felülírhatná. Ezért a valódi mobil
 // DOM-elemet desktopon egyáltalán nem csatoljuk a kezdőlaphoz.
 // A DocumentFragment csak egy láthatatlan komment-horgonyt helyez el,
 // amely mellé telefonméretre váltva kerülhet a filmes komponens.
 const phone=matchMedia('(max-width: 768px), (pointer: coarse) and (hover: none)');
 const mount=document.createDocumentFragment();
 const anchor=document.createComment('csanadi-mobil-filmes-nyito');
 mount.append(anchor);
 root.hidden=!phone.matches;
 if(phone.matches)mount.append(root);
 phone.addEventListener?.('change',event=>{
  root.hidden=!event.matches;
  if(event.matches){if(anchor.parentNode&&root.parentNode!==anchor.parentNode)anchor.after(root);}
  else if(root.parentNode)root.remove();
 });
 const stage=make('div','cs-mb-film-stage');
 const visual=make('div','cs-mb-film-visual');
 const shade=make('div','cs-mb-film-shade');shade.setAttribute('aria-hidden','true');
 const gate=make('div','cs-mb-film-gate');gate.setAttribute('aria-hidden','true');gate.hidden=true;
 gate.append(make('span','cs-mb-film-door cs-mb-film-left'),
  make('span','cs-mb-film-door cs-mb-film-right'));
 const filmLabel=make('span','cs-mb-film-label',label('filmLabel','CSANÁDI · SPORT · TUDÁS · KÖZÖSSÉG'));
 visual.append(shade,gate,filmLabel);stage.append(visual);
 const info=make('div','cs-mb-film-info');
 const eyebrow=make('p','cs-mb-film-eyebrow',label('initialEyebrow','CSANÁDI SPORTISKOLA'));
 const heading=make('h2','cs-mb-film-heading',label('initialTitle','Itt kezdődik a történetünk.'));
 const summary=make('p','cs-mb-film-summary',label('initialSubtitle','Sport, tanulás és közösség egy helyen.'));
 const panel=make('div','cs-mb-film-panel');
 const previous=make('button','cs-mb-film-arrow','‹');previous.type='button';
 previous.setAttribute('aria-label',label('previousLabel','Előző nyitókép'));
 const next=make('button','cs-mb-film-arrow','›');next.type='button';
 next.setAttribute('aria-label',label('nextLabel','Következő nyitókép'));
 const center=make('div','cs-mb-film-center');
 const count=make('span','cs-mb-film-count');
 const track=make('div','cs-mb-film-track');track.setAttribute('aria-hidden','true');
 const fill=make('span','cs-mb-film-fill');track.append(fill);
 center.append(count,track);
 panel.append(previous,center,next);
 const actions=make('div','cs-mb-film-actions');
 const explore=make('a','cs-mb-film-explore',label('exploreLabel','A témakör megnyitása'));
 const autoplay=make('button','cs-mb-film-autoplay',label('pauseLabel','Ⅱ Szüneteltetés'));autoplay.type='button';
 autoplay.setAttribute('aria-pressed','false');actions.append(explore,autoplay);
 const message=make('span','visually-hidden');
 message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 info.append(eyebrow,heading,summary,panel,actions,message);root.append(stage,info);
 if(!items.length){heading.textContent=label('emptyTitle','Üdvözlünk a Csanádiban');
  previous.disabled=true;next.disabled=true;autoplay.hidden=true;return mount;}

 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const network=navigator.connection;
 let dataLimited=Boolean(network?.saveData||/^(?:slow-2g|2g)$/.test(network?.effectiveType||''));
 let index=0,changing=false,stopped=false,hover=false,focus=false,visible=true,start=null;
 let lastManualAt=0;
 const blockedUntil=new Map();
 const fallbackFor=slide=>{
  const entry=mediaItem(slide.mobileMediaId||slide.mediaId);
  const valid=path=>typeof path==='string'&&/^assets\/media\/[a-z0-9/_\-.]+$/i.test(path)&&!path.includes('..');
  const variants=(entry?.variants||[]).filter(item=>item?.mimeType==='image/webp'&&valid(item.path));
  return variants.find(item=>item.width>=960)?.path||variants.at(-1)?.path||
   (valid(entry?.original?.path)?entry.original.path:null);
 };
 const updateFallback=slide=>{
  const path=fallbackFor(slide);
  if(path)stage.style.setProperty('--cs-mb-fallback-image',`url("${path}")`);
 };
 const pictureFor=slide=>createPicture(slide.mobileMediaId||slide.mediaId,
  {className:'cs-mb-film-picture',eager:true,sizes:'(max-width: 768px) 100vw, (pointer: coarse) and (hover: none) 100vw, 0px'});
 let active=pictureFor(items[0]);
 updateFallback(items[0]);
 if(active)visual.prepend(active);
 // M22.3: ha az első kép hibás vagy hiányzik, ne maradjon üres a teljes
 // nyitóterület. A további, működő diák közül automatikusan keresünk egyet.
 const firstImageReady=imageLoaded(active);
 const announce=manual=>{
  const s=items[index];
  eyebrow.textContent=s.eyebrow||label('fallbackEyebrow','CSANÁDI SPORTISKOLA');
  heading.textContent=s.title||label('fallbackTitle','Sport, tanulás, közösség');
  summary.textContent=s.subtitle||label('fallbackSubtitle','Fedezd fel iskolánk világát!');
  explore.href=routeOf(s);
  count.textContent=`${String(index+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
  fill.style.width=((index+1)/items.length*100)+'%';
  autoplay.hidden=dataLimited||reduced.matches||items.length<2;
  autoplay.textContent=stopped?label('resumeLabel','▶ Folytatás'):label('pauseLabel','Ⅱ Szüneteltetés');
  autoplay.setAttribute('aria-pressed',String(stopped));
  if(manual)message.textContent=`${index+1}. kép a(z) ${items.length} közül: ${heading.textContent}`;
 };
 announce(false);
 previous.disabled=items.length<2;
 next.disabled=items.length<2;
 async function show(position,manual=false){
  if(manual)lastManualAt=Date.now();
  if(changing||!root.isConnected||!phone.matches||items.length<2)return false;
  const direction=position<index?-1:1;
  const to=mobileNextAvailableSlide(index,direction,items.length,blockedUntil);
  if(to<0){if(manual)message.textContent='A többi nyitókép átmenetileg nem érhető el.';
   return false;}
  const entering=pictureFor(items[to]);
  if(!entering){blockedUntil.set(to,Date.now()+30000);return false;}
  changing=true;previous.disabled=true;next.disabled=true;
  stage.setAttribute('aria-busy','true');
  const unlock=()=>{changing=false;previous.disabled=false;next.disabled=false;
   stage.removeAttribute('aria-busy');};
  entering.classList.add('cs-mb-film-entering');visual.insertBefore(entering,shade);
  const ready=await imageLoaded(entering);
  if(!ready||!root.isConnected){
   if(!ready){blockedUntil.set(to,Date.now()+30000);
    if(manual)message.textContent='Ez a kép most nem tölthető be. A következő lapozás másik képet próbál.';}
   entering.remove();unlock();return false;
  }
  await waitForDecoded(entering);
  // Egy aloldalra lépés a dekódolás alatt leválaszthatja a kezdőlapot.
  // Az újracsatolt komponens nyilai ekkor sem maradhatnak letiltva.
  if(!root.isConnected||!phone.matches){entering.remove();unlock();return false;}
  blockedUntil.delete(to);
  index=to;
  if(reduced.matches||dataLimited){
   updateFallback(items[index]);announce(manual);active?.remove();entering.classList.remove('cs-mb-film-entering');
   active=entering;unlock();return true;}
  // M18.3: iOS/Safari háttérben vagy lassú telefonon a dupla rAF késhet.
  // A régi időzítő előbb lecserélhette az active változót, majd a késői
  // rAF ugyanazt az új képet jelölte is-leaving osztállyal (üres képernyő).
  // A kifutó képet rögzítjük; a lezárás egyszer futhat, és késői rAF
  // soha nem tud már eltüntetni egy sikeresen beállított új képet.
  const outgoing=active;
  let finished=false,frameStarted=false;
  const finish=()=>{
   if(finished)return;
   finished=true;
   outgoing?.remove();
   entering.classList.remove('cs-mb-film-entering','is-visible','is-leaving');
   active=entering;unlock();
   if(!frameStarted){updateFallback(items[index]);announce(manual);}
  };
  const reveal=()=>{
   if(finished)return;
   frameStarted=true;
   entering.classList.add('is-visible');outgoing?.classList.add('is-leaving');
   // A felirat a ténylegesen megkezdett áttűnéssel együtt vált.
   updateFallback(items[index]);
   announce(manual);
   entering.addEventListener('transitionend',event=>{
    if(event.target===entering&&event.propertyName==='opacity')finish();
   },{once:true});
   setTimeout(finish,900);
  };
  requestAnimationFrame(()=>requestAnimationFrame(reveal));
  // Ha a böngésző a rAF-et teljesen felfüggeszti, 1.5s után az új kép
  // biztonságosan, animáció nélkül megjelenik. A későbbi rAF már nem hat.
  setTimeout(finish,1500);
  return true;
 }
 let recoveringFirst=false;
 const recoverFirstImage=()=>{
  if(!root.isConnected||!phone.matches||changing||index!==0||recoveringFirst)return;
  recoveringFirst=true;
  blockedUntil.set(0,Date.now()+30000);
  // A második kép is hiányozhat. Az összes eltérő diát azonnal próbáljuk,
  // a korábban hibásakat 30 másodpercig kihagyva.
  void (async()=>{
   for(let attempt=1;attempt<items.length;attempt++){
    if(!root.isConnected||!phone.matches)return;
    if(await show(index+1,false))return;
   }
   summary.textContent=label('unavailableSubtitle','A képek átmenetileg nem érhetők el. Az oldalak továbbra is megnyithatók.');
   message.textContent=label('unavailableAnnouncement','A mobilos nyitóképek jelenleg nem tölthetők be.');
  })().finally(()=>{recoveringFirst=false;});
 };
 // A hibás első kép már a DocumentFragment DOM-ba illesztése előtt
 // hibára futhat. Ilyenkor a korai isConnected vizsgálat önmagában
 // elszalasztaná az egyetlen helyreállítási kísérletet.
 const recoverAfterMount=()=>{
  if(root.isConnected){recoverFirstImage();return;}
  if(typeof MutationObserver==='function'){
   const observer=new MutationObserver(()=>{
    if(!root.isConnected)return;
    observer.disconnect();recoverFirstImage();
   });
   observer.observe(document.body,{childList:true,subtree:true});
  }else setTimeout(()=>{if(root.isConnected)recoverFirstImage();},0);
 };
 firstImageReady.then(ready=>{if(!ready)recoverAfterMount();});
 // A desktopról mobilra átméretezett lap esetén a korábban már hibássá
 // vált kezdőkép szintén helyreállítható, újratöltés nélkül.
 phone.addEventListener?.('change',event=>{
  if(!event.matches)return;
  firstImageReady.then(ready=>{if(!ready)recoverAfterMount();});
 });
 previous.addEventListener('click',()=>show(index-1,true));
 next.addEventListener('click',()=>show(index+1,true));
 autoplay.addEventListener('click',()=>{stopped=!stopped;lastManualAt=Date.now();announce(false)});
 root.addEventListener('mouseenter',()=>hover=true);root.addEventListener('mouseleave',()=>hover=false);
 root.addEventListener('focusin',()=>focus=true);
 root.addEventListener('focusout',()=>{focus=root.contains(document.activeElement)});
 stage.addEventListener('touchstart',event=>{
  // M15.2: kétujjas nagyítás vagy egy megszakadt mozdulat soha nem lapozhat.
  if(event.touches.length!==1){start=null;return;}
  start={id:event.touches[0].identifier,x:event.touches[0].clientX,y:event.touches[0].clientY};
 },{passive:true});
 stage.addEventListener('touchend',event=>{
  if(!start)return;
  if(event.changedTouches.length!==1){start=null;return;}
  if(start.id!==undefined&&event.changedTouches[0].identifier!==start.id){start=null;return;}
  const dx=event.changedTouches[0].clientX-start.x,dy=event.changedTouches[0].clientY-start.y;
  start=null;if(Math.abs(dx)>44&&Math.abs(dx)>Math.abs(dy)*1.3)show(index+(dx<0?1:-1),true);
 },{passive:true});
 stage.addEventListener('touchmove',event=>{
  if(event.touches.length!==1)start=null;
 },{passive:true});
 stage.addEventListener('touchcancel',()=>{start=null;},{passive:true});
 panel.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();show(index+(event.key==='ArrowRight'?1:-1),true);
  }
 });
 const allowed=()=>mobileAutoPlayAllowed({mobile:phone.matches,reduce:reduced.matches,
  limit:dataLimited,visible,hidden:document.hidden,paused:stopped,
  overlay:document.body.classList.contains('site-map-is-open'),interacting:hover||focus});
 const networkChanged=()=>{dataLimited=Boolean(network?.saveData||
  /^(?:slow-2g|2g)$/.test(network?.effectiveType||''));announce(false)};
 network?.addEventListener?.('change',networkChanged);
 reduced.addEventListener?.('change',()=>announce(false));
 const watcher=typeof IntersectionObserver==='function'?new IntersectionObserver(rows=>{
  // A kezdőképből kigörgetve a saját képváltó automatikusan leáll.
  // Görgetésnél nem mozgatjuk a DOM-ot és nem hozunk létre tapadó gombokat.
  visible=rows.some(row=>row.isIntersecting);
  root.dataset.csMbVisible=visible?'true':'false';
 },{threshold:.15}):null;
 watcher?.observe(root);
 // Régebbi Safari / beágyazott mobilböngésző IntersectionObserver nélkül:
 // ilyenkor sem indulhat háttérben a kezdőlap filmje, ha már nem látható.
 if(!watcher&&typeof root.getBoundingClientRect==='function'){
  const measure=()=>{const rect=root.getBoundingClientRect();
   visible=Boolean(phone.matches&&root.isConnected&&rect.bottom>0&&
    rect.top<(window.innerHeight||0));
   root.dataset.csMbVisible=visible?'true':'false';};
  window.addEventListener('scroll',measure,{passive:true});
  window.addEventListener('resize',measure,{passive:true});measure();
 }
 const step=Math.min(12000,Math.max(7000,Number(intervalMs)||8000));
 const interval=setInterval(()=>{
  // A SPA ugyanazt a DOM-elemet csatolja vissza, amikor aloldalról a
  // kezdőlapra térünk. A lecsatolás nem végleges megszűnés: a lejátszó
  // ilyenkor csak szünetel, és visszatéréskor természetesen folytatódik.
  if(!root.isConnected)return;
  if(allowed()&&!changing&&mobileShouldAutoAdvance(Date.now(),lastManualAt,step))show(index+1,false);
 },step);

 // A mobilbejárat egyszeri, áttetsző kapuja kizárólag dekódolt képnél nyílhat.
 async function firstOpening(){
  if(!phone.matches||reduced.matches||dataLimited||document.hidden||!active)return;
  try{if(sessionStorage.getItem('cs-mb-reboot-opened')==='1')return;}catch{}
  const ready=await firstImageReady;
  if(!ready||!root.isConnected||reduced.matches||dataLimited){gate.hidden=true;return;}
  await waitForDecoded(active);
  if(!root.isConnected||!phone.matches||document.hidden)return;
  // Az arany ajtó csak a valóban megjelent kép fölött kerül a DOM-képre.
  gate.hidden=false;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(reduced.matches||dataLimited||!phone.matches){gate.hidden=true;return;}
   gate.classList.add('is-opening');
   try{sessionStorage.setItem('cs-mb-reboot-opened','1');}catch{}
   setTimeout(()=>{gate.hidden=true;},1650);
  }));
 }
 if(phone.matches)firstOpening();
 return mount;
}
