/* v1.38: hálózat és grafikus böngésző nélkül végrehajtható, tételes regresszió. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const source=path.resolve(__dirname,'../../v1_37');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const json=relative=>JSON.parse(read(relative));
const structure=json('json/structure.json');
const old=JSON.parse(fs.readFileSync(path.join(source,'json/structure.json'),'utf8'));
const index=json('json/oldalindex.json');
const html=read('index.html'),app=read('js/app.js'),desktop=read('desktop/navigation.js');
const phoneJS=read('mobile/radial-wheel-v1-38.js'),phoneCSS=read('mobile/radial-wheel-v1-38.css');
const ribbonJS=read('js/subpages-v1.js'),ribbonCSS=read('css/desktop-condensed-ribbon-v1-38.css');
const report={version:'1.38.0',testedAt:new Date().toISOString(),method:'Fájlrendszer, JavaScript-szintaxis, adatséma, tartalmi hivatkozások és körmenüállapotok emulált DOM-mal',results:[],browser:{status:'NOT_RUN',reason:'A grafikus Chromium indítása a futtatókörnyezetben Operation not permitted hibával megszakad; valódi vizuális/mobil eszközös vizsgálat még szükséges.'}};
const test=(label,check)=>{try{check();report.results.push({label,status:'OK'});}catch(error){report.results.push({label,status:'FAIL',reason:String(error.message||error).slice(0,800)});}};
const walk=(nodes,depth=1,arr=[])=>{for(const n of nodes||[]){arr.push({...n,depth});walk(n.children,depth+1,arr);}return arr;};
const all=walk(structure.nodes),original=walk(old.nodes);
const visible=all.filter(x=>x.menuVisible!==false),roots=structure.nodes;
const routes=Object.values(index.pages||{}).map(p=>p.schemaExtensions?.route);
test('01 · Pontosan 6 főmenü és 28 látható almenü',()=>{
 assert.equal(roots.length,6);
 assert.deepEqual(roots.map(r=>r.children.filter(n=>n.menuVisible!==false).length),[6,6,4,3,4,5]);
 assert.equal(visible.length,34);
});
test('02 · Főmenük neve és sorrendje pontos',()=>{
 assert.deepEqual(roots.map(x=>index.pages[x.path]?.menuLabel),['Iskolánk','Oktatás','Felvételi','Sportélet','Hírek és események','Információk']);
});
test('03 · A menüben nincs harmadik szint',()=>assert.ok(visible.every(x=>x.depth<=2)));
test('04 · A teljes 1.37-es 65 oldalfájl regisztrációja megmaradt',()=>{
 assert.equal(all.length,original.length);
 assert.deepEqual(new Set(all.map(x=>x.path)),new Set(original.map(x=>x.path)));
});
test('05 · A korábbi harmadik szint mind a 27 oldala elérhető',()=>{
 const prior=original.filter(x=>x.depth===3);
 assert.equal(prior.length,27);
 assert.ok(prior.every(x=>all.some(n=>n.path===x.path)));
});
test('06 · A régi 27 harmadik szintű oldal közül 22 tartalmi, 5 közvetlen almenü lett',()=>{
 const prior=original.filter(x=>x.depth===3);
 assert.equal(prior.filter(x=>all.find(n=>n.path===x.path)?.menuVisible===false).length,22);
 assert.equal(prior.filter(x=>all.find(n=>n.path===x.path)?.menuVisible!==false).length,5);
 assert.ok(roots[4].children.some(n=>n.path==='oldalak/hirek-es-esemenyek/hirek/hirarchivum.json'));
});
test('07 · Valamennyi JSON-oldalfájl valóban létezik',()=>all.forEach(n=>assert.ok(fs.existsSync(path.join(root,'json',n.path)),n.path)));
test('08 · Nem ismétlődik oldalfájl, oldalazonosító vagy útvonal',()=>{
 assert.equal(new Set(all.map(n=>n.path)).size,all.length);
 assert.equal(new Set(routes).size,routes.length);
 const ids=Object.values(index.pages).map(p=>p.id);assert.equal(new Set(ids).size,ids.length);
});
test('09 · Minden indexelt oldal szabályos és közzétett',()=>{
 for(const [file,p] of Object.entries(index.pages)){
  assert.ok(p.id&&p.title&&p.menuLabel&&p.schemaExtensions?.route&&p.lifecycle?.status==='published',file);
  assert.ok(fs.existsSync(path.join(root,'json',file)),file);
 }
});
test('10 · Felvételi áttekintés főmenüként megmaradt régi URL-en',()=>{
 assert.equal(index.pages[roots[2].path].schemaExtensions.route,'#/oktatas/felveteli');
 assert.equal(roots[2].children.length,4);
});
test('11 · Sportolók, Csapatok és Edzők tartalmi oldalak, nem menük',()=>{
 for(const s of ['sportolok','csapatok','edzok']){
  const n=all.find(x=>x.path===`oldalak/sport/${s}.json`);assert.ok(n);assert.equal(n.menuVisible,false);
 }
});
test('12 · A lábléc három céloldala nem jelenik meg menüpontként',()=>{
 for(const pair of [['oldalak/informaciok/adatvedelem.json','#/informaciok/adatvedelem'],['oldalak/informaciok/allaspalyazatok.json','#/informaciok/allaspalyazatok'],['oldalak/iskolank/a-honlap-szuletese.json','#/iskolank/a-honlap-szuletese']]){
  assert.equal(all.find(x=>x.path===pair[0])?.menuVisible,false);
  assert.ok(html.includes(`href="${pair[1]}"`),pair[1]);
 }
});
test('13 · Könyvtári szolgáltatások minden blokkja átkerült a Könyvtár oldalra',()=>{
 const parent=json('json/oldalak/oktatas/konyvtar.json');
 const former=json('json/oldalak/oktatas/konyvtar/konyvtari-szolgaltatasok.json');
 const ids=new Set(parent.blocks.map(b=>b.id));former.blocks.forEach(b=>assert.ok(ids.has(b.id),b.id));
});
test('14 · Az elrejtett részletes oldalak tartalmi csempéken jelennek meg',()=>{
 assert.ok(app.includes('contentChildrenOf(catalog,node)'));
 assert.ok(app.includes("class:'cs-nav-detail-tiles'"));
 assert.ok(app.includes('listCards(details,{withoutNumbers:true})'));
});
test('15 · A kereső és a route-katalógus nem dobja el a rejtett oldalt',()=>{
 const content=read('js/content.js');
 assert.ok(content.includes('routes=new Map(available.map'));
 assert.ok(content.includes('x.menuVisible&&x.depth<=2'));
 assert.ok(content.includes('!x.menuVisible'));
});
test('16 · Az asztali megamenü nem hoz létre harmadik szintet',()=>{
 assert.ok(!desktop.includes('nav-mega-sublink'));
 assert.ok(!app.includes('csn26-third-toggle'));
 assert.ok(!app.includes('csn26-third-link'));
});
test('17 · A mobil menü a második szintnél megáll',()=>{
 const mobile=read('mobile/navigation.js');
 assert.ok(!mobile.includes('createMobileMenuSwitcher'));
 assert.ok(!mobile.includes('csn18-mobile-list-nested'));
 assert.ok(!mobile.includes('mobileMenuDefaultMode'));
 assert.ok(!read('json/config.json').includes('mobileMenuDefaultMode'));
});
test('18 · Telefonos módválasztó DOM-elemek törölve',()=>{
 assert.ok(!html.includes('id="mobile-menu-mode-switch"'));
 assert.ok(!html.includes('id="mobile-conventional-navigation"'));
});
test('19 · A telefonos gyűrű kizárólag telefonos médiakérdésben jelenik meg',()=>{
 assert.ok(phoneJS.includes('max-width: 700px'));
 assert.ok(phoneCSS.includes('@media (max-width:700px)'));
 assert.ok(phoneCSS.includes('#cs-phone-wheel{display:none!important}'));
 assert.ok(phoneCSS.includes('#cs-phone-wheel{display:grid!important'));
});
test('20 · Középső iskolai címer és akadálymentes visszalépés',()=>{
 assert.ok(html.includes('class="cs-phone-wheel-center"'));
 assert.ok(phoneJS.includes("center.setAttribute('aria-label'"));
 assert.ok(phoneJS.includes("function back()"));
 assert.ok(app.includes("if(!phoneWheel.back())closeSiteMap()"));
});
test('21 · A körmenüben mind a hat ikon 360 fokon helyezkedik el',()=>{
 const angles=Array.from({length:6},(_,i)=>i*360/6);
 assert.deepEqual(angles,[0,60,120,180,240,300]);
 assert.ok(phoneJS.includes('index*360/count'));
 assert.ok(phoneCSS.includes('rotate(var(--angle))'));
});
test('22 · 320px kijelzőn a 66px célpontok geometriája nem ütközik',()=>{
 const center=160,radius=90,width=66,half=width/2;
 const rectangles=Array.from({length:6},(_,i)=>{
  const a=i*Math.PI/3-Math.PI/2;
  return {x:center+radius*Math.cos(a)-half,y:141+radius*Math.sin(a)-half};
 });
 for(let i=0;i<rectangles.length;i++){
  const a=rectangles[i];assert.ok(a.x>=0&&a.x+width<=320);
  for(let j=i+1;j<rectangles.length;j++){
   const b=rectangles[j];assert.ok(!(a.x<b.x+width-3&&a.x+width>b.x+3&&a.y<b.y+width-3&&a.y+width>b.y+3));
  }
 }
});
test('23 · Asztali aloldalon megmarad a középre igazított körmenünyitó',()=>{
 const oldHeader=read('css/subpage-header-fix.css');
 assert.ok(oldHeader.includes('left:50%!important;top:50%!important'));
 assert.ok(oldHeader.includes('cs-subpage-menu-logo'));
});
test('24 · Kompakt asztali szalag oldalnévvel és görgetési jelzéssel',()=>{
 assert.ok(ribbonJS.includes('cs-subpage-ribbon-title'));
 assert.ok(ribbonJS.includes('cs-subpage-reading-progress'));
 assert.ok(ribbonJS.includes('window.scrollY/extent*100'));
 assert.ok(ribbonCSS.includes('cs-header-condensed'));
});
test('25 · A kompakt oldalcím nem takarja a középen lévő címert',()=>{
 assert.ok(ribbonCSS.includes('max-width:min(34vw,410px)'));
 assert.ok(ribbonCSS.includes('text-overflow:ellipsis'));
});
test('26 · Az új fájlokat a dokumentum és modulszerkezet tényleg betölti',()=>{
 assert.ok(html.includes('mobile/radial-wheel-v1-38.css?v=1.38.0'));
 assert.ok(html.includes('css/desktop-condensed-ribbon-v1-38.css?v=1.38.0'));
 assert.ok(app.includes("from '../mobile/radial-wheel-v1-38.js?v=1.38.0'"));
});
test('27 · Bootstrap külső, verzióhoz kötött CDN; nincs új backend',()=>{
 assert.ok(html.includes('cdn.jsdelivr.net/npm/bootstrap@5.3.9'));
 assert.ok(!app.includes('github.com/actions'));
 assert.ok(!phoneJS.includes('navigator.serviceWorker'));
});
test('28 · JSON-szintaxis és az összes JavaScript-fájl szintaktikailag érvényes',()=>{
 const files=[];const find=(dir)=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const filename=path.join(dir,e.name);
  if(e.isDirectory())find(filename);else files.push(filename);
 }};
 for(const d of ['js','mobile','desktop','tools'])find(path.join(root,d));
 for(const file of files){if(file.endsWith('.js'))execFileSync(process.execPath,['--check',file],{stdio:'pipe'});if(file.endsWith('.json'))JSON.parse(fs.readFileSync(file,'utf8'));}
 find(path.join(root,'json'));
 for(const file of files)if(file.endsWith('.json'))JSON.parse(fs.readFileSync(file,'utf8'));
});
test('29 · Telefonos körmenü állapotgép: fő kör → négy almenü → vissza → bezárásra kész',()=>{
 class FakeElement{
  constructor(tag){this.tag=tag;this.children=[];this.attributes=new Map();this.listeners=new Map();this.style={values:new Map(),setProperty:(name,value)=>this.style.values.set(name,value)};this.dataset={};this.hidden=false;}
  setAttribute(key,value){this.attributes.set(key,value);}
  getAttribute(key){return this.attributes.get(key);}
  replaceChildren(...children){this.children=[...children];}
  append(...children){this.children.push(...children);}
  addEventListener(name,callback){this.listeners.set(name,callback);}
  click(){this.listeners.get('click')?.();}
  focus(){this.focused=true;}
  querySelector(selector){return selector==='.cs-phone-wheel-center-label'?this.label:selector==='.cs-phone-wheel-ring'?this.ring:null;}
 }
 const container=new FakeElement('section');container.ring=new FakeElement('nav');
 const title=new FakeElement('h3'),description=new FakeElement('p'),overview=new FakeElement('a'),center=new FakeElement('button');center.label=new FakeElement('span');
 const source=phoneJS.replace('export const PHONE_QUERY','const PHONE_QUERY').replace('export function createPhoneRadial','function createPhoneRadial');
 const scope=vm.createContext({document:{createElement:tag=>new FakeElement(tag)},matchMedia:()=>({matches:true})});
 vm.runInContext(source+'\nthis.createPhoneRadial=createPhoneRadial;',scope);
 let chosen=0;const wheel=scope.createPhoneRadial({container,title,description,overview,center,media:{matches:true},onChoose:()=>{chosen++;}});
 const entries=roots.map(node=>({title:index.pages[node.path].menuLabel,path:node.path}));
 const childrenOf=entry=>roots.find(x=>x.path===entry.path).children.filter(x=>x.menuVisible!==false).map(child=>({title:index.pages[child.path].menuLabel,path:child.path}));
 wheel.setCatalog(entries,{childrenOf,titleOf:item=>item.title,hrefOf:item=>index.pages[item.path].schemaExtensions.route});
 assert.equal(container.dataset.level,'1');assert.equal(container.ring.children.length,6);
 assert.deepEqual(container.ring.children.map(x=>x.style.values.get('--angle')),["0deg","60deg","120deg","180deg","240deg","300deg"]);
 container.ring.children[2].click();
 assert.equal(container.dataset.level,'2');assert.equal(container.ring.children.length,4);
 assert.equal(overview.hidden,false);assert.equal(center.disabled,false);
 assert.equal(container.ring.children[0].getAttribute('aria-label'),'1. osztályos beiratkozás');
 container.ring.children[0].click();assert.equal(chosen,1);
 assert.equal(wheel.back(),true);assert.equal(container.dataset.level,'1');assert.equal(container.ring.children.length,6);
 assert.equal(wheel.back(),false);assert.equal(center.disabled,true);
});
report.passed=report.results.filter(x=>x.status==='OK').length;
report.failed=report.results.filter(x=>x.status==='FAIL').length;
report.total=report.results.length;
const output=path.resolve(root,'dokumentacio/menu-es-mobilkor-tesztnaplo-v1-38.json');
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({version:report.version,tests:report.total,passed:report.passed,failed:report.failed,browser:report.browser.status,failures:report.results.filter(x=>x.status==='FAIL')}));
if(report.failed)process.exitCode=1;
