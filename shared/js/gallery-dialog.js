import { element } from "./dom.js?v=2.52";
import { responsiveImageAttributes } from "./media-data.js?v=2.52";
/** Natív képnéző: billentyűzet, simítás, valódi kétujjas nagyítás és egyujjas panorámázás. */
export function createGalleryDialog(scope, platform) {
  const el=element;
  const dialog=el("dialog",{className:`${platform}-media-dialog media-dialog`,attributes:{
    "aria-labelledby":`${platform}-media-dialog-title`,"aria-describedby":`${platform}-media-dialog-description`
  }});
  const closeButton=el("button",{className:"media-dialog-close",text:"×",attributes:{type:"button","aria-label":"Képnézet bezárása"}});
  const zoomButton=el("button",{className:"media-dialog-zoom",text:"Nagyítás +",attributes:{type:"button","aria-label":"Kép nagyítása vagy eredeti méret"}});
  const image=el("img",{className:"media-dialog-image",attributes:{alt:"",decoding:"async",draggable:"false"}});
  const viewport=el("div",{className:"media-dialog-viewport",attributes:{"aria-label":"Nagyítható kép, telefonon két ujjal nagyítható"}},image);
  const title=el("h2",{attributes:{id:`${platform}-media-dialog-title`}});
  const description=el("p",{attributes:{id:`${platform}-media-dialog-description`}});
  const related=el("a",{className:"media-dialog-related",text:"Kapcsolódó oldal megnyitása"});
  const counter=el("span",{className:"media-dialog-counter",attributes:{"aria-live":"polite"}});
  const prev=el("button",{className:"media-dialog-arrow",text:"‹",attributes:{type:"button","aria-label":"Előző kép"}});
  const next=el("button",{className:"media-dialog-arrow",text:"›",attributes:{type:"button","aria-label":"Következő kép"}});
  dialog.append(el("div",{className:"media-dialog-content"},
    el("div",{className:"media-dialog-toolbar"},counter,zoomButton,closeButton),
    el("div",{className:"media-dialog-stage"},prev,viewport,next),
    el("div",{className:"media-dialog-details"},title,description,related)));
  scope.append(dialog);
  let items=[],index=0,restore=null,themeObserver=null,scale=1,x=0,y=0;
  let gesture=null,lastTap=null,lastTouchAt=0;
  const themeHost=()=>scope.closest(".desktop-home,.mobile-home");
  const reduce=()=>typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function setZoom(next,dx=x,dy=y){
    scale=Math.max(1,Math.min(4,next));
    const maxX=Math.max(0,(viewport.clientWidth*(scale-1))/2);
    const maxY=Math.max(0,(viewport.clientHeight*(scale-1))/2);
    x=scale===1?0:Math.max(-maxX,Math.min(maxX,dx));
    y=scale===1?0:Math.max(-maxY,Math.min(maxY,dy));
    image.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
    viewport.dataset.zoomed=String(scale>1);
    zoomButton.textContent=scale>1?"Visszaállítás −":"Nagyítás +";
    zoomButton.setAttribute("aria-pressed",String(scale>1));
  }
  const distance=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  const midpoint=(a,b)=>({clientX:(a.clientX+b.clientX)/2,clientY:(a.clientY+b.clientY)/2});
  function syncTheme(){
    const host=themeHost();const theme=host?.dataset.theme==="light"?"light":"dark";
    dialog.dataset.theme=theme;dialog.style.colorScheme=theme;
    if(host&&typeof getComputedStyle==="function"){
      const style=getComputedStyle(host);
      for(const name of ["background","surface","text","muted","accent"]){
        const value=style.getPropertyValue(`--${name}`).trim();if(value)dialog.style.setProperty(`--${name}`,value);
      }
    }
  }
  function watchTheme(){
    themeObserver?.disconnect();const host=themeHost();syncTheme();
    if(host&&typeof MutationObserver==="function"){
      themeObserver=new MutationObserver(syncTheme);
      themeObserver.observe(host,{attributes:true,attributeFilter:["data-theme","style"]});
    }
  }
  function display(direction=0){
    const item=items[index];if(!item)return;
    setZoom(1);gesture=null;lastTap=null;
    const attrs=responsiveImageAttributes(item,true);
    image.src=attrs.src;image.srcset=attrs.srcset;image.sizes=attrs.sizes;image.alt=item.alt;
    title.textContent=item.title;
    description.textContent=`${item.caption} ${item.alt} · Illusztráció, nem hitelesített rendezvényfotó.`;
    related.href=item.href;
    counter.textContent=`${index+1} / ${items.length}`;
    prev.disabled=items.length<2;next.disabled=items.length<2;
    if(direction&&typeof image.animate==="function"&&!reduce()){
      for(const animation of image.getAnimations?.()||[])animation.cancel();
      image.animate([{opacity:.2,transform:`translateX(${direction>0?20:-20}px) scale(.985)`},{opacity:1,transform:"translateX(0) scale(1)"}],
        {duration:260,easing:"cubic-bezier(.2,.8,.2,1)"});
    }
  }
  function show(data,selected,focusEl){
    if(!data.length)return;
    items=data.slice();index=Math.max(0,Math.min(items.length-1,selected));
    restore=focusEl||document.activeElement;watchTheme();display();
    if(typeof dialog.showModal==="function"){
      if(!dialog.open)dialog.showModal();closeButton.focus();
    }else{dialog.setAttribute("open","");closeButton.focus?.();}
  }
  const move=offset=>{if(items.length<2)return;index=(index+offset+items.length)%items.length;display(offset);};
  // A bezárást követő fókusz-visszaállítás nem maradhat a későbbi,
  // aszinkron `close` eseményre: különben felülírhat egy közben
  // elindított keresőműveletet (mobilon gyors képnézés/kereséstörlés).
  function returnFocus(){
    const target=restore;restore=null;
    if(target?.isConnected)target.focus({preventScroll:true});
  }
  function close(){
    if(typeof dialog.close==="function"&&dialog.open)dialog.close();
    else dialog.removeAttribute("open");
    themeObserver?.disconnect();setZoom(1);returnFocus();
  }
  closeButton.addEventListener("click",close);
  prev.addEventListener("click",()=>move(-1));next.addEventListener("click",()=>move(1));
  zoomButton.addEventListener("click",()=>setZoom(scale>1?1:2.5));
  viewport.addEventListener("dblclick",ev=>{if(Date.now()-lastTouchAt<500)return;ev.preventDefault();setZoom(scale>1?1:2.5);});
  dialog.addEventListener("close",()=>{
    themeObserver?.disconnect();setZoom(1);
    if(!restore?.isConnected){restore=null;return;}
    const focused=document.activeElement;
    // Natív Escape-bezáráskor az előző vezérlő visszakaphatja a fókuszt,
    // de a felhasználó által már fókuszba helyezett külső mezőt nem írjuk felül.
    if(!focused||focused===document.body||focused===dialog||dialog.contains(focused))returnFocus();
    else restore=null;
  });
  dialog.addEventListener("click",ev=>{if(ev.target===dialog)close();});
  dialog.addEventListener("keydown",ev=>{
    if(ev.key==="ArrowLeft"||ev.key==="ArrowRight"){
      if(scale>1)return;ev.preventDefault();move(ev.key==="ArrowLeft"?-1:1);
    }else if(ev.key==="Escape"&&typeof dialog.close!=="function"){ev.preventDefault();close();}
  });
  viewport.addEventListener("touchstart",ev=>{lastTouchAt=Date.now();
    if(ev.touches.length>=2){
      const a=ev.touches[0],b=ev.touches[1];
      gesture={type:"pinch",distance:distance(a,b),scale,x,y,mid:midpoint(a,b)};
    }else if(ev.touches.length===1){
      gesture={type:scale>1?"pan":"swipe",startX:ev.touches[0].clientX,startY:ev.touches[0].clientY,x,y,moved:false};
    }
  },{passive:true});
  viewport.addEventListener("touchmove",ev=>{
    if(!gesture)return;
    if(ev.touches.length>=2){
      if(gesture.type!=="pinch"){
        const a=ev.touches[0],b=ev.touches[1];gesture={type:"pinch",distance:distance(a,b),scale,x,y,mid:midpoint(a,b)};
      }
      const a=ev.touches[0],b=ev.touches[1],mid=midpoint(a,b);
      setZoom(gesture.scale*distance(a,b)/Math.max(1,gesture.distance),gesture.x+mid.clientX-gesture.mid.clientX,gesture.y+mid.clientY-gesture.mid.clientY);
      if(ev.cancelable)ev.preventDefault();return;
    }
    if(ev.touches.length===1 && gesture.type==="pan"){
      const t=ev.touches[0];setZoom(scale,gesture.x+t.clientX-gesture.startX,gesture.y+t.clientY-gesture.startY);
      if(ev.cancelable)ev.preventDefault();
    }
  },{passive:false});
  viewport.addEventListener("touchend",ev=>{
    if(!gesture)return;
    if(gesture.type==="pinch"){
      if(ev.touches.length===1){const t=ev.touches[0];gesture={type:scale>1?"pan":"swipe",startX:t.clientX,startY:t.clientY,x,y};}
      else gesture=null;
      return;
    }
    const t=ev.changedTouches?.[0];if(!t)return;
    const dx=t.clientX-gesture.startX,dy=t.clientY-gesture.startY;
    if(gesture.type==="swipe"&&scale===1&&Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.3){move(dx<0?1:-1);lastTap=null;}
    else if(Math.abs(dx)<20&&Math.abs(dy)<20){
      const now=Date.now();
      if(lastTap&&now-lastTap.at<330&&Math.abs(t.clientX-lastTap.x)<40&&Math.abs(t.clientY-lastTap.y)<40){
        setZoom(scale>1?1:2.5);lastTap=null;
      }else lastTap={at:now,x:t.clientX,y:t.clientY};
    }
    if(ev.touches.length===0)gesture=null;
  },{passive:true});
  viewport.addEventListener("touchcancel",()=>{gesture=null;lastTap=null;},{passive:true});
  return {dialog,show,close,destroy(){themeObserver?.disconnect();close();dialog.remove();}};
}
