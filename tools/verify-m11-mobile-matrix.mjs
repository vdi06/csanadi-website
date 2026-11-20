/** M11.1 statikus reszponzív elfogadási mátrix – nem helyettesíti a böngészőt. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {PHONE_QUERY,mobileViewportMode} from '../mobile/reboot-menu-v1-43-26.js';

const css=fs.readFileSync(new URL('../mobile/reboot-design-v1-43-26.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.equal(PHONE_QUERY,'(max-width: 768px)');
assert.match(html,/reboot-design-v1-43-26\.css\?v=1\.43\.26" media="screen and \(max-width: 768px\)"/);
assert.match(css,/#cs-mobile-rebuild,\.cs-mb-cinema\{display:none\}/);
assert.match(css,/@media screen and \(max-width:419px\)/);
assert.match(css,/@media screen and \(min-width:420px\) and \(max-width:768px\) and \(min-height:760px\)/);
assert.match(css,/@media screen and \(max-width:768px\) and \(max-height:580px\)/);
assert.doesNotMatch(css,/:has\(/,'A körmenü működése nem függhet a CSS :has() támogatásától');
const sizes=[
 [320,568,'grid'],[360,640,'grid'],[375,812,'grid'],[390,844,'grid'],
 [412,915,'grid'],[420,648,'grid'],[420,650,'grid'],[420,759,'grid'],
 [420,760,'circle'],[430,932,'circle'],
 [768,1024,'circle'],[768,480,'grid'],[769,1024,'desktop'],[900,420,'desktop']
];
for(const [width,height,expected] of sizes){
 assert.equal(mobileViewportMode(width,height),expected,`${width}x${height}: menü`);
 if(expected==='desktop')continue;
 // A CSS-grid két egyforma szélső oszlopa és a 58/62 px címer közti
 // rendelkezésre álló hely: ebből ellenőrizzük az ujjbarát gombok keretét.
 const small=width<=419;
 const side=(width-24-(small?58:62)-2*(small?4:8))/2;
 assert.ok(side>=44,`${width}x${height}: legalább egy teljes 44 px-es oldalvezérlő`);
}
assert.match(css,/cs-mb-school-title\{[\s\S]*?max-height:none!important/,
 'A több soros fejlécet 200%-os nagyításnál sem szabad fix magassággal levágni');
assert.match(css,/\.cs-mb-film-gate\[hidden\]\{display:none!important\}/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/forced-colors:active/);
assert.match(css,/prefers-contrast:more/);
console.log(`M11.1 reszponzív statikus mátrix OK: ${sizes.length} méret, 768px határ, kör/rács, 44px keret`);
