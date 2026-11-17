'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8'));
const excluded=new Set(['release-manifest.json','tools/migrate-old-links.js','tools/remove-obsolete-qr.js']);
const files=[];
function walk(folder){for(const item of fs.readdirSync(path.join(root,folder),{withFileTypes:true})){
 const rel=path.posix.join(folder,item.name);
 if(item.isDirectory()){if(item.name!=='.git')walk(rel);}
 else if(!excluded.has(rel))files.push(rel);
}}
walk('');
const failures=[];
if(manifest.release!=='csanadi-website-v1.39.11'||!manifest.ftpCompatible)failures.push('Kiadásjel vagy FTP-státusz hibás');
if(manifest.date!=='2026-11-17')failures.push('A kiadási dátum eltér');
for(const relative of files){
 const meta=manifest.files?.[relative];
 if(!meta){failures.push('Hiányzó manifesttétel: '+relative);continue;}
 const bytes=fs.readFileSync(path.join(root,relative));
 if(bytes.length!==meta.sizeBytes)failures.push('Méreteltérés: '+relative);
 const sha=crypto.createHash('sha256').update(bytes).digest('hex');
 if(meta.sha256!==sha)failures.push('SHA-256 eltérés: '+relative);
}
for(const extra of Object.keys(manifest.files||{}))if(!files.includes(extra))failures.push('Hiányzó vagy kizárt fájl szerepel: '+extra);
const config=JSON.parse(fs.readFileSync(path.join(root,'json/config.json'),'utf8'));
if(config.performance?.cacheVersion!=='csanadi-r-v1.39.11')failures.push('Eltérő gyorsítótár-verzió');
console.log(JSON.stringify({release:manifest.release,checked:files.length,manifestFiles:Object.keys(manifest.files||{}).length,passed:files.length-failures.length,failed:failures.slice(0,20)},null,2));
if(failures.length)process.exitCode=1;
