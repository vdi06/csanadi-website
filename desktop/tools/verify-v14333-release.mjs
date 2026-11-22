/** V1.43.33 teljes ZIP-leltár és SHA-256 ellenőrzés (restore után is). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const manifest=JSON.parse(read('release-manifest.json'));
assert.equal(manifest.release,'csanadi-website-v1.43.33-m21d-mobile-hardening-preview');
assert.equal(manifest.ftpCompatible,true);
const actual=[];
function visit(rel=''){
 for(const entry of fs.readdirSync(path.join(root,rel),{withFileTypes:true})){
  if(entry.name.startsWith('.'))continue;
  const name=path.posix.join(rel,entry.name);
  if(entry.isDirectory())visit(name);
  else if(entry.isFile()&&name!=='release-manifest.json')actual.push(name);
 }
}
visit();
const inventory=Object.keys(manifest.files).sort();
assert.deepEqual(actual.sort(),inventory,'Teljes kiadási fájllista');
for(const file of inventory){
 const bytes=fs.readFileSync(path.join(root,file));
 assert.equal(bytes.length,manifest.files[file].sizeBytes,file+' bájtméret');
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),manifest.files[file].sha256,file+' SHA-256');
 if(file.endsWith('.json'))JSON.parse(bytes.toString('utf8'));
}
execFileSync(process.execPath,[path.join(root,'tools/verify-m21-gates.mjs')],
 {stdio:'inherit',timeout:120000});
console.log(`v1.43.33 M21/D PASS: ${inventory.length} fájl SHA-256 szerint, négy mobilos kapu`);
