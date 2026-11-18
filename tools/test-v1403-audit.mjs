/* A+B+C+D: reprodukálható, csak olvasó kiadási és fotóminőség-ellenőrzés. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));
const config=json('json/config.json');
const index=json('json/oldalindex.json');
const structure=json('json/structure.json');
const page=json('json/oldalak/kezdolap.json');
const items=json('json/mediatar.json').items;
const media=new Map(items.map(item=>[item.id,item]));
const slides=page.blocks.find(b=>b.id==='block:home-hero')?.data.slides||[];
assert.equal(slides.length,30);
const hashes=new Set();
const dimensions=[];
for(const [i,slide] of slides.entries()){
 const entry=media.get(slide.mediaId);
 assert.ok(entry,`A(z) ${i+1}. fotó hiányzik a médiatárból: ${slide.mediaId}`);
 const file=path.join(root,entry.original.path);
 assert.ok(fs.existsSync(file),`Hiányzó fájl: ${entry.original.path}`);
 const bytes=fs.readFileSync(file);
 const sha=crypto.createHash('sha256').update(bytes).digest('hex');
 assert.ok(!hashes.has(sha),`A(z) ${i+1}. fotó azonos egy korábbi képpel`);
 hashes.add(sha);
 const output=execFileSync('identify',['-ping','-format','%w %h',file],{encoding:'utf8'}).trim().split(' ').map(Number);
 const [width,height]=output;
 assert.ok(width>=1200&&height>=675&&width/height>=1.5,`A(z) ${i+1}. fotó nem elég nagy vagy rossz képarányú: ${width}×${height}`);
 assert.equal(entry.original.width,width,`A(z) ${i+1}. fotó katalógusszélessége hibás`);
 assert.equal(entry.original.height,height,`A(z) ${i+1}. fotó katalógusmagassága hibás`);
 assert.equal(entry.original.sizeBytes,bytes.length,`A(z) ${i+1}. fotó mérete hibás`);
 assert.equal(entry.original.sha256,sha,`A(z) ${i+1}. fotó SHA-256 értéke hibás`);
 if(slide.mobileMediaId)assert.ok(media.has(slide.mobileMediaId),`Hiányzó mobil fotó: ${slide.mobileMediaId}`);
 dimensions.push([width,height]);
}
assert.equal(hashes.size,30);
assert.equal(config.runtime.hero.maxSlides,30);
assert.ok(config.runtime.hero.pictureCacheEntries<=5);
assert.match(config.performance.cacheVersion,/^csanadi-r-v1\.40\.(?:[3-9]|10)$/);
assert.match(read('index.html'),/accessibility-v1-40-3\.css\?v=1\.40\.3/);
assert.match(read('index.html'),/script\.js\?v=1\.40\.(?:[3-9]|10)/);
assert.match(read('js/app.js'),/blocks\.js\?v=1\.40\.(?:[3-9]|10)/);
assert.match(read('script.js'),/app\.js\?v=1\.40\.(?:[3-9]|10)/);
const language=read('js/language-20.js');
assert.match(language,/from ['"]\.\/site-settings-2026\.js['"]/);
assert.doesNotMatch(language,/site-settings-2026\.js\?v=/,'A beállításmodulból ne jöjjön létre második példány');
assert.match(read('css/accessibility-v1-40-3.css'),/@media\(max-width:420px\)/);
assert.match(read('css/accessibility-v1-40-3.css'),/@media\(max-width:350px\)/);
const listed=Object.keys(index.pages);
assert.equal(listed.length,71);
const pageFiles=new Set(['oldalak/kezdolap.json']);
function scan(nodes){for(const n of nodes||[]){assert.ok(n.path, 'A menüpontok elérési útjai kötelezők');pageFiles.add(n.path);scan(n.children);}}
scan(structure.nodes);
assert.equal(pageFiles.size,71);
for(const rel of pageFiles){const p=json('json/'+rel);assert.ok(p.title?.trim()&&p.lifecycle?.status==='published',`Hibás oldal: ${rel}`);}
const css=read('css/accessibility-v1-40-3.css');
assert.match(css,/html\[data-theme="light"\]/);
assert.match(css,/html\[data-theme="dark"\]/);
const manifestFile=path.join(root,'release-manifest.json');
if(fs.existsSync(manifestFile)){
 const manifest=json('release-manifest.json');
 if(/^csanadi-website-v1\.40\.(?:[3-9]|10)$/.test(manifest.release)){
  for(const [name,meta] of Object.entries(manifest.files)){
   const bytes=fs.readFileSync(path.join(root,name));
   assert.equal(bytes.length,meta.sizeBytes,`Kiadási méreteltérés: ${name}`);
   assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),meta.sha256,`Kiadási SHA eltérés: ${name}`);
  }
 }
}
console.log(JSON.stringify({release:'1.40.3',pages:pageFiles.size,heroImages:slides.length,uniqueSha256:hashes.size,minWidth:Math.min(...dimensions.map(x=>x[0])),minHeight:Math.min(...dimensions.map(x=>x[1])),checks:'OK'}));
