/* Csanádi: static FTP-compatible, version-scoped offline shell.
   Updated workers activate on explicit user refresh; the first install activates normally. */
const RELEASE_ID='1.42.20';
const SCOPE=new URL('./',self.registration.scope);
const SHELL=`csanadi-shell-${RELEASE_ID}`;
const MEDIA=`csanadi-media-${RELEASE_ID}`;
const READER='csanadi-user-offline-pages';
const CORE=[ 
 './','./index.html','./offline.html','./script.js','./service-worker.js',
 './json/config.json','./json/structure.json','./json/page-index.json','./json/media-library.json',
 './json/pages/home.json','./css/responsive-system-v1-42-18.css','./css/editor-workbench-v1-42-18.css','./css/maintenance-studio.css','./js/editor-workbench-v1-42-18.js','./tools/maintenance-studio.js','./json/data/spa-features-42.json',
 './assets/media/logo/csanadi-crest-512.webp'
];
const local=url=>url.origin===SCOPE.origin&&url.pathname.startsWith(SCOPE.pathname);
const coreURL=path=>new URL(path,SCOPE);
let settingsPromise=null;
async function settings(){
 if(!settingsPromise)settingsPromise=fetch(new Request(coreURL('json/config.json'),{cache:'no-store'}))
  .then(r=>r.ok?r.json():Promise.reject(Error('HTTP '+r.status)))
  .then(c=>c.performance||{}).catch(()=>({}));
 return settingsPromise;
}

