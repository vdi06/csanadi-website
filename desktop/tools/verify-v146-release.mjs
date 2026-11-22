/** 1.46: teljes ZIP-állomány és az új JSON-generálás ellenőrzése. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8'));
assert.equal(manifest.release,'csanadi-website-1.46');
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
assert.deepEqual(actual.sort(),listed,'A teljes ZIP-állomány szerepel a leltárban');
for(const name of listed){
 const contents=fs.readFileSync(path.join(root,name));
 assert.equal(contents.length,manifest.files[name].sizeBytes,name+' eltérő fájlméret');
 assert.equal(crypto.createHash('sha256').update(contents).digest('hex'),
  manifest.files[name].sha256,name+' SHA-256 eltérés');
 if(name.endsWith('.json'))JSON.parse(contents.toString('utf8'));
}
for(const script of ['verify-v146-json-shell.mjs','verify-v146-runtime.mjs',
 'audit-v145-surfaces.mjs','verify-reboot-shell.mjs','verify-reboot-menu.mjs',
 'verify-reboot-hero.mjs','verify-reboot-quality.mjs','verify-m13-viewer-dom.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',script)],{stdio:'inherit',timeout:120000});
}
console.log(`1.46 KIADÁS PASS – ${listed.length} külön SHA-256 ellenőrzött fájl`);
