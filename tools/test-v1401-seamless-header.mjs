import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=relative=>readFileSync(path.join(root,relative),'utf8');
const css=read('css/header-seamless-v1-40-1.css');
const html=read('index.html');

assert.match(css,/html\[data-theme="light"\]/,'Világos paletta szükséges');
assert.match(css,/html\[data-theme="dark"\]/,'Sötét paletta szükséges');
assert.match(css,/#site-header\s*\{[\s\S]*?background:var\(--cs-header-seamless-bg\)!important/,'A teljes fejléc kapjon egységes hátteret');
assert.match(css,/#site-header \.brand-row,[\s\S]*?background:transparent!important/,'A belső márkasornak nem lehet önálló háttere');
assert.match(css,/#site-header :is\(\.icon-btn,\.header-kreta,\.header-social \.social-chip\)/,'A menü akciógombjai ne különálló panelek legyenek');
assert.match(css,/border:0!important/,'A határvonalak eltüntetendők');
assert.match(css,/#cs39-mini-hero>\.cs39-mini-preview/,'A görgetés után megjelenő középső előnézet kerete is eltűnjön');
assert.match(html,/css\/header-seamless-v1-40-1\.css\?v=1\.40\.1/,'A fejlécjavítás betöltése kötelező');
console.log('v1.40.1: egységes világos és sötét fejléc, kontrasztos vezérlők és keretmentes görgetési előnézet ellenőrizve.');
