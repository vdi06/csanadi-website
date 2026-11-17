// v1.39.1: a teljes kezdőlapi felső rész és a telefonos aloldalsáv.
// A meglévő menü- és képváltó-példányok megmaradnak; a kompakt gombok azokat vezérlik.
const byId=id=>document.getElementById(id);
const el=(tag,cls,label)=>{const n=document.createElement(tag);n.className=cls;if(label!==undefined)n.textContent=label;return n;};
const reduce=matchMedia('(prefers-reduced-motion: reduce)');

function installHomeShell(){
 const header=byId('site-header'),hero=byId('global-hero');
 if(!header||!hero||byId('cs39-home-shell'))return;
 const shell=el('div','cs39-home-shell');shell.id='cs39-home-shell';
 // Csak a felső menüsor tapad: a nagy váltakozó természetesen kigördül alóla.
 // Így az elrejtés soha nem vonja ki a képváltó magasságát a dokumentumfolyamból,
 // és nem rántja meg a görgetési pozíciót.
 header.before(shell);shell.append(header);shell.after(hero);
 const compact=el('div','cs39-mini-hero');compact.id='cs39-mini-hero';
 compact.setAttribute('role','group');compact.setAttribute('aria-label','A kezdőlapi képes tartalom középső előnézete');
 const preview=el('a','cs39-mini-preview');preview.href='#/sport';preview.setAttribute('aria-label','Kiemelt tartalom megnyitása');
 const image=el('img','cs39-mini-image');image.alt='';image.width=70;image.height=47;
 const description=el('span','cs39-mini-description');
 description.append(el('strong','cs39-mini-label','Kiemelt sportos tartalom'),el('small','cs39-mini-hint','Kattints a megnyitáshoz'));
 preview.append(image,description);
 // A zsugorodó fejlécben kizárólag ez az EGY középső link látszik és fókuszálható.
 compact.append(preview);
 // Görgetéskor a kis kép nem kap új sort: a meglévő brand-row közepére kerül.
 const brandRow=header.querySelector('.brand-row');
 (brandRow||header).append(compact);
 let lastLabel='',lastSource='',queued=false;
 const sync=()=>{
  queued=false;
  if(!document.body.classList.contains('cs-home-header'))return;
  const wing=hero.querySelector('.csn26-visual-wing--left');
  const link=wing?.querySelector('a.csn26-wing-surface,a.csn26-wing-target');
  const title=wing?.querySelector('.csn26-wing-title')?.textContent?.trim()||'Kiemelt sportos tartalom';
  const picture=wing?.querySelector('.csn26-wing-photo img')||wing?.querySelector('img');
  const url=picture?.currentSrc||picture?.getAttribute('src')||'assets/media/logo/csanadi-cimer-512.webp';
  if(lastLabel!==title){description.querySelector('strong').textContent=title;lastLabel=title;}
  if(lastSource!==url){image.src=url;lastSource=url;}
  preview.href=link?.getAttribute('href')||'#/sport';
  preview.setAttribute('aria-label','Kiemelt tartalom: '+title);
  // A nagyméretű képváltó mindig a dokumentum természetes folyamatában marad.
  // A képmagasság scroll közbeni írása ResizeObserver-visszacsatolást és
  // átmeneti elcsúszást okozhatna, ezért itt csak a kis előnézetet szinkronizáljuk.
 };
 const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(sync);};
 if('MutationObserver'in window)new MutationObserver(queue).observe(hero,{childList:true,subtree:true,characterData:true});
 const syncAccessibility=()=>{
  const condensed=document.body.classList.contains('cs-home-header')&&document.body.classList.contains('cs-home-condensed');
  // A vizuálisan összecsukott képváltó nem maradhat billentyűzettel fókuszálható.
  if(condensed&&hero.contains(document.activeElement))preview.focus({preventScroll:true});
  if(!condensed&&compact.contains(document.activeElement)){
   (hero.querySelector('.csn26-visual-wing--left .csn26-wing-surface')||header.querySelector('a[href]'))?.focus({preventScroll:true});
  }
  hero.inert=condensed;
  if(condensed)hero.setAttribute('aria-hidden','true');
  else hero.removeAttribute('aria-hidden');
  compact.inert=!condensed;
  if(condensed)compact.removeAttribute('aria-hidden');
  else compact.setAttribute('aria-hidden','true');
 };
 if('MutationObserver'in window)new MutationObserver(syncAccessibility).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('csanadi:route-rendered',queue);
 window.addEventListener('resize',queue,{passive:true});
 syncAccessibility();queue();
}

function installMobileSubpage(){
 const header=byId('site-header');
 if(!header||byId('cs39-mobile-route'))return;
 const strip=el('section','cs39-mobile-route');strip.id='cs39-mobile-route';strip.hidden=true;
 strip.setAttribute('aria-label','Az aloldal sportanimációja és navigációs adatai');
 const scene=el('span','cs39-mobile-scene');scene.setAttribute('aria-hidden','true');
 const text=el('span','cs39-mobile-copy');
 const title=el('strong','cs39-mobile-title','Csanádi Sportiskola');
 const section=el('small','cs39-mobile-section','Az oldal áttekintése');
 text.append(title,section);
 const pause=el('button','cs39-mobile-pause','Ⅱ');pause.type='button';pause.setAttribute('aria-label','Sportanimáció szüneteltetése');
 pause.addEventListener('click',()=>{
  header.querySelector('.cs-subpage-motion-pause')?.click();
  requestAnimationFrame(sync);
 });
 strip.append(scene,text,pause);header.append(strip);
 let lastSvg=null,queued=false;
 const sync=()=>{
  queued=false;
  const inner=document.body.classList.contains('cs-inner-page');strip.hidden=!inner;
  if(!inner)return;
  const source=header.querySelector('.cs-subpage-motion');
  const svg=source?.querySelector('.cs-mini-scene svg');
  if(svg!==lastSvg){scene.replaceChildren(...(svg?[svg.cloneNode(true)]:[]));lastSvg=svg;}
  strip.dataset.scene=source?.dataset.scene||'dribble';
  const headline=header.querySelector('.cs-subpage-ribbon-title')?.textContent?.trim()||
   document.querySelector('#app .page-banner h1,#app .cs-arrival-shell h1')?.textContent?.trim()||'Csanádi Sportiskola';
  title.textContent=headline;
  section.textContent=header.querySelector('.cs-subpage-ribbon-section')?.textContent?.trim()||'Az oldal áttekintése';
  const paused=source?.classList.contains('is-paused')||reduce.matches;
  strip.classList.toggle('is-paused',!!paused);
  pause.hidden=reduce.matches;
  pause.textContent=paused?'▶':'Ⅱ';
  pause.setAttribute('aria-label',paused?'Sportanimáció folytatása':'Sportanimáció szüneteltetése');
  pause.setAttribute('aria-pressed',String(!!paused));
 };
 const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(sync);};
 document.addEventListener('csanadi:route-rendered',queue);
 window.addEventListener('scroll',queue,{passive:true});
 window.addEventListener('resize',queue,{passive:true});
 reduce.addEventListener('change',queue);
 queue();
}

export function initV1391Enhancements(){
 installHomeShell();
 // v1.39.13: az aloldali animáció is közvetlenül a meglévő brand-row-ban él.
 // Nem készítünk hozzá külön mobil fejlécsort, így az nem villan fel görgetéskor.
}
