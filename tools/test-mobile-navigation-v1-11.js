const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'mobile/quick-nav.js'),'utf8').replace(/^import .*;\r?\n/m,'').replace('export function initMobileQuickNav','function initMobileQuickNav');
const css=fs.readFileSync(path.join(root,'css/mobile-header-unified-v1-11.css'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.dataset={};this.listeners={};this.hidden=false;}
 setAttribute(k,v){this.attributes[k]=String(v);}
 getAttribute(k){return this.attributes[k];}
 addEventListener(k,fn){this.listeners[k]=fn;}
 append(...nodes){this.children.push(...nodes);}
 querySelector(selector){const match=/\[data-nav-id="([a-z]+)"\]/.exec(selector);return this.children.find(item=>item.dataset.navId===match?.[1]);}
 click(){this.listeners.click?.();}
}
const overlay=new Element('overlay'),search=new Element('search');overlay.hidden=true;search.hidden=true;
const nodes=new Map([['site-map-overlay',overlay],['search-panel',search],['search-open',new Element('button')]]);
let toggleCount=0,searchCount=0,observers=[];
nodes.get('search-open').addEventListener('click',()=>searchCount++);
const document={body:new Element('body'),createElementNS:(ns,tag)=>new Element(tag),getElementById:id=>nodes.get(id)||null,dispatchEvent:event=>{if(event.type==='csanadi:menu-toggle')toggleCount++;}};
const window={addEventListener(){}};
const ctx=vm.createContext({document,window,location:{hash:'#/oktatas/felveteli'},Event:class{constructor(type){this.type=type;}},MutationObserver:class{constructor(fn){this.fn=fn;observers.push(this);}observe(target){this.target=target;}},el:(tag,cls)=>new Element(tag),append:(parent,...children)=>parent.append(...children)});
vm.runInContext(source+'\ninitMobileQuickNav()',ctx);
const nav=document.body.children[0],menu=nav.children[1],searchButton=nav.children[2];
let count=0;function check(label,fn){fn();count++;console.log('OK',label);}
check('Három meglévő alsó menüikonból pontosan a középső a címer',()=>{assert.equal(nav.children.length,3);assert.equal(menu.children[0].tag,'img');assert.match(menu.children[0].src,/csanadi-cimer-512\.webp/);});
check('A felső logó sem a kezdőlapon, sem az aloldalakon nem duplikálódik',()=>{assert.match(css,/body:has\(#ext26-mobile-nav\) #site-header \.brand/);assert.match(css,/body:has\(#ext26-mobile-nav\) #site-header \.cs-subpage-menu/);});
check('A mobilos felső és alsó keresés nem jelenik meg kétszer',()=>assert.match(css,/body:has\(#ext26-mobile-nav\) #site-header #search-open/));
check('Ha az alsó sáv hiányzik, a felső gomb megmaradhat tartaléknak',()=>assert.ok(!css.includes('body #site-header .cs-subpage-menu{display:none!important}')));
check('A menü és keresés helyes aria-controls hivatkozást kap',()=>{assert.equal(menu.getAttribute('aria-controls'),'site-map-overlay');assert.equal(searchButton.getAttribute('aria-controls'),'search-panel');});
check('A címerrel a főmenü önállóan nyitható',()=>{menu.click();assert.equal(toggleCount,1);});
check('Menünyitás és bezárás szövege az állapottal együtt változik',()=>{overlay.hidden=false;observers.find(o=>o.target===overlay).fn();assert.equal(menu.getAttribute('aria-expanded'),'true');assert.equal(menu.getAttribute('aria-label'),'Főmenü bezárása');overlay.hidden=true;observers.find(o=>o.target===overlay).fn();assert.equal(menu.getAttribute('aria-label'),'Főmenü megnyitása');});
check('A keresés gomb megőrzi a korábbi kereső megnyitását',()=>{searchButton.click();assert.equal(searchCount,1);search.hidden=false;observers.find(o=>o.target===search).fn();assert.equal(searchButton.getAttribute('aria-label'),'Keresés bezárása');});
check('Az új CSS megfelelő mobilos cache-verzióval van bekötve',()=>assert.match(index,/mobile-header-unified-v1-11\.css\?v=1\.\d+\.0/));
console.log(JSON.stringify({stage:'v1.24.0',passed:count,total:count}));
