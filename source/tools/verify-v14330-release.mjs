/** A v1.43.30 önálló ZIP és felületi regressziós ellenőrzése. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const root=path.resolve(import.meta.dirname,'..');
const source=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const manifest=JSON.parse(source('release-manifest.json'));
assert.equal(manifest.release,'csanadi-website-v1.43.30-desktop-mobile-surface-repair-preview');
assert.equal(manifest.ftpCompatible,true);
const inventoried=Object.keys(manifest.files).sort();
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
assert.deepEqual(actual.sort(),inventoried,'A teljes ZIP leltárral egyező állományai');
for(const rel of inventoried){
 const bytes=fs.readFileSync(path.join(root,rel));
 assert.equal(bytes.length,manifest.files[rel].sizeBytes,rel+' bájtméret');
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),manifest.files[rel].sha256,rel+' SHA-256');
 if(rel.endsWith('.json'))JSON.parse(bytes.toString('utf8'));
}
assert.match(source('service-worker.js'),/RELEASE_ID='1\.43\.30'/);
assert.match(source('index.html'),/verified-surface-fixes-v1-43-30\.css/);
assert.match(source('js/site-viewers-v1-43-3.js'),/cs43-fallback/);
assert.match(source('js/site-viewers-v1-43-3.js'),/CustomEvent\('slid\.bs\.carousel'/);
for(const rel of ['js/next10-2026.js','js/round23-workshop.js','js/round24-heritage.js']){
 assert.match(source(rel),/openDocumentViewer/,rel+' saját PDF-néző');
}
assert.match(source('js/blocks.js'),/cs-content-table/);
assert.match(source('mobile/reboot-design-v1-43-29.css'),/\.staff-search\{/);
assert.match(source('css/verified-surface-fixes-v1-43-30.css'),/\.media26-tile/);
assert.equal(inventoried.filter(file=>file.startsWith('mobile/')).length,5,'Öt újraépített mobilmodul');
console.log(`v1.43.30 önálló kiadás PASS: ${inventoried.length} fájl, teljes SHA-256, belépés, galéria, PDF, táblázat, mobil CSS`);
