/** v1.43.32 M20.1–M20.4: célzott, asztali funkciókat nem módosító kapuk. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {mobileHeaderScrolled} from '../mobile/reboot-shell-v1-43-29.js';
import {mobileAutoPlayAllowed} from '../mobile/reboot-hero-v1-43-29.js';
import {mobileResourceProfile} from '../mobile/reboot-quality-v1-43-29.js';

const root=path.resolve(import.meta.dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const run=file=>execFileSync(process.execPath,[path.join(root,'tools',file)],{stdio:'pipe',timeout:90000});
const css=read('mobile/reboot-design-v1-43-29.css');
const shell=read('mobile/reboot-shell-v1-43-29.js');
const hero=read('mobile/reboot-hero-v1-43-29.js');
const quality=read('mobile/reboot-quality-v1-43-29.js');

// M20.1: scroll threshold, URL-bar-height és billentyűzet változás.
assert.equal(mobileHeaderScrolled(0),false);
assert.equal(mobileHeaderScrolled(36),false);
assert.equal(mobileHeaderScrolled(37),true);
assert.equal(mobileHeaderScrolled(120),true);
assert.match(shell,/visualViewport\?\.addEventListener\?\.\('resize',schedule/);
assert.match(shell,/addEventListener\('pageshow',schedule/);
assert.match(css,/#cs-mobile-rebuild :is\(\.cs-mb-social,\.cs-mb-tool,\.cs-mb-crest\):focus-visible/);
run('verify-reboot-shell.mjs');
run('verify-m18-header-layout.mjs');
run('verify-m18-legacy-header-isolation.mjs');
console.log('M20.1 PASS – fejléc/töréspont, billentyűzet-viewport és fókuszjelölés');

// M20.2: a nem feloldódó képdekódolás sem fagyasztja le a nyilakat.
assert.equal(mobileAutoPlayAllowed({visible:true}),true);
assert.equal(mobileAutoPlayAllowed({visible:false}),false);
assert.match(hero,/async function waitForDecoded/);
assert.match(hero,/Promise\.race/);
assert.match(hero,/clearTimeout\(timer\)/);
assert.match(hero,/stage\.removeAttribute\('aria-busy'\)/);
assert.match(hero,/IntersectionObserver/);
run('verify-reboot-hero.mjs');
run('verify-m18-mobile-image-race.mjs');
console.log('M20.2 PASS – képváltó időkorlát és offscreen viselkedés');

// M20.3: aloldali olvashatóság, rejtett tartalom fókuszának visszaállítása.
assert.match(quality,/event\.key!=='Escape'/);
assert.match(quality,/control\.focus\(\{preventScroll:true\}\)/);
assert.match(quality,/setOpen\(retainFocus\)/);
assert.match(css,/\.ext26-list/);
assert.match(css,/\.ext26-perf-grid/);
run('verify-reboot-quality.mjs');
run('verify-m13-mobile-text.mjs');
run('verify-m13-viewer-dom.mjs');
run('verify-m17-cross-platform-surfaces.mjs');
console.log('M20.3 PASS – mobilos szöveg, panel, kártya, néző/fókusz');

// M20.4: csak mobilon csökkentett effektus; frissítésjelzés nem téves.
assert.deepEqual(mobileResourceProfile({mobile:true,motion:true}),{active:true,limited:false,quiet:true});
assert.deepEqual(mobileResourceProfile({mobile:false,saveData:true}),{active:false,limited:false,quiet:false});
assert.match(css,/html\[data-cs-mb-quiet\] body #site-header/);
assert.match(css,/backdrop-filter:none!important/);
assert.match(read('index.html'),/round13-network\.js\?v=csanadi-r-v1\.43\.32/);
assert.equal(JSON.parse(read('json/config.json')).performance.cacheVersion,'csanadi-r-v1.43.32');
assert.match(read('service-worker.js'),/RELEASE_ID='1\.43\.32'/);
assert.match(read('script.js'),/reboot-shell-v1-43-29\.js\?v=1\.43\.32/);
assert.match(read('script.js'),/reboot-quality-v1-43-29\.js\?v=1\.43\.32/);
assert.match(read('js/hero-2026.js'),/reboot-hero-v1-43-29\.js\?v=1\.43\.32/);
run('verify-m16-desktop-boundary.mjs');
run('verify-m17-desktop-hero-isolation.mjs');
console.log('M20.4 PASS – alacsony terhelés, közös cache-azonosító, asztali határ');
