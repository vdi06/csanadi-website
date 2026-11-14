/* Csanádi 2026 – akadálymentes belépő, tanítási rend, eseményközpont, tantestület, közösség.
 * Közvetlenül a szigorúan validált, közzétehető JSON-adatokat használja.
 * Harmadik féltől származó tartalmat hozzájárulás nélkül nem tölt be.
 */
import {renderDigitalClock} from './experience-2026.js?v=20261114orbit1';
const BASE='json/adatok/';
const ZONE='Europe/Budapest';
const e=(tag,cls='',text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
const add=(p,...nodes)=>{nodes.filter(Boolean).forEach(n=>p.append(n));return p;};
const btn=(text,cls,action)=>{const b=e('button',cls,text);b.type='button';b.addEventListener('click',action);return b;};
const note=text=>e('p','hub26-note',text);
const pad=n=>String(n).padStart(2,'0');
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const inRange=(n,a,b)=>Math.min(Math.max(n,a),b);
const timeToMin=s=>typeof s==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s)?+s.slice(0,2)*60 + +s.slice(3):NaN;
const timeStr=n=>pad(Math.floor(n/60))+':'+pad(Math.floor(n%60));
const safeLink=s=>typeof s==='string'&&/^https:\/\/[\w.-]+(?:\:[0-9]+)?(?:\/[^\s<>"']*)?$/.test(s)?s:null;
const dayISO=d=>{const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'});const p=Object.fromEntries(fmt.formatToParts(d).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;};
const localNow=()=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return {...p,iso:`${p.year}-${p.month}-${p.day}`,minute:+p.hour*60 + +p.minute + (+p.second)/60};};
const dayIndex=iso=>{const a=iso.split('-').map(Number);return new Date(Date.UTC(a[0],a[1]-1,a[2],12)).getUTCDay();};
const getStore=(key,fallback='')=>{try{return localStorage.getItem(key)||fallback;}catch{return fallback;}};
const setStore=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
const getSession=(key)=>{try{return sessionStorage.getItem(key);}catch{return null;}};
async function load(name){const r=await fetch(BASE+name,{cache:'no-store'});if(!r.ok)throw Error(`${name}: HTTP ${r.status}`);return r.json();}
const heading=(over,title,desc)=>{const box=e('div','experience-section-head');add(box,e('span','experience-eyebrow',over),e('h2','experience-title',title));if(desc)box.append(e('p','experience-lead',desc));return box;};

// A napi egyszeri automatikus megjelenést a budapesti naptári nap szerint tároljuk.
let gateShowing=false;
export function openEntrancePortal({force=false}={}){
 if(gateShowing)return;
 if(!force&&!['','#','#/'].includes(location.hash))return;
 const key='csanadi-portal-visit-v3';const today=dayISO(new Date());
 if(!force&&getStore(key)===today)return;
 if(!force)setStore(key,today);
 gateShowing=true;
 const layer=e('div','gate26');layer.id='gate26';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-labelledby','gate26-title');layer.setAttribute('aria-describedby','gate26-description');
 const scenery=e('div','gate26-scene');const glow=e('div','gate26-glow');const doors=e('div','gate26-doors');
 for(const side of ['left','right']){const d=e('div','gate26-door gate26-'+side);add(d,e('div','gate26-bars'),e('div','gate26-crest','✦'));doors.append(d);}
 const content=e('div','gate26-content');const logo=e('img','gate26-logo');logo.src='assets/media/logo/csanadi-cimer-512.webp';logo.alt='Csanádi Sportiskola címer';logo.width=76;logo.height=76;
 const title=e('h2','', 'Lépj be a sport és a tudás világába');title.id='gate26-title';const desc=e('p','','Nyitva áll a Csanádi Sportiskola kapuja.');desc.id='gate26-description';
 const enter=btn('Belépés az oldalra','gate26-enter',()=>open());const skip=btn('Animáció átugrása','gate26-skip',()=>finish());
 add(content,logo,e('span','gate26-eyebrow','CSANÁDI SPORTISKOLA · 2026'),title,desc,e('span','gate26-caption','KÉPI ILLUSZTRÁCIÓ'),enter,skip);
 add(layer,scenery,glow,doors,content);document.body.append(layer);
 const oldFocus=document.activeElement;let done=false,opening=false,finishTimer;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const previousOverflow=document.body.style.overflow;
 document.body.style.overflow='hidden';
 function cleanup(){if(!layer.isConnected)return;layer.remove();document.body.style.overflow=previousOverflow;gateShowing=false;if(oldFocus?.isConnected&&oldFocus!==document.body)oldFocus.focus?.();}
 function finish(){if(done)return;done=true;clearTimeout(finishTimer);layer.classList.add('gate26-finished');setTimeout(cleanup,reduced?0:470);}
 function open(){
  if(done||opening)return;
  opening=true;
  enter.disabled=true;
  enter.textContent='A kapu nyílik…';
  if(reduced){finish();return;}
  layer.classList.add('gate26-open');
  // A teljes 3D nyitás 4,8 másodperc; ezután finom áttűnés vezet az oldalra.
  finishTimer=setTimeout(finish,5200);
 }
 layer.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'){ev.preventDefault();finish();}
  if(ev.key==='Tab'){
   const choices=opening?[skip]:[enter,skip];
   const index=choices.indexOf(document.activeElement);
   if(index!==-1){ev.preventDefault();choices[(index+(ev.shiftKey?-1:1)+choices.length)%choices.length].focus();}
  }
 });
 enter.focus();
 // Nincs automatikus open()/finish(): a felhasználó dönt a belépésről.

}
function bindPortalButton(){const replay=document.getElementById('portal-replay');if(replay&&!replay.dataset.wired){replay.dataset.wired='1';replay.addEventListener('click',()=>openEntrancePortal({force:true}));}}

