/** M17.2: rövid kijelzőn rács, magas mobilon ütközésmentes kör; statikus kapu. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {mobileViewportMode} from '../mobile/reboot-menu-v1-43-26.js';

const root=path.resolve(import.meta.dirname,'..');
const css=fs.readFileSync(path.join(root,'mobile/reboot-design-v1-43-26.css'),'utf8');
const viewportPairs=[[320,568,'grid'],[360,640,'grid'],[375,812,'grid'],
 [390,844,'grid'],[412,915,'grid'],[420,759,'grid'],[420,760,'circle'],
 [430,932,'circle'],[600,900,'circle'],[768,500,'grid'],
 [768,1024,'circle'],[769,900,'desktop'],[1024,768,'desktop']];
for(const [width,height,mode] of viewportPairs){
 assert.equal(mobileViewportMode(width,height),mode,`${width}x${height}`);
}
assert.match(css,/@media screen and \(min-width:420px\) and \(max-width:768px\) and \(min-height:760px\)/);
assert.match(css,/height:420px!important;flex:0 0 420px!important/);
assert.match(css,/\.cs-mb-menu-card:nth-child\(2\)\{top:70px;right:0\}/);
assert.match(css,/\.cs-mb-menu-card:nth-child\(3\)\{bottom:60px;right:0\}/);
// A közvetlen oldallinket is tartalmazó kártyáknak konzervatív 145px
// magasságot adva sem ütközhet egymásnak a hat kártya és a központi embléma.
const size=145,width=390,height=420,side=120;
const rects=[{x:(width-side)/2,y:0,w:side,h:size},
 {x:width-side,y:70,w:side,h:size},
 {x:width-side,y:height-60-size,w:side,h:size},
 {x:(width-side)/2,y:height-size,w:side,h:size},
 {x:0,y:height-60-size,w:side,h:size},
 {x:0,y:70,w:side,h:size},
 {x:(width-96)/2,y:(height-96)/2,w:96,h:96}];
for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
 const a=rects[i],b=rects[j];
 const overlaps=a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 assert.equal(overlaps,false,`Ütköző körmenüelemek: ${i+1}/${j+1}`);
}
assert.match(css,/\.cs43-viewer \.modal-content\{[\s\S]*?height:100dvh/);
assert.match(css,/overflow-wrap:anywhere!important/);
assert.match(css,/#cs-release-notice\[hidden\]\{display:none!important\}/);
for(const name of ['verify-m11-mobile-matrix.mjs','verify-m12-content-coverage.mjs',
 'verify-m13-mobile-text.mjs','verify-m15-responsive.mjs']){
 execFileSync(process.execPath,[path.join(root,'tools',name)],{stdio:'pipe'});
}
console.log(`M17.2 PASS: ${viewportPairs.length} töréspont, ütközésmentes kör, 78 oldal lefedettsége (statikus)`);
