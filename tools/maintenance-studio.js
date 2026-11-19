/* Local static-site maintenance studio. Operates only on in-browser copies.
   No FTP, Github, API or remote writing is attempted. */
import {createZip,downloadBlob} from '../js/zip-native-2026.js?v=1.42.18';
import {MEDIA_ID,DOC_ID,DOC_EXT,IMAGE_TYPES,makeSlug,deepCopy,safePackagePath,sha256,validateMediaRegistry,validateDocumentRegistry,parseReleaseStamp,formatMediaRecord,canDeleteMedia} from './editor-core.js?v=1.42.18';
const ROOT=new URL('../',import.meta.url);
const PATHS={media:'json/media-library.json',documents:'json/data/documents.json',config:'json/config.json',manifest:'release-manifest.json',pageIndex:'json/page-index.json',structure:'json/structure.json'};
const $=(sel,root=document)=>root.querySelector(sel);
const node=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=String(txt);return el;};
const safeJSON=x=>JSON.stringify(x,null,2)+'\n';
const today=()=>new Date().toISOString().slice(0,10);
const mimeForDoc=file=>DOC_EXT[file.name.split('.').at(-1).toLowerCase()]||null;
const unique=(items)=>[...new Set(items)];
let openStudio=null;
export async function openMaintenanceStudio(){
 if(!openStudio)openStudio=new Studio();
 await openStudio.open();
}
export function initStudio(){
 if(openStudio)return;
 const btn=node('button','cs-tool-launch','Szerkesztői műhely');btn.type='button';
 btn.title='Kizárólag helyi szerkesztés és letölthető teljes ZIP-csomag';
 const row=node('div','cs-tool-entry');row.append(btn,node('p','', 'Helyi szerkesztés · távoli mentés nélkül'));
 document.body.append(row);
 btn.addEventListener('click',async()=>{
  btn.disabled=true;btn.textContent='Szerkesztő betöltése…';
  try{if(!openStudio)openStudio=new Studio();await openStudio.open();}
  catch(error){alert('A szerkesztő nem indult: '+error.message);console.error(error);}
  finally{btn.disabled=false;btn.textContent='Szerkesztői műhely';}
 });
}
class Studio{
 constructor(){
  this.state=null;this.dialog=null;this.tab='media';this.changed=new Map();this.deleted=new Set();this.loadedTexts=null;this.focus=null;this.pageDrafts=new Map();
 }
 async load(){
  const results=await Promise.all(Object.values(PATHS).map(async path=>{
   const response=await fetch(new URL(path,ROOT),{cache:'no-store'});
   if(!response.ok)throw Error(path+': HTTP '+response.status);
   return response.json();
  }));
  this.state=Object.fromEntries(Object.keys(PATHS).map((key,i)=>[key,results[i]]));
  this.changed.clear();this.deleted.clear();this.loadedTexts=null;this.pageDrafts.clear();
 }
 async open(){
  if(this.dialog?.open){this.dialog.focus();return;}
  if(!this.state)await this.load();
  this.focus=document.activeElement;
  if(!this.dialog){
   this.dialog=node('dialog','cs-tool-dialog');this.dialog.setAttribute('aria-label','Helyi szerkesztői műhely');
   this.dialog.innerHTML=`<div class="cs-tool-head"><div><span class="cs-tool-kicker">CSANÁDI · HELYI SZERKESZTÉS</span><h2>Szerkesztői műhely</h2><p>Csak a böngésző memóriáját módosítja. A változtatásokat külön ZIP-csomagban lehet letölteni és ellenőrzés után, kézzel feltölteni.</p></div><button type="button" class="cs-tool-close" aria-label="Szerkesztő bezárása">×</button></div><nav class="cs-tool-tabs" aria-label="Szerkesztő funkciók"><button type="button" data-tab="pages">Oldalak</button><button type="button" data-tab="media">Képek</button><button type="button" data-tab="documents">Dokumentumok</button><button type="button" data-tab="validate">Ellenőrzés</button><button type="button" data-tab="release">ZIP-kiadás</button></nav><div class="cs-tool-body" aria-live="polite"></div><p class="cs-tool-live" role="status" aria-live="polite"></p>`;
   document.body.append(this.dialog);
   $('.cs-tool-close',this.dialog).addEventListener('click',()=>this.dialog.close());
   this.dialog.addEventListener('close',()=>this.focus?.focus?.());
   this.dialog.addEventListener('click',event=>{const button=event.target.closest('button[data-tab]');if(button)this.switchTab(button.dataset.tab);});
  }
  this.dialog.showModal();this.switchTab('media');
 }
 status(message,error=false){const el=$('.cs-tool-live',this.dialog);el.textContent=message;el.classList.toggle('cs-tool-error',error);}
 switchTab(which){
  this.tab=which;
  for(const b of this.dialog.querySelectorAll('button[data-tab]')){b.setAttribute('aria-selected',String(b.dataset.tab===which));}
  const body=$('.cs-tool-body',this.dialog);body.replaceChildren();this.status('');
  if(which==='pages')this.showPages(body);
  if(which==='media')this.showMedia(body);
  if(which==='documents')this.showDocuments(body);
  if(which==='validate')this.showValidation(body);
  if(which==='release')this.showRelease(body);
 }
 input(label,value='',type='text',required=false){
  const wrapper=node('label','cs-tool-field');wrapper.append(node('span','',label));
  const field=type==='textarea'?node('textarea'):node('input');
  if(type!=='textarea')field.type=type;
  field.value=value==null?'':String(value);field.required=required;
  if(type==='textarea')field.rows=3;
  wrapper.append(field);return {wrapper,field};
 }
 select(label,entries,selected){
  const wrapper=node('label','cs-tool-field');wrapper.append(node('span','',label));const field=node('select');
  for(const [value,text] of entries){const option=node('option','',text);option.value=value;field.append(option);}
  field.value=selected;wrapper.append(field);return {wrapper,field};
 }
 sectionTitle(parent,title,description){
  parent.append(node('h3','',title),node('p','cs-tool-note',description));
 }
 addButton(parent,text,callback,style=''){const b=node('button','cs-tool-button '+style,text);b.type='button';b.addEventListener('click',callback);parent.append(b);return b;}
 showPages(parent){
  this.sectionTitle(parent,'JSON-alapú oldalak szerkesztése', 'A 78 oldal magyar címe, összefoglalója és tartalmi blokkjai szerkeszthetők. A belső angol fájlútvonal és a nyilvános #/ URL nem változik.');
  const list=[];const collect=(nodes)=>{for(const n of nodes){list.push(n.path);collect(n.children||[]);}};
  collect(this.state.structure.nodes);list.unshift('pages/home.json');
  const group=node('div','cs-tool-actions');
  const pagePicker=this.select('Válassz oldalt',list.map(p=>[p,this.state.pageIndex.pages[p]?.title||p]),list[0]);
  group.append(pagePicker.wrapper);this.addButton(group,'Oldal megnyitása',()=>this.pageForm(parent,pagePicker.field.value),'cs-tool-primary');
  parent.append(group);
  parent.append(node('p','cs-tool-note','A szerkesztés után a keresőindex ugyanabban a kiadásban frissül. Az új oldalak regisztrációja és az oldalazonosítók megváltoztatása külön, ellenőrzött kiadási folyamatot igényel.'));
 }
 async pageForm(parent,path){
  parent.replaceChildren();const url='json/'+path;
  try{
   const page=this.pageDrafts.has(url)?deepCopy(this.pageDrafts.get(url)):
    await (async()=>{const response=await fetch(new URL(url,ROOT),{cache:'no-store'});if(!response.ok)throw Error(url+': HTTP '+response.status);return response.json();})();
   this.sectionTitle(parent,'Oldal szerkesztése',page.schemaExtensions.route+' · '+path);
   const form=node('form','cs-tool-form');const fields={};
   for(const [key,label,type] of [['title','Oldalcím','text'],['menuLabel','Menüben megjelenő név','text'],['summary','Rövid összefoglaló','textarea']]){
    const f=this.input(label,page[key],type,true);fields[key]=f.field;form.append(f.wrapper);
   }
   const blocks=this.input('Tartalmi blokkok (érvényes JSON-tömb)',safeJSON(page.blocks),'textarea',true);
   blocks.field.rows=17;blocks.wrapper.classList.add('cs-tool-json');form.append(blocks.wrapper);
   const actions=node('div','cs-tool-actions');const save=node('button','cs-tool-button cs-tool-primary','Oldal mentése');save.type='submit';actions.append(save);this.addButton(actions,'Vissza',()=>this.switchTab('pages'));form.append(actions);
   form.addEventListener('submit',event=>{
    event.preventDefault();
    try{
     const parsed=JSON.parse(blocks.field.value);
     if(!Array.isArray(parsed)||parsed.length>200)throw Error('A tartalomnak legfeljebb 200 elemből álló JSON-tömbnek kell lennie.');
     const blockIds=new Set();let count=0;
     const visit=(blocks,depth)=>{if(depth>12)throw Error('A tartalom túl mélyen van egymásba ágyazva.');
      for(const block of blocks){
       if(!block||typeof block!=='object'||typeof block.id!=='string'||typeof block.type!=='string'||blockIds.has(block.id))throw Error('Hiányzó vagy ismétlődő blokkazonosító.');
       blockIds.add(block.id);if(++count>1000)throw Error('Túl sok tartalmi blokk.');
       if(block.children){if(!Array.isArray(block.children))throw Error('A beágyazott children mezőnek tömbnek kell lennie.');visit(block.children,depth+1);}
      }};
     visit(parsed,1);
     const updated=deepCopy(page);
     for(const key of ['title','menuLabel','summary']){const value=fields[key].value.trim();if(value.length<3||value.length>3000)throw Error('Érvénytelen szövegmező: '+key);updated[key]=value;}
     updated.blocks=parsed;updated.updatedAt=new Date().toISOString();
     updated.lifecycle.revision=(Number(page.lifecycle.revision)||0)+1;
     if(updated.id!==this.state.pageIndex.pages[path]?.id||updated.schemaExtensions.route!==this.state.pageIndex.pages[path]?.schemaExtensions?.route)throw Error('Az oldalazonosító vagy útvonal nem módosítható.');
     this.pageDrafts.set(url,updated);
     this.changed.set(url,new TextEncoder().encode(safeJSON(updated)));
     const info=this.state.pageIndex.pages[path];
     const search=[];
     const texts=(v)=>{if(typeof v==='string')search.push(v);else if(Array.isArray(v))for(const x of v)texts(x);else if(v&&typeof v==='object')for(const [key,x] of Object.entries(v))if(!['id','mediaId','imageId','style','className','href'].includes(key))texts(x);};
     texts(parsed);
     Object.assign(info,{title:updated.title,menuLabel:updated.menuLabel,summary:updated.summary,lifecycle:updated.lifecycle,searchText:[updated.title,updated.summary,...search].join(' ').slice(0,45000)});
     this.state.pageIndex.searchIndexRevision='csanadi-v1.42.18';
     this.changed.set('json/page-index.json',new TextEncoder().encode(safeJSON(this.state.pageIndex)));
     this.switchTab('pages');this.status('Az oldal és a hozzá tartozó keresőindex a helyi kiadási munkapéldányban frissült.');
    }catch(error){this.status('Az oldal mentése sikertelen: '+error.message,true);}
   });parent.append(form);
  }catch(error){this.status(error.message,true);this.addButton(parent,'Vissza',()=>this.switchTab('pages'));}
 }
 showMedia(parent){
  this.sectionTitle(parent,'Képtár kezelése',`Jelenleg ${this.state.media.items.length} bejegyzés. Hozzáadás, metaadat-módosítás, képcsere és ellenőrzött törlés. Az eredeti, más oldalak által használt képek törlését blokkoljuk.`);
  const actions=node('div','cs-tool-actions');this.addButton(actions,'+ Új kép',()=>this.mediaForm(parent,null),'cs-tool-primary');
  const search=this.input('Keresés a képek között','','search');search.wrapper.classList.add('cs-tool-search');actions.append(search.wrapper);parent.append(actions);
  const table=node('div','cs-tool-list');parent.append(table);
  const draw=()=>{
   table.replaceChildren();const q=makeSlug(search.field.value);
   const items=this.state.media.items.filter(x=>!q||makeSlug(x.id+' '+x.alt+' '+x.caption).includes(q));
   for(const m of items.slice(0,250)){
    const row=node('div','cs-tool-item');const img=node('img');img.src=new URL(m.original.path,ROOT).href;img.alt='';img.loading='lazy';
    const desc=node('div','cs-tool-item-content');desc.append(node('strong','',m.id),node('span','',m.alt));
    const buttons=node('div','cs-tool-item-actions');this.addButton(buttons,'Szerkesztés',()=>this.mediaForm(parent,m.id));this.addButton(buttons,'Törlés',()=>this.deleteMedia(m.id),'cs-tool-danger');
    row.append(img,desc,buttons);table.append(row);
   }
   if(items.length>250)table.append(node('p','cs-tool-note',`${items.length-250} további találat: szűkítsd a keresést.`));
   if(!items.length)table.append(node('p','','Nincs találat.'));
  };
  search.field.addEventListener('input',draw);draw();
 }
 mediaForm(parent,id){
  parent.replaceChildren();const existing=this.state.media.items.find(x=>x.id===id)||null;
  this.sectionTitle(parent,existing?'Kép szerkesztése':'Új kép hozzáadása','A képfájlok helyben WebP formátumra konvertálódnak, 320/640/960 px-es változatokkal. Egyedi azonosítóval jelennek meg a médiatárban.');
  const form=node('form','cs-tool-form');
  const fields={};const data=[['slug','Azonosító (media: nélkül)',existing?.id.slice(6)||'', 'text'],['alt','Képleírás (alt)',existing?.alt||'','textarea'],['caption','Képaláírás',existing?.caption||'','textarea'],['holder','Jogtulajdonos',existing?.rights?.holder||'Intézményi jóváhagyás szükséges','text'],['license','Felhasználási engedély',existing?.rights?.license||'Közzététel előtt intézményi jóváhagyás szükséges','textarea']];
  for(const [key,label,value,type] of data){const control=this.input(label,value,type,true);form.append(control.wrapper);fields[key]=control.field;}
  if(existing)fields.slug.readOnly=true;
  const approval=this.select('Jogosultsági állapot', [['pending','Jóváhagyásra vár'],['user-provided','Felhasználó által átadott'],['verified','Jóváhagyott']],existing?.rights?.clearance||'pending');form.append(approval.wrapper);
  const choose=this.input('Kép feltöltése'+(existing?' (üresen hagyva a régi kép marad)':''),'','file');choose.field.accept='.png,.jpg,.jpeg,.webp';form.append(choose.wrapper);
  const buttons=node('div','cs-tool-actions');const save=node('button','cs-tool-button cs-tool-primary','Mentés');save.type='submit';buttons.append(save);this.addButton(buttons,'Vissza',()=>this.switchTab('media'));form.append(buttons);
  form.addEventListener('submit',async ev=>{
   ev.preventDefault();save.disabled=true;
   try{
    const slug=makeSlug(fields.slug.value),newId='media:'+slug;if(!MEDIA_ID.test(newId))throw Error('Legalább három karakteres angol azonosítót adj meg.');
    if(!existing&&this.state.media.items.some(x=>x.id===newId))throw Error('Ez a médiaazonosító már szerepel.');
    const file=choose.field.files?.[0];if(!existing&&!file)throw Error('Új képhez képfájlt kell választani.');
    let original=existing?.original,variants=existing?.variants;
    if(file){
     const generated=await this.prepareImage(file,slug);original=generated.original;variants=generated.variants;
     if(existing)for(const p of [existing.original.path,...existing.variants.map(v=>v.path)])if(p.startsWith('assets/media/custom/'))this.deleted.add(p);
     for(const [path,bytes] of generated.bytes)this.changed.set(path,bytes);
    }
    const rights={clearance:approval.field.value,holder:fields.holder.value.trim(),license:fields.license.value.trim()};
    if(!fields.alt.value.trim()||!rights.holder||!rights.license)throw Error('A képleírás és a jogi mezők kötelezők.');
    const m=formatMediaRecord({id:newId,alt:fields.alt.value.trim(),caption:fields.caption.value.trim(),rights,original,variants,decorative:false});
    if(existing){const pos=this.state.media.items.indexOf(existing);this.state.media.items[pos]=m;}else this.state.media.items.push(m);
    this.changed.set(PATHS.media,new TextEncoder().encode(safeJSON(this.state.media)));
    this.status('A kép módosítása helyben elkészült. Közzétételhez ZIP-export szükséges.');this.switchTab('media');
   }catch(error){this.status(error.message,true);}finally{save.disabled=false;}
  });parent.append(form);
 }
 async prepareImage(file,slug){
  if(!IMAGE_TYPES.has(file.type)||file.size>15*1024*1024)throw Error('PNG, JPG vagy WebP szükséges, legfeljebb 15 MB méretben.');
  let bitmap;try{bitmap=await createImageBitmap(file);}catch{throw Error('A kiválasztott kép nem olvasható.');}
  const originalWidth=Math.min(bitmap.width,1920);if(bitmap.width<16||bitmap.height<16)throw Error('A kép túl kicsi.');
  const widths=unique([originalWidth,...[320,640,960].filter(w=>w<originalWidth)]).sort((a,b)=>a-b);
  const all=[],bytes=new Map();
  for(const width of widths){
   const height=Math.max(1,Math.round(bitmap.height*width/bitmap.width));
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   canvas.getContext('2d',{alpha:false}).drawImage(bitmap,0,0,width,height);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.85));if(!blob)throw Error('WebP képkonverzió nem támogatott.');
   const b=new Uint8Array(await blob.arrayBuffer());const path=`assets/media/custom/${slug}-${width}.webp`;
   bytes.set(path,b);all.push({path,mimeType:'image/webp',width,height,sizeBytes:b.length,sha256:await sha256(b)});
   canvas.width=0;canvas.height=0;
  }
  bitmap.close?.();const original=all.find(v=>v.width===originalWidth);
  return {original,variants:all,bytes};
 }
 async referenceTexts(){
  if(this.loadedTexts)return this.loadedTexts;
  const paths=Object.keys(this.state.manifest.files).filter(p=>p.endsWith('.json')&&!Object.values(PATHS).includes(p));
  const result=[];let i=0;
  for(const path of paths){
   try{const response=await fetch(new URL(path,ROOT),{cache:'no-store'});if(response.ok)result.push([path,await response.text()]);}catch{}
   if(++i%25===0)this.status(`Hivatkozások ellenőrzése: ${i}/${paths.length}`);
  }
  this.loadedTexts=result;return result;
 }
 async deleteMedia(id){
  try{
   const item=this.state.media.items.find(m=>m.id===id);if(!item)return;
   const texts=await this.referenceTexts();
   const staged=[...this.changed.entries()].filter(([path])=>path.endsWith('.json')).map(([path,bytes])=>[path,new TextDecoder().decode(bytes)]);
   const refs=canDeleteMedia(id,[...texts.filter(([path])=>!this.changed.has(path)),...staged]);
   if(!refs.allowed)throw Error('A kép más oldalon használatban van: '+refs.references.slice(0,4).join(', ')+'. Előbb cseréld le a hivatkozásokat.');
   if(!confirm('Biztosan törlöd a médiatárból: '+id+'? A korábbi FTP-fájlokat közzétételkor külön is törölni kell.'))return;
   this.state.media.items=this.state.media.items.filter(x=>x.id!==id);
   for(const path of unique([item.original.path,...item.variants.map(v=>v.path)])){
    if(!this.state.media.items.some(x=>x.original.path===path||x.variants.some(v=>v.path===path)))this.deleted.add(path);
   }
   this.changed.set(PATHS.media,new TextEncoder().encode(safeJSON(this.state.media)));this.switchTab('media');
  }catch(error){this.status(error.message,true);}
 }
 showDocuments(parent){
  this.sectionTitle(parent,'Dokumentumtár kezelése',`Jelenleg ${this.state.documents.documents.length} dokumentum. Új PDF/DOCX/TXT feltöltés, metaadat-módosítás, új verzió, archiválás, visszavonás vagy törlés.`);
  const actions=node('div','cs-tool-actions');this.addButton(actions,'+ Új dokumentum',()=>this.documentForm(parent,null),'cs-tool-primary');
  const search=this.input('Keresés','','search');actions.append(search.wrapper);parent.append(actions);
  const list=node('div','cs-tool-list');parent.append(list);
  const draw=()=>{
   list.replaceChildren();const q=makeSlug(search.field.value);
   for(const d of this.state.documents.documents.filter(x=>!q||makeSlug(x.title+' '+x.id).includes(q))){
    const row=node('div','cs-tool-item');const desc=node('div','cs-tool-item-content');desc.append(node('strong','',d.title),node('span','',`${d.id} · ${d.status} · v${d.version}`));
    const actions=node('div','cs-tool-item-actions');this.addButton(actions,'Szerkesztés',()=>this.documentForm(parent,d.id));this.addButton(actions,'Törlés',()=>this.deleteDocument(d.id),'cs-tool-danger');
    row.append(desc,actions);list.append(row);
   }
   if(!list.children.length)list.append(node('p','','Nincs találat.'));
  };
  search.field.addEventListener('input',draw);draw();
 }
 documentForm(parent,id){
  parent.replaceChildren();const current=this.state.documents.documents.find(d=>d.id===id)||null;
  this.sectionTitle(parent,current?'Dokumentum szerkesztése':'Új dokumentum', 'Az új állományokat helyben ellenőrizzük; a módosítás csak a ZIP-export után adható át feltöltésre. Hivatalos iratot csak igazolt jóváhagyással jelölj.');
  const form=node('form','cs-tool-form'),fields={};
  for(const [key,label,value,type] of [
    ['slug','Azonosító (document: nélkül)',current?.id.slice(9)||'','text'],
    ['title','Dokumentum címe',current?.title||'','text'],
    ['summary','Összefoglaló (legalább 20 karakter)',current?.summary||'','textarea'],
    ['tags','Címkék (vesszővel)',current?.tags?.join(', ')||'','text'],
    ['keywords','Kulcsszavak (vesszővel)',current?.keywords?.join(', ')||'','text'],
    ['version','Verzió (x.y.z)',current?.version||'1.0.0','text'],
    ['change','A verzió rövid indoklása','Dokumentum feltöltve vagy frissítve','textarea']
  ]){const field=this.input(label,value,type,true);fields[key]=field.field;form.append(field.wrapper);}
  if(current)fields.slug.readOnly=true;
  const cat=this.select('Dokumentumkategória',this.state.documents.categories.map(c=>[c.id,c.label]),current?.categoryId||this.state.documents.categories[0].id);form.append(cat.wrapper);
  const kind=this.select('Fajta', [['guide','Segédlet'],['form','Nyomtatvány'],['policy','Szabályzat'],['publication','Közzététel'],['other','Egyéb']],current?.documentKind||'guide');form.append(kind.wrapper);
  const status=this.select('Állapot',[['published','Aktuális'],['archived','Archív'],['withdrawn','Visszavont (fájl eltávolítása)']],current?.status||'published');form.append(status.wrapper);
  const official=this.input('Intézményileg jóváhagyott, hivatalos dokumentum','', 'checkbox');official.field.checked=!!current?.official;form.append(official.wrapper);
  const uploaded=this.input('Dokumentumfájl (PDF, DOCX, TXT)','', 'file');uploaded.field.accept='.pdf,.docx,.txt';form.append(uploaded.wrapper);
  const actions=node('div','cs-tool-actions'),save=node('button','cs-tool-button cs-tool-primary','Mentés');save.type='submit';actions.append(save);this.addButton(actions,'Vissza',()=>this.switchTab('documents'));form.append(actions);
  form.addEventListener('submit',async event=>{
   event.preventDefault();save.disabled=true;
   try{
    const slug=makeSlug(fields.slug.value),id='document:'+slug,vers=fields.version.value.trim();
    if(!DOC_ID.test(id))throw Error('A dokumentumazonosító túl rövid vagy érvénytelen.');
    if(!/^\d+\.\d+\.\d+$/.test(vers))throw Error('Hibás verzió (példa: 1.0.1).');
    if(!current&&this.state.documents.documents.some(d=>d.id===id))throw Error('A dokumentumazonosító már létezik.');
    const title=fields.title.value.trim(),summary=fields.summary.value.trim(),change=fields.change.value.trim();
    if(title.length<5||summary.length<20||change.length<5)throw Error('A cím, az összefoglaló vagy a verzióindoklás túl rövid.');
    const file=uploaded.field.files?.[0],newStatus=status.field.value;
    if(!current&&newStatus!=='withdrawn'&&!file)throw Error('Új dokumentumhoz fájlt is válassz.');
    if(current&&vers!==current.version){
     const old=current.version.split('.').map(Number),next=vers.split('.').map(Number);
     if(next.find((n,i)=>n!==old[i])===undefined||next.join('.')===old.join('.')||next[0]<old[0]||(next[0]===old[0]&&next[1]<old[1])||(next[0]===old[0]&&next[1]===old[1]&&next[2]<=old[2]))throw Error('Az új verziószámnak nagyobbnak kell lennie a korábbinál.');
    }
    if(current&&file&&vers===current.version)throw Error('Új fájlverzióhoz növeld a verziószámot.');
    let filePath=current?.filePath??null,fileName=current?.fileName??null,fileSizeBytes=current?.fileSizeBytes??null,sha=current?.sha256??null,mime=current?.mimeType||'application/pdf';
    if(file&&newStatus!=='withdrawn'){
     const ext=file.name.split('.').at(-1).toLowerCase(),mimeType=mimeForDoc(file);
     if(!mimeType||file.size>30*1024*1024||!file.size)throw Error('Legfeljebb 30 MB-os PDF, DOCX vagy TXT állományt válassz.');
     const bytes=new Uint8Array(await file.arrayBuffer());
     if(ext==='pdf'&&new TextDecoder('ascii').decode(bytes.slice(0,5))!=='%PDF-')throw Error('A fájl nem érvényes PDF-nek tűnik.');
     if(ext==='docx'&&!(bytes[0]===80&&bytes[1]===75))throw Error('Érvénytelen DOCX állomány.');
     fileName=`${slug}-${vers.replaceAll('.','-')}.${ext}`;filePath=`assets/documents/${fileName}`;
     fileSizeBytes=bytes.length;sha=await sha256(bytes);mime=mimeType;
     this.changed.set(filePath,bytes);
     if(current?.filePath&&current.filePath!==filePath)this.deleted.add(current.filePath);
    }
    if(newStatus==='withdrawn'){
     if(current?.filePath)this.deleted.add(current.filePath);
     filePath=fileName=fileSizeBytes=sha=null;
    }
    const tags=unique(fields.tags.value.split(',').map(s=>s.trim()).filter(Boolean));
    const keywords=unique(fields.keywords.value.split(',').map(s=>s.trim()).filter(Boolean));
    const history=current?deepCopy(current.versionHistory):[];
    if(!current||vers!==current.version)history.push({version:vers,date:today(),change});
    const item={id,title,summary,categoryId:cat.field.value,tags,keywords,status:newStatus,documentKind:kind.field.value,mimeType:mime,
     fileName,filePath,fileSizeBytes,sha256:sha,version:vers,publishedAt:current?.publishedAt||today(),validFrom:current?.validFrom||today(),validTo:current?.validTo??null,relatedRoutes:current?.relatedRoutes||[],official:official.field.checked,versionHistory:history};
    if(current)this.state.documents.documents[this.state.documents.documents.indexOf(current)]=item;
    else this.state.documents.documents.push(item);
    this.state.documents.updatedAt=today();
    const errors=validateDocumentRegistry(this.state.documents);
    if(errors.length){
     if(current)this.state.documents.documents[this.state.documents.documents.indexOf(item)]=current;
     else this.state.documents.documents=this.state.documents.documents.filter(x=>x!==item);
     throw Error(errors[0]);
    }
    this.changed.set(PATHS.documents,new TextEncoder().encode(safeJSON(this.state.documents)));
    this.switchTab('documents');this.status('A dokumentum módosítása a helyi munkapéldányba került.');
   }catch(error){this.status(error.message,true);}finally{save.disabled=false;}
  });parent.append(form);
 }
 async deleteDocument(id){
  const d=this.state.documents.documents.find(x=>x.id===id);if(!d)return;
  try{
   const references=(await this.referenceTexts()).filter(([path,source])=>source.includes(id)||(d.filePath&&source.includes(d.filePath))).map(([path])=>path);
   if(references.length)throw Error('A dokumentum másik oldalon hivatkozott: '+references.slice(0,4).join(', ')+'. A törlés előtt módosítsd ezeket az oldalakat.');
   if(d.filePath){
   const texts=await this.referenceTexts();
   const staged=[...this.changed.entries()].filter(([path])=>path.endsWith('.json')).map(([path,bytes])=>[path,new TextDecoder().decode(bytes)]);
   const refs=[...texts.filter(([path])=>!this.changed.has(path)),...staged].filter(([path,text])=>path!=='json/data/documents.json'&&text.includes(d.filePath)).map(([path])=>path);
   if(refs.length){this.status('A fájlt más oldalak használják, ezért nem törölhető: '+refs.slice(0,3).join(', '),true);return;}
  }
  if(!confirm(`Biztosan törlöd a dokumentumtárból: ${d.title}? A távoli FTP-n maradó régi fájlt külön kell eltávolítani.`))return;
   this.state.documents.documents=this.state.documents.documents.filter(x=>x.id!==id);
   if(d.filePath&&!this.state.documents.documents.some(x=>x.filePath===d.filePath))this.deleted.add(d.filePath);
   this.state.documents.updatedAt=today();
   this.changed.set(PATHS.documents,new TextEncoder().encode(safeJSON(this.state.documents)));this.switchTab('documents');
  }catch(error){this.status(error.message,true);}
 }
 async showValidation(parent){
  this.sectionTitle(parent,'Kiadás előtti ellenőrzés','A sémák, azonosítók, állományhivatkozások és a szerkesztett változatok ellenőrzése. A teljes közzétételhez intézményi tartalmi és jogi jóváhagyás is szükséges.');
  const problems=[...validateMediaRegistry(this.state.media),...validateDocumentRegistry(this.state.documents)];
  for(const path of this.changed.keys())if(!safePackagePath(path))problems.push('Nem megengedett fájlútvonal: '+path);
  for(const item of this.state.media.items){
   const variants=[item.original,...item.variants];
   for(const variant of variants)if(!this.changed.has(variant.path)&&!this.deleted.has(variant.path)&&!this.state.manifest.files[variant.path])problems.push('Hiányzó kép: '+variant.path);
  }
  for(const d of this.state.documents.documents)if(d.filePath&&!this.changed.has(d.filePath)&&!this.state.manifest.files[d.filePath])problems.push('Hiányzó dokumentum: '+d.filePath);
  const heading=node('p','cs-tool-summary',problems.length?`${problems.length} ellenőrizendő hiba`:'A szerkezeti ellenőrzés sikeres');parent.append(heading);
  if(problems.length){const list=node('ul');for(const m of problems.slice(0,100))list.append(node('li','',m));parent.append(list);}
  const pending=this.state.media.items.filter(i=>i.rights?.clearance==='pending').length;
  parent.append(node('p','cs-tool-note',`${pending} képnél külön jogosultsági jóváhagyás szükséges. Ez nem technikai hiba, de nyilvános közzétételnél ellenőrizni kell.`));
  const box=node('div','cs-tool-actions');this.addButton(box,'Médiatár JSON letöltése',()=>downloadBlob(new Blob([safeJSON(this.state.media)],{type:'application/json'}),'media-library.json'));
  this.addButton(box,'Dokumentumtár JSON letöltése',()=>downloadBlob(new Blob([safeJSON(this.state.documents)],{type:'application/json'}),'documents.json'));
  parent.append(box);
 }
 showRelease(parent){
  this.sectionTitle(parent,'Teljes statikus honlap ZIP-exportja','Az export a teljes aktuális kiadást újra összeállítja az eredeti állományokból, a képek és dokumentumok módosításaiból, valamint a helyi oldalszerkesztő változásaiból. Nem tölt fel FTP-re vagy GitHubra.');
  parent.append(node('p','cs-tool-summary',`${this.changed.size} módosított vagy új állomány · ${this.deleted.size} eltávolítandó állomány`));
  if(this.deleted.size){parent.append(node('p','cs-tool-note','Figyelem: ha az FTP-re csak felülmásolod a ZIP-et, a korábban ott lévő törölt fájlok megmaradnak. A törlésükről külön gondoskodni kell.'));const list=node('ul','cs-tool-deletions');for(const f of this.deleted)list.append(node('li','',f));parent.append(list);}
  const row=node('div','cs-tool-actions');this.addButton(row,'Teljes ZIP elkészítése',()=>this.makeFullRelease(),'cs-tool-primary');
  this.addButton(row,'Változtatások visszavonása',async()=>{if(!confirm('Minden helyi módosítás elvesszen?'))return;await this.load();this.switchTab('media');});parent.append(row);
  parent.append(node('p','cs-tool-note','A ZIP csak a böngésző által elérhető kiinduló állományokból építhető össze, ezért az exporthoz internetkapcsolat vagy helyi HTTP-kiszolgáló szükséges. Ellenőrizd a kiadást feltöltés előtt.'));
 }
 async makeFullRelease(){
  const errors=[...validateMediaRegistry(this.state.media),...validateDocumentRegistry(this.state.documents)];
  if(errors.length){this.status('A ZIP nem készíthető el: '+errors.slice(0,3).join('; '),true);return;}
  const launch=this.dialog.querySelector('.cs-tool-primary');if(launch)launch.disabled=true;
  try{
   const stamp=parseReleaseStamp(),token=`content-${stamp}`;
   const match=/^csanadi-website-v(\d+)\.(\d+)\.(\d+)$/.exec(this.state.manifest.release);
   if(!match)throw Error('A kiinduló kiadás azonosítója nem megfelelő.');
   const currentVersion=`${match[1]}.${match[2]}.${match[3]}`,nextVersion=`${match[1]}.${match[2]}.${Number(match[3])+1}`;
   const entries=new Map();const sourceFiles=Object.entries(this.state.manifest.files).filter(([p])=>p!=='release-manifest.json'&&!this.deleted.has(p));
   let completed=0;const queue=[...sourceFiles];
   const loadOne=async()=>{
    while(queue.length){
     const [path,original]=queue.shift();
     if(!safePackagePath(path)&&!['index.html','offline.html','service-worker.js','script.js','robots.txt','sitemap.xml'].includes(path))throw Error('Tiltott kiadási útvonal: '+path);
     const replacement=this.changed.get(path);let bytes;
     if(replacement){bytes=replacement;}
     else{
      const result=await fetch(new URL(path,ROOT),{cache:'no-store'});
      if(!result.ok)throw Error('Hiányzó kiadási állomány: '+path+' (HTTP '+result.status+')');
      bytes=new Uint8Array(await result.arrayBuffer());
      if(bytes.byteLength!==original.sizeBytes||await sha256(bytes)!==original.sha256)throw Error('A kiinduló fájl ellenőrzőösszege eltér: '+path);
     }
     if(/\.(?:js|html|css)$/.test(path)){
      let txt=new TextDecoder().decode(bytes);
      txt=txt.replaceAll('v='+currentVersion,'v='+nextVersion).replaceAll('csanadi-r-v'+currentVersion,'csanadi-r-v'+nextVersion);
      if(path==='service-worker.js')txt=`/* local editor revision: ${token} */\n`+txt.replace("const RELEASE_ID='"+currentVersion+"'","const RELEASE_ID='"+nextVersion+"'");
      bytes=new TextEncoder().encode(txt);
     }
     entries.set(path,bytes);
     if(++completed%35===0)this.status(`A kiadási csomag összeállítása: ${completed}/${sourceFiles.length}`);
    }
   };
   await Promise.all(Array.from({length:5},loadOne));
   for(const [path,bytes] of this.changed)if(!this.deleted.has(path))entries.set(path,bytes);
   // The ZIP is a new complete release, not merely a JSON overlay.
   const config=deepCopy(this.state.config);config.performance.cacheVersion='csanadi-r-v'+nextVersion;
   entries.set(PATHS.config,new TextEncoder().encode(safeJSON(config)));
   entries.set(PATHS.media,new TextEncoder().encode(safeJSON(this.state.media)));
   entries.set(PATHS.documents,new TextEncoder().encode(safeJSON(this.state.documents)));
   const files={};let processed=0;
   for(const [path,bytes] of [...entries].sort(([a],[b])=>a.localeCompare(b))){
    files[path]={sizeBytes:bytes.length,sha256:await sha256(bytes)};
    if(++processed%90===0)this.status(`SHA-256 ellenőrzőlista: ${processed}/${entries.size}`);
   }
   const manifest={schemaVersion:'1.0.0',release:`csanadi-website-v${nextVersion}`,date:today(),ftpCompatible:true,bootstrap:'CDN bootstrap@5.3.9',notes:'Helyi szerkesztői ZIP-export, intézményi ellenőrzés és kézi publikálás szükséges. A kiadási állomány tartalmazza a változtatásokat és nem tartalmazza a törölt fájlokat.',files};
   entries.set('release-manifest.json',new TextEncoder().encode(safeJSON(manifest)));
   this.status('ZIP tömörítése…');const zip=await createZip(entries,()=>{});
   downloadBlob(zip,`csanadi-website-v${nextVersion}-${token}.zip`);
   this.status(`${entries.size} fájlos teljes ZIP elkészült (${(zip.size/1048576).toFixed(1)} MB). A régi FTP-fájlok szükséges törlését külön végezd el.`);
  }catch(error){console.error('ZIP-kiadás hiba:',error);this.status('A ZIP nem készült el: '+error.message,true);}
  finally{if(launch)launch.disabled=false;}
 }
}
