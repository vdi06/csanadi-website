'use strict';
/* Beágyazott térképes aloldal: valódi route-kezelő és biztonságosan ellenőrzött üzenetek. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../js/app.js'),'utf8');
const start=source.indexOf("const arrivalPrefix='#/megkozelites-es-tanulas'");
const end=source.indexOf('function wireReveal()',start);
assert.ok(start>0&&end>start);
const tests=[];
function check(name,fn){try{fn();tests.push({name,ok:true});}catch(e){tests.push({name,ok:false,error:e.message});}}
const emitted=[],dispatch=[],classes=new Set(),scrolls=[],historyScroll=new Map(),listeners=new Map();
let frame=null,scrollY=0,currentRoute=null;
function dom(tag,attrs={},text=''){
 const node={tag,attrs,text,children:[],style:{},dataset:{},isConnected:true,contentWindow:{},append(...children){this.children.push(...children)},
  setAttribute(k,v){this.attrs[k]=v},getBoundingClientRect(){return {top:tag==='iframe'?300:0,height:80}}};
 if(tag==='iframe')frame=node;return node;
}
const app={dataset:{},replaceChildren(...nodes){this.children=nodes},focus(){}};
const window={scrollTo(args){scrollY=args.top;scrolls.push(args)},addEventListener(name,fn){listeners.set(name,fn)},removeEventListener(name,fn){if(listeners.get(name)===fn)listeners.delete(name)}};
const document={body:{classList:{add(...names){names.forEach(n=>classes.add(n))}}},documentElement:{dataset:{}},
 getElementById(id){return id==='site-header'?{getBoundingClientRect(){return {height:80}}}:null},title:''};
const context=vm.createContext({window,document,app,dom,historyScroll,
  syncRound29HomeNavigation:isHome=>dispatch.push(['home',isHome]),
  syncMobileEmbeddedSections:(wrapper,iframe,sections)=>dispatch.push(['sections',sections?.length||0]),
  syncRouteHero:()=>dispatch.push(['hero']),renderMenu:()=>{},closeMobile:()=>{},closeSiteMap:()=>{},
  markRouteRendered:(route,detail)=>dispatch.push(['route',route,detail]),
  location:{origin:'https://csanadi.example'},requestAnimationFrame:fn=>fn(),get scrollY(){return scrollY},
  get currentRoute(){return currentRoute},set currentRoute(value){currentRoute=value},
  console,Number,Map});
vm.runInContext(source.slice(start,end),context);
const invoke=code=>vm.runInContext(code,context);
function message({origin='https://csanadi.example',section='terkep',offset=500,height=2600,sections=[{id:'terkep',label:'Térkép',offset:500},{id:'felveteli',label:'Felvételi',offset:1500}],source=frame?.contentWindow}={}){
 return listeners.get('message')?.({origin,source,data:{source:'csanadi-r26-embed',height,section,offset,sections}});
}
check('térképes mélyhivatkozás kezelése',()=>{assert.equal(invoke("embeddedArrival('#/megkozelites-es-tanulas/terkep',{})"),true);assert.equal(frame.src,'megkozelites-es-tanulas.html?embedded=1#terkep')});
check('beágyazott frame valóban megjelenik',()=>{assert.equal(app.children[0].children[1],frame);assert.ok(classes.has('cs-embedded-arrival'))});
check('azonos eredetű iframe szakaszok átvétele',()=>{message();assert.ok(dispatch.some(x=>x[0]==='sections'&&x[1]===2))});
check('iframe magasságának átvétele',()=>{assert.equal(frame.style.height,'2600px')});
check('mélyhivatkozás fejléctől szabadon látható helyre ugrik',()=>{assert.equal(scrolls.at(-1).top,708)});
check('azonos szakasz ismételt üzenete nem görget újra',()=>{const n=scrolls.length;message();assert.equal(scrolls.length,n)});
check('idegen eredetű üzenet elutasítása',()=>{const n=dispatch.length;message({origin:'https://evil.example'});assert.equal(dispatch.length,n)});
check('idegen frame üzenete elutasítva',()=>{const n=dispatch.length;message({source:{}});assert.equal(dispatch.length,n)});
check('érvénytelen magasság nem módosítja a frame-et',()=>{message({height:999999});assert.equal(frame.style.height,'2600px')});
check('böngésző előzménnyel visszalépve megőrzi a görgetést',()=>{
 historyScroll.set('#/megkozelites-es-tanulas/terkep',1324);
 invoke("embeddedArrival('#/megkozelites-es-tanulas/terkep',{restoreScroll:true})");
 message();assert.equal(scrolls.at(-1).top,1324);
});
check('menüpontváltás során a korábbi megfigyelő leválik',()=>{
 const previous=listeners.get('message');
 invoke("embeddedArrival('#/megkozelites-es-tanulas/felveteli',{})");
 assert.notEqual(listeners.get('message'),previous);
});
check('új térképes menüpontnak saját szakaszhivatkozása van',()=>{assert.equal(frame.src,'megkozelites-es-tanulas.html?embedded=1#felveteli')});
check('ismeretlen/hibás route nem tölthet be beágyazást',()=>{assert.equal(invoke("embeddedArrival('#/megkozelites-es-tanulas/x!',{})"),false)});
const failed=tests.filter(x=>!x.ok);
console.log(JSON.stringify({version:'1.28.0',total:tests.length,passed:tests.length-failed.length,failed}));
if(failed.length)process.exitCode=1;
