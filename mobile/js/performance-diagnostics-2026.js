import {formatBytes as bytes} from './format-bytes.js?v=1.53';
 
let panel=null;
let pending=null;
let initialReadyMs=null;
let currentRouteMs=null;
let latestStatus='Betöltés…';
let lastRoute='';
let bundleStats=null;
let bundleRequested=false;
let bundleRun=0;
const webVitals={lcp:null,cls:0,shiftSources:[],interactionMax:null,interactionCount:0};
let observersStarted=false;
const clock=()=>Math.max(0,performance.now());
const fmt=(ms)=>Number.isFinite(ms)?Math.round(ms).toLocaleString('hu-HU')+' ms':'—';
const resourceName=(value)=>{
 try{
  const url=new URL(value,location.href),name=url.pathname.split('/').at(-1)||url.hostname;
  try{return decodeURIComponent(name);}catch{return name;}
 }catch{return 'ismeretlen erőforrás';}
};
// A diagnosztika nem akadályozhatja meg a honlap indulását, akkor sem,
// ha a settings modul még nem inicializálódott, vagy egy régi config él a cache-ben.
export const diagnosticNumber=(key,fallback)=>{
 try{const value=settingNumber('runtime.diagnostics.'+key);return value>0?value:fallback;}
 catch{return fallback;}
};
async function measureBundle(){
 const run=++bundleRun;
 try{
  const response=await fetch('../release-manifest.json',{cache:'no-store'});
  if(!response.ok)throw new Error('HTTP '+response.status);
  const manifest=await response.json();
  if(run!==bundleRun)return;
  if(!manifest||typeof manifest!=='object'||Array.isArray(manifest)||manifest.schemaVersion!=='1.0.0'||!manifest.files||typeof manifest.files!=='object'||Array.isArray(manifest.files)||!/^csanadi-website-\d+\.\d+$/.test(manifest.release||''))throw new Error('Hibás kiadási manifest');
  const configResponse=await fetch('../shared/json/config.json',{cache:'no-store'});
  if(!configResponse.ok)throw new Error('Konfiguráció HTTP '+configResponse.status);
  const config=await configResponse.json();
  if(run!==bundleRun)return;
  const manifestVersion=/\d+\.\d+$/.exec(manifest.release||'')?.[0]||null;
  const runtimeVersion=/\d+\.\d+$/.exec(config.performance?.cacheVersion||'')?.[0]||null;
  const entries=Object.entries(manifest.files||{});
  if(entries.length<4||entries.length>10000)throw new Error('Hiányos vagy túlméretes kiadási manifest');
  const kinds={Képek:0,Videók:0,Dokumentumok:0,'Kód és adatok':0};
  let total=0;
  for(const [path,meta] of entries){
   if(!meta||typeof meta!=='object'||!Number.isSafeInteger(meta.sizeBytes)||meta.sizeBytes<0)throw new Error('Hibás fájlméret: '+path);
   total+=meta.sizeBytes;
   const key=/\.(webp|avif|png|jpg|jpeg|gif|svg)$/i.test(path)?'Képek':/\.(mp4|webm)$/i.test(path)?'Videók':/\.(pdf|docx|txt)$/i.test(path)?'Dokumentumok':'Kód és adatok';
   kinds[key]+=meta.sizeBytes;
  }
  const invalid=entries.filter(([file,meta])=>!file||file.startsWith('/')||file.includes('..')||file.includes('\\')||/[\u0000-\u001f]/.test(file)||!/^[a-f0-9]{64}$/.test(meta.sha256||''));
  if(!Number.isSafeInteger(total)||total<=0||total>100000000000)throw new Error('Érvénytelen teljes kiadási fájlméret');
  if(invalid.length)throw new Error('Érvénytelen kiadási tétel: '+invalid.length);
  const required=['index.html','shared/json/config.json','shared/json/structure.json','js/platform-router-v149.js'];
  if(required.some(file=>!manifest.files?.[file]||manifest.files[file].sizeBytes===0))throw new Error('Hiányzó vagy üres kötelező kiadási állomány');
  if(run===bundleRun)bundleStats={total,count:entries.length,kinds,release:manifest.release,cacheConsistent:!!manifestVersion&&manifestVersion===runtimeVersion&&manifest.bootstrap==='CDN bootstrap@5.3.9',error:null};
 }catch(error){if(run===bundleRun)bundleStats={error:String(error.message||error)};}
 if(run===bundleRun)refresh();
}
function el(name,classes,text){const node=document.createElement(name);if(classes)node.className=classes;if(text!==undefined)node.textContent=text;return node;}
function refresh(){
 if(!panel||panel.closest('#footer-diagnostics-disclosure:not([open])'))return;
 const init=panel.querySelector('[data-speed-init]'),route=panel.querySelector('[data-speed-route]'),status=panel.querySelector('[data-speed-status]'),details=panel.querySelector('[data-speed-browser]');
 init.textContent=fmt(initialReadyMs);
 route.textContent=fmt(currentRouteMs);
 status.textContent=latestStatus;
 const version=panel.querySelector('[data-speed-version]');
 if(version){const release=bundleStats?.release||'Kiadás ellenőrzése…',page=document.documentElement.dataset.csanadiPageRevision||'—',home=!location.hash||location.hash==='#/'||location.hash==='#';version.replaceChildren(el('span','cs-speed-version-line',`Honlapverzió: ${release}`),el('span','cs-speed-version-line',`${home?'Kezdőlap':'Aktuális oldal'} · Oldalverzió: ${page}`));}
 const size=panel.querySelector('[data-speed-size]'),fileCount=panel.querySelector('[data-speed-file-count]'),detail=panel.querySelector('[data-speed-file-detail]'),resources=panel.querySelector('[data-speed-resources]'),slow=panel.querySelector('[data-speed-slowest]');
 size.textContent=bundleStats?.error?'Nem elérhető':bundleStats?bytes(bundleStats.total):'Betöltés…';
 fileCount.textContent=bundleStats?.count===undefined?'—':bundleStats.count.toLocaleString('hu-HU')+' fájl';
 detail.textContent=bundleStats?.error?'A kiadási manifest nem olvasható: '+bundleStats.error:bundleStats?'A manifestben szereplő '+bundleStats.count+' állomány tömörítetlen összmérete: '+bytes(bundleStats.total)+'. '+Object.entries(bundleStats.kinds).map(([name,size])=>name+': '+bytes(size)).join(' · ')+'. Verzió- és gyorsítótár-egyezés: '+(bundleStats.cacheConsistent?'rendben':'ELTÉRÉS – frissítés szükséges')+'. A ZIP tömörített mérete ettől eltér, a manifest önmagát nem számolja.':'A fájlleltár kiolvasása folyamatban…';
 const measured=[...performance.getEntriesByType('resource'),...performance.getEntriesByType('navigation')];
 const transferred=measured.reduce((sum,entry)=>sum+(entry.transferSize||0),0);
 const decoded=measured.reduce((sum,entry)=>sum+(entry.decodedBodySize||0),0);
 resources.textContent='Böngésző által mért erőforrások: '+measured.length+' kérés · hálózati átvitel: '+(transferred?bytes(transferred):'nem mérhető')+' · feldolgozott válaszmennyiség: '+(decoded?bytes(decoded):'nem mérhető')+'. A cache-ből betöltött és a külső források mérése hiányos lehet.';
 const slowCount=diagnosticNumber('slowestResourceCount',5);
 const slower=performance.getEntriesByType('resource').filter(entry=>{try{return new URL(entry.name).origin===location.origin&&entry.duration>0;}catch{return false;}}).sort((a,b)=>b.duration-a.duration).slice(0,slowCount);
 slow.textContent=slower.length?'Leglassabb helyi állományok: '+slower.map(entry=>resourceName(entry.name)+' ('+fmt(entry.duration)+')').join(' · ')+'. Ezek a böngésző által mért letöltési idők, nem egy teljes hálózati sebességteszt.':'A helyi állományok részletes időmérése még nem elérhető.';
 const largestCount=diagnosticNumber('largestResourceCount',5),targetLcpMs=diagnosticNumber('targetLcpMs',2500),targetCls=diagnosticNumber('targetCls',0.1),targetFcpMs=diagnosticNumber('targetFcpMs',1800);
 const big=measured.filter(entry=>entry.decodedBodySize>0).sort((a,b)=>b.decodedBodySize-a.decodedBodySize).slice(0,largestCount);
 panel.querySelector('[data-speed-largest]').textContent=big.length?'Legnagyobb feldolgozott erőforrások: '+big.map(entry=>resourceName(entry.name)+' ('+bytes(entry.decodedBodySize)+')').join(' · ')+'. A cross-origin és gyorsítótári mérések hiányosak lehetnek.':'A böngésző nem szolgáltat dekódolt méretadatot az erőforrásokhoz.';
 const fcpEntry=performance.getEntriesByType('paint').find(entry=>entry.name==='first-contentful-paint');
 const fcp=fcpEntry?.startTime;
 const metric=(name,value,target,unit)=>name+': '+(Number.isFinite(value)?(unit==='ms'?fmt(value):value.toLocaleString('hu-HU',{maximumFractionDigits:3}))+(value<=target?' (célon belül)':' (cél fölött)'):'nem mérhető')+' · cél: '+(unit==='ms'?fmt(target):target);
 panel.querySelector('[data-speed-vitals]').textContent=[metric('FCP',fcp,targetFcpMs,'ms'),metric('LCP',webVitals.lcp,targetLcpMs,'ms'),metric('CLS',webVitals.cls,targetCls,'score'),`INP-eseményminta maximuma: ${webVitals.interactionMax===null?'még nincs adat':fmt(webVitals.interactionMax)} (${webVitals.interactionCount} esemény)`].join(' | ')+'. Az eseményminta NEM hiteles INP / PageSpeed mérés, a böngésző csak bizonyos interakciókat közöl; az LCP a betöltés végéig változhat.';
 const shiftCandidates=panel.querySelector('[data-speed-shift-sources]');
 if(shiftCandidates)shiftCandidates.textContent=webVitals.shiftSources.length?'Elrendezés-elmozdulási jelzések: '+webVitals.shiftSources.slice(0,5).map(x=>x).join(' · ')+'. A pontos okot a böngésző teljesítményelemzőjében kell megvizsgálni.':'Az elmozdulások okozóelemeit a böngésző még nem azonosította. A CLS célértéke legfeljebb 0,1.';
 const nav=performance.getEntriesByType?.('navigation')?.[0];
 if(nav){
  const dom=nav.domContentLoadedEventEnd>0?fmt(nav.domContentLoadedEventEnd):'Még folyamatban';
  const load=nav.loadEventEnd>0?fmt(nav.loadEventEnd):'Még folyamatban';
  details.textContent=`HTML-feldolgozás (DOMContentLoaded): ${dom} · Böngésző load esemény: ${load} · Első tartalommegjelenés (FCP): ${fcpEntry?fmt(fcpEntry.startTime):'nem mérhető'}`;
 }else details.textContent='A böngésző nem ad részletes navigációs mérési adatokat.';
}
export function initPerformanceDiagnostics(){
 if(panel)return;
 const footer=document.querySelector('.site-footer');if(!footer)return;
 const footerDisclosure=footer.querySelector('#footer-diagnostics-disclosure');
 if(footerDisclosure){
  const label=footerDisclosure.querySelector('#footer-diagnostics-label');
  footerDisclosure.addEventListener('toggle',()=>{
   if(label)label.textContent=footerDisclosure.open?'Honlapdiagnosztika bezárása':'Honlapdiagnosztika megnyitása';
   if(footerDisclosure.open){
    if(!bundleRequested||bundleStats?.error){bundleRequested=true;measureBundle();}
    refresh();
   }
  });
 }
 panel=el('section','cs-speed-panel container-xxl');panel.setAttribute('aria-label','Honlapdiagnosztika');panel.dataset.diagnosticView='speed';
 const heading=el('div','cs-diag-heading');heading.append(el('h2','','Honlapdiagnosztika'),el('p','','Betöltési sebesség, fájlméretek és honlapállapot egy helyen.'));
 const tabs=el('div','cs-diag-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Diagnosztikai nézet');
 for(const [view,label] of [['speed','Sebesség és betöltés'],['health','Állapot és ellenőrzés']]){const tab=el('button','cs-diag-tab',label);tab.type='button';tab.dataset.diagTab=view;tab.setAttribute('aria-pressed',String(view==='speed'));tab.addEventListener('click',()=>{panel.dataset.diagnosticView=view;for(const item of tabs.querySelectorAll('button'))item.setAttribute('aria-pressed',String(item===tab));});tabs.append(tab);}
 const speedView=el('div','cs-diag-speed-view');
 const row=el('div','cs-speed-row');
 const lead=el('div','cs-speed-lead');lead.append(el('strong','','Mérés ezen az eszközön'),el('span','','A böngésző aktuális eredményei'));
 const initial=el('div','cs-speed-metric');initial.append(el('span','','Weboldal indulása'),el('strong','','—'));initial.lastChild.dataset.speedInit='';
 const route=el('div','cs-speed-metric');route.append(el('span','','Aktuális oldal megjelenése'),el('strong','','—'));route.lastChild.dataset.speedRoute='';
 const state=el('div','cs-speed-state');state.append(el('span','','Állapot: '),el('strong','','Betöltés…'));state.lastChild.dataset.speedStatus='';
 const size=el('div','cs-speed-metric');size.append(el('span','','Teljes kiadási fájlméret'),el('strong','','—'));size.lastChild.dataset.speedSize='';
 const count=el('div','cs-speed-metric');count.append(el('span','','Állományok száma'),el('strong','','—'));count.lastChild.dataset.speedFileCount='';
 const version=el('div','cs-speed-metric');version.append(el('span','','Honlap és oldal verziója'),el('strong','','Kiadás ellenőrzése…'));version.lastChild.dataset.speedVersion='';
 row.append(lead,initial,route,size,count,state,version);
 const disclosure=el('details','cs-speed-details');const summary=el('summary','','Mit jelentenek ezek az adatok?');
 const explanation=el('p','','Az indulás a webalkalmazás első megjelenítéséig eltelt idő; az aktuális oldal értéke az oldalváltástól a megjelenítésig tartó idő. A mérések a böngészőben történnek, gyorsítótár és eszközteljesítmény is befolyásolhatja őket. Nem internetsebesség-teszt és nem PageSpeed-pontszám.');
 const timings=el('p','cs-speed-timings','');timings.dataset.speedBrowser='';
 const files=el('p','cs-speed-timings','');files.dataset.speedFileDetail='';
 const resources=el('p','cs-speed-timings','');resources.dataset.speedResources='';
 const slower=el('p','cs-speed-timings','');slower.dataset.speedSlowest='';
 const largest=el('p','cs-speed-timings','');largest.dataset.speedLargest='';
 const vitals=el('p','cs-speed-timings','');vitals.dataset.speedVitals='';
 const shifts=el('p','cs-speed-timings','');shifts.dataset.speedShiftSources='';
 disclosure.append(summary,explanation,timings,files,resources,slower,largest,vitals,shifts);
 speedView.append(row,disclosure);panel.append(heading,tabs,speedView);
 const mount=footer.querySelector('#footer-diagnostics-mount');
 if(mount)mount.append(panel);
 else{const foot=footer.querySelector('.footer-bottom');foot?foot.before(panel):footer.append(panel);}
 if(document.readyState==='complete')refresh();else window.addEventListener('load',refresh,{once:true});
 // A 150+ KiB manifestet csak akkor kérjük le, ha a látogató kinyitja a diagnosztikát.
 if(!footerDisclosure){bundleRequested=true;measureBundle();}
 window.addEventListener('pageshow',event=>{if(event.persisted&&footerDisclosure?.open)measureBundle();});
 if(!observersStarted && typeof PerformanceObserver==='function'){
  observersStarted=true;
  for(const [type,handler] of [
   ['largest-contentful-paint',entry=>{webVitals.lcp=entry.startTime;}],
   ['layout-shift',entry=>{if(!entry.hadRecentInput){webVitals.cls+=entry.value||0;const attribution=(entry.sources||[]).slice(0,2).map(source=>source.node?.id?'#'+source.node.id:source.node?.className&&typeof source.node.className==='string'?'.'+source.node.className.trim().split(/\s+/).slice(0,2).join('.'):source.node?.tagName||'ismeretlen elem');if(attribution.length)webVitals.shiftSources.push(attribution.join(', ')+' ('+(entry.value||0).toFixed(3)+')');}}],
   ['event',entry=>{if(Number(entry.interactionId)>0&&Number.isFinite(entry.duration)){webVitals.interactionCount++;webVitals.interactionMax=Math.max(webVitals.interactionMax||0,entry.duration);}}]
  ]){
   try{const observer=new PerformanceObserver(list=>{for(const entry of list.getEntries())handler(entry);refresh();});observer.observe(type==='event'?{type,buffered:true,durationThreshold:40}:{type,buffered:true});}catch{}
  }
 }
 refresh();
}
export function markNavigationStart(route,{initial=false}={}){
 if(!panel)initPerformanceDiagnostics();
 pending={route,at:initial?0:clock(),initial};
 lastRoute=route;
 latestStatus='Betöltés…';
 currentRouteMs=null;
 refresh();
}
function finish(route,ok){
 const record=pending;
 if(!record||record.route!==route)return;
  
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(pending!==record)return;
  const duration=Math.max(0,clock()-record.at);
  if(record.initial && initialReadyMs===null)initialReadyMs=duration;
  currentRouteMs=duration;
  latestStatus=ok?'Sikeresen megjelent':'Betöltési hiba';
  pending=null;refresh();
 }));
}
export function markRouteRendered(route,{found=true}={}){finish(route,found);}
export function markRouteError(route){finish(route,false);}
import {settingNumber} from './site-settings-2026.js?v=1.53';
