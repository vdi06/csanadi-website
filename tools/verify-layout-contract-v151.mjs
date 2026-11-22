/** Csanádi 1.51: kód- és elrendezésszerződés, nem képernyőképes szemrevételezés.
 * A CSS-ben ténylegesen deklarált értékeket, a DOM-ot gyártó JavaScriptet,
 * a JSON-hivatkozásokat és a 320/390px-es vízszintes méretképletet ellenőrzi.
 * Nem helyettesíti a böngésző CSS-cascade/jelmezőmotorját és a valódi eszközt.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const mobileCss=read('source/mobile/reboot-design-v1-43-29.css');
const mobileGuard=read('source/mobile/reboot-stability-v149.css');
const desktopCss=read('source/css/header-symmetric-rows-v1-43-5.css');
const baseCss=read('source/css/responsive-system-v1-42-18.css');
const gateCss=read('source/css/entrance-sequence.css');
const gateJs=read('source/js/gate-sequence-v1-42-17.js');
const mobileShell=read('source/mobile/reboot-shell-v1-43-29.js');
const mobileMenu=read('source/mobile/reboot-menu-v1-43-29.js');
const mobileHero=read('source/mobile/reboot-hero-v1-43-29.js');
const desktopHero=read('source/js/hero-2026.js');
const app=read('source/js/app.js');
const config=json('source/json/config.json');
const home=json('source/json/pages/home.json');
const shell=json('source/json/site-shell.json');
const structure=json('source/json/structure.json');
const platformScript=read('js/platform-router-v149.js');

// Egyetlen közös HTML-váz: a tényleges iskolai elemek mind JSON-ból/JS-ből.
assert.match(read('index.html'),/<body>\s*<\/body>/i);
assert.doesNotMatch(read('index.html'),/Csanádi|Sportiskola|<main|<header|<footer/i);
assert.equal(shell.body.length,12,'A JSON-váz változásakor frissítendő a szerkezeti leltár.');
assert.equal(structure.nodes.length,6,'Az asztali főmenü hat gyökércsoportot épít.');
assert.equal(Object.keys(json('source/json/page-index.json').pages).length,79);
assert.equal(home.blocks.length,8);
assert.equal(home.blocks.find(x=>x.id==='block:home-hero').data.slides.length,9);
assert.ok(/^assets\/media\//.test(shell.body[4].attrs['data-cs-mb-fallback-image']));
assert.ok(fs.existsSync(path.join(root,'source',shell.body[4].attrs['data-cs-mb-fallback-image'])));
assert.match(read('source/js/site-bootstrap-v149.js'),/hero\.style\.setProperty\('--cs-mb-fallback-image'/);
assert.match(platformScript,/\(pointer: coarse\) and \(hover: none\)/);
assert.match(platformScript,/query\.addEventListener\?\.\('change'/);
assert.match(mobileMenu,/mobileViewportMode\(width,height,forcedMobile=false\)/);
assert.match(mobileMenu,/mobileViewportMode\(width,height,media\.matches\)/);
assert.match(app,/resize',[^\n]+matchMedia\('\(max-width: 768px\), \(pointer: coarse\) and \(hover: none\)'\)/);

// Nem elég, hogy van középre állítás: konkrétan az érintett szülőelemen
// kell lennie. A háromoszlopos rács két oldala azonos 1fr szélességű.
assert.match(mobileCss,/\.cs-mb-bar\{display:grid!important;[\s\S]*?grid-template-columns:minmax\(0,1fr\) 62px minmax\(0,1fr\)!important/);
assert.match(mobileCss,/\.cs-mb-left,\.cs-mb-right\)\{display:grid!important;[\s\S]*?grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
assert.match(mobileCss,/\.cs-mb-right\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
assert.match(mobileCss,/\.cs-mb-crest\{grid-column:2!important;grid-row:1!important;[\s\S]*?justify-self:center!important/);
assert.match(mobileCss,/\.cs-mb-school-title\{display:grid!important;justify-items:center!important/);
assert.match(mobileCss,/\.cs-mb-school-title strong\{[^}]*text-align:center!important/s);
assert.match(mobileCss,/\.cs-mb-bar\{grid-template-columns:minmax\(0,1fr\) 58px minmax\(0,1fr\)!important;\s*gap:4px!important/);
assert.match(mobileCss,/\.cs-mb-film-info\{display:flex!important;flex-direction:column!important;\s*align-items:center!important;justify-content:center!important;gap:13px!important/);
assert.match(mobileCss,/\.cs-mb-film-panel\{display:grid!important;\s*grid-template-columns:52px minmax\(0,1fr\) 52px!important;[\s\S]*?gap:10px!important/);
assert.match(mobileCss,/\.cs-mb-film-actions\{display:flex!important;align-items:center!important;\s*justify-content:center!important;flex-wrap:wrap!important;gap:10px!important/);
assert.match(mobileCss,/\.cs-mb-film-stage\{width:100%!important;[\s\S]*?aspect-ratio:4\/3!important;max-height:50svh!important/);
assert.match(mobileCss,/\.cs-mb-cinema\{display:block!important;width:100%!important;\s*max-width:680px!important;[\s\S]*?margin:0 auto!important/);
assert.match(mobileCss,/\.cs-mb-film-heading\{[^}]*margin:0 auto!important;[^}]*text-align:center!important/s);
assert.match(mobileGuard,/\.csn26-visual-row\.csn26-single-image,[\s\S]*?display:none!important/);
assert.match(mobileGuard,/\.reveal-on-scroll:not\(\.is-visible\)[\s\S]*?opacity:1!important/);
assert.doesNotMatch(mobileCss,/url\(['"]?\.\.\/assets\/media\/web\/responsive\/bejarat/);
assert.match(mobileHero,/fallbackFor=slide=>/);
assert.match(mobileHero,/stage\.style\.setProperty\('--cs-mb-fallback-image'/);
assert.match(mobileHero,/recoverAfterMount=\(\)=>/);
assert.match(mobileHero,/observer\.observe\(document\.body,\{childList:true,subtree:true\}\)/);

// A 320-as minimális telefonon az ikonok kiszámolt oszlopmérete 24 px fölött.
// Az érték nem böngészőmérés; kizárólag a fenti, ellenőrzött CSS-képlet.
const mobileHeaderGeometry=width=>{
 const padding=width<=359?8:12;
 const crest=width<=419?58:62;
 const gap=width<=359?3:width<=419?4:8;
 const space=Math.min(width,650)-2*padding;
 const side=(space-crest-2*gap)/2;
 return {width,padding,crest,side,leftIcon:(side-6)/3,rightIcon:(side-3)/2};
};
for(const width of [320,360,390,419,430,650]){
 const g=mobileHeaderGeometry(width);
 assert.ok(g.leftIcon>=24&&g.rightIcon>=24,`Telefonos fejléc nem fér el: ${width}px, ${JSON.stringify(g)}`);
}

assert.match(desktopCss,/\.header-actions\{[\s\S]*?display:grid!important;[\s\S]*?grid-template-columns:minmax\(0,1fr\) clamp\(76px,8\.2vw,112px\) minmax\(0,1fr\)!important/);
assert.match(desktopCss,/\.header-symmetry-left\{justify-content:flex-end!important\}/);
assert.match(desktopCss,/\.header-symmetry-right\{justify-content:flex-start!important\}/);
assert.match(desktopCss,/\.header-symmetry-side\{\s*display:flex!important;align-items:center!important;flex-wrap:wrap!important;/);
assert.match(baseCss,/--cs-content-limit:var\(--cs-site-content-width,1160px\)/);
assert.match(baseCss,/margin-inline:auto!important;/);
assert.match(baseCss,/@media\(max-width:768px\), \(pointer:coarse\) and \(hover:none\)/);
assert.match(desktopHero,/if\(!row\.isConnected\)return;/);
assert.match(desktopHero,/initialFailed=new Set\(\)/);
assert.doesNotMatch(desktopHero,/if\(!row\.isConnected\)\{clearInterval/);

// A kapu feletti címer mögött nincs rejtett ovális: a címer eleme
// transparent és keret nélküli. A kapukontúr 3D-je négy kitöltetlen vonal.
assert.equal(config.runtime.entrance.frameCount,9);
assert.equal(config.runtime.entrance.durationDesktopMs,2250);
assert.equal(config.runtime.entrance.durationMobileMs,1750);
assert.equal(shell.gate.desktopOnly,false);
assert.equal(config.site.crestImagePath,'assets/media/logo/csanadi-crest-512.webp');
assert.ok(fs.existsSync(path.join(root,'source',config.site.crestImagePath)));
assert.match(gateCss,/\.gate26-glass-crest\{[\s\S]*?border:0!important;border-radius:0!important;\s*background:transparent!important;box-shadow:none!important/);
assert.match(read('source/css/theme-coverage-v1-42-21.css'),/\.gate26-glass-crest\s*\{\s*background:transparent!important;border:0!important;box-shadow:none!important/);
for(const layer of ['depth','contour','rim','seam']){
 assert.match(gateCss,new RegExp('\\.gate26-door-'+layer+'\\{fill:none;stroke:'));
 assert.match(gateJs,new RegExp('class="gate26-door-'+layer+'"'));
}
assert.match(gateCss,/\.gate26-skip-bar\{position:absolute!important;z-index:14!important/);
assert.match(gateJs,/glassLogo\.src=setting\('site\.crestImagePath'\)/);
assert.match(gateJs,/preserveAspectRatio="none"/);

console.log('1.51 kódszintű elrendezési szerződés PASS: 12 JSON-vázelem, 6 menücsoport, 79 oldal, 9 nyitókép.');
console.log('Mobil 320–650 px: szimmetrikus 3+címer+2 fejléc, min. 24px ikon, 52px nyilak + 10px rés.');
console.log('Asztali: 1fr/címer/1fr rács, sorba törő akciók. Kapu: keretmentes címer, 4 rétegű kitöltetlen arany 3D kontúr.');
