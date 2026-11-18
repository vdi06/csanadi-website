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
 const update=()=>{
  scheduled=false;
  placeLanguagePanel();
  if(!document.body.classList.contains('cs-home-header')||!hero.querySelector('.cs41-home-hero')){
   hero.style.removeProperty('--cs41-scroll');return;
  }
  const bounds=hero.getBoundingClientRect();
  const ratio=Math.min(1,Math.max(0,-bounds.top/Math.max(bounds.height,1)));
  hero.style.setProperty('--cs41-scroll',ratio.toFixed(3));
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
