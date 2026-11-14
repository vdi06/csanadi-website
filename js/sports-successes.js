/* Hiteles sporteredmények szövegesen, külön, tematikus mozgásgalériával. */
const RESULTS=new URL('../json/adatok/sportsikerek.json',import.meta.url);
const GALLERY=new URL('../json/adatok/kepgaleria.json',import.meta.url);
const n=(tag,klass='',text)=>{const x=document.createElement(tag);if(klass)x.className=klass;if(text!==undefined)x.textContent=String(text);return x;};
const append=(p,...c)=>{p.append(...c);return p;};
async function data(url){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error(`Nem található: ${r.status}`);return r.json();}
function valid(r,g){
 if(!r||r.collectionId!=='collection:sportsikerek'||!Array.isArray(r.items)||!g||!Array.isArray(g.items))throw Error('Érvénytelen galériaadat.');
 const seen=new Set();const items=r.items.filter(x=>{
  if(!x||!/^success:[a-z0-9-]+$/.test(x.id)||seen.has(x.id)||typeof x.title!=='string'||!x.summary||x.status!=='verified'||x.source?.verified!==true||x.source?.url!=='https://csanadi-bp.edu.hu/buszkeseg.html')return false;
  seen.add(x.id);return true;
 });
 const images=g.items.filter(x=>x.category==='sport'&&/^assets\/media\/web\/[a-z0-9/_-]+\.webp$/.test(x.src||'')).slice(0,12);
 return {items,images};
}
function achievementCard(x){
 const card=n('article','cs-achievement');const badge=n('span','cs-achievement-sport',x.category);
 const title=n('h3','',x.title.replace(' – kiemelkedő sportpályafutás',''));
 const description=n('p','',x.summary.replace(' A Csanádi Sportiskola hivatalos büszkeséglistájában szerepel.',''));
 const link=n('span','cs-achievement-source','Ellenőrzött intézményi eredmény');
 return append(card,badge,title,description,link);
}
function home(root,results,images){
 const container=n('div','container-xxl'),header=n('div','sports-head');
 append(header,append(n('div'),n('span','sports-eyebrow','CSANÁDI · SPORT · EREDMÉNYEK'),n('h2','sports-title','Sportolói sikereink')));
 const all=n('a','sports-all-link','Összes eredmény és sporthír →');all.href='#/sport/sporteredmenyek';header.append(all);container.append(header);
 const layout=n('div','cs-sport-layout');
 const carousel=n('div','cs-sport-gallery');carousel.setAttribute('aria-label','Sportpillanatok, tematikus illusztrációk');
 const stage=n('div','cs-sport-stage');const slides=[];
 images.forEach((img,i)=>{
  const slide=n('figure','cs-sport-scene');slide.hidden=i!==0;slide.setAttribute('aria-hidden',String(i!==0));
  const picture=n('img');picture.src=img.src;picture.alt=img.alt||img.title;picture.loading=i===0?'eager':'lazy';picture.decoding='async';
  const cover=n('div','cs-sport-photo-shade');const caption=n('figcaption');append(caption,n('span','cs-sport-kicker','SPORT · CSAPAT · MOZGÁS'),n('strong','',img.title),n('small','','ILLUSZTRÁCIÓ'));
  append(slide,picture,cover,caption);stage.append(slide);slides.push(slide);
 });
 const controls=n('div','cs-sport-controls'),prev=n('button','cs-sport-btn','‹'),next=n('button','cs-sport-btn','›'),pause=n('button','cs-sport-pause','Szünet'),counter=n('span','cs-sport-count','');
 [prev,next,pause].forEach(b=>b.type='button');prev.setAttribute('aria-label','Előző sportkép');next.setAttribute('aria-label','Következő sportkép');pause.setAttribute('aria-label','Sportképek automatikus váltása');
 let index=0,paused=false,hovered=false,focused=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const show=i=>{index=(i+slides.length)%slides.length;slides.forEach((s,j)=>{s.hidden=j!==index;s.setAttribute('aria-hidden',String(j!==index));});counter.textContent=`${index+1} / ${slides.length}`;};
 prev.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));
 pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Lejátszás':'Szünet';pause.setAttribute('aria-pressed',String(paused));});
 carousel.addEventListener('mouseenter',()=>hovered=true);carousel.addEventListener('mouseleave',()=>hovered=false);
 carousel.addEventListener('focusin',()=>focused=true);carousel.addEventListener('focusout',e=>{if(!carousel.contains(e.relatedTarget))focused=false;});
 append(controls,prev,counter,next,pause);append(carousel,stage,controls);if(slides.length)show(0);
 const timer=setInterval(()=>{if(!root.isConnected){clearInterval(timer);return;}if(paused||hovered||focused||reduced.matches||document.hidden||slides.length<2)return;show(index+1);},6800);
 const sidebar=n('section','cs-sport-achievements');append(sidebar,n('h3','','Hivatalos büszkeségeink'),n('p','','Név szerinti eredmények az iskola közzétett jegyzékéből, illusztrációs portrék nélkül.'));
 results.slice(0,5).forEach(x=>sidebar.append(achievementCard(x)));
 append(layout,carousel,sidebar);append(container,layout);root.append(container);
}
function archive(root,results){
 const container=n('div','container-xxl'),header=n('div','sports-head');append(header,n('h2','sports-title','Közzétett sporteredmények'));container.append(header);
 const filter=n('select','form-select cs-achievement-filter'),search=n('input','form-control cs-achievement-search');search.type='search';search.placeholder='Sportoló neve vagy sportág…';search.setAttribute('aria-label','Sporteredmények keresése');
 for(const c of ['Összes sportág',...new Set(results.map(r=>r.category))]){const opt=n('option','',c);opt.value=c==='Összes sportág'?'':c;filter.append(opt);}
 const tools=n('div','cs-result-tools');append(tools,search,filter);container.append(tools);
 const count=n('p','cs-result-count'),grid=n('div','cs-result-grid');
 const render=()=>{grid.replaceChildren();const q=search.value.toLocaleLowerCase('hu-HU');const list=results.filter(x=>(!filter.value||x.category===filter.value)&&(x.title+' '+x.summary+' '+x.category).toLocaleLowerCase('hu-HU').includes(q));count.textContent=`${list.length} ellenőrzött sporteredmény`;list.forEach(x=>grid.append(achievementCard(x)));if(!list.length)grid.append(n('p','','Nincs ilyen sporteredmény az aktuális listában.'));};
 search.addEventListener('input',render);filter.addEventListener('change',render);container.append(count,grid);render();root.append(container);
}
export function renderSportsSuccesses(block){
 const wrap=n('section','sports-highlights-section cs-sports-2026'),box=n('div','container-xxl');box.append(n('p','sports-loading','A sporteredmények betöltése…'));wrap.append(box);
 Promise.all([data(RESULTS),data(GALLERY)]).then(([r,g])=>{
  if(!wrap.isConnected)return;const v=valid(r,g);wrap.replaceChildren();
  if(block.data?.view==='home')home(wrap,v.items,v.images);else archive(wrap,v.items);
 }).catch(err=>{console.error(err);box.replaceChildren(n('p','sports-error','A sporttartalom jelenleg nem érhető el.'));});
 return wrap;
}
