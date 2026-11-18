/* Offline visszaállítási előkészítés. Nem végez FTP/GitHub kérést, nem publikál. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {compareReleaseManifests} from './release-diff-core-v1-40-7.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const previous=JSON.parse(fs.readFileSync(path.join(root,'dokumentacio/BAZIS_MANIFEST_V1_40_7.json')));
const current=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json')));
if(previous.release!=='csanadi-website-v1.40.7'||current.release!=='csanadi-website-v1.40.8')throw Error('A visszaállításhoz 1.40.7 → 1.40.8 manifestek szükségesek.');
const reverse=compareReleaseManifests(current,previous);
const archive=process.argv[2];
const knownHash='5d969c2162349431f5923aea92c0dc85db52812eb6bc9e191387d916909aa28a';
let archiveVerified=false;
if(archive){
 const bytes=fs.readFileSync(archive),digest=crypto.createHash('sha256').update(bytes).digest('hex');
 if(digest!==knownHash)throw Error('A v1.40.7 visszaállítási ZIP SHA-256 ellenőrzése sikertelen.');
 const contained=JSON.parse(execFileSync('unzip',['-p',archive,'release-manifest.json'],{maxBuffer:12*1024*1024}));
 if(contained.release!==previous.release||JSON.stringify(contained.files)!==JSON.stringify(previous.files))throw Error('A visszaállító ZIP manifestje eltér a mellékelt hiteles baseline-tól.');
 execFileSync('unzip',['-tq',archive],{stdio:['ignore','ignore','pipe']});
 archiveVerified=true;
}
const plan={release:'1.40.8',previousRelease:previous.release,rollbackArchive:'csanadi-website-v1.40.7.zip',previousArchiveSha256:knownHash,archiveVerified,
 publicationPerformed:false,requiresManualAuthorization:true,requiresPreviousArchive:true,
 archiveFiles:Object.keys(previous.files).length,restoreOrOverwrite:reverse.added.concat(reverse.changed).map(x=>x.path),removeOnlyAfterManualReview:reverse.removed.map(x=>x.path),
 totals:reverse.totals,
 steps:[
 '1. A célhely teljes állapotát mentsd le, és a v1.40.7 ZIP SHA-256 összegét ellenőrizd.',
 '2. Ellenőrizd az új fájlok között az intézményi tartalommódosításokat; a jelenlegi éles tartalmat soha ne írd felül automatikusan.',
 '3. Az előző kiadás összes állományát külön, azonos útvonalstruktúrájú átmeneti FTP-könyvtárba töltsd fel.',
 '4. Teszteld helyben és egy külön próba-URL alatt a teljes előző verziót, a főoldalt, keresőt, eszközöket, JSON-oldalakat és médiákat.',
 '5. Kézi intézményi engedély után válts a tesztelt könyvtárra az FTP-tárhely szolgáltatója által támogatott módon; ha nem lehet atomikusan váltani, szervezett karbantartási ablak szükséges.',
 '6. Az új verzióból származó, az előzőben nem szereplő fájlok törléséről fájlonként dönts; ezek teljes listája removeOnlyAfterManualReview.',
 '7. Vizsgáld meg újra a manifest-integritást és a fő felhasználói útvonalakat. Hibánál állítsd vissza az előző mentést.'
 ]};
fs.writeFileSync(path.join(root,'dokumentacio/VISSZAALLITASI_TERV_V1_40_8.json'),JSON.stringify(plan,null,2)+'\n');
console.log(JSON.stringify({archiveVerified,to:previous.release,restore:plan.restoreOrOverwrite.length,manualRemovals:plan.removeOnlyAfterManualReview.length,publicationPerformed:false}));
