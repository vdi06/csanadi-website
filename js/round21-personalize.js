const STORAGE='csanadi-r21-home-preferences';
const TAGS=[
 {id:'featured',label:'Kiemelt sportos tartalom',selector:'.home-unit--premium-showcase'},
 {id:'shortcuts',label:'Gyorsnavigáció',selector:'.home-j-navrail-unit'},
 {id:'school-news',label:'Iskolai hírek',selector:'.home-unit--school-news'},
 {id:'sport-news',label:'Sporthírek',selector:'.home-unit--sports-news'},
 {id:'daily',label:'Napi központ',selector:'.home-j-fold:nth-of-type(1)'},
 {id:'statistics',label:'Sporteredmények',selector:'.home-j-fold:nth-of-type(2)'},
 {id:'gallery',label:'Képek és közösség',selector:'.home-j-fold:nth-of-type(3)'},
 {id:'discover',label:'Fedezd fel az iskolát',selector:'.home-j-fold:nth-of-type(4)'}
];
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
function read(){try{const value=JSON.parse(localStorage.getItem(STORAGE));return value&&typeof value==='object'&&!Array.isArray(value)?value:null;}catch{return null;}}
function save(value){try{localStorage.setItem(STORAGE,JSON.stringify(value));return true;}catch{return false;}}
export function enhancePersonalizedHome(canvas){
 const blocks=new Map(),folds=[...canvas.querySelectorAll(':scope > .home-j-fold')];
 for(const item of TAGS){const block=item.id==='daily'?folds[0]:item.id==='statistics'?folds[1]:item.id==='gallery'?folds[2]:item.id==='discover'?folds[3]:canvas.querySelector(item.selector);if(block)blocks.set(item.id,block);}
 const all=[...blocks.keys()];let state=read();
 if(!state||!Array.isArray(state.order)||!Array.isArray(state.visible))state={order:all,visible:all};
 state.order=[...new Set([...state.order.filter(id=>typeof id==='string'&&blocks.has(id)),...all])];
 state.visible=[...new Set(state.visible.filter(id=>typeof id==='string'&&blocks.has(id)))];
 const panel=el('details','csn21-personalizer csn29-personalizer');
 const summary=el('summary','csn29-personalizer-summary','⚙ Kezdőlap beállítása · kedvenc kártyák és sorrend');
 const body=el('div','csn29-personalizer-body');
 const help=el('p','csn29-personalizer-help','A fogantyúnál húzva változtathatod a kártyák sorrendjét. Telefonon is működik; a nyilak billentyűzettel is használhatók. A beállítások csak ebben a böngészőben maradnak.');
 const toolbar=el('div','csn29-personalizer-toolbar');
 const counter=el('strong','csn29-personalizer-count');
 const allOn=el('button','csn29-personalizer-show','Összes megjelenítése');allOn.type='button';
 const reset=el('button','csn21-home-reset','Eredeti sorrend visszaállítása');reset.type='button';
 toolbar.append(counter,allOn,reset);
 const rows=el('div','csn21-home-rows csn29-home-rows');rows.setAttribute('aria-label','Kezdőlapi kártyák rendezése');
 const message=el('p','csn21-home-message');message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 body.append(help,toolbar,rows,message);panel.append(summary,body);
 let pointer=null,dragId=null;
 const persist=(note)=>{message.textContent=note+(save(state)?' A beállítás mentve.':' A böngésző nem engedte a mentést.');};
 const reorder=(id,target)=>{
  if(!id||!target||id===target)return false;
  const from=state.order.indexOf(id),to=state.order.indexOf(target);
  if(from<0||to<0)return false;
  const next=[...state.order];next.splice(from,1);next.splice(to,0,id);state.order=next;
  persist((TAGS.find(item=>item.id===id)?.label||id)+' új helyre került.');render(id);return true;
 };
 function render(focusId){
  for(const id of state.order){const block=blocks.get(id);block.hidden=!state.visible.includes(id);canvas.append(block);}
  counter.textContent=`${state.visible.length} / ${all.length} kártya látható`;
  rows.replaceChildren();
  state.order.forEach((id,index)=>{
   const label=TAGS.find(item=>item.id===id)?.label||id;
   const row=el('div','csn21-home-row csn29-home-row');row.dataset.cardId=id;
   const grip=el('button','csn29-drag-handle','⠿');grip.type='button';grip.draggable=true;grip.title='Húzással rendezhető';grip.setAttribute('aria-label',label+' · sorrend módosítása húzással');
   const check=el('input');check.type='checkbox';check.checked=state.visible.includes(id);check.id='csn21-card-'+id;
   const caption=el('label','csn29-card-name',label);caption.htmlFor=check.id;
   const badge=el('span','csn29-visibility',check.checked?'Látható':'Rejtett');
   check.addEventListener('change',()=>{state.visible=check.checked?[...state.visible,id]:state.visible.filter(value=>value!==id);persist(label+(check.checked?' megjelenítve.':' elrejtve.'));render();rows.querySelector('#'+check.id)?.focus();});
   const actions=el('div','csn21-card-actions');
   for(const [direction,title,offset] of [['up','Feljebb',-1],['down','Lejjebb',1]]){
    const button=el('button','csn29-step',offset<0?'↑':'↓');button.type='button';button.dataset.move=direction;button.title=title;button.disabled=index+offset<0||index+offset>=state.order.length;button.setAttribute('aria-label',label+' · '+title.toLowerCase());
    button.addEventListener('click',()=>{const target=state.order[index+offset];reorder(id,target);rows.querySelector(`[data-card-id="${id}"] [data-move="${direction}"]:not(:disabled)`)?.focus();});actions.append(button);
   }
   // Asztali natív drag-and-drop; csak a fogantyú indítja.
   grip.addEventListener('dragstart',event=>{dragId=id;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',id);row.classList.add('csn29-is-dragging');});
   grip.addEventListener('dragend',()=>{dragId=null;rows.querySelectorAll('.csn29-drag-target,.csn29-is-dragging').forEach(node=>node.classList.remove('csn29-drag-target','csn29-is-dragging'));});
   row.addEventListener('dragover',event=>{if(!dragId)return;event.preventDefault();event.dataTransfer.dropEffect='move';row.classList.add('csn29-drag-target');});
   row.addEventListener('dragleave',()=>row.classList.remove('csn29-drag-target'));
   row.addEventListener('drop',event=>{if(!dragId)return;event.preventDefault();const from=dragId;dragId=null;reorder(from,id);});
   // Mobilos érintéses húzás; kizárólag a fogantyú fogja meg a mutatót.
   grip.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'||event.button!==0)return;
    pointer={id,pointerId:event.pointerId,target:null};grip.setPointerCapture(event.pointerId);row.classList.add('csn29-is-dragging');
   });
   grip.addEventListener('pointermove',event=>{
    if(!pointer||pointer.pointerId!==event.pointerId)return;
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.csn29-home-row');
    rows.querySelectorAll('.csn29-drag-target').forEach(node=>node.classList.remove('csn29-drag-target'));
    pointer.target=target&&rows.contains(target)?target.dataset.cardId:null;
    if(target&&pointer.target!==pointer.id)target.classList.add('csn29-drag-target');
    if(event.clientY>innerHeight-65)window.scrollBy(0,18);
    else if(event.clientY<75)window.scrollBy(0,-18);
   });
   const finish=event=>{if(!pointer||pointer.pointerId!==event.pointerId)return;const {id:from,target}=pointer;pointer=null;row.classList.remove('csn29-is-dragging');if(!reorder(from,target))render(from);};
   grip.addEventListener('pointerup',finish);grip.addEventListener('pointercancel',()=>{pointer=null;render();});
   row.append(grip,check,caption,badge,actions);rows.append(row);
  });
  if(focusId)rows.querySelector(`[data-card-id="${focusId}"] .csn29-drag-handle`)?.focus();
 }
 allOn.addEventListener('click',()=>{state.visible=[...all];persist('Minden kártya látható.');render();allOn.focus();});
 reset.addEventListener('click',()=>{state={order:[...all],visible:[...all]};try{localStorage.removeItem(STORAGE);}catch{}render();message.textContent='Eredeti sorrend és minden kártya visszaállítva.';reset.focus();});
 canvas.prepend(panel);render();
}
