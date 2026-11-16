'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const code=read('js/round29-home.js');
const checks=[];
function check(name,fn){try{fn();checks.push({name,ok:true});}catch(error){checks.push({name,ok:false,error:error.message});}}
const sandbox={};
vm.createContext(sandbox);
vm.runInContext(`
 let mobileTargets=[],mobileIndex=0,mobilePageKind='home';
 let mobileSubpageRoot=null,mobileSubpageObserver=null,mobileSubpageMutation=null,mobileEligibilityFrame=0;
 let mobileEmbeddedSignature='',mobileEmbeddedAnchors=new Map();
 let mobileBar={hidden:true},mobileList={items:[],replaceChildren(){this.items=[]},append(item){this.items.push(item)}};
 let positionUpdates=0,closeCount=0;
 let frames=[],frameId=0,observed=[];
 const window={innerHeight:800,ResizeObserver:null};
 function requestAnimationFrame(fn){frames.push(fn);return ++frameId}
 function cancelAnimationFrame(id){frames=[]}
 function flushFrames(){const next=frames.splice(0);for(const fn of next)fn()}
 function create(tag,cls,label){return {tag,cls,textContent:label,dataset:{},style:{},hidden:false,addEventListener(){},setAttribute(){},remove(){this.removed=true},getBoundingClientRect(){const top=Number.parseInt(this.style.top)||0;return {top,bottom:top+1}},getClientRects(){return [{}]}}}
 function closeMobileSheet(){closeCount++}
 function updateMobilePosition(){positionUpdates++}
 function mountMobileNavigator(){}
 class ResizeObserver{constructor(fn){this.fn=fn;this.disconnected=false;observed.push(this)}observe(){}disconnect(){this.disconnected=true}trigger(){this.fn()}}
 window.ResizeObserver=ResizeObserver;
 function makeHeading(label){return {textContent:label,hidden:false,closest(){return null}}}
 function makeSection(label,top,bottom){
  const heading=label?makeHeading(label):null;
  return {hidden:false,heading,tagName:'SECTION',closest(){return null},querySelector(s){return s===':scope > h2'||s==='h2'?heading:null},
   getBoundingClientRect(){return {top,bottom}},getClientRects(){return [{}]}};
 }
 function makeRoot(articleSections,extra=[]){
  const article={classList:{contains:v=>v==='article-flow'},querySelectorAll:()=>articleSections};
  const modules=extra.map(([label,top,bottom])=>{const item=makeSection(label,top,bottom);item.classList={contains:()=>false};return item});
  const content={children:[...modules,article]};
  return {isConnected:true,querySelector(s){return s==='.content-tiles'?content:null}};
 }
`,sandbox);
const begin=code.indexOf('function setMobileTargets('),end=code.indexOf('function makeApproach()',begin);
assert.ok(begin>0&&end>begin,'Mobilos funkciók nem találhatók');
vm.runInContext(code.slice(begin,end).replace(/export function /g,'function '),sandbox);
function act(snippet){return vm.runInContext(snippet,sandbox);}

