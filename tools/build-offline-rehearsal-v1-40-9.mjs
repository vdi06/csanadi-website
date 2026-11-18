/* AF: helyi, csak olvasó próba és SHA-256-os visszaállítási forgatókönyv.
 * A helyi dokumentációt előállítja, sem FTP-hez, sem GitHubhoz nem kapcsolódik. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {compareReleaseManifests} from './release-diff-core-v1-40-7.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const previous=JSON.parse(fs.readFileSync(path.join(root,'dokumentacio/BAZIS_MANIFEST_V1_40_8.json')));
const current=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json')));
if(previous.release!=='csanadi-website-v1.40.8'||current.release!=='csanadi-website-v1.40.9')throw Error('A v1.40.8 → v1.40.9 kiadási manifestek nem egyeznek.');
const knownHash='e8137f7c430499ac681f6d4e8e47dd6c825550e3dfd93d1887ce3506b72521e7';
const archive=process.argv[2];let archiveVerified=false;
if(archive){
 const digest=crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
 if(digest!==knownHash)throw Error('A v1.40.8 alap-ZIP bájttartalma eltér a jóváhagyott SHA-256-tól.');
 const contained=JSON.parse(execFileSync('unzip',['-p',archive,'release-manifest.json'],{maxBuffer:12*1024*1024}));
 if(JSON.stringify(contained.files)!==JSON.stringify(previous.files)||contained.release!==previous.release)throw Error('Az alap-ZIP manifestje nem egyezik a mentett hiteles példánnyal.');
 execFileSync('unzip',['-tq',archive],{stdio:['ignore','ignore','pipe']});archiveVerified=true;
}
const forward=compareReleaseManifests(previous,current),reverse=compareReleaseManifests(current,previous);
const rehearsal={release:'1.40.9',previousRelease:'1.40.8',previousArchive:'csanadi-website-v1.40.8.zip',previousArchiveSha256:knownHash,
 previousArchiveVerified:archiveVerified,manifestVerified:true,stagedToServer:false,productionActivated:false,
 simulation:'read-only archive and manifest verification; no FTP upload',
 forward:forward.totals,rollback:reverse.totals,
 uploadOrUpdate:forward.added.concat(forward.changed).map(x=>x.path),
 manualRemovalReview:forward.removed.map(x=>x.path),
 restoreOrOverwrite:reverse.added.concat(reverse.changed).map(x=>x.path),
 deleteFromRollbackOnlyAfterReview:reverse.removed.map(x=>x.path),
 steps:[
  '0. A v1.40.8 teljes ZIP és SHA-256 ellenőrzött, külön megőrzött példányát tartsd meg.',
  '1. Ments teljes pillanatképet a cél FTP-tárhelyről; minden élő, helyben módosult JSON-t külön vizsgálj meg.',
  '2. Az új v1.40.9 ZIP-et kézzel másold egy külön staging könyvtárba; a cél tartalmát nem írhatja felül automatikus szinkron.',
  '3. A staging URL-en ellenőrizd a 71 oldalt, a 769 assetet, a menüt, a keresőajánlásokat, a dokumentumokat, a fotókaput és a mobil QA-t.',
  '4. FTP-n állítsd át a config.site.baseUrl-t a végleges domain gyökerére, generáld újra a statikus SEO-előnézeteket és a manifestet; a noindex maradjon.',
  '5. Kérj külön intézményi jóváhagyást, majd kézzel aktiválj, kizárólag a kiszolgáló által támogatott módon.',
  '6. Hiba esetén a hiteles v1.40.8 ZIP-et külön visszaállító könyvtárba bontsd ki, ott ellenőrizd és kézi aktiválással térj vissza.',
  '7. Fájlokat csak manuális differenciaellenőrzés után törölj, a célhelyről előtte legyen mentés.'
 ]};
fs.writeFileSync(path.join(root,'dokumentacio/FTP_STAGING_VISSZAALLITAS_V1_40_9.json'),JSON.stringify(rehearsal,null,2)+'\n');
console.log(JSON.stringify({from:previous.release,to:current.release,verified:archiveVerified,added:forward.totals.added,changed:forward.totals.changed,removed:forward.totals.removed,uploaded:false}));
