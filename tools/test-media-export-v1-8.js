/* Valós helyi JSON-/állományadatokkal végzett, fájlírás nélküli médiakezelő próba. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(__dirname,'media-manager-2026.js'),'utf8');
const source=raw.replace(/^import .*;\r?\n/gm,'')
  .replace(/^const MAX_SIZE = await .*;\r?\n/m,'const MAX_SIZE=52428800;\n')
  .replace(/\r?\nstart\(\);\s*$/,'\n');
const fields=new Map();
function element(id){if(!fields.has(id))fields.set(id,{value:'all',checked:false,textContent:'',dataset:{},disabled:false,hidden:false,files:[],addEventListener(){},replaceChildren(){},append(){}});return fields.get(id);}
const browserFetch=async url=>{
  const rel=String(url).replace(/^\.\.\//,'').split(/[?#]/)[0];
  if(!/^(?:assets|json|css|js|tools)\//.test(rel))return {ok:false,status:404};
  const file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return {ok:false,status:404};
  const data=fs.readFileSync(file);
  return {ok:true,status:200,json:async()=>JSON.parse(data.toString()),text:async()=>data.toString(),arrayBuffer:async()=>Uint8Array.from(data).buffer};
};
const context=vm.createContext({
  document:{getElementById:element},window:{addEventListener(){},confirm:()=>true,showDirectoryPicker:null},
  crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,DataView,Int32Array,Map,Set,Date,console,
  structuredClone,fetch:browserFetch,URL:{},File:globalThis.File,Blob:globalThis.Blob
});
vm.runInContext(source,context,{filename:'media-manager-2026.js'});
vm.runInContext('renderList=()=>{};renderStats=()=>{};select=key=>{state.selection=key;};',context);
const state=vm.runInContext('state',context);
const checks={};
async function run(name,fn){await fn();checks[name]=true;console.log('OK',name);}
async function main(){
  element('mm-filter').value='';
  for(const id of ['mm-type','mm-usage','mm-review','mm-order'])element(id).value='all';
  await run('628 fájl és jogállás betöltése',async()=>{
    await vm.runInContext('start()',context);
    assert.equal(state.items.length,628);
    assert(state.items.some(x=>x._rightsStatus==='pending'));
  });
  await run('Jogállás szűrő éles indexen',async()=>{
    const pending=state.items.find(x=>x._rightsStatus==='pending');
    element('mm-review').value='rights';
    assert.equal(vm.runInContext('matchesItem(state.items.find(x=>x.path===__samplePath))',Object.assign(context,{__samplePath:pending.path})),true);
    const notPending=state.items.find(x=>!['pending','preview-only'].includes(x._rightsStatus));
    assert.equal(vm.runInContext('matchesItem(state.items.find(x=>x.path===__samplePath))',Object.assign(context,{__samplePath:notPending.path})),false);
    element('mm-review').value='all';
  });
  await run('QR-kód átnevezése minden JSON-hivatkozásban',async()=>{
    const qrIndex='json/adatok/qr-index-22.json';
    const original='assets/qr/csanadi-qr-06b6013647d5dabb.svg';
    const newPath='assets/qr/csanadi-qr-regresszios-teszt.svg';
    assert(state.manifest.jsonFiles.includes(qrIndex));
    assert(state.manifest.assetReferences[original].includes(qrIndex));
    const item=state.items.find(x=>x.path===original);
    assert(item);
    const before={path:item.path,dirty:item._dirty,size:item.sizeBytes,sha:item.sha256};
    item.path=newPath;item._dirty=true;
    try{
      const {output}=await vm.runInContext('prepareExport(false)',context);
      assert(output.has(qrIndex));
      const qr=JSON.parse(output.get(qrIndex));
      const targets=JSON.stringify(qr);
      assert(targets.includes(newPath));
      assert(!targets.includes(original));
      assert(output.has(newPath));
    }finally{
      Object.assign(item,{path:before.path,_dirty:before.dirty,sizeBytes:before.size,sha256:before.sha});
    }
  });
  await run('Új kép létrehozása és jóváhagyott metadata',async()=>{
    const file={name:'csanadi-test-media.webp',size:6,arrayBuffer:async()=>new Uint8Array([82,73,70,70,0,1]).buffer};
    context.__newFile=file;
    await vm.runInContext('fileArray([__newFile])',context);
    const added=state.items.find(x=>x._new);
    assert(added);
    element('mm-title').value='Tesztmédia';element('mm-name').value='csanadi-test-media.webp';element('mm-parent').value='assets/media/web';
    element('mm-alt').value='Szimulált tesztkép';element('mm-description').value='Helyi regressziós próba, nem publikálandó';
    element('mm-category').value='teszt';element('mm-tags').value='regresszio';
    element('mm-rights-holder').value='Intézményi archívum';element('mm-rights-license').value='Intézményi belső engedély';
    element('mm-rights-source').value='irat-2026-teszt';element('mm-rights-reviewer').value='Helyi teszt';
    element('mm-publish').checked=true;element('mm-rights-ok').checked=true;
    vm.runInContext('applyForm()',context);
    assert.equal(added._publish,true);assert.equal(added._rightsChecked,true);
  });
  await run('Kiadási ZIP tartalmának előkészítése valódi JSON-okkal',async()=>{
    const result=await vm.runInContext('prepareExport(false)',context);
    assert(result.output.has('assets/media/web/csanadi-test-media.webp'));
    assert(result.output.has('json/assets-inventory.json'));
    assert(result.output.has('json/mediatar.json'));
    assert(result.output.has('json/adatok/kepgaleria.json'));
    const rawJson=result.output.get('json/adatok/kepgaleria.json');
    const gallery=JSON.parse(typeof rawJson==='string'?rawJson:new TextDecoder().decode(rawJson));
    assert(gallery.items.some(x=>x.src==='assets/media/web/csanadi-test-media.webp'));
    const mediatar=JSON.parse(result.output.get('json/mediatar.json'));
    assert(mediatar.items.some(x=>x.original?.path==='assets/media/web/csanadi-test-media.webp'&&x.rights?.clearance==='editor-confirmed'));
    assert(mediatar.items.some(x=>x.original?.path==='assets/media/web/csanadi-test-media.webp'&&x.rights?.source==='irat-2026-teszt'&&x.rights?.institutionallyApproved===false));
  });
  await run('Törlésre jelölés és tiszta, újrakészíthető kiadás',async()=>{
    vm.runInContext('deleteItem()',context);
    const result=await vm.runInContext('prepareExport(false)',context);
    assert(!result.output.has('assets/media/web/csanadi-test-media.webp'));
    assert(!JSON.parse(result.output.get('json/assets-inventory.json')).items.some(x=>x.path==='assets/media/web/csanadi-test-media.webp'));
    vm.runInContext('undo()',context);
    assert(state.items.some(x=>x.path==='assets/media/web/csanadi-test-media.webp'&&!x._removed));
  });
  console.log(JSON.stringify({passed:Object.keys(checks).length,failed:0,checks}));
}
main().catch(e=>{console.error('FAIL',e.stack||e);process.exitCode=1;});
