/** Helyi, kizárólag olvasó manifest-összevetés; a jelentést írja ki a csomagba. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {compareReleaseManifests} from './release-diff-core-v1-40-7.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const previous=JSON.parse(fs.readFileSync(path.join(root,'dokumentacio/BAZIS_MANIFEST_V1_40_6.json'),'utf8'));
const current=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8'));
if(current.release!=='csanadi-website-v1.40.7')throw Error('A kiadási manifest nem v1.40.7.');
const diff=compareReleaseManifests(previous,current);
fs.writeFileSync(path.join(root,'dokumentacio/KIADASI_ELTERESEK_V1_40_7.json'),JSON.stringify({release:'1.40.7',mode:'local-read-only',publicationPerformed:false,...diff},null,2)+'\n');
console.log(JSON.stringify({from:diff.from,to:diff.to,totals:diff.totals,reviewRequired:diff.reviewRequired},null,2));
