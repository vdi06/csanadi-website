/* Központi sporteredmény/ sporthír megjelenítés. A JSON adat, soha nem futtatható kód. */
import {mediaItem,createPicture} from './media.js';
const SOURCE=new URL('../json/adatok/sportsikerek.json',import.meta.url);
const VALID_ID=/^success:[a-z0-9-]{3,50}$/;
const ROUTE=/^#\/[a-z0-9/-]*$/;
const CATEGORY=/^[\p{L}0-9 -]{2,48}$/u;
const $=(tag,className='',value)=>{const el=document.createElement(tag);if(className)el.className=className;if(value!==undefined)el.textContent=String(value);return el;};
const add=(parent,...children)=>{parent.append(...children);return parent;};
const link=(label,url,klass)=>{const a=$('a',klass,label);a.href=ROUTE.test(url||'')?url:'#/sport/sporteredmenyek';return a;};
let resultPromise=null,expires=0;
async function loadCollection(){
  if(resultPromise&&Date.now()<expires)return resultPromise;
  expires=Date.now()+60000;
  resultPromise=(async()=>{
    const response=await fetch(SOURCE,{cache:'no-cache'});
    if(!response.ok)throw new Error(`A sporteredmény-adatforrás nem érhető el (${response.status}).`);
    const data=await response.json();
    if(!data||data.schemaVersion!=='1.0.0'||data.collectionId!=='collection:sportsikerek'||!Array.isArray(data.items)||data.items.length>300||!data.items.length)throw new Error('A sporteredmény-gyűjtemény sémája hibás.');
    const ids=new Set();
    for(const entry of data.items){
      if(!entry||!VALID_ID.test(entry.id)||ids.has(entry.id)||typeof entry.title!=='string'||entry.title.length<8||entry.title.length>130||typeof entry.summary!=='string'||entry.summary.length<20||entry.summary.length>400||typeof entry.body!=='string'||entry.body.length<80||entry.body.length>5000||typeof entry.category!=='string'||!CATEGORY.test(entry.category)||!['preview','verified'].includes(entry.status)||typeof entry.priority!=='number'||entry.priority<0||entry.priority>100||!mediaItem(entry.mediaId)||typeof entry.isIllustration!=='boolean'||!entry.source||typeof entry.source.verified!=='boolean'||!entry.links||!ROUTE.test(entry.links.news)||!ROUTE.test(entry.links.results))throw new Error('Érvénytelen sporthír-JSON rekord: '+(entry?.id||'ismeretlen'));
      if(entry.status==='verified'&&(entry.source.verified!==true||!/^\d{4}-\d{2}-\d{2}$/.test(entry.publishedAt||'')))throw new Error('Igazolt sporthírhez forrás és közzétételi dátum szükséges.');
      if(entry.status==='preview'&&entry.source.verified!==false)throw new Error('Fejlesztési rekord nem jelölhető ellenőrzöttnek.');
      ids.add(entry.id);
    }
    return {...data,items:[...data.items].sort((a,b)=>{
      if(a.status!==b.status)return a.status==='verified'?-1:1;
      return String(b.publishedAt||'').localeCompare(String(a.publishedAt||''))||b.priority-a.priority;
    })};
  })();
  resultPromise.catch(()=>{expires=0;resultPromise=null;});
  return resultPromise;
}
function heading(data,title,eyebrow='SPORT · EREDMÉNYEK · TÖRTÉNETEK'){
  const head=$('div','sports-head');const words=$('div');add(words,$('span','sports-eyebrow',eyebrow),$('h2','sports-title',title||'Sportolói sikereink'));
  add(head,words,link('Összes sporthír  →','#/hirek-es-esemenyek/hirek/sporthirek','sports-all-link'));
  return head;
}
function article(entry,compact=false){
  const card=$('article','sport-news-card'+(compact?' compact':''));
  if(!compact){const picture=createPicture(entry.mediaId,{className:'sport-news-photo',sizes:'(max-width:600px) 100vw, 410px'});if(picture)card.append(picture);}
  const body=$('div','sport-news-copy');
  const line=$('div','sport-news-meta');add(line,$('span','sport-tag',entry.category));
  if(entry.status==='preview')add(line,$('span','sport-demo-badge','ILLUSZTRÁCIÓ'));
  else if(entry.publishedAt)add(line,$('time','sport-news-date',entry.publishedAt));
  add(body,line,$('h3','sport-news-title',entry.title),$('p','sport-news-summary',entry.summary));
  const details=$('details','sport-news-details');add(details,$('summary','','Teljes történet'),$('p','',entry.body));
  if(entry.status==='preview')add(details,$('p','sport-preview-note','Fejlesztési bemutató: nem ellenőrzött iskolai versenyeredmény. A kép generált illusztráció.'));
  add(body,details);add(card,body);return card;
}
function renderHome(mount,data,block){
  add(mount,heading(data,block.title));
  const grid=$('div','sports-home-layout'),carousel=$('div','sports-carousel'),viewport=$('div','sports-carousel-viewport');
  viewport.setAttribute('aria-label','Automatikusan változó sporttörténetek képgalériája');
  const items=data.items.slice(0,Math.min(data.carousel?.maxSlides||8,12));
  const slides=items.map((entry,index)=>{
    const slide=$('article','sports-slide');slide.hidden=index!==0;
    slide.setAttribute('aria-roledescription','dia');slide.setAttribute('aria-label',`${index+1}. kép, ${items.length} közül`);
    const img=createPicture(entry.mediaId,{className:'sports-slide-picture',eager:index===0,sizes:'(max-width:800px) 100vw, 900px'});
    if(img)slide.append(img);
    const overlay=$('div','sports-slide-overlay');
    const tag=$('div','sports-slide-overline');add(tag,$('span','sport-tag',entry.category));if(entry.status==='preview')add(tag,$('span','sport-demo-badge','GENERÁLT KÉP'));
    add(overlay,tag,$('h3','sports-slide-title',entry.title),$('p','sports-slide-summary',entry.summary),link('Sporttörténetek →',entry.links.results,'sports-slide-link'));
    add(slide,overlay);viewport.append(slide);return slide;
  });
  const controls=$('div','sports-slide-controls');
  const previous=$('button','sports-control','←');previous.type='button';previous.setAttribute('aria-label','Előző kép');
  const next=$('button','sports-control','→');next.type='button';next.setAttribute('aria-label','Következő kép');
  const toggle=$('button','sports-pause','Szünet');toggle.type='button';toggle.setAttribute('aria-pressed','false');
  const dotContainer=$('div','sports-dots');dotContainer.setAttribute('role','group');dotContainer.setAttribute('aria-label','Dia kiválasztása');
  const dots=items.map((entry,i)=>{const button=$('button','sports-dot'+(i===0?' active':''));button.type='button';button.setAttribute('aria-label',`${i+1}. kép: ${entry.title}`);button.setAttribute('aria-current',String(i===0));button.addEventListener('click',()=>show(i,true));dotContainer.append(button);return button;});
  const counter=$('span','sports-counter',`1 / ${items.length}`);counter.setAttribute('aria-live','off');
  add(controls,previous,dotContainer,counter,next,toggle);add(carousel,viewport,controls);
  const sidebar=$('aside','sports-news-sidebar');
  add(sidebar,$('div','sports-news-sidebar-heading','Friss sporttörténetek'));
  data.items.slice(0,Math.min(block.data?.maxNews||5,6)).forEach(item=>sidebar.append(article(item,true)));
  add(grid,carousel,sidebar);mount.append(grid);
  const bottom=$('p','sport-preview-note','A képek és a jelenlegi történetek fejlesztési illusztrációk, nem valódi versenybeszámolók. Hiteles eredmény közzététele után ugyanebből a JSON-gyűjteményből frissül a galéria és a hírlista.');mount.append(bottom);
  let active=0,manualPause=false,pauseHover=false,pauseFocus=false;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  function show(index,byUser){active=(index+items.length)%items.length;slides.forEach((s,i)=>{s.hidden=i!==active;});dots.forEach((d,i)=>{d.classList.toggle('active',i===active);d.setAttribute('aria-current',String(i===active));});counter.textContent=`${active+1} / ${items.length}`;if(byUser){counter.setAttribute('aria-live','polite');setTimeout(()=>counter.setAttribute('aria-live','off'),1000);}}
  previous.addEventListener('click',()=>show(active-1,true));next.addEventListener('click',()=>show(active+1,true));
  toggle.addEventListener('click',()=>{manualPause=!manualPause;toggle.textContent=manualPause?'Lejátszás':'Szünet';toggle.setAttribute('aria-pressed',String(manualPause));});
  carousel.addEventListener('mouseenter',()=>{pauseHover=true;});carousel.addEventListener('mouseleave',()=>{pauseHover=false;});
  carousel.addEventListener('focusin',()=>{pauseFocus=true;});carousel.addEventListener('focusout',e=>{if(!carousel.contains(e.relatedTarget))pauseFocus=false;});
  const rate=Math.max(4000,Math.min(15000,data.carousel?.intervalMs||6500));
  const timer=setInterval(()=>{if(!carousel.isConnected){clearInterval(timer);return;}if(manualPause||pauseHover||pauseFocus||reduceMotion.matches||document.hidden||items.length<2)return;show(active+1,false);},rate);
}
function renderArchive(mount,data,block){
  const intro=$('p','sports-archive-intro',data.description);add(mount,heading(data,block.title,'SPORT · HÍREK · KÉPES BESZÁMOLÓK'),intro);
  const toolbar=$('div','sports-filter-toolbar');const label=$('label','','Sportág / témakör: ');const sel=$('select','form-select sports-select');sel.setAttribute('aria-label','Sporthírek szűrése sportág szerint');
  const categories=['Összes témakör',...new Set(data.items.map(item=>item.category))];categories.forEach((cat,i)=>{const opt=$('option','',cat);opt.value=i?cat:'';sel.append(opt);});label.append(sel);toolbar.append(label);mount.append(toolbar);
  const grid=$('div','sports-archive-grid');mount.append(grid);
  const display=()=>{grid.replaceChildren();const items=data.items.filter(entry=>!sel.value||entry.category===sel.value);items.forEach(item=>grid.append(article(item,false)));if(!items.length)grid.append($('p','sports-archive-intro','Nincs megjeleníthető elem ebben a témában.'));};
  sel.addEventListener('change',display);display();
  mount.append($('p','sport-preview-note','A jelenlegi történetek és MI-képek a szerkesztési felület működését mutatják be. Nem állítanak valós versenyeredményeket.'));
}
export function renderSportsSuccesses(block){
  const wrap=$('section','sports-highlights-section');
  const container=$('div','container-xxl');
  const loading=$('p','sports-loading','A sporthírek és képek betöltése…');container.append(loading);wrap.append(container);
  loadCollection().then(data=>{
    if(!wrap.isConnected)return;
    let signature=JSON.stringify(data);
    const display=feed=>{
      container.replaceChildren();
      if(block.data?.view==='home')renderHome(container,feed,block);else renderArchive(container,feed,block);
    };
    display(data);
    const refreshMs=Math.max(30000,Math.min(3600000,Number(data.refreshSeconds||60)*1000));
    const poll=setInterval(async()=>{
      if(!wrap.isConnected){clearInterval(poll);return;}
      if(document.hidden)return;
      try{const updated=await loadCollection();const fresh=JSON.stringify(updated);
        if(fresh!==signature){signature=fresh;display(updated);}
      }catch(error){console.warn('Sporteredmény-adatok frissítése sikertelen; korábbi érvényes tartalom megtartva:',error);}
    },refreshMs);
  }).catch(error=>{
    console.error('Sporteredmények betöltési/validálási hiba:',error);
    if(!wrap.isConnected)return;
    container.replaceChildren($('div','sports-error','A sporthírek jelenleg nem érhetők el. Kérjük, frissítsd az oldalt később.'));
  });
  return wrap;
}
