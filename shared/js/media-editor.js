import { element } from "./dom.js?v=2.53";
import { checkedMediaCenter } from "./media-data.js?v=2.53";
const el=element;
/** Csak localhost + ?media-editor=1 esetén hívott, offline JSON-exportáló szerkesztő. */
export function createMediaEditor(scope,config,onUpdate){
  const draft=structuredClone(config);
  const original=JSON.stringify(config.mediaCenter.items);
  const toolbar=el("div",{className:"media-editor-launch"});
  const open=el("button",{text:"Szerkesztői médiaellenőrzés",attributes:{type:"button"}});
  toolbar.append(open,el("p",{text:config.mediaCenter.editorNotice}));scope.append(toolbar);
  const dialog=el("dialog",{className:"media-editor-dialog",attributes:{"aria-labelledby":"media-editor-heading"}});
  const heading=el("h2",{text:"Médiatár szerkesztői ellenőrzése",attributes:{id:"media-editor-heading"}});
  const itemSelect=el("select",{attributes:{"aria-label":"Szerkesztendő kép"}});
  for(const item of draft.mediaCenter.items)itemSelect.append(el("option",{text:`${item.id} – ${item.title}`,attributes:{value:item.id}}));
  const preview=el("img",{className:"media-editor-preview",attributes:{alt:"Kép előnézete"}});
  const status=el("p",{className:"media-editor-status",attributes:{role:"status","aria-live":"polite"}});
  const fields={};
  const form=el("form",{className:"media-editor-form"});
  const textFields=[['title','Kép címe','text'],['alt','Alternatív szöveg','text'],['caption','Képleírás','textarea']];
  for(const [field,label,kind] of textFields){
    const input=el(kind==='textarea'?'textarea':'input',{attributes:kind==='textarea'?{rows:3,maxlength:350,required:""}:{type:"text",maxlength:350,required:""}});
    fields[field]=input;form.append(el("label",{},el("span",{text:label}),input));
  }
  const dropdowns=[
    ['category','Kategória',draft.mediaCenter.categories.filter(x=>x.id!=='all')],
    ...[['sport','Sportág'],['schoolYear','Tanév'],['event','Rendezvény']].map(([k,label])=>[k,label,draft.mediaCenter.albums[k].filter(x=>x.id!=='all')]),
    ['href','Kapcsolódó oldal',draft.menu.items.flatMap(x=>x.children).map(x=>({id:`#/oldal/${x.id}`,label:x.label}))]
  ];
  for(const [field,label,options] of dropdowns){
    const input=el("select",{attributes:{"aria-label":label}});
    for(const item of options)input.append(el("option",{text:item.label,attributes:{value:item.id}}));
    fields[field]=input;form.append(el("label",{},el("span",{text:label}),input));
  }
  const save=el("button",{text:"Adatok ellenőrzése és mentése a munkapéldányba",attributes:{type:"submit"}});
  const exportButton=el("button",{text:"Ellenőrzött site.json letöltése",attributes:{type:"button"}});
  const dismiss=el("button",{text:"Bezárás",attributes:{type:"button"}});
  form.append(save);
  const getItem=()=>draft.mediaCenter.items.find(i=>i.id===itemSelect.value);
  function load(){
    const item=getItem();if(!item)return;
    preview.src=item.responsive['400'];preview.alt=item.alt;
    for(const key of ['title','alt','caption','category','href'])fields[key].value=item[key];
    for(const key of ['sport','schoolYear','event'])fields[key].value=item.album[key];
    status.textContent='Csak helyi szerkesztés; az éles honlap nem változik.';
  }
  function apply(){
    const item=getItem();
    for(const key of ['title','alt','caption','category','href'])item[key]=fields[key].value.trim();
    for(const key of ['sport','schoolYear','event'])item.album[key]=fields[key].value;
    checkedMediaCenter(draft);onUpdate?.();
    itemSelect.selectedOptions[0].textContent=`${item.id} – ${item.title}`;
    status.textContent='Sikeresen ellenőrizve. Az exportálás külön művelet, feltöltés nem történt.';
  }
  itemSelect.addEventListener('change',load);
  form.addEventListener('submit',ev=>{ev.preventDefault();try{apply();}catch(e){status.textContent=`Hibás adat: ${e.message}`;}});
  exportButton.addEventListener('click',()=>{
    try{apply();}catch(e){status.textContent=`Exportálási hiba: ${e.message}`;return;}
    const file=new Blob([JSON.stringify(draft,null,2)+'\n'],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(file),a=el('a',{attributes:{href:url,download:'site.json'}});
    dialog.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
    status.textContent='JSON létrehozva. Ellenőrzés, képi variánsépítés és kézi telepítés szükséges.';
  });
  dismiss.addEventListener('click',()=>dialog.close());
  open.addEventListener('click',()=>{load();dialog.showModal();});
  dialog.append(heading,el('p',{text:'A fájlok és képek csak ellenőrizhetők, a képfeltöltés nem automatikus. A szerkesztés a kiadott ZIP-et nem módosítja.'}),
    el('label',{},el('span',{text:'Kép kiválasztása'}),itemSelect),preview,form,status,
    el('div',{className:'media-editor-actions'},exportButton,dismiss));
  scope.append(dialog);load();
  return {dialog,destroy(){dialog.close?.();dialog.remove();toolbar.remove();},hasChanges(){return original!==JSON.stringify(draft.mediaCenter.items);}};
}
