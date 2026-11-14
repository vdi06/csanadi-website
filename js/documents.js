/* Csanádi Sportiskola 2026 – publikus, szigorúan ellenőrzött, JSON-vezérelt dokumentumközpont.
   Bootstrap csak a fő index.html CDN-hivatkozásából; ez a modul natív JavaScriptet használ. */
const ROOT = new URL('../', import.meta.url);
const REGISTRY = new URL('../json/adatok/dokumentumok.json', import.meta.url);
const SCHEMA = new URL('../json/schemas/dokumentumok.schema.json', import.meta.url);
const STATE_KEY='csanadi-2026-document-filters-v1';
const SEARCH_KEY='csanadi-2026-document-saved-v1';
const KIND={guide:'Segédlet',form:'Nyomtatvány',policy:'Szabályzat',publication:'Közzététel',other:'Egyéb'};
const STATUS={published:'Aktuális',archived:'Archív',withdrawn:'Visszavont'};
const SORTS={newest:'Legújabb elöl',oldest:'Legrégebbi elöl',title:'Cím szerint',size:'Fájlméret szerint'};
const VIEWS={cards:'Kártyák',list:'Lista',table:'Táblázat'};
const DEFAULT={q:'',category:'all',kind:'all',status:'published',tag:'all',sort:'newest',view:'cards',saved:''};
let registry=null;
let hash='';
let error=null;
let activeMount=null;
let activeRoute='';
let lastTrigger=null;
const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
const PATH_RE=/^assets\/documents\/[a-z0-9-]+\.(?:pdf|docx|txt)$/;
const ROUTE_RE=/^#\/[a-z0-9\-/]*$/;
const idRe=/^[a-z][a-z0-9-]{2,80}$/;
const stop=(msg)=>{throw new Error('Dokumentumtár: '+msg)};
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
const append=(parent,...nodes)=>{for(const node of nodes)if(node)parent.append(node);return parent;};
const set=(n,name,v)=>{n.setAttribute(name,String(v));return n;};
const normal=(x)=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
const dateIsValid=(x)=>typeof x==='string'&&DATE_RE.test(x)&&!Number.isNaN(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
const cleanText=(x,min=1,max=6000)=>typeof x==='string'&&x.trim().length>=min&&x.length<=max;
function localRead(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function localWrite(key,obj){try{localStorage.setItem(key,JSON.stringify(obj));}catch{}}
function verifiedCategoryTree(categories){
 const map=new Map();
 for(const c of categories){
  if(!c||!idRe.test(c.id)||map.has(c.id)||!cleanText(c.label,3,150)||!cleanText(c.description,5,600)||!(c.parentId===null||idRe.test(c.parentId))||!Number.isInteger(c.order)||c.order<0)stop('érvénytelen vagy ismétlődő kategória');
  if(Object.keys(c).sort().join('|')!==['description','id','label','order','parentId'].sort().join('|'))stop('ismeretlen mező a kategóriában: '+c.id);
  map.set(c.id,c);
 }
 for(const c of categories){if(c.parentId&&!map.has(c.parentId))stop('nem létező szülőkategória: '+c.id);
  let p=c,steps=0;while(p.parentId){if(++steps>3)stop('kategóriaciklus vagy túl mély hierarchia: '+c.id);p=map.get(p.parentId);if(!p)stop('hiányzó kategória');}
 }
 return map;
}
function validateVersion(v,did){if(!v||!/^\d+\.\d+\.\d+$/.test(v.version)||!dateIsValid(v.date)||!cleanText(v.change,5,500)||Object.keys(v).sort().join('|')!=='change|date|version')stop('hibás verziótörténet: '+did);}
function validateDocument(d,categoryMap,allowedFields){
 if(!d||typeof d!=='object')stop('hibás dokumentumrekord');
 const required=allowedFields;const names=Object.keys(d);
 if(required.some(k=>!names.includes(k))||names.some(k=>!required.includes(k)))stop('kötelező vagy ismeretlen dokumentummező: '+(d.id||'?'));
 if(!/^document:[a-z0-9-]+$/.test(d.id)||!cleanText(d.title,5,180)||!cleanText(d.summary,20,2500)||!categoryMap.has(d.categoryId))stop('hibás dokumentumazonosító, cím vagy kategória');
 if(!Array.isArray(d.tags)||!Array.isArray(d.keywords)||d.tags.some(t=>!cleanText(t,1,60))||d.keywords.some(t=>!cleanText(t,1,80)))stop('hibás címkézés: '+d.id);
 if(new Set(d.tags).size!==d.tags.length||new Set(d.keywords).size!==d.keywords.length)stop('ismétlődő címkék: '+d.id);
 if(!Object.hasOwn(STATUS,d.status)||!Object.hasOwn(KIND,d.documentKind)||!['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'].includes(d.mimeType))stop('ismeretlen dokumentumállapot vagy fájltípus');
 if(!/^\d+\.\d+\.\d+$/.test(d.version)||!dateIsValid(d.publishedAt)||!dateIsValid(d.validFrom)||(d.validTo!==null&&!dateIsValid(d.validTo))||d.validTo&&d.validTo<d.validFrom)stop('hibás dátum vagy verzió: '+d.id);
 if(!Array.isArray(d.relatedRoutes)||d.relatedRoutes.some(r=>!ROUTE_RE.test(r))||new Set(d.relatedRoutes).size!==d.relatedRoutes.length)stop('hibás oldalkapcsolat: '+d.id);
 if(!['developed-general-guidance','approved-institutional'].includes(d.sourceType)||typeof d.official!=='boolean'||(d.official!== (d.sourceType==='approved-institutional')))stop('ellenőrizetlen forrástípus vagy hivatalossági állapot: '+d.id);
 if(!Array.isArray(d.versionHistory)||!d.versionHistory.length)stop('hiányzó verziótörténet: '+d.id);
 d.versionHistory.forEach(v=>validateVersion(v,d.id));
 if(d.versionHistory.at(-1).version!==d.version)stop('aktuális verzió nem egyezik a történettel: '+d.id);
 if(d.status==='withdrawn'){
  if(d.filePath!==null||d.fileName!==null||d.fileSizeBytes!==null||d.sha256!==null)stop('visszavont dokumentumhoz nem adható publikus fájllink: '+d.id);
 }else{
  if(!PATH_RE.test(d.filePath)||!cleanText(d.fileName,5,120)||d.filePath.split('/').at(-1)!==d.fileName||!Number.isSafeInteger(d.fileSizeBytes)||d.fileSizeBytes<=0||!(/^[0-9a-f]{64}$/.test(d.sha256)))stop('nem biztonságos vagy hibás állományhivatkozás: '+d.id);
  const ext=d.fileName.split('.').at(-1);if((ext==='pdf'&&d.mimeType!=='application/pdf')||(ext==='txt'&&d.mimeType!=='text/plain')||(ext==='docx'&&!d.mimeType.includes('wordprocessingml')))stop('eltérő fájlkiterjesztés és MIME-típus: '+d.id);
 }
}
function validateRegistry(data,schema){
 if(!data||!schema||schema.$schema!=='https://json-schema.org/draft/2020-12/schema'||data.schemaVersion!=='1.0.0'||schema.properties?.schemaVersion?.const!==data.schemaVersion)stop('inkompatibilis vagy hiányzó JSON-séma');
 const required=schema.required||[];
 if(required.some(k=>!Object.hasOwn(data,k))||Object.keys(data).some(k=>!required.includes(k)))stop('hibás gyűjteménymezők');
 if(data.collectionId!=='collection:csanadi-public-documents'||data.locale!=='hu-HU'||!dateIsValid(data.updatedAt)||!cleanText(data.description,20)||!Object.hasOwn(VIEWS,data.defaultView)||!Object.hasOwn(SORTS,data.defaultSort)||!Number.isInteger(data.refreshSeconds)||data.refreshSeconds<30||data.refreshSeconds>3600)stop('érvénytelen gyűjtemény-metaadatok');
 if(!Array.isArray(data.categories)||!Array.isArray(data.documents))stop('a kategóriák és dokumentumok listája kötelező');
 const cats=verifiedCategoryTree(data.categories);
 const fields=schema.properties?.documents?.items?.required;
 if(!Array.isArray(fields)||!fields.length)stop('hiányzó dokumentumséma');
 const ids=new Set();const paths=new Set();
 for(const d of data.documents){validateDocument(d,cats,fields);if(ids.has(d.id))stop('ismétlődő dokumentumazonosító');ids.add(d.id);
  if(d.filePath){if(paths.has(d.filePath))stop('ismétlődő dokumentumfájl');paths.add(d.filePath);}
 }
 return {data,cats};
}
async function fetchJSON(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(url.pathname+' – HTTP '+r.status);return r.json();}
export async function loadDocumentRegistry(force=false){
 if(registry&&!force)return registry;
 try{
  const [data,schema]=await Promise.all([fetchJSON(REGISTRY),fetchJSON(SCHEMA)]);
  const next=validateRegistry(data,schema);
  const nextHash=JSON.stringify(data);
  const changed=nextHash!==hash;
  registry=next;error=null;hash=nextHash;
  if(force&&changed&&activeMount?.isConnected){const state=loadState();renderCenterContents(activeMount,activeRoute,state);}
  return registry;
 }catch(e){error=String(e.message||e);console.error(error);if(registry)return registry;return null;}
}
export function documentRegistryError(){return error;}
function loadState(){const stored=localRead(STATE_KEY,{});return {...DEFAULT,...Object.fromEntries(Object.keys(DEFAULT).filter(k=>Object.hasOwn(stored,k)).map(k=>[k,stored[k]]))};}
function saveState(s){localWrite(STATE_KEY,s);}
const formatDate=(s)=>{try{return new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'long',day:'numeric'}).format(new Date(s+'T12:00:00'));}catch{return s;}};
const formatSize=n=>n===null?'—':(n/1024).toLocaleString('hu-HU',{maximumFractionDigits:1})+' KB';
const docURL=(d)=>d.filePath?new URL(d.filePath,ROOT).href:'';
const safeText=x=>String(x||'');
function routeCategory(route){
 const last=route.split('/').at(-1);return {'szabalyzatok':'intezmenyi-szabalyzat','nyomtatvanyok':'intezmenyi-nyomtatvany','kozzeteteli-lista':'intezmenyi-kozzetetel'}[last]||'all';
}
function childCategories(id,cats){const descendants=new Set([id]);let prev=-1;while(prev!==descendants.size){prev=descendants.size;for(const c of cats.values())if(descendants.has(c.parentId))descendants.add(c.id);}return descendants;}
function matchedDocuments(s){
 if(!registry)return[];
 const categories=s.category==='all'?null:childCategories(s.category,registry.cats),q=normal(s.q),date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 let docs=registry.data.documents.filter(d=>(s.status==='all'||d.status===s.status)&&(d.status!=='published'||d.validFrom<=date)&&(!d.validTo||d.validTo>=date||s.status!=='published')&&(!categories||categories.has(d.categoryId))&&(s.kind==='all'||d.documentKind===s.kind)&&(s.tag==='all'||d.tags.includes(s.tag)));
 if(q)docs=docs.filter(d=>normal([d.title,d.summary,d.categoryId,...d.tags,...d.keywords].join(' ')).includes(q));
 docs.sort((a,b)=>s.sort==='oldest'?a.publishedAt.localeCompare(b.publishedAt):s.sort==='title'?a.title.localeCompare(b.title,'hu'):s.sort==='size'?(b.fileSizeBytes||0)-(a.fileSizeBytes||0):b.publishedAt.localeCompare(a.publishedAt)||a.title.localeCompare(b.title,'hu'));
 return docs;
}
function makeTag(text,cls=''){return el('span','doc-tag '+cls,text);}
function htmlButton(text,cls,fn){const b=el('button',cls,text);b.type='button';b.addEventListener('click',fn);return b;}
function field(labelText,widget){const group=el('label','doc-filter-field');group.append(el('span','doc-field-label',labelText),widget);return group;}
function selectNode(options,value,onChange){const s=el('select','form-select doc-control');for(const [v,label] of options){const op=el('option',null,label);op.value=v;s.append(op);}s.value=value;s.addEventListener('change',()=>onChange(s.value));return s;}
function searchInput(value,cb){const input=el('input','form-control doc-control');input.type='search';input.placeholder='Cím, leírás, kulcsszó…';input.value=value;input.autocomplete='off';const datalist=el('datalist');datalist.id='doc-suggestions';for(const token of [...new Set(registry.data.documents.flatMap(d=>[d.title,...d.tags]))].slice(0,35)){const o=el('option');o.value=token;datalist.append(o);}input.setAttribute('list',datalist.id);input.addEventListener('input',()=>cb(input.value));const wrapper=el('div');wrapper.append(input,datalist);return wrapper;}
function categoryOptions(){const out=[['all','Összes kategória']];const list=[...registry.cats.values()].sort((a,b)=>a.order-b.order||a.label.localeCompare(b.label,'hu'));
 const walk=(pid,depth)=>{for(const c of list.filter(x=>x.parentId===pid)){out.push([c.id,'  '.repeat(depth)+(depth?'↳ ':'')+c.label]);walk(c.id,depth+1);}};walk(null,0);return out;}
