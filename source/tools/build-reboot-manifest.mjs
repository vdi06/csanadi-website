/** Mechanikus ZIP-kiadásleltár: minden fájl bájtjának mérete és SHA-256 lenyomata. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const base=path.resolve(import.meta.dirname,'..');
const previous=JSON.parse(fs.readFileSync(path.join(base,'release-manifest.json'),'utf8'));
const files={};
function visit(root){
 for(const entry of fs.readdirSync(path.join(base,root),{withFileTypes:true})){
  const key=path.posix.join(root,entry.name);
  if(entry.isDirectory())visit(key);
  else if(entry.isFile()&&key!=='release-manifest.json'){
   const bytes=fs.readFileSync(path.join(base,key));
   files[key]={sizeBytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
  }
 }
}
visit('assets');visit('css');visit('desktop');visit('js');visit('json');
visit('mobile');visit('reports');visit('tools');
for(const item of ['index.html','script.js','service-worker.js','offline.html','robots.txt','sitemap.xml']){
 const bytes=fs.readFileSync(path.join(base,item));
 files[item]={sizeBytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
const manifest={...previous,
 release:'csanadi-website-1.51',
 date:'2026-11-22',
 notes:'1.51: a 79 JSON-oldalt megtartó, külön teljes kiadás. A szerkesztői műhely új fejléc-, főmenü- és lábléclapja élő JSON-előnézetet, ellenőrzött hivatkozás- és szövegszerkesztést, menüsorrend-módosítást és ZIP-munkapéldányba történő mentést kínál. A korábbi, kétjegyű verzióval inkompatibilis C4 ZIP-export és a reports/ állományok ZIP-ellenőrzése javítva. Az iPhone-képernyőképeken azonosított desktop nyitókép mobilos duplikációja megszűnt a CSS-specifikusság korrigálásával. Mobilon a görgetésre váró, láthatatlan kártyák azonnal látszanak, a képváltó kézi lapozás után kivár és minden diához helyes tartalékképet állít. 79 oldal/507 blokk JSON-integritásellenőrzés, mobilos DOM-próbák, ZIP CRC/SHA-256 és teljes állományleltár. Fizikai iPhone/Android újratesztelés még szükséges. Nincs FTP/GitHub-közzététel.',
 files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en')))
};
fs.writeFileSync(path.join(base,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`${Object.keys(files).length} állomány új SHA-256 leltára készen`);
