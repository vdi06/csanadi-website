'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const failures=[];
let checked=0;
const test=(name,action)=>{checked++;try{action();}catch(error){failures.push({name,error:String(error.message||error).slice(0,400)});}};
const structure=read('json/structure.json');
const index=read('json/oldalindex.json').pages;
const inventory=read('json/assets-inventory.json').items;
const paths=[];
const visible=[];
const full=[];
function visit(nodes,depth){for(const node of nodes){paths.push(node.path);if(depth<=2&&node.menuVisible!==false)visible.push({path:node.path,depth});full.push({path:node.path,depth});visit(node.children||[],depth+1);}}
visit(structure.nodes,1);
test('Hat főmenü és 28 látható almenü',()=>{assert.equal(visible.filter(x=>x.depth===1).length,6);assert.equal(visible.filter(x=>x.depth===2).length,28);});
test('Nem keletkezett látható harmadik menüszint',()=>{assert.ok(full.filter(x=>x.depth===3).every(x=>!visible.some(y=>y.path===x.path)));assert.ok(full.every(x=>x.depth<=3));});
test('Minden regisztrált oldal egyszer szerepel',()=>{assert.equal(new Set(paths).size,paths.length);assert.equal(paths.length,70);assert.equal(Object.keys(index).length,71);});
test('A keresőindex a kezdőoldalt is tartalmazza',()=>assert.deepEqual(new Set(Object.keys(index)),new Set([...paths,'oldalak/kezdolap.json'])));
const allIds=new Set(),allRoutes=new Set();
const unresolved=new Set();
const allow=new Set(['#/megkozelites-es-tanulas','#/megkozelites-es-tanulas/terkep']);
for(const relative of paths){
 const file='json/'+relative;
 const item=index[relative];
 let page;
 test('Oldal JSON és életciklus '+file,()=>{
  page=read(file);assert.equal(page.lifecycle?.status,'published');assert.ok(Array.isArray(page.blocks));
  assert.equal(item?.id,page.id);assert.equal(item?.schemaExtensions?.route,page.schemaExtensions.route);
  assert.ok(/^#\//.test(page.schemaExtensions.route));assert.ok(page.title);assert.ok(page.schemaVersion);
 });
 if(!page)continue;
 test('Egyedi oldalazonosító '+page.id,()=>{assert.ok(!allIds.has(page.id));allIds.add(page.id);});
 test('Egyedi útvonal '+page.schemaExtensions.route,()=>{assert.ok(!allRoutes.has(page.schemaExtensions.route));allRoutes.add(page.schemaExtensions.route);});
 const blockTexts=JSON.stringify(page.blocks);
 for(const match of blockTexts.matchAll(/#\/[\w\-\/]+/g)){
  const ref=match[0];if(ref!=='#/'&&!paths.some(p=>index[p]?.schemaExtensions?.route===ref)&&!allow.has(ref))unresolved.add(relative+' → '+ref);
 }
}
test('A kezdőlap külön JSON-fájlban elérhető',()=>{const home=read('json/oldalak/kezdolap.json');assert.equal(home.schemaExtensions?.route,'#/');assert.equal(home.lifecycle?.status,'published');assert.equal(index['oldalak/kezdolap.json']?.id,home.id);});
test('Nincsenek ismeretlen belső SPA-linkek',()=>assert.deepEqual([...unresolved],[]));
for(const asset of inventory){
 test('Regisztrált média '+asset.path,()=>{const stat=fs.statSync(path.join(root,asset.path));assert.equal(stat.size,asset.sizeBytes);});
}
let jsonCount=0,staticCount=0;
function scan(dir){for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const rel=path.join(dir,entry.name);if(entry.isDirectory()){if(entry.name!=='node_modules')scan(rel);}else{staticCount++;if(entry.name.endsWith('.json')){test('Érvényes JSON '+rel,()=>read(rel));jsonCount++;}}}}
scan('json');
test('Az új témák külön, élő oldalak',()=>{
 for(const route of ['#/tanulastamogatas','#/megkozelites-es-erkezes','#/megkozelites-es-erkezes/terkep','#/oktatas/digitalis-kultura/online-biztonsag','#/oktatas/digitalis-kultura/mesterseges-intelligencia'])assert.ok(allRoutes.has(route),route);
});
test('Az új arculat és logika be van kötve',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const script=fs.readFileSync(path.join(root,'script.js'),'utf8');
 assert.ok(html.includes('liquid-glass-v1-39-0.css'));assert.ok(script.includes('release-v1-39-0.js'));assert.ok(html.includes('header-kreta'));assert.ok(fs.existsSync(path.join(root,'tools/mobile-preview-v1-39-0.html')));
});
test('Az eredeti útvonalak átvezetése megmaradt',()=>{const source=fs.readFileSync(path.join(root,'js/app.js'),'utf8');assert.ok(source.includes('history.replaceState'));assert.ok(source.includes('megkozelites-es-tanulas'));});
console.log(JSON.stringify({version:'1.39.0',checked,passed:checked-failures.length,failed:failures.slice(0,35),registered:paths.length,visibleSubmenus:visible.filter(x=>x.depth===2).length,jsonCount,registeredAssets:inventory.length,staticCount},null,2));
if(failures.length)process.exitCode=1;
