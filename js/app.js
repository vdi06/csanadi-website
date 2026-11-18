import {initRound10Enhancements} from './round10-enhancements.js?v=1.42.12';
import {renderHistoryTimeline,renderSportsStatisticsV3,renderDocumentInsights,enhanceNext10Route,initNext10,updatePageMeta} from './next10-2026.js?v=1.42.12';
import {initPerformanceDiagnostics,markNavigationStart,markRouteRendered,markRouteError} from './performance-diagnostics-2026.js?v=1.42.12';
import {renderSportsCharts,renderCalendarFilters,renderDocumentFinder,renderSmartRelations,enhanceGallery} from './extended-hubs-2026.js?v=1.42.12';
import {initDetailedDiagnostics,initSiteHealth} from './site-quality-2026.js?v=1.42.12';
import {initMobileQuickNav} from '../mobile/quick-nav.js?v=1.42.12';
import {setupSmartSearch} from './search-j-2026.js?v=1.42.12';
import {installLanguageHighlights} from './language-20.js?v=1.42.12';
import {enhancePersonalizedHome} from './round21-personalize.js?v=1.42.12';
import {enhanceInlineHomeEditor} from './home-inline-editor-v1-41-4.js?v=1.42.12';
import {enhanceRound29Home,syncRound29HomeNavigation,syncMobileSubpageSections,syncMobileEmbeddedSections,initRound29Diagnostics} from './round29-home.js?v=1.42.12';
import {renderSportsPortal,renderEducationPath,renderUpcomingPanel,renderDocumentIndexExport} from './tenway-2026.js?v=1.42.12';
import {learningNavigator,enhanceHomeInterests} from './kmil-2026.js?v=1.42.12';
import {initEnhancedInteractions} from './interactions-be-2026.js?v=1.42.12';
import {renderMediaGallery} from './media-gallery-h-2026.js?v=1.42.12';
import {renderDocumentCollections} from './document-collections-2026.js?v=1.42.12';
import {renderPageMedia} from './page-media-2026.js?v=1.42.12';
import {useSiteSettings,settingNumber} from './site-settings-2026.js';
import {renderHomeSportSpotlight} from './premium-home-2026.js?v=1.42.12';
import {renderHomeExperience,renderBellCenter,renderCalendarCenter,renderSocialSection,renderStaffCenter,initSocialLinks,openEntrancePortal} from './advanced-2026.js?v=1.42.12';
import {registerMedia,createPicture,imageDisclaimer,mediaForRoute} from './media.js?v=1.42.12';
import {loadDocumentRegistry,renderDocumentCenter,renderRelatedDocuments,renderDocumentQuickLinks,documentRegistryError,documentRefreshSeconds} from './documents.js?v=1.42.12';
 
