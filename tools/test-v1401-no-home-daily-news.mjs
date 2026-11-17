import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=relative=>readFileSync(path.join(root,relative),'utf8');
const app=read('js/app.js');
const homepage=JSON.parse(read('json/oldalak/kezdolap.json'));
const config=JSON.parse(read('json/config.json'));
const index=read('index.html');
const entry=read('script.js');

assert.doesNotMatch(app,/renderDailySportsNews\(['"]home['"]\)/,'A kezdőlap nem jelenítheti meg a Napi sporthírek modult');
assert.doesNotMatch(app,/place\([^\n]*['"]sports-news['"]\)/,'A kezdőlap nem hozhat létre sporthírszekciót');
assert.doesNotMatch(app,/visibleRoles=[^\n]*['"]sports-news['"]/,'Az elrendezés ne tartson fenn helyet a kivett szekciónak');
assert.match(app,/renderDailySportsNews\(['"]full['"]\)/,'Az önálló Sporthírek oldal egyelőre megmarad');
assert.ok(homepage.lifecycle.revision>=8,'A kezdőlap újabb revíziója megőrizze a törlést');
assert.match(config.performance.cacheVersion,/^csanadi-r-v1\.40\./,'Az újabb kiadás cache-azonosítója');
assert.match(index,/script\.js\?v=1\.40\./,'Az új alkalmazáskódot kell betölteni');
assert.match(entry,/\.\/js\/app\.js\?v=1\.40\./,'Az új kezdőlaplogikát kell betölteni');

console.log('v1.40.1: a Napi sporthírek eltűnt a kezdőlapról; a külön Sporthírek oldal és a többi blokk megmaradt.');
