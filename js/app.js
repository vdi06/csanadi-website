import {renderLifeGallery} from './experience-2026.js?v=20261114v5';
import {renderHomeExperience,renderBellCenter,renderCalendarCenter,renderSocialSection,renderStaffCenter,initSocialLinks,openEntrancePortal} from './advanced-2026.js?v=20261114v5';
import {registerMedia,createPicture,imageDisclaimer} from './media.js?v=20261114v5';
import {loadDocumentRegistry,renderDocumentCenter,renderRelatedDocuments,renderDocumentQuickLinks,documentRegistryError,documentRefreshSeconds} from './documents.js?v=20261114v5';
/* Csanádi Sportiskola – hozzáférhető hash-SPA, regisztrált JSON-oldalakkal. */
import {buildCatalog,loadJSON,getRoute,routeTitle,childrenOf,norm,safeRoute} from './content.js?v=20261114v5';
import {renderBlock,dom,listCards} from './blocks.js?v=20261114v5';
import {renderNewsCenter,renderNewsTeasers} from './news-2026.js?v=20261114v5';
import {renderSportsSuccesses} from './sports-successes.js?v=20261114v5';
import {renderStudentAchievements} from './student-achievements.js?v=20261114v5';
import {renderDailySportsNews} from './daily-sport-news.js?v=20261114v5';
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
const siteMap=document.getElementById('site-map-overlay');
const siteMapCats=document.getElementById('site-map-categories');
const siteMapSubtopics=document.getElementById('site-map-subtopics');
const siteMapDetails=document.getElementById('site-map-details');
let siteMapSelected=null,siteMapReturnFocus=null;
const compassSymbols=['✦','◈','★','✧','▤','✉'];
function rootForCurrentRoute(){
 return catalog.roots.find(r=>currentRoute===hrefOf(r)||(hrefOf(r)!=='#/'&&currentRoute?.startsWith(hrefOf(r)+'/')))||catalog.roots[0];
}
function compassExpandButton(node, level, expanded, action){
 const button=dom('button',{class:'compass26-expand','aria-label':titleOf(node)+' aloldalainak '+(expanded?'bezárása':'megtekintése'),'aria-expanded':String(expanded)},expanded?'−':'+');
 button.type='button';button.addEventListener('click',action);return button;
}
function compassRow(node,level=2){
 const children=pageChildren(node);
 const group=dom('div',{class:'compass26-subgroup'});
 const row=dom('div',{class:'compass26-linkrow'});
 const link=navLink(node);link.className='compass26-sub-link';
 link.prepend(dom('span',{class:'compass26-mini','aria-hidden':'true'},level===2?'↗':'›'));
 row.append(link);
 if(children.length){
  const nested=dom('div',{class:'compass26-nested'});nested.hidden=true;
  const btn=compassExpandButton(node,level,false,()=>{
   nested.hidden=!nested.hidden;btn.textContent=nested.hidden?'+':'−';btn.setAttribute('aria-expanded',String(!nested.hidden));
   btn.setAttribute('aria-label',titleOf(node)+' aloldalainak '+(nested.hidden?'megtekintése':'bezárása'));
  });
  row.append(btn);group.append(row);
  children.forEach(child=>nested.append(compassRow(child,level+1)));
  group.append(nested);
 }else group.append(row);
 return group;
}
function renderSiteMap(root){
 if(!catalog)return;
 siteMapSelected=root||rootForCurrentRoute();
 siteMapCats.replaceChildren();siteMapSubtopics.replaceChildren();siteMapDetails.replaceChildren();
 catalog.roots.forEach((entry,i)=>{
  const wrapper=dom('div',{class:'compass26-choice'+(entry===siteMapSelected?' is-active':'')});
  const link=navLink(entry);link.className='compass26-choice-link';
  link.prepend(dom('span',{class:'compass26-choice-icon','aria-hidden':'true'},compassSymbols[i]||'◆'));
  link.append(dom('span',{class:'compass26-choice-cta','aria-hidden':'true'},'↗'));
  wrapper.append(link);
  const children=pageChildren(entry);
  if(children.length){
   const toggle=dom('button',{class:'compass26-choice-toggle','aria-label':titleOf(entry)+' almenüinek megjelenítése','aria-pressed':String(entry===siteMapSelected)},'⌄');
   toggle.type='button';toggle.addEventListener('click',()=>renderSiteMap(entry));wrapper.append(toggle);
  }
  siteMapCats.append(wrapper);
 });
 document.getElementById('compass26-current').textContent=titleOf(siteMapSelected);
 const children=pageChildren(siteMapSelected);
 if(children.length)children.forEach(child=>siteMapSubtopics.append(compassRow(child)));
 else siteMapSubtopics.append(dom('p',{class:'compass26-empty'},'Ez a témakör önálló oldal. A nagy kártyára kattintva megnyithatod.'));
 const parent=navLink(siteMapSelected);parent.className='compass26-parent-link';parent.textContent=titleOf(siteMapSelected)+' oldal megnyitása ↗';
 siteMapDetails.append(parent);
}
function openSiteMap(){
 if(!catalog)return;
 siteMapReturnFocus=document.activeElement;
 renderSiteMap(rootForCurrentRoute());siteMap.hidden=false;
 document.body.classList.add('site-map-is-open');
 document.getElementById('site-map-close').focus();
}
function closeSiteMap(restoreFocus=true){
 if(siteMap.hidden)return;
 siteMap.hidden=true;document.body.classList.remove('site-map-is-open');
 if(restoreFocus)siteMapReturnFocus?.focus?.();
}
function renderMenu(){
 desktop.replaceChildren();mobile.replaceChildren();
 for(const root of catalog.roots){
  const rootRoute=hrefOf(root),active=currentRoute===rootRoute||currentRoute?.startsWith(rootRoute+'/');
  const children=pageChildren(root);
  const group=dom('details',{class:'nav-mega-root'+(active?' active':'')});
  const summary=dom('summary',{class:'nav-mega-button'});summary.append(dom('span',{},titleOf(root)),dom('span',{class:'nav-mega-caret','aria-hidden':'true'},'⌄'));
  group.append(summary);
  const pane=dom('div',{class:'nav-mega-panel'}),intro=dom('div',{class:'nav-mega-intro'});
  intro.append(dom('strong',{},root.page.title),dom('p',{},root.page.summary||''));
  const overview=navLink(root);overview.className='nav-mega-overview';overview.textContent='Témakör áttekintése →';intro.append(overview);pane.append(intro);
  const columns=dom('div',{class:'nav-mega-columns'});
  for(const child of children){
   const column=dom('div',{class:'nav-mega-column'});const link=navLink(child);link.className='nav-mega-heading';column.append(link);
   for(const third of pageChildren(child)){const a=navLink(third);a.className='nav-mega-sublink';column.append(a);}
   columns.append(column);
  }
  if(children.length)pane.append(columns);
  group.append(pane);
  group.addEventListener('toggle',()=>{if(group.open){for(const other of desktop.querySelectorAll('.nav-mega-root'))if(other!==group)other.open=false;}});
  pane.addEventListener('click',e=>{if(e.target.closest('a[href]'))group.open=false;});
  desktop.append(group);
  const mobileRoot=dom('details',{class:'mobile-root'});
  mobileRoot.open=!!(active);
  mobileRoot.append(dom('summary',{},titleOf(root)));
  const rootLink=navLink(root);rootLink.textContent='Témakör áttekintése';rootLink.className='mobile-overview';mobileRoot.append(rootLink);
  for(const child of children){
   const sub=pageChildren(child);
   if(sub.length){const childDetails=dom('details',{class:'mobile-sub'});
    childDetails.open=!!(currentRoute&&(currentRoute===hrefOf(child)||currentRoute.startsWith(hrefOf(child)+'/')));
    childDetails.append(dom('summary',{},titleOf(child)));const overview=navLink(child);overview.textContent='Áttekintés: '+titleOf(child);childDetails.append(overview);
    for(const third of sub)childDetails.append(navLink(third));mobileRoot.append(childDetails);
   }else mobileRoot.append(navLink(child));
  }
  mobileRoot.addEventListener('toggle',()=>{if(mobileRoot.open)for(const other of mobile.querySelectorAll('details.mobile-root'))if(other!==mobileRoot)other.open=false;});
  mobile.append(mobileRoot);
 }
 for(const a of mobile.querySelectorAll('a'))if(a.getAttribute('href')===currentRoute)a.classList.add('active');
 document.getElementById('footer-page-count').textContent=`${catalog.items.length} tartalmi oldal`;
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
  const shell=dom('div',{class:'container-xxl content-shell'}),layout=dom('div',{class:'content-layout'}),body=dom('div',{class:'content-tiles'});
  const docRoute=page.schemaExtensions?.route?.startsWith('#/informaciok/dokumentumtar');
  if(docRoute){layout.classList.add('document-content-layout');body.append(renderDocumentCenter(page.schemaExtensions.route));for(const block of page.blocks||[]){const element=renderBlock(block);if(element)body.append(element);}}
  else{
  for(const block of page.blocks||[]){
    const words=JSON.stringify(block).length;
    // A JSON-blokk tartalma alapján választott, kiszámítható kártyaméret.
    // Rövid cikkek párosával, galériák és összetett modulok teljes sávban.
    const blockText=(block.data?.text||'')+' '+(block.title||'');
    const wide=['gallery','cards','accordion','table','chart'].includes(block.type)
      || (block.type==='section' && (block.children||[]).length>=3)
      || blockText.length>1550;
    const outer=dom('section',{class:'body-card content-tile '+(wide?'tile-wide':'tile-half')});
    if(block.type==='section'){
      if(block.title)outer.append(dom('h2',{},block.title));
      for(const sub of block.children||[]){const element=renderBlock(sub);if(element)outer.append(element);}
      body.append(outer);
    } else {
      const element=renderBlock(block);if(element){outer.append(element);body.append(outer);}
    }
  }
  }
  // A speciális modulok a meglévő JSON-oldalakhoz kapcsolódnak: egyetlen hash-SPA.
  const specialRoute=page.schemaExtensions?.route;
  if(['#/iskolank/buszkesegeink','#/sport/sporteredmenyek'].includes(specialRoute)){body.prepend(renderSportsSuccesses({data:{view:'archive'},title:'Közzétett sporteredmények'}));body.prepend(renderStudentAchievements('archive'));}
  if(specialRoute==='#/iskolank/tantestulet')body.prepend(renderStaffCenter());
  if(specialRoute==='#/informaciok/mindennapi-tudnivalok/csengetesi-rend')body.prepend(renderBellCenter());
  if(specialRoute==='#/hirek-es-esemenyek/esemenynaptar')body.prepend(renderCalendarCenter());
  if(['#/hirek-es-esemenyek/hirek','#/hirek-es-esemenyek/hirek/iskolai-hirek','#/hirek-es-esemenyek/hirek/sporthirek','#/hirek-es-esemenyek/hirek/hirarchivum','#/hirek-es-esemenyek/kozlemenyek'].includes(specialRoute))body.prepend(renderNewsCenter(specialRoute));
  if(specialRoute==='#/hirek-es-esemenyek/hirek/sporthirek')body.prepend(renderDailySportsNews('full'));
  const relatedDocs=renderRelatedDocuments(page.schemaExtensions?.route);if(relatedDocs)body.append(relatedDocs);
  const kids=pageChildren(node);
  if(kids.length){const sect=dom('section',{class:'mt-4'});sect.append(dom('p',{class:'section-overline'},'KAPCSOLÓDÓ OLDALAK'),dom('h2',{class:'section-title mb-4'},'Fedezd fel a témát'));sect.append(listCards(kids));body.append(sect);}
  const related=(kids.length?kids:getSiblings(node));
  const hasAside=related.length>=2&&!docRoute&&body.children.length<=7;
  layout.classList.add(hasAside?'content-has-aside':'content-no-aside');
  layout.append(body);
  if(hasAside){
    const side=dom('aside',{class:'content-side','aria-label':'Kapcsolódó navigáció'}),panel=dom('div',{class:'side-panel'});
    panel.append(dom('h3',{},kids.length?'További aloldalak':'Ugyanebben a témában'));
    for(const target of related)panel.append(navLink(target));
    side.append(panel);layout.append(side);
  }
  shell.append(layout);fragment.append(shell);
  return fragment;
}
function homePage(node){
  const frag=document.createDocumentFragment();
  const canvas=dom('div',{class:'container-xxl home-canvas'});
  function place(element,role){
    if(!element)return;
    const unit=dom('div',{class:'home-unit home-unit--'+role});
    unit.append(element);canvas.append(unit);
  }
  for(const block of node.page.blocks||[]){
    const rendered=block.id==='block:home-hero'?null:renderBlock(block);
    if(block.id==='block:home-status'){
      // A fejlesztői metaállapot nem látogatói tartalom; nem kerül a felületre.
      continue;
    }
    if(block.id==='block:home-hero')place(renderHomeExperience(),'daily-hub');
    else if(block.id==='block:home-sports-successes'){
      place(renderStudentAchievements('home'),'students');
      place(rendered,'sports-story');
      place(renderDailySportsNews('home'),'sports-news');
      place(renderNewsTeasers(),'school-news');
    }else if(block.id==='block:home-gallery-section'){
      place(rendered,'gallery');
      place(renderLifeGallery(),'life-gallery');
      place(renderSocialSection(),'social');
    }else if(block.id==='block:home-live-dashboard')place(rendered,'statistics');
    else if(block.id==='block:home-shortcuts')place(rendered,'shortcuts');
    else if(block.id==='block:home-editorial-2026')place(rendered,'editorial');
    else if(block.id==='block:home-section')place(rendered,'story');
    else place(rendered,'standard');
  }
  const mini=dom('section',{class:'section-wrap'}),container=dom('div',{class:'container-xxl'});
  container.append(dom('div',{class:'section-overline'},'AZ INTÉZMÉNY VILÁGA'),dom('h2',{class:'section-title mb-4'},'Fő tartalmi területeink'),listCards(catalog.roots));
  mini.append(container);place(mini,'areas');
  const docs=renderDocumentQuickLinks();if(docs)place(docs,'documents');
  frag.append(canvas);
  return frag;
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
  const title=node?.page?.title||'Az oldal nem található';document.title=title+' | Csanádi Árpád Sportiskola';
  renderMenu();closeMobile();closeSiteMap(false);
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
  document.getElementById('orbit-open').addEventListener('click',openSiteMap);
  document.getElementById('site-map-close').addEventListener('click',()=>closeSiteMap());
  siteMap.addEventListener('click',e=>{if(e.target.closest('[data-site-map-dismiss]'))closeSiteMap();if(e.target.closest('a[href]'))closeSiteMap(false);});
  siteMap.addEventListener('keydown',e=>{if(e.key==='Tab'){const focusables=[...siteMap.querySelectorAll('a[href],button:not([disabled]),summary')].filter(x=>x.getClientRects().length>0);if(focusables.length){const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}});
  document.getElementById('search-open').addEventListener('click',openSearch);
  document.getElementById('search-close').addEventListener('click',closeSearch);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeSearch()});
  searchInput.addEventListener('input',()=>renderSearch(searchInput.value));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)closeSearch();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}
    if(e.key==='Escape'&&!siteMap.hidden)closeSiteMap();
    if(!dialog.hidden&&e.key==='Tab'){
      const focusables=Array.from(dialog.querySelectorAll('button,input,a[href]')).filter(x=>x.offsetParent!==null);
      if(focusables.length){const first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    }
  });
  menuBtn.addEventListener('click',()=>{if(!siteMap.hidden)closeSiteMap(false);const open=mobile.hidden;mobile.hidden=!open;menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Mobilmenü bezárása':'Mobilmenü megnyitása');});
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
  await loadDocumentRegistry(); // Hibás/hiányzó dokumentum-JSON esetén a többi oldal akkor is elindul.
  const sharedHero=document.getElementById('global-hero');
  const homeNode=catalog.routes.get('#/');
  const homeHero=homeNode?.page?.blocks?.find(b=>b.id==='block:home-hero');
  if(sharedHero&&homeHero){
    const carousel=renderBlock(homeHero);
    if(carousel)sharedHero.replaceChildren(carousel);
  }
  lastRawStructure=JSON.stringify(catalog.structure);
  if(catalog.items.length===0)throw new Error('Nem található érvényes JSON-oldal.');
  renderRoute({focus:false});
  window.__CSANADI_STARTED__=true;
  initSocialLinks();
  openEntrancePortal();
  beginPolling();
  setInterval(()=>{if(!document.hidden)loadDocumentRegistry(true);},documentRefreshSeconds()*1000);
  console.info('Csanádi 2026 – tartalmi oldalak:',catalog.items.length);
  // A médiatár már elérhető a JSON-ban regisztrált fejlesztési illusztrációkkal.
}
