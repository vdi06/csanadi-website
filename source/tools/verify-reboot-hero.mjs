/** Új filmes mobilképernyő: kezdőkép, kézi léptetés, érintés, redukált mozgás. */
import assert from 'node:assert/strict';
import {createFreshMobileHero,mobileSlideIndex,mobileAutoPlayAllowed,mobileNextAvailableSlide}
 from '../mobile/reboot-hero-v1-43-29.js';
assert.equal(mobileSlideIndex(-1,3),2);
assert.equal(mobileSlideIndex(3,3),0);
assert.equal(mobileSlideIndex(2,3),2);
assert.equal(mobileSlideIndex(0,0),0);
const skipped=new Map([[1,40000]]);
assert.equal(mobileNextAvailableSlide(0,1,3,skipped,20000),2,
 'M21: átmeneti hibás képet kihagy a következő nyíl');
assert.equal(mobileNextAvailableSlide(0,1,3,skipped,50000),1,
 'M21: lejárt tiltás után a kép újrapróbálható');
assert.equal(mobileNextAvailableSlide(0,1,1,new Map(),50000),-1);
for(const opts of [{reduce:true},{limit:true},{mobile:false},{visible:false},{hidden:true},
 {paused:true},{overlay:true},{interacting:true}]){
 assert.equal(mobileAutoPlayAllowed(opts),false,JSON.stringify(opts));
}
assert.equal(mobileAutoPlayAllowed(),true);

class Node {
 constructor(tag='div'){this.tagName=tag;this.className='';this.textContent='';this.dataset={};
  this.children=[];this.events=new Map();this.hidden=false;this.attributes={};this.isConnected=true;
  this.style={width:'',setProperty(k,v){this[k]=v}};
  this.classList={add:(...parts)=>{this.className=[...new Set([...this.className.split(' ').filter(Boolean),...parts])].join(' ')},
   remove:(...parts)=>{this.className=this.className.split(' ').filter(x=>!parts.includes(x)).join(' ')}};
 }
 append(...nodes){for(const node of nodes){
  if(node.tagName==='#fragment'){this.append(...[...node.children]);node.children=[];continue;}
  node.parentNode=this;this.children.push(node);
 }}
 after(...nodes){if(!this.parentNode)return;
  const parent=this.parentNode,index=parent.children.indexOf(this);
  for(const [offset,node] of nodes.entries()){node.parentNode=parent;node.isConnected=true;
   parent.children.splice(index+1+offset,0,node);}
 }
 prepend(...nodes){for(const node of nodes){node.parentNode=this;this.children.unshift(node)}}
 insertBefore(node,ref){const index=this.children.indexOf(ref);node.parentNode=this;
  if(index<0)this.append(node);else this.children.splice(index,0,node)}
 remove(){this.isConnected=false;if(this.parentNode){this.parentNode.children=
  this.parentNode.children.filter(x=>x!==this);this.parentNode=null;}}
 addEventListener(type,handler){this.events.set(type,handler)}
 setAttribute(name,value){this.attributes[name]=String(value)}
 removeAttribute(name){delete this.attributes[name]}
 getAttribute(name){return this.attributes[name]??null}
 contains(node){return this===node||this.children.some(child=>child.contains?.(node))}
 querySelector(selector){
  const walk=node=>{for(const child of node.children){if(selector==='img'&&child.tagName==='img')return child;
   const found=walk(child);if(found)return found}return null};return walk(this);
 }
 click(){this.events.get('click')?.({preventDefault(){}})}
}
globalThis.document={createElement:tag=>new Node(tag),
 createDocumentFragment:()=>new Node('#fragment'),createComment:()=>new Node('#comment'),
 hidden:false,activeElement:null,
 body:{classList:{contains:()=>false}}};
const media={phone:{matches:true,listeners:[],addEventListener(name,listener){
 if(name==='change')this.listeners.push(listener)}},reduced:{matches:true}};
globalThis.matchMedia=query=>query.includes('reduced-motion')?media.reduced:media.phone;
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{connection:{saveData:true,effectiveType:'4g'}}});
globalThis.setInterval=()=>1;
const pics=()=>{const p=new Node('picture'),img=new Node('img');img.complete=true;
 img.naturalWidth=600;img.decode=()=>Promise.resolve();p.append(img);return p};
const slides=[{mediaId:'media:sport',title:'Sport',buttons:[{href:'#/sport'}]},
 {mediaId:'media:bejarat',title:'Bejárat',buttons:[{href:'#/iskolank'}]},
 {mediaId:'media:oktatas',title:'Oktatás',buttons:[{href:'#/oktatas'}]}];
