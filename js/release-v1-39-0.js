const select=(query,root=document)=>root.querySelector(query);
const all=(query,root=document)=>[...root.querySelectorAll(query)];
const make=(tag,cls,text)=>{const element=document.createElement(tag);if(cls)element.className=cls;if(text!==undefined)element.textContent=text;return element;};
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let currentRoute='#/';
let progressTask=0;
let arrivalRequest=0;
let homeHeroFolded=false;

function updateHomeHeader(){
 const isHome=currentRoute==='#/';
 // A képváltó összecsukása csökkenti a dokumentum magasságát és a scrollY-t.
 // Eltérő nyitó/záró küszöb nélkül ettől ugyanannál a görgetésnél villogna.
 // A magasságot még nyitott állapotból mérjük; összecsukva nem számoljuk újra.
 if(!isHome)homeHeroFolded=false;
 else{
  const hero=select('#global-hero');
  if(!homeHeroFolded){
   const expanded=Number.parseFloat(hero?.style.getPropertyValue('--cs39-hero-expanded'))||
    hero?.scrollHeight||360;
   // Csak a képváltó elhagyása után zsugorítunk; a változás után is a
   // felengedési küszöb fölött maradunk, ezért nincs oda-vissza váltás.
   if(window.scrollY>Math.max(390,expanded+145))homeHeroFolded=true;
  }else if(window.scrollY<=18)homeHeroFolded=false;
 }
 document.body.classList.toggle('cs-home-condensed',isHome&&homeHeroFolded);
 document.body.classList.toggle('cs-home-header',isHome);
}

function headingIndex(){
 const article=select('#app .content-tiles--editorial article.article-flow');
 const shell=select('#app .content-shell');
 if(!article||!shell)return;
 if(article.querySelector('.cs92-section-navigation'))return;
 // A v1.39.2 egyes oldaltípusokban több valódi szerkezeti régióra bontja a
 // cikket, így a címsorok már nem mindenhol közvetlen gyerekei a cikknek.
 const headings=all('.article-section > h2',article);
 if(headings.length<4)return;
 const headingNames=new Map();
 const toc=make('nav','cs-reading-index');
 toc.setAttribute('aria-label','Ugrás az oldal fejezeteihez');
 const caption=make('span','cs-reading-index-eyebrow','TARTALOMJEGYZÉK');
 const title=make('h2','cs-reading-index-title','Ezen az oldalon');
 const list=make('ol','cs-reading-index-list');
 for(const heading of headings){
  const key=heading.textContent.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45)||'szakasz';
  const occurrence=(headingNames.get(key)||0)+1;
  headingNames.set(key,occurrence);
  if(!heading.id)heading.id='fejezet-'+key+(occurrence>1?'-'+occurrence:'');
  const li=make('li');
  const link=make('a','cs-reading-index-link',heading.textContent.trim());
  link.href='#'+heading.id;
  link.dataset.target=heading.id;
  link.addEventListener('click',event=>{
   event.preventDefault();
   heading.scrollIntoView({block:'start',behavior:reduceMotion.matches?'instant':'smooth'});
   heading.setAttribute('tabindex','-1');
   heading.focus({preventScroll:true});
  });
  li.append(link);list.append(li);
 }
 toc.append(caption,title,list);
 article.insertAdjacentElement('beforebegin',toc);
}

function syncReadingIndex(){
 const toc=select('#app .cs-reading-index');
 if(!toc)return;
 const links=all('a[data-target]',toc);
 const threshold=(select('#site-header')?.getBoundingClientRect().bottom||60)+36;
 let latest=links[0];
 for(const link of links){
  const heading=document.getElementById(link.dataset.target);
  if(heading&&heading.getBoundingClientRect().top<=threshold)latest=link;
 }
 for(const link of links){
  if(link===latest)link.setAttribute('aria-current','location');
  else link.removeAttribute('aria-current');
 }
}

function reduceRepeatedRelations(){
 const links=new Set(all('#app .cs-nav-detail-tiles a[href]').map(x=>x.getAttribute('href')));
 const recommendations=select('#app .ext26-relations');
 if(!links.size||!recommendations)return;
 for(const a of all('a[href]',recommendations)){
  if(links.has(a.getAttribute('href')))a.remove();
 }
 if(!select('a[href]',recommendations))recommendations.remove();
}

function removeDuplicates(){
 const article=select('#app article.article-flow');
 if(!article)return;
 const seen=new Set();
 for(const section of all('.article-section',article)){
  const title=select(':scope > h2',section);
  const text=section.textContent.trim().replace(/\s+/g,' ').toLowerCase();
  if(text.length>70&&seen.has(text))section.remove();
  else if(text.length>70)seen.add(text);
  if(title&&!section.textContent.replace(title.textContent,'').trim())section.remove();
 }
}

