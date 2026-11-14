/* Csanádi 2026: bemutató kapunyitás, fotófal, digitális óra, naptár,
 * JSON-alapú csengetési rend, social linkek és tantestületi központ.
 * Kizárólag natív JS; nem igényel helyi szervert vagy telepített csomagokat.
 */
const e=(tag,cls='',text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x;};
const add=(target,...kids)=>{kids.filter(Boolean).forEach(k=>target.append(k));return target;};
const safe=(s)=>String(s||'').replace(/[^a-zA-Z0-9À-ž _.,!?–:()/-]/g,'').slice(0,220);
async function dataJSON(path){const r=await fetch('json/adatok/'+path,{cache:'no-store'});if(!r.ok)throw new Error('A '+path+' nem tölthető be ('+r.status+')');return r.json();}
const note=(txt)=>e('p','experience-data-note',txt);
const timeZone='Europe/Budapest';
const parts=d=>Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(d).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
const isoDay=p=>p.year+'-'+p.month+'-'+p.day;
const pad=n=>String(n).padStart(2,'0');
const huDate=(date)=>new Intl.DateTimeFormat('hu-HU',{timeZone,year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(date);
const minuteTime=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s)?Number(s.slice(0,2))*60+Number(s.slice(3)):null;
const href=(url)=>typeof url==='string'&&(/^#\/[a-z0-9/-]*$/.test(url)||/^https:\/\/[^\s<>"']+$/.test(url))?url:'#/';
const sectionHead=(overline,title,description)=>{const box=e('div','experience-section-head');add(box,e('span','experience-eyebrow',overline),e('h2','experience-title',title));if(description)box.append(e('p','experience-lead',description));return box;};

// Full-viewport entrance. Ends automatically; skip button and reduced-motion rules keep it usable.
export function openEntrancePortal(){
 const hash=window.location.hash||'#/';if(hash!=='#/'&&hash!=='#')return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 try{if(sessionStorage.getItem('csanadi-portal-viewed-2026')==='yes')return;sessionStorage.setItem('csanadi-portal-viewed-2026','yes');}catch{}
 const screen=e('div','entry-portal');screen.id='entry-portal';screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-label','Üdvözlünk a Csanádi Sportiskola honlapján');
 const backdrop=e('div','entry-portal-backdrop');const frame=e('div','entry-portal-frame');
 const left=e('div','entry-gate-leaf entry-gate-left'),right=e('div','entry-gate-leaf entry-gate-right');
 for(const leaf of [left,right]){
  const bars=e('div','entry-gate-bars');leaf.append(bars);
  const medal=e('span','entry-gate-emblem','✦');leaf.append(medal);
 }
 const copy=e('div','entry-portal-copy');add(copy,e('span','entry-gate-kicker','CSANÁDI SPORTISKOLA 2026'),e('h2','','Nyitva áll a sport és a tudás kapuja'),e('p','','Fedezd fel a sport, a tudás és a közösség inspiráló világát.'));
 const enter=e('button','entry-portal-enter','Belépés az oldalra  →');enter.type='button';
 const skip=e('button','entry-portal-skip','Animáció átugrása');skip.type='button';
 add(copy,enter,skip);add(frame,left,right);add(screen,backdrop,frame,copy);document.body.append(screen);
 const before=document.activeElement;let ended=false;let timer1,timer2,timer3;
 function finish(){if(ended)return;ended=true;clearTimeout(timer1);clearTimeout(timer2);clearTimeout(timer3);screen.classList.add('is-finished');setTimeout(()=>{screen.remove();document.querySelector('.brand')?.focus?.();},450);}
 function open(){if(ended)return;screen.classList.add('is-opening');timer3=setTimeout(finish,2200);}
 enter.addEventListener('click',open);skip.addEventListener('click',finish);
 screen.addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.preventDefault();finish();}});
 timer1=setTimeout(open,1250);timer2=setTimeout(finish,6500);skip.focus();
}

