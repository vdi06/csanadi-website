/** 1.53: külön platformkód, közös assets/JSON és ellenőrzött importgráf. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const project=path.resolve(import.meta.dirname,'..');
const text=(root,name)=>fs.readFileSync(path.join(root,name),'utf8');
const json=(root,name)=>JSON.parse(text(root,name));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const list=(dir,relative='')=>fs.readdirSync(path.join(dir,relative),{withFileTypes:true}).flatMap(entry=>{
 if(entry.name.startsWith('.'))return [];
 const current=path.posix.join(relative,entry.name);
 return entry.isDirectory()?list(dir,current):entry.isFile()?[current]:[];
});
const verifyManifest=(root,label)=>{
 const manifest=json(root,'release-manifest.json');
 assert.equal(manifest.release,'csanadi-website-1.53');
 const available=list(root).filter(item=>item!=='release-manifest.json').sort();
 const files=Object.keys(manifest.files).sort();
 assert.deepEqual(files,available,`${label}: teljes állománylista`);
 for(const filename of files){
  const bytes=fs.readFileSync(path.join(root,filename)),record=manifest.files[filename];
  assert.equal(bytes.length,record.sizeBytes,`${label}/${filename}: méret`);
  assert.equal(sha(bytes),record.sha256,`${label}/${filename}: SHA-256`);
  if(filename.endsWith('.json'))JSON.parse(bytes.toString('utf8'));
 }
 return files.length;
};
const rootHtml=text(project,'index.html');
assert.match(rootHtml,/<body><\/body>/);
assert.doesNotMatch(rootHtml,/<(?:header|nav|main|footer|h1|article)\b/i);
assert.match(rootHtml,/js\/platform-router-v149\.js\?v=1\.53/);
assert.ok(!rootHtml.includes('site-bootstrap-'));
const router=text(project,'js/platform-router-v149.js');
assert.match(router,/matchMedia\(MOBILE\)/);
assert.match(router,/new URL\(platform\+'\/'/);
assert.match(router,/location\.reload\(\)/);
assert.match(router,/if\(location\.hash!==href\)location\.hash=href/,
 'A #/ útvonalnak a közös belépési ponton kell maradnia a <base> mellett is');
const worker=text(project,'service-worker.js');
assert.match(worker,/const PLATFORM=new URL\(self\.location\.href\)/);
assert.match(worker,/appAssets\.map\(\(\[path\]\)=>'\.\/'\+PLATFORM\+'\/'\+path\)/);
assert.match(worker,/new URL\('\.\/index\.html',SCOPE\)/);
const source=json(path.join(project,'source'),'json/page-index.json');
let loaded=0,checked=0;
for(const platform of ['mobile','desktop']){
 const branch=path.join(project,platform),other=platform==='mobile'?'desktop':'mobile';
 assert.equal(fs.existsSync(path.join(branch,other)),false,`${platform} nem hordozhat ${other}/ modulkönyvtárat`);
 assert.equal(fs.existsSync(path.join(branch,platform)),true,`${platform} saját modulkönyvtára hiányzik`);
 assert.equal(fs.existsSync(path.join(branch,'assets')),false,`${platform}: duplikált médiatár`);
 assert.deepEqual(fs.readdirSync(path.join(branch,'json')).sort(),['site-shell.json']);
 for(const html of ['index.html','offline.html']){
  const source=text(branch,html);
  assert.match(source,/<body>\s*<\/body>/);
  assert.doesNotMatch(source,/<(?:header|nav|main|footer|h1|article)\b/i);
 }
 const shell=json(branch,'json/site-shell.json');
 const pageIndex=json(project,'shared/json/page-index.json');
 assert.equal(Object.keys(pageIndex.pages).length,79);
 assert.deepEqual(pageIndex.pages,source.pages,'A két felület ugyanazokból a kanonikus JSON-adatokból készül');
 assert.equal(shell.platform,platform);
 const stylesheetURLs=shell.assets.stylesheets.map(item=>item.href);
 if(platform==='mobile'){
  assert.ok(stylesheetURLs.some(item=>item.startsWith('mobile/reboot-design')));
  assert.ok(!stylesheetURLs.some(item=>item.includes('desktop-hero-controls')));
  assert.doesNotMatch(text(branch,'js/hero-2026.js'),/csn26-visual-row|cs42-desktop-carousel/);
  assert.match(text(branch,'js/hero-2026.js'),/renderStaticMobileHero/);
  assert.doesNotMatch(text(branch,'js/hero-2026.js'),/createFreshMobileHero/);
  assert.doesNotMatch(text(branch,'js/app.js'),/from '\.\.\/desktop\//);
 }else{
  assert.ok(!stylesheetURLs.some(item=>item.startsWith('mobile/')));
  assert.doesNotMatch(text(branch,'script.js'),/initFreshMobile|import\('\.\/mobile\//);
  assert.doesNotMatch(text(branch,'js/hero-2026.js'),/createFreshMobileHero/);
  assert.doesNotMatch(text(branch,'js/app.js'),/from '\.\.\/mobile\//);
 }
 for(const filename of ['js/app.js','js/hero-2026.js','script.js','js/site-bootstrap-v149.js']){
  execFileSync(process.execPath,['--check',path.join(branch,filename)],{stdio:'pipe'});
 }
 const base='https://example.test/csanadi/'+platform+'/';
 for(const href of [...shell.assets.stylesheets.map(item=>item.href),...shell.assets.scripts.map(item=>item.src),shell.assets.entryModule]){
  const resolved=new URL(href,base);
  if(resolved.origin==='https://example.test'){
   assert.ok(resolved.pathname.startsWith('/csanadi/'+platform+'/')||resolved.pathname.startsWith('/csanadi/shared/'),`${platform}: eltérő fájlbázis ${href}`);
   assert.ok(fs.existsSync(path.join(project,resolved.pathname.slice('/csanadi/'.length))),`${platform}: hiányzó JSON-asset ${href}`);
  }
 }
 // A betöltési gráf valamennyi statikus importja a saját platformjában van.
 const queue=['js/site-bootstrap-v149.js','script.js','js/round13-network.js'];
 const visited=new Set();
 const scan=/\b(?:import|export)\s*(?:[\s\S]{0,70}?\sfrom\s*)?['"](\.\.?\/[^'"\n]+)['"]|\bimport\(\s*['"](\.\.?\/[^'"\n]+)['"]\s*\)/g;
 while(queue.length){
  const relative=queue.pop();if(visited.has(relative))continue;visited.add(relative);
  const file=path.join(branch,relative);assert.ok(fs.existsSync(file),`${platform}: hiányzó import ${relative}`);
  if(!relative.endsWith('.js')&&!relative.endsWith('.mjs'))continue;
  const body=fs.readFileSync(file,'utf8');
  for(const match of body.matchAll(scan)){
   const spec=(match[1]||match[2]).split(/[?#]/)[0];
   const next=path.posix.normalize(path.posix.join(path.posix.dirname(relative),spec));
   assert.ok(!next.startsWith('../')&&!path.posix.isAbsolute(next),`${platform}: külső import ${relative} → ${spec}`);
   assert.ok(fs.existsSync(path.join(branch,next)),`${platform}: hiányzik ${relative} → ${next}`);
   queue.push(next);
  }
 }
 checked+=visited.size;
 const manifestCount=verifyManifest(branch,platform);loaded+=manifestCount;
 console.log(`${platform}: 79 JSON-oldal · ${visited.size} önálló modulfájl · ${manifestCount} SHA-256 fájl`);
}
const all=verifyManifest(project,'teljes ZIP');
assert.ok(fs.readdirSync(path.join(project,'shared/assets/documents')).length>0);
console.log(`1.53 elválasztás PASS – ${checked} importgráf-elem, ${loaded} platformspecifikus fájl, ${all} teljes állomány`);
