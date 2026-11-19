/** M3/D navigáció DOM-alapú tesztje: böngészőfüggetlen, helyi ellenőrzés. */
import assert from 'node:assert/strict';
import {createPhoneRadial} from '../mobile/radial-wheel-m3-v1-43-9.js';

class Element {
 constructor(tag='div'){
  this.tagName=tag;this.children=[];this.attributes=new Map();this.events=new Map();
  this.dataset={};this.style={setProperty:(name,value)=>{this[name]=value}};
  this.textContent='';this.hidden=false;
 }
 append(...nodes){for(const node of nodes){this.children.push(node);node.parentNode=this}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes)}
 setAttribute(name,value){this.attributes.set(name,String(value))}
 getAttribute(name){return this.attributes.get(name)}
 addEventListener(name,fn){this.events.set(name,fn)}
 click(){this.events.get('click')?.({preventDefault(){}})}
 focus(){globalThis.lastFocus=this}
 querySelector(selector){
  const check=node=>node.className?.split?.(/\s+/).includes(selector.slice(1))||
   selector==='button'&&node.tagName==='button';
  const visit=node=>{for(const child of node.children){if(check(child))return child;const found=visit(child);if(found)return found}return null};
  return visit(this);
 }
}
globalThis.document={createElement:tag=>new Element(tag)};
globalThis.matchMedia=()=>({matches:true});
const container=new Element();
const stage=new Element();stage.className='cs-phone-wheel-stage';
const ring=new Element('nav');ring.className='cs-phone-wheel-ring';stage.append(ring);
const center=new Element('button');
const centerLabel=new Element('span');centerLabel.className='cs-phone-wheel-center-label';
center.append(centerLabel);stage.append(center);container.append(stage);
const title=new Element(),description=new Element(),overview=new Element('a');
const root={title:'Iskolánk',href:'#/iskolank'},other={title:'Kapcsolat',href:'#/kapcsolat'};
const section={title:'Történet',href:'#/tortenet'};
const third={title:'Hagyományok',href:'#/hagyomanyok'};
const hidden={title:'Nem látható',href:'#/rejtett'};
const itemChildren=new Map([[root,[section]],[section,[third,hidden]]]);
const visible=new Set([root,other,section,third]);
let chosen=0;
const wheel=createPhoneRadial({container,title,description,overview,center,
 media:{matches:true},onChoose:()=>chosen++});
wheel.setCatalog([root,other],{
 titleOf:item=>item.title,hrefOf:item=>item.href,
 childrenOf:node=>(itemChildren.get(node)||[]).filter(item=>visible.has(item))
});
assert.equal(wheel.getLevel(),1);
assert.equal(ring.children.length,2);
ring.children[0].click();
assert.equal(wheel.getLevel(),2);
assert.equal(stage.hidden,true);
assert.equal(container.dataset.level,'2');
const drawer=container.children.at(-1);
const links=drawer.children.at(-1);
assert.equal(links.children.length,2); // Áttekintés + Történet
links.children[1].children[0].click();
assert.equal(wheel.getLevel(),3);
assert.equal(links.children.length,2); // Áttekintés + látható unoka
assert.equal(links.children[1].children[0].textContent,'Hagyományok');
links.children[1].click();assert.equal(chosen,1);
assert.equal(wheel.back(),true);
assert.equal(wheel.getLevel(),2);
assert.equal(wheel.back(),true);
assert.equal(wheel.getLevel(),1);
assert.equal(wheel.back(),false);
wheel.reset();wheel.focus();assert.equal(globalThis.lastFocus,ring.children[0]);
console.log('M3 smoke test: 1→2→3, láthatóság, vissza, oldalnyitás és fókusz OK');
