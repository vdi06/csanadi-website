/** Csanádi 1.51 – két teljesen elkülönített statikus futási csomag.
 *
 * Kanonikus tartalom: source/json/*.json. A build másolatokat generál a
 * mobile/json és desktop/json fájlokba, nem kell két helyen szerkeszteni.
 * A nyilvános index.html kizárólag a kijelzőosztályt választja ki.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const project=path.resolve(import.meta.dirname,'..');
const source=path.join(project,'source');
const RELEASE='1.51';
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
  assert.equal(fs.readFileSync(path.join(dest,'.generated-v149'),'utf8'),platform,
   `A ${platform}/ meglévő, nem generált fájljai nem írhatók felül`);
  fs.rmSync(dest,{recursive:true});
 }
 fs.mkdirSync(dest);return dest;
};
const copy=(relative,target,as=relative)=>fs.cpSync(path.join(source,relative),
 path.join(target,as),{recursive:true,force:true});
const platformHeroMobile=()=>`/** 1.51: külön telefonos főképernyő; asztali képsor létre sem jön. */
import {createFreshMobileHero} from '../mobile/reboot-hero-v1-43-29.js?v=1.51';
import {createPicture,mediaItem} from './media.js?v=1.51';
import {settingNumber,isWithinConfiguredWindow} from './site-settings-2026.js?v=1.51';
export function renderPremiumHero(block){
 if(!isWithinConfiguredWindow('runtime.hero'))return null;
 const data=block?.data||{};
 const slides=(Array.isArray(data.slides)&&data.slides.length?data.slides:[data])
  .filter(item=>item&&typeof item.mediaId==='string'&&(!data.logoSafeOnly||item.logoSafe===true))
  .slice(0,settingNumber('runtime.hero.maxSlides'));
 if(!slides.length)return null;
 const section=document.createElement('section');
 section.className='csn26-visual-map cs41-home-hero';
 section.setAttribute('aria-label',String(data.eyebrow||document.title));
 section.append(createFreshMobileHero({slides,createPicture,mediaItem,intervalMs:data.intervalMs,ui:data.mobileUi}));
 const heading=document.createElement('h1');heading.className='visually-hidden';
 heading.textContent=document.title;section.append(heading);
 return section;
}
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
  .replace(/,\n  import\('\.\/mobile\/reboot-shell-v1-43-29\.js\?v=1\.51'\),\n  import\('\.\/mobile\/reboot-quality-v1-43-29\.js\?v=1\.51'\)/,'')
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
 shell.platform=platform;
 return JSON.stringify(shell,null,2)+'\n';
}
function branchIndex(){return '<!doctype html>\n<html lang="hu">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<script type="module" src="js/site-bootstrap-v149.js?v=1.51"></script>\n</head>\n<body></body>\n</html>\n'}
function branchManifest(target,platform){
 write(target,'release-manifest.json',JSON.stringify({
  schemaVersion:'1.0.0',release:name,date:'2026-11-22',ftpCompatible:true,
  bootstrap:'CDN bootstrap@5.3.9',platform,
  notes:`1.51 különálló ${platform} futtatókörnyezet. Az oldalak, a képek, a CSS-ek és a JS-modulok a platformmappából töltődnek. A kanonikus JSON-tartalom a source/ könyvtárból generálható újra.`,
  files:inventory(target)
 },null,2)+'\n');
}

for(const platform of ['mobile','desktop']){
 const target=safeGenerated(platform);
 for(const folder of ['assets','css','js','json','tools','reports'])copy(folder,target);
 copy(platform,target,platform);
 for(const file of ['script.js','service-worker.js','offline.html'])copy(file,target);
 write(target,'index.html',branchIndex());
 write(target,'js/app.js',specializedApp(platform));
 write(target,'js/hero-2026.js',platform==='mobile'?platformHeroMobile():desktopHero());
 write(target,'js/round13-network.js',networkScript(platform));
 if(platform==='desktop')write(target,'script.js',desktopScript());
 write(target,'json/site-shell.json',branchShell(platform));
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
 ` .map(path=>'./'+PLATFORM+'/'+path.slice(2))];`;
const rootWorker=originalWorker
 .replace("const RELEASE_ID='1.51';", "const PLATFORM=new URL(self.location.href).searchParams.get('platform')==='desktop'?'desktop':'mobile';\nconst RELEASE_ID='1.51-'+PLATFORM;")
 .replace(coreMatch[0],coreSource)
 .replace("const SCOPE=new URL('./',self.registration.scope);", "const SCOPE=new URL('./',self.registration.scope);")
 .replace("const coreURL=path=>new URL(path,SCOPE);",
  "const coreURL=path=>new URL(path.startsWith('./')?path:'./'+PLATFORM+'/'+path,SCOPE);")
 .replace("appAssets.map(([path])=>'./'+path)","appAssets.map(([path])=>'./'+PLATFORM+'/'+path)")
 .replace("const appAssets=Object.entries(files).filter(([path,meta])=>",
  "const appAssets=Object.entries(files).filter(([path,meta])=>\n    (PLATFORM==='desktop'||!/(?:desktop-hero-fold|desktop-hero-controls)/.test(path))&&")
 // A gyökér /index.html offline is a közös választót indítsa, ne egy
 // közvetlenül kiszolgált branch/index.html-t hibás relatív URL-ekkel.
 .replace("shell.match(coreURL('index.html'),{ignoreSearch:true})",
  "shell.match(new URL('./index.html',SCOPE),{ignoreSearch:true})");
assert.ok(rootWorker.includes("const RELEASE_ID='1.51-'+PLATFORM;"));
write(project,'service-worker.js',rootWorker);
const rootManifest={schemaVersion:'1.0.0',release:name,date:'2026-11-22',ftpCompatible:true,
 bootstrap:'CDN bootstrap@5.3.9',notes:'1.51: egyetlen JSON-vezérelt nyilvános belépési pont és két teljesen külön mobile/ és desktop/ futtatókörnyezet, saját adatokkal és felületi fájlokkal. Kiadásépítés source/ kanonikus adatokból.',
 files:inventory(project)};
write(project,'release-manifest.json',JSON.stringify(rootManifest,null,2)+'\n');
console.log(`1.51 gyökér: ${Object.keys(rootManifest.files).length} SHA-256-ellenőrzött állomány`);
