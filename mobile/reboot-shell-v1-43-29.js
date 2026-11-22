/** Új, önálló mobilos felület. A korábbi mobile/ modulokból nem vesz át kódot. */
const MOBILE='(max-width: 768px)';
const make=(tag,cls='',content='')=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(content)node.textContent=content;
 return node;
};

export function mobileScrollProgress(top=0,height=0,viewport=0){
 const available=Math.max(0,height-viewport);
 return available>0?Math.min(1,Math.max(0,top/available)):0;
}
/** M20.1: egyetlen, jól tesztelhető küszöb a mobilfejléc két állapotához. */
export const mobileHeaderScrolled=(top=0,threshold=36)=>Number.isFinite(top)&&top>threshold;

function socialAnchor({label,url,glyph}){
 const a=make('a','cs-mb-social',glyph);
 a.href=url;a.target='_blank';a.rel='noopener noreferrer';
 a.setAttribute('aria-label',label);a.title=label;
 return a;
}
// M22.1: a hivatalosan rögzített linkek hálózat nélkül is megmaradnak.
// Sikeres adatbetöltés után továbbra is a közös JSON az elsődleges forrás.
export const mobileSocialFallback=Object.freeze([
 {label:'Facebook – Csanádi Sportiskola',url:'https://www.facebook.com/csanadiiskola',glyph:'f'},
 {label:'Instagram – Csanádi Sportiskola',url:'https://www.instagram.com/_csanadi_/?hl=hu',glyph:'◎'}
]);
/** A hibás vagy részlegesen publikált adat sem tüntetheti el egyik ikont sem. */
export function mobileSocialLinks(items=[]){
 const platforms=['Facebook','Instagram'];
 return platforms.map((platform,index)=>{
  const match=Array.isArray(items)?items.find(item=>{
   if(item?.platform!==platform||item.status!=='published'||item.schoolVerified!==true)return false;
   try{const url=new URL(item.url);return url.protocol==='https:'&&Boolean(url.hostname)&&
    !url.username&&!url.password;}catch{return false;}
  }):null;
  return match?{label:match.label||mobileSocialFallback[index].label,url:match.url,
   glyph:mobileSocialFallback[index].glyph}:mobileSocialFallback[index];
 });
}
async function hydrateSocial(container){
 // Közös, ellenőrzött adatkészlet; nem a desktop fejléc DOM-ját másoljuk.
 try{
  const url=new URL('../json/data/social.json',import.meta.url);
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(!container.isConnected||!Array.isArray(data.items))return;
  container.replaceChildren(...mobileSocialLinks(data.items).map(socialAnchor));
 }catch(error){console.warn('A mobilos közösségi linkek adatforrása nem elérhető:',error);}
}

