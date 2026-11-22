/** Új mobilprofilok, billentyűzetes szűrés, adatforgalom és desktop állapot. */
import assert from 'node:assert/strict';
import {mobileIndexForKey,mobileResourceProfile,mobileActionIsVisible,initFreshMobileQuality}
 from '../mobile/reboot-quality-v1-43-29.js';
assert.equal(mobileIndexForKey(0,4,'ArrowLeft'),3);
assert.equal(mobileIndexForKey(3,4,'ArrowRight'),0);
assert.equal(mobileIndexForKey(2,4,'Home'),0);
assert.equal(mobileIndexForKey(0,4,'End'),3);
assert.equal(mobileIndexForKey(1,4,'Tab'),-1);
assert.equal(mobileIndexForKey(0,0,'End'),-1);
assert.deepEqual(mobileResourceProfile({mobile:false,saveData:true}),{active:false,limited:false,quiet:false});
assert.deepEqual(mobileResourceProfile({mobile:true,motion:true}),{active:true,limited:false,quiet:true});
assert.deepEqual(mobileResourceProfile({memory:2}),{active:true,limited:true,quiet:true});
assert.deepEqual(mobileResourceProfile({network:'slow-2g'}),{active:true,limited:true,quiet:true});
assert.equal(mobileActionIsVisible({hidden:true}),false);
assert.equal(mobileActionIsVisible({disabled:true}),false);
assert.equal(mobileActionIsVisible({getAttribute:()=> 'true'}),false);
assert.equal(mobileActionIsVisible({getAttribute:()=>null,getClientRects:()=>[]}),false,
 'M22: a CSS-sel elrejtett Bootstrap gombot ne válassza ki a billentyűnavigáció');
assert.equal(mobileActionIsVisible({getAttribute:()=>null,getClientRects:()=>[{width:42}]}),true);

const documentListeners=new Map(),windowListeners=new Map(),mediaListeners=new Map();
const root={dataset:{},flags:new Set(),toggleAttribute(name,condition){
 if(condition)this.flags.add(name);else this.flags.delete(name);}};
const img={attrs:new Map(),loading:'',decoding:'',isConnected:true,closest:()=>null,
 getAttribute(name){return this.attrs.get(name)??null},hasAttribute(name){return this.attrs.has(name)},
 setAttribute(name,value){this.attrs.set(name,String(value))},
 removeAttribute(name){this.attrs.delete(name)}};
const video={attrs:new Set(['autoplay']),autoplay:true,isConnected:true,paused:true,
 setAttribute(name){this.attrs.add(name)},removeAttribute(name){this.attrs.delete(name)},
 pause(){this.paused=true},getAttribute(name){return this.attrs.has(name)?'':null}};
const scroller={attrs:new Map(),scrollWidth:510,clientWidth:300,isConnected:true,
 getAttribute(name){return this.attrs.get(name)??null},hasAttribute(name){return this.attrs.has(name)},
 setAttribute(name,value){this.attrs.set(name,String(value))},removeAttribute(name){this.attrs.delete(name)}};
const viewerCaption={attrs:new Map(),isConnected:true,
 getAttribute(name){return this.attrs.get(name)??null},hasAttribute(name){return this.attrs.has(name)},
 setAttribute(name,value){this.attrs.set(name,String(value))},removeAttribute(name){this.attrs.delete(name)}};
const mobile={matches:true,addEventListener(name,fn){mediaListeners.set('mobile',fn)}};
const reduce={matches:false,addEventListener(name,fn){mediaListeners.set('reduce',fn)}};
const connection={saveData:true,effectiveType:'4g',addEventListener(name,fn){mediaListeners.set('network',fn)}};
const buttons=[];
const app={};
const group={querySelectorAll:()=>buttons,closest:()=>app,isConnected:true};
const makeButton=text=>({textContent:text,hidden:false,isConnected:true,attributes:new Map(),
 getAttribute(name){return this.attributes.get(name)??null},
 closest:()=>group,focus(){globalThis.focused=this}});
