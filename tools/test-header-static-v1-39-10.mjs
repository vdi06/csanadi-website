/* A korábbi komponensek és a 1.39.10 fejlécegység statikus ellenőrzése. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const checks=[];
function test(name,fn){try{fn();checks.push({name,ok:true});}catch(e){checks.push({name,ok:false,error:e.message});}}
const hero=read('js/hero-2026.js'),shell=read('js/release-v1-39-1.js'),css=read('css/home-header-ribbon-v1-39-10.css');
test('A három látható kezdőszöveg kikerült a megjelenítőből',()=>{
 for(const unwanted of ['SPORT · TUDÁS · KÖZÖSSÉG','Fedezd fel a Csanádi Sportiskolát','Asztalon a két kép együtt lapozható'])
  assert.ok(!hero.includes(unwanted),unwanted);
 assert.doesNotMatch(hero,/csn26-visual-heading/);
});
test('A képernyőolvasó számára maradt szemantikus H1',()=>{
 assert.match(hero,/el\('h1','visually-hidden','Csanádi Árpád Sportiskola'\)/);
 assert.match(hero,/section\.append\(accessibleHeading,row\)/);
});
test('A zsugorított váltó a menüfejléc gyereke',()=>{
 assert.match(shell,/header\.append\(compact\)/);
 assert.match(shell,/hero\.inert=condensed/);
 assert.match(shell,/hero\.setAttribute\('aria-hidden','true'\)/);
 assert.match(css,/#site-header #cs39-mini-hero/);
});
test('A nyílcsatornák közvetlenül a képekhez illeszkednek',()=>{
 assert.match(css,/width:calc\(100% - var\(--cs10-rail-width\) \* 2\)!important/);
 assert.match(css,/left:calc\(-1 \* var\(--cs10-rail-width\)\)!important/);
 assert.match(css,/right:calc\(-1 \* var\(--cs10-rail-width\)\)!important/);
 assert.match(css,/gap:0!important/);
 assert.match(css,/border-radius:0!important/);
});
test('Telefonos és kis telefonos méretezések léteznek',()=>{
 assert.match(css,/@media\(max-width:768px\)/);
 assert.match(css,/@media\(max-width:390px\)/);
 assert.match(css,/--cs10-rail-width:40px/);
});
test('A v1.39.10 eszközök mind bekötve, a cache megújult',()=>{
 assert.match(read('index.html'),/home-header-ribbon-v1-39-10\.css\?v=1\.39\.10/);
 assert.match(read('index.html'),/script\.js\?v=1\.39\.10/);
 assert.match(read('js/blocks.js'),/hero-2026\.js\?v=1\.39\.10/);
 assert.equal(JSON.parse(read('json/config.json')).performance.cacheVersion,'csanadi-r-v1.39.10');
});
test('71 oldal és 748 média továbbra is elérhető',()=>{
 assert.equal(Object.keys(JSON.parse(read('json/oldalindex.json')).pages).length,71);
 assert.equal(JSON.parse(read('json/assets-inventory.json')).items.length,748);
});
const failed=checks.filter(c=>!c.ok);
console.log(JSON.stringify({release:'1.39.10',checks:checks.length,passed:checks.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