function validateBell(value){
 if(!value||value.schemaVersion!=='2.0.0'||value.timezone!==ZONE||value.collectionId!=='collection:csengetesi-rend'||!['preview','verified'].includes(value.status)||typeof value.verifiedBySchool!=='boolean'||!Array.isArray(value.schedules)||!Array.isArray(value.specialDates)||!Array.isArray(value.applicableWeekdays))throw Error('A csengetési rend adatszerkezete hibás.');
 const ids=new Set();for(const s of value.schedules){if(!/^schedule:[a-z0-9-]+$/.test(s.id)||ids.has(s.id)||typeof s.name!=='string'||!['preview','verified'].includes(s.status)||!Array.isArray(s.periods)||!s.periods.length)throw Error('Érvénytelen csengetésirend-változat.');ids.add(s.id);let last=-1;const pids=new Set();for(const p of s.periods){let a=timeToMin(p.start),b=timeToMin(p.end);if(!Number.isInteger(p.number)||p.number<1||pids.has(p.number)||!Number.isFinite(a)||!Number.isFinite(b)||a>=b||a<last)throw Error('Ütköző vagy hibás tanóraidőpont.');pids.add(p.number);last=b;}}
 if(!ids.has(value.defaultScheduleId))throw Error('A csengetési rend alapváltozata hiányzik.');
 const dates=new Set();for(const d of value.specialDates){if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||dates.has(d.date)||!['no-school','schedule'].includes(d.kind)||d.verified!==true||(d.kind==='schedule'&&!ids.has(d.scheduleId)))throw Error('A rendkívüli nap bejegyzése hibás.');dates.add(d.date);}
 if(value.verifiedBySchool!==true&&value.status==='verified')throw Error('Nem hitelesített adatok nem jelölhetők hitelesnek.');return value;
}
function intervalState(schedule,now){const active=schedule.periods.find(p=>now>=timeToMin(p.start)&&now<timeToMin(p.end));const next=schedule.periods.find(p=>now<timeToMin(p.start));return {active,next,ratio:active?(now-timeToMin(active.start))/(timeToMin(active.end)-timeToMin(active.start)):0,seconds:active?(timeToMin(active.end)-now)*60:next?(timeToMin(next.start)-now)*60:0};}
export function renderBellPanel({expanded=false}={}){
 const panel=e('section','experience-panel bell-panel hub26-bell');panel.setAttribute('aria-label','Digitális csengetési rend');
 const top=e('div','bell-panel-top');const validity=e('span','bell-data-status','Adatok betöltése…');add(top,e('div','experience-panel-tag','CSENGETÉSI REND'),validity);
 const picker=e('select','hub26-select');picker.setAttribute('aria-label','Csengetési rend változata');
 const status=e('p','bell-subtitle',''),nowTitle=e('h3','bell-current','Adatok betöltése…'),count=e('div','bell-countdown','--:--:--'),progress=e('div','bell-meter');progress.append(e('span','bell-meter-fill'));
 const timeline=e('div','hub26-timeline');const rows=e('div','bell-hour-list');const jump=e('a','experience-inline-link','Teljes csengetési rend ↗');jump.href='#/informaciok/mindennapi-tudnivalok/csengetesi-rend';
 const summary=e('p','hub26-note','');add(panel,top,picker,nowTitle,status,count,progress,timeline,rows,summary);if(!expanded)panel.append(jump);
 let value=null,selected='',isExplicit=false;const today=()=>localNow();
 function render(){if(!value||!panel.isConnected)return;
  const n=today(),override=value.specialDates.find(d=>d.date===n.iso);
  const currentScheduleId=override?.kind==='schedule'?override.scheduleId:value.defaultScheduleId;
  const scheduledToday=(value.applicableWeekdays.includes(dayIndex(n.iso))||override?.kind==='schedule')&&override?.kind!=='no-school';
  const shown=value.schedules.find(s=>s.id===selected)||value.schedules[0];const actual=value.schedules.find(s=>s.id===currentScheduleId)||shown;
  const useClock=scheduledToday&&!isExplicit&&shown.id===actual.id;
  const info=intervalState(shown,n.minute);const active=useClock?info.active:null,next=useClock?info.next:null;
  if(!scheduledToday&&!isExplicit){nowTitle.textContent='Ma nincs tanítási idősáv';status.textContent='Választhatsz egy napirendet az előnézethez.';}
  else if(active){nowTitle.textContent=`${active.number}. tanóra · ${active.start}–${active.end}`;status.textContent=`A tanóra ${active.end} órakor ér véget.`;}
  else if(next){nowTitle.textContent=info.seconds>0?'Szünet / következő tanóra': 'Tanítás előtt';status.textContent=`A következő óra ${next.start} órakor kezdődik.`;}
  else {nowTitle.textContent='Idősávok áttekintése';status.textContent='A kiválasztott csengetési rend tanórái.';}
  count.textContent=(active||next)?(()=>{const seconds=Math.max(0,Math.ceil(info.seconds));return `${pad(Math.floor(seconds/3600))}:${pad(Math.floor(seconds%3600/60))}:${pad(seconds%60)}`;})():'—';
  progress.firstChild.style.width=(active?inRange(info.ratio*100,0,100):0)+'%';
  timeline.replaceChildren();rows.replaceChildren();
  const first=timeToMin(shown.periods[0].start),last=timeToMin(shown.periods.at(-1).end);const width=Math.max(1,last-first);
  for(const p of shown.periods){const t=e('div','hub26-timeblock');t.style.left=((timeToMin(p.start)-first)/width*100)+'%';t.style.width=((timeToMin(p.end)-timeToMin(p.start))/width*100)+'%';t.title=`${p.number}. óra: ${p.start}–${p.end}`;if(active?.number===p.number)t.classList.add('is-current');timeline.append(t);
   const r=e('div','bell-row'+(active?.number===p.number?' bell-row-current':''));add(r,e('span','bell-row-nr',p.number+'. tanóra'),e('strong','',`${p.start}–${p.end}`));rows.append(r);
  }
  if(useClock){const marker=e('span','hub26-now-marker');marker.style.left=(inRange((n.minute-first)/width*100,0,100))+'%';marker.title='Jelenlegi idő';timeline.append(marker);}
  summary.textContent=value.verifiedBySchool&&value.status==='verified'?'Az iskola közzétett csengetési rendje.':'Az időpontok szerkesztési előnézetek, nem az iskola hivatalos csengetési rendje.';
 }
 picker.addEventListener('change',()=>{selected=picker.value;isExplicit=true;render();});
 load('csengetesi-rend.json').then(raw=>{value=validateBell(raw);validity.textContent=value.verifiedBySchool?'HIVATALOS CSENGETÉSI REND':'TÁJÉKOZTATÓ ADATOK';selected=value.defaultScheduleId;for(const s of value.schedules){const o=e('option','',s.name);o.value=s.id;picker.append(o);}picker.value=selected;render();}).catch(err=>{validity.textContent='Hiba';nowTitle.textContent='Az időrend nem érhető el';status.textContent=err.message;});
 const tick=setInterval(()=>{if(!panel.isConnected){clearInterval(tick);return;}render();},1000);return panel;
}
export function renderBellCenter(){const wrap=e('section','experience-standalone');add(wrap,heading('TANÍTÁSI NAPOK','Digitális csengetési rend','Kövesd az iskola hivatalosan közzétett tanóraidőpontjait, a budapesti időhöz igazított animált idővonalon.'),renderBellPanel({expanded:true}));return wrap;}

