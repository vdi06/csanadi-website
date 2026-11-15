(function(){
 if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
 const install=()=>navigator.serviceWorker.register('service-worker.js',{scope:'./',updateViaCache:'none'}).then(registration=>{
  // Megnyitáskor és újra előtérbe kerüléskor az új szervizmunkást is megkeressük.
  const check=()=>registration.update().catch(()=>{});
  check();document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
  fetch('json/config.json',{cache:'no-store'}).then(response=>response.ok?response.json():null).then(config=>{
   const seconds=Number(config?.runtime?.release?.updateCheckSeconds);
   if(Number.isFinite(seconds)&&seconds>=30)window.setInterval(()=>{if(!document.hidden)check();},seconds*1000);
  }).catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
   // Nem töltünk újra szerkesztőben vagy formok közben; értesítjük a látogatót.
   if(document.querySelector('form input:focus,form textarea:focus'))return;
   const node=document.getElementById('toast');if(node){node.textContent='Új honlapverzió érkezett. Frissítsd az oldalt a legújabb tartalomhoz.';node.hidden=false;}
  });
 }).catch(()=>{});
 if(document.readyState==='complete')install();else window.addEventListener('load',install,{once:true});
})();
