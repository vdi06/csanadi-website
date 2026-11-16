'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.resolve(__dirname,'../mobile/navigation.js'),'utf8');
const treeCode=source.slice(0,source.indexOf('/** A nézetváltó állapota')).replace('export function renderMobileTree','function renderMobileTree');
class Element{
 constructor(tag,attrs={}){this.tag=tag;this.attrs={...attrs};this.className=attrs.class||'';this.children=[];this.open=false;this.listeners={};this.textContent='';this.classList={contains:cls=>this.className.split(/\s+/).includes(cls),add:cls=>{this.className=(this.className+' '+cls).trim();}};}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=[...nodes];}
 setAttribute(name,value){this.attrs[name]=String(value);}
 getAttribute(name){return this.attrs[name]??null;}
 addEventListener(name,fn){this.listeners[name]=fn;}
 fire(name){this.listeners[name]?.();}
 querySelectorAll(selector){const found=[];const wanted=selector==='a'?'a':'details';const walk=node=>{for(const child of node.children){if(child.tag===wanted)found.push(child);walk(child);}};walk(this);return found;}
}
const dom=(tag,attrs={},text)=>{const node=new Element(tag,attrs);if(text)node.textContent=text;return node;};
const hrefOf=node=>node.route;
const navLink=node=>dom('a',{href:node.route},node.name);
const titleOf=node=>node.name;
const leaf={name:'Felvételi tájékoztató',route:'#/oktatas/felveteli/tajekoztato',children:[]};
const admission={name:'Felvételi',route:'#/oktatas/felveteli',children:[leaf]};
const rootA={name:'Oktatás',route:'#/oktatas',children:[admission]};
const rootB={name:'Sport',route:'#/sport',children:[{name:'Eredmények',route:'#/sport/eredmenyek',children:[]}]};
const context=vm.createContext({});
vm.runInContext(treeCode,context);
const errors=[];
function check(label,fn){try{fn();}catch(error){errors.push(label+': '+error.message);}}
function draw(variant){const container=new Element('nav');context.container=container;context.roots=[rootA,rootB];context.helpers={dom,navLink,titleOf,hrefOf,pageChildren:node=>node.children,currentRoute:leaf.route};context.variant=variant;vm.runInContext('renderMobileTree(container,roots,helpers,variant)',context);return container;}
for(const variant of ['header','overlay']){
 const container=draw(variant),groups=container.children;
 check(variant+': aktív útvonal főcsoportja nyitva van',()=>assert.equal(groups[0].open,true));
 check(variant+': harmadik szinthez tartozó almenü nyitva van',()=>assert.ok(container.querySelectorAll('details').find(x=>x.className.includes('nested')||x.className.includes('mobile-sub'))?.open));
 check(variant+': képernyőolvasó jelzi az aktuális aloldalt',()=>assert.equal(container.querySelectorAll('a').find(x=>x.attrs.href===leaf.route)?.attrs['aria-current'],'page'));
 check(variant+': másik főmenü megnyitásakor az előző bezárul',()=>{groups[1].open=true;groups[1].fire('toggle');assert.equal(groups[0].open,false);});
}
console.log(JSON.stringify({version:'1.32.0',passed:8-errors.length,total:8,failures:errors}));
if(errors.length)process.exitCode=1;
