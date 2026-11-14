/* Csanádi 2026 – képes hírközpont: ellenőrzött tartalom, helyi szűrés, rendezés és lapozás.
 * A képek tematikus illusztrációk, nem az egyes közlemények eseményfotói. */
const SOURCE=new URL('../json/adatok/hirek-hivatalos.json',import.meta.url);
const IMAGE_ROOT='assets/media/web/';
const ILLUSTRATIONS={Sport:'sport-1600.webp',Felvételi:'felveteli-1600.webp',Oktatás:'oktatas-1600.webp',Közlemény:'kozosseg-1600.webp',Archívum:'iskolank-1600.webp',Iskolánk:'iskolank-1600.webp'};
const PAGE_SIZE=6;
const el=(tag,cls='',txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;};
const add=(p,...nodes)=>{p.append(...nodes);return p;};
const normal=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
const validSource=s=>typeof s==='string'&&/^https:\/\/csanadi-bp\.edu\.hu\/[a-z0-9/.-]+$/.test(s);
const validRoute=s=>typeof s==='string'&&/^#\/[a-z0-9/-]+$/.test(s);
const formatDate=s=>s?new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z')):'Dátum nélkül';
async function load(){
 const r=await fetch(SOURCE,{cache:'no-cache'});
 if(!r.ok)throw Error('A hírgyűjtemény jelenleg nem érhető el.');
 const x=await r.json();
 if(x.schemaVersion!=='1.0.0'||x.collectionId!=='collection:hirek-hivatalos'||!Array.isArray(x.items))throw Error('A hírgyűjtemény felépítése hibás.');
 const seen=new Set();
 return x.items.filter(v=>{
  if(!v||v.status!=='verified'||!validSource(v.source)||!validRoute(v.route)||typeof v.title!=='string'||typeof v.summary!=='string')return false;
  if(seen.has(v.id))return false;seen.add(v.id);
  if(v.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(v.date)||Number.isNaN(Date.parse(v.date+'T12:00:00Z'))))return false;
  return true;
 });
}
function sourceLink(item){
 const a=el('a','cs-news-source','Eredeti iskolai közlemény ↗');a.href=item.source;
 a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',item.title+' – hivatalos forrás megnyitása új lapon');return a;
}
function newsCard(item,compact=false){
 const card=el('article','cs-news-card dfg-news-card'+(compact?' dfg-news-compact':''));
 const cover=el('div','dfg-news-cover');const img=el('img');img.src=IMAGE_ROOT+(ILLUSTRATIONS[item.category]||'iskolank-1600.webp');
 img.loading='lazy';img.decoding='async';img.width=480;img.height=270;img.alt='Tematikus iskolai illusztráció – nem a hírben szereplő esemény fényképe';cover.append(img);
 const copy=el('div','dfg-news-body'),meta=el('div','cs-news-meta');
 add(meta,el('span','cs-news-cat',item.category),el('time','dfg-news-date',item.date?formatDate(item.date):'Dátum nélküli közlemény'));
 if(item.date)meta.querySelector('time').dateTime=item.date;
 const title=el('h3','dfg-news-title',item.title),summary=el('p','dfg-news-summary',item.summary),details=el('details','cs-news-detail');
 add(details,el('summary','','További részletek'),el('p','',item.detail||item.summary));
 const link=el('a','cs-news-route','Kapcsolódó oldal →');link.href=item.route;
 add(copy,meta,title,summary,details,add(el('div','cs-news-links'),sourceLink(item),link));return add(card,cover,copy);
}
function safeArchive(items,route){
 if(route.endsWith('/sporthirek'))return items.filter(x=>x.category==='Sport');
 if(route.endsWith('/hirarchivum'))return items.filter(x=>x.category==='Archívum');
 if(route.endsWith('/iskolai-hirek'))return items.filter(x=>x.category!=='Sport');
 if(route.endsWith('/kozlemenyek'))return items.filter(x=>x.category==='Közlemény'||x.category==='Felvételi');
 return items;
}
function sorted(items,order){
 return [...items].sort((a,b)=>{
  if(order==='az')return a.title.localeCompare(b.title,'hu');
  // Dátum nélküli bejegyzés mindig a keltezett közlemények után szerepel.
  const ad=a.date?Date.parse(a.date):null,bd=b.date?Date.parse(b.date):null;
  if(ad===null&&bd!==null)return 1;if(bd===null&&ad!==null)return -1;
  return (ad!==null&&bd!==null?(order==='oldest'?ad-bd:bd-ad):0)||a.title.localeCompare(b.title,'hu');
 });
}
export function renderNewsTeasers(){
 const section=el('section','cs-news-teasers section-wrap'),container=el('div','container-xxl');
 add(container,el('span','section-overline','ISKOLAI AKTUALITÁSOK'),el('h2','section-title','Hírek és fontos időpontok'));
 const grid=el('div','cs-news-grid');container.append(grid);section.append(container);
 load().then(items=>{
  if(!section.isConnected)return;
  sorted(items.filter(x=>x.category!=='Archívum'),'newest').slice(0,3).forEach(x=>grid.append(newsCard(x)));
  if(!grid.childElementCount)grid.append(el('p','dfg-empty','Jelenleg nincs megjeleníthető ellenőrzött hír.'));
 }).catch(err=>grid.append(el('p','dfg-empty',err.message)));
 return section;
}
export function renderNewsCenter(route){
 const section=el('section','cs-news-center dfg-news-center');
 const intro=el('p','cs-news-intro','Ellenőrzött iskolai közlemények – az eredeti forrás közvetlenül minden hírnél elérhető. A képek tematikus illusztrációk.');
 const toolbar=el('div','cs-news-toolbar dfg-news-toolbar');
 const input=el('input','form-control'),category=el('select','form-select'),order=el('select','form-select');
 input.type='search';input.placeholder='Keress címben és leírásban…';input.setAttribute('aria-label','Hírek keresése');input.autocomplete='off';
 category.setAttribute('aria-label','Hírkategória');order.setAttribute('aria-label','Hírek rendezése');
 for(const [key,label] of [['newest','Legújabb dátum elöl'],['oldest','Legrégebbi dátum elöl'],['az','Cím szerint (A–Z)']]){const opt=el('option','',label);opt.value=key;order.append(opt);}
 const clear=el('button','dfg-reset','Szűrők törlése');clear.type='button';
 add(toolbar,input,category,order,clear);
 const count=el('p','cs-news-count');count.setAttribute('role','status');count.setAttribute('aria-live','polite');
 const grid=el('div','cs-news-grid'),pager=el('nav','dfg-news-pager');pager.setAttribute('aria-label','Hírek lapozása');
 add(section,intro,toolbar,count,grid,pager);
 let items=[],page=1;
 function draw(){
  grid.replaceChildren();pager.replaceChildren();
  const q=normal(input.value.trim());const matches=sorted(items.filter(x=>(!category.value||x.category===category.value)&&normal(x.title+' '+x.summary+' '+x.detail+' '+x.category).includes(q)),order.value);
  const total=Math.max(1,Math.ceil(matches.length/PAGE_SIZE));page=Math.min(page,total);
  count.textContent=matches.length+' ellenőrzött hír · '+(matches.length?`${page}. oldal / ${total}`:'nincs találat');
  matches.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).forEach(x=>grid.append(newsCard(x)));
  if(!matches.length)grid.append(el('p','dfg-empty','A keresés nem adott találatot. Módosítsd a szűrőket.'));
  if(total>1){
   const prev=el('button','','← Előző'),next=el('button','','Következő →');prev.type=next.type='button';prev.disabled=page===1;next.disabled=page===total;
   prev.addEventListener('click',()=>{page--;draw();count.scrollIntoView({block:'nearest',behavior:'instant'});});
   next.addEventListener('click',()=>{page++;draw();count.scrollIntoView({block:'nearest',behavior:'instant'});});
   add(pager,prev,el('span','',`${page} / ${total}`),next);
  }
 }
 const resetPage=()=>{page=1;draw();};
 input.addEventListener('input',resetPage);category.addEventListener('change',resetPage);order.addEventListener('change',resetPage);
 clear.addEventListener('click',()=>{input.value='';category.value='';order.value='newest';resetPage();input.focus();});
 load().then(data=>{
  if(!section.isConnected)return;
  items=safeArchive(data,route);
  for(const value of ['',...new Set(items.map(x=>x.category))]){const opt=el('option','',value||'Minden kategória');opt.value=value;category.append(opt);}
  draw();
 }).catch(err=>{count.textContent='Hírbetöltési hiba';grid.replaceChildren(el('p','dfg-empty',err.message));});
 return section;
}
