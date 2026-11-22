/** Csanádi 1.53 – külön mobil/asztali felület és egy közös adattár.
 * shared/assets és shared/json: egy-egy futásidejű példány.
 * branch/json/site-shell.json: az egyetlen platformfüggő oldalváz.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const project=path.resolve(import.meta.dirname,'..');
const source=path.join(project,'source');
const RELEASE='1.53';
const name='csanadi-website-'+RELEASE;
const read=relative=>fs.readFileSync(path.join(source,relative),'utf8');
const write=(root,relative,content)=>{
 const full=path.join(root,relative);fs.mkdirSync(path.dirname(full),{recursive:true});
 fs.writeFileSync(full,content);
};
const clone=value=>JSON.parse(JSON.stringify(value));
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const listFiles=(root,relative='')=>{
 const result=[];
 for(const entry of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){
  if(entry.name.startsWith('.'))continue;
  const name=path.posix.join(relative,entry.name);
  if(entry.isDirectory())result.push(...listFiles(root,name));
  else if(entry.isFile())result.push(name);
 }
 return result;
};
const inventory=root=>{
 const files={};
 for(const name of listFiles(root).sort()){
  if(name==='release-manifest.json')continue;
  const data=fs.readFileSync(path.join(root,name));
  files[name]={sizeBytes:data.length,sha256:sha(data)};
 }
 return files;
};
const safeGenerated=platform=>{
 const dest=path.join(project,platform);
 if(fs.existsSync(dest)){
  assert.equal(fs.readFileSync(path.join(dest,'.generated-v149'),'utf8').trim(),platform,
   `A ${platform}/ meglévő, nem generált fájljai nem írhatók felül`);
  fs.rmSync(dest,{recursive:true});
 }
 fs.mkdirSync(dest);return dest;
};
const copy=(relative,target,as=relative)=>fs.cpSync(path.join(source,relative),
 path.join(target,as),{recursive:true,force:true});
function rewriteAssets(target){
 for(const name of listFiles(target)){
  if(!/\.(?:css|js|html)$/.test(name))continue;
  const file=path.join(target,name),original=fs.readFileSync(file,'utf8');
  let next=original;
  if(name.endsWith('.css'))next=next.replaceAll('../assets/','../../shared/assets/');
  if(name.endsWith('.js')){
   next=next.replaceAll('../json/','../../shared/json/');
   next=next.replace(/(fetch\(|loadJSON\(|load\(|fetchJSON\(|new URL\()(['"`])json\//g,'$1$2../shared/json/');
   next=next.replace(/(\b(?:BASE|SOURCE|STORE|URL_ROOT)\s*=\s*['"`])json\/data\//g,'$1../shared/json/data/');
  }
  if(next!==original)fs.writeFileSync(file,next);
 }
}
const platformHeroMobile=()=>`/** 1.53: egyetlen statikus mobilnyitó a JSON-ból. */
import {renderStaticMobileHero} from '../mobile/static-hero-v152.js?v=1.53';
export function renderPremiumHero(block){return renderStaticMobileHero(block);}
`;
function desktopHero(){
 const input=read('js/hero-2026.js');
 const output=input
  .replace(/^import \{createFreshMobileHero\} from .*\n/m,'')
  .replace(/ const mobileLanding=createFreshMobileHero\(\{slides,createPicture,mediaItem,intervalMs:data\.intervalMs\}\);\n section\.append\(mobileLanding\);\n/,'');
 assert.ok(!output.includes('createFreshMobileHero'),'Az asztali hero nem hivatkozhat mobilos megjelenítőre.');
 return output;
}
function specializedApp(platform){
 let text=read('js/app.js');
 if(platform==='mobile'){
  text=text.replace(/^import \{renderDesktopTree\} from .*\n/m,'const renderDesktopTree=()=>{};\n');
  const start=text.indexOf('function homePage(node){');
  const end=text.indexOf('\nfunction errorPage(){',start);
  assert.ok(start>=0&&end>start,'A mobil kezdőoldal funkcióhatára nem található');
  text="import {renderMobileHomePage} from '../mobile/home-page-v152.js?v=1.53';\n"+
   text.slice(0,start)+"function homePage(node){return renderMobileHomePage(node);}\n"+text.slice(end+1);
  assert.ok(!text.includes("from '../desktop/"),'Mobil app nem importálhat desktop/ modulokat.');
 }else{
  text=text.replace(/^import \{renderMobileTree,createPhoneRadial\} from .*\n/m,
   'const renderMobileTree=()=>{};\nconst createPhoneRadial=()=>({phone:()=>false,focus:()=>null,setCatalog:()=>{},reset:()=>{},back:()=>false});\n');
  assert.ok(!text.includes("from '../mobile/"),'Asztali app nem importálhat mobile/ modulokat.');
 }
 return text;
}
function desktopScript(){
 const original=read('script.js');
 const next=original
  .replace(/,\n  import\('\.\/mobile\/reboot-shell-v1-43-29\.js\?v=1\.53'\),\n  import\('\.\/mobile\/reboot-quality-v1-43-29\.js\?v=1\.53'\)/,'')
  .replace(/,\{initFreshMobileShell\},\{initFreshMobileQuality\}/,'')
  .replace(/  initFreshMobileShell\(\);\n  initFreshMobileQuality\(\);\n/,'');
 assert.ok(!next.includes('initFreshMobile')&&!next.includes("import('./mobile/"),
  'Az asztali indítószkript nem kérhet mobilmodulokat.');
 return next;
}
function networkScript(platform){
 const original=read('js/round13-network.js');
 const needle="navigator.serviceWorker.register('service-worker.js',{scope:'./',updateViaCache:'none'})";
 assert.ok(original.includes(needle),'Nem található a szolgáltatási munkafolyamat regisztrációja.');
 return original.replace(needle,`navigator.serviceWorker.register('../service-worker.js?platform=${platform}',{scope:'../',updateViaCache:'none'})`);
}
function branchShell(platform){
 const shell=clone(JSON.parse(read('json/site-shell.json')));
 shell.assets.stylesheets=shell.assets.stylesheets.filter(asset=>platform==='mobile'
  ?!/(?:desktop-hero-fold|desktop-hero-controls)/.test(asset.href||'')
  :!String(asset.href||'').startsWith('mobile/'));
 shell.assets.stylesheets.push({rel:'stylesheet',href:'css/v152-spacing-contract.css?v=1.53'});
 if(platform==='mobile')shell.assets.stylesheets.push({rel:'stylesheet',href:'mobile/home-page-v152.css?v=1.53'},{rel:'stylesheet',href:'mobile/static-hero-v152.css?v=1.53'});
 shell.platform=platform;
 const move=node=>{
  if(Array.isArray(node))return node.map(move);
  if(!node||typeof node!=='object')return node;
  for(const [key,value] of Object.entries(node)){
   if(typeof value==='string'&&value.startsWith('assets/')&&key!=='data-cs-mb-fallback-image')node[key]='../shared/'+value;
   else if(typeof value==='object')move(value);
  }
  return node;
 };
 move(shell.document);move(shell.assets);move(shell.body);
 return JSON.stringify(shell,null,2)+'\n';
}
function branchIndex(){return '<!doctype html>\n<html lang="hu">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<script type="module" src="js/site-bootstrap-v149.js?v=1.53"></script>\n</head>\n<body></body>\n</html>\n'}
function branchManifest(target,platform){
 write(target,'release-manifest.json',JSON.stringify({
  schemaVersion:'1.0.0',release:name,date:'2026-11-22',ftpCompatible:true,
  bootstrap:'CDN bootstrap@5.3.9',platform,
  notes:`1.53 különálló ${platform} felület. Közös képek/PDF-ek: ../shared/assets; közös adatok: ../shared/json. Csak a platformfüggő oldalváz van a branch/json mappában.`,
  files:inventory(target)
 },null,2)+'\n');
}

const shared=safeGenerated('shared');
for(const folder of ['assets','json'])copy(folder,shared);
fs.rmSync(path.join(shared,'json/site-shell.json'));
fs.writeFileSync(path.join(shared,'.generated-v149'),'shared');
console.log(`shared/: ${listFiles(shared).length} közös állomány (képek, dokumentumok, JSON)`);
for(const platform of ['mobile','desktop']){
 const target=safeGenerated(platform);
 for(const folder of ['css','js','tools','reports'])copy(folder,target);
 copy(platform,target,platform);
 for(const file of ['script.js','service-worker.js','offline.html'])copy(file,target);
 write(target,'index.html',branchIndex());
 write(target,'js/app.js',specializedApp(platform));
 write(target,'js/hero-2026.js',platform==='mobile'?platformHeroMobile():desktopHero());
 write(target,'js/round13-network.js',networkScript(platform));
 if(platform==='desktop')write(target,'script.js',desktopScript());
 write(target,'json/site-shell.json',branchShell(platform));
 rewriteAssets(target);
 fs.writeFileSync(path.join(target,'.generated-v149'),platform);
 branchManifest(target,platform);
 console.log(`${platform}/: ${Object.keys(JSON.parse(fs.readFileSync(path.join(target,'release-manifest.json'))).files).length} platformfájl`);
}

// A gyökérben ugyanaz a hálózati cache-folyamat fut, de CSAK a kiválasztott
// platform fájljait gyorsítótárazza. A forrás kétféle worker-változatának
// összeolvasztása helyett a már ellenőrzött offline-kezelőt használjuk.
const originalWorker=read('service-worker.js');
const coreMatch=/const CORE=\[([\s\S]*?)\];/.exec(originalWorker);
assert.ok(coreMatch,'A kanonikus offline lista hiányzik.');
const coreSource=`const SOURCE_CORE=[${coreMatch[1]}];\n`+
 `const CORE=['./','./index.html','./js/platform-router-v149.js',...SOURCE_CORE\n`+
 ` .filter(path=>path!=='./'&&path!=='./index.html'&&\n`+
 `  (PLATFORM==='desktop'||!/(?:desktop-hero-fold|desktop-hero-controls)/.test(path))&&\n`+
 `  (PLATFORM==='mobile'||!path.startsWith('./mobile/'))&&\n`+
 `  (PLATFORM==='desktop'||!path.startsWith('./desktop/')))\n`+
 ` .map(path=>path.startsWith('./assets/')||(path.startsWith('./json/')&&path!=='./json/site-shell.json')?'./shared/'+path.slice(2):'./'+PLATFORM+'/'+path.slice(2))];`;
const rootWorker=originalWorker
 .replace("const RELEASE_ID='1.53';", "const PLATFORM=new URL(self.location.href).searchParams.get('platform')==='desktop'?'desktop':'mobile';\nconst RELEASE_ID='1.53-'+PLATFORM;")
 .replace(coreMatch[0],coreSource)
 .replace("const SCOPE=new URL('./',self.registration.scope);", "const SCOPE=new URL('./',self.registration.scope);")
 .replace("const coreURL=path=>new URL(path,SCOPE);",
  "const coreURL=path=>new URL(path.startsWith('./')?path:'./'+((path.startsWith('json/')&&path!=='json/site-shell.json')||path.startsWith('assets/')?'shared/':PLATFORM+'/')+path,SCOPE);")
 .replace("appAssets.map(([path])=>'./'+path)","appAssets.map(([path])=>'./'+PLATFORM+'/'+path)")
 .replace("const appAssets=Object.entries(files).filter(([path,meta])=>",
  "const appAssets=Object.entries(files).filter(([path,meta])=>\n    (PLATFORM==='desktop'||!/(?:desktop-hero-fold|desktop-hero-controls)/.test(path))&&")
 // A gyökér /index.html offline is a közös választót indítsa, ne egy
 // közvetlenül kiszolgált branch/index.html-t hibás relatív URL-ekkel.
 .replace("shell.match(coreURL('index.html'),{ignoreSearch:true})",
  "shell.match(new URL('./index.html',SCOPE),{ignoreSearch:true})");
assert.ok(rootWorker.includes("const RELEASE_ID='1.53-'+PLATFORM;"));
write(project,'service-worker.js',rootWorker);
const rootManifest={schemaVersion:'1.0.0',release:name,date:'2026-11-22',ftpCompatible:true,
 bootstrap:'CDN bootstrap@5.3.9',notes:'1.53: közös belépési pont; két külön mobile/ és desktop/ felület; egyszer tárolt shared/assets és shared/json. A source/ kanonikus forrásokból újragenerálható.',
 files:inventory(project)};
write(project,'release-manifest.json',JSON.stringify(rootManifest,null,2)+'\n');
console.log(`1.53 gyökér: ${Object.keys(rootManifest.files).length} SHA-256-ellenőrzött állomány`);
