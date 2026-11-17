'use strict';
// A v1.39.1 célzott regressziós kapuja; a régebbi, átfogó tesztek mellett fut.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));
let passed=0;
function test(label,fn){try{fn();passed++;}catch(e){throw new Error(label+': '+e.message,{cause:e});}}
test('Új JavaScript-modul bekötve',()=>{
 assert.match(read('script.js'),/release-v1-39-1\.js\?v=1\.39\.1/);
 assert.match(read('script.js'),/initV1391Enhancements\(\)/);
});
test('A javítóstílus a régi réteg után töltődik',()=>{
 const html=read('index.html');
 assert.ok(html.indexOf('liquid-glass-v1-39-0.css')<html.indexOf('corrections-v1-39-1.css'));
 assert.match(html,/script\.js\?v=1\.39\.(?:[123456789]|10|11)/);
});
test('A teljes főoldali felső egység együtt rögzül',()=>{
 const js=read('js/release-v1-39-1.js');
 const css=read('css/corrections-v1-39-1.css');
 assert.match(js,/shell\.append\(header,hero\)/);
 assert.match(css,/body\.cs-home-header #cs39-home-shell\s*\{[^}]*position:sticky/s);
 assert.match(css,/body\.cs-home-header\.cs-home-condensed #cs39-mini-hero\{display:flex\}/);
 assert.match(js,/hero\.inert=condensed/);
});
test('A mobilos aloldal animációja és címe látható',()=>{
 const js=read('js/release-v1-39-1.js');
 const css=read('css/corrections-v1-39-1.css');
 assert.match(js,/scene\.replaceChildren/);
 assert.match(js,/cs-subpage-ribbon-title/);
 assert.match(css,/#cs39-mobile-route:not\(\[hidden\]\)\s*\{[^}]*display:flex/s);
});
test('A 71 indexelt oldal publikált és szövegkereshető',()=>{
 const index=json('json/oldalindex.json');
 assert.ok(['1.39.1','1.39.3','1.39.9'].includes(index.searchIndexRevision));
 assert.equal(Object.keys(index.pages).length,71);
 for(const [file,page] of Object.entries(index.pages)){
  assert.equal(json('json/'+file).lifecycle.status,'published');
  assert.ok(page.searchText.length>20,file);
 }
});
test('A kereső egyesíti az index és a tényleges blokkok szövegét',()=>{
 const search=read('js/search-j-2026.js');
 assert.ok(search.includes('searchText'));
 assert.doesNotMatch(search,/searchText\s*\|\|\s*\w+blocks/);
});
test('Az FTP cache kiadási verziója egységes',()=>{
 const version=json('json/config.json').performance.cacheVersion;
 assert.match(version,/^csanadi-r-v1\.39\.(?:[123456789]|10|11)$/);
 assert.ok(read('index.html').includes('round13-network.js?v='+version));
});
console.log(JSON.stringify({version:'1.39.1',passed,total:7}));
