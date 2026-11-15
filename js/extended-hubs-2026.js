import {formatBytes} from './format-bytes.js?v=20261115r19';


 
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
const append=(to,...nodes)=>{nodes.filter(Boolean).forEach(n=>to.append(n));return to;};
const DATA_ROOT=new URL('../json/', import.meta.url);
const getData=async rel=>{const r=await fetch(new URL(rel,DATA_ROOT),{cache:'no-store'});if(!r.ok)throw Error('A JSON-fájl nem érhető el');return r.json();};
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
 const finder=make('div','ext26-filter-row csn18-controls'),sportFilter=make('select'),sportSearch=make('input'),sportPeriod=make('select'),sportCards=make('div','csn18-record-grid'),sportInfo=make('p','ext26-note');
 sportSearch.type='search';sportSearch.placeholder='Ellenőrzött eredmény keresése';sportSearch.setAttribute('aria-label','Sporteredmények keresése');
 sportFilter.setAttribute('aria-label','Sportág szűrése');sportPeriod.setAttribute('aria-label','Eredmény időszaka');
 for(const [title,control] of [['Sportág',sportFilter],['Időszak',sportPeriod],['Keresés',sportSearch]]){const label=make('label','ext26-field');label.append(make('span','',title),control);finder.append(label);}
 append(root,heading('EREDMÉNYTÁR','Hitelesített sporteredmények','A forrásbejegyzésre kattintva a kapcsolódó oldal vagy az ellenőrzött külső forrás nyílik meg.'),finder,sportInfo,sportCards);
 getData('adatok/sportsikerek.json').then(data=>{
  if(!root.isConnected)return;
  const entries=(data.items||[]).filter(x=>x.status==='verified'&&x.verified===true&&typeof x.category==='string');
  const counts=new Map();entries.forEach(e=>counts.set(e.category,(counts.get(e.category)||0)+1));
  const rows=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'hu'));
  sportFilter.replaceChildren(new Option('Összes sportág','all'));rows.forEach(([name])=>sportFilter.add(new Option(name,name)));
  const years=[...new Set(entries.map(x=>x.publishedAt&&Number.isFinite(Date.parse(x.publishedAt))?new Date(x.publishedAt).getFullYear().toString():'undated'))].sort((a,b)=>b.localeCompare(a));
  sportPeriod.replaceChildren(new Option('Minden időszak','all'));
  years.forEach(year=>sportPeriod.add(new Option(year==='undated'?'Dátum nélkül / történeti':year,year)));
  let chart=null;
  const redrawBars=filtered=>{
   const counts=new Map();for(const entry of filtered)counts.set(entry.category,(counts.get(entry.category)||0)+1);
   const displayed=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'hu')),max=Math.max(1,...displayed.map(r=>r[1]));
   bars.replaceChildren();
   for(const [name,count] of displayed){const line=make('div','ext26-bar-row');line.setAttribute('aria-label',`${name}: ${count} bejegyzés`);
    const label=make('span','',name),track=make('div','ext26-bar-track'),fill=make('span','ext26-bar-fill'),value=make('strong','',count);
    fill.style.width=(100*count/max)+'%';track.append(fill);append(line,label,track,value);bars.append(line);
   }
   if(chart){const palette=setting('theme.'+(document.documentElement.dataset.theme==='dark'?'dark':'light')+'Colors');chart.data.labels=displayed.map(r=>r[0]);chart.data.datasets[0].data=displayed.map(r=>r[1]);chart.data.datasets[0].backgroundColor=[palette.sportYellow,palette.sportGreen,...palette.chartOtherColors];chart.options.plugins.legend.labels.color=palette.ink;chart.update();}
  };
  const renderCards=()=>{
   const query=tokenize(sportSearch.value),filtered=entries.filter(entry=>
    (sportFilter.value==='all'||entry.category===sportFilter.value)&&
    (sportPeriod.value==='all'||(entry.publishedAt&&Number.isFinite(Date.parse(entry.publishedAt))?new Date(entry.publishedAt).getFullYear().toString():'undated')===sportPeriod.value)&&
    query.every(word=>tokenize([entry.title,entry.summary,entry.category].join(' ')).some(part=>part.includes(word))));
   const limit=settingNumber('runtime.sportsResults.maximumPreviewCards');sportCards.replaceChildren();
   sportInfo.textContent=`${filtered.length} ellenőrzött bejegyzés, ebből ${Math.min(filtered.length,limit)} látható. A dátum nélküli történeti eredményekhez nem találunk ki évszámot.`;
   for(const entry of filtered.slice(0,limit))sportCards.append(itemLink(entry.title,entry.summary||entry.category,safeRoute(entry.links?.results),'✓ '+entry.category));
   if(!filtered.length)sportCards.append(make('p','ext26-empty','Nincs megfelelő ellenőrzött eredmény.'));
   redrawBars(filtered);
  };
  [sportFilter,sportPeriod,sportSearch].forEach(control=>control.addEventListener('input',renderCards));renderCards();
  if(!rows.length){state.textContent='Nincsenek ellenőrzött sportági bejegyzések.';graph.hidden=true;return;}
  state.textContent=`${rows.length} sportág · ${entries.length} ellenőrzött, közzétett bejegyzés · helyi JSON-adatok.`;
  const btn=make('button','ext26-chart-upgrade','Grafikus diagram bekapcsolása (CDN, opcionális)');btn.type='button';
  btn.setAttribute('aria-label','Opcionális Chart.js diagram betöltése CDN-ről');graph.replaceChildren(btn,canvas);canvas.hidden=true;
  btn.addEventListener('click',async()=>{
   btn.disabled=true;btn.textContent='Diagram betöltése…';
   try{
    if(!window.Chart){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js';script.crossOrigin='anonymous';script.onload=resolve;script.onerror=()=>reject(Error('A CDN nem elérhető'));document.head.append(script);setTimeout(()=>{if(!window.Chart)reject(Error('Időtúllépés'))},settingNumber('runtime.timing.chartLoadTimeoutMs'));});}
    if(!window.Chart)throw Error('A diagramkönyvtár nem indult');
    const mode=document.documentElement.dataset.theme==='dark'?'dark':'light';const palette=setting('theme.'+mode+'Colors');
    canvas.hidden=false;btn.remove();chart=new window.Chart(canvas,{type:'doughnut',data:{labels:[],datasets:[{data:[],backgroundColor:[]}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:palette.ink}}}}});renderCards();
   }catch(e){canvas.hidden=true;btn.disabled=false;btn.textContent='A CDN nem elérhető – az oszlopos diagram továbbra is működik';state.textContent+=' · A külső diagram nem tölthető be, a helyi nézet változatlan.';}
  });
 }).catch(()=>state.textContent='A sportadatok nem tölthetők be.');
 return root;
}

 
export function renderCalendarFilters(){
 const root=make('details','ext26-section ext26-calendar-explorer');
 const summary=make('summary','ext26-disclosure','Részletes eseményszűrő · dátum, kategória és keresés');
 const section=make('div','ext26-calendar-body'),fields=make('div','ext26-filter-row'),results=make('div','ext26-list'),info=make('p','ext26-note','Események betöltése…'),calendar=make('div','csn19-calendar-wrap'),agenda=make('div','csn20-mobile-agenda');
 const search=make('input');search.type='search';search.placeholder='Esemény keresése';search.setAttribute('aria-label','Esemény keresése');
 const category=make('select');category.setAttribute('aria-label','Esemény kategóriája');
 const from=make('input');from.type='date';from.setAttribute('aria-label','Kezdődátum');
 const until=make('input');until.type='date';until.setAttribute('aria-label','Végdátum');
 const clear=make('button','','Szűrők törlése');clear.type='button';
 const view=make('select');view.setAttribute('aria-label','Naptár nézete');
 [['day','Nap'],['week','Hét'],['month','Hónap']].forEach(([value,title])=>view.add(new Option(title,value)));
 view.value=setting('runtime.calendar.defaultView');
 const date=make('input');date.type='date';date.setAttribute('aria-label','Naptár kiválasztott napja');
 date.value=new Date().toLocaleDateString('sv-SE');
 const back=make('button','','← Előző'),next=make('button','','Következő →');back.type='button';next.type='button';
 const exportICS=make('button','csn20-export-ics','ICS letöltése'),print=make('button','csn20-print-calendar','Naptár nyomtatása');exportICS.type='button';print.type='button';
 const navigator=make('div','csn18-calendar-navigation');
 for(const [title,input] of [['Nézet',view],['Nap',date]]){const label=make('label','ext26-field');label.append(make('span','',title),input);navigator.append(label);}
 append(navigator,back,next,exportICS,print);
 const controls=[['Keresés',search],['Kategória',category],['Ettől',from],['Eddig',until]];
 controls.forEach(([text,input])=>{const label=make('label','ext26-field');label.append(make('span','',text),input);fields.append(label);});fields.append(clear);
 append(section,navigator,fields,info,calendar,agenda,results);root.append(summary,section);
 let items=[],categories=[];const all=()=>{const option=make('option','','Összes kategória');option.value='all';return option;};
 const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 function period(){const d=new Date(date.value+'T12:00:00');if(!Number.isFinite(d.getTime()))return null;
  let begin=new Date(d),end=new Date(d);
  if(view.value==='week'){begin.setDate(begin.getDate()-(begin.getDay()+6)%7);end=new Date(begin);end.setDate(end.getDate()+6);}
  if(view.value==='month'){begin=new Date(d.getFullYear(),d.getMonth(),1,12);end=new Date(d.getFullYear(),d.getMonth()+1,0,12);}
  return [iso(begin),iso(end)];
 }
 function matchesFilters(x,q){return (category.value==='all'||x.categoryId===category.value)&&(!from.value||x.startsAt.slice(0,10)>=from.value)&&(!until.value||x.startsAt.slice(0,10)<=until.value)&&(!q||tokenize([x.title,x.summary,x.location].join(' ')).join(' ').includes(q));}
 function eventEnd(x){const end=x.endsAt||x.startsAt;return Number.isFinite(Date.parse(end))?end.slice(0,10):x.startsAt.slice(0,10);}
 function drawCalendar(rows,range){
  calendar.replaceChildren();calendar.dataset.view=view.value;if(!range)return;
  const monday=['H','K','Sze','Cs','P','Szo','V'],chosenDate=date.value;
  const begin=new Date(range[0]+'T12:00:00'),end=new Date(range[1]+'T12:00:00');
  if(view.value==='month')begin.setDate(begin.getDate()-(begin.getDay()+6)%7);
  const days=[];const last=new Date(end);
  if(view.value==='month')last.setDate(last.getDate()+(7-last.getDay())%7);
  for(let d=new Date(begin);d<=last;d.setDate(d.getDate()+1))days.push(iso(d));
  const columns=view.value==='day'?1:7,table=make('table','csn19-calendar-grid');
  table.setAttribute('aria-label',`Eseménynaptár – ${range.join(' – ')}`);
  const caption=make('caption','',view.options[view.selectedIndex].text+' · '+range.join(' – '));table.append(caption);
  const head=make('thead'),hr=make('tr');(columns===1?['Nap']:monday).forEach(name=>{const th=make('th','',name);th.scope='col';hr.append(th);});head.append(hr);table.append(head);
  const tbody=make('tbody'),maxPerDay=settingNumber('runtime.display.calendarCollapsedItems');
  for(let i=0;i<days.length;i+=columns){const tr=make('tr');
   for(const day of days.slice(i,i+columns)){const td=make('td','csn19-calendar-day');
    if(day===new Date().toLocaleDateString('sv-SE'))td.classList.add('is-today');
    if(day<range[0]||day>range[1])td.classList.add('is-outside');
    const select=make('button','csn19-calendar-date',String(Number(day.slice(-2))));select.type='button';
    select.setAttribute('aria-label',day+' kiválasztása');if(day===chosenDate)select.setAttribute('aria-current','date');
    select.addEventListener('click',()=>{date.value=day;if(view.value==='month')view.value='day';draw();});
    td.append(select);
    const onDay=rows.filter(x=>x.startsAt.slice(0,10)<=day&&eventEnd(x)>=day);
    for(const x of onDay.slice(0,maxPerDay)){const link=make('a','csn19-calendar-event',x.title);link.href=safeRoute(x.route);link.title=`${x.title} · ${x.location||'Részletek az eseményoldalon'}`;td.append(link);}
    if(onDay.length>maxPerDay)td.append(make('span','csn19-calendar-more','+'+(onDay.length-maxPerDay)+' esemény'));
    if(!onDay.length&&columns===1)td.append(make('span','csn19-calendar-none','Nincs közzétett esemény.'));
    tr.append(td);
   }tbody.append(tr);
  }table.append(tbody);calendar.append(table);
 }
 function draw(){results.replaceChildren();const q=tokenize(search.value).join(' '),range=period();const relevant=items.filter(x=>matchesFilters(x,q));const found=relevant.filter(x=>range&&x.startsAt.slice(0,10)<=range[1]&&eventEnd(x)>=range[0]);
  drawCalendar(relevant,range);
  agenda.replaceChildren(make('h3','','Mobilos napirend'));const grouped=new Map();for(const event of found){const day=event.startsAt.slice(0,10);if(!grouped.has(day))grouped.set(day,[]);grouped.get(day).push(event);}for(const [day,events] of grouped){const group=make('section','csn20-agenda-group');append(group,make('h4','',day));for(const event of events)group.append(itemLink(event.title,event.location||'Részletek',safeRoute(event.route),'Esemény'));agenda.append(group);}if(!found.length)agenda.append(make('p','','Nincs esemény a kiválasztott időszakban.'));
  const limit=settingNumber('runtime.calendar.maximumVisibleEvents');info.textContent=`${range?range.join(' – '):'Válassz napot'} · ${found.length} ellenőrzött esemény, ${Math.min(found.length,limit)} megjelenítve.`;
  for(const x of found.slice(0,limit)){const a=itemLink(x.title,`${format(x.startsAt)} · ${x.location||'Helyszín az eseményoldalon'}`,safeRoute(x.route),'Esemény');results.append(a);}
  if(!found.length)results.append(make('p','ext26-empty','A kiválasztott feltételekhez nincs közzétett esemény.'));
 }
 [search,category,from,until].forEach(x=>x.addEventListener('input',draw));
 [view,date].forEach(x=>x.addEventListener('change',draw));
 const step=direction=>{const d=new Date(date.value+'T12:00:00');if(!Number.isFinite(d.getTime()))return;
  if(view.value==='month')d.setMonth(d.getMonth()+direction);
  else d.setDate(d.getDate()+direction*(view.value==='week'?7:1));
  date.value=iso(d);draw();};back.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
 clear.addEventListener('click',()=>{search.value='';category.value='all';from.value='';until.value='';draw();});
 const icsEscape=value=>String(value??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 const icsUTC=value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 exportICS.addEventListener('click',()=>{const range=period(),q=tokenize(search.value).join(' ');const selected=items.filter(x=>range&&matchesFilters(x,q)&&x.startsAt.slice(0,10)<=range[1]&&eventEnd(x)>=range[0]);const stamp=icsUTC(new Date().toISOString());const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Csanadi Sportiskola 2026//HU','CALSCALE:GREGORIAN'];for(const x of selected){if(!Number.isFinite(Date.parse(x.startsAt)))continue;lines.push('BEGIN:VEVENT','UID:'+icsEscape(x.id)+'@csanadi-school','DTSTAMP:'+stamp,'DTSTART:'+icsUTC(x.startsAt));if(x.endsAt&&Number.isFinite(Date.parse(x.endsAt)))lines.push('DTEND:'+icsUTC(x.endsAt));lines.push('SUMMARY:'+icsEscape(x.title),'DESCRIPTION:'+icsEscape(x.summary),'LOCATION:'+icsEscape(x.location),'END:VEVENT');}lines.push('END:VCALENDAR');const blob=new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),a=make('a');a.href=url;a.download='csanadi_esemenyek.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);info.textContent=`${selected.length} esemény helyi ICS-fájlba exportálva. A dátumok a forrás JSON alapján szerepelnek.`;});
 print.addEventListener('click',()=>window.print());
 getData('adatok/esemenyek.json').then(data=>{items=(data.items||[]).filter(x=>x.status==='published'&&x.verified===true&&Number.isFinite(Date.parse(x.startsAt))).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));categories=data.categories||[];
  category.replaceChildren(all());categories.forEach(c=>{const o=make('option','',c.label);o.value=c.id;category.append(o);});draw();
 }).catch(()=>info.textContent='Az események JSON-adatállománya nem tölthető be.');
 return root;
}

 
export function renderDocumentFinder(){
 const root=make('details','ext26-section ext26-doc-finder'),summary=make('summary','ext26-disclosure','Dokumentumok gyorskeresése és PDF-előnézete');
 const controls=make('div','ext26-filter-row'),search=make('input'),list=make('div','ext26-list'),status=make('p','ext26-note','Dokumentumok betöltése…');search.type='search';search.placeholder='Cím, kategória, tartalom…';search.setAttribute('aria-label','Dokumentumok gyorskeresése');
 const category=make('select'),sort=make('select');category.setAttribute('aria-label','Dokumentumkategória');sort.setAttribute('aria-label','Dokumentumok rendezése');
 [['title','Cím szerint'],['version','Verzió szerint'],['date','Frissítés szerint']].forEach(([value,title])=>sort.add(new Option(title,value)));
 const modal=make('dialog','ext26-pdf-dialog');modal.setAttribute('aria-label','PDF előnézet');
 const close=make('button','','Bezárás ×');close.type='button';close.addEventListener('click',()=>modal.close());
 const label=make('h3','','PDF előnézet'),frame=make('iframe');frame.title='PDF-fájl előnézete';frame.loading='lazy';
 const open=make('a','','PDF megnyitása új lapon');open.target='_blank';open.rel='noopener noreferrer';
 const meta=make('p','csn19-doc-preview-meta'),fallback=make('p','csn19-doc-preview-help','Ha a PDF nem jelenik meg a böngészőben, nyisd meg új lapon vagy töltsd le a dokumentumot.');
 const download=make('a','','PDF letöltése');download.setAttribute('download','');
 append(modal,close,label,meta,frame,fallback,open,download);modal.addEventListener('close',()=>frame.removeAttribute('src'));
 for(const [title,control] of [['Keresés',search],['Kategória',category],['Rendezés',sort]]){const label=make('label','ext26-field');label.append(make('span','',title),control);controls.append(label);}
 append(root,summary,controls,status,list,modal);
 let docs=[];function draw(){list.replaceChildren();const q=tokenize(search.value);const rows=docs.filter(d=>(category.value==='all'||d.categoryId===category.value)&&q.every(w=>tokenize([d.title,d.summary,d.description,d.categoryId,(d.tags||[]).join(' ')].join(' ')).some(part=>part.includes(w))));
  if(sort.value==='version')rows.sort((a,b)=>String(b.version||'').localeCompare(String(a.version||''),'hu',{numeric:true}));
  else if(sort.value==='date')rows.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
  else rows.sort((a,b)=>a.title.localeCompare(b.title,'hu'));
  status.textContent=`${rows.length} közzétett dokumentum. A fájlok helyben, a honlap tárhelyéről nyílnak meg.`;
  for(const d of rows){const row=make('div','ext26-doc-row');append(row,make('strong','',d.title),make('small','',d.summary||''),make('small','',`Verzió: ${d.version||'nincs megadva'} · Méret: ${typeof d.fileSizeBytes==='number'?formatBytes(d.fileSizeBytes):'ismeretlen'}`));const file=safePDF(d.filePath);
   if(Array.isArray(d.versionHistory)&&d.versionHistory.length){const history=make('details','csn19-doc-history'),historyTitle=make('summary','','Verziótörténet · '+d.versionHistory.length+' bejegyzés');history.append(historyTitle);for(const item of d.versionHistory){history.append(make('p','',`v${item.version||'?'} · ${item.date||'Dátum nélkül'} · ${item.change||''}`));}row.append(history);}
   if(file){const btn=make('button','','Előnézet');btn.type='button';btn.addEventListener('click',()=>{label.textContent=d.title;meta.textContent=`Verzió: ${d.version||'nincs megadva'} · Méret: ${typeof d.fileSizeBytes==='number'?formatBytes(d.fileSizeBytes):'ismeretlen'}`;frame.src=file+'#toolbar=1';open.href=file;download.href=file;download.download=d.fileName||'';modal.showModal();});const direct=make('a','','Letöltés');direct.href=file;direct.download=d.fileName||'';append(row,btn,direct);}
   list.append(row);
  }
  if(!rows.length)list.append(make('p','ext26-empty','Nincs megfelelő dokumentum.'));
 }
 [search,category,sort].forEach(control=>control.addEventListener('input',draw));
 getData('adatok/dokumentumok.json').then(data=>{docs=(data.documents||[]).filter(d=>d.status==='published');category.replaceChildren(new Option('Összes kategória','all'));for(const item of data.categories||[])category.add(new Option(item.label,item.id));draw();}).catch(()=>status.textContent='A dokumentumjegyzék nem tölthető be.');
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
 addFrom('Esemény','adatok/esemenyek.json',data=>(data.items||[]).filter(d=>d.status==='published'&&d.verified===true&&d.title).map(d=>({title:d.title,desc:d.summary||d.location||'',href:safeRoute(d.route)})));
 addFrom('Sporteredmény','adatok/sportsikerek.json',data=>(data.items||[]).filter(d=>d.status==='verified'&&d.verified===true&&d.title).map(d=>({title:d.title,desc:d.summary||d.category||'',href:safeRoute(d.links?.results)})));
 addFrom('Dokumentum','adatok/dokumentumok.json',data=>(data.documents||[]).filter(d=>d.status==='published'&&d.title).map(d=>({title:d.title,desc:d.summary||'',href:safePDF(d.filePath)||'#/informaciok/dokumentumtar'})));
 if(!candidates.length)list.append(itemLink('Főmenü','Fedezd fel az iskola témaköreit','#/','Navigáció'));
 return root;
}

 
export function enhanceGallery(root){
 const library=root.querySelector('#media26-library');if(!library || library.dataset.extEnhanced)return;
 library.dataset.extEnhanced='1';const dialog=library.querySelector('.media26-lightbox');
 const image=dialog?.querySelector('img');if(!dialog||!image)return;
 const counter=dialog.querySelector('.media26-lightbox-count');counter?.setAttribute('aria-live','polite');
 const link=make('a','ext26-gallery-skip','Ugrás a galéria képrácsához ↓');link.href='#media26-library-tiles';library.querySelector('.media26-grid')?.setAttribute('id','media26-library-tiles');library.querySelector('.media26-heading')?.after(link);
}
import {setting,settingNumber} from './site-settings-2026.js';
