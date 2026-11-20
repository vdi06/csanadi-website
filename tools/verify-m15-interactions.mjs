/** M15.2 interakciós regresszió; valódi érintőkijelzős teszt még szükséges. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
for(const script of ['verify-reboot-menu.mjs','verify-reboot-hero.mjs',
 'verify-m13-viewer-dom.mjs']){
 const result=spawnSync(process.execPath,[path.join(root,'tools',script)],
  {encoding:'utf8',timeout:15000});
 assert.equal(result.status,0,`${script}: ${result.stderr||result.stdout}`);
}
const menu=fs.readFileSync(path.join(root,'mobile/reboot-menu-v1-43-21.js'),'utf8');
const hero=fs.readFileSync(path.join(root,'mobile/reboot-hero-v1-43-21.js'),'utf8');
assert.match(menu,/const renderKeepingFocus=/);
assert.match(menu,/const activeRoute=/);
assert.match(menu,/event\.key==='Home'/);
assert.match(menu,/event\.key==='End'/);
assert.match(menu,/event\.key==='ArrowDown'/);
assert.match(menu,/focusRoute:safeHref\(getHref\(previous\)\)/);
assert.match(hero,/event\.touches\.length!==1\)\{start=null;return;\}/);
assert.match(hero,/event\.changedTouches\[0\]\.identifier!==start\.id/);
assert.match(hero,/addEventListener\('touchmove'/);
assert.match(hero,/addEventListener\('touchcancel'/);
console.log('M15.2 interakciós kapu: három menüszint, átméretezési fókusz, Home/End, többujjas megszakítás és saját nézők DOM-próbája OK');
