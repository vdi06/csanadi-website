


 
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
const append=(to,...nodes)=>{nodes.filter(Boolean).forEach(n=>to.append(n));return to;};
const DATA_ROOT=new URL('../json/', import.meta.url);
const getData=async rel=>{const r=await fetch(new URL(rel,DATA_ROOT),{cache:'no-cache'});if(!r.ok)throw Error('A JSON-fájl nem érhető el');return r.json();};
const tokenize=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>3&&!['adatok','informaciok','iskola','iskolai','csanadi','tudnivalok','oldalak','egyeb','tovabbi'].includes(w));
const safeRoute=s=>typeof s==='string'&&/^#\/[a-z0-9/-]*$/.test(s)?s:'#/';
const safePDF=s=>typeof s==='string'&&/^assets\/documents\/[a-z0-9._-]+\.pdf$/.test(s)?s:null;
function heading(eyebrow,title,desc){const h=make('header','ext26-heading');append(h,make('span','section-overline',eyebrow),make('h2','',title),make('p','',desc));return h;}
function itemLink(title,desc,href,meta=''){const link=make('a','ext26-tile');link.href=href;append(link,meta?make('span','ext26-label',meta):null,make('strong','',title),make('small','',desc));return link;}
const format=(d)=>new Intl.DateTimeFormat('hu-HU',{timeZone:setting('modules2026.clock.timezone'),year:'numeric',month:'short',day:'numeric'}).format(new Date(d));

 
export function renderSportsCharts(){
 const root=make('section','ext26-section ext26-charts');append(root,heading('SPORTSTATISZTIKÁK','Sportági áttekintés','Az ábra a közzétett, ellenőrzött eredménybejegyzések darabszámát mutatja. Nem tanuló- vagy csapatlétszám, és nem új sporteredmény.'));
 const grid=make('div','ext26-chart-layout'),bars=make('div','ext26-chart-bars'),graph=make('div','ext26-chart-optional'),state=make('p','ext26-note','Adatok betöltése…');
 const canvas=make('canvas','ext26-chart-canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Sportágak szerinti bejegyzéseloszlás');
 graph.append(canvas);append(grid,bars,graph);append(root,grid,state);
 getData('adatok/sportsikerek.json').then(data=>{
  if(!root.isConnected)return;
  const entries=(data.items||[]).filter(x=>x.status==='verified'&&x.verified===true&&typeof x.category==='string');
  const counts=new Map();entries.forEach(e=>counts.set(e.category,(counts.get(e.category)||0)+1));
  const rows=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'hu'));
  bars.replaceChildren();const max=Math.max(1,...rows.map(r=>r[1]));
  rows.forEach(([name,count])=>{const line=make('div','ext26-bar-row');line.setAttribute('aria-label',`${name}: ${count} bejegyzés`);
   const label=make('span','',name),track=make('div','ext26-bar-track'),fill=make('span','ext26-bar-fill'),value=make('strong','',count);
   fill.style.width=(100*count/max)+'%';track.append(fill);append(line,label,track,value);bars.append(line);
  });
  if(!rows.length){state.textContent='Nincsenek ellenőrzött sportági bejegyzések.';graph.hidden=true;return;}
  state.textContent=`${rows.length} sportág · ${entries.length} ellenőrzött, közzétett bejegyzés · helyi JSON-adatok.`;
  const btn=make('button','ext26-chart-upgrade','Grafikus diagram bekapcsolása (CDN, opcionális)');btn.type='button';
  btn.setAttribute('aria-label','Opcionális Chart.js diagram betöltése CDN-ről');graph.replaceChildren(btn,canvas);canvas.hidden=true;
  btn.addEventListener('click',async()=>{
   btn.disabled=true;btn.textContent='Diagram betöltése…';
   try{
    if(!window.Chart){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js';script.crossOrigin='anonymous';script.onload=resolve;script.onerror=()=>reject(Error('A CDN nem elérhető'));document.head.append(script);setTimeout(()=>{if(!window.Chart)reject(Error('Időtúllépés'))},settingNumber('runtime.timing.chartLoadTimeoutMs'));});}
    if(!window.Chart)throw Error('A diagramkönyvtár nem indult');
    canvas.hidden=false;btn.remove();new window.Chart(canvas,{type:'doughnut',data:{labels:rows.map(r=>r[0]),datasets:[{data:rows.map(r=>r[1]),backgroundColor:['#cfaa60','#264e70','#638b99','#8e7350','#9dbaab','#a4a0c3','#bd8f80','#d2c089']}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:'#76879a'}}}}});
   }catch(e){canvas.hidden=true;btn.disabled=false;btn.textContent='A CDN nem elérhető – az oszlopos diagram továbbra is működik';state.textContent+=' · A külső diagram nem tölthető be, a helyi nézet változatlan.';}
  });
 }).catch(()=>state.textContent='A sportadatok nem tölthetők be.');
 return root;
}

 
export function renderCalendarFilters(){
 const root=make('details','ext26-section ext26-calendar-explorer');
 const summary=make('summary','ext26-disclosure','Részletes eseményszűrő · dátum, kategória és keresés');
 const section=make('div','ext26-calendar-body'),fields=make('div','ext26-filter-row'),results=make('div','ext26-list'),info=make('p','ext26-note','Események betöltése…');
 const search=make('input');search.type='search';search.placeholder='Esemény keresése';search.setAttribute('aria-label','Esemény keresése');
 const category=make('select');category.setAttribute('aria-label','Esemény kategóriája');
 const from=make('input');from.type='date';from.setAttribute('aria-label','Kezdődátum');
 const until=make('input');until.type='date';until.setAttribute('aria-label','Végdátum');
 const clear=make('button','','Szűrők törlése');clear.type='button';
 const controls=[['Keresés',search],['Kategória',category],['Ettől',from],['Eddig',until]];
 controls.forEach(([text,input])=>{const label=make('label','ext26-field');label.append(make('span','',text),input);fields.append(label);});fields.append(clear);
 append(section,fields,info,results);root.append(summary,section);
 let items=[],categories=[];const all=()=>{const option=make('option','','Összes kategória');option.value='all';return option;};
 function draw(){results.replaceChildren();const q=tokenize(search.value).join(' ');const found=items.filter(x=>(category.value==='all'||x.categoryId===category.value)&&(!from.value||x.startsAt.slice(0,10)>=from.value)&&(!until.value||x.startsAt.slice(0,10)<=until.value)&&(!q||tokenize([x.title,x.summary,x.location].join(' ')).join(' ').includes(q)));
  info.textContent=`${found.length} ellenőrzött esemény a megadott szűrés alapján.`;
  for(const x of found){const a=itemLink(x.title,`${format(x.startsAt)} · ${x.location||'Helyszín az eseményoldalon'}`,safeRoute(x.route),'Esemény');results.append(a);}
  if(!found.length)results.append(make('p','ext26-empty','A kiválasztott feltételekhez nincs közzétett esemény.'));
 }
 [search,category,from,until].forEach(x=>x.addEventListener('input',draw));
 clear.addEventListener('click',()=>{search.value='';category.value='all';from.value='';until.value='';draw();});
 getData('adatok/esemenyek.json').then(data=>{items=(data.items||[]).filter(x=>x.status==='published'&&x.verified===true&&Number.isFinite(Date.parse(x.startsAt))).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));categories=data.categories||[];
  category.replaceChildren(all());categories.forEach(c=>{const o=make('option','',c.label);o.value=c.id;category.append(o);});draw();
 }).catch(()=>info.textContent='Az események JSON-adatállománya nem tölthető be.');
 return root;
}

 
export function renderDocumentFinder(){
 const root=make('details','ext26-section ext26-doc-finder'),summary=make('summary','ext26-disclosure','Dokumentumok gyorskeresése és PDF-előnézete');
 const controls=make('div','ext26-filter-row'),search=make('input'),list=make('div','ext26-list'),status=make('p','ext26-note','Dokumentumok betöltése…');search.type='search';search.placeholder='Cím, kategória, tartalom…';search.setAttribute('aria-label','Dokumentumok gyorskeresése');
 const modal=make('dialog','ext26-pdf-dialog');modal.setAttribute('aria-label','PDF előnézet');
 const close=make('button','','Bezárás ×');close.type='button';close.addEventListener('click',()=>modal.close());
 const label=make('h3','','PDF előnézet'),frame=make('iframe');frame.title='PDF-fájl előnézete';frame.loading='lazy';
 const open=make('a','','PDF megnyitása új lapon');open.target='_blank';open.rel='noopener noreferrer';
 append(modal,close,label,frame,open);modal.addEventListener('close',()=>frame.removeAttribute('src'));
 append(controls,search);append(root,summary,controls,status,list,modal);
 let docs=[];function draw(){list.replaceChildren();const q=tokenize(search.value);const rows=docs.filter(d=>q.every(w=>tokenize([d.title,d.summary,d.description,d.categoryId,(d.tags||[]).join(' ')].join(' ')).join(' ').includes(w)));
  status.textContent=`${rows.length} közzétett dokumentum. A fájlok helyben, a honlap tárhelyéről nyílnak meg.`;
  for(const d of rows){const row=make('div','ext26-doc-row');append(row,make('strong','',d.title),make('small','',d.summary||''));const file=safePDF(d.filePath);
   if(file){const btn=make('button','','Előnézet');btn.type='button';btn.addEventListener('click',()=>{label.textContent=d.title;frame.src=file+'#toolbar=1';open.href=file;modal.showModal();});const download=make('a','','Letöltés');download.href=file;download.download=d.fileName||'';append(row,btn,download);}
   list.append(row);
  }
  if(!rows.length)list.append(make('p','ext26-empty','Nincs megfelelő dokumentum.'));
 }
 search.addEventListener('input',draw);
 getData('adatok/dokumentumok.json').then(data=>{docs=(data.documents||[]).filter(d=>d.status==='published');draw();}).catch(()=>status.textContent='A dokumentumjegyzék nem tölthető be.');
 return root;
}

 
export function renderSmartRelations(node,catalog){
 const root=make('section','ext26-section ext26-relations');append(root,heading('FELFEDEZÉS','Kapcsolódó tartalmak','A javaslatok az oldalak megadott címkéi, témái és közzétett dokumentumai alapján készülnek.'));
 const list=make('div','ext26-relation-grid');root.append(list);
 const route=node.page?.schemaExtensions?.route||'#/',words=new Set(tokenize([node.page.title,node.page.summary,...(node.page.tags||[])].join(' ')));
 const candidates=catalog.items.filter(x=>x!==node && x.page?.lifecycle?.status==='published').map(x=>{
  const term=tokenize([x.page.title,x.page.summary,...(x.page.tags||[])].join(' '));
  const overlap=term.filter(w=>words.has(w)).length;
  const sameParent=node.parent&&x.parent===node.parent?12:0;
  const sameBranch=route.split('/')[1]===x.page.schemaExtensions.route.split('/')[1]?5:0;
  return {x,rank:overlap*7+sameParent+sameBranch};
 }).filter(x=>x.rank>0).sort((a,b)=>b.rank-a.rank).slice(0,settingNumber('runtime.display.relatedCards'));
 const used=new Set();candidates.forEach(({x})=>{used.add(x.page.schemaExtensions.route);list.append(itemLink(x.page.title,x.page.summary||'Kapcsolódó oldal',x.page.schemaExtensions.route,'Oldal'));});
 const addFrom=async(kind,path,transform)=>{
  try{const data=await getData(path);if(!root.isConnected)return;const options=transform(data).map(x=>({entry:x,rank:tokenize(x.title+' '+x.desc).filter(w=>words.has(w)).length})).filter(x=>x.rank>0).sort((a,b)=>b.rank-a.rank).slice(0,settingNumber('runtime.display.relatedPreviewCards'));
   for(const {entry} of options)if(!used.has(entry.href)){used.add(entry.href);list.append(itemLink(entry.title,entry.desc,entry.href,kind));}
  }catch(e){console.warn('Kapcsolódó adatok nem elérhetők',path,e);}
 };
 addFrom('Hír','adatok/hirek-hivatalos.json',data=>(data.items||[]).filter(d=>d.status==='verified'&&d.title).map(d=>({title:d.title,desc:d.summary||'',href:'#/hirek-es-esemenyek/hirek'})));
 addFrom('Dokumentum','adatok/dokumentumok.json',data=>(data.documents||[]).filter(d=>d.status==='published'&&d.title).map(d=>({title:d.title,desc:d.summary||'',href:safePDF(d.filePath)||'#/informaciok/dokumentumtar'})));
 if(!candidates.length)list.append(itemLink('Oldaltérkép','Fedezd fel az intézmény témaköreit','#/','Navigáció'));
 return root;
}

 
export function enhanceGallery(root){
 const library=root.querySelector('#media26-library');if(!library || library.dataset.extEnhanced)return;
 library.dataset.extEnhanced='1';const dialog=library.querySelector('.media26-lightbox');
 const image=dialog?.querySelector('img');if(!dialog||!image)return;
 const counter=dialog.querySelector('.media26-lightbox-count');counter?.setAttribute('aria-live','polite');
 dialog.addEventListener('keydown',ev=>{
  const target=ev.target;if(['INPUT','TEXTAREA'].includes(target?.tagName))return;
  if(ev.key==='Home'||ev.key==='End'){
   const n=Number((counter?.textContent||'').split('/')[1]);if(!n)return;
   ev.preventDefault();const button=dialog.querySelector(ev.key==='Home'?'.media26-lightbox-prev':'.media26-lightbox-next');
   const count=Math.max(0,ev.key==='Home'?Number((counter?.textContent||'').split('/')[0])-1:n-Number((counter?.textContent||'').split('/')[0]));
   for(let i=0;i<Math.min(n,count);i++)button?.click();
  }
 });
 image.addEventListener('load',()=>{const next=dialog.querySelector('.media26-lightbox-next');if(!next)return;   });
 const link=make('a','ext26-gallery-skip','Ugrás a galéria képrácsához ↓');link.href='#media26-library-tiles';library.querySelector('.media26-grid')?.setAttribute('id','media26-library-tiles');library.querySelector('.media26-heading')?.after(link);
}
import {setting,settingNumber} from './site-settings-2026.js';
