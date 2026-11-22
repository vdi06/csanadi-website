import {PageHistory,editedPage,sameContent,sourceSignature,listSavedDrafts,restorePageDraft,savePageDraft,deletePageDraft} from '../tools/page-draft-core-v1-42-23.js?v=1.45';
import {reorderBlock,reorderItem,siblingMove,itemMove,restoreOriginalOrder} from '../tools/visual-order-core-v1-42-24.js?v=1.45';
import {noteContentChanged} from '../tools/content-workflow-core-v1-42-25.js?v=1.45';

const sessions=new Map();
const activeMarks=new Set();
const make=(tag,className='',text='')=>{const element=document.createElement(tag);element.className=className;if(text)element.textContent=text;return element;};

export function visualEditingEnabled(){
 try{return new URLSearchParams(location.search).get('editor')==='1';}catch{return false;}
}

function storage(){try{return globalThis.localStorage||null;}catch{return null;}}

function sessionFor(original,path,release){
 const signature=sourceSignature(original);
 let session=sessions.get(path);
 if(!session||session.signature!==signature||session.release!==release){
  session={path,release,original,signature,history:new PageHistory(original),editing:false,status:'',nextFocus:null};
  sessions.set(path,session);
  if(sessions.size>45)sessions.delete(sessions.keys().next().value);
 }
 return session;
}

export function resolveVisualDraft(original,path,release){
 const session=sessionFor(original,path,release);
 let warning='',saved=null;
 try{
  const record=listSavedDrafts(storage(),release).find(item=>item.path===path);
  if(record)saved=restorePageDraft(original,record);
 }catch(error){warning='A tervezet nem tölthető be: '+error.message;}
 const next=saved||original;
 if(!sameContent(session.history.current,next))session.history.commit(next);
 return {page:session.history.current,warning};
}

function publishDraft(session,page){
 const storageArea=storage();if(!storageArea)throw Error('A böngésző helyi tárolója nem érhető el.');
 if(sameContent(session.original,page))deletePageDraft(storageArea,session.release,session.path);
 else savePageDraft(storageArea,session.release,session.path,session.original,page);
 noteContentChanged(storageArea,session.release,session.path,session.original,page);
 document.dispatchEvent(new CustomEvent('csanadi:c2-draft-changed',{detail:{path:session.path,page}}));
}

function nameFor(element){
 return (element.querySelector(':scope > h2, :scope > h3, h2, h3, .card-title, figcaption')?.textContent||element.textContent||'Tartalmi elem').trim().slice(0,65);
}

function clearMarks(){
 for(const item of activeMarks)item.classList.remove('cs24-before','cs24-after');
 activeMarks.clear();
}

function markTarget(element,placement){
 clearMarks();if(!element)return;
 element.classList.add(placement==='before'?'cs24-before':'cs24-after');activeMarks.add(element);
}

function placementAt(element,y){const box=element.getBoundingClientRect();return y<box.top+box.height/2?'before':'after';}

function targetInfo(element){
 if(element.dataset.cs24Owner)return {kind:'item',owner:element.dataset.cs24Owner,index:Number(element.dataset.cs24Item)};
 return {kind:'block',id:element.dataset.cs24Id};
}

function sameGroup(a,b,page){
 if(a.kind!==b.kind)return false;
 if(a.kind==='item')return a.owner===b.owner&&a.index!==b.index;
 if(a.id===b.id)return false;
 const find=(blocks,id)=>{for(const block of blocks){if(block.id===id)return blocks;if(block.children){const found=find(block.children,id);if(found)return found;}}return null;};
 const first=find(page.blocks,a.id);return Boolean(first)&&first===find(page.blocks,b.id);
}

function groupCards(article){
 for(const owner of article.querySelectorAll('[data-cs24-items-owner]')){
  const grid=owner.matches('.features-grid,.image-gallery')?owner:owner.querySelector('.features-grid,.image-gallery');
  if(!grid)continue;
  const cards=[...grid.children].filter(element=>element.matches('.feature-card,.gallery-item'));
  cards.forEach((card,index)=>{
   const frame=make('div','cs24-card-frame');frame.dataset.cs24Owner=owner.dataset.cs24ItemsOwner;frame.dataset.cs24Item=String(index);
   grid.replaceChild(frame,card);frame.append(card);
  });
 }
}

