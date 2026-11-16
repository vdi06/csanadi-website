'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const base=new URL(process.argv[2]||'http://127.0.0.1:8765/');
const structure=JSON.parse(fs.readFileSync(path.join(root,'json/structure.json')));
const assets=JSON.parse(fs.readFileSync(path.join(root,'json/assets-inventory.json'))).items;
const pages=[];
function collect(nodes){for(const node of nodes){pages.push(node.path);collect(node.children||[]);}}
collect(structure.nodes);
const staticSources=[];
function scan(folder=''){
 for(const entry of fs.readdirSync(path.join(root,folder),{withFileTypes:true})){
  const rel=path.posix.join(folder,entry.name);
  if(entry.isDirectory()){if(rel!=='assets')scan(rel);}
  else if(/\.(?:html|css|js|json)$/i.test(rel))staticSources.push(rel);
 }
}
scan();
async function request(name,method='GET'){
 const response=await fetch(new URL(encodeURI(name),base),{method,cache:'no-store'});
 assert.equal(response.status,200,method+' '+name+' HTTP '+response.status);
 return response;
}
async function eachConcurrent(items,limit,fn){let next=0;const results=[];await Promise.all(Array.from({length:limit},async()=>{while(next<items.length){const index=next++;try{await fn(items[index]);}catch(error){results.push(error.message);}}}));return results;}
async function main(){
 const entry=await (await request('index.html')).text();
 assert.ok(entry.includes('csanadi-r-v1.20.0'));
 assert.ok(entry.includes('cdn.jsdelivr.net/npm/bootstrap@5.3.9/'));
 const sw=await (await request('service-worker.js')).text();
 assert.ok(sw.includes('csanadi-user-offline-pages'));
 const errors=[];
 errors.push(...await eachConcurrent(pages,12,async file=>{
  const data=await (await request('json/'+file)).json();
  assert.equal(data.lifecycle.status,'published',file+' lifecycle');
  assert.ok(data.schemaExtensions.route.startsWith('#/'),file+' route');
 }));
 errors.push(...await eachConcurrent(assets,12,async item=>{
  const head=await request(item.path,'HEAD');
  const size=Number(head.headers.get('content-length'));
  assert.equal(size,item.sizeBytes,item.path+' content-length');
 }));
 errors.push(...await eachConcurrent(staticSources,12,async file=>{await request(file,'HEAD');}));
 const samples=['json/config.json','json/oldalindex.json','json/adatok/kepgaleria.json','json/adatok/galeriavideok.json','megkozelites-es-tanulas.html','assets/media/logo/csanadi-cimer-512.webp'];
 errors.push(...await eachConcurrent(samples,6,async file=>{await request(file);}));
 const count=2+pages.length+assets.length+staticSources.length+samples.length;
 console.log(JSON.stringify({version:'1.20.0',server:base.href,pages:pages.length,assets:assets.length,otherStaticFiles:staticSources.length,samples:samples.length,checks:count,passed:count-errors.length,failures:errors.slice(0,20)}));
 if(errors.length)process.exitCode=1;
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
