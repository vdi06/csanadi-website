
 
let panel=null;
let pending=null;
let initialReadyMs=null;
let currentRouteMs=null;
let latestStatus='Betöltés…';
let lastRoute='';
let bundleStats=null;
const clock=()=>Math.max(0,performance.now());
const fmt=(ms)=> Number.isFinite(ms)?(ms<1000?`${Math.round(ms)} ms`:`${(ms/1000).toLocaleString('hu-HU',{minimumFractionDigits:2,maximumFractionDigits:2})} s`):'—';
const bytes=value=>Number.isFinite(value)?(value/1048576).toLocaleString('hu-HU',{maximumFractionDigits:2,minimumFractionDigits:2})+' MiB':'—';
async function measureBundle(){
 try{
  const response=await fetch('release-manifest.json',{cache:'no-store'});
  if(!response.ok)throw new Error('HTTP '+response.status);
  const manifest=await response.json();
  const entries=Object.entries(manifest.files||{});
  const kinds={Képek:0,Videók:0,Dokumentumok:0,'Kód és adatok':0};
  let total=0;
  for(const [path,meta] of entries){
   if(!Number.isSafeInteger(meta.sizeBytes)||meta.sizeBytes<0)throw new Error('Hibás fájlméret: '+path);
   total+=meta.sizeBytes;
   const key=/\.(webp|avif|png|jpg|jpeg|gif|svg)$/i.test(path)?'Képek':/\.(mp4|webm)$/i.test(path)?'Videók':/\.(pdf|docx|txt)$/i.test(path)?'Dokumentumok':'Kód és adatok';
   kinds[key]+=meta.sizeBytes;
  }
  bundleStats={total,count:entries.length,kinds,error:null};
 }catch(error){bundleStats={error:String(error.message||error)};}
 refresh();
}
function el(name,classes,text){const node=document.createElement(name);if(classes)node.className=classes;if(text!==undefined)node.textContent=text;return node;}
function refresh(){
 if(!panel)return;
 const init=panel.querySelector('[data-speed-init]'),route=panel.querySelector('[data-speed-route]'),status=panel.querySelector('[data-speed-status]'),details=panel.querySelector('[data-speed-browser]');
 init.textContent=fmt(initialReadyMs);
 route.textContent=fmt(currentRouteMs);
 status.textContent=latestStatus;
 const size=panel.querySelector('[data-speed-size]'),fileCount=panel.querySelector('[data-speed-file-count]'),detail=panel.querySelector('[data-speed-file-detail]'),resources=panel.querySelector('[data-speed-resources]'),slow=panel.querySelector('[data-speed-slowest]');
 size.textContent=bundleStats?.error?'Nem elérhető':bundleStats?bytes(bundleStats.total):'Betöltés…';
 fileCount.textContent=bundleStats?.count===undefined?'—':bundleStats.count.toLocaleString('hu-HU')+' fájl';
 detail.textContent=bundleStats?.error?'A kiadási manifest nem olvasható: '+bundleStats.error:bundleStats?'A manifestben szereplő '+bundleStats.count+' állomány tömörítetlen összmérete: '+bytes(bundleStats.total)+'. '+Object.entries(bundleStats.kinds).map(([name,size])=>name+': '+bytes(size)).join(' · ')+'. A ZIP tömörített mérete ettől eltér, a manifest önmagát nem számolja.':'A fájlleltár kiolvasása folyamatban…';
 const measured=[...performance.getEntriesByType('resource'),...performance.getEntriesByType('navigation')];
 const transferred=measured.reduce((sum,entry)=>sum+(entry.transferSize||0),0);
 const decoded=measured.reduce((sum,entry)=>sum+(entry.decodedBodySize||0),0);
 resources.textContent='Böngésző által mért erőforrások: '+measured.length+' kérés · hálózati átvitel: '+bytes(transferred)+' · feldolgozott válaszmennyiség: '+bytes(decoded)+'. A cache-ből betöltött és a külső források mérése hiányos lehet.';
 let slowCount=0;try{slowCount=settingNumber('runtime.diagnostics.slowestResourceCount');}catch{}
 const slower=performance.getEntriesByType('resource').filter(entry=>{try{return new URL(entry.name).origin===location.origin&&entry.duration>0;}catch{return false;}}).sort((a,b)=>b.duration-a.duration).slice(0,slowCount);
 slow.textContent=slower.length?'Leglassabb helyi állományok: '+slower.map(entry=>{const url=new URL(entry.name);return decodeURIComponent(url.pathname.split('/').at(-1)||url.pathname)+' ('+fmt(entry.duration)+')';}).join(' · ')+'. Ezek a böngésző által mért letöltési idők, nem egy teljes hálózati sebességteszt.':'A helyi állományok részletes időmérése még nem elérhető.';
 const nav=performance.getEntriesByType?.('navigation')?.[0];
 if(nav){
  const dom=nav.domContentLoadedEventEnd>0?fmt(nav.domContentLoadedEventEnd):'Még folyamatban';
  const load=nav.loadEventEnd>0?fmt(nav.loadEventEnd):'Még folyamatban';
  const fcp=performance.getEntriesByType('paint').find(entry=>entry.name==='first-contentful-paint');
  details.textContent=`HTML-feldolgozás (DOMContentLoaded): ${dom} · Böngésző load esemény: ${load} · Első tartalommegjelenés (FCP): ${fcp?fmt(fcp.startTime):'nem mérhető'}`;
 }else details.textContent='A böngésző nem ad részletes navigációs mérési adatokat.';
}
export function initPerformanceDiagnostics(){
 if(panel)return;
 const footer=document.querySelector('.site-footer');if(!footer)return;
 panel=el('section','cs-speed-panel container-xxl');panel.setAttribute('aria-label','Betöltési diagnosztika');
 const row=el('div','cs-speed-row');
 const lead=el('div','cs-speed-lead');lead.append(el('strong','','Betöltési diagnosztika'),el('span','','Mérés ezen az eszközön'));
 const initial=el('div','cs-speed-metric');initial.append(el('span','','Weboldal indulása'),el('strong','','—'));initial.lastChild.dataset.speedInit='';
 const route=el('div','cs-speed-metric');route.append(el('span','','Aktuális oldal megjelenése'),el('strong','','—'));route.lastChild.dataset.speedRoute='';
 const state=el('div','cs-speed-state');state.append(el('span','','Állapot: '),el('strong','','Betöltés…'));state.lastChild.dataset.speedStatus='';
 const size=el('div','cs-speed-metric');size.append(el('span','','Teljes kiadási fájlméret'),el('strong','','—'));size.lastChild.dataset.speedSize='';
 const count=el('div','cs-speed-metric');count.append(el('span','','Állományok száma'),el('strong','','—'));count.lastChild.dataset.speedFileCount='';
 row.append(lead,initial,route,size,count,state);
 const disclosure=el('details','cs-speed-details');const summary=el('summary','','Mit jelentenek ezek az adatok?');
 const explanation=el('p','','Az indulás a webalkalmazás első megjelenítéséig eltelt idő; az aktuális oldal értéke az oldalváltástól a megjelenítésig tartó idő. A mérések a böngészőben történnek, gyorsítótár és eszközteljesítmény is befolyásolhatja őket. Nem internetsebesség-teszt és nem PageSpeed-pontszám.');
 const timings=el('p','cs-speed-timings','');timings.dataset.speedBrowser='';
 const files=el('p','cs-speed-timings','');files.dataset.speedFileDetail='';
 const resources=el('p','cs-speed-timings','');resources.dataset.speedResources='';
 const slower=el('p','cs-speed-timings','');slower.dataset.speedSlowest='';
 disclosure.append(summary,explanation,timings,files,resources,slower);
 panel.append(row,disclosure);
 const foot=footer.querySelector('.footer-bottom');foot?foot.before(panel):footer.append(panel);
 if(document.readyState==='complete')refresh();else window.addEventListener('load',refresh,{once:true});
 measureBundle();
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
import {settingNumber} from './site-settings-2026.js';
