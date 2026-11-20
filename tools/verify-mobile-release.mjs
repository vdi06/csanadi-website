/** v1.43.15 – teljes ZIP alapállományainak és mobil kizárólagosságának ellenőrzése. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readdirSync,readFileSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=path=>readFileSync(join(root,path),'utf8');
const html=read('index.html'),script=read('script.js'),sw=read('service-worker.js');
const manifest=JSON.parse(read('release-manifest.json'));
const config=JSON.parse(read('json/config.json'));
assert.equal(manifest.release,'csanadi-website-v1.43.15-m8-m10-mobile-preview');
assert.equal(config.performance.cacheVersion,'csanadi-r-v1.43.15');
assert.match(sw,/const RELEASE_ID='1\.43\.15'/);
assert.match(html,/js\/round13-network\.js\?v=csanadi-r-v1\.43\.15/);
assert.match(html,/script\.js\?v=1\.43\.15/);
const latest=['mobile-m8-components-v1-43-13.css','mobile-m9-quality-v1-43-14.css',
 'mobile-m10-workflows-v1-43-15.css'];
for(const path of latest){
 assert.match(html,new RegExp(`${path.replace(/\./g,'\\.')}\\?v=1\\.43\\.15" media="screen and \\(max-width: 768px\\)"`));
 assert.ok(sw.includes(`'./mobile/${path}'`));
 const css=read('mobile/'+path);
 assert.equal([...css].reduce((n,c)=>n+(c==='{')-(c==='}'),0),0,path);
 const scopes=[...css.matchAll(/@media\s+[^{}]+\{/g)];
 assert.ok(scopes.length>=2&&scopes.every(m=>/max-width:\s*(?:365|768)px/.test(m[0])),path+' CSS nincs mobilra korlátozva');
}
for(const path of ['mobile-m9-quality-v1-43-14.js','mobile-m10-workflows-v1-43-15.js']){
 assert.ok(script.includes(`./mobile/${path}?v=1.43.15`),path+' import hiányzik');
 assert.ok(sw.includes(`'./mobile/${path}'`));
}
assert.ok(script.includes('initMobileQualityM9()')&&script.includes('initMobileWorkflowsM10()'));
let examined=0,jsonCount=0;
function enumerate(dir=''){
 for(const entry of readdirSync(join(root,dir),{withFileTypes:true})){
  const path=join(dir,entry.name);
  if(entry.isDirectory())enumerate(path);
  else if(path!=='release-manifest.json'){
   const data=readFileSync(join(root,path));
   const meta=manifest.files?.[path];
   assert.ok(meta,`Nincs manifest-bejegyzés: ${path}`);
   assert.equal(meta.sizeBytes,data.length,`Eltérő fájlméret: ${path}`);
   assert.equal(meta.sha256,createHash('sha256').update(data).digest('hex'),`Eltérő SHA-256: ${path}`);
   if(path.endsWith('.json')){JSON.parse(data.toString('utf8'));jsonCount++}
   examined++;
  }
 }
}
enumerate();
assert.equal(examined,Object.keys(manifest.files).length,'Árva manifest-bejegyzés');
assert.ok(jsonCount>100,'Hiányzó JSON-adatok');
assert.ok(examined>1000,'Hiányos teljes csomag');
console.log(`v1.43.15 csomagellenőrzés: ${examined} fájl SHA-256, ${jsonCount} JSON, CSS mobil scope, SW és cache-verzió OK`);
