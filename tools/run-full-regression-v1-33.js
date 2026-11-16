/* Teljes, reprodukálható helyi tesztkör; a konzolkimenetből naplót készít. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const scripts=[
 'test-release-v1-33.js',
 'test-mobile-sections-v1-33.js',
 'test-embedded-arrival-v1-33.js',
 'test-theme-sync-v1-33.js',
 'test-existing-features-v1-33.js',
 'test-mobile-tree-v1-33.js',
 'test-current-hardening-v1-33.js',
 'test-diagnostics-concurrency-v1-33.js',
 'test-document-history-v1-33.js',
 'test-corrections-v1-33.js',
 'test-mobile-navigation-v1-11.js',
 'test-regressions-v1-10.js',
 'test-subpage-header-v1-9.js',
 'test-review-worklist-v1-9.js',
 'test-media-manager-v1-9.js',
 'test-media-export-v1-9.js',
 'test-static-http-v1-33.js',
 'reconcile-assets-catalog.js'
];
const results=[];
for(const script of scripts){
 const started=Date.now();
 let server=null;
 let args=[path.join(root,'tools',script)];
 if(script.startsWith('test-static-http')){
  server=cp.spawn('python3',['-m','http.server','8833','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,350);
  args.push('http://127.0.0.1:8833/');
 }
 const result=cp.spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:10*1024*1024});
 if(server)server.kill();
 const output=[result.stdout,result.stderr].filter(Boolean).join('\n').trim();
 const ok=result.status===0&&!result.error;
 results.push({script,ok,elapsedMs:Date.now()-started,output,error:result.error?.message||null});
 console.log((ok?'OK  ':'HIBA')+' '+script+' '+(Date.now()-started)+' ms');
}
const generated=new Intl.DateTimeFormat('hu-HU',{dateStyle:'full',timeStyle:'long',timeZone:'Europe/Budapest'}).format(new Date());
const good=results.filter(result=>result.ok).length;
const document=[
 '# Csanádi v1.33.0 – teljes regressziós tesztnapló',
 '',
 '- Készült: '+generated+' (Europe/Budapest).',
 '- Vizsgálat tárgya: helyi v1.33.0 ZIP-kiadási forrás; nem az élő GitHub Pages állapota.',
 `- Ellenőrző programok: ${good}/${results.length} sikeres.`,
 '- A statikus HTTP-teszt és a böngészős ellenőrzés eredménye külön összesítésben szerepel; nem tekintjük automatikusan sikeresnek.',
 '',
 ...results.flatMap(result=>[
  '## '+result.script,
  '',
  '- Állapot: '+(result.ok?'SIKERES':'SIKERTELEN')+'.',
  '- Futás: '+result.elapsedMs+' ms.',
  '',
  '```text',
  result.output||result.error||'Nem volt programkimenet.',
  '```',
  ''
 ])
].join('\n');
fs.writeFileSync(path.join(root,'dokumentacio','TESZTNAPLO_V1_33.md'),document+'\n');
console.log(JSON.stringify({release:'1.33.0',executed:results.length,passed:good,failed:results.filter(r=>!r.ok).map(r=>r.script),log:'dokumentacio/TESZTNAPLO_V1_33.md'}));
if(good!==results.length)process.exitCode=1;
