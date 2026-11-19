/* Local static-site maintenance studio. Operates only on in-browser copies.
   No FTP, Github, API or remote writing is attempted. */
import {createZip,downloadBlob} from '../js/zip-native-2026.js?v=1.42.18';
import {MEDIA_ID,DOC_ID,DOC_EXT,IMAGE_TYPES,makeSlug,deepCopy,safePackagePath,sha256,validateMediaRegistry,validateDocumentRegistry,parseReleaseStamp,formatMediaRecord,canDeleteMedia} from './editor-core.js?v=1.42.18';
import {PageHistory,editedPage,sameContent,validateEditablePage,listSavedDrafts,savePageDraft,deletePageDraft,clearPageDrafts,restorePageDraft,newContentBlock} from './page-draft-core-v1-42-23.js?v=1.42.25';
import {workflowRecord,noteContentChanged,transitionWorkflow,adoptWorkflowRecord} from './content-workflow-core-v1-42-25.js?v=1.43.3';
import {createLivePreview} from '../js/live-preview-v1-42-25.js?v=1.42.25';
import {evaluateReleaseGate,synchronizePageIndex,validateReleaseGraph,validateReleaseManifest,reportCSV} from './release-policy-v1-42-26.js?v=1.43.3';
import {readVerifiedZip} from '../js/zip-integrity-v1-42-26.js?v=1.43.3';
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
  this.state=null;this.dialog=null;this.tab='media';this.changed=new Map();this.deleted=new Set();this.loadedTexts=null;this.focus=null;this.pageDrafts=new Map();this.sourcePages=new Map();this.pageHistories=new Map();this.draftWarnings=[];this.originalIndex=null;this.originalMedia=null;this.originalDocuments=null;this.lastReport=null;this.previewPanel=null;
  document.addEventListener('csanadi:c2-draft-changed',event=>{void this.acceptVisualDraft(event.detail);});
 }
 async acceptVisualDraft(detail){
  if(!this.state||!detail?.path||!detail.page)return;
  try{
   if(!this.sourcePages.has(detail.path)){
    const response=await fetch(new URL(detail.path,ROOT),{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
    this.sourcePages.set(detail.path,await response.json());
   }
   this.stagePage(detail.path,detail.page,false);
   if(!this.pageHistories.has(detail.path))this.pageHistories.set(detail.path,new PageHistory(this.sourcePages.get(detail.path)));
   this.pageHistories.get(detail.path).commit(detail.page);
   if(this.dialog?.open)this.status('A közvetlen oldalszerkesztés változása bekerült a helyi ZIP-munkapéldányba.');
  }catch(error){this.draftWarnings.push(detail.path+': '+error.message);if(this.dialog?.open)this.status('A vizuális változás összehangolása sikertelen: '+error.message,true);}
 }
 async load(){
  const results=await Promise.all(Object.values(PATHS).map(async path=>{
   const response=await fetch(new URL(path,ROOT),{cache:'no-store'});
   if(!response.ok)throw Error(path+': HTTP '+response.status);
   return response.json();
  }));
  this.state=Object.fromEntries(Object.keys(PATHS).map((key,i)=>[key,results[i]]));
  this.changed.clear();this.deleted.clear();this.loadedTexts=null;this.pageDrafts.clear();this.sourcePages.clear();this.pageHistories.clear();this.draftWarnings=[];this.originalIndex=deepCopy(this.state.pageIndex);this.originalMedia=deepCopy(this.state.media);this.originalDocuments=deepCopy(this.state.documents);this.lastReport=null;
  await this.restoreLocalDrafts();
 }
 storage(){try{return globalThis.localStorage||null;}catch{return null;}}
 release(){return this.state.manifest.release;}
 async restoreLocalDrafts(){
  let drafts=[];try{drafts=listSavedDrafts(this.storage(),this.release());}catch(error){this.draftWarnings.push('A helyi tervezetek betöltése sikertelen: '+error.message);return;}
  for(const record of drafts){
   try{
    const response=await fetch(new URL(record.path,ROOT),{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
    const original=await response.json();this.sourcePages.set(record.path,deepCopy(original));
    const page=restorePageDraft(original,record);
    const history=new PageHistory(original);history.commit(page);this.pageHistories.set(record.path,history);
    this.stagePage(record.path,page,false);
   }catch(error){this.draftWarnings.push(record.path+': '+error.message);}
  }
 }
 stagePage(url,page,persist=true){
  const original=this.sourcePages.get(url);if(!original)throw Error('Az oldal eredeti példánya nem található.');
  validateEditablePage(original,page);
  const path=url.replace(/^json\//,'');
  const item=this.state.pageIndex.pages[path];
  if(!item||item.id!==page.id||item.schemaExtensions?.route!==page.schemaExtensions?.route)throw Error('A szerkesztési útvonal vagy oldalazonosító nem egyezik.');
  if(sameContent(original,page)){
   this.pageDrafts.delete(url);this.changed.delete(url);
   Object.assign(item,deepCopy(this.originalIndex.pages[path]));
  }else{
   this.pageDrafts.set(url,deepCopy(page));this.changed.set(url,new TextEncoder().encode(safeJSON(page)));
   const search=[];const texts=value=>{if(typeof value==='string')search.push(value);else if(Array.isArray(value))for(const part of value)texts(part);else if(value&&typeof value==='object')for(const [key,part] of Object.entries(value))if(!['id','mediaId','imageId','style','className','href'].includes(key))texts(part);};
   texts(page.blocks);
   Object.assign(item,{title:page.title,menuLabel:page.menuLabel,summary:page.summary,lifecycle:deepCopy(page.lifecycle),searchText:[page.title,page.summary,...search].join(' ').slice(0,45000)});
  }
  this.state.pageIndex.searchIndexRevision=this.pageDrafts.size?'csanadi-v'+this.release().replace('csanadi-website-v',''):this.originalIndex.searchIndexRevision;
  if(this.pageDrafts.size)this.changed.set(PATHS.pageIndex,new TextEncoder().encode(safeJSON(this.state.pageIndex)));
  else this.changed.delete(PATHS.pageIndex);
  if(!persist)return '';
  try{
   const storage=this.storage();if(!storage)throw Error('A böngésző nem engedi a helyi tárolást.');
   if(this.pageDrafts.has(url))savePageDraft(storage,this.release(),url,original,page);
   else deletePageDraft(storage,this.release(),url);
   noteContentChanged(storage,this.release(),url,original,page);
   return 'A tervezet ezen az eszközön mentve.';
  }catch(error){return 'A munkapéldány mentve, de a tartós helyi tárolás sikertelen: '+error.message;}
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
  this.dialog.showModal();this.switchTab('pages');
 }
 status(message,error=false){const el=$('.cs-tool-live',this.dialog);el.textContent=message;el.classList.toggle('cs-tool-error',error);}
 switchTab(which){
  this.previewPanel?.destroy();this.previewPanel=null;
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
  this.sectionTitle(parent,'JSON-alapú oldalak szerkesztése', 'A 79 oldal címe, összefoglalója és tartalmi blokkjai szerkeszthetők. A jóváhagyott oldalak fájljait a böngésző nem írja át; csak helyi tervezet és ellenőrzött ZIP-kiadás készül.');
  const list=[];const collect=(nodes)=>{for(const n of nodes){list.push(n.path);collect(n.children||[]);}};
  collect(this.state.structure.nodes);list.unshift('pages/home.json');
  const group=node('div','cs-tool-actions');
  const pagePicker=this.select('Válassz oldalt',list.map(p=>[p,this.state.pageIndex.pages[p]?.title||p]),list[0]);
  group.append(pagePicker.wrapper);this.addButton(group,'Oldal megnyitása',()=>this.pageForm(parent,pagePicker.field.value),'cs-tool-primary');
  this.addButton(group,'Vizuális szerkesztés az oldalon',()=>{
   const chosen=this.state.pageIndex.pages[pagePicker.field.value],route=chosen?.schemaExtensions?.route;
   if(!/^#\/[a-z0-9\-/]*$/.test(route||'')){this.status('A kiválasztott oldal útvonala érvénytelen.',true);return;}
   const inMemory=[...this.changed.keys()].filter(key=>!key.startsWith('json/pages/')&&key!==PATHS.pageIndex);
   if(inMemory.length&&!confirm('A képek és dokumentumok mentetlen módosításai a navigációkor elveszhetnek. Folytatod?'))return;
   const url=new URL(location.href);url.searchParams.set('editor','1');url.hash=route;
   if(this.dialog?.open)this.dialog.close();location.assign(url.href);
  });
  parent.append(group);
  parent.append(node('p','cs-tool-note',`${this.pageDrafts.size} helyi oldaltervezet a munkapéldányban. A mentett tervezetek ezen az eszközön, ehhez a kiadáshoz kötve legfeljebb 60 napig használhatók. A keresőindex az exportban együtt frissül.`));
  try{
   const grouped={draft:0,checked:0,approved:0};
   for(const [url,page] of this.pageDrafts){const current=workflowRecord(this.storage(),this.release(),url,this.sourcePages.get(url),page);if(Object.hasOwn(grouped,current.state))grouped[current.state]++;}
   parent.append(node('p','cs-tool-note',`C3 helyi állapotok: ${grouped.draft} tervezet · ${grouped.checked} ellenőrzött · ${grouped.approved} jóváhagyott. Ezek nem szerveroldali jogosultságok.`));
   const extras=node('div','cs-tool-actions');
   this.addButton(extras,'Állapotnapló JSON letöltése',()=>{
    const entries=[...this.pageDrafts].map(([url,page])=>({path:url,...workflowRecord(this.storage(),this.release(),url,this.sourcePages.get(url),page)}));
    downloadBlob(new Blob([safeJSON({schema:1,release:this.release(),localOnly:true,entries})],{type:'application/json'}),'csanadi-c3-helyi-allapotnaplo.json');
   });
   for(const oldVersion of ['1.43.0','1.42.26','1.42.25','1.42.24']){
    const oldRelease='csanadi-website-v'+oldVersion,previous=listSavedDrafts(this.storage(),oldRelease);
    if(!previous.some(item=>!this.pageDrafts.has(item.path)))continue;
    this.addButton(extras,`v${oldVersion} helyi tervezetek átvétele`,async()=>{
     if(!confirm(`A v${oldVersion} kiadás helyi tervezeteit ellenőrzés után átvesszük. A régi mentések megmaradnak; a C3 jóváhagyást csak változatlan tartalom esetén őrizzük meg. Folytatod?`))return;
     let count=0,skipped=0,approved=0;
     for(const record of previous){
      if(this.pageDrafts.has(record.path)){skipped++;continue;}
      try{
       const response=await fetch(new URL(record.path,ROOT),{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
       const original=await response.json(),page=restorePageDraft(original,record);
       this.sourcePages.set(record.path,original);this.stagePage(record.path,page);
       if(oldVersion==='1.43.0'||oldVersion==='1.42.26'||oldVersion==='1.42.25'){
        const adopted=adoptWorkflowRecord(this.storage(),oldRelease,this.release(),record.path,original,page);
        if(adopted.state==='approved')approved++;
       }
       const history=new PageHistory(original);history.commit(page);this.pageHistories.set(record.path,history);count++;
      }catch(error){skipped++;this.draftWarnings.push(record.path+': '+error.message);}
     }
     this.switchTab('pages');this.status(`${count} tervezet átvéve, köztük ${approved} érvényes helyi jóváhagyással; ${skipped} kihagyva. A v${oldVersion} mentései megmaradtak.`);
    });
   }
   parent.append(extras);
  }catch(error){parent.append(node('p','cs-tool-warning','A C3 helyi állapotok nem tölthetők be: '+error.message));}
  for(const warning of this.draftWarnings)parent.append(node('p','cs-tool-warning',warning));
  parent.append(node('p','cs-tool-note','Az új oldalak regisztrációja és az oldalazonosítók megváltoztatása külön, ellenőrzött kiadási folyamatot igényel. A mentés nem intézményi jóváhagyás és nem FTP-feltöltés.'));
 }
 async pageForm(parent,path){
  this.previewPanel?.destroy();this.previewPanel=null;
  parent.replaceChildren();const url='json/'+path;
  try{
   if(!this.sourcePages.has(url)){
    const response=await fetch(new URL(url,ROOT),{cache:'no-store'});
    if(!response.ok)throw Error(url+': HTTP '+response.status);
    this.sourcePages.set(url,await response.json());
   }
   const original=this.sourcePages.get(url);
   if(!this.pageHistories.has(url)){
    const history=new PageHistory(original);
    if(this.pageDrafts.has(url))history.commit(this.pageDrafts.get(url));
    this.pageHistories.set(url,history);
   }
   const history=this.pageHistories.get(url),page=deepCopy(history.current);
   this.sectionTitle(parent,'Oldal szerkesztése',page.schemaExtensions.route+' · '+path);
   parent.append(node('p','cs23-draft-status',this.pageDrafts.has(url)?'Helyi tervezet · az eredeti kiadás érintetlen':'Eredeti oldal · még nincs helyi módosítás'));
   const workflowBox=node('section','cs25-workflow');workflowBox.setAttribute('aria-label','Tartalmi munkafolyamat');parent.append(workflowBox);
   const pendingNotice=node('p','cs25-unsaved-warning');parent.append(pendingNotice);
   const form=node('form','cs-tool-form'),fields={};
   for(const [key,label,type] of [['title','Oldalcím','text'],['menuLabel','Menüben megjelenő név','text'],['summary','Rövid összefoglaló','textarea']]){
    const input=this.input(label,page[key],type,key!=='summary');fields[key]=input.field;form.append(input.wrapper);
   }
   const blocks=this.input('Haladó blokkszerkesztés · érvényes JSON-tömb',safeJSON(page.blocks),'textarea',true);
   blocks.field.rows=11;blocks.wrapper.classList.add('cs-tool-json');
   const controls=node('div','cs23-editor-controls');
   const actions=node('div','cs-tool-actions');
   const save=node('button','cs-tool-button cs-tool-primary','Tervezet mentése');save.type='submit';actions.append(save);
   const undo=this.addButton(actions,'↶ Visszavonás',()=>changeHistory('undo'));
   const redo=this.addButton(actions,'↷ Újra',()=>changeHistory('redo'));
   this.addButton(actions,'Helyi tervezet elvetése',()=>{
    if(!confirm('Az oldal mentett helyi módosításai elvesszenek? A jóváhagyott oldal változatlan marad.'))return;
    this.pageHistories.set(url,new PageHistory(original));const message=this.stagePage(url,original);
    this.pageForm(parent,path);this.status('A tervezet elvetve. '+message);
   },'cs-tool-danger');
   this.addButton(actions,'Vissza az oldalakhoz',()=>this.switchTab('pages'));
   const currentFields=()=>Object.fromEntries(Object.entries(fields).map(([key,input])=>[key,input.value]));
   const parsedBlocks=()=>{const value=JSON.parse(blocks.field.value);if(!Array.isArray(value))throw Error('A blokkok mezőnek JSON-tömbnek kell lennie.');return value;};
   const readForm=items=>editedPage(original,currentFields(),items??parsedBlocks());
   const updatePendingNotice=()=>{
    try{pendingNotice.textContent=sameContent(readForm(),this.pageDrafts.get(url)||original)?'':'Mentetlen mezőváltozás: az előnézet már mutathatja az új tartalmat, de az ellenőrzött vagy jóváhagyott állapot erre még nem érvényes.';}
    catch{pendingNotice.textContent='Mentetlen vagy érvénytelen mezőérték: az állapotváltás előtt javítsd és mentsd a tervezetet.';}
   };
   const renderWorkflow=()=>{
    workflowBox.replaceChildren();
    try{
     const saved=this.pageDrafts.get(url)||original,record=workflowRecord(this.storage(),this.release(),url,original,saved);
     const labels={baseline:'Kiadott alapoldal',draft:'Tervezet',checked:'Ellenőrzött',approved:'Jóváhagyott'};
     const title=node('strong','',`C3 állapot: ${labels[record.state]||'Tervezet'}`);workflowBox.dataset.state=record.state;workflowBox.append(title);
     workflowBox.append(node('p','',record.state==='baseline'?'Az oldalhoz nincs külön helyi tervezet.':record.stale?'A korábbi ellenőrzés érvénytelen; a tartalom új tervezet.':'Ez kizárólag helyi munkafolyamat-állapot, nem intézményi jogosultság vagy közzététel.'));
     if(record.checkedAt)workflowBox.append(node('p','',`Ellenőrizve: ${new Date(record.checkedAt).toLocaleString('hu-HU')}`));
     if(record.approvedAt)workflowBox.append(node('p','',`Helyi jóváhagyás: ${new Date(record.approvedAt).toLocaleString('hu-HU')}`));
     const recent=record.history?.slice(-3)||[];
     if(recent.length)workflowBox.append(node('p','',`Napló (utolsó 3): ${recent.map(entry=>`${labels[entry.state]||entry.state} · ${new Date(entry.at).toLocaleString('hu-HU')}`).join(' | ')}`));
     if(record.state==='baseline')return;
     const buttons=node('div','cs25-workflow-actions');
     const changeState=action=>{
      try{
       const pending=readForm(),saved=this.pageDrafts.get(url)||original;
       if(!sameContent(pending,saved))throw Error('Az űrlap még nem mentett változásokat tartalmaz. Előbb mentsd a tervezetet.');
       if(action==='check'&&this.draftProblems().some(error=>error.startsWith(url+':')))throw Error('Az oldaltervezet keresőindexe vagy JSON-ja nem ment át az ellenőrzésen.');
       const next=transitionWorkflow(this.storage(),this.release(),url,original,saved,action);
       renderWorkflow();this.status(`A helyi munkafolyamat új állapota: ${labels[next.state]}. FTP-közzététel nem történt.`);
      }catch(error){this.status('Állapotváltás sikertelen: '+error.message,true);}
     };
     if(record.state==='draft')this.addButton(buttons,'✓ Ellenőrzöttnek jelölés',()=>changeState('check'),'cs-tool-primary');
     if(record.state==='checked')this.addButton(buttons,'✓ Helyi jóváhagyás',()=>changeState('approve'),'cs-tool-primary');
     if(['checked','approved'].includes(record.state))this.addButton(buttons,'Vissza tervezetbe',()=>changeState('reopen'));
     workflowBox.append(buttons);
    }catch(error){workflowBox.append(node('p','cs-tool-warning','Az állapotnapló nem olvasható: '+error.message));}
   };
   renderWorkflow();
   const commit=updated=>{
    if(!sameContent(history.current,updated))history.commit(updated);
    const message=this.stagePage(url,history.current);
    undo.disabled=!history.past.length;redo.disabled=!history.future.length;
    return message;
   };
   const changeHistory=direction=>{
    const result=direction==='undo'?history.undo():history.redo();if(!result)return;
    const message=this.stagePage(url,result);this.pageForm(parent,path);this.status((direction==='undo'?'Az előző módosítás visszavonva. ':'A módosítás ismét alkalmazva. ')+message);
   };
   const changeBlocks=mutate=>{
    try{
     const pending=readForm();if(!sameContent(history.current,pending))history.commit(pending);
     const list=deepCopy(pending.blocks);mutate(list);
     const message=commit(readForm(list));this.pageForm(parent,path);this.status(message);
    }catch(error){this.status('A blokk módosítása sikertelen: '+error.message,true);}
   };
   undo.disabled=!history.past.length;redo.disabled=!history.future.length;
   form.append(actions);
   controls.append(node('h4','','Tartalmi blokkok'));
   controls.append(node('p','cs-tool-note','A meglévő blokkazonosítók nem változnak. Itt egyszerű szövegeket és szakaszcímeket szerkeszthetsz; az összetett modulokhoz megmarad a haladó JSON-mező. A blokkok húzásos átrendezése a C2 ütem feladata.'));
   const list=node('div','cs23-block-list');controls.append(list);
   const renderList=()=>{
    list.replaceChildren();let data;
    try{data=parsedBlocks();}catch(error){list.append(node('p','cs-tool-warning','A blokklista csak érvényes JSON alapján frissül: '+error.message));return;}
    data.forEach((block,index)=>{
     const item=node('details','cs23-block-item');
     const caption=node('summary','',`${index+1}. ${block.title||block.type} · ${block.id||'azonosító nélkül'}`);item.append(caption);
     const inner=node('div','cs23-block-inner');
     const title=block.type==='section'?this.input('Szakaszcím',block.title||'','text',true):null;
     if(title)inner.append(title.wrapper);
     const markdowns=block.type==='markdown'?[block]:(Array.isArray(block.children)?block.children.filter(x=>x.type==='markdown'):[]);
     const editors=markdowns.map((child,i)=>{const input=this.input(`Markdown-szöveg ${i+1}`,child.data?.text||'','textarea');input.field.rows=5;inner.append(input.wrapper);return {id:child.id,field:input.field};});
     if(!title&&!editors.length)inner.append(node('p','cs-tool-note','Ehhez az összetett modulhoz a haladó JSON-mező használható.'));
     if(title||editors.length)this.addButton(inner,'Mezők alkalmazása',()=>changeBlocks(items=>{
      const target=items[index];if(target.id!==block.id)throw Error('A blokklista megváltozott, frissítsd a nézetet.');
      if(title)target.title=title.field.value.trim();
      for(const field of editors){const entry=target.type==='markdown'?target:target.children.find(x=>x.id===field.id);if(!entry||entry.type!=='markdown')throw Error('A szövegblokk már nem található.');entry.data={...(entry.data||{}),text:field.field.value};}
     }),'cs-tool-primary');
     this.addButton(inner,'Blokk eltávolítása',()=>{
      if(!confirm('Biztosan törlöd ezt a blokkot a helyi tervezetből? A művelet visszavonható.'))return;
      changeBlocks(items=>{if(items[index]?.id!==block.id)throw Error('A blokklista megváltozott.');items.splice(index,1);});
     },'cs-tool-danger');
     item.append(inner);list.append(item);
    });
   };
   renderList();
   const add=node('div','cs23-new-block');add.append(node('h4','','Új tartalmi blokk'));
   const type=this.select('Blokk típusa',[['section','Címes szakasz'],['markdown','Egyszerű szövegblokk']],'section');
   const newTitle=this.input('Szakaszcím (szakasz esetén)','');
   const newText=this.input('Tartalom (Markdown)','','textarea');newText.field.rows=4;
   add.append(type.wrapper,newTitle.wrapper,newText.wrapper);
   this.addButton(add,'+ Blokk hozzáadása',()=>changeBlocks(items=>items.push(newContentBlock(type.field.value,newTitle.field.value,newText.field.value,items))),'cs-tool-primary');
   controls.append(add);
   this.addButton(controls,'Blokklista frissítése a JSON-mezőből',renderList);
   form.append(controls,blocks.wrapper);
   form.addEventListener('submit',event=>{
    event.preventDefault();try{const message=commit(readForm());this.switchTab('pages');this.status('Oldal és keresőindex előkészítve. '+message);}catch(error){this.status('A tervezet mentése sikertelen: '+error.message,true);}
   });
   const preview=createLivePreview({route:page.schemaExtensions.route,title:page.title});this.previewPanel=preview;
   const previewLaunch=node('div','cs-tool-actions');const previewButton=this.addButton(previewLaunch,'Élő előnézet megnyitása',()=>{
    if(preview.element.hidden){preview.show();previewButton.textContent='Előnézet bezárása';syncPreview();preview.element.scrollIntoView?.({behavior:'smooth',block:'nearest'});}
    else{preview.hide();previewButton.textContent='Élő előnézet megnyitása';}
   },'cs-tool-primary');
   const syncPreview=()=>{
    if(preview.element.hidden)return;
    try{preview.updateDraft(url,readForm());}catch(error){preview.error(error.message);}
   };
   let updateTimer=null;form.addEventListener('input',()=>{updatePendingNotice();clearTimeout(updateTimer);updateTimer=setTimeout(syncPreview,260);});
   const layout=node('div','cs25-editor-layout');layout.append(form,preview.element);
   parent.append(previewLaunch,layout);
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
 draftProblems(){
  const problems=[];
  for(const [url,page] of this.pageDrafts){
   try{
    const original=this.sourcePages.get(url);validateEditablePage(original,page);
    const entry=this.state.pageIndex.pages[url.replace(/^json\//,'')];
    if(!entry||entry.title!==page.title||entry.summary!==page.summary||entry.id!==page.id)throw Error('A keresőindex nem egyezik a szerkesztett oldallal.');
    if(!this.changed.has(url)||!this.changed.has(PATHS.pageIndex))throw Error('A kiadási csomagból hiányzik egy szerkesztett JSON.');
   }catch(error){problems.push(url+': '+error.message);}
  }
  return problems;
 }
 async releasePages(){
  const paths=Object.keys(this.state.pageIndex.pages).map(path=>'json/'+path),queue=[...paths],pages=new Map();
  const load=async()=>{
   while(queue.length){
    const path=queue.shift();
    if(this.pageDrafts.has(path)){pages.set(path,deepCopy(this.pageDrafts.get(path)));continue;}
    const response=await fetch(new URL(path,ROOT),{cache:'no-store'});
    if(!response.ok)throw Error('Hiányzó oldal: '+path+' (HTTP '+response.status+')');
    const page=await response.json();pages.set(path,page);
    if(!this.sourcePages.has(path))this.sourcePages.set(path,deepCopy(page));
   }
  };
  await Promise.all(Array.from({length:5},load));
  return [...paths].map(path=>[path,pages.get(path)]);
 }
 async preflightRelease(){
  this.status('C4 ellenőrzés: a 79 oldal és az állománykapcsolatok vizsgálata…');
  const pages=await this.releasePages();
  const synchronized=synchronizePageIndex(this.state.pageIndex,pages);
  if(this.pageDrafts.size)synchronized.index.searchIndexRevision='csanadi-v'+this.release().replace('csanadi-website-v','');
  const staged=new Set([...Object.keys(this.state.manifest.files),...this.changed.keys()]);
  for(const path of this.deleted)staged.delete(path);
  const gate=evaluateReleaseGate({drafts:[...this.pageDrafts],sourcePages:this.sourcePages,release:this.release(),storage:this.storage(),
   media:this.state.media,documents:this.state.documents,originalMedia:this.originalMedia,originalDocuments:this.originalDocuments,changedPaths:[...this.changed.keys()]});
  const graph=validateReleaseGraph({pages,pageIndex:synchronized.index,structure:this.state.structure,media:this.state.media,documents:this.state.documents,filePaths:[...staged]});
  const errors=[...gate.errors,...graph.errors,...this.draftProblems()];
  for(const path of this.changed.keys())if(!safePackagePath(path))errors.push('Nem megengedett kiadási útvonal: '+path);
  const report={schemaVersion:'1.0.0',sourceRelease:this.release(),localOnly:true,createdAt:new Date().toISOString(),
   status:errors.length?'blocked':'ready',counts:graph.counts,approvedDrafts:gate.statuses.approved,indexSynced:synchronized.updated,
   errors:[...new Set(errors)],warnings:[...new Set([...gate.warnings,...graph.warnings])],requiresManualBrowserQA:true,requiresInstitutionalApproval:true};
  this.lastReport=report;
  return {report,index:synchronized.index,pages};
 }
 downloadPreflightReport(kind){
  if(!this.lastReport){this.status('Előbb futtasd a teljes C4 ellenőrzést.',true);return;}
  const json=kind==='json';
  const data=json?safeJSON(this.lastReport):reportCSV(this.lastReport);
  downloadBlob(new Blob([data],{type:json?'application/json':'text/csv;charset=utf-8'}),`csanadi-c4-ellenorzes.${json?'json':'csv'}`);
 }
 async showValidation(parent){
  this.sectionTitle(parent,'Kiadás előtti ellenőrzés','A sémák, azonosítók, állományhivatkozások és a szerkesztett változatok ellenőrzése. A teljes közzétételhez intézményi tartalmi és jogi jóváhagyás is szükséges.');
  const problems=[...validateMediaRegistry(this.state.media),...validateDocumentRegistry(this.state.documents),...this.draftProblems()];
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
  const c4=node('section','cs26-check-result');c4.append(node('h4','','C4 · Teljes kiadási előellenőrzés'));
  c4.append(node('p','','A jóváhagyott tervezeteket, az összes JSON-oldalt, a keresőindexet, a média- és dokumentumhivatkozásokat közösen vizsgálja. Hiba esetén a jóváhagyott kiadás tiltott.'));
  const buttons=node('div','cs-tool-actions');
  this.addButton(buttons,'Teljes C4 ellenőrzés indítása',async()=>{
   try{
    const {report}=await this.preflightRelease();
    result.replaceChildren(node('strong','',report.status==='ready'?'A helyi kiadási kapu megfelelt.':`${report.errors.length} blokkoló hiba`));
    result.append(node('p','',`${report.counts.pages} oldal · ${report.counts.media} média · ${report.counts.documents} dokumentum · ${report.approvedDrafts} jóváhagyott helyi tervezet`));
    if(report.errors.length){const list=node('ul');for(const error of report.errors.slice(0,80))list.append(node('li','',error));result.append(list);}
    if(report.warnings.length){const list=node('ul');for(const warning of report.warnings.slice(0,30))list.append(node('li','',warning));result.append(node('p','','Nyitott, nem automatikusan blokkoló figyelmeztetések:'),list);}
    this.status(report.status==='ready'?'A C4 technikai kapuk megfeleltek. A böngészős és intézményi átvétel külön szükséges.':'A kiadás blokkolva. Javítsd a jelzett hibákat.',report.status!=='ready');
   }catch(error){this.status('A teljes C4 ellenőrzés nem végezhető el: '+error.message,true);}
  },'cs-tool-primary');
  this.addButton(buttons,'Jelentés JSON',()=>this.downloadPreflightReport('json'));
  this.addButton(buttons,'Jelentés CSV',()=>this.downloadPreflightReport('csv'));
  c4.append(buttons);const result=node('div','cs26-check-details');c4.append(result);parent.append(c4);
 }
 showRelease(parent){
  this.sectionTitle(parent,'Teljes statikus honlap ZIP-exportja','Az export a teljes aktuális kiadást újra összeállítja az eredeti állományokból, a képek és dokumentumok módosításaiból, valamint a helyi oldalszerkesztő változásaiból. Nem tölt fel FTP-re vagy GitHubra.');
  parent.append(node('p','cs-tool-note','A C3 ellenőrzött és jóváhagyott állapotai kizárólag helyi munkafolyamat-jelölések. Nem jelentenek intézményi engedélyt, és a C4 ellenőrzött kiadási kapuit nem helyettesítik.'));
  parent.append(node('p','cs-tool-summary',`${this.changed.size} módosított vagy új állomány · ${this.deleted.size} eltávolítandó állomány`));
  if(this.deleted.size){parent.append(node('p','cs-tool-note','Figyelem: ha az FTP-re csak felülmásolod a ZIP-et, a korábban ott lévő törölt fájlok megmaradnak. A törlésükről külön gondoskodni kell.'));const list=node('ul','cs-tool-deletions');for(const f of this.deleted)list.append(node('li','',f));parent.append(list);}
  const row=node('div','cs-tool-actions');this.addButton(row,'Ellenőrzött teljes ZIP elkészítése',()=>this.makeFullRelease(),'cs-tool-primary');
  this.addButton(row,'Változtatások visszavonása',async()=>{
   if(!confirm('Minden helyi módosítás és e kiadáshoz mentett oldaltervezet elvesszen?'))return;
   try{if(this.storage())clearPageDrafts(this.storage(),this.release());}catch(error){this.status('A helyi tervezettár törlése sikertelen: '+error.message,true);return;}
   await this.load();this.switchTab('media');
  });parent.append(row);
  const restore=node('section','cs26-check-result');restore.append(node('h4','','Korábbi kiadás helyi visszaállítási próbája'));
  restore.append(node('p','','Válassz egy korábban jóváhagyott teljes ZIP-et. A fájl kizárólag a böngésző memóriájába kerül: minden állomány CRC32-, SHA-256- és manifestellenőrzésen megy át. A próba nem írja át az aktuális honlapot és nem tölt fel FTP-re.'));
  const upload=this.input('Korábbi teljes ZIP fájl','','file');upload.field.accept='.zip,application/zip';restore.append(upload.wrapper);
  const proof=node('p','cs26-restore-result');proof.setAttribute('role','status');proof.setAttribute('aria-live','polite');
  this.addButton(restore,'Visszaállítási próba',async()=>{
   const file=upload.field.files?.[0];if(!file){this.status('Előbb válassz teljes ZIP-fájlt.',true);return;}
   try{
    const verified=await readVerifiedZip(file,{retainFiles:true,onProgress:(done,total)=>{if(done%140===1)this.status(`Helyi ZIP visszaolvasása: ${done}/${total}`);}});
    const isolated=new Map(verified.files);
    if(isolated.size!==verified.count||!isolated.has('index.html')||!isolated.has('json/page-index.json'))throw Error('A helyreállított példányból alapfájl hiányzik.');
    proof.textContent=`Sikeres helyi visszaállítási szimuláció: ${verified.release} · ${verified.count} állomány · ${(verified.bytesVerified/1048576).toFixed(1)} MiB ellenőrzött adat.`;
    this.status('A ZIP külön memóriabeli példányba kibontható és minden ellenőrzőösszeg egyezik. A tényleges FTP-visszaállítás külön kézi feladat.');
   }catch(error){proof.textContent='A visszaállítási próba sikertelen.';this.status('A korábbi ZIP nem felelt meg: '+error.message,true);}
  },'cs-tool-primary');
  const procedure=node('details','cs26-rollback-checklist');procedure.append(node('summary','','Kézi FTP-visszaállítás ellenőrzőlistája'));
  const steps=node('ol');for(const item of [
   'Őrizd meg a korábbi, külön jóváhagyott teljes kiadási ZIP-et.',
   'A régi csomagot bontsd ki külön, majd ellenőrizd a benne lévő manifestet és fájlokat.',
   'Az FTP-visszaállítást csak az intézmény külön engedélyével végezd.',
   'Az új kiadásban eltávolított, de az FTP-n megmaradt állományokat külön ellenőrizd.',
   'A visszaállítás után ellenőrizd a menüt, az aloldalakat, a témákat és a média-/dokumentumhivatkozásokat.'
  ])steps.append(node('li','',item));procedure.append(steps);restore.append(procedure);
  restore.append(proof);parent.append(restore);
  parent.append(node('p','cs-tool-note','A ZIP csak a böngésző által elérhető kiinduló állományokból építhető össze, ezért az exporthoz internetkapcsolat vagy helyi HTTP-kiszolgáló szükséges. Ellenőrizd a kiadást feltöltés előtt.'));
 }
 async makeFullRelease(){
  const errors=[...validateMediaRegistry(this.state.media),...validateDocumentRegistry(this.state.documents),...this.draftProblems()];
  if(errors.length){this.status('A ZIP nem készíthető el: '+errors.slice(0,3).join('; '),true);return;}
  let check;
  try{check=await this.preflightRelease();}
  catch(error){this.status('A ZIP előellenőrzése sikertelen: '+error.message,true);return;}
  if(check.report.errors.length){this.status('A jóváhagyott ZIP nem készíthető el: '+check.report.errors.slice(0,3).join('; '),true);return;}
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
   const config=deepCopy(this.state.config);config.performance.cacheVersion='csanadi-r-v'+nextVersion;
   entries.set(PATHS.config,new TextEncoder().encode(safeJSON(config)));
   const nextIndex=deepCopy(check.index);nextIndex.searchIndexRevision='csanadi-v'+nextVersion;
   entries.set(PATHS.pageIndex,new TextEncoder().encode(safeJSON(nextIndex)));
   entries.set(PATHS.media,new TextEncoder().encode(safeJSON(this.state.media)));
   entries.set(PATHS.documents,new TextEncoder().encode(safeJSON(this.state.documents)));
   const files={};let processed=0;
   for(const [path,bytes] of [...entries].sort(([a],[b])=>a.localeCompare(b))){
    files[path]={sizeBytes:bytes.length,sha256:await sha256(bytes)};
    if(++processed%90===0)this.status(`SHA-256 ellenőrzőlista: ${processed}/${entries.size}`);
   }
   const manifest={schemaVersion:'1.0.0',release:`csanadi-website-v${nextVersion}`,date:today(),ftpCompatible:true,bootstrap:'CDN bootstrap@5.3.9',notes:'C4 ellenőrzött helyi ZIP-export. Csak a változatlanul jóváhagyott C3-tervezetek és a hitelesített új médiák/dokumentumok kerülhetnek bele. A manifest tartalmazza az állományok méretét és SHA-256 értékét. Az intézményi, böngészős és FTP-közzétételi engedélyek külön szükségesek.',files};
   const manifestIssues=validateReleaseManifest(manifest,entries);
   if(manifestIssues.length)throw Error('A kiadási manifest nem megfelelő: '+manifestIssues.slice(0,3).join('; '));
   entries.set('release-manifest.json',new TextEncoder().encode(safeJSON(manifest)));
   this.status('ZIP összeállítása…');const zip=await createZip(entries,()=>{});
   this.status('ZIP visszaolvasása, CRC32 és SHA-256 ellenőrzés…');
   const checked=await readVerifiedZip(zip,{expectedRelease:manifest.release,onProgress:(done,total)=>{if(done%140===1)this.status(`ZIP integritása: ${done}/${total}`);}});
   if(checked.count!==entries.size)throw Error('Az ellenőrzött ZIP fájlszáma eltér.');
   this.lastReport={...check.report,outputRelease:manifest.release,zipFileCount:checked.count,zipSizeBytes:zip.size,zipVerified:true};
   downloadBlob(zip,`csanadi-website-v${nextVersion}-${token}.zip`);
   this.status(`${entries.size} állományos, visszaolvasással és SHA-256-tal igazolt teljes ZIP elkészült (${(zip.size/1048576).toFixed(1)} MiB). A nyilvános FTP változatlan; külön kézi engedély és telepítés szükséges.`);
  }catch(error){console.error('ZIP-kiadás hiba:',error);this.status('A ZIP nem készült el: '+error.message,true);}
  finally{if(launch)launch.disabled=false;}
 }
}
