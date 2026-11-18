/* Iskolai iránytű – tíz nyilvános, személyesadat-mentes, statikus FTP-eszköz. */
const $=id=>document.getElementById(id);
const make=(tag,cls='',value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e;};
const empty=e=>e.replaceChildren();
const routeUrl=route=>{const hash=/^#\/[a-z0-9/-]+$/i.test(route||'')?route:'#/';return location.pathname.endsWith('/iranytu.html')?'index.html'+hash:hash;};
const routeLink=(route,label='Részletek megnyitása →')=>{const a=make('a','',label);a.href=routeUrl(route);return a;};
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
const dayText=s=>{const d=new Date(s);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('hu-HU',{dateStyle:'medium',timeZone:'Europe/Budapest'}).format(d):'Dátum ellenőrzendő';};
const load=async path=>{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(path+' · HTTP '+r.status);return r.json();};
const safeRead=(key,fallback)=>{try{return JSON.parse(localStorage.getItem('csanadi-r22-'+key))??fallback;}catch{return fallback;}};
const safeWrite=(key,value)=>{try{localStorage.setItem('csanadi-r22-'+key,JSON.stringify(value));return true;}catch{return false;}};
const safeNumber=(value,fallback)=>Number.isSafeInteger(value)&&value>0?value:fallback;
const plainCard=(title,summary,route,badge='')=>{const item=make('article','r22-card');if(badge)item.append(make('span','r22-badge',badge));item.append(make('h3','',title),make('p','',summary));if(route)item.append(routeLink(route));return item;};
let config,content,eventData,mediaData,docData,qrData;

function startTheme(){
 const names={system:'Automatikus',light:'Világos',dark:'Sötét'};
 let preference;try{preference=localStorage.getItem('csanadi-theme')||'system';}catch{preference='system';}
 const apply=()=>{const mode=preference==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):preference;document.documentElement.dataset.theme=mode;
  $('r22-theme').textContent='◐ '+names[preference];const p=config?.theme?.[mode+'Colors'];if(p){const set=(key,value)=>value&&document.documentElement.style.setProperty('--r22-'+key,value);set('bg',p.page);set('card',p.card);set('ink',p.ink);set('muted',p.muted);set('border',p.line);set('green',p.sportGreen);set('yellow',p.sportYellow);}};
 $('r22-theme').addEventListener('click',()=>{const values=['system','light','dark'];preference=values[(values.indexOf(preference)+1)%values.length];try{localStorage.setItem('csanadi-theme',preference);}catch{}apply();});
 const query=matchMedia('(prefers-color-scheme: dark)'),change=()=>{if(preference==='system'&&$('r22-theme')?.isConnected)apply();};
 query.addEventListener('change',change);
 $('r22-theme').closest('.cs-spa-feature')?.addEventListener('csanadi:feature-unmount',()=>query.removeEventListener('change',change),{once:true});
 return apply;
}

function openDay(){
 const list=content.openDayStations,view=$('station-view');let index=0;const completed=new Set();
 const draw=()=>{const item=list[index];empty(view);view.append(plainCard(item.title,item.lead,item.route,item.type));$('station-progress').textContent=`${index+1} / ${list.length} állomás · ${completed.size} megtekintett`;
  $('station-prev').disabled=index===0;$('station-next').textContent=index===list.length-1?'Befejezés':'Következő →';};
 $('station-prev').addEventListener('click',()=>{if(index>0)index--;draw();});
 $('station-next').addEventListener('click',()=>{completed.add(list[index].id);index=Math.min(index+1,list.length-1);draw();if(completed.size===list.length)$('station-progress').textContent=`${list.length} / ${list.length} állomás · A bemutatót végigjártad.`;});
 $('station-reset').addEventListener('click',()=>{completed.clear();index=0;draw();});draw();
}
function pathways(){
 const out=$('path-results'),stage=$('path-stage'),interest=$('path-interest');
 function draw(){empty(out);const list=content.pathways.filter(p=>(stage.value==='all'||p.stage===stage.value)&&(interest.value==='all'||p.interest.includes(interest.value)));
  for(const p of list){const card=plainCard(p.title,p.description,null,p.stage);for(const l of p.routes){card.append(routeLink(l.route,l.label+' →'));}out.append(card);}
  if(!list.length)out.append(make('p','','Ehhez a párosításhoz még nincs összeállított útvonal. Válassz másik érdeklődést.'));
 }stage.addEventListener('change',draw);interest.addEventListener('change',draw);draw();
}
function sustainability(){const out=$('sustainability-results');for(const s of content.sustainability){const card=plainCard(s.title,s.detail,s.route,s.status);
 const p=make('p','r22-metric-empty',s.metrics===null?'Számszerű eredmény: nincs ellenőrzött nyilvános mérés.':String(s.metrics));card.append(p);out.append(card);}}
