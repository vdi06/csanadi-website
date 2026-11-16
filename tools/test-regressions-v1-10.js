const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(root,'js/round13-network.js'),'utf8');
const source=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
const checks=[];
function verify(name,fn){fn();checks.push(name);}
function networkHarness(remote,store=new Map()){
 const toast={hidden:true,children:[],replaceChildren(...items){this.children=items;},contains(node){return this.children.includes(node);}};
 const createElement=tag=>({tag,children:[],events:{},textContent:'',append(...items){this.children.push(...items);},addEventListener(type,fn){this.events[type]=fn;},click(){this.events.click?.();}});
 const document={currentScript:{src:'https://example.test/js/round13-network.js?v=csanadi-r-v1.10.0'},readyState:'complete',hidden:false,getElementById:id=>id==='toast'?toast:null,createElement,addEventListener(){}};
 const location={href:'https://example.test/',reloads:0,reload(){this.reloads++;}};
 const sessionStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
 const context={document,location,sessionStorage,URL,console,fetch:async()=>({ok:true,json:async()=>({performance:{cacheVersion:remote},runtime:{release:{updateCheckSeconds:300}}})}),window:{isSecureContext:false,setInterval(){}},navigator:{},setTimeout:()=>1,clearTimeout(){}};
 vm.runInNewContext(script,context,{filename:'round13-network.js'});
 return {toast,location,store};
}
async function run(){
 verify('A sikertelen JSON betöltés újrapróbálható marad',()=>{
  assert.match(source,/retry\.addEventListener\('click',\(\)=>renderRoute\(options\)\)/);
  assert.match(source,/app\.replaceChildren\(failure\)/);
 });
 verify('A frissítési lekérdezések egymásra futását két külön őr akadályozza',()=>{
  assert.match(source,/if\(structureChecking\)return structureChecking/);
  assert.match(source,/if\(activePageChecking\)return activePageChecking/);
 });
 verify('Másik útvonalra érkező korábbi JSON válasz nem írja felül az aktuális oldalt',()=>{
  assert.match(source,/if\(getRoute\(\)!==route\|\|catalog\?\.routes\?\.get\(route\)!==item\)return/);
 });
 verify('A hibás vagy visszavont oldal JSON-ja nem kerül be a megjelenített oldalba',()=>{
  assert.match(source,/latest\.lifecycle\?\.status!=='published'/);
  assert.match(source,/latest\.schemaExtensions\?\.route!==route/);
 });
 const storage=new Map();const first=networkHarness('csanadi-r-v1.10.1',storage);
 await new Promise(resolve=>setImmediate(resolve));
 verify('Valóban újabb kiadásnál egyszeri frissítési értesítő jelenik meg',()=>{
  assert.equal(first.toast.hidden,false);
  assert.equal(first.toast.children[1].children.length,2);
 });
 first.toast.children[1].children[1].click();
 verify('Frissítés gomb után az újratöltés először elmenti az értesítő lezárását',()=>{
  assert.equal(first.location.reloads,1);
  assert.equal(storage.get('csanadi-dismissed-release'),'csanadi-r-v1.10.1');
  assert.equal(first.toast.hidden,true);
 });
 const second=networkHarness('csanadi-r-v1.10.1',storage);
 await new Promise(resolve=>setImmediate(resolve));
 verify('Ugyanaz az értesítés a sikertelen újratöltés után sem ragad be',()=>assert.equal(second.toast.hidden,true));
 const same=networkHarness('csanadi-r-v1.10.0');
 await new Promise(resolve=>setImmediate(resolve));
 verify('Azonos kiadásra nem jelenik meg hamis frissítés',()=>assert.equal(same.toast.hidden,true));
 console.log(JSON.stringify({stage:'v1.10.0',passed:checks.length,total:checks.length,checks}));
}
run().catch(error=>{console.error(error);process.exitCode=1;});
