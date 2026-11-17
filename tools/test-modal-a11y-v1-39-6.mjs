/* Valódi DOM-állapotszimuláció a főmenü nyitására és bezárására.
   Nem helyettesíti a valódi böngésző / képernyőolvasó próbáját. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
const opener=source.slice(source.indexOf('function openSiteMap(){'),source.indexOf("siteMap.addEventListener('keydown'"));
const closer=source.slice(source.indexOf('function closeSiteMap(restoreFocus=true){'),source.indexOf('function renderMenu(){'));
const results=[];
function check(name,run){try{run();results.push({name,ok:true});}catch(error){results.push({name,ok:false,error:error.message});}}

function harness({searchOpen=false}={}){
 const classes=new Set();
 const element=(tagName,id,initialInert=false)=>({tagName,id,inert:initialInert,isConnected:true,hidden:false,
  getClientRects(){return [1];},focus(){state.focus= id;},
  classList:{add(name){classes.add(name);},remove(name){classes.delete(name);}}});
 const launcher=element('BUTTON','trigger'),header=element('HEADER','site-header'),main=element('MAIN','app'),footer=element('FOOTER','footer');
 const bottom=element('NAV','ext26-mobile-nav'),floating=element('DIV','floating-widget');
 const preserved=element('ASIDE','preserved-inert',true),script=element('SCRIPT','source-script'),toast=element('DIV','toast');
 const siteMap=element('DIV','site-map-overlay');siteMap.hidden=true;
 const outerRing=element('NAV','csn26-outer-ring');outerRing.hidden=true;
 const background=[header,main,footer,bottom,floating,preserved,script,toast];
 const state={menuOpen:null,focus:null,closedSearch:false,dispatched:[]};
 const body={children:[...background,siteMap],classList:{add(name){classes.add(name);},remove(name){classes.delete(name);}}};
 const document={activeElement:searchOpen?element('INPUT','search-input'):launcher,body,dispatchEvent:event=>state.dispatched.push(event.type),getElementById:id=>['orbit-open','search-open'].includes(id)?launcher:null};
 const dialog={hidden:!searchOpen,contains:node=>node.id==='search-input'};
 const ctx=vm.createContext({document,siteMap,outerRing,dialog,catalog:{roots:[]},mobile:{contains:()=>false},
  phoneWheel:{reset(){},phone:()=>true,focus(){}},siteMapCats:{querySelector:()=>null},
  closeSearch(){state.closedSearch=true;dialog.hidden=true;},closeMobile(){},renderSiteMap(){},relocateSiteMapButton(){},
  setMenuButtonState(open){state.menuOpen=open;},Event:class{constructor(type){this.type=type;}}});
 vm.runInContext('let previousSearchFocus=document.getElementById("search-open");let siteMapReturnFocus=null;let siteMapInertNodes=[];'+opener+closer+';globalThis.operations={openSiteMap,closeSiteMap};',ctx);
 return {state,siteMap,outerRing,background,header,main,footer,bottom,floating,preserved,script,toast,classes,actions:ctx.operations};
}

check('A mobil alsó navigáció is inert lesz, amikor a főmenü megnyílik',()=>{
 const h=harness();h.actions.openSiteMap();assert.equal(h.bottom.inert,true);assert.equal(h.floating.inert,true);
 assert.equal(h.header.inert,true);assert.equal(h.main.inert,true);assert.equal(h.footer.inert,true);
});
check('A menü saját navigációja nem válik inaktívvá',()=>{
 const h=harness();h.actions.openSiteMap();assert.equal(h.siteMap.inert,false);
 assert.equal(h.siteMap.hidden,false);assert.equal(h.state.menuOpen,true);
 assert.ok(h.classes.has('site-map-is-open'));
});
check('A menü bezárásakor minden saját háttértiltás helyreáll',()=>{
 const h=harness();h.actions.openSiteMap();h.actions.closeSiteMap();
 for(const node of [h.header,h.main,h.footer,h.bottom,h.floating])assert.equal(node.inert,false,node.id);
 assert.equal(h.siteMap.hidden,true);assert.equal(h.state.menuOpen,false);
 assert.ok(!h.classes.has('site-map-is-open'));
});
check('A korábban inert elem az interakció után is inert marad',()=>{
 const h=harness();h.actions.openSiteMap();h.actions.closeSiteMap();assert.equal(h.preserved.inert,true);
});
check('A diagnosztikai státusz és a JavaScript nem kerül új inert kezelésbe',()=>{
 const h=harness();h.actions.openSiteMap();assert.equal(h.script.inert,false);assert.equal(h.toast.inert,false);
});
check('Menü bezárásakor a látható indítógomb visszakapja a fókuszt',()=>{
 const h=harness();h.actions.openSiteMap();h.actions.closeSiteMap();assert.equal(h.state.focus,'trigger');
});
check('Ha a kereső nyitva van, a menü előtt az bezáródik',()=>{
 const h=harness({searchOpen:true});h.actions.openSiteMap();assert.equal(h.state.closedSearch,true);
 assert.equal(h.state.dispatched.includes('csanadi:main-menu-opening'),true);
 h.actions.closeSiteMap();assert.equal(h.bottom.inert,false);
});
check('Keresőből főmenüre váltás után nem a rejtett keresőmezőre kerül a fókusz',()=>{
 const h=harness({searchOpen:true});h.actions.openSiteMap();h.actions.closeSiteMap();
 assert.equal(h.state.focus,'trigger');
});
check('Főmenüből keresőre váltva is a korábbi látható indítóra áll helyre a fókusz',()=>{
 const section=source.slice(source.indexOf('function openSearch(){'),source.indexOf('const THEME_MODES='));
 assert.match(section,/siteMap\.contains\(source\)/);
 assert.match(section,/siteMapReturnFocus\?\.isConnected/);
 assert.match(section,/previousSearchFocus=focusOrigin/);
});
check('Ismételt nyitás és zárás sem hagy inert elemeket hátra',()=>{
 const h=harness();for(let i=0;i<3;i++){h.actions.openSiteMap();h.actions.closeSiteMap();}
 for(const node of h.background)assert.equal(node.inert,node===h.preserved,node.id);
});

const failed=results.filter(x=>!x.ok);
console.log(JSON.stringify({release:'1.39.6',checks:results.length,passed:results.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
