/* Csanádi Sportiskola – ellenőrzött eredmények vagy elkülönített bemutatóbejegyzések. */
const SOURCE=new URL('../json/adatok/tanuloi-sikerek.json',import.meta.url);
const el=(tag,cls='',text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
const iso=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'));
const localDate=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const datePlus=(s,d)=>{const t=new Date(s+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+d);return t.toISOString().slice(0,10);};
const daysSince=(start,end)=>Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000);
const huDate=s=>new Intl.DateTimeFormat('hu-HU',{timeZone:'Europe/Budapest',year:'numeric',month:'long',day:'numeric'}).format(new Date(s+'T12:00:00Z'));
function validate(root){
 if(root?.schemaVersion!=='1.0.0'||root?.collectionId!=='collection:tanuloi-sikerek'||root?.timezone!=='Europe/Budapest'||root?.featureDays!==7||!Array.isArray(root.items))throw Error('Érvénytelen sporteredmény-adatforrás.');
 const ids=new Set();const result=[];
 for(const x of root.items){
  if(!x||!/^student-success:[a-z0-9-]+$/.test(x.id)||ids.has(x.id)||!iso(x.publishedAt)||!iso(x.eventDate)||
   !['studentName','className','sport','competition','result'].every(k=>typeof x[k]==='string'&&x[k].trim())||
   !(x.isDemo===true&&root.previewMode===true || x.isDemo!==true&&x.approved===true&&x.sourceVerified===true))continue;
  if(x.isDemo&&( !Number.isInteger(x.demoDaysAgo)||x.demoDaysAgo<0||x.demoDaysAgo>1500))continue;
  ids.add(x.id);result.push(x);
 }
 return result;
}
async function load(){const r=await fetch(SOURCE,{cache:'no-store'});if(!r.ok)throw Error('A sporteredmények nem érhetők el.');return validate(await r.json());}
const actualPublication=x=>x.isDemo?datePlus(localDate(),-x.demoDaysAgo):x.publishedAt;
const actualEventDate=x=>x.isDemo?datePlus(localDate(),-x.demoDaysAgo-1):x.eventDate;
const isFeatured=x=>{const d=daysSince(actualPublication(x),localDate());return d>=0&&d<7;};
function picture(x){
 if(!x.isDemo&&(x.imageApproved!==true||x.photoIsOfStudent!==true))return null;
 if(!/^assets\/media\/web\/[a-z0-9/_-]+\.webp$/.test(x.image||''))return null;
 const img=el('img');img.src=x.image;img.alt=x.isDemo?x.sport+' – sportági illusztráció, nem a bemutató tanuló portréja':x.studentName+' – '+x.sport;img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>img.remove());return img;
}
function card(x,featured){
 const article=el('article','student-success-card'+(featured?' is-featured':'')+(x.isDemo?' is-example':''));
 const pic=picture(x);if(pic){const f=el('div','student-success-image');f.append(pic);if(x.isDemo)f.append(el('span','student-photo-note','Sportági illusztráció'));article.append(f);}
 const b=el('div','student-success-body');
 if(x.isDemo)b.append(el('span','student-demo-label','BEMUTATÓBEJEGYZÉS'));
 b.append(el('p','student-success-tag',x.sport),el('h3','',x.studentName),el('p','student-success-class',x.className+' osztály'),el('p','student-success-event',x.competition),el('strong','student-success-result',x.result));
 if(x.summary)b.append(el('p','student-success-summary',x.summary));
 const published=el('time','student-success-date','Közzétéve: '+huDate(actualPublication(x)));published.dateTime=actualPublication(x);b.append(published);article.append(b);return article;
}
function sectionHead(inner,title,subtitle){const h=el('div','student-success-head');const wrap=el('div');wrap.append(el('span','section-overline','SPORT · KITARTÁS · EREDMÉNYEK'),el('h2','section-title',title));h.append(wrap);inner.append(h);if(subtitle)inner.append(el('p','student-success-intro',subtitle));}
function notice(inner,items){if(items.some(x=>x.isDemo))inner.append(el('p','student-demo-banner','A képes eredménybejegyzések szemléltető minták: a nevek, osztályok, versenyek, helyezések és dátumok nem az iskola tényleges eredményei. A képek nem az említett tanulók portréi.'));}
function mount(section,items,view){
 section.replaceChildren();const inner=el('div','container-xxl student-success-container');
 const active=items.filter(isFeatured).sort((a,b)=>actualPublication(b).localeCompare(actualPublication(a)));
 const older=items.filter(x=>!isFeatured(x)).sort((a,b)=>actualPublication(b).localeCompare(actualPublication(a)));
 if(view==='home'){
  sectionHead(inner,'Diákjaink sportsikerei','Az új eredmények hét napig kiemelt helyen láthatók. A korábbi történetek a sporteredmények archívumában is megtalálhatók.');
  notice(inner,active);
  if(active.length){const count=el('p','student-success-stat',`${active.length} kiemelt bejegyzés · ${older.length} korábbi eredmény az archívumban`);inner.append(count);const grid=el('div','student-success-feature-grid');active.slice(0,10).forEach(x=>grid.append(card(x,true)));inner.append(grid);}
  else inner.append(el('p','student-success-note','Jelenleg nincs az elmúlt hét napban közzétett eredmény. A korábbi sikerek az archívumban továbbra is elérhetők.'));
  const link=el('a','student-success-all','Összes sporteredmény és archívum →');link.href='#/sport/sporteredmenyek';inner.append(link);
 }else{
  sectionHead(inner,'Diákjaink sportsikerei – eredménytár','Kiemelt és korábbi bejegyzések, sportág, név, osztály, verseny és helyezés szerint kereshetően.');
  notice(inner,items);
  const tools=el('div','student-success-tools');const search=el('input','form-control student-success-filter');search.type='search';search.placeholder='Név, osztály, sportág, verseny vagy eredmény';search.setAttribute('aria-label','Keresés a sporteredmények között');
  const sports=Array.from(new Set(items.map(x=>x.sport))).sort((a,b)=>a.localeCompare(b,'hu'));const select=el('select','form-select student-success-sport');select.setAttribute('aria-label','Sportág szűrése');const all=el('option','','Összes sportág');all.value='';select.append(all);sports.forEach(s=>{const opt=el('option','',s);opt.value=s;select.append(opt);});tools.append(search,select);inner.append(tools);
  const stat=el('p','student-success-stat');inner.append(stat);
  const activeHeading=el('h3','student-success-group-heading','Kiemelt eredmények (7 napon belül)');const activeGrid=el('div','student-success-feature-grid');
  const archiveHeading=el('h3','student-success-group-heading','Korábbi eredmények · Archívum');const archiveGrid=el('div','student-success-archive-grid');
  inner.append(activeHeading,activeGrid,archiveHeading,archiveGrid);
  const update=()=>{
   const q=search.value.trim().toLocaleLowerCase('hu-HU'),sp=select.value;
   const filter=x=>(!sp||x.sport===sp)&&[x.studentName,x.className,x.sport,x.competition,x.result,x.summary||''].join(' ').toLocaleLowerCase('hu-HU').includes(q);
   const feat=active.filter(filter),arch=older.filter(filter);activeGrid.replaceChildren();archiveGrid.replaceChildren();feat.forEach(x=>activeGrid.append(card(x,true)));arch.forEach(x=>archiveGrid.append(card(x,false)));
   activeHeading.hidden=!feat.length;activeGrid.hidden=!feat.length;archiveHeading.hidden=!arch.length;archiveGrid.hidden=!arch.length;
   stat.textContent=`${feat.length} kiemelt és ${arch.length} archív eredmény (${feat.length+arch.length} találat)`;
   if(!feat.length&&!arch.length)stat.textContent='Nincs találat. Próbálj más szűrőt.';
  };search.addEventListener('input',update);select.addEventListener('change',update);update();
 }
 section.append(inner);
}
export function renderStudentAchievements(view='home'){
 const section=el('section','student-success-section '+(view==='archive'?'student-success-archive-section':'student-success-home'));
 section.append(el('p','student-success-loading','A sporteredmények betöltése…'));
 load().then(items=>{if(!section.isConnected)return;mount(section,items,view);
  const timer=setInterval(()=>{if(!section.isConnected){clearInterval(timer);return;}if(!section.querySelector(':focus-within'))mount(section,items,view);},300000);
 }).catch(err=>{console.warn(err);section.replaceChildren(el('p','student-success-loading','A tanulói eredmények átmenetileg nem tölthetők be.'));});return section;
}
