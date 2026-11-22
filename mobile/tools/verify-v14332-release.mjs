/** v1.43.32 M20/D: kiadott ZIP-ből visszaállítva is önállóan futtatható leltárellenőrzés. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const manifest=JSON.parse(read('release-manifest.json'));
assert.equal(manifest.release,'csanadi-website-v1.43.32-m20d-mobile-stability-preview');
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
assert.deepEqual(actual.sort(),inventory,'A teljes kiadási fájllista egyezzen a leltárral');
for(const rel of inventory){
 const bytes=fs.readFileSync(path.join(root,rel));
 assert.equal(bytes.length,manifest.files[rel].sizeBytes,`${rel} bájtméret`);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),manifest.files[rel].sha256,`${rel} SHA-256`);
 if(rel.endsWith('.json'))JSON.parse(bytes.toString('utf8'));
}
execFileSync(process.execPath,[path.join(root,'tools/verify-m20-gates.mjs')],{stdio:'inherit',timeout:120000});
console.log(`v1.43.32 M20/D PASS: ${inventory.length} állomány, teljes SHA-256 leltár, négy fejlesztési kapu`);
