/** M21/D négy ellenőrzési kapu: mobilos regresszió + asztali határ. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {mobileHeaderScrolled} from '../mobile/reboot-shell-v1-43-29.js';
import {mobileMenuNeedsLayoutRefresh} from '../mobile/reboot-menu-v1-43-29.js';
import {mobileNextAvailableSlide} from '../mobile/reboot-hero-v1-43-29.js';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const test=file=>execFileSync(process.execPath,[path.join(root,'tools',file)],
 {stdio:'pipe',timeout:120000});

// M21.1: a virtuális képmagasság-változás valóban újraméri a fejlécet.
const shell=read('mobile/reboot-shell-v1-43-29.js');
assert.equal(mobileHeaderScrolled(36),false);
assert.equal(mobileHeaderScrolled(37),true);
assert.match(shell,/const remeasure=\(\)=>\{lastViewportWidth=-1;schedule\(\)\}/);
assert.match(shell,/typeof MutationObserver==='function'/);
test('verify-reboot-shell.mjs');test('verify-m18-header-layout.mjs');
test('verify-m18-legacy-header-isolation.mjs');
console.log('M21.1 PASS – viewport újramérés, fejléc, mobil–desktop átmenet');

// M21.2: menüszint és fókusz megőrzése azonos elrendezési állapotnál.
assert.equal(mobileMenuNeedsLayoutRefresh(390,'grid',390,720),false);
assert.equal(mobileMenuNeedsLayoutRefresh(420,'grid',420,760),true);
test('verify-reboot-menu.mjs');test('verify-m17-desktop-hero-isolation.mjs');
console.log('M21.2 PASS – menü újraépítés-korlát és billentyűfókusz');

// M21.3: hibás kép kivétel, későbbi újrapróba, nem beragadó nyilak.
assert.equal(mobileNextAvailableSlide(0,1,3,new Map([[1,999]]),100),2);
assert.equal(mobileNextAvailableSlide(0,1,3,new Map([[1,999]]),1000),1);
const hero=read('mobile/reboot-hero-v1-43-29.js');
assert.match(hero,/blockedUntil\.set\(to,Date\.now\(\)\+30000\)/);
test('verify-reboot-hero.mjs');test('verify-m18-mobile-image-race.mjs');
console.log('M21.3 PASS – hibás képek kihagyása és animáció biztonsága');

// M21.4: panel mutáció és az asztali DOM visszaállítása.
assert.match(read('mobile/reboot-quality-v1-43-29.js'),/noticeObserver\.observe\(panel,\{childList:true\}\)/);
test('verify-m21-notices.mjs');test('verify-reboot-quality.mjs');
test('verify-m13-mobile-text.mjs');test('verify-m13-viewer-dom.mjs');
test('verify-m12-content-coverage.mjs');test('verify-m17-cross-platform-surfaces.mjs');
test('verify-m16-desktop-boundary.mjs');
const html=read('index.html');
assert.match(html,/reboot-design-v1-43-29\.css\?v=1\.43\.33" media="screen and \(max-width: 768px\)"/);
assert.match(html,/round13-network\.js\?v=csanadi-r-v1\.43\.33/);
assert.equal(JSON.parse(read('json/config.json')).performance.cacheVersion,'csanadi-r-v1.43.33');
assert.match(read('service-worker.js'),/RELEASE_ID='1\.43\.33'/);
console.log('M21.4 PASS – dinamikus tájékoztatók, aloldalak, desktop-védelem, verzió');
