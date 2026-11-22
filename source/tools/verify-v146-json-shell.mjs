/** 1.46: a minimális HTML belépők JSON-ból előállított tartalma. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {jsonNode,installJsonDocument,safeJsonURL} from '../js/json-dom-v146.js';

const root=path.resolve(import.meta.dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const site=JSON.parse(read('json/site-shell.json'));
const offline=JSON.parse(read('json/offline-shell.json'));
const activeHtml=read('index.html'),offlineHtml=read('offline.html');
const allHtml=[];
function scanHtml(folder){
 for(const item of fs.readdirSync(path.join(root,folder),{withFileTypes:true})){
  const relative=path.posix.join(folder,item.name);
  if(item.isDirectory())scanHtml(relative);
  else if(item.name.endsWith('.html'))allHtml.push(relative);
 }
}
scanHtml('.');
assert.deepEqual(allHtml.sort(),['index.html','offline.html'],
 'A teljes weboldalban csak a két minimális HTML belépő maradhat');
for(const [name,html] of [['index',activeHtml],['offline',offlineHtml]]){
 assert.doesNotMatch(html,/<(?:header|footer|nav|main|section|aside|h[1-6]|p|a|button|img)\b/i,
  name+' HTML nem tartalmazhat megjelenítendő tartalmat');
 assert.doesNotMatch(html,/<(?:style|link)\b/i,name+' HTML nem tartalmazhat beégetett stílusfüggőséget');
 assert.match(html,/type="module" src="js\/(?:site|offline)-bootstrap-v146\.js\?v=1\.46"/);
 assert.match(html,/<body>\s*<\/body>/i,name+' HTML törzse üres legyen');
}
assert.equal(site.schemaVersion,'1.0.0');assert.equal(offline.schemaVersion,'1.0.0');
assert.equal(site.body.length,12,'Az összes korábbi fő szerkezeti elem JSON-ba került');
assert.ok(site.assets.stylesheets.length>=30);
assert.deepEqual(site.assets.scripts.map(x=>x.src),[
 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/js/bootstrap.bundle.min.js',
 'js/round12-media-performance.js?v=1.46',
 'js/round13-network.js?v=csanadi-r-v1.46'
]);
assert.equal(site.assets.entryModule,'script.js?v=1.46');
for(const [name,shell] of [['site',site],['offline',offline]]){
 for(const asset of [...shell.assets.stylesheets,...shell.assets.scripts]){
  const address=asset.href||asset.src;
  assert.ok(safeJsonURL(address),name+' nem biztonságos statikus függősége: '+address);
  if(!/^https?:\/\//.test(address)){
   const relative=address.split('?')[0];
   assert.ok(fs.existsSync(path.join(root,relative)),name+' hiányzó függősége: '+relative);
  }
 }
}
assert.match(read('css/gate-prelude-v146.css'),/url\('\.\.\/assets\/media\/web\/gate-frames\/gate-00\.webp'\)/);
assert.match(read('css/gate-prelude-v146.css'),/url\('\.\.\/assets\/media\/web\/gate-frames\/gate-00-mobile\.webp'\)/);
const mobileCss=site.assets.stylesheets.find(x=>x.href.includes('mobile/reboot-design'));
assert.equal(mobileCss?.media,'screen and (max-width: 768px)');
assert.match(read('service-worker.js'),/json\/site-shell\.json','\.\/json\/offline-shell\.json/);
assert.match(read('service-worker.js'),/RELEASE_ID='1\.46'/);
assert.equal(JSON.parse(read('json/config.json')).performance.cacheVersion,'csanadi-r-v1.46');
const archived=JSON.parse(read('reports/csanadi-v1.43.28-m18-3-mobilos-elrendezes-archivum.json'));
assert.equal(archived.documentType,'historical-html-report-source');
assert.ok(archived.source.startsWith('<!doctype html>'),
 'A régi, megtekinthető jelentés forrásának meg kell maradnia');

const all=[];
function traverse(node){if(typeof node==='string')return;
 all.push(node);
 assert.ok(!Object.keys(node.attrs||{}).some(key=>/^on/i.test(key)),
  'Nem szerepelhet végrehajtható eseményattribútum a JSON-ban');
 for(const child of node.children||[])traverse(child);
}
site.body.forEach(traverse);offline.body.forEach(traverse);
const ids=new Set(all.map(x=>x.attrs?.id).filter(Boolean));
for(const id of ['site-header','site-map-overlay','global-hero','app','search-panel',
 'search-open','search-input','site-map-close','theme-toggle','mobile-menu-toggle','toast']){
 assert.ok(ids.has(id),'Hiányzó JSON-ból felépülő elem: '+id);
}
assert.equal(new Set(all.map(x=>x.attrs?.id).filter(Boolean)).size,
 all.map(x=>x.attrs?.id).filter(Boolean).length,'Duplikált DOM-id');

const pages=JSON.parse(read('json/page-index.json')).pages;
const validRoutes=new Set(['#/',...Object.values(pages).map(p=>p.schemaExtensions.route)]);
for(const node of all){
 const href=node.attrs?.href;
 if(href?.startsWith('#/'))assert.ok(validRoutes.has(href),'Nem létező JSON-shell útvonal: '+href);
 const source=node.attrs?.src;
 if(source&&!/^(?:https?:|data:|\/\/)/i.test(source))
  assert.ok(fs.existsSync(path.join(root,source)),'Hiányzó JSON-shell média: '+source);
}
assert.equal(safeJsonURL('javascript:alert(1)'),false);
assert.equal(safeJsonURL('#/iskolank'),true);

class FakeNode{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.dataset={};}
 setAttribute(key,value){this.attributes[key]=String(value);
  if(key.startsWith('data-'))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);}
 append(...nodes){this.children.push(...nodes)}
 replaceChildren(...nodes){this.children=[...nodes]}
 addEventListener(){}
}
const fakeHead=new FakeNode('head'),fakeBody=new FakeNode('body');
globalThis.document={head:fakeHead,body:fakeBody,documentElement:{lang:''},title:'',
 createElement:tag=>new FakeNode(tag),createElementNS:(ns,tag)=>{
  assert.equal(ns,'http://www.w3.org/2000/svg');return new FakeNode(tag)},
 createTextNode:value=>({nodeType:3,textContent:value})};
installJsonDocument(site);
assert.equal(fakeBody.children.length,12);
assert.equal(document.title,site.document.title);
assert.ok(fakeHead.children.length>=site.document.meta.length+site.document.links.length);
assert.equal(jsonNode({tag:'script',attrs:{src:'evil.js'}}),null,'JSON nem injektálhat szkriptet');
const unsafe=jsonNode({tag:'a',attrs:{href:'javascript:alert(1)'},children:['Hibás']});
assert.equal(unsafe.attributes.href,undefined);
const offlineAction=offline.body[0].children.find(x=>x.tag==='button');
assert.equal(offlineAction.attrs['data-json-action'],'reload');
console.log(`1.46 JSON-keret PASS – ${site.body.length} fő szerkezeti elem, ${all.length} JSON csomópont, ${Object.keys(pages).length} útvonal`);
