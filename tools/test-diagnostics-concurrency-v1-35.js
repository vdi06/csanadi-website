'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../js/performance-diagnostics-2026.js'),'utf8');
const implementation=src.slice(src.indexOf('async function measureBundle()'),src.indexOf('function el(',src.indexOf('async function measureBundle()')));
const files=Object.fromEntries(['index.html','script.js','json/config.json','json/structure.json'].map(name=>[name,{sizeBytes:100,sha256:'a'.repeat(64)}]));
const manifest=release=>({schemaVersion:'1.0.0',release:'csanadi-website-v'+release,bootstrap:'CDN bootstrap@5.3.9',files});
const config={performance:{cacheVersion:'csanadi-v1.35.0'}};
const response=value=>({ok:true,json:async()=>value});
async function race(name,lateError){
 let releaseFirst,refreshed=0,received=0;
 const first=new Promise(resolve=>{releaseFirst=resolve;});
 const fetch=url=>{
  if(url==='release-manifest.json')return ++received===1?first:Promise.resolve(response(manifest('1.35.0')));
  if(url==='json/config.json')return Promise.resolve(response(config));
  throw Error('Váratlan hivatkozás: '+url);
 };
 const ctx=vm.createContext({fetch,Number,Object,Error,String,console});
 vm.runInContext('let bundleRun=0,bundleStats=null;function refresh(){globalThis.refreshed++;}'+implementation,ctx);
 ctx.refreshed=0;
 const firstRun=vm.runInContext('measureBundle()',ctx);
 const secondRun=vm.runInContext('measureBundle()',ctx);
 await secondRun;
 assert.equal(vm.runInContext('bundleStats.release',ctx),'csanadi-website-v1.35.0');
 if(lateError)releaseFirst({ok:false,status:503});else releaseFirst(response(manifest('1.29.0')));
 await firstRun;
 assert.equal(vm.runInContext('bundleStats.release',ctx),'csanadi-website-v1.35.0');
 assert.equal(ctx.refreshed,1);
 console.log('OK '+name+': a korábbi válasz nem írta felül az újabb állapotot.');
}
(async()=>{await race('Késői siker',false);await race('Késői hiba',true);console.log(JSON.stringify({release:'1.35.0',passed:2,failed:0}));})().catch(error=>{console.error(error);process.exitCode=1;});
