/** M8: Bootstrap és mobil CSS kötései, témák, érintés és szűrt képnézegető. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const css=read('mobile/mobile-m8-components-v1-43-13.css');
const html=read('index.html');
const viewer=read('js/site-viewers-v1-43-3.js');
const media=read('js/media-gallery-h-2026.js');

for(const part of ['.btn-group','.accordion-button','.nav-tabs','.pagination','.doc-search-group',
 '.media26-albums','.media26-grid','.media26-sport-filters','.media26-video-grid',
 '.cs43-document-viewer','.cs43-image-viewer','.cs43-pdf-toolbar','.carousel-control-prev',
 'min-height:44px','min-height:100dvh','safe-area-inset-bottom','html[data-theme="light"]',
 'html[data-theme="dark"]','(prefers-reduced-motion:reduce)','(forced-colors:active)']){
 assert.ok(css.includes(part),`M8 mobilkomponens hiányzik: ${part}`);
}
const scopes=[...css.matchAll(/@media\s+[^{}]+\{/g)].map(m=>m[0]);
assert.ok(scopes.length>=4);
assert.ok(scopes.every(x=>/max-width:\s*(?:365|768)px/.test(x)), 'Asztali felületre nyíló M8 szabály');
assert.match(html,/mobile\/mobile-m8-components-v1-43-13\.css[^"\n]*" media="screen and \(max-width: 768px\)"/);
assert.match(viewer,/new window\.bootstrap\.Modal/);
assert.match(viewer,/window\.bootstrap\.Carousel\.getOrCreateInstance/);
assert.match(viewer,/modal-fullscreen-sm-down/);
assert.match(media,/Kizárólag az aktuális album\/sportág\/keresés szűrt képei kerülnek a Carousel-be/);
assert.match(media,/openImageViewer\(filtered,index/);
assert.equal([...css].reduce((n,ch)=>n+(ch==='{')-(ch==='}'),0),0);
console.log('M8 ellenőrzés: Bootstrap modal/carousel, 44px vezérlők, szűrt galéria, dokumentum, témák, mobil CSS OK');