function statusLabel(d){return STATUS[d.status]||d.status;}
function openPreview(doc){
 lastTrigger=document.activeElement;
 const dialog=el('dialog','doc-preview-dialog');set(dialog,'aria-label','Dokumentum részletei: '+doc.title);
 const head=el('div','doc-preview-head');head.append(el('div','doc-preview-title',doc.title),htmlButton('Bezárás ×','doc-close',()=>dialog.close()));dialog.append(head);
 const meta=el('div','doc-preview-meta');meta.append(makeTag(statusLabel(doc)),makeTag(KIND[doc.documentKind]),makeTag('Verzió '+doc.version),makeTag(formatDate(doc.publishedAt)));dialog.append(meta);
 dialog.append(el('p','doc-preview-summary',doc.summary));
 dialog.append(el('p','doc-preview-explain',doc.official?'Jóváhagyott intézményi dokumentum.':'Fejlesztési segédlet – nem hivatalos intézményi szabályzat vagy kiírás.'));
 if(doc.status!=='withdrawn'&&doc.filePath){
  const iframe=el('iframe','doc-iframe');iframe.title=doc.title+' előnézete';iframe.loading='lazy';iframe.src=docURL(doc)+'#toolbar=1';dialog.append(iframe);
  const actions=el('div','doc-preview-actions');const open=el('a','btn btn-outline-secondary','Megnyitás új lapon');open.href=docURL(doc);open.target='_blank';open.rel='noopener noreferrer';
  const download=el('a','btn btn-primary','Letöltés ('+formatSize(doc.fileSizeBytes)+')');download.href=docURL(doc);download.download=doc.fileName;actions.append(open,download);dialog.append(actions);
 }else dialog.append(el('p','doc-error','A dokumentumot visszavonták; nem elérhető letöltés.'));
 const detail=el('details','doc-version-history');detail.append(el('summary',null,'Verziótörténet és metaadatok'));
 const list=el('ul');for(const v of doc.versionHistory){list.append(el('li',null,v.version+' · '+formatDate(v.date)+' – '+v.change));}detail.append(list);
 detail.append(el('p',null,'Azonosító: '+doc.id+' · SHA-256: '+(doc.sha256||'nem elérhető')));
 dialog.append(detail);
 dialog.addEventListener('close',()=>{dialog.remove();lastTrigger?.focus?.();});
 document.body.append(dialog);dialog.showModal();
}
function documentCard(d,view){
 const card=el(view==='table'?'tr':'article',view==='cards'?'doc-card':view==='list'?'doc-row':'doc-table-row');
 if(view==='table'){
  for(const str of [d.title,registry.cats.get(d.categoryId)?.label||'',KIND[d.documentKind],statusLabel(d),formatDate(d.publishedAt)])card.append(el('td',null,str));
  const actions=el('td');actions.append(htmlButton('Részletek','doc-action',()=>openPreview(d)));card.append(actions);
 }else{
  const text=el('div','doc-card-main');text.append(el('span','doc-eyebrow',registry.cats.get(d.categoryId)?.label||'Dokumentum'));
  const heading=el('h3','doc-title',d.title);text.append(heading,el('p','doc-description',d.summary));
  const details=el('div','doc-meta');details.append(makeTag(KIND[d.documentKind]),makeTag(statusLabel(d),d.status==='published'?'doc-tag-good':''),makeTag('v'+d.version),makeTag(formatSize(d.fileSizeBytes)));
  text.append(details);
  const actions=el('div','doc-actions');actions.append(htmlButton('Részletek és előnézet','doc-action',()=>openPreview(d)));
  if(d.filePath&&d.status!=='withdrawn'){const a=el('a','doc-download','Letöltés ↓');a.href=docURL(d);a.download=d.fileName;actions.append(a);}
  card.append(text,actions);
 }
 return card;
}
function statusBanner(text,cls=''){const x=el('div','doc-status '+cls,text);set(x,'role','status');set(x,'aria-live','polite');return x;}
function renderCenterContents(mount,route,initial){
 if(!mount?.isConnected)return;
 mount.replaceChildren();const docRoute=routeCategory(route),state={...DEFAULT,...initial};
 if(docRoute!=='all')state.category=docRoute;
 if(!registry){mount.append(statusBanner(error||'A dokumentumadatok jelenleg nem érhetők el.','error'));return;}
 if(!registry.cats.has(state.category)&&state.category!=='all')state.category='all';
 if(!Object.hasOwn(VIEWS,state.view))state.view='cards';if(!Object.hasOwn(SORTS,state.sort))state.sort='newest';if(state.status!=='all'&&!Object.hasOwn(STATUS,state.status))state.status='published';
 const top=el('div','doc-center-head');top.append(el('p','doc-kicker','ELLENŐRZÖTT FÁJLHIVATKOZÁSOK · NYILVÁNOS SEGÉDLETEK'),el('h2',null,'Dokumentumközpont'),el('p','doc-lead','Dokumentumokat kereshetsz, szűrhetsz, megtekinthetsz és letölthetsz. A jelenlegi kiadványok általános fejlesztési segédletek, nem az iskola hivatalos szabályzatai.'));
 mount.append(top);
 const filters=el('div','doc-filters');
 const results=el('div','doc-results');
 const resultLabel=el('div','doc-result-label');set(resultLabel,'aria-live','polite');
 const notes=el('div','doc-filter-notes');
 let syncTimer=null;
 function change(k,v,rerenderAll=false){state[k]=v;state.saved='';saveState(state);if(rerenderAll){renderCenterContents(mount,route,state);}else updateResults();}
 const search=searchInput(state.q,v=>{state.q=v;saveState(state);clearTimeout(syncTimer);syncTimer=setTimeout(updateResults,130);});
 filters.append(field('Keresés',search));
 filters.append(field('Kategória',selectNode(categoryOptions(),state.category,v=>change('category',v,true))));
 filters.append(field('Dokumentumtípus',selectNode([['all','Mindegyik'],...Object.entries(KIND)],state.kind,v=>change('kind',v,true))));
 filters.append(field('Állapot',selectNode([['published','Aktuális'],['archived','Archív'],['withdrawn','Visszavont'],['all','Összes']],state.status,v=>change('status',v,true))));
 const tags=[...new Set(registry.data.documents.flatMap(d=>d.tags))].sort((a,b)=>a.localeCompare(b,'hu'));
 filters.append(field('Címke',selectNode([['all','Összes címke'],...tags.map(t=>[t,t])],state.tag,v=>change('tag',v,true))));
 filters.append(field('Rendezés',selectNode(Object.entries(SORTS),state.sort,v=>change('sort',v,true))));
 mount.append(filters);
 const toolbar=el('div','doc-toolbar');const viewControl=el('div','doc-view-control');
 for(const [mode,label] of Object.entries(VIEWS)){const b=htmlButton(label,'doc-view-button'+(state.view===mode?' is-current':''),()=>change('view',mode,true));b.setAttribute('aria-pressed',String(state.view===mode));viewControl.append(b);}
 const refresh=htmlButton('Adatok frissítése ↻','doc-refresh',async()=>{refresh.disabled=true;notes.textContent='Frissítés folyamatban…';await loadDocumentRegistry(true);refresh.disabled=false;notes.textContent=error?'Nem sikerült ellenőrizni az új adatokat; a korábbi lista megmaradt.':'Adatok ellenőrizve: '+new Date().toLocaleTimeString('hu-HU');});
 const clear=htmlButton('Szűrők törlése','doc-reset',()=>{const next={...DEFAULT,category:docRoute};saveState(next);renderCenterContents(mount,route,next);});
 toolbar.append(viewControl,refresh,clear);
 mount.append(toolbar,resultLabel,notes);
 const savedPane=el('div','doc-saved-panel');const savedList=selectNode([['','Mentett szűrés kiválasztása']], '',()=>{});
 savedList.classList.add('doc-saved-select');const savedInput=el('input','form-control doc-control');savedInput.type='text';savedInput.maxLength=60;savedInput.placeholder='Szűrés neve (pl. Felvételi)';set(savedInput,'aria-label','Mentett szűrés neve');
 const save=htmlButton('Szűrés mentése','doc-save',()=>{const label=savedInput.value.trim();if(label.length<3){notes.textContent='Adj legalább három karakter hosszú nevet a szűrésnek.';return;}const all=localRead(SEARCH_KEY,{});if(Object.keys(all).length>=20&&!Object.hasOwn(all,label)){notes.textContent='Legfeljebb 20 szűrés menthető.';return;}all[label]={...state,saved:''};localWrite(SEARCH_KEY,all);savedInput.value='';renderCenterContents(mount,route,state);});
 const remove=htmlButton('Mentés törlése','doc-delete-save',()=>{const key=savedList.value;if(!key)return;const all=localRead(SEARCH_KEY,{});delete all[key];localWrite(SEARCH_KEY,all);renderCenterContents(mount,route,state);});
 const saved=localRead(SEARCH_KEY,{});savedList.replaceChildren();for(const [id,label] of [['','Mentett szűrések'],...Object.keys(saved).sort((a,b)=>a.localeCompare(b,'hu')).map(x=>[x,x])]){const opt=el('option',null,label);opt.value=id;savedList.append(opt);}
 savedList.addEventListener('change',()=>{const chosen=savedList.value;if(!chosen||!saved[chosen])return;const next={...DEFAULT,...saved[chosen]};saveState(next);renderCenterContents(mount,route,next);});
 savedPane.append(field('Mentett szűrő',savedList),field('Új mentés',savedInput),save,remove);mount.append(savedPane);
 mount.append(results);
 function updateResults(){
  results.replaceChildren();const docs=matchedDocuments(state);
  resultLabel.textContent=docs.length+' dokumentum található · az adatok dátuma: '+formatDate(registry.data.updatedAt);
  if(!docs.length){const empty=el('div','doc-empty');empty.append(el('h3',null,'Nincs találat a választott feltételekkel'),el('p',null,state.category.startsWith('intezmenyi')?'Az intézményi szabályzatok és nyomtatványok csak hiteles, jóváhagyott fájlokkal kerülhetnek ide. Jelenleg nem jelenítünk meg ellenőrizetlen hivatalos dokumentumot.':'Módosítsd a keresőkifejezést, a kategóriát vagy az állapotszűrőt.'));results.append(empty);return;}
  const list=el('div',state.view==='cards'?'doc-card-grid':state.view==='list'?'doc-list':'doc-table-scroll');
  if(state.view==='table'){
   const table=el('table','doc-table');const head=el('thead');const tr=el('tr');for(const title of ['Dokumentum','Kategória','Típus','Állapot','Kiadás','Művelet'])tr.append(el('th',null,title));head.append(tr);table.append(head);
   const tb=el('tbody');docs.forEach(d=>tb.append(documentCard(d,'table')));table.append(tb);list.append(table);
  }else docs.forEach(d=>list.append(documentCard(d,state.view)));
  results.append(list);
 }
 updateResults();
}
export function renderDocumentCenter(route){
 const mount=el('section','doc-center');activeMount=mount;activeRoute=route;
 queueMicrotask(()=>{if(mount.isConnected)renderCenterContents(mount,route,loadState());});
 return mount;
}
export function renderRelatedDocuments(route){
 if(!registry||!route||route.startsWith('#/informaciok/dokumentumtar'))return null;
 const docs=registry.data.documents.filter(d=>d.status==='published'&&d.relatedRoutes.includes(route)).slice(0,4);
 if(!docs.length)return null;
 const section=el('section','doc-related');section.append(el('p','doc-kicker','KAPCSOLÓDÓ DOKUMENTUMOK'),el('h2',null,'Hasznos letölthető anyagok'));
 const list=el('div','doc-related-list');for(const d of docs){const card=el('article','doc-related-item');card.append(el('strong',null,d.title),el('p',null,d.summary),makeTag(d.official?'Intézményi dokumentum':'Általános segédlet'));
 const btn=htmlButton('Előnézet és letöltés →','doc-action',()=>openPreview(d));card.append(btn);list.append(card);}
 section.append(list);
 const all=el('a','doc-center-link','Összes dokumentum megtekintése →');all.href='#/informaciok/dokumentumtar';section.append(all);
 return section;
}
export function renderDocumentQuickLinks(){
 if(!registry)return null;
 const s=el('section','doc-home-teaser section-wrap');const container=el('div','container-xxl');container.append(el('p','doc-kicker','DOKUMENTUMKÖZPONT'),el('h2','section-title','Letölthető útmutatók és segédletek'),el('p','doc-lead','Áttekinthető, kereshető gyűjtemény ellenőrzött fájlhivatkozásokkal. A hivatalos iskolai dokumentumokat elkülönítve kezeljük.'));
 const list=el('div','doc-related-list');for(const d of registry.data.documents.filter(x=>x.status==='published').slice(0,3)){
  const c=el('article','doc-related-item');c.append(el('span','doc-kicker','PDF SEGÉDLET'),el('h3',null,d.title),el('p',null,d.summary));c.append(htmlButton('Megtekintés →','doc-action',()=>openPreview(d)));list.append(c);
 }container.append(list);const a=el('a','doc-center-link','Dokumentumtár megnyitása →');a.href='#/informaciok/dokumentumtar';container.append(a);s.append(container);return s;
}
export function documentRefreshSeconds(){return registry?.data?.refreshSeconds||90;}
