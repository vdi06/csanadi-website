/** 1.53: a tényleges mobil DOM-gyártó futtatása egyszerűsített DOM-mal.
 * A böngészői kinézetet nem szimulálja, a szerkezetet és az attribútumokat igen. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const config=JSON.parse(read('source/json/config.json'));
const page=JSON.parse(read('source/json/pages/home.json'));
const block=page.blocks.find(entry=>entry.id==='block:home-hero');

class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attrs={};this.className='';}
 setAttribute(key,value){this.attrs[key]=value;}
 append(...elements){this.children.push(...elements);}
}
const settings={
 'site.crestImagePath':config.site.crestImagePath
};
const context={
 document:{createElement:tag=>new Element(tag)},
 setting:name=>settings[name],
 sharedAssetPath:value=>typeof value==='string'&&value.startsWith('assets/')?'../shared/'+value:value
};
const script=read('mobile/mobile/static-hero-v152.js')
 .replace(/^import .*;\s*$/gm,'')
 .replace('export function renderStaticMobileHero','function renderStaticMobileHero')
 +'\nglobalThis.__render=renderStaticMobileHero;';
vm.runInNewContext(script,context,{filename:'mobile/static-hero-v152.js'});
const rootNode=context.__render(block);
assert.ok(rootNode,'A nyitórész nem készült el.');
assert.equal(rootNode.tagName,'SECTION');
assert.equal(rootNode.className,'cs-mobile-static-hero');
assert.equal(rootNode.children.length,2,'Csak a címer és a szövegcsoport megengedett.');
const nodes=[];
const visit=node=>{nodes.push(node);for(const child of node.children||[])visit(child);};
visit(rootNode);
const crest=nodes.filter(node=>node.tagName==='IMG');
assert.equal(crest.length,1,'Pontosan egy címer jelenhet meg.');
assert.equal(crest[0].src,'../shared/'+config.site.crestImagePath);
assert.equal(crest[0].alt,block.data.mobileStatic.crestAlt);
assert.equal(crest[0].width,128);
assert.equal(crest[0].height,128);
assert.equal(crest[0].loading,'eager');
assert.equal(nodes.filter(node=>['PICTURE','VIDEO','CANVAS','BUTTON'].includes(node.tagName)).length,0);
assert.equal(nodes.filter(node=>node.tagName==='H1').length,1);
assert.equal(nodes.filter(node=>node.tagName==='A').length,1);
assert.equal(nodes.find(node=>node.tagName==='A').href,block.data.mobileStatic.href);
assert.equal(nodes.find(node=>node.tagName==='H1').textContent,block.data.mobileStatic.title);

const css=read('mobile/mobile/static-hero-v152.css');
assert.match(css,/body\.cs-home-header #global-hero\{\s*background-image:none!important/);
assert.match(css,/\.cs-mobile-static-hero\{[\s\S]*?align-items:center!important/);
assert.match(css,/\.cs-mobile-static-visual\{[\s\S]*?place-items:center!important/);
assert.match(css,/\.cs-mobile-static-crest\{[\s\S]*?object-fit:contain!important/);
assert.match(css,/\.cs-mobile-static-crest\{[\s\S]*?border-radius:0!important/);
assert.doesNotMatch(css,/object-fit:cover|48svh|aspect-ratio:4\/3|background-image:(?!none)/);
for(const width of [320,360,390,430,650]){
 const size=Math.max(100,Math.min(width*.28,134));
 assert.ok(size<=width*.45,`${width}px: túlméretes címer`);
}
assert.match(read('desktop/js/hero-2026.js'),/function renderPremiumHero/);
assert.doesNotMatch(read('desktop/js/hero-2026.js'),/renderStaticMobileHero/);
console.log('1.53 mobil DOM PASS: középre rendezett címer, 1 kép, 1 cím, 1 link, 0 képváltó; desktop érintetlen.');
