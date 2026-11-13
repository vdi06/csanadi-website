/* Csanádi 2026 – dinamikus kezdőoldali statisztikák és események.
 * Kizárólag ellenőrzött JSON adatokból számol. Nem futtat adatként kapott kódot.
 */
const SPORTS_URL=new URL('../json/adatok/sportsikerek.json',import.meta.url);
const EVENTS_URL=new URL('../json/adatok/esemenyek.json',import.meta.url);
const VALID_ROUTE=/^#\/[a-z0-9/-]*$/;
const SAFE_ID=/^(success|esemeny):[a-z0-9-]{3,60}$/;
const STRING_TEXT=/^[\p{L}\p{N} ,.\-–()\/:!?]+$/u;
const mk=(tag,cls='',txt)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=String(txt);return node;};
function add(parent,...children){parent.append(...children);return parent;}
function formatNow(){return new Intl.DateTimeFormat('hu-HU',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date());}
function formatDate(stamp){return new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(stamp));}
async function fetchJSON(url){const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw Error(`Nem elérhető: ${url.pathname} (${res.status})`);return res.json();}
function checkSports(data){
 if(!data||data.schemaVersion!=='1.0.0'||data.collectionId!=='collection:sportsikerek'||!Array.isArray(data.items)||data.items.length>300)throw Error('Érvénytelen sportsikerek.json gyűjtemény.');
 const ids=new Set();
 for(const item of data.items){
  if(!item||typeof item.id!=='string'||!SAFE_ID.test(item.id)||!item.id.startsWith('success:')||ids.has(item.id)||
     typeof item.title!=='string'||item.title.trim().length<8||item.title.length>140||
     typeof item.category!=='string'||item.category.length>48||!STRING_TEXT.test(item.category)||
     !['preview','verified'].includes(item.status)||!item.source||typeof item.source.verified!=='boolean')throw Error('Hibás sporteredmény-rekord.');
  if(item.status==='verified'&&item.source.verified!==true)throw Error('Nem igazolt sporteredmény nem lehet publikus.');
  ids.add(item.id);
 }
 return data.items;
}
function validISOString(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/.test(value))return false;const d=new Date(value);return Number.isFinite(d.getTime());}
function checkEvents(data){
 if(!data||data.schemaVersion!=='1.0.0'||data.collectionId!=='collection:esemenyek'||!Array.isArray(data.items)||data.items.length>200||!Number.isInteger(data.refreshSeconds)||data.refreshSeconds<15||data.refreshSeconds>3600)throw Error('Érvénytelen esemenyek.json gyűjtemény.');
 const ids=new Set();
 for(const item of data.items){
  if(!item||typeof item.id!=='string'||!/^esemeny:[a-z0-9-]{3,60}$/.test(item.id)||ids.has(item.id)||
     typeof item.title!=='string'||item.title.trim().length<8||item.title.length>120||
     typeof item.summary!=='string'||item.summary.trim().length<30||item.summary.length>500||
     typeof item.category!=='string'||item.category.length>48||!STRING_TEXT.test(item.category)||
     !VALID_ROUTE.test(item.route)||!['preview','verified'].includes(item.status)||!item.source||typeof item.source.verified!=='boolean')throw Error('Hibás eseményadat.');
  if(item.status==='verified'&&(!item.source.verified||!validISOString(item.startsAt)))throw Error('Az éles eseményhez igazolt pontos időpont szükséges.');
  if(item.status==='preview'&&(item.source.verified||item.startsAt!==null))throw Error('A bemutató esemény nem tartalmazhat látszólag hivatalos időpontot.');
  ids.add(item.id);
 }
 return data.items;
}
function link(href,label,cls=''){const el=mk('a',cls,label);el.href=VALID_ROUTE.test(href)?href:'#/';return el;}
function cardValue(label,value,caption,icon){const c=mk('article','live-metric');add(c,mk('span','live-metric-icon',icon),mk('span','live-metric-label',label),mk('strong','live-metric-number',value),mk('small','live-metric-caption',caption));return c;}
function updateCounters(container){
 for(const node of container.querySelectorAll('.live-metric-number')){
  const n=Number(node.textContent);if(!Number.isFinite(n)||n<0||n>10000)continue;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden)continue;
  node.textContent='0';const start=performance.now();const duration=620;
  const tick=now=>{if(!node.isConnected)return;const p=Math.min(1,(now-start)/duration);node.textContent=String(Math.round(n*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(tick);};
  requestAnimationFrame(tick);
 }
}
function counts(items){
 const exact=new Map();for(const entry of items)exact.set(entry.category,(exact.get(entry.category)||0)+1);
 return [...exact.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'hu'));
}
function barGraph(entries,total,selected,onSelect){
 const barArea=mk('div','live-bars');barArea.setAttribute('role','list');
 const maximum=Math.max(1,...entries.map(x=>x[1]));
 for(const [label,count] of entries){
  const row=mk('button','live-bar-row'+(selected===label?' selected':''));row.type='button';row.setAttribute('aria-pressed',String(selected===label));row.setAttribute('aria-label',`${label}: ${count} történet. Kattintás a szűréshez.`);
  const left=mk('span','live-bar-label',label),right=mk('strong','live-bar-value',count),track=mk('span','live-bar-track'),fill=mk('span','live-bar-fill');
  fill.style.setProperty('--live-bar-width',`${(count/maximum)*100}%`);track.append(fill);row.append(left,track,right);
  row.addEventListener('click',()=>onSelect(selected===label?'':label));barArea.append(row);
 }
 if(!entries.length)barArea.append(mk('p','live-empty','Még nincsenek sportági adatok.'));
 return barArea;
}
function donutChart(verified,total){
 const wrap=mk('div','live-donut-shell');const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 140 140');svg.setAttribute('class','live-donut');svg.setAttribute('role','img');
 svg.setAttribute('aria-label',`${verified} ellenőrzött történet a(z) ${total} bejegyzésből`);
 const ring=(klass,dash)=>{const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('cx','70');circle.setAttribute('cy','70');circle.setAttribute('r','53');circle.setAttribute('fill','none');circle.setAttribute('stroke-width','13');circle.setAttribute('class',klass);if(dash!==null)circle.style.setProperty('--donut-length',dash);return circle;};
 const circumference=2*Math.PI*53;svg.append(ring('live-donut-track',null));svg.append(ring('live-donut-progress',`${circumference*(total?verified/total:0)} ${circumference}`));
 const center=mk('div','live-donut-text');add(center,mk('strong','',`${total?Math.round(verified/total*100):0}%`),mk('span','','Ellenőrzött'));
 wrap.append(svg,center);return wrap;
}
function eventCard(item,upcoming){
 const el=mk('article','live-event'+(item.status==='preview'?' preview':''));
 const badge=mk('span','live-event-tag',item.status==='preview'?'BEMUTATÓ TÉMA':'HIVATALOS ESEMÉNY');
 const head=mk('div','live-event-head');add(head,badge,mk('span','live-event-category',item.category));
 const title=mk('h3','',item.title),summary=mk('p','',item.summary);
 const details=mk('div','live-event-bottom');
 if(item.status==='verified'){
  const time=mk('time','live-event-date',formatDate(item.startsAt));time.dateTime=item.startsAt;details.append(time);
  if(item.location)details.append(mk('span','live-event-location',item.location));
  if(upcoming)details.append(mk('span','live-event-live','Következő program'));
 }else details.append(mk('span','live-event-date','Időpont még nincs meghirdetve'));
 details.append(link(item.route,'Részletek →','live-event-link'));
 el.append(head,title,summary,details);return el;
}
function showSkeleton(root,text){root.replaceChildren(mk('p','live-load-note',text));}
export function renderLiveDashboard(block){
 const section=mk('section','home-live-section');section.dataset.module='live-dashboard';
 const wrap=mk('div','container-xxl');const head=mk('div','live-dashboard-head');const heading=mk('div');
 add(heading,mk('span','section-overline','ADATOK · SPORT · ESEMÉNYEK'),mk('h2','section-title',block.title||'Sportélet élőben'),mk('p','live-dashboard-lead','Az adatok az oldal JSON-gyűjteményeiből érkeznek; szűrhetők és frissíthetők. Az illusztrációk nem hivatalos eredmények.'));
 const actions=mk('div','live-actions'),refresh=mk('button','live-refresh-btn','↻ Frissítés most');refresh.type='button';
 const updated=mk('span','live-updated','Adatok betöltése…');updated.setAttribute('aria-live','polite');actions.append(refresh,updated);
 head.append(heading,actions);const stage=mk('div','live-dashboard-body');showSkeleton(stage,'Sportági statisztikák és események betöltése…');
 wrap.append(head,stage);section.append(wrap);
 let chosen='',sportData=[],eventData=[],lastHash='',running=false;
 const paint=(doAnimation=false)=>{
  const verifiedSports=sportData.filter(x=>x.status==='verified');const categories=counts(sportData);
  const scheduled=eventData.filter(x=>x.status==='verified'&&new Date(x.startsAt).getTime()>=Date.now()).sort((a,b)=>new Date(a.startsAt)-new Date(b.startsAt));
  const previews=eventData.filter(x=>x.status==='preview').slice(0,4);
  const metrics=mk('div','live-metrics');
  metrics.append(cardValue('Sporttörténetek',sportData.length,'JSON-ból számolt bejegyzések','🏆'),cardValue('Sportági témák',categories.length,'A bemutatott témakörök száma','◉'),cardValue('Igazolt eredmények',verifiedSports.length,'Forrásellenőrzött történetek','✓'),cardValue('Közelgő események',scheduled.length,'Jóváhagyott jövőbeli időpontok','▦'));
  const content=mk('div','live-data-grid');const stats=mk('article','live-panel'),events=mk('article','live-panel live-event-panel');
  const statTitle=mk('div','live-panel-top');add(statTitle,mk('h3','','Sportági áttekintés'),mk('span','live-small-note','Adatforrás: sporthírek JSON'));
  stats.append(statTitle);
  const filter=mk('label','live-filter-label','Sportági szűrő');const select=mk('select','form-select live-filter-select');select.setAttribute('aria-label','Sportág szerinti kimutatás szűrése');
  [['','Összes sportági téma'],...categories].forEach(([value,label])=>{const option=mk('option','',label);option.value=value;select.append(option);});select.value=chosen;
  select.addEventListener('change',()=>{chosen=select.value;paint();});filter.append(select);stats.append(filter);
  const filtered=chosen?sportData.filter(x=>x.category===chosen):sportData;
  const graph=mk('div','live-chart-layout');
  const barSide=mk('div','live-bar-side');barSide.append(barGraph(counts(filtered),filtered.length,chosen,next=>{chosen=next;paint();}));
  const donutSide=mk('div','live-donut-side');add(donutSide,donutChart(filtered.filter(x=>x.status==='verified').length,filtered.length),mk('p','','Igazolt / bemutató arány'));
  graph.append(barSide,donutSide);stats.append(graph);
  const foot=mk('p','live-chart-note','A kimutatás a jelenlegi sporttörténetek darabszámát mutatja, nem az iskola érmeit vagy versenyhelyezéseit. A bemutató elemek külön jelöltek.');stats.append(foot);
  const evHead=mk('div','live-panel-top');evHead.append(mk('h3','','Események és programok'),link('#/hirek-es-esemenyek/esemenynaptar','Teljes naptár →','live-event-all'));events.append(evHead);
  const evIntro=mk('p','live-event-intro',scheduled.length?`${scheduled.length} ellenőrzött, közelgő esemény a naptárban.`:'Még nincs jóváhagyott, dátummal rendelkező közelgő esemény. Az alábbiak tervezési témakörök, nem meghirdetett programok.');events.append(evIntro);
  const evList=mk('div','live-event-list');const shown=(scheduled.length?scheduled.slice(0,3):previews);shown.forEach((e,i)=>evList.append(eventCard(e,!!(scheduled.length&&i===0))));
  if(!shown.length)evList.append(mk('p','live-empty','Egyelőre nincs megjeleníthető program.'));
  events.append(evList);content.append(stats,events);
  stage.replaceChildren(metrics,content);
  if(doAnimation){requestAnimationFrame(()=>{stage.classList.add('live-arrived');updateCounters(metrics);});}
 };
 async function refresh(){
  if(running)return;running=true;refresh.disabled=true;refresh.textContent='↻ Frissítés…';
  try{
   const [sports,events]=await Promise.all([fetchJSON(SPORTS_URL),fetchJSON(EVENTS_URL)]);
   const sportItems=checkSports(sports),eventItems=checkEvents(events);const fresh=JSON.stringify([sportItems,eventItems]);
   if(fresh!==lastHash){sportData=sportItems;eventData=eventItems;lastHash=fresh;paint(true);}
   updated.textContent=`Utoljára ellenőrizve: ${formatNow()}`;
  }catch(error){console.error('Élő kezdőoldali adatfrissítés:',error);updated.textContent='Frissítési hiba – korábbi adatok megőrizve';
   if(!lastHash)showSkeleton(stage,'Az élő kimutatások egyelőre nem érhetők el. A Frissítés most gombbal újrapróbálhatod.');
  }finally{running=false;refresh.disabled=false;refresh.textContent='↻ Frissítés most';}
 }
 refresh.addEventListener('click',refresh);
 refresh();
 const timer=setInterval(()=>{if(!section.isConnected){clearInterval(timer);return;}if(!document.hidden)refresh();},20000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&section.isConnected)refresh();},{signal:(()=>{const controller=new AbortController();const cleanup=setInterval(()=>{if(!section.isConnected){controller.abort();clearInterval(cleanup);}},15000);return controller.signal;})()});
 return section;
}
