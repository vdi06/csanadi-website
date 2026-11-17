import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=relative=>readFileSync(path.join(root,relative),'utf8');
const subpages=read('js/subpages-v1.js');
const css=read('css/subpage-centered-v1-40-1.css');
const html=read('index.html');
const entry=read('script.js');
assert.doesNotMatch(subpages,/root\.append\(track,shade,caption\)/,'A fejléc ne tartalmazzon a képre írt címet');
assert.doesNotMatch(subpages,/className=['"]cs-sub-hero-caption['"]/,'A képre tett külön felirat szűnjön meg');
assert.match(subpages,/root\.append\(track\)/,'Az aloldali kép megmaradjon');
assert.match(css,/body\.cs-inner-page #app \.page-banner :is\(h1,p\)/,'A cím és bevezető legyen középen');
assert.match(css,/body\.cs-inner-page #app \.cs92-article \.article-section/,'A szakaszok is középre kerüljenek');
assert.match(html,/css\/subpage-centered-v1-40-1\.css\?v=1\.40\.1/,'Az új stílus töltődjön be');
assert.match(entry,/subpages-v1\.js\?v=1\.40\./,'Az újabb kiadások továbbra is frissítsék az aloldali képkódot');
console.log('v1.40.1: aloldali képek felirat nélkül, oldalcímek és szöveges szakaszok középen.');
