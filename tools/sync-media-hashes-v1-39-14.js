/* A média-/dokumentummetaadatok SHA-256 és méret mezőinek reprodukálható
   szinkronizálása a csomagban ténylegesen szereplő fájlokkal.
   Alapesetben csak vizsgál; --write esetén pontosan a két JSON-nyilvántartást
   írja újra. Jogállás, cím és tartalom nem változik. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const write=process.argv.includes('--write');
const targets=['json/mediatar.json','json/adatok/dokumentumok.json'];
let inspected=0,changed=0;
const missing=[];
function sync(file){
 if(!file||typeof file!=='object'||!file.path&&!file.filePath)return;
 const relative=String(file.path||file.filePath);
 if(!/^assets\/[a-zA-Z0-9._/-]+$/.test(relative)||relative.split('/').includes('..')){missing.push(relative);return;}
 const absolute=path.resolve(root,relative);
 if(!absolute.startsWith(root+path.sep)||!fs.existsSync(absolute)){missing.push(relative);return;}
 const bytes=fs.readFileSync(absolute),hash=crypto.createHash('sha256').update(bytes).digest('hex');
 inspected++;
 if(file.sha256!==hash){file.sha256=hash;changed++;}
 if(file.sizeBytes!==undefined&&file.sizeBytes!==bytes.length){file.sizeBytes=bytes.length;changed++;}
}
for(const name of targets){
 const filename=path.join(root,name),source=fs.readFileSync(filename,'utf8'),object=JSON.parse(source);
 if(name==='json/mediatar.json')for(const item of object.items||[]){sync(item.original);for(const variant of item.variants||[])sync(variant);}
 else for(const document of object.documents||[])sync(document);
 if(write&&changed)fs.writeFileSync(filename,JSON.stringify(object,null,2)+'\n');
}
console.log(JSON.stringify({write,inspected,fieldCorrections:changed,missing}));
if(missing.length)process.exitCode=1;
