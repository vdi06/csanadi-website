/** Az 1.45 öt fejlesztési területének célzott, ismételhető kapui. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {mobileSocialFallback,mobileSocialLinks} from '../mobile/reboot-shell-v1-43-29.js';
import {mobileActionIsVisible} from '../mobile/reboot-quality-v1-43-29.js';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function gate(label,fn){awaited.push(Promise.resolve().then(fn).then(()=>console.log(label+' PASS')));}
const awaited=[];

gate('1.45/A – mobilos közösségi linkek sérült adatnál',()=>{
 const data=[{platform:'Facebook',status:'published',schoolVerified:true,
  url:'https://www.facebook.com/ellenorzott',label:'Ellenőrzött Facebook'},
  {platform:'Instagram',status:'published',schoolVerified:true,url:'javascript:alert(1)'}];
 const result=mobileSocialLinks(data);
 assert.equal(result.length,2);
 assert.equal(result[0].label,'Ellenőrzött Facebook');
 assert.equal(result[1].url,mobileSocialFallback[1].url);
 assert.deepEqual(mobileSocialLinks([]),[...mobileSocialFallback]);
 assert.deepEqual(mobileSocialLinks([{platform:'Facebook',status:'draft',schoolVerified:true,
  url:'https://example.invalid'}]),[...mobileSocialFallback]);
});

gate('1.45/B – rejtett billentyűzetes célpontok',()=>{
 const node={disabled:false,hidden:false,getAttribute:()=>null,closest:()=>null,
  getClientRects:()=>[{width:40}]};
 const previous=globalThis.getComputedStyle;
 try{
  globalThis.getComputedStyle=()=>({visibility:'visible',display:'block',contentVisibility:'visible'});
  assert.equal(mobileActionIsVisible(node),true);
  globalThis.getComputedStyle=()=>({visibility:'hidden',display:'block',contentVisibility:'visible'});
  assert.equal(mobileActionIsVisible(node),false);
  globalThis.getComputedStyle=()=>({visibility:'visible',display:'block',contentVisibility:'hidden'});
  assert.equal(mobileActionIsVisible(node),false);
  assert.equal(mobileActionIsVisible({...node,getAttribute:key=>key==='aria-disabled'?'true':null}),false);
 }finally{globalThis.getComputedStyle=previous;}
});

gate('1.45/C – két- és háromtagú offline verziók migrációja',async()=>{
 const oldTwo='csanadi-r-v1.44-offline',oldThree='csanadi-r-v1.43.33-offline';
 const maps=new Map([[oldTwo,new Map([['/iskolank','old-v144']])],
  [oldThree,new Map([['/kapcsolat','old-v14333']])]]);
 const caches={
  async open(name){if(!maps.has(name))maps.set(name,new Map());const data=maps.get(name);
   return {keys:async()=>[...data.keys()],match:async key=>data.get(key),
    put:async(key,value)=>data.set(key,value)};},
  async delete(name){return maps.delete(name);}
 };
 const sandbox={URL,caches,console,self:{registration:{scope:'https://example.invalid/'},addEventListener(){}}};
 vm.runInNewContext(read('service-worker.js')+'\nglobalThis.runMigration=migrateReader;',sandbox);
 await sandbox.runMigration([oldTwo,oldThree,'csanadi-shell-1.44']);
 const saved=maps.get('csanadi-user-offline-pages');
 assert.equal(saved.get('/iskolank'),'old-v144');
 assert.equal(saved.get('/kapcsolat'),'old-v14333');
 assert.equal(maps.has(oldTwo),false);assert.equal(maps.has(oldThree),false);
});

gate('1.45/D – verziózott betöltés és reszponzív stílus',()=>{
 const html=read('index.html'),app=read('js/app.js'),sw=read('service-worker.js');
 assert.match(html,/css\/v145-polish\.css\?v=1\.45/);
 assert.match(html,/mobile\/reboot-design-v1-43-29\.css\?v=1\.45/);
 assert.match(html,/round13-network\.js\?v=csanadi-r-v1\.45/);
 assert.match(app,/\(\?:\\\.\\d\+\)\?/,'Az oldal szerkesztői verziója elfogad háromtagút is');
 assert.match(sw,/RELEASE_ID='1\.45'/);
 assert.equal(JSON.parse(read('json/config.json')).performance.cacheVersion,'csanadi-r-v1.45');
});

gate('1.45/E – akadálymentes modál és keresési célpont',()=>{
 const viewer=read('js/site-viewers-v1-43-3.js'),app=read('js/app.js'),css=read('css/v145-polish.css');
 assert.match(viewer,/setAttribute\('role', 'dialog'\)/);
 assert.match(viewer,/typeof MutationObserver === 'function'/);
 assert.match(viewer,/inerted = \[\]/);
 assert.match(app,/function visibleDialogControls/);
 assert.match(app,/target\.addEventListener\('blur',\(\)=>target\.removeAttribute\('tabindex'\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/max-width:768px/);
 assert.match(css,/forced-colors:active/);
});

await Promise.all(awaited);
for(const file of ['verify-reboot-hero.mjs','verify-reboot-shell.mjs',
 'verify-reboot-menu.mjs','verify-reboot-quality.mjs','verify-m13-viewer-dom.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',file)],{stdio:'inherit',timeout:60000});
}
console.log('1.45 PASS – öt célzott fejlesztési kapu és öt meglévő DOM-regresszió');
