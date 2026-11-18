/** Kizárólag telefonos, háromikonos alsó sáv. A DOM-segítők közös modulból jönnek. */
import {el,append} from '../js/site-quality-2026.js?v=csanadi-r29n-20261115';

export function initMobileQuickNav(){
 if(document.getElementById('ext26-mobile-nav'))return;
 const nav=el('nav','ext26-mobile-nav');nav.id='ext26-mobile-nav';nav.setAttribute('aria-label','Mobilos gyorsnavigáció');
 const icon=kind=>{
  if(kind==='menu'){
   const image=el('img','ext26-nav-logo');image.src='assets/media/logo/csanadi-crest-512.webp';image.alt='';image.width=35;image.height=35;image.decoding='async';image.setAttribute('aria-hidden','true');return image;
  }
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','ext26-nav-icon');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2.2');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
  const shape=kind==='home'?'M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3V10.5':'M21 21l-4.3-4.3M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0';
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',shape);svg.append(path);return svg;
 };
 // A mobilos alsó címer független a kezdőlapi képváltóba áthelyezett indítótól.
 const entries=[['home','Kezdőlap',()=>location.hash='#/'],['menu','Menü',()=>document.dispatchEvent(new Event('csanadi:menu-toggle'))],['search','Keresés',()=>document.getElementById('search-open')?.click()]];
 entries.forEach(([kind,label,action])=>{const b=el('button','ext26-nav-icon-button');b.type='button';b.dataset.navId=kind;b.setAttribute('aria-label',label);b.title=label;if(kind==='menu'||kind==='search')b.setAttribute('aria-haspopup','dialog');if(kind==='menu')b.setAttribute('aria-controls','site-map-overlay');if(kind==='search')b.setAttribute('aria-controls','search-panel');append(b,icon(kind));b.addEventListener('click',action);nav.append(b);});
 document.body.append(nav);
 const update=()=>{const route=location.hash||'#/';const homeButton=nav.querySelector('[data-nav-id="home"]');
  if(route==='#/')homeButton?.setAttribute('aria-current','page');else homeButton?.removeAttribute('aria-current');
  const menuOpen=!document.getElementById('site-map-overlay')?.hidden;
  const menuButton=nav.querySelector('[data-nav-id="menu"]');menuButton?.setAttribute('aria-expanded',String(menuOpen));menuButton?.setAttribute('aria-label',menuOpen?'Főmenü bezárása':'Főmenü megnyitása');
  const searchOpen=!document.getElementById('search-panel')?.hidden;
  const searchButton=nav.querySelector('[data-nav-id="search"]');searchButton?.setAttribute('aria-expanded',String(searchOpen));searchButton?.setAttribute('aria-label',searchOpen?'Keresés bezárása':'Keresés megnyitása');
 };
 window.addEventListener('hashchange',update);update();
 for(const overlay of ['site-map-overlay','search-panel']){
  const target=document.getElementById(overlay);if(target&&typeof MutationObserver!=='undefined')new MutationObserver(update).observe(target,{attributes:true,attributeFilter:['hidden']});
 }
}
