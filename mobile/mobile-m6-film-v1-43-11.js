/** M6/D – telefonos filmes belépés és könnyű, natív képváltó. */
export function mobileM6Slides(source,hasMedia){
 const valid=(Array.isArray(source)?source:[]).filter(item=>item&&
  typeof item.mediaId==='string'&&hasMedia(item.mobileMediaId||item.mediaId));
 const entrance=valid.find(item=>(item.mobileMediaId||item.mediaId)==='media:bejarat');
 return entrance?[entrance,...valid.filter(item=>item!==entrance)]:valid;
}

export function mobileM6ShouldPlay({mobile=true,wide=true,reduced=false,saveData=false,
 visible=true,hidden=false,focused=false,paused=false,menuOpen=false}={}){
 return mobile&&wide&&!reduced&&!saveData&&visible&&!hidden&&!focused&&!paused&&!menuOpen;
}

const make=(tag,className,text)=>{
 const node=document.createElement(tag);node.className=className;
 if(text!==undefined)node.textContent=text;
 return node;
};
const safeRoute=value=>typeof value==='string'&&/^#\/[a-z0-9/-]*$/i.test(value)?value:'#/';

function imageReady(image){
 if(!image)return Promise.resolve(false);
 if(image.complete)return Promise.resolve(image.naturalWidth>0);
 return new Promise(resolve=>{
  let finished=false;
  const done=ok=>{
   if(finished)return;finished=true;clearTimeout(timeout);
   image.removeEventListener('load',onLoad);image.removeEventListener('error',onError);
   resolve(ok);
  };
  const onLoad=()=>done(image.naturalWidth>0);
  const onError=()=>done(false);
  image.addEventListener('load',onLoad,{once:true});
  image.addEventListener('error',onError,{once:true});
  const timeout=setTimeout(()=>done(false),6500);
 });
}

