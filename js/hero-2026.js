import {createPicture, imageDisclaimer} from './media.js?v=20261114v5';
const element=(tag,cls='',value)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(value!==undefined)node.textContent=String(value);return node;};
export function renderPremiumHero(block){
 const data=block.data||{};
 const slides=(Array.isArray(data.slides)&&data.slides.length?data.slides:[data]).filter(item=>item&&typeof item.mediaId==='string').slice(0,20);
 if(!slides.length)return null;
 const section=element('section','hero2026 hero2026-cinematic');
 section.setAttribute('aria-label','Az iskola folyamatosan váltakozó kiemelt képei');
 section.setAttribute('aria-roledescription','diavetítés');
 section.tabIndex=0;section.setAttribute('aria-live','off');
 section.setAttribute('aria-label','Az iskola váltakozó képei. Szóközzel szüneteltethető vagy indítható.');
 const stage=element('div','hero2026-stage');
 const panels=slides.map((slide,index)=>{
  const panel=element('div','hero2026-slide');
  panel.setAttribute('aria-hidden',String(index!==0));panel.inert=index!==0;
  const picture=createPicture(slide.mediaId,{className:'hero2026-photo',eager:index===0,sizes:'100vw'});
  if(picture)panel.append(picture);
  panel.append(element('div','hero2026-shade'));
  const inner=element('div','container-xxl hero2026-inner');
  const copy=element('div','hero2026-copy');
  copy.append(element('span','hero2026-kicker',slide.eyebrow||data.eyebrow||'SPORT · TUDÁS · KÖZÖSSÉG'));
  copy.append(element('h1','hero2026-title',slide.title||data.title||'Csanádi Sportiskola'));
  if(slide.subtitle||data.subtitle)copy.append(element('p','hero2026-subtitle',slide.subtitle||data.subtitle));
  inner.append(copy);panel.append(inner,imageDisclaimer());stage.append(panel);
  return panel;
 });
 section.append(stage);
 const bottom=element('div','hero2026-bottom container-xxl');
 const dock=element('div','csn26-hero-dock');
 const makePreview=(side)=>{
  const card=element('div','csn26-hero-preview csn26-hero-preview--'+side);
  card.setAttribute('aria-hidden','true');
  const photo=element('span','csn26-hero-preview-photo'),copy=element('span','csn26-hero-preview-copy');
  copy.append(element('span','csn26-hero-preview-direction',side==='left'?'Előző kiemelés':'Következő kiemelés'));
  const title=element('strong','csn26-hero-preview-title');copy.append(title);
  card.append(photo,copy);return {card,photo,title};
 };
 const left=makePreview('left'),right=makePreview('right');
 const launcher=document.querySelector('body > .orbit-launch');
 if(launcher){
  const button=launcher.querySelector('#orbit-open');
  if(button){
   button.replaceChildren(element('span','csn26-dock-compass','✥'),element('span','csn26-dock-label','Oldaltérkép'));
   button.setAttribute('title','A hat fő témakört és az oldaltérképet megnyitja');
  }
  dock.append(left.card,launcher,right.card);bottom.append(dock);
 }
 const indicator=element('div','csn26-hero-indicator');
 const counter=element('span','hero2026-count');
 const progress=element('span','csn26-hero-progress');
 const progressFill=element('span','csn26-hero-progress-fill');
 progress.append(progressFill);indicator.append(counter,progress);bottom.append(indicator);
 section.append(bottom);
 let index=0,paused=false,hovered=false,focused=false;
 const syncPreview=(view,i)=>{
  const slide=slides[(i+slides.length)%slides.length];
  view.title.textContent=slide.title||'Kiemelt tartalom';
  const image=createPicture(slide.mediaId,{className:'csn26-hero-preview-picture',sizes:'(max-width:760px) 130px, 220px'});
  view.photo.replaceChildren(...(image?[image]:[]));
 };
 const sync=()=>{
  panels.forEach((panel,i)=>{const active=i===index;panel.classList.toggle('is-active',active);panel.setAttribute('aria-hidden',String(!active));panel.inert=!active;});
  counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  progressFill.style.width=`${100*(index+1)/slides.length}%`;
  if(launcher){syncPreview(left,index-1);syncPreview(right,index+1);}
 };
 sync();
 section.addEventListener('keydown',event=>{if(event.code==='Space'&&event.target===section){event.preventDefault();paused=!paused;section.setAttribute('aria-label',paused?'A képváltó szünetel. Szóközzel újraindítható.':'A képváltó működik. Szóközzel szüneteltethető.');}});
 section.addEventListener('mouseenter',()=>hovered=true);section.addEventListener('mouseleave',()=>hovered=false);
 section.addEventListener('focusin',()=>focused=true);section.addEventListener('focusout',()=>focused=section.contains(document.activeElement));
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const delay=Math.max(4000,Math.min(10000,Number(data.intervalMs)||5800));
 const timer=setInterval(()=>{
  if(!section.isConnected){clearInterval(timer);return;}
  if(document.hidden||reduced.matches||paused||hovered||focused)return;
  index=(index+1)%slides.length;sync();
 },delay);
 return section;
}
