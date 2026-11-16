/* v1.38.2 – Könnyű, SVG/CSS-alapú asztali aloldali sportmozdulatok.
   Nincs videó, külső szolgáltatás, szövegbe ágyazott felhasználói HTML vagy időzítő. */
const RUNNER=`
 <g class="cs-mini-runner">
  <circle class="cs-mini-head" cx="39" cy="16" r="6.5" fill="#f8d899"/>
  <path class="cs-mini-hair" d="M34 13q4-9 11-2" fill="none" stroke="#122a47" stroke-width="3" stroke-linecap="round"/>
  <path d="M39 24L45 39" stroke="#83c9ee" stroke-width="7" stroke-linecap="round"/>
  <path class="cs-mini-arm-a" d="M40 26l12 4 7-7" stroke="#f8d899" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path class="cs-mini-arm-b" d="M40 26l-9 10-6-2" stroke="#f8d899" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path class="cs-mini-leg-a" d="M45 39l11 10 9-1" stroke="#e9f3ff" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path class="cs-mini-leg-b" d="M45 39l-8 13-9 5" stroke="#e9f3ff" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M59 47l8 2M27 57l-5 2" stroke="#e4b557" stroke-width="4" stroke-linecap="round"/>
 </g>`;

// A jelenetek kizárólag előre regisztrált, helyi SVG-rajzelemekből épülnek.
const PROPS=Object.freeze({
 dribble:`<circle class="cs-mini-ball" cx="77" cy="47" r="8" fill="#e8ad50" stroke="#fff0c4" stroke-width="2"/><path class="cs-mini-ball" d="M70 44l13 5m-6-10v16" stroke="#5c371a" stroke-width="1.3"/>`,
 bookjump:`<g class="cs-mini-book"><path d="M76 52l12-5 12 5-12 5z" fill="#f0bf63" stroke="#f8e7b3" stroke-width="1.5"/><path d="M88 47v10" stroke="#b18137" stroke-width="2"/></g>`,
 hurdle:`<g class="cs-mini-hurdle"><path d="M76 56V39h24v17" fill="none" stroke="#e5bf73" stroke-width="3"/><path d="M76 41h24" stroke="#fff2d6" stroke-width="3"/></g>`,
 sprint:`<g class="cs-mini-finish"><path d="M93 12v45" stroke="#f2d793" stroke-width="2.5"/><path d="M94 13h17l-5 9 5 8H94z" fill="#ecbc62"/><path d="M94 13l17 17m0-17L94 30" stroke="#34506a" stroke-width="1"/></g>`,
 relay:`<g class="cs-mini-relay"><path d="M74 37l21-12" stroke="#f6ca66" stroke-width="6" stroke-linecap="round"/><path d="M80 29l-5 10m24-20l-4 11" stroke="#f8e9b8" stroke-width="2"/></g>`,
 medal:`<g class="cs-mini-medal"><path d="M87 20l-6-10m6 10l6-10" stroke="#8cc9e9" stroke-width="3"/><circle cx="87" cy="29" r="11" fill="#f2c35b" stroke="#fff0bf" stroke-width="2"/><path d="M87 23l2 4 5 .8-3.6 3.5.9 5-4.3-2.3-4.4 2.3.9-5-3.6-3.5 5-.8z" fill="#a46e28"/></g>`,
 goal:`<g class="cs-mini-goal"><path d="M89 57V23h26v34" fill="none" stroke="#e3d2aa" stroke-width="3"/><path d="M89 31h26m-26 9h26m-26 9h26M98 23v34m8-34v34" stroke="#9eacc5" stroke-width="1"/></g><circle class="cs-mini-kickball" cx="70" cy="51" r="6.5" fill="#fff3e1" stroke="#afc8d1" stroke-width="1.5"/><path class="cs-mini-kickball" d="M70 47l3 3-2 4-4-1-1-4z" fill="#28415b"/>`,
 news:`<g class="cs-mini-news"><rect x="80" y="24" width="27" height="28" rx="2" fill="#fff0ca" stroke="#efc577" stroke-width="2"/><path d="M84 29h19m-19 5h19m-19 6h10m-10 4h19" stroke="#30516d" stroke-width="2"/></g>`,
 calendar:`<g class="cs-mini-calendar"><rect x="79" y="24" width="28" height="27" rx="4" fill="#fff1c6"/><path d="M79 32h28M86 22v8m14-8v8" stroke="#e5b152" stroke-width="3"/><path d="M87 39h5m4 0h5M87 45h5m4 0h5" stroke="#32516f" stroke-width="2"/></g>`,
 document:`<g class="cs-mini-news"><path d="M81 20h18l7 7v28H81z" fill="#fdf0d6" stroke="#eabb65" stroke-width="2"/><path d="M99 20v8h7M86 36h15m-15 5h15m-15 5h10" fill="none" stroke="#274968" stroke-width="2"/></g>`,
 digital:`<g class="cs-mini-pixels"><rect x="78" y="40" width="11" height="11" rx="2" fill="#5abecf"/><rect x="93" y="31" width="11" height="11" rx="2" fill="#edc471"/><rect x="103" y="44" width="8" height="8" rx="1" fill="#d3e5ef"/></g>`,
 eco:`<g class="cs-mini-leaf"><path d="M80 51q-2-27 27-30 1 27-27 30z" fill="#9bcf91" stroke="#e4f0a3" stroke-width="2"/><path d="M80 51l25-28" stroke="#346b52" stroke-width="2"/></g>`,
 whistle:`<g class="cs-mini-whistle"><circle cx="93" cy="36" r="12" fill="#f1c96b"/><circle cx="95" cy="36" r="5" fill="#163755"/><rect x="76" y="29" width="12" height="10" rx="2" fill="#cfe5f0"/><path d="M105 31l8-8m-4 13h9" stroke="#fff1c9" stroke-width="2"/></g>`,
 contact:`<g class="cs-mini-bubble"><path d="M79 22h28q5 0 5 5v15q0 5-5 5H95l-8 7v-7h-8q-5 0-5-5V27q0-5 5-5z" fill="#fff0c6" stroke="#edbf69" stroke-width="1.5"/><circle cx="85" cy="34" r="2" fill="#274d69"/><circle cx="93" cy="34" r="2" fill="#274d69"/><circle cx="101" cy="34" r="2" fill="#274d69"/></g>`
});

