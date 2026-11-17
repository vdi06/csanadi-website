/* A második, jogilag elkülönített szerkesztői SVG-gyűjtemény: 20 új téma x 3 változat. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output='assets/media/illustrations';
const topics=[
 ['robotika','Robotika','<rect x="127" y="135" width="146" height="126" rx="19"/><path d="M200 100v35 M186 100h28 M127 171h-28v55h28 M273 171h28v55h-28 M160 261v31 M240 261v31"/><circle cx="165" cy="190" r="10"/><circle cx="235" cy="190" r="10"/><path d="M164 230h72"/>'],
 ['kemia','Kísérletezés','<path d="M173 103h54 M186 103v100l-59 80q-8 17 16 19h114q24-2 16-19l-59-80V103 M156 249h88 M171 270h58"/><circle cx="183" cy="226" r="7"/><circle cx="219" cy="242" r="7"/>'],
 ['nyelvek','Nyelvtanulás','<path d="M93 137h125v107H145l-39 32v-32H93z M186 174h121v103h-42l-32 28v-28h-47 M124 172h66 M124 200h45 M215 207h62 M215 237h44"/>'],
 ['jegyzeteles','Jegyzetelés','<rect x="117" y="106" width="172" height="191" rx="11"/><path d="M149 145h108 M149 179h108 M149 213h64 M146 255l39-22 13 13-39 22z M112 143h-20 M112 178H92 M112 213H92 M112 248H92"/>'],
 ['dij','Díjátadó','<path d="M104 287h192 M122 263h156 M154 209h92v54h-92z M166 209v-30h68v30 M182 179l18-26 18 26 M200 111v26 M147 120l20 16 M253 120l-20 16"/>'],
 ['palya','Sportpálya','<rect x="104" y="138" width="192" height="132" rx="8"/><path d="M200 138v132 M104 204h192 M142 138v31h-38 M258 138v31h38 M142 270v-31h-38 M258 270v-31h38"/><circle cx="200" cy="204" r="27"/>'],
 ['edzesterv','Edzésterv','<rect x="110" y="112" width="180" height="186" rx="10"/><path d="M148 146h108 M148 183h69 M148 218h69 M148 252h69 M128 175l9 9 17-19 M128 211l9 9 17-19 M128 246l9 9 17-19"/>'],
 ['serulesmegelozes','Bemelegítés','<circle cx="200" cy="125" r="21"/><path d="M200 147v85 M200 176l-67 28 M200 176l67 28 M200 232l-53 65 M200 232l53 65 M121 134l-21-21 M279 134l21-21"/>'],
 ['viz','Folyadékpótlás','<path d="M170 108h60l-6 37 18 42v101q-42 28-84 0V187l18-42z M158 220h84 M186 112v-20h28v20 M188 256h24"/>'],
 ['egeszseg','Egészségtudatosság','<path d="M200 283l-92-88q-38-45 0-74q37-24 92 22q55-46 92-22q38 29 0 74z M122 202h44l18-38 26 70 19-32h49"/>'],
 ['vizsgafelk','Felkészülés','<rect x="123" y="129" width="154" height="156" rx="9"/><path d="M147 165h106 M147 197h71 M147 230h60 M195 277l24 23 51-56"/><circle cx="199" cy="106" r="12"/>'],
 ['szulok','Szülői együttműködés','<circle cx="158" cy="154" r="23"/><circle cx="243" cy="154" r="23"/><path d="M107 270v-49q14-39 51-39t51 39v49 M192 270v-49q14-39 51-39t51 39v49 M173 239h53"/>'],
 ['csengetes','Csengetés','<path d="M145 239h110l-19-24v-52q0-36-36-36t-36 36v52z M174 253q26 27 52 0 M200 103v24 M139 133l-21-21 M261 133l21-21"/>'],
 ['jelentkezes','Jelentkezés','<rect x="110" y="118" width="181" height="180" rx="9"/><path d="M145 153h116 M145 188h71 M145 224h63 M221 256l23 22 45-51 M172 101h55v33h-55z"/>'],
 ['etkezes','Étkezés','<circle cx="200" cy="205" r="74"/><circle cx="200" cy="205" r="48"/><path d="M97 118v172 M80 119v61 M114 119v61 M304 118q-21 55 0 86v86"/>'],
 ['kozlekedes','Közlekedés','<rect x="105" y="135" width="190" height="124" rx="18"/><path d="M131 135l19-28h100l19 28 M124 210h152 M132 259v26 M268 259v26"/><circle cx="149" cy="233" r="9"/><circle cx="251" cy="233" r="9"/>'],
 ['hozzaferes','Akadálymentes elérés','<circle cx="195" cy="111" r="20"/><path d="M116 166h166 M195 132v72 M195 204l-41 84 M195 204l47 84 M155 224l-31 35"/>'],
 ['adatbiztonsag','Adatbiztonság','<path d="M200 100l94 38v69q0 55-94 100q-94-45-94-100v-69z M158 201l27 27 57-62"/>'],
 ['archivum','Dokumentumarchívum','<rect x="100" y="123" width="200" height="56" rx="7"/><rect x="119" y="183" width="162" height="118" rx="7"/><path d="M150 153h100 M145 220h110 M165 253h70"/>'],
 ['digitalis-ugy','Online ügyintézés','<rect x="107" y="131" width="186" height="139" rx="10"/><path d="M107 170h186 M142 200h88 M142 231h62 M216 249l19 20 38-44 M148 149h4 M171 149h4"/>']
];
const modes=[['sotet','#102a44','#e9c780','#e9c780'],['vilagos','#faf8f2','#173854','#bb9652'],['kontur','none','#173854','#cba667']];
const inventoryPath=path.join(root,'json/assets-inventory.json'),registryPath=path.join(root,'json/mediatar.json');
const inventory=JSON.parse(fs.readFileSync(inventoryPath,'utf8')),registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const ids=new Set(topics.map(([slug])=>'media:tematika2-'+slug));
inventory.items=inventory.items.filter(item=>!ids.has(item.mediaId));
registry.items=registry.items.filter(item=>!ids.has(item.id));
fs.mkdirSync(path.join(root,output),{recursive:true});
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;');
for(const [slug,label,art] of topics){
 const variants=[];const mediaId='media:tematika2-'+slug;
 for(const [mode,bg,ink,accent] of modes){
  const rel=`${output}/uj-${slug}-${mode}.svg`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-labelledby="icon-title"><title id="icon-title">${escape(label)} – ${mode} tematikus illusztráció</title><rect x="8" y="8" width="384" height="384" rx="58" fill="${bg}" stroke="${accent}" stroke-width="${mode==='kontur'?5:2}"/><circle cx="200" cy="200" r="135" fill="none" stroke="${accent}" stroke-width="3" opacity=".42"/><g fill="none" stroke="${ink}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round">${art}</g><path d="M103 337h194" stroke="${accent}" stroke-width="4"/></svg>\n`;
  const bytes=Buffer.from(svg);fs.writeFileSync(path.join(root,rel),bytes);
  const meta={path:rel,mimeType:'image/svg+xml',sizeBytes:bytes.length,sha256:sha(bytes)};
  variants.push(meta);inventory.items.push({...meta,type:'graphic',title:`${label} – ${mode}`,alt:`${label} témájú sematikus illusztráció`,description:'Saját szerkesztői vektorgrafika, nem valós iskolai esemény vagy szereplő fényképe.',tags:['illusztráció','tematikus',slug,mode],mediaId,rightsStatus:'institutional-review-before-publication'});
 }
 registry.items.push({id:mediaId,kind:'image',original:variants[0],variants,alt:`${label} témájú vektorillusztráció`,caption:`Saját készítésű tematikus grafika: ${label}`,decorative:true,rights:{clearance:'pending',holder:'Csanádi Sportiskola – szerkesztői grafika',license:'Intézményi elfogadásig kizárólag belső előnézet.'}});
}
inventory.updatedAt='2026-11-17';
fs.writeFileSync(inventoryPath,JSON.stringify(inventory,null,2)+'\n');
fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
console.log(JSON.stringify({topics:topics.length,newGraphics:topics.length*modes.length,totalInventory:inventory.items.length,registeredMedia:registry.items.length}));
