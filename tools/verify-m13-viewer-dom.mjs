/** M13.3: a meglévő saját Bootstrap-képnéző tematikus, modális DOM-próbája. */
import assert from 'node:assert/strict';
import {openImageViewer,openDocumentViewer} from '../js/site-viewers-v1-43-3.js';

class Node{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.events=new Map();
  this.className='';this.dataset={};this.attributes=new Map();this.style={};this.textContent='';
  this.hidden=false;this.isConnected=true;this.tabIndex=0;}
 append(...nodes){for(const node of nodes){this.children.push(node);node.parentNode=this;}}
 setAttribute(name,value){this.attributes.set(name,String(value))}
 getAttribute(name){return this.attributes.get(name)??null}
 addEventListener(name,fn){const list=this.events.get(name)||[];list.push(fn);this.events.set(name,list)}
 removeEventListener(name,fn){this.events.set(name,(this.events.get(name)||[]).filter(item=>item!==fn))}
 dispatch(name,event={}){for(const fn of this.events.get(name)||[])fn(event)}
 dispatchEvent(event){this.dispatch(event.type,event);return true}
 remove(){this.isConnected=false}
 focus(){document.activeElement=this}
 getClientRects(){return [{}]}
 closest(){return null}
 get classList(){return{
  contains:name=>this.className.split(/\s+/).includes(name),
  add:name=>{this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),name])].join(' ')},
  remove:name=>{this.className=this.className.split(/\s+/).filter(part=>part!==name).join(' ')}
 }}
}
const body=new Node('body');
const documentElement={dataset:{theme:'light'}};
globalThis.document={body,documentElement,activeElement:new Node('button'),createElement:tag=>new Node(tag)};
globalThis.MutationObserver=class{observe(){}disconnect(){}};
let carouselOptions=null,disposeCount=0;
globalThis.window={bootstrap:{
 Modal:class{constructor(root,options){this.root=root;this.options=options}
  show(){this.root.dispatch('shown.bs.modal')}
  dispose(){disposeCount++}},
 Carousel:{getOrCreateInstance(root,options){carouselOptions=options;
  return{dispose(){disposeCount++}}}}
}};
const find=(root,cls)=>{
 if(root.classList.contains(cls))return root;
 for(const child of root.children){const hit=find(child,cls);if(hit)return hit;}
 return null;
};
const all=(root,cls)=>[...(root.classList.contains(cls)?[root]:[]),
 ...root.children.flatMap(child=>all(child,cls))];
const images=[
 {src:'assets/media/web/responsive/bejarat-1600-960.webp',title:'Bejárat',alt:'Iskolai bejárat'},
 {src:'https://example.org/idegen.jpg',title:'Nem ide való'},
 {src:'assets/media/web/responsive/bejarat-1600-640.webp',title:'Iskolai udvar'}
];
let selectedIndex=-1,closed=false;
assert.equal(openImageViewer(images,0,{title:'Iskolai képek',onChange:(item,i)=>selectedIndex=i,onClose:()=>{closed=true}}),true);
const modal=body.children.at(-1);
assert.ok(modal.classList.contains('cs43-image-viewer'));
const carousel=find(modal,'cs43-photo-carousel'),slides=all(modal,'carousel-item');
assert.equal(slides.length,2,'A tematikus képnéző kiszűri a nem helyi képeket');
assert.equal(selectedIndex,0);
assert.equal(find(modal,'cs43-gallery-caption').textContent,'Bejárat · Iskolai bejárat');
assert.deepEqual(carouselOptions,{interval:false,touch:true,keyboard:true,wrap:true});
const download=find(modal,'modal-footer').children.at(-1);
carousel.dispatch('slid.bs.carousel',{to:1});
assert.equal(selectedIndex,1);
assert.match(download.href,/bejarat-1600-640\.webp$/);
assert.equal(find(modal,'cs43-gallery-caption').textContent,'Iskolai udvar');
modal.dispatch('hidden.bs.modal');
assert.equal(closed,true);
assert.equal(modal.isConnected,false);
assert.equal(disposeCount,2);
assert.equal(openImageViewer([{src:'https://example.org/idegen.jpg'}]),false,
 'Nem engedélyezett külső média nem nyitható meg');
assert.equal(openDocumentViewer({filePath:'https://example.org/rossz.pdf'}),false);
assert.equal(openDocumentViewer({filePath:'assets/documents/iskolai-minta.docx',
 title:'Iskolai dokumentum',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 status:'published',version:'1.0.0'}),true);
const documentModal=body.children.at(-1);
assert.ok(documentModal.classList.contains('cs43-document-viewer'));
assert.match(find(documentModal,'cs43-load-status').textContent,/eredeti formázását/);
assert.equal(find(documentModal,'cs43-pdf-toolbar').hidden,true,
 'Nem PDF formátumnál nem jelenik meg értelmetlen PDF-lapozó');
assert.ok(find(documentModal,'modal-footer').children.some(node=>node.textContent==='Letöltés'));
documentModal.dispatch('hidden.bs.modal');
assert.equal(documentModal.isConnected,false);
// 1.45: CDN-kiesés és MutationObserver nélküli böngésző esetén a saját
// képnézőnek valódi dialógusként, háttérfókusz nélkül kell működnie.
globalThis.MutationObserver=undefined;
window.bootstrap=undefined;
const behind=new Node('main');body.append(behind);
const launcher=new Node('button');document.activeElement=launcher;
assert.equal(openImageViewer(images,0),true);
const fallback=body.children.at(-2);
assert.equal(fallback.getAttribute('role'),'dialog');
assert.equal(behind.inert,true,'Háttérelemek kizárása a fókuszsorrendből');
await Promise.resolve();
assert.ok(find(fallback,'btn-close'));
fallback.dispatch('keydown',{key:'Escape',preventDefault(){}});
assert.equal(fallback.isConnected,false);
assert.equal(behind.inert,false,'Háttérfókusz visszaállítása bezáráskor');
assert.equal(document.activeElement,launcher);
console.log('M13.3 saját Bootstrap-nézők DOM-próbája: témaszűrés, swipe, képaláírás, letöltés, Word-állapot és bezárás OK');
