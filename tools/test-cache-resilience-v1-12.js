const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const content=fs.readFileSync(path.join(root,'js/content.js'),'utf8').replaceAll('import.meta.url',"'https://school.example/js/content.js'").replaceAll('export ','');
const names=[];
function check(title,fn){names.push(title);return fn();}
function harness({failShellPut=false,failReaderPut=false,failNetwork=false}={}){
 const cacheMap=new Map(),events=new Map(),calls=[];
 const key=request=>String(typeof request==='string'?request:request?.url||request);
 function cache(name){
  if(!cacheMap.has(name))cacheMap.set(name,new Map());
  const records=cacheMap.get(name);
  return {
   async match(request){return records.get(key(request))||null;},
   async put(request,response){if((name==='csanadi-r-v1.18.0'&&failShellPut)||(name==='csanadi-user-offline-pages'&&failReaderPut))throw Error('QuotaExceededError');records.set(key(request),response);},
   async keys(){return [...records.keys()].map(url=>({url}));},
   async delete(request){return records.delete(key(request));}
  };
 }
 const caches={async open(name){return cache(name);},async keys(){return [...cacheMap.keys()];},async delete(name){return cacheMap.delete(name);},async match(request){for(const name of cacheMap.keys()){const item=cacheMap.get(name).get(key(request));if(item)return item;}return null;}};
 const cfg={performance:{cacheVersion:'csanadi-r-v1.18.0',offlinePrecacheFileMaxBytes:1000,offlinePrecacheMaxEntries:1,mediaCacheEntries:20,maxCacheMegabytes:10},refresh:{structureSeconds:60,maxConcurrentRequests:2}};
 const configResponse={ok:true,json:async()=>cfg,clone(){return this;}};
 const fetch=async request=>{calls.push(key(request));if(key(request).includes('json/config.json'))return configResponse;if(key(request).includes('release-manifest.json'))return {ok:false,status:404};if(failNetwork)throw Error('offline');return {ok:true,status:200,source:'online',clone(){return this;}};};
 const self={registration:{scope:'https://school.example/website/'},addEventListener(name,fn){events.set(name,fn);},skipWaiting:async()=>{},clients:{claim:async()=>{}}};
 class Request{constructor(url){this.url=String(url);this.method='GET';this.mode='cors';}}
 const ctx={URL,Date,Promise,Request,Response:{error:()=>({source:'error'})},caches,fetch,self,console:{warn(){}},setTimeout};
 vm.runInNewContext(code,ctx,{filename:'service-worker.js'});
 return {ctx,caches,cacheMap,events,calls,cache};
}
async function main(){
 const stable=harness({failShellPut:true});
 await check('Sikertelen tárgyorsítótár-írás mellett is megmarad az online oldalválasz',async()=>{
  const res=await vm.runInNewContext('handle(new Request("https://school.example/website/index.html"))',stable.ctx);
  assert.equal(res.source,'online');
 });
 await check('Az offline mentés neve nem módosul minden kiadásnál',async()=>{
  const actual=vm.runInNewContext('names({performance:{cacheVersion:"csanadi-r-v1.18.0"}}).reader',stable.ctx);
  assert.equal(actual,'csanadi-user-offline-pages');
  assert.match(fs.readFileSync(path.join(root,'js/offline-reader-20.js'),'utf8'),/return 'csanadi-user-offline-pages'/);
 });
 const upgrade=harness();
 const old='csanadi-r-v1.11.0-offline',resource='https://school.example/website/json/oldalak/kezdolap.json';
 await (await upgrade.caches.open(old)).put({url:resource},{source:'user-saved'});
 let pending;
 upgrade.events.get('activate')({waitUntil(value){pending=value;}});
 await pending;
 await check('Korábbi kiadásból felhasználói offline oldal átkerül az állandó tárba',async()=>{
  assert.equal((await (await upgrade.caches.open('csanadi-user-offline-pages')).match({url:resource})).source,'user-saved');
  assert.equal(upgrade.cacheMap.has(old),false);
 });
 const failure=harness({failReaderPut:true});
 await (await failure.caches.open(old)).put({url:resource},{source:'user-saved'});
 failure.events.get('activate')({waitUntil(value){pending=value;}});
 await pending;
 await check('Kvótahiba esetén a korábbi offline mentést nem törli',async()=>assert.equal(failure.cacheMap.has(old),true));
 const disconnected=harness({failNetwork:true});
 await (await disconnected.caches.open('csanadi-user-offline-pages')).put({url:resource},{source:'offline-copy'});
 await check('Hálózatvesztéskor a korábban mentett oldal az offline tárból betölthető',async()=>{
  const response=await vm.runInNewContext('handle(new Request("'+resource+'"))',disconnected.ctx);
  assert.equal(response.source,'offline-copy');
 });
 const deferred=[];let count=0;
 const ctx=vm.createContext({URL,Date,console,fetch:()=>{count++;return new Promise(resolve=>deferred.push(resolve));},location:{hash:'#/'}});
 vm.runInContext(content,ctx,{filename:'content.js'});
 const first=vm.runInContext('loadJSON("structure.json",{fresh:true})',ctx);
 const parallel=vm.runInContext('loadJSON("structure.json",{fresh:true})',ctx);
 await check('Két egyidejű friss kérés nem indít két hálózati letöltést',async()=>assert.equal(count,1));
 deferred.shift()({ok:true,json:async()=>({nodes:[]})});
 await Promise.all([first,parallel]);
 const cached=await vm.runInContext('loadJSON("structure.json")',ctx);
 await check('Rövid időn belül a JSON a gyorsítótárból olvasható',async()=>{assert.equal(count,1);assert.equal(cached.nodes.length,0);});
 const refetch=vm.runInContext('loadJSON("structure.json",{fresh:true})',ctx);
 await check('A kézzel kért újabb ellenőrzés elindítja a valóban friss hálózati kérést',async()=>assert.equal(count,2));
 deferred.shift()({ok:true,json:async()=>({nodes:[{path:'x'}]})});
 await refetch;
 console.log(JSON.stringify({stage:'v1.18.0',passed:names.length,total:names.length,checks:names}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
