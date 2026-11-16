'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('js/round26-arrival.js');
const begin=source.indexOf('function theme(){'),end=source.indexOf('function mapAndArrival()',begin);
assert.ok(begin>=0&&end>begin);
const tests=[];
function check(name,fn){try{fn();tests.push({name,ok:true});}catch(error){tests.push({name,ok:false,error:error.message});}}
const saved=new Map(),listeners=new Map(),button={textContent:'',attrs:{},addEventListener(type,handler){listeners.set('button:'+type,handler)},setAttribute(name,value){this.attrs[name]=value}};
const html={dataset:{},attrs:{},setAttribute(name,value){this.attrs[name]=value}};
const mq={matches:true,addEventListener(type,handler){listeners.set('media:'+type,handler)}};
const context=vm.createContext({document:{getElementById:id=>id==='r26-theme'?button:null,documentElement:html,hidden:false,addEventListener:(type,handler)=>listeners.set('document:'+type,handler)},
 localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)},
 matchMedia:()=>mq,addEventListener:(type,handler)=>listeners.set('window:'+type,handler)});
vm.runInContext('const $=id=>document.getElementById(id);'+source.slice(begin,end)+'theme();',context);
check('automatikus mód sötét rendszerbeállítással',()=>{assert.equal(html.dataset.theme,'dark');assert.equal(html.dataset.themePreference,'system')});
check('gombbal világos módra váltás',()=>{listeners.get('button:click')();assert.equal(html.dataset.theme,'light');assert.equal(saved.get('csanadi-theme'),'light')});
check('kézi világos mód nem változik a rendszerrel',()=>{mq.matches=false;listeners.get('media:change')();assert.equal(html.dataset.theme,'light')});
check('gombbal sötét módra váltás',()=>{listeners.get('button:click')();assert.equal(html.dataset.theme,'dark')});
check('automatikus mód helyreállítása',()=>{listeners.get('button:click')();assert.equal(html.dataset.themePreference,'system');assert.equal(html.dataset.theme,'light')});
check('rendszer sötét módra váltását követi',()=>{mq.matches=true;listeners.get('media:change')();assert.equal(html.dataset.theme,'dark')});
check('telefon visszatérésekor a tárolt preferenciát újraolvassa',()=>{saved.set('csanadi-theme','light');listeners.get('window:pageshow')();assert.equal(html.dataset.theme,'light');saved.delete('csanadi-theme');listeners.get('document:visibilitychange')();assert.equal(html.dataset.theme,'dark')});
check('külső ablakban világosra állítást követi',()=>{saved.set('csanadi-theme','light');listeners.get('window:storage')({key:'csanadi-theme'});assert.equal(html.dataset.theme,'light')});
check('külső módváltás után a gomb a következő módra lép',()=>{listeners.get('button:click')();assert.equal(html.dataset.theme,'dark');assert.equal(saved.get('csanadi-theme'),'dark')});
check('tároló törlése után automatikusra vált',()=>{saved.delete('csanadi-theme');listeners.get('window:storage')({key:null});assert.equal(html.dataset.themePreference,'system')});
check('Bootstrap színmódja mindig szinkronban marad',()=>{assert.equal(html.attrs['data-bs-theme'],html.dataset.theme)});
check('egyéb segédoldalak is követik a tároló változásait',()=>{assert.ok(read('js/guide-theme-2026.js').includes("addEventListener('storage'"));assert.ok(read('tools/tool-ui-2026.js').includes("addEventListener('storage'"))});
const failed=tests.filter(x=>!x.ok);console.log(JSON.stringify({version:'1.24.0',total:tests.length,passed:tests.length-failed.length,failed}));if(failed.length)process.exitCode=1;
