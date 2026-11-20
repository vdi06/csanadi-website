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
 release:'csanadi-website-v1.43.27-m18-2-mobile-single-row-scroll-fix-preview',
 date:'2026-11-20',
 notes:'V1.43.27 M18.2 mobilos újrajavítás. A korábbi kód külön KRÉTA sort és régi asztali kompakt képváltót tartott fenn. Mobilon egyetlen fejlécikonsor jelenik meg (Facebook, Instagram, KRÉTA mint K ikon, címer középen, keresés, téma); görgetéskor a régi fejléc minden közvetlen gyermeke és a desktop képváltó rejtve marad, újonnan létrejövő elem esetén is. Az eredeti inline és ARIA állapotok desktopon visszaállnak. A saját mobil filmes képváltó megmarad. Kizárólag a mobilfájlok kettője módosult érdemben; a közös belépési pontokon csak cache-verzió frissült. M18.2 DOM-, statikus, reszponzív és visszaállítási próbák; valós iOS/Android és pixelszintű ellenőrzés továbbra is NYITOTT. Nincs FTP- vagy GitHub-közzététel; v1.43.25 és v1.43.26 érintetlen.',
 files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en')))
};
fs.writeFileSync(path.join(base,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`${Object.keys(files).length} állomány új SHA-256 leltára készen`);