check('A: az aloldali szakaszok a tényleges cikkcímekből gyűlnek',()=>{
 act("var page=makeRoot([makeSection('Első rész',100,360),makeSection('Második rész',380,760),makeSection('Harmadik rész',780,1100)]);syncMobileSubpageSections(page);flushFrames()");
 assert.equal(act('mobileTargets.length'),3);assert.equal(act('mobileList.items.length'),3);
 assert.equal(act('mobileTargets[1].label'),'Második rész');assert.equal(act('mobileBar.hidden'),false);
});
check('A: a szakaszlistában gombok és sorszámozott célpontok vannak',()=>{
 assert.equal(act('mobileList.items[1].dataset.mobileIndex'),'1');assert.equal(act('mobileList.items[1].textContent'),'Második rész');
});
check('A: a lap tetejéről induló saját szakaszmenü a meglévő négy műveletet megtartja',()=>{
 assert.ok(code.includes("['top','⌂','Eleje']"));assert.ok(code.includes("['previous','↑','Előző']"));
 assert.ok(code.includes("['next','↓','Következő']"));assert.ok(code.includes("['sections','☷','Szakaszok']"));
});
check('B: az oldalak már létező tematikus moduljai is bekerülnek a listába',()=>{
 act("page=makeRoot([makeSection('Tananyag',620,800),makeSection('Feladat',810,1100)],[['Eseménynaptár',100,600]]);syncMobileSubpageSections(page);flushFrames()");
 assert.equal(act('mobileTargets.length'),3);assert.equal(act('mobileTargets[0].label'),'Eseménynaptár');
});
check('B: rövid, kétcímű tartalom esetén nem jelenik meg felesleges sáv',()=>{
 act("page=makeRoot([makeSection('Rövid 1',100,170),makeSection('Rövid 2',180,240)]);syncMobileSubpageSections(page);flushFrames()");
 assert.equal(act('mobileBar.hidden'),true);
});
check('B: egyetlen tartalmi szakasznál nincs szakaszlista',()=>{
 act("page=makeRoot([makeSection('Egyetlen',100,1000)]);syncMobileSubpageSections(page);flushFrames()");
 assert.equal(act('mobileTargets.length'),1);assert.equal(act('mobileBar.hidden'),true);
});
check('B: változó tartalomhossz esetén újramér, a navigáció előbukkan',()=>{
 act("page=makeRoot([makeSection('Első',100,190),makeSection('Második',200,250)]);syncMobileSubpageSections(page);flushFrames()");
 assert.equal(act('mobileBar.hidden'),true);
 act("mobileTargets[1].target.getBoundingClientRect=()=>({top:700,bottom:1200});observed.at(-1).trigger();flushFrames()");
 assert.equal(act('mobileBar.hidden'),false);
});
check('B: új aloldalra lépéskor a korábbi méretfigyelő megszűnik',()=>{
 act("page=makeRoot([makeSection('Új 1',100,300),makeSection('Új 2',310,700)]);syncMobileSubpageSections(page);flushFrames()");
 assert.equal(act('observed.at(-2).disconnected'),true);assert.equal(act('observed.at(-1).disconnected'),false);
});
check('B: tartalom nélküli útvonalon nem marad régi menü',()=>{
 act("syncMobileSubpageSections({isConnected:true,querySelector(){return null}});flushFrames()");
 assert.equal(act('mobileTargets.length'),0);assert.equal(act('mobileBar.hidden'),true);
});
check('B: a megközelítési iframe nem kap hamis szakaszokat',()=>{
 const app=read('js/app.js');assert.ok(app.includes('syncRound29HomeNavigation(false);'));assert.ok(app.includes("if(arrivalSection(requested)!==null){embeddedArrival(requested,options);return;}"));
});
check('C: az összes regisztrált aloldalon vannak saját címes tartalmi szakaszok',()=>{
 const s=JSON.parse(read('json/structure.json'));const invalid=[];let count=0;
 function walk(items){for(const item of items){const p=JSON.parse(read('json/'+item.path));count++;
  if((p.blocks||[]).filter(b=>b.type==='section'&&b.title).length<2)invalid.push(p.schemaExtensions?.route);
  walk(item.children||[]);
 }}walk(s.nodes);assert.equal(count,65);assert.deepEqual(invalid,[]);
});
check('C: a kezdőoldal szakaszlistája és asztali menüje érintetlen marad',()=>{
 assert.ok(code.includes('function buildLinks(canvas)'));assert.ok(code.includes('function mountNavigator()'));
 assert.ok(code.includes('export function enhanceRound29Home(canvas)'));
});
check('C: route-render után épül meg az aloldal menüje, nem a régi oldal alapján',()=>{
 const app=read('js/app.js');assert.ok(app.indexOf('app.replaceChildren(node?')<app.indexOf("if(kind!=='home')syncMobileSubpageSections(app)"));
});
check('C: a szakaszlista bezárul oldalváltáskor, és visszaáll a görgetés',()=>{
 assert.ok(code.includes('function closeMobileSheet(restoreFocus=true)'));
 assert.ok(code.includes('mobileBackdrop.hidden=true'));assert.ok(code.includes('document.body.style.overflow=mobileOldOverflow'));
});
check('C: az összecsukott szülőszakaszokat az ugrás kibontja',()=>{
 assert.ok(code.includes("if(parent.tagName==='DETAILS')parent.open=true"));
});
check('C: a billentyűzetes fókusz a kiválasztott szakaszra kerül',()=>{
 assert.ok(code.includes('item.target.focus({preventScroll:true})'));
});
check('C: a felúszó lap tetejére gomb teljesen megszűnt',()=>{
 const css=read('css/round32-mobile-sections.css');assert.ok(css.includes('@media(max-width:768px)'));
 assert.ok(!read('js/interactions-be-2026.js').includes("top.id='be2026-top'"));
 assert.ok(!read('css/interactions-be-2026.css').includes('.be2026-top'));
 assert.ok(!code.includes('cs29-drawer-top'));
});
check('C: a sáv miatt a tartalom alja mobilon nincs eltakarva',()=>{
 assert.ok(read('css/round32-mobile-sections.css').includes('body.cs-inner-page:has(.cs32-mobile-bar:not([hidden])){padding-bottom:calc(155px + env(safe-area-inset-bottom))}'));
});
check('C: a mobilos lista ESC-pel zárható és a Tab-fókusz bent marad',()=>{
 assert.ok(code.includes("event.key==='Escape'"));assert.ok(code.includes("event.key==='Tab'"));
});
check('C: FTP-kompatibilis és CDN-ről tölti a verzióhoz rögzített Bootstrapet',()=>{
 assert.ok(read('index.html').includes('cdn.jsdelivr.net/npm/bootstrap@5.3.9/'));
 assert.ok(!fs.existsSync(path.join(root,'package.json')));
});
check('D: a térképes és tanulási iframe a tényleges tíz szakaszt adja át',()=>{
 const html=read('megkozelites-es-tanulas.html'),app=read('js/app.js');
 assert.ok(html.includes("document.querySelectorAll('#arrival-main .arrival2-section[id]')"));
 assert.ok(html.includes('offset:Math.round(element.getBoundingClientRect().top+scrollY)'));
 assert.ok(app.includes('syncMobileEmbeddedSections(wrapper,iframe,event.data.sections)'));
});
check('D: a beágyazott oldal két szakaszából tényleges mobilos szakaszmenü épül',()=>{
 act("var wrap={isConnected:true,appended:[],append(n){this.appended.push(n)},getBoundingClientRect(){return {top:100}}};var frame={isConnected:true,getBoundingClientRect(){return {top:320}}};syncMobileEmbeddedSections(wrap,frame,[{id:'terkep',label:'Térkép',offset:120},{id:'felveteli',label:'Felvételi',offset:900}]);flushFrames()");
 assert.equal(act('mobileTargets.length'),2);
 assert.equal(act('mobileBar.hidden'),false);
 assert.equal(act('mobileTargets[0].target.style.top'),'340px');
 assert.equal(act('mobileTargets[1].target.style.top'),'1120px');
});
check('D: az iframe új méretei nem építik újra feleslegesen a gombokat',()=>{
 const before=act('mobileList.items[0]');
 act("syncMobileEmbeddedSections(wrap,frame,[{id:'terkep',label:'Térkép',offset:170},{id:'felveteli',label:'Felvételi',offset:1000}]);flushFrames()");
 assert.equal(act('mobileList.items[0]'),before);
 assert.equal(act('mobileTargets[1].target.style.top'),'1220px');
});
check('E: azonos szakaszcímek megkülönböztethetők',()=>{
 act("setMobileTargets([{id:'a',label:'Az iskola',target:makeSection('Az iskola',0,600)},{id:'b',label:'Az iskola',target:makeSection('Az iskola',800,1400)}],'subpage')");
 assert.equal(act('mobileTargets[0].label'),'Az iskola (1/2)');
 assert.equal(act('mobileTargets[1].label'),'Az iskola (2/2)');
});
check('F: a meglévő dinamikus szakaszfigyelés a tartalom változását is követi',()=>{
 assert.ok(code.includes('MutationObserver'));
 assert.ok(code.includes('attributeFilter:'));
 assert.ok(code.includes('subpageTargets(mobileSubpageRoot)'));
});
check('G: szakaszmenü és főmenü kölcsönösen bezárják egymást',()=>{
 const app=read('js/app.js');
 assert.ok(app.includes('csanadi:section-menu-opening'));
 assert.ok(app.includes('csanadi:main-menu-opening'));
 assert.ok(code.includes('csanadi:main-menu-opening'));
});
check('H: az oldali téma követi az operációs rendszert és a tárolt preferenciát',()=>{
 const html=read('index.html'),map=read('megkozelites-es-tanulas.html'),child=read('js/round26-arrival.js');
 assert.ok(html.includes('document.documentElement.dataset.themePreference=m'));
 assert.ok(!map.includes('<html lang="hu" data-theme="light">'));
 assert.ok(child.includes("addEventListener('storage'"));
 assert.ok(child.includes('document.documentElement.dataset.themePreference=selected'));
});
const failed=checks.filter(c=>!c.ok);
console.log(JSON.stringify({version:'1.19.0',total:checks.length,passed:checks.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
