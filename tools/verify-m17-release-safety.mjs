/** M17.4: verzió, SHA-leltár, mobilos kapuk és a desktop-határ ellenőrzése. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const files=JSON.parse(read('release-manifest.json'));
assert.equal(files.release,'csanadi-website-v1.43.29-m19-full-code-audit-preview');
assert.equal(JSON.parse(read('json/config.json')).performance.cacheVersion,'csanadi-r-v1.43.29');
assert.match(read('service-worker.js'),/const RELEASE_ID='1\.43\.29'/);
assert.match(read('index.html'),/reboot-design-v1-43-29\.css\?v=1\.43\.29/);
const current=Object.keys(files.files).filter(file=>file.startsWith('mobile/'));
assert.equal(current.length,5,'Csak az öt jóváhagyott új mobilmodul csomagolható');
assert.ok(current.every(file=>file.includes('v1-43-29')));
assert.match(read('mobile/reboot-hero-v1-43-29.js'),/createDocumentFragment/,
 'A jóváhagyott M17.1 dupla hero elleni védelem nem veszhet el');
for(const name of ['verify-m18-mobile-image-race.mjs',
 'verify-v14329-code-audit.mjs','verify-v14329-desktop-hero-recovery.mjs',
 'verify-m18-legacy-header-isolation.mjs','verify-m18-header-layout.mjs',
 'verify-m17-responsive-visual.mjs','verify-m17-interactions-a11y.mjs',
 'verify-m17-cross-platform-surfaces.mjs',
 'verify-m17-desktop-hero-isolation.mjs','verify-reboot-release.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',name)],{stdio:'pipe'});
}
console.log(`M17.4 PASS: v1.43.29, ${Object.keys(files.files).length} SHA-256 fájl, minden kapu és desktop-határ`);
