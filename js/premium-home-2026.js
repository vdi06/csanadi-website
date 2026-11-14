/* CSANÁDI 2026 – prémium, képközpontú kezdőoldali sportmagazin.
   Az összes képet a meglévő, helyi és illusztrációként jelölt médiatárból használja. */
import {createPicture} from './media.js?v=20261114v5';

const node=(tag,klass='',value)=>{
  const e=document.createElement(tag);
  if(klass)e.className=klass;
  if(value!==undefined)e.textContent=value;
  return e;
};
const featureItems=[
  {media:'media:siker-kosarlabda',tag:'CSAPATJÁTÉK',title:'Együtt lendületben',description:'Kosárlabda és a közös játék öröme',href:'#/sport/sportagak',shape:'featured'},
  {media:'media:siker-atletika',tag:'ATLETIKA',title:'Minden cél új kezdet',description:'Kitartás és fejlődés',href:'#/sport/sporteredmenyek'},
  {media:'media:siker-uszas',tag:'ÚSZÁS',title:'Egy újabb hossz',description:'Sportágak és lehetőségek',href:'#/sport/sportagak'},
  {media:'media:siker-roplabda',tag:'RÖPLABDA',title:'Egymásra figyelve',description:'Csapatmunka a pályán',href:'#/sport/sportagak'}
];
function pictureCard(x,i){
  const a=node('a','premium26-visual-card'+(x.shape?' premium26-visual-card--featured':''));
  a.href=x.href;
  const pic=createPicture(x.media,{className:'premium26-visual-picture',eager:i===0,sizes:'(max-width: 720px) 100vw, (max-width: 1060px) 50vw, 760px'});
  if(pic)a.append(pic);
  const copy=node('div','premium26-visual-copy');
  copy.append(node('span','premium26-visual-tag',x.tag),node('h3','premium26-visual-title',x.title),node('p','premium26-visual-desc',x.description));
  const more=node('span','premium26-visual-arrow','↗');more.setAttribute('aria-hidden','true');copy.append(more);a.append(copy);
  a.setAttribute('aria-label',x.title+' – '+x.description+' – oldal megnyitása');
  return a;
}
export function renderHomeSportSpotlight(){
  const section=node('section','premium26-showcase section-wrap');section.setAttribute('aria-labelledby','premium26-showcase-title');
  const shell=node('div','container-xxl premium26-container');
  const head=node('header','premium26-section-head');
  head.append(node('span','premium26-eyebrow','CSANÁDI · SPORTÉLET KÉPEKBEN'));
  const title=node('h2','premium26-heading','A mozgás összeköt.');title.id='premium26-showcase-title';head.append(title);
  head.append(node('p','premium26-section-lead','Négy sportos pillanat, négy különböző történet. Fedezd fel az iskolai sport világát és az elérhető eredményeket.'));
  const grid=node('div','premium26-visual-grid');featureItems.forEach((x,i)=>grid.append(pictureCard(x,i)));
  const disclaimer=node('p','premium26-illustration-notice','A képek tematikus illusztrációk, nem az iskola tényleges eseményeit dokumentáló felvételek.');
  const destinations=node('nav','premium26-discover');destinations.setAttribute('aria-label','Kiemelt témák gyorselérése');
  [
    {text:'Sportágak',href:'#/sport/sportagak',number:'01'},
    {text:'Képzéseink',href:'#/oktatas/kepzeseink',number:'02'},
    {text:'Hírek és események',href:'#/hirek-es-esemenyek',number:'03'}
  ].forEach(link=>{
    const a=node('a','premium26-discover-link');a.href=link.href;
    a.append(node('span','premium26-discover-number',link.number),node('strong','',link.text),node('span','premium26-discover-icon','↗'));
    destinations.append(a);
  });
  shell.append(head,grid,disclaimer,destinations);section.append(shell);return section;
}
