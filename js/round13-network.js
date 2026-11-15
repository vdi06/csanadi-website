(function(){
 if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
 const install=()=>navigator.serviceWorker.register('service-worker.js',{scope:'./'}).catch(()=>{});
 if(document.readyState==='complete')install();else window.addEventListener('load',install,{once:true});
})();