// A naptárból csak kifejezetten közzétett és ellenőrzött, időponttal rendelkező esemény kerül exportálásra.
function validateEvents(value){
 if(!value||value.schemaVersion!=='2.0.0'||value.collectionId!=='collection:esemenyek'||!Array.isArray(value.items)||!Array.isArray(value.categories))throw Error('Az esemény-JSON szerkezete nem megfelelő.');
 const ids=new Set(),categories=new Set(value.categories.map(x=>x.id));if(categories.size!==value.categories.length)throw Error('Ismétlődő eseménykategória.');
 return value.items.filter(x=>{if(!x||!/^esemeny:[a-z0-9-]+$/.test(x.id)||ids.has(x.id)||!categories.has(x.categoryId))throw Error('Érvénytelen eseményazonosító vagy kategória.');ids.add(x.id);if(x.status!=='published'||x.verified!==true)return false;
  const re=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/;if(!re.test(x.startsAt)||!Number.isFinite(Date.parse(x.startsAt))||(x.endsAt!==null&&(!re.test(x.endsAt)||Date.parse(x.endsAt)<=Date.parse(x.startsAt))))throw Error('Hibás közzétett eseményidőpont.');
  if(!['string'].includes(typeof x.title)||x.title.length<4)throw Error('Hibás eseménycím.');return true;
 }).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));
}
const eventDate=x=>dayISO(new Date(x.startsAt));
const timeLabel=s=>new Intl.DateTimeFormat('hu-HU',{timeZone:ZONE,hour:'2-digit',minute:'2-digit'}).format(new Date(s));
const dateLabel=s=>new Intl.DateTimeFormat('hu-HU',{timeZone:ZONE,year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date(s));
const escapeICS=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;').slice(0,1000);
const toICSDate=s=>new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
function exportICS(items){if(!items.length)return false;
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Csanadi Sportiskola//Eseménynaptar//HU','CALSCALE:GREGORIAN','METHOD:PUBLISH'];const stamp=toICSDate(new Date().toISOString());
 items.forEach(x=>{const when=x.endsAt?[`DTSTART:${toICSDate(x.startsAt)}`,`DTEND:${toICSDate(x.endsAt)}`]:(()=>{const day=new Date(x.startsAt);return [`DTSTART:${toICSDate(x.startsAt)}`];})();
  lines.push('BEGIN:VEVENT',`UID:${x.id.replace(/[^a-z0-9:-]/gi,'')}@csanadi-website`,`DTSTAMP:${stamp}`,...when,`SUMMARY:${escapeICS(x.title)}`,`DESCRIPTION:${escapeICS(x.summary)}`,`LOCATION:${escapeICS(x.location||'')}`,'END:VEVENT');});lines.push('END:VCALENDAR');
 const blob=new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob);const a=e('a');a.href=url;a.download=items.length===1?`${items[0].id.replace(':','-')}.ics`:'csanadi-esemenyek.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);return true;
}
const isoToUTC=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d,12));};
const mondayISO=s=>{const d=isoToUTC(s),diff=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-diff);return d.toISOString().slice(0,10);};
function dateShift(s,num){const d=isoToUTC(s);d.setUTCDate(d.getUTCDate()+num);return d.toISOString().slice(0,10);}
export function renderCalendarPanel({expanded=false}={}){
 const panel=e('section','experience-panel calendar-panel hub26-calendar');panel.setAttribute('aria-label','Interaktív eseménynaptár');const initial=localNow();
 let view=getStore('csanadi-cal-view','month');if(!['month','week','day','agenda'].includes(view))view='month';let focus=initial.iso,events=[],categories=[],query='',category='all';
 const top=e('div','hub26-cal-top');const month=e('h3','calendar-title');const prev=btn('‹','calendar-nav',()=>move(-1)),next=btn('›','calendar-nav',()=>move(1)),today=btn('Ma','calendar-today',()=>{focus=localNow().iso;draw();});prev.setAttribute('aria-label','Előző időszak');next.setAttribute('aria-label','Következő időszak');add(top,prev,month,next,today);
 const modes=e('div','hub26-cal-modes');for(const [id,label] of [['month','Hónap'],['week','Hét'],['day','Nap'],['agenda','Lista']]){const b=btn(label,'hub26-pill',()=>{view=id;setStore('csanadi-cal-view',view);draw();});b.dataset.view=id;modes.append(b);}
 const search=e('input','hub26-input');search.type='search';search.placeholder='Keresés az eseményekben';search.setAttribute('aria-label','Eseménykeresés');search.addEventListener('input',()=>{query=search.value.toLocaleLowerCase('hu-HU');draw();});
 const categorySelect=e('select','hub26-select');categorySelect.setAttribute('aria-label','Eseménykategória');const allOption=e('option','','Minden kategória');allOption.value='all';categorySelect.append(allOption);categorySelect.addEventListener('change',()=>{category=categorySelect.value;draw();});
 const nextEvent=btn('Következő esemény ↗','hub26-pill dfg-next-event',()=>{const upcoming=matching().find(x=>eventDate(x)>=localNow().iso);if(upcoming){focus=eventDate(upcoming);view='day';setStore('csanadi-cal-view',view);draw();}else{status.textContent='Nincs közzétett jövőbeli esemény a jelenlegi szűrésben.';}});
 const filters=e('div','hub26-cal-filters');add(filters,search,categorySelect,nextEvent);
 const weekdays=e('div','calendar-weekdays');['H','K','Sze','Cs','P','Szo','V'].forEach(t=>weekdays.append(e('span','',t)));
 const grid=e('div','calendar-grid'),output=e('div','hub26-event-results'),count=e('span','hub26-count'),exportButton=btn('ICS export','hub26-export',()=>exportICS(visibleEvents()));
 const actions=e('div','hub26-cal-actions');add(actions,count,exportButton);
 const status=e('p','hub26-note','Csak közzétett, ellenőrzött időpontokat mutatunk.');
 add(panel,e('span','experience-panel-tag','ESEMÉNYNAPTÁR'),top,modes,filters,weekdays,grid,actions,output,status);
 if(!expanded){const jump=e('a','experience-inline-link','Teljes naptár ↗');jump.href='#/hirek-es-esemenyek/esemenynaptar';panel.append(jump);}
 function period(){if(view==='agenda')return ['0000-01-01','9999-12-31'];const d=isoToUTC(focus);if(view==='day')return [focus,focus];if(view==='week'){const a=mondayISO(focus);return [a,dateShift(a,6)];}const a=`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-01`;return [a,`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate())}`];}
 function matching(){return events.filter(x=>(category==='all'||x.categoryId===category)&&slug(x.title+' '+(x.summary||'')+' '+(x.location||'')).includes(slug(query)));}
 function visibleEvents(){const [start,end]=period();return matching().filter(x=>eventDate(x)>=start&&eventDate(x)<=end);}
 function move(dir){const d=isoToUTC(focus);if(view==='month'||view==='agenda'){d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+dir);}else d.setUTCDate(d.getUTCDate()+(view==='week'?7:1)*dir);focus=d.toISOString().slice(0,10);draw();}
 function draw(){if(!panel.isConnected)return;
  const date=isoToUTC(focus);month.textContent=view==='agenda'?'Események időrendben':view==='month'?new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',timeZone:'UTC'}).format(date):view==='week'?`A hét: ${mondayISO(focus)} – ${dateShift(mondayISO(focus),6)}`:focus;
  modes.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  grid.replaceChildren();grid.hidden=view==='agenda';weekdays.hidden=view==='day'||view==='agenda';prev.hidden=next.hidden=view==='agenda';today.hidden=view==='agenda';
  const [start,end]=period(),byDate=new Map();matching().forEach(x=>{const day=eventDate(x);byDate.set(day,[...(byDate.get(day)||[]),x]);});
  let dates=[];if(view==='month'){const offset=(dayIndex(start)+6)%7;for(let i=0;i<offset;i++)grid.append(e('span','calendar-blank'));for(let d=start;d<=end;d=dateShift(d,1))dates.push(d);}else if(view==='week'){for(let i=0;i<7;i++)dates.push(dateShift(start,i));}else if(view==='day')dates=[focus];
  dates.forEach(d=>{const c=btn(d.slice(-2).replace(/^0/,''),'calendar-day',()=>{focus=d;if(view==='month'&&!expanded)view='day';draw();});c.setAttribute('aria-label',`${d}: ${(byDate.get(d)||[]).length} esemény`);if(d===localNow().iso)c.classList.add('is-today');if(d===focus)c.classList.add('is-selected');if(byDate.has(d))c.classList.add('has-event');grid.append(c);});
  const visible=visibleEvents();count.textContent=`${visible.length} hitelesített esemény`;exportButton.disabled=!visible.length;output.replaceChildren();
  if(!visible.length)output.append(note('Ebben az időszakban nincs közzétett, ellenőrzött program a naptárban.'));
  visible.slice(0,expanded?100:5).forEach(item=>{const card=e('article','hub26-event-card');add(card,e('span','hub26-event-kicker',dateLabel(item.startsAt)),e('h4','',item.title),e('p','',item.summary||''),e('p','',`${timeLabel(item.startsAt)}${item.endsAt?'–'+timeLabel(item.endsAt):' · befejezés nem közölt'}${item.location?' · '+item.location:''}`));const buttons=e('div','hub26-event-actions');const link=e('a','hub26-pill','Részletek ↗');link.href=/^#\/[a-z0-9\/-]+$/.test(item.route||'')?item.route:'#/hirek-es-esemenyek/esemenynaptar';
  add(buttons,link,btn('Naptárba (.ics)','hub26-pill',()=>exportICS([item])));
  if(item.verified===true&&safeLink(item.url)){const source=e('a','hub26-pill dfg-event-source','Eredeti közlemény ↗');source.href=item.url;source.target='_blank';source.rel='noopener noreferrer';buttons.append(source);}card.append(buttons);output.append(card);});
 }
 function apply(v){events=validateEvents(v);categories=v.categories;categorySelect.replaceChildren(allOption);for(const item of categories){const o=e('option','',item.label);o.value=item.id;categorySelect.append(o);}categorySelect.value=category;draw();}
 async function refresh(){try{apply(await load('esemenyek.json'));status.textContent=`Adatok ellenőrizve: ${new Intl.DateTimeFormat('hu-HU',{timeZone:ZONE,hour:'2-digit',minute:'2-digit'}).format(new Date())}. Csak jóváhagyott bejegyzések látszanak.`;}catch(err){status.textContent='Az események ellenőrzése nem sikerült: '+err.message;}}
 const refreshBtn=btn('Frissítés','hub26-mini-action',refresh);actions.append(refreshBtn);draw();refresh();const timer=setInterval(()=>{if(!panel.isConnected){clearInterval(timer);return;}if(!document.hidden)refresh();},60000);return panel;
}
export function renderCalendarCenter(){const wrap=e('section','experience-standalone');add(wrap,heading('HÍREK ÉS ESEMÉNYEK','Iskolai és sportesemények naptára','Böngészés napi, heti vagy havi nézetben, szűrés sportági és iskolai eseményekre. A jóváhagyott események egy kattintással naptárfájlba exportálhatók.'),renderCalendarPanel({expanded:true}));return wrap;}
export function renderHomeExperience(){const s=e('section','experience-hub section-wrap');s.id='mindennapi-kozpont';const c=e('div','container-xxl');c.append(heading('A NAP A CSANÁDIBAN','Digitális iskolai központ','Budapesti pontos idő, választható tanítási idősávok és többnézetű eseménynaptár egyetlen felületen.'));const grid=e('div','experience-dash-grid');add(grid,renderDigitalClock(),renderBellPanel(),renderCalendarPanel());add(c,grid);add(s,c);return s;}

