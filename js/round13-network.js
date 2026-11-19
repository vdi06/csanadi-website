/* Cross-version update flow for a static HTTPS/FTP deployment. */
(function(){
 'use strict';
 const source=document.currentScript?.src||'';
 const loadedVersion=new URL(source||location.href,location.href).searchParams.get('v')||'';
 const parseVersion=value=>{
  const m=/^csanadi-r-v(\d+)\.(\d+)\.(\d+)(?:-content-(\d{8}-\d{6}))?$/.exec(value||'');
  return m?{sem:m.slice(1,4).map(Number),stamp:m[4]||''}:null;
 };
 const newer=(candidate,current)=>{
  const a=parseVersion(candidate),b=parseVersion(current);
  if(!a)return false;if(!b)return true;
  for(let i=0;i<3;i++)if(a.sem[i]!==b.sem[i])return a.sem[i]>b.sem[i];
  return !!a.stamp&&a.stamp>b.stamp;
 };
 let notifiedVersion=null,checking=null,interval=null;
 const notice=()=>{
  let root=document.getElementById('cs-release-notice');if(root)return root;
  root=document.createElement('aside');root.id='cs-release-notice';root.className='cs-release-notice';root.hidden=true;
  root.setAttribute('role','status');root.setAttribute('aria-live','polite');document.body.append(root);return root;
 };
 async function upgrade(version){
  try{
   const registration=await navigator.serviceWorker?.getRegistration?.();
   if(registration){
    await registration.update();
    if(registration.waiting){
     const changed=new Promise(resolve=>{
      let finished=false;
      const done=()=>{if(finished)return;finished=true;resolve();};
      navigator.serviceWorker.addEventListener('controllerchange',done,{once:true});
      setTimeout(done,2400);
     });
     registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
     await changed;
    }
   }
  }catch(error){console.warn('Service Worker update check failed',error);}
  const next=new URL(location.href);
  next.searchParams.set('release',version);
  location.replace(next.href);
 }
 function inform(version){
  if(!newer(version,loadedVersion)||notifiedVersion===version)return;
  try{if(sessionStorage.getItem('csanadi-dismissed-release')===version)return;}catch{}
  notifiedVersion=version;
  const root=notice(),message=document.createElement('span'),actions=document.createElement('span');
  message.textContent='Elérhető a honlap új verziója. A frissítés betölti a legújabb tartalmakat és működést.';
  actions.className='cs-release-actions';
  const later=document.createElement('button');later.type='button';later.textContent='Később';
  later.addEventListener('click',()=>{root.hidden=true;try{sessionStorage.setItem('csanadi-dismissed-release',version);}catch{}});
  const reload=document.createElement('button');reload.type='button';reload.textContent='Frissítés';
  reload.addEventListener('click',()=>upgrade(version));
  actions.append(later,reload);root.replaceChildren(message,actions);root.hidden=false;
 }
 const check=()=>{
  if(checking)return checking;
  checking=fetch('json/config.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();})
   .then(config=>{const v=config?.performance?.cacheVersion;if(typeof v==='string')inform(v);return config;})
   .catch(()=>null).finally(()=>{checking=null;});
  return checking;
 };
 function start(){
  check().then(config=>{
   const seconds=Number(config?.performance?.swUpdateCheckSeconds??config?.runtime?.release?.updateCheckSeconds),period=Number.isFinite(seconds)&&seconds>=30?seconds:300;
   interval=setInterval(()=>{if(!document.hidden)check();},period*1000);
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){check();navigator.serviceWorker?.getRegistration?.().then(r=>r?.update?.()).catch(()=>{});}});
  if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
  navigator.serviceWorker.register('service-worker.js',{scope:'./',updateViaCache:'none'}).then(registration=>{
   registration.update().catch(()=>{});
   navigator.serviceWorker.addEventListener('controllerchange',check);
   registration.addEventListener('updatefound',()=>{
    const worker=registration.installing;
    worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)check();});
   });
  }).catch(error=>console.warn('Offline cache unavailable',error));
 }
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
