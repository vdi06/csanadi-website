/** Új mobilos címerfejléc: szimmetria, keresés, téma, scroll és adatforrás. */
import assert from 'node:assert/strict';
import {mobileScrollProgress,initFreshMobileShell} from '../mobile/reboot-shell-v1-43-21.js';
assert.equal(mobileScrollProgress(1000,3000,1000),.5);
assert.equal(mobileScrollProgress(-8,1000,1200),0);
assert.equal(mobileScrollProgress(9000,3000,1000),1);

class Node{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.events={};this.dataset={};
  this.attributes={};this.style={values:new Map(),setProperty(key,value){this.values.set(key,value)}};
  this.textContent='';this.id='';this.isConnected=true;this.className='';}
 append(...children){children.forEach(n=>{this.children.push(n);n.parentNode=this})}
 prepend(...children){children.forEach(n=>{this.children.unshift(n);n.parentNode=this})}
 replaceChildren(...children){this.children=[];this.append(...children)}
 setAttribute(name,value){this.attributes[name]=String(value)}
 getAttribute(name){return this.attributes[name]??null}
 removeAttribute(name){delete this.attributes[name];if(name==='data-cs-mb-scrolled')delete this.dataset.csMbScrolled}
 addEventListener(name,fn){this.events[name]=fn}
 click(){this.events.click?.()}
 remove(){this.isConnected=false}
 classList={add:cls=>{this.className+=' '+cls}}
}
const header=new Node('header'),overlay=new Node(),oldMobile=new Node('nav');
const search=new Node('button'),theme=new Node('button');
let searchCalls=0,themeCalls=0;
search.click=()=>searchCalls++;theme.click=()=>themeCalls++;
let customName='';
const other=[header,overlay,oldMobile,search,theme];
const known=new Map([['site-header',header],['site-map-overlay',overlay],
 ['ext26-mobile-nav',oldMobile],['search-open',search],['theme-toggle',theme]]);
const find=(node,id)=>node.id===id?node:node.children.map(c=>find(c,id)).find(Boolean)||null;
const root={dataset:{themePreference:'system',theme:'dark'}};
root.style={values:new Map(),setProperty(key,value){this.values.set(key,value)},
 removeProperty(key){this.values.delete(key)}};
header.getBoundingClientRect=()=>({height:header.mockHeight??(header.dataset.csMbScrolled==='true'?91:162)});
const documentListeners=new Map(),windowListeners=new Map();
globalThis.document={documentElement:root,scrollingElement:{scrollHeight:3000},
 createElement:tag=>new Node(tag),getElementById:id=>known.get(id)||find(header,id),
 addEventListener(name,fn){documentListeners.set(name,fn)},
 dispatchEvent(event){customName=event.type}};
globalThis.window={scrollY:0,innerHeight:1000,addEventListener(name,fn){windowListeners.set(name,fn)}};
globalThis.CustomEvent=class{constructor(type){this.type=type}};
globalThis.requestAnimationFrame=fn=>fn();
globalThis.MutationObserver=class{observe(){}};
let resizeCallback=null,resizeTarget=null;
globalThis.ResizeObserver=class{
 constructor(callback){resizeCallback=callback}
 observe(node){resizeTarget=node}
};
const media={matches:true,addEventListener(){}};
globalThis.matchMedia=()=>media;
globalThis.fetch=async()=>({ok:true,json:async()=>({items:[
 {platform:'Facebook',label:'Facebook',url:'https://www.facebook.com/csanadiiskola',
  status:'published',schoolVerified:true},
 {platform:'Instagram',label:'Instagram',url:'https://www.instagram.com/_csanadi_/?hl=hu',
  status:'published',schoolVerified:true}]})});
const instance=initFreshMobileShell();
assert.ok(instance?.shell);assert.equal(oldMobile.isConnected,false);
assert.equal(header.children.length,1);
const shell=header.children[0],bar=shell.children[1];
assert.equal(resizeTarget,shell,'A fejléc dinamikus átrendezését figyelni kell');
header.mockHeight=199;resizeCallback();
assert.equal(root.style.values.get('--cs-mb-sticky-offset'),'199px',
 'A betöltés után több sorba törő fejléc új magassága legyen a scroll-offset');
header.mockHeight=null;
assert.equal(bar.children.length,3);
assert.equal(bar.children[1].id,'cs-mb-menu');
bar.children[1].click();assert.equal(customName,'csanadi:menu-toggle');
bar.children[2].children[0].click();assert.equal(searchCalls,1);
bar.children[2].children[1].click();assert.equal(themeCalls,1);
window.scrollY=1000;windowListeners.get('scroll')();
assert.equal(header.dataset.csMbScrolled,'true');
assert.equal(header.style.values.get('--cs-mb-reading'),'0.5');
assert.equal(root.style.values.get('--cs-mb-sticky-offset'),'91px');
media.matches=false;windowListeners.get('resize')();
assert.equal(header.dataset.csMbScrolled,undefined);
assert.equal(root.style.values.has('--cs-mb-sticky-offset'),false);
await Promise.resolve();await Promise.resolve();
const links=bar.children[0].children[0].children;
assert.equal(links.length,2,'A közös JSON-ból mindkét közösségi link bekerült');
console.log('Új fejléc DOM-próba: címer, kereső, téma, scroll, váltás, két social adat, régi menü eltávolítás OK');
