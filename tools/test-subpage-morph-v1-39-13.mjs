/* v1.39.13 – Az aloldali egysoros fejléc, sportmozgás és kiadási megőrzés kapuja.
   A statikus ellenőrzést valós asztali és mobil Chromium-próba egészíti ki. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const json=file=>JSON.parse(read(file));
const html=read('index.html');
const css=read('css/subpage-morph-v1-39-13.css');
const shell=read('js/release-v1-39-1.js');
const motion=read('js/subpage-header-motion.js');
const subpages=read('js/subpages-v1.js');
const app=read('js/app.js');
const results=[];
function check(name,fn){try{fn();results.push({name,ok:true});}catch(e){results.push({name,ok:false,error:e.message});}}

check('Az új CSS a teljes korábbi kezdőlapcsomag után betöltődik',()=>{
 assert.ok(html.indexOf('hero-morph-v1-39-12.css')<html.indexOf('subpage-morph-v1-39-13.css'));
 assert.match(html,/subpage-morph-v1-39-13\.css\?v=1\.39\.13/);
});
check('Az új mobil aloldal nem készít önálló második sort',()=>{
 assert.doesNotMatch(shell,/\n installMobileSubpage\(\);/);
 assert.match(css,/#cs39-mobile-route\{display:none!important\}/);
 assert.match(subpages,/createSubpageHeaderMotion\(brandRow\)/);
});
check('A sportanimáció asztalon és mobilon a márkasorban marad',()=>{
 assert.match(motion,/brandRow\.prepend\(region\)/);
 assert.match(css,/@media\(min-width:769px\)/);
 assert.match(css,/@media\(max-width:768px\)/);
 assert.match(css,/\.cs-subpage-motion:not\(\[hidden\]\)\{/);
 assert.match(css,/display:flex!important;opacity:1!important;visibility:visible!important/);
});
check('A középső eredeti címergomb és a többi navigációs gomb megmarad',()=>{
 assert.match(subpages,/cs-subpage-menu/);
 assert.match(read('css/subpage-header-fix.css'),/left:50%!important/);
 for(const id of ['search-open','theme-toggle','mobile-menu-toggle'])assert.ok(html.includes('id="'+id+'"'),id);
});
check('A kompakt fejlécben a jelenet helyben marad és nem áll le automatikusan',()=>{
 const sync=motion.split('const sync=()=>{')[1].split('};')[0];
 assert.doesNotMatch(sync,/cs-header-condensed/);
 assert.match(sync,/userPaused\|\|!autoplay\|\|motionPreference\.matches\|\|document\.hidden/);
});
check('A kompakt animáció a lapcímre és aktuális olvasási szakaszra vált',()=>{
 assert.match(motion,/const nextKicker=condensed\?readingTitle:initialKicker/);
 assert.match(motion,/const nextCaption=condensed\?readingSection:initialCaption/);
 assert.match(subpages,/headerMotion\.updateReading\(current,section\+' · '\+Math\.round\(read\)\+'%'\)/);
});
check('A különböző aloldalak eltérő, regisztrált sportjeleneteket kapnak',()=>{
 assert.match(app,/export function headerMotionForRoute/);
 assert.match(app,/sort\(\(a,b\)=>b\[0\]\.length-a\[0\]\.length\)/);
 for(const scene of ['dribble','bookjump','hurdle','relay','digital','calendar','document','eco'])assert.ok(motion.includes(scene),scene);
 const profiles=json('json/config.json').runtime?.subpageHeaderMotion?.profiles;
 assert.ok(profiles&&Object.keys(profiles).length>=8);
});
check('Az animáció kézi megállítása és folytatása azonos gombon működik',()=>{
 assert.match(motion,/pause\.addEventListener\('click',(?:\(\)=>\{userPaused=!userPaused;sync\(\);\}|togglePause)/);
 assert.match(motion,/aria-pressed/);
 assert.match(css,/\.cs-subpage-motion\.is-paused \.cs-mini-scene \*/);
 assert.match(css,/\.cs-subpage-motion:not\(\.is-paused\):focus-within \.cs-mini-scene \*/);
 assert.match(css,/animation-play-state:running!important/);
});
check('Csökkentett mozgásnál minden jelenet és átmenet leáll',()=>{
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/animation:none!important;transition:none!important/);
 assert.match(motion,/motionPreference\.matches/);
});
check('A régi extra állapotszöveg nem rajzolódik a fejlécbe',()=>{
 assert.match(css,/\.cs-subpage-ribbon-title,/);
 assert.match(css,/\.cs-subpage-ribbon-section\{display:none!important\}/);
 assert.match(css,/\.cs-subpage-reading-progress/);
});
check('Telefonon a 320 px-es elrendezés is saját szabályt kap',()=>{
 assert.match(css,/@media\(max-width:540px\)/);
 assert.match(css,/width:clamp\(44px,calc\(100vw - 254px\),116px\)!important/);
 assert.match(css,/body\.cs-inner-page\.cs-header-condensed:has\(#ext26-mobile-nav\)/);
});
check('Kezdőlapi nagy képsor és középső kompakt gomb megmarad',()=>{
 assert.match(shell,/shell\.append\(header\);shell\.after\(hero\)/);
 assert.match(shell,/compact\.append\(preview\)/);
 assert.match(read('css/hero-morph-v1-39-12.css'),/max-height:none!important/);
});
check('A 71 oldal, 748 fájl és a 23+69 munkalapállapot változatlan',()=>{
 assert.equal(Object.keys(json('json/oldalindex.json').pages).length,71);
 assert.equal(json('json/assets-inventory.json').items.length,748);
 assert.equal(json('dokumentacio/TARTALMI_MINOSEG_V1_39_9.json').priorities.length,23);
 assert.equal(json('json/mediatar.json').items.filter(i=>i.rights?.clearance==='pending').length,69);
});
check('A 1.39.13 sportfejléc az újabb alverzióban is betöltődik',()=>{
 assert.match(html,/script\.js\?v=1\.39\.1[34]/);
 assert.match(read('script.js'),/subpages-v1\.js\?v=1\.39\.1[34]/);
 assert.match(subpages,/subpage-header-motion\.js\?v=1\.39\.1[34]/);
 assert.ok(['csanadi-r-v1.39.13','csanadi-r-v1.39.14'].includes(json('json/config.json').performance.cacheVersion));
});

const failed=results.filter(x=>!x.ok);
console.log(JSON.stringify({release:'1.39.13',checks:results.length,passed:results.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
