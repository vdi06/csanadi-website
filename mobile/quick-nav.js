/** One mobile navigation trigger in the common header, without a footer navigation bar. */
export function initMobileQuickNav(){
 document.getElementById('ext26-mobile-nav')?.remove();
 const trigger=document.getElementById('mobile-menu-toggle');
 const shell=document.getElementById('cs39-home-shell');
 if(!trigger)return;
 trigger.hidden=false;
 trigger.setAttribute('aria-label','Navigátor és főmenü megnyitása');
 const mobile=matchMedia('(max-width: 768px)');
 const sync=()=>{
  const active=mobile.matches;
  for(const [prop,value] of [['display','grid'],['visibility','visible'],['pointer-events','auto']]){
   if(active)trigger.style.setProperty(prop,value,'important');
   else trigger.style.removeProperty(prop);
  }
  if(shell){
   for(const prop of ['position','top','z-index'])shell.style.removeProperty(prop);
   if(active && document.body.classList.contains('cs-home-header')){
    shell.style.setProperty('position','sticky','important');
    shell.style.setProperty('top','0px','important');
    shell.style.setProperty('z-index','950','important');
   }
  }
 };
 mobile.addEventListener('change',sync);
 document.addEventListener('csanadi:route-rendered',sync);
 sync();
}
