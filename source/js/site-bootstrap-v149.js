/** Csanádi 1.51: a teljes látható oldalkeret JSON-ból épül fel. */
import {appendJsonStyles,installJsonDocument,safeJsonURL} from './json-dom-v149.js';
import {requireValidJsonShell} from './json-validator-v149.js';

const SHELL_URL='json/site-shell.json?v=1.51';
let shell=null;

function emergency(error){
 console.error('A JSON-vezérelt weboldal nem indult:',error);
 document.documentElement.style.removeProperty('visibility');
 document.documentElement.classList.remove('cs-gate-pending');
 const main=document.createElement('main');
 main.style.cssText='max-width:52rem;margin:10vh auto;padding:2rem;font:1rem/1.6 system-ui';
 const title=document.createElement('h1');
 title.textContent=shell?.errors?.title||'A weboldal nem indult el';
 const message=document.createElement('p');
 message.textContent=shell?.errors?.description||'Az oldal adatai jelenleg nem tölthetők be.';
 const detail=document.createElement('p');
 detail.textContent=location.protocol==='file:'?
  (shell?.errors?.fileHint||'HTTP(S) kiszolgáló szükséges.'):
  (shell?.errors?.serverHint||'Ellenőrizd a JSON- és JavaScript-fájlokat.');
 const retry=document.createElement('button');retry.type='button';
 retry.textContent=shell?.errors?.retryText||'Újrapróbálkozás';
 retry.style.cssText='margin-top:1rem;padding:.7rem 1.1rem;border-radius:.6rem;cursor:pointer';
 retry.addEventListener('click',()=>location.reload());
 main.append(title,message,detail,retry);document.body.replaceChildren(main);
}

function setTheme(config){
 const preference=config.theme||{},modes=preference.modes||['system','light','dark'];
 let mode=preference.default||'system';
 try{const saved=localStorage.getItem(preference.storageKey||'csanadi-theme');
  if(modes.includes(saved))mode=saved;}catch{}
 const query=new URLSearchParams(location.search);
 if(query.get('preview')==='1'&&['light','dark'].includes(query.get('previewTheme')))
  mode=query.get('previewTheme');
 const actual=mode==='system'&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':
  mode==='system'?'light':mode;
 document.documentElement.dataset.theme=actual;
 document.documentElement.dataset.themePreference=mode;
 document.documentElement.setAttribute('data-bs-theme',actual);
 const bar=document.getElementById('theme-color');
 if(bar)bar.content=actual==='dark'?preference.darkBar:preference.lightBar;
}

function prepareGate(config){
 const gate=config.gate||{},preview=new URLSearchParams(location.search).get('preview')==='1';
 const active=(!gate.desktopOnly||!matchMedia('(max-width: 768px), (pointer: coarse) and (hover: none)').matches)&&
  (!gate.disableInPreview||!preview);
 if(!active){document.getElementById(gate.preludeId)?.remove();return;}
 document.documentElement.classList.add('cs-gate-pending');
 if(safeJsonURL(gate.firstFrame)){
  const preload=document.createElement('link');preload.rel='preload';
  preload.as='image';preload.type='image/webp';preload.href=gate.firstFrame;
  document.head.append(preload);
 }
 setTimeout(()=>{document.documentElement.classList.remove('cs-gate-pending');
  document.getElementById(gate.preludeId)?.remove();},Number(gate.durationMs)||20000);
}

function preloadLanding(config){
 const route=location.hash||'#/';
 if(!['#/','#'].includes(route)||document.documentElement.classList.contains('cs-gate-pending')||
  navigator.connection?.saveData)return;
 const data=config.imagePreload||{},kind=matchMedia('(max-width: 768px), (pointer: coarse) and (hover: none)').matches?'mobile':'desktop';
 const selected=data[kind];if(!selected?.base||!Array.isArray(selected.sources))return;
 const files=selected.sources.filter(item=>Array.isArray(item)&&safeJsonURL(selected.base+item[0])&&
  Number.isFinite(item[1]));
 if(!files.length)return;
 const link=document.createElement('link');link.rel='preload';link.as='image';link.type='image/webp';
 link.href=selected.base+files.at(-1)[0];
 link.imageSrcSet=files.map(([name,width])=>selected.base+name+' '+width+'w').join(', ');
 link.imageSizes=data.sizes||'100vw';link.fetchPriority='high';document.head.append(link);
}

