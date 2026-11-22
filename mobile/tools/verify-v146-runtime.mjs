/** 1.46: dinamikusan indított korábbi szkriptek regressziója. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const base=path.resolve(import.meta.dirname,'..');
const script=fs.readFileSync(path.join(base,'js/round12-media-performance.js'),'utf8');

for(const state of ['loading','interactive','complete']){
 let frames=0,observers=0,domReady=null,routeReady=null;
 const image={localName:'img',attributes:{},closest(){return null},
  hasAttribute(key){return Object.hasOwn(this.attributes,key)},
  set loading(value){this.attributes.loading=value},
  set decoding(value){this.attributes.decoding=value},
  set fetchPriority(value){this.attributes.fetchpriority=value}};
 const document={readyState:state,body:{},
  addEventListener(type,callback){if(type==='DOMContentLoaded')domReady=callback;
   if(type==='csanadi:route-rendered')routeReady=callback},
  querySelectorAll(selector){assert.equal(selector,'video,img');return [image]}};
 class MutationObserver{constructor(callback){assert.equal(typeof callback,'function')}
  observe(body,options){assert.equal(body,document.body);assert.equal(options.subtree,true);observers++}}
 const context={document,MutationObserver,WeakSet,requestAnimationFrame(callback){frames++;callback()}};
 vm.runInNewContext(script,context,{filename:'round12-media-performance.js'});
 if(state==='loading'){
  assert.equal(frames,0,'A hagyományos korai szkript még DOM-ra várhat');
  assert.equal(typeof domReady,'function');domReady();
 }else assert.equal(domReady,null,'A későn betöltött szkript nem várhat már elmúlt eseményre');
 assert.equal(frames,1);assert.equal(observers,1);
 assert.equal(image.attributes.decoding,'async');
 assert.equal(image.attributes.loading,'lazy');
 assert.equal(image.attributes.fetchpriority,'low');
 routeReady();assert.equal(frames,2,'Új DOM-tartalom megjelenésekor újra ellenőriz');
}

const worker=fs.readFileSync(path.join(base,'service-worker.js'),'utf8');
assert.match(worker,/RELEASE_ID='1\.46'/);
for(const asset of ['json/site-shell.json','json/offline-shell.json',
 'js/site-bootstrap-v146.js','js/offline-bootstrap-v146.js','js/json-dom-v146.js']){
 assert.ok(worker.includes("'./"+asset+"'"),'Offline gyorsítótárból hiányzik: '+asset);
}
console.log('1.46 FUTÁS PASS – korai és késői médiakezelés, új 1.46 offline váz');

let versionSource=fs.readFileSync(path.join(base,'js/round13-network.js'),'utf8');
versionSource=versionSource.replace(/\}\)\(\);\s*$/,
 'globalThis.__versionCheck={loadedVersion,parseVersion,newer};})();');
const versionContext={URL,location:{href:'https://example.invalid/'},
 document:{currentScript:{src:'https://example.invalid/js/round13-network.js?v=csanadi-r-v1.46'},readyState:'loading'},
 window:{addEventListener(){}}};
vm.runInNewContext(versionSource,versionContext,{filename:'round13-network.js'});
const {loadedVersion,parseVersion,newer}=versionContext.__versionCheck;
assert.equal(loadedVersion,'csanadi-r-v1.46');
assert.deepEqual([...parseVersion(loadedVersion).sem],[1,46,0]);
assert.equal(newer('csanadi-r-v1.46','csanadi-r-v1.45'),true);
assert.equal(newer('csanadi-r-v1.46','csanadi-r-v1.43.33'),true);
assert.equal(newer('csanadi-r-v1.45','csanadi-r-v1.46'),false);
assert.equal(newer('csanadi-r-v1.46','csanadi-r-v1.46'),false);
console.log('1.46 VERZIÓ PASS – frissítés 1.45 és korábbi kiadásokról');
