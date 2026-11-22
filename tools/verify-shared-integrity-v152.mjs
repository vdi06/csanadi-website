/** Az egyedi médiák/dokumentumok tényleges bájtjai a JSON SHA-256 adataival egyezzenek. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const registry=JSON.parse(fs.readFileSync(path.join(root,'shared/json/media-library.json'),'utf8'));
const documents=JSON.parse(fs.readFileSync(path.join(root,'shared/json/data/documents.json'),'utf8'));
const verified=new Map();
const digest=data=>crypto.createHash('sha256').update(data).digest('hex');
const verify=entry=>{
 const relative=entry.path||entry.filePath;
 if(!relative)return;
 assert.match(relative,/^assets\/[a-z0-9/_\-.]+$/i);
 if(verified.has(relative)){
  assert.equal(verified.get(relative),entry.sha256,relative+' ismételt hash');
  return;
 }
 const file=path.join(root,'shared',relative),data=fs.readFileSync(file);
 assert.equal(data.length,entry.sizeBytes??entry.fileSizeBytes,relative+' fájlméret');
 assert.equal(digest(data),entry.sha256,relative+' SHA-256');
 if(relative.endsWith('.webp'))assert.equal(data.toString('ascii',8,12),'WEBP',relative+' nem WebP');
 if(relative.endsWith('.pdf'))assert.equal(data.toString('ascii',0,4),'%PDF',relative+' nem PDF');
 verified.set(relative,entry.sha256);
};
for(const item of registry.items){verify(item.original);for(const variant of item.variants||[])verify(variant);}
for(const item of documents.documents)verify(item);
for(const platform of ['mobile','desktop']){
 assert.equal(fs.existsSync(path.join(root,platform,'assets')),false);
 assert.deepEqual(fs.readdirSync(path.join(root,platform,'json')),['site-shell.json']);
}
let json=0;
const scan=dir=>{
 for(const entry of fs.readdirSync(path.join(root,'shared/json',dir),{withFileTypes:true})){
  const relative=path.posix.join(dir,entry.name);
  if(entry.isDirectory())scan(relative);
  else if(entry.name.endsWith('.json')){
   const bytes=fs.readFileSync(path.join(root,'shared/json',relative));JSON.parse(bytes.toString('utf8'));
   assert.equal(digest(bytes),digest(fs.readFileSync(path.join(root,'source/json',relative))),relative+' forráseltérés');json++;
  }
 }
};
scan('');
console.log(`1.53 közös adattár PASS: ${verified.size} egyedi állomány SHA-256/méret/formátum és ${json} közös JSON egyezik; nincs platformduplikáció.`);