buttons.push(makeButton('Sport'),makeButton('Közösség'));
globalThis.document={documentElement:root,hidden:false,activeElement:null,
 addEventListener(name,fn){documentListeners.set(name,fn)},
 querySelectorAll(selector){if(selector==='#app img')return[img];
 if(selector.startsWith('#app .hub26-calendar,'))return[scroller];
 if(selector==='.cs43-image-viewer .cs43-gallery-caption')return[viewerCaption];
 if(selector==='#app video[autoplay]')return video.attrs.has('autoplay')?[video]:[];
 if(selector==='#app video')return[video];return[]}};
globalThis.window={addEventListener(name,fn){windowListeners.set(name,fn)},innerHeight:800};
globalThis.matchMedia=query=>query.includes('reduced-motion')?reduce:mobile;
Object.defineProperty(globalThis,'navigator',{value:{connection,deviceMemory:6,hardwareConcurrency:8},configurable:true});
globalThis.requestAnimationFrame=fn=>fn();
const manager=initFreshMobileQuality();initFreshMobileQuality();
assert.ok(manager?.profile);
assert.equal(windowListeners.size,3);
assert.ok(windowListeners.has('orientationchange'));
assert.ok(windowListeners.has('pageshow'));
assert.equal(img.loading,'lazy');assert.equal(img.decoding,'async');
assert.equal(root.flags.has('data-cs-mb-limited'),true);
assert.equal(video.autoplay,false);assert.equal(video.attrs.has('autoplay'),false);
assert.equal(scroller.attrs.get('tabindex'),'0');
assert.equal(scroller.attrs.get('role'),'region');
assert.match(scroller.attrs.get('aria-label'),/vízszintesen görgethető/);
assert.equal(viewerCaption.attrs.get('aria-live'),'polite');
assert.equal(viewerCaption.attrs.get('aria-atomic'),'true');
connection.saveData=false;mediaListeners.get('network')();
assert.equal(root.flags.has('data-cs-mb-limited'),false);
assert.equal(video.attrs.has('autoplay'),true);
reduce.matches=true;mediaListeners.get('reduce')();
assert.equal(root.flags.has('data-cs-mb-quiet'),true);
assert.equal(video.attrs.has('autoplay'),false,
 'M15: mozgáscsökkentés esetén az automatikus videó is leáll');
reduce.matches=false;mediaListeners.get('reduce')();
assert.equal(video.attrs.has('autoplay'),true,
 'M15: mozgáscsökkentés kikapcsolásakor az eredeti attribútum helyreáll');
windowListeners.get('pageshow')();
let prevented=false;
documentListeners.get('keydown')({target:buttons[1],key:'ArrowRight',preventDefault(){prevented=true}});
assert.equal(globalThis.focused,buttons[0]);assert.equal(prevented,true);
const invisibleButton=makeButton('Rejtett panel');
invisibleButton.getClientRects=()=>[];
buttons.push(invisibleButton);
documentListeners.get('keydown')({target:buttons[1],key:'ArrowRight',preventDefault(){}});
assert.equal(globalThis.focused,buttons[0],
 'M22: rejtett Bootstrap-panel gombja helyett látható elem legyen a következő');
buttons.pop();
mobile.matches=false;mediaListeners.get('mobile')();
assert.equal(root.flags.has('data-cs-mb-quiet'),false);
assert.equal(img.loading,'','Asztali méretre visszaváltva az eredeti képletöltési beállítás álljon helyre');
assert.equal(img.decoding,'','Asztali méretre visszaváltva a dekódolási mód álljon helyre');
assert.equal(img.attrs.size,0,'A mobilos képattribútumok desktopon nem maradhatnak meg');
assert.equal(scroller.attrs.size,0,'Desktop nézetre visszaváltva a mobilos ARIA és tabindex eltűnik');
assert.equal(viewerCaption.attrs.size,0,'Desktop nézetben a galéria élő bejelentése visszaáll');
globalThis.focused=null;
documentListeners.get('keydown')({target:buttons[1],key:'ArrowRight',preventDefault(){}});
assert.equal(globalThis.focused,null,'Desktopon nincs mobilos billentyűvezérlés');
console.log('Új minőségkapu: eszközprofil, lazy képek, videó-visszaállás, nyilak, desktop elkülönítés OK');
