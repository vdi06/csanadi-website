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
 release:'csanadi-website-v1.43.26-m18-1-legacy-header-isolation-preview',
 date:'2026-11-20',
 notes:'V1.43.26 M18.1 második mobilos fejlécjavítás a felhasználó visszajelzése alapján: a hiba a v1.43.25 ZIP helyi tesztelésekor is fennmaradt. Konkrét ok: az eredeti fejlécre több korábbi !important CSS-deklaráció vonatkozik, amelyeket a mobilos elrejtés nem minden állapotban írt felül. A kizárólag mobilos új CSS erősebb specifitást használ; a mobil JS a régi fejlécsort inline important módon is kikapcsolja, asztali váltáskor az eredeti display/ARIA értékeket maradéktalanul visszaállítja. A v1.43.25 szimmetrikus ikonelrendezése és külön KRÉTA sora, valamint a korábbi mobilos funkciók megmaradnak. Desktop CSS, JS, médiaszerkesztés és JSON-tartalom változatlan. Külön M18.1 regressziós/desktop-visszaállítási próba, teljes ZIP, SHA-256 és visszabontott tesztek. A valós iOS/Android és pixelszintű teszt továbbra is NYITOTT, automata teszt nem bizonyítja. Nincs FTP- vagy GitHub-közzététel; v1.43.25 változatlanul megőrizve.',
 files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en')))
};
fs.writeFileSync(path.join(base,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`${Object.keys(files).length} állomány új SHA-256 leltára készen`);
