/** A JSON-ban megtekinthetőnek jelölt dokumentumok mind valódi helyi fájlok legyenek. */
import { readFileSync, existsSync } from 'node:fs';
import { resolve,join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { checkedDocumentCenter } from '../shared/js/document-data.js?v=2.40';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const config=JSON.parse(readFileSync(join(root,'shared/data/site.json'),'utf8'));
const doc=checkedDocumentCenter(config);
const underDocs=resolve(root,'shared/assets/documents');
let files=0,pages=0;
function localFile(path){
  assert.match(path,/^\.\/shared\/assets\/documents\//);
  const local=resolve(root,path.slice(2));
  assert.ok(local.startsWith(underDocs+'/'),'Nem helyi dokumentumútvonal');
  assert.ok(existsSync(local),`Nem létező dokumentum: ${path}`);
  return readFileSync(local);
}
for(const item of doc.items){
  if(item.status==='pending'){
    assert.ok(!item.file && !item.pages,'Feltöltés nélküli tételt nem lehet közzétettként jelölni.');
    continue;
  }
  const buffer=localFile(item.file);
  files++;
  assert.ok(buffer.byteLength>20,'Üres dokumentum');
  if(item.kind==='pdf'){
    assert.equal(buffer.subarray(0,5).toString(),'%PDF-');
    for(const preview of item.pages||[]){
      const contents=localFile(preview);
      assert.ok(contents.length>50,'Sérült előnézet');
      pages++;
    }
  }
}
console.log(`Dokumentumok ellenőrizve: ${files} fájl, ${pages} előnézeti oldal, ${doc.items.length} nyilvántartott tétel.`);
