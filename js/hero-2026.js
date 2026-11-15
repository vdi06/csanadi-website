import {createPicture} from './media.js?v=20261114v5';
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
const safeRoute=value=>typeof value==='string'&&/^#\/[a-z0-9/\-]*$/i.test(value)?value:'#/';
export function renderPremiumHero(block){
 const data=block.data||{};
 const slides=(Array.isArray(data.slides)&&data.slides.length?data.slides:[data]).filter(slide=>slide&&typeof slide.mediaId==='string').slice(0,20);
 if(!slides.length)return null;
 const section=el('section','csn26-visual-map');section.setAttribute('aria-label','Képes oldaltérkép és központi körmenü');
 const heading=el('div','csn26-visual-heading');heading.append(el('span','csn26-visual-kicker','SPORT · TUDÁS · KÖZÖSSÉG'),el('h1','','Fedezd fel a Csanádi Sportiskolát'),el('p','','Válassz a képes tartalmak közül, vagy nyisd meg középen a körmenüt.'));
 const row=el('div','csn26-visual-row');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const buildWing=(side,items)=>{
  const wing=el('section','csn26-visual-wing csn26-visual-wing--'+side);
  wing.setAttribute('aria-label',side==='left'?'Bal oldali képes tartalmak':'Jobb oldali képes tartalmak');
  const surface=el('div','csn26-wing-surface');const copy=el('div','csn26-wing-copy');
  const overline=el('span','csn26-wing-kicker');const title=el('h2','csn26-wing-title');const summary=el('p','csn26-wing-summary');
  const link=el('a','csn26-wing-link','Tovább a tartalomhoz ↗');copy.append(overline,title,summary,link);
  const pictureMount=el('div','csn26-wing-photo');surface.append(pictureMount,el('div','csn26-wing-shade'),copy);
  const nav=el('div','csn26-wing-navigation');
  const prev=el('button','csn26-wing-arrow','‹'),next=el('button','csn26-wing-arrow','›');
  for(const [button,name] of [[prev,'Előző tartalom'],[next,'Következő tartalom']]){button.type='button';button.setAttribute('aria-label',name+' – '+(side==='left'?'bal':'jobb')+' oldal');}
  const pager=el('div','csn26-wing-pager');pager.setAttribute('role','group');pager.setAttribute('aria-label',(side==='left'?'Bal':'Jobb')+' oldali képválasztás');
  const count=el('span','csn26-wing-count');count.setAttribute('aria-live','polite');
  const pause=el('button','csn26-wing-pause','Szünet');pause.type='button';pause.setAttribute('aria-pressed','false');pause.setAttribute('aria-label','Automatikus képváltás szüneteltetése');
  nav.append(prev,pager,next,pause,count);wing.append(surface,nav);
  let current=0,hovered=false,focused=false,paused=false,startX=null;
  const buttons=items.map((slide,i)=>{const button=el('button','csn26-wing-number',String(i+1));button.type='button';button.title=slide.title||'Kiemelt tartalom';button.setAttribute('aria-label',`${i+1}. tartalom: ${slide.title||'Kiemelés'}`);button.addEventListener('click',()=>show(i));pager.append(button);return button;});
  function show(i){
   current=(i+items.length)%items.length;const slide=items[current];
   const picture=createPicture(slide.mediaId,{className:'csn26-wing-picture',eager:current===0,sizes:'(max-width:580px) 100vw, 50vw'});
   pictureMount.replaceChildren(...(picture?[picture]:[]));
   overline.textContent=slide.eyebrow||'CSANÁDI SPORTISKOLA';title.textContent=slide.title||'Iskolai pillanatok';summary.textContent=slide.subtitle||'Fedezd fel iskolánk világát.';
   link.href=safeRoute(slide.buttons?.[0]?.href||((side==='left')?'#/sport':'#/iskolank'));
   buttons.forEach((button,n)=>{const active=n===current;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-current',active?'true':'false');});
   count.textContent=`${current+1} / ${items.length}`;
   wing.dataset.slide=String(current+1);
  }
  prev.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));
  pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Folytatás':'Szünet';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Automatikus képváltás folytatása':'Automatikus képváltás szüneteltetése');});
  surface.addEventListener('touchstart',event=>{if(event.touches.length===1)startX=event.touches[0].clientX;},{passive:true});
  surface.addEventListener('touchend',event=>{if(startX===null||!event.changedTouches.length)return;const delta=event.changedTouches[0].clientX-startX;startX=null;if(Math.abs(delta)>55)show(current+(delta<0?1:-1));},{passive:true});
  wing.addEventListener('keydown',event=>{if(event.target.matches('input,textarea,select'))return;if(event.key==='ArrowLeft'){event.preventDefault();show(current-1);}if(event.key==='ArrowRight'){event.preventDefault();show(current+1);}});
  wing.addEventListener('mouseenter',()=>hovered=true);wing.addEventListener('mouseleave',()=>hovered=false);
  wing.addEventListener('focusin',()=>focused=true);wing.addEventListener('focusout',()=>focused=wing.contains(document.activeElement));
  show(0);
  const delay=Math.max(5000,Math.min(12000,Number(data.intervalMs)||7500));
  const timer=setInterval(()=>{if(!wing.isConnected){clearInterval(timer);return;}if(document.hidden||reduced.matches||hovered||focused||paused||document.body.classList.contains('site-map-is-open'))return;show(current+1);},delay);
  return wing;
 };
 const left=slides.filter((_,i)=>i%2===0),right=slides.filter((_,i)=>i%2===1);
 row.append(buildWing('left',left),buildWing('right',right.length?right:left));
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
