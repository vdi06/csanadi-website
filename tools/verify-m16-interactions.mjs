/** M16.2: a közvetlen mobil oldallink és a meglévő menü/nézők interakciós kapuja. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const menu=fs.readFileSync(path.join(root,'mobile/reboot-menu-v1-43-27.js'),'utf8');
assert.match(menu,/a\.dataset\.csMbRoute=route/);
assert.match(menu,/focusSnapshot\(\)/);
assert.match(menu,/focusRole='main'/);
assert.match(menu,/focusRole==='direct'/);
for(const name of ['verify-reboot-menu.mjs','verify-reboot-hero.mjs',
 'verify-m15-interactions.mjs','verify-m13-viewer-dom.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',name)],{stdio:'pipe'});
}
console.log('M16.2 PASS: közvetlen oldallink fókusza és előző menü/kép/néző regresszió (DOM)');
