import { element as el } from '../shared/js/dom.js?v=2.62';
import { checkedFeatureCenters, centerEvents,centerDateLabel,centerHref,centerEventHref,centerSportResults } from '../shared/js/feature-centers-data.js?v=2.62';
const h=(tag,text,cl)=>el(tag,{text,className:cl||''});
const link=(text,id)=>el('a',{className:'feature-link',text,attributes:{href:centerHref(id)}});
function header(group){return el('header',{className:'mobile-feature-head'},
  h('p',group.eyebrow,'feature-eyebrow'),h('h2',group.title),h('p',group.intro));}
function education(config,group){
  return el('div',{className:'mobile-feature-education'},
    ...group.programs.map(p=>el('details',{className:'mobile-feature-program'},
      el('summary',{},h('span',p.name),h('small',p.level)),
      el('div',{className:'mobile-feature-body'},h('p',p.summary),
        el('ul',{},...p.points.map(x=>h('li',x))),link('Tovább a felvételi tudnivalókhoz',p.pageId)))),
    h('h3','Kapcsolódó témák'),
    ...group.pillars.map(p=>el('article',{className:'mobile-feature-card'},h('h4',p.title),h('p',p.description),link('Tovább',p.pageId))),
    el('a',{className:'feature-source',text:'Forrás: KSI sportiskolai együttműködés',attributes:{href:group.source.url,target:'_blank',rel:'noopener noreferrer'}}));
}
function sports(config,group,pageId){
  if(pageId==='sports-facilities')return el('div',{className:'mobile-feature-sports'},
    ...group.facilities.map(p=>el('article',{className:'mobile-feature-card'},h('small',p.status,'feature-status'),
      h('h3',p.title),h('p',p.description),link('Kapcsolódó oldal',p.pageId))),
    link('Sportági képes bemutató','sports-disciplines'));
  const input=el('input',{className:'feature-search',attributes:{type:'search',placeholder:'Sportág keresése',
    'aria-label':'Sportágak szűrése'}});
  const list=el('div',{className:'mobile-feature-sport-list'});
  const count=h('p','','feature-count');count.setAttribute('role','status');
  function draw(){const items=centerSportResults(config,input.value);count.textContent=`${items.length} sporttémakör`;
    list.replaceChildren(...items.map(p=>el('article',{className:'mobile-feature-sport'},
      el('img',{attributes:{src:p.media.src,alt:p.media.alt,loading:'lazy',decoding:'async',width:1672,height:941}}),
      el('div',{},h('h3',p.name),h('p',p.summary),h('small','Illusztráció')))));
    if(!items.length)list.append(h('p','Nincs találat.'));
  }
  input.addEventListener('input',draw);draw();
  return el('div',{className:'mobile-feature-sports'},input,count,list,link('Sporthelyszínek','sports-facilities'));
}
function events(config,group,kind){
  let category='all',limit=8;const filter=el('select',{className:'feature-select',attributes:{'aria-label':'Eseménytípus szűrése'}},
    ...group.filters.map(f=>el('option',{text:f.label,attributes:{value:f.id}})));
  const query=el('input',{className:'feature-search',attributes:{type:'search',placeholder:'Esemény keresése',
    'aria-label':'Események keresése'}});
  const count=h('p','','feature-count');count.setAttribute('role','status');
  const list=el('div',{className:'mobile-feature-event-list'});
  const more=el('button',{className:'content-action',text:'További események',attributes:{type:'button'}});
  function draw(){const events=centerEvents(config,kind,{category,query:query.value});
    count.textContent=`${events.length} találat · ${Math.min(limit,events.length)} megjelenítve`;more.hidden=events.length<=limit;
    list.replaceChildren(...events.slice(0,limit).map(e=>el('details',{className:'mobile-feature-event'},
      el('summary',{},el('time',{text:centerDateLabel(e),attributes:{datetime:e.date}}),h('strong',e.title)),
      el('div',{className:'mobile-feature-body'},h('p',e.summary),h('small',e.categoryLabel),
        el('a',{className:'feature-link',text:'Megnyitás a naptárban',attributes:{href:centerEventHref(e)}})))));
    if(!events.length)list.append(h('p','Nincs találat.'));
  }
  filter.addEventListener('change',()=>{category=filter.value;limit=8;draw()});query.addEventListener('input',()=>{limit=8;draw()});more.addEventListener('click',()=>{limit+=8;draw()});draw();
  return el('div',{className:'mobile-feature-events'},filter,query,count,list,more,
    el('nav',{className:'feature-links',attributes:{'aria-label':'Kapcsolódó oldalak'}},...group.links.map(p=>link(p.label,p.pageId))),
    ...(kind==='community'?[link('Képek és galériák','sports-gallery')]:[]));
}
/** Külön mobil UX: lenyitható útvonalak, kártyás sportok és érintésbarát eseménylista. */
export function createMobileFeatureCenter(config,kind,pageId){
  const group=checkedFeatureCenters(config)[kind];
  const section=el('section',{className:`mobile-feature-center feature-center feature-${kind}`,
    attributes:{'aria-label':group.title}},header(group),
    h('p',group.note,'feature-note'),
    kind==='education'?education(config,group):kind==='sports'?sports(config,group,pageId):events(config,group,kind));
  return {section,destroy(){}};
}
