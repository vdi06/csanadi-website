/** Új mobilos filmes nyitófelület; nem használ régi kapu- vagy képváltó modult. */
const make=(tag,cls='',value='')=>{
 const el=document.createElement(tag);if(cls)el.className=cls;
 if(value)el.textContent=value;return el;
};
export const mobileSlideIndex=(index,total)=>total?((index%total)+total)%total:0;
export const mobileAutoPlayAllowed=({mobile=true,reduce=false,limit=false,visible=true,
 hidden=false,paused=false,overlay=false,interacting=false}={})=>
 Boolean(mobile&&!reduce&&!limit&&visible&&!hidden&&!paused&&!overlay&&!interacting);

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
 });
}
const routeOf=slide=>/^#\/[a-z0-9/\-]*$/i.test(slide?.buttons?.[0]?.href||'')?
 slide.buttons[0].href:'#/iskolank';

export function createFreshMobileHero({slides=[],createPicture,mediaItem,intervalMs=8000}={}){
 const valid=slides.filter(slide=>slide&&typeof slide.mediaId==='string'&&
  mediaItem(slide.mobileMediaId||slide.mediaId));
 const entrance=valid.find(slide=>(slide.mobileMediaId||slide.mediaId)==='media:bejarat');
 const items=entrance?[entrance,...valid.filter(x=>x!==entrance)]:valid;
 const root=make('section','cs-mb-cinema');root.setAttribute('aria-label','Mobilos iskolabemutató');
 // M16.1: az önálló mobil CSS a desktopon szándékosan nem töltődik be.
 // A mobil DOM ezért önmagában is rejtett kell legyen 769px felett.
 const phone=matchMedia('(max-width: 768px)');
 root.hidden=!phone.matches;
 phone.addEventListener?.('change',event=>{root.hidden=!event.matches;});
 const stage=make('div','cs-mb-film-stage');
 const visual=make('div','cs-mb-film-visual');
 const shade=make('div','cs-mb-film-shade');shade.setAttribute('aria-hidden','true');
 const gate=make('div','cs-mb-film-gate');gate.setAttribute('aria-hidden','true');gate.hidden=true;
 gate.append(make('span','cs-mb-film-door cs-mb-film-left'),
  make('span','cs-mb-film-door cs-mb-film-right'));
 const label=make('span','cs-mb-film-label','CSANÁDI · SPORT · TUDÁS · KÖZÖSSÉG');
 visual.append(shade,gate,label);stage.append(visual);
 const info=make('div','cs-mb-film-info');
 const eyebrow=make('p','cs-mb-film-eyebrow','CSANÁDI SPORTISKOLA');
 const heading=make('h2','cs-mb-film-heading','Itt kezdődik a történetünk.');
 const summary=make('p','cs-mb-film-summary','Sport, tanulás és közösség egy helyen.');
 const panel=make('div','cs-mb-film-panel');
 const previous=make('button','cs-mb-film-arrow','‹');previous.type='button';
 previous.setAttribute('aria-label','Előző nyitókép');
 const next=make('button','cs-mb-film-arrow','›');next.type='button';
 next.setAttribute('aria-label','Következő nyitókép');
 const center=make('div','cs-mb-film-center');
 const count=make('span','cs-mb-film-count');
 const track=make('div','cs-mb-film-track');track.setAttribute('aria-hidden','true');
 const fill=make('span','cs-mb-film-fill');track.append(fill);
 center.append(count,track);
 panel.append(previous,center,next);
 const actions=make('div','cs-mb-film-actions');
 const explore=make('a','cs-mb-film-explore','A témakör megnyitása');
 const autoplay=make('button','cs-mb-film-autoplay','Ⅱ Szüneteltetés');autoplay.type='button';
 autoplay.setAttribute('aria-pressed','false');actions.append(explore,autoplay);
 const message=make('span','visually-hidden');
 message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 info.append(eyebrow,heading,summary,panel,actions,message);root.append(stage,info);
 if(!items.length){heading.textContent='Üdvözlünk a Csanádiban';
  previous.disabled=true;next.disabled=true;autoplay.hidden=true;return root;}

 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const network=navigator.connection;
 let dataLimited=Boolean(network?.saveData||/^(?:slow-2g|2g)$/.test(network?.effectiveType||''));
 let index=0,changing=false,stopped=false,hover=false,focus=false,visible=true,start=null;
 const pictureFor=slide=>createPicture(slide.mobileMediaId||slide.mediaId,
  {className:'cs-mb-film-picture',eager:true,sizes:'(max-width: 768px) 100vw, 0px'});
 let active=pictureFor(items[0]);
 if(active)visual.prepend(active);
 const announce=manual=>{
  const s=items[index];
  eyebrow.textContent=s.eyebrow||'CSANÁDI SPORTISKOLA';
  heading.textContent=s.title||'Sport, tanulás, közösség';
  summary.textContent=s.subtitle||'Fedezd fel iskolánk világát!';
  explore.href=routeOf(s);
  count.textContent=`${String(index+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
  fill.style.width=((index+1)/items.length*100)+'%';
  autoplay.hidden=dataLimited||reduced.matches||items.length<2;
  autoplay.textContent=stopped?'▶ Folytatás':'Ⅱ Szüneteltetés';
  autoplay.setAttribute('aria-pressed',String(stopped));
  if(manual)message.textContent=`${index+1}. kép a(z) ${items.length} közül: ${heading.textContent}`;
 };
 announce(false);
 previous.disabled=items.length<2;
 next.disabled=items.length<2;
 async function show(position,manual=false){
  if(changing||!root.isConnected||!phone.matches||items.length<2)return false;
  const to=mobileSlideIndex(position,items.length);if(to===index)return false;
  const entering=pictureFor(items[to]);if(!entering)return false;
  changing=true;previous.disabled=true;next.disabled=true;
  entering.classList.add('cs-mb-film-entering');visual.insertBefore(entering,shade);
  const ready=await imageLoaded(entering);
  if(!ready||!root.isConnected){entering.remove();changing=false;
   previous.disabled=false;next.disabled=false;return false;}
  try{await entering.querySelector('img')?.decode?.();}catch{}
  if(!root.isConnected){entering.remove();changing=false;return false;}
  index=to;
  if(reduced.matches||dataLimited){
   announce(manual);active?.remove();entering.classList.remove('cs-mb-film-entering');
   active=entering;changing=false;previous.disabled=false;next.disabled=false;return true;}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   entering.classList.add('is-visible');active?.classList.add('is-leaving');
   // A cím és az útvonallink a tényleges képcserével együtt vált.
   announce(manual);
  }));
  setTimeout(()=>{active?.remove();entering.classList.remove('cs-mb-film-entering','is-visible');
   active=entering;changing=false;previous.disabled=false;next.disabled=false;},740);
  return true;
 }
 previous.addEventListener('click',()=>show(index-1,true));
 next.addEventListener('click',()=>show(index+1,true));
 autoplay.addEventListener('click',()=>{stopped=!stopped;announce(false)});
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
  visible=rows.some(row=>row.isIntersecting);
 },{threshold:.15}):null;
 watcher?.observe(root);
 const step=Math.min(12000,Math.max(7000,Number(intervalMs)||8000));
 const interval=setInterval(()=>{
  // A SPA ugyanazt a DOM-elemet csatolja vissza, amikor aloldalról a
  // kezdőlapra térünk. A lecsatolás nem végleges megszűnés: a lejátszó
  // ilyenkor csak szünetel, és visszatéréskor természetesen folytatódik.
  if(!root.isConnected)return;
  if(allowed()&&!changing)show(index+1,false);
 },step);

 // A mobilbejárat egyszeri, áttetsző kapuja kizárólag dekódolt képnél nyílhat.
 async function firstOpening(){
  if(!phone.matches||reduced.matches||dataLimited||document.hidden||!active)return;
  try{if(sessionStorage.getItem('cs-mb-reboot-opened')==='1')return;}catch{}
  const ready=await imageLoaded(active);
  if(!ready||!root.isConnected||reduced.matches||dataLimited){gate.hidden=true;return;}
  try{await active.querySelector('img')?.decode?.();}catch{}
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
 return root;
}
