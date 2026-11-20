/** M15.3 mobil hozzáférhetőségi és terhelési forráskapu; nem WCAG-audit vagy CWV-mérés. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const css=fs.readFileSync(path.join(root,'mobile/reboot-design-v1-43-22.css'),'utf8');
const quality=fs.readFileSync(path.join(root,'mobile/reboot-quality-v1-43-22.js'),'utf8');
const shell=fs.readFileSync(path.join(root,'mobile/reboot-shell-v1-43-22.js'),'utf8');
const menu=fs.readFileSync(path.join(root,'mobile/reboot-menu-v1-43-22.js'),'utf8');
const child=spawnSync(process.execPath,[path.join(root,'tools/verify-reboot-quality.mjs')],
 {encoding:'utf8',timeout:15000});
assert.equal(child.status,0,child.stderr||child.stdout);
for(const marker of ['prefers-reduced-motion:reduce','prefers-contrast:more',
 'forced-colors:active','focus-visible','min-height:44px!important',
 'env(safe-area-inset-bottom,0px)'])assert.ok(css.includes(marker),marker);
assert.match(quality,/if\(mode\.quiet\)for\(const video/);
assert.match(quality,/window\.visualViewport\?\.addEventListener\?\./);
assert.match(quality,/window\.addEventListener\('pageshow',schedule/);
assert.match(shell,/aria-expanded/);
assert.match(shell,/aria-live/);
assert.match(menu,/aria-current/);
const channel=x=>{const value=parseInt(x,16)/255;return value<=.04045?
 value/12.92:((value+.055)/1.055)**2.4;};
const luminance=hex=>{const h=hex.replace('#','');return .2126*channel(h.slice(0,2))+
 .7152*channel(h.slice(2,4))+.0722*channel(h.slice(4,6));};
const contrast=(a,b)=>{const high=Math.max(luminance(a),luminance(b));
 const low=Math.min(luminance(a),luminance(b));return(high+.05)/(low+.05);};
for(const [foreground,background,label] of [
 ['#f6f1e9','#081b2e','sötét alapszöveg'],
 ['#20384b','#fffaf2','világos alapszöveg'],
 ['#20384b','#f4e6c9','világos frissítésgomb'],
 ['#102c49','#e7c17d','sötét frissítésgomb']]){
 assert.ok(contrast(foreground,background)>=4.5,`${label} 4,5:1`);
}
console.log('M15.3 akadálymentes és kímélő mobilforrás kapu: fókusz, 44px, témakontraszt, csökkentett mozgás, BFCache OK; valódi WCAG/CWV mérés nyitott');
