/** M21.4: később beszúrt közlemény, fókusz és asztali DOM-visszaállítás. */
import assert from 'node:assert/strict';
import {initFreshMobileQuality} from '../mobile/reboot-quality-v1-43-29.js';

class Node{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.parentNode=null;
  this.className='';this.events={};this.attributes={};this.hidden=false;this.textContent='';
  this.classList={add:value=>this.className+=' '+value,
   remove:value=>this.className=this.className.replace(value,'').trim(),
   toggle:(value,on)=>{this.classList[on?'add':'remove'](value)}};}
 get firstChild(){return this.children[0]||null;}
 get isConnected(){return true;}
 append(...nodes){for(const n of nodes)this.appendChild(n);}
 appendChild(node){node.parentNode?.removeChild(node);node.parentNode=this;this.children.push(node);}
 insertBefore(node,reference){node.parentNode?.removeChild(node);node.parentNode=this;
  const index=this.children.indexOf(reference);this.children.splice(index<0?this.children.length:index,0,node);}
 removeChild(node){this.children.splice(this.children.indexOf(node),1);node.parentNode=null;}
 remove(){this.parentNode?.removeChild(this);}
 querySelector(selector){return this.children.find(node=>node.className.trim().split(/\s+/)
  .some(cls=>cls&&selector.includes(cls)))||null;}
 contains(node){return this===node||this.children.some(child=>child.contains(node));}
 setAttribute(key,value){this.attributes[key]=String(value);}
 getAttribute(key){return this.attributes[key]??null;}
 addEventListener(key,callback){this.events[key]=callback;}
 click(){this.events.click?.();}
 focus(){document.activeElement=this;}
}
const panel=new Node(),first=new Node('button'),second=new Node('div');
panel.className='csn20-language-bar';panel.append(first,second);
const observed=new Map();
globalThis.MutationObserver=class{
 constructor(callback){this.callback=callback;}
 observe(node){observed.set(node,this.callback);}
 disconnect(){for(const [node,callback]of observed)if(callback===this.callback)observed.delete(node);}
};
const root={dataset:{},toggleAttribute(){}};
const body=new Node('body');body.append(panel);
globalThis.document={documentElement:root,body,activeElement:null,
 querySelector:selector=>selector==='body > .csn20-language-bar'?panel:null,
 querySelectorAll:()=>[],createElement:tag=>new Node(tag),addEventListener(){}};
const mobile={matches:true,listeners:[],addEventListener(name,callback){this.listeners.push(callback)},
 change(){for(const callback of this.listeners)callback()}};
const reduced={matches:false,addEventListener(){}};
globalThis.matchMedia=query=>query.includes('reduced-motion')?reduced:mobile;
globalThis.window={addEventListener(){}};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{}});
globalThis.requestAnimationFrame=callback=>callback();
initFreshMobileQuality();
const toggle=panel.querySelector('cs-mb-notice-toggle');
const content=panel.querySelector('cs-mb-notice-body');
assert.ok(toggle&&content);
assert.equal(content.hidden,true,'Mobilon a tájékoztató alapból csukott');
assert.deepEqual(content.children,[first,second]);
const late=new Node('div');panel.append(late);
observed.get(panel)();
assert.ok(content.children.includes(late),'M21: késői tartalom is a mobilos panelbe kerül');
toggle.click();assert.equal(content.hidden,false);
document.activeElement=second;
toggle.click();assert.equal(content.hidden,true);
assert.equal(document.activeElement,toggle,
 'M22: programból összecsukott értesítés ne hagyjon fókuszt a rejtett törzsben');
toggle.click();assert.equal(content.hidden,false);
document.activeElement=first;
let prevented=false;
content.events.keydown({key:'Escape',preventDefault(){prevented=true;}});
assert.equal(prevented,true);
assert.equal(content.hidden,true);
assert.equal(document.activeElement,toggle,'Escape után a nyitógomb kapja vissza a fókuszt');
mobile.matches=false;mobile.change();
assert.equal(panel.querySelector('cs-mb-notice-toggle'),null);
assert.equal(panel.querySelector('cs-mb-notice-body'),null);
assert.deepEqual(panel.children,[first,second,late],'Desktopon teljes, eredeti tartalom visszaáll');
console.log('M21.4 PASS: dinamikus közlemény, Escape, fókusz és desktop DOM-visszaállítás');
