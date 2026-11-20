/** M18.2 – scroll alatt később aktivált régi fejléc és képváltó izolálása. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const mobile=read('mobile/reboot-design-v1-43-27.css');
const shell=read('mobile/reboot-shell-v1-43-27.js');
const old=read('js/release-v1-39-0.js');
const legacyCss=read('css/site-consistency-v1-42-17.css');

assert.match(legacyCss,/html body #site-header \.brand-row\s*\{[\s\S]*?display:flex!important/);
assert.match(old,/group\.id='cs-compact-hero-controls'/,
 'Régi görgetési képkapcsolót azonosítottunk');
assert.match(mobile,/@media screen and \(max-width:768px\)/);
assert.match(mobile,/#site-header#site-header > :not\(#cs-mobile-rebuild\)/);
assert.match(mobile,/#cs-compact-hero-controls/);
assert.match(mobile,/display:none!important;visibility:hidden!important;pointer-events:none!important/);
assert.match(mobile,/#global-hero :is\(\.csn26-edge-arrow/);
assert.match(mobile,/#global-hero \.cs-mb-film-arrow\{display:grid!important/,
 'A saját mobilos képváltó megmarad');
assert.match(shell,/const originalLegacy=new Map\(\)/);
assert.match(shell,/for\(const node of \[\.\.\.header\.children\]\)/);
assert.match(shell,/if\(node\.id==='cs-mobile-rebuild'\)continue/);
assert.match(shell,/originalLegacy\.set\(node,/);
assert.match(shell,/node\.style\.setProperty\('display','none','important'\)/);
assert.match(shell,/protectObserver\?\.observe\(header,\{childList:true\}\)/);
assert.match(shell,/originalLegacy\.clear\(\)/);
execFileSync(process.execPath,[path.join(root,'tools/verify-reboot-shell.mjs')],{stdio:'pipe'});
console.log('M18.2 PASS: régi fejléc és desktop képváltó rejtve; mobilos képváltó és desktop restore megmarad');
