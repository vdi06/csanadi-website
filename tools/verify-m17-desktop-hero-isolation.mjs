/** M17.1 célzott P0 regresszió: asztalon tilos a második mobilos hero DOM. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const mobile=read('mobile/reboot-hero-v1-43-26.js');
const desktop=read('js/hero-2026.js');
assert.match(mobile,/const mount=document\.createDocumentFragment\(\)/);
assert.match(mobile,/const anchor=document\.createComment\(/);
assert.match(mobile,/if\(phone\.matches\)mount\.append\(root\)/);
assert.match(mobile,/if\(anchor\.parentNode&&root\.parentNode!==anchor\.parentNode\)anchor\.after\(root\)/);
assert.match(mobile,/else if\(root\.parentNode\)root\.remove\(\)/);
assert.match(mobile,/return mount;/);
assert.doesNotMatch(mobile,/return root;/,
 'A mobil hero nem térhet vissza közvetlenül DOM-elem formájában desktopon');
assert.match(desktop,/section\.append\(mobileLanding\)/,
 'A változatlan asztali kezdőlap az új, mobilfüggetlen horgonyt fogadja');
assert.match(read('index.html'),/media="screen and \(max-width: 768px\)"/);
for(const name of ['verify-reboot-hero.mjs','verify-reboot-shell.mjs',
 'verify-m16-desktop-boundary.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',name)],{stdio:'pipe'});
}
console.log('M17.1 P0 DOM-kapu PASS: asztalon csak eredeti képváltó, mobilról visszatérve sem marad második hero');
