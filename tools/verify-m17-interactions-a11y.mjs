/** M17.3: mobilos használati folyamatok, ARIA és asztali erőforrás-visszaállás. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const quality=read('mobile/reboot-quality-v1-43-29.js');
const menu=read('mobile/reboot-menu-v1-43-29.js');
const app=read('js/app.js');
const css=read('mobile/reboot-design-v1-43-29.css');
assert.match(quality,/const changedImages=new Map\(\)/);
assert.match(quality,/for\(const image of changedImages\.keys\(\)\)restoreImage\(image\)/);
assert.match(quality,/image\.loading=prior\.loadingValue/);
assert.match(quality,/image\.decoding=prior\.decodingValue/);
assert.match(menu,/const focusSnapshot=/);
assert.match(app,/if\(e\.key==='Escape'&&!siteMap\.hidden\)/);
assert.match(app,/siteMapInertNodes\.push\(node\)/);
assert.match(css,/\.cs43-viewer \.modal-content\{[\s\S]*?height:100dvh/);
assert.match(css,/\.cs43-image-viewer \.cs43-photo-carousel\{touch-action:pan-y!important\}/);
for(const name of ['verify-reboot-menu.mjs','verify-reboot-hero.mjs',
 'verify-reboot-quality.mjs','verify-m13-viewer-dom.mjs',
 'verify-m15-interactions.mjs','verify-m15-a11y-performance.mjs',
 'verify-m15-pwa-release.mjs','verify-m16-a11y-performance.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',name)],{stdio:'pipe'});
}
console.log('M17.3 PASS: menü, képváltó, nézők, fókusz, erőforrások, témák és PWA (DOM/statikus)');