const anyCached=async(request)=>{
 const fromShell=await caches.open(SHELL);const a=await fromShell.match(request,{ignoreSearch:true});if(a)return a;
 const fromMedia=await caches.open(MEDIA);return fromMedia.match(request,{ignoreSearch:true});
};
const isMedia=url=>/\.(?:webp|avif|png|jpg|jpeg|svg|gif)$/i.test(url.pathname);
const isDocument=url=>/\.(?:pdf|docx|txt)$/i.test(url.pathname);
function networkRequest(request){return new Request(request,{cache:'no-store'});}
async function fetchFresh(request){return fetch(networkRequest(request));}
async function putIfSuitable(cacheName,request,response,{maxBytes=750000}={}){
 if(!response?.ok||response.type==='opaque')return;
 const length=Number(response.headers.get('content-length'));
 if(length>maxBytes)return;
 // Avoid retaining huge responses if the server does not supply Content-Length.
 const clone=response.clone();const data=await clone.blob();if(data.size>maxBytes)return;
 const headers=new Headers(response.headers);
 headers.delete('content-length');headers.delete('content-encoding');
 const stored=new Response(data,{status:response.status,statusText:response.statusText,headers});
 const cache=await caches.open(cacheName);await cache.put(request,stored);
}
let mediaTrimAt=0,mediaTrimPending=false;
async function trimMedia(maxCount=55,maxBytes=42*1048576){
 if(mediaTrimPending||Date.now()-mediaTrimAt<30000)return;
 mediaTrimPending=true;mediaTrimAt=Date.now();
 try{
 const cache=await caches.open(MEDIA),keys=await cache.keys();
 const sizes=await Promise.all(keys.map(async key=>{try{return (await (await cache.match(key)).blob()).size;}catch{return 0;}}));
 let total=sizes.reduce((a,b)=>a+b,0);
 for(let i=0;i<keys.length&&(keys.length-i>maxCount||total>maxBytes);i++){
  await cache.delete(keys[i]);total-=sizes[i];
 }
 }finally{mediaTrimPending=false;}
}
async function precache(){
 const manifestURL=coreURL('release-manifest.json');let selected=[...CORE];
 const policy=await settings(),maxEntries=policy.offlinePrecacheMaxEntries||130,maxFile=policy.offlinePrecacheFileMaxBytes||650000;
 try{
  const response=await fetchFresh(new Request(manifestURL));
  if(response.ok){
   const manifest=await response.json(),files=manifest.files||{};
   const appAssets=Object.entries(files).filter(([path,meta])=>
    ((path.startsWith('js/')&&path.endsWith('.js'))||
     (path.startsWith('css/')&&path.endsWith('.css')&&/^(?:site-bundle|site-consistency|home-v1|entrance-sequence|header-v1|desktop-hero-fold)/.test(path.slice(4)))||
     (path.startsWith('mobile/')&&path.endsWith('.css'))||
     (path.startsWith('desktop/')&&path.endsWith('.js'))||
     path==='json/pages/home.json')&&meta.sizeBytes<=maxFile).slice(0,maxEntries);
   selected=[...new Set([...CORE,...appAssets.map(([path])=>'./'+path)])];
  }
 }catch(error){console.warn('Precache manifest not available',error);}
 const queue=[...selected];const cache=await caches.open(SHELL);
 await Promise.all(Array.from({length:4},async()=>{
  while(queue.length){
   const path=queue.shift(),request=new Request(coreURL(path),{cache:'reload'});
   try{const response=await fetch(request);if(response.ok)await putIfSuitable(SHELL,request,response,{maxBytes:policy.swShellMaxItemBytes||750000});}
   catch(error){console.warn('Offline precache skipped:',path,error);}
  }
 }));
}
async function migrateReader(keys){
 const oldNames=keys.filter(k=>/^csanadi-r-v\d+\.\d+\.\d+-offline$/.test(k));
 const destination=await caches.open(READER);
 for(const name of oldNames){
  const old=await caches.open(name);let complete=true;
  for(const request of await old.keys()){
   try{const response=await old.match(request);if(response&&!await destination.match(request))await destination.put(request,response);}
   catch(error){complete=false;console.warn('Offline saved page could not migrate',error);}
  }
  if(complete)await caches.delete(name);
 }
}
self.addEventListener('install',event=>{
 event.waitUntil(precache().catch(err=>console.warn('Partial offline shell',err)));
 // Do not skipWaiting here: replacing a controlling worker in an open SPA
 // can mix old JavaScript with freshly cached JSON and CSS.
});
self.addEventListener('message',event=>{
 if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();await migrateReader(keys);
  for(const name of await caches.keys()){
   if(name!==SHELL&&name!==MEDIA&&name!==READER&&/^(?:csanadi-r|csanadi-shell-|csanadi-media-)/.test(name))await caches.delete(name);
  }
  await self.clients.claim();
 })());
});
async function handle(event){
 const policy=await settings();
 const request=event.request,url=new URL(request.url);
 const page=request.mode==='navigate'||/\.(?:html)$/i.test(url.pathname);
 const image=isMedia(url),document=isDocument(url);
 if(image){
  const cached=await (await caches.open(MEDIA)).match(request,{ignoreSearch:true});
  if(cached){
   // Fast image response with an online refresh for changes inside this release.
   event.waitUntil(fetchFresh(request).then(async response=>{
    await putIfSuitable(MEDIA,request,response,{maxBytes:policy.swMediaMaxItemBytes||5*1048576});
    await trimMedia();
   }).catch(()=>{}));
   return cached;
  }
 }
 let response;
 try{response=await fetchFresh(request);}catch(error){
  const cached=await anyCached(request);if(cached)return cached;
  if(page){
   const shell=await caches.open(SHELL);
   return await shell.match(coreURL('index.html'),{ignoreSearch:true})||await shell.match(coreURL('offline.html'),{ignoreSearch:true})||Response.error();
  }
  if(/\.json$/i.test(url.pathname))return new Response(JSON.stringify({offline:true,temporary:true}),{status:503,headers:{'Content-Type':'application/json; charset=utf-8'}});
  return Response.error();
 }
 if(!response.ok)return response;
 const target=image?MEDIA:SHELL;
 const maxBytes=image?(policy.swMediaMaxItemBytes||5*1048576):document?0:(policy.swShellMaxItemBytes||750000);
 if(maxBytes>0){
  // Never hold the visible page until the optional cache write completes.
  event.waitUntil(putIfSuitable(target,request,response.clone(),{maxBytes}).then(()=>image?trimMedia():undefined).catch(()=>{}));
 }
 return response;
}
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(!local(url))return;
 event.respondWith(handle(event));
});
