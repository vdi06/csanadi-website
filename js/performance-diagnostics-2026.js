/* Csanádi – statikus FTP-n is működő, helyi böngészős teljesítménydiagnosztika.
   Nem használ külső mérést, sütit, követőkódot vagy szerveroldali szolgáltatást. */
let panel=null;
let pending=null;
let initialReadyMs=null;
let currentRouteMs=null;
let latestStatus='Betöltés…';
let lastRoute='';
const clock=()=>Math.max(0,performance.now());
const fmt=(ms)=> Number.isFinite(ms)?(ms<1000?`${Math.round(ms)} ms`:`${(ms/1000).toLocaleString('hu-HU',{minimumFractionDigits:2,maximumFractionDigits:2})} s`):'—';
function el(name,classes,text){const node=document.createElement(name);if(classes)node.className=classes;if(text!==undefined)node.textContent=text;return node;}
function refresh(){
 if(!panel)return;
 const init=panel.querySelector('[data-speed-init]'),route=panel.querySelector('[data-speed-route]'),status=panel.querySelector('[data-speed-status]'),details=panel.querySelector('[data-speed-browser]');
 init.textContent=fmt(initialReadyMs);
 route.textContent=fmt(currentRouteMs);
 status.textContent=latestStatus;
 const nav=performance.getEntriesByType?.('navigation')?.[0];
 if(nav){
  const dom=nav.domContentLoadedEventEnd>0?fmt(nav.domContentLoadedEventEnd):'Még folyamatban';
  const load=nav.loadEventEnd>0?fmt(nav.loadEventEnd):'Még folyamatban';
  details.textContent=`HTML-feldolgozás (DOMContentLoaded): ${dom} · Böngésző load esemény: ${load}`;
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
 row.append(lead,initial,route,state);
 const disclosure=el('details','cs-speed-details');const summary=el('summary','','Mit jelentenek ezek az adatok?');
 const explanation=el('p','','Az indulás a webalkalmazás első megjelenítéséig eltelt idő; az aktuális oldal értéke az oldalváltástól a megjelenítésig tartó idő. A mérések a böngészőben történnek, gyorsítótár és eszközteljesítmény is befolyásolhatja őket. Nem internetsebesség-teszt és nem PageSpeed-pontszám.');
 const timings=el('p','cs-speed-timings','');timings.dataset.speedBrowser='';
 disclosure.append(summary,explanation,timings);
 panel.append(row,disclosure);
 const foot=footer.querySelector('.footer-bottom');foot?foot.before(panel):footer.append(panel);
 if(document.readyState==='complete')refresh();else window.addEventListener('load',refresh,{once:true});
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
 // A második animation frame azt jelzi, hogy a tartalomnak már volt esélye kirajzolódni.
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
