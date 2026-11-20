/** Új, önálló mobilmenü: három szint, két megjelenés, közvetlen oldalnyitás. */
import assert from 'node:assert/strict';
import {createPhoneRadial,PHONE_QUERY,mobileViewportMode} from '../mobile/reboot-menu-v1-43-27.js';
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.events={};this.style={setProperty(){}};
  this.dataset={};this.className='';this.textContent='';this.hidden=false;this.attributes={};}
 append(...children){for(const child of children){this.children.push(child);child.parentNode=this;}}
 replaceChildren(...children){this.children=[];this.append(...children)}
 setAttribute(k,v){this.attributes[k]=String(v)}
 getAttribute(k){return this.attributes[k]??null}
 removeAttribute(k){delete this.attributes[k]}
 addEventListener(k,fn){this.events[k]=fn}
 focus(){globalThis.focused=this;if(globalThis.document)document.activeElement=this}
 click(){this.events.click?.({preventDefault(){}})}
 querySelector(q){
  const match=node=>q==='button,a[href]'?(node.tagName==='button'||node.tagName==='a'):
   q==='.cs-mb-menu-card-main'?node.className==='cs-mb-menu-card-main':false;
  const walk=node=>{for(const child of node.children){if(match(child))return child;
   const hit=walk(child);if(hit)return hit;}return null;};return walk(this);
 }
}
globalThis.document={createElement:tag=>new Node(tag),activeElement:null};
let compact=false;
globalThis.matchMedia=query=>({matches:query.includes('419')?compact:true});
assert.match(PHONE_QUERY,/max-width: 768px/);
assert.doesNotMatch(PHONE_QUERY,/960px/,'Fekvő tablet nem kaphat mobilmenüt desktop CSS-sel');
for(const [w,h,mode] of [[320,700,'grid'],[375,812,'grid'],[390,844,'grid'],
 [420,759,'grid'],[420,760,'circle'],[420,780,'circle'],[430,932,'circle'],
 [768,900,'circle'],[768,500,'grid'],
 [900,420,'desktop'],[769,900,'desktop']]){
 assert.equal(mobileViewportMode(w,h),mode,`${w}x${h}`);
}
const windowListeners=new Map();
globalThis.window={innerWidth:430,innerHeight:780,
 location:{hash:'#/felveteli'},addEventListener(name,fn){windowListeners.set(name,fn)}};
const container=new Node(),title=new Node(),description=new Node(),overview=new Node('a'),center=new Node('button');
const root={name:'Iskolánk',href:'#/iskolank'},second={name:'Képzések',href:'#/oktatas'},
 third={name:'Felvételi',href:'#/felveteli'};
const leaves=new Map([[root,[second]],[second,[third]]]);
let navigated=0;
const menu=createPhoneRadial({container,title,description,overview,center,
 media:{matches:true},onChoose:()=>{navigated++;}});
menu.setCatalog([root],{childrenOf:node=>leaves.get(node)||[],titleOf:node=>node.name,hrefOf:node=>node.href});
assert.equal(menu.getLevel(),1);assert.equal(container.dataset.presentation,'circle');
assert.equal(title.textContent,'Fedezd fel a Csanádit');assert.equal(center.hidden,true);
const screen=container.children[0],grid=screen.children[3].children[0];
assert.equal(grid.children.length,1);
grid.children[0].children[0].click();
assert.equal(menu.getLevel(),2);assert.equal(title.textContent,'Iskolánk');
grid.children[0].children[0].focus();
window.innerWidth=390;windowListeners.get('resize')();
assert.equal(menu.getLevel(),2,'Átméretezéskor nem szabad elveszíteni a menüszintet');
assert.equal(container.dataset.presentation,'grid');
assert.equal(document.activeElement,grid.children[0].children[0],
 'M15: átméretezéskor a kiválasztott menüpontnak meg kell maradnia fókuszban');
let keyHandled=false;
screen.events.keydown({key:'End',target:grid.children[0].children[0],altKey:false,
 ctrlKey:false,metaKey:false,preventDefault(){keyHandled=true}});
assert.equal(keyHandled,true);
assert.equal(document.activeElement,grid.children[0].children[1],
 'M15: End a menüszint utolsó hivatkozására lép');
screen.events.keydown({key:'Home',target:grid.children[0].children[1],altKey:false,
 ctrlKey:false,metaKey:false,preventDefault(){}});
assert.equal(document.activeElement,grid.children[0].children[0],
 'M15: Home az első menüpontra lép');
grid.children[0].children[1].focus();
window.innerWidth=375;windowListeners.get('resize')();
assert.equal(document.activeElement,grid.children[0].children[1],
 'M16.2: a közvetlen oldalhivatkozás megőrzi saját fókuszát mobilos átméretezésnél');
menu.setCatalog([root],{childrenOf:node=>leaves.get(node)||[],
 titleOf:node=>node.name,hrefOf:node=>node.href});
assert.equal(document.activeElement,grid.children[0].children[1],
 'M16.2: tartalomfrissítés után a közvetlen oldalhivatkozás fókusza megmarad');
grid.children[0].children[0].focus();
menu.setCatalog([root],{childrenOf:node=>leaves.get(node)||[],
 titleOf:node=>node.name,hrefOf:node=>node.href});
assert.equal(document.activeElement,grid.children[0].children[0],
 'M15: katalógusfrissítéskor a fókusz megmarad');
window.innerWidth=430;windowListeners.get('resize')();
assert.equal(container.dataset.presentation,'circle');
assert.equal(screen.children[2].href,'#/iskolank');
container.scrollTop=150;
grid.children[0].children[0].click();
assert.equal(menu.getLevel(),3);assert.equal(title.textContent,'Képzések');
assert.equal(container.scrollTop,0,'Almenübe lépéskor a görgetés a tetejére áll');
const link=grid.children[0].children[0];assert.equal(link.href,'#/felveteli');
assert.equal(link.getAttribute('aria-current'),'page','Aktív útvonalhoz jelölés jár');
link.click();assert.equal(navigated,1);
let keyboardBack=false;
screen.events.keydown({key:'ArrowLeft',target:link,altKey:false,ctrlKey:false,metaKey:false,
 preventDefault(){keyboardBack=true;}});
assert.equal(keyboardBack,true);
assert.equal(menu.getLevel(),2,'Bal nyíl visszalép egy menüszintet');
assert.equal(globalThis.focused,grid.children[0].children[0],
 'Visszalépéskor a korábban kiválasztott menüpont kerül újra fókuszba');
assert.equal(menu.back(),true);assert.equal(menu.getLevel(),1);
assert.equal(globalThis.focused,grid.children[0].children[0]);
assert.equal(menu.back(),false);
compact=true;window.innerWidth=390;menu.reset();assert.equal(container.dataset.presentation,'grid');
menu.focus();assert.equal(globalThis.focused,grid.children[0].children[0]);
console.log('Új menü DOM-próba: 1→2→3 szint, direkt oldallink, vissza, fókusz, kompakt/kör nézet OK');
