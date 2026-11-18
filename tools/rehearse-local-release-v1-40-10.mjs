/* AL: FTP-struktúrát utánzó, teljes helyi telepítési és rollback-próba.
 * Nem indít HTTP, FTP, GitHub hívást vagy szerveroldali írást. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {compareReleaseManifests} from './release-diff-core-v1-40-7.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const old=JSON.parse(fs.readFileSync(path.join(root,'dokumentacio/BAZIS_MANIFEST_V1_40_9.json')));
const next=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json')));
if(old.release!=='csanadi-website-v1.40.9'||next.release!=='csanadi-website-v1.40.10')throw Error('Helytelen kiadási manifestpár');
const archive=process.argv[2];if(!archive)throw Error('Az előző v1.40.9 ZIP elérési útja kötelező');
const expectedHash='d141a477aeb7e1621d813ecb84870f9916162a939c3a9ae31c2e1e2a2f1c3eac';
if(crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex')!==expectedHash)throw Error('A v1.40.9 ZIP SHA-256 eltér a hiteles példánytól');
execFileSync('unzip',['-tq',archive],{stdio:['ignore','ignore','pipe']});
const entries=execFileSync('unzip',['-Z1',archive],{encoding:'utf8'}).split('\n').filter(Boolean);
if(entries.some(p=>p.startsWith('/')||p.split('/').includes('..')||p.includes('\\')))throw Error('Nem biztonságos ZIP-útvonal');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'csanadi-v14010-local-rehearsal-'));
const stage=path.join(tmp,'stage'),restore=path.join(tmp,'rollback');
const digest=filename=>crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
const verify=(folder,manifest)=>{
 let checked=0;const errors=[];
 for(const [rel,meta] of Object.entries(manifest.files)){
  const abs=path.resolve(folder,rel);
  if(!abs.startsWith(path.resolve(folder)+path.sep)||!fs.existsSync(abs)||!fs.statSync(abs).isFile()){errors.push('Hiányzó állomány: '+rel);continue;}
  if(fs.statSync(abs).size!==meta.sizeBytes||digest(abs)!==meta.sha256)errors.push('SHA eltérés: '+rel);
  checked++;
 }
 return {checked,expected:Object.keys(manifest.files).length,errors};
};
let forward,backward;
try{
 fs.cpSync(root,stage,{recursive:true});
 forward=verify(stage,next);
 fs.mkdirSync(restore,{recursive:true});
 execFileSync('unzip',['-q',archive,'-d',restore],{stdio:['ignore','ignore','pipe']});
 const archivedManifest=JSON.parse(fs.readFileSync(path.join(restore,'release-manifest.json')));
 if(JSON.stringify(archivedManifest.files)!==JSON.stringify(old.files))throw Error('Az előző ZIP belső manifestje nem megfelelő');
 backward=verify(restore,old);
}finally{
 if(tmp.startsWith(path.join(os.tmpdir(),'csanadi-v14010-local-rehearsal-')))fs.rmSync(tmp,{recursive:true,force:true});
}
const delta=compareReleaseManifests(old,next);
const report={release:'1.40.10',previous:'1.40.9',previousZipSha256:expectedHash,previousZipVerified:true,
 stagedCurrentLocally:true,rollbackUnpackedLocally:true,staging:forward,rollback:backward,
 currentFiles:delta.totals.current,previousFiles:delta.totals.previous,delta:delta.totals,
 uploadOrUpdate:delta.added.concat(delta.changed).map(x=>x.path),manualDeleteReview:delta.removed.map(x=>x.path),
 ftpStagingPerformed:false,ftpProductionActivation:false,githubPublicationPerformed:false,
 instructions:[
  'Kézi FTP-másolás előtt készíts ellenőrzött teljes mentést az éles tárhelyről, a v1.40.9 eredeti ZIP-jét őrizd meg.',
  'Másold a v1.40.10 teljes csomagját külön próbakönyvtárba, a szerkesztett intézményi JSON-okat ne írd felül automatikusan.',
  'Állítsd a config.site.baseUrl értékét a végleges FTP URL-re, majd az ottani noindex SEO-kimenetet és manifestet generáld újra.',
  'HTTP(S) alatt ténylegesen ellenőrizd a kezdőlapot, 71 aloldalt, 769 assetet, menüket, képeket, dokumentumokat és a szerkesztői ajánlásokat.',
  'Külön írásos jóváhagyás után kézzel aktiválj; FTP-n az atomikus csere nem garantált.',
  'Hiba esetén a hiteles v1.40.9 ZIP-ből külön visszaállítási könyvtárba bonts ki, végezd el az integritási ellenőrzést, majd kézzel kapcsolj vissza.',
  'Eltűnt fájlokat csak tételes ellenőrzés és mentés után törölj.'
 ],
 success:forward.errors.length===0&&backward.errors.length===0,publicationPerformed:false};
fs.writeFileSync(path.join(root,'dokumentacio/FTP_HELYI_PROBA_V1_40_10.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({success:report.success,stageVerified:forward.checked,rollbackVerified:backward.checked,uploaded:false}));
if(!report.success)process.exitCode=1;
