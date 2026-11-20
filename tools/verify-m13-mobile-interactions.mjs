/** M13.2–M13.4: mobilmenü, saját nézők, témák és PWA forrásalapú védőkapui. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const base=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const menu=read('mobile/reboot-menu-v1-43-22.js');
const css=read('mobile/reboot-design-v1-43-22.css');
const quality=read('mobile/reboot-quality-v1-43-22.js');
const viewer=read('js/site-viewers-v1-43-3.js');
const network=read('js/round13-network.js');
const worker=read('service-worker.js');
const html=read('index.html');
const config=JSON.parse(read('json/config.json'));

assert.match(menu,/const a=make\('a',cls,getTitle\(item\)\),route=safeHref\(getHref\(item\)\)/);
assert.match(menu,/if\(route===\(window\.location\?\.hash\|\|'#\/'\)\)/,
 'Az aktuális útvonalat a hash-sel, nem az abszolút anchor.href értékkel kell egyeztetni');
assert.match(menu,/event\.key==='ArrowLeft'/);
assert.match(menu,/event\.key==='Backspace'/);
assert.match(menu,/if\(!isPhone\(\)\|\|!trail\.length/,
 'A mobilos menübillentyűk ne módosítsák a desktop működését');

for(const selector of ['.cs43-document-viewer .cs43-pdf-toolbar',
 '.cs43-image-viewer .modal-footer .me-auto','.cs43-image-viewer .cs43-gallery-caption',
 '.cs43-image-viewer .cs43-gallery-image','html[data-theme="light"] body .cs43-image-viewer']){
 assert.ok(css.includes(selector),'Hiányzó telefonos nézőstílus: '+selector);
}
assert.match(css,/\.cs43-image-viewer \.cs43-gallery-image\{[^}]*min-height:0!important/s,
 'A galériaképet ne vágja le a desktopból származó minimum-magasság');
assert.match(css,/\.cs43-document-viewer \.cs43-pdf-toolbar :is\([^)]*\)\{[^}]*min-height:44px!important/s);
assert.match(quality,/\.cs43-document-viewer \.cs43-paper/);
assert.match(quality,/\.cs43-image-viewer \.cs43-gallery-caption/);
assert.match(quality,/changedViewerLabels/);
assert.match(quality,/document\.addEventListener\('shown\.bs\.modal',schedule\)/);
assert.match(quality,/restoreViewerLabel\(node\)/);

// A meglévő Bootstrap/PDF.js komponens megmaradt, csak a mobilos felület szabályozza.
assert.match(viewer,/new window\.bootstrap\.Modal/);
assert.match(viewer,/PDF_LIB/);
assert.match(viewer,/touch: true, keyboard: true, wrap: true/);
assert.match(viewer,/trigger\.focus\(\{ preventScroll: true \}\)/);

assert.equal(config.performance.cacheVersion,'csanadi-r-v1.43.22');
assert.match(html,/reboot-design-v1-43-22\.css\?v=1\.43\.22/);
assert.match(worker,/const RELEASE_ID='1\.43\.22'/);
assert.match(worker,/\.\/mobile\/reboot-quality-v1-43-22\.js/);
assert.match(worker,/event\.data\?\.type==='ACTIVATE_UPDATE'/);
assert.match(network,/notice\(\)\.hidden=true/);
assert.match(network,/csanadi-accepted-release/);
assert.match(network,/controllerchange/);

// Kontraszt: alapszínek statikus ellenőrzése, nem helyettesíti a vizuális WCAG-próbát.
const channel=v=>{const c=parseInt(v,16)/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
const lum=hex=>{const h=hex.replace('#','');return .2126*channel(h.slice(0,2))+
 .7152*channel(h.slice(2,4))+.0722*channel(h.slice(4,6));};
const contrast=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05);};
assert.ok(contrast('#f6f1e9','#081b2e')>=4.5,'Sötét alapfelület szövegkontrasztja');
assert.ok(contrast('#20384b','#fffaf2')>=4.5,'Világos alapfelület szövegkontrasztja');

console.log('M13.2–M13.4 mobilmenü, saját nézők, témák, PWA-frissítés és alapkontraszt forráskapui OK');