export function renderDigitalClock(){
 const panel=e('section','experience-panel clock-panel');panel.setAttribute('aria-label','Digitális óra');
 add(panel,e('div','experience-panel-tag','PONTOS IDŐ · BUDAPEST'),e('div','seven-segment-clock','--:--:--'),e('p','clock-date',''));
 const digits=panel.querySelector('.seven-segment-clock'),date=panel.querySelector('.clock-date');
 const tick=()=>{const p=parts(new Date());digits.textContent=p.hour+':'+p.minute+':'+p.second;date.textContent=huDate(new Date());};tick();
 const timer=setInterval(()=>{if(!panel.isConnected){clearInterval(timer);return;}tick();},1000);
 return panel;
}
function validateBell(payload){
 if(!payload||payload.schemaVersion!=='1.0.0'||!Array.isArray(payload.periods)||!['preview','verified'].includes(payload.status))throw Error('A csengetési rend JSON-szerkezete érvénytelen.');
 let oldEnd=-1;
 for(const p of payload.periods){const start=minuteTime(p.start),end=minuteTime(p.end);if(!Number.isInteger(p.number)||start===null||end===null||start>=end||start<oldEnd)throw Error('Érvénytelen vagy átfedő tanórák a csengetési rendben.');oldEnd=end;}
 return payload;
}
export function renderBellPanel({expanded=false}={}){
 const panel=e('section','experience-panel bell-panel');panel.setAttribute('aria-label','Csengetési rend bemutató');
 const top=e('div','bell-panel-top');add(top,e('div','experience-panel-tag','DIGITÁLIS CSENGETÉSI REND'),e('span','bell-data-status','Betöltés…'));
 const title=e('h3','bell-current','Idősávok betöltése…'),sub=e('p','bell-subtitle',''),timer=e('div','bell-countdown','--:--'),track=e('div','bell-meter');track.append(e('span','bell-meter-fill'));
 const hours=e('div','bell-hour-list');const link=e('a','experience-inline-link','Részletes csengetési rend ↗');link.href='#/informaciok/mindennapi-tudnivalok/csengetesi-rend';
 add(panel,top,title,sub,timer,track,hours,link);
 let data=null;
 const paint=()=>{
  if(!data||!panel.isConnected)return;
  const p=parts(new Date()),now=Number(p.hour)*60+Number(p.minute)+Number(p.second)/60;
  const week=Number(new Intl.DateTimeFormat('en-US',{timeZone,weekday:'short'}).format(new Date()).replace(/.*/,x=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(x)))||0;
  const isSchoolDay=week>=1&&week<=5;
  const current=isSchoolDay?data.periods.find(x=>now>=minuteTime(x.start)&&now<minuteTime(x.end)):null;
  const next=isSchoolDay?data.periods.find(x=>minuteTime(x.start)>now):null;
  let line='';let seconds=0;let ratio=0;
  if(current){const start=minuteTime(current.start),end=minuteTime(current.end);line=`${current.number}. tanóra • ${current.start}–${current.end}`;seconds=Math.max(0,Math.ceil((end-now)*60));ratio=Math.max(0,Math.min(100,(now-start)/(end-start)*100));sub.textContent='A bemutató órasáv vége '+current.end+' órakor';}
  else if(next){line='Szünet / tanítás előtt';seconds=Math.max(0,Math.ceil((minuteTime(next.start)-now)*60));sub.textContent='A következő bemutató idősáv: '+next.number+'. óra, '+next.start;}
  else {line=isSchoolDay?'A bemutató órasávok véget értek':'Hétvége / nincs tanítási idősáv';sub.textContent='A panel a böngésző órájához igazodik.';}
  title.textContent=line;timer.textContent=(current||next)?`${pad(Math.floor(seconds/3600))}:${pad(Math.floor(seconds%3600/60))}:${pad(seconds%60)}`:'—';track.firstChild.style.width=ratio+'%';
  for(const child of hours.children)child.classList.toggle('bell-row-current',Boolean(current&&child.dataset.number===String(current.number)));
 };
 dataJSON('csengetesi-rend.json').then(x=>{
  data=validateBell(x);
  panel.querySelector('.bell-data-status').textContent=data.verifiedBySchool&&data.status==='verified'?'Ellenőrzött':'BEMUTATÓ · NEM HIVATALOS';
  if(!data.verifiedBySchool)panel.insertBefore(note('A látható időpontok szemléltető adatok. A valós csengetési rendet az iskola jóváhagyása után lehet feltölteni.'),hours);
  hours.replaceChildren();(expanded?data.periods:data.periods.slice(0,5)).forEach(item=>{
   const row=e('div','bell-row');row.dataset.number=String(item.number);
   add(row,e('span','bell-row-nr',item.number+'. óra'),e('strong','',item.start+' – '+item.end));hours.append(row);
  });paint();
 }).catch(err=>{title.textContent='A csengetési rend átmenetileg nem érhető el';sub.textContent=err.message;timer.textContent='—';});
 const h=setInterval(()=>{if(!panel.isConnected){clearInterval(h);return;}paint();},1000);
 return panel;
}
function validEvents(value){return Array.isArray(value?.items)?value.items.filter(x=>x&&typeof x.title==='string'&&x.source?.verified===true&&typeof x.startsAt==='string'&&/^\d{4}-\d{2}-\d{2}/.test(x.startsAt)):[];}
function monthInfo(date){return new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',timeZone}).format(date);}
export function renderCalendarPanel({expanded=false}={}){
 const panel=e('section','experience-panel calendar-panel');panel.setAttribute('aria-label','Interaktív eseménynaptár');
 const header=e('div','calendar-control');const prev=e('button','calendar-nav','‹'),next=e('button','calendar-nav','›'),today=e('button','calendar-today','Ma');
 for(const b of [prev,next,today])b.type='button';prev.setAttribute('aria-label','Előző hónap');next.setAttribute('aria-label','Következő hónap');
 const heading=e('h3','calendar-title');add(header,prev,heading,next,today);
 const weekdays=e('div','calendar-weekdays');['H','K','Sze','Cs','P','Szo','V'].forEach(s=>weekdays.append(e('span','',s)));
 const grid=e('div','calendar-grid'),detail=e('div','calendar-selected-info');
 add(panel,e('div','experience-panel-tag','ESEMÉNYNAPTÁR · 2026'),header,weekdays,grid,detail);
 const link=e('a','experience-inline-link','Teljes eseménynaptár ↗');link.href='#/hirek-es-esemenyek/esemenynaptar';panel.append(link);
 let all=[],sel=null;const now=parts(new Date());let y=Number(now.year),m=Number(now.month)-1;
 function draw(){
  const todayISO=isoDay(parts(new Date()));heading.textContent=monthInfo(new Date(Date.UTC(y,m,1,12)));
  grid.replaceChildren();const offset=(new Date(Date.UTC(y,m,1)).getUTCDay()+6)%7;const days=new Date(Date.UTC(y,m+1,0)).getUTCDate();
  const dates=new Map();all.forEach(x=>{const day=x.startsAt.slice(0,10);dates.set(day,[...(dates.get(day)||[]),x]);});
  for(let i=0;i<offset;i++)grid.append(e('span','calendar-blank'));
  for(let day=1;day<=days;day++){
   const iso=`${y}-${pad(m+1)}-${pad(day)}`;const b=e('button','calendar-day',String(day));b.type='button';b.setAttribute('aria-label',`${iso} – ${(dates.get(iso)||[]).length} ellenőrzött esemény`);
   if(iso===todayISO)b.classList.add('is-today');if(iso===sel)b.classList.add('is-selected');if(dates.has(iso))b.classList.add('has-event');
   b.addEventListener('click',()=>{sel=iso;draw();});grid.append(b);
  }
  detail.replaceChildren();const events=dates.get(sel)||[];
  if(sel&&events.length){events.forEach(x=>{const a=e('a','calendar-event',x.title);a.href=href(x.route);detail.append(a);});}
  else detail.append(e('p','calendar-empty',sel?'Ehhez a naphoz nincs hitelesített esemény.':'Válassz ki egy napot. Csak hitelesített dátumok jelennek meg.'));
 }
 prev.addEventListener('click',()=>{m--;if(m<0){m=11;y--;}sel=null;draw();});next.addEventListener('click',()=>{m++;if(m>11){m=0;y++;}sel=null;draw();});today.addEventListener('click',()=>{const p=parts(new Date());y=Number(p.year);m=Number(p.month)-1;sel=isoDay(p);draw();});
 draw();dataJSON('esemenyek.json').then(v=>{all=validEvents(v);draw();}).catch(err=>{detail.textContent='Az eseményadatok most nem frissíthetők: '+err.message;});
 return panel;
}
export function renderHomeExperience(){
 const section=e('section','experience-hub section-wrap');section.id='mindennapi-kozpont';const shell=e('div','container-xxl');
 shell.append(sectionHead('2026 · INTELLIGENS ISKOLAI KÖZPONT','A nap ritmusa, egyetlen pillantással','Élő digitális óra, interaktív naptár és adatvezérelt csengetésirend-megjelenítő. Az időadatok a látogató megnyitásakor frissülnek.'));
 const grid=e('div','experience-dash-grid');add(grid,renderDigitalClock(),renderBellPanel(),renderCalendarPanel());shell.append(grid);section.append(shell);return section;
}
export function renderBellCenter(){const wrap=e('section','experience-standalone');wrap.append(sectionHead('TANULMÁNYI INFORMÁCIÓK','Csengetési rend – részletes nézet','A digitális idősávok a JSON-adatbázisból épülnek fel. A jelenlegi idők fejlesztési bemutatók; a valós adatok ellenőrzése szükséges.'));wrap.append(renderBellPanel({expanded:true}));return wrap;}
export function renderCalendarCenter(){const wrap=e('section','experience-standalone');wrap.append(sectionHead('ISKOLAI ÉS SPORTÉLET','Interaktív eseménynaptár','Lapozz a hónapok között, és válassz napot. Az ellenőrizetlen próbaeseményekhez nem jelenítünk meg kitalált dátumot.'));wrap.append(renderCalendarPanel({expanded:true}));return wrap;}
export function renderLifeGallery(){
 const section=e('section','photo-wall-section section-wrap');section.id='eletkepek';const container=e('div','container-xxl');
 add(container,sectionHead('ÉLETKÉPEK ÉS PILLANATOK','Sport, tudás, közösség – képekben','Fedezd fel a sportágakat, a közös tanulás örömét és a közösségi élményeket sokféle tematikus képen.'));
 const controls=e('div','photo-wall-controls'),results=e('span','gallery-results'),grid=e('div','photo-wall-grid');const more=e('button','gallery-more','További képek mutatása');more.type='button';
 let entries=[],filter='mind',limit=24;
 const choices=[['mind','Összes'],['sport','Sport'],['oktatas','Tanulás'],['kozosseg','Közösség']];
 choices.forEach(([key,label])=>{const b=e('button','gallery-filter',label);b.type='button';b.dataset.filter=key;b.setAttribute('aria-pressed',String(key===filter));b.addEventListener('click',()=>{filter=key;limit=24;draw();});controls.append(b);});controls.append(results);
 const modal=document.createElement('dialog');modal.className='gallery-lightbox';const img=e('img'),caption=e('p','gallery-lightbox-title');const close=e('button','gallery-lightbox-close','Bezárás ×');close.type='button';close.addEventListener('click',()=>modal.close());add(modal,close,img,caption);modal.addEventListener('click',ev=>{if(ev.target===modal)modal.close();});
 function draw(){
  controls.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.filter===filter)));
  const items=entries.filter(x=>filter==='mind'||x.category===filter);
  results.textContent=`${Math.min(limit,items.length)} / ${items.length} kép`;
  grid.replaceChildren();items.slice(0,limit).forEach((item,i)=>{
   const tile=e('button','photo-tile');tile.type='button';tile.setAttribute('aria-label',item.title+' – kép nagyítása');const photo=e('img');photo.src=item.src;photo.alt=item.alt;photo.loading=i<8?'eager':'lazy';photo.decoding='async';
   add(tile,photo,e('span','photo-tile-caption',item.title));tile.addEventListener('click',()=>{img.src=item.src;img.alt=item.alt;caption.textContent=item.title+' · tematikus illusztráció';modal.showModal();});grid.append(tile);
  });more.hidden=items.length<=limit;
 }
 more.addEventListener('click',()=>{limit+=24;draw();});
 add(container,controls,grid,more,modal,note('A képek hangulati illusztrációk, nem az iskola konkrét diákjait, munkatársait, épületét vagy rendezvényeit dokumentálják.'));
 section.append(container);
 dataJSON('kepgaleria.json').then(v=>{if(v?.schemaVersion!=='1.0.0'||!Array.isArray(v.items))throw Error('A képgaléria JSON hibás.');entries=v.items.filter(x=>x.verifiedSchoolPhoto===false&&/^assets\/media\/web\/[a-z0-9-]+\.webp$/.test(x.src)&&typeof x.title==='string');draw();}).catch(err=>{grid.append(e('p','experience-error','Nem tölthető be a galéria: '+err.message));});
 return section;
}
const socialIcons={Facebook:'f',Instagram:'◎',YouTube:'▶',TikTok:'♪'};
function socialView(data,compact=false){
 const group=e('div',compact?'social-chip-group':'social-links-grid');
 data.forEach(x=>{
  const approved=typeof x.url==='string'&&/^https:\/\//.test(x.url);
  const node=e(approved?'a':'span','social-chip'+(approved?'':' is-pending'));
  if(approved){node.href=x.url;node.target='_blank';node.rel='noopener noreferrer';node.setAttribute('aria-label',x.platform+' – külső oldal, új lap');}
  else node.title='A hivatalos profil hivatkozása megerősítésre vár';
  add(node,e('span','social-glyph',socialIcons[x.platform]||'•'),e('span','',x.label+(approved?' ↗':' · egyeztetés alatt')));group.append(node);
 });return group;
}
async function readSocial(){const data=await dataJSON('social.json');if(data?.schemaVersion!=='1.0.0'||!Array.isArray(data.items))throw Error('A social JSON szerkezete hibás');return data.items.filter(x=>['Facebook','Instagram','YouTube','TikTok'].includes(x.platform));}
export function initSocialLinks(){
 readSocial().then(items=>{
  for(const id of ['social-header','social-footer']){const target=document.getElementById(id);if(!target)continue;target.replaceChildren(socialView(items,true));}
 }).catch(err=>console.warn('A közösségi linkek nem elérhetők:',err));
}
export function renderSocialSection(){
 const s=e('section','social-feature-section section-wrap');const c=e('div','container-xxl');
 add(c,sectionHead('KÖZÖSSÉGI MÉDIA','Kövessük együtt az iskolai életet','Sporthírek, diákélet, rendezvények és eredmények: a közösségi csatornáknak kiemelt helyet biztosítunk. A hivatalos linkek intézményi megerősítésre várnak.'));
 const box=e('div','social-feature-box');const col=e('div','social-feature-copy');
 add(col,e('h3','','A történetek a honlapon kezdődnek, a közösségben folytatódnak.'),e('p','','Az egyes platformok saját bejegyzéseit a későbbiekben ellenőrzött linkekkel vagy hozzájárulást kérő beágyazással lehet összekapcsolni. A jelenlegi változat nem tölt le külső követőkódot.'));
 const itemsBox=e('div','social-feature-items');itemsBox.append(e('p','','Közösségi felületek betöltése…'));add(box,col,itemsBox);c.append(box);s.append(c);
 readSocial().then(items=>itemsBox.replaceChildren(socialView(items))).catch(err=>itemsBox.textContent='A közösségi felületek most nem elérhetők.');return s;
}
export function renderStaffCenter(){
 const wrap=e('section','staff-center');wrap.append(sectionHead('A PEDAGÓGIAI KÖZÖSSÉG','Tantestület és munkaközösségek','A pedagógusok személyes bemutatása csak hitelesített, nyilvános adatokkal történhet. A témakörök már most részletesen böngészhetők.'));
 const toolbar=e('div','staff-toolbar');const inp=e('input','staff-search');inp.type='search';inp.placeholder='Keresés tantárgyban, témakörben…';inp.setAttribute('aria-label','Keresés a munkaközösségek között');
 const filters=e('div','staff-filter-group');const grid=e('div','staff-team-grid');const result=e('p','experience-mini-hint');add(toolbar,inp,filters);add(wrap,toolbar,result,grid);
 let teams=[],filter='mind';const cat=[['mind','Összes'],['oktatas','Oktatás'],['sport','Sport'],['kozosseg','Közösség']];
 cat.forEach(([key,label])=>{const b=e('button','staff-filter',label);b.type='button';b.dataset.key=key;b.addEventListener('click',()=>{filter=key;paint();});filters.append(b);});
 function paint(){
  filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.key===filter)));
  const q=inp.value.toLocaleLowerCase('hu-HU');const shown=teams.filter(x=>(filter==='mind'||x.category===filter)&&(x.name+' '+x.description).toLocaleLowerCase('hu-HU').includes(q));result.textContent=shown.length+' munkaterület · A megnevezések a fejlesztési modell részei';grid.replaceChildren();
  shown.forEach((item,i)=>{
   const card=e('article','staff-team-card');const header=e('div','staff-team-photo');const img=e('img');img.src=`assets/media/web/eletkep-${pad(17+(i*3)%24)}.webp`;img.loading='lazy';img.alt='Iskolai témájú illusztráció';header.append(img);
   const body=e('div','staff-team-body');add(body,e('span','staff-team-kicker',item.category==='sport'?'SPORT ÉS MOZGÁS':item.category==='oktatas'?'OKTATÁS':'KÖZÖSSÉG'),e('h3','',item.name),e('p','',item.description),e('span','staff-team-note','A valós munkaközösségi besorolás ellenőrzésre vár.'));
   add(card,header,body);grid.append(card);
  });
  if(!shown.length)grid.append(note('Nincs ilyen találat. Próbálj más keresőkifejezést.'));
 }
 inp.addEventListener('input',paint);
 dataJSON('tantestulet.json').then(data=>{
  if(data.schemaVersion!=='1.0.0'||!Array.isArray(data.teams)||!Array.isArray(data.staff))throw Error('A tantestületi JSON érvénytelen.');
  teams=data.teams.filter(x=>typeof x.name==='string'&&typeof x.description==='string');paint();
  wrap.append(note('Személyes pedagógusprofil és fénykép csak intézményileg jóváhagyott névvel, adatokkal és képfelhasználási jogosultsággal jelenik meg. Jelenleg nincs közzétételre jóváhagyott személyes névsor.'));
 }).catch(err=>grid.append(e('p','experience-error',err.message)));
 return wrap;
}
