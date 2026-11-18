/* A statikus kiadási csomag reprodukálható SHA-256 állományjegyzéke. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const excluded=new Set(['release-manifest.json','tools/migrate-old-links.js','tools/remove-obsolete-qr.js']);
const files={};
function walk(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.name==='.git')continue;
  const abs=path.join(dir,entry.name);
  if(entry.isDirectory()){walk(abs);continue;}
  const rel=path.relative(root,abs).split(path.sep).join('/');
  if(excluded.has(rel))continue;
  const bytes=fs.readFileSync(abs);
  files[rel]={sizeBytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
 }
}
walk(root);
const manifest={schemaVersion:'1.0.0',release:'csanadi-website-v1.40.5',date:'2026-11-18',ftpCompatible:true,
 bootstrap:'CDN bootstrap@5.3.9',notes:'v1.40.5 I+J+K+L: új, önkéntes intézményi bizonyítékmezőket és SHA-256 képfeldolgozást tartalmazó fotó-jóváhagyási munkalap; ugyanazon eredetű beágyazott 320/390/768 CSS px mobil- és ARIA QA keret; a tools/ segédoldalak közös prémium navigációja, akadálymentes fókusz- és kis kijelzős finomítása; teljes, 71 oldalas szerkezeti/tartalmi/keresési minőségellenőrzés és 10 hibás kezdőképes hivatkozás helyreállítása. Külön intézményi engedélyezett fotófájl nem áll rendelkezésre, ezért tényleges képregisztráció és nyilvános képjóváhagyás nem történt. A valós képernyőolvasós és fizikai telefonos kézi ellenőrzés továbbra is külön feladat. Minden korábbi nyilvános funkció, 71 oldal, 769 asset, 174 médiatári tétel és 30 kezdőkép megmarad. Az egész csomag kizárólag statikus fájlokat használ, Bootstrap a verzióhoz kötött CDN-ről érkezik. Nem történt GitHub- vagy FTP-publikálás.',files};
fs.writeFileSync(path.join(root,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files:Object.keys(files).length,release:manifest.release}));
