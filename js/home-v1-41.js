/* v1.41 helyi előnézet – progresszív, hangtalan hero → fejléc átmenet.
   A korábbi fejlécmodul kezeli továbbra is a kompakt címeres navigációt. */
export function initV141HomepageMotion(){
 const hero=document.getElementById('global-hero');
 if(!hero)return;
 let scheduled=false;
 // Az eredeti többnyelvű információs panel a hero után került be.
 // Kezdőlapon ezzel elválasztotta a nyitórészt a kötelező első
 // tartalmi szakasztól, a dicsőségfaltól. A panel tartalmát és
 // működését megőrizve a kezdőlapon a fő tartalom után helyezzük.
 const placeLanguagePanel=()=>{
  const panel=document.querySelector('body > .csn20-language-bar');
  const app=document.getElementById('app');
  if(!panel||!app)return;
  const target=document.body.classList.contains('cs-home-header')?app:hero;
  if(panel.previousElementSibling!==target)target.insertAdjacentElement('afterend',panel);
 };
 const ensureNextChapter=()=>{
  const frame=hero.querySelector('.cs41-home-hero .csn26-visual-row');
  if(!frame||frame.querySelector('.cs41-next-chapter'))return;
  const note=document.createElement('div');note.className='cs41-next-chapter';
  note.setAttribute('aria-hidden','true');
  const small=document.createElement('span');small.textContent='KÖVETKEZIK';
  const name=document.createElement('strong');name.textContent='DIÁKJAINK SPORTSIKEREI';
  note.append(small,name);frame.append(note);
 };
 const update=()=>{
  scheduled=false;
  placeLanguagePanel();
  if(!document.body.classList.contains('cs-home-header')||!hero.querySelector('.cs41-home-hero')){
   hero.style.removeProperty('--cs41-scroll');hero.style.removeProperty('--cs41-next');return;
  }
  ensureNextChapter();
  const bounds=hero.getBoundingClientRect();
  // A nyitókép teljes eltűnési útját mérjük, nem csak egy korai animációs szakaszt.
  const headerHeight=document.getElementById('site-header')?.getBoundingClientRect().height||0;
  const frame=hero.querySelector('.cs41-home-hero .csn26-visual-row');
  const stickyOffset=parseFloat(frame?getComputedStyle(frame).top:0)||0;
  const distance=Math.max(bounds.height-Math.max(headerHeight,stickyOffset),1);
  const ratio=Math.min(1,Math.max(0,-bounds.top/distance));
  // A teljes képkivágás csak az utolsó görgetési ponton záródhat össze.
  const next=Math.max(0,Math.min(1,(ratio-1/3)*7,(1-ratio)*7));
  hero.style.setProperty('--cs41-scroll',String(ratio));
  hero.style.setProperty('--cs41-next',String(next));
 };
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}};
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule,{passive:true});
 addEventListener('hashchange',schedule);
 const observer=new MutationObserver(schedule);
 observer.observe(hero,{childList:true});
 const pageObserver=new MutationObserver(schedule);
 pageObserver.observe(document.body,{childList:true,attributes:true,attributeFilter:['class']});
 schedule();
}
