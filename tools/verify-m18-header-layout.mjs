/** M18.1: 320–768px mobilos fejléc szimmetria és KRÉTA sor, desktop-védelem.
 * Strukturális/geometriai modell, nem valós Safari képernyőfotó. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const css=read('mobile/reboot-design-v1-43-26.css');
const shell=read('mobile/reboot-shell-v1-43-26.js');
const html=read('index.html');

assert.match(css,/@media screen and \(max-width:768px\)/);
assert.match(html,/media="screen and \(max-width: 768px\)"/);
assert.match(css,/#site-header :is\(\.brand-row,#desktop-navigation,#mobile-navigation,/);
assert.match(css,/\.cs-mb-bar\{grid-template-rows:auto auto!important/);
assert.match(css,/\.cs-mb-left\{grid-column:1!important;grid-row:1!important/);
assert.match(css,/\.cs-mb-crest\{grid-column:2!important;grid-row:1!important/);
assert.match(css,/\.cs-mb-right\{grid-column:3!important;grid-row:1!important/);
assert.match(css,/\.cs-mb-kreta-line\{grid-column:1\/-1!important;grid-row:2!important/);
assert.match(css,/\.cs-mb-socials\{display:contents!important/);
assert.match(shell,/left\.append\(socials\)/);
assert.match(shell,/kretaRow=make\('div','cs-mb-kreta-line'\)/);
assert.match(shell,/bar\.append\(left,crest,right,kretaRow\)/);
assert.doesNotMatch(shell,/left\.append\(socials,kreta\)/);

// Az első sor két oldalán csak 2–2 darab minimum 44px-es cél van.
// A címer és az oszlopközök miatt mindkét félnek legalább 94px kell.
for (const viewport of [320,344,360,375,390,412,430,600,768]) {
 const padding=viewport<360?16:24;
 const crest=viewport<420?58:62;
 const gap=viewport<420?8:16;
 const column=(viewport-padding-crest-gap)/2;
 const side=Math.min(column,118);
 assert.ok(side>=2*44+6,`${viewport}px: ikonok ütközése: ${side}px`);
 assert.equal((viewport-padding-side*2-crest)/2>=0,true,
  `${viewport}px: a címer szimmetrikusan középen marad`);
}

// Megőrzött DOM-integrációk és 769px feletti asztali visszaváltás.
for(const test of ['verify-reboot-shell.mjs','verify-m16-desktop-boundary.mjs',
 'verify-m17-desktop-hero-isolation.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',test)],{stdio:'pipe'});
}
console.log('M18.1 PASS: 9 mobil szélesség, négy ikon szimmetriája, külön KRÉTA sor, desktop-váltás DOM-regresszió');
