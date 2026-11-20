/** M15.4: a közös frissítő érdemi DOM/állapotpróbája hálózat nélkül.
 * A teszt nem valós Service Worker vagy iOS/Android PWA-frissítés. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const source=fs.readFileSync(path.join(root,'js/round13-network.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'mobile/reboot-design-v1-43-26.css'),'utf8');
const scriptTag=/src="js\/round13-network\.js\?v=([^"]+)"/.exec(html);
assert.ok(scriptTag,'A tényleges forrásszkript verziója elérhető');
assert.match(css,/#cs-release-notice\[hidden\]\{display:none!important\}/);
assert.match(css,/#cs-release-notice\{display:grid!important;justify-items:center!important/);

function caseFor({found,stored=[]}={}){
 const elements=new Map(),session=new Map(stored),events=new Map();
 let replaced='';
 const make=tag=>({tagName:tag,hidden:false,children:[],events:{},
  textContent:'',className:'',attributes:{},
  setAttribute(name,value){this.attributes[name]=String(value)},
  addEventListener(name,listener){this.events[name]=listener},
  append(...children){this.children.push(...children)},
  replaceChildren(...children){this.children=children},
  click(){this.events.click?.()}});
 const document={readyState:'complete',hidden:false,
  currentScript:{src:'https://preview.example/js/round13-network.js?v='+scriptTag[1]},
  body:{append(node){elements.set(node.id,node)}},
  getElementById(id){return elements.get(id)||null},
  createElement:make,addEventListener(name,fn){events.set(name,fn)}};
 const location={href:'https://preview.example/index.html?local=1',
  replace(value){replaced=value}};
 const ctx={document,location,URL,console,
  window:{isSecureContext:false,addEventListener(name,fn){events.set(name,fn)}},
  navigator:{},setInterval:()=>1,setTimeout:()=>1,
  sessionStorage:{getItem:key=>session.get(key)||null,setItem:(key,value)=>session.set(key,value)},
  fetch:async()=>({ok:true,json:async()=>({performance:{cacheVersion:found,
   swUpdateCheckSeconds:300}})})};
 vm.runInNewContext(source,ctx,{filename:'round13-network.js',timeout:1000});
 return {elements,session,events,get redirected(){return replaced}};
}
const tick=async()=>{for(let i=0;i<8;i++)await Promise.resolve()};
// Csak szimulált, a kiadásnál újabb célverzió: nem készül tényleges v1.43.27 kiadás.
const latest='csanadi-r-v1.43.27';
const available=caseFor({found:latest});await tick();
const banner=available.elements.get('cs-release-notice');
assert.ok(banner,'Újabb verziónál értesítés jelenik meg');
assert.equal(banner.hidden,false);
assert.equal(banner.children.length,2);
const [later,reload]=banner.children[1].children;
assert.equal(later.textContent,'Később');
assert.equal(reload.textContent,'Frissítés');
later.click();assert.equal(banner.hidden,true,'Később után azonnal eltűnik');
assert.equal(available.session.get('csanadi-dismissed-release'),latest);

const accepted=caseFor({found:latest,
 stored:[['csanadi-accepted-release',latest]]});await tick();
assert.equal(accepted.elements.size,0,'Elfogadott kiadás nem jelenik meg ismét');
const dismissed=caseFor({found:latest,
 stored:[['csanadi-dismissed-release',latest]]});await tick();
assert.equal(dismissed.elements.size,0,'Elhalasztott kiadás nem jelenik meg ismét');

const refreshing=caseFor({found:latest});await tick();
refreshing.elements.get('cs-release-notice').children[1].children[1].click();
await tick();
assert.equal(refreshing.elements.get('cs-release-notice').hidden,true,
 'Frissítéskor a panel azonnal eltűnik');
assert.equal(refreshing.session.get('csanadi-accepted-release'),latest);
assert.equal(new URL(refreshing.redirected).searchParams.get('release'),latest,
 'A frissítés verzióazonosítóval tölt újra');

const same=caseFor({found:scriptTag[1]});await tick();
assert.equal(same.elements.size,0,'Azonos verzióhoz nem jelenik meg frissítés');

const worker=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
const swListeners=new Map();let skipCount=0,waitCount=0;
const self={registration:{scope:'https://preview.example/'},
 clients:{claim:async()=>{}},skipWaiting:async()=>{skipCount++},
 addEventListener(name,listener){swListeners.set(name,listener)}};
vm.runInNewContext(worker,{self,URL,console},{filename:'service-worker.js',timeout:1000});
for(const name of ['install','message','activate','fetch'])
 assert.ok(swListeners.has(name),`${name} Service Worker esemény`);
swListeners.get('message')({data:{type:'ACTIVATE_UPDATE'},
 waitUntil(p){waitCount++;assert.equal(typeof p?.then,'function')}});
assert.equal(skipCount,1,'Frissítéshez explicit aktiválás kell');
assert.equal(waitCount,1);
swListeners.get('message')({data:{type:'UNRELATED'},waitUntil(){waitCount++}});
assert.equal(skipCount,1,'Nem kapcsolódó üzenet nem aktiválhat');
let responded=false;
swListeners.get('fetch')({request:{method:'POST',url:'https://preview.example/post'},
 respondWith(){responded=true}});
swListeners.get('fetch')({request:{method:'GET',url:'https://elsewhere.example/json/config.json'},
 respondWith(){responded=true}});
assert.equal(responded,false,'A SW más eredetet és POST kérést nem foghat el');
console.log('M15.4 PWA DOM/állapotkapu: Később, elfogadott, frissítés, SW explicit aktiválás és scope OK; valós eszközös frissítés nyitott');
