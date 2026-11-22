/** 1.45: teljes fájlleltár, öt fejlesztési kapu és statikus felületvizsgálat. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8'));
assert.equal(manifest.release,'csanadi-website-1.45');
assert.equal(manifest.ftpCompatible,true);
const listed=Object.keys(manifest.files).sort();
const actual=[];
function walk(relative=''){
 for(const item of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){
  if(item.name.startsWith('.'))continue;
  const name=path.posix.join(relative,item.name);
  if(item.isDirectory())walk(name);
  else if(item.isFile()&&name!=='release-manifest.json')actual.push(name);
 }
}
walk();
assert.deepEqual(actual.sort(),listed,'A leltár egyezik az összes fájllal');
for(const name of listed){
 const bytes=fs.readFileSync(path.join(root,name));
 assert.equal(bytes.length,manifest.files[name].sizeBytes,name+' fájlméret');
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  manifest.files[name].sha256,name+' SHA-256');
 if(name.endsWith('.json'))JSON.parse(bytes.toString('utf8'));
}
for(const script of ['verify-v145-version.mjs','verify-v145-gates.mjs','audit-v145-surfaces.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',script)],{stdio:'inherit',timeout:120000});
}
console.log(`1.45 PASS – ${listed.length} SHA-256-ellenőrzött fájl, minden új célzott kapu`);
