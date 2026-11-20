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
 release:'csanadi-website-v1.43.22-m16-mobile-stabilization-preview',
 date:'2026-11-20',
 notes:'V1.43.22 M16/D mobilos stabilizálás a változatlanul megőrzött jóváhagyott v1.43.21 alapján. M16.1: a mobil CSS nélküli desktop nézeten hibásan megjelenő, JS-ből létrehozott mobilfejléc lekapcsolása; mobilfilmszekció hidden állapota 769px felett; régi navigációs DOM megőrzése és 768px-es oda-vissza váltás szimulálása. M16.2: közvetlen menüoldal hivatkozás fókuszának megtartása mobil átméretezés és katalógusfrissítés után, a háromszintű menü működésének megőrzése. M16.3: a legördítéskor összehúzott, vizuálisan rejtett fejlécszövegek ARIA elrejtése és visszaállítása; reduced-motion, reflow, témák, nézők, billentyűzet regresszió. M16.4: frissítési értesítés és SW explicit aktiválás DOM-próba, csomag-leltár SHA-256 ellenőrzése, teljes ZIP, elkülönített visszaállítási próba és végső jóváhagyás. Asztali CSS, JS, média és tartalmi JSON byteazonos; közös runtime csak a kötelező verzió- és mobilfájlnév-hivatkozások miatt változik. A dokumentált, helyi TCP kapcsolatot tiltó jogosultsági korlát miatt a valódi Chrome/Safari, iOS/Android, fizikai gesztus, VoiceOver/TalkBack, pixelszintű render, CWV, PDF és online/offline PWA próba NYITOTT. Nincs FTP/GitHub közzététel; a v1.43.21 teljes csomag változatlanul megőrzött visszaállítási alap.',
 files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en')))
};
fs.writeFileSync(path.join(base,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`${Object.keys(files).length} állomány új SHA-256 leltára készen`);
