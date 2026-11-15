(function(){
 'use strict';
 // A megnyitott HTML verzióját hasonlítjuk az aktuális kiadáshoz.
 const source=document.currentScript?.src;
 const loadedVersion=source?new URL(source,location.href).searchParams.get('v'):null;
 let notifiedVersion=null,checking=null;
 const notify=(version)=>{
  if(!loadedVersion||version===loadedVersion||version===notifiedVersion)return;
  notifiedVersion=version;
  const toast=document.getElementById('toast');if(!toast)return;
  const message=document.createElement('span');message.textContent='Elérhető a honlap új verziója. Frissítsd az oldalt a legújabb fejlesztésekhez és tartalmakhoz.';
  const actions=document.createElement('span');actions.className='cs-release-actions';
  const later=document.createElement('button');later.type='button';later.textContent='Később';later.addEventListener('click',()=>{toast.hidden=true;});
  const reload=document.createElement('button');reload.type='button';reload.textContent='Frissítés';reload.addEventListener('click',()=>location.reload());
  actions.append(later,reload);toast.replaceChildren(message,actions);toast.hidden=false;
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
