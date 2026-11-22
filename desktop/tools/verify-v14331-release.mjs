/** v1.43.31 A+B: önálló ZIP-leltár és mobilos regressziós kiadási kapu. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const root=path.resolve(import.meta.dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const manifest=JSON.parse(read('release-manifest.json'));
assert.equal(manifest.release,'csanadi-website-v1.43.31-mobile-notices-related-cards-preview');
assert.equal(manifest.ftpCompatible,true);
const inventory=Object.keys(manifest.files).sort();
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
assert.deepEqual(actual.sort(),inventory,'Teljes kiadási fájllista');
for(const rel of inventory){
 const bytes=fs.readFileSync(path.join(root,rel));
 assert.equal(bytes.length,manifest.files[rel].sizeBytes,rel+' bájtméret');
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),manifest.files[rel].sha256,rel+' SHA-256');
 if(rel.endsWith('.json'))JSON.parse(bytes.toString('utf8'));
}
const mobileJS=read('mobile/reboot-quality-v1-43-29.js');
const mobileCSS=read('mobile/reboot-design-v1-43-29.css');
assert.match(mobileJS,/function syncNoticeCompact\(\)/);
assert.match(mobileJS,/aria-expanded/);
assert.match(mobileJS,/aria-controls/);
assert.match(mobileJS,/body\.hidden=!open/);
assert.match(mobileJS,/!mq\.matches/);
assert.match(mobileJS,/content\.remove\(\)/);
assert.match(mobileCSS,/\.cs-mb-notice-body\[hidden\]\{display:none!important\}/);
assert.match(mobileCSS,/\.cs-mb-notice-toggle:focus-visible/);
assert.match(mobileCSS,/@media screen and \(max-width:480px\)/);
assert.match(mobileCSS,/\.ext26-relation-grid/);
assert.match(mobileCSS,/grid-template-columns:minmax\(0,1fr\)!important/);
assert.match(read('index.html'),/reboot-design-v1-43-29\.css\?v=1\.43\.31" media="screen and \(max-width: 768px\)"/);
assert.match(read('script.js'),/reboot-quality-v1-43-29\.js\?v=1\.43\.31/);
assert.match(read('service-worker.js'),/RELEASE_ID='1\.43\.31'/);
assert.equal(JSON.parse(read('json/config.json')).performance.cacheVersion,'csanadi-r-v1.43.31');
assert.equal(inventory.filter(file=>file.startsWith('mobile/')).length,5);
console.log(`v1.43.31 A+B PASS: ${inventory.length} állomány, SHA-256, mobilos nyitás/bezárás, 480px kártyarács, 768px-határ, verzió/cache`);
