/* Csanádi 2026 – prémium, JSON-konfigurált hero. Csak regisztrált médiákat és útvonalakat használ. */
import {createPicture, imageDisclaimer} from './media.js?v=20261114v5';
const safeHref=value=>typeof value==='string'&&/^#\/[a-z0-9/-]*$/.test(value)?value:'#/';
const el=(tag,cls='',text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
const action=(item,i)=>{const a=el('a',i?'hero2026-cta ghost':'hero2026-cta primary',item.label||'Tovább');a.href=safeHref(item.href);return a;};
export function renderPremiumHero(block){
  const d=block.data||{};
  const slides=(Array.isArray(d.slides)&&d.slides.length?d.slides:[d]).filter(s=>s&&typeof s.mediaId==='string').slice(0,20);
  if(!slides.length)return null;
  const section=el('section','hero2026');section.setAttribute('aria-roledescription','diavetítés');section.setAttribute('aria-label','A Csanádi Sportiskola kiemelt témái');
  const stage=el('div','hero2026-stage');const panels=[];
  for(let index=0;index<slides.length;index++){
    const s=slides[index],panel=el('div','hero2026-slide');panel.setAttribute('aria-hidden',String(index!==0));panel.inert=index!==0;
    const pic=createPicture(s.mediaId,{className:'hero2026-photo',eager:index===0,sizes:'100vw'});
    if(pic)panel.append(pic);
    const overlay=el('div','hero2026-shade');panel.append(overlay);
    const content=el('div','container-xxl hero2026-inner');
    const text=el('div','hero2026-copy');
    text.append(el('span','hero2026-kicker',s.eyebrow||d.eyebrow||'SPORT · OKTATÁS · KÖZÖSSÉG'));
    const title=el('h1','hero2026-title',s.title||d.title||'Csanádi Sportiskola');
    text.append(title,el('p','hero2026-subtitle',s.subtitle||d.subtitle||''));
    const controls=el('div','hero2026-actions');(s.buttons||d.buttons||[]).slice(0,2).forEach((b,i)=>controls.append(action(b,i)));
    text.append(controls);
    const crest=el('div','hero2026-identity');
    const crestPic=createPicture('media:logo',{className:'hero2026-crest',eager:index===0,decorative:false});
    if(crestPic)crest.append(crestPic);
    crest.append(el('span','hero2026-identity-caption','CSANÁDI ÁRPÁD SPORTISKOLA'));
    content.append(text,crest);panel.append(content);
    panel.append(imageDisclaimer());stage.append(panel);panels.push(panel);
  }
  section.append(stage);
  const bottom=el('div','hero2026-bottom container-xxl');
  const rail=el('div','hero2026-nav');
  const prev=el('button','hero2026-arrow','‹'),next=el('button','hero2026-arrow','›'),pause=el('button','hero2026-pause','Szünet');
  prev.type=next.type=pause.type='button';prev.setAttribute('aria-label','Előző kiemelt kép');next.setAttribute('aria-label','Következő kiemelt kép');
  pause.setAttribute('aria-label','Automatikus képváltás szüneteltetése');
  const dots=el('div','hero2026-dots');dots.setAttribute('aria-label','Kiemelt képek kiválasztása');
  let idx=0,paused=false,hovering=false,focused=false;
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const dotsList=slides.map((slide,i)=>{const b=el('button','hero2026-dot');b.type='button';b.setAttribute('aria-label',`${i+1}. kiemelt kép: ${slide.title||''}`);b.addEventListener('click',()=>switchTo(i));dots.append(b);return b;});
  const counter=el('span','hero2026-count');
  const sync=()=>{
    panels.forEach((p,i)=>{p.setAttribute('aria-hidden',String(i!==idx));p.inert=i!==idx;p.classList.toggle('is-active',i===idx);});
    dotsList.forEach((b,i)=>{b.classList.toggle('active',i===idx);b.setAttribute('aria-pressed',String(i===idx));});
    counter.textContent=`${String(idx+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  };
  const switchTo=i=>{idx=(i+slides.length)%slides.length;sync();};
  prev.addEventListener('click',()=>switchTo(idx-1));next.addEventListener('click',()=>switchTo(idx+1));
  const pausedText=()=>{
    const stop=paused||prefersReduced.matches;
    pause.textContent=stop?'Indítás':'Szünet';
    pause.setAttribute('aria-label',stop?'Automatikus képváltás indítása':'Automatikus képváltás szüneteltetése');
    pause.setAttribute('aria-pressed',String(stop));
  };
  pause.addEventListener('click',()=>{paused=!paused;pausedText();});
  const onEnter=()=>{hovering=true;};const onLeave=()=>{hovering=false;};
  section.addEventListener('mouseenter',onEnter);section.addEventListener('mouseleave',onLeave);
  section.addEventListener('focusin',()=>focused=true);
  section.addEventListener('focusout',()=>{setTimeout(()=>focused=section.contains(document.activeElement),0);});
  const onMotion=()=>pausedText();prefersReduced.addEventListener?.('change',onMotion);
  rail.append(prev,dots,next,counter,pause);bottom.append(rail);section.append(bottom);
  sync();pausedText();
  const tick=Math.max(4000,Math.min(16000,Number(d.intervalMs)||7200));
  const timer=setInterval(()=>{
    if(!section.isConnected){clearInterval(timer);prefersReduced.removeEventListener?.('change',onMotion);return;}
    if(paused||hovering||focused||prefersReduced.matches||document.hidden)return;
    switchTo(idx+1);
  },tick);
  return section;
}
