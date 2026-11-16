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
 assert.ok(app.includes('searchRouteStates.set(searchOpenRoute||getRoute(),smartSearch.snapshot())'));
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
 assert.ok(gallery.includes('if(prefetched.get(upcoming.src)===preload)prefetched.delete'));
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
check('A2: képernyőméret-váltásnál a rejtett mobil menüből kikerül a fókusz',()=>{
 assert.ok(nav.includes("list.contains?.(document.activeElement)"));
 assert.ok(nav.includes("orbitFocus()?.focus?.({preventScroll:true})"));
});
check('B2: beágyazott megközelítés kétirányú témaszinkronja eredetellenőrzött',()=>{
 assert.ok(app.includes("source:'csanadi-theme-sync',preference:themeMode"));
 assert.ok(app.includes("event.data?.source!=='csanadi-theme-select'"));
 assert.ok(read('js/round26-arrival.js').includes("event.source!==parent"));
});
check('C2: elavult vagy hibás frame-válasz sorszám alapján elutasítható',()=>{
 assert.ok(app.includes('event.data.sequence<=lastMessageSequence'));
 assert.ok(app.includes('Number.isSafeInteger(event.data.sequence)'));
 assert.ok(read('megkozelites-es-tanulas.html').includes('payload.sequence=++sequence'));
});
check('D2: CSS scroll-margin figyelembevétele a szakaszugrásnál',()=>{
 assert.ok(sections.includes('window.getComputedStyle?.(target)?.scrollMarginTop'));
});
check('E2: dokumentum előnézet fókusza csak látható célra kerül vissza',()=>{
 assert.ok(docs.includes('openingTrigger?.isConnected&&openingTrigger.getClientRects?.().length'));
});
check('F2: navigációkor a keresést a korábbi útvonalhoz rögzíti',()=>{
 assert.ok(app.includes('searchOpenRoute=getRoute()'));
 assert.ok(app.includes('searchRouteStates.set(searchOpenRoute||getRoute(),smartSearch.snapshot())'));
});
check('G2: lezárt PDF-előnézet megszünteti az iframe-kérést',()=>{
 assert.ok(docs.includes("dialog.addEventListener('close',()=>iframe.removeAttribute('src')"));
});
check('H2: késői képbetöltési callback nem töröl másik kérést',()=>{
 assert.ok(gallery.includes('if(prefetched.get(upcoming.src)===preload)dropPrefetched'));
 assert.ok(gallery.includes('pending.onload=null'));
});
check('I2: élő JSON-csere nem mozgat, ha közben a felhasználó görgetett',()=>{
 assert.ok(app.includes('Math.abs(window.scrollY-beforeY)>40'));
 assert.ok(app.includes('currentRoute!==route||!after.isConnected'));
});
check('J2: manifest fájlnevek és teljes méret szigorú ellenőrzése',()=>{
 assert.ok(diag.includes("file.includes('\\\\')"));
 assert.ok(diag.includes('Number.isSafeInteger(total)'));
});
check('A3: régebbi Safari nézetváltási listener is kezelt',()=>{
 assert.ok(nav.includes("viewport.addEventListener('change',viewportChanged)"));
 assert.ok(nav.includes('viewport.addListener?.(viewportChanged)'));
});
check('B3: témamód visszaellenőrzése fókusz-visszatéréskor is megvan',()=>{
 assert.ok(app.includes("window.addEventListener('focus',recheckTheme)"));
 assert.ok(app.includes('storedTheme(themeMode)'));
});
check('C3: nem numerikus térképmagasságot és túl nagy szakaszlistát elutasít',()=>{
 assert.ok(app.includes("typeof height!=='number'||!Number.isFinite(height)"));
 assert.ok(app.includes('event.data.sections.length<=128'));
});
check('D3: negatív CSS-szakaszeltolásra sem görget rossz helyre',()=>{
 assert.ok(sections.includes('const margin=Math.max(0,Number.parseFloat('));
});
check('E3: szakaszmenü bezárásának fókusza csak megjelenő célra kerül',()=>{
 assert.ok(sections.includes('lastFocus.getClientRects?.().length'));
 assert.ok(sections.includes('lastFocus.focus({preventScroll:true})'));
});
check('F3: kereső bezárása nem fókuszál rejtett vagy levált elemre',()=>{
 assert.ok(app.includes('previousSearchFocus.getClientRects?.().length'));
});
check('G3: dokumentum-MIME ellenőrzés minden ismert kiterjesztésre teljes',()=>{
 assert.ok(docs.includes("expectedMime={pdf:'application/pdf'"));
 assert.ok(docs.includes('!Object.hasOwn(expectedMime,ext)||expectedMime[ext]!==d.mimeType'));
});
check('H3: 3G hálózaton is kíméli a galéria az előtöltést',()=>{
 assert.ok(gallery.includes('/^(slow-2g|2g|3g)$/'));
});
check('I3: azonos címszakasz visszaállítása stabil azonosítóval kezdődik',()=>{
 assert.ok(app.includes("id:heading.id||''"));
 assert.ok(app.includes('same.find(heading=>heading.id===reading.id)'));
});
check('J3: érvénytelen verzió és túlméretes manifest kiszűrése',()=>{
 assert.ok(diag.includes("!/^[a-z0-9-]+-v\\d+\\.\\d+\\.\\d+$/.test(manifest.release||'')"));
 assert.ok(diag.includes('total>100000000000'));
});
check('A4: megamenü megnyitása lezárja az esetleges mobil fejléclistát',()=>{
 assert.ok(app.includes('function openSiteMap(){\n if(!catalog)return;\n closeMobile();'));
 assert.ok(app.includes('if(window.innerWidth>768&&!mobile.hidden)closeMobile()'));
});
check('B4: törölt tématárolónál a rendszerbeállítás tér vissza',()=>{
 const code=app.slice(app.indexOf('function storedTheme('),app.indexOf('let themeMode=storedTheme();'));
 const context=vm.createContext({localStorage:{getItem:()=>null},THEME_MODES:['system','light','dark']});
 vm.runInContext(code,context);assert.equal(vm.runInContext("storedTheme('dark')",context),'system');
});
check('C4: érvénytelen magasság nem fogyasztja el a frame üzenetsorszámát',()=>{
 assert.ok(app.indexOf("if(typeof height!=='number'")<app.indexOf('event.data.sequence<=lastMessageSequence'));
});
check('D4: a szakaszugrás méretezése a mobil vizuális nézetmagasságát követi',()=>{
 assert.ok(sections.includes('const visualHeight=window.visualViewport?.height'));
 assert.ok(sections.includes('Number.isFinite(visualHeight)&&visualHeight>0'));
});
check('E4: a mobil szakaszpanel fókusza látható menügombra áll vissza',()=>{
 assert.ok(sections.includes('const fallback=mobileBar.querySelector'));
 assert.ok(sections.includes('!mobileBar.hidden&&fallback?.getClientRects?.().length'));
});
check('F4: lapváltás alatt a kereső nem viszi vissza a fókuszt',()=>{
 assert.ok(app.includes('function closeSearch(restoreFocus=true)'));
 assert.ok(app.includes('if(!dialog.hidden)closeSearch(false)'));
});
check('G4: előnézet nyitó fókuszcélja dialógusonként külön rögzített',()=>{
 assert.ok(docs.includes('const openingTrigger=lastTrigger'));
 assert.ok(docs.includes('openingTrigger.focus?.({preventScroll:true})'));
});
check('H4: hálózatszakadás megszakítja a képelőtöltéseket',()=>{
 assert.ok(gallery.includes("window.addEventListener('offline',releasePrefetched)"));
});
check('I4: élő JSON-csere megtartja a nyitott details állapotokat',()=>{
 assert.ok(app.includes('const expandedDetails=options.keepScroll&&!isNew?'));
 assert.ok(app.includes('if(match&&(saved.id&&match.id===saved.id'));
});
check('J4: a fájlleltár sémaazonosítója kötelező',()=>{
 assert.ok(diag.includes("manifest.schemaVersion!=='1.0.0'"));
});
const failed=results.filter(r=>!r.ok);
console.log(JSON.stringify({release:'1.34.0',passed:results.length-failed.length,total:results.length,failed},null,2));
if(failed.length)process.exitCode=1;
