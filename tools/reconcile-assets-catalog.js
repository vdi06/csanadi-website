/* Csanádi – az FTP-re kiadható assets/ állománykatalógus visszaellenőrzése.
   Ellenőrzés: node tools/reconcile-assets-catalog.js
   Frissítés:  node tools/reconcile-assets-catalog.js --write
   A hiányzó fájlok bekerülnek a katalógusba, de automatikusan soha nem lesznek közzétéve. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const inventoryPath=path.join(root,'json/assets-inventory.json');
const indexPath=path.join(root,'json/assets-project-index.json');
const inventory=JSON.parse(fs.readFileSync(inventoryPath,'utf8'));
const index=JSON.parse(fs.readFileSync(indexPath,'utf8'));
const posix=p=>p.split(path.sep).join('/');
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())walk(full);
  else files.push(posix(path.relative(root,full)));
}}
walk(path.join(root,'assets'));
files.sort();
const existing=new Map(inventory.items.map(item=>[item.path,item]));
const missing=files.filter(file=>!existing.has(file));
const obsolete=inventory.items.filter(item=>!fs.existsSync(path.join(root,item.path))).map(item=>item.path);
if(obsolete.length){console.error('Hiányzó, de még regisztrált fájlok:',obsolete);process.exitCode=1;}
const mime={webp:'image/webp',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',svg:'image/svg+xml',avif:'image/avif',gif:'image/gif',mp4:'video/mp4',webm:'video/webm',pdf:'application/pdf',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',odt:'application/vnd.oasis.opendocument.text',txt:'text/plain',csv:'text/csv',mp3:'audio/mpeg',wav:'audio/wav'};
function typeFor(p){const ext=path.extname(p).slice(1).toLowerCase();return ext==='svg'?'graphic':['mp4','webm'].includes(ext)?'video':p.startsWith('assets/documents/')?'document':['webp','jpg','jpeg','png','avif','gif'].includes(ext)?'image':'file';}
for(const file of missing){
  const data=fs.readFileSync(path.join(root,file));const ext=path.extname(file).slice(1).toLowerCase();
  inventory.items.push({path:file,type:typeFor(file),mimeType:mime[ext]||'application/octet-stream',sizeBytes:data.byteLength,title:path.basename(file,path.extname(file)).replace(/[-_]/g,' '),alt:'',description:'',category:file.startsWith('assets/qr/')?'qr':'',tags:[],mediaId:null,sha256:crypto.createHash('sha256').update(data).digest('hex'),published:false,rightsConfirmed:false});
}
inventory.items.sort((a,b)=>a.path.localeCompare(b.path,'hu'));
const sources=[...new Set([...(index.jsonFiles||[]),...(index.codeFiles||[])])].filter(p=>fs.existsSync(path.join(root,p)));
const sourceText=new Map(sources.map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')]));
const references={};
for(const item of inventory.items){
  const previous=index.assetReferences?.[item.path]||[];
  const detected=sources.filter(p=>sourceText.get(p).includes(item.path));
  references[item.path]=[...new Set([...previous,...detected])].filter(p=>fs.existsSync(path.join(root,p))).sort();
}
const updated={...index,assetReferences:references};
const report={physicalAssets:files.length,indexedAssets:inventory.items.length,previouslyMissing:missing.length,orphanedRecords:obsolete.length,unindexed:files.filter(file=>!inventory.items.some(item=>item.path===file)).length,qrAssets:inventory.items.filter(item=>item.path.startsWith('assets/qr/')).length};
if(process.argv.includes('--write')&&!obsolete.length){
  inventory.updatedAt='2026-11-16';
  fs.writeFileSync(inventoryPath,JSON.stringify(inventory,null,2)+'\n');
  fs.writeFileSync(indexPath,JSON.stringify(updated,null,2)+'\n');
  report.written=true;
}else{
  report.written=false;
  if(missing.length)process.exitCode=1;
}
console.log(JSON.stringify(report));
