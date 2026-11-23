/** 2.49 kereső-relevancia, hiteles kategóriaszámlálás és kezdőlapi JSON ellenőrzése. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const c=JSON.parse(readFileSync(join(root,'shared/data/site.json'),'utf8'));
const {searchSiteResults,searchSite,searchSportSuccessIds,normalizeSearchText}=await import('../shared/js/search-index.js');
let tests=0;
function ok(value,description){assert.ok(value,description);tests++;}
ok(c.release==='2.50','2.49 release');
ok(c.home.homeHighlights.items.length===3,'3 main links');
for(const item of c.home.homeHighlights.items){ok(Boolean(c.pagePreview.pages[item.pageId]),'home highlight page exists');}
ok(normalizeSearchText('Árvíztűrő tükörfúrógép')==='arvizturo tukorfurogep','diacritic insensitive');
for(const query of ['sport','felvételi','iskola','hír','naptár','MINTA','érettségi','labdarúgás','tanév']){
 const all=searchSiteResults(c,query);
 ok(all.total===all.items.length,query+' total');
 ok(all.allTotal===all.items.length,query+' global total');
 ok(all.facets[0].count===all.total,query+' all facet');
 ok(new Set(all.items.map(x=>x.href+'|'+normalizeSearchText(x.label))).size===all.items.length,query+' no duplicates');
 ok(all.facets.slice(1).reduce((s,x)=>s+x.count,0)===all.total,query+' facet sums');
 ok(all.items.every(x=>x.href.startsWith('#/')||x.href.startsWith('https://')||x.href.startsWith('mailto:')),query+' meaningful targets');
 for(const facet of all.facets.slice(1)){
  const filtered=searchSiteResults(c,query,{category:facet.id});
  ok(filtered.total===facet.count,query+' accurate filtered count');
  ok(filtered.items.every(x=>x.group===facet.id),query+' correct facet categorization');
 }
}
let many=searchSiteResults(c,'MINTA');
ok(many.total>50,'index returns >50 when enough matches');
ok(searchSite(c,'MINTA').length===50,'legacy limited search returns 50');
ok(searchSiteResults(c,'no-such-content-zxcvb-768621').total===0,'empty search');
ok(searchSiteResults(c,'').total===0,'blank search');
ok(searchSportSuccessIds(c,'sport').length<=30,'sport archive remains limited to sports success items');
for(const plat of ['desktop','mobile']){
 let home=readFileSync(join(root,plat,'home-highlights.js'),'utf8');
 ok(home.includes(`${plat}-home-highlights`),'separate home '+plat);
 let search=readFileSync(join(root,plat,'search.js'),'utf8');
 ok(search.includes('aria-pressed') && search.includes('loadMore') && search.includes('searchSiteResults'),'separate search '+plat);
}
console.log(`2.49 SEARCH/HOME NODE: ${tests}/${tests} successful`);