function validateStaff(v){
 if(!v||v.schemaVersion!=='2.0.0'||v.collectionId!=='collection:tantestulet'||!Array.isArray(v.teams)||!Array.isArray(v.staff)||v.privacy?.publishOnlyApproved!==true)throw Error('A Tantestület JSON-szerkezete hibás.');
 const teamIDs=new Set();for(const t of v.teams){if(!/^team:[a-z0-9-]+$/.test(t.id)||teamIDs.has(t.id)||typeof t.name!=='string'||typeof t.description!=='string')throw Error('Hibás munkaközösség-azonosító.');teamIDs.add(t.id);}
 const ids=new Set();for(const s of v.staff){if(!/^staff:[a-z0-9-]+$/.test(s.id)||ids.has(s.id)||s.status!=='published'||s.publicApproved!==true||typeof s.fullName!=='string'||s.fullName.trim().length<5||!Array.isArray(s.teamIds)||!s.teamIds.every(id=>teamIDs.has(id))||!Array.isArray(s.subjects)||!s.subjects.every(x=>typeof x==='string')||typeof s.bio!=='string')throw Error('Érvénytelen vagy jóvá nem hagyott pedagógusadat az állományban.');ids.add(s.id);if(s.portrait&&!s.portraitApproved)throw Error('Jóvá nem hagyott portréfotó.');}
 return v;
}
export function renderStaffCenter(){const wrap=e('section','staff-center hub26-staff');wrap.append(heading('PEDAGÓGIAI KÖZÖSSÉG','Tantestület és munkaközösségek','Ismerd meg az iskolai pedagógiai munkaterületeket és a tanulás, a sport, valamint a közösségi nevelés kapcsolatait.'));
 const toolbar=e('div','staff-toolbar'),search=e('input','staff-search');search.type='search';search.placeholder='Keresés név, tantárgy vagy munkaközösség szerint…';search.setAttribute('aria-label','Pedagógusok keresése');
 const mode=e('div','staff-filter-group');const groupBtn=btn('Munkaközösségek','staff-filter',()=>{tab='teams';draw();}),peopleBtn=btn('Pedagógusok','staff-filter',()=>{tab='people';draw();});const category=e('select','hub26-select');category.setAttribute('aria-label','Munkaterület szűrése');for(const [value,title] of [['all','Minden terület'],['oktatas','Oktatás'],['sport','Sport'],['kozosseg','Közösség']]){const opt=e('option','',title);opt.value=value;category.append(opt);}
 add(mode,peopleBtn,groupBtn);add(toolbar,search,category,mode);const total=e('p','hub26-note','Adatok betöltése…'),grid=e('div','staff-team-grid'),foot=e('p','hub26-note','');add(wrap,toolbar,total,grid,foot);let value=null,tab='teams';
 function matches(q,fields){return slug(fields.join(' ')).includes(slug(q));}
 function showProfile(p){const dialog=e('dialog','hub26-staff-dialog'),box=e('div','hub26-staff-profile');const close=btn('Bezárás ×','hub26-pill',()=>dialog.close());add(box,close,e('h2','',p.fullName),e('p','',p.role||'Pedagógus'),e('p','',p.bio),e('p','',p.subjects.join(' · ')));if(p.portrait&&p.portraitApproved){const img=e('img');img.src=p.portrait;img.alt=p.fullName+' jóváhagyott portréja';box.prepend(img);}dialog.append(box);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();}
 function draw(){if(!value)return;groupBtn.setAttribute('aria-pressed',String(tab==='teams'));peopleBtn.setAttribute('aria-pressed',String(tab==='people'));grid.replaceChildren();const q=search.value,cat=category.value;
  if(tab==='teams'){const rows=value.teams.filter(x=>(cat==='all'||x.category===cat)&&matches(q,[x.name,x.description]));total.textContent=rows.length+' bemutatott munkaterület';rows.forEach((t,i)=>{const card=e('article','staff-team-card');const image=e('div','staff-team-photo'),img=e('img');img.src=`assets/media/web/eletkep-${pad(18+(i*4)%30)}.webp`;img.loading='lazy';img.alt='Iskolai tematikus illusztráció';image.append(img);const body=e('div','staff-team-body');add(body,e('span','staff-team-kicker',t.category==='sport'?'SPORT':t.category==='kozosseg'?'KÖZÖSSÉG':'OKTATÁS'),e('h3','',t.name),e('p','',t.description));card.append(image,body);grid.append(card);});}
  else {const rows=value.staff.filter(x=>(cat==='all'||x.teamIds.some(id=>value.teams.find(t=>t.id===id)?.category===cat))&&matches(q,[x.fullName,x.role,x.bio,...x.subjects]));total.textContent=rows.length+' nyilvánosan jóváhagyott pedagógusprofil';rows.forEach(p=>{const card=e('article','hub26-staff-person');add(card,e('h3','',p.fullName),e('p','',p.role||''),e('p','',p.subjects.join(' · ')),btn('Részletes bemutatkozás ↗','hub26-pill',()=>showProfile(p)));grid.append(card);});}
  if(!grid.childElementCount)grid.append(note(tab==='people'?'Jelenleg nincs jóváhagyott, közzétehető pedagógusprofil. A személyes adatok csak intézményi jóváhagyás után kerülnek fel.':'Nincs találat; próbálj más keresést.'));
 }
 search.addEventListener('input',draw);category.addEventListener('change',draw);load('tantestulet.json').then(v=>{value=validateStaff(v);if(!value.staff.length)peopleBtn.style.display='none';draw();foot.textContent='A pedagógiai területek bemutatása az általános iskolai, gimnáziumi és sportiskolai feladatkörökre épül.';}).catch(err=>{grid.append(e('p','experience-error','A Tantestület adatbetöltési hibája: '+err.message));});return wrap;
}