media.phone.matches=false;
const desktopSection=new Node('section');
desktopSection.append(createFreshMobileHero({slides,createPicture:pics,mediaItem:()=>({})}));
const originalDesktopCarousel=new Node('div');
originalDesktopCarousel.id='csn26-visual-carousel';
desktopSection.append(originalDesktopCarousel);
assert.equal(desktopSection.children.length,2,
 'M17: a desktop kezdőlap a horgonyt és az eredeti desktop képváltót tartalmazza');
assert.equal(desktopSection.children[0].tagName,'#comment');
assert.equal(desktopSection.children[1],originalDesktopCarousel,
 'Az eredeti asztali képváltó változatlan példány marad');
media.phone.matches=true;
for(const listener of media.phone.listeners)listener({matches:true});
assert.equal(desktopSection.children.length,3,
 'Mobilos méretre váltáskor a filmes mobil UI a horgony után kerül be');
assert.equal(desktopSection.children[1].hidden,false);
media.phone.matches=false;
for(const listener of media.phone.listeners)listener({matches:false});
assert.equal(desktopSection.children.length,2,
 'Desktopra visszatérve a filmes mobil DOM-elemet teljesen el kell távolítani');
assert.equal(desktopSection.children[1],originalDesktopCarousel,
 'Átméretezés után is érintetlen az eredeti asztali képváltó');
media.phone.matches=true;
const mountHero=args=>{const section=new Node('section');
 section.append(createFreshMobileHero(args));
 return section.children.find(child=>child.className==='cs-mb-cinema');};
const root=mountHero({slides,createPicture:pics,mediaItem:()=>({}),intervalMs:8000});
assert.equal(root.className,'cs-mb-cinema');
const stage=root.children[0],info=root.children[1];
const heading=info.children[1],panel=info.children[3];
assert.equal(heading.textContent,'Bejárat','Az első mobilos kép a bejárat');
assert.equal(info.children[4].children[0].href,'#/iskolank');
const next=panel.children[2],previous=panel.children[0];
const tick=async()=>{for(let i=0;i<16;i++)await Promise.resolve();};
next.click();await tick();
assert.equal(heading.textContent,'Sport');
assert.equal(panel.children[1].children[0].textContent,'02 / 03');
previous.click();await tick();assert.equal(heading.textContent,'Bejárat');
stage.events.get('touchstart')({touches:[{clientX:250,clientY:170}]});
stage.events.get('touchend')({changedTouches:[{clientX:40,clientY:173}]});
await tick();assert.equal(heading.textContent,'Sport');
stage.events.get('touchstart')({touches:[{clientX:200,clientY:170}]});
stage.events.get('touchcancel')();
stage.events.get('touchend')({changedTouches:[{clientX:30,clientY:170}]});
await tick();assert.equal(heading.textContent,'Sport',
 'Megszakított érintési gesztus nem léptetheti a képváltót');
stage.events.get('touchstart')({touches:[{identifier:1,clientX:240,clientY:170}]});
stage.events.get('touchmove')({touches:[{identifier:1,clientX:190,clientY:170},
 {identifier:2,clientX:260,clientY:190}]});
stage.events.get('touchend')({changedTouches:[{identifier:1,clientX:20,clientY:170}]});
await tick();assert.equal(heading.textContent,'Sport',
 'M15: kétujjas mozdulat nem válthat képet');
stage.events.get('touchstart')({touches:[{identifier:3,clientX:240,clientY:170}]});
stage.events.get('touchend')({changedTouches:[{identifier:4,clientX:20,clientY:170}]});
await tick();assert.equal(heading.textContent,'Sport',
 'M15: nem egyező touch azonosító nem léptethet');
stage.events.get('touchstart')({touches:[{identifier:5,clientX:240,clientY:170}]});
stage.events.get('touchend')({changedTouches:[{identifier:5,clientX:210,clientY:290}]});
await tick();assert.equal(heading.textContent,'Sport',
 'M15: függőleges oldalgörgetés nem léptethet');
