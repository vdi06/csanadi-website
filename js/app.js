import {renderHistoryTimeline,renderSportsStatisticsV3,renderDocumentInsights,enhanceNext10Route,initNext10,updatePageMeta} from './next10-2026.js?v=20261114n10final3';
import {initPerformanceDiagnostics,markNavigationStart,markRouteRendered,markRouteError} from './performance-diagnostics-2026.js?v=20261114speed1';
import {renderSportsCharts,renderCalendarFilters,renderDocumentFinder,renderSmartRelations,enhanceGallery} from './extended-hubs-2026.js?v=20261114ext1';
import {initDetailedDiagnostics,initSiteHealth,initMobileQuickNav} from './site-quality-2026.js?v=20261114ext1';
import {setupSmartSearch} from './search-j-2026.js?v=20261114ten2';
import {renderSportsPortal,renderEducationPath,renderUpcomingPanel,renderDocumentIndexExport} from './tenway-2026.js?v=20261114ten1';
import {learningNavigator,enhanceHomeInterests} from './kmil-2026.js?v=20261114kmil2';
import {initEnhancedInteractions} from './interactions-be-2026.js?v=20261114be1';
import {renderMediaGallery} from './media-gallery-h-2026.js?v=20261114h1';
import {renderHomeSportSpotlight} from './premium-home-2026.js?v=20261114premium1';
import {renderHomeExperience,renderBellCenter,renderCalendarCenter,renderSocialSection,renderStaffCenter,initSocialLinks,openEntrancePortal} from './advanced-2026.js?v=20261114dfg1';
import {registerMedia,createPicture,imageDisclaimer} from './media.js?v=20261114v5';
import {loadDocumentRegistry,renderDocumentCenter,renderRelatedDocuments,renderDocumentQuickLinks,documentRegistryError,documentRefreshSeconds} from './documents.js?v=20261114verified1';
 
