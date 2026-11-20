/** M4/D – stabil telefonos görgetés. Nem ad hozzá második menügombot. */
export const MOBILE_M4_QUERY='(max-width: 768px), (max-width: 960px) and (max-height: 500px) and (pointer: coarse)';

export function calculateMobileScrollState({scrollY=0,scrollHeight=0,viewportHeight=0,headerHeight=0}){
 const y=Number.isFinite(scrollY)?Math.max(0,scrollY):0;
 const max=Math.max(0,(Number.isFinite(scrollHeight)?scrollHeight:0)-(Number.isFinite(viewportHeight)?viewportHeight:0));
 const ratio=max>0?Math.min(1,y/max):0;
 return {scrolled:y>24,progress:ratio,headerHeight:Math.max(0,Math.min(260,Math.ceil(headerHeight)||0))};
}

export function initMobileScrollM4(){
 const header=document.getElementById('site-header');
 if(!header||header.dataset.m4Ready==='1')return;
 header.dataset.m4Ready='1';
 const indicator=document.createElement('div');indicator.className='cs-m4-progress';
 indicator.setAttribute('aria-hidden','true');
 const fill=document.createElement('span');fill.className='cs-m4-progress-fill';
 indicator.append(fill);header.append(indicator);
 const mq=window.matchMedia(MOBILE_M4_QUERY);
 let pending=false;

 const sync=()=>{
  pending=false;
  const mobile=mq.matches;
  indicator.hidden=!mobile;
  if(!mobile){
   header.removeAttribute('data-m4-scroll');
   document.documentElement.style.removeProperty('--cs-m4-header-px');
   header.style.removeProperty('--cs-m4-progress');
   return;
  }
  const scroller=document.scrollingElement||document.documentElement;
  const height=window.visualViewport?.height||window.innerHeight||0;
  const state=calculateMobileScrollState({
   scrollY:window.scrollY,scrollHeight:scroller.scrollHeight,
   viewportHeight:height,headerHeight:header.getBoundingClientRect().height
  });
  header.dataset.m4Scroll=state.scrolled?'scrolled':'top';
  document.documentElement.style.setProperty('--cs-m4-header-px',`${state.headerHeight+14}px`);
  header.style.setProperty('--cs-m4-progress',state.progress.toFixed(4));
 };
 const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(sync);}};
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('orientationchange',schedule,{passive:true});
 window.visualViewport?.addEventListener?.('resize',schedule,{passive:true});
 document.addEventListener('csanadi:route-rendered',schedule);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
 if(mq.addEventListener)mq.addEventListener('change',schedule);
 else mq.addListener?.(schedule);
 if('ResizeObserver' in window)new ResizeObserver(schedule).observe(header);
 schedule();
}
