/* E+F+G+H: verzióálló, állományalapú v1.40.4 regressziós kapu. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const json=name=>JSON.parse(read(name));
const checks=[];
function check(name,fn){try{fn();checks.push({name,ok:true});}catch(e){checks.push({name,ok:false,error:String(e.message||e).slice(0,250)});}}
const config=json('json/config.json'),structure=json('json/structure.json'),index=json('json/oldalindex.json');
const media=json('json/mediatar.json').items,inventory=json('json/assets-inventory.json').items;
const home=json('json/oldalak/kezdolap.json'),slides=home.blocks.find(b=>b.id==='block:home-hero').data.slides;
const rights=json('dokumentacio/KEP_ES_MEDIA_JOGTISZTAZAS_V1_40_4.json');
const html=read('index.html'),app=read('js/app.js'),hero=read('js/hero-2026.js'),tool=read('tools/tartalmi-hitelesites.js');
const css=read('css/accessibility-v1-40-4.css');

check('H: egységes verzió, bootstrap és statikus FTP',()=>{
 assert.match(config.performance.cacheVersion,/^csanadi-r-v1\.40\.[45]$/);
 assert.match(html,/script\.js\?v=1\.40\.[45]/);assert.match(html,/accessibility-v1-40-4\.css\?v=1\.40\.4/);
 assert.match(read('script.js'),/app\.js\?v=1\.40\.[45]/);assert.match(app,/blocks\.js\?v=1\.40\.[45]/);
 assert.match(read('js/blocks.js'),/hero-2026\.js\?v=1\.40\.[45]/);
 assert.match(html,/bootstrap@5\.3\.9/);assert.doesNotMatch(html,/href="(?:assets|vendor|\.\/).*bootstrap\.min\.css/);
});
check('H: 71 külön regisztrált útvonal és hiánytalan JSON',()=>{
 const nodes=new Set(['oldalak/kezdolap.json']);
 function visit(entries){for(const item of entries||[]){nodes.add(item.path);visit(item.children);}}
 visit(structure.nodes);assert.equal(nodes.size,71);assert.equal(Object.keys(index.pages).length,71);
 for(const name of nodes){const page=json('json/'+name);assert.equal(page.lifecycle.status,'published');assert.ok(page.title&&Array.isArray(page.blocks));}
});
check('H: teljes nyilvántartott assets-készlet egyedi és meglévő',()=>{
 const entries=new Set();for(const item of inventory){assert.ok(!entries.has(item.path),'Duplikált útvonal: '+item.path);entries.add(item.path);
  const file=path.join(root,item.path);assert.ok(fs.existsSync(file),item.path);assert.equal(fs.statSync(file).size,item.sizeBytes,item.path);}
});
check('F: 174 médiatétel és 30 különböző hero-forrás',()=>{
 assert.equal(media.length,174);assert.equal(slides.length,30);
 const ids=new Set(media.map(x=>x.id)),sha=new Set();
 for(const slide of slides){assert.ok(ids.has(slide.mediaId));const item=media.find(x=>x.id===slide.mediaId);
  assert.ok(fs.existsSync(path.join(root,item.original.path)));
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,item.original.path))).digest('hex');
  assert.ok(!sha.has(hash));sha.add(hash);}
 assert.equal(sha.size,30);
});
check('F: a médiák jogi munkalistája minden tételt megőriz',()=>{
 assert.equal(rights.statistics.allMedia,media.length);assert.equal(rights.items.length,media.length);
 assert.equal(rights.statistics.rightsReview,media.length);assert.equal(rights.statistics.heroReview,30);
 assert.equal(rights.heroItems.length,30);assert.equal(rights.institutionalApprovalVerified,false);
 assert.equal(rights.externalPublicationPerformed,false);assert.ok(rights.heroItems.every(x=>x.needsReview&&!x.approvalVerified));
});
check('F: a munkalap CSV-je biztonságosan és teljesen exportálható',()=>{
 const lines=read('dokumentacio/KEP_ES_MEDIA_JOGTISZTAZAS_V1_40_4.csv').trim().split('\r\n');
 assert.equal(lines.length,media.length+1);assert.ok(lines[0].includes('approvalVerified'));
 assert.match(tool,/heroRights/);assert.match(tool,/needsMediaApproval/);
 assert.doesNotMatch(tool,/media\.length!==69|sourceRows\.length!==97/);
 assert.match(tool,/institutionalApprovalVerified:false,ftpPublished:false/);
});
check('F: a kezdőképek nem jelennek meg hitelesített eseményfotóként',()=>{
 assert.match(hero,/cs1404-hero-disclaimer/);assert.match(hero,/illusztráció, nem igazolt intézményi eseményfotó/);
 assert.match(hero,/wing\.disclaimer\.hidden=!illustration/);
 assert.match(css,/\.cs1404-hero-disclaimer\[hidden\]/);
});
check('G: útvonalváltozás képernyőolvasós visszajelzéssel',()=>{
 assert.match(html,/id="cs1404-route-status"[^>]*role="status"[^>]*aria-live="polite"/);
 assert.doesNotMatch(html,/<main id="app"[^>]*aria-live="polite"/);
 assert.match(app,/if\(isNew&&routeStatus\)/);assert.match(app,/if\(previous!==route&&routeStatus\)/);
 assert.match(html,/id="app" tabindex="-1"/);
});
check('G: menü/kereső fókuszcsapdája és visszaállítása',()=>{
 assert.match(app,/siteMapInertNodes/);assert.match(app,/searchInertNodes/);
 assert.match(app,/siteMapReturnFocus\.focus/);assert.match(app,/previousSearchFocus\.focus/);
 assert.match(app,/event\.key!=='Tab'/);assert.match(app,/e\.key==='Escape'/);
 assert.match(html,/id="site-map-overlay"/);assert.match(html,/id="search-panel"/);
});
check('E+G: 350/420 pixeles vezérlők, fókusz, kontraszt, csökkentett mozgás',()=>{
 assert.match(css,/@media\(max-width:420px\)/);assert.match(css,/@media\(max-width:350px\)/);
 assert.match(css,/min-width:40px!important/);assert.match(css,/:focus-visible/);
 assert.match(css,/@media\(forced-colors:active\)/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(read('css/accessibility-v1-40-3.css'),/data-theme="light"/);
});
check('H: teljes statikus kiadásellenőrző a jelenlegi darabszámot használja',()=>{
 const target=read('tools/check-release-target-v1-40-4.mjs');
 assert.match(target,/csanadi-website-v1\.40\.4/);assert.match(target,/expectedPages/);assert.match(target,/expectedAssets/);
 assert.doesNotMatch(target,/result\.assets\.checked===748/);
});
check('H: a médiaengedélyezés nem ír a szerverre és nem publikál',()=>{
 for(const source of [tool,read('tools/build-photo-rights-worklist-v1-40-4.mjs')]){
  assert.doesNotMatch(source,/fetch\([^)]*\{\s*method:\s*['"](?:POST|PUT|DELETE|PATCH)/i);
 }
});
const failed=checks.filter(x=>!x.ok);
console.log(JSON.stringify({release:'1.40.4',total:checks.length,passed:checks.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
