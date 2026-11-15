(function(){
 const $=id=>document.getElementById(id),state={rows:[],kind:'pages',changes:{}};
 const key='csanadi-content-review-r13';
 try{state.changes=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{state.changes={};}
 const text=(tag,value)=>{const n=document.createElement(tag);n.textContent=String(value??'');return n;};
 const safe=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(state.changes));}catch{$('status').textContent='A böngésző nem tudta helyileg menteni a változtatásokat. Exportáld a CSV-t.';}};
 const csvCell=value=>'"'+String(value??'').replace(/"/g,'""')+'"';
 const download=(name,data,type)=>{const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);};
 const dataset={pages:'../json/oldalindex.json',documents:'../json/adatok/dokumentumok.json',assets:'../json/assets-inventory.json'};
 async function load(){try{state.kind=$('kind').value;const response=await fetch(dataset[state.kind],{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();
  if(state.kind==='pages')state.rows=Object.entries(data.pages||{}).map(([path,item])=>({key:'page:'+path,title:item.title||path,path:'json/'+path,description:item.summary||'',sourceStatus:item.schemaExtensions?.verifiedContent===true?'verifiedContent=true':'verifiedContent=false'}));
  if(state.kind==='documents')state.rows=(data.documents||[]).map(item=>({key:'doc:'+item.id,title:item.title||item.id,path:item.filePath||'',description:item.summary||'',sourceStatus:'official='+String(item.official)}));
  if(state.kind==='assets')state.rows=(data.items||[]).map(item=>({key:'asset:'+item.path,title:item.path.split('/').at(-1),path:item.path,description:(item.category||'')+' '+(item.tags||[]).join(','),sourceStatus:item.sha256?'hash nyilvántartva':'hash nélkül'}));
  render();
 }catch(e){$('status').textContent='Nem sikerült betölteni a forrásadatokat: '+e.message+'. A fájlt HTTP(S)-szerverről nyisd meg.';}}
 function current(row){return state.changes[row.key]||{status:'pending',note:''};}
 function render(){const filter=safe($('filter').value),kind=$('state').value,tbody=$('items');tbody.replaceChildren();let shown=0;const total=state.rows.length;for(const row of state.rows){const item=current(row);if(kind!=='all'&&item.status!==kind)continue;if(filter&&!safe([row.title,row.path,row.description,item.note].join(' ')).includes(filter))continue;shown++;
  const tr=document.createElement('tr');const info=document.createElement('td');info.append(text('strong',row.title));if(row.description){const summary=text('p',row.description.slice(0,140));summary.className='help';info.append(summary);}
  const source=document.createElement('td');const link=document.createElement('a');link.textContent=row.path;link.href='../'+row.path;link.target='_blank';link.rel='noopener noreferrer';source.append(link,text('p',row.sourceStatus));
  const select=document.createElement('select');select.setAttribute('aria-label',row.title+' ellenőrzési állapota');for(const [v,label] of [['pending','Felülvizsgálandó'],['review','Javítandó'],['ready','Helyben ellenőrizve']]){const option=text('option',label);option.value=v;select.append(option);}select.value=item.status||'pending';select.addEventListener('change',()=>{const old=current(row);state.changes[row.key]={...old,status:select.value,date:new Date().toISOString()};save();updateSummary();});
  const field=document.createElement('input');field.type='text';field.maxLength=350;field.setAttribute('aria-label',row.title+' ellenőrzési megjegyzése');field.placeholder='Forrás, dátum, jog, teendő…';field.value=item.note||'';field.addEventListener('change',()=>{const old=current(row);state.changes[row.key]={...old,note:field.value,date:new Date().toISOString()};save();});
  for(const cell of [info,source])tr.append(cell);for(const control of [select,field]){const td=document.createElement('td');td.append(control);tr.append(td);}tbody.append(tr);
 }$('status').textContent=shown+' / '+total+' elem látható.';updateSummary();}
 function updateSummary(){const counts={pending:0,review:0,ready:0};for(const row of state.rows){counts[current(row).status||'pending']++;}$('summary').textContent=`Ellenőrzendő: ${counts.pending} · Javítandó: ${counts.review} · Helyben ellenőrizve: ${counts.ready}`;}
 function payload(){return state.rows.map(row=>({...row,...current(row)}));}
 $('kind').addEventListener('change',load);$('filter').addEventListener('input',render);$('state').addEventListener('change',render);
 $('exportcsv').addEventListener('click',()=>{const lines=[['Kulcs','Cím','Útvonal','Forrásstátusz','Munkastátusz','Megjegyzés','Utolsó módosítás'],...payload().map(x=>[x.key,x.title,x.path,x.sourceStatus,x.status,x.note,x.date||''])];download('csanadi_hitelesitesi_munkalap_'+state.kind+'.csv','\ufeff'+lines.map(x=>x.map(csvCell).join(';')).join('\r\n'),'text/csv;charset=utf-8');});
 $('exportjson').addEventListener('click',()=>download('csanadi_hitelesitesi_munkalap_'+state.kind+'.json',JSON.stringify({schemaVersion:'1.0.0',kind:state.kind,generatedAt:new Date().toISOString(),records:payload()},null,2),'application/json'));
 load();
})();
