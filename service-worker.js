const VERSION='csanadi-r13-20261115';
const MEDIA_VERSION=VERSION+'-media';
const MEDIA_LIMIT=100;
const SHELL=['./','./index.html','./utmutato.html','./css/round13-accessibility.css','./js/round13-network.js','./assets/media/logo/csanadi-cimer-512.webp'];
const isLocal=url=>url.origin===self.location.origin&&url.pathname.startsWith(new URL('./',self.registration.scope).pathname);
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(name=>name.startsWith('csanadi-r')&&name!==VERSION&&name!==MEDIA_VERSION).map(name=>caches.delete(name)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(!isLocal(url))return;
 const isJson=/\.json$/i.test(url.pathname),isPage=request.mode==='navigate',isMedia=/\.(?:avif|webp|png|jpg|jpeg|svg|gif|mp4|webm|pdf)$/i.test(url.pathname);
 if(isPage||isJson){event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(VERSION).then(cache=>cache.put(request,copy)).catch(()=>{});}return response;}).catch(async()=>{const cached=await caches.match(request);return cached||(isPage?await caches.match('./index.html'):Response.error());}));return;}
 if(isMedia){event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(MEDIA_VERSION).then(async cache=>{await cache.put(request,copy);const keys=await cache.keys();if(keys.length>MEDIA_LIMIT)await Promise.all(keys.slice(0,keys.length-MEDIA_LIMIT).map(key=>cache.delete(key)));}).catch(()=>{});}return response;})));return;}
 event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(VERSION).then(cache=>cache.put(request,copy)).catch(()=>{});}return response;}).catch(()=>caches.match(request)));
});