function validateSocial(v){if(!v||v.schemaVersion!=='2.0.0'||v.collectionId!=='collection:social-2026'||!Array.isArray(v.items))throw Error('A közösségi adatok szerkezete hibás.');const ids=new Set();for(const x of v.items){if(!/^social:[a-z0-9-]+$/.test(x.id)||ids.has(x.id)||!['Facebook','Instagram','YouTube','TikTok','LinkedIn'].includes(x.platform))throw Error('Hibás social hivatkozás.');ids.add(x.id);}return v;}
function publishedChannel(x){return x.status==='published'&&x.schoolVerified===true&&!!safeLink(x.url);}
const symbols={Facebook:'f',Instagram:'◎',YouTube:'▶',TikTok:'♪',LinkedIn:'in'};
function socialLinks(items,compact=false){
 const box=e('div',compact?'social-chip-group':'social-links-grid');
 for(const x of items){
  if(publishedChannel(x)){
   const a=e('a','social-chip');a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',x.platform+' – hitelesített külső oldal, új lapon');
   add(a,e('span','social-glyph',symbols[x.platform]),e('span','',x.label+' ↗'));box.append(a);
  }else{
   const placeholder=e('span','social-chip is-pending');placeholder.setAttribute('title',x.platform+' – hivatalos elérhetőség egyeztetés alatt');
   placeholder.setAttribute('aria-label',x.platform+' – hitelesített link még nincs');
   add(placeholder,e('span','social-glyph',symbols[x.platform]),e('span','',compact?x.platform:x.label+' · elérhetőség egyeztetés alatt'));box.append(placeholder);
  }
 }
 return box;
}
async function socialData(){return validateSocial(await load('social.json'));}
function nativeShare(){const data={title:document.title,text:'Csanádi Sportiskola',url:location.href};if(navigator.share){navigator.share(data).catch(()=>{});}else if(navigator.clipboard?.writeText){navigator.clipboard.writeText(location.href).then(()=>alert('A weboldal hivatkozása a vágólapra került.')).catch(()=>prompt('Másold ki a hivatkozást:',location.href));}else prompt('Másold ki a hivatkozást:',location.href);}
const embedsAllowed=new Set(['www.youtube-nocookie.com','www.youtube.com','www.facebook.com']);
function embedBlock(items){const eligible=items.filter(x=>publishedChannel(x)&&x.embed?.approved===true&&x.embed?.url&&safeLink(x.embed.url)&&embedsAllowed.has(new URL(x.embed.url).hostname));const area=e('div','hub26-embed-area');
 if(!eligible.length){area.append(note('A közösségi felületek külön lapon nyílnak meg; az oldalon nem töltünk be külső követőkódokat.'));return area;}
 const select=e('select','hub26-select');for(const x of eligible){const o=e('option','',x.label);o.value=x.id;select.append(o);}const holder=e('div','hub26-embed-holder');let allowed=false;
 const consent=btn('Külső tartalom megjelenítése','hub26-pill',()=>{allowed=!allowed;holder.replaceChildren();if(allowed){const item=eligible.find(x=>x.id===select.value);const iframe=e('iframe','hub26-embed-frame');iframe.src=item.embed.url;iframe.title=item.platform+' – beágyazott tartalom';iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.setAttribute('allow','fullscreen; encrypted-media; picture-in-picture');holder.append(iframe);consent.textContent='Hozzájárulás visszavonása';}else consent.textContent='Külső tartalom megjelenítése';});
 select.addEventListener('change',()=>{if(allowed){allowed=false;holder.replaceChildren();consent.textContent='Külső tartalom megjelenítése';}});add(area,note('A külső platform csak a gomb megnyomása után töltődik be, és ekkor adatokat továbbíthat a szolgáltatónak.'),select,consent,holder);return area;
}
export function initSocialLinks(){bindPortalButton();socialData().then(v=>{for(const id of ['social-header','social-footer']){const mount=document.getElementById(id);if(mount)mount.replaceChildren(socialLinks(v.items,true));}}).catch(err=>console.warn('Közösségi adatok:',err.message));}
export function renderSocialSection(){const s=e('section','social-feature-section section-wrap'),c=e('div','container-xxl');add(c,heading('KÖZÖSSÉG ÉS MEGOSZTÁS','Kapcsolódjunk az iskola közösségéhez','Közösségi elérhetőségek és az oldal megosztása – az adatvédelem tiszteletben tartásával.'));const box=e('div','social-feature-box'),intro=e('div','social-feature-copy'),data=e('div','social-feature-items');add(intro,e('h3','','Egy történet több felületen is folytatódhat.'),e('p','','A hitelesített intézményi profilok gyorselérésként jelennek meg. A beágyazásokhoz a látogató külön hozzájárulása szükséges.'),btn('Az oldal megosztása','hub26-pill',nativeShare));data.append(note('Közösségi adatok betöltése…'));add(box,intro,data);c.append(box);s.append(c);
 socialData().then(v=>{data.replaceChildren(socialLinks(v.items),embedBlock(v.items));}).catch(err=>{data.textContent='Közösségi modul átmenetileg nem elérhető: '+err.message;});return s;}
