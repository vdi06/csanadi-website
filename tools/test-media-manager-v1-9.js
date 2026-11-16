/* A médiakezelő tiszta validációs és publikációs működésének helyi regressziós tesztje. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(__dirname,'media-manager-2026.js'),'utf8');
const source=raw.replace(/^import .*;\r?\n/gm,'')
  .replace(/^const MAX_SIZE = await .*;\r?\n/m,'const MAX_SIZE=52428800;\n')
  .replace(/\r?\nstart\(\);\s*$/,'\n');
const fields=new Map();
const field=id=>{if(!fields.has(id))fields.set(id,{value:'',checked:false,disabled:false,textContent:'',dataset:{},hidden:false});return fields.get(id);};
const ctx=vm.createContext({document:{getElementById:field},TextEncoder,TextDecoder,Map,Set,Date,console,Uint8Array,DataView,Int32Array,URL:{},crypto:{randomUUID:()=>String(Math.random())},window:{},fetch:()=>{throw Error('Nem várt hálózati kérés.')}});
vm.runInContext(source,ctx,{filename:'media-manager-2026.js'});
vm.runInContext('mark=()=>{};select=key=>{state.selection=key;};status=()=>{};',ctx);
const state=vm.runInContext('state',ctx);
state.items=[{path:'assets/qr/csanadi-qr-test.svg',_key:'test',_originPath:'assets/qr/csanadi-qr-test.svg',type:'graphic',_removed:false,_dirty:false,_new:false,_publish:false,_wasPublished:false,_rightsChecked:false,tags:[]}];
state.selection='test';
field('mm-parent').value='assets/qr';field('mm-name').value='csanadi-qr-test.svg';field('mm-title').value='';
let passed=0;
function check(label,fn){fn();passed++;console.log('OK',label);}
check('QR útvonal és biztonságos fájlnév',()=>{
  assert.equal(vm.runInContext('canonical("assets/qr/csanadi-qr-test.svg")',ctx),'assets/qr/csanadi-qr-test.svg');
  assert.equal(vm.runInContext('canonical("assets/media/web/responsive/kep.webp")',ctx),'assets/media/web/responsive/kep.webp');
  assert.throws(()=>vm.runInContext('canonical("assets/qr/../test.svg")',ctx),/Érvénytelen/);
});
check('Hibás cím nem módosítja a szerkesztett adatot',()=>{
  assert.throws(()=>vm.runInContext('applyForm()',ctx),/cím kötelező/);
  assert.equal(state.items[0].path,'assets/qr/csanadi-qr-test.svg');
  assert.equal(state.undoStack.length,0);
});
check('Új közzététel nem lehetséges jogosultsági jóváhagyás nélkül',()=>{
  field('mm-title').value='Teszt QR';field('mm-publish').checked=true;
  assert.throws(()=>vm.runInContext('applyForm()',ctx),/jogot/);
  assert.equal(state.items[0]._publish,false);
  assert.equal(state.undoStack.length,0);
});
check('Új grafika nem tehető közzé alternatív szöveg nélkül',()=>{
  field('mm-rights-ok').checked=true;
  for(const [id,value] of Object.entries({'mm-rights-holder':'Sportiskola','mm-rights-license':'Belső engedély','mm-rights-source':'irat-2026-001','mm-rights-reviewer':'Ellenőrző'}))field(id).value=value;
  assert.throws(()=>vm.runInContext('applyForm()',ctx),/alternatív szöveget/);
  assert.equal(state.undoStack.length,0);
});
check('Új publikálás bizonyíték és ellenőrző nélkül megáll',()=>{
  field('mm-alt').value='Kísérleti QR-kód';field('mm-rights-source').value='';
  assert.throws(()=>vm.runInContext('applyForm()',ctx),/bizonyítékot/);
  field('mm-rights-source').value='irat-2026-001';
  assert.equal(state.undoStack.length,0);
});
check('Érvényes adatlap szerkesztése visszavonható állapottal',()=>{
  vm.runInContext('applyForm()',ctx);
  assert.equal(state.items[0]._publish,true);assert.equal(state.items[0]._rightsChecked,true);
  assert.equal(state.items[0]._rightsHolder,'Sportiskola');assert.equal(state.items[0]._rightsSource,'irat-2026-001');
  assert.equal(state.undoStack.length,1);
});
check('A közzététel futtatáskor is ellenőrzi a jogosultságot',()=>{
  const item=state.items[0];item._rightsChecked=false;
  const docs=new Map([['json/mediatar.json',{items:[]}]]);
  ctx.__testDocs=docs;
  assert.throws(()=>vm.runInContext('publicationFor(state.items[0],__testDocs)',ctx),/jogosultságának/);
});
check('Jogállás-szűrő felismeri a korábban kihagyott publikált regisztrálatlan médiát',()=>{
  const item=state.items[0];
  item._publish=true;item._rightsStatus='';item._rightsChecked=false;
  assert.equal(vm.runInContext('rightsNeedsReview(state.items[0])',ctx),true);
  item._rightsStatus='pending';item._rightsChecked=true;
  assert.equal(vm.runInContext('rightsNeedsReview(state.items[0])',ctx),true);
  item._rightsStatus='editor-confirmed';
  assert.equal(vm.runInContext('rightsNeedsReview(state.items[0])',ctx),true);
  item._rightsStatus='cleared';
  assert.equal(vm.runInContext('rightsNeedsReview(state.items[0])',ctx),false);
});
check('A jogállás-szűrés a tényleges felülvizsgálati listában is megjeleníti a hiányokat',()=>{
  const item=state.items[0];item._publish=true;item._rightsStatus='';item._rightsChecked=false;
  for(const [id,val] of Object.entries({'mm-type':'all','mm-usage':'all','mm-review':'rights','mm-filter':''}))field(id).value=val;
  state.manifest={assetReferences:{}};
  assert.equal(vm.runInContext('matchesItem(state.items[0])',ctx),true);
  item._publish=false;item._rightsChecked=false;
  assert.equal(vm.runInContext('matchesItem(state.items[0])',ctx),false);
});
const inv=JSON.parse(fs.readFileSync(path.join(root,'json/assets-inventory.json'),'utf8'));
check('A katalógus minden fizikai assets fájlt lefed',()=>{
  function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.relative(root,path.join(p,e.name)).split(path.sep).join('/')]);}
  const actual=walk(path.join(root,'assets'));
  const indexed=new Set(inv.items.map(x=>x.path));
  assert.equal(actual.length,inv.items.length);
  for(const file of actual)assert(indexed.has(file),'Kimaradt fájl: '+file);
  assert.equal(actual.filter(x=>x.startsWith('assets/qr/')).length,87);
});
console.log(JSON.stringify({passed,failed:0,catalog:inv.items.length}));
