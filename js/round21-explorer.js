import {createZip,downloadBlob} from './zip-native-2026.js?v=1.42.13';

const byId=id=>document.getElementById(id);
const node=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
const clear=n=>n.replaceChildren();
const link=(route,label)=>{const a=node('a','explorer-link',label);a.href=location.pathname.endsWith('/#/iskolank/felfedezo')?'index.html'+route:route;return a;};
const key='csanadi-r21-';
const saved=(name,fallback)=>{try{return JSON.parse(localStorage.getItem(key+name))??fallback;}catch{return fallback;}};
const save=(name,value)=>{try{localStorage.setItem(key+name,JSON.stringify(value));return true;}catch{return false;}};
const configNumber=(path,fallback)=>{let value=window.round21Settings;for(const part of path.split('.'))value=value?.[part];return typeof value==='number'&&value>0?value:fallback;};
const dateLabel=date=>{const d=new Date(date+'T12:00:00');return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',day:'numeric'}).format(d):'Időpont ellenőrzendő';};
let data,documents,news,events;

async function load(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status+': '+path);return r.json();}
function renderAdmissions(){
 const control=byId('admission-control'),out=byId('admission-result');
 const selected=new Set(data.admission.slice(0,2).map(p=>p.id));
 function draw(){
  clear(out);
  if(!selected.size){out.append(node('p','','Válassz legalább egy képzést!'));return;}
  const table=node('table','explorer-comparison');
  const caption=node('caption','','Felvételi tudnivalók összehasonlítása');table.append(caption);
  const head=node('thead');const hrow=node('tr');hrow.append(node('th','','Szempont'));
  for(const p of data.admission.filter(p=>selected.has(p.id)))hrow.append(node('th','',p.label));head.append(hrow);table.append(head);
  const body=node('tbody');for(const [label,field] of [['Képzés','program'],['Követelmények','requirements'],['Határidők','deadline']]){
   const row=node('tr');row.append(node('th','',label));for(const p of data.admission.filter(x=>selected.has(x.id)))row.append(node('td','',p[field]));body.append(row);
  }
  const row=node('tr');row.append(node('th','','Részletek'));for(const p of data.admission.filter(x=>selected.has(x.id))){const td=node('td');td.append(link(p.route,'Felvételi oldal →'));row.append(td);}body.append(row);table.append(body);out.append(table);
 }
 for(const p of data.admission){const item=node('label','explorer-choice'),box=node('input');box.type='checkbox';box.checked=selected.has(p.id);box.addEventListener('change',()=>{
  if(box.checked&&selected.size>=configNumber('round21.maxAdmissionCompare',3)){box.checked=false;byId('explorer-status').textContent='Egyszerre legfeljebb három képzést hasonlíthatsz össze.';return;}
  box.checked?selected.add(p.id):selected.delete(p.id);draw();
 });item.append(box,document.createTextNode(p.label));control.append(item);}draw();
}
function renderAcademic(){
 const out=byId('academic-result'),category=byId('academic-category');
 function draw(){clear(out);const chosen=category.value;
  const timeline=node('ol','explorer-timeline');
  for(const item of data.academic.filter(x=>chosen==='all'||x.category===chosen).sort((a,b)=>a.date.localeCompare(b.date))){
   const li=node('li');li.append(node('strong','',dateLabel(item.date)+' · '+item.title),node('p','',item.note),link(item.route,'Kapcsolódó oldal →'));timeline.append(li);
  }
  if(timeline.children.length)out.append(timeline);
  for(const item of data.academicUndated.filter(x=>chosen==='all'||x.category===chosen)){const box=node('div','explorer-undated');box.append(node('strong','','Dátum nélkül · '+item.title),node('p','',item.note));out.append(box);}
  if(!out.children.length)out.append(node('p','','Ehhez a kategóriához még nincs ellenőrzött időpont.'));
 }
 category.addEventListener('change',draw);draw();
}
function renderSports(){
 const interest=byId('sports-interest'),out=byId('sports-result');
 function draw(){clear(out);const term=interest.value;
  const items=data.sports.filter(s=>term==='all'||s.kind===term||s.interest.includes(term));
  for(const s of items){const card=node('article','explorer-tile');card.append(node('span','explorer-kicker',s.kind==='csapat'?'Csapatsport':'Egyéni sport'),node('h3','',s.name),node('p','',s.description),node('p','explorer-small','Helyszín és aktuális iskolai lehetőség: intézményi egyeztetéssel.'),link(s.route,'Sportági tájékoztató →'));out.append(card);}
  if(!items.length)out.append(node('p','','Nincs ilyen sportágbemutató.'));
 }
 interest.addEventListener('change',draw);draw();
}
function renderMap(){
 const out=byId('map-graphic'),info=byId('map-info');
 const grid=node('div','explorer-map-zones');out.append(grid);
 const address=node('p','explorer-small','Cím: 1143 Budapest, Őrnagy utca 5–7. · Szemléltető témakörök, nem térbeli elhelyezkedés.');out.append(address);
 data.map.forEach((place,index)=>{const button=node('button','explorer-map-zone',`${index+1}. ${place.name}`);button.type='button';button.addEventListener('click',()=>{
  clear(info);const box=node('div','explorer-map-detail');box.append(node('h3','',place.name),node('p','',place.description),link(place.route,'Kapcsolódó oldal →'));info.append(box);
  for(const other of grid.querySelectorAll('button'))other.setAttribute('aria-pressed',String(other===button));
 });button.setAttribute('aria-pressed','false');grid.append(button);if(index===0)queueMicrotask(()=>button.click());});
}
function initTour(){
 const dialog=byId('tour-dialog');let index=0;
 const shown=()=>{const t=data.tour[index];byId('tour-title').textContent=t.title;byId('tour-copy').textContent=t.text;byId('tour-counter').textContent=`${index+1} / ${data.tour.length}`;byId('tour-previous').disabled=index===0;byId('tour-next').textContent=index===data.tour.length-1?'Befejezés':'Tovább';};
 const open=()=>{index=0;shown();dialog.showModal();};
 function close(){dialog.close();save('tour-visited',true);}
 byId('tour-launch').addEventListener('click',open);byId('tour-start').addEventListener('click',open);
 byId('tour-previous').addEventListener('click',()=>{index=Math.max(0,index-1);shown();});
 byId('tour-next').addEventListener('click',()=>{if(index===data.tour.length-1)close();else{index++;shown();}});
 byId('tour-close').addEventListener('click',close);dialog.addEventListener('close',()=>save('tour-visited',true));
 if(!saved('tour-visited',false)){const msg=node('p','explorer-tour-invite','Első látogatás? Az útmutató gombbal öt rövid lépésben megismerheted a honlapot.');byId('bemutato').append(msg);}
}
function initHomePrefs(){
 const current=byId('home-current');
 const display=()=>{const p=saved('home-preferences',null);current.textContent=p?'Helyi kezdőlapbeállítás: '+(p.visible||[]).length+' megjelenített kártya.':'Még nincs helyi kezdőlapbeállítás.';};
 byId('home-clear').addEventListener('click',()=>{try{localStorage.removeItem(key+'home-preferences');}catch{}display();});display();
}
function initDocumentBundle(){
 const out=byId('docs-list'),button=byId('docs-download'),status=byId('docs-state');
 const available=(documents.documents||[]).filter(d=>d.status==='published'&&d.mimeType==='application/pdf'&&/^assets\/documents\/[a-z0-9._-]+\.pdf$/i.test(d.filePath));
 for(const d of available){const line=node('label','explorer-doc');const input=node('input');input.type='checkbox';input.value=d.id;line.append(input,node('span','',`${d.title} · ${d.version||'verzió nélkül'}`));out.append(line);}
 if(!available.length){out.append(node('p','','Nem található publikált, helyi PDF.'));button.disabled=true;return;}
 button.addEventListener('click',async()=>{
  const checked=[...out.querySelectorAll('input:checked')].map(input=>available.find(d=>d.id===input.value)).filter(Boolean);
  const maximum=configNumber('round21.maxBundleFiles',12),maxBytes=configNumber('round21.maxBundleBytes',24000000);
  if(!checked.length||checked.length>maximum){status.textContent=`Válassz 1–${maximum} dokumentumot!`;return;}
  button.disabled=true;status.textContent='A kiválasztott dokumentumok ellenőrzött letöltése…';
  try{const entries=new Map();let total=0;
   for(const d of checked){const r=await fetch(d.filePath,{cache:'no-store'});if(!r.ok)throw Error('Nem érhető el: '+d.filePath);
    const bytes=new Uint8Array(await r.arrayBuffer());if(bytes.length<5||new TextDecoder().decode(bytes.subarray(0,5))!=='%PDF-')throw Error('Nem érvényes PDF: '+d.fileName);
    total+=bytes.byteLength;if(total>maxBytes)throw Error('Túl nagy dokumentumcsomag.');entries.set(d.filePath,bytes);}
   const blob=await createZip(entries);downloadBlob(blob,'csanadi-dokumentumcsomag.zip');status.textContent=`Elkészült: ${entries.size} PDF · ${new Intl.NumberFormat('hu-HU').format(total)} bájt.`;
  }catch(e){status.textContent='Nem sikerült elkészíteni: '+e.message;}finally{button.disabled=false;}
 });
}
function initNewsWatcher(){
 const selected=new Set(saved('watch-topics',['Felvételi','Oktatás','Sport']));
 const options=['Felvételi','Oktatás','Sport','Közlemény','Iskolánk'];
 const choices=byId('news-interests'),result=byId('news-result');
 for(const name of options){const row=node('label','explorer-choice'),check=node('input');check.type='checkbox';check.checked=selected.has(name);check.addEventListener('change',()=>{check.checked?selected.add(name):selected.delete(name);save('watch-topics',[...selected]);render();});row.append(check,document.createTextNode(name));choices.append(row);}
 const verified=()=>news.items.filter(n=>n.status==='verified'&&n.date&&selected.has(n.category));
 function render(){clear(result);const already=saved('watch-snapshot',{}),items=verified();const fresh=items.filter(n=>!already[n.id]||already[n.id]!==n.date);
  result.append(node('p','explorer-note',`${items.length} ellenőrzött közlés a követett témákban · ${fresh.length} új vagy módosult a saját utolsó megtekintésed óta.`));
  const list=node('ul');for(const n of fresh){const li=node('li');li.append(node('strong','',n.title+' · '+dateLabel(n.date)),document.createTextNode(' '),link(n.route,'Megnyitás →'));list.append(li);}if(list.children.length)result.append(list);
 }
 byId('news-refresh').addEventListener('click',render);byId('news-mark').addEventListener('click',()=>{const snapshot=saved('watch-snapshot',{});for(const n of verified())snapshot[n.id]=n.date;save('watch-snapshot',snapshot);render();});render();
}
function initQuiz(){
 const result=byId('quiz-result'),feedback=byId('quiz-feedback');
 function draw(){clear(result);feedback.textContent='';data.quiz.forEach((q,index)=>{const group=node('fieldset','explorer-question');group.append(node('legend','',`${index+1}. ${q.question}`));q.options.forEach((option,i)=>{
   const label=node('label','explorer-answer'),input=node('input');input.type='radio';input.name='question-'+index;input.value=String(i);label.append(input,document.createTextNode(option));group.append(label);
  });result.append(group);});}
 byId('quiz-check').addEventListener('click',()=>{let score=0,complete=true;for(const [index,q] of data.quiz.entries()){
  const chosen=result.querySelector(`input[name="question-${index}"]:checked`),group=result.children[index];group.querySelector('.explorer-explanation')?.remove();if(!chosen){complete=false;continue;}
  const good=Number(chosen.value)===q.correct;if(good)score++;const p=node('p','explorer-explanation',`${good?'✓ Helyes.':'✕ Még nem. '} ${q.explanation}`);group.append(p);
 }feedback.textContent=complete?`Eredményed: ${score} / ${data.quiz.length}. Az eredmény csak ezen a lapon látszik.`:'Válaszolj minden kérdésre az értékeléshez!';});
 byId('quiz-reset').addEventListener('click',draw);draw();
}
function initKiosk(){
 const dialog=byId('kiosk-dialog'),content=byId('kiosk-content');
 const slides=[...news.items.filter(n=>n.status==='verified'&&n.date).map(n=>({title:n.title,summary:n.summary,date:n.date,route:n.route,kind:'Hír'})),
  ...events.items.filter(e=>e.status==='published'&&e.verified===true&&e.startsAt).map(e=>({title:e.title,summary:e.summary,date:e.startsAt.slice(0,10),route:e.route,kind:'Esemény'}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,configNumber('round21.kioskMaxSlides',14));
 let index=0,paused=false,timer=null;
 function draw(){clear(content);if(!slides.length){content.append(node('p','','Nincs ellenőrzött, közzétett bejegyzés.'));return;}
  const s=slides[index];const title=node('h2','',s.title);title.id='kiosk-heading';content.append(node('p','explorer-kicker',s.kind+' · '+dateLabel(s.date)),title,node('p','explorer-kiosk-text',s.summary),link(s.route,'További információ →'),node('p','explorer-kiosk-count',`${index+1} / ${slides.length}`));}
 const step=n=>{index=(index+n+slides.length)%slides.length;draw();};
 const stop=()=>{clearInterval(timer);timer=null;};
 const start=()=>{stop();if(!paused)timer=setInterval(()=>{if(!document.hidden&&dialog.open)step(1);},configNumber('round21.kioskRotationMs',8500));};
 dialog.closest('.cs-spa-feature')?.addEventListener('csanadi:feature-unmount',()=>{stop();if(dialog.open)dialog.close();},{once:true});
 byId('kiosk-start').addEventListener('click',()=>{index=0;paused=false;draw();dialog.showModal();if(dialog.requestFullscreen)dialog.requestFullscreen().catch(()=>{});start();});
 function close(){stop();if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});dialog.close();}
 byId('kiosk-close').addEventListener('click',close);dialog.addEventListener('close',stop);
 byId('kiosk-prev').addEventListener('click',()=>step(-1));byId('kiosk-next').addEventListener('click',()=>step(1));
 byId('kiosk-play').addEventListener('click',()=>{paused=!paused;byId('kiosk-play').textContent=paused?'▶ Folytatás':'⏸ Szünet';start();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(dialog.open)start();});
}
function initTheme(){
 const values=['system','light','dark'];const names={system:'Rendszer',light:'Világos',dark:'Sötét'};
 let value;try{value=localStorage.getItem('csanadi-theme')||'system';}catch{value='system';}
 function apply(){
  const mode=value==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):value;
  document.documentElement.dataset.theme=mode;byId('theme21').textContent='◐ '+names[value]+' téma';
  const palette=window.round21Palette?.[mode+'Colors'];
  if(palette){const names={page:'page',card:'panel',ink:'ink',muted:'muted',line:'line',sportGreen:'green',sportYellow:'yellow'};for(const [source,target] of Object.entries(names))if(palette[source])document.documentElement.style.setProperty('--x-'+target,palette[source]);}
 }
 window.applyRound21Theme=apply;
 byId('theme21').addEventListener('click',()=>{value=values[(values.indexOf(value)+1)%3];try{localStorage.setItem('csanadi-theme',value);}catch{}apply();});
 const query=matchMedia('(prefers-color-scheme: dark)'),change=()=>{if(value==='system'&&byId('theme21')?.isConnected)apply();};
 query.addEventListener('change',change);
 byId('theme21').closest('.cs-spa-feature')?.addEventListener('csanadi:feature-unmount',()=>query.removeEventListener('change',change),{once:true});
 apply();
}
async function main(){initTheme();
 try{
  const config=await load('json/config.json');
  const dataset=config.runtime?.round21?.explorerDataPath;
  if(typeof dataset!=='string'||!/^data\/[a-z0-9-]+\.json$/.test(dataset))throw Error('Érvénytelen központi felfedezőadat-útvonal');
  const [d,docs,n,ev]=await Promise.all([load('json/'+dataset),load('json/data/documents.json'),load('json/data/official-news.json'),load('json/data/events.json')]);
  window.round21Settings=config.runtime;window.round21Palette=config.theme;window.applyRound21Theme?.();data=d;documents=docs;news=n;events=ev;
  renderAdmissions();renderAcademic();renderSports();renderMap();initTour();initHomePrefs();initDocumentBundle();initNewsWatcher();initQuiz();initKiosk();
  byId('explorer-status').textContent='A tíz interaktív eszköz betöltődött. A nyilvános adatok helyi JSON-fájlokból érkeznek.';
 }catch(error){console.error('Felfedezőközpont adatbetöltési hiba:',error);byId('explorer-status').textContent='Nem tölthető be a teljes felfedezőközpont: '+error.message+' · Ellenőrizd, hogy minden fájlt feltöltöttél-e.';}
}
export function mountExplorer(){return main();}
if(location.pathname.endsWith('/#/iskolank/felfedezo'))mountExplorer();
