/** M18.2 – szimmetrikus EGY sor, szélességi számítás, desktop védelme. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const css=read('mobile/reboot-design-v1-43-29.css');
const shell=read('mobile/reboot-shell-v1-43-29.js');
const html=read('index.html');

assert.match(css,/@media screen and \(max-width:768px\)/);
assert.match(html,/media="screen and \(max-width: 768px\)"/);
assert.match(css,/\.cs-mb-bar\{grid-template-rows:auto!important/);
assert.match(css,/\.cs-mb-left\{grid-column:1!important;grid-row:1!important/);
assert.match(css,/\.cs-mb-crest\{grid-column:2!important;grid-row:1!important/);
assert.match(css,/\.cs-mb-right\{grid-column:3!important;grid-row:1!important/);
assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
assert.match(css,/\.cs-mb-right\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(css,/\.cs-mb-socials\{display:contents!important/);
assert.match(shell,/left\.append\(socials,kreta\)/);
assert.match(shell,/bar\.append\(left,crest,right\)/);
assert.match(shell,/glyph:'K'/);
assert.doesNotMatch(shell,/cs-mb-kreta-line/);
assert.doesNotMatch(css,/cs-mb-kreta-line/);

for(const viewport of [320,344,360,375,390,412,430,600,768]){
 const padding=viewport<360?16:24;
 const crest=viewport<420?58:62;
 const gap=viewport<360?6:viewport<420?8:16;
 const side=(viewport-padding-crest-gap)/2;
 const iconLeft=(side-6)/3;
 const iconRight=(side-3)/2;
 assert.ok(iconLeft>=35,`${viewport}px: három bal oldali ikon nem fér el: ${iconLeft}`);
 assert.ok(iconRight>=44,`${viewport}px: két jobb oldali ikon nem fér el: ${iconRight}`);
}
for(const test of ['verify-reboot-shell.mjs','verify-m16-desktop-boundary.mjs',
 'verify-m17-desktop-hero-isolation.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',test)],{stdio:'pipe'});
}
console.log('M18.2 PASS: 9 mobilszélesség, egy ikonsor, ikon-KRÉTA, középső címer, desktop-átmenet');
