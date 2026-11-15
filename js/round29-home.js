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
 drawer.append(header,create('nav','cs29-nav-items'));document.body.append(trigger,drawer);
 trigger.addEventListener('click',()=>toggle(drawer.hidden));
 document.addEventListener('keydown',event=>{if(drawer.hidden)return;if(event.key==='Escape'){event.preventDefault();toggle(false);}else if(event.key==='Tab'){const items=[...drawer.querySelectorAll('button:not(:disabled),a[href]')];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
 document.addEventListener('pointerdown',event=>{if(!drawer.hidden&&!drawer.contains(event.target)&&!trigger.contains(event.target))toggle(false);});
}
function toggle(open){
 if(!drawer)return;
 drawer.hidden=!open;trigger.setAttribute('aria-expanded',String(open));trigger.setAttribute('aria-label',open?'Kezdőoldali szakasznavigátor bezárása':'Kezdőoldali szakasznavigátor megnyitása');
 if(open){lastFocus=document.activeElement;drawer.querySelector('button')?.focus();}else if(lastFocus?.isConnected)lastFocus.focus();
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
function enhanceQuicklinks(canvas){
 const nav=canvas.querySelector('.home-j-navrail');if(!nav||nav.dataset.cs29Ready)return;nav.dataset.cs29Ready='yes';
 const items=[...nav.children];items.forEach((a,index)=>{a.classList.add('cs29-quicklink');const label=a.textContent.replace(/\s*↗/g,'').trim();const glyph=create('span','cs29-quicklink-glyph',['✦','⚑','◫','⌕','◎','➤'][index%6]);glyph.setAttribute('aria-hidden','true');const txt=create('span','cs29-quicklink-label',label);a.replaceChildren(glyph,txt);if(index>=4)a.classList.add('cs29-more-quicklink');});
 if(items.length>4){const more=create('button','cs29-quick-more','További gyorselérések +');more.type='button';more.setAttribute('aria-expanded','false');more.addEventListener('click',()=>{const open=nav.classList.toggle('cs29-show-all');more.setAttribute('aria-expanded',String(open));more.textContent=open?'Kevesebb gyorselérés −':'További gyorselérések +';});nav.after(more);}
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
 if('IntersectionObserver' in window){activeObserver=new IntersectionObserver(entries=>{const current=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!current)return;for(const button of nav.querySelectorAll('button')){if(button.dataset.section===current.target.id.replace('cs29-section-',''))button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');}},{rootMargin:'-10% 0px -65% 0px',threshold:[0,.1,.3]});targets.forEach(target=>activeObserver.observe(target));}
}
export function enhanceRound29Home(canvas){
 mountNavigator();const approach=makeApproach();canvas.append(approach);
 const folds=[...canvas.querySelectorAll(':scope > .home-j-fold')];folds.forEach(enhanceFold);
 enhanceQuicklinks(canvas);
 canvas.querySelectorAll('.home-j-fold-grid > .home-unit').forEach((card,i)=>card.style.setProperty('--cs29-stagger',Math.min(i,8)*85+'ms'));
 const personalizer=canvas.querySelector('.csn21-personalizer');
 if(personalizer){personalizer.addEventListener('click',()=>queueMicrotask(()=>buildLinks(canvas)));personalizer.addEventListener('change',()=>queueMicrotask(()=>buildLinks(canvas)));}
 buildLinks(canvas);trigger.hidden=false;
}
export function syncRound29HomeNavigation(isHome){if(trigger){trigger.hidden=!isHome;if(!isHome)toggle(false);}}
export function initRound29Diagnostics(){
 const details=document.getElementById('footer-diagnostics-disclosure');if(!details||details.dataset.cs29Ready)return;details.dataset.cs29Ready='yes';
 const mount=details.querySelector('#footer-diagnostics-mount');const close=create('button','cs29-diagnostics-close','×');close.type='button';close.setAttribute('aria-label','Honlapdiagnosztika bezárása');mount.before(close);
 let previous=null;
 function shut(){details.open=false;details.removeAttribute('role');details.removeAttribute('aria-modal');document.body.classList.remove('cs29-modal-open');previous?.focus?.();}
 close.addEventListener('click',shut);
 details.addEventListener('toggle',()=>{if(details.open){previous=document.activeElement;details.setAttribute('role','dialog');details.setAttribute('aria-modal','true');document.body.classList.add('cs29-modal-open');close.focus();}else{details.removeAttribute('role');details.removeAttribute('aria-modal');document.body.classList.remove('cs29-modal-open');}});
 details.addEventListener('keydown',event=>{if(!details.open)return;if(event.key==='Escape'){event.preventDefault();shut();}else if(event.key==='Tab'){const items=[...details.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)')];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
}
