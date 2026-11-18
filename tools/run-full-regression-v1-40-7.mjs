/* v1.40.7 – 21 csomagból álló, újrafuttatható, csak helyi regresszió. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const scripts=[
 ['Q+R+S+T 1.40.7 funkciók','test-v1407-static.mjs'],
 ['M+N+O+P új ellenőrzési kapu','test-v1406-static.mjs'],
 ['I+J+K+L integritás','test-v1405-static.mjs'],
 ['v1.40.4 funkciók megőrzése','test-v1404-static.mjs'],
 ['30 kép, fájlhash és kiadás','test-v1403-audit.mjs'],
 ['Fejléc és képfelbontás','test-v1402-header-images-contrast.mjs'],
 ['30 képes képváltó','test-v140-single-hero.mjs'],
 ['Fejléc mozgása','test-v1401-seamless-header.mjs'],
 ['Kártyák középre igazítása','test-v1401-cards-no-overlap.mjs'],
 ['Kezdőlap és sporthírek','test-v1401-no-home-daily-news.mjs'],
 ['Aloldalak elrendezése','test-v1401-subpage-center.mjs'],
 ['Alapfunkciók','test-existing-features-v1-37.js'],
 ['Mobil menü és oldalszakaszok','test-mobile-sections-v1-37.js'],
 ['Mobil- és fókuszszabályok','test-responsive-a11y-v1-39-5.mjs'],
 ['Témaállapotok','test-theme-sync-v1-37.js'],
 ['Dialog és Escape','test-modal-a11y-v1-39-6.mjs'],
 ['Korábbi A+B+C+D követelmények','test-all-four-v1-39-16.mjs']
 ,['Keresőindex teljes tartalmi szinkronja','test-search-index-v1-39-1.js']
 ,['Média- és dokumentum-CRUD visszamenőleges tesztje','test-tools-media-v1-39-4.mjs']
 ,['ZIP-építő regressziós tesztje','test-zip-engine-v1-39-4.mjs']
 ,['HTML nyelv, viewport, szemantika','test-html-semantics-v1-39-5.py']
];
const results=scripts.map(([name,script])=>{
 const interpreter=script.endsWith('.py')?'python3':process.execPath;
 const task=spawnSync(interpreter,[path.join(root,'tools',script)],{cwd:root,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
 return {name,script,passed:task.status===0&&!task.error,exitCode:task.status,output:(task.stdout||'').slice(-1300).trim(),error:(task.stderr||task.error?.message||'').slice(-1000)};
});
const failed=results.filter(x=>!x.passed),report={release:'1.40.7',kind:'local-static-regression',
 summary:{suites:results.length,passed:results.length-failed.length,failed:failed.length},
 physicalDeviceTesting:{executed:false,reason:'Nincs e feladatban tényleges felhasználói telefon/tablet vagy képernyőolvasós tesztjegyzőkönyv. A mellékelt böngészős keret a későbbi 320/390/768 px vizsgálatra szolgál.'},
 schoolPhotoEvidence:{filesProvided:0,registeredNewMedia:0,approvalIndependentVerification:false},
 publication:{github:false,ftp:false,other:false},results};
fs.writeFileSync(path.join(root,'dokumentacio/REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_7.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({release:'1.40.7',suites:results.length,passed:results.length-failed.length,failed:failed.map(x=>({script:x.script,detail:x.error||x.output}))},null,2));
if(failed.length)process.exitCode=1;
