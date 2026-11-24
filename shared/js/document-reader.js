import { element } from "./dom.js?v=2.54";
/** A dokumentumot NEM új lapon, hanem saját vezérlésű <dialog> olvasóban nyitja. */
const el=element;
const pdfModuleUrl="https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs";
const workerUrl="https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";
let pdfModulePromise=null;
const getPdfModule=()=> pdfModulePromise??=import(pdfModuleUrl).catch((err)=>{pdfModulePromise=null;throw err;});
export function createDocumentReader(scope,platform){
  const uid=`${platform}-document-reader`;
  const dialog=el("dialog",{className:`document-reader ${platform}-document-reader`,attributes:{
    "aria-labelledby":`${uid}-title`,"aria-describedby":`${uid}-summary`
  }});
  const title=el("h2",{className:"document-reader-title",attributes:{id:`${uid}-title`}});
  const summary=el("p",{className:"document-reader-summary",attributes:{id:`${uid}-summary`}});
  const closeButton=el("button",{className:"document-reader-action document-reader-close",text:"Bezárás ×",attributes:{type:"button","aria-label":"Dokumentumnézegető bezárása"}});
  const prev=el("button",{className:"document-reader-action",text:"‹ Előző",attributes:{type:"button","aria-label":"Előző dokumentumoldal"}});
  const next=el("button",{className:"document-reader-action",text:"Következő ›",attributes:{type:"button","aria-label":"Következő dokumentumoldal"}});
  const pageLabel=el("output",{className:"document-reader-page",attributes:{"aria-live":"polite"}});
  const minus=el("button",{className:"document-reader-action",text:"−",attributes:{type:"button","aria-label":"Kicsinyítés"}});
  const plus=el("button",{className:"document-reader-action",text:"+",attributes:{type:"button","aria-label":"Nagyítás"}});
  const zoomLabel=el("output",{className:"document-reader-zoom",attributes:{"aria-live":"polite"}});
  const textToggle=el("button",{className:"document-reader-action",text:"Szöveges nézet",attributes:{type:"button","aria-pressed":"false"}});
  const download=el("a",{className:"document-reader-action document-reader-download",text:"Letöltés",attributes:{download:""}});
  const controls=el("div",{className:"document-reader-controls",attributes:{"aria-label":"Dokumentum megtekintésének vezérlése"}},prev,pageLabel,next,minus,zoomLabel,plus,textToggle,download);
  const status=el("p",{className:"document-reader-status",attributes:{role:"status","aria-live":"polite"}});
  const stage=el("div",{className:"document-reader-stage",attributes:{tabindex:"0","aria-label":"Dokumentum olvasási területe"}});
  const body=el("div",{className:"document-reader-content"},
    el("header",{className:"document-reader-header"},el("div",{},title,summary),closeButton),controls,status,stage);
  dialog.append(body); scope.append(dialog);
  let current=null,doc=null,task=null,page=1,count=1,zoom=1,plain=false,seq=0,openSeq=0,returnFocus=null;
  let cachedPageText="";
  function showStatus(message){status.textContent=message;status.hidden=!message;}
  function updateButtons(){
    const pdf=current?.kind==="pdf";
    prev.hidden=next.hidden=pageLabel.hidden=minus.hidden=plus.hidden=zoomLabel.hidden=!pdf;
    textToggle.hidden=!pdf;
    prev.disabled=page<=1;next.disabled=page>=count;
    pageLabel.textContent=`${page}. / ${count}. oldal`;zoomLabel.textContent=`${Math.round(zoom*100)}%`;
    minus.disabled=zoom<=.65;plus.disabled=zoom>=2.1;
    textToggle.setAttribute("aria-pressed",String(plain));
    textToggle.disabled=!!current && current.kind==="pdf" && !doc && !current.pageTexts?.length;
  }
  async function render(){
    if(!current||!dialog.open)return;
    const turn=++seq;stage.replaceChildren(); updateButtons();
    if(current.kind==="txt") {
      showStatus("Szöveges dokumentum betöltése…");
      try{
        const response=await fetch(current.file,{cache:"force-cache"}); if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const contents=await response.text(); if(turn!==seq||!dialog.open)return;
        if(contents.length>300000)throw new Error("A fájl túlságosan nagy az előnézethez.");
        stage.append(el("pre",{className:"document-reader-text",text:contents}));showStatus("");
      }catch(err){if(turn===seq)showStatus("A dokumentum nem tölthető be. Ellenőrizd a fájlt, vagy használd a letöltést.");}
      return;
    }
    if(current.kind!=="pdf"){
      stage.append(el("img",{className:"document-reader-picture",attributes:{src:current.file,alt:current.title}}));
      showStatus("");return;
    }
    if(plain && !doc && Array.isArray(current.pageTexts)) {
      stage.append(el("div",{className:"document-reader-pdftext",attributes:{role:"document","aria-label":`${page}. oldal szövege`},text:current.pageTexts[page-1]}));
      showStatus("A PDF szöveges előnézete látható.");return;
    }
    if(plain && doc){
      showStatus("Oldalszöveg beolvasása…");
      try {
        const p=await doc.getPage(page),data=await p.getTextContent();
        if(turn!==seq||!dialog.open)return;
        cachedPageText=data.items.map((x)=>x.str||"").join(" ");
        stage.append(el("div",{className:"document-reader-pdftext",attributes:{role:"document","aria-label":`${page}. oldal szövege`},text:cachedPageText||"Ehhez az oldalhoz nem található kinyerhető szöveg."}));
        showStatus("");
      }catch(err){if(turn===seq)showStatus("A szöveges nézet nem tölthető be.");}
      return;
    }
    if(doc){
      showStatus("PDF-oldal megjelenítése…");
      try {
        const p=await doc.getPage(page);
        const natural=p.getViewport({scale:1});
        const ideal=Math.min(1.5,Math.max(.45,Math.min(850/natural.width,900/natural.height))) * zoom;
        const ratio=Math.min(2,window.devicePixelRatio||1);
        const viewport=p.getViewport({scale:ideal*ratio});
        const canvas=el("canvas",{className:"document-reader-canvas",attributes:{role:"img","aria-label":`${current.title}, ${page}. oldal`}});
        canvas.width=Math.round(viewport.width);canvas.height=Math.round(viewport.height);
        canvas.style.width=`${Math.round(viewport.width/ratio)}px`;
        canvas.style.height=`${Math.round(viewport.height/ratio)}px`;
        stage.append(canvas);
        task=p.render({canvasContext:canvas.getContext("2d"),canvas,viewport});
        await task.promise;
        if(turn===seq && dialog.open)showStatus("");
      }catch(err){if(turn===seq)showStaticPage(turn);}
      return;
    }
    showStaticPage(turn);
  }
  function showStaticPage(turn){
    if(turn!==seq||!dialog.open)return;
    stage.replaceChildren();
    const src=current.pages?.[page-1];
    if(!src){showStatus("A PDF előnézete nem érhető el. A fájl letölthető, de külön böngészőlap nem nyílik meg.");return;}
    const image=el("img",{className:"document-reader-preview",attributes:{src,alt:`${current.title} – ${page}. oldal képes előnézete`,decoding:"async"}});
    image.style.width=`${Math.round(100*zoom)}%`;
    stage.append(image);
    showStatus("A PDF képes előnézete látható. A dinamikus PDF-megjelenítő jelenleg nem érhető el.");
  }
  async function preparePdf(openId){
    count=Math.max(1,current.pageCount||current.pages?.length||1); updateButtons();
    showStatus("PDF-olvasó betöltése…");
    try{
      const lib=await getPdfModule();if(openId!==openSeq||!dialog.open)return;
      lib.GlobalWorkerOptions.workerSrc=workerUrl;
      const job=lib.getDocument({url:current.file,withCredentials:false});
      const d=await job.promise;if(openId!==openSeq||!dialog.open){d.destroy();return;}
      doc=d;count=d.numPages;page=Math.max(1,Math.min(page,count));await render();
    }catch(err){if(openId!==openSeq||!dialog.open)return;doc=null;await render();}
  }
  function open(item,trigger){
    if(!item||item.status!=="available")return;
    openSeq++;seq++;task?.cancel?.();task=null;doc?.destroy?.();doc=null;current=item;page=1;count=item.pageCount||item.pages?.length||1;zoom=1;plain=false;
    returnFocus=trigger||document.activeElement;
    title.textContent=item.title;summary.textContent=item.summary;
    download.setAttribute("href",item.file);download.setAttribute("download",item.file.split("/").at(-1));
    if(!dialog.open){if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");}
    closeButton.focus({preventScroll:true});updateButtons();
    if(item.kind==="pdf"){ render(); preparePdf(openSeq); } else render();
  }
  function close(){if(dialog.open){if(typeof dialog.close==="function")dialog.close();else {dialog.removeAttribute("open");onClosed();}}}
  function onClosed(){if(dialog.open)return;openSeq++;seq++;current=null;doc?.destroy?.();doc=null;task?.cancel?.();task=null;stage.replaceChildren();showStatus("");if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
  const move=(n)=>{if(page+n<1||page+n>count)return;page+=n;render();};
  prev.addEventListener("click",()=>move(-1)); next.addEventListener("click",()=>move(1));
  minus.addEventListener("click",()=>{zoom=Math.max(.65,Number((zoom-.2).toFixed(2)));render();});
  plus.addEventListener("click",()=>{zoom=Math.min(2.2,Number((zoom+.2).toFixed(2)));render();});
  textToggle.addEventListener("click",()=>{plain=!plain;render();});
  closeButton.addEventListener("click",close);
  dialog.addEventListener("close",onClosed);
  dialog.addEventListener("click",(ev)=>{if(ev.target===dialog)close();});
  dialog.addEventListener("keydown",(ev)=>{
    if(ev.key==="Escape"&&typeof dialog.close!=="function"){ev.preventDefault();close();}
    // Arrows act on the document stage, not while a user is navigating controls.
    if(ev.target===stage && current?.kind==="pdf" && (ev.key==="ArrowLeft"||ev.key==="ArrowRight")){
      ev.preventDefault();move(ev.key==="ArrowLeft"?-1:1);
    }
  });
  return {dialog,open,close,destroy(){close();dialog.remove();}};
}