import {buildCatalog,loadJSON,getRoute,routeTitle,childrenOf,contentChildrenOf,norm,safeRoute} from './content.js?v=1.42.12';
import {renderBlock,dom,listCards} from './blocks.js?v=1.42.12';
import {renderNewsCenter,renderNewsTeasers} from './news-2026.js?v=1.42.12';
import {renderSportsSuccesses} from './sports-successes.js?v=1.42.12';
import {renderStudentAchievements} from './student-achievements.js?v=1.42.12';
import {renderDailySportsNews} from './daily-sport-news.js?v=1.42.12';
import {renderDesktopTree} from '../desktop/navigation.js?v=1.42.12';
import {renderMobileTree} from '../mobile/navigation.js?v=1.42.12';
import {createPhoneRadial} from '../mobile/radial-wheel-v1-38.js?v=1.42.12';
import {pageTemplateKind,applyPageTemplate} from './page-templates-v1-39-2.js?v=1.42.12';
import {createSubpageHero} from './subpages-v1.js?v=1.42.12';
import {isSpaFeature,featurePlaceholder,activateSpaFeature,releaseSpaFeatureStyles} from './spa-features-v1-42.js?v=1.42.12';
const app=document.getElementById('app');
const routeStatus=document.getElementById('cs1404-route-status');
let homeHeroElement=null;
// A legpontosabb útvonalprofil választja ki a témához illő, helyben futó
// sportmozdulatot; az eredeti hat főmenü és az összes tartalmi oldal változatlan.
export function headerMotionForRoute(route,node,config){
 if(!node||route==='#/'||config?.enabled===false)return null;
 const profile=Object.entries(config?.profiles||{})
  .filter(([prefix])=>route===prefix||route.startsWith(prefix+'/'))
  .sort((a,b)=>b[0].length-a[0].length)[0]?.[1];
 return {scene:profile?.scene||'dribble',
  label:String(profile?.label||node.page?.menuLabel||'CSANÁDI').trim().slice(0,45),
  caption:String(profile?.caption||node.page?.title||'Sport és tanulás').trim().slice(0,95),
  autoplay:config?.autoplay!==false};
}
function syncRouteHero(node,kind){
 const container=document.getElementById('global-hero');if(!container)return;
 // A főmenü indítógombját a kezdőlapi képváltó is használja. Az aloldali
 // képváltó cseréje előtt ki kell emelni, különben vele együtt törlődik a DOM-ból.
 const launcher=document.querySelector('.csn26-visual-launch');
 if(kind==='home'){
  document.body.classList.remove('cs-has-subhero');
  if(homeHeroElement && container.firstElementChild!==homeHeroElement)container.replaceChildren(homeHeroElement);
  if(launcher && homeHeroElement && !homeHeroElement.contains(launcher))
   homeHeroElement.querySelector('.csn26-visual-row')?.append(launcher);
  return;
 }
 if(launcher && container.contains(launcher))container.insertAdjacentElement('afterend',launcher);
 const candidates=[];
 for(let item=node;item;item=item.parent){
  const id=item.page?.schemaExtensions?.bannerMediaId;
  if(typeof id==='string'&&!candidates.includes(id))candidates.push(id);
 }
 if(!candidates.length && node)candidates.push(mediaForRoute(node.page?.schemaExtensions?.route||''));
 const options=catalog?.config?.runtime?.subpageHero||{};
 const maxSlides=Math.min(5,Math.max(1,Number(options.maxSlides)||3));
 const hero=createSubpageHero({title:node?.page?.title||'Csanádi Sportiskola',mediaIds:candidates.slice(0,maxSlides),createPicture,
  intervalMs:options.intervalMs,enableAutoplay:options.enableAutoplay!==false});
 document.body.classList.toggle('cs-has-subhero',!!hero);
 container.replaceChildren(...(hero?[hero]:[]));
}
// Az oldal aktuális címére mutató, ismétlődő fejléc-CTA nem hasznos navigáció.
// A menürendszer és a tartalmi hivatkozások változatlanul megmaradnak.
function syncHeaderSelfLinks(){
 const route=getRoute().replace(/\/+$/,'')||'#/';
 for(const link of app.querySelectorAll('a[href^="#/"]')){
  const parent=link.parentElement;
  const isSectionHead=parent?.classList && [...parent.classList].some(cls=>/(?:^|[-_])(head|header|heading)(?:$|[-_])/.test(cls));
  if(!isSectionHead)continue;
  const target=link.getAttribute('href')?.split('?')[0].replace(/\/+$/,'')||'#/';
  const self=target===route;
  link.hidden=self;
  link.classList.toggle('cs-self-header-link',self);
 }
}
const selfLinkObserver=new MutationObserver(()=>syncHeaderSelfLinks());
selfLinkObserver.observe(app,{childList:true,subtree:true});
const desktop=document.getElementById('desktop-navigation');
const mobile=document.getElementById('mobile-navigation');
const menuBtn=document.getElementById('mobile-menu-toggle');
const dialog=document.getElementById('search-panel');
const searchInput=document.getElementById('search-input');
const searchResults=document.getElementById('search-results');
const searchStatus=document.getElementById('search-status');
let catalog=null,currentRoute=null,previousSearchFocus=null,lastRawStructure='',refreshTimer=null,smartSearch=null;
let structureChecking=null,activePageChecking=null;
let lastRawPage=null;
const historyScroll=new Map();
// Keresési állapot kizárólag az aktuális böngészőlap memóriájában, útvonalanként.
const searchRouteStates=new Map();
let searchOpenRoute=null;
let navigatingHistory=false;
const noticeNode=document.getElementById('toast');
let toastClear=null;
let revealObserver=null;
function notify(s,{themePreference=null}={}){
  clearTimeout(toastClear);
  noticeNode.textContent=s;
  if(['light','dark','system'].includes(themePreference))noticeNode.dataset.themeNotification=themePreference;
  else delete noticeNode.dataset.themeNotification;
  noticeNode.hidden=false;
  toastClear=setTimeout(()=>{noticeNode.hidden=true;delete noticeNode.dataset.themeNotification;},settingNumber('runtime.timing.toastDurationMs'));
}
function titleOf(x){return routeTitle(x)}
function hrefOf(x){return x?.page?.schemaExtensions?.route||'#/'}
function navLink(x){return dom('a',{href:hrefOf(x)},titleOf(x));}
function pageChildren(node){return childrenOf(catalog,node)}
const siteMap=document.getElementById('site-map-overlay');
const siteMapCats=document.getElementById('site-map-categories');
const siteMapSubtopics=document.getElementById('site-map-subtopics');
const siteMapDetails=document.getElementById('site-map-details');
const siteMapPanel=document.getElementById('compass26-panel');
const phoneWheel=createPhoneRadial({
 container:document.getElementById('cs-phone-wheel'),
 title:document.getElementById('cs-phone-wheel-title'),
 description:document.getElementById('cs-phone-wheel-description'),
 overview:document.getElementById('cs-phone-wheel-overview'),
 center:document.querySelector('.cs-phone-wheel-center'),
 onChoose:()=>closeSiteMap(false)
});
let siteMapSelected=null,siteMapReturnFocus=null;
let siteMapLauncherHome=null;
let searchPreviousOverflow='',searchInertNodes=[];
let siteMapInertNodes=[];
function setMenuButtonState(open){
 for(const button of [menuBtn,document.getElementById('orbit-open')]){
  if(!button)continue;
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-label',open?'Főmenü bezárása':'Főmenü megnyitása');
 }
}
function relocateSiteMapButton(open){
 const emblem=siteMap.querySelector('.compass26-emblem');
 const launcher=document.querySelector('.csn26-visual-launch');
 if(!emblem||!launcher)return;
 if(open){siteMapLauncherHome=launcher.parentElement;emblem.replaceChildren(launcher);launcher.querySelector('button')?.setAttribute('aria-expanded','true');launcher.querySelector('button')?.setAttribute('aria-label','Főmenü bezárása');}
 else if(siteMapLauncherHome){
  const hero=document.getElementById('global-hero');
  const target=document.body.classList.contains('cs-inner-page')?null:homeHeroElement?.querySelector('.csn26-visual-row');
  if(target)target.append(launcher);
  else if(hero)hero.insertAdjacentElement('afterend',launcher);
  else if(siteMapLauncherHome.isConnected)siteMapLauncherHome.append(launcher);
  launcher.querySelector('button')?.setAttribute('aria-expanded','false');
  launcher.querySelector('button')?.setAttribute('aria-label','Főmenü megnyitása');
  siteMapLauncherHome=null;
 }
}

