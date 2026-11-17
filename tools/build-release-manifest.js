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
const manifest={schemaVersion:'1.0.0',release:'csanadi-website-v1.39.16',date:'2026-11-17',ftpCompatible:true,
 bootstrap:'CDN bootstrap@5.3.9',notes:'A+B+C+D: teljes v1.39.16 statikus kiadás; 71 oldal és 748 médiatétel elérhetőségi ellenőrzése, manifest-összevetés és 10 kritikus kódállomány SHA-256 vizsgálata; az egysoros, görgetéskor stabil fejléc. A javított változatban az aloldali sportanimáció kikapcsolva, nem hoz létre látható vagy rejtett jelenetet. 320–768 px mérettartomány és billentyűzetes fókusz javításai; 97 tételes tartalmi audit JSON és CSV helyi export. Külön új, két nézetes, húzható kezdőoldal-elrendezéstervező normál és legörgetett állapotra, JSON-mentéssel és másolással. Nem történik automatikus közzététel vagy intézményi jóváhagyás; statikus FTP-kompatibilis, Bootstrap kizárólag CDN.',files};
fs.writeFileSync(path.join(root,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files:Object.keys(files).length,release:manifest.release}));
