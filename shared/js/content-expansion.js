import { element as el } from './dom.js?v=2.54';
const norm = x => String(x ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
const btn = (text,cl='content-action')=>el('button',{text,className:cl,attributes:{type:'button'}});
const titleFor=(config,id)=>config.menu.items.flatMap(g=>g.children).find(p=>p.id===id)?.label||id;
export function validateExpansion(config){
 const e=config.contentExpansion;if(!e||e.schema!=='1.0')throw new Error('Hiányzó tartalombővítési adatok.');
 const ids=new Set(config.menu.items.flatMap(g=>g.children.map(p=>p.id)));
 const used=new Set();
 if(e.pageCount!==ids.size||Object.keys(e.pageManifest).length!==ids.size)throw new Error('Hibás oldaljegyzék.');
 for(const id of ids){
  const p=config.pagePreview.pages[id],m=p.contentMeta;
  if(e.pageManifest[id]!==`pages/${id}.json`||!m||!m.sources.length||m.sources.some(s=>!e.sources[s])||!Array.isArray(m.related)||m.related.some(r=>!ids.has(r))||p.collectionId&&!e.collections[p.collectionId])throw new Error('Hibás tartalomkapcsolat: '+id);
 }
 for(const [key,coll] of Object.entries(e.collections)){
  if(!['articles','quiz','stats'].includes(coll.kind)||!coll.title||!Array.isArray(coll.items)||!coll.items.length)throw new Error('Hibás gyűjtemény: '+key);
  for(const item of coll.items){
   if(!/^[a-z0-9-]+$/.test(item.id)||used.has(item.id)||!item.title||!item.summary||!item.category||!e.sources[item.source]||!ids.has(item.relatedPage))throw new Error('Hibás gyűjteményi elem: '+item.id);
   if(coll.kind==='quiz'&&(!Array.isArray(item.options)||item.options.length!==3||new Set(item.options).size!==3||!Number.isInteger(item.correct)||item.correct<0||item.correct>=3||!item.explanation))throw new Error('Hibás tudáspróba: '+item.id);
   if(coll.kind==='stats'&&(!Number.isFinite(item.minutes)||!Number.isFinite(item.sessions)||item.source!=='demo'))throw new Error('Hibás mintaadatsor: '+item.id);
   used.add(item.id);
  }
 }
 return e;
}
let current=null, counter=0;
export function closeContentDialog(){ current?.finish(false); }
/** One native modal; history entry uses same URL so closing does not re-render the SPA. */
export function openContentDialog({title,views,trigger,restore,large=false}){
 if(current||document.querySelector('dialog[open]'))return false;
 const id=`content-dialog-${++counter}`, historyId=id;
 const home=trigger?.closest('.mobile-home,.desktop-home')||document.querySelector('.mobile-home,.desktop-home');
 const dialog=el('dialog',{className:`content-dialog${large?' content-dialog-large':''}`,attributes:{'aria-labelledby':id,'aria-modal':'true','data-theme':home?.dataset.theme||'dark'}});
 if(home)for(const k of ['background','surface','text','muted','accent'])dialog.style.setProperty('--'+k,getComputedStyle(home).getPropertyValue('--'+k));
 const heading=el('h2',{text:title,attributes:{id,tabindex:'-1'}}),close=btn('Bezárás ×','content-dialog-close');
 const body=el('div',{className:'content-dialog-body'}),prev=btn('‹ Előző'),next=btn('Következő ›'),status=el('span',{attributes:{role:'status','aria-live':'polite'}});
 let ix=0,finished=false;
 function display(){body.replaceChildren(views[ix]());prev.disabled=ix===0;next.disabled=ix===views.length-1;status.textContent=`${ix+1} / ${views.length}`;body.scrollTop=0;}
 const nav=el('nav',{className:'content-dialog-nav',attributes:{'aria-label':'Részletek lapozása'}},prev,status,next);nav.hidden=views.length===1;
 dialog.append(el('header',{className:'content-dialog-head'},heading,close),body,nav);
 const old=document.body.style.overflow, oldScroll=window.scrollY;document.body.append(dialog);document.body.style.overflow='hidden';
 const priorState=history.state;let hasHistory=false;
 function finish(pop){if(finished)return;finished=true;current=null;window.removeEventListener('popstate',onPop);window.removeEventListener('hashchange',onHash);document.body.style.overflow=old;try{dialog.close();}catch{}dialog.remove();restore?.();if(trigger?.isConnected){trigger.focus({preventScroll:true});window.scrollTo({top:oldScroll,behavior:'instant'});}if(!pop&&hasHistory&&history.state?.contentDialog===historyId){history.replaceState(priorState,'',location.href);}}
 function onPop(){finish(true);}
 function onHash(){finish(true);}
 function dismiss(){if(hasHistory&&history.state?.contentDialog===historyId){finish(true);history.back();}else finish(true);}
 current={finish};display();try{dialog.showModal();}catch(e){finish(false);return false;}
 try{history.pushState({...priorState,contentDialog:historyId},'',location.href);hasHistory=true;}catch{}
 window.addEventListener('popstate',onPop);window.addEventListener('hashchange',onHash);
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const focusables=[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(n=>n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden');if(!focusables.length){event.preventDefault();heading.focus();return;}const first=focusables[0],last=focusables.at(-1),active=document.activeElement;if(!dialog.contains(active)||event.shiftKey&&(active===first||!focusables.includes(active))||!event.shiftKey&&(active===last||!focusables.includes(active))){event.preventDefault();(event.shiftKey?last:first).focus({preventScroll:true});}});
 close.addEventListener('click',dismiss);dialog.addEventListener('cancel',e=>{e.preventDefault();dismiss();});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismiss();}});
 dialog.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(a&&a.getAttribute('href').startsWith('#/'))finish(false);});
 prev.addEventListener('click',()=>{if(ix>0){ix--;display();heading.focus({preventScroll:true});}});next.addEventListener('click',()=>{if(ix+1<views.length){ix++;display();heading.focus({preventScroll:true});}});close.focus({preventScroll:true});return true;
}
/** Existing closed content panels keep their real DOM; no cloned handlers or lost state. */
export function installMobilePanelDialogs(root){
 const selectors=['.mobile-feature-program','.mobile-feature-event','.mobile-admission-event','.mobile-admission-process','.mobile-admission-sources','.school-news-story-details','.mobile-timetable-bells'];
 const handler=e=>{const summary=e.target.closest('summary');const details=summary?.parentElement;if(!details||!selectors.some(s=>details.matches(s)))return;
  const title=details.closest('.school-news-story')?.querySelector('h2')?.textContent||summary.textContent.trim();
  const nodes=[...details.children].filter(n=>n!==summary);if(!nodes.length)return;
  e.preventDefault();details.open=false;const wrap=el('div',{className:'content-transferred'});nodes.forEach(n=>wrap.append(n));
  if(!openContentDialog({title,trigger:summary,views:[()=>wrap],restore:()=>details.append(...nodes)}))details.append(...nodes);
 };
 root.addEventListener('click',handler);return()=>{root.removeEventListener('click',handler);closeContentDialog();};
}
function itemView(config,item,kind){
 const body=el('div',{className:'content-item-detail'},el('p',{className:'content-kicker',text:item.source==='demo'?'MINTA · nem intézményi eredmény':'Saját készítésű tudásanyag'}));
 if(kind==='quiz'){
  const feedback=el('p',{className:'content-feedback',attributes:{role:'status','aria-live':'polite'}});const opts=el('div',{className:'content-quiz-options'});
  item.options.forEach((v,i)=>{const b=btn(v);b.addEventListener('click',()=>{feedback.textContent=(i===item.correct?'Helyes! ':'Nem ez a helyes válasz. ')+item.explanation;[...opts.children].forEach((n,j)=>{n.disabled=true;n.dataset.result=j===item.correct?'correct':j===i?'wrong':'';});});opts.append(b);});body.append(opts,feedback);
 }else if(kind==='stats')body.append(el('div',{className:'content-metrics'},el('div',{},el('strong',{text:item.minutes+' perc'}),el('span',{text:'Gyakorlási idő'})),el('div',{},el('strong',{text:item.sessions}),el('span',{text:'Alkalom'}))),el('p',{text:'Szemléltető, fiktív adat; nem használható valódi sportolói teljesítmény értékelésére.'}));
 else body.append(el('p',{text:item.summary}));
 return body;
}
export function collectionView(config,collectionId,platform){
 const data=config.contentExpansion?.collections?.[collectionId];if(!data)return null;
 const section=el('section',{className:`content-collection content-collection-${platform}`,attributes:{'aria-label':data.title}});
 const query=el('input',{attributes:{type:'search','aria-label':'Keresés a gyűjteményben',placeholder:'Keresés…',autocomplete:'off'}}),category=el('select',{attributes:{'aria-label':'Kategória szűrése'}}),sort=el('select',{attributes:{'aria-label':'Rendezés'}});
 const options=['Összes',...new Set(data.items.map(i=>i.category))];options.forEach((v,i)=>category.append(el('option',{text:v,attributes:{value:i===0?'all':v}})));
 [['relevance','Relevancia / eredeti sorrend'],['title','Cím szerint A–Z'],['reverse','Cím szerint Z–A']].forEach(([v,t])=>sort.append(el('option',{text:t,attributes:{value:v}})));
 const count=el('p',{className:'content-count',attributes:{role:'status','aria-live':'polite'}}),grid=el('div',{className:'content-grid'}),more=btn('További elemek'),step=platform==='mobile'?8:12;
 let limit=step;
 function render(){
  const words=norm(query.value).split(/\s+/).filter(Boolean);let matches=data.items.filter(i=>(category.value==='all'||i.category===category.value)&&words.every(w=>norm(i.title+' '+i.category+' '+i.summary).includes(w)));
  if(sort.value!=='relevance')matches.sort((a,b)=>(sort.value==='reverse'?-1:1)*a.title.localeCompare(b.title,'hu'));else if(words.length)matches.sort((a,b)=>words.filter(w=>norm(b.title).includes(w)).length-words.filter(w=>norm(a.title).includes(w)).length);
  count.textContent=`${matches.length} találat · ${Math.min(matches.length,limit)} megjelenítve`;
  const focusedId=document.activeElement?.dataset?.itemId;
  const cards=matches.slice(0,limit).map(item=>{const b=el('button',{className:'content-tile',attributes:{type:'button','data-item-id':item.id,'aria-haspopup':'dialog'}},el('span',{className:'content-kicker',text:item.category}),el('strong',{text:item.title}),el('span',{className:'content-tile-summary',text:data.kind==='quiz'?'Tudáspróba':item.summary}),el('span',{className:'content-tile-arrow',text:'Megnyitás ›'}));b.addEventListener('click',()=>openContentDialog({title:item.title,trigger:b,views:[()=>itemView(config,item,data.kind)]}));return b;});
  grid.replaceChildren(...cards);if(!matches.length)grid.append(el('p',{className:'content-empty',text:'Nincs találat. Próbálj másik kifejezést vagy kategóriát.'}));more.hidden=matches.length<=limit;
  if(focusedId)grid.querySelector(`[data-item-id="${focusedId}"]`)?.focus({preventScroll:true});
 }
 [query,category,sort].forEach(input=>input.addEventListener(input===query?'input':'change',()=>{limit=step;render();}));more.addEventListener('click',()=>{limit+=step;render();});
 section.append(el('header',{className:'content-collection-head'},el('p',{className:'content-kicker',text:data.kind==='stats'?'DEMONSTRÁCIÓS ADATOK':'TUDÁSTÁR · SAJÁT KÉSZÍTÉSŰ ANYAGOK'}),el('h2',{text:data.title}),el('p',{text:`${data.items.length} különböző elem · keresés, kategória és rendezés`})),el('div',{className:'content-filters'},query,category,sort),count);
 if(data.kind==='stats'){
  const graph=el('div',{className:'content-chart',attributes:{role:'img','aria-label':'Az első 10 fiktív hét gyakorlási ideje, percben'}});
  for(const i of data.items.slice(0,10))graph.append(el('div',{className:'content-bar-row'},el('span',{text:i.title.split('–')[0]}),el('span',{className:'content-bar',attributes:{style:`--bar:${i.minutes/270*100}%`}}),el('strong',{text:String(i.minutes)})));
  section.append(el('h3',{text:'Első tíz mintahét · perc'}),graph);
 }
 section.append(grid,more);render();return section;
}
export function relatedView(config,id){const meta=config.pagePreview.pages[id]?.contentMeta;if(!meta?.related?.length)return null;
 return el('nav',{className:'content-related',attributes:{'aria-label':'Kapcsolódó tartalmak'}},el('h2',{text:'Kapcsolódó oldalak'}),el('div',{},...meta.related.map(r=>el('a',{text:titleFor(config,r),attributes:{href:'#/oldal/'+r}}))));}

export function practicalView(config,id){const n=config.pagePreview.pages[id]?.practicalNote;if(!n)return null;return el('aside',{className:'content-practical'},el('p',{className:'content-kicker',text:'GYAKORLATI ÚTMUTATÓ'}),el('h2',{text:n.title}),el('p',{text:n.text}));}
