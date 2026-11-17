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
const manifest={schemaVersion:'1.0.0',release:'csanadi-website-v1.39.14',date:'2026-11-17',ftpCompatible:true,
 bootstrap:'CDN bootstrap@5.3.9',notes:'A+B+C+D: tematikus, görgetéskor is stabil aloldali sportanimációk; mobilon legalább 44 px-es, teljes animációfelületre kiterjedő szünet/folytatás gomb és billentyűzetes/fókuszos vezérlés, kontraszt- és csökkentettmozgás-alkalmazkodás. A kiadás előtti minőségkapu külön listázza a 23 intézményi oldalt és a 69 függő médiajogot, elkülöníti a helyi munkalapot az intézményi jóváhagyástól és biztonságosabb CSV-exportot ad. A 71 JSON-oldal, a kezdőlapi képváltó és a statikus FTP-közzététel megmaradt. Nyilvános URL nem azonosítható hitelesen; publikus böngészőteszt külön közzététel után.',files};
fs.writeFileSync(path.join(root,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files:Object.keys(files).length,release:manifest.release}));
