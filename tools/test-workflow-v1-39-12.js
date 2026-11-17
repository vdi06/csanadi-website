/* v1.39.12 – a 23+69 intézményi munkalap működési próbája DOM-szimulátorban.
   Egyetlen írás sem történik HTTP-n vagy a szerveres JSON-állományokba. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const report=JSON.parse(fs.readFileSync(path.join(root,'dokumentacio/TARTALMI_MINOSEG_V1_39_9.json'),'utf8'));
const library=JSON.parse(fs.readFileSync(path.join(root,'json/mediatar.json'),'utf8'));
const code=fs.readFileSync(path.join(__dirname,'tartalmi-hitelesites.js'),'utf8');

class FakeNode{
 constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.value='';this.textContent='';this.dataset={};this.style={};this.disabled=false;this.files=null;}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 addEventListener(name,fn){this.listeners[name]=fn;}
 fire(name){return this.listeners[name]?.({target:this});}
 setAttribute(name,value){this[name]=value;}
 click(){}
 remove(){}
}
const nodes=new Map();
const get=id=>{if(!nodes.has(id))nodes.set(id,new FakeNode('div'));return nodes.get(id);};
get('kind').value='priority';get('state').value='all';
const storage=new Map(),blobs=[],requests=[];
const payloads=new Map([
 ['../dokumentacio/TARTALMI_MINOSEG_V1_39_9.json',report],
 ['../json/mediatar.json',library]
]);
const context=vm.createContext({
 document:{getElementById:get,createElement:tag=>new FakeNode(tag),body:new FakeNode('body')},
 localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,val)=>storage.set(key,val)},
 fetch:async(url,options)=>{requests.push({url,options});assert.equal(options?.cache,'no-store');assert.ok(payloads.has(url),'Váratlan URL: '+url);return{ok:true,json:async()=>payloads.get(url)};},
 URL:{createObjectURL:blob=>{blobs.push(blob);return 'blob:test';},revokeObjectURL(){}},
 Blob,setTimeout:()=>1,clearTimeout(){},confirm:()=>true,console,JSON,Date
});
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const checks=[];
function check(name,fn){try{fn();checks.push({name,ok:true});}catch(error){checks.push({name,ok:false,error:error.message});}}

(async()=>{
 vm.runInContext(code,context);await settle();
 check('A 23 elsőbbségi oldal betöltődik',()=>{
  assert.equal(get('items').children.length,23);
  assert.match(get('status').textContent,/23 \/ 23/);
 });
 check('Minden prioritáshoz jelzi a hiányzó igazoló mezőket',()=>{
  const first=get('items').children[0];
  assert.match(first.children[1].children.at(-1).textContent,/Hiányzó igazoló adatok: ellenőrző/);
 });
 get('kind').value='mediaRights';await get('kind').fire('change');await settle();
 check('69 jogtisztázatlan médiajog jelenik meg',()=>{
  assert.equal(get('items').children.length,69);
  assert.match(get('summary').textContent,/Igazoló mezők kitöltve: 0\/69/);
 });
 const first=()=>get('items').children[0];
 const control=index=>first().children[index].children[0];
 check('Média jogosultság nélkül nem hagyható helyben jóvá',()=>{
  const status=control(2);status.value='approved';status.fire('change');
  assert.equal(status.value,'pending');
  assert.match(get('status').textContent,/jogosultsági adat/);
 });
 for(const [index,value] of [[4,'Intézményi ellenőrző'],[5,'Forrásjegyzék, 2026.11.17.'],[6,'Jogosult írásos engedélye 42/2026'],[7,'Döntési napló 99/2026']]){
  const input=control(index);input.value=value;input.fire('change');
 }
 const status=control(2);status.value='approved';status.fire('change');
 check('A négy kitöltött mező rögzíthető, de csak helyi státuszként',()=>{
  assert.equal(JSON.parse([...storage.values()][0])['media:media:hero'].status,'approved');
  assert.match(get('summary').textContent,/Igazoló mezők kitöltve: 1\/69/);
 });
 get('state').value='missing';get('state').fire('change');
 check('Hiányzó adatokra szűrve 68/69 tétel marad',()=>{
  assert.equal(get('items').children.length,68);
 });
 await get('exportfocus').fire('click');
 const csv=await blobs.at(-1).text();
 check('Az összevont CSV pontosan 23+69 tételt tartalmaz',()=>{
  assert.equal(csv.trim().split('\r\n').length,93);
  assert.match(csv,/Intézményi ellenőrző/);
  assert.match(csv,/Jogosult írásos engedélye 42\/2026/);
  assert.match(get('status').textContent,/92 helyi ellenőrzési tétel exportálva/);
 });
 check('Csak olvasó HTTP-lekérések és helyi mentés történt',()=>{
  assert.equal(requests.length,4);
  assert.ok(requests.every(request=>request.options?.cache==='no-store'));
  assert.equal(report.manualPriorityPages,23);
  assert.equal(library.items.filter(item=>item.rights?.clearance==='pending').length,69);
 });
 const failed=checks.filter(item=>!item.ok);
 console.log(JSON.stringify({release:'1.39.12',checks:checks.length,passed:checks.length-failed.length,failed,httpWrites:0},null,2));
 if(failed.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
