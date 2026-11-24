import { element as el } from './dom.js?v=2.56';
import { openContentDialog } from './content-expansion.js?v=2.56';
const kindLabels={tiles:'Felfedezőpanel',steps:'Lépésenkénti útmutató',timeline:'Idővonal',quiz:'Interaktív tudáspróba',checklist:'Saját ellenőrzőlista',calculator:'Szemléltető kalkulátor'};
const button=(text)=>el('button',{text,className:'btn activity-button',attributes:{type:'button'}});
const cache=new WeakMap();
function mapFor(config){if(!cache.has(config))cache.set(config,new Map());return cache.get(config);}
function validActivity(d,id,meta,config){
 const validText=v=>typeof v==='string'&&v.trim().length>0&&v.length<1200;
 if(!d||d.id!==id||d.kind!==meta.kind||d.title!==meta.title||!kindLabels[d.kind]||!config.contentExpansion.sources[d.source])throw Error('Érvénytelen modul');
 if(d.kind==='quiz'){if(!validText(d.question)||!Array.isArray(d.options)||d.options.length!==3||d.options.filter(o=>o.correct===true).length!==1||d.options.some(o=>!validText(o.label)||!validText(o.explanation)||typeof o.correct!=='boolean'))throw Error('Érvénytelen tudáspróba');}
 else if(!Array.isArray(d.items)||d.items.length<2||d.items.length>8||d.items.some(i=>!validText(i.label)||!validText(i.detail)||i.related&&!config.contentExpansion.activities[i.related]))throw Error('Érvénytelen moduladat');
 if(d.kind==='calculator'&&(d.items.length!==3||!Number.isFinite(Number(d.items[0].detail))||!Number.isFinite(Number(d.items[1].detail))))throw Error('Érvénytelen kalkulátor');
 return d;
}
export async function loadActivity(config,id,settingsUrl){
 const meta=config.contentExpansion?.activities?.[id];if(!meta)return null;const m=mapFor(config);if(m.has(id))return m.get(id);
 const task=(async()=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);try{if(meta.path!==`activities/${id}.json`)throw Error('Érvénytelen útvonal');const url=new URL(meta.path,settingsUrl);url.searchParams.set('v',config.release);const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw Error('Hiányzó modul');return validActivity(await r.json(),id,meta,config);}catch{return null;}finally{clearTimeout(timer);}})();
 m.set(id,task);const value=await task;if(value)m.set(id,value);else if(m.get(id)===task)m.delete(id);return value;
}
const titleFor=(id)=>id;
function detailView(item){return el('div',{className:'activity-detail'},el('p',{text:item.detail}),item.related?el('a',{className:'btn activity-button',text:'Kapcsolódó oldal megnyitása',attributes:{href:'#/oldal/'+item.related}}):null);}
function cards(data,platform){
 const grid=el('div',{className:`activity-grid ${data.kind==='timeline'||data.kind==='steps'?'activity-sequence':''}`});
 for(const [ix,item] of data.items.entries()){
  const index=el('span',{className:'activity-index',text:data.kind==='timeline'?item.label:String(ix+1).padStart(2,'0')});
  const tile=el('button',{className:'activity-tile card',attributes:{type:'button','aria-haspopup':'dialog'}},index,
   data.kind==='timeline'?null:el('strong',{text:item.label}),el('span',{className:'activity-summary',text:item.detail}),el('span',{className:'activity-open',text:'Részletek ›'}));
  tile.addEventListener('click',()=>openContentDialog({title:item.label,trigger:tile,views:[()=>detailView(item)]}));grid.append(tile);
 }return grid;
}
function checklist(data){
 const count=el('output',{className:'activity-score',attributes:{'aria-live':'polite'}}),bar=el('progress',{className:'activity-progress',attributes:{max:data.items.length,value:0,'aria-label':'Elkészült teendők'}}),list=el('div',{className:'activity-checklist list-group'}),reset=button('Alaphelyzet');const inputs=[];
 for(const item of data.items){const input=el('input',{className:'form-check-input',attributes:{type:'checkbox'}});inputs.push(input);const label=el('label',{className:'activity-check list-group-item'},input,el('span',{},el('strong',{text:item.label}),el('small',{text:item.detail})));list.append(label);input.addEventListener('change',update);}
 function update(){const done=inputs.filter(i=>i.checked).length;count.value=`${done} / ${inputs.length} kész`;bar.value=done;}
 reset.addEventListener('click',()=>{inputs.forEach(i=>i.checked=false);update();});update();return el('div',{},el('div',{className:'activity-progress-head'},count,reset),bar,list);
}
function quiz(data){
 const status=el('p',{className:'activity-feedback',attributes:{role:'status','aria-live':'polite'}}),group=el('div',{className:'activity-quiz',attributes:{role:'group','aria-label':data.question}}),reset=button('Újrapróbálom');reset.hidden=true;
 const options=data.options.map(o=>{const b=button(o.label);b.addEventListener('click',()=>{options.forEach((n,i)=>{n.disabled=true;n.dataset.result=data.options[i].correct?'correct':n===b?'wrong':'';});status.textContent=(o.correct?'Helyes! ':'Gondold át! ')+o.explanation+(o.correct?'':' Helyes válasz: '+data.options.find(x=>x.correct).label+'.');reset.hidden=false;reset.focus({preventScroll:true});});return b;});group.append(...options);reset.addEventListener('click',()=>{options.forEach(n=>{n.disabled=false;delete n.dataset.result;});status.textContent='';reset.hidden=true;options[0].focus();});return el('div',{},el('p',{className:'activity-question',text:data.question}),group,status,reset);
}
function calculator(data){
 const controls=data.items.slice(0,2).map((item,i)=>{const input=el('input',{className:'form-control',attributes:{type:'number',min:0,max:i===0?21:180,step:1,value:item.detail,inputmode:'numeric'}});return {input,label:el('label',{className:'activity-number'},el('span',{text:item.label}),input)};});const out=el('output',{className:'activity-metric',attributes:{'aria-live':'polite'}});const update=()=>{if(controls.some(c=>!c.input.checkValidity()||c.input.value==='')){out.textContent='Adj meg érvényes egész számokat.';return;}out.textContent=`${Number(controls[0].input.value)*Number(controls[1].input.value)} perc / hét`;};controls.forEach(c=>c.input.addEventListener('input',update));update();return el('div',{},el('div',{className:'activity-number-grid'},...controls.map(c=>c.label)),out,el('p',{className:'activity-note',text:data.items[2].detail}));
}
export function activityView(config,id,platform){
 const meta=config.contentExpansion?.activities?.[id];if(!meta)return null;
 const section=el('section',{className:`page-activity activity-${platform} activity-${meta.kind}`,attributes:{'data-activity':id,'aria-label':meta.title}});
 const build=(data)=>{const header=el('header',{className:'activity-heading'},el('span',{className:'activity-kicker',text:kindLabels[meta.kind]}),el('h2',{text:meta.title}),el('p',{className:'activity-note',text:data?.source==='generated'?'Saját készítésű gyakorlati segédanyag · nem hivatalos előírás':data?'Források alapján összeállított válogatás':'A modul átmenetileg nem tölthető be.'}));let body;
  if(!data){const retry=button('Újrapróbálás');retry.addEventListener('click',async()=>{retry.disabled=true;const result=await loadActivity(config,id,new URL('../data/site.json',import.meta.url));if(section.isConnected)build(result);});body=retry;}
  else body=data.kind==='quiz'?quiz(data):data.kind==='checklist'?checklist(data):data.kind==='calculator'?calculator(data):cards(data,platform);
  section.replaceChildren(header,body);
 };
 const value=mapFor(config).get(id);build(value&&typeof value.then!=='function'?value:null);return section;
}