async function loadOrderedScript(definition,network={}){
 const src=definition?.src;if(!safeJsonURL(src))return false;
 const url=new URL(src,document.baseURI);
 if(url.origin!==location.origin&&url.origin!=='https://cdn.jsdelivr.net')return false;
 const remote=url.origin!==location.origin;
 if(remote&&navigator.onLine===false){console.warn('CDN mellőzve offline állapotban:',src);return false;}
 return new Promise(resolve=>{
  const script=document.createElement('script');script.src=src;script.async=false;
  if(definition.integrity)script.integrity=definition.integrity;
  if(definition.crossorigin)script.crossOrigin=definition.crossorigin;
  let settled=false;
  const finish=ok=>{
   if(settled)return;settled=true;clearTimeout(timer);script.onload=null;script.onerror=null;
   if(!ok)script.remove();resolve(ok);
  };
  const configured=remote?Number(network.cdnScriptTimeoutMs):Number(network.localScriptTimeoutMs);
  const timeout=Number.isFinite(configured)&&configured>=1000&&configured<=20000?
   configured:(remote?4000:6500);
  const timer=setTimeout(()=>{console.warn('Szkriptbetöltés időtúllépés:',src);finish(false);},timeout);
  script.onload=()=>finish(true);
  script.onerror=()=>{console.warn('Nem elérhető szkript:',src);finish(false);};
  document.body.append(script);
 });
}

async function start(){
 document.documentElement.style.visibility='hidden';
 try{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  let response;
  try{response=await fetch(SHELL_URL,{cache:'no-store',signal:controller.signal});}
  finally{clearTimeout(timer);}
  if(!response.ok)throw Error('HTTP '+response.status+' – '+SHELL_URL);
  shell=await response.json();
  requireValidJsonShell(shell,{kind:'site'});
  const loaded=appendJsonStyles(shell.assets?.stylesheets||[]);
  installJsonDocument(shell);
  // A képek első festésekor még nem feltétlenül fut a képváltó modul.
  // A JSON-vázban megadott helyi tartalékkép ekkor is azonnal elérhető.
  const hero=document.getElementById('global-hero');
  const fallback=hero?.getAttribute('data-cs-mb-fallback-image')||'';
  if(/^assets\/media\/[a-z0-9/_\-.]+$/i.test(fallback)&&!fallback.includes('..'))
   hero.style.setProperty('--cs-mb-fallback-image',`url("${fallback}")`);
  setTheme(shell);prepareGate(shell);preloadLanding(shell);
  // A korábbi renderblokkoló stíluslapokhoz hasonlóan a tartalom csak a
  // helyi stílusok rövid várakozása után látható; CDN-hiba nem állítja le.
  await Promise.race([Promise.allSettled(loaded),new Promise(resolve=>setTimeout(resolve,5000))]);
  document.documentElement.style.removeProperty('visibility');
  for(const definition of shell.assets?.scripts||[])await loadOrderedScript(definition,shell.network);
  const entry=shell.assets?.entryModule;
  if(typeof entry!=='string'||!/^script\.js\?v=\d+\.\d+$/.test(entry))
   throw Error('Érvénytelen alkalmazás-belépési pont');
  await import(new URL(entry,document.baseURI).href);
  setTimeout(()=>{if(!window.__CSANADI_STARTED__)emergency(Error('A főalkalmazás nem válaszol.'));},25000);
 }catch(error){emergency(error);}
}

void start();
