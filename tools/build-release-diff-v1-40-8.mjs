/* Kizárólag helyi SHA-256 összevetés, publikálás nélkül. */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {compareReleaseManifests} from './release-diff-core-v1-40-7.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const a=JSON.parse(fs.readFileSync(path.join(root,'dokumentacio/BAZIS_MANIFEST_V1_40_7.json')));
const b=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json')));
if(a.release!=='csanadi-website-v1.40.7'||b.release!=='csanadi-website-v1.40.8')throw Error('Hibás kiadási verzió');
const delta=compareReleaseManifests(a,b);
fs.writeFileSync(path.join(root,'dokumentacio/KIADASI_ELTERESEK_V1_40_8.json'),JSON.stringify(delta,null,2)+'\n');
console.log(JSON.stringify({from:delta.from,to:delta.to,totals:delta.totals,reviewRequired:delta.reviewRequired}));