assert.equal(info.children[4].children[1].hidden,true,'Csökkentett mozgás/adatkímélés mellett nincs automatikus váltás');
const single=mountHero({slides:[slides[1]],createPicture:pics,mediaItem:()=>({})});
assert.equal(single.children[1].children[3].children[0].disabled,true,'Egy képnél az előző nyíl inaktív');
assert.equal(single.children[1].children[3].children[2].disabled,true,'Egy képnél a következő nyíl inaktív');
// A meglévő kezdőlap DOM-ja egy aloldal után újra csatlakozik a SPA-hoz.
// A korábbi hiba: a képváltó ilyenkor végleg leállította az időzítőjét.
let automaticTick=null;
globalThis.setInterval=fn=>{automaticTick=fn;return 2};
globalThis.requestAnimationFrame=fn=>fn();
globalThis.setTimeout=fn=>{fn();return 1};
globalThis.sessionStorage={getItem:()=> '1'};
media.reduced.matches=false;
const network=navigator.connection;network.saveData=false;
const restored=mountHero({slides,createPicture:pics,mediaItem:()=>({})});
restored.isConnected=false;automaticTick();await tick();
assert.equal(restored.children[1].children[1].textContent,'Bejárat','Lecsatolva szünetel');
restored.isConnected=true;automaticTick();await tick();
assert.equal(restored.children[1].children[1].textContent,'Sport','Visszacsatoláskor folytatódik az animáció');
// M18.3: Safari késleltetett requestAnimationFrame, de már lefutott timeout.
// A régi megoldás a késői rAF-ban az új active képet is is-leaving-re állította.
const lateFrames=[],earlyTimers=[];
globalThis.requestAnimationFrame=fn=>{lateFrames.push(fn);return lateFrames.length};
globalThis.setTimeout=fn=>{earlyTimers.push(fn);return earlyTimers.length};
const delayed=mountHero({slides,createPicture:pics,mediaItem:()=>({})});
const delayedVisual=delayed.children[0].children[0];
delayed.children[1].children[3].children[2].click();await tick();
assert.equal(lateFrames.length,1,'Az animáció első képkockája egyelőre várakozik');
for(const callback of [...earlyTimers])callback();
assert.equal(delayed.children[1].children[1].textContent,'Sport',
 'RAF nélkül a biztonsági időzítő is elvégzi a képcserét');
const pictures=()=>delayedVisual.children.filter(node=>node.tagName==='picture');
assert.equal(pictures().length,1,'Fallback után csak az új kép marad a DOM-ban');
while(lateFrames.length)lateFrames.shift()();
assert.equal(pictures().length,1,'A későn lefutó képkocka nem ronthatja el a képet');
assert.doesNotMatch(pictures()[0].className,/is-leaving|cs-mb-film-entering/);
assert.equal(delayed.children[1].children[3].children[2].disabled,false);
const normalFrames=[],normalTimers=[];
globalThis.requestAnimationFrame=fn=>{normalFrames.push(fn);return normalFrames.length};
globalThis.setTimeout=fn=>{normalTimers.push(fn);return normalTimers.length};
const smooth=mountHero({slides,createPicture:pics,mediaItem:()=>({})});
smooth.children[1].children[3].children[2].click();await tick();
while(normalFrames.length)normalFrames.shift()();
const smoothVisual=smooth.children[0].children[0];
const incoming=smoothVisual.children.filter(node=>node.tagName==='picture'
 &&node.className.includes('cs-mb-film-entering'))[0];
assert.ok(incoming?.className.includes('is-visible'),'A rendes áttűnés elindult');
incoming.events.get('transitionend')?.({target:incoming,propertyName:'opacity'});
assert.equal(smoothVisual.children.filter(node=>node.tagName==='picture').length,1);
assert.doesNotMatch(incoming.className,/is-leaving|cs-mb-film-entering/);
for(const callback of normalTimers)callback();
assert.equal(smoothVisual.children.filter(node=>node.tagName==='picture').length,1,
 'Késői fallback timeout nem távolítja el a kész új képet');
// B változat: a kezdőképből kigörgetve a képváltó megáll, a normál
// dokumentumfolyam és az oldal tartalma változatlan marad.
let ioCallback=null,topHeroTick=null;
globalThis.IntersectionObserver=class{
 constructor(callback){ioCallback=callback}
 observe(){}
};
globalThis.setInterval=callback=>{topHeroTick=callback;return 3};
globalThis.requestAnimationFrame=fn=>fn();
globalThis.setTimeout=fn=>{fn();return 1};
const topHero=mountHero({slides,createPicture:pics,mediaItem:()=>({})});
assert.equal(topHero.dataset.csMbPlacement,'home-hero-only');
ioCallback([{isIntersecting:false}]);
assert.equal(topHero.dataset.csMbVisible,'false');
topHeroTick();await tick();
assert.equal(topHero.children[1].children[1].textContent,'Bejárat',
 'Kigörgetett képváltó nem lapozhat automatikusan');
ioCallback([{isIntersecting:true}]);
topHeroTick();await tick();
assert.equal(topHero.children[1].children[1].textContent,'Sport',
 'A nyitóképre visszatérve automatikus lapozás folytatódhat');
