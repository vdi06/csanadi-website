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
 release:'csanadi-website-v1.43.21-m15-mobile-validation-preview',
 date:'2026-11-20',
 notes:'V1.43.21 M15/D mobilos validációs és célzott finomítási előnézet a jóváhagyott v1.43.20 alapján. M15.1: 320–768 px-es reszponzív kártya-, szűrő- és nézőtördelés, 359px alatt egysávos galéria és rövid kijelzős menügörgetés; 769px asztali kontroll. M15.2: mobilmenü Home/End/fel-le navigáció, fókusz megtartása átméretezés és katalógusfrissítés után; többujjas és eltérő azonosítójú érintések kizárása a képváltóból. M15.3: csökkentett mozgásnál videó-autoplay leállítása, oldaltájolás/visualViewport/BFCache frissítés, alapkontraszt és érintési célpontok statikus ellenőrzése. M15.4: frissítési értesítés DOM-szimulációja és explicit SW aktiválás tesztje, regresszió, teljes SHA-256 leltár, ZIP és külön kicsomagolási próba. 78 oldal, 254 blokk, minden korábbi M1–M14 mobilfunkció megőrzendő. Valódi iOS/Android, képernyőolvasó, PDF render, Core Web Vitals és online/offline PWA-frissítés a korábban dokumentált böngésző-környezetkorlát miatt NYITOTT, statikus/DOM-próbák nem helyettesítik. Asztali fájlok és tartalmak byte-azonosak, közös belépési pontokban csak kötelező verzióhivatkozások módosultak. FTP/GitHub közzététel nincs; v1.43.20 ZIP változatlan visszaállítási alap.',
 files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en')))
};
fs.writeFileSync(path.join(base,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`${Object.keys(files).length} állomány új SHA-256 leltára készen`);
