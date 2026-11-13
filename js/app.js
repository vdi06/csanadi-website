import {registerMedia,createPicture,imageDisclaimer} from './media.js';
/* Csanádi Sportiskola – hozzáférhető hash-SPA, regisztrált JSON-oldalakkal. */
import {buildCatalog,loadJSON,getRoute,routeTitle,childrenOf,norm,safeRoute} from './content.js';
import {renderBlock,dom,listCards} from './blocks.js';
const app=document.getElementById('app');
const desktop=document.getElementById('desktop-navigation');
const mobile=document.getElementById('mobile-navigation');
const menuBtn=document.getElementById('mobile-menu-toggle');
const dialog=document.getElementById('search-panel');
const searchInput=document.getElementById('search-input');
const searchResults=document.getElementById('search-results');
const searchStatus=document.getElementById('search-status');
let catalog=null,currentRoute=null,previousSearchFocus=null,lastRawStructure='',refreshTimer=null;
let lastRawPage=null;
const historyScroll=new Map();
const noticeNode=document.getElementById('toast');
let toastClear=null;
let revealObserver=null;
function notify(s){clearTimeout(toastClear);noticeNode.textContent=s;noticeNode.hidden=false;toastClear=setTimeout(()=>noticeNode.hidden=true,2800);}
function titleOf(x){return routeTitle(x)}
function hrefOf(x){return x?.page?.schemaExtensions?.route||'#/'}
function navLink(x){return dom('a',{href:hrefOf(x)},titleOf(x));}
function pageChildren(node){return childrenOf(catalog,node)}
function renderMenu(){
  desktop.replaceChildren();mobile.replaceChildren();
  for(const root of catalog.roots){
    const group=dom('div',{class:'nav-group'});
    const rootAnchor=navLink(root);if(currentRoute?.startsWith(hrefOf(root)))rootAnchor.classList.add('active');
    group.append(rootAnchor);
    const kids=pageChildren(root);
    if(kids.length){
      rootAnchor.append(dom('span',{class:'nav-caret','aria-hidden':'true'},'⌄'));
      const mega=dom('div',{class:'mega-panel'});
      mega.append(dom('div',{class:'mega-heading'},titleOf(root)+' · tartalmak'));
      const layout=dom('div',{class:'mega-layout'});
      for(const child of kids){
        const column=dom('div',{class:'mega-col'});column.append(navLink(child));
        const sub=dom('div',{class:'mega-sub'});
        for(const third of pageChildren(child))sub.append(navLink(third));
        column.append(sub);layout.append(column);
      }
      mega.append(layout);group.append(mega);
    }
    desktop.append(group);
    const detail=dom('details');detail.open=!!(currentRoute&&currentRoute.startsWith(hrefOf(root)));
    const summary=dom('summary',{},titleOf(root));detail.append(summary);
    const groupLink=navLink(root);groupLink.textContent='Áttekintés: '+titleOf(root);detail.append(groupLink);
    for(const child of kids){
      const secondKids=pageChildren(child);
      if(secondKids.length){
        const second=dom('details',{class:'mobile-sub'});second.open=!!(currentRoute&&currentRoute.startsWith(hrefOf(child)));
        second.append(dom('summary',{},titleOf(child)));
        const childLink=navLink(child);childLink.textContent='Áttekintés: '+titleOf(child);second.append(childLink);
        for(const sub of secondKids)second.append(navLink(sub));
        detail.append(second);
      }else detail.append(navLink(child));
    }
    mobile.append(detail);
  }
  for(const a of mobile.querySelectorAll('a'))if(a.getAttribute('href')===currentRoute)a.classList.add('active');
  document.getElementById('footer-page-count').textContent=`${catalog.items.length} elérhető mintanézet`;
}
function closeMobile(){mobile.hidden=true;menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-label','Mobilmenü megnyitása');}
function breadcrumb(node){
  const chain=[];let cur=node;
  while(cur){chain.unshift(cur);cur=cur.parent;}
  const bar=dom('nav',{class:'breadcrumbs','aria-label':'Morzsamenü'});
  bar.append(dom('a',{href:'#/'},'Kezdőoldal'));
  for(const item of chain){if(item.depth===0)continue;bar.append(dom('span',{class:'breadcrumb-sep','aria-hidden':'true'},'›'));
    if(item===node)bar.append(dom('span',{'aria-current':'page'},titleOf(item)));
    else bar.append(navLink(item));}
  return bar;
}
function getSiblings(node){if(node.depth===0)return[];return catalog.items.filter(x=>x.parent===node.parent&&x!==node).slice(0,8);}
function contentPage(node){
  const page=node.page;const fragment=document.createDocumentFragment();
  const banner=dom('section',{class:'page-banner'}),bannerInner=dom('div',{class:'container-xxl'});
  const bannerMedia=createPicture(page.schemaExtensions?.bannerMediaId,{className:'page-banner-media',eager:true,sizes:'100vw'});
  if(bannerMedia){banner.classList.add('has-photo');banner.append(bannerMedia,imageDisclaimer());}
  bannerInner.append(breadcrumb(node),dom('h1',{},page.title),dom('p',{},page.summary||''));banner.append(bannerInner);fragment.append(banner);
  const shell=dom('div',{class:'container-xxl content-shell'}),layout=dom('div',{class:'content-layout'}),body=dom('div');
  body.append(dom('div',{class:'preview-notice'},'Fejlesztési mintanézet: az oldalak struktúrája használható, de a végleges intézményi tartalmak még jóváhagyásra várnak.'));
  for(const block of page.blocks||[]){
    const outer=dom('div',{class:'body-card'});
    if(block.type==='section'){
      if(block.title)outer.append(dom('h2',{},block.title));
      for(const sub of block.children||[]){const element=renderBlock(sub);if(element)outer.append(element);}
      body.append(outer);
    } else {
      const element=renderBlock(block);if(element)body.append(element);
    }
  }
  const kids=pageChildren(node);
  if(kids.length){const sect=dom('section',{class:'mt-4'});sect.append(dom('p',{class:'section-overline'},'KAPCSOLÓDÓ OLDALAK'),dom('h2',{class:'section-title mb-4'},'Fedezd fel a témát'));sect.append(listCards(kids));body.append(sect);}
  const side=dom('aside',{class:'content-side','aria-label':'Kapcsolódó navigáció'}),panel=dom('div',{class:'side-panel'});
  panel.append(dom('h3',{},kids.length?'További aloldalak':'Ugyanebben a témában'));
  const related=(kids.length?kids:getSiblings(node));
  if(related.length){for(const target of related)panel.append(navLink(target));}
  else panel.append(dom('p',{class:'section-lead small'},'A témához később további ellenőrzött anyagok kapcsolódhatnak.'));
  side.append(panel);layout.append(body,side);shell.append(layout);fragment.append(shell);
  return fragment;
}
function homePage(node){
  const frag=document.createDocumentFragment();
  for(const block of node.page.blocks||[]){
    const rendered=renderBlock(block);if(!rendered)continue;
    if(block.id==='block:home-status'){
      const wrap=dom('section',{class:'preview-wrap'}),container=dom('div',{class:'container-xxl'}),panel=dom('div',{class:'preview-note-home'});
      const icon=dom('span',{class:'preview-note-icon','aria-hidden':'true'},'i');
      panel.append(icon,rendered);container.append(panel);wrap.append(container);frag.append(wrap);
    }else frag.append(rendered);
  }
  const mini=dom('section',{class:'section-wrap'}),container=dom('div',{class:'container-xxl'});
  container.append(dom('div',{class:'section-overline'},'AZ INTÉZMÉNY VILÁGA'),dom('h2',{class:'section-title mb-4'},'Fő tartalmi területeink'),listCards(catalog.roots));
  mini.append(container);frag.append(mini);return frag;
}
function errorPage(){const section=dom('section',{class:'not-found container-xxl'});section.append(dom('h1',{},'404'),dom('h2',{class:'section-title'},'Ez az oldal nem érhető el'),dom('p',{},'Az útvonal nem szerepel az ellenőrzött menüben, vagy a hozzá tartozó JSON hibás.'),dom('a',{class:'btn-gold',href:'#/'},'Vissza a kezdőoldalra'));return section;}
function pageForRoute(route){return catalog.routes.get(route)||null;}
function wireReveal(){
  revealObserver?.disconnect();
  const targets=[...app.querySelectorAll('.feature-card,.editorial-tile,.gallery-item,.section-title')];
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  revealObserver=new IntersectionObserver((entries,observer)=>{
    for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
  },{threshold:.09,rootMargin:'0px 0px 60px 0px'});
  for(const element of targets){element.classList.add('reveal-on-scroll');revealObserver.observe(element);}
}
function renderRoute(options={}){
  if(!catalog)return;
  const route=getRoute();const node=pageForRoute(route);
  if(currentRoute!==null && currentRoute!==route)historyScroll.set(currentRoute,window.scrollY);
  const isNew=currentRoute!==route;
  currentRoute=route;
  if(isNew)lastRawPage=node?JSON.stringify(node.page):null;
  const kind=route==='#/'?'home':route.startsWith('#/sport')?'sport':route.startsWith('#/oktatas')?'education':route.startsWith('#/hirek-es-esemenyek')?'news':route.startsWith('#/iskolank')?'school':'general';
  app.dataset.pageKind=kind;
  app.replaceChildren(node?(node.depth===0?homePage(node):contentPage(node)):errorPage());
  wireReveal();
  const title=node?.page?.title||'Az oldal nem található';document.title=title+' | Csanádi Sportiskola – fejlesztési előnézet';
  renderMenu();closeMobile();
  const target=options.keepScroll?window.scrollY:(historyScroll.get(route)||0);
  if(isNew)requestAnimationFrame(()=>window.scrollTo({top:target,behavior:'instant'}));
  if(options.focus)app.focus({preventScroll:true});
}
function closeSearch(){dialog.hidden=true;document.body.style.overflow='';searchInput.value='';if(previousSearchFocus?.focus)previousSearchFocus.focus();}
function openSearch(){previousSearchFocus=document.activeElement;dialog.hidden=false;document.body.style.overflow='hidden';renderSearch('');setTimeout(()=>searchInput.focus(),0);}
function renderSearch(query){if(!catalog)return;searchResults.replaceChildren();
  const q=norm(query.trim());
  const matches=catalog.items.map(n=>({n,hay:norm([n.page.title,n.page.summary,...(n.page.tags||[])].join(' '))})).filter(x=>!q||x.hay.includes(q));
  matches.sort((a,b)=>{const A=norm(a.n.page.title),B=norm(b.n.page.title);return (Number(B.startsWith(q))-Number(A.startsWith(q)))||a.n.depth-b.n.depth||A.localeCompare(B,'hu');});
  const max=query.trim()?24:10;
  searchStatus.textContent=q?`${matches.length} találat az oldalak között`:'Kezdj el gépelni, vagy válassz az alábbi oldalak közül.';
  if(!matches.length)searchResults.append(dom('p',{class:'section-lead p-3'},'Nincs találat. Próbálj más kifejezést.'));
  matches.slice(0,max).forEach(({n})=>{const a=dom('a',{class:'search-result',href:hrefOf(n)});a.append(dom('strong',{},n.page.title),dom('small',{},n.page.summary||'Tartalmi oldal'));a.addEventListener('click',closeSearch);searchResults.append(a);});
}
const THEME_MODES=['system','light','dark'];
const THEME_LABELS={system:'Automatikus',light:'Világos',dark:'Sötét'};
const THEME_ICONS={
  system:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  dark:'<path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3Z"/>'
};
function storedTheme(){try{const v=localStorage.getItem('csanadi-theme');return THEME_MODES.includes(v)?v:'system';}catch{return 'system';}}
let themeMode=storedTheme();
const mq=window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme(){
  const actual=themeMode==='system'?(mq.matches?'dark':'light'):themeMode;
  document.documentElement.dataset.theme=actual;
  document.documentElement.setAttribute('data-bs-theme',actual);
  document.documentElement.dataset.themePreference=themeMode;
  const btn=document.getElementById('theme-toggle'),next=THEME_MODES[(THEME_MODES.indexOf(themeMode)+1)%3];
  btn.setAttribute('aria-label',`Megjelenés: ${THEME_LABELS[themeMode]}. Következő: ${THEME_LABELS[next]}`);
  btn.title=`Megjelenés: ${THEME_LABELS[themeMode]}; kattintás: ${THEME_LABELS[next]}`;
  btn.querySelector('svg').innerHTML=THEME_ICONS[themeMode];
  document.getElementById('theme-label').textContent=THEME_LABELS[themeMode];
  const meta=document.getElementById('theme-color');if(meta)meta.content=actual==='dark'?'#0d1b2d':'#fffaf0';
}
function changeTheme(){
  themeMode=THEME_MODES[(THEME_MODES.indexOf(themeMode)+1)%3];
  try{localStorage.setItem('csanadi-theme',themeMode);}catch{}
  applyTheme();notify('Megjelenés: '+THEME_LABELS[themeMode]);
}
function wireEvents(){
  window.addEventListener('hashchange',()=>renderRoute({focus:true}));
  document.getElementById('search-open').addEventListener('click',openSearch);
  document.getElementById('search-close').addEventListener('click',closeSearch);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeSearch()});
  searchInput.addEventListener('input',()=>renderSearch(searchInput.value));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)closeSearch();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}
    if(!dialog.hidden&&e.key==='Tab'){
      const focusables=Array.from(dialog.querySelectorAll('button,input,a[href]')).filter(x=>x.offsetParent!==null);
      if(focusables.length){const first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    }
  });
  menuBtn.addEventListener('click',()=>{const open=mobile.hidden;mobile.hidden=!open;menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Mobilmenü bezárása':'Mobilmenü megnyitása');});
  document.getElementById('theme-toggle').addEventListener('click',changeTheme);
  mq.addEventListener('change',()=>{if(themeMode==='system')applyTheme();});
  applyTheme();
}
async function checkStructure(){
  try{const value=JSON.stringify(await loadJSON('structure.json'));
    if(lastRawStructure&&value!==lastRawStructure){const before=currentRoute;const scroll=window.scrollY;catalog=await buildCatalog();renderRoute({keepScroll:true});window.scrollTo({top:scroll,behavior:'instant'});notify('A menürendszer újratöltve.');}
    lastRawStructure=value;
  }catch(e){console.warn('Ideiglenes struktúrafrissítési hiba, korábbi állapot megtartva:',e);}
}
async function checkActivePage(){
  const item=catalog?.routes?.get(getRoute());if(!item)return;
  try{const latest=await loadJSON(item.path),raw=JSON.stringify(latest);
    if(lastRawPage!==null&&raw!==lastRawPage){
      const scroll=window.scrollY;
      if(latest?.id===item.page.id&&Array.isArray(latest.blocks)){item.page=latest;renderRoute({keepScroll:true});window.scrollTo({top:scroll,behavior:'instant'});notify('A megnyitott oldal frissült.');}
    }
    lastRawPage=raw;
  }catch(e){console.warn('Az aktív oldal ideiglenesen nem frissíthető:',e);}
}
function beginPolling(){
  const seconds=Math.min(3600,Math.max(15,catalog.config.refresh?.structureSeconds||60));
  const pageSeconds=Math.min(3600,Math.max(15,catalog.config.refresh?.activePageSeconds||60));
  setInterval(()=>{if(!document.hidden)checkStructure();},seconds*1000);
  setInterval(()=>{if(!document.hidden)checkActivePage();},pageSeconds*1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){checkStructure();checkActivePage();}});
}
export async function startApp(){
  wireEvents();
  if(location.protocol==='file:')throw new Error('A JSON-alapú weboldal HTTPS/HTTP kiszolgálást igényel, például GitHub Pages-t.');
  registerMedia(await loadJSON('mediatar.json'));
  catalog=await buildCatalog();
  lastRawStructure=JSON.stringify(catalog.structure);
  if(catalog.items.length===0)throw new Error('Nem található érvényes JSON-oldal.');
  renderRoute({focus:false});
  window.__CSANADI_STARTED__=true;
  beginPolling();
  console.info('Csanádi 2026 fejlesztési előnézet – aktív oldalak:',catalog.items.length);
  // A médiatár már elérhető a JSON-ban regisztrált fejlesztési illusztrációkkal.
}
