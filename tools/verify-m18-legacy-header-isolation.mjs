/** M18.1 második javítási kapu: régi, !important-os fejléc kontra mobil újraépítés. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const mobile=read('mobile/reboot-design-v1-43-26.css');
const shell=read('mobile/reboot-shell-v1-43-26.js');
const old=read('css/site-consistency-v1-42-17.css');

// Ez az ütközés ténylegesen benne marad a változatlan desktop CSS-ben.
assert.match(old,/html body #site-header \.brand-row\s*\{[\s\S]*?display:flex!important/);
// Az új, kizárólag 768px alatt betöltött CSS két ID-vel felülírja a régi
// osztályszelektoros !important deklarációkat.
assert.match(mobile,/@media screen and \(max-width:768px\)/);
assert.match(mobile,/#site-header#site-header > \.brand-row,/);
assert.match(mobile,/#site-header#site-header > #desktop-navigation,/);
assert.match(mobile,/display:none!important;visibility:hidden!important;pointer-events:none!important/);
const html=read('index.html');
assert.match(html,/reboot-design-v1-43-26\.css\?v=1\.43\.26" media="screen and \(max-width: 768px\)"/);

// JS védelem: a régi sor inline !important rejtése; eredeti display és ARIA
// visszaállítása, ha a kijelző 769px-re vagy annál szélesebbre vált.
assert.match(shell,/const legacyRow=header\.querySelector\?\.\(':scope > \.brand-row'\)/);
assert.match(shell,/legacyRow\.style\.setProperty\('display','none','important'\)/);
assert.match(shell,/legacyRow\.style\.getPropertyPriority\('display'\)/);
assert.match(shell,/originalLegacy\.display/);
assert.match(shell,/originalLegacy\.aria/);
assert.match(shell,/protectLegacy\(mq\.matches\)/);
assert.match(shell,/attributeFilter:\['style','aria-hidden'\]/);
execFileSync(process.execPath,[path.join(root,'tools/verify-reboot-shell.mjs')],{stdio:'pipe'});
console.log('M18.1 régi–új fejléc izoláció PASS: erős mobil CSS, inline fontos rejtés, ARIA, desktop-visszaállítás');
