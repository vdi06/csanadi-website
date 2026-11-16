/* v1.38.2 – ugyanaz a teljes FTP-HTTP-próba, saját kiadási naplóval. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const output=execFileSync(process.execPath,[path.join(__dirname,'test-static-http-v1-38-1.js')],{encoding:'utf8'});
const report=JSON.parse(output.trim().split('\n').at(-1));
report.version='1.38.2';
report.methodDetail='A v1.38.1 teljes statikus HTTP-tesztje, v1.38.2-es fájlkészleten (az új helyi SVG/CSS-animációval együtt).';
for(const extra of ['js/subpage-header-motion.js','css/subpage-header-motion-v1-38-2.css']){
 if(!fs.existsSync(path.join(root,extra)))throw Error('Hiányzó animációforrás: '+extra);
}
fs.writeFileSync(path.join(root,'dokumentacio/static-http-tesztnaplo-v1-38-2.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
if(report.failed)process.exitCode=1;
