/** M15.1 mobil reflow és töréspont, forrás- és állapotpróba; nem valós renderelés. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {mobileViewportMode,PHONE_QUERY} from '../mobile/reboot-menu-v1-43-27.js';

const root=path.resolve(import.meta.dirname,'..');
const css=fs.readFileSync(path.join(root,'mobile/reboot-design-v1-43-27.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const screens=[[320,568],[360,640],[375,667],[390,844],[412,915],
 [430,932],[768,1024],[768,480]];
assert.equal(PHONE_QUERY,'(max-width: 768px)');
for(const [width,height] of screens){
 const mode=mobileViewportMode(width,height);
 assert.ok(mode==='grid'||mode==='circle',`${width}x${height} mobil mód`);
}
assert.equal(mobileViewportMode(769,900),'desktop');
assert.equal(mobileViewportMode(844,390),'desktop',
 'A 768px feletti fekvő telefonhatár javaslat nélkül nem változhat');
assert.match(html,/media="screen and \(max-width: 768px\)"/);
const marker=css.indexOf('/* M15.1: mobilos reflow');
assert.ok(marker>0,'M15.1 kiegészítés hiányzik');
const addition=css.slice(marker);
assert.match(addition,/@media screen and \(max-width:768px\)\{/);
assert.match(addition,/@media screen and \(max-width:359px\)\{/);
assert.match(addition,/@media screen and \(max-width:768px\) and \(max-height:500px\)\{/);
assert.match(addition,/\.hub26-event-card/);
assert.match(addition,/\.doc26-item/);
assert.match(addition,/\.media26-album/);
assert.match(addition,/\.cs43-document-viewer \.cs43-paper/);
assert.match(addition,/justify-content:center!important/);
assert.match(addition,/overflow-wrap:anywhere!important/);
assert.match(addition,/overscroll-behavior-x:contain!important/);
assert.match(css,/html body #cs-release-notice\[hidden\]\{display:none!important\}/);
assert.match(css,/html body #site-header \.cs-mb-bar\{display:grid!important;[\s\S]*?62px minmax\(0,1fr\)/);
const registered=JSON.parse(fs.readFileSync(path.join(root,'json/structure.json'),'utf8'));
assert.ok(registered,'A tartalmi regiszter olvasható');
console.log(`M15.1 reszponzív kapu: ${screens.length} mobilméret és 769px desktop-határ, középre igazítás, kártyák, nézők, rövid kijelző OK (statikus)`);
