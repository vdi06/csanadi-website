/* A kompakt aloldalfejléc döntési logikája valódi projektforrásból. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../js/subpages-v1.js'),'utf8');
const from=src.indexOf('export function shouldCondenseSubpageHeader');
const to=src.indexOf('export function initSubpageEnhancements',from);
assert(from>=0&&to>from,'A tesztelhető fejlécszabály hiányzik');
const check=vm.runInNewContext(src.slice(from,to).replace('export ','')+';shouldCondenseSubpageHeader');
const base={inner:true,scroll:300,heroBottom:120,hasHero:true,alreadyCondensed:false};
const tests=[
 ['Kezdőoldalon soha nem vált kompakt fejlécre',{...base,inner:false,heroBottom:-200},false],
 ['Látható képváltónál nem vált át',{...base,scroll:1200,heroBottom:120},false],
 ['Kigördült képváltónál összecsukódik',{...base,heroBottom:-1},true],
 ['Kompakt állapotban a holtsáv megtartja az állapotot',{...base,heroBottom:20,alreadyCondensed:true},true],
 ['Visszagörgetéskor ismét teljes fejléc látható',{...base,heroBottom:50,alreadyCondensed:true},false],
 ['Kép nélküli oldalon csak tényleges görgetésre vált',{...base,hasHero:false,scroll:80},false],
 ['Kép nélküli oldalon átlépi a küszöböt',{...base,hasHero:false,scroll:130},true]
];
for(const [name,options,expected] of tests){assert.equal(check(options),expected,name);console.log('OK',name);}
console.log(JSON.stringify({passed:tests.length,failed:0}));
