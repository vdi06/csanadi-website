/** M6: valódi DOM-szerkezetet utánzó helyi kézi váltási próba. */
import assert from 'node:assert/strict';
import {enhanceMobileHeroM6} from '../mobile/mobile-m6-film-v1-43-11.js';

class Element {
 constructor(tag='div',cls=''){
  this.tagName=tag;this.className=cls;this.children=[];this.dataset={};this.events=new Map();
  this.attributes=new Map();this.isConnected=true;this.hidden=false;this.textContent='';
  this.style={setProperty:(key,value)=>this.style[key]=value};
  this.classList={add:(...names)=>{const s=new Set(this.className.split(/\s+/).filter(Boolean));names.forEach(name=>s.add(name));this.className=[...s].join(' ')},
   remove:(...names)=>{const s=new Set(this.className.split(/\s+/).filter(Boolean));names.forEach(name=>s.delete(name));this.className=[...s].join(' ')}};
 }
 append(...nodes){for(const node of nodes){this.children.push(node);node.parentNode=this}}
 insertBefore(node,other){const index=this.children.indexOf(other);if(index<0)this.append(node);else{this.children.splice(index,0,node);node.parentNode=this}}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(item=>item!==this)}
 setAttribute(name,value){this.attributes.set(name,String(value))}
 addEventListener(event,fn){this.events.set(event,fn)}
 click(){this.events.get('click')?.({preventDefault(){}})}
 contains(node){return node===this||this.children.some(child=>child.contains?.(node))}
 querySelector(selector){
  const isPicture=node=>node.className?.split(/\s+/).includes('cs42-mobile-picture');
  if(selector==='.cs42-mobile-picture img')return this.querySelector('.cs42-mobile-picture')?.querySelector('img');
  const match=node=>selector==='img'?node.tagName==='img':
   selector==='.cs42-mobile-picture'?isPicture(node):
   selector.includes(':not(')?isPicture(node)&&!node.className.includes('cs-m6-incoming'):false;
  const walk=node=>{for(const child of node.children){if(match(child))return child;const found=walk(child);if(found)return found}return null};
  return walk(this);
 }
}
globalThis.document={createElement:tag=>new Element(tag),body:{classList:{contains:()=>false}},hidden:false,activeElement:null};
const media={mobile:{matches:true},wide:{matches:false},reduced:{matches:true}};
globalThis.matchMedia=query=>query.includes('prefers-reduced-motion')?media.reduced:
 query.includes('min-width')?media.wide:media.mobile;
Object.defineProperty(globalThis,'navigator',{value:{connection:{saveData:true}},configurable:true});
globalThis.setInterval=()=>1;
const picture=()=>{const p=new Element('picture','cs42-mobile-picture');const i=new Element('img');i.complete=true;i.naturalWidth=600;p.append(i);return p};
const landing=new Element('div'),figure=new Element('div'),copy=new Element('div');
figure.append(picture());landing.append(figure,copy);
const slides=[{mediaId:'media:sport',title:'Sport',buttons:[{href:'#/sport'}]},
 {mediaId:'media:bejarat',title:'Bejárat',buttons:[{href:'#/kapcsolat'}]},
 {mediaId:'media:oktatas',title:'Oktatás',buttons:[{href:'#/oktatas'}]}];
const control=enhanceMobileHeroM6({landing,figure,copy,slides,
 createPicture:()=>picture(),mediaItem:()=>({}),intervalMs:7500});
assert.equal(control.getCount(),3);
assert.equal(control.getIndex(),0);
const toolbar=landing.children[1];
assert.equal(toolbar.className,'cs-m6-toolbar');
assert.equal(toolbar.children[1].children[1].textContent,'Bejárat');
assert.equal(toolbar.children[1].children[3].href,'#/kapcsolat');
toolbar.children[2].click();
await Promise.resolve();await Promise.resolve();
assert.equal(control.getIndex(),1);
assert.equal(toolbar.children[1].children[1].textContent,'Sport');
assert.equal(figure.children.filter(node=>node.className.includes('cs42-mobile-picture')).length,1);
toolbar.children[0].click();
await Promise.resolve();await Promise.resolve();
assert.equal(control.getIndex(),0);
assert.equal(toolbar.children[3].hidden,true); // nincs automatikus mozgás adatvédő módban
assert.equal(enhanceMobileHeroM6({landing,figure,copy,slides,createPicture:picture,mediaItem:()=>({})}),null);

// Egyszeri nyitás: csak dekódolt bejárati kép fölött indul, nem villan újra.
media.reduced.matches=false;
Object.defineProperty(globalThis,'navigator',{value:{connection:{saveData:false}},configurable:true});
const session=new Map();
globalThis.sessionStorage={getItem:key=>session.get(key),setItem:(key,value)=>session.set(key,value)};
globalThis.requestAnimationFrame=fn=>fn();
const timers=[];globalThis.setTimeout=(fn,time)=>{timers.push({fn,time});return timers.length};
const second=new Element('div'),secondFigure=new Element('div'),secondCopy=new Element('div');
secondFigure.append(picture());second.append(secondFigure,secondCopy);
enhanceMobileHeroM6({landing:second,figure:secondFigure,copy:secondCopy,slides,
 createPicture:picture,mediaItem:()=>({})});
const gate=secondFigure.children[1];
assert.equal(gate.hidden,false);
await Promise.resolve();await Promise.resolve();
assert.ok(gate.className.includes('cs-m6-open'));
assert.equal(session.get('csanadi-m6-gate-played'),'1');
const gateFinish=timers.find(row=>row.time===1550);
assert.ok(gateFinish);gateFinish.fn();assert.equal(gate.hidden,true);
const third=new Element('div'),thirdFigure=new Element('div'),thirdCopy=new Element('div');
thirdFigure.append(picture());third.append(thirdFigure,thirdCopy);
enhanceMobileHeroM6({landing:third,figure:thirdFigure,copy:thirdCopy,slides,
 createPicture:picture,mediaItem:()=>({})});
assert.equal(thirdFigure.children[1].hidden,true);
console.log('M6 DOM-próba: képváltás, témalink, redukált mozgás, egyszeri villanásmentes kapunyitás OK');
