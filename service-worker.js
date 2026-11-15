const scope=new URL('./',self.registration.scope);
let configPromise=null,lastConfigAt=0,lastConfig=null;
const local=url=>url.origin===scope.origin&&url.pathname.startsWith(scope.pathname);
async function configuration(){
 if(configPromise&&(!lastConfig||Date.now()-lastConfigAt<lastConfig.refresh.structureSeconds*1000))return configPromise;
 configPromise=(async()=>{
  const url=new URL('json/config.json',scope);
  try{const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);return response.json();}
  catch(error){const cached=await caches.match(url,{ignoreSearch:true});if(!cached)throw error;return cached.json();}
 })();
 configPromise=configPromise.then(value=>{lastConfig=value;lastConfigAt=Date.now();return value;}).catch(error=>{configPromise=null;throw error;});
 return configPromise;
}
const names=config=>({shell:config.performance.cacheVersion,media:config.performance.cacheVersion+'-media',reader:config.performance.cacheVersion+'-offline'});
async function precache(){
 const config=await configuration(),cacheNames=names(config),cache=await caches.open(cacheNames.shell);
 const start=['./','./index.html','./felfedezo.html','./iranytu.html','./iskolai-muhely.html','./orokseg-es-tudastar.html','./tanulas-es-kozosseg.html','./megkozelites-es-tanulas.html','./utmutato.html','./offline.html','./json/config.json','./json/adatok/kozossegi-muhely-23.json','./json/adatok/orokseg-es-tudastar-24.json','./json/adatok/tanulas-kozosseg-25.json','./json/adatok/megkozelites-fejlodes-26.json','./service-worker.js','./release-manifest.json','./assets/media/logo/csanadi-cimer-512.webp'];
 let paths=start;
 try{
  const response=await fetch(new URL('release-manifest.json',scope),{cache:'no-store'});
  if(response.ok){const manifest=await response.json(),max=config.performance.offlinePrecacheFileMaxBytes,limit=config.performance.offlinePrecacheMaxEntries;
   const selected=Object.entries(manifest.files||{}).filter(([path,meta])=>/^(?:css|js|json|mobile|desktop)\/.+\.(?:css|js|json)$/.test(path)&&meta.sizeBytes<=max).slice(0,limit).map(([path])=>'./'+path);
   paths=[...new Set([...start,'./script.js',...selected])];
  }
 }catch{}
 const concurrency=Math.max(1,config.refresh.maxConcurrentRequests),queue=[...paths];
 await Promise.all(Array.from({length:concurrency},async()=>{
  while(queue.length){const path=queue.shift();try{const request=new Request(new URL(path,scope),{cache:'reload'});const response=await fetch(request);if(response.ok)await cache.put(request,response);}catch{}}
 }));
}
async function trimMedia(cache,config){
 const count=config.performance.mediaCacheEntries,budget=config.performance.maxCacheMegabytes*1048576;
 const keys=await cache.keys();let total=0;const sizes=[];
 for(const request of keys){const response=await cache.match(request),size=Number(response?.headers.get('content-length'))||0;total+=size;sizes.push(size);}
 for(let index=0;index<keys.length&&(keys.length-index>count||total>budget);index++){await cache.delete(keys[index]);total-=sizes[index];}
}
async function handle(request){
 const url=new URL(request.url),config=await configuration(),n=names(config),isPage=request.mode==='navigate',json=/\.json$/i.test(url.pathname),media=/\.(?:avif|webp|png|jpg|jpeg|svg|gif|mp4|webm|pdf)$/i.test(url.pathname);
 // Online MINDEN helyi erőforrás hálózatról érkezik, képek és PDF-ek is.
 // A korábbi média-cache-first módszer egy módosított képet régi változatban tarthatott.
 const cache=await caches.open(media?n.media:n.shell);
 try{const response=await fetch(request,{cache:'no-store'});if(response.ok){await cache.put(request,response.clone());if(media)trimMedia(cache,config).catch(()=>{});}return response;}
 catch(error){
  const saved=await cache.match(request,{ignoreSearch:true});if(saved)return saved;
  const reader=await caches.open(n.reader),selected=await reader.match(request,{ignoreSearch:true});if(selected)return selected;
  if(isPage)return await cache.match(new URL('index.html',scope),{ignoreSearch:true})||await cache.match(new URL('offline.html',scope),{ignoreSearch:true})||Response.error();
  if(json)return new Response(JSON.stringify({offline:true,temporary:true}),{status:503,headers:{'Content-Type':'application/json'}});
  throw error;
 }
}
self.addEventListener('install',event=>{event.waitUntil(precache().catch(()=>{}).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const config=await configuration(),current=names(config),keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('csanadi-r')&&key!==current.shell&&key!==current.media&&key!==current.reader).map(key=>caches.delete(key)));await self.clients.claim();})().catch(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(!local(url))return;event.respondWith(handle(event.request).catch(()=>Response.error()));});
