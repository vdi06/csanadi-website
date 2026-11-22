/** Csanádi 1.51 – célzott funkcionális és integritási szerződésvizsgálat.
 * A teszt nem állítja, hogy valódi iOS/Android böngészőt helyettesít.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(branch,name)=>fs.readFileSync(path.join(root,branch,name),'utf8');
const json=(branch,name)=>JSON.parse(read(branch,name));
const exists=(branch,name)=>fs.existsSync(path.join(root,branch,name));
const config=json('source','json/config.json');
const index=json('source','json/page-index.json');
const media=json('source','json/media-library.json');
const documents=json('source','json/data/documents.json');
const routes=new Set(Object.values(index.pages).map(p=>p.schemaExtensions?.route));
const mediaById=new Map(media.items.map(item=>[item.id,item]));
let references=0,knownReferences=0;
const errors=[];

assert.equal(Object.keys(index.pages).length,79);
assert.ok(routes.has('#/'));
assert.equal(config.performance.cacheVersion,'csanadi-r-v1.51');

// Minden regisztrált helyi kép és dokumentum ténylegesen elérhető mindkét
// önálló csomagban, és a kiadási manifest ugyanazt a fájlt követi.
for(const item of media.items){
 for(const variant of [item.original,...(item.variants||[])]){
  if(!variant?.path)continue;
  references++;
  for(const branch of ['mobile','desktop'])if(!exists(branch,variant.path))
   errors.push(`${branch}: hiányzó médiaváltozat ${variant.path}`);
 }
}
for(const doc of documents.documents){
 if(!doc.filePath)continue;
 references++;
 for(const branch of ['mobile','desktop'])if(!exists(branch,doc.filePath))
  errors.push(`${branch}: hiányzó dokumentum ${doc.filePath}`);
 for(const route of doc.relatedRoutes||[])if(!routes.has(route))errors.push(`Dokumentum: hibás kapcsolt útvonal ${route}`);
}

function inspect(value,file,key=''){
 if(typeof value==='string'){
  if(key==='href'&&value.startsWith('#/')&&!routes.has(value.split('?')[0]))
   errors.push(`${file}: hiányzó útvonal ${value}`);
  if((key==='mediaId'||key==='mobileMediaId'||key==='imageId'||key==='bannerMediaId')&&value.startsWith('media:')){
   knownReferences++;
   if(!mediaById.has(value))errors.push(`${file}: nem regisztrált médiakulcs ${value}`);
  }
  return;
 }
 if(Array.isArray(value)){for(const entry of value)inspect(entry,file,key);return;}
 if(value&&typeof value==='object')for(const [name,part] of Object.entries(value))inspect(part,file,name);
}
for(const pagePath of Object.keys(index.pages))inspect(json('source','json/'+pagePath),pagePath);

const home=json('source','json/pages/home.json');
const hero=home.blocks.find(block=>block.id==='block:home-hero')?.data;
assert.ok(hero&&hero.slides?.length>=5);
for(const key of ['sectionLabel','filmLabel','initialTitle','previousLabel','nextLabel',
 'exploreLabel','pauseLabel','resumeLabel','unavailableSubtitle'])
 assert.ok(typeof hero.mobileUi?.[key]==='string'&&hero.mobileUi[key].trim(),`Mobil UI JSON: ${key}`);

const mobileHero=read('mobile','js/hero-2026.js');
assert.match(mobileHero,/ui:data\.mobileUi/);
assert.doesNotMatch(mobileHero,/csn26-visual-row|cs42-desktop-carousel/);
assert.match(read('mobile','mobile/reboot-hero-v1-43-29.js'),/label\('pauseLabel'/);

// Valódi regresszió volt: a desktopon a mobilkomponens helyettesítőjéből
// hiányzott a reset() és a back(), pedig az app meghívta ezeket.
const used=[...read('source','js/app.js').matchAll(/\bphoneWheel\.([a-zA-Z]+)\s*\(/g)]
 .map(match=>match[1]);
const source=read('desktop','js/app.js');
const factory=/const createPhoneRadial=\(\)=>\((\{[^;]+\})\);/.exec(source);
assert.ok(factory,'Hiányzik a desktop menühelyettesítő.');
const methods=Object.keys(Function(`return ${factory[1]}`)());
for(const method of new Set(used))assert.ok(methods.includes(method),`A desktop menühelyettesítőből hiányzik: ${method}`);

const editor=read('mobile','tools/maintenance-studio.js');
assert.match(editor,/if\(this\.state\.shell\?\.platform\)/);
assert.match(editor,/CSAK-VALTOZASOK-NEM-FTP-RE\.json/);
assert.match(editor,/NEM teljes kiadási ZIP/);
assert.match(read('desktop','tools/maintenance-studio.js'),/if\(this\.state\.shell\?\.platform\)/);

for(const branch of ['mobile','desktop']){
 const shell=json(branch,'json/site-shell.json');
 assert.equal(shell.platform,branch);
 assert.deepEqual(json(branch,'json/page-index.json').pages,index.pages);
 assert.equal(json(branch,'json/config.json').performance.cacheVersion,'csanadi-r-v1.51');
 assert.deepEqual(json(branch,'json/pages/home.json').blocks.find(b=>b.id==='block:home-hero').data.mobileUi,hero.mobileUi);
 // Nem lehet a másik ág stílusát belopni az elsőbe.
 const css=shell.assets.stylesheets.map(item=>item.href||'');
 if(branch==='mobile')assert.ok(css.every(url=>!url.includes('desktop-hero')));
 else assert.ok(css.every(url=>!url.startsWith('mobile/')));
 for(const url of [...css,...shell.assets.scripts.map(item=>item.src),shell.assets.entryModule]){
  if(/^https?:|^\/\//.test(url))continue;
  if(!exists(branch,url.split('?')[0]))errors.push(`${branch}: hibás keret-hivatkozás ${url}`);
 }
}

// A gyökér-szolgáltatási munkafolyamat egyetlen elgépelést sem tartalmazhat
// az offline előtöltési listájában, és nem töltheti a másik platformot.
const sw=read('','service-worker.js');
const coreScript=sw.slice(0,sw.indexOf('const local='));
for(const platform of ['mobile','desktop']){
 const core=vm.runInNewContext(`${coreScript}\nCORE`,{
  self:{location:{href:`https://example.test/csanadi/service-worker.js?platform=${platform}`},
   registration:{scope:'https://example.test/csanadi/'}},URL
 });
 assert.ok(Array.isArray(core)&&core.includes('./index.html'));
 for(const name of core){
  const relative=name.replace(/^\.\//,'');
  if(relative&&relative!=='./'&&!exists('',relative))errors.push(`offline ${platform}: hiányzó ${name}`);
  if(platform==='mobile'&&name.startsWith('./desktop/'))errors.push(`mobil offline: desktop fájl ${name}`);
  if(platform==='desktop'&&name.startsWith('./mobile/'))errors.push(`asztali offline: mobil fájl ${name}`);
 }
}

// Minden elsődleges JS-modul betölthető szintaktikailag, a két teljes
// alkalmazás munkafolyamata a saját fájljaiból áll elő.
for(const branch of ['mobile','desktop'])for(const file of [
 'script.js','js/app.js','js/hero-2026.js','js/site-bootstrap-v149.js',
 'js/round13-network.js','tools/maintenance-studio.js'])
 execFileSync(process.execPath,['--check',path.join(root,branch,file)],{stdio:'pipe'});

assert.deepEqual(errors,[],'Sérült hivatkozások');
console.log(`1.51 regresszió PASS – ${routes.size} útvonal, ${media.items.length} média, ${documents.documents.length} dokumentum, ${references} asset-hivatkozás, ${knownReferences} oldal-médiakulcs`);
console.log(`Asztali menü: ${[...new Set(used)].sort().join(', ')} · JSON mobilhero és kétplatformos ZIP-védelem PASS`);
