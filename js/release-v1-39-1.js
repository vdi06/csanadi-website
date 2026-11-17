// v1.39.1: a teljes kezdőlapi felső rész és a telefonos aloldalsáv.
// A meglévő menü- és képváltó-példányok megmaradnak; a kompakt gombok azokat vezérlik.
const byId=id=>document.getElementById(id);
const el=(tag,cls,label)=>{const n=document.createElement(tag);n.className=cls;if(label!==undefined)n.textContent=label;return n;};
const reduce=matchMedia('(prefers-reduced-motion: reduce)');

function installHomeShell(){
 const header=byId('site-header'),hero=byId('global-hero');
 if(!header||!hero||byId('cs39-home-shell'))return;
 const shell=el('div','cs39-home-shell');shell.id='cs39-home-shell';
 header.before(shell);shell.append(header,hero);
 const compact=el('div','cs39-mini-hero');compact.id='cs39-mini-hero';
 compact.setAttribute('role','group');compact.setAttribute('aria-label','Kompakt kezdőlapi képes tartalomváltó');
 const previous=el('button','cs39-mini-step','‹');previous.type='button';previous.setAttribute('aria-label','Előző kiemelt kép');
 const preview=el('a','cs39-mini-preview');preview.href='#/sport';preview.setAttribute('aria-label','Kiemelt tartalom megnyitása');
 const image=el('img','cs39-mini-image');image.alt='';image.width=70;image.height=47;
 const description=el('span','cs39-mini-description');
 description.append(el('strong','cs39-mini-label','Kiemelt sportos tartalom'),el('small','cs39-mini-hint','Kattints a megnyitáshoz'));
 preview.append(image,description);
 const next=el('button','cs39-mini-step','›');next.type='button';next.setAttribute('aria-label','Következő kiemelt kép');
 const menu=el('button','cs39-mini-menu','Főmenü');menu.type='button';menu.setAttribute('aria-label','Főmenü megnyitása');
 const top=el('button','cs39-mini-top','↑');top.type='button';top.setAttribute('aria-label','Teljes kezdőlapi fejléc megjelenítése');
 for(const node of [previous,preview,next,menu,top])compact.append(node);
 // Görgetéskor a kis képváltó ugyanannak a menüfejlécnek a része.
 header.append(compact);
 previous.addEventListener('click',()=>hero.querySelector('.csn26-edge-arrow--left')?.click());
 next.addEventListener('click',()=>hero.querySelector('.csn26-edge-arrow--right')?.click());
 menu.addEventListener('click',()=>byId('orbit-open')?.click());
 top.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduce.matches?'instant':'smooth'}));
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
  if(!document.body.classList.contains('cs-home-condensed')){
   // Természetes magasságot tárolunk a pontos, animálható összecsukáshoz.
   const height=Math.max(hero.scrollHeight,hero.getBoundingClientRect().height);
   if(height>70)hero.style.setProperty('--cs39-hero-expanded',Math.ceil(height)+'px');
  }
 };
 const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(sync);};
 if('MutationObserver'in window)new MutationObserver(queue).observe(hero,{childList:true,subtree:true,characterData:true});
 if('ResizeObserver'in window)new ResizeObserver(queue).observe(hero);
 const syncAccessibility=()=>{
  const condensed=document.body.classList.contains('cs-home-header')&&document.body.classList.contains('cs-home-condensed');
  // A vizuálisan összecsukott képváltó nem maradhat billentyűzettel fókuszálható.
  hero.inert=condensed;
  if(condensed)hero.setAttribute('aria-hidden','true');
  else hero.removeAttribute('aria-hidden');
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
 installMobileSubpage();
}
