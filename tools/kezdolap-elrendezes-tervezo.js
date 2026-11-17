/* v1.39.16 · Két külön állapotú, böngészőben helyben tárolt elrendezési terv.
 * Nem ír FTP-t, GitHubot, honlap-JSON-t vagy más külső szolgáltatást. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const storageKey='csanadi-home-layout-plan-v1.39.16';
 const modes=['normal','scrolled'];
 const allowedTypes=['brand','nav','mini','hero','arrow','button','text'];
 const specs={
  brand:['CSANÁDI SPORTISKOLA',23,15],nav:['Iskolánk · Oktatás · Sportélet',43,12],
  mini:['Kiemelt kép · Középső gomb',25,17],hero:['Kiemelt kép',45,50],
  arrow:['❮ vagy ❯',5,12],button:['Új gomb',11,12],text:['Új felirat',22,14]
 };
 let nextId=1;
 const item=(type,label,x,y,w,h)=>({id:'elem-'+nextId++,type,label,x,y,w,h,visible:true});
 function starter(){
  return {
   schemaVersion:'1.0.0',type:'csanadi-home-layout-proposal',release:'1.39.16',note:'',
   states:{
    normal:[
     item('brand','CSANÁDI SPORTISKOLA',2,4,24,14),
     item('nav','Iskolánk · Oktatás · Sportélet · Információk',29,5,43,12),
     item('button','KRÉTA',75,5,10,12),item('button','Keresés · Megjelenés',86,5,12,12),
     item('hero','1. kiemelt kép',1,23,49,55),item('hero','2. kiemelt kép',50,23,49,55),
     item('arrow','❮',0,44,5,13),item('arrow','❯',95,44,5,13)
    ],
    scrolled:[
     item('brand','CSANÁDI SPORTISKOLA',2,3,22,16),
     item('nav','Iskolánk · Oktatás · Sportélet',25,4,20,13),
     item('mini','Kiemelt kép · Középső gomb',46,3,25,17),
     item('button','KRÉTA',73,4,9,14),item('button','Keresés',83,4,8,14),
     item('button','Menü',92,4,7,14)
    ]
   }
  };
 }
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const numeric=(value,defaultValue)=>Number.isFinite(Number(value))?Number(value):defaultValue;
 const validItem=(source,position)=>{
  if(!source||typeof source!=='object'||!allowedTypes.includes(source.type))return null;
  const w=clamp(Math.round(numeric(source.w,18)),4,100),h=clamp(Math.round(numeric(source.h,12)),5,100);
  const id=/^[a-zA-Z0-9_-]{1,60}$/.test(String(source.id||''))?source.id:'import-'+position;
  return {id,type:source.type,label:String(source.label||specs[source.type][0]).slice(0,120),
   x:clamp(Math.round(numeric(source.x,5)),0,100-w),y:clamp(Math.round(numeric(source.y,5)),0,100-h),w,h,visible:source.visible!==false};
 };
 const normalize=data=>{
  if(!data||data.type!=='csanadi-home-layout-proposal'||!data.states)throw Error('Nem kezdőoldali elrendezésterv.');
  const states={};
  for(const mode of modes){
   if(!Array.isArray(data.states[mode])||data.states[mode].length>100)throw Error('Sérült vagy túl hosszú '+mode+' lista.');
   states[mode]=data.states[mode].map(validItem).filter(Boolean);
   const ids=new Set();
   for(const entry of states[mode]){if(ids.has(entry.id))entry.id='import-'+nextId++;ids.add(entry.id);}
  }
  for(const mode of modes)for(const entry of states[mode]){
   const match=entry.id.match(/^elem-(\d+)$/);if(match)nextId=Math.max(nextId,Number(match[1])+1);
  }
  return {schemaVersion:'1.0.0',type:'csanadi-home-layout-proposal',release:'1.39.16',note:String(data.note||'').slice(0,2500),states};
 };
 let model=starter(),view='normal',activeMode='normal',selected=null;
 try{const saved=localStorage.getItem(storageKey);if(saved)model=normalize(JSON.parse(saved));}catch{/* Hibás helyi állapot esetén az alapnézet biztonságos. */}
 const locate=()=>selected?model.states[selected.mode].find(entry=>entry.id===selected.id):null;
 const status=(message)=>{$('plan-status').textContent=message;};
 function persist(){
  model.note=$('plan-note').value.slice(0,2500);
  try{localStorage.setItem(storageKey,JSON.stringify(model));}catch{status('A böngésző nem tudta helyben menteni a tervet. Használd a JSON-letöltést.');}
 }
 function positionElement(button,entry){
  button.style.left=entry.x+'%';button.style.top=entry.y+'%';
  button.style.width=entry.w+'%';button.style.height=entry.h+'%';
 }
 function setSelection(mode,id){
  activeMode=mode;selected={mode,id};
  document.querySelectorAll('.plan-piece').forEach(button=>button.classList.toggle('is-selected',button.dataset.mode===mode&&button.dataset.id===id));
  inspect();
 }
 function drawMode(mode){
  const stage=$('screen-'+mode);stage.replaceChildren(stage.querySelector('.plan-backdrop'));
  for(const entry of model.states[mode]){
   const button=document.createElement('button');button.type='button';button.className='plan-piece';
   button.dataset.mode=mode;button.dataset.id=entry.id;button.dataset.type=entry.type;button.dataset.visible=String(entry.visible);
   button.setAttribute('aria-label',`${entry.label}. Áthelyezés: húzás vagy nyílbillentyűk.`);
   button.title=`${entry.label} · ${entry.x}% / ${entry.y}%`;button.tabIndex=0;
   const label=document.createElement('span');label.className='plan-piece-name';label.textContent=entry.label;
   button.append(label);positionElement(button,entry);
   if(selected?.mode===mode&&selected.id===entry.id)button.classList.add('is-selected');
   button.addEventListener('click',()=>setSelection(mode,entry.id));
   button.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    setSelection(mode,entry.id);
    const rect=stage.getBoundingClientRect();
    const origin={x:event.clientX,y:event.clientY,left:entry.x,top:entry.y};
    button.setPointerCapture(event.pointerId);
    const move=moveEvent=>{
     if(moveEvent.pointerId!==event.pointerId)return;
     entry.x=clamp(Math.round(origin.left+(moveEvent.clientX-origin.x)/rect.width*100),0,100-entry.w);
     entry.y=clamp(Math.round(origin.top+(moveEvent.clientY-origin.y)/rect.height*100),0,100-entry.h);
     positionElement(button,entry);inspectValues();
    };
    const end=endEvent=>{
     if(endEvent.pointerId!==event.pointerId)return;
     button.removeEventListener('pointermove',move);button.removeEventListener('pointerup',end);button.removeEventListener('pointercancel',end);
     persist();drawList();status('Az elem új helye mentve. A két nézet külön szerkeszthető.');
    };
    button.addEventListener('pointermove',move);button.addEventListener('pointerup',end);button.addEventListener('pointercancel',end);
   });
   button.addEventListener('keydown',event=>{
    const directions={ArrowLeft:['x',-1],ArrowRight:['x',1],ArrowUp:['y',-1],ArrowDown:['y',1]};
    if(!directions[event.key])return;
    event.preventDefault();setSelection(mode,entry.id);
    const [field,sign]=directions[event.key];const maximum=100-(field==='x'?entry.w:entry.h);
    entry[field]=clamp(entry[field]+sign*(event.shiftKey?5:1),0,maximum);
    positionElement(button,entry);inspectValues();drawList();persist();
   });
   stage.append(button);
  }
 }
 function drawList(){
  const list=$('plan-items');list.replaceChildren();
  for(const entry of model.states[activeMode]){
   const li=document.createElement('li'),button=document.createElement('button');button.type='button';
   const name=document.createElement('span');name.textContent=entry.label;
   const coords=document.createElement('small');coords.textContent=entry.visible?`${entry.x}%, ${entry.y}%`:'rejtett';
   button.append(name,coords);button.setAttribute('aria-current',String(selected?.mode===activeMode&&selected?.id===entry.id));
   button.addEventListener('click',()=>{setSelection(activeMode,entry.id);$('screen-'+activeMode).querySelectorAll('.plan-piece').forEach(el=>{if(el.dataset.id===entry.id)el.focus();});});
   li.append(button);list.append(li);
  }
 }
 function inspectValues(){
  const entry=locate();if(!entry)return;
  $('plan-x').value=entry.x;$('plan-y').value=entry.y;$('plan-w').value=entry.w;$('plan-h').value=entry.h;
 }
 function inspect(){
  const entry=locate();$('plan-inspector').hidden=!entry;$('plan-inspector-empty').hidden=!!entry;
  if(entry){$('plan-inspector-title').textContent=(selected.mode==='normal'?'Normál: ':'Legörgetett: ')+entry.type;
   $('plan-label').value=entry.label;$('plan-visible').checked=entry.visible;inspectValues();}
  drawList();
 }
 function render(){
  for(const mode of modes){$('screen-'+mode).parentElement.parentElement.hidden=view!=='compare'&&view!==mode;drawMode(mode);}
  $('plan-stages').classList.toggle('is-compare',view==='compare');
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
  $('plan-add').textContent='+ Elem hozzáadása: '+(activeMode==='normal'?'normál':'legörgetett')+' nézet';
  inspect();
 }
 document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  view=button.dataset.view;if(view!=='compare')activeMode=view;
  if(selected?.mode!==activeMode)selected=null;render();
 }));
 $('plan-add').addEventListener('click',()=>{
  const type=$('plan-add-type').value;if(!allowedTypes.includes(type))return;
  const [label,w,h]=specs[type];const entry=item(type,label,39,activeMode==='normal'?24:4,w,h);
  model.states[activeMode].push(entry);selected={mode:activeMode,id:entry.id};persist();render();status('Új elem hozzáadva – húzd a megfelelő helyre.');
 });
 $('plan-label').addEventListener('input',()=>{
  const entry=locate();if(!entry)return;entry.label=$('plan-label').value.slice(0,120);persist();drawMode(selected.mode);drawList();
 });
 for(const field of ['x','y','w','h'])$('plan-'+field).addEventListener('change',()=>{
  const entry=locate();if(!entry)return;
  entry[field]=clamp(Math.round(numeric($('plan-'+field).value,entry[field])),field==='w'?4:field==='h'?5:0,100);
  entry.x=clamp(entry.x,0,100-entry.w);entry.y=clamp(entry.y,0,100-entry.h);
  persist();render();
 });
 $('plan-visible').addEventListener('change',()=>{const entry=locate();if(!entry)return;entry.visible=$('plan-visible').checked;persist();render();});
 $('plan-duplicate').addEventListener('click',()=>{
  const entry=locate();if(!entry)return;const copy={...entry,id:'elem-'+nextId++,x:clamp(entry.x+3,0,100-entry.w),y:clamp(entry.y+3,0,100-entry.h)};
  model.states[selected.mode].push(copy);selected={mode:selected.mode,id:copy.id};persist();render();
 });
 $('plan-delete').addEventListener('click',()=>{
  if(!selected)return;model.states[selected.mode]=model.states[selected.mode].filter(entry=>entry.id!==selected.id);
  selected=null;persist();render();status('A kijelölt elem eltávolítva.');
 });
 $('plan-note').value=model.note;
 $('plan-note').addEventListener('input',persist);
 function requestText(){
  persist();return 'Csanádi Sportiskola – kezdőoldal elrendezési kérésem (v1.39.16). A normál és a legörgetett nézet külön kezelendő. A következő JSON tartalmazza az egyes elemek helyét %-ban; a képernyőn látható, de rejtettként megadott elemek maradjanak el. Az aktuális működő funkciók megmaradjanak.\n\n'+JSON.stringify(model,null,2);
 }
 $('plan-copy').addEventListener('click',async()=>{
  const content=requestText();$('plan-output').value=content;
  try{if(!navigator.clipboard?.writeText)throw Error('Nincs vágólapengedély.');await navigator.clipboard.writeText(content);status('A teljes terv a vágólapra került. Illeszd be a ChatGPT-beszélgetésbe!');}
  catch{$('plan-output').focus();$('plan-output').select();status('A terv megjelent alul. Nyomj Ctrl+C-t, majd illeszd be a ChatGPT-beszélgetésbe.');}
 });
 $('plan-download').addEventListener('click',()=>{
  persist();const blob=new Blob([JSON.stringify(model,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='csanadi_kezdolap_elrendezes_terv_v1_39_16.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  status('A két nézetet tartalmazó JSON-terv letöltése elindult. Küldd el nekem a fájlt.');
 });
 $('plan-import').addEventListener('click',()=>$('plan-file').click());
 $('plan-file').addEventListener('change',async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  try{if(file.size>1024*1024)throw Error('A fájl túl nagy (maximum 1 MB).');
   model=normalize(JSON.parse(await file.text()));$('plan-note').value=model.note;selected=null;persist();render();status('A korábbi normál és legörgetett terv betöltve.');}
  catch(error){status('Nem sikerült beolvasni a tervet: '+error.message);}
 });
 $('plan-print').addEventListener('click',()=>window.print());
 $('plan-reset').addEventListener('click',()=>{
  if(!window.confirm('Visszaállítsuk mindkét nézet eredeti elrendezését?'))return;
  model=starter();selected=null;view='normal';activeMode='normal';$('plan-note').value='';$('plan-output').value='';persist();render();status('A két nézet alaphelyzetbe állt.');
 });
 render();
})();
