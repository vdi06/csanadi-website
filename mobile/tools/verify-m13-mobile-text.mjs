/** M13.1–M13.4: a telefonos szövegek ne legyenek fix magasság/ellipsis miatt levágva. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const base=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const css=read('mobile/reboot-design-v1-43-29.css');
const shell=read('mobile/reboot-shell-v1-43-29.js');

assert.match(css,/@media screen and \(max-width:768px\)/);
assert.match(css,/\.cs-mb-school-title\{[^}]*max-height:none!important;opacity:1!important;overflow:visible!important/s,
 'A teljes iskolanév soha nem lehet fix magasság miatt levágva');
assert.match(css,/\.cs-mb-motto\{[^}]*max-height:none!important;overflow:visible!important/s,
 'A mottó szabadon több sorba törhet');
assert.match(css,/\[data-cs-mb-scrolled="true"\][^{]*\{[^}]*max-height:0!important;opacity:0!important;overflow:hidden!important/s,
 'Csak a ténylegesen összecsukott fejléc rejtse el a címet');
for(const target of ['.cs-mb-menu-card-main','.home-j-fold-toggle','.card-title',
 '.accordion-button','.nav-link','.badge','.btn','.modal-title','.search-result']){
 assert.ok(css.includes(target),'Mobil szöveg illeszkedési hiány: '+target);
}
assert.match(css,/white-space:normal!important;[^}]*overflow-wrap:anywhere!important/s);
assert.match(css,/\.text-truncate,\.text-nowrap,\.line-clamp/,
 'Bootstrap és saját ellipsis ne vágja el a mobilos szövegeket');
assert.match(css,/\.cs-mb-menu-card-main[^}]*\{[^}]*min-width:0!important/s);
assert.match(css,/#app pre\{overflow-x:auto!important;white-space:pre!important\}/,
 'A kódblokkok megőrzik a szemantikus sortörést és saját görgetést');
assert.match(shell,/typeof ResizeObserver==='function'/,
 'A későn átrendeződő többsoros fejléc magasságát újra kell mérni');
assert.match(shell,/observer\.observe\(shell\)/);

const structure=JSON.parse(read('json/structure.json'));
let count=0;let maxTitle=0;
const audit=items=>items.forEach(item=>{
 const page=JSON.parse(read('json/'+item.path));
 count++;maxTitle=Math.max(maxTitle,page.title.length);
 audit(item.children||[]);
});
audit(structure.nodes);
assert.equal(count,78,'Az ismert 78 aloldalt meg kell őrizni');
console.log('M13 mobil szövegillesztési szabályok OK:',count,
 'aloldal, leghosszabb oldalcím',maxTitle,'karakter; valós böngészős renderelés külön ellenőrizendő');