const outerRing=document.createElement('nav');
outerRing.id='csn26-outer-ring';outerRing.className='csn26-outer-ring';
outerRing.setAttribute('aria-label','Külső gyűrű – az aktív főmenü almenüpontjai');
outerRing.hidden=true;siteMap.append(outerRing);
function updateOuterRing(){
 const active=!!siteMapSelected&&!siteMap.hidden&&innerWidth>=settingNumber('runtime.navigation.outerRingMinWidthPx');
 outerRing.replaceChildren();outerRing.hidden=!active;
 siteMap.classList.toggle('csn26-ring-active',active);
 if(!active)return false;
 const nodes=pageChildren(siteMapSelected);
 const emblem=siteMap.querySelector('.compass26-emblem');
 const origin=emblem?.getBoundingClientRect();if(!origin||!nodes.length)return false;
 const cx=origin.left+origin.width/2,cy=origin.top+origin.height/2;
 const small=innerWidth<1250||innerHeight<800;
 const radius=Math.min(settingNumber('runtime.navigation.outerRingRadiusMaxPx'),innerWidth*settingNumber('runtime.navigation.outerRingRadiusWidthRatio'),innerHeight*settingNumber('runtime.navigation.outerRingRadiusHeightRatio'));
 const selectedIndex=catalog.roots.indexOf(siteMapSelected);
 const total=nodes.length;
 const arc=total<=5 ? Math.min(settingNumber('runtime.navigation.outerRingArcMaxDegrees'),Math.max(45,(total-1)*settingNumber('runtime.navigation.outerRingArcSpacingDegrees'))) : 360;
 const direction=selectedIndex*60-90;
 const start=total<=5? direction-arc/2:-90;
 const spacing=total<=5 ? arc/Math.max(1,total-1):360/total;
 outerRing.style.setProperty('--ring-cx',cx+'px');outerRing.style.setProperty('--ring-cy',cy+'px');outerRing.style.setProperty('--ring-diameter',radius*2+'px');
 for(let i=0;i<total;i++){
  const node=nodes[i],angle=(start+i*spacing)*Math.PI/180;
  const px=Math.max(78,Math.min(innerWidth-78,cx+radius*Math.cos(angle)));
  const py=Math.max(48,Math.min(innerHeight-54,cy+radius*Math.sin(angle)));
  const item=dom('div',{class:'csn26-outer-node'});
  item.style.left=px+'px';item.style.top=py+'px';
  const link=navLink(node);link.className='csn26-outer-link';
  link.prepend(dom('span',{class:'csn26-outer-glyph','aria-hidden':'true'},'◈'));
  item.append(link);
  outerRing.append(item);
 }
 return true;
}
let pendingSearchJump=null;
const compassSymbols=['✦','◈','★','✧','▤','✉'];
function rootForCurrentRoute(){
 let active=catalog?.routes?.get(currentRoute);
 while(active?.parent&&active.depth>1)active=active.parent;
 return catalog.roots.includes(active)?active:catalog.roots[0];
}
function compassRow(node){
 const group=dom('div',{class:'compass26-subgroup'});
 const row=dom('div',{class:'compass26-linkrow'});
 const link=navLink(node);link.className='compass26-sub-link';
 link.prepend(dom('span',{class:'compass26-mini','aria-hidden':'true'},'↗'));
 row.append(link);
 group.append(row);
 return group;
}
function renderSiteMap(root){
 if(!catalog)return;
 siteMapSelected=root||null;
 siteMapCats.replaceChildren();siteMapSubtopics.replaceChildren();siteMapDetails.replaceChildren();
 catalog.roots.forEach((entry,i)=>{
  const wrapper=dom('div',{class:'compass26-choice'+(entry===siteMapSelected?' is-active':'')});
  const link=navLink(entry);link.className='compass26-choice-link';
  const fullMenuTitle=titleOf(entry);
  const shortMenuTitles={'Hírek és események':'Hírek','Információk':'Infók'};
  link.setAttribute('aria-label',fullMenuTitle);
  link.replaceChildren(dom('span',{class:'csn27-menu-full'},fullMenuTitle),dom('span',{class:'csn27-menu-short','aria-hidden':'true'},shortMenuTitles[fullMenuTitle]||fullMenuTitle));
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
  requestAnimationFrame(()=>{
   positionCompassSubmenu();
   // Keskenyebb asztali nézetben az almenü a kör alatt van: legyen rögtön látható.
   if(siteMapPanel.dataset.anchorSide==='inline')siteMapPanel.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });
 }else siteMapPanel.removeAttribute('style');
}

 
const submenuOriginalParent=siteMapPanel.parentElement;
function positionCompassSubmenu(){
 if(siteMap.hidden || !siteMapSelected){outerRing.hidden=true;return;}
 if(updateOuterRing()){siteMapPanel.hidden=true;siteMapPanel.setAttribute('aria-hidden','true');return;}
 siteMapPanel.removeAttribute('aria-hidden');siteMapPanel.hidden=false;
 // 761–1099 px között a lebegő almenü a többi főmenü fölé csúszott.
 // Ilyenkor a kör alatti, a párbeszédablakkal együtt görgethető panel biztonságos.
 if(innerWidth<settingNumber('runtime.navigation.outerRingMinWidthPx')){
  if(siteMapPanel.parentElement!==submenuOriginalParent)submenuOriginalParent.append(siteMapPanel);
  siteMap.querySelector('.site-map-dialog')?.removeAttribute('aria-owns');
  siteMapPanel.style.removeProperty('left');siteMapPanel.style.removeProperty('top');siteMapPanel.style.removeProperty('right');siteMapPanel.style.removeProperty('width');
  siteMapSubtopics.style.removeProperty('grid-template-columns');
  siteMapPanel.dataset.anchorSide=innerWidth<=settingNumber('runtime.navigation.mobileSubmenuMaxWidthPx')?'mobile':'inline';
  return;
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
 const openingFocus=document.activeElement;
 // Keresőből menüre váltáskor a rejtett keresőmező helyett az eredeti
 // látható vezérlő legyen a fókusz visszaállításának célpontja.
 const focusOrigin=!dialog.hidden&&dialog.contains(openingFocus)
  ?(previousSearchFocus?.isConnected?previousSearchFocus:document.getElementById('search-open'))
  :openingFocus;
 const cameFromMobile=mobile.contains(focusOrigin);
 if(!dialog.hidden)closeSearch(false);
 closeMobile();
 document.dispatchEvent(new Event('csanadi:main-menu-opening'));
 siteMapReturnFocus=cameFromMobile?document.getElementById('orbit-open'):focusOrigin;
 renderSiteMap(null);phoneWheel.reset();siteMap.hidden=false;relocateSiteMapButton(true);
 setMenuButtonState(true);
 document.body.classList.add('site-map-is-open');
 // A körmenü modális állapotában az alsó mobilnavigáció és az összes
 // egyéb háttérvezérlő is kikerül a fókusz- és segédtechnológiai sorrendből.
 siteMapInertNodes=[];
 for(const node of document.body.children){
  if(node===siteMap||node.tagName==='SCRIPT'||node.id==='toast'||node.inert)continue;
  node.inert=true;siteMapInertNodes.push(node);
 }
 (phoneWheel.phone()?phoneWheel.focus():siteMapCats.querySelector('.compass26-choice-link'))?.focus();
}
siteMap.addEventListener('keydown',event=>{
 if(event.key!=='Tab'||siteMap.hidden)return;
 const active=[...siteMap.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(node=>node.getClientRects().length&&node.getAttribute('aria-hidden')!=='true'&&!node.closest('[hidden]'));
 if(!active.length)return;
 const first=active[0],last=active[active.length-1];
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
function closeSiteMap(restoreFocus=true){
 if(siteMap.hidden)return;
 siteMap.hidden=true;outerRing.hidden=true;siteMap.classList.remove('csn26-ring-active');document.body.classList.remove('site-map-is-open');relocateSiteMapButton(false);
 setMenuButtonState(false);
 for(const node of siteMapInertNodes)if(node.isConnected)node.inert=false;
 siteMapInertNodes=[];
 if(restoreFocus&&siteMapReturnFocus?.isConnected&&siteMapReturnFocus.getClientRects?.().length)siteMapReturnFocus.focus({preventScroll:true});
}
function renderMenu(){
 const context={dom,navLink,titleOf,hrefOf,pageChildren,currentRoute};
 renderDesktopTree(desktop,catalog.roots,context);
 renderMobileTree(mobile,catalog.roots,context);
 phoneWheel.setCatalog(catalog.roots,{childrenOf:pageChildren,titleOf,hrefOf});
 document.getElementById('footer-page-count').textContent=`${catalog.items.length} tartalmi oldal`;
}
function closeMobile(){mobile.hidden=true;if(siteMap.hidden)setMenuButtonState(false);}
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
function getSiblings(node){if(node.depth===0)return[];return catalog.items.filter(x=>x.parent===node.parent&&x!==node).slice(0,settingNumber('runtime.display.relatedPages'));}
function contentPage(node){
  const page=node.page,route=page.schemaExtensions?.route||'';
  const fragment=document.createDocumentFragment();
  const banner=dom('section',{class:'page-banner'}),bannerInner=dom('div',{class:'container-xxl'});
  const bannerMedia=createPicture(page.schemaExtensions?.bannerMediaId,{className:'page-banner-media',eager:true,sizes:'100vw'});
  if(bannerMedia){banner.classList.add('has-photo');banner.append(bannerMedia,imageDisclaimer());}
  bannerInner.append(breadcrumb(node),dom('h1',{},page.title));
  if(page.summary?.trim())bannerInner.append(dom('p',{},page.summary));
  if(page.schemaExtensions?.verifiedContent===false){
    const note=dom('p',{class:'cs-content-review-notice',role:'note'},'Az oldal egyes intézményi adatai még ellenőrzés alatt állnak. Határidő vagy hivatalos ügyintézés előtt kérjük az aktuális intézményi tájékoztatás megerősítését.');
    bannerInner.append(note);
  }
  // Az oldalverziót egységesen a lábléc Honlapdiagnosztika panelje mutatja.
  banner.append(bannerInner);fragment.append(banner);

   
   
  const template=pageTemplateKind(route);
  const shell=dom('div',{class:'container-xxl content-shell cs-template--'+template});
  const layout=dom('div',{class:'content-layout content-no-aside'});
  const body=dom('div',{class:'content-tiles content-tiles--editorial'});
  const blocks=Array.isArray(page.blocks)?page.blocks:[];
  const article=dom('article',{class:'body-card content-tile tile-wide article-flow'+(blocks.length>=5?' article-flow--long':'')});
  const sectionTitles=new Map();
  for(const block of blocks){
    if(!block||typeof block!=='object')continue;
    if(block.type==='section'){
      const section=dom('section',{class:'article-section'});
      let usefulChildren=0;
      for(const sub of block.children||[]){const el=renderBlock(sub);if(el){section.append(el);usefulChildren++;}}
      if(usefulChildren){
        const key=String(block.title||'').trim().toLocaleLowerCase('hu-HU');
        const prior=key?sectionTitles.get(key):null;
        if(prior)prior.append(...section.childNodes);
        else{if(block.title)section.prepend(dom('h2',{},block.title));article.append(section);if(key)sectionTitles.set(key,section);}
      }
    } else {
      const el=renderBlock(block);
      if(el){const section=dom('section',{class:'article-section article-section--module'});section.append(el);article.append(section);}
    }
  }
  if(article.children.length){applyPageTemplate(article,route);body.append(article);}

  // A régi harmadik menüszint összes különálló oldala megmarad; az almenü
  // saját tartalmi csempéi vezetik tovább a látogatót, a globális menü nem.
  const details=contentChildrenOf(catalog,node).filter(item=>
    item.path!=='pages/education/library/library-services.json'&&
    item.path!=='pages/our-school/website-history.json'&&
    item.path!=='pages/information/job-openings.json'&&
    item.path!=='pages/information/privacy.json'
  );
  if(details.length){
    const related=dom('section',{class:'cs-nav-detail-tiles','aria-label':'Részletes kapcsolódó tartalmak'});
    related.append(dom('h2',{},'Részletes tartalmak'),listCards(details,{withoutNumbers:true}));
    body.append(related);
  }

  const docRoute=route.startsWith('#/informaciok/dokumentumtar');
  if(docRoute){body.prepend(renderDocumentCenter(route));body.prepend(renderDocumentFinder());body.prepend(renderDocumentIndexExport());body.prepend(renderDocumentCollections());}
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
  body.append(renderPageMedia(route));

   
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
  nav.append(dom('a',{href:'#/iskolank/felfedezo',class:'csn21-explorer-link'},'Interaktív felfedezőközpont ↗'));
  nav.append(dom('a',{href:'#/iskolank/iskolai-iranytu',class:'csn21-explorer-link'},'Iskolai iránytű ↗'));
  nav.append(dom('a',{href:'#/iskolank/iskolai-muhely',class:'csn21-explorer-link'},'Iskolai műhely · 23. kiadás ↗'));
  nav.append(dom('a',{href:'#/sport/olimpiai-orokseg-es-tudastar',class:'csn21-explorer-link'},'Olimpiai örökség és tudástár · 24. kiadás ↗'));
  nav.append(dom('a',{href:'#/oktatas/tanulas-es-kozosseg',class:'csn21-explorer-link'},'Tanulás, sport és közösség · 25. kiadás ↗'));
  const rails=dom('div',{class:'home-j-navrail-unit'});rails.append(nav);
  // A dicsőségfal a kezdőoldali hero UTÁNI első fő tartalmi szakasz.
  // A további, korábban működő modulok és a személyes sorrendezés megmaradnak.
  const visibleRoles=['students','school-news','premium-showcase'];
  canvas.replaceChildren();
  for(const role of visibleRoles){const unit=roleMap.get(role);if(unit)canvas.append(unit);if(role==='premium-showcase')canvas.append(rails);}
  const foldGroups=[
    {title:'Napi központ és interaktív információk',sub:'A napi központ részletes elemei egy kattintással',roles:['daily-hub']},
    {title:'Sporteredmények és statisztikák',sub:'Részletes sporttartalmak és adatok',roles:['sports-story','statistics']},
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
    summary.append(dom('span',{class:'home-j-fold-symbol','aria-hidden':'true'},'✦'),title);
    const grid=dom('div',{class:'home-j-fold-grid'});
    for(const child of children)grid.append(child);
    fold.append(summary,grid);
    if(info.roles.includes('daily-hub'))canvas.insertBefore(fold,canvas.querySelector('.home-unit--school-news'));
    else canvas.append(fold);
  }
   
  for(const unit of units)if(!canvas.contains(unit))canvas.append(unit);
  enhanceHomeInterests(canvas);
  enhancePersonalizedHome(canvas);
  enhanceInlineHomeEditor(canvas);
  enhanceRound29Home(canvas);
  // Az oldalverzió a betöltési diagnosztikában jelenik meg, nem a tartalomkártyák alatt.
  frag.append(canvas);
  return frag;
}
function errorPage(){const section=dom('section',{class:'not-found container-xxl'});section.append(dom('h1',{},'404'),dom('h2',{class:'section-title'},'Ez az oldal nem érhető el'),dom('p',{},'Az útvonal nem szerepel az ellenőrzött menüben, vagy a hozzá tartozó JSON hibás.'),dom('a',{class:'btn-gold',href:'#/'},'Vissza a kezdőoldalra'));return section;}
function pageForRoute(route){return catalog.routes.get(route)||null;}
const arrivalPrefix='#/megkozelites-es-tanulas';
function arrivalSection(route){
 if(route===arrivalPrefix)return '';
 const section=route.startsWith(arrivalPrefix+'/')?route.slice(arrivalPrefix.length+1):null;
 return section!==null&&/^[a-z0-9-]+$/.test(section)?section:null;
}
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
  const requested=getRoute();
  if(arrivalSection(requested)!==null){
    const destination='#/megkozelites-es-erkezes';
    history.replaceState(history.state,'',location.pathname+location.search+destination);
    renderRoute(options);
    return;
  }
   document.body.classList.remove('cs-embedded-arrival');
  const route=getRoute();const node=pageForRoute(route);
  if(node && !node._fullLoaded){
    syncRound29HomeNavigation(false);
    if(!node._pagePromise){
      node._pagePromise=loadJSON(node.path).then(page=>{
        if(page?.id!==node.page?.id || page?.schemaExtensions?.route!==route || !Array.isArray(page.blocks) || page.lifecycle?.status!=='published')throw Error('Eltérő vagy nem publikált oldaladat');
        node.page=page;node._fullLoaded=true;
      }).finally(()=>{node._pagePromise=null;});
    }
    app.replaceChildren(dom('div',{class:'cs-page-loading container-xxl','role':'status','aria-live':'polite'},'A kiválasztott oldal betöltése…'));
    node._pagePromise.then(()=>{if(getRoute()===route)renderRoute(options);}).catch(error=>{
      console.error('Oldalbetöltési hiba:',error);
      if(getRoute()===route){
        const failure=dom('div',{class:'cs-page-load-error container-xxl',role:'alert'},'Az oldal tartalma átmenetileg nem érhető el.');
        const retry=dom('button',{type:'button',class:'btn-gold'},'Újrapróbálkozás');
        retry.addEventListener('click',()=>renderRoute(options));failure.append(retry);
        app.replaceChildren(failure);markRouteError(route);
      }
    });
    return;
  }
  if(currentRoute!==null && currentRoute!==route)historyScroll.set(currentRoute,window.scrollY);
  const isNew=currentRoute!==route;
  currentRoute=route;
  document.documentElement.dataset.csanadiPageRevision=Number.isSafeInteger(node?.page?.lifecycle?.revision)?String(node.page.lifecycle.revision):'—';
  if(isNew)lastRawPage=node?JSON.stringify(node.page):null;
  const kind=route==='#/'?'home':route.startsWith('#/sport')?'sport':route.startsWith('#/oktatas')?'education':route.startsWith('#/hirek-es-esemenyek')?'news':route.startsWith('#/iskolank')?'school':'general';
 // Az élő JSON-frissítésben előrébb beszúrt szakasz sem viheti el az olvasási helyet.
 const oldHeadings=options.keepScroll&&!isNew?[...app.querySelectorAll('.content-tiles h2')]:[];
 const normalizeHeading=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLocaleLowerCase('hu-HU');
 const headingKey=heading=>normalizeHeading(heading.textContent);
 const headingContext=heading=>{
  const section=heading.closest('.article-section,.content-tile,section,article');
  const firstText=[...(section?.querySelectorAll('p,li')||[])].slice(0,3).map(node=>node.textContent).join(' ');
  return normalizeHeading(firstText).slice(0,300);
 };
 const reading=options.keepScroll&&!isNew?(()=>{
  const seen=new Map();let last=null;
  for(const [index,heading] of oldHeadings.entries()){
   const key=headingKey(heading),occurrence=(seen.get(key)||0)+1;seen.set(key,occurrence);
   const top=heading.getBoundingClientRect().top;
   if(top<=180)last={id:heading.id||'',key,context:headingContext(heading),occurrence,index,top};
  }
  return last;
 })():null;
 const expandedDetails=options.keepScroll&&!isNew?(()=>{
  const seen=new Map();
  return [...app.querySelectorAll('details')].map((details,index)=>{
   const summary=details.querySelector('summary')?.textContent.trim();
   const occurrence=(seen.get(summary)||0)+1;seen.set(summary,occurrence);
   return details.open?{id:details.id,index,summary,occurrence}:null;
  }).filter(Boolean);
 })():[];
 const activeControl=options.keepScroll&&!isNew&&app.contains(document.activeElement)?document.activeElement:null;
 const restoreFocusId=activeControl?.id||null;
  app.dataset.pageKind=kind;
  syncRound29HomeNavigation(kind==='home');
  document.body.classList.toggle('cs-inner-page',kind!=='home');
  releaseSpaFeatureStyles();
  app.replaceChildren(node?(isSpaFeature(node.page)?featurePlaceholder(node.page):node.depth===0?homePage(node):contentPage(node)):errorPage());
  if(node&&isSpaFeature(node.page))void activateSpaFeature(app.firstElementChild,node.page);
  if(expandedDetails.length){
   const nextDetails=[...app.querySelectorAll('details')];
   const nextById=new Map(),nextBySummary=new Map();
   for(const item of nextDetails){
    if(item.id){if(!nextById.has(item.id))nextById.set(item.id,[]);nextById.get(item.id).push(item);}
    const summary=item.querySelector('summary')?.textContent.trim();
    if(!nextBySummary.has(summary))nextBySummary.set(summary,[]);
    nextBySummary.get(summary).push(item);
   }
   for(const saved of expandedDetails){
    const matchingIds=nextById.get(saved.id)||[];
    const match=(matchingIds.length===1?matchingIds[0]:null)||(nextBySummary.get(saved.summary)||[])[saved.occurrence-1];
    if(match)match.open=true;
   }
  }
  syncRouteHero(node,kind);
  syncHeaderSelfLinks();
  wireReveal();
  enhanceGallery(app);
  enhanceNext10Route(node,app);
  if(kind!=='home')syncMobileSubpageSections(app);
  if(reading){
   const fresh=[...app.querySelectorAll('.content-tiles h2')];
   const same=fresh.filter(heading=>headingKey(heading)===reading.key);
   const contextual=same.filter(heading=>headingContext(heading)===reading.context);
   const identified=reading.id?same.find(heading=>heading.id===reading.id):null;
   const after=identified||(reading.context&&contextual.length===1?contextual[0]:null)||same[reading.occurrence-1]||fresh[reading.index];
   if(after){const beforeY=window.scrollY;requestAnimationFrame(()=>{
     if(currentRoute!==route||!after.isConnected||Math.abs(window.scrollY-beforeY)>40)return;
     const delta=after.getBoundingClientRect().top-reading.top;
     if(Math.abs(delta)>1)window.scrollBy(0,delta);
   });}
  }
  if(restoreFocusId){
   const replacement=document.getElementById(restoreFocusId);
   if(replacement&&app.contains(replacement))replacement.focus({preventScroll:true});
  }
  updatePageMeta(node?.page||{title:'Az oldal nem található',summary:'A keresett oldal nem érhető el. Használd a honlap navigációját vagy keresőjét.'},route);
  if(isNew&&routeStatus)routeStatus.textContent=(node?.page?.title||'Az oldal nem található')+' – az oldal betöltődött.';
  const headerMotion=headerMotionForRoute(route,node,catalog?.config?.runtime?.subpageHeaderMotion);
  document.dispatchEvent(new CustomEvent('csanadi:route-rendered',{detail:{route,headerMotion}}));
  if(pendingSearchJump && pendingSearchJump.route===route)setTimeout(trySearchJump,settingNumber('runtime.timing.searchJumpDelayMs'));
  renderMenu();closeMobile();closeSiteMap(false);
 const target=options.keepScroll?window.scrollY:(options.restoreScroll?(historyScroll.get(route)||0):0);
  if(isNew)requestAnimationFrame(()=>window.scrollTo({top:target,behavior:'instant'}));
  if(options.focus)app.focus({preventScroll:true});
  markRouteRendered(route,{found:!!node});
}
function closeSearch(restoreFocus=true){
 if(dialog.hidden)return;
 if(!dialog.hidden&&smartSearch){searchRouteStates.set(searchOpenRoute||getRoute(),smartSearch.snapshot());if(searchRouteStates.size>40)searchRouteStates.delete(searchRouteStates.keys().next().value);}
 searchOpenRoute=null;
 dialog.hidden=true;document.body.style.overflow=searchPreviousOverflow;
 for(const node of searchInertNodes)if(node.isConnected)node.inert=false;
 searchInertNodes=[];
 smartSearch?.reset();if(restoreFocus&&previousSearchFocus?.isConnected&&previousSearchFocus.getClientRects?.().length)previousSearchFocus.focus({preventScroll:true});
}
 
function markSearchTarget(element){
 if(!element)return;
 for(let d=element.closest('details');d;d=d.parentElement?.closest('details'))d.open=true;
 const target=element.closest('.dfg-news-card,.cs-news-card,.hub26-event-card,.media26-tile,.media26-video-card,.doc-card,.feature-card,.student-success-card,.body-card')||element;
 target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center',inline:'nearest'});
 target.classList.add('cs-search-found');target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
 setTimeout(()=>target.classList.remove('cs-search-found'),settingNumber('search.highlightDurationMs'));
}
function searchTargetMatch(root,entry,phrase){
 const normalize=s=>norm(s).replace(/\s+/g,' ').trim();
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
 if(++state.attempts<settingNumber('search.jumpMaxAttempts')){setTimeout(trySearchJump,settingNumber('search.jumpRetryMs'));return;}
 pendingSearchJump=null;
 markSearchTarget(searchTargetMatch(root,state.entry,state.query));
}
function handleSearchNavigation(entry,query,event){
 if(entry.external || !entry.href?.startsWith('#/')){closeSearch();return;}
 event.preventDefault();
 const route=safeRoute(entry.href);
 pendingSearchJump={entry,query,route,filtered:false,attempts:0};
 closeSearch();
 if(getRoute()===route){setTimeout(trySearchJump,settingNumber('runtime.timing.searchJumpDelayMs'));}
 else location.hash=route;
}

function openSearch(){
  if(!dialog.hidden){searchInput.focus();return;}
  const source=document.activeElement;
  const focusOrigin=!siteMap.hidden&&siteMap.contains(source)
   ?(siteMapReturnFocus?.isConnected?siteMapReturnFocus:document.getElementById('search-open'))
   :source;
  if(!siteMap.hidden)closeSiteMap(false);
  closeMobile();
  document.dispatchEvent(new Event('csanadi:main-menu-opening'));
  previousSearchFocus=focusOrigin?.getClientRects?.().length?focusOrigin:document.getElementById('search-open');
  searchOpenRoute=getRoute();
  searchPreviousOverflow=document.body.style.overflow;
  dialog.hidden=false;document.body.style.overflow='hidden';
  searchInertNodes=[];
  for(const node of document.body.children){
   if(node===dialog||node.tagName==='SCRIPT'||node.inert)continue;
   node.inert=true;searchInertNodes.push(node);
  }
  searchInput.focus({preventScroll:true});
  const route=getRoute(),saved=searchRouteStates.get(route);
  if(saved){searchRouteStates.delete(route);searchRouteStates.set(route,saved);smartSearch?.restore(saved);}else smartSearch?.render();
  setTimeout(()=>{if(!dialog.hidden)searchInput.focus();},settingNumber('runtime.timing.searchFocusDelayMs'));
}
const THEME_MODES=['system','light','dark'];
const THEME_LABELS={system:'Automatikus',light:'Világos',dark:'Sötét'};
const THEME_ICONS={
  system:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  dark:'<path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3Z"/>'
};
function storedTheme(fallback='system'){try{const v=localStorage.getItem('csanadi-theme');return v===null?'system':THEME_MODES.includes(v)?v:fallback;}catch{return fallback;}}
let themeMode=storedTheme();
const mq=window.matchMedia('(prefers-color-scheme: dark)');
function syncEmbeddedTheme(){
 const embedded=app.querySelector('.cs-arrival-frame');
 if(embedded?.isConnected&&embedded.contentWindow){
  try{embedded.contentWindow.postMessage({source:'csanadi-theme-sync',preference:themeMode},location.origin);}catch{}
 }
}
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
  syncEmbeddedTheme();
}
function changeTheme(){
  themeMode=THEME_MODES[(THEME_MODES.indexOf(themeMode)+1)%3];
  try{localStorage.setItem('csanadi-theme',themeMode);}catch{}
  applyTheme();notify('Megjelenés: '+THEME_LABELS[themeMode],{themePreference:themeMode});
}
function wireEvents(){
 document.addEventListener('csanadi:section-menu-opening',()=>{closeMobile();closeSiteMap(false);});
  window.addEventListener('popstate',()=>{navigatingHistory=true;});
  window.addEventListener('hashchange',()=>{
    if(!dialog.hidden)closeSearch(false);
    const restoreScroll=navigatingHistory;navigatingHistory=false;
    markNavigationStart(getRoute());renderRoute({focus:true,restoreScroll});
  });
  const toggleSiteMap=()=>{if(siteMap.hidden)openSiteMap();else closeSiteMap();};
  document.getElementById('orbit-open').addEventListener('click',toggleSiteMap);
  // Az aloldali fejléc önállóan is nyithassa a menüt, akkor is, ha a
  // kezdőlapi, képes menüindító átmenetileg nincs jelen.
  document.addEventListener('csanadi:menu-toggle',toggleSiteMap);
  window.addEventListener('resize',()=>{if(!siteMap.hidden)requestAnimationFrame(positionCompassSubmenu);});
  window.addEventListener('resize',()=>{if(window.innerWidth>768&&!mobile.hidden){const focusWasMobile=mobile.contains(document.activeElement);closeMobile();if(focusWasMobile)document.getElementById('orbit-open')?.focus({preventScroll:true});}});
  document.getElementById('site-map-close').addEventListener('click',()=>closeSiteMap());
  siteMap.addEventListener('click',e=>{if(e.target.closest('[data-site-map-dismiss]'))closeSiteMap();if(e.target.closest('a[href]'))closeSiteMap(false);});
  document.getElementById('search-open').addEventListener('click',openSearch);
  document.getElementById('search-close').addEventListener('click',closeSearch);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeSearch()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)closeSearch();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}
    if(e.key==='Escape'&&!siteMap.hidden){if(!phoneWheel.back())closeSiteMap();}
    if(e.key==='Escape'&&!mobile.hidden){closeMobile();menuBtn.focus();}
    if(!dialog.hidden&&e.key==='Tab'){
      const focusables=Array.from(dialog.querySelectorAll('button,input,a[href]')).filter(x=>x.offsetParent!==null);
      if(focusables.length){const first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    }
  });
  menuBtn.addEventListener('click',()=>{if(!siteMap.hidden)closeSiteMap();else openSiteMap();});
  document.getElementById('theme-toggle').addEventListener('click',changeTheme);
  const systemChanged=()=>{if(themeMode==='system')applyTheme();};
  if(mq.addEventListener)mq.addEventListener('change',systemChanged);
  else mq.addListener?.(systemChanged);
  // A másik lapon választott megjelenés és a beállítás törlése is követhető.
  window.addEventListener('storage',event=>{if(event.key==='csanadi-theme'||event.key===null){const next=event.key==='csanadi-theme'&&event.newValue===null?'system':storedTheme(themeMode);if(next!==themeMode){themeMode=next;applyTheme();}}});
  window.addEventListener('message',event=>{
   if(event.origin!==location.origin||event.source!==app.querySelector('.cs-arrival-frame')?.contentWindow||event.data?.source!=='csanadi-theme-select')return;
   const mode=event.data.preference;
   if(!THEME_MODES.includes(mode)||mode===themeMode)return;
   themeMode=mode;try{localStorage.setItem('csanadi-theme',mode);}catch{}
   applyTheme();
  });
  // Telefonon az OS témája a háttérben változhat; a visszatéréskor újra feloldjuk.
  const recheckTheme=()=>{const next=storedTheme(themeMode);if(next!==themeMode)themeMode=next;applyTheme();};
  window.addEventListener('pageshow',recheckTheme);
  window.addEventListener('focus',recheckTheme);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)recheckTheme();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)recheckTheme();});
  applyTheme();
}
async function checkStructure(){
  if(structureChecking)return structureChecking;
  structureChecking=(async()=>{
    try{
      const value=JSON.stringify(await loadJSON('structure.json',{fresh:true}));
      if(lastRawStructure&&value!==lastRawStructure){
        const next=await buildCatalog();
        if(!next.items.length)throw Error('Az új menü nem tartalmaz érvényes oldalt');
        catalog=next;useSiteSettings(next.config);await smartSearch?.rebuild(catalog);
        renderRoute({keepScroll:true});
        notify('A menürendszer újratöltve.');
      }
      lastRawStructure=value;
    }catch(e){console.warn('Ideiglenes struktúrafrissítési hiba, korábbi állapot megtartva:',e);}
  })().finally(()=>{structureChecking=null;});
  return structureChecking;
}
async function checkActivePage(){
  if(activePageChecking)return activePageChecking;
  const route=getRoute(),item=catalog?.routes?.get(route);if(!item)return;
  activePageChecking=(async()=>{
    try{
      const latest=await loadJSON(item.path,{fresh:true}),raw=JSON.stringify(latest);
      if(getRoute()!==route||catalog?.routes?.get(route)!==item)return;
      if(latest?.id!==item.page.id||latest.schemaExtensions?.route!==route||latest.lifecycle?.status!=='published'||!Array.isArray(latest.blocks)){
        console.warn('Az aktív oldal érvénytelen frissítését kihagytuk:',item.path);return;
      }
      if(lastRawPage!==null&&raw!==lastRawPage){
        item.page=latest;item._fullLoaded=true;
        smartSearch?.rebuild(catalog).catch(error=>console.warn('A keresőindex újraépítése ideiglenesen nem sikerült:',error));
        renderRoute({keepScroll:true});
        notify('A megnyitott oldal frissült.');
      }
      lastRawPage=raw;
    }catch(e){console.warn('Az aktív oldal ideiglenesen nem frissíthető:',e);}
  })().finally(()=>{activePageChecking=null;});
  return activePageChecking;
}
function beginPolling(){
  const seconds=Math.min(settingNumber('refresh.maximumSeconds'),Math.max(settingNumber('refresh.minimumSeconds'),settingNumber('refresh.structureSeconds')));
  const pageSeconds=Math.min(settingNumber('refresh.maximumSeconds'),Math.max(settingNumber('refresh.minimumSeconds'),settingNumber('refresh.activePageSeconds')));
  setInterval(()=>{if(!document.hidden)checkStructure();},seconds*1000);
  setInterval(()=>{if(!document.hidden)checkActivePage();},pageSeconds*1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){checkStructure();checkActivePage();}});
}
export async function startApp(){
  initPerformanceDiagnostics();
  initRound29Diagnostics();
  initDetailedDiagnostics();
  initNext10();
  initRound10Enhancements();
  markNavigationStart(getRoute(),{initial:true});
  wireEvents();
  if(location.protocol==='file:')throw new Error('A JSON-alapú weboldal HTTP/HTTPS kiszolgálást igényel, például helyi localhost szervert vagy az iskola webtárhelyét.');
  registerMedia(await loadJSON('media-library.json'));
  catalog=await buildCatalog();
  useSiteSettings(catalog.config);
  installLanguageHighlights().catch(error=>console.warn('A kétnyelvű tájékoztatók nem tölthetők be:',error));
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
    if(carousel){homeHeroElement=carousel;sharedHero.replaceChildren(carousel);}
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
