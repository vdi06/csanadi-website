/** Teljes statikus FTP-csomag: előállítás és visszaolvasás ugyanazzal a
    CRC32/SHA-256 ellenőrzővel, amit a böngészős szerkesztő használ. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createZip} from '../js/zip-native-2026.js';
import {readVerifiedZip} from '../js/zip-integrity-v1-42-26.js';
const root=path.resolve(import.meta.dirname,'..');
const release=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8'));
assert.equal(release.release,'csanadi-website-1.51');
const entries=new Map();
for(const filename of Object.keys(release.files)){
 entries.set(filename,new Uint8Array(fs.readFileSync(path.join(root,filename))));
}
entries.set('release-manifest.json',new Uint8Array(fs.readFileSync(path.join(root,'release-manifest.json'))));
const zip=await createZip(entries);
const verification=await readVerifiedZip(zip,{expectedRelease:release.release});
assert.equal(verification.count,entries.size);
assert.ok(verification.bytesVerified>20000000,'A teljes, nem részleges csomag lett ellenőrizve');
const target=process.argv[2];
if(target){
 const output=path.resolve(target);
 assert.equal(path.extname(output),'.zip','Csak ZIP-célállomány megengedett');
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,new Uint8Array(await zip.arrayBuffer()));
 console.log('Elkészült:',output);
}
console.log(`Teljes ZIP PASS – ${verification.count} állomány · ${(zip.size/1048576).toFixed(1)} MiB · CRC32 + SHA-256`);
