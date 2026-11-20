/** M16.1: mobilmodulok nem nyúlhatnak az asztali fejléc látható DOM-jához.
 * DOM-szimuláció; valós Chromium-pixelteszt ettől függetlenül szükséges. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {initFreshMobileShell} from '../mobile/reboot-shell-v1-43-27.js';

class Node{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.isConnected=false;
  this.events={};this.attributes={};this.dataset={};this.textContent='';this.id='';
  this.style={values:new Map(),setProperty(k,v){this.values.set(k,v)},
   removeProperty(k){this.values.delete(k)}};
  this.className='';this.classList={add(name){this.value=name}};}
 append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n);
  n.connect(this.isConnected)}}
 prepend(...nodes){for(const n of nodes){n.parentNode=this;this.children.unshift(n);
  n.connect(this.isConnected)}}
 connect(connected){this.isConnected=connected;for(const child of this.children)child.connect(connected)}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this);
  this.connect(false)}
 setAttribute(k,v){this.attributes[k]=String(v)}
 getAttribute(k){return this.attributes[k]??null}
 removeAttribute(k){delete this.attributes[k];if(k==='data-cs-mb-scrolled')delete this.dataset.csMbScrolled}
 addEventListener(k,fn){this.events[k]=fn}
 replaceChildren(...nodes){this.children=[];this.append(...nodes)}
 getBoundingClientRect(){return{height:140}}
}
const header=new Node('header');header.connect(true);
const prior=new Node('nav');prior.id='ext26-mobile-nav';prior.connect(true);
const overlay=new Node('section');overlay.hidden=true;
const known=new Map([['site-header',header],['ext26-mobile-nav',prior],
 ['site-map-overlay',overlay]]);
const find=(node,id)=>node.id===id?node:node.children.map(c=>find(c,id)).find(Boolean)||null;
const root=new Node('html');root.dataset={theme:'light',themePreference:'system'};
globalThis.document={documentElement:root,scrollingElement:{scrollHeight:2400},
 createElement:tag=>new Node(tag),getElementById:id=>known.get(id)||find(header,id),
 addEventListener(){},dispatchEvent(){}};
globalThis.window={innerWidth:1280,innerHeight:800,scrollY:0,addEventListener(){}};
let mediaListener=null;
const phone={matches:false,addEventListener(name,fn){if(name==='change')mediaListener=fn}};
globalThis.matchMedia=()=>phone;
globalThis.fetch=async()=>({ok:true,json:async()=>({items:[]})});
globalThis.MutationObserver=class{observe(){}};
globalThis.ResizeObserver=class{observe(){}};
globalThis.requestAnimationFrame=fn=>fn();
const instance=initFreshMobileShell();
assert.ok(instance);
assert.equal(header.children.length,0,
 'Asztali induláskor a mobilfejléc nem lehet a desktop header gyermeke');
assert.equal(prior.isConnected,true,'A mobilmodul nem törölheti az eredeti desktop DOM-elemet');
assert.equal(root.style.values.has('--cs-mb-sticky-offset'),false);
phone.matches=true;window.innerWidth=390;mediaListener();
assert.equal(header.children.length,1,'Telefonra váltáskor a mobilfejléc bekapcsol');
phone.matches=false;window.innerWidth=1280;mediaListener();
assert.equal(header.children.length,0,'Asztalra visszaváltva a mobilfejléc leválik');
assert.equal(prior.isConnected,true);
const base=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const css=fs.readFileSync(path.join(base,'mobile/reboot-design-v1-43-27.css'),'utf8');
const hero=fs.readFileSync(path.join(base,'mobile/reboot-hero-v1-43-27.js'),'utf8');
assert.match(html,/media="screen and \(max-width: 768px\)"/);
assert.match(hero,/root\.hidden=!phone\.matches/);
assert.match(hero,/root\.hidden=!event\.matches/);
assert.match(css,/^#cs-mobile-rebuild,\.cs-mb-cinema\{display:none\}/m);
console.log('M16.1 desktop-védelem: asztali fejléc érintetlen, 390px-en mobilfejléc, visszaváltás és rejtett filmes mobil DOM OK');
