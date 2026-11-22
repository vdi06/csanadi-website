/** Csanádi 1.44 – M22.1–M22.4 külön ellenőrzési kapuk. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {mobileSocialFallback} from '../mobile/reboot-shell-v1-43-29.js';
import {mobileMenuNeedsLayoutRefresh} from '../mobile/reboot-menu-v1-43-29.js';
import {mobileNextAvailableSlide} from '../mobile/reboot-hero-v1-43-29.js';
import {mobileActionIsVisible} from '../mobile/reboot-quality-v1-43-29.js';

const base=path.resolve(import.meta.dirname,'..');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
const run=name=>execFileSync(process.execPath,[path.join(base,'tools',name)],
 {stdio:'pipe',timeout:120000});

// M22.1: offline látható ikonok, adattári elsődlegesség, valós mobilfejléc.
assert.equal(mobileSocialFallback.length,2);
assert.ok(mobileSocialFallback.every(item=>item.url.startsWith('https://')));
assert.match(read('mobile/reboot-shell-v1-43-29.js'),/syncOverlay\(\)/);
run('verify-reboot-shell.mjs');run('verify-m18-header-layout.mjs');
run('verify-m18-legacy-header-isolation.mjs');
console.log('M22.1 PASS – mobil fejléc, offline social, menügomb ARIA-állapota');

// M22.2: az áttekintés hivatkozás fókusza képernyőváltáskor is megmarad.
assert.equal(mobileMenuNeedsLayoutRefresh(390,'grid',390,700),false);
assert.equal(mobileMenuNeedsLayoutRefresh(420,'grid',420,760),true);
run('verify-reboot-menu.mjs');run('verify-m17-desktop-hero-isolation.mjs');
console.log('M22.2 PASS – menüszint, áttekintés-fókusz, reszponzív váltás');

// M22.3: nem kezdhet üres képpel a mobilos kezdőlap.
assert.equal(mobileNextAvailableSlide(0,1,3,new Map([[0,Date.now()+30000]])),1);
assert.match(read('mobile/reboot-hero-v1-43-29.js'),/firstImageReady\.then\(ready=>\{if\(!ready\)recoverFirstImage\(\);\}\)/);
run('verify-reboot-hero.mjs');run('verify-m18-mobile-image-race.mjs');
console.log('M22.3 PASS – hibás első kép automatikus helyettesítése, lapozási védelmek');

// M22.4: a rejtett vezérlő nem kaphat fókuszt, az értesítés stabil marad.
assert.equal(mobileActionIsVisible({hidden:true}),false);
assert.equal(mobileActionIsVisible({getClientRects:()=>[]}),false);
run('verify-reboot-quality.mjs');run('verify-m21-notices.mjs');
run('verify-m13-mobile-text.mjs');run('verify-m13-viewer-dom.mjs');
run('verify-m12-content-coverage.mjs');run('verify-m17-cross-platform-surfaces.mjs');
run('verify-m16-desktop-boundary.mjs');
assert.match(read('index.html'),/reboot-design-v1-43-29\.css\?v=1\.44" media="screen and \(max-width: 768px\)"/);
assert.equal(JSON.parse(read('json/config.json')).performance.cacheVersion,'csanadi-r-v1.44');
assert.match(read('service-worker.js'),/RELEASE_ID='1\.44'/);
run('verify-v144-version.mjs');
console.log('M22.4 PASS – Bootstrap-fókusz, értesítések, aloldalak és desktop-határ');
