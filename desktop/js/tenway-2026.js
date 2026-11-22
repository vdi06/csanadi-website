 
const tag=(name,cls,text)=>{const n=document.createElement(name);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
const link=(title,desc,href,mark='↗')=>{const a=tag('a','cs-portal-link');a.href=href;a.append(tag('span','cs-portal-marker',mark),tag('strong','',title),tag('small','',desc));return a;};
function heading(kicker,title,detail){const wrap=tag('header','cs-portal-heading');wrap.append(tag('p','section-overline',kicker),tag('h2','',title),tag('p','',detail));return wrap;}
const JSON_ROOT=new URL('../../shared/json/', import.meta.url);
const json=async path=>{const response=await fetch(new URL(path,JSON_ROOT),{cache:'no-cache'});if(!response.ok)throw Error('Nem elérhető JSON: '+path);return response.json();};
const route={sports:'#/sport',results:'#/sport/sporteredmenyek',athletes:'#/sport/sportolok',teams:'#/sport/csapatok',coaches:'#/sport/edzok',gallery:'#/sport/sportgaleriak'};
export function renderSportsPortal(){
 const section=tag('section','cs-portal-section cs-sport-portal');section.append(heading('SPORTÁGI IRÁNYTŰ','Sportágak és sporteredmények','Az intézményben bemutatott sportági területek és a közzétett sporteredmények gyors elérése.'));
 const buttons=tag('div','cs-portal-filter');buttons.setAttribute('aria-label','Sportág szűrése');
 const grid=tag('div','cs-portal-grid'),status=tag('p','cs-portal-stats','A sportági adatok betöltése…');status.setAttribute('aria-live','polite');
 section.append(buttons,grid,status);
 json('data/sports-achievements.json').then(data=>{
  if(!section.isConnected)return;
  const list=(data.items||[]).filter(x=>x.status==='verified'&&x.verified===true&&typeof x.category==='string');
  const counts=new Map();for(const x of list)counts.set(x.category,(counts.get(x.category)||0)+1);
  const categories=[...counts].sort((a,b)=>a[0].localeCompare(b[0],'hu'));
  const options=[['all','Mindegyik'],...categories.map(x=>[x[0],x[0]])];
  let choice='all';const draw=()=>{grid.replaceChildren();for(const [name,num] of categories){
   if(choice!=='all'&&choice!==name)continue;
   const a=link(name,`${num} ellenőrzött bejegyzés az intézményi büszkeséglistában`,route.results,'★');
   const bar=tag('span','cs-bar'),fill=tag('span');fill.style.width=Math.max(6,Math.round(num/Math.max(1,...categories.map(x=>x[1]))*100))+'%';bar.append(fill);a.append(bar);grid.append(a);
  }
  status.textContent=`${categories.length} sportági kategória · ${list.length} közzétett bejegyzés. A darabszám nem az aktuális tanulók vagy csapatok száma.`;
  for(const b of buttons.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.sport===choice));};
  for(const [id,name] of options){const b=tag('button','',name);b.type='button';b.dataset.sport=id;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{choice=id;draw()});buttons.append(b);}
  draw();
 }).catch(()=>{status.textContent='A sportági bejegyzések jelenleg nem tölthetők be.';});
 const destinations=tag('div','cs-portal-grid cs-portal-small');
 for(const [title,desc,href] of [['Csapatok','Csapatélet és versenyek',route.teams],['Edzők','Sportági felkészítés',route.coaches],['Sportgalériák','Képek és videómontázsok',route.gallery]])destinations.append(link(title,desc,href));
 section.append(destinations);return section;
}
export function renderEducationPath(){
 const section=tag('section','cs-portal-section cs-education-path');section.append(heading('TANULMÁNYI ÚTVONALAK','Iskolai és felvételi útmutató','A lépések általános tájékozódási pontok. A pontos időpontokat mindig az adott hivatalos felvételi oldalon ellenőrizd.'));
 const steps=[['1. Ismerd meg a képzést','Általános iskola, gimnázium és sportiskolai nevelés.','#/oktatas/kepzeseink','①'],['2. Tájékozódj a felvételiről','Belépési feltételek, jelentkezés és eljárások.','#/oktatas/felveteli','②'],['3. Ellenőrizd a határidőket','Aktuális intézményi és országos határidők.','#/oktatas/felveteli/felveteli-hataridok','③'],['4. Ismerd meg a vizsgákat','Érettségi, osztályozó- és egyéb vizsgák.','#/oktatas/vizsgak','④'],['5. Tervezd meg a tanévet','Tanévi tudnivalók, iskolai események.','#/oktatas/tanevek','⑤'],['6. Keresd a dokumentumokat','Segédletek, szabályzatok és nyomtatványok.','#/informaciok/dokumentumtar','⑥']];
 const grid=tag('div','cs-portal-grid');for(const x of steps)grid.append(link(x[0],x[1],x[2],x[3]));section.append(grid);return section;
}
export function renderUpcomingPanel(){
 const section=tag('section','cs-portal-section cs-upcoming-panel');section.append(heading('JÓVÁHAGYOTT IDŐPONTOK','Következő események','Csak ellenőrzött, közzétett, jövőbeli dátumok szerepelnek itt.'));
 const grid=tag('div','cs-portal-grid'),status=tag('p','cs-portal-stats','Események betöltése…');section.append(grid,status);
 json('data/events.json').then(data=>{
  if(!section.isConnected)return;
  const now=Date.now();const items=(data.items||[]).filter(x=>x.verified===true&&x.status==='published'&&Date.parse(x.startsAt)>now).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt)).slice(0,settingNumber('runtime.display.upcomingEventPanel'));
  grid.replaceChildren();const fmt=new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:setting('modules2026.clock.timezone')});
  for(const item of items){const when=item.allDay===true?new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',day:'numeric',timeZone:setting('modules2026.clock.timezone')}).format(new Date(item.startsAt))+' · óra nincs megadva':fmt.format(new Date(item.startsAt));const a=link(item.title,when+' · '+(item.location||'Helyszín nincs megadva'),item.route||'#/hirek-es-esemenyek/esemenynaptar','◷');grid.append(a);}
  status.textContent=items.length?'Az eseményeket a honlap saját JSON-adatállományából töltjük be.':'Jelenleg nincs jóváhagyott, jövőbeli esemény az adatállományban.';
 }).catch(()=>status.textContent='Az eseménynaptár adatai jelenleg nem elérhetők.');
 return section;
}
function csvField(x){const value=String(x??'').replace(/^[=+@\-]/,m=>"'"+m);return '"'+value.replace(/"/g,'""')+'"';}
export function renderDocumentIndexExport(){
 const wrapper=tag('div','cs-skip-shortcuts cs-doc-export-wrap');const button=tag('button','cs-doc-export','Dokumentumjegyzék letöltése (.csv)');button.type='button';
 const text=tag('p','cs-newstag','A letöltés helyben, a böngészőben készül az elérhető dokumentum-JSON alapján.');text.setAttribute('aria-live','polite');
 button.addEventListener('click',async()=>{
  button.disabled=true;try{const data=await json('data/documents.json');const rows=[['Cím','Leírás','Kategória','Státusz','Fájl']];
   for(const d of data.documents||[])if(d.status==='published')rows.push([d.title,d.summary,d.categoryId,d.status,d.filePath||'']);
   const csv='\uFEFF'+rows.map(cols=>cols.map(csvField).join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
   const a=tag('a');a.href=url;a.download='csanadi-dokumentumjegyzek.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
   text.textContent=`${rows.length-1} dokumentum jegyzéke elkészült.`;
  }catch(e){text.textContent='A jegyzék nem készíthető el: az adatforrás nem elérhető.';}finally{button.disabled=false;}
 });wrapper.append(button,text);return wrapper;
}
import {setting,settingNumber} from './site-settings-2026.js?v=1.53';
