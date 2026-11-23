/** 2.45 új album-adatok, responsive képek és helyi szerkesztő kiadási kontrollja. */
import assert from 'node:assert/strict';
import {readFileSync,statSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const get=p=>readFileSync(join(root,p),'utf8');
const cfg=JSON.parse(get('shared/data/site.json'));
assert.equal(cfg.release,'2.48');
const {checkedMediaCenter,mediaResults,mediaGroups,responsiveImageAttributes}=await import('../shared/js/media-data.js');
const media=checkedMediaCenter(cfg);
assert.equal(media.items.length,22);
assert.deepEqual(Object.keys(media.albums),['sport','schoolYear','event']);
for(const i of media.items){
 assert.equal(i.provenance,'illustration');
 for(const w of [400,800,1280]){
  const name=i.responsive[String(w)];assert.match(name,new RegExp(`^\\.\\/shared\\/assets\\/media\\/gallery\\/${w}\\/`));
  const path=join(root,name.slice(2));assert.ok(existsSync(path),`Hiányzó változat: ${name}`);
  assert.ok(statSync(path).size>800,`Túl kis médiaváltozat: ${name}`);
  const magic=readFileSync(path).subarray(0,12);
  assert.equal(magic.toString('ascii',0,4),'RIFF');assert.equal(magic.toString('ascii',8,12),'WEBP');
 }
 const att=responsiveImageAttributes(i);assert.equal(att.srcset.split(',').length,3);
}
assert.equal(mediaResults(cfg,{query:'röplabda'}).length,1);
assert.equal(mediaResults(cfg,{query:'ropLABDA'}).length,1);
assert.equal(mediaResults(cfg,{event:'sportnap'}).length,1);
assert.equal(mediaResults(cfg,{sport:'atletika'}).length,1);
assert.equal(mediaResults(cfg,{schoolYear:'2026-2027'}).length,9);
assert.equal(mediaResults(cfg,{sport:'atletika',event:'sportnap'}).length,0);
assert.ok(mediaGroups(cfg,media.items,'sport').some(g=>g.label==='Atlétika'&&g.items.length===1));
for(const [field,corrupt] of [
 ['category',x=>{x.items[0].category='hibas'}],
 ['album',x=>{x.items[0].album.sport='hibas'}],
 ['year',x=>{x.items[0].album.schoolYear='2030-2031'}],
 ['src',x=>{x.items[0].src='https://attacker.example/img.webp'}],
 ['href',x=>{x.items[0].href='javascript:alert(1)'}],
 ['responsive',x=>{x.items[0].responsive['400']='../../out.webp'}],
 ['alt',x=>{x.items[0].alt=''}]
]){
 const bad=structuredClone(cfg);corrupt(bad.mediaCenter);
 assert.throws(()=>checkedMediaCenter(bad),/Érvénytelen médiabejegyzés/,`Hibás adat elfogadva: ${field}`);
}
for(const platform of ['desktop','mobile']){
 assert.match(get(`${platform}/gallery.js`),/createAlbumControls/);
 assert.match(get(`${platform}/gallery.js`),/createMediaEditor/);
 assert.match(get(`${platform}/styles.css`),/media-album-items/);
}
const editor=get('shared/js/gallery-ui.js');
assert.match(editor,/location\.hostname/);assert.match(editor,/media-editor/);
assert.ok(!get('index.html').includes('bootstrap.min.css?v='));
console.log('2.45: 22 kép, 66 méretezett WebP, 3 albumdimenzió, összetett keresés, biztonságos JSON-validálás és helyi szerkesztő – SIKERES');