function renderArrivalMap(route){
 if(route!=='#/megkozelites-es-erkezes/terkep')return;
 const target=select('#app .cs-template--arrival .content-tiles');
 if(!target)return;
 const holder=make('section','cs-arrival-map');
 holder.setAttribute('aria-label','Hozzájárulásos iskolatérkép');
 const intro=make('div','cs-arrival-map-intro');
 intro.append(make('span','cs-eyebrow','TÁJÉKOZÓDÁS'),make('h2','','Az iskola a térképen'),make('p','','A külső térkép csak külön kattintás után töltődik be; a jelölő közelítő, a bejárat helye nem igazolt.'));
 const area=make('div','cs-arrival-map-area');
 const button=make('button','cs-arrival-map-button','Térkép betöltése');
 button.type='button';
 const status=make('p','cs-arrival-map-status','Az OpenStreetMap még nem kapott lekérést ettől az oldaltól.');
 intro.append(button,status);holder.append(intro,area);
 target.prepend(holder);
 const request=++arrivalRequest;
 button.addEventListener('click',async()=>{
  button.disabled=true;button.textContent='Térkép előkészítése…';
  try{
   const response=await fetch('json/adatok/megkozelites-fejlodes-26.json',{cache:'no-store'});
   if(!response.ok)throw Error('Az érkezési adatok átmenetileg nem elérhetők.');
   const data=await response.json();
   if(request!==arrivalRequest||!holder.isConnected)return;
   const lat=Number(data.school?.mapLatApprox),lon=Number(data.school?.mapLonApprox);
   if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<45||lat>49||lon<16||lon>23)throw Error('A térképpont helye nem ellenőrizhető.');
   const delta=.006;
   const bbox=[lon-delta,lat-delta*.65,lon+delta,lat+delta*.65].map(n=>n.toFixed(6)).join(',');
   const map=make('iframe','cs-arrival-iframe');
   map.title='OpenStreetMap – Csanádi Sportiskola közelítő helye';
   map.loading='lazy';
   map.referrerPolicy='no-referrer';
   map.src='https://www.openstreetmap.org/export/embed.html?bbox='+encodeURIComponent(bbox)+'&layer=mapnik&marker='+encodeURIComponent(lat+','+lon);
   area.replaceChildren(map);
   button.disabled=false;button.textContent='Térkép elrejtése';
   button.onclick=()=>{area.replaceChildren();button.textContent='Térkép újbóli betöltése';button.onclick=null;status.textContent='A térkép eltávolítva.';};
   status.textContent='Külső térkép betöltve, a helyjelölő tájékoztató jellegű.';
  }catch(error){button.disabled=false;button.textContent='Újrapróbálkozás';status.textContent=error.message;}
 });
}

function syncMobileHeader(){
 const brand=select('#site-header .brand');
 if(!brand)return;
 brand.setAttribute('aria-label','Csanádi Sportiskola – kezdőoldal');
 const topName=select('#site-header .brand-copy small');
 if(topName)topName.textContent='ÁRPÁD SPORTISKOLA';
 const trigger=select('#mobile-menu-toggle');
 if(trigger){
  trigger.title='Körmenü megnyitása';
  trigger.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="4"/><circle cx="16" cy="5" r="2"/><circle cx="26" cy="10" r="2"/><circle cx="26" cy="22" r="2"/><circle cx="16" cy="27" r="2"/><circle cx="6" cy="22" r="2"/><circle cx="6" cy="10" r="2"/></svg><span class="cs92-mobile-menu-label" aria-hidden="true">MENÜ</span>';
 }
}

function compactHeroControls(){
 const actions=select('#site-header .header-actions');
 if(!actions||select('#cs-compact-hero-controls'))return;
 const group=make('div','cs-compact-hero-controls');
 group.id='cs-compact-hero-controls';group.setAttribute('role','group');group.setAttribute('aria-label','Kezdőlapi képes tartalomváltó');
 for(const [label,caption,selector] of [
  ['Előző kiemelt kép','‹','.csn26-edge-arrow--left'],
  ['Kiemelt képek megtekintése','Képek',null],
  ['Következő kiemelt kép','›','.csn26-edge-arrow--right']
 ]){
  const button=make('button','cs-compact-hero-button',caption);button.type='button';button.setAttribute('aria-label',label);
  button.addEventListener('click',()=>{
   if(selector)select('#global-hero '+selector)?.click();
   else window.scrollTo({top:0,behavior:reduceMotion.matches?'instant':'smooth'});
  });
  group.append(button);
 }
 const search=select('#search-open',actions);
 if(search)search.before(group);else actions.prepend(group);
}

function syncRoute(event){
 currentRoute=event.detail?.route||location.hash||'#/';
 arrivalRequest++;
 updateHomeHeader();
 removeDuplicates();
 headingIndex();
 reduceRepeatedRelations();
 renderArrivalMap(currentRoute);
 syncReadingIndex();
}

export function initReleaseEnhancements(){
 syncMobileHeader();
 compactHeroControls();
 document.addEventListener('csanadi:route-rendered',syncRoute);
 const onScroll=()=>{
  if(progressTask)return;
  progressTask=requestAnimationFrame(()=>{progressTask=0;updateHomeHeader();syncReadingIndex();});
 };
 window.addEventListener('scroll',onScroll,{passive:true});
 window.addEventListener('resize',onScroll,{passive:true});
 window.addEventListener('pageshow',onScroll);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)onScroll();});
 updateHomeHeader();
}
