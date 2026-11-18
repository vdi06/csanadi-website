/* Közvetlen, kliensoldali kezdőoldal-sorrendezés. Semmilyen szerveres írás nincs. */
const KEY='csanadi-home-inline-order-v1';
const LABELS={students:'Diákjaink sportsikerei','school-news':'Iskolai hírek','premium-showcase':'Kiemelt tartalmak','home-j-navrail-unit':'Gyorselérések'};
function stored(){try{const v=JSON.parse(localStorage.getItem(KEY));return Array.isArray(v)?v.filter(x=>typeof x==='string'):[];}catch{return [];}}
function persist(order){try{localStorage.setItem(KEY,JSON.stringify(order));return true;}catch{return false;}}
function idOf(node){if(node.classList.contains('home-j-navrail-unit'))return 'home-j-navrail-unit';if(node.classList.contains('home-j-fold'))return 'fold:'+node.querySelector('.home-j-fold-copy strong')?.textContent;return [...node.classList].find(x=>x.startsWith('home-unit--'))?.slice(11)||'';}
export function enhanceInlineHomeEditor(canvas){
 if(canvas.querySelector('.cs41-inline-toolbar'))return;
 const items=[...canvas.children].filter(node=>node.classList.contains('home-unit')||node.classList.contains('home-j-fold')||node.classList.contains('home-j-navrail-unit'));
 const byId=new Map(items.map(node=>[idOf(node),node]).filter(([id])=>id));
 const pinned='students';let order=[...new Set([...stored().filter(id=>byId.has(id)),...byId.keys()])];
 const history=[];let editing=false,dragging=null,pointer=null;
 const cardGroups=[];
 const toolbar=document.createElement('div');toolbar.className='cs41-inline-toolbar';
 const toggle=document.createElement('button');toggle.type='button';toggle.className='cs41-edit-toggle';toggle.textContent='✥ Elrendezés szerkesztése';toggle.setAttribute('aria-pressed','false');
 const undo=document.createElement('button');undo.type='button';undo.className='cs41-edit-action';undo.textContent='↶ Visszavonás';undo.hidden=true;
 const exportButton=document.createElement('button');exportButton.type='button';exportButton.className='cs41-edit-action';exportButton.textContent='↓ Sorrend JSON exportálása';exportButton.hidden=true;
 const status=document.createElement('span');status.className='cs41-inline-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 toolbar.append(toggle,undo,exportButton,status);canvas.prepend(toolbar);
 const label=id=>LABELS[id]||(id.startsWith('fold:')?id.slice(5):id);
 function apply(){
  // A sportsikerek a felhasználó korábbi döntése szerint mindig az első szakasz.
  const visual=[pinned,...order.filter(id=>id!==pinned)];
  visual.forEach((id,index)=>byId.get(id)?.style.setProperty('order',String(index),'important'));
  toolbar.style.setProperty('order','-1','important');
  for(const [id,node] of byId){node.dataset.cs41Role=id;node.classList.toggle('cs41-editable',editing);}
  undo.disabled=history.length===0;
 }
 function move(from,to){
  if(!from||!to||from===to||from===pinned||to===pinned||!order.includes(from)||!order.includes(to))return false;
  history.push({kind:'sections',order:[...order]});const next=order.filter(id=>id!==from);next.splice(next.indexOf(to),0,from);order=next;
  status.textContent=persist(order)?label(from)+' új helyre került. Helyben mentve.':'Áthelyezve, de a helyi mentés nem sikerült.';
  apply();return true;
 }
 toggle.addEventListener('click',()=>{editing=!editing;canvas.classList.toggle('cs41-inline-editing',editing);toggle.setAttribute('aria-pressed',String(editing));toggle.textContent=editing?'✓ Szerkesztés befejezése':'✥ Elrendezés szerkesztése';undo.hidden=!editing;exportButton.hidden=!editing;status.textContent=editing?'Fogd meg a kártyán lévő ⠿ fogópontot. Telefonon is húzhatod.':'A látogatói megjelenés visszaállt.';apply();});
 undo.addEventListener('click',()=>{if(!history.length)return;const last=history.pop();if(last.kind==='sections'){order=last.order;persist(order);apply();}else if(last.kind==='cards'){const group=cardGroups.find(g=>g.name===last.name);if(group){group.order=last.order;group.apply();}}status.textContent='Az előző sorrend visszaállítva.';undo.disabled=history.length===0;});
 exportButton.addEventListener('click',()=>{
  const output={schemaVersion:'1.0',type:'home-section-order',homePageOnly:true,order:[pinned,...order.filter(id=>id!==pinned)],cardOrders:Object.fromEntries(cardGroups.map(g=>[g.name,g.order]))};
  const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='csanadi_kezdolap_sorrend.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  status.textContent='JSON-fájl letöltve. A nyilvános honlap csak külön FTP-feltöltéssel módosul.';
 });
 for(const [id,node] of byId){
  if(id===pinned)continue;
  const grip=document.createElement('button');grip.type='button';grip.className='cs41-inline-grip';grip.textContent='⠿';grip.title=label(id)+' áthelyezése';grip.setAttribute('aria-label',grip.title+'; nyilakkal is mozgatható');grip.draggable=true;node.append(grip);
  grip.addEventListener('dragstart',event=>{if(!editing){event.preventDefault();return;}dragging=id;event.dataTransfer?.setData('text/plain',id);if(event.dataTransfer)event.dataTransfer.effectAllowed='move';node.classList.add('cs41-is-dragged');});
  grip.addEventListener('dragend',()=>{dragging=null;clearMarks();});
  node.addEventListener('dragover',event=>{if(!editing||!dragging||dragging===id)return;event.preventDefault();clearTargets();node.classList.add('cs41-drop-target');});
  node.addEventListener('drop',event=>{if(!editing||!dragging)return;event.preventDefault();const from=dragging;dragging=null;clearMarks();move(from,id);});
  grip.addEventListener('pointerdown',event=>{if(!editing||event.pointerType==='mouse'||event.button!==0)return;pointer={from:id,id:event.pointerId,target:null};grip.setPointerCapture(event.pointerId);node.classList.add('cs41-is-dragged');});
  grip.addEventListener('pointermove',event=>{if(!pointer||pointer.id!==event.pointerId)return;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-cs41-role]');clearTargets();pointer.target=target&&canvas.contains(target)?target.dataset.cs41Role:null;if(pointer.target!==id&&pointer.target!==pinned)target?.classList.add('cs41-drop-target');if(event.clientY>innerHeight-68)window.scrollBy(0,17);if(event.clientY<85)window.scrollBy(0,-17);});
  grip.addEventListener('pointerup',event=>{if(!pointer||pointer.id!==event.pointerId)return;const {from,target}=pointer;pointer=null;clearMarks();move(from,target);});
  grip.addEventListener('pointercancel',()=>{pointer=null;clearMarks();});
  grip.addEventListener('keydown',event=>{if(!editing||!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const movable=order.filter(id=>id!==pinned),index=movable.indexOf(id);const dest=movable[index+(event.key==='ArrowUp'?-1:1)];if(dest&&move(id,dest))grip.focus();});
 }
 function clearTargets(){canvas.querySelectorAll('.cs41-drop-target').forEach(n=>n.classList.remove('cs41-drop-target'));}
 function clearMarks(){clearTargets();canvas.querySelectorAll('.cs41-is-dragged').forEach(n=>n.classList.remove('cs41-is-dragged'));}
 // Ugyanaz a közvetlen művelet a dicsőségfal és a hírek tényleges kártyáin.
 for(const [name,selector] of [['sports',' .student-success-feature-grid'],['news',' .cs-news-grid']]){
  const container=canvas.querySelector(selector.trim());if(!container)continue;
  const cards=[...container.children].filter(el=>el.nodeType===1);if(cards.length<2)continue;
  const nodes=new Map(cards.map((el,i)=>['card-'+i,el]));
  const cardKey=KEY+'-'+name;let ids=[...nodes.keys()];
  try{const saved=JSON.parse(localStorage.getItem(cardKey));if(Array.isArray(saved))ids=[...new Set([...saved.filter(id=>nodes.has(id)),...ids])];}catch{}
  const group={name,order:ids,apply(){for(const id of group.order)container.append(nodes.get(id));try{localStorage.setItem(cardKey,JSON.stringify(group.order));}catch{}undo.disabled=history.length===0;}};cardGroups.push(group);
  for(const [id,card] of nodes){
   card.classList.add('cs41-inline-card');const grip=document.createElement('button');grip.type='button';grip.className='cs41-inline-grip cs41-inline-card-grip';grip.textContent='⠿';grip.draggable=true;grip.title='Kártya áthelyezése';grip.setAttribute('aria-label',grip.title+', nyílbillentyűkkel is');card.append(grip);
   let from=null,touch=null;
   function reorder(target){if(!target||target===id||!group.order.includes(target))return;history.push({kind:'cards',name,order:[...group.order]});const changed=group.order.filter(x=>x!==id);changed.splice(changed.indexOf(target),0,id);group.order=changed;group.apply();status.textContent='Kártyasorrend helyben mentve.';}
   grip.addEventListener('dragstart',event=>{if(!editing){event.preventDefault();return;}from=id;card.classList.add('cs41-is-dragged');event.dataTransfer?.setData('text/plain',id);});
   grip.addEventListener('dragend',()=>{from=null;card.classList.remove('cs41-is-dragged');cards.forEach(c=>c.classList.remove('cs41-drop-target'));});
   card.addEventListener('dragover',event=>{if(!editing)return;const source=cards.find(c=>c.classList.contains('cs41-is-dragged'));if(!source||source===card)return;event.preventDefault();card.classList.add('cs41-drop-target');});
   card.addEventListener('dragleave',()=>card.classList.remove('cs41-drop-target'));
   card.addEventListener('drop',event=>{if(!editing)return;event.preventDefault();const source=cards.find(c=>c.classList.contains('cs41-is-dragged'));cards.forEach(c=>c.classList.remove('cs41-drop-target','cs41-is-dragged'));const sourceId=[...nodes].find(([,n])=>n===source)?.[0];if(sourceId&&sourceId!==id){const before=group.order.slice();const next=before.filter(x=>x!==sourceId);next.splice(next.indexOf(id),0,sourceId);history.push({kind:'cards',name,order:before});group.order=next;group.apply();status.textContent='Kártyasorrend helyben mentve.';}});
   grip.addEventListener('pointerdown',event=>{if(!editing||event.pointerType==='mouse'||event.button!==0)return;touch={pointerId:event.pointerId,target:null};grip.setPointerCapture(event.pointerId);card.classList.add('cs41-is-dragged');});
   grip.addEventListener('pointermove',event=>{if(!touch||touch.pointerId!==event.pointerId)return;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.cs41-inline-card');cards.forEach(c=>c.classList.remove('cs41-drop-target'));touch.target=[...nodes].find(([,n])=>n===target)?.[0];if(target&&target!==card)target.classList.add('cs41-drop-target');});
   grip.addEventListener('pointerup',event=>{if(!touch||touch.pointerId!==event.pointerId)return;const target=touch.target;touch=null;cards.forEach(c=>c.classList.remove('cs41-drop-target','cs41-is-dragged'));reorder(target);});
   grip.addEventListener('pointercancel',()=>{touch=null;cards.forEach(c=>c.classList.remove('cs41-drop-target','cs41-is-dragged'));});
   grip.addEventListener('keydown',event=>{if(!editing||!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const i=group.order.indexOf(id),target=group.order[i+(event.key==='ArrowUp'?-1:1)];reorder(target);grip.focus();});
  }
  group.apply();
 }
 apply();
}
