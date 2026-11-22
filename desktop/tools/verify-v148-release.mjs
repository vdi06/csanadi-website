/** 1.51: teljes fájlleltár, SHA-256, JSON, felületi regressziós tesztek. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8'));
assert.equal(manifest.release,'csanadi-website-1.51');
assert.equal(manifest.ftpCompatible,true);
const actual=[];
function visit(relative=''){
 for(const item of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){
  if(item.name.startsWith('.'))continue;
  const file=path.posix.join(relative,item.name);
  if(item.isDirectory())visit(file);
  else if(item.isFile()&&file!=='release-manifest.json')actual.push(file);
 }
}
visit();const expected=Object.keys(manifest.files).sort();
assert.deepEqual(actual.sort(),expected,'A leltárból nem maradhat ki fájl');
for(const name of expected){
 const bytes=fs.readFileSync(path.join(root,name));
 assert.equal(bytes.length,manifest.files[name].sizeBytes,`${name}: méret`);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),manifest.files[name].sha256,`${name}: SHA-256`);
 if(name.endsWith('.json'))JSON.parse(bytes.toString('utf8'));
}
for(const script of [
 'verify-v149-json-shell.mjs','verify-v149-runtime.mjs','verify-v149-editor-mobile.mjs',
 'validate-json-project-v149.mjs','audit-v145-surfaces.mjs',
 'verify-reboot-shell.mjs','verify-reboot-menu.mjs','verify-reboot-hero.mjs',
 'verify-reboot-quality.mjs','verify-m13-viewer-dom.mjs','verify-m15-interactions.mjs'
])execFileSync(process.execPath,[path.join(root,'tools',script)],{stdio:'inherit',timeout:120000});
console.log(`1.51 KIADÁS PASS – ${expected.length} SHA-256-ellenőrzött állomány`);
