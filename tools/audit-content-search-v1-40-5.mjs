/* Helyi, automatikusan újrafuttatható tartalom- és keresőindex audit. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {analyzeContentPages,contentAuditCsv} from './content-quality-core-v1-40-5.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const json=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const index=json('json/oldalindex.json');
const entries=Object.keys(index.pages).map(file=>{
 const full=path.resolve(root,'json',file);
 if(!full.startsWith(path.join(root,'json','oldalak')+path.sep))throw Error('Nem oldalfájl: '+file);
 return {path:file,page:json('json/'+file)};
});
const report=analyzeContentPages(entries,index);
const dest=path.join(root,'dokumentacio');
fs.writeFileSync(path.join(dest,'TARTALOM_KERESES_AUDIT_V1_40_5.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(dest,'TARTALOM_KERESES_AUDIT_V1_40_5.csv'),contentAuditCsv(report));
console.log(JSON.stringify(report.totals));
if(report.totals.error)process.exitCode=1;
