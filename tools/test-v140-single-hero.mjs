import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=relative=>readFileSync(path.join(root,relative),'utf8');
const json=relative=>JSON.parse(read(relative));
const page=json('json/oldalak/kezdolap.json');
const library=json('json/mediatar.json');
const entries=new Map(library.items.map(item=>[item.id,item]));
const hero=page.blocks.find(block=>block.id==='block:home-hero');
assert.equal(page.lifecycle.revision,8,'A kezdőlap tartalmi revíziója');
assert.ok(hero,'Hiányzik a kezdőlap hero blokkja');
assert.equal(hero.data.slides.length,3,'Három, egymás után megjelenő képkocka szükséges');
assert.equal(hero.data.intervalMs,7500,'A beállított automatikus váltási idő');

const imagePaths=new Set();
for(const slide of hero.data.slides){
 for(const field of ['eyebrow','title','subtitle','rightEyebrow','rightTitle','rightSubtitle']){
  assert.ok(typeof slide[field]==='string'&&slide[field].trim(),`${slide.id}: hiányzik a(z) ${field}`);
 }
 for(const id of [slide.mediaId,slide.mobileMediaId]){
  const item=entries.get(id);
  assert.ok(item,`${slide.id}: nincs bejegyezve: ${id}`);
  assert.ok(item.original?.path,`${id}: hiányzik az eredeti kép`);
  for(const variant of [item.original,...item.variants]){
   if(imagePaths.has(variant.path))continue;
   const file=path.join(root,variant.path);
   assert.ok(existsSync(file),`Hiányzó képfájl: ${variant.path}`);
   const data=readFileSync(file);
   assert.equal(data.length,variant.sizeBytes,`${variant.path}: fájlméret eltér`);
   assert.equal(createHash('sha256').update(data).digest('hex'),variant.sha256,`${variant.path}: SHA-256 eltér`);
   imagePaths.add(variant.path);
  }
 }
}
assert.equal(imagePaths.size,21,'A hat eredeti és a reszponzív képek összesen 21 állományt igényelnek');

const javascript=read('js/hero-2026.js');
const css=read('css/single-hero-v1-40.css');
const media=read('js/media.js');
const html=read('index.html');
assert.match(javascript,/row\.append\(buildWing\(\)\)/,'Egyszerre csak egy képfelület készülhet');
assert.doesNotMatch(javascript,/showPair|buildWing\('right'\)/,'Nem maradhat két képet megjelenítő változat');
assert.match(javascript,/rightOverline.*rightEyebrow/,'A jobb oldali szöveg együtt váltson a képpel');
assert.match(javascript,/image\.addEventListener\('load',commit/,'A képek csak betöltés után cserélődjenek');
assert.match(javascript,/launcher\.querySelector\('#orbit-open'\)/,'A címeres főmenügomb maradjon meg');
assert.match(css,/grid-template-columns:minmax\(0,1fr\)/,'A kép teljes szélességű legyen');
assert.match(css,/csn26-wing-copy--right/,'A címer mindkét oldalán legyen felirat');
assert.match(css,/radial-gradient\(circle at 50% 50%/,'A címernek maradjon középső kitakarás');
assert.match(media,/mobileSource\.media='\(max-width: 768px\)'/,'Mobil képkivágások legyenek');
assert.match(html,/single-hero-v1-40\.css/,'A v1.40 stíluslap legyen bekötve');

console.log(`v1.40.0 hero: ${hero.data.slides.length} váltakozó teljes szélességű kép; kétoldali felirat; ${imagePaths.size} hibátlan médiaállomány; címer és mobil képek megőrizve.`);
