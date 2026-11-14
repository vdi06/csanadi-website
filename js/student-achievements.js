/* A Csanádi tanulóinak jóváhagyott versenyeredményei. Név, eredmény, fénykép kizárólag igazolt adatból. */
const SOURCE=new URL('../json/adatok/tanuloi-sikerek.json',import.meta.url);
const el=(tag,cls='',text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
const isoDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'));
const huDate=s=>new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',day:'numeric',timeZone:'Europe/Budapest'}).format(new Date(s+'T12:00:00Z'));
function nowLocal(){return new Intl.DateTimeFormat('sv-SE',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Budapest'}).format(new Date());}
const calendarAge=(published,today)=>Math.round((Date.parse(today+'T00:00:00Z')-Date.parse(published+'T00:00:00Z'))/86400000);
function validate(root){
 if(root?.schemaVersion!=='1.0.0'||root?.collectionId!=='collection:tanuloi-sikerek'||root?.featureDays!==7||root?.timezone!=='Europe/Budapest'||!Array.isArray(root.items))throw Error('Hibás tanulói eredmény-adatforrás.');
 const seen=new Set();return root.items.filter(x=>{
  if(!x||!/^student-success:[a-z0-9-]+$/.test(x.id)||seen.has(x.id)||
    !(x.isDemo===true&&root.previewMode===true || x.isDemo!==true&&x.approved===true&&x.sourceVerified===true)||
    !isoDate(x.publishedAt)||!isoDate(x.eventDate)||!x.studentName?.trim()||!x.className?.trim()||!x.result?.trim()||!x.sport?.trim()||!x.competition?.trim())return false;
  seen.add(x.id);return true;
 }).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
}
async function load(){const r=await fetch(SOURCE,{cache:'no-store'});if(!r.ok)throw Error('Nem olvasható a tanulói eredmények gyűjteménye.');return validate(await r.json());}
function picture(item){
 if((!item.isDemo&&(item.imageApproved!==true||item.photoIsOfStudent!==true))||!/^assets\/media\/web\/[a-z0-9/_-]+\.webp$/.test(item.image||''))return null;
 const img=el('img');img.src=item.image;img.alt=item.isDemo?`${item.sport}: szemléltető sportjelenet, nem a bemutató diák fényképe`:`${item.studentName} – ${item.sport}`;img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>img.remove());return img;
}
function successCard(item,feature){
 const article=el('article',feature?'student-success-card is-featured':'student-success-card');
 const image=picture(item);if(image){const figure=el('div','student-success-image');figure.append(image);if(item.isDemo)figure.append(el('span','student-photo-note','Sportági illusztráció'));article.append(figure);}
 const body=el('div','student-success-body');if(item.isDemo)body.append(el('span','student-demo-label','BEMUTATÓ ADAT · NEM VALÓDI EREDMÉNY'));body.append(el('p','student-success-tag',item.sport),el('h3','',item.studentName),el('p','student-success-class',`${item.className} osztály`),el('p','student-success-event',item.competition));
 body.append(el('strong','student-success-result',item.result));
 if(item.summary)body.append(el('p','student-success-summary',item.summary));
 body.append(el('time','student-success-date',huDate(item.eventDate)));
 article.append(body);return article;
}
function renderItems(section,items,view){
 section.replaceChildren();const inner=el('div','container-xxl student-success-container');
 const head=el('div','student-success-head'),title=el('div');title.append(el('span','section-overline','A CSANÁDI DIÁKJAI'),el('h2','section-title','Diákjaink sportsikerei'));
 const link=el('a','student-success-all','Összes eredmény és az archívum →');link.href='#/sport/sporteredmenyek';head.append(title,link);inner.append(head);
 if(items.some(x=>x.isDemo))inner.append(el('p','student-demo-banner','A megjelenített nevek, osztályok, versenyek és helyezések szemléltető minták, nem az iskola tényleges eredményei. Az arcképek helyett általános sportági illusztrációk láthatók.'));
 const today=nowLocal();const featured=items.filter(x=>{const days=calendarAge(x.publishedAt,today);return days>=0&&days<7;});
 if(view==='home'){
  if(featured.length){
   const focus=el('div','student-success-feature-grid');featured.slice(0,4).forEach(x=>focus.append(successCard(x,true)));inner.append(focus);
   const c=el('p','student-success-note', 'Az új eredmények a közzétételtől számított hét naptári napon át kiemeltek, később az archívumban maradnak.');inner.append(c);
  }else{
   const welcome=el('div','student-success-welcome');
   welcome.append(el('div','student-success-emblem','★'));
   const copy=el('div');copy.append(el('h3','','Minden eredmény mögött kitartó munka áll'),el('p','','A frissen közzétett versenyeredményeket hét napig kiemelten mutatjuk be. Az eredménytárban a korábbi sikerek is megmaradnak.'));
   const action=el('a','student-success-link','Büszkeségeink és eredményeink →');action.href='#/sport/sporteredmenyek';
   welcome.append(copy,action);inner.append(welcome);
  }
 }else{
  const archive=el('div','student-success-archive');
  const label=el('h3','','Tanulói versenyeredmények');archive.append(label);const archived=items.filter(x=>calendarAge(x.publishedAt,nowLocal())>=7);if(archived.length)archive.append(el('p','student-success-note',`${archived.length} korábbi bejegyzés a hétnapos kiemelési időszakon túl.`));
  if(items.length){const search=el('input','form-control student-success-filter');search.type='search';search.placeholder='Név, sportág vagy verseny keresése';search.setAttribute('aria-label','Tanulói eredmények keresése');
   const grid=el('div','student-success-archive-grid');const count=el('p','student-success-note');
   const update=()=>{grid.replaceChildren();const query=search.value.toLocaleLowerCase('hu-HU');const found=items.filter(x=>(x.studentName+' '+x.sport+' '+x.competition+' '+x.result).toLocaleLowerCase('hu-HU').includes(query));count.textContent=found.length+' közzétett eredmény';found.forEach(x=>grid.append(successCard(x,false)));};
   search.addEventListener('input',update);archive.append(search,count,grid);update();
  }else archive.append(el('p','student-success-empty','A versenyeredmények jóváhagyott, név szerint közzétehető bejegyzései ezen az oldalon lesznek megtekinthetők. A korábbi intézményi büszkeségeket az alábbi eredménytárban találod.'));
  inner.append(archive);
 }
 section.append(inner);
}
export function renderStudentAchievements(view='home'){
 const section=el('section',`student-success-section ${view==='archive'?'student-success-archive-section':'student-success-home'}`);
 section.append(el('p','student-success-loading','A sportsikerek betöltése…'));
 load().then(items=>{if(!section.isConnected)return;renderItems(section,items,view);
   const timer=setInterval(()=>{if(!section.isConnected){clearInterval(timer);return;}renderItems(section,items,view);},60000);
 }).catch(err=>{console.warn(err);section.replaceChildren(el('p','student-success-loading','A tanulói eredmények jelenleg nem tölthetők be.'));});
 return section;
}