import {buildCatalog,loadJSON,getRoute,routeTitle,childrenOf,norm,safeRoute} from './content.js?v=20261114ten2';
import {renderBlock,dom,listCards} from './blocks.js?v=20261114navs3';
import {renderNewsCenter,renderNewsTeasers} from './news-2026.js?v=20261114dfg1';
import {renderSportsSuccesses} from './sports-successes.js?v=20261114v5';
import {renderStudentAchievements} from './student-achievements.js?v=20261114navs3';
import {renderDailySportsNews} from './daily-sport-news.js?v=20261114ten2';
const app=document.getElementById('app');
const desktop=document.getElementById('desktop-navigation');
const mobile=document.getElementById('mobile-navigation');
const menuBtn=document.getElementById('mobile-menu-toggle');
const dialog=document.getElementById('search-panel');
const searchInput=document.getElementById('search-input');
const searchResults=document.getElementById('search-results');
const searchStatus=document.getElementById('search-status');
let catalog=null,currentRoute=null,previousSearchFocus=null,lastRawStructure='',refreshTimer=null,smartSearch=null;
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
const siteMapPanel=document.getElementById('compass26-panel');
let siteMapSelected=null,siteMapReturnFocus=null;
const outerRing=document.createElement('nav');
outerRing.id='csn26-outer-ring';outerRing.className='csn26-outer-ring';
outerRing.setAttribute('aria-label','Külső gyűrű – az aktív főmenü almenüpontjai');
outerRing.hidden=true;siteMap.append(outerRing);
function updateOuterRing(){
 const active=!!siteMapSelected&&!siteMap.hidden&&matchMedia('(min-width: 1100px)').matches;
 outerRing.replaceChildren();outerRing.hidden=!active;
 siteMap.classList.toggle('csn26-ring-active',active);
 if(!active)return false;
 const nodes=pageChildren(siteMapSelected);
 const emblem=siteMap.querySelector('.compass26-emblem');
 const origin=emblem?.getBoundingClientRect();if(!origin||!nodes.length)return false;
 const cx=origin.left+origin.width/2,cy=origin.top+origin.height/2;
 const small=innerWidth<1250||innerHeight<800;
 const radius=Math.min(425,innerWidth*.39,innerHeight*.46);
 const selectedIndex=catalog.roots.indexOf(siteMapSelected);
 const total=nodes.length;
 const arc=total<=5 ? Math.min(135,Math.max(45,(total-1)*34)) : 360;
 const direction=selectedIndex*60-90;
 const start=total<=5? direction-arc/2:-90;
 const spacing=total<=5 ? arc/Math.max(1,total-1):360/total;
 outerRing.style.setProperty('--ring-cx',cx+'px');outerRing.style.setProperty('--ring-cy',cy+'px');outerRing.style.setProperty('--ring-diameter',radius*2+'px');
 for(let i=0;i<total;i++){
  const node=nodes[i],children=pageChildren(node),angle=(start+i*spacing)*Math.PI/180;
  const px=Math.max(78,Math.min(innerWidth-78,cx+radius*Math.cos(angle)));
  const py=Math.max(48,Math.min(innerHeight-54,cy+radius*Math.sin(angle)));
  const item=dom('div',{class:'csn26-outer-node'});
  item.style.left=px+'px';item.style.top=py+'px';
  const link=navLink(node);link.className='csn26-outer-link';
  link.prepend(dom('span',{class:'csn26-outer-glyph','aria-hidden':'true'},'◈'));
  item.append(link);
  if(children.length){
   const button=dom('button',{type:'button',class:'csn26-third-toggle','aria-expanded':'false','aria-label':titleOf(node)+' al-almenüpontjai'},'+');
   button.addEventListener('click',()=>{
    const opened=button.getAttribute('aria-expanded')==='true';
    for(const other of outerRing.querySelectorAll('.csn26-third-list'))other.hidden=true;
    for(const other of outerRing.querySelectorAll('.csn26-third-toggle')){other.setAttribute('aria-expanded','false');other.textContent='+';}
    const list=item.querySelector('.csn26-third-list');list.hidden=opened;
    button.setAttribute('aria-expanded',String(!opened));button.textContent=opened?'+':'−';
   });
   item.append(button);
   const list=dom('div',{class:'csn26-third-list'});list.hidden=true;
   if(py>innerHeight*.65)list.classList.add('csn26-third-list-up');
   if(px>innerWidth*.58)list.classList.add('csn26-third-list-left');
   for(const child of children){const childLink=navLink(child);childLink.className='csn26-third-link';list.append(childLink);}
   item.append(list);
  }
  outerRing.append(item);
 }
 return true;
}
let pendingSearchJump=null;
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
 siteMapSelected=root||null;
 siteMapCats.replaceChildren();siteMapSubtopics.replaceChildren();siteMapDetails.replaceChildren();
 catalog.roots.forEach((entry,i)=>{
  const wrapper=dom('div',{class:'compass26-choice'+(entry===siteMapSelected?' is-active':'')});
  const link=navLink(entry);link.className='compass26-choice-link';
  link.prepend(dom('span',{class:'compass26-choice-icon','aria-hidden':'true'},compassSymbols[i]||'◆'));
  link.append(dom('span',{class:'compass26-choice-cta','aria-hidden':'true'},'↗'));
  wrapper.append(link);
  const children=pageChildren(entry);
  if(children.length){
   const expanded=entry===siteMapSelected;
   const toggle=dom('button',{class:'compass26-choice-toggle','aria-label':titleOf(entry)+(expanded?' almenüinek bezárása':' almenüinek megjelenítése'),'aria-expanded':String(expanded)},expanded?'−':'+');
   toggle.type='button';toggle.addEventListener('click',()=>{renderSiteMap(expanded?null:entry);siteMapCats.querySelectorAll('.compass26-choice-toggle')[i]?.focus();});wrapper.append(toggle);
  }
  siteMapCats.append(wrapper);
 });
 siteMapPanel.hidden=!siteMapSelected;
 if(!siteMapSelected){outerRing.hidden=true;siteMap.classList.remove('csn26-ring-active');}
 if(siteMapSelected){
  document.getElementById('compass26-current').textContent=titleOf(siteMapSelected)+' almenüi';
  pageChildren(siteMapSelected).forEach((child,i)=>{const sub=compassRow(child);sub.style.animationDelay=String(Math.min(i,12)*45)+'ms';siteMapSubtopics.append(sub);});
  requestAnimationFrame(positionCompassSubmenu);
 }else siteMapPanel.removeAttribute('style');
}

 
const submenuOriginalParent=siteMapPanel.parentElement;
function positionCompassSubmenu(){
 if(siteMap.hidden || !siteMapSelected){outerRing.hidden=true;return;}
 if(updateOuterRing()){siteMapPanel.hidden=true;siteMapPanel.setAttribute('aria-hidden','true');return;}
 siteMapPanel.removeAttribute('aria-hidden');siteMapPanel.hidden=false;
 if(matchMedia('(max-width: 760px)').matches){
  if(siteMapPanel.parentElement!==submenuOriginalParent)submenuOriginalParent.append(siteMapPanel);
  siteMap.querySelector('.site-map-dialog')?.removeAttribute('aria-owns');
  siteMapPanel.style.removeProperty('left');siteMapPanel.style.removeProperty('top');siteMapPanel.style.removeProperty('right');siteMapPanel.style.removeProperty('width');
  siteMapSubtopics.style.removeProperty('grid-template-columns');siteMapPanel.dataset.anchorSide='mobile';return;
 }
 if(siteMapPanel.parentElement!==siteMap)siteMap.append(siteMapPanel);
 siteMap.querySelector('.site-map-dialog')?.setAttribute('aria-owns','compass26-panel');
 const index=catalog.roots.indexOf(siteMapSelected);
 const anchor=siteMapCats.querySelectorAll('.compass26-choice')[index];if(!anchor)return;
 const rect=anchor.getBoundingClientRect();const margin=12,gap=15;
 const availableLeft=rect.left-gap-margin,availableRight=window.innerWidth-rect.right-gap-margin;
  
 let preferred=(rect.left+rect.width/2)>=window.innerWidth/2?'right':'left';
 let available=preferred==='right'?availableRight:availableLeft;
 if(available<175){preferred=preferred==='right'?'left':'right';available=preferred==='right'?availableRight:availableLeft;}
 let width=Math.min(410,Math.max(166,available));
 const useRight=preferred==='right';
 const x=useRight?rect.right+gap:rect.left-gap-width;
 siteMapSubtopics.style.setProperty('grid-template-columns',width<300?'minmax(0,1fr)':'repeat(2,minmax(0,1fr))','important');
 siteMapPanel.style.width=Math.round(width)+'px';
 siteMapPanel.style.left=Math.round(Math.max(margin,Math.min(window.innerWidth-width-margin,x)))+'px';
 siteMapPanel.style.right='auto';
 const height=Math.min(siteMapPanel.scrollHeight,window.innerHeight*.77);
 const y=Math.max(margin,Math.min(window.innerHeight-height-margin,rect.top+rect.height/2-Math.min(height*.28,80)));
 siteMapPanel.style.top=Math.round(y)+'px';
 siteMapPanel.dataset.anchorSide=preferred;
}
function openSiteMap(){
 if(!catalog)return;
 siteMapReturnFocus=document.activeElement;
 renderSiteMap(null);siteMap.hidden=false;
 document.body.classList.add('site-map-is-open');
 (siteMapCats.querySelector('.compass26-choice-link')||document.getElementById('site-map-close')).focus();
}
function closeSiteMap(restoreFocus=true){
 if(siteMap.hidden)return;
 siteMap.hidden=true;outerRing.hidden=true;siteMap.classList.remove('csn26-ring-active');document.body.classList.remove('site-map-is-open');
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
  const page=node.page,route=page.schemaExtensions?.route||'';
  const fragment=document.createDocumentFragment();
  const banner=dom('section',{class:'page-banner'}),bannerInner=dom('div',{class:'container-xxl'});
  const bannerMedia=createPicture(page.schemaExtensions?.bannerMediaId,{className:'page-banner-media',eager:true,sizes:'100vw'});
  if(bannerMedia){banner.classList.add('has-photo');banner.append(bannerMedia,imageDisclaimer());}
  bannerInner.append(breadcrumb(node),dom('h1',{},page.title),dom('p',{},page.summary||''));
  banner.append(bannerInner);fragment.append(banner);

   
   
  const shell=dom('div',{class:'container-xxl content-shell'});
  const layout=dom('div',{class:'content-layout content-no-aside'});
  const body=dom('div',{class:'content-tiles content-tiles--editorial'});
  const blocks=Array.isArray(page.blocks)?page.blocks:[];
  const article=dom('article',{class:'body-card content-tile tile-wide article-flow'+(blocks.length>=5?' article-flow--long':'')});
  for(const block of blocks){
    if(!block||typeof block!=='object')continue;
    if(block.type==='section'){
      const section=dom('section',{class:'article-section'});
      if(block.title)section.append(dom('h2',{},block.title));
      for(const sub of block.children||[]){const el=renderBlock(sub);if(el)section.append(el);}
      if(section.children.length)article.append(section);
    } else {
      const el=renderBlock(block);
      if(el){const section=dom('section',{class:'article-section article-section--module'});section.append(el);article.append(section);}
    }
  }
  if(article.children.length)body.append(article);

  const docRoute=route.startsWith('#/informaciok/dokumentumtar');
  if(docRoute){body.prepend(renderDocumentCenter(route));body.prepend(renderDocumentFinder());body.prepend(renderDocumentIndexExport());}
  if(['#/oktatas','#/oktatas/felveteli','#/oktatas/kepzeseink','#/oktatas/tanevek','#/oktatas/vizsgak'].includes(route))body.prepend(learningNavigator());
  if(route==='#/oktatas'||route==='#/oktatas/felveteli')body.prepend(renderEducationPath());
  if(route==='#/sport'||route==='#/sport/sportagak')body.prepend(renderSportsPortal());
  if(['#/sport','#/sport/sportagak','#/sport/sporteredmenyek'].includes(route))body.prepend(renderSportsCharts());
  if(['#/iskolank/buszkesegeink','#/sport/sporteredmenyek'].includes(route)){
    body.prepend(renderSportsSuccesses({data:{view:'archive'},title:'Közzétett sporteredmények'}));
    body.prepend(renderStudentAchievements('archive'));
  }
  if(route==='#/sport/sportgaleriak')body.prepend(renderMediaGallery({compact:false}));
  if(route==='#/iskolank/tantestulet')body.prepend(renderStaffCenter());
  if(route==='#/informaciok/mindennapi-tudnivalok/csengetesi-rend')body.prepend(renderBellCenter());
  if(route==='#/hirek-es-esemenyek/esemenynaptar'){body.prepend(renderCalendarCenter());body.prepend(renderCalendarFilters());body.prepend(renderUpcomingPanel());}
  if(['#/hirek-es-esemenyek/hirek','#/hirek-es-esemenyek/hirek/iskolai-hirek','#/hirek-es-esemenyek/hirek/sporthirek','#/hirek-es-esemenyek/hirek/hirarchivum','#/hirek-es-esemenyek/kozlemenyek'].includes(route))body.prepend(renderNewsCenter(route));
  if(route==='#/hirek-es-esemenyek/hirek/sporthirek')body.prepend(renderDailySportsNews('full'));
  const relatedDocs=renderRelatedDocuments(route);if(relatedDocs)body.append(relatedDocs);

   
  body.append(renderSmartRelations(node,catalog));
  layout.append(body);shell.append(layout);fragment.append(shell);
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
   
  place(renderHomeSportSpotlight(),'premium-showcase');
  for(const block of node.page.blocks||[]){
    const rendered=block.id==='block:home-hero'?null:renderBlock(block);
    if(block.id==='block:home-status'){
       
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
      place(renderMediaGallery({compact:true}),'life-gallery');
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
   
   
  const units=[...canvas.querySelectorAll(':scope > .home-unit')];
  const roleOf=el=>[...el.classList].find(x=>x.startsWith('home-unit--'))?.slice(11)||'';
  const roleMap=new Map(units.map(el=>[roleOf(el),el]));
  const nav=dom('nav',{class:'home-j-navrail','aria-label':'Kezdőoldali gyorsnavigáció'});
  for(const [label,route] of [['Felvételi','#/oktatas/felveteli'],['Hírek','#/hirek-es-esemenyek/hirek'],['Sport','#/sport'],['Dokumentumok','#/informaciok/dokumentumtar']]){
    nav.append(dom('a',{href:route},label+' ↗'));
  }
  const searchShortcut=dom('button',{type:'button',class:'home-j-search'},'Keresés a honlapon ⌕');
  searchShortcut.addEventListener('click',openSearch);nav.append(searchShortcut);
  const rails=dom('div',{class:'home-j-navrail-unit'});rails.append(nav);
  const visibleRoles=['premium-showcase','school-news','sports-news'];
  canvas.replaceChildren();
  for(const role of visibleRoles){const unit=roleMap.get(role);if(unit)canvas.append(unit);if(role==='premium-showcase')canvas.append(rails);}
  const foldGroups=[
    {title:'Napi központ és interaktív információk',sub:'A napi központ részletes elemei egy kattintással',roles:['daily-hub']},
    {title:'Sporteredmények és statisztikák',sub:'Tanulói sikerek, részletes sporttartalmak és adatok',roles:['students','sports-story','statistics']},
    {title:'Sport és iskolai élet – képekben',sub:'Fotógaléria, albumok és közösségi felületek',roles:['gallery','life-gallery','social']},
    {title:'Fedezd fel az iskolát',sub:'Képzési, közösségi és ügyintézési információk',roles:['shortcuts','editorial','story','areas','documents','standard']}
  ];
  for(const info of foldGroups){
    const children=info.roles.map(role=>roleMap.get(role)).filter(Boolean);
    if(!children.length)continue;
    const fold=dom('details',{class:'home-j-fold'});
    const summary=dom('summary',{class:'home-j-fold-toggle'});
    const title=dom('span',{class:'home-j-fold-copy'});
    title.append(dom('strong',{},info.title),dom('small',{},info.sub));
    summary.append(dom('span',{class:'home-j-fold-symbol','aria-hidden':'true'},'✦'),title,dom('span',{class:'home-j-fold-arrow','aria-hidden':'true'},'⌄'));
    const grid=dom('div',{class:'home-j-fold-grid'});
    for(const child of children)grid.append(child);
    fold.append(summary,grid);
    if(info.roles.includes('daily-hub'))canvas.insertBefore(fold,canvas.querySelector('.home-unit--school-news'));
    else canvas.append(fold);
  }
   
  for(const unit of units)if(!canvas.contains(unit))canvas.append(unit);
  enhanceHomeInterests(canvas);
  frag.append(canvas);
  return frag;
}
function errorPage(){const section=dom('section',{class:'not-found container-xxl'});section.append(dom('h1',{},'404'),dom('h2',{class:'section-title'},'Ez az oldal nem érhető el'),dom('p',{},'Az útvonal nem szerepel az ellenőrzött menüben, vagy a hozzá tartozó JSON hibás.'),dom('a',{class:'btn-gold',href:'#/'},'Vissza a kezdőoldalra'));return section;}
function pageForRoute(route){return catalog.routes.get(route)||null;}
function wireReveal(){
  revealObserver?.disconnect();
  const targets=[...app.querySelectorAll('.feature-card,.editorial-tile,.gallery-item,.section-title,.premium26-visual-card,.premium26-discover-link,.student-success-card,.cs-achievement')];
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  revealObserver=new IntersectionObserver((entries,observer)=>{
    for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
  },{threshold:.09,rootMargin:'0px 0px 60px 0px'});
  for(const element of targets){element.classList.add('reveal-on-scroll');revealObserver.observe(element);}
}
function renderRoute(options={}){
  if(!catalog)return;
  const route=getRoute();const node=pageForRoute(route);
  if(node && !node._fullLoaded){
    if(!node._pagePromise){
      node._pagePromise=loadJSON(node.path).then(page=>{
        if(page?.id!==node.page?.id || page?.schemaExtensions?.route!==route || !Array.isArray(page.blocks) || page.lifecycle?.status!=='published')throw Error('Eltérő vagy nem publikált oldaladat');
        node.page=page;node._fullLoaded=true;
      }).finally(()=>{node._pagePromise=null;});
    }
    app.replaceChildren(dom('div',{class:'cs-page-loading container-xxl','role':'status','aria-live':'polite'},'A kiválasztott oldal betöltése…'));
    node._pagePromise.then(()=>{if(getRoute()===route)renderRoute(options);}).catch(error=>{
      console.error('Oldalbetöltési hiba:',error);
      if(getRoute()===route){app.replaceChildren(dom('div',{class:'cs-page-load-error container-xxl',role:'alert'},'Az oldal tartalma átmenetileg nem érhető el. Frissítsd az oldalt a próbálkozáshoz.'));markRouteError(route);}
    });
    return;
  }
  if(currentRoute!==null && currentRoute!==route)historyScroll.set(currentRoute,window.scrollY);
  const isNew=currentRoute!==route;
  currentRoute=route;
  if(isNew)lastRawPage=node?JSON.stringify(node.page):null;
  const kind=route==='#/'?'home':route.startsWith('#/sport')?'sport':route.startsWith('#/oktatas')?'education':route.startsWith('#/hirek-es-esemenyek')?'news':route.startsWith('#/iskolank')?'school':'general';
  app.dataset.pageKind=kind;
  document.body.classList.toggle('cs-inner-page',kind!=='home');
  app.replaceChildren(node?(node.depth===0?homePage(node):contentPage(node)):errorPage());
  wireReveal();
  enhanceGallery(app);
  enhanceNext10Route(node,app);
  if(node)updatePageMeta(node.page,route);
  document.dispatchEvent(new CustomEvent('csanadi:route-rendered',{detail:{route}}));
  if(pendingSearchJump && pendingSearchJump.route===route)setTimeout(trySearchJump,90);
  const title=node?.page?.title||'Az oldal nem található';document.title=title+' | Csanádi Árpád Sportiskola';
  renderMenu();closeMobile();closeSiteMap(false);
  const target=options.keepScroll?window.scrollY:(historyScroll.get(route)||0);
  if(isNew)requestAnimationFrame(()=>window.scrollTo({top:target,behavior:'instant'}));
  if(options.focus)app.focus({preventScroll:true});
  markRouteRendered(route,{found:!!node});
}
function closeSearch(){dialog.hidden=true;document.body.style.overflow='';smartSearch?.reset();if(previousSearchFocus?.focus)previousSearchFocus.focus();}
 
function markSearchTarget(element){
 if(!element)return;
 for(let d=element.closest('details');d;d=d.parentElement?.closest('details'))d.open=true;
 const target=element.closest('.dfg-news-card,.cs-news-card,.hub26-event-card,.media26-tile,.media26-video-card,.doc-card,.feature-card,.student-success-card,.body-card')||element;
 target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center',inline:'nearest'});
 target.classList.add('cs-search-found');target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
 setTimeout(()=>target.classList.remove('cs-search-found'),3200);
}
function searchTargetMatch(root,entry,phrase){
 const normalize=s=>norm(s).replace(/\\s+/g,' ').trim();
 const title=normalize(entry.title),query=normalize(phrase);
 const nodes=[...root.querySelectorAll('h1,h2,h3,h4,.media26-tile-label,.dfg-news-title,.cs-news-title,.doc-title,.hub26-event-card,.gallery-item,button[aria-label],p,li,.text-flow,.card-title')];
 let heading=null,match=null;
 for(const node of nodes){
  const text=normalize(node.textContent||node.getAttribute('aria-label')||'');
  if(!text)continue;
  if(title && (text===title || (text.length<title.length+35 && text.includes(title)))){heading=node;break;}
  if(!match && query.length>2 && text.includes(query))match=node;
 }
 return heading||match||root.querySelector('h1,.page-banner h1,.section-title')||root;
}
function trySearchJump(){
 const state=pendingSearchJump;if(!state)return;
 if(getRoute()!==state.route)return;
 const root=app,kind=state.entry.type,title=state.entry.title;
  
 if(!state.filtered){
  if(kind==='news'){
   const field=root.querySelector('.cs-news-center .dfg-news-toolbar input');
   if(field){field.value=title;field.dispatchEvent(new Event('input',{bubbles:true}));state.filtered=true;}
  }else if(kind==='image'||kind==='video'){
   const field=root.querySelector('.media26-search');
   if(field){
    const all=[...root.querySelectorAll('.media26-album')].find(x=>x.textContent.includes('Összes album'));all?.click();
    const tab=[...root.querySelectorAll('.media26-tab')].find(x=>x.textContent.includes(kind==='video'?'Videók':'Képek'));tab?.click();
    field.value=title;field.dispatchEvent(new Event('input',{bubbles:true}));state.filtered=true;
   }
  }else if(kind==='event'){
   const agenda=[...root.querySelectorAll('.hub26-cal-modes button')].find(x=>x.textContent.toLocaleLowerCase('hu-HU').includes('lista'));
   agenda?.click();
   const field=root.querySelector('.hub26-calendar input[type="search"]');
   if(field){field.value=title;field.dispatchEvent(new Event('input',{bubbles:true}));state.filtered=true;}
  }
 }
 let found=null;
 if(kind==='image')found=[...root.querySelectorAll('.media26-tile')].find(x=>norm(x.getAttribute('aria-label')||'').includes(norm(title)));
 if(kind==='video')found=[...root.querySelectorAll('.media26-video-card')].find(x=>norm(x.textContent).includes(norm(title)));
 if(kind==='news')found=[...root.querySelectorAll('.dfg-news-card,.cs-news-card')].find(x=>norm(x.textContent).includes(norm(title)));
 if(kind==='event')found=[...root.querySelectorAll('.hub26-event-card')].find(x=>norm(x.textContent).includes(norm(title)));
 if(kind==='page')found=searchTargetMatch(root,state.entry,state.query);
 if(found){
  pendingSearchJump=null;
  if(kind==='image'){markSearchTarget(found);found.click();}
  else markSearchTarget(found);
  return;
 }
 if(++state.attempts<22){setTimeout(trySearchJump,150);return;}
 pendingSearchJump=null;
 markSearchTarget(searchTargetMatch(root,state.entry,state.query));
}
function handleSearchNavigation(entry,query,event){
 if(entry.external || !entry.href?.startsWith('#/')){closeSearch();return;}
 event.preventDefault();
 const route=safeRoute(entry.href);
 pendingSearchJump={entry,query,route,filtered:false,attempts:0};
 closeSearch();
 if(getRoute()===route){setTimeout(trySearchJump,90);}
 else location.hash=route;
}

function openSearch(){previousSearchFocus=document.activeElement;dialog.hidden=false;document.body.style.overflow='hidden';smartSearch?.render();setTimeout(()=>searchInput.focus(),0);}
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
  window.addEventListener('hashchange',()=>{markNavigationStart(getRoute());renderRoute({focus:true});});
  document.getElementById('orbit-open').addEventListener('click',openSiteMap);
  window.addEventListener('resize',()=>{if(!siteMap.hidden)requestAnimationFrame(positionCompassSubmenu);});
  document.getElementById('site-map-close').addEventListener('click',()=>closeSiteMap());
  siteMap.addEventListener('click',e=>{if(e.target.closest('[data-site-map-dismiss]'))closeSiteMap();if(e.target.closest('a[href]'))closeSiteMap(false);});
  siteMap.addEventListener('keydown',e=>{if(e.key==='Tab'){const focusables=[...siteMap.querySelectorAll('a[href],button:not([disabled]),summary')].filter(x=>x.getClientRects().length>0);if(focusables.length){const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}});
  document.getElementById('search-open').addEventListener('click',openSearch);
  document.getElementById('search-close').addEventListener('click',closeSearch);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeSearch()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)closeSearch();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}
    if(e.key==='Escape'&&!siteMap.hidden)closeSiteMap();
    if(e.key==='Escape'&&!mobile.hidden){closeMobile();menuBtn.focus();}
    if(!dialog.hidden&&e.key==='Tab'){
      const focusables=Array.from(dialog.querySelectorAll('button,input,a[href]')).filter(x=>x.offsetParent!==null);
      if(focusables.length){const first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    }
  });
  menuBtn.addEventListener('click',()=>{if(!siteMap.hidden)closeSiteMap(false);const open=mobile.hidden;mobile.hidden=!open;menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Mobilmenü bezárása':'Mobilmenü megnyitása');if(open)mobile.querySelector('summary')?.focus();});
  document.getElementById('theme-toggle').addEventListener('click',changeTheme);
  mq.addEventListener('change',()=>{if(themeMode==='system')applyTheme();});
  applyTheme();
}
async function checkStructure(){
  try{const value=JSON.stringify(await loadJSON('structure.json',{fresh:true}));
    if(lastRawStructure&&value!==lastRawStructure){const before=currentRoute;const scroll=window.scrollY;catalog=await buildCatalog();smartSearch?.rebuild(catalog);renderRoute({keepScroll:true});window.scrollTo({top:scroll,behavior:'instant'});notify('A menürendszer újratöltve.');}
    lastRawStructure=value;
  }catch(e){console.warn('Ideiglenes struktúrafrissítési hiba, korábbi állapot megtartva:',e);}
}
async function checkActivePage(){
  const item=catalog?.routes?.get(getRoute());if(!item)return;
  try{const latest=await loadJSON(item.path,{fresh:true}),raw=JSON.stringify(latest);
    if(lastRawPage!==null&&raw!==lastRawPage){
      const scroll=window.scrollY;
      if(latest?.id===item.page.id&&Array.isArray(latest.blocks)){item.page=latest;item._fullLoaded=true;renderRoute({keepScroll:true});window.scrollTo({top:scroll,behavior:'instant'});notify('A megnyitott oldal frissült.');}
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
  initPerformanceDiagnostics();
  initDetailedDiagnostics();
  initNext10();
  markNavigationStart(getRoute(),{initial:true});
  wireEvents();
  if(location.protocol==='file:')throw new Error('A JSON-alapú weboldal HTTP/HTTPS kiszolgálást igényel, például helyi localhost szervert vagy az iskola webtárhelyét.');
  registerMedia(await loadJSON('mediatar.json'));
  catalog=await buildCatalog();
  smartSearch=setupSmartSearch({catalog,loadJSON,norm,dialog,input:searchInput,results:searchResults,status:searchStatus,onNavigate:handleSearchNavigation});
  await smartSearch.rebuild(catalog);
  await loadDocumentRegistry();  
  const sharedHero=document.getElementById('global-hero');
  const homeNode=catalog.routes.get('#/');
  if(homeNode && !homeNode._fullLoaded){
    try{const page=await loadJSON(homeNode.path);if(page?.id===homeNode.page?.id&&Array.isArray(page.blocks)){
      homeNode.page=page;homeNode._fullLoaded=true;
    }}catch(e){console.warn('A nyitóoldal tartalma nem töltődött be:',e);}
  }
  const homeHero=homeNode?.page?.blocks?.find(b=>b.id==='block:home-hero');
  if(sharedHero&&homeHero){
    const carousel=renderBlock(homeHero);
    if(carousel)sharedHero.replaceChildren(carousel);
  }
  lastRawStructure=JSON.stringify(catalog.structure);
  if(catalog.items.length===0)throw new Error('Nem található érvényes JSON-oldal.');
  renderRoute({focus:false});
  initSiteHealth(catalog);
  initMobileQuickNav();
  window.__CSANADI_STARTED__=true;
  initSocialLinks();
  openEntrancePortal();
  initEnhancedInteractions();
  beginPolling();
  setInterval(()=>{if(!document.hidden)loadDocumentRegistry(true);},documentRefreshSeconds()*1000);
  console.info('Csanádi 2026 – tartalmi oldalak:',catalog.items.length);
   
}
