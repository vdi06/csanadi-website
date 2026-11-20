/** M12.3: az összes regisztrált aloldal és a közös komponensek mobilos alapjai. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const catalog=JSON.parse(read('json/structure.json'));
const visited=new Set(),levels=new Map(),kinds=new Map();
function inspect(items,depth=1){
 if(!items.length)return;
 assert.ok(depth<=3,'A mobilos menüben maximum három szint lehet');
 for(const item of items){
  assert.match(item.path,/^pages\/[a-z0-9/\-]+\.json$/i);
  assert.ok(!visited.has(item.path),'Nincs duplikált oldalregisztráció: '+item.path);
  visited.add(item.path);
  const page=JSON.parse(read('json/'+item.path));
  assert.ok(typeof page.title==='string'&&page.title.trim(),item.path+' címe');
  assert.ok(Array.isArray(page.blocks),item.path+' összetett tartalma');
  levels.set(depth,(levels.get(depth)||0)+1);
  for(const block of page.blocks)kinds.set(block.type,(kinds.get(block.type)||0)+1);
  inspect(item.children||[],depth+1);
 }
}
inspect(catalog.nodes);
assert.ok(visited.size>=78,'A teljes aktuális oldalstruktúra legyen lefedve');
for(const page of [
 'pages/our-school/teaching-staff.json',
 'pages/news-and-events/event-calendar.json',
 'pages/information/daily-information/bell-schedule.json',
 'pages/information/document-library.json',
 'pages/sports/sports-galleries.json'
])assert.ok(visited.has(page),page+' a menüben');

const css=read('mobile/reboot-design-v1-43-21.css');
for(const selector of [
 '.hub26-calendar','.hub26-staff','.hub26-bell','.ext26-doc-browser',
 '.media26-grid','.cs43-viewer','.cs43-pdf-toolbar','.cs43-image-viewer',
 '.cs-data-scroll','.table-responsive','.csn20-language-bar','.search-result',
 '.cs-mb-menu-screen','.cs-mb-film-stage','.home-canvas','.page-banner'
])assert.ok(css.includes(selector),'Mobilos komponens hiányzik: '+selector);
assert.match(css,/\.hub26-calendar \.calendar-grid\{min-width:350px!important/);
assert.match(css,/\.hub26-calendar \.calendar-day\{min-height:44px!important/);
assert.match(css,/\.cs43-viewer \.modal-dialog\{width:100vw!important/);
assert.match(css,/\.cs43-viewer \.modal-body\{flex:1 1 auto!important/);
assert.match(css,/\.cs43-pdf-toolbar\{position:sticky!important/);
console.log(`M12.3 tartalmi lefedettség OK: ${visited.size} regisztrált oldal, `+
 `${[...levels].map(([depth,count])=>depth+'. szint: '+count).join(', ')}, `+
 `${[...kinds].reduce((n,[,count])=>n+count,0)} tartalmi blokk`);