const miniSvg=scene=>`<svg viewBox="0 0 126 68" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
 <path d="M5 60H121" stroke="#6382a3" stroke-width="2" stroke-linecap="round"/>
 <path class="cs-mini-speed" d="M1 25h17m-11 8h11M2 40h16" fill="none" stroke="#f4d78f" stroke-width="2" stroke-linecap="round" opacity=".72"/>
 ${RUNNER}${PROPS[scene]}</svg>`;

export const availableHeaderScenes=Object.freeze(Object.keys(PROPS));

export function createSubpageHeaderMotion(brandRow){
 if(!brandRow)return {render:()=>{},sync:()=>{}};
 const region=document.createElement('aside');
 region.className='cs-subpage-motion';
 region.setAttribute('aria-label','Az aloldalhoz kapcsolódó játékos sportanimáció');
 region.hidden=true;
 const scene=document.createElement('span');scene.className='cs-mini-scene';scene.setAttribute('aria-hidden','true');
 const copy=document.createElement('span');copy.className='cs-subpage-motion-copy';
 const kicker=document.createElement('span');kicker.className='cs-subpage-motion-kicker';
 const caption=document.createElement('span');caption.className='cs-subpage-motion-caption';
 copy.append(kicker,caption);
 const pause=document.createElement('button');pause.className='cs-subpage-motion-pause';pause.type='button';
 pause.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="cs-mini-pause-icon" d="M7 5v14M17 5v14"/><path class="cs-mini-play-icon" d="m8 5 11 7-11 7z"/></svg>';
 region.append(scene,copy,pause);
 brandRow.prepend(region);
 const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
 let userPaused=false,autoplay=true;
 const sync=()=>{
  const stopped=userPaused||!autoplay||motionPreference.matches||document.hidden||
   document.body.classList.contains('cs-header-condensed');
  region.classList.toggle('is-paused',stopped);
  pause.classList.toggle('is-resumable',userPaused);
  pause.hidden=!autoplay||motionPreference.matches;
  pause.title=userPaused?'Animáció folytatása':'Animáció szüneteltetése';
  pause.setAttribute('aria-label',userPaused?'Animáció folytatása':'Animáció szüneteltetése');
  pause.setAttribute('aria-pressed',String(userPaused));
 };
 pause.addEventListener('click',()=>{userPaused=!userPaused;sync();});
 document.addEventListener('visibilitychange',sync);
 motionPreference.addEventListener('change',sync);
 const render=payload=>{
  if(!payload){region.hidden=true;scene.replaceChildren();return;}
  const name=Object.hasOwn(PROPS,payload.scene)?payload.scene:'dribble';
  region.dataset.scene=name;
  scene.innerHTML=miniSvg(name);
  kicker.textContent=String(payload.label||'CSANÁDI').slice(0,45);
  caption.textContent=String(payload.caption||'Sport és tanulás').slice(0,95);
  autoplay=payload.autoplay!==false;
  region.hidden=false;
  sync();
 };
 return {render,sync};
}
