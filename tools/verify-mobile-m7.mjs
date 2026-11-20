/** M7: aloldali reszponzív réteg és a korábbi menü-szimmetria statikus ellenőrzése. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const css=readFileSync(new URL('../mobile/mobile-m7-subpages-v1-43-12.css',import.meta.url),'utf8');
const header=readFileSync(new URL('../mobile/mobile-m1-m2-foundation-v1-43-7.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const structure=JSON.parse(readFileSync(new URL('../json/structure.json',import.meta.url),'utf8'));

assert.match(css,/^\/\* M7\/D[^]*?@media screen and \(max-width:768px\)/);
for(const marker of ['.page-banner','.breadcrumbs','.content-shell','.content-tiles',
 '.cs92-article','.article-section','.cs-nav-detail-tiles','.table-responsive',
 'html[data-theme="light"]','(prefers-reduced-motion:reduce)','(forced-colors:active)']){
 assert.ok(css.includes(marker),`Hiányzó M7 szabály: ${marker}`);
}
assert.ok(css.includes('grid-template-columns:minmax(0,1fr)'), 'Hiányzó egyoszlopos mobil elrendezés');
assert.ok(header.includes('#mobile-menu-toggle')&&header.includes('display: none !important'), 'A régi menügomb rejtése hiányzik');
assert.ok(header.includes('#cs-subpage-menu'), 'A címeres menü elrendezése hiányzik');
assert.ok(html.includes('mobile-m7-subpages-v1-43-12.css'), 'Az új mobilstílus nincs betöltve');
assert.equal(structure.nodes.length,6);
assert.ok(existsSync(new URL('../mobile/mobile-m6-film-v1-43-11.js',import.meta.url)));
const braces=[...css].reduce((n,char)=>n+(char==='{')-(char==='}'),0);
assert.equal(braces,0,'Hibás CSS blokkzárás');
console.log('M7 statikus próba: 6 főmenü, mobilos témák, egyoszlopos aloldalak, navigáció, kontraszt/mozgás szabályok OK');
