import {formatBytes} from './format-bytes.js?v=csanadi-r29l-20261115';
import {settingNumber} from './site-settings-2026.js';
 
export const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
export const append=(to,...nodes)=>{nodes.filter(Boolean).forEach(n=>to.append(n));return to;};
const formatted=(n)=>Number.isFinite(n)?Math.round(n).toLocaleString('hu-HU')+' ms':'—';
let diagnosticsReady=false;
export function initDetailedDiagnostics(){
 if(diagnosticsReady)return;diagnosticsReady=true;
 const panel=document.querySelector('.cs-speed-panel');if(!panel)return;
 const details=el('details','ext26-perf-details'),summary=el('summary','','Részletes betöltési adatok – CSS, JavaScript, JSON, képek');
 const hint=el('p','','A böngésző Performance API-jának mérései. Külső CDN esetén az átviteli méret és a pontos idő a böngésző engedélyeitől függ; ezek nem hálózati sebességmérések.');
 const target=el('div','ext26-perf-grid'),refresh=el('button','ext26-refresh','Mérés frissítése');refresh.type='button';
 details.append(summary,hint,refresh,target);(panel.querySelector('.cs-diag-speed-view')||panel).append(details);
 const draw=()=>{
  target.replaceChildren();
  const resources=performance.getEntriesByType?.('resource')||[];
  const groups={JSON:[],JavaScript:[],CSS:[],Képek:[],Videók:[],Egyéb:[]};
  for(const entry of resources){let path='';try{path=new URL(entry.name).pathname;}catch{continue;}
   const group=/\.json$/i.test(path)?'JSON':/\.js$/i.test(path)?'JavaScript':/\.css$/i.test(path)?'CSS':/\.(?:webp|png|jpe?g|svg|gif)$/i.test(path)?'Képek':/\.(?:mp4|webm)$/i.test(path)?'Videók':'Egyéb';groups[group].push(entry);
  }
  for(const [name,items] of Object.entries(groups)){
   const measured=items.map(x=>Math.max(0,x.responseEnd-x.startTime));
   const bytes=items.reduce((total,x)=>total+(x.transferSize||0),0);
   const card=el('div','ext26-perf-card');const speed=items.length?Math.max(...measured):null;
   const label=`${items.length} kérés · leghosszabb ${formatted(speed)} · ${bytes>0?formatBytes(bytes)+' mért átvitel':'átviteli méret nem ismert'}`;
   card.append(el('strong','',name),el('span','',label));target.append(card);
  }
  const nav=performance.getEntriesByType?.('navigation')?.[0];if(nav){const row=el('p','ext26-perf-final',`HTML válasz (TTFB): ${formatted(nav.responseStart-nav.requestStart)} · DOM feldolgozás: ${formatted(nav.domContentLoadedEventEnd)} · böngészőbetöltés: ${formatted(nav.loadEventEnd||null)}`);target.append(row);}
 };
 refresh.addEventListener('click',draw);details.addEventListener('toggle',()=>{if(details.open)draw();});
 document.addEventListener('csanadi:route-rendered',()=>{if(details.open)requestAnimationFrame(draw);});
}
const isLocalRef=href=>typeof href==='string'&&!/^(?:https?:|mailto:|tel:|data:|blob:)/i.test(href)&&!href.startsWith('#');
export function initSiteHealth(catalog){
 if(document.querySelector('#cs-site-health'))return;
 const footer=document.querySelector('.site-footer');if(!footer)return;
 const panel=el('details','ext26-health');panel.id='cs-site-health';panel.open=true;
 const title=el('summary','','Oldalak, média, JSON és hivatkozások');
 const section=el('div','ext26-health-body'),desc=el('p','','Helyi, böngészős ellenőrzés: csak a saját tárhely fájljait vizsgálja. Az ellenőrzés nem helyettesíti a teljes biztonsági, akadálymentességi vagy böngészőközi auditot.');
 const button=el('button','ext26-run-check','Ellenőrzés indítása');button.type='button';
 const status=el('p','ext26-health-state','Készen áll'),results=el('div','ext26-health-results');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 section.append(desc,button,status,results);panel.append(title,section);
 const speed=footer.querySelector('.cs-speed-panel');speed?speed.append(panel):footer.prepend(panel);
 const mark=(ok,msg)=>{const item=el('div',ok?'ext26-check-pass':'ext26-check-fail',`${ok?'✓':'!'} ${msg}`);results.append(item);};
 button.addEventListener('click',async()=>{
  button.disabled=true;results.replaceChildren();status.textContent='Az ellenőrzés folyamatban…';
  let ok=0,fail=0,skipped=0;
  const check=(condition,message)=>{if(condition)ok++;else fail++;mark(condition,message);};
  try{
   const roots=[...catalog.items].map(x=>x.page?.schemaExtensions?.route);const unique=new Set(roots);
   check(roots.length===unique.size,`${roots.length} regisztrált oldal – az útvonalazonosítók ${roots.length===unique.size?'egyediek':'ütköznek'}`);
   const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);check(ids.length===new Set(ids).size,'A jelenlegi oldalon nincs ismétlődő HTML-azonosító');
   const internal=[...document.querySelectorAll('a[href^="#/"]')].map(x=>x.getAttribute('href'));const broken=internal.filter(h=>!unique.has(h)&&h!=='#/');
   check(!broken.length,broken.length?`Hibás belső hivatkozások: ${[...new Set(broken)].slice(0,5).join(', ')}`:`${internal.length} belső hivatkozás ellenőrizve`);
   const rootURL=new URL('json/',document.baseURI);
   try{const [config,index]=await Promise.all(['config.json','oldalindex.json'].map(async file=>{const response=await fetch(new URL(file,rootURL),{cache:'no-store'});if(!response.ok)throw Error(file+': '+response.status);return response.json();}));check(!!config&&index?.schemaVersion==='1.0.0'&&Object.keys(index.pages||{}).length>=catalog.items.length,`Konfiguráció és oldalindex: ${Object.keys(index?.pages||{}).length} regisztrált fájl, séma ${index?.schemaVersion||'ismeretlen'}`);}catch(e){check(false,'A konfiguráció vagy oldalindex nem vizsgálható: '+e.message);}
   const list=[...new Set([
    ...catalog.items.map(x=>'json/'+x.path),
    ...[...document.querySelectorAll('img[src],video[poster],iframe[src],a[download][href]')].map(e=>e.getAttribute('src')||e.getAttribute('poster')||e.getAttribute('href')).filter(isLocalRef).map(x=>x.split('#')[0].split('?')[0]),
    'json/structure.json','json/config.json','json/oldalindex.json','json/mediatar.json','json/adatok/esemenyek.json','json/adatok/dokumentumok.json'
   ])].filter(x=>/^(?:assets\/|json\/)/.test(x));
   try{
    const response=await fetch('release-manifest.json',{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
    const manifest=await response.json(),files=manifest.files||{},paths=Object.keys(files);
    check(manifest.ftpCompatible===true&&paths.length>=settingNumber('runtime.release.minimumManifestEntries'),
     `FTP-manifest: ${paths.length} fájl, kiadás ${manifest.release||'ismeretlen'}`);
    const absent=list.filter(path=>!Object.hasOwn(files,path));
    check(!absent.length,absent.length?`A manifestből hiányzó hivatkozott fájlok: ${absent.slice(0,6).join(', ')}`:'Minden vizsgált hivatkozott állomány szerepel a manifestben');
    const invalid=paths.filter(path=>!Number.isSafeInteger(files[path]?.sizeBytes)||files[path].sizeBytes<0||!/^[a-f0-9]{64}$/.test(files[path]?.sha256||''));
    check(!invalid.length,invalid.length?`Érvénytelen méret vagy SHA-256: ${invalid.slice(0,5).join(', ')}`:'A manifest valamennyi méret- és SHA-256 mezője szabályos');
   }catch(e){check(false,'A kiadási manifest nem ellenőrizhető: '+e.message);}
   try{
    const sources=['json/adatok/esemenyek.json','json/adatok/dokumentumok.json','json/adatok/kepgaleria.json'];
    for(const path of sources){const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw Error(path+' HTTP '+response.status);
     const data=await response.json(),rows=data.items||data.documents||[],ids=rows.map(x=>x.id);
     check(ids.length===new Set(ids).size,`${path}: ${ids.length} rekord, ${ids.length===new Set(ids).size?'egyedi':'ütköző'} azonosítók`);
    }
   }catch(e){check(false,'Tartalmi JSON-azonosítók ellenőrzése megszakadt: '+e.message);}
   const maxChecks=settingNumber('runtime.tools.auditMaximumIssues');
   if(list.length>maxChecks){skipped=list.length-maxChecks;list.length=maxChecks;}
   let cursor=0,good=0,bad=[];
   await Promise.all(Array.from({length:Math.min(settingNumber('runtime.tools.auditConcurrentRequests'),list.length)},async()=>{
    while(cursor<list.length){const path=list[cursor++];try{const response=await fetch(path,{method:'HEAD',cache:'no-store'});if(response.ok)good++;else if([405,501].includes(response.status)){const fallback=await fetch(path,{cache:'no-store'});if(fallback.ok)good++;else bad.push(path+' ('+fallback.status+')');}else bad.push(path+' ('+response.status+')');}catch(e){bad.push(path+' (hálózati hiba)');}}
   }));
   check(bad.length===0,`${good}/${list.length} belső fájl elérhető${bad.length?' · hibák: '+bad.slice(0,6).join(', '):''}`);
   const sourcedImages=[...document.images].filter(img=>{const src=img.currentSrc||img.getAttribute('src')||img.getAttribute('srcset')||'';return src.trim().length>0;});
   const missingImages=sourcedImages.filter(img=>img.complete&&img.naturalWidth===0);
   const imageNames=missingImages.slice(0,4).map(img=>{const path=img.currentSrc||img.getAttribute('src')||img.getAttribute('srcset')||'';try{return new URL(path,location.href).pathname;}catch{return path;}});
   check(missingImages.length===0,`${sourcedImages.length} valódi képforrás vizsgálva · ${missingImages.length} betöltési hiba${imageNames.length?' · hibás fájlok: '+imageNames.join(', '):''}`);
  }catch(e){fail++;mark(false,'Az ellenőrzés megszakadt: '+e.message);}
  status.textContent=`Ellenőrzés vége: ${ok} sikeres, ${fail} hibás ellenőrzési csoport${skipped?', '+skipped+' nem vizsgált fájl':''}.`;button.disabled=false;
 });
}
