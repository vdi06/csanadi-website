(function(){
 'use strict';
 // A megnyitott HTML verzióját hasonlítjuk az aktuális kiadáshoz.
 const source=document.currentScript?.src;
 const loadedVersion=source?new URL(source,location.href).searchParams.get('v'):null;
 const parseVersion=value=>{
  const match=/^csanadi-r-v(\d+)\.(\d+)\.(\d+)$/.exec(value||'');
  return match?match.slice(1).map(Number):null;
 };
 const actuallyNewer=(candidate,current)=>{
  const a=parseVersion(candidate),b=parseVersion(current);
  if(!a||!b)return false;
  for(let i=0;i<3;i++){if(a[i]!==b[i])return a[i]>b[i];}
  return false;
 };
 let notifiedVersion=null,checking=null,dismissTimer=null;
 const notify=(version)=>{
  // Eltérő/korábban gyorsítótárazott konfiguráció nem jelent új kiadást.
  if(!actuallyNewer(version,loadedVersion)||version===notifiedVersion)return;
  try { if(sessionStorage.getItem('csanadi-dismissed-release')===version)return; }catch{}
  notifiedVersion=version;
  const toast=document.getElementById('toast');if(!toast)return;
  const message=document.createElement('span');message.textContent='Elérhető a honlap új verziója. Frissítsd az oldalt a legújabb fejlesztésekhez és tartalmakhoz.';
  const actions=document.createElement('span');actions.className='cs-release-actions';
  const dismiss=()=>{toast.hidden=true;clearTimeout(dismissTimer);try{sessionStorage.setItem('csanadi-dismissed-release',version);}catch{}};
  const later=document.createElement('button');later.type='button';later.textContent='Később';later.addEventListener('click',dismiss);
  const reload=document.createElement('button');reload.type='button';reload.textContent='Frissítés';
  reload.addEventListener('click',async()=>{
   clearTimeout(dismissTimer);toast.hidden=true;
   // Force a distinct HTML URL so Chromium and static CDN caches cannot reuse the prior document URL.
   try{const registration=await navigator.serviceWorker?.getRegistration?.();await registration?.update?.();}catch{}
   const next=new URL(location.href);
   next.searchParams.set('release',version);
   location.replace(next.href);
  });
  actions.append(later,reload);toast.replaceChildren(message,actions);toast.hidden=false;
  clearTimeout(dismissTimer);
  // The update notice stays visible until the visitor chooses an action.
 };
 const checkVersion=()=>{
  if(checking)return checking;
  checking=fetch('json/config.json',{cache:'no-store'}).then(response=>{
   if(!response.ok)throw Error('HTTP '+response.status);
   return response.json();
  }).then(config=>{
   const version=config?.performance?.cacheVersion;
   if(typeof version==='string'&&version.trim())notify(version.trim());
   return config;
  }).catch(()=>null).finally(()=>{checking=null;});
  return checking;
 };
 const start=()=>{
  checkVersion().then(config=>{
   const seconds=Number(config?.runtime?.release?.updateCheckSeconds);
   const interval=Number.isFinite(seconds)&&seconds>=30?seconds:300;
   window.setInterval(()=>{if(!document.hidden)checkVersion();},interval*1000);
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkVersion();});
  if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
  navigator.serviceWorker.register('service-worker.js',{scope:'./',updateViaCache:'none'}).then(registration=>{
   const checkWorker=()=>registration.update().catch(()=>{});
   checkWorker();document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkWorker();});
   // A service worker első aktiválása nem bizonyít új honlapverziót.
   navigator.serviceWorker.addEventListener('controllerchange',()=>{checkVersion();});
  }).catch(()=>{});
 };
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
