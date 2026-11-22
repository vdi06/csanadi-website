/** M18.3: Safari késleltetett képkocka / korai timeout versenyhelyzet. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const hero=fs.readFileSync(path.join(root,'mobile/reboot-hero-v1-43-29.js'),'utf8');
const css=fs.readFileSync(path.join(root,'mobile/reboot-design-v1-43-29.css'),'utf8');
const fallback='assets/media/web/responsive/bejarat-1600-640.webp';
assert.ok(fs.existsSync(path.join(root,fallback)),'A mobil képterület tartalékképe létezik');
assert.match(css,/\.cs-mb-film-stage\{[\s\S]*?bejarat-1600-640\.webp/,
 'A tartalékkép nem függhet a képváltó JS-től');
assert.match(hero,/root\.dataset\.csMbPlacement='home-hero-only'/);
assert.match(hero,/visible=rows\.some\(row=>row\.isIntersecting\)/);
assert.match(hero,/visible,hidden:document\.hidden/,
 'Kigörgetett képsávban az automatikus lapozás szünetel');
assert.match(css,/\.cs-mb-cinema\{display:block!important;[\s\S]*?position:relative!important/);
assert.match(css,/#global-hero :is\(\.cs-mb-film-info,\.cs-mb-film-panel,\.cs-mb-film-actions\)\{\s*position:static!important/);
assert.match(hero,/const outgoing=active/,'A kifutó kép az átmenet előtt rögzítendő');
assert.match(hero,/let finished=false,frameStarted=false/);
assert.match(hero,/if\(finished\)return/);
assert.match(hero,/outgoing\?\.classList\.add\('is-leaving'\)/);
assert.doesNotMatch(hero,/active\?\.classList\.add\('is-leaving'\)/,
 'A változó active nem kaphat elavult animációs osztályt');
assert.match(hero,/entering\.addEventListener\('transitionend'/);
assert.match(hero,/setTimeout\(finish,1500\)/);
assert.match(hero,/entering\.classList\.remove\('cs-mb-film-entering','is-visible','is-leaving'\)/);
execFileSync(process.execPath,[path.join(root,'tools/verify-reboot-hero.mjs')],{stdio:'pipe'});
console.log('M18.3 PASS: késleltetett rAF, idő előtt lefutó timeout és késői animáció nem rejtheti el az új képet');
