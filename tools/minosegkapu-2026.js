import {inspectNewsCollection} from '../js/news-policy-2026.js';
const pick=id=>document.getElementById(id);
const make=(tag,cls='',value='')=>{const node=document.createElement(tag);if(cls)node.className=cls;if(value)node.textContent=String(value);return node;};
const state={records:[],finishedAt:null,configuration:null,readiness:null};
const data=async path=>{const response=await fetch('../'+path,{cache:'no-store'});if(!response.ok)throw Error(path+' HTTP '+response.status);return response.json();};
const add=(severity,area,message,path='')=>state.records.push({severity,area,message,path});
const safePath=value=>typeof value==='string'&&!value.split('/').includes('..')&&/^[a-z0-9][a-z0-9/._-]+$/i.test(value);
const csvSafe=value=>{const raw=String(value??'');return '"'+(/^[\s\uFEFF]*[=+\-@]/.test(raw)?"'"+raw:raw).replace(/"/g,'""')+'"';};
function localReviewEvidence(items){
 let stored={};try{stored=JSON.parse(localStorage.getItem('csanadi-content-review-r13')||'{}');}catch{/* helyi beállítás nem kötelező */}
 if(!stored||typeof stored!=='object'||Array.isArray(stored))stored={};
 return items.reduce((summary,item)=>{
  const entry=stored[item.key];
  if(entry?.status==='ready')summary.checked++;
  const officialSource=(()=>{try{const url=new URL(String(entry?.sourceUrl||''));return url.protocol==='https:'&&url.hostname==='csanadi-bp.edu.hu'&&url.pathname!=='/';}catch{return false;}})();
  if(entry?.status==='approved'&&entry.reviewer&&entry.evidence&&entry.decision&&(!item.media||entry.permission)&&(!item.news||(officialSource&&/\b\d{4}-\d{2}-\d{2}\b/.test(entry.evidence))))summary.recorded++;
  return summary;
 },{checked:0,recorded:0});
}
const save=(name,content,type)=>{const url=URL.createObjectURL(new Blob([content],{type})),a=make('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);};
function summarize(){
 const totals={ok:0,warning:0,error:0};for(const record of state.records)totals[record.severity]++;
 const stats=pick('quality-stats'),list=pick('quality-findings');stats.replaceChildren();list.replaceChildren();
 for(const [type,label] of [['ok','Sikeres'],['warning','Figyelmeztetés'],['error','Hiba']]){const box=make('article');box.append(make('strong','',totals[type]),make('span','',label));stats.append(box);}
 const max=state.configuration.runtime.tools.auditMaximumIssues;
 for(const record of state.records.slice(0,max)){
  const card=make('article');card.dataset.severity=record.severity;
  card.append(make('strong','',record.area+' – '+(record.severity==='ok'?'Rendben':record.severity==='warning'?'Figyelmeztetés':'Hiba')),make('p','',record.message));
  if(record.path)card.append(make('code','',record.path));list.append(card);
 }
 if(state.records.length>max)list.append(make('p','',`A képernyőn ${max} tétel látható a ${state.records.length} közül. A letöltött jelentés minden bejegyzést tartalmaz.`));
 pick('quality-status').textContent=`Ellenőrzés lezárva: ${totals.ok} sikeres, ${totals.warning} figyelmeztetés, ${totals.error} hiba. A figyelmeztetések kézi jóváhagyást igényelhetnek.`;
 const readiness=state.readiness;
 pick('publication-gate-status').textContent=readiness
  ?`Nem tekinthető automatikusan közzétételre jóváhagyottnak. Ellenőrizendő: ${readiness.priorityPages} oldal, ${readiness.pendingMediaRights} médiajog, ${readiness.newsWithoutOfficialSources} hírforrás. Helyben igazoló mezőkkel rögzítve: ${readiness.localPageEvidence}/${readiness.priorityPages} oldal, ${readiness.localMediaEvidence}/${readiness.pendingMediaRights} média és ${readiness.localNewsEvidence}/${readiness.newsWithoutOfficialSources} hír. Hír-HTTPS-források ellenőrzési hiányosságai: ${readiness.newsWithoutOfficialSources}. Fájl-/kapcsolati hiba: ${totals.error}. A feltöltéshez külön intézményi jóváhagyás szükséges.`
  :'Kiadási döntés nem hozható: az ellenőrzés hiányos vagy megszakadt.';
 pick('quality-download').disabled=false;pick('quality-csv').disabled=false;
}
async function audit(){
 state.records=[];state.finishedAt=null;state.readiness=null;pick('quality-run').disabled=true;pick('quality-download').disabled=true;pick('quality-csv').disabled=true;
 pick('quality-status').textContent='A központi JSON-források ellenőrzése…';
 try{
  const [config,index,structure,news,docs,media,inventory,manifest,contentReview]=await Promise.all(['json/config.json','json/oldalindex.json','json/structure.json','json/adatok/hirek-hivatalos.json','json/adatok/dokumentumok.json','json/mediatar.json','json/assets-inventory.json','release-manifest.json','dokumentacio/TARTALMI_MINOSEG_V1_39_9.json'].map(data));
  state.configuration=config;
  const source=manifest.files||{},pages=index.pages||{},pageNames=Object.keys(pages),actualRoutes=new Set(),ids=new Set(),paths=new Set();
  const expected=config.runtime.release.expectedPageCount;
  add(pageNames.length===expected?'ok':'error','Oldalindex',`${pageNames.length} oldal a konfigurált ${expected} helyett.`,'json/oldalindex.json');
  for(const [path,page] of Object.entries(pages)){
   const route=page.schemaExtensions?.route,id=page.id;
   if(actualRoutes.has(route)||!/^#\/[a-z0-9/-]*$/.test(route||''))add('error','Ütköző vagy hibás oldalútvonal',String(route),path);
   if(ids.has(id)||!id)add('error','Ütköző oldalazonosító',String(id),path);
   if(!source['json/'+path])add('error','A manifestből hiányzó oldal',path,'json/'+path);
   actualRoutes.add(route);ids.add(id);
  }
  const menuPaths=[];
  const walk=(nodes,depth=0)=>{for(const node of nodes||[]){if(depth>config.navigation.maxDepth)add('error','Túl mély menü','A menühierarchia túllépi a megadott szintkorlátot.');if(node.path)menuPaths.push(node.path);walk(node.children,depth+1);}};
  walk(structure.nodes);
  for(const path of menuPaths){if(paths.has(path))add('error','Ismételt menühivatkozás',path);if(!pages[path])add('error','Hiányzó menüoldal',path);paths.add(path);}
  add('ok','Navigáció',`${menuPaths.length} menühivatkozás, ${actualRoutes.size} egyedi oldalútvonal, ${ids.size} egyedi oldalazonosító.`);
  const priorities=contentReview.priorities||[];
  if(!Array.isArray(priorities)||priorities.length!==contentReview.manualPriorityPages)add('error','Kiemelt oldalak munkalistája','A hitelesítési jelentésben szereplő oldalszám vagy munkalap eltér.','dokumentacio/TARTALMI_MINOSEG_V1_39_9.json');
  for(const item of priorities){
   const path=String(item.file||'').replace(/^json\//,'');
   if(!pages[path])add('error','Kiemelt oldal hiányzik az indexből',String(item.title||path),item.file||'');
   else add('warning','Tartalmi jóváhagyás még szükséges',String(item.title||path),item.file||'');
  }
  const newsFailures=inspectNewsCollection(news,config);
  for(const failure of newsFailures)for(const message of failure.findings)add('error','Hírek közzétételi kapuja',message,failure.id);
  const samples=(news.items||[]).filter(item=>item.status==='sample'),verified=(news.items||[]).filter(item=>item.status==='verified');
  if(!newsFailures.length)add('ok','Hírek',`${samples.length} fiktív mintahír és ${verified.length} ellenőrzött intézményi bejegyzés. Név szerinti tanulói sporthír csak dokumentált jóváhagyással lehetne közzétehető.`);
  const docsRecords=docs.documents||[];
  for(const item of docsRecords){
   if(item.status==='published'&&item.filePath){
    if(!safePath(item.filePath)||!source[item.filePath])add('error','Dokumentumhivatkozás',`${item.title}: a közzétett állomány nincs a manifestben.`,item.filePath);
    else if(item.sha256&&source[item.filePath].sha256!==item.sha256)add('error','Dokumentumellenőrzőösszeg',`${item.title}: a fájljegyzék és a dokumentumtár hash-e eltér.`,item.filePath);
   }
  }
  add('ok','Dokumentumtár',`${docsRecords.length} dokumentumrekord kapcsolatai átnézve.`);
  const assetItems=inventory.items||[];
  for(const item of assetItems){if(!safePath(item.path)||!source[item.path])add('error','Assets-állomány hiányzik',item.title||'Név nélküli állomány',item.path);else if(item.sha256&&source[item.path].sha256!==item.sha256)add('error','Assets-állomány hash-eltérés',item.title||'Állomány',item.path);}
  add('ok','Assets-fájlleltár',`${assetItems.length} fájlhivatkozás ellenőrizve.`);
  const registry=media.items||[];let pending=0,rightsMissing=0,mediaPaths=0;
  for(const item of registry){
   const rights=item.rights||{};
   if(!rights.holder||!rights.license){rightsMissing++;add('warning','Médiahasználati jogok','Hiányzó jogosult vagy felhasználási engedély',item.id);}
   if(rights.clearance==='pending'){pending++;add('warning','Média jóváhagyásra vár','Az állomány nem tekinthető éles iskolai felhasználásra jóváhagyottnak.',item.id);}
   if(item.decorative!==true&&!item.alt?.trim())add('warning','Kép akadálymentessége','A nem dekoratív kép alternatív szövege hiányzik.',item.id);
   for(const variant of [item.original,...(item.variants||[])]){if(!variant?.path)continue;mediaPaths++;if(!source[variant.path])add('error','Médiaváltozat hiányzik',variant.path,item.id);else if(variant.sha256&&source[variant.path].sha256!==variant.sha256)add('error','Médiaváltozat hash-eltérés',variant.path,item.id);}
  }
  add(pending||rightsMissing?'warning':'ok','Médiatár-láthatóság',`${registry.length} médiaazonosító, ${mediaPaths} médiaútvonal; ${pending} jóváhagyásra vár, ${rightsMissing} hiányos jogi nyilvántartás.`);
  const pendingItems=registry.filter(item=>item.rights?.clearance==='pending');
  const reviewedPages=localReviewEvidence(priorities.map(item=>({key:'page:'+String(item.file||'').replace(/^json\//,'')})));
  const reviewedMedia=localReviewEvidence(pendingItems.map(item=>({key:'media:'+item.id,media:true})));
  const newsMissing=(news.items||[]).filter(item=>item.status==='verified'&&newsFailures.some(failure=>failure.id===item.id));
  const reviewedNews=localReviewEvidence(newsMissing.map(item=>({key:'news:'+item.id,news:true})));
  state.readiness={priorityPages:priorities.length,pendingMediaRights:pending,
   newsWithoutOfficialSources:newsMissing.length,
   localPageEvidence:reviewedPages.recorded,localMediaEvidence:reviewedMedia.recorded,localNewsEvidence:reviewedNews.recorded,
   institutionalApprovalVerified:false,ftpPublished:false};
  add('warning','Közzététel jóváhagyása',`A helyi munkalap kitöltése nem jelent szerzői jogi vagy intézményi döntést; ${priorities.length} kiemelt oldal, ${pending} felhasználási jog és ${newsMissing.length} hivatalos hírforrás továbbra is ellenőrzendő.`);
  const minimum=config.runtime.release.minimumManifestEntries;const manifestCount=Object.keys(source).length;
  add(manifestCount>=minimum?'ok':'error','FTP-manifest',`${manifestCount} állomány, az elvárt minimum: ${minimum}.`,'release-manifest.json');
  const html=await fetch('../index.html',{cache:'no-store'}).then(response=>{if(!response.ok)throw Error('Kezdőlap nem érhető el.');return response.text();});
  const doc=new DOMParser().parseFromString(html,'text/html'),footer=doc.querySelector('.site-footer');
  const leaked=[...footer?.querySelectorAll('a')||[]].filter(link=>/utmutato\.html|tools\//.test(link.getAttribute('href')||''));
  add(leaked.length?'error':'ok','Nyilvános felületi elkülönítés',leaked.length?'A lábléc karbantartói vagy külön kézikönyvhivatkozást tartalmaz.':'A láblécben nincsenek karbantartói hivatkozások.');
  const toolsPage=await fetch('index.html',{cache:'no-store'}).then(response=>response.text());
  add(/noindex,nofollow/.test(toolsPage)?'ok':'error','Karbantartói munkaközpont','A közvetlenül nyitható segédoldal nem szerepel a nyilvános menüben; az URL nem hitelesített belépés.');
  add('warning','Intézményi jóváhagyás','A fájlellenőrzés nem bizonyít személyesadat-kezelési engedélyt, tényszerűséget, teljes WCAG-megfelelést vagy képfelhasználási jogosultságot.');
 }catch(error){add('error','A minőségkapu megszakadt',String(error.message||error));}
 state.finishedAt=new Date().toISOString();
 if(!state.configuration)state.configuration={runtime:{tools:{auditMaximumIssues:100}}};
 summarize();pick('quality-run').disabled=false;
}
pick('quality-run').addEventListener('click',audit);
pick('quality-download').addEventListener('click',()=>save('csanadi_minosegkapu.json',JSON.stringify({generatedAt:state.finishedAt,readiness:state.readiness,records:state.records},null,2),'application/json;charset=utf-8'));
pick('quality-csv').addEventListener('click',()=>{const rows=[['Súlyosság','Terület','Megjegyzés','Útvonal'],...state.records.map(x=>[x.severity,x.area,x.message,x.path])];save('csanadi_minosegkapu.csv','\ufeff'+rows.map(row=>row.map(csvSafe).join(';')).join('\r\n'),'text/csv;charset=utf-8');});
