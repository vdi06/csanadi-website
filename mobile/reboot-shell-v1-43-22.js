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

function socialAnchor({label,url,glyph}){
 const a=make('a','cs-mb-social',glyph);
 a.href=url;a.target='_blank';a.rel='noopener noreferrer';
 a.setAttribute('aria-label',label);a.title=label;
 return a;
}
async function hydrateSocial(container){
 // Közös, ellenőrzött adatkészlet; nem a desktop fejléc DOM-ját másoljuk.
 try{
  const url=new URL('../json/data/social.json',import.meta.url);
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(!container.isConnected||!Array.isArray(data.items))return;
  const selected=data.items.filter(item=>item.status==='published'&&item.schoolVerified===true&&
   ['Facebook','Instagram'].includes(item.platform)&&/^https:\/\//.test(item.url||''));
  container.replaceChildren(...selected.map(item=>socialAnchor({
   label:item.label||item.platform,url:item.url,glyph:item.platform==='Facebook'?'f':'◎'})));
 }catch(error){console.warn('A mobilos közösségi linkek adatforrása nem elérhető:',error);}
}

export function initFreshMobileShell(){
 const header=document.getElementById('site-header');
 if(!header||document.getElementById('cs-mobile-rebuild'))return;
 const mq=matchMedia(MOBILE);
 const shell=make('div','cs-mb-shell');shell.id='cs-mobile-rebuild';
 const label=make('div','cs-mb-school-title');
 label.append(make('strong','','CSANÁDI ÁRPÁD SPORTISKOLA'),
  make('small','','ÁLTALÁNOS ISKOLA ÉS GIMNÁZIUM'));
 const bar=make('div','cs-mb-bar');
 const left=make('nav','cs-mb-left');left.setAttribute('aria-label','Iskolai külső hivatkozások');
 const socials=make('div','cs-mb-socials');
 const kreta=socialAnchor({label:'KRÉTA – elektronikus napló',
  url:'https://klik200346001.e-kreta.hu/',glyph:'KRÉTA'});
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

 crest.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('csanadi:menu-toggle')));
 search.addEventListener('click',()=>document.getElementById('search-open')?.click());
 theme.addEventListener('click',()=>document.getElementById('theme-toggle')?.click());
 const updateTheme=()=>{
  const mode=document.documentElement.dataset.themePreference||'system';
  const current=document.documentElement.dataset.theme||'light';
  theme.textContent=mode==='dark'?'☾':mode==='light'?'☀':'◐';
  theme.setAttribute('aria-label',`Megjelenés: ${mode==='system'?'automatikus':mode==='light'?'világos':'sötét'}; jelenleg ${current==='dark'?'sötét':'világos'}`);
 };
 new MutationObserver(updateTheme).observe(document.documentElement,
  {attributes:true,attributeFilter:['data-theme','data-theme-preference']});
 updateTheme();
 const overlay=document.getElementById('site-map-overlay');
 if(overlay){
  const observer=new MutationObserver(()=>{
   const open=!overlay.hidden;
   crest.setAttribute('aria-expanded',String(open));
   crest.setAttribute('aria-label',open?'Főmenü bezárása':'Főmenü megnyitása');
  });
  observer.observe(overlay,{attributes:true,attributeFilter:['hidden']});
 }
 // Csak csatlakoztatott mobilfejléchez kérünk közösségi hivatkozásokat.
 // Így asztali indulás után, későbbi telefonméretre váltáskor sem vesznek el.
 if(mq.matches)hydrateSocial(socials);

 let scheduled=false,lastHeaderState=null,lastViewportWidth=-1;
 const sync=()=>{
  scheduled=false;
  if(!mq.matches){lastHeaderState='desktop';header.removeAttribute('data-cs-mb-scrolled');
   label.removeAttribute('aria-hidden');subtitle.removeAttribute('aria-hidden');
   header.style.removeProperty('--cs-mb-reading');
   document.documentElement.style.removeProperty('--cs-mb-sticky-offset');return;}
  const y=Math.max(0,window.scrollY||0);
  const state=y>36?'true':'false';
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
 mq.addEventListener?.('change',()=>{
  if(mq.matches&&!shell.isConnected){header.prepend(shell);hydrateSocial(socials);}
  else if(!mq.matches&&shell.isConnected)shell.remove();
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
