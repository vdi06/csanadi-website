/** Az asztali képgaléria hálózati hiba utáni újrapróbálása valódi DOM-eseményutánzással. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {registerMedia} from '../js/media.js?v=1.51';
import {useSiteSettings} from '../js/site-settings-2026.js?v=1.51';
import {renderPremiumHero} from '../js/hero-2026.js';

class Node{
 constructor(tag='div'){
  this.tagName=tag;this.children=[];this.parentNode=null;this.events=new Map();
  this.attributes={};this.className='';this.dataset={};this.textContent='';
  this.hidden=false;this.complete=false;this.naturalWidth=0;this.isConnected=true;
  this.style={setProperty(){},removeProperty(){}};
  this.classList={add:(...names)=>{this.className=[...new Set([...this.className.split(' ').filter(Boolean),...names])].join(' ')}};
 }
 append(...nodes){for(const node of nodes){
  if(node.tagName==='#fragment'){this.append(...node.children);node.children=[];continue;}
  node.parentNode=this;this.children.push(node);
 }}
 prepend(...nodes){for(const node of nodes){node.parentNode=this;this.children.unshift(node)}}
 replaceChildren(...nodes){for(const node of this.children)node.parentNode=null;this.children=[];this.append(...nodes)}
 insertBefore(node,reference){const position=this.children.indexOf(reference);
  if(position<0)this.append(node);else{node.parentNode=this;this.children.splice(position,0,node)}}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this);
  this.parentNode=null;this.isConnected=false}
 addEventListener(name,listener){const list=this.events.get(name)||[];list.push(listener);this.events.set(name,list)}
 dispatch(name){for(const listener of this.events.get(name)||[])listener({target:this,propertyName:'opacity'})}
 setAttribute(name,value){this.attributes[name]=String(value)}
 getAttribute(name){return this.attributes[name]??null}
 querySelector(selector){if(selector==='img'&&this.tagName==='img')return this;
  for(const child of this.children){const found=child.querySelector(selector);if(found)return found}return null}
 contains(other){return this===other||this.children.some(child=>child.contains(other))}
 matches(){return false}
}

const root=new Node('html');
globalThis.document={documentElement:root,hidden:false,activeElement:null,
 body:{classList:{contains:()=>false}},
 createElement:tag=>new Node(tag),createDocumentFragment:()=>new Node('#fragment'),
 createComment:()=>new Node('#comment'),querySelector:()=>null,createTextNode:value=>({textContent:value})};
globalThis.window={innerWidth:1280,innerHeight:800,addEventListener(){}};
globalThis.innerWidth=1280;globalThis.devicePixelRatio=1;
globalThis.matchMedia=query=>({matches:query.includes('min-width: 769px'),addEventListener(){}});
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{connection:{saveData:true,effectiveType:'4g'}}});
globalThis.setInterval=()=>1;globalThis.setTimeout=()=>1;
globalThis.IntersectionObserver=undefined;
const config=JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname,'../json/config.json'),'utf8'));
useSiteSettings(config);
registerMedia({items:[
 {id:'media:test-first',original:{path:'assets/media/test-first.webp'},rights:{clearance:'approved'}},
 {id:'media:test-second',original:{path:'assets/media/test-second.webp'},rights:{clearance:'approved'}}
]});
const section=renderPremiumHero({data:{slides:[
 {mediaId:'media:test-first',title:'Első'},
 {mediaId:'media:test-second',title:'Második'}
]}});
assert.ok(section);
const row=section.children.find(node=>node.id==='csn26-visual-carousel');
assert.ok(row,'Az asztali hero DOM elkészült');
const wing=row.children[0];
const mount=wing.children[0].children[0];
const firstImage=mount.querySelector('img');
assert.ok(firstImage);
firstImage.complete=true;firstImage.naturalWidth=1200;firstImage.dispatch('load');
assert.equal(wing.dataset.slide,'1');

const next=row.children.find(node=>node.className.includes('csn26-edge-arrow--right'));
assert.ok(next);
next.dispatch('click');
const failedImage=mount.children.at(-1)?.querySelector('img');
assert.ok(failedImage&&failedImage!==firstImage);
failedImage.complete=true;failedImage.naturalWidth=0;failedImage.dispatch('error');
assert.equal(wing.dataset.slide,'1','Hibás kép nem válthat üres diára');

next.dispatch('click');
const retryImage=mount.children.at(-1)?.querySelector('img');
assert.ok(retryImage&&retryImage!==failedImage,
 'Második kattintásra új képkérés indulhat, nem a hibás cache-elemet használja');
retryImage.complete=true;retryImage.naturalWidth=1200;retryImage.dispatch('load');
assert.equal(wing.dataset.slide,'2','Sikeres újrapróba után a dia valóban vált');
assert.equal(wing.children[0].attributes['aria-label'].includes('Második'),true);

console.log('Asztali hero PASS: sikertelen képkérés után az előző dia marad, újrapróba új képet tölt, sikeres képcsere és ARIA OK');
