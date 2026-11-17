/* v1.39.5: böngészőfüggetlen DOM-állapotteszt és statikus akadálymentességi kapu.
   Nem helyettesíti a képernyőolvasós és a valódi böngészős vizsgálatot. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const json=name=>JSON.parse(read(name));
const results=[];
function test(name,run){try{run();results.push({name,ok:true});}catch(error){results.push({name,ok:false,error:error.message});}}

test('71 oldal, megőrzött médiák, 60 új grafika és konzisztens aktuális cache',()=>{
 assert.equal(Object.keys(json('json/oldalindex.json').pages).length,71);
 assert.equal(json('json/assets-inventory.json').items.length,748);
 assert.match(json('json/config.json').performance.cacheVersion,/^csanadi-r-v1\.39\.(?:9|10)$/);
 for(const asset of json('json/assets-inventory.json').items)assert.ok(fs.existsSync(path.join(root,asset.path)),asset.path);
});
test('Mind a 16 karbantartó nézet nyelve, viewportja és közös arculata',()=>{
 const pages=fs.readdirSync(path.join(root,'tools')).filter(name=>name.endsWith('.html'));
 assert.equal(pages.length,16);
 for(const page of pages){
  const html=read('tools/'+page);
  assert.match(html,/<html[^>]+lang="hu"/i,page);
  assert.match(html,/<meta[^>]+name="viewport"/i,page);
  assert.match(html,/tool-ui-2026\.js\?v=1\.39\.5/,page);
 }
});
test('Valamennyi segédoldal kap fókuszálható, működő tartalmi ugrópontot',()=>{
 const ui=read('tools/tool-ui-2026.js');
 assert.match(ui,/querySelector\('main'\)\|\|document\.querySelector\('\.stage'\)\|\|document\.querySelector\('\.toolbar'\)/);
 assert.match(ui,/setAttribute\('tabindex','-1'\)/);
 assert.match(ui,/skip\.href='#'\+main\.id/);
 for(const page of ['mobile-preview-v1-39-0.html','route-smoke-v1-39-0.html','route-smoke-v1-39-2.html'])
  assert.match(read('tools/'+page),/class="(?:stage|toolbar)"/,page);
});
test('A menüindítók és a valódi menüdialógus szemantikailag összekötöttek',()=>{
 const html=read('index.html');
 assert.match(html,/id="mobile-menu-toggle"[^>]*aria-haspopup="dialog"[^>]*aria-controls="site-map-overlay"[^>]*aria-expanded="false"/);
 assert.match(html,/id="orbit-open"[^>]*aria-haspopup="dialog"[^>]*aria-controls="site-map-overlay"[^>]*aria-expanded="false"/);
 assert.match(html,/class="site-map-dialog" role="dialog" aria-modal="true" aria-labelledby="site-map-title"/);
 const app=read('js/app.js');
 assert.match(app,/function setMenuButtonState\(open\)/);
 assert.match(app,/setMenuButtonState\(true\)/);
 assert.match(app,/setMenuButtonState\(false\)/);
 assert.doesNotMatch(app,/setAttribute\('aria-expanded',String\(phoneWheel\.phone\(\)\)\)/);
 assert.match(app,/quick-nav\.js\?v=1\.39\.5/);
 assert.match(app,/round10-enhancements\.js\?v=1\.39\.5/);
});
test('A kereső dialógusa fókuszt őriz és a háttér interakcióit kizárja',()=>{
 const html=read('index.html'),app=read('js/app.js');
 assert.match(html,/id="search-panel"[\s\S]*?role="dialog" aria-modal="true" aria-labelledby="search-heading"/);
 assert.match(app,/searchPreviousOverflow=document\.body\.style\.overflow/);
 assert.match(app,/node\.inert=true;searchInertNodes\.push\(node\)/);
 assert.match(app,/for\(const node of searchInertNodes\)if\(node\.isConnected\)node\.inert=false/);
 assert.match(app,/previousSearchFocus=focusOrigin\?\.getClientRects/);
 assert.match(app,/siteMap\.contains\(source\)/);
 assert.match(app,/if\(!dialog\.hidden&&e\.key==='Tab'\)/);
 assert.match(app,/if\(e\.key==='Escape'&&!dialog\.hidden\)closeSearch\(\)/);
});
test('Mobileszközök: keskeny, alacsony, vízszintes és csökkentett mozgás mód',()=>{
 const mobile=read('css/mobile-navigation-v1-39-2.css');
 const ring=read('mobile/radial-wheel-v1-38.css');
 const tool=read('css/tools-unified-v1.css');
 for(const breakpoint of ['max-width:768px','max-height:650px','max-width:355px'])assert.ok(mobile.includes(breakpoint),breakpoint);
 assert.match(mobile,/\.cs92-wheel-shortcuts-links a\{[^}]*min-height:44px/s);
 assert.match(ring,/\.cs-phone-wheel-item:focus-visible/);
 assert.match(tool,/overflow-x:auto/);
 assert.match(tool,/@media\(prefers-reduced-motion:reduce\)/);
});
test('Kontrasztarány legalább 4,5:1 a közös segédnavigáció mindkét állapotában',()=>{
 const css=read('css/tools-unified-v1.css');
 assert.match(css,/background:#102b45/);assert.match(css,/color:#e5edf4/);
 assert.match(css,/background:#f0d7a6;color:#102b45/);
 const channel=h=>parseInt(h,16)/255;
 const linear=v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;
 const luminance=hex=>{
  const cs=[hex.slice(1,3),hex.slice(3,5),hex.slice(5,7)].map(h=>linear(channel(h)));
  return 0.2126*cs[0]+0.7152*cs[1]+0.0722*cs[2];
 };
 const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
 assert.ok(contrast('#e5edf4','#102b45')>=4.5);
 assert.ok(contrast('#102b45','#f0d7a6')>=4.5);
});
test('A mobil alsó navigáció működő DOM-állapotgépének próbája',()=>{
 class Element{
  constructor(tag,cls='',content){this.tagName=tag;this.className=cls;this.textContent=content||'';this.children=[];this.attributes=new Map();this.dataset={};this.listeners=new Map();this.hidden=false;}
  append(...children){this.children.push(...children);}
  setAttribute(key,value){this.attributes.set(key,String(value));}
  getAttribute(key){return this.attributes.get(key)||null;}
  removeAttribute(key){this.attributes.delete(key);}
  addEventListener(type,callback){this.listeners.set(type,callback);}
  querySelector(selector){const match=/^\[data-nav-id="([^"]+)"\]$/.exec(selector);return match?this.children.find(c=>c.dataset.navId===match[1]):null;}
  click(){this.listeners.get('click')?.();}
 }
 const nodes=new Map(),listeners=new Map(),windowListeners=new Map();
 const create=(tag,cls,text)=>new Element(tag,cls,text);
 const body=new Element('body');const location={hash:'#/'};
 const overlay=new Element('div');overlay.hidden=true;nodes.set('site-map-overlay',overlay);
 const search=new Element('div');search.hidden=true;nodes.set('search-panel',search);
 const searchOpener=new Element('button');let searchClicks=0;searchOpener.click=()=>searchClicks++;nodes.set('search-open',searchOpener);
 const document={body,getElementById:id=>nodes.get(id)||null,createElementNS:()=>new Element('svg'),dispatchEvent:event=>listeners.get(event.type)?.(event),addEventListener:(type,cb)=>listeners.set(type,cb)};
 const window={addEventListener:(type,cb)=>windowListeners.set(type,cb)};
 class MutationObserver{observe(){}}
 const source=read('mobile/quick-nav.js').replace(/^import[^\n]*\n/m,'').replace('export function initMobileQuickNav()','function initMobileQuickNav()');
 const ctx=vm.createContext({document,window,location,MutationObserver,Event:class Event{constructor(type){this.type=type;}},el:create,append:(p,c)=>p.append(c)});
 vm.runInContext(source+'\ninitMobileQuickNav();',ctx);
 const nav=body.children[0];nodes.set('ext26-mobile-nav',nav);
 assert.equal(nav.tagName,'nav');assert.equal(nav.children.length,3);
 assert.equal(nav.querySelector('[data-nav-id="home"]').getAttribute('aria-current'),'page');
 assert.equal(nav.querySelector('[data-nav-id="menu"]').getAttribute('aria-haspopup'),'dialog');
 assert.equal(nav.querySelector('[data-nav-id="search"]').getAttribute('aria-haspopup'),'dialog');
 location.hash='#/sport';windowListeners.get('hashchange')();
 assert.equal(nav.querySelector('[data-nav-id="home"]').getAttribute('aria-current'),null);
 overlay.hidden=false;search.hidden=false;windowListeners.get('hashchange')();
 assert.equal(nav.querySelector('[data-nav-id="menu"]').getAttribute('aria-expanded'),'true');
 assert.equal(nav.querySelector('[data-nav-id="search"]').getAttribute('aria-expanded'),'true');
 assert.equal(nav.querySelector('[data-nav-id="menu"]').getAttribute('aria-label'),'Főmenü bezárása');
 nav.querySelector('[data-nav-id="search"]').click();assert.equal(searchClicks,1);
 let toggles=0;listeners.set('csanadi:menu-toggle',()=>toggles++);
 nav.querySelector('[data-nav-id="menu"]').click();assert.equal(toggles,1);
 nav.querySelector('[data-nav-id="home"]').click();assert.equal(location.hash,'#/');
});

const failed=results.filter(x=>!x.ok);
console.log(JSON.stringify({version:'1.39.7',checks:results.length,passed:results.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
