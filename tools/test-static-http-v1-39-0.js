'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
let base;
const root=path.resolve(__dirname,'..');
const pages=Object.keys(JSON.parse(fs.readFileSync(path.join(root,'json/oldalindex.json'),'utf8')).pages);
const assets=JSON.parse(fs.readFileSync(path.join(root,'json/assets-inventory.json'),'utf8')).items;
const files=[];
const walk=(folder='')=>{for(const item of fs.readdirSync(path.join(root,folder),{withFileTypes:true})){
 const rel=path.posix.join(folder,item.name);
 if(item.isDirectory()){if(rel!=='assets')walk(rel);}
 else if(/\.(?:html|css|js|json)$/i.test(rel))files.push(rel);
}};
walk();
const errors=[];
let count=0;
const server=http.createServer((req,res)=>{
 let relative;
 try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html';}catch{res.writeHead(400).end();return;}
 const absolute=path.resolve(root,relative);
 if(!absolute.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.stat(absolute,(error,stat)=>{
  if(error||!stat.isFile()){res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Length':stat.size,'Content-Type':relative.endsWith('.json')?'application/json':relative.endsWith('.js')?'text/javascript':relative.endsWith('.css')?'text/css':'application/octet-stream'});
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(absolute).pipe(res);
 });
});
const check=async(item,method='HEAD',expectedSize)=>{
 count++;
 try{
  const response=await fetch(new URL(encodeURI(item),base),{method,cache:'no-store'});
  assert.equal(response.status,200,item+' HTTP '+response.status);
  if(expectedSize!==undefined)assert.equal(Number(response.headers.get('content-length')),expectedSize,item+' méret');
  if(method==='GET')await response.arrayBuffer();
 }catch(error){errors.push({file:item,error:String(error.message||error).slice(0,160)});}
};
const concurrent=async(items,limit,fn)=>{
 let next=0;
 await Promise.all(Array.from({length:limit},async()=>{while(next<items.length)await fn(items[next++]);}));
};
(async()=>{
 if(process.argv[2])base=new URL(process.argv[2]);
 else{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});base=new URL('http://127.0.0.1:'+server.address().port+'/');}
 await check('index.html','GET');
 await check('script.js','GET');
 await check('css/liquid-glass-v1-39-0.css','GET');
 await concurrent(pages,8,p=>check('json/'+p,'GET'));
 await concurrent(assets,12,a=>check(a.path,'HEAD',a.sizeBytes));
 await concurrent(files,12,p=>check(p,'HEAD'));
 console.log(JSON.stringify({version:'1.39.0',base:base.href,checks:count,passed:count-errors.length,failed:errors.slice(0,30),pages:pages.length,assets:assets.length,staticFiles:files.length},null,2));
 if(errors.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
