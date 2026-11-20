/** Új mobilos címerfejléc: szimmetria, keresés, téma, scroll és adatforrás. */
import assert from 'node:assert/strict';
import {mobileScrollProgress,initFreshMobileShell} from '../mobile/reboot-shell-v1-43-26.js';
assert.equal(mobileScrollProgress(1000,3000,1000),.5);
assert.equal(mobileScrollProgress(-8,1000,1200),0);
assert.equal(mobileScrollProgress(9000,3000,1000),1);

class Node{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.events={};this.dataset={};
  this.attributes={};this.style={values:new Map(),priorities:new Map(),
   setProperty(key,value,priority=''){this.values.set(key,value);this.priorities.set(key,priority)},
   getPropertyValue(key){return this.values.get(key)||''},
   getPropertyPriority(key){return this.priorities.get(key)||''},
   removeProperty(key){this.values.delete(key);this.priorities.delete(key)}};
  this.textContent='';this.id='';this.isConnected=true;this.className='';}
 append(...children){children.forEach(n=>{this.children.push(n);n.parentNode=this})}
 prepend(...children){children.forEach(n=>{this.children.unshift(n);n.parentNode=this;n.isConnected=true})}
 replaceChildren(...children){this.children=[];this.append(...children)}
 setAttribute(name,value){this.attributes[name]=String(value)}
 getAttribute(name){return this.attributes[name]??null}
 removeAttribute(name){delete this.attributes[name];if(name==='data-cs-mb-scrolled')delete this.dataset.csMbScrolled}
 addEventListener(name,fn){this.events[name]=fn}
 click(){this.events.click?.()}
 remove(){this.isConnected=false;if(this.parentNode)
  this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}
 classList={add:cls=>{this.className+=' '+cls}}
}
const header=new Node('header'),overlay=new Node(),oldMobile=new Node('nav');
const legacyRow=new Node('div');legacyRow.className='brand-row';
legacyRow.style.setProperty('display','flex');
legacyRow.setAttribute('aria-hidden','false');
header.append(legacyRow);
header.querySelector=selector=>selector===':scope > .brand-row'?legacyRow:null;
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
const media={matches:true,change:null,addEventListener(name,fn){if(name==='change')this.change=fn}};
globalThis.matchMedia=()=>media;
globalThis.fetch=async()=>({ok:true,json:async()=>({items:[
 {platform:'Facebook',label:'Facebook',url:'https://www.facebook.com/csanadiiskola',
  status:'published',schoolVerified:true},
 {platform:'Instagram',label:'Instagram',url:'https://www.instagram.com/_csanadi_/?hl=hu',
  status:'published',schoolVerified:true}]})});
const instance=initFreshMobileShell();
assert.ok(instance?.shell);assert.equal(oldMobile.isConnected,true,
 'M16: a desktophoz tartozó régi DOM-elemet a mobilmodul nem törölheti');
assert.equal(header.children.length,2,'Mobilon a régi sort elrejtjük, de nem töröljük');
const shell=header.children[0],bar=shell.children[1];
assert.equal(legacyRow.style.getPropertyValue('display'),'none');
assert.equal(legacyRow.style.getPropertyPriority('display'),'important');
assert.equal(legacyRow.getAttribute('aria-hidden'),'true');
assert.equal(resizeTarget,shell,'A fejléc dinamikus átrendezését figyelni kell');
header.mockHeight=199;resizeCallback();
assert.equal(root.style.values.get('--cs-mb-sticky-offset'),'199px',
 'A betöltés után több sorba törő fejléc új magassága legyen a scroll-offset');
header.mockHeight=null;
assert.equal(bar.children.length,4,'A négy elem: social / címer / eszközök / külön KRÉTA sor');
assert.equal(bar.children[1].id,'cs-mb-menu');
assert.equal(bar.children[0].children.length,1,
 'A KRÉTA nem torlódhat a Facebook és Instagram mellé az első sorban');
assert.match(bar.children[3].className,/cs-mb-kreta-line/);
assert.match(bar.children[3].children[0].className,/cs-mb-kreta/);
bar.children[1].click();assert.equal(customName,'csanadi:menu-toggle');
bar.children[2].children[0].click();assert.equal(searchCalls,1);
bar.children[2].children[1].click();assert.equal(themeCalls,1);
window.scrollY=1000;windowListeners.get('scroll')();
assert.equal(header.dataset.csMbScrolled,'true');
assert.equal(header.style.values.get('--cs-mb-reading'),'0.5');
assert.equal(root.style.values.get('--cs-mb-sticky-offset'),'91px');
assert.equal(shell.children[0].getAttribute('aria-hidden'),'true');
assert.equal(shell.children[2].getAttribute('aria-hidden'),'true',
 'M16.3: a becsukódott ismétlődő feliratokat ne olvassa fel újra a képernyőolvasó');
window.scrollY=0;windowListeners.get('scroll')();
assert.equal(shell.children[0].getAttribute('aria-hidden'),'false');
assert.equal(shell.children[2].getAttribute('aria-hidden'),'false',
 'Felgörgetéskor ismét hozzáférhetők az iskolai feliratok');
media.matches=false;media.change();
assert.equal(header.dataset.csMbScrolled,undefined);
assert.equal(root.style.values.has('--cs-mb-sticky-offset'),false);
assert.equal(header.style.values.has('--cs-mb-reading'),false);
assert.equal(shell.children[0].getAttribute('aria-hidden'),null);
assert.equal(header.children.length,1,
 'M16: asztali szélességen a teljes mobil fejlécnek le kell kapcsolódnia');
assert.equal(legacyRow.style.getPropertyValue('display'),'flex',
 'Asztalra visszaváltva az eredeti inline kijelzés visszaáll');
assert.equal(legacyRow.style.getPropertyPriority('display'),'');
assert.equal(legacyRow.getAttribute('aria-hidden'),'false');
media.matches=true;media.change();
assert.equal(header.children.length,2,
 'Mobilra visszatérve a saját fejlécnek új példány nélkül vissza kell kapcsolódnia');
assert.equal(legacyRow.style.getPropertyValue('display'),'none');
assert.equal(legacyRow.style.getPropertyPriority('display'),'important');
await Promise.resolve();await Promise.resolve();
const links=bar.children[0].children[0].children;
assert.equal(links.length,2,'A közös JSON-ból mindkét közösségi link bekerült');
console.log('M16 fejléc DOM-próba: címer, téma, scroll és desktop DOM-védelem, rejtett duplikáció, két social adat OK');
