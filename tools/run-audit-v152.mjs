/** Csanádi 1.53 – ismételhető, kódalapú teljes ellenőrzés. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const tasks=[
 'build-platform-v149.mjs',
 'audit-css-contract-v152.mjs',
 'audit-page-layout-v152.mjs',
 // A jelentések SHA-256 értékei is az utolsó manifestbe kerülnek.
 'build-platform-v149.mjs',
 'verify-platform-v152.mjs',
 'verify-regression-v152.mjs',
 'verify-layout-contract-v152.mjs',
 'verify-mobile-crest-v153.mjs',
 'verify-shared-urls-v152.mjs',
 'verify-shared-integrity-v152.mjs'
];
for(const task of tasks){
 process.stdout.write(`\n[1.53] ${task}\n`);
 const result=spawnSync(process.execPath,[path.join(root,'tools',task)],{
  cwd:root,encoding:'utf8',maxBuffer:6*1024*1024
 });
 if(result.stdout)process.stdout.write(result.stdout);
 if(result.stderr)process.stderr.write(result.stderr);
 if(result.status!==0)process.exit(result.status||1);
}
let checked=0;
const scan=directory=>{
 for(const entry of fs.readdirSync(path.join(root,directory),{withFileTypes:true})){
  const child=path.posix.join(directory,entry.name);
  if(entry.isDirectory())scan(child);
  else if(/\.m?js$/.test(entry.name)){
   const result=spawnSync(process.execPath,['--check',path.join(root,child)],{encoding:'utf8'});
   if(result.status!==0){process.stderr.write(result.stderr);process.exit(1);}
   checked++;
  }
 }
};
for(const dir of ['source/js','source/mobile','source/desktop','source/tools','mobile','desktop','tools'])scan(dir);
console.log(`\nPASS: ${checked} JavaScript-szintaxis, 79 oldal, shared/ tartalom és minden ismételhető 1.53-es kódszerződés.`);
