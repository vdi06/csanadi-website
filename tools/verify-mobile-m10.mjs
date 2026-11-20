/** M10: nyílbillentyűs fókusz, újrarajzolás, keresőmező és mobil/desktop átállás. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mobileM10NextIndex,mobileM10ShouldAssistFocus,initMobileWorkflowsM10}
 from '../mobile/mobile-m10-workflows-v1-43-15.js';

assert.equal(mobileM10NextIndex(0,3,'ArrowRight'),1);
assert.equal(mobileM10NextIndex(2,3,'ArrowDown'),0);
assert.equal(mobileM10NextIndex(0,3,'ArrowLeft'),2);
assert.equal(mobileM10NextIndex(1,3,'ArrowUp'),0);
assert.equal(mobileM10NextIndex(2,3,'Home'),0);
assert.equal(mobileM10NextIndex(0,3,'End'),2);
assert.equal(mobileM10NextIndex(1,3,'PageUp'),-1);
assert.equal(mobileM10NextIndex(1,0,'Home'),-1);
assert.equal(mobileM10ShouldAssistFocus({viewportHeight:480,top:60,bottom:110}),false);
assert.equal(mobileM10ShouldAssistFocus({viewportHeight:480,top:8,bottom:30}),true);
assert.equal(mobileM10ShouldAssistFocus({viewportHeight:480,top:450,bottom:490}),true);
assert.equal(mobileM10ShouldAssistFocus({mobile:false,viewportHeight:480,top:450,bottom:490}),false);

const listeners=new Map();let buttonFocus=null,scrollCalls=0;
const app={};
const group={isConnected:true,buttons:[],closest:sel=>sel==='#app'?app:null,
 querySelectorAll:()=>group.buttons};
function makeButton(label){const attributes=new Map(),btn={textContent:label,hidden:false,isConnected:true,
 closest:sel=>sel==='button'?btn:sel.includes('media26-albums')?group:null,
 getAttribute:name=>attributes.get(name)??null,
 setAttribute:(name,value)=>attributes.set(name,String(value)),
 focus:()=>{buttonFocus=btn}};return btn;}
group.buttons=[makeButton('Sport'),makeButton('Tanulás'),makeButton('Közösség')];
const root={dataset:{}};
const links=[];
function makeLink(href){const attrs=new Map([['href',href]]),link={dataset:{},
 getAttribute:name=>attrs.get(name)??null,hasAttribute:name=>attrs.has(name),
 setAttribute:(name,value)=>attrs.set(name,String(value)),
 removeAttribute(name){attrs.delete(name);if(name==='data-cs-m10-current')delete link.dataset.csM10Current}};
 links.push(link);return link;}
const sportLink=makeLink('#/sport'),homeLink=makeLink('#/');
const mq={matches:true,change:null,addEventListener(type,fn){this.change=fn}};
globalThis.document={documentElement:root,activeElement:null,addEventListener(type,fn){listeners.set(type,fn)},
 querySelectorAll:selector=>selector==='[data-cs-m10-current="1"]'?links.filter(l=>l.dataset.csM10Current==='1'):links};
globalThis.matchMedia=()=>mq;
globalThis.location={hash:'#/sport'};
globalThis.window={innerHeight:800,visualViewport:{height:430,offsetTop:0}};
globalThis.setTimeout=fn=>{fn();return 1};
initMobileWorkflowsM10();initMobileWorkflowsM10();
assert.equal(listeners.size,4,'Csak egyszer regisztrálhatók a műveletek');
assert.equal(sportLink.getAttribute('aria-current'),'page');
const oldButton=group.buttons[1];listeners.get('click')({target:oldButton});
group.buttons=[makeButton('Sport'),makeButton('Tanulás'),makeButton('Közösség')];
oldButton.isConnected=false;
await Promise.resolve();
assert.equal(buttonFocus,group.buttons[1],'Újrarajzolás után a kiválasztott szűrőn maradjon a fókusz');
let prevented=false;
listeners.get('keydown')({target:group.buttons[2],key:'ArrowRight',preventDefault:()=>{prevented=true}});
assert.equal(buttonFocus,group.buttons[0]);assert.equal(prevented,true);

location.hash='#/';listeners.get('csanadi:route-rendered')();
assert.equal(homeLink.getAttribute('aria-current'),'page');
assert.equal(sportLink.getAttribute('aria-current'),null);
const field={isConnected:true,matches:sel=>sel.includes('input'),closest:()=>app,
 getBoundingClientRect:()=>({top:440,bottom:480}),scrollIntoView:()=>{scrollCalls++}};
document.activeElement=field;listeners.get('focusin')({target:field});
assert.equal(scrollCalls,1,'Virtuális billentyűzet által takart mező láthatóvá tétele');
window.visualViewport.height=800;listeners.get('focusin')({target:field});
assert.equal(scrollCalls,1,'Látható mezőnél nincs indokolatlan görgetés');
mq.matches=false;mq.change();assert.equal(homeLink.getAttribute('aria-current'),null);
buttonFocus=null;listeners.get('keydown')({target:group.buttons[0],key:'ArrowRight',preventDefault(){}});
assert.equal(buttonFocus,null,'Desktop mód: mobilos billentyűkezelés nem aktív');

const css=readFileSync(new URL('../mobile/mobile-m10-workflows-v1-43-15.css',import.meta.url),'utf8');
for(const marker of ['#search-panel','.search-dialog','safe-area-inset-top','min-height:100dvh',
 'min-height:52px','aria-pressed','aria-current="page"','prefers-reduced-motion:reduce'])
 assert.ok(css.includes(marker),marker);
assert.ok([...css.matchAll(/@media\s+[^{}]+\{/g)].every(m=>m[0].includes('max-width:768px')));
assert.equal([...css].reduce((n,ch)=>n+(ch==='{')-(ch==='}'),0),0);
console.log('M10 ellenőrzés: újrarajzolás/fókusz, billentyűzet, kereső, route, mobil/desktop és CSS OK');