export function attachVisualEditor(root,original,path,release,{rerender,warning=''}={}){
 const article=root.querySelector('.cs92-article');if(!article)return;
 const session=sessionFor(original,path,release);
 const toolbar=make('div','cs24-toolbar');toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Közvetlen vizuális szerkesztés');
 const title=make('strong','cs24-toolbar-title','Aloldali elrendezés');
 const toggle=make('button','cs24-action cs24-toggle',session.editing?'✓ Szerkesztés befejezése':'✥ Elrendezés szerkesztése');toggle.type='button';
 toggle.setAttribute('aria-pressed',String(session.editing));
 const undo=make('button','cs24-action','↶ Visszavonás'),redo=make('button','cs24-action','↷ Újra');
 const reset=make('button','cs24-action','Eredeti sorrend'),exportButton=make('button','cs24-action','↓ Oldal JSON');
 const studio=make('button','cs24-action','Teljes ZIP műhely'),preview=make('button','cs24-action','Élő előnézet');
 for(const button of [undo,redo,reset,exportButton,studio,preview])button.type='button';
 const actions=make('div','cs24-toolbar-actions');actions.append(toggle,undo,redo,reset,exportButton,preview,studio);
 const live=make('p','cs24-status',warning||session.status||'A fogópontok szerkesztési módban jelennek meg. A változások csak helyben mentődnek.');
 live.setAttribute('role','status');live.setAttribute('aria-live','polite');
 toolbar.append(title,actions,live);article.prepend(toolbar);
 article.classList.toggle('cs24-editing',session.editing);
 undo.disabled=!session.history.past.length;redo.disabled=!session.history.future.length;

 const announce=(message,isError=false)=>{session.status=message;live.textContent=message;live.classList.toggle('is-error',isError);};
 const redraw=(focusKey=null)=>{
  session.nextFocus=focusKey;
  rerender?.();
  if(focusKey){const focused=root.querySelector(`[data-cs24-handle-key="${CSS.escape(focusKey)}"]`);focused?.focus({preventScroll:true});}
 };
 const apply=(page,focusKey)=>{
  if(!page)return;
  try{
   const updated=editedPage(original,{title:page.title,menuLabel:page.menuLabel,summary:page.summary},page.blocks);
   publishDraft(session,updated);
   session.history.commit(updated);
   announce('Új sorrend helyben mentve. A nyilvános oldal és az FTP változatlan.');
   redraw(focusKey);
  }catch(error){announce('A módosítás nem menthető: '+error.message,true);}
 };
 const travel=(direction)=>{
  const next=direction==='undo'?session.history.undo():session.history.redo();if(!next)return;
  try{publishDraft(session,next);announce(direction==='undo'?'Előző elrendezés visszaállítva.':'Elrendezés ismét alkalmazva.');redraw();}
  catch(error){direction==='undo'?session.history.redo():session.history.undo();announce('A módosítás nem menthető: '+error.message,true);}
 };
 toggle.addEventListener('click',()=>{
  session.editing=!session.editing;article.classList.toggle('cs24-editing',session.editing);
  toggle.setAttribute('aria-pressed',String(session.editing));toggle.textContent=session.editing?'✓ Szerkesztés befejezése':'✥ Elrendezés szerkesztése';
  announce(session.editing?'Fogd meg a ⠿ jelet. Telefonon tartsd lenyomva; billentyűzettel a fel/le nyilak használhatók.':'A látogatói megjelenés visszaállt.');
 });
 undo.addEventListener('click',()=>travel('undo'));redo.addEventListener('click',()=>travel('redo'));
 reset.addEventListener('click',()=>{
  if(!confirm('Visszaállítod az oldal eredeti tartalmi sorrendjét? A szerkesztett szövegek megmaradnak.'))return;
  try{const updated=restoreOriginalOrder(session.history.current,original);if(updated)apply(updated);else announce('A sorrend már az eredeti.');}
  catch(error){announce('A visszaállítás sikertelen: '+error.message,true);}
 });
 exportButton.addEventListener('click',()=>{
  const content=JSON.stringify(session.history.current,null,2)+'\n';const objectUrl=URL.createObjectURL(new Blob([content],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=objectUrl;anchor.download=`csanadi-oldal-tervezet-${path.split('/').at(-1)}`;document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(objectUrl),2000);announce('Az aktuális oldaltervezet JSON-fájlja letöltve.');
 });
 studio.addEventListener('click',async()=>{
  try{const {openMaintenanceStudio}=await import('../tools/maintenance-studio.js?v=1.45');await openMaintenanceStudio();}
  catch(error){announce('A ZIP műhely nem nyitható meg: '+error.message,true);}
 });
 preview.addEventListener('click',async()=>{
  try{const {openStandalonePreview}=await import('./live-preview-v1-42-25.js?v=1.45');openStandalonePreview({route:original.schemaExtensions.route,title:original.title});}
  catch(error){announce('Az előnézet nem nyitható meg: '+error.message,true);}
 });

 groupCards(article);
 const elements=[...article.querySelectorAll('.article-section[data-cs24-id],.cs24-nested-node[data-cs24-id],.cs24-card-frame[data-cs24-owner]')];
 let dragging=null,pointer=null;
 const compatible=(item,target)=>dragging&&sameGroup(dragging.info,targetInfo(target),session.history.current)&&item!==target;
 const commitDrop=(source,target,placement)=>{
  if(!target||!sameGroup(source.info,targetInfo(target),session.history.current))return;
  const destination=targetInfo(target);let updated;
  try{
   updated=source.info.kind==='block'?reorderBlock(session.history.current,source.info.id,destination.id,placement):reorderItem(session.history.current,source.info.owner,source.info.index,destination.index,placement);
   apply(updated,source.key);
  }catch(error){announce('Az elemek nem mozgathatók így: '+error.message,true);}
 };
 const forget=()=>{if(pointer?.timer)clearTimeout(pointer.timer);pointer=null;dragging=null;clearMarks();article.querySelectorAll('.cs24-moving').forEach(node=>node.classList.remove('cs24-moving'));};
 for(const element of elements){
  element.classList.add('cs24-movable');
  const info=targetInfo(element);
  const key=info.kind==='block'?info.id:`item-${info.owner}-${info.index}`;
  const label=nameFor(element);
  const handle=make('button','cs24-handle','⠿');handle.type='button';handle.draggable=true;handle.dataset.cs24HandleKey=key;
  handle.title=`${label} áthelyezése`;handle.setAttribute('aria-label',`${label} áthelyezése; fel/le nyíllal is mozgatható`);
  element.append(handle);
  handle.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();});
  handle.addEventListener('dragstart',event=>{
   if(!session.editing){event.preventDefault();return;}
   dragging={element,info,key};event.dataTransfer?.setData('text/plain',key);if(event.dataTransfer)event.dataTransfer.effectAllowed='move';
   element.classList.add('cs24-moving');activeMarks.add(element);
  });
  handle.addEventListener('dragend',forget);
  element.addEventListener('dragover',event=>{
   if(!session.editing||!compatible(dragging?.element,element))return;
   event.preventDefault();event.stopPropagation();if(event.dataTransfer)event.dataTransfer.dropEffect='move';markTarget(element,placementAt(element,event.clientY));
  });
  element.addEventListener('drop',event=>{
   if(!session.editing||!dragging||!compatible(dragging.element,element))return;
   event.preventDefault();event.stopPropagation();const source=dragging,placement=placementAt(element,event.clientY);forget();commitDrop(source,element,placement);
  });
  handle.addEventListener('pointerdown',event=>{
   if(!session.editing||event.pointerType==='mouse'||event.button!==0)return;
   pointer={id:event.pointerId,x:event.clientX,y:event.clientY,source:{element,info,key},started:false,target:null,placement:'before',timer:null};
   pointer.timer=setTimeout(()=>{
    if(!pointer||pointer.id!==event.pointerId)return;
    pointer.started=true;dragging=pointer.source;handle.setPointerCapture?.(event.pointerId);
    element.classList.add('cs24-moving');activeMarks.add(element);
   },300);
  });
  handle.addEventListener('pointermove',event=>{
   if(!pointer||pointer.id!==event.pointerId)return;
   if(!pointer.started){if(Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>10)forget();return;}
   event.preventDefault();
   const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.cs24-movable');
   if(target&&compatible(element,target)){pointer.target=target;pointer.placement=placementAt(target,event.clientY);markTarget(target,pointer.placement);}
   else{pointer.target=null;clearMarks();element.classList.add('cs24-moving');activeMarks.add(element);}
   if(event.clientY>window.innerHeight-75)window.scrollBy(0,22);
   else if(event.clientY<85)window.scrollBy(0,-22);
  });
  handle.addEventListener('pointerup',event=>{
   if(!pointer||pointer.id!==event.pointerId)return;
   const saved=pointer,wasActive=saved.started;forget();
   if(wasActive){event.preventDefault();commitDrop(saved.source,saved.target,saved.placement);}
  });
  handle.addEventListener('pointercancel',forget);
  handle.addEventListener('keydown',event=>{
   if(!session.editing||!['ArrowUp','ArrowDown'].includes(event.key))return;
   event.preventDefault();event.stopPropagation();const direction=event.key==='ArrowUp'?'up':'down';
   try{
    const updated=info.kind==='block'?siblingMove(session.history.current,info.id,direction):itemMove(session.history.current,info.owner,info.index,direction);
    const nextKey=info.kind==='block'?key:`item-${info.owner}-${info.index+(direction==='up'?-1:1)}`;
    apply(updated,nextKey);
   }catch(error){announce('A mozgatás nem sikerült: '+error.message,true);}
  });
 }
 if(!elements.length)announce('Ezen az oldalon nincs átrendezhető JSON-tartalmi blokk.');
 if(session.nextFocus){const focused=root.querySelector(`[data-cs24-handle-key="${CSS.escape(session.nextFocus)}"]`);focused?.focus({preventScroll:true});session.nextFocus=null;}
}
