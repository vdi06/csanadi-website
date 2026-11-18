import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>readFileSync(path.join(root,file),'utf8');
const config=JSON.parse(read('json/config.json'));
const page=JSON.parse(read('json/oldalak/kezdolap.json'));
const slides=page.blocks.find(block=>block.id==='block:home-hero')?.data.slides||[];
const css=read('css/header-responsive-v1-40-2.css');
const shell=read('js/release-v1-39-1.js');
const slideshow=read('js/hero-2026.js');
const html=read('index.html');
const boot=read('script.js');

assert.equal(slides.length,30,'Pontosan 30 fotó váltakozzon');
assert.equal(new Set(slides.map(s=>s.mediaId)).size,30,'30 eltérő fotóra van szükség');
assert.equal(config.runtime.hero.maxSlides,30,'A 30 diaszám legyen engedélyezve');
assert.ok(config.runtime.hero.pictureCacheEntries<=5,'A DOM-képek gyorsítótára legfeljebb 5 elem');
assert.match(slideshow,/prepareNext\(index\)/,'Készüljön fel a következő képre');
assert.match(slideshow,/navigator\.connection\?\.saveData/,'Adatkímélésnél ne legyen előtöltés');
assert.match(slideshow,/requestIdleCallback/,'Üresjáratban történjen az előtöltés');
assert.match(shell,/cs1402-persistent-motto/,'A jelmondat legyen folyamatosan megjeleníthető');
assert.match(shell,/csanadi:menu-toggle/,'A görgetés utáni címer nyissa a főmenüt');
assert.match(shell,/csanadi-cimer-512\.webp/,'A kompakt címer ugyanaz az intézményi jelkép');
assert.doesNotMatch(shell,/new MutationObserver\(queue\)\.observe\(hero/,'Ne frissítsük minden dia után a kis fejlécgombot');
assert.match(css,/data-theme="light"/,'Világos felület kezelése');
assert.match(css,/data-theme="dark"/,'Sötét felület kezelése');
assert.match(css,/cs1402-hero-text/,'A képfeliratoknak is legyen kontrasztos színük');
assert.match(css,/prefers-reduced-motion:reduce/,'A mozgáscsökkentést tisztelni kell');
assert.match(html,/header-responsive-v1-40-2\.css\?v=1\.40\.2/,'A kontrasztos fejlécstílus legyen bekötve');
assert.match(boot,/app\.js\?v=1\.40\.(?:2|3|4|5|6|7|8|9|10)/,'A v1.40-es alkalmazáskód töltődjön be');

function luminance(hex){
 const parts=hex.replace('#','').match(/.{2}/g).map(part=>parseInt(part,16)/255);
 const linear=parts.map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
 return .2126*linear[0]+.7152*linear[1]+.0722*linear[2];
}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
const lightRatio=contrast('#142d43','#f2eadb');
const darkRatio=contrast('#f7f1e6','#102941');
assert.ok(lightRatio>=7,'Világos fejléc szöveg kontrasztja legyen legalább 7:1');
assert.ok(darkRatio>=7,'Sötét fejléc szöveg kontrasztja legyen legalább 7:1');
console.log(`v1.40.2: 30 egyedi kép, takarékos előtöltés, tartós mottó és címeres menü. Fejléc-kontraszt: világos ${lightRatio.toFixed(2)}:1, sötét ${darkRatio.toFixed(2)}:1.`);
