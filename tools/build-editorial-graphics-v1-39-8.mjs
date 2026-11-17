/* Eredeti, nem fényképszerű sport- és oktatási vektorillusztrációk. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output='assets/media/illustrations';
const topics=[
 ['konyv','Könyv','<path d="M100 130q52-21 100 5q48-26 100-5v150q-52-20-100 7q-48-27-100-7z M200 135v152 M120 164q30-7 60 4 M220 168q28-11 60-4"/>'],
 ['diploma','Végzettség','<path d="M68 162l132-56 132 56-132 57z M125 193v61q70 45 150 0v-61 M332 164v85"/><circle cx="332" cy="265" r="11"/>'],
 ['tanulas','Tanulás','<path d="M103 277v-132h194v132 M103 182h194 M131 220h91 M131 249h54 M261 211l24 23-24 23"/>'],
 ['laptop','Digitális eszköz','<rect x="104" y="123" width="192" height="130" rx="9"/><path d="M83 279h234l-19 20H102z M164 168l-27 20 27 20 M236 168l27 20-27 20 M213 164l-26 50"/>'],
 ['kodolas','Kódolás','<path d="M150 117h-31v62l-27 21 27 21v62h31 M250 117h31v62l27 21-27 21v62h-31 M221 145l-42 110"/>'],
 ['matematika','Matematika','<rect x="103" y="117" width="194" height="168" rx="15"/><path d="M137 159h64 M169 127v64 M227 149l43 43 M270 149l-43 43 M137 234h58 M223 231h50 M223 253h50"/>'],
 ['naptar','Naptár','<rect x="101" y="131" width="198" height="157" rx="12"/><path d="M101 177h198 M144 114v34 M258 114v34 M144 212h29 M200 212h29 M144 249h29 M200 249h29"/>'],
 ['ora','Időbeosztás','<circle cx="200" cy="202" r="92"/><path d="M200 143v62l47 36 M200 105v14 M200 285v14 M106 202h15 M279 202h15"/>'],
 ['erem','Sportérem','<circle cx="200" cy="231" r="65"/><path d="M152 170l-42-77h57l34 75 34-75h57l-43 77 M200 190l12 26 27 3-20 20 6 29-25-15-25 15 6-29-20-20 27-3z"/>'],
 ['kupa','Sportkupa','<path d="M144 110h112v90q0 68-56 68t-56-68z M144 141h-43v34q0 37 47 45 M256 141h43v34q0 37-47 45 M200 267v37 M156 305h88"/>'],
 ['kosarlabda','Kosárlabda','<circle cx="200" cy="200" r="90"/><path d="M110 200h180 M200 110v180 M137 137q91 62 0 126 M263 137q-91 62 0 126"/>'],
 ['labdarugas','Labdarúgás','<circle cx="200" cy="200" r="90"/><path d="M200 155l42 30-16 50h-52l-16-50z M200 155l-1-42 M158 185l-40-19 M242 185l40-19 M174 235l-26 38 M226 235l26 38"/>'],
 ['roplabda','Röplabda','<circle cx="200" cy="200" r="90"/><path d="M199 110q48 40 26 98 M110 199q47-9 80 43 M268 139q-65 9-88 75 M151 278q7-65 61-92"/>'],
 ['uszas','Úszás','<circle cx="251" cy="135" r="20"/><path d="M108 207l92-46 62 42 42-18 M109 242q31-21 61 0t61 0t61 0 M109 277q31-21 61 0t61 0t61 0"/>'],
 ['futas','Atlétika','<circle cx="227" cy="120" r="19"/><path d="M208 152l-42 54 44 27 49 60 M183 176l72 17 28 34 M194 220l-67 67 M149 178l-37 15"/>'],
 ['csapat','Közösség','<circle cx="200" cy="131" r="23"/><circle cx="128" cy="163" r="19"/><circle cx="272" cy="163" r="19"/><path d="M150 275v-65q50-38 100 0v65 M92 266v-58q23-19 47-7 M308 266v-58q-23-19-47-7"/>'],
 ['fenntarthatosag','Fenntarthatóság','<path d="M108 275q-25-131 157-163q30 142-157 163z M111 275l129-117 M183 220l-30-48 M183 220l65 13"/>'],
 ['foldrajz','Világismeret','<circle cx="200" cy="200" r="91"/><path d="M109 200h182 M200 109q-79 90 0 182 M200 109q79 90 0 182 M128 156h144 M128 244h144"/>'],
 ['terkep','Megközelítés','<path d="M103 124l64-23 66 23 64-23v165l-64 23-66-23-64 23z M167 101v165 M233 124v165"/><path d="M213 169c0 24-24 45-24 45s-24-21-24-45a24 24 0 1 1 48 0z"/>'],
 ['dokumentum','Dokumentum','<path d="M125 102h102l49 49v146H125z M227 102v49h49 M151 195h98 M151 226h98 M151 257h67"/>']
];
const schemes=[
 ['sotet','#102a44','#e9c780','#e9c780'],
 ['vilagos','#faf8f2','#173854','#bb9652'],
 ['kontur','none','#173854','#cba667']
];
const escape=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const inventoryPath=path.join(root,'json/assets-inventory.json');
const registryPath=path.join(root,'json/mediatar.json');
const inventory=JSON.parse(fs.readFileSync(inventoryPath,'utf8'));
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
inventory.items=inventory.items.filter(item=>!item.path.startsWith(output+'/'));
registry.items=registry.items.filter(item=>!item.id.startsWith('media:tematika-'));
fs.mkdirSync(path.join(root,output),{recursive:true});
function describe(rel){const bytes=fs.readFileSync(path.join(root,rel));return {path:rel,mimeType:'image/svg+xml',sizeBytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};}
for(const [slug,label,glyph] of topics){
 const versions=[];
 for(const [mode,bg,ink,accent] of schemes){
  const rel=`${output}/${slug}-${mode}.svg`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-labelledby="icon-title"><title id="icon-title">${escape(label)} – ${escape(mode)} sportiskolai illusztráció</title><rect x="8" y="8" width="384" height="384" rx="58" fill="${bg}" stroke="${accent}" stroke-width="${mode==='kontur'?5:2}"/><circle cx="200" cy="200" r="135" fill="none" stroke="${accent}" stroke-width="3" opacity=".45"/><g fill="none" stroke="${ink}" stroke-width="11" stroke-linejoin="round" stroke-linecap="round">${glyph}</g><path d="M99 339h202" stroke="${accent}" stroke-width="4"/></svg>\n`;
  fs.writeFileSync(path.join(root,rel),svg);
  const meta=describe(rel);versions.push(meta);
  inventory.items.push({...meta,type:'graphic',title:`${label} – ${mode} illusztráció`,alt:`${label} témájú, stilizált vektorikon`,description:'Saját, sematikus szerkesztői grafika; nem valós iskolai eseményt ábrázoló fénykép.',tags:['tematikus','ikon',slug,mode],mediaId:`media:tematika-${slug}`,rightsStatus:'institutional-review-before-publication'});
 }
 registry.items.push({id:`media:tematika-${slug}`,kind:'image',original:versions[0],variants:versions,alt:`${label} témájú vektorillusztráció`,caption:`Saját készítésű szerkesztői grafika: ${label}`,decorative:true,rights:{clearance:'pending',holder:'Csanádi Sportiskola – szerkesztői illusztráció',license:'Intézményi jóváhagyásig kizárólag belső előnézethez.'}});
}
inventory.updatedAt='2026-11-17';
fs.writeFileSync(inventoryPath,JSON.stringify(inventory,null,2)+'\n');
fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
console.log(JSON.stringify({topics:topics.length,newGraphics:topics.length*schemes.length,totalInventory:inventory.items.length,registeredMedia:registry.items.length}));
