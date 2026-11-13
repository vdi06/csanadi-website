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
function linkCard(data,i,css='feature-card') {
  const a=dom('a',{class:css,href:data.href||'#/'}) ;
  const id=data.mediaId || mediaForRoute(data.href||'');
  const art=createPicture(id,{className:'card-picture',sizes:'(max-width: 560px) 100vw, (max-width: 900px) 50vw, 400px'});
  if(art) a.append(art);
  const copy=dom('div',{class:'card-copy'});
  copy.append(dom('span',{class:'card-index'},String(i+1).padStart(2,'0')));
  copy.append(dom('h3',{class:'card-title'},data.title||data.label||'Tartalom'));
  if(data.description)copy.append(dom('p',{class:'card-desc'},data.description));
  copy.append(dom('span',{class:'card-arrow'},'Megnyitás  ↗'));
  a.append(copy);
  return a;
}
const styles={
  'hero': block=>{
    const data=block.data||{};
    const section=dom('section',{class:'page-hero hero-with-photo'});
    const art=createPicture(data.imageId||'media:hero',{className:'hero-media',eager:true,sizes:'100vw'});
    if(art){section.append(art,imageDisclaimer());}
    const container=dom('div',{class:'container-xxl hero-grid'}),left=dom('div');
    left.append(dom('span',{class:'hero-overline'},data.eyebrow||'Sport • tudás • közösség'),dom('h1',{class:'hero-title'},data.title||''),dom('p',{class:'hero-desc'},data.subtitle||''));
    const actions=dom('div',{class:'hero-actions'});
    (data.buttons||[]).forEach((b,i)=>actions.append(dom('a',{class:i?'btn-outline-custom':'btn-gold',href:b.href},b.label||'Tovább')));
    left.append(actions);
    const right=dom('div',{class:'hero-accent'});
    const seal=createPicture('media:logo',{className:'hero-crest'});
    if(seal)right.append(seal);else right.append(dom('div',{class:'hero-ring'},'CS'));
    container.append(left,right);section.append(container);return section;
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
