// Közös, statikus tárhelyen is működő aloldali finomítások.
const forbiddenHost = /(^|\.)csanadi-bp\.edu\.hu$/i;
const legacyRoutes = new Map([
  ['tortenet.html','#/iskolank/tortenet'],
  ['buszkeseg.html','#/iskolank/buszkesegeink'],
  ['felveteli.html','#/oktatas/felveteli'],
  ['kapcsolat.html','#/kapcsolat'],
  ['erettsegi.html','#/oktatas/vizsgak/erettsegi'],
  ['osztalyozo.html','#/oktatas/vizsgak/osztalyozo-vizsgak'],
  ['csengetes.html','#/informaciok/mindennapi-tudnivalok/csengetesi-rend'],
  ['oko.html','#/iskolank/oko-iskola'],
  ['docs.html','#/informaciok/dokumentumtar'],
  ['kozzetetel.html','#/informaciok/dokumentumtar/kozzeteteli-lista'],
  ['altisk.html','#/oktatas/kepzeseink/altalanos-iskola']
]);

function localReplacement(raw) {
  let url;
  try { url = new URL(raw, location.href); } catch { return null; }
  if (!forbiddenHost.test(url.hostname)) return null;
  // A régi domainre mutató index.html#/... linkek már az új SPA útvonalait tartalmazzák.
  if (url.pathname.endsWith('/index.html') && /^#\/[a-z0-9/-]*$/i.test(url.hash)) return url.hash;
  return legacyRoutes.get(url.pathname.split('/').pop().toLowerCase()) || '';
}

function sanitizeLinks(root) {
  const links = [];
  if (root.nodeType === 1 && root.matches?.('a[href]')) links.push(root);
  root.querySelectorAll?.('a[href]').forEach(link => links.push(link));
  for (const link of links) {
    const original = link.getAttribute('href');
    const substitute = localReplacement(original);
    if (substitute === null) continue;
    if (substitute) {
      link.setAttribute('href', substitute);
      link.removeAttribute('target');
      link.removeAttribute('rel');
    } else {
      // Nem találunk igazolt, azonos tartalmú céloldalt: a felirat megmarad, de nem kattintható.
      const plain = document.createElement('span');
      plain.className = link.className;
      plain.textContent = link.textContent.trim() || 'Korábbi forrás';
      plain.title = 'A korábbi weboldalra vezető hivatkozás megszűnt.';
      link.replaceWith(plain);
    }
  }
}

function syncSelfLinks(root=document) {
  const route=(location.hash.split('?')[0].replace(/\/+$/,'')||'#/');
  const links=[];
  if(root.nodeType===1&&root.matches?.('a[href],a[data-self-href]'))links.push(root);
  root.querySelectorAll?.('a[href],a[data-self-href]').forEach(link=>links.push(link));
  for(const link of links){
    const prior=link.dataset.selfHref;
    if(prior){
      const priorRoute=prior.split('?')[0].replace(/\/+$/,'')||'#/';
      if(priorRoute!==route){
        link.setAttribute('href',prior);delete link.dataset.selfHref;link.removeAttribute('aria-current');
        if('selfTitle' in link.dataset){if(link.dataset.selfTitle)link.title=link.dataset.selfTitle;else link.removeAttribute('title');delete link.dataset.selfTitle;}
      }
      continue;
    }
    const raw=link.getAttribute('href');
    if(!raw?.startsWith('#/'))continue;
    const target=(raw.split('?')[0].replace(/\/+$/,'')||'#/');
    if(target===route){
      link.dataset.selfHref=raw;
      link.dataset.selfTitle=link.getAttribute('title')||'';
      link.removeAttribute('href');
      link.setAttribute('aria-current','page');
      link.setAttribute('title','Ez a jelenlegi oldal');
    }
  }
}

export function initSubpageEnhancements() {
  const header = document.getElementById('site-header');
  const actions = header?.querySelector('.header-actions');
  if (!header || !actions) return;
  const menu = document.createElement('button');
  menu.type = 'button';
  menu.id = 'cs-subpage-menu';
  menu.className = 'icon-btn cs-subpage-menu';
  menu.setAttribute('aria-label', 'Főmenü megnyitása');
  menu.setAttribute('aria-controls', 'site-map-overlay');
  menu.setAttribute('aria-haspopup', 'dialog');
  menu.setAttribute('aria-expanded', 'false');
  // Teljes fejlécben egyszerű, arculatos szöveges gomb; összecsukva a
  // vízszintesen középre kerülő iskolai címer nyitja meg ugyanazt a menüt.
  menu.innerHTML = '<img class="cs-subpage-menu-logo" src="assets/media/logo/csanadi-cimer-512.webp" width="42" height="42" alt="" aria-hidden="true"><span class="cs-subpage-menu-label">Menü</span>';
  // Nem hivatkozunk a kezdőlapi vizuális indítógombra: az oldalváltás
  // ideiglenesen áthelyezheti, az aloldali menünek ettől függetlenül működnie kell.
  menu.addEventListener('click', () => document.dispatchEvent(new Event('csanadi:menu-toggle')));
  actions.insertBefore(menu, actions.firstChild);
  const mapOverlay = document.getElementById('site-map-overlay');
  if(mapOverlay){
    const syncMenuState=()=>{
      const open=!mapOverlay.hidden;
      menu.setAttribute('aria-expanded',String(open));
      menu.setAttribute('aria-label',open?'Főmenü bezárása':'Főmenü megnyitása');
    };
    new MutationObserver(syncMenuState).observe(mapOverlay,{attributes:true,attributeFilter:['hidden']});
    syncMenuState();
  }

  let scheduled = false;
  const update = () => {
    scheduled = false;
    const inner = document.body.classList.contains('cs-inner-page');
    const heroHeight = document.getElementById('global-hero')?.offsetHeight || 0;
    document.body.classList.toggle('cs-header-condensed', inner && scrollY > Math.max(110, Math.min(heroHeight, 240)));
  };
  const queueUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', queueUpdate, {passive:true});
  window.addEventListener('resize', queueUpdate, {passive:true});
  document.addEventListener('csanadi:route-rendered', ()=>{queueUpdate();syncSelfLinks();});
  queueUpdate();

  sanitizeLinks(document);
  syncSelfLinks();
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') {sanitizeLinks(record.target);syncSelfLinks(record.target);}
      else for (const added of record.addedNodes) if (added.nodeType === 1) {sanitizeLinks(added);syncSelfLinks(added);}
    }
  });
  observer.observe(document.body, {subtree:true,childList:true,attributes:true,attributeFilter:['href']});
  // A később hozzáadott, már a dokumentumba illesztett rossz link kattintáskor sem navigálhat.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const replacement = localReplacement(link.getAttribute('href'));
    if (replacement === null) return;
    event.preventDefault();
    if (replacement) location.hash = replacement;
  }, true);
}