export function initFreshMobileShell(){
 const header=document.getElementById('site-header');
 if(!header||document.getElementById('cs-mobile-rebuild'))return;
 const mq=matchMedia(MOBILE);
 // M18.2: a régi kód görgetéskor új fejléc-elemeket is beilleszthet, ezért
 // kizárólag a saját mobil shell látható; az összes többi KÖZVETLEN
 // fejlécgyermek eredeti inline és ARIA állapotát külön megőrizzük.
 // Ez a 769px feletti asztali felületet változatlanul visszaállítja.
 const originalLegacy=new Map();
 const protectLegacy=(mobile)=>{
  if(mobile){
   for(const node of [...header.children]){
    if(node.id==='cs-mobile-rebuild')continue;
    if(!originalLegacy.has(node)){
     originalLegacy.set(node,{
      display:node.style.getPropertyValue('display'),
      priority:node.style.getPropertyPriority('display'),
      aria:node.getAttribute('aria-hidden')
     });
     protectObserver?.observe(node,{attributes:true,attributeFilter:['style','aria-hidden']});
    }
    if(node.style.getPropertyValue('display')!=='none'||
       node.style.getPropertyPriority('display')!=='important'){
     node.style.setProperty('display','none','important');
    }
    if(node.getAttribute('aria-hidden')!=='true')node.setAttribute('aria-hidden','true');
   }
  }else{
   for(const [node,original] of originalLegacy){
    if(original.display)node.style.setProperty('display',original.display,original.priority);
    else node.style.removeProperty('display');
    if(original.aria===null)node.removeAttribute('aria-hidden');
    else node.setAttribute('aria-hidden',original.aria);
   }
   originalLegacy.clear();
  }
 };
 // Az observer a későn beillesztett (pl. görgetési képváltó) gyermekeket
 // is azonnal rejtés alá vonja, nem csak az első .brand-row sort.
 const protectObserver=typeof MutationObserver==='function'
  ?new MutationObserver(()=>{if(mq.matches)protectLegacy(true)}):null;
 protectObserver?.observe(header,{childList:true});
 protectLegacy(mq.matches);
 const shell=make('div','cs-mb-shell');shell.id='cs-mobile-rebuild';
 const label=make('div','cs-mb-school-title');
 label.append(make('strong','','CSANÁDI ÁRPÁD SPORTISKOLA'),
  make('small','','ÁLTALÁNOS ISKOLA ÉS GIMNÁZIUM'));
 const bar=make('div','cs-mb-bar');
 const left=make('nav','cs-mb-left');left.setAttribute('aria-label','Iskolai külső hivatkozások');
 const socials=make('div','cs-mb-socials');
 socials.replaceChildren(...mobileSocialFallback.map(socialAnchor));
 const kreta=socialAnchor({label:'KRÉTA – elektronikus napló',
  url:'https://klik200346001.e-kreta.hu/',glyph:'K'});
 // Mobilon a KRÉTA kizárólag ikonos, a teljes felirat az elérhető névben marad.
 kreta.classList.add('cs-mb-kreta');left.append(socials,kreta);
 const crest=make('button','cs-mb-crest');crest.type='button';crest.id='cs-mb-menu';
 crest.setAttribute('aria-label','Főmenü megnyitása');crest.setAttribute('aria-haspopup','dialog');
 crest.setAttribute('aria-controls','site-map-overlay');crest.setAttribute('aria-expanded','false');
 const emblem=make('img');emblem.src='assets/media/logo/csanadi-crest-512.webp';
 emblem.alt='';emblem.width=64;emblem.height=64;crest.append(emblem);
 const right=make('div','cs-mb-right');
 const search=make('button','cs-mb-tool','⌕');search.type='button';
 search.setAttribute('aria-label','Keresés megnyitása');search.title='Keresés';
 const theme=make('button','cs-mb-tool cs-mb-theme','◐');theme.type='button';
 theme.setAttribute('aria-label','Világos, sötét vagy automatikus megjelenés');
 theme.title='Megjelenési mód váltása';right.append(search,theme);
 bar.append(left,crest,right);
 const subtitle=make('div','cs-mb-motto','SPORT · TUDÁS · KÖZÖSSÉG');
 const progress=make('div','cs-mb-progress');progress.setAttribute('aria-hidden','true');
 progress.append(make('span','cs-mb-progress-fill'));
 // M16.1: a mobilmodul nem módosíthatja az asztali fejléc DOM-sorrendjét.
 // A régi alsó mobilnavigációt a kizárólag mobilos CSS rejti el, nem töröljük.
 shell.append(label,bar,subtitle,progress);
 if(mq.matches)header.prepend(shell);
 const status=make('p','visually-hidden');status.id='cs-mb-live';
 status.setAttribute('aria-live','polite');status.setAttribute('role','status');shell.append(status);

 crest.addEventListener('click',()=>{
  document.dispatchEvent(new CustomEvent('csanadi:menu-toggle'));
  // A menüt az alkalmazás szinkron módon kapcsolja; observer nélkül is
  // kövesse a címer gomb elérhetőségi állapota az eredményt.
  queueMicrotask(()=>{const open=!document.getElementById('site-map-overlay')?.hidden;
   crest.setAttribute('aria-expanded',String(open));
   crest.setAttribute('aria-label',open?'Főmenü bezárása':'Főmenü megnyitása');});
 });
 search.addEventListener('click',()=>document.getElementById('search-open')?.click());
 theme.addEventListener('click',()=>document.getElementById('theme-toggle')?.click());
 const updateTheme=()=>{
  const mode=document.documentElement.dataset.themePreference||'system';
  const current=document.documentElement.dataset.theme||'light';
  theme.textContent=mode==='dark'?'☾':mode==='light'?'☀':'◐';
  theme.setAttribute('aria-label',`Megjelenés: ${mode==='system'?'automatikus':mode==='light'?'világos':'sötét'}; jelenleg ${current==='dark'?'sötét':'világos'}`);
 };
 // M21.1: néhány beágyazott mobilböngészőben a MutationObserver nincs jelen.
 // A menü és a keresés ilyenkor is induljon; az első témamegjelenés megmarad.
 if(typeof MutationObserver==='function')new MutationObserver(updateTheme).observe(
  document.documentElement,{attributes:true,
   attributeFilter:['data-theme','data-theme-preference']});
 updateTheme();
 const overlay=document.getElementById('site-map-overlay');
 if(overlay){
  const syncOverlay=()=>{
   const open=!overlay.hidden;
   crest.setAttribute('aria-expanded',String(open));
   crest.setAttribute('aria-label',open?'Főmenü bezárása':'Főmenü megnyitása');
  };
  if(typeof MutationObserver==='function'){
   const observer=new MutationObserver(syncOverlay);
   observer.observe(overlay,{attributes:true,attributeFilter:['hidden']});
  }
  // Az állapot az első renderkor és az observer nélküli böngészőkben is jó.
  syncOverlay();
  document.addEventListener('csanadi:main-menu-opening',()=>queueMicrotask(syncOverlay));
  document.addEventListener('csanadi:route-rendered',()=>queueMicrotask(syncOverlay));
  // Az X, az Escape és egy menülink egyaránt bezárhatja a modált úgy,
  // hogy a változást observer nélküli böngészőben is jelezzük.
  document.addEventListener('click',event=>{
   if(event.target?.closest?.('#site-map-close,[data-site-map-dismiss],#site-map-overlay a[href]'))
    queueMicrotask(syncOverlay);
  });
  document.addEventListener('keydown',event=>{
   if(event.key==='Escape')queueMicrotask(syncOverlay);
  });
 }
 // Csak csatlakoztatott mobilfejléchez kérünk közösségi hivatkozásokat.
 // Így asztali indulás után, későbbi telefonméretre váltáskor sem vesznek el.
 if(mq.matches)hydrateSocial(socials);

 let scheduled=false,lastHeaderState=null,lastViewportWidth=-1;
 const sync=()=>{
  scheduled=false;
  protectLegacy(mq.matches);
  if(!mq.matches){lastHeaderState='desktop';header.removeAttribute('data-cs-mb-scrolled');
   label.removeAttribute('aria-hidden');subtitle.removeAttribute('aria-hidden');
   header.style.removeProperty('--cs-mb-reading');
   document.documentElement.style.removeProperty('--cs-mb-sticky-offset');return;}
  const y=Math.max(0,window.scrollY||0);
  const state=mobileHeaderScrolled(y)?'true':'false';
  header.dataset.csMbScrolled=state;
  // Az összehúzott, átlátszó címsor nem maradhat kétszer felolvasva.
  // Visszagörgetéskor a szöveg ismét hozzáférhetővé válik.
  label.setAttribute('aria-hidden',state);
  subtitle.setAttribute('aria-hidden',state);
  const scrollEl=document.scrollingElement||document.documentElement;
  header.style.setProperty('--cs-mb-reading',String(mobileScrollProgress(y,
   scrollEl?.scrollHeight||0,window.innerHeight||0)));
  if(lastHeaderState!==state||lastViewportWidth!==window.innerWidth){
   lastHeaderState=state;lastViewportWidth=window.innerWidth;
   const measured=Math.round(header.getBoundingClientRect().height||110);
   document.documentElement.style.setProperty('--cs-mb-sticky-offset',
    Math.min(240,Math.max(72,measured))+'px');
  }
 };
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(sync)}};
 // A hosszú címek és a később betöltődő közösségi gombok miatt a fejléc
 // magassága szélességváltás nélkül is nőhet. A scroll-offset kövesse ezt.
 if(typeof ResizeObserver==='function'){
  const observer=new ResizeObserver(()=>{lastViewportWidth=-1;schedule()});
  observer.observe(shell);
 }
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('orientationchange',schedule,{passive:true});
 // M20.1: iOS címsor/virtuális billentyűzet és BFCache visszatérés esetén
 // szélességváltás nélkül is újramérjük a fejléc és a scroll-eltolás méretét.
 // A virtuális billentyűzet és a Safari alsó címsora olykor szélesség- és
 // állapotváltás nélkül módosítja az elérhető képmagasságot: valóban mérjünk.
 const remeasure=()=>{lastViewportWidth=-1;schedule()};
 window.visualViewport?.addEventListener?.('resize',remeasure,{passive:true});
 window.addEventListener('pageshow',remeasure,{passive:true});
 mq.addEventListener?.('change',()=>{
  if(mq.matches&&!shell.isConnected){header.prepend(shell);hydrateSocial(socials);}
  else if(!mq.matches&&shell.isConnected)shell.remove();
  protectLegacy(mq.matches);
  schedule();
 });
 document.addEventListener('csanadi:route-rendered',event=>{
  if(mq.matches){const title=document.querySelector('#app h1')?.textContent?.trim();
   status.textContent='Oldal betöltve: '+(title||event.detail?.route||'kiválasztott oldal')+'.';}
  schedule();
 });
 sync();
 return {shell,crest,sync};
}
