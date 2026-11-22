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
 release:'csanadi-website-1.45',
 date:'2026-11-22',
 notes:'1.45: célzott működési, mobil/desktop, reszponzív, akadálymentességi és vizuális javítások az 1.44 változatlan megőrzésével. Közösségi linkek hibatűrő forráskezelése, több hibás mobilnyitókép átugrása, fókusz és modális ablakok javítása, 1.45-re frissített cache-hivatkozások, két- és háromtagú offline verziók migrációja, új kis képernyős/kontraszt/fókusz stíluslap. Célzott DOM- és integritási ellenőrzések, SHA-256 leltár; FTP/GitHub közzététel nem történt. A teljes fizikai iPhone/Android és minden aloldal valamennyi interakciójának böngészős ellenőrzése nyitott.',
 files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en')))
};
fs.writeFileSync(path.join(base,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`${Object.keys(files).length} állomány új SHA-256 leltára készen`);
