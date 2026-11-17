import assert from 'node:assert/strict';
import {createZip} from './zip-native-2026.js';

const data=new Map([
 ['assets/documents/teszt.pdf',new TextEncoder().encode('%PDF-1.4\nhelyi teszt')],
 ['json/assets-inventory.json','{"items":[]}\n'],
 ['tools/mediatar-torlesi-jegyzek.json','{"deleted":[]}\n']
]);
const archive=new Uint8Array(await (await createZip(data)).arrayBuffer());
const view=new DataView(archive.buffer,archive.byteOffset,archive.byteLength);
const decoded=new Map();let position=0;
while(view.getUint32(position,true)===0x04034b50){
 const nameLength=view.getUint16(position+26,true);
 const extraLength=view.getUint16(position+28,true);
 const length=view.getUint32(position+18,true);
 const name=new TextDecoder().decode(archive.subarray(position+30,position+30+nameLength));
 const start=position+30+nameLength+extraLength;
 decoded.set(name,archive.subarray(start,start+length));
 position=start+length;
}
assert.equal(decoded.size,data.size);
for(const [name,body] of data){
 assert.ok(decoded.has(name),name);
 assert.deepEqual([...decoded.get(name)],[...(typeof body==='string'?new TextEncoder().encode(body):body)]);
}
assert.equal(view.getUint32(position,true),0x02014b50,'ZIP központi fájljegyzék');
await assert.rejects(createZip(new Map([['../secret.txt','nem megengedett']])),/Nem megfelelő ZIP-útvonal/);
console.log(JSON.stringify({version:'1.39.4',checks:5,passed:5,archiveBytes:archive.length}));
