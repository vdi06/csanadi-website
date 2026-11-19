/* Static-host compatible, nine-photo entrance. One source of timings: json/config.json.
   The same real-world doorway stays fixed while its two leaves swing inward. */
import {setting} from './site-settings-2026.js?v=1.42.18';
let active=false;
const tag=(type,cls='',text)=>{const node=document.createElement(type);node.className=cls;if(text!==undefined)node.textContent=text;return node;};
function dismissPrelude(){document.documentElement.classList.remove('cs-gate-pending');document.getElementById('cs-gate-prelude')?.remove();}
export function showGateEntrance(){
 if(active){dismissPrelude();return;}
 active=true;
 const settings=setting('runtime.entrance');
 const mobile=window.innerWidth<=settings.mobileBreakpointPx;
 const duration=mobile?settings.durationMobileMs:settings.durationDesktopMs;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const file=(index,small=mobile)=>settings.imageDirectory+'/'+settings.framePrefix+String(index).padStart(2,'0')+(small?settings.mobileSuffix:'')+settings.extension;
 const resources=Array.from({length:settings.frameCount},(_,i)=>file(i));
 const wrapper=tag('div','gate26 gate26--frames');wrapper.id='gate26';wrapper.style.setProperty('--gate26-duration',duration+'ms');
 wrapper.setAttribute('role','dialog');wrapper.setAttribute('aria-modal','true');wrapper.setAttribute('aria-labelledby','gate26-title');
 // Keep all nine frames mounted and decoded: replacing one img.src during playback
 // can briefly paint an empty image and create the reported flashing effect.
 const frames=resources.map((src,index)=>{
  const frame=tag('img','gate26-frame'+(index===0?' is-current':''));
  frame.src=src;frame.alt='';frame.draggable=false;frame.decoding='async';frame.loading='eager';
  frame.fetchPriority=index===0?'high':'auto';frame.setAttribute('aria-hidden','true');
  return frame;
 });
 // The original school crest sits over the curved glass above the green door.
 // Keep it decorative for now; the same anchor can later become the menu trigger.
 const glassCrest=tag('div','gate26-glass-crest');glassCrest.setAttribute('aria-hidden','true');
 const glassLogo=tag('img','gate26-glass-crest-image');
 glassLogo.src='assets/media/logo/csanadi-crest-512.webp';glassLogo.alt='';
 glassLogo.width=512;glassLogo.height=512;glassLogo.draggable=false;
 glassCrest.append(glassLogo);
 const hit=tag('button','gate26-door-hitbox');hit.type='button';hit.title='A kapu kinyitása';hit.setAttribute('aria-label','A zöld iskolakapu kinyitása');
 // SVG follows the curved door silhouette; there is no rectangular overlay.
 hit.innerHTML='<svg class="gate26-door-outline" viewBox="0 0 280 520" preserveAspectRatio="none" aria-hidden="true"><path class="gate26-door-contour" d="M 6 78 C 37 48 76 17 140 12 C 204 17 243 48 274 78 L 274 510 Q 274 514 269 514 L 11 514 Q 6 514 6 510 Z"/><path class="gate26-door-seam" d="M 140 12 L 140 513"/></svg>';
 const bottom=tag('div','gate26-skip-bar');const title=tag('h2','gate26-school-name','CSANÁDI ÁRPÁD SPORTISKOLA, ÁLTALÁNOS ISKOLA ÉS GIMNÁZIUM');title.id='gate26-title';
 const copy=tag('div','gate26-bottom-copy');copy.append(title);
 const skip=tag('button','gate26-skip','⏭');skip.type='button';skip.title='Belépőanimáció kihagyása';skip.setAttribute('aria-label','Belépőanimáció kihagyása');
 bottom.append(copy,skip);wrapper.append(...frames,glassCrest,hit,bottom);document.body.append(wrapper);dismissPrelude();
 const previous=document.activeElement;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
 let finished=false,playing=false,raf=0,fade=0,lastFrame=0,displayedFrame=0;
 const available=Array(frames.length).fill(false);
 const decoded=frames.map(async(frame,index)=>{
  try{await frame.decode();available[index]=true;return;}
  catch{
   // Desktop retains the existing mobile-image fallback on a failed frame.
   if(!mobile){frame.src=file(index,true);try{await frame.decode();available[index]=true;return;}catch{}}
  }
  console.warn('[Csanádi kapu] Nem tölthető be a képkocka:',index);
 });
 function showFrame(index){
  let next=available[index]?index:-1;
  for(let i=index-1;next<0&&i>=0;i--)if(available[i])next=i;
  if(next<0)next=available.findIndex(Boolean);
  if(next<0||next===displayedFrame)return;
  frames[displayedFrame].classList.remove('is-current');
  frames[next].classList.add('is-current');displayedFrame=next;
 }
 function clean(){if(!wrapper.isConnected)return;wrapper.remove();document.body.style.overflow=overflow;active=false;const focus=(previous?.isConnected?previous:document.getElementById('mobile-menu-toggle'));focus?.focus?.({preventScroll:true});}
 function finish(){if(finished)return;finished=true;cancelAnimationFrame(raf);clearTimeout(fade);wrapper.classList.add('gate26-finished');fade=setTimeout(clean,reduce?0:settings.finishFadeMs);}
 function step(now,start){
  if(finished||!wrapper.isConnected)return;
  const elapsed=Math.max(0,now-start);
  // Nine *distinct source pictures*, not nine CSS transformations of three images.
  const index=Math.min(resources.length-1,Math.floor(elapsed/duration*resources.length));
  if(index!==lastFrame){lastFrame=index;showFrame(index);}
  if(elapsed>=duration){showFrame(resources.length-1);fade=setTimeout(finish,80);return;}
  raf=requestAnimationFrame(time=>step(time,start));
 }
 function open(){
  if(finished||playing)return;playing=true;
  hit.remove(); // Prevent any lingering outline or animation-driven position jump.
  skip.focus({preventScroll:true});
  if(reduce){finish();return;}
  // Start only after decoding, otherwise the next frame could appear blank.
  Promise.all(decoded).then(()=>{
   if(finished||!wrapper.isConnected)return;
   if(!available.some(Boolean)){finish();return;}
   showFrame(0);wrapper.classList.add('gate26-open');
   const start=performance.now();raf=requestAnimationFrame(time=>step(time,start));
  });
 }
 hit.addEventListener('click',open);skip.addEventListener('click',finish);
 wrapper.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();finish();}
  if(event.key==='Enter'&&document.activeElement===hit){event.preventDefault();open();}
  if(event.key==='Tab'){
   const list=playing?[skip]:[hit,skip];const index=list.indexOf(document.activeElement);
   if(index>=0){event.preventDefault();list[(index+(event.shiftKey?-1:1)+list.length)%list.length].focus();}
  }
 });
 hit.focus({preventScroll:true});
}