// M19: útvonalváltás közben egy lassú decode Promise nem tarthatja
// letiltva a nyilakat, amikor a régi kezdőlap később visszacsatolódik.
media.reduced.matches=true;network.saveData=true;
let finishDecode=null,created=0;
const decodeTimers=[];
globalThis.setTimeout=fn=>{decodeTimers.push(fn);return decodeTimers.length};
const pendingPicture=()=>{
 const picture=pics();created++;
 if(created===2)picture.querySelector('img').decode=()=>new Promise(resolve=>finishDecode=resolve);
 return picture;
};
const interrupted=mountHero({slides,createPicture:pendingPicture,mediaItem:()=>({})});
const interruptedNext=interrupted.children[1].children[3].children[2];
interruptedNext.click();await tick();
assert.equal(interruptedNext.disabled,true,'Dekódolás közben a dupla lapozás tiltva');
interrupted.isConnected=false;finishDecode();await tick();
assert.equal(interruptedNext.disabled,false,'Leválasztás után a nyíl újra engedélyezett');
interrupted.isConnected=true;interruptedNext.click();await tick();
assert.equal(interrupted.children[1].children[1].textContent,'Sport',
 'Visszatérés után működik a kézi képváltó');
// M20.2: egy soha le nem záruló Safari decode() sem tarthatja fogva
// a lapozót: a legfeljebb 1.4 másodperces várakozás után visszaenged.
let stalledCreated=0;
const permanentlyStalled=()=>{
 const picture=pics();stalledCreated++;
 if(stalledCreated===2)picture.querySelector('img').decode=()=>new Promise(()=>{});
 return picture;
};
const stalled=mountHero({slides,createPicture:permanentlyStalled,mediaItem:()=>({})});
const stalledNext=stalled.children[1].children[3].children[2];
stalledNext.click();await tick();
assert.equal(stalledNext.disabled,true,'A dekódolás során a dupla lapozás tiltott');
decodeTimers.at(-1)();await tick();
assert.equal(stalledNext.disabled,false,'A dekódolás időkorlátja újraengedte a nyilat');
assert.equal(stalled.children[1].children[1].textContent,'Sport');
assert.equal(stalled.children[0].getAttribute('aria-busy'),null);
// M21.3: hálózatilag hibás sportkép után a következő kézi lapozás az
// egészséges oktatási diára lép, nem próbálkozik örökké ugyanazzal.
let tries=0;
const failedPicture=()=>{
 const pic=pics();tries++;
 if(tries===2)pic.querySelector('img').naturalWidth=0;
 return pic;
};
const failedHero=mountHero({slides,createPicture:failedPicture,mediaItem:()=>({})});
const failedNext=failedHero.children[1].children[3].children[2];
failedNext.click();await tick();
assert.equal(failedHero.children[1].children[1].textContent,'Bejárat',
 'Hibás kép nem cserélheti le az előző, jól látható képet');
failedNext.click();await tick();
assert.equal(failedHero.children[1].children[1].textContent,'Oktatás',
 'M21: következő kattintás átugorja a meghibásodott diát');
assert.equal(failedNext.disabled,false);
// M22.3: a legelső bejárati kép hibája ne hagyjon üres nyitóterületet.
let firstAttempts=0;
const firstBroken=()=>{
 const pic=pics();firstAttempts++;
 if(firstAttempts===1)pic.querySelector('img').naturalWidth=0;
 return pic;
};
const recoveredHero=mountHero({slides,createPicture:firstBroken,mediaItem:()=>({})});
await tick();
assert.equal(recoveredHero.children[1].children[1].textContent,'Sport',
 'M22: első hibás kép helyett a következő használható nyitókép látható');
assert.equal(recoveredHero.children[1].children[3].children[2].disabled,false);
// 1.45: az első KÉT hibás kép után ugyanazon helyreállítási körben
// automatikusan a harmadik, ép képre kell lépni.
let consecutiveAttempts=0;
const twoBroken=()=>{
 const pic=pics();consecutiveAttempts++;
 if(consecutiveAttempts<=2)pic.querySelector('img').naturalWidth=0;
 return pic;
};
const consecutivelyRecovered=mountHero({slides,createPicture:twoBroken,mediaItem:()=>({})});
await tick();
assert.equal(consecutivelyRecovered.children[1].children[1].textContent,'Oktatás',
 '1.45: két egymást követő hibás kép után a harmadik betöltődik');
assert.equal(consecutivelyRecovered.children[1].children[3].children[2].disabled,false);
console.log('Új filmes mobil DOM-próba: bejárati kezdőkép, körbeforduló nyilak, swipe, fókuszbarát statikus csere OK');
