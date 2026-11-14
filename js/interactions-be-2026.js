/* B + E fejlesztés: natív, akadálymentes mikromozgások és böngészési kényelmi funkciók.
   A navigáció és a képváltó változatlan adatait használjuk; nincs új külső függőség. */
export function initEnhancedInteractions(){
  const overlay=document.getElementById('site-map-overlay');
  const hero=document.getElementById('global-hero');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  // Játékszerű, körkörös billentyűzetes választás. A (+) almenügombok továbbra is külön működnek.
  overlay?.addEventListener('keydown',(event)=>{
    if(overlay.hidden||!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    const main=[...overlay.querySelectorAll('.compass26-choice-link')];
    if(!main.length)return;
    const current=main.indexOf(document.activeElement);
    if(current===-1 && !overlay.querySelector('.compass26-choice-toggle:focus'))return;
    event.preventDefault();
    if(event.key==='Home'){main[0].focus();return;}
    if(event.key==='End'){main[main.length-1].focus();return;}
    const step=['ArrowRight','ArrowDown'].includes(event.key)?1:-1;
    main[(Math.max(0,current)+step+main.length)%main.length].focus();
  });
  // Mutatjuk a kiválasztott irányt akkor is, ha a felhasználó csak billentyűvel böngészik.
  overlay?.addEventListener('focusin',(event)=>{
    const choice=event.target.closest?.('.compass26-choice');
    overlay.querySelectorAll('.compass26-choice.is-keyfocus').forEach(n=>n.classList.remove('is-keyfocus'));
    if(choice)choice.classList.add('is-keyfocus');
  });
  const top=document.createElement('button');top.id='be2026-top';top.type='button';top.className='be2026-top';
  top.textContent='↑';top.title='Vissza az oldal tetejére';top.setAttribute('aria-label','Vissza az oldal tetejére');top.hidden=true;
  top.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}));
  document.body.append(top);
  let scheduled=false;
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{top.hidden=window.scrollY<650;scheduled=false;});}},{passive:true});
  const previewHero=()=>hero?.querySelector('.hero2026');
  // 20 diás képváltó: érintéses lapozás és billentyűzetes vezérlés.
  let swipe=null;
  hero?.addEventListener('pointerdown',(event)=>{
    const section=previewHero();
    if(!section||event.pointerType==='mouse'||event.target.closest('a,button'))return;
    swipe={x:event.clientX,y:event.clientY,time:performance.now(),id:event.pointerId};
  },{passive:true});
  hero?.addEventListener('pointerup',(event)=>{
    if(!swipe||swipe.id!==event.pointerId)return;
    const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;
    if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.4&&performance.now()-swipe.time<1300){
      // Explicit osztálylista szerinti választás; nem függ a díszítő markup sorrendjétől.
      const arrows=hero.querySelectorAll('.hero2026-arrow');
      (dx<0?arrows[1]:arrows[0])?.click();
    }
    swipe=null;
  },{passive:true});
  hero?.addEventListener('pointercancel',()=>swipe=null,{passive:true});
  hero?.addEventListener('keydown',(event)=>{
    if(!['ArrowRight','ArrowLeft'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey)return;
    if(!event.target.closest('.hero2026-nav'))return;
    const arrows=hero.querySelectorAll('.hero2026-arrow');
    event.preventDefault();(event.key==='ArrowRight'?arrows[1]:arrows[0])?.click();
  });
  // A JSON-blokkokban szereplő címsorok egy kattintással megosztható, stabil szakaszhivatkozást kapnak.
  let sectionSerial=0;
  const enhancePage=()=>{
    const article=document.querySelector('#app .article-flow');
    if(!article||article.dataset.enhancedBe==='true')return;
    article.dataset.enhancedBe='true';
    const sections=[...article.querySelectorAll(':scope > .article-section')].filter(s=>s.querySelector('h2'));
    if(sections.length<3)return;
    const nav=document.createElement('nav');nav.className='be2026-toc';nav.setAttribute('aria-label','Ugrás az oldal témáihoz');
    const head=document.createElement('strong');head.textContent='Az oldal témái';nav.append(head);
    const links=document.createElement('div');links.className='be2026-toc-links';
    sections.forEach((section,i)=>{
      const heading=section.querySelector('h2');const id='be2026-section-'+(++sectionSerial);
      section.id=id;const a=document.createElement('a');a.href='#'+id;a.textContent=heading.textContent;
      a.addEventListener('click',event=>{event.preventDefault();section.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});history.replaceState(history.state,'',location.pathname+location.search+location.hash);});
      links.append(a);
    });
    nav.append(links);article.prepend(nav);
  };
  const app=document.getElementById('app');
  const observer=new MutationObserver(()=>{if(app?.isConnected)requestAnimationFrame(enhancePage);});
  if(app)observer.observe(app,{childList:true});
  enhancePage();
}
