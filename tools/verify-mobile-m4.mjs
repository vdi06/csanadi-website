/** M4/D: folyamatos görgetési állapot, mobil/desktop váltás, nincs új menügomb. */
import assert from 'node:assert/strict';
import {calculateMobileScrollState,initMobileScrollM4} from '../mobile/mobile-scroll-m4-v1-43-10.js';

assert.deepEqual(calculateMobileScrollState({scrollY:0,scrollHeight:3000,viewportHeight:1000,headerHeight:67}),
 {scrolled:false,progress:0,headerHeight:67});
assert.deepEqual(calculateMobileScrollState({scrollY:1000,scrollHeight:3000,viewportHeight:1000,headerHeight:67}),
 {scrolled:true,progress:.5,headerHeight:67});
assert.deepEqual(calculateMobileScrollState({scrollY:5000,scrollHeight:3000,viewportHeight:1000,headerHeight:67}),
 {scrolled:true,progress:1,headerHeight:67});
assert.deepEqual(calculateMobileScrollState({scrollY:-8,scrollHeight:100,viewportHeight:500,headerHeight:0}),
 {scrolled:false,progress:0,headerHeight:0});

const style=()=>({values:new Map(),setProperty(key,value){this.values.set(key,value)},removeProperty(key){this.values.delete(key)}});
const header={dataset:{},style:style(),children:[],attributes:new Map(),
 append(node){this.children.push(node)},getBoundingClientRect(){return {height:68}},
 removeAttribute(name){this.attributes.delete(name);if(name==='data-m4-scroll')delete this.dataset.m4Scroll}
};
const root={style:style()};
const scrollListeners=new Map(),docListeners=new Map();
const mqListeners=new Map();
const mq={matches:true,addEventListener(name,cb){mqListeners.set(name,cb)}};
globalThis.document={
 getElementById:()=>header,documentElement:root,scrollingElement:{scrollHeight:2500},hidden:false,
 createElement:tag=>({tagName:tag,children:[],hidden:false,attributes:new Map(),className:'',append(node){this.children.push(node)},setAttribute(name,value){this.attributes.set(name,value)}}),
 addEventListener(name,cb){docListeners.set(name,cb)}
};
globalThis.window={scrollY:0,innerHeight:800,visualViewport:{height:800,addEventListener(){}},
 matchMedia:()=>mq,addEventListener(name,cb){scrollListeners.set(name,cb)}};
globalThis.requestAnimationFrame=cb=>cb();
initMobileScrollM4();initMobileScrollM4();
assert.equal(header.children.length,1);
assert.equal(header.children[0].children.length,1);
assert.equal(header.dataset.m4Scroll,'top');
assert.equal(header.style.values.get('--cs-m4-progress'),'0.0000');
assert.equal(root.style.values.get('--cs-m4-header-px'),'82px');
window.scrollY=850;scrollListeners.get('scroll')();
assert.equal(header.dataset.m4Scroll,'scrolled');
assert.equal(header.style.values.get('--cs-m4-progress'),'0.5000');
mq.matches=false;mqListeners.get('change')();
assert.equal(header.children[0].hidden,true);
assert.equal(header.dataset.m4Scroll,undefined);
assert.equal(root.style.values.has('--cs-m4-header-px'),false);
console.log('M4 smoke test: scroll 0/50/100%, fejléc, mobil/desktop váltás, egyszeri indítás OK');
