/** 2.45: teljes kiadás, közös adatforrások és a külön platformkód regenerálható regressziós ellenőrzése. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve, relative, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const load=(file)=>readFileSync(join(root,file),'utf8');
const data=JSON.parse(load('shared/data/site.json'));
assert.equal(data.release,'2.50');
assert.equal(data.schemaVersion,'2.30');
assert.equal(data.routes.home,'#/kezdolap');
assert.equal(data.routes.gate,'#/');
assert.equal(data.gate.frames,30);
assert.equal(data.gate.desktopDurationMs,2250);
assert.equal(data.gate.mobileDurationMs,1750);
assert.ok(!('skipLabel' in data.gate) && !('skipSymbol' in data.gate));
const walk=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[relative(root,join(dir,e.name)).split(sep).join('/')]);
const allFiles=walk(root);
assert.ok(allFiles.includes('shared/js/gate.js'));
assert.equal(allFiles.filter(f=>f.startsWith('shared/assets/media/web/gate-frames/gate-')&&f.endsWith('.webp')).length,60);
const gate=load('shared/js/gate.js');
assert.ok(gate.includes('gate-door-button'));
assert.ok(gate.includes('startOpening'));
assert.ok(!gate.includes('skipButton')&&!gate.includes('gate-skip'));
for(const p of ['desktop/app.js','mobile/app.js']) {
  assert.ok(load(p).includes('mountGate'));
  assert.ok(load(p).includes('page === "gate"'));
  assert.ok(load(p).includes('config.routes.home'));
}
assert.ok(load('shared/js/entry.js').includes('return "gate"'));
assert.ok(load('shared/js/entry.js').includes('config.routes.gate'));
assert.ok(load('shared/css/base.css').includes('.gate-screen'));
assert.ok(!load('shared/css/base.css').includes('.gate-skip'));
assert.ok(load('desktop/styles.css').includes('animation:home-reveal'));
assert.ok(load('mobile/styles.css').includes('animation: home-reveal'));
console.log('✓ Kapu: eredeti 30+30 animációs kép, kattintásos/érintéses belépés, kihagyó gomb nélkül');
assert.equal(allFiles.filter(f=>f.endsWith('.html')&&!f.startsWith('share/')).length,1);
assert.equal(allFiles.filter(f=>f.startsWith('share/')&&f.endsWith('index.html')).length,63);
assert.ok(allFiles.includes('index.html'));
for(const required of ['desktop/app.js','desktop/page.js','desktop/centers.js','mobile/app.js','mobile/page.js','mobile/centers.js',
 'shared/js/feature-centers-data.js','shared/js/calendar-data.js','shared/js/document-reader.js','shared/js/search-index.js','shared/data/site.json',
 'desktop/styles.css','mobile/styles.css','shared/css/base.css'])assert.ok(allFiles.includes(required),`Hiányzó fájl: ${required}`);
for(const file of allFiles.filter(p=>/^(desktop|mobile|shared\/js)\/.*\.js$/.test(p))){
 execFileSync(process.execPath,['--check',join(root,file)],{stdio:'pipe'});
 const src=load(file);
 for(const found of src.matchAll(/\?v=(\d+\.\d+)/g))assert.equal(found[1],data.release,`Régi cache-verzió: ${file}`);
}
const html=load('index.html');
assert.match(html,/bootstrap@5\.3\.8\/dist\/css\/bootstrap\.min\.css/);
assert.match(html,/bootstrap@5\.3\.8\/dist\/js\/bootstrap\.bundle\.min\.js/);
assert.match(html,/shared\/js\/entry\.js\?v=2\.50/);
assert.match(html,/shared\/css\/base\.css\?v=2\.50/);
console.log('✓ Kiadás: HTML, verzióhoz kötött Bootstrap CDN, 2.50-es JS/CSS importok, összes JS-szintaxis');
// Ne maradjon a régi intézményi honlapra mutató URL sem az adatokban,
// sem a látogatók által betöltött oldalakban és modulokban.
const forbiddenSchoolHost=['csanadi-bp','edu','hu'].join('.').replace('.edu.hu','.edu.hu');
for(const file of allFiles.filter(p=>!p.startsWith('tools/') && /\.(html|js|json|css|xml|md|txt)$/.test(p))){
 assert.ok(!load(file).includes(forbiddenSchoolHost),`Régi honlapra mutató hivatkozás: ${file}`);
}
assert.ok(!('officialHref' in data.timetableCenter));
assert.ok(data.admissionCenter.sources.every(item=>!item.url.includes(forbiddenSchoolHost)));
console.log('✓ Külső honlaplinkek: régi Csanádi domain kizárva az összes nyilvános fájlból');


const {validateMenu,getMenuPage,menuPageHref}=await import('../shared/js/menu-data.js');
assert.equal(validateMenu(data).length,6);
const menuIds=data.menu.items.flatMap(x=>x.children.map(p=>p.id));
assert.equal(menuIds.length,49);assert.equal(new Set(menuIds).size,49);
assert.equal(Object.keys(data.pagePreview.pages).length,49);
for(const id of menuIds){const page=getMenuPage(data,id);assert.ok(page && page.title && page.intro && page.items.length,`Üres oldal: ${id}`);
 assert.equal(menuPageHref(id),`#/oldal/${id}`);
}
console.log('✓ Menürendszer: 6 főmenü, 49 egyedi oldal, kapcsolódó tartalmak');

const {checkedCalendar,calendarEntries,eventsOnDay,schoolMonths}=await import('../shared/js/calendar-data.js');
assert.equal(schoolMonths(checkedCalendar(data)).length,12);
const entries=calendarEntries(data);assert.equal(entries.length,88);
assert.equal(new Set(entries.map(x=>x.id)).size,88);
assert.equal(eventsOnDay(entries,'2026-11-17').length,3);
assert.ok(eventsOnDay(entries,'2027-05-27').some(x=>x.id==='sportnap'));
assert.equal(data.home.calendar.undated.length,0);
for(const platform of ['desktop','mobile'])assert.match(load(`${platform}/calendar.js`),/let mode="month"/);
console.log('✓ Tanévnaptár: 12 hónap, 88 dátumos esemény, egységes havi kezdőnézet');

const {checkedHomeCarousel}=await import('../shared/js/carousel-data.js');
const carousel=checkedHomeCarousel(data);
assert.deepEqual(carousel.activePanels.map(x=>x.id),['successes','calendar','news']);
assert.equal(data.home.carousel.autoplayMs,30000);
assert.ok(!data.home.carousel.panels.some(x=>x.type==='documents'));
assert.ok(load('mobile/styles.css').includes('carousel'));
console.log('✓ Kezdőlapi Carousel: 3 panel, 30 másodperc, dokumentumtár nélkül');

assert.equal(data.publicNews.length,80);
assert.equal(new Set(data.publicNews.map(x=>x.id)).size,80);
assert.equal(data.publicNews.filter(x=>x.tags.includes('announcement')).length,40);
assert.equal(data.publicNews.filter(x=>!x.tags.includes('announcement')).length,40);
assert.equal(data.publicNews.filter(x=>x.tags.includes('demo')).length,74);
assert.ok(data.publicNews.filter(x=>x.tags.includes('demo')).every(x=>x.title.startsWith('MINTA')));
console.log('✓ Hírek: 40 hír + 40 közlemény; a bemutatóadatok egyértelmű jelölése');

const {checkedMediaCenter}=await import('../shared/js/media-data.js');
const media=checkedMediaCenter(data);assert.equal(media.items.length,22);
for(const item of media.items)assert.ok(existsSync(join(root,item.src.replace(/^\.\//,''))),`Hiányzó kép: ${item.src}`);
const {checkedDocumentCenter}=await import('../shared/js/document-data.js');
const documents=checkedDocumentCenter(data);assert.equal(documents.items.length,16);
assert.equal(documents.items.filter(x=>x.status==='available').length,6);
assert.equal(documents.items.filter(x=>x.status==='pending').length,10);
const {checkedTimetable}=await import('../shared/js/timetable-data.js');
const bell=checkedTimetable(data);assert.equal(bell.schedule.length,8);
assert.ok(bell.config.classes.every(c=>c.verified===false),'A mintaórarend nem jelenhet meg hitelesként.');
const {checkedAdmissions}=await import('../shared/js/admission-data.js');
assert.equal(checkedAdmissions(data).milestones.length,10);
console.log('✓ Meglévő modulok: 22 kép, 16 dokumentumtétel, 8 csengő, 10 felvételi dátum');

const {checkedFeatureCenters,centerRouteKind,centerEvents,centerSportResults}=await import('../shared/js/feature-centers-data.js');
const centers=checkedFeatureCenters(data);
assert.equal(centers.education.programs.length,2);
assert.equal(centerSportResults(data).length,6);
assert.equal(centerEvents(data,'exams',{category:'exam'}).length,24);
assert.equal(centerEvents(data,'community',{category:'community'}).length,11);
const routeMap={
 'education-programs':'education','sports-disciplines':'sports','sports-facilities':'sports',
 'education-exams':'exams','education-years':'exams',
 'news-events':'community','news-community':'community','education-community':'community'
};
for(const [page,kind] of Object.entries(routeMap))assert.equal(centerRouteKind(page),kind);
for(const mode of ['desktop','mobile']){
 const code=load(`${mode}/app.js`);assert.match(code,/create[A-Za-z]+FeatureCenter\(config,featureKind,featurePageId\)/);
 assert.match(code,/else if \(featureCenter\)/);
}
const wrong=structuredClone(data);wrong.featureCenters.sports.topics[0].mediaId='nincs';
assert.throws(()=>checkedFeatureCenters(wrong),/sportág-bemutató/);
assert.ok(load('desktop/styles.css').includes('.desktop-feature-sport-grid'));
assert.ok(load('mobile/styles.css').includes('.mobile-feature-event-list'));
console.log('✓ 2.45: négy adatvezérelt központ, 8 bekötött oldal, külön asztali/mobilos felület, hibás médiák kizárása');

const {searchSite}=await import('../shared/js/search-index.js');
for(const keyword of ['felvételi','sport','érettségi','Csanádi-nap','Mozgáskoordináció'])assert.ok(searchSite(data,keyword).length>0,`Kereső: ${keyword}`);
assert.equal(data.home.sportSuccesses.items.length,30);
assert.equal(data.home.footer.notices.length,0);
assert.ok(!load('shared/js/footer.js').includes('footer-documents-link'));
assert.ok(!load('shared/js/footer.js').includes('footer-mobile-tab'));
assert.ok(load('shared/js/footer.js').includes('footer-status'));
assert.ok(load('desktop/styles.css').includes('.desktop-document-grid > .document-card:only-child'));
assert.ok(load('mobile/styles.css').includes('.mobile-document-card:only-child'));
console.log('✓ Kereső, minta-sportsikerek, egységes lábléc és középre igazított dokumentumtalálat');
console.log('ÖSSZES 2.50 NODE REGRESSZIÓS TESZT SIKERES');
