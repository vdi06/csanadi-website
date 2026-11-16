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
const manifest={schemaVersion:'1.0.0',release:'csanadi-website-v1.38.2',date:'2026-11-16',ftpCompatible:true,
 bootstrap:'CDN bootstrap@5.3.9',notes:'A v1.38.1 teljes tartalma megmaradt; asztali aloldali fejlécben JSON-útvonalhoz illő, vicces sportmozdulatot ábrázoló, helyi SVG/CSS animáció, szüneteltetéssel és csökkentett mozgási móddal; görgetésre ugyanott az oldalcím. Telefonos körmenü és statikus FTP-kompatibilitás változatlan.',files};
fs.writeFileSync(path.join(root,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files:Object.keys(files).length,release:manifest.release}));
