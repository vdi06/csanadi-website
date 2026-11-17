/* R29: a jóváhagyott kezdőlap kiegészítése, a korábbi blokkok megtartásával. */
const sections=[
 ['featured','Kiemelt sportos tartalom'],['shortcuts','Gyorselérések'],
 ['daily','Napi központ'],['school-news','Iskolai hírek'],
 ['sport-news','Sporthírek'],['statistics','Sporteredmények és statisztikák'],
 ['gallery','Sport és iskolai élet – képekben'],['discover','Fedezd fel az iskolát'],
 ['approach','Iskola megközelítése']
];
const create=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n;};
let drawer,trigger,lastFocus;
let activeObserver;
let mobileBar,mobileSheet,mobileBackdrop,mobileList,mobileCurrent,mobilePrevious,mobileNext;
let mobileTargets=[],mobileIndex=0,mobileLastFocus=null,mobileOldOverflow='';
let mobilePageKind='home';
let mobileSubpageRoot=null,mobileSubpageObserver=null,mobileSubpageMutation=null,mobileEligibilityFrame=0;
let mobileEmbeddedSignature='',mobileEmbeddedAnchors=new Map(),mobileEmbeddedFrame=null,mobileEmbeddedEntries=[];
let mobileAnnouncement=null,foldAnchor=null,foldSequence=0;
let mobileJumpSequence=0;
const mobileMode=()=>window.matchMedia('(max-width:768px)').matches;
const motion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
const viewportHeight=()=>{const value=window.visualViewport?.height;return Number.isFinite(value)&&value>0?value:window.innerHeight;};
const keyboardCoversContent=()=>{
 // Az inputfókusz mellett a szerkeszthető elemek és a beágyazott űrlap is számít.
 const editing=document.activeElement?.matches?.('input,textarea,select,[contenteditable],iframe');
 return !!editing&&Number.isFinite(window.visualViewport?.height)&&window.innerHeight-window.visualViewport.height>140;
};
function sectionHeaderOffset(){
 const header=document.getElementById('site-header');
 const box=header?.getBoundingClientRect();
 // A fejléccel együtt ténylegesen látható, tapadó területet vonjuk le.
 const viewportTop=Math.max(0,window.visualViewport?.offsetTop||0);
 return box&&box.bottom>viewportTop&&box.top<viewportTop+12?Math.min(box.bottom-viewportTop,Math.max(box.height,0)):0;
}
function scrollToSection(target){
 if(!target||target.isConnected===false)return;
 if(target.closest?.('[hidden]')||target.getClientRects?.().length===0)return;
 const margin=Math.max(0,Number.parseFloat(window.getComputedStyle?.(target)?.scrollMarginTop)||0);
 const top=Math.max(0,window.scrollY+target.getBoundingClientRect().top-Math.max(sectionHeaderOffset()+12,margin));
 // Későn megnyíló szakasz esetén sem kérünk a dokumentum végén túli pozíciót.
 const scrollHeight=document.scrollingElement?.scrollHeight;
 const visualHeight=window.visualViewport?.height;
 const viewHeight=Number.isFinite(visualHeight)&&visualHeight>0?visualHeight:(window.innerHeight||0);
 const maximum=Number.isFinite(scrollHeight)?Math.max(0,scrollHeight-viewHeight):null;
 window.scrollTo({top:maximum===null?top:Math.min(top,maximum),behavior:motion()});
}
function getCards(canvas){
 const folds=[...canvas.querySelectorAll(':scope > .home-j-fold')];
 const byTitle=part=>folds.find(fold=>fold.querySelector('summary strong')?.textContent.includes(part));
 const map={featured:canvas.querySelector('.home-unit--premium-showcase'),shortcuts:canvas.querySelector('.home-j-navrail-unit'),daily:byTitle('Napi központ'),
 'school-news':canvas.querySelector('.home-unit--school-news'),'sport-news':canvas.querySelector('.home-unit--sports-news'),
 statistics:byTitle('Sporteredmények'),gallery:byTitle('képekben'),discover:byTitle('Fedezd fel'),approach:canvas.querySelector('.cs29-approach')};
 return map;
}
function mountNavigator(){
 if(trigger)return;
 trigger=create('button','cs29-nav-trigger','☷');trigger.type='button';trigger.title='Kezdőoldali szakasznavigátor';trigger.setAttribute('aria-label','Kezdőoldali szakasznavigátor megnyitása');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','cs29-section-drawer');
 drawer=create('aside','cs29-nav-drawer');drawer.id='cs29-section-drawer';drawer.hidden=true;drawer.setAttribute('role','dialog');drawer.setAttribute('aria-modal','true');drawer.setAttribute('aria-label','Kezdőoldali szakaszok');
 const header=create('div','cs29-drawer-header');const heading=create('h2','', 'Ugrás a kezdőoldalon');const close=create('button','cs29-nav-close','×');close.type='button';close.setAttribute('aria-label','Szakasznavigátor bezárása');close.addEventListener('click',()=>toggle(false));header.append(heading,close);
 drawer.append(header,create('nav','cs29-nav-items'));
 drawer.querySelector('nav').addEventListener('keydown',event=>{
  if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  const entries=[...drawer.querySelectorAll('.cs29-nav-item:not(:disabled)')],at=entries.indexOf(document.activeElement);
  if(at<0||!entries.length)return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?entries.length-1:event.key==='ArrowDown'?(at+1)%entries.length:(at+entries.length-1)%entries.length;
  entries[next].focus({preventScroll:true});
 });
 document.body.append(trigger,drawer);
 trigger.addEventListener('click',()=>toggle(drawer.hidden));
 document.addEventListener('keydown',event=>{if(drawer.hidden)return;if(event.key==='Escape'){event.preventDefault();toggle(false);}else if(event.key==='Tab'){const items=[...drawer.querySelectorAll('button:not(:disabled),a[href]')];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
 document.addEventListener('pointerdown',event=>{if(!drawer.hidden&&!drawer.contains(event.target)&&!trigger.contains(event.target))toggle(false,false);});
}
function toggle(open,restoreFocus=true){
 if(!drawer)return;
 drawer.hidden=!open;trigger.setAttribute('aria-expanded',String(open));trigger.setAttribute('aria-label',open?'Kezdőoldali szakasznavigátor bezárása':'Kezdőoldali szakasznavigátor megnyitása');
 if(open){lastFocus=document.activeElement;drawer.querySelector('button')?.focus({preventScroll:true});}else if(restoreFocus&&lastFocus?.isConnected&&lastFocus.getClientRects?.().length)lastFocus.focus({preventScroll:true});
}
function closeMobileSheet(restoreFocus=true){
 if(!mobileSheet||mobileSheet.hidden)return;
 mobileSheet.hidden=true;mobileBackdrop.hidden=true;
 document.body.style.overflow=mobileOldOverflow;
 mobileBar.querySelector('[data-action="sections"]')?.setAttribute('aria-expanded','false');
 if(restoreFocus){
  const preferred=mobileLastFocus?.isConnected&&mobileLastFocus.getClientRects?.().length?mobileLastFocus:null;
  const fallback=mobileBar.querySelector('[data-action="sections"]');
  (preferred||(!mobileBar.hidden&&fallback?.getClientRects?.().length?fallback:null))?.focus({preventScroll:true});
 }
}
function openMobileSheet(){
 if(!mobileMode()||!mobileSheet||mobileBar.hidden||!mobileSheet.hidden)return;
 if(drawer&&!drawer.hidden)toggle(false);
 // A főmenü és a szakaszlista nem lehet egyszerre nyitva.
 document.dispatchEvent(new Event('csanadi:section-menu-opening'));
 mobileLastFocus=document.activeElement;mobileOldOverflow=document.body.style.overflow;
 mobileBackdrop.hidden=false;mobileSheet.hidden=false;document.body.style.overflow='hidden';
 mobileBar.querySelector('[data-action="sections"]')?.setAttribute('aria-expanded','true');
 const focusTarget=mobileList.querySelector('[aria-current="location"]')||mobileSheet.querySelector('button');focusTarget?.focus({preventScroll:true});
}
function updateMobilePosition(){
 if(!mobileBar||mobileBar.hidden||!mobileTargets.length)return;
 document.documentElement.style.setProperty('--cs-visible-header-px',Math.round(sectionHeaderOffset())+'px');
 const threshold=Math.max(sectionHeaderOffset()+24,Math.min(viewportHeight()*.36,340));
 let active=0;
 mobileTargets.forEach((entry,index)=>{if(entry.target.isConnected&&entry.target.getClientRects().length&&!entry.target.hidden&&entry.target.getBoundingClientRect().top<=threshold)active=index;});
 mobileIndex=active;
 mobileCurrent.textContent=mobileTargets[active]?.label||(mobilePageKind==='home'?'Kezdőlap':'Az oldal eleje');
 mobileCurrent.title=mobileCurrent.textContent;
 mobilePrevious.disabled=active===0;mobileNext.disabled=active===mobileTargets.length-1;
 mobilePrevious.setAttribute('aria-label',active===0?'Nincs előző szakasz':`Előző szakasz: ${mobileTargets[active-1].label}`);
 mobileNext.setAttribute('aria-label',active===mobileTargets.length-1?'Nincs következő szakasz':`Következő szakasz: ${mobileTargets[active+1].label}`);
 for(const b of mobileList.querySelectorAll('[data-mobile-index]')){
  if(Number(b.dataset.mobileIndex)===active)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');
 }
}
function jumpMobile(index){
 const item=mobileTargets[index];if(!item)return;
 const jump=++mobileJumpSequence;
 const wasSheetOpen=Boolean(mobileSheet&&!mobileSheet.hidden);
 closeMobileSheet(false);
 for(let parent=item.target;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
 // A details-ősök nyitása után a célpont valódi pozíciója újraszámolódhat.
 requestAnimationFrame(()=>requestAnimationFrame(()=>{if(jump===mobileJumpSequence)scrollToSection(item.target);}));
 // A szakaszlistából választva a billentyűzetes fókusz se maradjon a rejtett panelen.
 if(wasSheetOpen){
  const hadTabIndex=item.target.hasAttribute('tabindex');
  if(!hadTabIndex)item.target.tabIndex=-1;
  item.target.focus({preventScroll:true});
  if(!hadTabIndex)item.target.addEventListener('blur',()=>item.target.removeAttribute('tabindex'),{once:true});
 }
 mobileIndex=index;mobileCurrent.textContent=item.label;
 mobileCurrent.title=item.label;
 if(mobileAnnouncement)mobileAnnouncement.textContent=`Aktuális szakasz: ${index+1}/${mobileTargets.length}. ${item.label}`;
 // A sima görgetés animációja közben is jelezzük rögtön a kiválasztott szakaszt.
 for(const button of mobileList.querySelectorAll('[data-mobile-index]')){
  if(Number(button.dataset.mobileIndex)===index)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');
 }
 if(motion()==='instant')updateMobilePosition();
}
function mountMobileNavigator(){
 if(mobileBar)return;
 mobileBar=create('nav','cs32-mobile-bar');mobileBar.setAttribute('aria-label','Oldalszakaszok navigációja');mobileBar.hidden=true;
 const actions=[['top','⌂','Eleje'],['previous','↑','Előző'],['next','↓','Következő'],['sections','☷','Szakaszok']];
 for(const [id,glyph,label] of actions){
  const b=create('button','cs32-mobile-action');b.type='button';b.dataset.action=id;
  b.append(create('span','cs32-mobile-glyph',glyph),create('span','cs32-mobile-label',label));b.setAttribute('aria-label',label);
  if(id==='sections'){b.setAttribute('aria-controls','cs32-mobile-sheet');b.setAttribute('aria-expanded','false');}
  b.addEventListener('click',()=>{
   if(id==='top'){closeMobileSheet(false);window.scrollTo({top:0,behavior:motion()});}
   if(id==='previous')jumpMobile(Math.max(0,mobileIndex-1));
   if(id==='next')jumpMobile(Math.min(mobileTargets.length-1,mobileIndex+1));
   if(id==='sections')openMobileSheet();
  });mobileBar.append(b);
 }
 mobilePrevious=mobileBar.querySelector('[data-action="previous"]');mobileNext=mobileBar.querySelector('[data-action="next"]');
 mobileCurrent=create('span','cs32-mobile-current','Kezdőlap');mobileCurrent.setAttribute('aria-live','off');
 mobileBar.append(mobileCurrent);
 mobileAnnouncement=create('span','visually-hidden');mobileAnnouncement.setAttribute('role','status');mobileAnnouncement.setAttribute('aria-live','polite');mobileBar.append(mobileAnnouncement);
 mobileBackdrop=create('button','cs32-mobile-backdrop');mobileBackdrop.type='button';mobileBackdrop.hidden=true;mobileBackdrop.setAttribute('aria-label','Szakaszlista bezárása');mobileBackdrop.addEventListener('click',()=>closeMobileSheet());
 mobileSheet=create('aside','cs32-mobile-sheet');mobileSheet.hidden=true;mobileSheet.id='cs32-mobile-sheet';mobileSheet.setAttribute('role','dialog');mobileSheet.setAttribute('aria-modal','true');mobileSheet.setAttribute('aria-labelledby','cs32-mobile-sheet-title');
 const head=create('div','cs32-mobile-sheet-head');const sheetHeading=create('h2','','Ugrás az oldal szakaszaihoz');sheetHeading.id='cs32-mobile-sheet-title';head.append(sheetHeading);
 const close=create('button','cs32-mobile-close','×');close.type='button';close.setAttribute('aria-label','Szakaszlista bezárása');close.addEventListener('click',()=>closeMobileSheet());head.append(close);
 mobileList=create('div','cs32-mobile-list');mobileSheet.append(head,mobileList);
 mobileList.addEventListener('keydown',event=>{
  if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  const items=[...mobileList.querySelectorAll('button:not(:disabled)')];
  const active=items.indexOf(document.activeElement);if(!items.length||active<0)return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?items.length-1:event.key==='ArrowDown'?(active+1)%items.length:(active+items.length-1)%items.length;
  items[next].focus({preventScroll:true});
 });
 document.body.append(mobileBackdrop,mobileSheet,mobileBar);
 document.addEventListener('keydown',event=>{
  if(!mobileSheet||mobileSheet.hidden)return;
  if(event.key==='Escape'){event.preventDefault();closeMobileSheet();}
  if(event.key==='Tab'){
   const items=[...mobileSheet.querySelectorAll('button:not(:disabled)')];const first=items[0],last=items.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 document.addEventListener('click',event=>{
  if(event.target.closest?.('#mobile-menu-toggle,#orbit-open'))closeMobileSheet(false);
 });
 document.addEventListener('csanadi:main-menu-opening',()=>closeMobileSheet(false));
 let pending=false;
 window.addEventListener('scroll',()=>{if(pending||!mobileMode()||mobileBar.hidden)return;pending=true;requestAnimationFrame(()=>{pending=false;updateMobilePosition();});},{passive:true});
 const recalculate=()=>{if(mobileMode()&&drawer&&!drawer.hidden)toggle(false);if(!mobileMode())closeMobileSheet(true);scheduleMobileEligibility();updateMobilePosition();};
 let recalcFrame=0;
 const scheduleRecalculate=()=>{if(recalcFrame)return;recalcFrame=requestAnimationFrame(()=>{recalcFrame=0;recalculate();});};
 window.addEventListener('resize',scheduleRecalculate);
 window.addEventListener('orientationchange',scheduleRecalculate);
 window.visualViewport?.addEventListener?.('resize',scheduleRecalculate);
 window.visualViewport?.addEventListener?.('scroll',scheduleRecalculate,{passive:true});
 document.addEventListener('focusin',scheduleRecalculate);
 document.addEventListener('focusout',scheduleRecalculate);
 document.fonts?.ready?.then(scheduleRecalculate).catch(()=>{});
 const stickyHeader=document.getElementById('site-header');
 if(stickyHeader&&'ResizeObserver' in window)new ResizeObserver(scheduleRecalculate).observe(stickyHeader);
 // A részletek nyitása/zárása ne ugorja el a felhasználó által olvasott helyet.
 const rememberFold=event=>{
  if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
  ++foldSequence;
  const summary=event.target.closest?.('#app details > summary');
  foldAnchor=summary?{summary,top:summary.getBoundingClientRect().top,scrollY:window.scrollY,at:performance.now()}:null;
 };
 document.addEventListener('pointerdown',rememberFold,true);
 document.addEventListener('keydown',rememberFold,true);
 document.addEventListener('toggle',event=>{
  if(!foldAnchor||event.target!==foldAnchor.summary.parentElement)return;
  const {summary,top,scrollY,at}=foldAnchor;foldAnchor=null;
  if(performance.now()-at>1200)return;
  const sequence=foldSequence;
  requestAnimationFrame(()=>{if(sequence===foldSequence&&summary.isConnected&&Math.abs(window.scrollY-scrollY)<80){const delta=summary.getBoundingClientRect().top-top;if(Math.abs(delta)>1)window.scrollBy(0,delta);}});
 },true);
 document.addEventListener('csanadi:route-rendered',()=>{foldAnchor=null;++foldSequence;++mobileJumpSequence;});
}
function setMobileTargets(entries,kind){
 ++mobileJumpSequence;
 const hadSheetOpen=Boolean(mobileSheet&&!mobileSheet.hidden),focusedId=hadSheetOpen?mobileTargets[Number(document.activeElement?.dataset?.mobileIndex)]?.id:null;
 const previousSheetPosition=mobileList?.scrollTop||0;
 closeMobileSheet(false);
 mobilePageKind=kind;
 // Ismétlődő címek mellett is egyértelmű legyen a célpont.
 const totals=new Map(),seen=new Map(),key=label=>String(label).trim().replace(/\s+/g,' ').toLocaleLowerCase('hu-HU');
 for(const entry of entries)totals.set(key(entry.label),(totals.get(key(entry.label))||0)+1);
 mobileTargets=entries.map(entry=>{
  const title=key(entry.label);
  if(totals.get(title)===1)return {...entry,sourceLabel:entry.label};
  const number=(seen.get(title)||0)+1;seen.set(title,number);
  const context=entry.context&&entry.context!==entry.label?entry.context+' › ':'';
  return {...entry,sourceLabel:entry.label,label:`${context}${entry.label} (${number}/${totals.get(title)})`};
 });
 mobileIndex=0;
 mobileList.replaceChildren();
 for(const [index,item] of mobileTargets.entries()){
  const button=create('button','cs32-mobile-list-item',item.label);
  button.type='button';button.dataset.mobileIndex=String(index);
  button.setAttribute('aria-label',`${index+1}. szakasz a ${mobileTargets.length} közül: ${item.label}`);
  button.addEventListener('click',()=>jumpMobile(index));mobileList.append(button);
 }
 mobileBar.hidden=entries.length<2;
 updateMobilePosition();
 // Élő tartalomfrissítéskor a nyitott szakaszlista ne veszejtse el a fókuszt.
 if(hadSheetOpen&&!mobileBar.hidden&&mobileMode()){
  openMobileSheet();
  mobileList.scrollTop=previousSheetPosition;
  const restoredIndex=focusedId?mobileTargets.findIndex(item=>item.id===focusedId):-1;
  const focus=restoredIndex>=0?mobileList.querySelector(`[data-mobile-index="${restoredIndex}"]`):null;
  (focus||mobileList.querySelector('[aria-current="location"]')||mobileList.querySelector('.cs32-mobile-list-item'))?.focus?.({preventScroll:true});
 }
}
function subpageTargets(root){
 const raw=[];
 const content=root.querySelector('.content-tiles');
 if(!content)return raw;
 const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
 const shortHash=value=>{let hash=2166136261;for(const char of normalize(value))hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;return hash.toString(36);};
 function addSection(section,heading,context=''){
  if(!heading||section.hidden||heading.hidden||section.closest('[hidden]')||heading.closest('[hidden]'))return;
  const label=heading.textContent.replace(/\s+/g,' ').trim();
  if(label){
   const distinguishingText=[...(section.querySelectorAll?.('p,li')||[])].slice(0,4).map(node=>node.textContent).join(' ').slice(0,480);
   const stem=normalize(context+'-'+label).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'szakasz';
   const baseSlug=stem+'-'+shortHash(context+'|'+label);
   raw.push({baseSlug,textHash:shortHash(distinguishingText),label:label.slice(0,100),context:context.slice(0,65),target:section});
  }
 }
 for(const block of content.children){
  if(block.classList.contains('article-flow')){
   const group=block.getAttribute?.('aria-label')||block.querySelector?.(':scope > h2')?.textContent?.trim()||'';
   for(const section of block.querySelectorAll(':scope > .article-section'))addSection(section,section.querySelector(':scope > h2'),group);
  }else{
   // A már létező hír-, sport-, dokumentum- és eseménymodulok saját főcíme.
   addSection(block,block.querySelector('h2'));
  }
 }
 const totals=new Map(),duplicates=new Map();
 for(const item of raw)totals.set(item.baseSlug,(totals.get(item.baseSlug)||0)+1);
 return raw.map(item=>{
  const slug=item.baseSlug+(totals.get(item.baseSlug)>1?'-'+item.textHash:'');
  const occurrence=(duplicates.get(slug)||0)+1;duplicates.set(slug,occurrence);
  return {id:`subpage-${slug}-${occurrence}`,label:item.label,context:item.context,target:item.target};
 });
}
function scheduleMobileEligibility(){
 if(!mobileSubpageRoot||mobileEligibilityFrame)return;
 mobileEligibilityFrame=requestAnimationFrame(()=>{
  mobileEligibilityFrame=0;
  if(!mobileSubpageRoot?.isConnected||mobilePageKind!=='subpage')return;
  repositionEmbeddedAnchors();
  if(!mobileEmbeddedSignature){
   const changed=subpageTargets(mobileSubpageRoot);
   if(changed.length!==mobileTargets.length||changed.some((entry,i)=>entry.target!==mobileTargets[i]?.target||entry.label!==mobileTargets[i]?.sourceLabel||entry.context!==mobileTargets[i]?.context)){
    setMobileTargets(changed,'subpage');
   }
  }
  const first=mobileTargets[0]?.target,last=mobileTargets.at(-1)?.target;
  const span=first&&last?last.getBoundingClientRect().bottom-first.getBoundingClientRect().top:0;
  const visibleHeight=viewportHeight();
  const sufficient=mobileTargets.length>=2&&first.getClientRects().length>0&&last.getClientRects().length>0&&span>=Math.min(440,visibleHeight*.55);
  const available=sufficient&&!keyboardCoversContent();
  mobileBar.hidden=!available;
  if(!available)closeMobileSheet(true);
  else updateMobilePosition();
 });
}
function stopMobileSubpageTracking(){
 mobileSubpageRoot=null;
 mobileSubpageObserver?.disconnect();mobileSubpageObserver=null;
 mobileSubpageMutation?.disconnect();mobileSubpageMutation=null;
 if(mobileEligibilityFrame)cancelAnimationFrame(mobileEligibilityFrame);
 mobileEligibilityFrame=0;
 mobileEmbeddedSignature='';mobileEmbeddedFrame=null;mobileEmbeddedEntries=[];
 for(const anchor of mobileEmbeddedAnchors.values())anchor.remove();mobileEmbeddedAnchors.clear();
}
function repositionEmbeddedAnchors(){
 if(!mobileEmbeddedFrame?.isConnected||!mobileSubpageRoot?.isConnected)return;
 const offset=mobileEmbeddedFrame.getBoundingClientRect().top-mobileSubpageRoot.getBoundingClientRect().top;
 for(const entry of mobileEmbeddedEntries){
  const anchor=mobileEmbeddedAnchors.get(entry.id),top=Math.round(offset+entry.offset)+'px';
  if(anchor&&anchor.style.top!==top)anchor.style.top=top;
 }
}
export function syncMobileSubpageSections(root){
 mountMobileNavigator();
 stopMobileSubpageTracking();
 const targets=subpageTargets(root);
 setMobileTargets(targets,'subpage');
 mobileBar.hidden=true; // A láthatóság a valódi, megjelenített tartalomhosszhoz igazodik.
 mobileSubpageRoot=root;
 if('ResizeObserver' in window){
  mobileSubpageObserver=new ResizeObserver(()=>scheduleMobileEligibility());
  const container=root.querySelector('.content-tiles');
  if(container)mobileSubpageObserver.observe(container);
 }
 if('MutationObserver' in window){
  const container=root.querySelector('.content-tiles');
  if(container){
   mobileSubpageMutation=new MutationObserver(()=>scheduleMobileEligibility());
   mobileSubpageMutation.observe(container,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','open','aria-expanded']});
  }
 }
 scheduleMobileEligibility();
}
/** A meglévő, beágyazott térképes/tanulási oldal szakaszait a szülőoldali navigációba kötjük. */
export function syncMobileEmbeddedSections(wrapper,iframe,sections){
 if(!wrapper?.isConnected||!iframe?.isConnected||!Array.isArray(sections))return;
 mountMobileNavigator();
 const uniqueIds=new Set();
 const valid=sections.filter(entry=>{
  if(!entry||!(/^[a-z0-9-]{1,64}$/.test(entry.id))||uniqueIds.has(entry.id)||typeof entry.label!=='string'||!entry.label.trim()||!Number.isFinite(entry.offset)||entry.offset<0||entry.offset>=200000)return false;
  uniqueIds.add(entry.id);return true;
 }).slice(0,32).sort((a,b)=>a.offset-b.offset);
 const signature=valid.map(entry=>`${entry.id}:${entry.label.slice(0,100)}`).join('|');
 if(mobileSubpageRoot!==wrapper||mobileEmbeddedSignature!==signature){
  stopMobileSubpageTracking();mobileEmbeddedSignature=signature;mobileSubpageRoot=wrapper;
  for(const entry of valid){
   const anchor=create('span','cs32-arrival-anchor');anchor.id='cs32-arrival-'+entry.id;
   anchor.setAttribute('aria-label',entry.label.slice(0,100));wrapper.append(anchor);
   mobileEmbeddedAnchors.set(entry.id,anchor);
  }
  setMobileTargets(valid.map(entry=>({id:entry.id,label:entry.label.slice(0,100),target:mobileEmbeddedAnchors.get(entry.id)})),'subpage');
 }
 mobileEmbeddedFrame=iframe;mobileEmbeddedEntries=valid;
 repositionEmbeddedAnchors();
 scheduleMobileEligibility();
}
function makeApproach(){
 const section=create('section','cs29-approach');section.id='cs29-section-approach';
 const heading=create('div','cs29-block-heading');heading.append(create('span','cs29-overline','TALÁLKOZZUNK'),create('h2','','Így találsz el hozzánk'));section.append(heading);
 const layout=create('div','cs29-approach-grid');const preview=create('div','cs29-map-preview');
 const title=create('strong','','Csanádi Sportiskola');const address=create('p','','1143 Budapest, Őrnagy utca 5–7.');
 const mapButton=create('a','cs29-map-button','Interaktív térkép megnyitása');mapButton.href='#/megkozelites-es-erkezes/terkep';
 preview.append(create('span','cs29-map-pin','⌖'),title,address,mapButton);
 const cards=create('div','cs29-route-cards');
 for(const [icon,title,copy,url] of [['⌖','Cím és elérhetőség','Őrnagy utca 5–7.','#/kapcsolat'],['↗','Útvonaltervezés','Keresd meg a számodra megfelelő útvonalat.','#/megkozelites-es-erkezes/terkep'],['⇄','Közlekedési lehetőségek','Gyalog, tömegközlekedéssel, kerékpárral vagy autóval.','#/megkozelites-es-erkezes']]){
  const a=create('a','cs29-route-card');a.href=url;a.append(create('span','',icon),create('strong','',title),create('small','',copy));cards.append(a);
 }
 layout.append(preview,cards);section.append(layout);return section;
}
const CUSTOM_SHORTCUTS_KEY='csanadi-home-custom-shortcuts-v1';
function safeShortcutUrl(raw){
 const input=String(raw||'').trim();
 if(!input||input.startsWith('//')||input.includes('\\')||/[\u0000-\u001f\u007f]/.test(input))return null;
 if(input.startsWith('#/'))return input;
 try{
  const resolved=new URL(input,document.baseURI);
  if(resolved.protocol!=='https:'&&resolved.origin!==location.origin)return null;
  if(!['https:','http:'].includes(resolved.protocol))return null;
  return resolved.origin===location.origin?(resolved.pathname+resolved.search+resolved.hash).replace(new URL('.',document.baseURI).pathname,'')||'./':resolved.href;
 }catch{return null;}
}
function readCustomShortcuts(){
 try{const rows=JSON.parse(localStorage.getItem(CUSTOM_SHORTCUTS_KEY));return Array.isArray(rows)?rows.slice(0,24).filter(item=>item&&typeof item.title==='string'&&item.title.trim()&&safeShortcutUrl(item.url)).map(item=>({id:String(item.id||''),title:item.title.trim().slice(0,60),url:safeShortcutUrl(item.url)})):[];}catch{return [];}
}
function storeCustomShortcuts(entries){try{localStorage.setItem(CUSTOM_SHORTCUTS_KEY,JSON.stringify(entries));return true;}catch{return false;}}
function enhanceQuicklinks(canvas){
 const nav=canvas.querySelector('.home-j-navrail');if(!nav||nav.dataset.cs29Ready)return;nav.dataset.cs29Ready='yes';
 const items=[...nav.children];items.forEach((a,index)=>{a.classList.add('cs29-quicklink');const label=a.textContent.replace(/\s*↗/g,'').trim();const glyph=create('span','cs29-quicklink-glyph',['✦','⚑','◫','⌕','◎','➤'][index%6]);glyph.setAttribute('aria-hidden','true');const txt=create('span','cs29-quicklink-label',label);a.replaceChildren(glyph,txt);});
 let custom=readCustomShortcuts();
 const status=create('p','cs30-shortcut-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const editor=create('div','cs30-shortcut-editor');
 const open=create('button','cs30-shortcut-add','＋ Saját gyorselérés létrehozása');open.type='button';open.setAttribute('aria-expanded','false');
 const form=create('form','cs30-shortcut-form');form.hidden=true;
 const nameLabel=create('label','','Csempe felirata');const name=create('input','cs30-shortcut-name');name.type='text';name.required=true;name.maxLength=60;name.placeholder='Például: Órarend';nameLabel.append(name);
 const linkLabel=create('label','','Hivatkozás');const link=create('input','cs30-shortcut-url');link.type='text';link.required=true;link.maxLength=600;link.placeholder='Például: #/oktatas vagy https://…';linkLabel.append(link);
 const actions=create('div','cs30-shortcut-form-actions');const submit=create('button','cs30-shortcut-save','Gyorselérés mentése');submit.type='submit';const cancel=create('button','cs30-shortcut-cancel','Mégse');cancel.type='button';actions.append(submit,cancel);form.append(nameLabel,linkLabel,actions);
 editor.append(open,form,status);nav.after(editor);
 const close=()=>{form.hidden=true;open.setAttribute('aria-expanded','false');open.focus();};
 open.addEventListener('click',()=>{form.hidden=!form.hidden;open.setAttribute('aria-expanded',String(!form.hidden));if(!form.hidden)name.focus();});
 cancel.addEventListener('click',close);
 function renderCustom(){
  nav.querySelectorAll('.cs30-custom-tile').forEach(tile=>tile.remove());
  for(const item of custom){
   const tile=create('div','cs30-custom-tile');
   const a=create('a','cs29-quicklink cs30-custom-link');a.href=item.url;
   if(new URL(item.url,location.href).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}
   const glyph=create('span','cs29-quicklink-glyph','★');glyph.setAttribute('aria-hidden','true');a.append(glyph,create('span','cs29-quicklink-label',item.title));
   const remove=create('button','cs30-custom-remove','×');remove.type='button';remove.title='Saját gyorselérés törlése';remove.setAttribute('aria-label',item.title+' gyorselérés törlése');
   remove.addEventListener('click',()=>{custom=custom.filter(row=>row.id!==item.id);status.textContent=storeCustomShortcuts(custom)?'A saját gyorselérés törölve.':'A böngésző nem engedte a módosítás mentését.';renderCustom();});
   tile.append(a,remove);nav.append(tile);
  }
  nav.classList.toggle('cs30-odd-quicklinks',nav.children.length%2===1);
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();const title=name.value.trim(),url=safeShortcutUrl(link.value);
  if(!title||!url){status.textContent='Adj meg egy feliratot és egy biztonságos HTTPS- vagy belső hivatkozást.';return;}
  if(custom.length>=24){status.textContent='Legfeljebb 24 saját gyorselérés menthető.';return;}
  const next=[...custom,{id:'custom-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),title:title.slice(0,60),url}];
  if(!storeCustomShortcuts(next)){status.textContent='A böngésző nem engedte a mentést.';return;}
  custom=next;renderCustom();form.reset();close();status.textContent='A saját gyorselérés elkészült, és a többi mellett látható.';
 });
 renderCustom();
}
function enhanceFold(fold,index){
 if(!fold||fold.dataset.cs29Ready)return;fold.dataset.cs29Ready='yes';fold.classList.add('cs29-reveal-fold');
 fold.addEventListener('toggle',()=>{if(fold.open)fold.querySelectorAll('.home-unit').forEach((unit,i)=>{unit.style.setProperty('--cs29-stagger',Math.min(i,8)*85+'ms');});});
 if(index===1){const charts=fold.querySelectorAll('canvas,svg');for(const chart of charts){if(chart.closest('.cs29-chart-ondemand'))continue;const parent=create('details','cs29-chart-ondemand');const summary=create('summary','','Diagram megjelenítése');chart.before(parent);parent.append(summary,chart);}}
}
function buildLinks(canvas){
 const nav=drawer.querySelector('.cs29-nav-items');if(!nav)return;nav.replaceChildren();
 activeObserver?.disconnect();
 const cards=getCards(canvas), visible=sections.filter(([id])=>cards[id]&&!cards[id].hidden);
 visible.sort((a,b)=>{const x=cards[a[0]].compareDocumentPosition(cards[b[0]]);return x&Node.DOCUMENT_POSITION_FOLLOWING?-1:x&Node.DOCUMENT_POSITION_PRECEDING?1:0;});
 const targets=[];
 for(const [id,label] of visible){const target=cards[id];target.id='cs29-section-'+id;const link=create('button','cs29-nav-item',label);link.type='button';link.addEventListener('click',()=>{toggle(false);scrollToSection(target);});link.dataset.section=id;nav.append(link);targets.push(target);}
 mobileTargets=visible.map(([id,label])=>({id,label,target:cards[id]}));
 if(mobileList){mobileList.replaceChildren();mobileTargets.forEach(({label},index)=>{const button=create('button','cs32-mobile-list-item',label);button.type='button';button.dataset.mobileIndex=String(index);button.addEventListener('click',()=>jumpMobile(index));mobileList.append(button);});updateMobilePosition();}
 if('IntersectionObserver' in window){activeObserver=new IntersectionObserver(entries=>{const current=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!current)return;for(const button of nav.querySelectorAll('button')){if(button.dataset.section===current.target.id.replace('cs29-section-',''))button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');}},{rootMargin:'-10% 0px -65% 0px',threshold:[0,.1,.3]});targets.forEach(target=>activeObserver.observe(target));}
}
export function enhanceRound29Home(canvas){
 mountNavigator();mountMobileNavigator();const approach=makeApproach();canvas.append(approach);
 const folds=[...canvas.querySelectorAll(':scope > .home-j-fold')];folds.forEach(enhanceFold);
 enhanceQuicklinks(canvas);
 canvas.querySelectorAll('.home-j-fold-grid > .home-unit').forEach((card,i)=>card.style.setProperty('--cs29-stagger',Math.min(i,8)*85+'ms'));
 const personalizer=canvas.querySelector('.csn21-personalizer');
 if(personalizer){personalizer.addEventListener('click',()=>queueMicrotask(()=>buildLinks(canvas)));personalizer.addEventListener('change',()=>queueMicrotask(()=>buildLinks(canvas)));}
 buildLinks(canvas);trigger.hidden=false;mobileBar.hidden=false;updateMobilePosition();
}
export function syncRound29HomeNavigation(isHome){stopMobileSubpageTracking();mobilePageKind=isHome?'home':'subpage';if(trigger){trigger.hidden=!isHome;if(!isHome)toggle(false);}if(mobileBar&&!isHome){mobileBar.hidden=true;closeMobileSheet(false);}}
export function initRound29Diagnostics(){
 const details=document.getElementById('footer-diagnostics-disclosure');if(!details||details.dataset.cs29Ready)return;details.dataset.cs29Ready='yes';
 const mount=details.querySelector('#footer-diagnostics-mount');const close=create('button','cs29-diagnostics-close','×');close.type='button';close.setAttribute('aria-label','Honlapdiagnosztika bezárása');mount.before(close);
 let previous=null;
 function shut(){details.open=false;details.removeAttribute('role');details.removeAttribute('aria-modal');document.body.classList.remove('cs29-modal-open');previous?.focus?.();}
 close.addEventListener('click',shut);
 details.addEventListener('toggle',()=>{if(details.open){previous=document.activeElement;details.setAttribute('role','dialog');details.setAttribute('aria-modal','true');document.body.classList.add('cs29-modal-open');close.focus();}else{details.removeAttribute('role');details.removeAttribute('aria-modal');document.body.classList.remove('cs29-modal-open');}});
 details.addEventListener('keydown',event=>{if(!details.open)return;if(event.key==='Escape'){event.preventDefault();shut();}else if(event.key==='Tab'){const items=[...details.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)')];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
}