export function verifiedEvents(items){return (Array.isArray(items)?items:[]).filter(e=>e&&e.verified===true&&e.status==='published'&&typeof e.startsAt==='string'&&!Number.isNaN(Date.parse(e.startsAt))&&/^#\/[a-z0-9/-]+$/i.test(e.route||''));}
function sportsTracker(){
 const out=$('sport-result'),select=$('sport-category'),events=verifiedEvents(eventData.items);
 function shown(){return events.filter(e=>select.value==='all'||['category:sport','category:competition'].includes(e.categoryId));}
 function draw(){empty(out);const list=shown().sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));const stored=safeRead('sport-snapshot',{}),fresh=list.filter(e=>stored[e.id]!==e.startsAt);
  out.append(make('p','r22-status',`${list.length} ellenőrzött közzétett esemény · ${fresh.length} új vagy módosult a legutóbbi helyi jelölés óta.`));
  if(!list.length){out.append(make('p','','Jelenleg nincs külön, ellenőrzött sportesemény a helyi eseménynaptárban. Nincs kitalált esemény; a központ automatikusan megjeleníti a később jóváhagyott sportbejegyzéseket.'));return;}
  const ul=make('ul','r22-list');for(const e of list){const li=make('li');li.append(make('strong','',e.title),make('p','r22-dates',dayText(e.startsAt)),make('p','',e.summary||''),routeLink(e.route));ul.append(li);}out.append(ul);
 }select.addEventListener('change',draw);$('sport-mark').addEventListener('click',()=>{const map=safeRead('sport-snapshot',{});for(const e of shown())map[e.id]=e.startsAt;safeWrite('sport-snapshot',map);draw();});draw();
}
function glossary(){
 const out=$('glossary-results'),query=$('glossary-query'),topic=$('glossary-topic');
 function draw(){empty(out);const list=content.glossary.filter(g=>(topic.value==='all'||topic.value===g.topic)&&normalize(g.hu+' '+g.en+' '+g.definition).includes(normalize(query.value.trim())));
  const table=make('table','r22-dictionary'),header=make('thead'),hr=make('tr');for(const label of ['Magyar','English','Magyarázat'])hr.append(make('th','',label));header.append(hr);table.append(header);
  const tbody=make('tbody');for(const g of list){const tr=make('tr');for(const x of [g.hu,g.en,g.definition])tr.append(make('td','',x));tbody.append(tr);}table.append(tbody);out.append(make('p','r22-kicker',`${list.length} találat`),table);
  if(!list.length)out.append(make('p','','Nincs ilyen fogalom. Próbálj rövidebb keresést!'));
 }query.addEventListener('input',draw);topic.addEventListener('change',draw);draw();
}
function mediaLibrary(){
 const items=(mediaData.items||[]).filter(m=>m&&/^assets\/media\/[a-z0-9/_-]+\.webp$/i.test(m.src||'')&&typeof m.title==='string');
 const select=$('media-category'),query=$('media-query'),out=$('media-results'),more=$('media-more');const max=safeNumber(config.runtime?.round22?.mediaPageSize,12);let limit=max,visible=[],current=0;
 for(const c of [...new Set(items.map(m=>m.category))].sort()){const opt=make('option','',c);opt.value=c;select.append(opt);}
 const dialog=$('media-dialog'),img=$('media-dialog-image');
 const labelOf=m=>m.verifiedSchoolPhoto===true?'Ellenőrzött iskolai fotó':'Bemutató / illusztráció – nem igazolt eseménykép';
 function view(){const m=visible[current];if(!m)return;img.src=m.src;img.alt=m.alt||m.title;$('media-dialog-title').textContent=m.title;$('media-dialog-caption').textContent=(m.alt||m.title)+' · '+labelOf(m)+' · kategória: '+m.category;}
 function step(n){if(!visible.length)return;current=(current+n+visible.length)%visible.length;view();}
 $('media-prev').addEventListener('click',()=>step(-1));$('media-next').addEventListener('click',()=>step(1));$('media-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}if(e.key==='ArrowRight'){e.preventDefault();step(1);}});
 function draw(){empty(out);visible=items.filter(m=>(select.value==='all'||m.category===select.value)&&normalize(m.title+' '+m.alt+' '+m.category).includes(normalize(query.value)));
  for(const [i,m] of visible.slice(0,limit).entries()){const button=make('button','r22-media-card');button.type='button';button.setAttribute('aria-label','Kép megnyitása: '+m.title);const picture=make('img');picture.src=m.thumb||m.src;picture.alt=m.alt||m.title;picture.loading='lazy';picture.decoding='async';const title=make('span');title.append(make('strong','',m.title),make('small','',labelOf(m)));button.append(picture,title);button.addEventListener('click',()=>{current=i;view();dialog.showModal();});out.append(button);}
  more.hidden=visible.length<=limit;if(!visible.length)out.append(make('p','','Nincs a keresésnek megfelelő kép.'));
 }more.addEventListener('click',()=>{limit+=max;draw();});query.addEventListener('input',()=>{limit=max;draw();});select.addEventListener('change',()=>{limit=max;draw();});draw();
}
function affairs(){const out=$('affairs-results'),category=$('affairs-topic');function draw(){empty(out);for(const a of content.affairs.filter(a=>category.value==='all'||a.topic===category.value)){
  const details=make('details','r22-affair'),summary=make('summary','',a.title),ol=make('ol');for(const step of a.steps)ol.append(make('li','',step));details.append(summary,ol,make('p','',a.notice),routeLink(a.route));out.append(details);
 }}category.addEventListener('change',draw);draw();}
function parentCenter(){const out=$('parent-links');for(const item of content.parentSections)out.append(plainCard(item.title,item.summary,item.route,item.category));
 const dates=$('parent-dates'),today=Date.now(),future=verifiedEvents(eventData.items).filter(e=>Date.parse(e.startsAt)>today).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt)).slice(0,safeNumber(config.runtime?.round22?.parentEventLimit,4));
 if(!future.length){dates.append(make('p','','A jelenlegi adatállományban nincs közelgő ellenőrzött esemény.'));return;}
 const list=make('ul','r22-list');for(const e of future){const li=make('li');li.append(make('strong','',e.title),make('p','r22-dates',dayText(e.startsAt)),routeLink(e.route));list.append(li);}dates.append(list);
}
function qrShare(){
 const select=$('qr-content'),environment=$('qr-environment'),out=$('qr-output');
 for(const x of qrData.entries||[]){const o=make('option','',x.label);o.value=x.id;select.append(o);}
 function draw(){empty(out);const entry=qrData.entries.find(x=>x.id===select.value),host=environment.value;
  if(!entry){out.append(make('p','','Jelenleg nincs közzétett cél.'));return;}
  const payload=entry.targets?.[host];if(!payload||!/^assets\/qr\/csanadi-qr-[a-f0-9]{16}\.svg$/.test(payload.svg||'')||!/^https:\/\/vdi06\.github\.io\/csanadi-website\//.test(payload.url||'')){out.append(make('p','','Az adott címhez nem készült ellenőrzött helyi QR-kód.'));return;}
  const wrap=make('div','r22-qr-layout'),image=make('img');image.src=payload.svg;image.alt='QR-kód ehhez: '+entry.label;image.width=250;image.height=250;
  const info=make('div'),url=make('input');url.type='text';url.readOnly=true;url.value=payload.url;url.setAttribute('aria-label','Megosztási webcím');url.addEventListener('focus',()=>url.select());
  const note=make('p','',host==='ftp'?'Az intézményi webcím csak az új változat ellenőrzött élesítése után használható.':'A jelenleg ismert, nyilvános GitHub Pages-előnézet címe.');
  const controls=make('div','r22-actions'),download=make('a','', 'QR-kód SVG mentése');download.href=payload.svg;download.download='csanadi-qr.svg';
  const copy=make('button','','Webcím másolása');copy.type='button';copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(payload.url);copy.textContent='Másolva ✓';}catch{url.select();copy.textContent='Jelöld ki és másold a webcímet';}});
  const open=make('a','','Céloldal megnyitása ↗');open.href=payload.url;open.target='_blank';open.rel='noopener noreferrer';controls.append(copy,download,open);
  info.append(make('p','',entry.label),url,note,controls);wrap.append(image,info);out.append(wrap);
 }select.addEventListener('change',draw);environment.addEventListener('change',draw);draw();
}
function printer(){const controls=$('print-choices'),out=$('print-preview'),status=$('print-state');
 const options=[...content.parentSections,{title:'Fenntarthatósági szemlélet',summary:'A mérőszámok hiánya nem jelent nulla teljesítményt; ellenőrzött nyilvános adat szükséges.',route:'#/iskolank/oko-iskola'}];
 for(const [i,p] of options.entries()){const label=make('label'),input=make('input');input.type='checkbox';input.value=String(i);input.checked=i<3;label.append(input,document.createTextNode(p.title));controls.append(label);}
 const compose=()=>{const chosen=[...controls.querySelectorAll('input:checked')].map(i=>options[Number(i.value)]).filter(Boolean);empty(out);if(!chosen.length){status.textContent='Jelölj ki legalább egy részt!';return false;}
  const header=make('div','r22-print-page');header.append(make('h3','','Csanádi Sportiskola – nyilvános tájékoztató-összeállítás'),make('p','','Tájékoztató, nem hivatalos igazolás. Ellenőrzés dátuma: '+dayText(new Date().toISOString())));out.append(header);
  for(const item of chosen){const section=make('section','r22-print-page');section.append(make('h3','',item.title),make('p','',item.summary),make('p','','Forrásoldal: '+new URL(routeUrl(item.route),location.href).href));out.append(section);}
  status.textContent=`${chosen.length} nyilvános témakörből összeállított nyomtatási nézet. Mentés: a böngésző „Mentés PDF-ként” lehetősége.`;return true;
 };$('print-prepare').addEventListener('click',compose);$('print-go').addEventListener('click',()=>{if(compose())window.print();});compose();
}
async function main(){const applyTheme=startTheme();
 try{config=await load('json/config.json');applyTheme();const path=config.runtime?.round22?.dataPath;
  if(typeof path!=='string'||!/^adatok\/[a-z0-9-]+\.json$/.test(path))throw Error('A 22-es központi adatútvonal hiányzik.');
  const qrPath=config.runtime?.round22?.qrIndexPath;
  if(typeof qrPath!=='string'||!/^adatok\/[a-z0-9-]+\.json$/.test(qrPath))throw Error('Hiányzó QR-index útvonal a központi beállításban.');
  const entries=await Promise.allSettled([load('json/'+path),load('json/adatok/esemenyek.json'),load('json/adatok/kepgaleria.json'),load('json/adatok/dokumentumok.json'),load('json/'+qrPath)]);
  if(entries[0].status!=='fulfilled')throw entries[0].reason;content=entries[0].value;
  if(!Array.isArray(content.openDayStations)||!Array.isArray(content.glossary)||content.release!==22)throw Error('Hibás 22-es iránytűadat-szerkezet.');
  eventData=entries[1].status==='fulfilled'?entries[1].value:{items:[]};mediaData=entries[2].status==='fulfilled'?entries[2].value:{items:[]};docData=entries[3].status==='fulfilled'?entries[3].value:{documents:[]};qrData=entries[4].status==='fulfilled'?entries[4].value:{entries:[]};
  openDay();pathways();sustainability();sportsTracker();glossary();mediaLibrary();affairs();parentCenter();qrShare();printer();
  const missing=entries.slice(1).filter(x=>x.status!=='fulfilled').length;$('r22-status').textContent=missing?`A tájékoztató betöltődött, de ${missing} opcionális adatforrás hiányzik. Az érintett rész üres állapotot mutat.`:'Az iránytű tíz eszköze betöltődött. A személyes választások ezen a készüléken maradnak.';
 }catch(error){console.error('22-es iránytű:',error);$('r22-status').textContent='Nem sikerült betölteni az iránytű központi adatait: '+error.message;}
}
export function mountCompass(){return main();}
if(location.pathname.endsWith('/iranytu.html'))mountCompass();
