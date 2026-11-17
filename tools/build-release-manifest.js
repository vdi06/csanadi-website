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
const manifest={schemaVersion:'1.0.0',release:'csanadi-website-v1.40.1',date:'2026-11-17',ftpCompatible:true,
 bootstrap:'CDN bootstrap@5.3.9',notes:'v1.40.1: a kezdőlapról eltávolítottuk a Napi sporthírek modult és a kezdőlapi sorrendnyilvántartásból is kivettük. Az aloldali képes fejlécekről levettük az ismétlődő feliratot, és az aloldali címek, összefoglalók és szerkesztett szöveges szakaszok középre igazodnak. Az egyenrangú kártyák minden befejezetlen sorban is középre kerülnek; a tanulmányi és sportútvonalak kártyáit belső térköz választja el a háttérkerettől. A felső menüsor világos és sötét módban egységes, folyamatos hátteret, kontrasztos feliratokat és határvonalak nélküli gombokat kapott; a görgetésre megjelenő középső előnézet is keretmentes. A Sporthírek önálló oldala és a kapcsolódó karbantartóeszközök egyelőre változatlanok. A v1.40.0 teljes szélességű, három váltakozó képe, kétoldali szövege, reszponzív képkivágásai és a korábbi fejléc-, főmenü- és nyitókapu-működés megmaradt. A megjelenítés statikus FTP-kompatibilis; a Bootstrap kizárólag verziózott CDN-ről jön. A generált képek látványtervek, nyilvános intézményi használatuk jóváhagyást igényel.',files};
fs.writeFileSync(path.join(root,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files:Object.keys(files).length,release:manifest.release}));
