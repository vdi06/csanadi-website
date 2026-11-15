import {createPicture} from './media.js?v=20261114v5';
import {settingNumber,isWithinConfiguredWindow} from './site-settings-2026.js';
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
const safeRoute=value=>typeof value==='string'&&/^#\/[a-z0-9/\-]*$/i.test(value)?value:'#/';
export function renderPremiumHero(block){
 if(!isWithinConfiguredWindow('runtime.hero'))return null;
 const data=block.data||{};
 const slides=(Array.isArray(data.slides)&&data.slides.length?data.slides:[data]).filter(slide=>slide&&typeof slide.mediaId==='string').slice(0,settingNumber('runtime.hero.maxSlides'));
 if(!slides.length)return null;
 const section=el('section','csn26-visual-map');section.setAttribute('aria-label','Képes oldaltérkép és központi körmenü');
 const heading=el('div','csn26-visual-heading');heading.append(el('span','csn26-visual-kicker','SPORT · TUDÁS · KÖZÖSSÉG'),el('h1','','Fedezd fel a Csanádi Sportiskolát'),el('p','','A két kép együtt lapozható. Érintsd meg a tartalmat, vagy nyisd meg a középső körmenüt.'));
 const row=el('div','csn26-visual-row');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const pairCount=Math.ceil(slides.length/2);
 const wingStates=[];
 let pairIndex=0,hovered=false,focused=false,startX=null;
 function showPair(index){
  pairIndex=(index+pairCount)%pairCount;
  for(const wing of wingStates){
   const slide=slides[(pairIndex*2+(wing.side==='right'?1:0))%slides.length];
   const picture=createPicture(slide.mediaId,{className:'csn26-wing-picture',eager:pairIndex===0,sizes:'(max-width:768px) 100vw, 50vw'});
   wing.pictureMount.replaceChildren(...(picture?[picture]:[]));
   wing.overline.textContent=slide.eyebrow||'CSANÁDI SPORTISKOLA';wing.title.textContent=slide.title||'Iskolai pillanatok';wing.summary.textContent=slide.subtitle||'Fedezd fel iskolánk világát.';
   wing.surface.href=safeRoute(slide.buttons?.[0]?.href||(wing.side==='left'?'#/sport':'#/iskolank'));
   wing.surface.setAttribute('aria-label',`${(pairIndex*2+(wing.side==='right'?1:0))%slides.length+1}. képes tartalom: ${slide.title||'Iskolai pillanatok'} – megnyitás`);
   wing.element.dataset.slide=String(pairIndex+1);
  }
  if(selector)selector.value=String(pairIndex);
  if(status)status.textContent=`${pairIndex+1}. képpár a(z) ${pairCount} közül`;
 }
 const buildWing=side=>{
  const wing=el('section','csn26-visual-wing csn26-visual-wing--'+side);
  wing.setAttribute('aria-label',side==='left'?'Bal oldali, mobilon felső képes tartalom':'Jobb oldali, mobilon alsó képes tartalom');
  const surface=el('a','csn26-wing-surface csn26-wing-target');const copy=el('div','csn26-wing-copy');
  const overline=el('span','csn26-wing-kicker');const title=el('h2','csn26-wing-title');const summary=el('p','csn26-wing-summary');
  copy.append(overline,title,summary);
  const pictureMount=el('div','csn26-wing-photo');surface.append(pictureMount,el('div','csn26-wing-shade'),copy);
  const arrow=el('button','csn26-edge-arrow csn26-edge-arrow--'+side,side==='left'?'‹':'›');arrow.type='button';arrow.setAttribute('aria-label',side==='left'?'Előző képpár, telefonon felül':'Következő képpár, telefonon alul');arrow.addEventListener('click',()=>showPair(pairIndex+(side==='left'?-1:1)));
  wing.append(surface,arrow);
  surface.addEventListener('touchstart',event=>{if(event.touches.length===1)startX=event.touches[0].clientX;},{passive:true});
  surface.addEventListener('touchend',event=>{if(startX===null||!event.changedTouches.length)return;const delta=event.changedTouches[0].clientX-startX;startX=null;if(Math.abs(delta)>settingNumber('runtime.hero.swipeThresholdPx')){event.preventDefault();showPair(pairIndex+(delta<0?1:-1));}},{passive:false});
  wing.addEventListener('keydown',event=>{if(event.target.matches('input,textarea,select'))return;if(event.key==='ArrowLeft'||event.key==='ArrowUp'){event.preventDefault();showPair(pairIndex-1);}if(event.key==='ArrowRight'||event.key==='ArrowDown'){event.preventDefault();showPair(pairIndex+1);}});
  wingStates.push({element:wing,side,surface,pictureMount,overline,title,summary});
  return wing;
 };
 row.append(buildWing('left'),buildWing('right'));
 const selector=el('select','csn26-pair-picker');selector.setAttribute('aria-label','Megjelenített képpár kiválasztása');
 for(let i=0;i<pairCount;i++){const option=el('option','',`${i+1} / ${pairCount}`);option.value=String(i);selector.append(option);}
 selector.addEventListener('change',()=>showPair(Number(selector.value)));
 const status=el('span','csn26-pair-status visually-hidden');status.setAttribute('aria-live','polite');
 row.append(selector,status);showPair(0);
 row.addEventListener('mouseenter',()=>hovered=true);row.addEventListener('mouseleave',()=>hovered=false);
 row.addEventListener('focusin',()=>focused=true);row.addEventListener('focusout',()=>{focused=row.contains(document.activeElement);});
 const delay=Math.max(settingNumber('runtime.hero.rotationMinimumMs'),Math.min(settingNumber('runtime.hero.rotationMaximumMs'),Number(data.intervalMs)||settingNumber('runtime.hero.rotationDefaultMs')));
 const timer=setInterval(()=>{if(!row.isConnected){clearInterval(timer);return;}if(document.hidden||reduced.matches||hovered||focused||document.body.classList.contains('site-map-is-open'))return;showPair(pairIndex+1);},delay);
 const launcher=document.querySelector('body > .orbit-launch');
 if(launcher){
  launcher.classList.add('csn26-visual-launch');
  const button=launcher.querySelector('#orbit-open');
  if(button){
   button.replaceChildren();
   const logo=el('img','csn26-visual-logo');logo.src='assets/media/logo/csanadi-cimer-512.webp';logo.alt='';logo.width=118;logo.height=118;
   button.append(logo,el('span','csn26-visual-button-label','Oldaltérkép'));
   button.setAttribute('title','Körmenü megnyitása');button.setAttribute('aria-label','Csanádi körmenü megnyitása');
   button.setAttribute('aria-expanded','false');
  }
  row.append(launcher);
 }
 section.append(heading,row);
 return section;
}
