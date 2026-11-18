/** v1.40.4 – összevont, újrafuttatható, publikálás nélküli regresszió.
 * node tools/run-full-regression-v1-40-4.mjs
 * A korábbi v1.37–v1.40.3 ellenőrzések a fontos megőrzési elvárásokat fedik le.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const tests=[
 ['v1.40.4 integritás, tartalomjog, akadálymentesség','test-v1404-static.mjs'],
 ['v1.40.3 képkészlet és SHA-256 kiadási integritás','test-v1403-audit.mjs'],
 ['v1.40.2 fejléc és képminőség','test-v1402-header-images-contrast.mjs'],
 ['v1.40.2 30 képes hősáv','test-v140-single-hero.mjs'],
 ['v1.40.1 összefüggő fejléc','test-v1401-seamless-header.mjs'],
 ['v1.40.1 portálkártya-térköz','test-v1401-cards-no-overlap.mjs'],
 ['v1.40.1 kezdőlap-hírkártya','test-v1401-no-home-daily-news.mjs'],
 ['v1.40.1 aloldali elrendezés','test-v1401-subpage-center.mjs'],
 ['Megőrzött alapfunkciók','test-existing-features-v1-37.js'],
 ['Mobilfelépítés és menühierarchia','test-mobile-sections-v1-37.js'],
 ['Reszponzivitás és alapvető akadálymentesség','test-responsive-a11y-v1-39-5.mjs'],
 ['Világos/sötét témaállapot','test-theme-sync-v1-37.js'],
 ['Modális ablak, fókusz, Escape','test-modal-a11y-v1-39-6.mjs'],
 ['Tartalmi jóváhagyás és felületmegőrzés','test-all-four-v1-39-16.mjs']
];
const rows=[];
for(const [description,script] of tests){
 const result=spawnSync(process.execPath,[path.join(root,'tools',script)],{cwd:root,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
 rows.push({description,script,passed:result.status===0&&!result.error,
  exitCode:result.status,error:result.error?.message||null,
  output:(result.stdout||'').slice(-1500).trim(),stderr:(result.stderr||'').slice(-1200).trim()});
}
const failed=rows.filter(row=>!row.passed);
const report={release:'1.40.4',suite:'Egységes, csak olvasó statikus regressziós tesztfuttatás',
 summary:{scripts:rows.length,passed:rows.length-failed.length,failed:failed.length},
 browserViewportTest:{status:'not-executed',reason:'A jelen környezet böngészője nem érte el a munkatér helyi kiszolgálóját; fizikai 320/390/768px vizsgálat nyitott.'},
 publication:{github:false,ftp:false,other:false},results:rows};
const output=path.join(root,'dokumentacio','REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_4.json');
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({release:'1.40.4',scripts:rows.length,passed:rows.length-failed.length,failed:failed.map(x=>({script:x.script,error:x.stderr||x.error||x.output})),report:'dokumentacio/REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_4.json'},null,2));
if(failed.length)process.exitCode=1;
