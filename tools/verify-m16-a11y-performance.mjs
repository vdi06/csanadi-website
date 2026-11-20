/** M16.3: fejléc ARIA és korábbi mobilos reszponzív/terhelési kapu. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const shell=fs.readFileSync(path.join(root,'mobile/reboot-shell-v1-43-26.js'),'utf8');
assert.match(shell,/label\.setAttribute\('aria-hidden',state\)/);
assert.match(shell,/subtitle\.setAttribute\('aria-hidden',state\)/);
assert.match(shell,/label\.removeAttribute\('aria-hidden'\)/);
for(const name of ['verify-reboot-shell.mjs','verify-reboot-quality.mjs',
 'verify-m15-a11y-performance.mjs','verify-m15-responsive.mjs',
 'verify-m13-mobile-text.mjs','verify-m12-content-coverage.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',name)],{stdio:'pipe'});
}
console.log('M16.3 PASS: fejléc felolvasási állapota, fény/sötét, reflow, reduced-motion (DOM/statikus)');
