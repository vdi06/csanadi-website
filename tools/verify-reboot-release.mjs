/** Mobilos 0-ról újraépítés: teljes csomag, desktop-határ és visszaállíthatóság. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const root=path.resolve(import.meta.dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel));
const text=rel=>read(rel).toString('utf8');
const manifest=JSON.parse(text('release-manifest.json'));
assert.equal(manifest.release,'csanadi-website-v1.43.27-m18-2-mobile-single-row-scroll-fix-preview');
assert.equal(manifest.ftpCompatible,true);
const files=Object.keys(manifest.files);
const fresh=[
 'reboot-design-v1-43-27.css','reboot-hero-v1-43-27.js',
 'reboot-menu-v1-43-27.js','reboot-quality-v1-43-27.js',
 'reboot-shell-v1-43-27.js'];
assert.deepEqual(files.filter(file=>file.startsWith('mobile/')).sort(),fresh.map(name=>'mobile/'+name).sort(),
 'A ZIP nem tartalmazhat a régi mobile/ könyvtárból egyetlen fájlt sem');
for(const file of fresh){
 assert.match(text('index.html')+text('script.js')+text('js/app.js')+
  text('js/hero-2026.js')+text('service-worker.js'),new RegExp(file.replaceAll('.','\\.')),
  `Hiányzó mobilos hivatkozás: ${file}`);
}
for(const file of files){
 const bytes=read(file),info=manifest.files[file];
 assert.equal(bytes.length,info.sizeBytes,file+' bájtméret');
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),info.sha256,file+' SHA-256');
 if(file.endsWith('.json'))JSON.parse(bytes);
}
const actual=[];
function walk(rel=''){
 for(const entry of fs.readdirSync(path.join(root,rel),{withFileTypes:true})){
  if(entry.name.startsWith('.'))continue;
  const file=path.posix.join(rel,entry.name);
  if(entry.isDirectory())walk(file);
  else if(entry.isFile()&&file!=='release-manifest.json')actual.push(file);
 }
}
walk();assert.deepEqual(actual.sort(),files.sort(),'Minden állomány leltárba került');
// V1.43.15 jóváhagyott referencia: négy szigorúan változatlan állománycsoport.
const baseline=[
 ['desktop/',7,'9b6163c3bbd2f9dc916c6ea2bb7f725d2554ad71d2aa273ff2d5754c1da3892a'],
 ['css/',66,'9116e2c1c6927ebee9c308e7754be77fdb59cb72b14b140d79356367fb0ee592'],
 ['assets/',828,'07d3968f720dd821fab8f27683d968a08a21c3d67cc96519a2add38c02e04d53'],
 ['json/',110,'0f8cbb9ddb4eb139b845fce97c30ddb25b0e05aec888bfb20912394004bbab54']
];
for(const [prefix,count,reference] of baseline){
 const matches=files.filter(f=>f.startsWith(prefix)&&f!=='json/config.json').sort();
 assert.equal(matches.length,count,`${prefix} állományszám`);
 const hash=crypto.createHash('sha256');
 for(const file of matches){hash.update(file+'\0');hash.update(read(file));}
 assert.equal(hash.digest('hex'),reference,`Változatlan v1.43.15 referencia: ${prefix}`);
}
// A v1.43.16-ból induló M11–M17.4 csak mobilos belső logikát módosíthat.
// A közös belépési pontok, a SPA és a desktop hero byteazonos maradt,
// ha a kötelező kiadási URL-/fájlnév-verzióváltást kivesszük.
const commonRuntime={
 'index.html':'dfc93302dd046ad2f13bbcaa14ebe74529e8be81580609826ce7486df178a878',
 'script.js':'ba879827bf6c53b418fb1ebcf1a420e0cb3b74fa323ef19d85fc18fd2918daad',
 'service-worker.js':'80d1fb6c9162766b63198915eb551b1cfbdcc5843c0ea9548efa058af9aa3de2',
 'js/app.js':'d22b80ce2c7e41af93c204f1e76b2a89eb0dabf81442d9f3d5e1c67790d557f2',
 'js/blocks.js':'f2b4ca2e81a159c8b55cf4bdefba71c350fe2c9095dd17f518c8a31ea3b963a6',
 'js/hero-2026.js':'c147a525843af3f1843cad6f16a6163b0b33aee4aa0ec79ac4e624c5768037b2',
 'js/home-v1-41.js':'d67eeb77511a36c85b93f2fd42d2c0a9543e81212a9b6b05edd279464cbaf0d7'
};
for(const [file,reference] of Object.entries(commonRuntime)){
 const normalized=text(file).replaceAll('1.43.27','1.43.XX').replaceAll('v1-43-27','v1-43-XX');
 assert.equal(crypto.createHash('sha256').update(normalized).digest('hex'),reference,
  `M17.4 desktop és SPA védelem: ${file}`);
}
const entrypoints=['index.html','script.js','js/app.js','js/hero-2026.js','js/blocks.js','service-worker.js'];
const imported=entrypoints.map(text).join('\n');
assert.doesNotMatch(imported,/mobile\/(?:m[1-9]|m10|quick-nav|mobile-)/i,
 'Régi mobilos JS/CSS nem importálható');
assert.match(text('index.html'),/media="screen and \(max-width: 768px\)"/);
assert.match(text('service-worker.js'),/const RELEASE_ID='1\.43\.27'/);
assert.equal(JSON.parse(text('json/config.json')).performance.cacheVersion,'csanadi-r-v1.43.27');
const css=text('mobile/reboot-design-v1-43-27.css');
assert.match(css,/#cs-mobile-rebuild,\.cs-mb-cinema\{display:none\}/);
assert.match(css,/@media screen and \(max-width:768px\)/);
assert.match(css,/@media screen and \(max-width:768px\) and \(prefers-reduced-motion:reduce\)/);
let balance=0;
for(const char of css.replace(/\/\*[\s\S]*?\*\//g,'')){
 if(char==='{')balance++;
 else if(char==='}')balance--;
 assert.ok(balance>=0,'CSS lezáró kapcsos zárójel nem előzheti meg a megnyitót');
}
assert.equal(balance,0,'A mobilos CSS összes blokkja lezárt');
console.log(`Teljes leltár és SHA-256 OK: ${files.length} fájl; desktop CSS, JS, média, tartalmi JSON változatlan`);
console.log('M17.4 közös SPA/desktop változatlan logika: 7 belépési pont lenyomata egyezik');
console.log('Öt új mobilmodul; korábbi mobile/ kizárva; reszponzív határ és verziók OK');
