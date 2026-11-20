/** M9/D – telefonos mozgás-/adatforgalom-kímélés és hozzáférhetőségi alap. */
export function mobileM9Profile({mobile=true,reduced=false,saveData=false,effectiveType='',
 deviceMemory=Infinity,hardwareConcurrency=Infinity}={}){
 const constrained=saveData||/^(?:slow-2g|2g)$/.test(effectiveType)||
  (Number.isFinite(deviceMemory)&&deviceMemory>0&&deviceMemory<=2)||
  (Number.isFinite(hardwareConcurrency)&&hardwareConcurrency>0&&hardwareConcurrency<=2);
 return {active:Boolean(mobile),constrained:Boolean(mobile&&constrained),
  quiet:Boolean(mobile&&(reduced||constrained))};
}

export function initMobileQualityM9(){
 const root=document.documentElement;
 if(root.dataset.m9Ready==='1')return;
 root.dataset.m9Ready='1';
 const mobile=matchMedia('(max-width: 768px)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const connection=navigator.connection;
 let scheduled=false;
 const profile=()=>mobileM9Profile({mobile:mobile.matches,reduced:reduced.matches,
  saveData:Boolean(connection?.saveData),effectiveType:connection?.effectiveType||'',
  deviceMemory:navigator.deviceMemory,hardwareConcurrency:navigator.hardwareConcurrency});
 function sync(){
  scheduled=false;
  const state=profile();
  for(const video of document.querySelectorAll('#app video[data-cs-m9-autoplay="1"]')){
   if(state.constrained)continue;
   video.autoplay=true;video.setAttribute('autoplay','');
   delete video.dataset.csM9Autoplay;
  }
  if(!state.active){
   root.removeAttribute('data-cs-mobile-motion');root.removeAttribute('data-cs-mobile-network');
   return;
  }
  root.dataset.csMobileMotion=state.quiet?'reduced':'normal';
  root.dataset.csMobileNetwork=state.constrained?'constrained':'normal';
  for(const img of document.querySelectorAll('#app img')){
   if(img.closest?.('.page-banner,.cs42-mobile-figure,.csn26-visual-row'))continue;
   if(img.getAttribute('loading')==='eager'||img.getAttribute('fetchpriority')==='high')continue;
   if(!img.hasAttribute('loading'))img.loading='lazy';
   if(!img.hasAttribute('decoding'))img.decoding='async';
  }
  if(state.constrained){
   for(const video of document.querySelectorAll('#app video[autoplay]')){
    video.dataset.csM9Autoplay='1';video.autoplay=false;video.removeAttribute('autoplay');
   }
  }
 }
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(sync)}};
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('orientationchange',schedule,{passive:true});
 document.addEventListener('csanadi:route-rendered',schedule);
 document.addEventListener('visibilitychange',()=>{
  if(mobile.matches&&document.hidden){
   for(const video of document.querySelectorAll('#app video')){
    if(!video.paused&&typeof video.pause==='function')video.pause();
   }
  }else schedule();
 });
 mobile.addEventListener?.('change',schedule);
 reduced.addEventListener?.('change',schedule);
 connection?.addEventListener?.('change',schedule);
 schedule();
 return {update:schedule,profile};
}
