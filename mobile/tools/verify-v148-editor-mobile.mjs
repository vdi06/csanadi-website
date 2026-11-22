/** 1.51 – JSON vizuális szerkesztés, mobilos desktop-maradvány és ZIP-visszaolvasás. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {enumerateShellFields,shellNodeIndex,setShellField,collectMenuEntries,moveMenuItem}
 from './visual-json-editor-v149.js';
import {validateJsonShell} from '../js/json-validator-v149.js';
import {mobileShouldAutoAdvance} from '../mobile/reboot-hero-v1-43-29.js';
import {createZip} from '../js/zip-native-2026.js';
import {readVerifiedZip} from '../js/zip-integrity-v1-42-26.js';
import {sha256} from './editor-core.js';
import {validateReleaseManifest} from './release-policy-v1-42-26.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const shell=JSON.parse(read('json/site-shell.json'));
const structure=JSON.parse(read('json/structure.json'));
const index=JSON.parse(read('json/page-index.json'));
assert.equal(validateJsonShell(shell,{kind:'site'}).valid,true,'A JSON-váz maradéktalanul érvényes');
for(const section of ['header','menu','footer']){
 const location=shellNodeIndex(shell,section);
 assert.ok(location>=0,`${section}: nincs JSON-beli gyökérelem`);
 const fields=enumerateShellFields(shell,section);
 assert.ok(fields.length>=2,`${section}: a szerkesztő nem lát tartalmi mezőket`);
 const content=JSON.parse(JSON.stringify(shell)),field=fields.find(item=>item.kind==='text')||fields[0];
 setShellField(content,field.path,'Módosított próbaérték');
 assert.equal(enumerateShellFields(content,section).find(item=>JSON.stringify(item.path)===JSON.stringify(field.path)).value,'Módosított próbaérték');
 assert.equal(validateJsonShell(content,{kind:'site'}).valid,true,'A szerkesztés után is érvényes az oldalkeret');
}
const link=enumerateShellFields(shell,'header').find(item=>item.kind==='url');
assert.ok(link,'Szerkeszthető JSON hivatkozás szükséges');
assert.throws(()=>setShellField(JSON.parse(JSON.stringify(shell)),link.path,'javascript:alert(1)'),/biztonságos/);
const menu=collectMenuEntries(structure,index);
assert.equal(menu.length,78,'Minden aloldal azonos menümodellből származik');
const second=menu.find(item=>item.depth===0&&item.path!==menu[0].path);
assert.ok(second);
const moved=moveMenuItem(structure,second.path,-1);
assert.equal(moved.nodes[0].path,second.path,'A menüpont ténylegesen előrébb kerül');
assert.equal(structure.nodes[0].path,menu[0].path,'A kiinduló JSON nem változhat');
assert.deepEqual(moved.nodes.slice(0,2).map(x=>x.order),[1,2]);
assert.equal(moveMenuItem(structure,menu[0].path,-1),null,'A legelső nem lépheti át a csoporthatárt');
assert.equal(mobileShouldAutoAdvance(9000,2000,8000),false,'Kézi lapozás után nincs azonnali automata ugrás');
assert.equal(mobileShouldAutoAdvance(11000,2000,8000),true);
const css=read('mobile/reboot-stability-v149.css');
assert.match(css,/csn26-visual-row\.csn26-single-image/,'A pontos desktop-maradvány rejtett');
assert.match(css,/content-visibility:hidden!important/,'A desktop sáv nem foglalhat helyet');
assert.match(css,/reveal-on-scroll:not\(\.is-visible\)/,'A láthatatlan görgetős kártyák feloldva');
assert.match(read('js/app.js'),/matchMedia\('\(max-width: 768px\)'\)\.matches/);
assert.match(read('mobile/reboot-shell-v1-43-29.js'),/fromShell\('\.brand-copy strong'/,
 'A mobilos fejléc címe is a JSON-ból generált eredeti fejléc adataiból készül');
assert.ok(shell.assets.stylesheets.some(item=>item.href.startsWith('mobile/reboot-stability-v149.css')));
assert.ok(shell.assets.stylesheets.some(item=>item.href.startsWith('css/visual-json-editor-v149.css')));
assert.match(read('index.html'),/<body><\/body>/,'A HTML változatlanul üres tartalomváz');
assert.deepEqual(validateReleaseManifest({release:'csanadi-website-1.51',files:{}},new Map()),[]);
// Minimális, saját ellenőrzőösszegű ZIP: a reports/ útvonal és a két tagú
// verzió együttesen is átmegy a teljes CRC/SHA-256 visszaolvasáson.
const encode=value=>new TextEncoder().encode(value);
const entries=new Map([
 ['json/config.json',encode(JSON.stringify({performance:{cacheVersion:'csanadi-r-v1.51'}}))],
 ['service-worker.js',encode("const RELEASE_ID='1.51';")],
 ['reports/proba.md',encode('Ellenőrzött lokális kiadás.')]
]);
const files={};for(const [name,bytes] of entries)files[name]={sizeBytes:bytes.length,sha256:await sha256(bytes)};
const manifest={schemaVersion:'1.0.0',release:'csanadi-website-1.51',files};
entries.set('release-manifest.json',encode(JSON.stringify(manifest)));
const zip=await createZip(entries);
const verified=await readVerifiedZip(zip,{expectedRelease:'csanadi-website-1.51'});
assert.equal(verified.count,4);
console.log('1.51: JSON szerkesztő, 78 menüoldal, mobil duplázás, képváltó ütemezés és ZIP CRC/SHA-256: OK');