export function enhanceMobileHeroM6({landing,figure,copy,slides,createPicture,mediaItem,intervalMs=7500}){
 if(!landing||!figure||!copy||landing.dataset.m6Ready)return null;
 const items=mobileM6Slides(slides,id=>Boolean(mediaItem(id)));
 if(items.length<2)return null;
 landing.dataset.m6Ready='1';
 const mobile=matchMedia('(max-width: 768px)');
 const wide=matchMedia('(min-width: 420px)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const connection=navigator.connection;
 const saveData=Boolean(connection?.saveData||/2g/.test(connection?.effectiveType||''));
 let index=0,busy=false,paused=false,visible=true,focused=false,swipe=null,transitionTimeout=null;

 const gate=make('div','cs-m6-gate');gate.hidden=true;
 gate.setAttribute('aria-hidden','true');
 gate.append(make('span','cs-m6-door cs-m6-door-left'),make('span','cs-m6-door cs-m6-door-right'));
 figure.append(gate);
 const toolbar=make('div','cs-m6-toolbar');
 toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Mobilos képes tartalomváltó');
 const prev=make('button','cs-m6-arrow cs-m6-prev','‹');prev.type='button';
 prev.setAttribute('aria-label','Előző kép');
 const next=make('button','cs-m6-arrow cs-m6-next','›');next.type='button';
 next.setAttribute('aria-label','Következő kép');
 const caption=make('div','cs-m6-caption');
 const kicker=make('span','cs-m6-kicker');
 const captionTitle=make('strong','cs-m6-caption-title');
 const progress=make('span','cs-m6-counter');
 const detail=make('a','cs-m6-detail','A témakör megnyitása');
 const activeLine=make('span','cs-m6-progress-track');
 activeLine.setAttribute('aria-hidden','true');
 activeLine.append(make('span','cs-m6-progress-fill'));
 caption.append(kicker,captionTitle,progress,detail,activeLine);
 toolbar.append(prev,caption,next);
 const pause=make('button','cs-m6-pause');pause.type='button';
 pause.setAttribute('aria-pressed','false');toolbar.append(pause);
 const status=make('span','visually-hidden');
 status.setAttribute('role','status');status.setAttribute('aria-live','off');
 toolbar.append(status);
 landing.insertBefore(toolbar,copy);

 function renderMeta(announce=false){
  const entry=items[index];
  kicker.textContent=entry.eyebrow||'CSANÁDI · KÉPEK';
  captionTitle.textContent=entry.title||'Iskolai pillanatok';
  progress.textContent=`${String(index+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
  detail.href=safeRoute(entry.buttons?.[0]?.href||'#/');
  detail.setAttribute('aria-label',`${captionTitle.textContent} – a témakör megnyitása`);
  toolbar.style.setProperty('--cs-m6-progress',String((index+1)/items.length));
  status.setAttribute('aria-live',announce?'polite':'off');
  status.textContent=announce?`${index+1}. kép a(z) ${items.length} közül: ${captionTitle.textContent}`:'';
  prev.disabled=busy;next.disabled=busy;
  const isAutoAllowed=mobile.matches&&wide.matches&&!reduced.matches&&!saveData;
  pause.hidden=!isAutoAllowed;
  pause.setAttribute('aria-pressed',String(paused));
  pause.textContent=paused?'▶ Automatikus váltás indítása':'Ⅱ Automatikus váltás szüneteltetése';
  pause.setAttribute('aria-label',paused?'Automatikus képváltás indítása':'Automatikus képváltás szüneteltetése');
 }
 async function display(nextIndex,{announce=true}={}){
  if(busy||!mobile.matches||!figure.isConnected)return;
  const target=(nextIndex%items.length+items.length)%items.length;
  if(target===index)return;
  const entry=items[target];
  const incoming=createPicture(entry.mobileMediaId||entry.mediaId,{
   className:'cs42-mobile-picture cs-m6-incoming',eager:true,sizes:'(max-width: 768px) 100vw, 0px'
  });
  if(!incoming)return;
  const current=figure.querySelector('.cs42-mobile-picture:not(.cs-m6-incoming)');
  if(!current)return;
  busy=true;renderMeta(false);
  figure.insertBefore(incoming,gate);
  const image=incoming.querySelector('img');
  const loaded=await imageReady(image);
  if(!loaded||!figure.isConnected){incoming.remove();busy=false;renderMeta(false);return;}
  if(typeof image.decode==='function')await Promise.race([
   image.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,1500))
  ]);
  index=target;
  if(reduced.matches){
   current.remove();incoming.classList.remove('cs-m6-incoming');
   busy=false;renderMeta(announce);return;
  }
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   incoming.classList.add('cs-m6-show');current.classList.add('cs-m6-fade-out');
  }));
  transitionTimeout=setTimeout(()=>{
   current.remove();incoming.classList.remove('cs-m6-incoming','cs-m6-show');
   busy=false;renderMeta(announce);
  },430);
 }

 prev.addEventListener('click',()=>display(index-1));
 next.addEventListener('click',()=>display(index+1));
 pause.addEventListener('click',()=>{paused=!paused;renderMeta(false)});
 toolbar.addEventListener('focusin',()=>focused=true);
 toolbar.addEventListener('focusout',()=>{focused=toolbar.contains(document.activeElement)});
 figure.addEventListener('touchstart',event=>{
  if(event.touches.length!==1)return;
  swipe={x:event.touches[0].clientX,y:event.touches[0].clientY};
 },{passive:true});
 figure.addEventListener('touchend',event=>{
  if(!swipe||event.changedTouches.length!==1)return;
  const dx=event.changedTouches[0].clientX-swipe.x;
  const dy=event.changedTouches[0].clientY-swipe.y;swipe=null;
  if(Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.4)display(index+(dx<0?1:-1));
 },{passive:true});
 toolbar.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
   event.preventDefault();display(index+(event.key==='ArrowRight'?1:-1));
  }
 });

 function beginGate(){
  if(!mobile.matches||reduced.matches||saveData||document.hidden){gate.hidden=true;return;}
  try{if(sessionStorage.getItem('csanadi-m6-gate-played')==='1')return;}catch{}
  // Már a képbetöltés előtt a helyén van: a nyílás elején nincs villanó előtér.
  gate.hidden=false;
  imageReady(figure.querySelector('.cs42-mobile-picture img')).then(ready=>{
   if(!ready||!mobile.matches||!landing.isConnected||document.hidden){gate.hidden=true;return;}
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    gate.classList.add('cs-m6-open');
    try{sessionStorage.setItem('csanadi-m6-gate-played','1');}catch{}
    setTimeout(()=>{gate.hidden=true;},1550);
   }));
  });
 }
 if(mobile.matches)beginGate();
 mobile.addEventListener?.('change',event=>{if(event.matches)beginGate();renderMeta(false)});
 reduced.addEventListener?.('change',()=>{if(reduced.matches)gate.hidden=true;renderMeta(false)});
 wide.addEventListener?.('change',()=>renderMeta(false));

 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
  visible=entries.some(entry=>entry.isIntersecting);
 },{threshold:.12}):null;
 observer?.observe(landing);
 const delay=Math.max(7500,Math.min(12000,Number(intervalMs)||7500));
 const timer=setInterval(()=>{
  if(!landing.isConnected){clearInterval(timer);observer?.disconnect();clearTimeout(transitionTimeout);return;}
  if(busy||!mobileM6ShouldPlay({mobile:mobile.matches,wide:wide.matches,reduced:reduced.matches,
   saveData,visible,hidden:document.hidden,focused,paused,
   menuOpen:document.body.classList.contains('site-map-is-open')}))return;
  display(index+1,{announce:false});
 },delay);
 renderMeta(false);
 return {getIndex:()=>index,getCount:()=>items.length,next:()=>display(index+1),prev:()=>display(index-1)};
}
