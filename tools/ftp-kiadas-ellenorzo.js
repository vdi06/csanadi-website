'use strict';
const run=document.getElementById('r10-run');
const report=document.getElementById('r10-report');
const state=document.getElementById('r10-state');
const totals=document.getElementById('r10-totals');
const findings=document.getElementById('r10-findings');
const prefix='../';
let results=[];
const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el;};
const checkPath=path=>typeof path==='string'&&/^(?:assets|json|css|js)\/[a-z0-9_./-]+$/i.test(path)&&!path.split('/').includes('..');
async function json(path){const response=await fetch(prefix+path,{cache:'no-store'});if(!response.ok)throw Error(path+': HTTP '+response.status);return response.json();}
async function available(path){try{let response=await fetch(prefix+path,{method:'HEAD',cache:'no-store'});if(response.status===405||response.status===501)response=await fetch(prefix+path,{cache:'no-store'});return response.ok;}catch{return false;}}
function add(kind,what,detail,path=''){const entry={kind,what,detail,path};results.push(entry);const row=node('article','r10-quality-item '+kind);row.append(node('strong','',kind==='ok'?'✓ '+what:kind==='warn'?'! '+what:'✕ '+what),node('p','',detail));if(path)row.append(node('code','',path));findings.append(row);return entry;}
function download(filename,content,mime){const url=URL.createObjectURL(new Blob([content],{type:mime}));const a=node('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);}
function csvEscape(value){return '"'+String(value??'').replace(/"/g,'""')+'"';}
async function bounded(paths,worker,count=8){let cursor=0;const failures=[];await Promise.all(Array.from({length:Math.min(count,paths.length)},async()=>{while(cursor<paths.length){const path=paths[cursor++];if(!(await worker(path)))failures.push(path);}}));return failures.sort();}
report.addEventListener('click',()=>{if(!results.length)return;const lines=['Állapot;Terület;Megjegyzés;Útvonal',...results.map(item=>[item.kind,item.what,item.detail,item.path].map(csvEscape).join(';'))];download('csanadi_ftp_ellenorzes.csv','\ufeff'+lines.join('\r\n'),'text/csv;charset=utf-8');});
run.addEventListener('click',async()=>{
 run.disabled=true;report.disabled=true;results=[];findings.replaceChildren();totals.replaceChildren();state.textContent='Az oldalindex betöltése…';
 let pages={},media=[],totalPaths=0;
 try{
  const [index,structure,inventory,mediaRegistry,docs]=await Promise.all([json('json/oldalindex.json'),json('json/structure.json'),json('json/assets-inventory.json'),json('json/mediatar.json'),json('json/adatok/dokumentumok.json')]);
  pages=index.pages||{};media=inventory.items||[];
  const pageEntries=Object.entries(pages);
  const routes=pageEntries.map(([,p])=>p.schemaExtensions?.route).filter(Boolean);
  const routeUnique=new Set(routes);
  add(routes.length===routeUnique.size&&routes.length===66?'ok':'fail','Oldalindex és útvonalak',`${routes.length} regisztrált oldal; ${routeUnique.size} különböző útvonal.`, 'json/oldalindex.json');
  add(structure.schemaVersion===index.schemaVersion?'ok':'warn','JSON-séma','Az oldalstruktúra és az oldalindex sémaváltozata: '+structure.schemaVersion+' / '+index.schemaVersion);
  const accepted=pageEntries.filter(([,p])=>p.schemaExtensions?.verifiedContent===true).length;
  add(accepted===pageEntries.length?'ok':'warn','Tartalmi jóváhagyások',`${accepted}/${pageEntries.length} oldal tartalmaz intézményi ellenőrzési jelölést. A jelölés nem helyettesíti a tényleges ellenőrzést.`);
  const problemPages=pageEntries.filter(([,p])=>p.schemaExtensions?.verifiedContent!==true).map(([path])=>'json/'+path);
  if(problemPages.length)add('warn','Jóváhagyandó oldalak',`${problemPages.length} oldal további intézményi tartalmi ellenőrzést igényel.`,problemPages.slice(0,8).join(', '));
  add(Array.isArray(mediaRegistry.items)?'ok':'fail','Média-JSON',`${mediaRegistry.items?.length||0} médiaazonosító szerepel a nyilvántartásban.`, 'json/mediatar.json');
  add(Array.isArray(docs.documents)?'ok':'fail','Dokumentum-JSON',`${docs.documents?.length||0} dokumentumbejegyzés szerepel.`, 'json/adatok/dokumentumok.json');
  const invalid=media.filter(item=>!checkPath(item.path));
  add(invalid.length?'fail':'ok','Médiaútvonalak biztonsága',invalid.length?`${invalid.length} nem megfelelő útvonal`:`${media.length} jól formázott állományútvonal.`);
  const list=pageEntries.map(([path])=>'json/'+path).filter(checkPath);totalPaths=list.length;
  state.textContent=`Oldal-JSON fájlok ellenőrzése: ${totalPaths} fájl…`;
  const errors=await bounded(list,async path=>{try{const item=await json(path);return /^page:[0-9]{6}$/.test(item.id||'')&&Array.isArray(item.blocks)&&item.schemaExtensions?.route;}catch{return false;}},6);
  add(errors.length?'fail':'ok','Tényleges oldalbetöltés',`${list.length-errors.length}/${list.length} érvényes és betölthető oldal-JSON.${errors.length?' Hibák: '+errors.slice(0,5).join(', '):''}`);
  if(document.getElementById('r10-assets').checked){
   const assets=[...new Set(media.map(item=>item.path).filter(checkPath))];
   state.textContent=`Médiafájlok elérhetőségének vizsgálata: ${assets.length} állomány…`;
   const missing=await bounded(assets,available,10);
   add(missing.length?'fail':'ok','Médiafájlok elérése',`${assets.length-missing.length}/${assets.length} állomány érhető el.${missing.length?' Hiányzik: '+missing.slice(0,8).join(', '):''}`);
  }else add('warn','Médiaellenőrzés kihagyva','A teljes állományellenőrzést nem kérted.');
  try{
   const manifest=await json('release-manifest.json'),items=manifest.files||{},paths=Object.keys(items);
   add(paths.length>600?'ok':'warn','Kiadási állományjegyzék',paths.length+' állomány SHA-256 metaadattal a release-manifest.json fájlban.');
   const rollbackFiles=['README.md','index.html','json/config.json','json/structure.json','json/oldalindex.json','assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf'];
   const missingRollback=rollbackFiles.filter(path=>!items[path]);
   add(missingRollback.length?'fail':'ok','Visszaállítási alapcsomag',missingRollback.length?'A kiadásból hiányzik: '+missingRollback.join(', '):'A README, a belépési pont, a központi JSON-ok és a PDF-kézikönyv kiadási integritásadatai rendelkezésre állnak. A korábbi ZIP-et az FTP-visszaállításhoz külön meg kell őrizni.');
   if(crypto?.subtle){
    const critical=['index.html','utmutato.html','service-worker.js','js/app.js','js/hero-2026.js','json/oldalindex.json','json/adatok/dokumentumok.json','assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf'];
    const checked=[];for(const path of critical){const entry=items[path];if(!entry){checked.push(path+' hiányzik a manifestből');continue;}const response=await fetch('../'+path,{cache:'no-store'});if(!response.ok){checked.push(path+' HTTP '+response.status);continue;}const buffer=await response.arrayBuffer(),hash=await crypto.subtle.digest('SHA-256',buffer),hex=[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');if(hex!==entry.sha256||buffer.byteLength!==entry.sizeBytes)checked.push(path+' hash-/méreteltérés');}
    add(checked.length?'fail':'ok','Kritikus fájlok hash-ellenőrzése',checked.length?checked.join('; '):critical.length+' kritikus fájl tartalma és mérete egyezik a kiadási manifeszttel.');
   }else add('warn','Kiadási hash-ellenőrzés','A WebCrypto API nem elérhető ebben a környezetben. Használj HTTPS-t vagy helyi biztonságos kiszolgálást.');
  }catch(e){add('warn','Kiadási manifest','A kiadási manifest ellenőrzése nem sikerült: '+e.message);}
  const html=await fetch('../index.html',{cache:'no-store'}).then(r=>r.text());
  add(/<meta\s+name="robots"\s+content="noindex,nofollow"/.test(html)?'warn':'ok','Keresőmotoros indexelés',/noindex,nofollow/.test(html)?'A fejlesztési noindex,nofollow beállítás aktív; élesítés előtt tudatos döntést igényel.':'A fejlesztési noindex jelölés nem található a főoldalon.');
  const parsed=new DOMParser().parseFromString(html,'text/html');
  const images=[...parsed.querySelectorAll('img')];
  const lackingAlt=images.filter(image=>!image.hasAttribute('alt'));
  add(lackingAlt.length?'warn':'ok','Kezdőlap HTML-képek alternatív szövege',lackingAlt.length?`${lackingAlt.length} képnél hiányzik az alt attribútum. Az üres alt külön elfogadható lehet dekoratív képnél.`:`${images.length} HTML-kép rendelkezik alt attribútummal.`);
  const buttons=[...parsed.querySelectorAll('button')];
  const unlabeled=buttons.filter(button=>!button.textContent.trim()&&!button.getAttribute('aria-label')&&!button.getAttribute('title'));
  add(unlabeled.length?'warn':'ok','Kezdőlap HTML-gombok megnevezése',unlabeled.length?`${unlabeled.length} gomb nem rendelkezik közvetlen felirattal vagy akadálymentes névvel.`:`${buttons.length} HTML-gombnál van közvetlen felirat vagy akadálymentes név.`);
  add(parsed.querySelector('.skip-link[href="#app"]')?'ok':'warn','Billentyűzetes tartalomugrás',parsed.querySelector('.skip-link[href="#app"]')?'A kezdőlapban szerepel a fő tartalomra ugró hivatkozás.':'Nem található a fő tartalomra ugró hivatkozás.');
  add('warn','Hash-alapú SPA SEO-korlát','A #/ útvonalakat a keresőmotorok nem feltétlenül indexelik külön tartalmi oldalként. A teljes SEO-hoz külön publikációs stratégia kell.');
  add(html.includes('bootstrap@5.3.9')?'ok':'warn','Bootstrap CDN','Verzióhoz kötött Bootstrap CDN; internetkapcsolat szükséges a stílushoz és az interaktív Bootstrap-komponensekhez.');
  add('warn','Böngészőközi és akadálymentességi ellenőrzés','A helyi ellenőrzés nem helyettesíti a Firefox-, Safari-, WCAG- és valós FTP-tesztet.');
 }catch(error){add('fail','Az ellenőrzés megszakadt',error.message);}
 const ok=results.filter(x=>x.kind==='ok').length,bad=results.filter(x=>x.kind==='fail').length,warn=results.filter(x=>x.kind==='warn').length;
 const boxes=[['Sikeres',ok],['Figyelmeztetés',warn],['Hibás',bad]];
 for(const [name,count] of boxes){const box=node('div','r10-quality-total');box.append(node('strong','',count),node('span','',name));totals.append(box);}
 state.textContent=`Ellenőrzés befejezve: ${ok} sikeres, ${warn} figyelmeztetés, ${bad} hibás csoport.`;
 run.disabled=false;report.disabled=!results.length;
});
