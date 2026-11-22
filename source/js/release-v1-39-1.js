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
 compact.setAttribute('role','group');compact.setAttribute('aria-label','Középső főmenünyitó címer');
 const preview=el('button','cs39-mini-preview');preview.type='button';preview.setAttribute('aria-label','Főmenü megnyitása');
 preview.setAttribute('aria-controls','site-map-overlay');preview.setAttribute('aria-haspopup','dialog');
 preview.setAttribute('aria-expanded','false');
 const image=el('img','cs39-mini-image');image.alt='';image.width=47;image.height=47;
 image.src='assets/media/logo/csanadi-crest-compact.webp';
 const description=el('span','cs39-mini-description');
 description.append(el('strong','cs39-mini-label','FŐMENÜ'),el('small','cs39-mini-hint','Kattints a megnyitáshoz'));
 preview.append(image,description);
 preview.addEventListener('click',()=>document.dispatchEvent(new Event('csanadi:menu-toggle')));
 // A zsugorodó fejlécben ez az egyetlen középső, címeres főmenügomb látszik.
 compact.append(preview);
 // The crest owns the middle column of the same symmetrical controls row.
 const brandRow=header.querySelector('.brand-row');
 const crestSlot=header.querySelector('.header-symmetry-center');
 (crestSlot||brandRow||header).append(compact);
 // A háromszavas jelmondat a valódi fejléc része, nem a cserélődő képé.
 const motto=header.querySelector('.header-tag');
 if(motto&&brandRow){motto.classList.add('cs1402-persistent-motto');brandRow.append(motto);}
 const syncMenuState=()=>{
  const open=document.body.classList.contains('site-map-is-open');
  preview.setAttribute('aria-expanded',String(open));
  preview.setAttribute('aria-label',open?'Főmenü bezárása':'Főmenü megnyitása');
 };
 if('MutationObserver'in window)new MutationObserver(syncMenuState).observe(document.body,{attributes:true,attributeFilter:['class']});
 const syncAccessibility=()=>{
  const condensed=document.body.classList.contains('cs-home-header')&&document.body.classList.contains('cs-home-condensed');
  // A vizuálisan összecsukott képváltó nem maradhat billentyűzettel fókuszálható.
  if(condensed&&hero.contains(document.activeElement)){
   const focused=document.activeElement;
   const menu=byId('cs-subpage-menu');
   if((focused.id==='orbit-open'||focused.closest('.orbit-launch'))&&menu)menu.focus({preventScroll:true});
   else preview.focus({preventScroll:true});
  }
  if(!condensed&&compact.contains(document.activeElement)){
   (hero.querySelector('.csn26-visual-wing--left .csn26-wing-surface')||header.querySelector('a[href]'))?.focus({preventScroll:true});
  }
  // A csak görgetve látható asztali menü elrejtése előtt visszaadjuk a fókuszt
  // az eredeti, nagy címeres menünek. Mobilon a felső menügomb nem tűnik el.
  const smallMenu=byId('cs-subpage-menu');
  if(!condensed&&document.activeElement===smallMenu&&matchMedia('(min-width:769px)').matches){
   byId('orbit-open')?.focus({preventScroll:true});
  }
  hero.inert=condensed;
  if(condensed)hero.setAttribute('aria-hidden','true');
  else hero.removeAttribute('aria-hidden');
  compact.inert=!condensed;
  if(condensed)compact.removeAttribute('aria-hidden');
  else compact.setAttribute('aria-hidden','true');
 };
 if('MutationObserver'in window)new MutationObserver(syncAccessibility).observe(document.body,{attributes:true,attributeFilter:['class']});
 syncAccessibility();syncMenuState();
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
