/* v1.38.2 – A statikus, aloldalfüggő sportanimációk regressziós ellenőrzése. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const config=JSON.parse(read('json/config.json'));
const index=JSON.parse(read('json/oldalindex.json'));
const structure=JSON.parse(read('json/structure.json'));
const app=read('js/app.js');
const moduleSource=read('js/subpage-header-motion.js');
const css=read('css/subpage-header-motion-v1-38-2.css');
const html=read('index.html');
const ribbon=read('js/subpages-v1.js');
const report={version:'1.38.2',testedAt:new Date().toISOString(),passed:0,failed:0,results:[]};
function test(label,check){try{check();report.passed++;report.results.push({label,status:'OK'});}catch(error){report.failed++;report.results.push({label,status:'FAIL',reason:String(error.message||error)});}}
const selector=app.slice(app.indexOf('export function headerMotionForRoute('),app.indexOf('function syncRouteHero(')).replace('export function','function');
const selection=vm.runInNewContext(`${selector}\nheaderMotionForRoute;`);
class FakeClassList{
 constructor(){this.items=new Set();}
 contains(name){return this.items.has(name);}
 add(name){this.items.add(name);}
 remove(name){this.items.delete(name);}
 toggle(name,flag){if(flag)this.add(name);else this.remove(name);}
}
class FakeElement{
 constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.attributes={};this.dataset={};this.classList=new FakeClassList();this.hidden=false;this.innerHTML='';this.textContent='';}
 setAttribute(name,value){this.attributes[name]=value;}
 append(...nodes){this.children.push(...nodes);}
 prepend(...nodes){this.children.unshift(...nodes);}
 replaceChildren(...nodes){this.children=[...nodes];this.innerHTML='';}
 addEventListener(type,cb){this.listeners[type]=cb;}
 click(){this.listeners.click?.();}
}
const docListeners={};const motionListeners={};
const document={hidden:false,body:{classList:new FakeClassList()},createElement:tag=>new FakeElement(tag),addEventListener:(type,cb)=>{docListeners[type]=cb;}};
const mq={matches:false,addEventListener:(type,cb)=>{motionListeners[type]=cb;}};
const moduleText=moduleSource.replace('export const availableHeaderScenes','const availableHeaderScenes').replace('export function createSubpageHeaderMotion','function createSubpageHeaderMotion');
const exposed=vm.runInNewContext(`${moduleText}\n({availableHeaderScenes,createSubpageHeaderMotion})`,{document,matchMedia:()=>mq});
const brand=new FakeElement('div');
const motion=exposed.createSubpageHeaderMotion(brand);
const region=brand.children[0];
const [visual,copy,button]=region.children;
const [kicker,caption]=copy.children;
const profiles=config.runtime.subpageHeaderMotion;

test('01 · Konfiguráció aktivált, 23 személyre szabott útvonalprofillal',()=>{
 assert.equal(profiles.enabled,true);assert.equal(Object.keys(profiles.profiles).length,23);
});
test('02 · A profilok csak helyi, előre definiált SVG-jeleneteket használnak',()=>{
 const scenes=new Set(exposed.availableHeaderScenes);
 assert.equal(scenes.size,14);
 for(const [prefix,profile] of Object.entries(profiles.profiles)){
  assert.ok(prefix.startsWith('#/'));assert.ok(scenes.has(profile.scene),prefix);
  assert.ok(profile.label.length>0&&profile.caption.length>0);
 }
});
test('03 · A könyvtár saját jelenete felülírja az általános oktatási jelenetet',()=>{
 const result=selection('#/oktatas/konyvtar', {page:{title:'Könyvtár'}},profiles);
 assert.equal(result.scene,'bookjump');assert.equal(result.label,'KÖNYVTÁR');
});
test('04 · A sporteredmények külön mozdulattípust kapnak',()=>{
 const result=selection('#/sport/sporteredmenyek', {page:{}},profiles);
 assert.equal(result.scene,'medal');
});
test('05 · A sport általános oldala labdás animációt kap',()=>{
 assert.equal(selection('#/sport', {page:{}},profiles).scene,'goal');
});
test('06 · A digitális kultúra pixeljelenetet kap',()=>{
 assert.equal(selection('#/oktatas/digitalis-kultura', {page:{}},profiles).scene,'digital');
});
test('07 · A vizsgák akadályugrásos jelenetet kapnak',()=>{
 assert.equal(selection('#/oktatas/vizsgak', {page:{}},profiles).scene,'hurdle');
});
test('08 · A főoldalon és érvénytelen oldalon nincs animáció',()=>{
 assert.equal(selection('#/',{page:{}},profiles),null);
 assert.equal(selection('#/nem-letezo',null,profiles),null);
});
test('09 · A kiiktatott animáció globálisan lekapcsolható',()=>{
 assert.equal(selection('#/sport',{page:{}},{...profiles,enabled:false}),null);
});
test('10 · Az automatikus lejátszás kikapcsolható a konfigurációban',()=>{
 assert.equal(selection('#/sport',{page:{}},{...profiles,autoplay:false}).autoplay,false);
});
test('11 · Egy prefix részleges egyezése nem örökölhet rossz profilt',()=>{
 const result=selection('#/sportolokat-keresunk',{page:{title:'Másik téma'}},profiles);
 assert.equal(result.scene,'dribble');
 assert.equal(result.caption,'Másik téma');
});
test('12 · Mind a 65 nyilvántartott oldal betölthető jelenetet kap',()=>{
 const routes=Object.values(index.pages).map(p=>p.schemaExtensions?.route).filter(route=>route!=='#/');
 assert.equal(routes.length,65);
 for(const route of routes){
  const result=selection(route,{page:{title:'Oldal'}},profiles);
  assert.ok(result);assert.ok(exposed.availableHeaderScenes.includes(result.scene),route);
 }
});
test('13 · A hat főmenü és a 28 almenü továbbra is változatlan',()=>{
 assert.equal(structure.nodes.length,6);
 assert.deepEqual(structure.nodes.map(n=>n.children.filter(c=>c.menuVisible!==false).length),[6,6,4,3,4,5]);
});
test('14 · A keret az első renderelésig rejtve van',()=>assert.equal(region.hidden,true));
test('15 · A megjelenéskor a jelenet és a feliratok helyesek',()=>{
 motion.render(selection('#/oktatas/konyvtar',{page:{}},profiles));
 assert.equal(region.hidden,false);assert.equal(region.dataset.scene,'bookjump');
 assert.ok(visual.innerHTML.includes('cs-mini-book'));
 assert.equal(kicker.textContent,'KÖNYVTÁR');
 assert.equal(caption.textContent,'Könyv fölött, cél felé');
});
test('16 · A szünet gomb kattintása ténylegesen megállítja a mozgást',()=>{
 assert.equal(region.classList.contains('is-paused'),false);
 button.click();assert.equal(region.classList.contains('is-paused'),true);
 assert.equal(button.attributes['aria-pressed'],'true');
 assert.equal(button.classList.contains('is-resumable'),true);
});
test('17 · A gomb másodszori kattintása újraindítja a jelenetet',()=>{
 button.click();assert.equal(region.classList.contains('is-paused'),false);
 assert.equal(button.attributes['aria-pressed'],'false');
});
test('18 · Lefelé görgetve az animáció leáll és elhagyja a helyét',()=>{
 document.body.classList.add('cs-header-condensed');motion.sync();
 assert.equal(region.classList.contains('is-paused'),true);
 assert.ok(css.includes('body.cs-inner-page.cs-header-condensed #site-header .cs-subpage-motion'));
});
test('19 · Felgörgetve ismét megjelenhet és elindulhat',()=>{
 document.body.classList.remove('cs-header-condensed');motion.sync();
 assert.equal(region.classList.contains('is-paused'),false);
});
test('20 · Háttérlapra váltva szünetel',()=>{
 document.hidden=true;docListeners.visibilitychange();
 assert.equal(region.classList.contains('is-paused'),true);
 document.hidden=false;docListeners.visibilitychange();
 assert.equal(region.classList.contains('is-paused'),false);
});
test('21 · Csökkentett mozgásbeállításnál áll és gombot sem mutat',()=>{
 mq.matches=true;motionListeners.change();
 assert.equal(region.classList.contains('is-paused'),true);assert.equal(button.hidden,true);
 mq.matches=false;motionListeners.change();
 assert.equal(region.classList.contains('is-paused'),false);
});
test('22 · Automatikus lejátszás nélkül nyugalomban marad',()=>{
 motion.render({scene:'goal',label:'Sport',caption:'Gól',autoplay:false});
 assert.equal(region.classList.contains('is-paused'),true);assert.equal(button.hidden,true);
});
test('23 · Másik oldalon a jelenet frissül, a korábbi rajz nem marad',()=>{
 motion.render({scene:'eco',label:'ÖKO',caption:'Zöld',autoplay:true});
 assert.ok(visual.innerHTML.includes('cs-mini-leaf'));
 assert.ok(!visual.innerHTML.includes('cs-mini-goal'));
});
test('24 · Hiányzó/idegen jelenet biztonságos alapesetre vált',()=>{
 motion.render({scene:'<script>alert(1)</script>',label:'<img>',caption:'Felirat'});
 assert.equal(region.dataset.scene,'dribble');
 assert.equal(kicker.textContent,'<img>');assert.ok(!visual.innerHTML.includes('<script>'));
});
test('25 · A route nélkül az animáció eltűnik',()=>{
 motion.render(null);assert.equal(region.hidden,true);assert.equal(visual.innerHTML,'');
});
test('26 · Telefonon és a főoldalon az animáció CSS-sel is rejtett',()=>{
 assert.ok(css.includes('@media (max-width:768px)'));
 assert.ok(css.includes('body:not(.cs-inner-page) #site-header .cs-subpage-motion'));
});
test('27 · 76 pixeles eredeti fejlécen belül 56 pixeles a kártya',()=>{
 assert.ok(css.includes('height:56px'));assert.ok(css.includes('max-width:calc(50% - 76px)'));
});
test('28 · A kompakt címszalaghoz és olvasási jelzőhöz illeszkedik',()=>{
 assert.ok(ribbon.includes('headerMotion.sync()'));
 assert.ok(ribbon.includes('headerMotion.render(event.detail?.headerMotion)'));
 assert.ok(ribbon.includes('cs-subpage-reading-progress'));
});
test('29 · Az erőforrásokat a weboldal helyben tölti be',()=>{
 assert.ok(html.includes('css/subpage-header-motion-v1-38-2.css?v=1.38.2'));
 assert.ok(read('script.js').includes('js/subpages-v1.js?v=1.38.2'));
 assert.ok(read('js/subpages-v1.js').includes("'./subpage-header-motion.js?v=1.38.2'"));
});
test('30 · Csökkentett mozgás és print-stílus támogatott',()=>{
 assert.ok(css.includes('@media (prefers-reduced-motion:reduce)'));
 assert.ok(css.includes('@media print'));
 assert.ok(css.includes('animation:none!important'));
});
test('31 · A gomb elég nagy érintési célpont és egyértelmű címkével bír',()=>{
 assert.ok(css.includes('min-width:42px;min-height:42px'));
 motion.render({scene:'medal',label:'Sport',caption:'Díj'});
 assert.equal(button.attributes['aria-label'],'Animáció szüneteltetése');
 assert.ok(button.innerHTML.includes('cs-mini-pause-icon'));
});
test('32 · Nincs külső videó vagy távoli kép az animációban',()=>{
 assert.ok(!/(fetch\(|(?:src|href)=["']https?:\/\/|<video|<iframe)/.test(moduleSource));
});

fs.writeFileSync(path.join(root,'dokumentacio/sportanimacio-tesztnaplo-v1-38-2.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Aloldali sportanimáció: ${report.passed} sikeres, ${report.failed} sikertelen teszt.`);
for(const result of report.results.filter(r=>r.status==='FAIL'))console.error(result);
if(report.failed)process.exitCode=1;
