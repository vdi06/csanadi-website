/* A statikus kiadási csomag reprodukálható SHA-256 állományjegyzéke. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const excluded=new Set(['release-manifest.json','dokumentacio/KIADASI_KAPU_V1_40_6.json',
 'dokumentacio/KIADASI_KAPU_V1_40_7.json','dokumentacio/KIADASI_ELTERESEK_V1_40_7.json',
 'dokumentacio/KIADASI_KAPU_V1_40_8.json','dokumentacio/KIADASI_ELTERESEK_V1_40_8.json',
 'dokumentacio/VISSZAALLITASI_TERV_V1_40_8.json','dokumentacio/REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_8.json',
 'dokumentacio/ATADAS_V1_40_8.md',
 'dokumentacio/KIADASI_ELTERESEK_V1_40_9.json','dokumentacio/KIADASI_KAPU_V1_40_9.json',
 'dokumentacio/FTP_STAGING_VISSZAALLITAS_V1_40_9.json','dokumentacio/REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_9.json',
 'dokumentacio/ATADAS_V1_40_9.md',
 'dokumentacio/KIADASI_ELTERESEK_V1_40_10.json','dokumentacio/KIADASI_KAPU_V1_40_10.json',
 'dokumentacio/FTP_HELYI_PROBA_V1_40_10.json','dokumentacio/REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_10.json',
 'dokumentacio/ATADAS_V1_40_10.md',
 'tools/migrate-old-links.js','tools/remove-obsolete-qr.js']);
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
const manifest={schemaVersion:'1.0.0',release:'csanadi-website-v1.40.10',date:'2026-11-18',ftpCompatible:true,
 bootstrap:'CDN bootstrap@5.3.9',notes:'v1.40.10 AG+AH+AI+AJ+AK+AL: eredeti intézményi fotók dokumentált ellenőrzési kapuja (új kép nincs); előtte/utána mobilos és akadálymentességi jelentések bizonyítékalapú hibajegyzéke (valós jegyzőkönyv nincs); 71 oldal indexelés előtti egyedi intézményi SEO-engedélyezése (noindex aktív); terep/labor LCP-INP-CLS p75 kiértékelő; jóváhagyott szerkesztői keresztajánlások; v1.40.9 ZIP-hez kötött teljes helyi FTP-staging és rollback-próba. Nincs automatikus publikálás.',files};
fs.writeFileSync(path.join(root,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files:Object.keys(files).length,release:manifest.release}));
