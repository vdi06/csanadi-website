import {renderSportsSuccesses} from './sports-successes.js';
import {renderPremiumHero} from './hero-2026.js';
import {renderLiveDashboard} from './home-live.js?v=20261114a';
import {createPicture,mediaForRoute,imageDisclaimer,mediaItem} from './media.js';
/* Biztonságos, kizárólag előre regisztrált komponenseket tartalmazó blokkmegjelenítő. */
const dom=(tag,attrs={},text='')=>{
  const x=document.createElement(tag);
  for(const [key,value] of Object.entries(attrs)){
    if(key==='class')x.className=value;
    else if(key==='href' && /^(#\/[a-z0-9\-/]*|https:\/\/[^\s]+)$/.test(String(value))) x.href=value;
    else if(key==='target' && value==='_blank')x.target='_blank';
    else if(key==='rel')x.rel=value;
    else if(key.startsWith('aria-'))x.setAttribute(key,value);
    else if(key==='id'&&/^[a-zA-Z][\w-]*$/.test(value))x.id=value;
  }
  if(text!==undefined&&text!==null)x.textContent=String(text);
  return x;
};
export {dom};
const allowedLink=href=>/^#\/[a-z0-9\-/]*$/.test(href)||/^https:\/\/[^\s<>"']+$/.test(href);
function inlineText(parent,text){
  // Markdown szöveget kizárólag DOM-szövegcsomópontokként jelenítünk meg.
  const re=/(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let from=0,match;
  while((match=re.exec(String(text)))!==null){
    if(match.index>from)parent.append(document.createTextNode(text.slice(from,match.index)));
    if(match[2])parent.append(dom('strong',{},match[2]));
    else if(match[3])parent.append(dom('em',{},match[3]));
    else if(match[4]){const href=match[5].trim(); if(allowedLink(href)){const a=dom('a',{href},match[4]); if(href.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer';}parent.append(a);} else parent.append(document.createTextNode(match[4]));}
    from=re.lastIndex;
  }
  if(from<text.length)parent.append(document.createTextNode(text.slice(from)));
}
export function markdown(text){
  const el=dom('div',{class:'text-flow'});
  const lines=String(text??'').split(/\n{2,}/g);
  for(const part of lines){
    const trimmed=part.trim();if(!trimmed)continue;
    const tag=trimmed.startsWith('### ')?'h3':trimmed.startsWith('## ')?'h2':'p';
    const p=dom(tag);inlineText(p,trimmed.replace(/^#{2,3} /,''));el.append(p);
  }
  return el;
}
const ICON_PATHS={
 study:'<path d="m3 10 9-5 9 5-9 5-9-5Z M6 13v6c3 2 9 2 12 0v-6 M21 10v6"/>',
 trophy:'<path d="M7 4h10v5c0 5-2 7-5 7s-5-2-5-7V4Z M7 6H4v3c0 3 2 4 5 4m8-7h3v3c0 3-2 4-5 4m-3 3v4m-5 1h10"/>',
 school:'<path d="m3 11 9-7 9 7M5 11v9h14v-9M9 20v-6h6v6 M9 9h.01 M15 9h.01"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5h3m4 0h3m-10 3h3"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 5v1"/>',
 gallery:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="2"/><path d="m5 18 5-5 3 3 3-4 4 6"/>'
};
function iconNode(name){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
  // Constant path dictionary, never interpreted from JSON. SVG is authored program content, not user HTML.
  svg.innerHTML=ICON_PATHS[name]||ICON_PATHS.study;
  return svg;
}
function linkCard(data,i,css='feature-card') {
  const a=dom('a',{class:css,href:data.href||'#/'}) ;
  const id=data.mediaId || mediaForRoute(data.href||'');
  const art=createPicture(id,{className:'card-picture',sizes:'(max-width: 560px) 100vw, (max-width: 900px) 50vw, 400px'});
  if(art) a.append(art);
  const copy=dom('div',{class:'card-copy'});
  const head=dom('div',{class:'card-topline'});
  head.append(dom('span',{class:'card-icon'}));head.firstChild.append(iconNode(data.icon||'study'));
  head.append(dom('span',{class:'card-index'},String(i+1).padStart(2,'0')));copy.append(head);
  copy.append(dom('h3',{class:'card-title'},data.title||data.label||'Tartalom'));
  if(data.description)copy.append(dom('p',{class:'card-desc'},data.description));
  copy.append(dom('span',{class:'card-arrow'},'Megnyitás  ↗'));
  a.append(copy);
  return a;
}
const styles={
  'sports-successes': block => renderSportsSuccesses(block),
  'live-dashboard': block => renderLiveDashboard(block),
  'hero':block=>renderPremiumHero(block),
  'home-editorial':block=>{
    const data=block.data||{};
    const section=dom('section',{class:'editorial-section'}),container=dom('div',{class:'container-xxl'});
    container.append(dom('div',{class:'section-overline'},data.eyebrow||'AZ ISKOLA VILÁGA'));
    container.append(dom('h2',{class:'section-title'},block.title||'Fedezd fel az iskolát'));
    if(data.lead)container.append(dom('p',{class:'editorial-lead'},data.lead));
    const grid=dom('div',{class:'editorial-grid'});
    (data.items||[]).slice(0,6).forEach(item=>{
      const tile=dom('article',{class:'editorial-tile'});
      const header=dom('div',{class:'editorial-tile-head'});
      const icon=dom('span',{class:'editorial-icon'});icon.append(iconNode(item.icon||'study'));
      header.append(icon);tile.append(header,dom('h3',{},item.title||''),dom('p',{},item.text||''));
      if(item.href)tile.append(dom('a',{class:'editorial-link',href:item.href},item.linkText||'Tovább a témához'));
      grid.append(tile);
    });
    container.append(grid);section.append(container);return section;
  },
  'quick-links':block=>{
    const section=dom('section',{class:'section-wrap'}),container=dom('div',{class:'container-xxl'});
    container.append(dom('div',{class:'section-overline'},'KÖZVETLEN ELÉRÉSEK'),dom('h2',{class:'section-title mb-4'},block.title||'Gyorselérés'));
    const grid=dom('div',{class:'quick-grid'});
    (block.data?.items||[]).forEach((item,i)=>grid.append(linkCard(item,i,'feature-card quick-card')));
    container.append(grid);section.append(container);return section;
  },
  'section':block=>{
    const section=dom('section',{class:'section-wrap'}),container=dom('div',{class:'container-xxl'});
    if(block.title)container.append(dom('div',{class:'section-overline'},'FÓKUSZBAN'),dom('h2',{class:'section-title mb-4'},block.title));
    for(const child of block.children||[]) {const node=renderBlock(child);if(node)container.append(node);}
    section.append(container);return section;
  },
  'markdown':block=>{
    const content=dom('div',{class:'mb-4'});content.append(markdown(block.data?.text||''));return content;
  },
  'cards':block=>{
    const grid=dom('div',{class:'features-grid'});
    (block.data?.items||[]).forEach((item,i)=>grid.append(linkCard(item,i)));
    return grid;
  },
  'card':block=>{
    const c=dom('div',{class:'body-card'});
    c.append(dom('h2',{},block.data?.title||block.title||'Tájékoztatás'),dom('p',{class:'section-lead'},block.data?.description||''));return c;
  },
  'image':block=>{
    const entry=mediaItem(block.data?.mediaId);if(!entry)return null;
    const figure=dom('figure',{class:'story-figure'});
    const p=createPicture(entry.id,{className:'story-image',sizes:'(max-width: 850px) 100vw, 900px'});
    if(p) figure.append(p,dom('figcaption',{},entry.caption||'MI-generált illusztráció'));
    return figure;
  },
  'gallery':block=>{
    const gallery=dom('div',{class:'image-gallery'});
    (block.data?.items||[]).forEach((item)=>{
      const entry=mediaItem(item.mediaId);if(!entry)return;
      const figure=dom('figure',{class:'gallery-item'});
      const p=createPicture(entry.id,{className:'gallery-picture',sizes:'(max-width: 560px) 100vw, (max-width: 850px) 50vw, 33vw'});
      if(p){figure.append(p,dom('figcaption',{},item.title||'Iskolai illusztráció'));gallery.append(figure);}
    });
    if(!gallery.children.length)return null;
    const wrap=dom('div');wrap.append(gallery,dom('p',{class:'gallery-disclaimer'},'A képek MI-generált látványtervek; nem dokumentálják a valós iskolaépületet, eseményeket vagy személyeket.'));
    return wrap;
  },
  'accordion':block=>{
    const section=dom('div',{class:'body-card content-accordion'});
    if(block.title)section.append(dom('h2',{},block.title));
    (block.data?.items||[]).forEach(item=>{const d=dom('details');d.append(dom('summary',{},item.title||'Részletek'),dom('p',{},item.text||''));section.append(d);});return section;
  }
};
export function renderBlock(block){
  if(!block||typeof block!=='object'||typeof block.type!=='string')return null;
  try{return styles[block.type]?.(block)||null;}
  catch(err){console.error('Hibás komponens kihagyva',block.id,err);return null;}
}
export const listCards=(items)=>{
  const grid=dom('div',{class:'features-grid'});items.forEach((item,i)=>grid.append(linkCard({title:item.page.title,description:item.page.summary,href:item.page.schemaExtensions.route},i)));return grid;
};
