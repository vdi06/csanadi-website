import { element as el } from '../shared/js/dom.js?v=2.48';
import { checkedFeatureCenters, centerEvents, centerDateLabel, centerHref,centerEventHref,centerSportResults } from '../shared/js/feature-centers-data.js?v=2.48';
const h=(tag,text,cl)=>el(tag,{text,className:cl||''});
const link=(name,id)=>el('a',{className:'feature-link',text:name,attributes:{href:centerHref(id)}});
function heading(data){return el('header',{className:'desktop-feature-head'},
  h('p',data.eyebrow,'feature-eyebrow'),h('h2',data.title),h('p',data.intro,'feature-intro'));
}
function notice(data){return el('p',{className:'feature-note',attributes:{role:'note'},text:data.note});}
function education(config,group){
  const chooser=el('div',{className:'desktop-feature-compare'});
  const programCards=[];
  const programButtons=[];
  const controls=el('div',{className:'feature-education-controls',attributes:{role:'group','aria-label':'Összehasonlítandó képzések'}});
  const options=[{id:'all',name:'Mindkét képzés'},...group.programs.map(p=>({id:p.id,name:p.name}))];
  function choose(id){
    for(const {id:programId,card} of programCards)card.hidden=id!=='all'&&id!==programId;
    for(const {id:buttonId,button} of programButtons)button.setAttribute('aria-pressed',String(buttonId===id));
    chooser.dataset.program=id;
  }
  for(const o of options){
    const button=el('button',{className:'feature-filter',text:o.name,attributes:{type:'button','aria-pressed':'false'}});
    button.addEventListener('click',()=>choose(o.id));controls.append(button);programButtons.push({id:o.id,button});
  }
  for(const p of group.programs){
    const card=el('article',{className:'desktop-feature-program'},
      h('p',p.level,'feature-program-level'),h('h3',p.name),h('p',p.summary),
      el('ul',{},...p.points.map(x=>h('li',x))),
      el('nav',{className:'feature-links',attributes:{'aria-label':`${p.name} kapcsolódó oldalak`}},
        link('Felvételi tudnivalók',p.pageId),...p.related.map(id=>link(config.menu.items.flatMap(m=>m.children).find(x=>x.id===id)?.label||id,id))));
    chooser.append(card);programCards.push({id:p.id,card});
  }
  choose('all');chooser.prepend(controls);
  chooser.append(el('aside',{className:'desktop-feature-pillars'},
    h('h3','Kapcsolódó lehetőségek'),
    el('div',{className:'desktop-feature-pillar-grid'},...group.pillars.map(p=>el('article',{},h('h4',p.title),h('p',p.description),link('Tovább',p.pageId))))));
  chooser.append(el('p',{className:'feature-source'},
    el('a',{text:group.source.label,attributes:{href:group.source.url,rel:'noopener noreferrer',target:'_blank'}})));
  return chooser;
}
function sports(config,group,pageId){
  const wrap=el('div',{className:'desktop-feature-sports'});
  if(pageId==='sports-facilities'){
    wrap.append(h('h3','Helyszínek és használati információk'),
      el('div',{className:'desktop-feature-facilities'},...group.facilities.map(p=>el('article',{},
        h('span',p.status,'feature-status'),h('h3',p.title),h('p',p.description),link('Kapcsolódó oldal',p.pageId)))),
      link('Sportágak képes bemutatása','sports-disciplines'));
  }else{
    const input=el('input',{className:'feature-search',attributes:{type:'search',placeholder:'Sportág vagy sporttémakör keresése',
      'aria-label':'Sportágak keresése',autocomplete:'off'}});
    const count=h('p','','feature-count');count.setAttribute('role','status');
    const cards=el('div',{className:'desktop-feature-sport-grid'});
    function update(){const results=centerSportResults(config,input.value);count.textContent=`${results.length} képes sporttémakör`;
      cards.replaceChildren(...results.map(p=>el('article',{className:'desktop-feature-sport-card'},
        el('img',{attributes:{src:p.media.src,alt:p.media.alt,loading:'lazy',decoding:'async',width:1672,height:941}}),
        el('div',{},h('h3',p.name),h('p',p.summary),h('small','Illusztráció – nem igazolt szakosztályadat')))));
      if(!results.length)cards.append(h('p','Nincs találat. Próbálj másik sportágat.'));
    }input.addEventListener('input',update);update();
    wrap.append(el('div',{className:'feature-tools'},input,link('Sporthelyszínek és használat','sports-facilities')),
      count,cards);
  }
  return wrap;
}
function events(config,group,kind){
  let category='all';const outer=el('div',{className:'desktop-feature-events'});
  const filters=el('div',{className:'feature-filters',attributes:{role:'group','aria-label':'Eseménytípus szűrése'}});
  const input=el('input',{className:'feature-search',attributes:{type:'search',placeholder:'Események keresése',
    'aria-label':'Események szöveges keresése'}});
  const count=h('p','','feature-count');count.setAttribute('role','status');
  const results=el('ol',{className:'desktop-feature-event-list'});
  function draw(){
    const events=centerEvents(config,kind,{category,query:input.value});
    count.textContent=`${events.length} esemény a kiválasztott nézetben`;
    results.replaceChildren(...events.map(e=>el('li',{className:'desktop-feature-event'},
      el('div',{className:'feature-event-date'},el('time',{text:centerDateLabel(e),attributes:{datetime:e.date}}),
        h('span',e.categoryLabel,'feature-status')),
      el('div',{},h('h3',e.title),h('p',e.summary),
        el('a',{className:'feature-link',text:'Megnyitás a naptárban',attributes:{href:centerEventHref(e)}})))));
    if(!events.length)results.append(el('li',{},h('p','Nincs az adott szűrésnek megfelelő esemény.')));
    filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
  }
  group.filters.forEach(f=>{const b=el('button',{className:'feature-filter',text:f.label,
    attributes:{type:'button','data-category':f.id,'aria-pressed':String(category===f.id)}});
    b.addEventListener('click',()=>{category=f.id;draw()});filters.append(b);});
  input.addEventListener('input',draw);
  outer.append(el('div',{className:'feature-tools'},input,filters),count,results,
    el('nav',{className:'feature-links',attributes:{'aria-label':'Kapcsolódó iskolai oldalak'}},
      ...group.links.map(p=>link(p.label,p.pageId))));
  if(kind==='community'){
    const media=config.mediaCenter.items.filter(m=>m.category==='kozosseg').slice(0,3);
    outer.append(h('h3','Közösségi képtémák – illusztrációk'),el('div',{className:'desktop-feature-gallery'},
      ...media.map(m=>el('figure',{},el('img',{attributes:{src:m.src,alt:m.alt,loading:'lazy',width:1672,height:941}}),
        el('figcaption',{text:m.title})))));
  }
  draw();return outer;
}
/** Önálló asztali nézet – oszlopos összehasonlítás, mozaik, idővonal. */
export function createDesktopFeatureCenter(config,kind,pageId){
  const centers=checkedFeatureCenters(config);const data=centers[kind];
  const section=el('section',{className:`desktop-feature-center feature-center feature-${kind}`,
    attributes:{'aria-label':data.title}},heading(data),notice(data),
    kind==='education'?education(config,data):kind==='sports'?sports(config,data,pageId):events(config,data,kind));
  return {section,destroy(){}};
}
