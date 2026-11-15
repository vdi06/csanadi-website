
 
const SOURCE=new URL('../json/adatok/hirek-hivatalos.json',import.meta.url);
import {inspectNewsRecord} from './news-policy-2026.js';
import {setting} from './site-settings-2026.js';
const IMAGE_ROOT='assets/media/web/';
const ILLUSTRATIONS={Sport:'sport-1600.webp',Felvételi:'felveteli-1600.webp',Oktatás:'oktatas-1600.webp',Közlemény:'kozosseg-1600.webp',Archívum:'iskolank-1600.webp',Iskolánk:'iskolank-1600.webp'};
const el=(tag,cls='',txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;};
const add=(p,...nodes)=>{p.append(...nodes);return p;};
const normal=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
const formatDate=s=>s?new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z')):'Dátum nélkül';
async function load(){
 const r=await fetch(SOURCE,{cache:'no-cache'});
 if(!r.ok)throw Error('A hírgyűjtemény jelenleg nem érhető el.');
 const x=await r.json();
 if(x.schemaVersion!=='1.0.0'||x.collectionId!=='collection:hirek-hivatalos'||!Array.isArray(x.items))throw Error('A hírgyűjtemény felépítése hibás.');
 const seen=new Set();
 return x.items.filter(v=>{
  if(!inspectNewsRecord(v,{privacy:setting('privacy'),runtime:{news:setting('runtime.news')}}).ok)return false;
  if(seen.has(v.id))return false;seen.add(v.id);
  if(v.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(v.date)||Number.isNaN(Date.parse(v.date+'T12:00:00Z'))))return false;
  return true;
 });
}
function sourceLink(item){
 const a=el('a','cs-news-source','Eredeti iskolai közlemény ↗');a.href=item.url;
 a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',item.title+' – hivatalos forrás megnyitása új lapon');return a;
}
function newsCard(item,compact=false){
 const card=el('article','cs-news-card dfg-news-card'+(compact?' dfg-news-compact':'')+(item.status==='sample'?' cs-news-sample':''));
 const cover=el('div','dfg-news-cover');const img=el('img');img.src=IMAGE_ROOT+(ILLUSTRATIONS[item.category]||'iskolank-1600.webp');
 img.loading='lazy';img.decoding='async';img.width=480;img.height=270;img.alt='Iskolai témájú kép';cover.append(img);
 const copy=el('div','dfg-news-body'),meta=el('div','cs-news-meta');
 add(meta,el('span','cs-news-cat',item.status==='sample'?'FIKTÍV MINTA · '+item.category:item.category),el('time','dfg-news-date',item.status==='sample'?'Nem valós hír':item.date?formatDate(item.date):'Dátum nélküli közlemény'));
 if(item.date)meta.querySelector('time').dateTime=item.date;
 const title=el('h3','dfg-news-title',item.title),summary=el('p','dfg-news-summary',item.summary),details=el('details','cs-news-detail');
 add(details,el('summary','','További részletek'),el('p','',item.detail||item.summary));
 const link=el('a','cs-news-route','Kapcsolódó oldal →');link.href=item.route;
  
 const original=item.status==='verified'?sourceLink(item):null;
 if(compact){if(original)original.textContent='Eredeti hír ↗';link.textContent='Részletek →';}
 if(compact)add(copy,meta,title,summary,add(el('div','cs-news-links'),...(original?[original]:[]),link));
 else add(copy,meta,title,summary,details,add(el('div','cs-news-links'),...(original?[original]:[]),link));
 return add(card,cover,copy);
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
  sorted(items.filter(x=>x.category!=='Archívum'),'newest').slice(0,settingNumber('runtime.display.newsTeasers')).forEach(x=>grid.append(newsCard(x,true))); 
  if(!grid.childElementCount)grid.append(el('p','dfg-empty','Jelenleg nincs megjeleníthető ellenőrzött hír.'));
 }).catch(err=>grid.append(el('p','dfg-empty',err.message)));
 return section;
}
export function renderNewsCenter(route){
 const section=el('section','cs-news-center dfg-news-center');
 const intro=el('p','cs-news-intro','Ellenőrzött intézményi közlemények és külön, jól jelölt, teljesen fiktív sporthírminták. A MINTA feliratú bejegyzések nem valós személyekről vagy megtörtént eredményekről szólnak.');
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
  const pageSize=settingNumber('runtime.display.newsPageSize');
  const total=Math.max(1,Math.ceil(matches.length/pageSize));page=Math.min(page,total);
  count.textContent=matches.length+' bejegyzés (hírek és minták) · '+(matches.length?`${page}. oldal / ${total}`:'nincs találat');
  matches.slice((page-1)*pageSize,page*pageSize).forEach(x=>grid.append(newsCard(x)));
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
import {settingNumber} from './site-settings-2026.js';
