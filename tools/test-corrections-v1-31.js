'use strict';
// A–J célzott javítások: regressziós és hibásbemeneti vizsgálatok.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const app=read('js/app.js'),nav=read('mobile/navigation.js'),sections=read('js/round29-home.js');
const search=read('js/search-j-2026.js'),docs=read('js/documents.js');
const gallery=read('js/media-gallery-h-2026.js'),diag=read('js/performance-diagnostics-2026.js');
const results=[];
function check(name,fn){try{fn();results.push({name,ok:true});}catch(error){results.push({name,ok:false,error:error.message});}}
check('A: azonos útvonal újrarajzolásakor a megnyitott menüág megmarad',()=>{
 assert.ok(nav.includes("const previousRoute=container.getAttribute('data-cs-navigation-route')"));
 assert.ok(nav.includes("expanded.get(group.getAttribute('data-nav-key'))===true"));
 assert.ok(nav.includes("expanded.get(nested.getAttribute('data-nav-key'))===true"));
});
check('B: tárolóhibánál a már választott kézi téma nem vész el',()=>{
 const code=app.slice(app.indexOf('function storedTheme('),app.indexOf('let themeMode=storedTheme();'));
 const context=vm.createContext({localStorage:{getItem(){throw new Error('blocked')}},THEME_MODES:['system','light','dark']});
 vm.runInContext(code,context);assert.equal(vm.runInContext("storedTheme('dark')",context),'dark');
});
check('C: a beágyazott üzenet forrása, útvonala és adatalakja ellenőrzött',()=>{
 assert.ok(app.includes('event.source!==iframe.contentWindow'));
 assert.ok(app.includes('Array.isArray(event.data)'));
 assert.ok(app.includes('event.data.offset<200000'));
});
check('D: az oldal végén túlra mutató szakaszugrás korlátozott',()=>{
 const code=sections.slice(sections.indexOf('function sectionHeaderOffset'),sections.indexOf('function getCards'));
 const calls=[];
 const context=vm.createContext({window:{innerHeight:800,scrollY:1000,scrollTo:o=>calls.push(o),visualViewport:{offsetTop:0}},document:{getElementById:()=>null,scrollingElement:{scrollHeight:1400}},motion:()=> 'instant'});
 vm.runInContext(code,context);
 vm.runInContext("scrollToSection({isConnected:true,getClientRects:()=>[1],getBoundingClientRect:()=>({top:800})})",context);
 assert.equal(calls[0].top,600);
});
check('E: rejtett panelre nem áll vissza billentyűzetfókusz',()=>{
 assert.ok(sections.includes('mobileLastFocus.getClientRects?.().length'));
 assert.ok(sections.includes("focus({preventScroll:true})"));
 assert.ok(sections.includes("aria-labelledby','cs32-mobile-sheet-title"));
});
check('F: keresés útvonalanként csak memóriában, visszaállítható',()=>{
 assert.ok(app.includes('const searchRouteStates=new Map()'));
 assert.ok(app.includes('searchRouteStates.set(getRoute(),smartSearch.snapshot())'));
 assert.ok(app.includes('smartSearch?.restore(saved)'));
 assert.ok(search.includes('snapshot(){return {query,type,section,max};}'));
});
check('F: hibás visszaállított szűrés nem jut a felületre',()=>{
 assert.ok(search.includes("Object.hasOwn(TYPES,state?.type)?state.type:'all'"));
 assert.ok(search.includes("Object.hasOwn(SECTIONS,state?.section)?state.section:'all'"));
 assert.ok(search.includes('Math.min(maxResults,Math.max(pageSize,state.max))'));
});
check('G: verziószámok összehasonlítása számszerű, nem karakterenkénti',()=>{
 const code=docs.slice(docs.indexOf('const compareSemver='),docs.indexOf('function validateDocument(',docs.indexOf('const compareSemver=')));
 const c=vm.createContext({});vm.runInContext(code,c);
 assert.equal(vm.runInContext("compareSemver('3.10.0','3.9.0')>0",c),true);
 assert.equal(vm.runInContext("compareSemver('2.0.0','2.0.0')",c),0);
});
check('G: dokumentumverzió és dátum szigorúan növekvő',()=>{
 assert.ok(docs.includes('compareSemver(earlier.version,later.version)>=0'));
 assert.ok(docs.includes('earlier.date>later.date'));
 assert.ok(docs.includes("iframe.removeAttribute('src')"));
});
check('H: lassú adatkapcsolat és adatforgalom-kímélés esetén nincs képelőtöltés',()=>{
 assert.ok(gallery.includes('conn.downlink<1.5'));
 assert.ok(gallery.includes('conn.rtt>650'));
 assert.ok(gallery.includes('!navigator.connection?.saveData'));
 assert.ok(gallery.includes('preload.onload=()=>prefetched.delete'));
});
check('I: azonos című szakaszok több bekezdésével különülnek el',()=>{
 assert.ok(sections.includes("slice(0,4).map(node=>node.textContent)"));
 assert.ok(app.includes("slice(0,3).map(node=>node.textContent)"));
 assert.ok(sections.includes('textHash:shortHash(distinguishingText)'));
});
check('J: részleges és rossz manifest adatalak ellenőrzése',()=>{
 assert.ok(diag.includes("!manifest.files||typeof manifest.files!=='object'"));
 assert.ok(diag.includes('entries.length<4||entries.length>10000'));
 assert.ok(diag.includes("!meta||typeof meta!=='object'"));
 assert.ok(diag.includes('if(run===bundleRun)bundleStats='));
});
const failed=results.filter(r=>!r.ok);
console.log(JSON.stringify({release:'1.31.0',passed:results.length-failed.length,total:results.length,failed},null,2));
if(failed.length)process.exitCode=1;
