import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=relative=>readFileSync(path.join(root,relative),'utf8');
const css=read('css/card-centering-v1-40-1.css');
const html=read('index.html');
assert.match(css,/\.quick-grid,\.features-grid,\.cs-news-grid/,'A kezdőlapi kártyagyűjtemények is rendeződjenek');
assert.match(css,/\.cs92-information-grid,\.cs92-school-collection/,'A belső oldalak szerkesztett kártyái is rendeződjenek');
assert.match(css,/flex-wrap:wrap!important/,'A hiányos utolsó sorokhoz sortörés szükséges');
assert.match(css,/justify-content:center!important/,'Minden kártyasor vízszintesen középre igazodjon');
assert.match(css,/#app \.cs-portal-section \{/,'Az útmutatók háttérkerete kapjon belső térközt');
assert.match(css,/padding:clamp\(18px,2\.6vw,32px\)!important/,'A belső kártyák ne érjék a háttér szélét');
assert.match(css,/#app \.cs-portal-section \.cs-portal-grid/,'Az oktatási/sport kártyák külön is legyenek középen');
assert.match(html,/css\/card-centering-v1-40-1\.css\?v=1\.40\.1/,'A friss kártyastílus töltődjön be');
console.log('v1.40.1: kártyasorok vízszintes középre igazítása és portálkártyák belső térközei ellenőrizve.');
