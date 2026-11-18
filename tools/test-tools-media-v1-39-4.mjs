import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  replaceAssetReferences, removeAssetEntries, containsReference, uniqueMediaId
} from './media-project-ops-v1-39-4.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const json=relative=>JSON.parse(read(relative));
const tests=[];
function check(name,fn){try{fn();tests.push({name,ok:true});}catch(error){tests.push({name,ok:false,error:error.message});}}

check('Az új változat verziója és a statikus FTP-működés',()=>{
  assert.match(json('json/config.json').performance.cacheVersion,/^csanadi-r-v1\.(?:39\.(?:9|10|11|12|13|14|15|16)|40\.(?:[4-9]|10))$/);
  assert.match(read('index.html'),/script\.js\?v=1\.(?:39\.(?:9|10|11|12|13|14|15|16)|40\.(?:[4-9]|10))/);
  assert.equal(json('json/oldalindex.json').searchIndexRevision,'1.39.9');
});
check('A 71 oldalt, a 628 alapfájlt és a 120 új grafikát megtartottuk',()=>{
  assert.equal(Object.keys(json('json/oldalindex.json').pages).length,71);
  const items=json('json/assets-inventory.json').items;
  assert.ok(items.length>=748);
  for(const item of items){
    const filename=path.join(root,item.path);
    assert.ok(fs.statSync(filename).isFile(),item.path);
    assert.equal(fs.statSync(filename).size,item.sizeBytes,item.path);
  }
});
check('A karbantartó oldalaknál minden közös héj bekötött',()=>{
  const pages=fs.readdirSync(path.join(root,'tools')).filter(p=>p.endsWith('.html'));
  assert.ok(pages.length>=15);
  for(const page of pages)assert.match(read('tools/'+page),/tool-ui-2026\.js/,page);
  const ui=read('tools/tool-ui-2026.js');
  assert.match(ui,/cs-tools-global-nav/);
  assert.match(ui,/v=1\.39\.5/);
  assert.match(read('css/tools-unified-v1.css'),/v1\.39\.4/);
  for(const page of ['index.html','eszkoz-mediator.html','dokumentum-szerkeszto.html','minosegkapu.html'])
    assert.ok(fs.existsSync(path.join(root,'tools',page)));
});
check('A teljes helyi CRUD kezelő megvan; nincs szerveroldali írás',()=>{
  const html=read('tools/eszkoz-mediator.html');
  for(const id of ['mm-list','mm-add','mm-folder','mm-form','mm-save','mm-replace','mm-delete','mm-institution-ok','mm-export-full','mm-export-changes','mm-local-save'])
    assert.ok(html.includes('id="'+id+'"'),id);
  const js=read('tools/media-manager-2026.js');
  for(const token of ['fileArray(','applyForm(','replaceFile(','deleteItem(','prepareExport(','createZip(','updateFolder(','institutionallyApproved','removeAssetEntries'])
    assert.ok(js.includes(token),token);
  assert.match(html,/FTP/);
});
check('A JSON útvonalcsere a kulcsokat és az értékeket is átírja',()=>{
  const original={'assets/media/web/a.webp':{src:'assets/media/web/a.webp',nested:['assets/media/web/a.webp']}};
  const result=replaceAssetReferences(original,[['assets/media/web/a.webp','assets/media/web/b.webp']]);
  assert.ok(result['assets/media/web/b.webp']);
  assert.equal(result['assets/media/web/b.webp'].src,'assets/media/web/b.webp');
  assert.equal(result['assets/media/web/b.webp'].nested[0],'assets/media/web/b.webp');
  assert.equal(original['assets/media/web/a.webp'].src,'assets/media/web/a.webp');
});
check('Az átnevezés elutasítja az ütköző JSON kulcsokat',()=>{
  assert.throws(()=>replaceAssetReferences({old:1,new:2},[['old','new']]),/Ütköző JSON-kulcs/);
});
check('Törlés után a médiaazonosító és a forráshivatkozás sem marad',()=>{
  const source={items:[{id:'media:x',original:{path:'assets/media/web/a.webp'}},{id:'media:y',original:{path:'assets/media/web/b.webp'}}],other:['szabad']};
  const result=removeAssetEntries(source,'assets/media/web/a.webp','media:x');
  assert.equal(result.items.length,1);
  assert.ok(!containsReference(result,'assets/media/web/a.webp'));
  assert.ok(!containsReference(result,'media:x'));
  assert.equal(source.items.length,2);
});
check('A maradék hivatkozásból az export blokkolható',()=>{
  assert.ok(containsReference({banner:{src:'assets/media/web/a.webp'}},'assets/media/web/a.webp'));
  assert.ok(containsReference({'assets/media/web/a.webp':true},'assets/media/web/a.webp'));
  assert.ok(!containsReference({src:'assets/media/web/b.webp'},'assets/media/web/a.webp'));
});
check('Eltérő mappák azonos nevű állományai nem kapnak ütköző azonosítót',()=>{
  const a=uniqueMediaId('media','assets/media/web/iskola.webp',new Set());
  const b=uniqueMediaId('media','assets/graphics/iskola.webp',new Set());
  assert.notEqual(a,b);
  assert.equal(uniqueMediaId('media','assets/media/web/iskola.webp',new Set([a])),a+'-2');
});
check('Az új közzététel intézményi engedélyhez kötött',()=>{
  const js=read('tools/media-manager-2026.js');
  assert.match(js,/!item\._institutionallyApproved\)throw Error/);
  assert.match(js,/record\.rights\.institutionallyApproved=true/);
  assert.match(js,/!\$\('mm-institution-ok'\)\.checked/);
});
check('Működő kiadási útvonalak és szerkesztői visszavonás',()=>{
  const js=read('tools/media-manager-2026.js');
  for(const symbol of ['undoStack','remember()','downloadBlob(','showDirectoryPicker','mediatar-torlesi-jegyzek.json'])
    assert.ok(js.includes(symbol),symbol);
});

const failed=tests.filter(test=>!test.ok);
console.log(JSON.stringify({release:'1.39.4',total:tests.length,passed:tests.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
