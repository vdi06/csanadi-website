'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {makeSearchText}=require('./build-search-index-v1-39-1.js');
const root=path.resolve(__dirname,'..');
const index=JSON.parse(fs.readFileSync(path.join(root,'json/oldalindex.json'),'utf8'));
let checked=0;
for(const [relative,entry] of Object.entries(index.pages)){
 const page=JSON.parse(fs.readFileSync(path.join(root,'json',relative),'utf8'));
 assert.equal(entry.id,page.id);
 assert.equal(page.lifecycle?.status,'published');
 assert.equal(entry.searchText,makeSearchText(page),'Hiányos vagy elavult index: '+relative);
 checked++;
}
// Konkrét, korábban hiányzó szavak a törzsszövegből.
for(const [file,word] of [
 ['oldalak/iskolank.json','önfegyelmet'],
 ['oldalak/sport.json','készségeket'],
 ['oldalak/informaciok/dokumentumtar.json','pedagógiai']
])assert.ok(index.pages[file]?.searchText.toLocaleLowerCase('hu-HU').includes(word),file+' – '+word);
assert.ok(['1.39.1','1.39.3','1.39.9'].includes(index.searchIndexRevision));
console.log(JSON.stringify({version:'1.39.1',pages:checked,fullTextCases:3,passed:checked+3},null,2));
