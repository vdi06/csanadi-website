import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {pageTemplateKind} from '../js/page-templates-v1-39-2.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(read(f));
const tests=[];
function test(name,fn){try{fn();tests.push({name,passed:true});}catch(e){tests.push({name,passed:false,error:e.message});}}
const pages=json('json/oldalindex.json').pages;
const routes=Object.values(pages).map(x=>x.schemaExtensions?.route).filter(Boolean);

test('Mind a 71 publikált útvonal sablont kap',()=>{
 assert.equal(routes.length,71);
 for(const route of routes)assert.ok(pageTemplateKind(route),route);
});
test('A híroldal nem eseménysablon',()=>assert.equal(pageTemplateKind('#/hirek-es-esemenyek/hirek'),'news'));
test('Az eseménynaptár nem hírsablon',()=>assert.equal(pageTemplateKind('#/hirek-es-esemenyek/esemenynaptar'),'events'));
test('Sportoldal saját sablont kap',()=>assert.equal(pageTemplateKind('#/sport/sportagak'),'sport'));
test('Dokumentumtár saját sablont kap',()=>assert.equal(pageTemplateKind('#/informaciok/dokumentumtar'),'documents'));
test('Érkezési oldal saját sablont kap',()=>assert.equal(pageTemplateKind('#/megkozelites-es-erkezes'),'arrival'));
test('Digitális tanulási útmutató lépéses sablont kap',()=>assert.equal(pageTemplateKind('#/oktatas/digitalis-kultura'),'guide'));
test('Iskolai tájékoztatás saját sablont kap',()=>assert.equal(pageTemplateKind('#/informaciok/mindennapi-tudnivalok'),'information'));
test('Bemutatkozás saját sablont kap',()=>assert.equal(pageTemplateKind('#/iskolank'),'school'));
test('Valóban eltérő cikkstruktúrák készülnek',()=>{
 const js=read('js/page-templates-v1-39-2.js');
 for(const region of ['news-lead','news-stream','sport-spotlight','sport-fields','documents-layout','events-timeline','arrival-panels','guide-steps','information-grid','school-collection'])
  assert.ok(js.includes('cs92-'+region),region);
 assert.ok(read('js/app.js').includes('applyPageTemplate(article,route)'));
});
test('Olvasási tartalomjegyzék figyeli a belső régiók címeit',()=>{
 assert.ok(read('js/release-v1-39-0.js').includes("all('.article-section > h2',article)"));
 assert.ok(read('js/release-v1-39-0.js').includes("article.querySelector('.cs92-section-navigation')"));
});
test('Mobilmenü felirata és gyorskijáratai a HTML-ben',()=>{
 const html=read('index.html'),js=read('js/release-v1-39-0.js');
 assert.ok(js.includes('cs92-mobile-menu-label'));
 for(const href of ['#/','#/hirek-es-esemenyek/hirek','#/kapcsolat'])assert.ok(html.includes('href="'+href+'"'),href);
 assert.ok(html.includes('id="cs92-wheel-shortcuts"'));
});
test('Az új stílusok a korábbi felülírások után töltődnek',()=>{
 const html=read('index.html');
 const old=html.indexOf('corrections-v1-39-1.css');
 assert.ok(old>=0&&old<html.indexOf('page-templates-v1-39-2.css')&&old<html.indexOf('mobile-navigation-v1-39-2.css'));
});
test('A v1.39.2 sablonrendszer az újabb FTP-kiadásban is megmaradt',()=>{
 assert.ok(['csanadi-r-v1.39.2','csanadi-r-v1.39.3','csanadi-r-v1.39.4','csanadi-r-v1.39.5','csanadi-r-v1.39.6','csanadi-r-v1.39.7','csanadi-r-v1.39.8','csanadi-r-v1.39.9','csanadi-r-v1.39.10','csanadi-r-v1.39.11','csanadi-r-v1.39.12','csanadi-r-v1.39.13','csanadi-r-v1.39.14','csanadi-r-v1.39.16'].includes(json('json/config.json').performance.cacheVersion));
 assert.match(read('index.html'),/script\.js\?v=1\.39\.(?:[23456789]|10|11|12|13|14|15|16)/);
});

const failed=tests.filter(x=>!x.passed);
console.log(JSON.stringify({version:'1.39.2',tests:tests.length,passed:tests.length-failed.length,failed,templates:Object.fromEntries([...new Set(routes.map(pageTemplateKind))].map(k=>[k,routes.filter(r=>pageTemplateKind(r)===k).length]))},null,2));
if(failed.length)process.exitCode=1;
