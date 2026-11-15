/** Kizárólag telefonos, háromikonos alsó sáv. A DOM-segítők közös modulból jönnek. */
import {el,append} from '../js/site-quality-2026.js?v=20261115r19';

export function initMobileQuickNav(){
 if(document.getElementById('ext26-mobile-nav'))return;
 const nav=el('nav','ext26-mobile-nav');nav.id='ext26-mobile-nav';nav.setAttribute('aria-label','Mobilos gyorsnavigáció');
 const icon=kind=>{
  if(kind==='menu'){
   const image=el('img','ext26-nav-logo');image.src='assets/media/logo/csanadi-cimer-512.webp';image.alt='';image.width=35;image.height=35;image.decoding='async';image.setAttribute('aria-hidden','true');return image;
  }
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','ext26-nav-icon');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2.2');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
  const shape=kind==='home'?'M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3V10.5':'M21 21l-4.3-4.3M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0';
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',shape);svg.append(path);return svg;
 };
 const entries=[['home','Kezdőlap',()=>location.hash='#/'],['menu','Menü',()=>document.getElementById('orbit-open')?.click()],['search','Keresés',()=>document.getElementById('search-open')?.click()]];
 entries.forEach(([kind,label,action])=>{const b=el('button','ext26-nav-icon-button');b.type='button';b.dataset.navId=kind;b.setAttribute('aria-label',label);b.title=label;append(b,icon(kind));b.addEventListener('click',action);nav.append(b);});
 document.body.append(nav);
 const update=()=>{const route=location.hash||'#/';nav.querySelector('[data-nav-id="home"]')?.setAttribute('aria-current',route==='#/'?'page':'false');
  const menuOpen=!document.getElementById('site-map-overlay')?.hidden;
  nav.querySelector('[data-nav-id="menu"]')?.setAttribute('aria-expanded',String(menuOpen));
  const searchOpen=!document.getElementById('search-panel')?.hidden;
  nav.querySelector('[data-nav-id="search"]')?.setAttribute('aria-expanded',String(searchOpen));
 };
 window.addEventListener('hashchange',update);update();
 for(const overlay of ['site-map-overlay','search-panel']){
  const target=document.getElementById(overlay);if(target&&typeof MutationObserver!=='undefined')new MutationObserver(update).observe(target,{attributes:true,attributeFilter:['hidden']});
 }
}
