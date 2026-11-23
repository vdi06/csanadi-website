/** 2.51: mintatartalom-biztonság, funkciók megőrzése és statikus kiadási konzisztencia. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=p=>readFileSync(join(root,p),'utf8');
const cfg=JSON.parse(read('shared/data/site.json'));
let count=0;
const check=(condition,message)=>{assert.ok(condition,message);count++};
check(cfg.release==='2.53','release');
check(cfg.gate.frames===30,'gate frame count');
check(!('skipLabel' in cfg.gate),'skip gate absent');
check(cfg.menu.items.length===6,'six menus');
check(cfg.menu.items.flatMap(m=>m.children).length===49,'49 pages');
check(cfg.home.sportSuccesses.items.length===30,'30 results');
check(cfg.home.sportSuccesses.title.includes('bemutatóadatok'),'home sample heading');
check(cfg.home.sportSuccesses.intro.toLowerCase().includes('nem hitelesített'),'sample intro');
check(cfg.home.sportSuccesses.archiveIntro.toLowerCase().includes('nem hitelesített'),'sample archive intro');
check(cfg.home.sportSuccesses.verificationLabel==='MINTA','sample label');
check(cfg.home.sportSuccesses.verificationNotice.includes('nem hitelesített'),'detail sample notice');
for(const item of cfg.home.sportSuccesses.items)check(item.verified===false,`Not marked as sample: ${item.id}`);
const {checkedSportSuccesses}=await import('../shared/js/successes-data.js');
check(checkedSportSuccesses(cfg).items.length===30,'sample validator accepts valid data');
const broken=structuredClone(cfg);delete broken.home.sportSuccesses.items[0].verified;
check((()=>{try{checkedSportSuccesses(broken);return false;}catch{return true}})(),'sample validator rejects missing flag');
const {searchSite}=await import('../shared/js/search-index.js');
const found=searchSite(cfg,'Nagy Lilla');
check(found.some(item=>item.label.startsWith('MINTA') && item.summary.includes('mintabejegyzés')),'search sample labeling');
for(const platform of ['desktop','mobile']){
 const js=read(`${platform}/successes.js`),css=read(`${platform}/styles.css`);
 check(js.includes(`${platform}-successes-card-sample`),`${platform} sample cards`);
 check(js.includes('successes-verification-warning'),`${platform} detail notice`);
 check(css.includes(`${platform}-successes-card-sample`),`${platform} badge styling`);
 check(css.includes(`.${platform}-page-title[tabindex="-1"]:focus-visible`),`${platform} page title focus`);
}
check(read('shared/css/base.css').includes('footer-contact-main > a[href^="mailto:"]'),'footer hit target');
check(read('shared/css/base.css').includes('.successes-verification-warning'),'verification warning style');
check(!read('index.html').includes('bootstrap.min.css?v='),'no local Bootstrap');
check(read('index.html').includes('bootstrap@5.3.8'),'pinned Bootstrap');
check(read('index.html').includes('entry.js?v=2.53'),'new JS entry cache');
check(read('index.html').includes('base.css?v=2.53'),'new CSS cache');
const names=readdirSync(join(root,'shared/assets/media/web/gate-frames'));
check(names.filter(p=>p.endsWith('.webp')).length===60,'60 gate images');
for(const name of names.filter(p=>p.endsWith('.webp'))) check(existsSync(join(root,'shared/assets/media/web/gate-frames',name)),`gate ${name}`);
for(const n of ['desktop','mobile'])for(const file of readdirSync(join(root,n)).filter(p=>p.endsWith('.js'))){
 check(!read(`${n}/${file}`).includes('?v=2.49'),`outdated JS import ${n}/${file}`);
}
for(const file of readdirSync(join(root,'shared/js')).filter(p=>p.endsWith('.js'))){
 check(!read(`shared/js/${file}`).includes('?v=2.49'),`outdated shared JS import ${file}`);
}
for(const file of ['index.html','shared/data/site.json','desktop/app.js','mobile/app.js']){
 check(!read(file).includes('csanadi-bp.edu.hu'),`old domain ${file}`);
}
console.log(`2.53 NODE MINŐSÉGELLENŐRZÉS: ${count}/${count} sikeres`);