export function createSubpageHero({title,mediaIds,createPicture,intervalMs=6500,enableAutoplay=true}) {
  const pictures = mediaIds.map(id=>createPicture(id,{className:'cs-sub-hero-picture',eager:true,sizes:'100vw'})).filter(Boolean);
  if(!pictures.length)return null;
  const root=document.createElement('div');root.className='cs-sub-hero';
  root.setAttribute('aria-label',title+' – képes oldalbevezető');
  const track=document.createElement('div');track.className='cs-sub-hero-track';
  pictures.forEach((picture,i)=>{
    const slide=document.createElement('div');slide.className='cs-sub-hero-slide';
    slide.hidden=i!==0;slide.append(picture);track.append(slide);
  });
  const shade=document.createElement('div');shade.className='cs-sub-hero-shade';shade.setAttribute('aria-hidden','true');
  const caption=document.createElement('p');caption.className='cs-sub-hero-caption';caption.textContent=title;
  root.append(track,shade,caption);
  if(pictures.length===1)return root;
  let index=0,paused=false,timer=null;
  const prev=document.createElement('button'),next=document.createElement('button'),pause=document.createElement('button');
  prev.type=next.type=pause.type='button';
  prev.className='cs-sub-hero-prev';next.className='cs-sub-hero-next';pause.className='cs-sub-hero-pause';
  prev.textContent='‹';next.textContent='›';pause.textContent='Szünet';
  prev.setAttribute('aria-label','Előző kép');next.setAttribute('aria-label','Következő kép');
  pause.setAttribute('aria-label','Automatikus képváltás szüneteltetése');
  const slides=[...track.children];
  const show=i=>{index=(i+slides.length)%slides.length;slides.forEach((slide,j)=>slide.hidden=j!==index);};
  const stop=()=>{if(timer){clearInterval(timer);timer=null;}};
  const start=()=>{
    stop();
    if(enableAutoplay && !paused && !matchMedia('(prefers-reduced-motion: reduce)').matches)
      timer=setInterval(()=>{if(root.isConnected && !document.hidden)show(index+1);else if(!root.isConnected)stop();},Math.min(30000,Math.max(5000,Number(intervalMs)||6500)));
  };
  prev.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));
  pause.addEventListener('click',()=>{
    paused=!paused;pause.textContent=paused?'Folytatás':'Szünet';
    pause.setAttribute('aria-label',paused?'Automatikus képváltás folytatása':'Automatikus képváltás szüneteltetése');
    if(paused)stop();else start();
  });
  root.addEventListener('pointerenter',stop);
  root.addEventListener('pointerleave',start);
  root.addEventListener('focusin',stop);
  root.addEventListener('focusout',event=>{if(!root.contains(event.relatedTarget))start();});
  let touchStart=null;
  root.addEventListener('touchstart',event=>{if(event.touches.length===1)touchStart=event.touches[0].clientX;},{passive:true});
  root.addEventListener('touchend',event=>{
    if(touchStart===null)return;
    const delta=event.changedTouches[0].clientX-touchStart;touchStart=null;
    if(Math.abs(delta)>45)show(index+(delta<0?1:-1));
  },{passive:true});
  if(!enableAutoplay)pause.hidden=true;
  root.append(prev,next,pause);
  // Csak a megjelenített elemhez tartozó időzítő maradjon aktív.
  const observed=new MutationObserver(()=>{if(!root.isConnected){stop();observed.disconnect();}});
  observed.observe(document.getElementById('global-hero'),{childList:true});
  start();return root;
}
