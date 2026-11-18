import {createPicture,mediaItem} from './media.js?v=1.40.0';
import {settingNumber,isWithinConfiguredWindow} from './site-settings-2026.js';
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
const safeRoute=value=>typeof value==='string'&&/^#\/[a-z0-9/\-]*$/i.test(value)?value:'#/';
export function renderPremiumHero(block){
 if(!isWithinConfiguredWindow('runtime.hero'))return null;
 const data=block.data||{};
 const slides=(Array.isArray(data.slides)&&data.slides.length?data.slides:[data]).filter(slide=>slide&&typeof slide.mediaId==='string').slice(0,settingNumber('runtime.hero.maxSlides'));
 if(!slides.length)return null;
 const section=el('section','csn26-visual-map');section.setAttribute('aria-label','Képes kezdőlap és főmenü');
 const row=el('div','csn26-visual-row csn26-single-image');row.id='csn26-visual-carousel';
 row.setAttribute('role','group');
 row.setAttribute('aria-roledescription','képes tartalomváltó');
 const instructions=el('p','visually-hidden','A képek hivatkozások. A nyílgombokkal vagy a bal és jobb nyílbillentyűvel válthatsz közöttük.');
 instructions.id='csn26-carousel-help';row.setAttribute('aria-describedby',instructions.id);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const wingStates=[];
 let activeIndex=0,changeToken=0,hovered=false,focused=false,visible=true,startX=null;
 // A 30 képből kizárólag a következő mérethelyes állományt készítjük elő.
 // Lassú / adatkorlátos kapcsolaton nincs előtöltés; egy dia sem kér le 30 képet.
 const prepared=new Set();
 function prepareNext(index){
  if(slides.length<2||reduced.matches||document.hidden||navigator.connection?.saveData||/2g/.test(navigator.connection?.effectiveType||''))return;
  const next=(index+1)%slides.length;if(prepared.has(next))return;
  const entry=mediaItem((innerWidth<=768&&slides[next].mobileMediaId)||slides[next].mediaId);
  if(!entry)return;
  const variants=Array.isArray(entry.variants)?entry.variants.filter(v=>v.mimeType==='image/webp'&&v.path):[];
  const needed=Math.max(320,innerWidth*(Math.min(devicePixelRatio||1,2)));
  const source=variants.sort((a,b)=>a.width-b.width).find(v=>v.width>=needed)||variants.at(-1)||entry.original;
  if(!source?.path)return;
  prepared.add(next);
  const preload=new Image();preload.decoding='async';preload.fetchPriority='low';preload.src=source.path;
  preload.addEventListener('error',()=>prepared.delete(next),{once:true});
  // A böngésző gyorsítótára őrzi a kész állományt, nem tartunk 30 DOM-képet.
 }
 function queuePreparation(index){
  if('requestIdleCallback'in window)requestIdleCallback(()=>{if(row.isConnected)prepareNext(index);},{timeout:1600});
  else setTimeout(()=>{if(row.isConnected)prepareNext(index);},300);
 }
 function showSlide(index,announce=false){
  const nextIndex=(index%slides.length+slides.length)%slides.length;
  const slide=slides[nextIndex],wing=wingStates[0],token=++changeToken;
  const entry=mediaItem(slide.mediaId);
  // A generált és még nem igazolt képek nem tüntethetők fel valódi iskolai fotóként.
  const illustration=!entry||entry.rights?.clearance!=='approved';
  let picture=wing.cache.get(nextIndex);
  if(!picture){
   picture=createPicture(slide.mediaId,{className:'csn26-wing-picture',eager:true,sizes:'100vw',mobileId:slide.mobileMediaId});
   if(picture){wing.cache.set(nextIndex,picture);if(wing.cache.size>settingNumber('runtime.hero.pictureCacheEntries')){
    const oldest=wing.cache.keys().next().value;
    if(oldest!==nextIndex)wing.cache.delete(oldest);
   }}
  }
  const commit=()=>{
   if(token!==changeToken)return;
   activeIndex=nextIndex;
   wing.pictureMount.replaceChildren(...(picture?[picture]:[]));
   if(picture)picture.style.visibility='';
   wing.overline.textContent=slide.eyebrow||'CSANÁDI SPORTISKOLA';wing.title.textContent=slide.title||'Iskolai pillanatok';wing.summary.textContent=slide.subtitle||'Fedezd fel iskolánk világát.';
   wing.rightOverline.textContent=slide.rightEyebrow||'CSANÁDI · LEHETŐSÉGEK';wing.rightTitle.textContent=slide.rightTitle||'Találj rá a saját utadra';wing.rightSummary.textContent=slide.rightSubtitle||'Élmények, közösség és fejlődés.';
   wing.disclaimer.hidden=!illustration;
   wing.surface.href=safeRoute(slide.buttons?.[0]?.href||'#/iskolank');
   wing.surface.setAttribute('aria-label',`${activeIndex+1}. képes tartalom a(z) ${slides.length} közül: ${slide.title||'Iskolai pillanatok'}${illustration?' – illusztráció, nem igazolt intézményi eseményfotó':''} – megnyitás`);
   wing.element.dataset.slide=String(activeIndex+1);
   if(status){status.setAttribute('aria-live',announce?'polite':'off');status.textContent=`${activeIndex+1}. képes tartalom a(z) ${slides.length} közül`;}
   queuePreparation(activeIndex);
  };
  const image=picture?.querySelector('img');
  if(image?.complete&&image.naturalWidth===0){console.warn('[Csanádi hero] Nem sikerült betölteni a képet:',slide.mediaId);return;}
  if(image&&!image.complete){
   picture.style.visibility='hidden';
   wing.pictureMount.append(picture);
   image.addEventListener('load',commit,{once:true});
   image.addEventListener('error',()=>{picture.remove();console.warn('[Csanádi hero] Képbetöltési hiba:',slide.mediaId);},{once:true});
  }else commit();
 }
 const buildWing=()=>{
  const wing=el('section','csn26-visual-wing csn26-visual-wing--left');
  wing.setAttribute('aria-label','Teljes szélességű, váltakozó képes tartalom');
  const surface=el('a','csn26-wing-surface csn26-wing-target');const copy=el('div','csn26-wing-copy csn26-wing-copy--left');
  const overline=el('span','csn26-wing-kicker');const title=el('h2','csn26-wing-title');const summary=el('p','csn26-wing-summary');
  copy.append(overline,title,summary);
  const rightCopy=el('div','csn26-wing-copy csn26-wing-copy--right');
  const rightOverline=el('span','csn26-wing-kicker');const rightTitle=el('h3','csn26-wing-title');const rightSummary=el('p','csn26-wing-summary');
  rightCopy.append(rightOverline,rightTitle,rightSummary);
  const disclaimer=el('span','cs1404-hero-disclaimer','Illusztráció · nem hitelesített iskolai fotó');disclaimer.setAttribute('aria-hidden','true');
  const pictureMount=el('div','csn26-wing-photo');surface.append(pictureMount,el('div','csn26-wing-shade'),copy,rightCopy,disclaimer);
  wing.append(surface);
  surface.addEventListener('touchstart',event=>{if(event.touches.length===1)startX=event.touches[0].clientX;},{passive:true});
  surface.addEventListener('touchend',event=>{if(startX===null||!event.changedTouches.length)return;const delta=event.changedTouches[0].clientX-startX;startX=null;if(Math.abs(delta)>settingNumber('runtime.hero.swipeThresholdPx')){event.preventDefault();showSlide(activeIndex+(delta<0?1:-1),true);}},{passive:false});
  wing.addEventListener('keydown',event=>{if(event.target.matches('input,textarea,select'))return;if(event.key==='ArrowLeft'||event.key==='ArrowUp'){event.preventDefault();showSlide(activeIndex-1,true);}if(event.key==='ArrowRight'||event.key==='ArrowDown'){event.preventDefault();showSlide(activeIndex+1,true);}});
  wingStates.push({element:wing,surface,pictureMount,disclaimer,overline,title,summary,rightOverline,rightTitle,rightSummary,cache:new Map()});
  return wing;
 };
 row.append(buildWing());
 const makeArrow=side=>{
  const arrow=el('button','csn26-edge-arrow csn26-edge-arrow--'+side,side==='left'?'‹':'›');arrow.type='button';
  arrow.setAttribute('aria-label',side==='left'?'Előző képes tartalom':'Következő képes tartalom');
  arrow.setAttribute('aria-controls',row.id);
  arrow.addEventListener('click',()=>showSlide(activeIndex+(side==='left'?-1:1),true));return arrow;
 };
 const status=el('span','csn26-pair-status visually-hidden');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
 row.append(makeArrow('left'),makeArrow('right'),instructions,status);showSlide(0);
 row.addEventListener('mouseenter',()=>hovered=true);row.addEventListener('mouseleave',()=>hovered=false);
 row.addEventListener('focusin',()=>focused=true);row.addEventListener('focusout',()=>{focused=row.contains(document.activeElement);});
 const delay=Math.max(settingNumber('runtime.hero.rotationMinimumMs'),Math.min(settingNumber('runtime.hero.rotationMaximumMs'),Number(data.intervalMs)||settingNumber('runtime.hero.rotationDefaultMs')));
 const observer=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);},{threshold:0.05}):null;
 if(observer)observer.observe(row);
 const timer=setInterval(()=>{if(!row.isConnected){clearInterval(timer);observer?.disconnect();return;}if(document.hidden||!visible||reduced.matches||hovered||focused||document.body.classList.contains('site-map-is-open'))return;showSlide(activeIndex+1);},delay);
 const launcher=document.querySelector('body > .orbit-launch');
 if(launcher){
  launcher.classList.add('csn26-visual-launch');
  const button=launcher.querySelector('#orbit-open');
  if(button){
   button.replaceChildren();
   const logo=el('img','csn26-visual-logo');logo.src='assets/media/logo/csanadi-cimer-512.webp';logo.alt='';logo.width=118;logo.height=118;
   button.append(logo);
   button.setAttribute('title','Főmenü');button.setAttribute('aria-label','Főmenü megnyitása');
   button.setAttribute('aria-expanded','false');
  }
  const home=el('a','csn26-visual-home');home.href='#/';home.setAttribute('aria-label','Vissza a kezdőlapra');home.title='Kezdőlap';home.append(el('span','','⌂'));
  launcher.append(home);
  row.append(launcher);
 }
 // v1.41: a címeres főmenü minden képes dián ugyanazon a helyen marad.
 // A szöveges arculati réteg és a mobil gyorselérés külön helyet kap, ezért
 // a képre illesztett szöveg nem csúszhat össze a képi tartalommal.
 section.classList.add('cs41-home-hero');
 const identity=el('div','cs41-hero-identity');
 identity.setAttribute('aria-hidden','true');
 identity.append(el('span','cs41-hero-brand','CSANÁDI'),el('span','cs41-hero-brand-sub','SPORTISKOLA'));
 const statement=el('div','cs41-hero-statement');
 statement.append(el('p','cs41-hero-name','CSANÁDI SPORTISKOLA'),el('p','cs41-hero-motto','Sport · Tanulás · Közösség'));
 const routes=el('nav','cs41-mobile-routes');routes.setAttribute('aria-label','Kezdőoldali tematikus gyorselérés');
 for(const [label,href,symbol] of [['Sport','#/sport','›'],['Tanulás','#/oktatas','›'],['Közösség','#/iskolank','›']]){
  const link=el('a','cs41-route');link.href=href;
  link.append(el('span','',label),el('span','cs41-route-symbol',symbol));routes.append(link);
 }
 const scrollCue=el('button','cs41-scroll-cue','⌄');scrollCue.type='button';
 scrollCue.setAttribute('aria-label','Ugrás a diákjaink sportsikerei szakaszhoz');
 scrollCue.addEventListener('click',()=>{
  const target=document.querySelector('#app[data-page-kind="home"] .student-success-home');
  if(!target)return;
  target.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});
 });
 row.append(identity,statement,routes,scrollCue);
 // Preserve an accessible page heading without reintroducing the removed visible introduction.
 const accessibleHeading=el('h1','visually-hidden','Csanádi Árpád Sportiskola');
 section.append(accessibleHeading,row);
 return section;
}
