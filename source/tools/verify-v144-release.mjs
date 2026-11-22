/** Csanádi 1.44 – a teljes ZIP állományonkénti SHA-256 ellenőrzése. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8'));
assert.equal(manifest.release,'csanadi-website-1.44');
assert.equal(manifest.ftpCompatible,true);
const files=[];
function visit(relative=''){
 for(const item of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){
  if(item.name.startsWith('.'))continue;
  const name=path.posix.join(relative,item.name);
  if(item.isDirectory())visit(name);
  else if(item.isFile()&&name!=='release-manifest.json')files.push(name);
 }
}
visit();
const listed=Object.keys(manifest.files).sort();
assert.deepEqual(files.sort(),listed,'A teljes helyi csomag megfelel a leltárnak');
for(const name of listed){
 const data=fs.readFileSync(path.join(root,name));
 assert.equal(data.length,manifest.files[name].sizeBytes,name+' méret');
 assert.equal(crypto.createHash('sha256').update(data).digest('hex'),manifest.files[name].sha256,name+' SHA-256');
 if(name.endsWith('.json'))JSON.parse(data.toString('utf8'));
}
execFileSync(process.execPath,[path.join(root,'tools/verify-m22-gates.mjs')],
 {stdio:'inherit',timeout:120000});
console.log(`1.44 PASS: ${listed.length} fájl leltár szerint, négy mobilos kapu`);
