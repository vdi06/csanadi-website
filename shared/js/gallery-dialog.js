import { element } from "./dom.js?v=2.41";

/** Natív, fókuszt csapdázó dialog. A képek címe és leírása a központi JSON-ból érkezik. */
export function createGalleryDialog(scope, platform) {
  const el=element;
  const dialog=el("dialog",{className:`${platform}-media-dialog media-dialog`,attributes:{
    "aria-labelledby":`${platform}-media-dialog-title`,
    "aria-describedby":`${platform}-media-dialog-description`
  }});
  const closeButton=el("button",{className:"media-dialog-close",text:"×",attributes:{
    type:"button","aria-label":"Képnézet bezárása"}});
  const image=el("img",{className:"media-dialog-image",attributes:{alt:"",decoding:"async"}});
  const title=el("h2",{attributes:{id:`${platform}-media-dialog-title`}});
  const description=el("p",{attributes:{id:`${platform}-media-dialog-description`}});
  const related=el("a",{className:"media-dialog-related",text:"Kapcsolódó oldal megnyitása"});
  const counter=el("span",{className:"media-dialog-counter",attributes:{"aria-live":"polite"}});
  const prev=el("button",{className:"media-dialog-arrow",text:"‹",attributes:{type:"button","aria-label":"Előző kép"}});
  const next=el("button",{className:"media-dialog-arrow",text:"›",attributes:{type:"button","aria-label":"Következő kép"}});
  dialog.append(el("div",{className:"media-dialog-content"},
    el("div",{className:"media-dialog-toolbar"},counter,closeButton),
    el("div",{className:"media-dialog-stage"},prev,image,next),
    el("div",{className:"media-dialog-details"},title,description,related)));
  scope.append(dialog);
  let items=[],index=0,restore=null,startTouch=null;
  function display() {
    const item=items[index];
    if (!item) return;
    image.setAttribute("src",item.src);
    image.setAttribute("alt",item.alt);
    title.textContent=item.title;
    description.textContent=`${item.caption} ${item.alt}`;
    related.setAttribute("href",item.href);
    counter.textContent=`${index+1} / ${items.length}`;
    prev.disabled=items.length<2; next.disabled=items.length<2;
  }
  function show(data,selected,focusEl) {
    if (!data.length) return;
    items=data.slice(); index=Math.max(0,Math.min(items.length-1,selected));
    restore=focusEl||document.activeElement; display();
    if (typeof dialog.showModal==="function") {
      if (!dialog.open) dialog.showModal();
      closeButton.focus();
    } else {
      // Teszt- vagy régi böngésző esetére; a modern Chromium natív dialogot használ.
      dialog.setAttribute("open",""); closeButton.focus?.();
    }
  }
  const move=(offset)=>{if(items.length<2)return;index=(index+offset+items.length)%items.length;display();};
  function close(){if(typeof dialog.close==="function"&&dialog.open) dialog.close();else {
    dialog.removeAttribute("open"); restore?.focus?.();
  }}
  closeButton.addEventListener("click",close);
  prev.addEventListener("click",()=>move(-1)); next.addEventListener("click",()=>move(1));
  dialog.addEventListener("close",()=>{if(restore?.isConnected)restore.focus({preventScroll:true});});
  dialog.addEventListener("click",(ev)=>{if(ev.target===dialog)close();});
  dialog.addEventListener("keydown",(ev)=>{
    if(ev.key==="ArrowLeft" || ev.key==="ArrowRight") {ev.preventDefault();move(ev.key==="ArrowLeft"?-1:1);}
    else if(ev.key==="Escape" && typeof dialog.close!=="function") { ev.preventDefault();close(); }
  });
  if (platform==="mobile") {
    dialog.addEventListener("touchstart",(ev)=>{startTouch=ev.touches?.[0]?.clientX??null;},{passive:true});
    dialog.addEventListener("touchend",(ev)=>{
      const x=ev.changedTouches?.[0]?.clientX;
      if (startTouch!==null && typeof x==="number" && Math.abs(x-startTouch)>65)
        move(x<startTouch?1:-1);
      startTouch=null;
    },{passive:true});
  }
  return {dialog,show,close,destroy(){close();dialog.remove();}};
}
