import { reservedWidgetPages } from "./carousel-data.js?v=2.72";
import { element as el } from './dom.js?v=2.72';
import { recommendationPreview } from './recommendations.js?v=2.72';
import { menuPageHref } from './menu-data.js?v=2.72';
import { openContentDialog } from './content-expansion.js?v=2.72';

const storageKey='csanadi.personal-widgets.v1';
let memorySelection=null, unsaved=false;
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
const button=(text,label,action,cls='personal-widget-action')=>el('button',{text,className:cls,attributes:{type:'button','aria-label':label,'data-action':action}});
export function widgetCatalog(config){
 const groups=config.menu.items.map(g=>({label:g.label,items:g.children.map(p=>({id:p.id,title:p.label,group:g.label,icon:config.home.widgets.icons[g.id]||'▦'}))}));
 groups.push({label:'Képzési részoldalak',items:config.pagePreview.localPages.map(p=>({id:p.id,title:p.title,group:'Képzési részoldalak',icon:'▤'}))});
 const excluded=reservedWidgetPages(config);
 return groups.map(g=>({...g,items:g.items.filter(p=>!excluded.has(p.id))})).filter(g=>g.items.length);
}
export function cleanWidgetSelection(value,allowed,max){return Array.isArray(value)?[...new Set(value.filter(id=>typeof id==='string'&&allowed.has(id)))].slice(0,max):null;}
export function createPersonalWidgets(config,holdForReading){
 const data=config.home.widgets,groups=widgetCatalog(config),catalog=new Map(groups.flatMap(g=>g.items.map(p=>[p.id,p]))),allowed=new Set(catalog.keys());
 const defaults=cleanWidgetSelection(data.defaults,allowed,data.maxItems)||[];
 let editing=false,storageFailed=false,selection;
 try{const raw=localStorage.getItem(storageKey);try{selection=raw===null?null:cleanWidgetSelection(JSON.parse(raw),allowed,data.maxItems);}catch{selection=null;}}catch{storageFailed=true;}
 if(unsaved){selection=cleanWidgetSelection(memorySelection,allowed,data.maxItems);storageFailed=true;
  if(selection!==null)try{localStorage.setItem(storageKey,JSON.stringify(selection));storageFailed=false;unsaved=false;}catch{}
 }
 selection=selection??cleanWidgetSelection(memorySelection,allowed,data.maxItems)??[...defaults];
 // A migráció a mentett, immár foglalt oldalakat is eltávolítja.
 if (!storageFailed) {try {const raw=localStorage.getItem(storageKey);if(raw!==null&&raw!==JSON.stringify(selection))localStorage.setItem(storageKey,JSON.stringify(selection));}catch{storageFailed=true;unsaved=true;}}
 memorySelection=[...selection];
 const status=el('p',{className:'personal-widget-status',attributes:{role:'status','aria-live':'polite'}});
 const edit=button('Szerkesztés','Saját oldalak szerkesztése','edit');
 const grid=el('div',{className:'personal-widget-grid'});
 const search=el('input',{className:'personal-widget-input',attributes:{type:'search','aria-label':'Oldalak keresése a hozzáadáshoz',placeholder:'Oldal keresése…',autocomplete:'off'}});
 const select=el('select',{className:'personal-widget-input',attributes:{'aria-label':'Hozzáadandó oldal'}});
 const add=button('＋ Hozzáadás','Kiválasztott oldal hozzáadása','add');
 const reset=button('Alapértelmezett visszaállítása','Alapértelmezett widgetek visszaállítása','reset');
 const manage=el('div',{className:'personal-widget-manage'},el('p',{text:'Adj hozzá oldalt, töröld a nem használtakat, vagy mozgasd őket a nyilakkal. A módosítások automatikusan mentődnek. A többi fő fül oldalai nem választhatók.'}),el('div',{className:'personal-widget-fields'},search,select,add),reset);
 const section=el('section',{className:'personal-widgets',attributes:{'aria-label':data.title}},el('div',{className:'personal-widget-heading'},el('div',{},el('h2',{text:data.title}),el('p',{text:data.intro})),edit),manage,status,grid);
 function persist(){memorySelection=[...selection];try{localStorage.setItem(storageKey,JSON.stringify(selection));storageFailed=false;unsaved=false;}catch{storageFailed=true;unsaved=true;}holdForReading();}
 function announce(message=''){status.textContent=[message,`${selection.length} / ${data.maxItems} oldal`,storageFailed?'A böngésző tárhelye nem elérhető; a változás csak ebben a munkamenetben marad meg.':''].filter(Boolean).join(' · ');}
 function choices(){const prev=select.value,words=norm(search.value).split(/\s+/).filter(Boolean);select.replaceChildren();for(const g of groups){const opt=el('optgroup',{attributes:{label:g.label}});for(const p of g.items){if(selection.includes(p.id)||!words.every(w=>norm(p.title+' '+g.label).includes(w)))continue;opt.append(el('option',{text:p.title,attributes:{value:p.id}}));}if(opt.children.length)select.append(opt);}if([...select.options].some(o=>o.value===prev))select.value=prev;select.disabled=!select.options.length||selection.length>=data.maxItems;add.disabled=select.disabled;if(!select.options.length)select.append(el('option',{text:'Nincs hozzáadható találat',attributes:{value:''}}));}
 function preview(id,trigger){holdForReading();const p=catalog.get(id),v=recommendationPreview(config,id);if(!v)return;openContentDialog({title:p.title,trigger,views:[()=>el('div',{className:'personal-widget-preview'},el('p',{className:'content-kicker',text:p.group}),el('p',{text:v.intro}),el('ul',{},...v.highlights.map(h=>el('li',{text:h}))),el('a',{className:'content-action',text:'Teljes oldal megnyitása ↗',attributes:{href:menuPageHref(id)}}))]});}
 function render(focusId,action){manage.hidden=!editing;edit.textContent=editing?'✓ Kész':'✎ Szerkesztés';edit.setAttribute('aria-expanded',String(editing));edit.setAttribute('aria-label',editing?'Widgetek szerkesztésének befejezése':'Saját oldalak szerkesztése');grid.replaceChildren();
  for(const [i,id] of selection.entries()){
   const p=catalog.get(id),v=recommendationPreview(config,id);const tile=button('',`Betekintés: ${p.title}`,'preview','personal-widget-tile');tile.setAttribute('aria-haspopup','dialog');tile.append(el('span',{className:'personal-widget-icon',text:p.icon,attributes:{'aria-hidden':'true'}}),el('span',{className:'personal-widget-copy'},el('strong',{text:p.title}),el('small',{text:p.group}),el('span',{className:'personal-widget-detail',text:v?.highlights[0]||'Oldalbetekintés'})),el('span',{className:'personal-widget-arrow',text:'›',attributes:{'aria-hidden':'true'}}));tile.addEventListener('click',()=>preview(id,tile));
   const card=el('article',{className:'personal-widget-card',attributes:{'data-widget-id':id}},tile);
   if(editing){const up=button('↑',`${p.title} előrébb mozgatása`,'up'),down=button('↓',`${p.title} hátrébb mozgatása`,'down'),remove=button('×',`${p.title} eltávolítása`,'remove');up.disabled=i===0;down.disabled=i===selection.length-1;
    const move=(delta,kind)=>{[selection[i],selection[i+delta]]=[selection[i+delta],selection[i]];persist();render(id,kind);announce(`${p.title} áthelyezve`);};up.addEventListener('click',()=>move(-1,'up'));down.addEventListener('click',()=>move(1,'down'));remove.addEventListener('click',()=>{selection.splice(i,1);persist();render(selection[Math.min(i,selection.length-1)],'remove');announce(`${p.title} eltávolítva`);});card.append(el('div',{className:'personal-widget-tools'},up,down,remove));}
   grid.append(card);
  }
  if(!selection.length)grid.append(el('p',{className:'personal-widget-empty',text:'Még nincs kiválasztott oldal. Szerkesztéssel hozzáadhatsz új widgeteket.'}));choices();announce();
  if(action){const card=[...grid.children].find(c=>c.dataset.widgetId===focusId);const target=card?.querySelector(`[data-action="${action}"]:not([disabled])`)||card?.querySelector('[data-action="preview"]')||edit;target.focus({preventScroll:true});}
 }
 edit.addEventListener('click',()=>{editing=!editing;holdForReading();render();if(editing)search.focus({preventScroll:true});});search.addEventListener('input',choices);add.addEventListener('click',()=>{const id=select.value;if(!allowed.has(id)||selection.includes(id)||selection.length>=data.maxItems)return;selection.push(id);persist();render();announce(`${catalog.get(id).title} hozzáadva`);search.focus({preventScroll:true});});reset.addEventListener('click',()=>{selection=[...defaults];persist();render();announce('Alapértelmezett widgetek visszaállítva');});
 section.dataset.adaptiveState='widgets';section.adaptiveSnapshot=()=>({selection:[...selection],editing,query:search.value,selected:select.value});section.adaptiveRestore=state=>{selection=cleanWidgetSelection(state.selection,allowed,data.maxItems)||defaults;editing=state.editing;search.value=state.query;render();if([...select.options].some(o=>o.value===state.selected))select.value=state.selected;};render();return {section,isOpen:()=>editing||Boolean(document.querySelector('dialog[open]')),destroy(){}};
}
