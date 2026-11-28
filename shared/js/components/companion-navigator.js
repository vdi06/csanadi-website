import {getMenuPage} from '../menu-data.js?v=2.83';
import {element as el} from '../dom.js?v=2.83';
import {ensurePage} from '../data/page-loader.js?v=2.83';
import {recommendationPreview} from '../recommendations.js?v=2.83';
// Session-local independent reading navigation; no hash mutation, no duplicate page renderer.
const histories=new WeakMap();
export function createCompanionNavigator(config){const pages=[...config.menu.items.flatMap(g=>g.children.map(p=>({id:p.id,title:p.label}))),...config.pagePreview.localPages.map(p=>({id:p.id,title:p.title}))];const allowed=new Set(pages.map(p=>p.id));let state=histories.get(config)||{ids:[pages[0]?.id],index:0};histories.set(config,state);let serial=0;
 const select=el('select',{attributes:{'aria-label':'Második panel oldala'}},...pages.map(p=>el('option',{text:p.title,attributes:{value:p.id}})));const content=el('div',{className:'segment-preview',attributes:{'aria-live':'polite'}});const button=(text,handler)=>{const b=el('button',{text,attributes:{type:'button'}});b.addEventListener('click',handler);return b;};
 const prev=button('Előző oldal a második panelen',()=>{if(state.index>0){state.index--;draw();}}),next=button('Következő oldal a második panelen',()=>{if(state.index<state.ids.length-1){state.index++;draw();}});
 function navigate(id){if(!allowed.has(id)||state.ids[state.index]===id)return;state.ids=state.ids.slice(0,state.index+1);state.ids.push(id);if(state.ids.length>20)state.ids.shift();state.index=state.ids.length-1;draw();}
 async function draw(){const version=++serial,id=state.ids[state.index];select.value=id;prev.disabled=state.index===0;next.disabled=state.index===state.ids.length-1;const info=recommendationPreview(config,id);const body=el('div',{className:'segment-reading-body'},el('p',{text:'Oldaltartalom betöltése…',attributes:{role:'status'}}));content.replaceChildren(el('h3',{text:info?.title||'Oldalbetekintés'}),el('p',{text:info?.intro||'Nincs előnézet.'}),el('a',{text:'Megnyitás a fő panelen',attributes:{href:'#/oldal/'+id}}),body);
 try{
 await ensurePage(config,id);if(version!==serial||!content.isConnected)return;
 const page=getMenuPage(config,id);if(!page)throw Error("Ismeretlen oldal.");const items=page.items;
 const pointNode=point=>el('div',{},el('strong',{text:point.title}),el('ul',{},...(point.details||[]).map(t=>el('li',{text:t}))),point.href?.startsWith('#/oldal/')&&allowed.has(point.href.slice(8))?button('Kapcsolódó oldal',()=>navigate(point.href.slice(8))):null);
 const groupNode=g=>el('section',{},el('h4',{text:g.title}),...(g.points||[]).map(pointNode));
 body.replaceChildren(...items.filter(Boolean).map(card=>el('details',{},el('summary',{text:card.title}),el('p',{text:card.summary}),...(card.groups||[]).map(groupNode))));
 }catch(e){if(version===serial)body.replaceChildren(el('p',{text:'A második panel oldala nem tölthető be.'}),button('Újrapróbálás',draw));}}

 select.addEventListener('change',()=>navigate(select.value));const panel=el('section',{},el('h2',{text:'Független olvasópanel'}),el('label',{},el('span',{text:'Oldal kiválasztása'}),select),el('div',{className:'utility-actions'},prev,next),content);draw();return panel;}
