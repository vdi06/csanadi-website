(function(){
 const mediaSelector='video,img';
 const watched=new WeakSet();
 let scheduled=false;
 function tune(){
  scheduled=false;
  for(const node of document.querySelectorAll(mediaSelector)){
   if(watched.has(node))continue;
   watched.add(node);
   if(node.localName==='img'){
    if(!node.hasAttribute('decoding'))node.decoding='async';
    const firstScreen=!!node.closest('.brand,.csn26-visual-map .csn26-wing-surface,.compass26-emblem,.gate26');
    if(!firstScreen&&!node.hasAttribute('loading'))node.loading='lazy';
    if(firstScreen&&node.closest('.csn26-visual-map')&&!node.hasAttribute('fetchpriority'))node.fetchPriority='high';
   }else{
    if(!node.hasAttribute('preload'))node.preload='metadata';
    if(!node.hasAttribute('playsinline'))node.playsInline=true;
   }
  }
 }
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(tune);}};
 document.addEventListener('DOMContentLoaded',()=>{schedule();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});});
 document.addEventListener('csanadi:route-rendered',schedule);
})();
