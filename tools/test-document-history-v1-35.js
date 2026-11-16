'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'json/adatok/dokumentumok.json'),'utf8'));
const source=fs.readFileSync(path.join(root,'js/documents.js'),'utf8');
assert.match(source,/cleanText\(v\.change,5,500\)/);
let versions=0;
for(const doc of data.documents){
 assert.ok(Array.isArray(doc.versionHistory)&&doc.versionHistory.length,'Hiányzó előzmény: '+doc.id);
 for(const v of doc.versionHistory){
  assert.match(v.version,/^\d+\.\d+\.\d+$/,'Verzió: '+doc.id);
  assert.match(v.date,/^\d{4}-\d{2}-\d{2}$/,'Dátum: '+doc.id);
  assert.ok(v.change.trim().length>=5&&v.change.length<=500,'Túl hosszú/rövid változásleírás: '+doc.id+' '+v.version+' ('+v.change.length+')');
  assert.deepEqual(Object.keys(v).sort(),['change','date','version'],'Váratlan mező: '+doc.id);
  versions++;
 }
 assert.equal(doc.versionHistory.at(-1).version,doc.version,'Verzióeltérés: '+doc.id);
}
console.log(JSON.stringify({release:'1.35.0',documents:data.documents.length,historyVersions:versions,passed:true}));
