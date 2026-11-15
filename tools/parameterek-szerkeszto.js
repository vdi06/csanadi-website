(function(){
 const byId=id=>document.getElementById(id);
 const state={base:null,working:null};
 const keyText={site:'Intézményi és globális adatok',navigation:'Navigáció',refresh:'Automatikus frissítés',theme:'Megjelenés és színek',content:'Tartalomforrások',privacy:'Adatvédelem',search:'Keresés',performance:'Gyorsítótár és teljesítmény',runtime:'Részletes beállítható paraméterek',modules2026:'Tartalmi modulok'};
 const translations={maxSlides:'Kiemelt diák legnagyobb száma',rotationDefaultMs:'Alapértelmezett képváltási idő (ms)',rotationMinimumMs:'Legkisebb képváltási idő (ms)',rotationMaximumMs:'Legnagyobb képváltási idő (ms)',swipeThresholdPx:'Lapozó érintésküszöb (px)',startsAt:'Megjelenítés kezdete',endsAt:'Megjelenítés vége',pageSize:'Találatok száma egy lapon',maxResults:'Összes keresési találat felső korlátja',suggestionLimit:'Keresési javaslatok száma',datalistLimit:'Keresési legördülő értékek száma',maxSavedFilters:'Menthető dokumentumszűrők száma',searchDelayMs:'Dokumentumkeresés késleltetése (ms)',previewCheckDelayMs:'PDF-előnézet tájékoztató késleltetése (ms)',mediaCacheEntries:'Médiagyorsítótár tételeinek száma',maxCacheMegabytes:'Gyorsítótár méretkerete (MiB)',structureSeconds:'Menürendszer frissítési ideje (s)',activePageSeconds:'Aktuális oldal frissítési ideje (s)',minimumSeconds:'Frissítések legrövidebb ideje (s)',maximumSeconds:'Frissítések leghosszabb ideje (s)',footerYear:'Lábléc éve',address:'Intézmény címe',email:'Intézményi e-mail',kretaUrl:'KRÉTA belépés címe',baseUrl:'Alap URL',locale:'Nyelvi beállítás',currentSchoolYear:'Aktuális tanév',offlineShellMaxAgeHours:'Offline alapcsomag frissítési korlátja (óra)',targetMinimumPx:'Érintési célméret minimuma (px)',focusOutlinePx:'Fókuszkeret vastagsága (px)',typeAheadResetMs:'Körmenü betűs keresési várakozása (ms)',slowestResourceCount:'Leglassabb fájlok listájának hossza',synonyms:'Keresési szinonimák'};
 const clone=value=>JSON.parse(JSON.stringify(value));
 const entries=(obj,prefix='')=>Object.entries(obj).flatMap(([key,value])=>{const path=prefix?prefix+'.'+key:key;return value&&typeof value==='object'&&!Array.isArray(value)?entries(value,path):[{path,key,value}];});
 const get=(obj,path)=>path.split('.').reduce((value,key)=>value?.[key],obj);
 const set=(obj,path,value)=>{const bits=path.split('.'),last=bits.pop();bits.reduce((root,key)=>root[key],obj)[last]=value;};
 const describe=(entry)=>{
  const name=translations[entry.key]||entry.key.replace(/([A-Z])/g,' $1').replace(/^./,letter=>letter.toUpperCase());
  const type=entry.value===null?'dátum / null':Array.isArray(entry.value)?'JSON-lista':typeof entry.value==='number'?'szám':typeof entry.value==='boolean'?'igen/nem':'szöveg';
  return {name,type};
 };
 const message=(value,failed=false)=>{const status=byId('status');status.textContent=value;status.style.color=failed?'#9b2633':'#1e5944';};
 const luminance=value=>{if(!/^#[0-9a-f]{6}$/i.test(value))return null;const rgb=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return x===null||y===null?null:(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 function validate(){
  if(!state.base||!state.working)return ['Nincsenek betöltött adatok.'];
  const errors=[];
  for(const reference of entries(state.base)){
   const value=get(state.working,reference.path),kind=reference.value===null?'nullable':Array.isArray(reference.value)?'array':typeof reference.value;
   if(value===undefined){errors.push(reference.path+': hiányzó beállítás');continue;}
   if(kind==='number'&&(!Number.isFinite(value)||value<0))errors.push(reference.path+': csak nemnegatív, véges szám adható meg');
   if(kind==='array'&&!Array.isArray(value))errors.push(reference.path+': JSON-lista szükséges');
   if(kind==='boolean'&&typeof value!=='boolean')errors.push(reference.path+': igen/nem érték szükséges');
   if(kind==='string'&&typeof value!=='string')errors.push(reference.path+': szöveg szükséges');
   if(kind==='nullable'&&value!==null&&(typeof value!=='string'||!Number.isFinite(Date.parse(value))))errors.push(reference.path+': ISO 8601 dátum vagy null szükséges');
  }
  const hero=state.working.runtime?.hero;
  if(hero?.startsAt&&hero?.endsAt&&Date.parse(hero.startsAt)>Date.parse(hero.endsAt))errors.push('runtime.hero: a kezdődátum nem lehet későbbi a záródátumnál');
  if(hero?.rotationMinimumMs>hero?.rotationDefaultMs||hero?.rotationDefaultMs>hero?.rotationMaximumMs)errors.push('runtime.hero: minimum ≤ alapértelmezett ≤ maximum legyen');
  if(state.working.search?.pageSize>state.working.search?.maxResults)errors.push('search.pageSize: a lapméret nem lehet nagyobb az összes találat korlátjánál');
  if(state.working.refresh?.minimumSeconds>state.working.refresh?.maximumSeconds)errors.push('refresh: a legkisebb idő nem lehet nagyobb a legnagyobbnál');
  for(const mode of ['light','dark'])for(const [key,color] of Object.entries(state.working.theme?.[mode+'Colors']||{})){
   const allColors=Array.isArray(color)?color:[color];
   if(!allColors.length||allColors.some(value=>typeof value!=='string'||!CSS.supports('color',value)))errors.push('theme.'+mode+'Colors.'+key+': érvényes CSS-szín vagy színlista szükséges');
  }
  for(const mode of ['light','dark']){
   const palette=state.working.theme?.[mode+'Colors']||{};
   for(const accent of ['sportGreen','sportYellow']){
    const ratio=contrast(palette.ink,palette[accent]);
    if(ratio===null||ratio<4.5)errors.push('theme.'+mode+'Colors.'+accent+': olvasható címkéhez legalább 4,5:1 kontrasztú #RRGGBB szín kell az ink színhez képest');
   }
  }
  const synonyms=state.working.search?.synonyms;
  if(!synonyms||Object.entries(synonyms).some(([word,items])=>!/^[a-z0-9-]+$/.test(word)||!Array.isArray(items)||items.some(item=>typeof item!=='string'||!/^[a-z0-9-]+$/.test(item))))errors.push('search.synonyms: az értékek ékezetmentes kulcsokból és szöveglistákból álljanak');
  if(state.working.runtime?.diagnostics?.slowestResourceCount>30)errors.push('runtime.diagnostics.slowestResourceCount: legfeljebb 30 fájl jeleníthető meg');
  if(state.working.runtime?.diagnostics?.largestResourceCount>30)errors.push('runtime.diagnostics.largestResourceCount: legfeljebb 30 fájl jeleníthető meg');
  if(state.working.runtime?.diagnostics?.targetCls>1)errors.push('runtime.diagnostics.targetCls: 0 és 1 közötti érték szükséges');
  if(!/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(state.working.runtime?.news?.officialSourceHost||''))errors.push('runtime.news.officialSourceHost: érvényes intézményi domain szükséges');
  if(!String(state.working.runtime?.news?.sampleTitlePrefix||'').trim())errors.push('runtime.news.sampleTitlePrefix: a bemutató jelölés nem lehet üres');
  if(state.working.runtime?.tools?.auditMaximumIssues<1||state.working.runtime?.tools?.auditMaximumIssues>500)errors.push('runtime.tools.auditMaximumIssues: 1 és 500 közötti érték szükséges');
  if(state.working.runtime?.tools?.auditConcurrentRequests<1||state.working.runtime?.tools?.auditConcurrentRequests>20)errors.push('runtime.tools.auditConcurrentRequests: 1 és 20 közötti érték szükséges');
  if(state.working.runtime?.release?.expectedPageCount<1||state.working.runtime?.release?.minimumManifestEntries<1)errors.push('runtime.release: pozitív oldalszám és minimális állományszám szükséges');
  return errors;
 }
 function render(){
  if(!state.working)return;
  const groups=byId('groups'),filter=byId('query').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();groups.replaceChildren();
  let visible=0;
  const grouped=new Map();
  for(const entry of entries(state.working)){
   const words=(entry.path+' '+describe(entry).name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   if(filter&&!words.includes(filter))continue;
   const top=entry.path.split('.')[0];if(!grouped.has(top))grouped.set(top,[]);grouped.get(top).push(entry);visible++;
  }
  for(const [groupName,items] of grouped){
   const section=document.createElement('section');section.className='group';
   const title=document.createElement('h2');title.textContent=keyText[groupName]||groupName;
   const subtitle=document.createElement('p');subtitle.className='subtitle';subtitle.textContent=items.length+' megadható érték · forrás: json/config.json';
   const grid=document.createElement('div');grid.className='entries';
   for(const entry of items){
    const field=document.createElement('div');field.className='entry';
    if(JSON.stringify(entry.value)!==JSON.stringify(get(state.base,entry.path)))field.classList.add('is-changed');
    const info=describe(entry),label=document.createElement('label'),meta=document.createElement('small'),error=document.createElement('div');
    label.textContent=info.name;meta.textContent=entry.path+' · '+info.type;error.className='invalid';
    const input=document.createElement(Array.isArray(entry.value)?'textarea':'input');
    input.id='param-'+entry.path.replace(/\W/g,'-');label.htmlFor=input.id;
    if(typeof entry.value==='boolean'){input.type='checkbox';input.checked=entry.value;}
    else if(typeof entry.value==='number'){input.type='number';input.step='any';input.value=String(entry.value);}
    else{input.value=entry.value===null?'null':Array.isArray(entry.value)?JSON.stringify(entry.value):String(entry.value);input.spellcheck=false;}
    const onChange=()=>{
     let next;
     try{
      if(typeof entry.value==='boolean')next=input.checked;
      else if(typeof entry.value==='number'){if(input.value.trim()==='')throw new Error('Adj meg egy számot.');next=Number(input.value);if(!Number.isFinite(next)||next<0)throw new Error('Nemnegatív szám szükséges.');}
      else if(Array.isArray(entry.value)){next=JSON.parse(input.value);if(!Array.isArray(next))throw new Error('JSON-lista szükséges.');}
      else if(entry.value===null){next=input.value.trim()==='null'||input.value.trim()===''?null:input.value.trim();if(next!==null&&!Number.isFinite(Date.parse(next)))throw new Error('ISO 8601 dátum vagy null szükséges.');}
      else next=input.value;
      set(state.working,entry.path,next);error.textContent='';field.classList.toggle('is-changed',JSON.stringify(next)!==JSON.stringify(get(state.base,entry.path)));summary();
     }catch(ex){error.textContent=ex.message;}
    };
    input.addEventListener(typeof entry.value==='boolean'?'change':'input',onChange);
    field.append(label,meta,input,error);grid.append(field);
   }
   section.append(title,subtitle,grid);groups.append(section);
  }
  byId('summary').textContent=visible+' paraméter látható az összes '+entries(state.working).length+' közül.';
 }
 function summary(){
  const count=entries(state.working).filter(x=>JSON.stringify(x.value)!==JSON.stringify(get(state.base,x.path))).length;
  message(count?count+' paraméter módosult. Ellenőrzés és JSON-letöltés után a fájl kész a helyi cserére.':'Minden beállítás az eredeti értéket tartalmazza.');
 }
 function loadData(input,resetBase=false){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Érvénytelen JSON-objektum.');
  const oldBase=state.base,oldWorking=state.working;
  if(resetBase||!state.base)state.base=clone(input);
  state.working=clone(input);
  const problems=validate();
  if(problems.length){state.base=oldBase;state.working=oldWorking;throw new Error(problems.slice(0,5).join(' | '));}
  render();summary();
 }
 byId('query').addEventListener('input',render);
 byId('validate').addEventListener('click',()=>{const errors=validate();message(errors.length?errors.join(' | '):'A központi JSON ellenőrzése sikeres.',!!errors.length);});
 byId('download').addEventListener('click',()=>{
  const errors=validate();if(errors.length){message('A JSON nem menthető: '+errors.join(' | '),true);return;}
  const blob=new Blob([JSON.stringify(state.working,null,2)+'\n'],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='config.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  message('A config.json elkészült. Az FTP-n semmi nem változott.');
 });
 byId('reset').addEventListener('click',()=>{if(!state.base)return;state.working=clone(state.base);render();summary();});
 byId('import').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{const data=JSON.parse(await file.text());loadData(data);message('A betöltött JSON megjelent. Ellenőrizd és exportáld.');}
  catch(error){message('A JSON betöltése sikertelen: '+error.message,true);}
  event.target.value='';
 });
 fetch('../json/config.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.json();}).then(data=>loadData(data,true)).catch(error=>message('Nem sikerült betölteni a json/config.json fájlt: '+error.message+'. HTTP(S)-szerver szükséges.',true));
})();
