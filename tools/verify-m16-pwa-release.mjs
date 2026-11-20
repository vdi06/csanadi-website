/** M16.4: frissítés, service worker és ZIP-kiadás előtti határpróba. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
assert.match(read('index.html'),/reboot-design-v1-43-26\.css\?v=1\.43\.26" media="screen and \(max-width: 768px\)"/);
assert.match(read('service-worker.js'),/const RELEASE_ID='1\.43\.26'/);
assert.equal(JSON.parse(read('json/config.json')).performance.cacheVersion,'csanadi-r-v1.43.26');
assert.match(read('mobile/reboot-hero-v1-43-26.js'),/root\.hidden=!phone\.matches/);
for(const name of ['verify-m15-pwa-release.mjs','verify-m16-desktop-boundary.mjs',
 'verify-m14-mobile-ux.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',name)],{stdio:'pipe'});
}
console.log('M16.4 PASS: 1.43.26, CSS-határ, PWA-frissítés, SW és asztali DOM-védelem (szimulált)');
