// A meglévő egyetlen fejlécsor középső gombjának ütközésmentes elhelyezése.
// A menü példányait nem klónozza: a valódi eseménykezelők változatlanok.
export function initAdaptiveHeaderV13918(){
 const header=document.getElementById('site-header');
 const row=header?.querySelector('.brand-row');
 const brand=row?.querySelector('.brand');
 const actions=row?.querySelector('.header-actions');
 if(!row||!brand||!actions)return;
 let pending=false;
 const sync=()=>{
  pending=false;
  if(document.body.classList.contains('cs-home-header')){
   const r=row.getBoundingClientRect();
   const l=brand.getBoundingClientRect();
   const a=actions.getBoundingClientRect();
   if(r.width>0){
    const gap=8;
    const left=Math.max(0,l.right-r.left+gap);
    const right=Math.min(r.width,a.left-r.left-gap);
    const available=Math.max(0,right-left);
    const preferred=window.innerWidth<=768?44:Math.min(420,Math.max(120,r.width*.28));
    const width=Math.round(Math.max(40,Math.min(preferred,available)));
    const middle=r.width/2;
    const center=available>=width
     ?Math.max(left+width/2,Math.min(middle,right-width/2))
     :Math.max(width/2,Math.min(middle,(left+right)/2));
    row.style.setProperty('--cs18-middle-left',Math.round(center)+'px');
    row.style.setProperty('--cs18-middle-width',width+'px');
   }
  }
  // Ha a nézetváltás miatt a fókuszban lévő aloldali menüvezérlő eltűnik,
  // ugyanannak a főmenünek a látható vezérlőjére helyezzük a fókuszt.
  const subpage=document.getElementById('cs-subpage-menu');
  const mobile=document.getElementById('mobile-menu-toggle');
  const inner=document.body.classList.contains('cs-inner-page');
  if(inner&&subpage&&mobile){
   const shown=element=>element.getClientRects().length>0&&getComputedStyle(element).visibility!=='hidden';
   if(document.activeElement===subpage&&!shown(subpage)&&shown(mobile))mobile.focus({preventScroll:true});
   else if(document.activeElement===mobile&&!shown(mobile)&&shown(subpage))subpage.focus({preventScroll:true});
  }
 };
 const queue=()=>{if(pending)return;pending=true;requestAnimationFrame(sync)};
 window.addEventListener('resize',queue,{passive:true});
 document.addEventListener('csanadi:route-rendered',queue);
 if('ResizeObserver'in window){
  const observer=new ResizeObserver(queue);
  observer.observe(row);observer.observe(brand);observer.observe(actions);
 }
 if('MutationObserver'in window)new MutationObserver(queue).observe(document.body,{attributes:true,attributeFilter:['class']});
 queue();
}
