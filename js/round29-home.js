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
let mobileSubpageRoot=null,mobileSubpageObserver=null,mobileEligibilityFrame=0;
const mobileMode=()=>window.matchMedia('(max-width:768px)').matches;
const motion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
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
 const topButton=create('button','cs29-drawer-top','↑  Ugrás a lap tetejére');topButton.type='button';topButton.addEventListener('click',()=>{toggle(false);window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
 drawer.append(topButton);document.body.append(trigger,drawer);
 trigger.addEventListener('click',()=>toggle(drawer.hidden));
 document.addEventListener('keydown',event=>{if(drawer.hidden)return;if(event.key==='Escape'){event.preventDefault();toggle(false);}else if(event.key==='Tab'){const items=[...drawer.querySelectorAll('button:not(:disabled),a[href]')];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
 document.addEventListener('pointerdown',event=>{if(!drawer.hidden&&!drawer.contains(event.target)&&!trigger.contains(event.target))toggle(false);});
}
function toggle(open){
 if(!drawer)return;
 drawer.hidden=!open;trigger.setAttribute('aria-expanded',String(open));trigger.setAttribute('aria-label',open?'Kezdőoldali szakasznavigátor bezárása':'Kezdőoldali szakasznavigátor megnyitása');
 if(open){lastFocus=document.activeElement;drawer.querySelector('button')?.focus();}else if(lastFocus?.isConnected)lastFocus.focus();
}
function closeMobileSheet(restoreFocus=true){
 if(!mobileSheet||mobileSheet.hidden)return;
 mobileSheet.hidden=true;mobileBackdrop.hidden=true;
 document.body.style.overflow=mobileOldOverflow;
 mobileBar.querySelector('[data-action="sections"]')?.setAttribute('aria-expanded','false');
 if(restoreFocus&&mobileLastFocus?.isConnected)mobileLastFocus.focus();
}
function openMobileSheet(){
 if(!mobileMode()||!mobileSheet||mobileBar.hidden)return;
 if(drawer&&!drawer.hidden)toggle(false);
 mobileLastFocus=document.activeElement;mobileOldOverflow=document.body.style.overflow;
 mobileBackdrop.hidden=false;mobileSheet.hidden=false;document.body.style.overflow='hidden';
 mobileBar.querySelector('[data-action="sections"]')?.setAttribute('aria-expanded','true');
 const focusTarget=mobileList.querySelector('[aria-current="location"]')||mobileSheet.querySelector('button');focusTarget?.focus();
}
function updateMobilePosition(){
 if(!mobileBar||mobileBar.hidden||!mobileTargets.length)return;
 const threshold=window.innerHeight*.36;
 let active=0;
 mobileTargets.forEach((entry,index)=>{if(!entry.target.hidden&&entry.target.getBoundingClientRect().top<=threshold)active=index;});
 mobileIndex=active;
 mobileCurrent.textContent=mobileTargets[active]?.label||(mobilePageKind==='home'?'Kezdőlap':'Az oldal eleje');
 mobilePrevious.disabled=active===0;mobileNext.disabled=active===mobileTargets.length-1;
 for(const b of mobileList.querySelectorAll('[data-mobile-index]')){
  if(Number(b.dataset.mobileIndex)===active)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');
 }
}
function jumpMobile(index){
 const item=mobileTargets[index];if(!item)return;
 const wasSheetOpen=Boolean(mobileSheet&&!mobileSheet.hidden);
 closeMobileSheet(false);
 for(let parent=item.target;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
 item.target.scrollIntoView({behavior:motion(),block:'start'});
 // A szakaszlistából választva a billentyűzetes fókusz se maradjon a rejtett panelen.
 if(wasSheetOpen){
  const hadTabIndex=item.target.hasAttribute('tabindex');
  if(!hadTabIndex)item.target.tabIndex=-1;
  item.target.focus({preventScroll:true});
  if(!hadTabIndex)item.target.addEventListener('blur',()=>item.target.removeAttribute('tabindex'),{once:true});
 }
 mobileIndex=index;mobileCurrent.textContent=item.label;
 updateMobilePosition();
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
 mobileBackdrop=create('button','cs32-mobile-backdrop');mobileBackdrop.type='button';mobileBackdrop.hidden=true;mobileBackdrop.setAttribute('aria-label','Szakaszlista bezárása');mobileBackdrop.addEventListener('click',()=>closeMobileSheet());
 mobileSheet=create('aside','cs32-mobile-sheet');mobileSheet.hidden=true;mobileSheet.id='cs32-mobile-sheet';mobileSheet.setAttribute('role','dialog');mobileSheet.setAttribute('aria-modal','true');mobileSheet.setAttribute('aria-label','Az oldal szakaszai');
 const head=create('div','cs32-mobile-sheet-head');head.append(create('h2','','Ugrás az oldal szakaszaihoz'));
 const close=create('button','cs32-mobile-close','×');close.type='button';close.setAttribute('aria-label','Szakaszlista bezárása');close.addEventListener('click',()=>closeMobileSheet());head.append(close);
 mobileList=create('div','cs32-mobile-list');mobileSheet.append(head,mobileList);
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
 let pending=false;
 window.addEventListener('scroll',()=>{if(pending||!mobileMode()||mobileBar.hidden)return;pending=true;requestAnimationFrame(()=>{pending=false;updateMobilePosition();});},{passive:true});
 window.addEventListener('resize',()=>{if(mobileMode()&&drawer&&!drawer.hidden)toggle(false);if(!mobileMode())closeMobileSheet(false);scheduleMobileEligibility();updateMobilePosition();});
}
function setMobileTargets(entries,kind){
 closeMobileSheet(false);
 mobilePageKind=kind;
 mobileTargets=entries;
 mobileIndex=0;
 mobileList.replaceChildren();
 for(const [index,item] of entries.entries()){
  const button=create('button','cs32-mobile-list-item',item.label);
  button.type='button';button.dataset.mobileIndex=String(index);
  button.addEventListener('click',()=>jumpMobile(index));mobileList.append(button);
 }
 mobileBar.hidden=entries.length<2;
 updateMobilePosition();
}
function subpageTargets(root){
 const result=[];
 const content=root.querySelector('.content-tiles');
 if(!content)return result;
 function addSection(section,heading){
  if(!heading||section.hidden||heading.hidden||section.closest('[hidden]')||heading.closest('[hidden]'))return;
  const label=heading.textContent.replace(/\s+/g,' ').trim();
  if(label)result.push({id:'subpage-'+result.length,label:label.slice(0,100),target:section});
 }
 for(const block of content.children){
  if(block.classList.contains('article-flow')){
   for(const section of block.querySelectorAll(':scope > .article-section'))addSection(section,section.querySelector(':scope > h2'));
  }else{
   // A már létező hír-, sport-, dokumentum- és eseménymodulok saját főcíme.
   addSection(block,block.querySelector('h2'));
  }
 }
 return result;
}
function scheduleMobileEligibility(){
 if(!mobileSubpageRoot||mobileEligibilityFrame)return;
 mobileEligibilityFrame=requestAnimationFrame(()=>{
  mobileEligibilityFrame=0;
  if(!mobileSubpageRoot?.isConnected||mobilePageKind!=='subpage')return;
  const first=mobileTargets[0]?.target,last=mobileTargets.at(-1)?.target;
  const span=first&&last?last.getBoundingClientRect().bottom-first.getBoundingClientRect().top:0;
  const sufficient=mobileTargets.length>=2&&first.getClientRects().length>0&&last.getClientRects().length>0&&span>=Math.min(440,window.innerHeight*.55);
  mobileBar.hidden=!sufficient;
  if(!sufficient)closeMobileSheet(false);
  else updateMobilePosition();
 });
}
function stopMobileSubpageTracking(){
 mobileSubpageRoot=null;
 mobileSubpageObserver?.disconnect();mobileSubpageObserver=null;
 if(mobileEligibilityFrame)cancelAnimationFrame(mobileEligibilityFrame);
 mobileEligibilityFrame=0;
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
 scheduleMobileEligibility();
}
function makeApproach(){
 const section=create('section','cs29-approach');section.id='cs29-section-approach';
 const heading=create('div','cs29-block-heading');heading.append(create('span','cs29-overline','TALÁLKOZZUNK'),create('h2','','Így találsz el hozzánk'));section.append(heading);
 const layout=create('div','cs29-approach-grid');const preview=create('div','cs29-map-preview');
 const title=create('strong','','Csanádi Sportiskola');const address=create('p','','1143 Budapest, Őrnagy utca 5–7.');
 const mapButton=create('a','cs29-map-button','Interaktív térkép megnyitása →');mapButton.href='#/megkozelites-es-tanulas/terkep';
 preview.append(create('span','cs29-map-pin','⌖'),title,address,mapButton);
 const cards=create('div','cs29-route-cards');
 for(const [icon,title,copy,url] of [['⌖','Cím és elérhetőség','Őrnagy utca 5–7.','#/kapcsolat'],['↗','Útvonaltervezés','Keresd meg a számodra megfelelő útvonalat.','#/megkozelites-es-tanulas/terkep'],['⇄','Közlekedési lehetőségek','Gyalog, tömegközlekedéssel, kerékpárral vagy autóval.','#/megkozelites-es-tanulas']]){
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
 for(const [id,label] of visible){const target=cards[id];target.id='cs29-section-'+id;const link=create('button','cs29-nav-item',label);link.type='button';link.addEventListener('click',()=>{toggle(false);target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});link.dataset.section=id;nav.append(link);targets.push(target);}
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
