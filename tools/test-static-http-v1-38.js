/* A statikus FTP-kiszolgálás HTTP-fájlelérésének önálló, hálózattól független tesztje. */
'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const checks=[],errors=[];
const structure=JSON.parse(fs.readFileSync(path.join(root,'json/structure.json'),'utf8'));
const inventory=JSON.parse(fs.readFileSync(path.join(root,'json/assets-inventory.json'),'utf8'));
const pages=[];
function gather(nodes){for(const node of nodes||[]){pages.push('json/'+node.path);gather(node.children);}}
gather(structure.nodes);
function scan(folder=''){
 const files=[];
 for(const e of fs.readdirSync(path.join(root,folder),{withFileTypes:true})){
  const rel=path.posix.join(folder,e.name);
  if(e.isDirectory()&&rel!=='assets')files.push(...scan(rel));
  else if(e.isFile()&&/\.(?:html|css|js|json)$/i.test(rel))files.push(rel);
 }
 return files;
}
const all=[...new Set(['index.html','script.js',...pages,...scan(),...(inventory.items||[]).map(item=>item.path)])];
const contentType=file=>file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'application/octet-stream';
const server=http.createServer((req,res)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost/').pathname).replace(/^\/+/, '');}
 catch{res.writeHead(400);res.end();return;}
 if(!pathname||pathname.includes('..')||pathname.includes('\\')){res.writeHead(400);res.end();return;}
 const file=path.resolve(root,pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.stat(file,(error,stat)=>{
  if(error||!stat.isFile()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'content-length':stat.size,'content-type':contentType(file)});
  if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
 });
});
async function work(base){
 let cursor=0;
 await Promise.all(Array.from({length:12},async()=>{
  while(cursor<all.length){
   const file=all[cursor++];
   try{
    const response=await fetch(base+file,{method:'HEAD'});
    if(response.status!==200)throw Error('HTTP '+response.status);
    const expected=fs.statSync(path.join(root,file)).size;
    if(Number(response.headers.get('content-length'))!==expected)throw Error('Hibás méret');
    checks.push(file);
   }catch(error){errors.push({file,error:String(error.message||error)});}
  }
 }));
 for(const file of ['index.html','json/structure.json','json/oldalindex.json','json/config.json','mobile/radial-wheel-v1-38.js','mobile/radial-wheel-v1-38.css']){
  try{
   const response=await fetch(base+file);
   if(response.status!==200)throw Error('HTTP '+response.status);
   const body=await response.text();if(!body.length)throw Error('Üres válasz');
   if(file.endsWith('.json'))JSON.parse(body);
   checks.push('GET '+file);
  }catch(error){errors.push({file,error:String(error.message||error)});}
 }
}
server.listen(0,'127.0.0.1',async()=>{
 try{await work(`http://127.0.0.1:${server.address().port}/`);}
 catch(error){errors.push({file:'HTTP szerver',error:String(error.message||error)});}
 finally{
  server.close();
  const report={version:'1.38.0',testedAt:new Date().toISOString(),mode:'Önálló helyi HTTP statikus fájlkiszolgáló, HEAD+GET',registeredPages:pages.length,assets:inventory.items?.length||0,sourceFiles:all.length,passed:checks.length,failed:errors.length,failures:errors.slice(0,35)};
  fs.writeFileSync(path.join(root,'dokumentacio/static-http-tesztnaplo-v1-38.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
  if(errors.length)process.exitCode=1;
 }
}).on('error',error=>{console.error(error.message);process.exitCode=1;});
