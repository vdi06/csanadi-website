/** M9: eszközprofil, adatforgalom, mobil/desktop visszaállás, fókusz szabályok. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mobileM9Profile,initMobileQualityM9} from '../mobile/mobile-m9-quality-v1-43-14.js';

assert.deepEqual(mobileM9Profile(),{active:true,constrained:false,quiet:false});
assert.deepEqual(mobileM9Profile({mobile:false,saveData:true,reduced:true}),{active:false,constrained:false,quiet:false});
for(const options of [{saveData:true},{effectiveType:'2g'},{effectiveType:'slow-2g'},
 {deviceMemory:2},{hardwareConcurrency:2}]){
 assert.deepEqual(mobileM9Profile(options),{active:true,constrained:true,quiet:true});
}
assert.deepEqual(mobileM9Profile({reduced:true}),{active:true,constrained:false,quiet:true});
assert.equal(mobileM9Profile({effectiveType:'4g',deviceMemory:8,hardwareConcurrency:8}).quiet,false);

class MockNode {
 constructor(attrs={}){this.attrs=new Map(Object.entries(attrs));this.dataset={};this.loading='';this.decoding='';
  this.autoplay=this.attrs.has('autoplay');this.paused=true;this.pauseCalls=0;}
 getAttribute(name){return this.attrs.get(name)??null;}
 hasAttribute(name){return this.attrs.has(name);}
 setAttribute(name,value){this.attrs.set(name,String(value));}
 removeAttribute(name){this.attrs.delete(name);}
 closest(){return null;}
 pause(){this.paused=true;this.pauseCalls++;}
}
const lazy=new MockNode(),eager=new MockNode({loading:'eager'}),priority=new MockNode({fetchpriority:'high'});
const video=new MockNode({autoplay:''});
const root={dataset:{},removeAttribute(name){if(name==='data-cs-mobile-motion')delete this.dataset.csMobileMotion;
 if(name==='data-cs-mobile-network')delete this.dataset.csMobileNetwork;}};
const listeners=new Map(),wListeners=new Map(),mListeners=new Map();
const mobile={matches:true,addEventListener(type,fn){mListeners.set('mobile:'+type,fn)}};
const reduced={matches:false,addEventListener(type,fn){mListeners.set('reduced:'+type,fn)}};
const connection={saveData:true,effectiveType:'3g',addEventListener(type,fn){mListeners.set('network:'+type,fn)}};
globalThis.document={documentElement:root,hidden:false,
 addEventListener(type,fn){listeners.set(type,fn)},
 querySelectorAll(selector){if(selector==='#app img')return [lazy,eager,priority];
  if(selector==='#app video[autoplay]')return video.hasAttribute('autoplay')?[video]:[];
  if(selector==='#app video[data-cs-m9-autoplay="1"]')return video.dataset.csM9Autoplay==='1'?[video]:[];
  if(selector==='#app video')return [video];return [];}};
globalThis.window={addEventListener(type,fn){wListeners.set(type,fn)}};
globalThis.matchMedia=query=>query.includes('prefers-reduced-motion')?reduced:mobile;
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{connection,deviceMemory:4,hardwareConcurrency:6}});
globalThis.requestAnimationFrame=callback=>callback();
const api=initMobileQualityM9();initMobileQualityM9();
assert.equal(wListeners.size,2,'Az inicializálás csak egyszer regisztrálhatja a figyelőket');
assert.equal(root.dataset.csMobileNetwork,'constrained');
assert.equal(root.dataset.csMobileMotion,'reduced');
assert.equal(lazy.loading,'lazy');assert.equal(lazy.decoding,'async');
assert.equal(eager.loading,'');assert.equal(priority.loading,'');
assert.equal(video.hasAttribute('autoplay'),false);
assert.equal(video.dataset.csM9Autoplay,'1');
connection.saveData=false;mListeners.get('network:change')();
assert.equal(video.hasAttribute('autoplay'),true,'Feloldott adatkorlátozásnál álljon vissza a videó eredeti beállítása');
assert.equal(root.dataset.csMobileNetwork,'normal');
document.hidden=true;video.paused=false;listeners.get('visibilitychange')();
assert.equal(video.pauseCalls,1);
mobile.matches=false;mListeners.get('mobile:change')();
assert.equal(root.dataset.csMobileMotion,undefined);
assert.equal(root.dataset.csMobileNetwork,undefined);
assert.equal(api.profile().active,false);

const css=readFileSync(new URL('../mobile/mobile-m9-quality-v1-43-14.css',import.meta.url),'utf8');
for(const marker of ['focus-visible','min-height:44px','font-size:max(16px','prefers-contrast:more',
 'prefers-reduced-motion:reduce','forced-colors:active','orientation:landscape'])assert.ok(css.includes(marker),marker);
assert.ok(!/content-visibility:auto[^}]*canvas/.test(css),'A PDF/diagram vásznakat tilos tartalmilag kihagyni');
assert.ok([...css.matchAll(/@media\s+[^{}]+\{/g)].every(m=>m[0].includes('max-width:768px')));
assert.equal([...css].reduce((n,ch)=>n+(ch==='{')-(ch==='}'),0),0);
console.log('M9 ellenőrzés: eszközprofilok, kímélés, képek, videó helyreállítás, desktop és kontraszt/mozgás OK');
