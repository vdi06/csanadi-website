/* V1.3.0 kiadás statikus, reprodukálható vizsgálata. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const failures=[];let jsons=0,allJs=0;const pages=[];
function scan(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,item.name);if(item.isDirectory()){scan(file);continue;}
 if(item.name.endsWith('.json')){try{JSON.parse(fs.readFileSync(file,'utf8'));jsons++;}catch(e){failures.push('JSON: '+path.relative(root,file)+' '+e.message);}}
 if(item.name.endsWith('.js')){try{cp.execFileSync('node',['--check',file],{stdio:'pipe'});allJs++;}catch{failures.push('JavaScript-szintaxis: '+path.relative(root,file));}}
}}
scan(path.join(root,'json'));scan(path.join(root,'js'));scan(path.join(root,'mobile'));scan(path.join(root,'desktop'));
for(const name of ['script.js','service-worker.js','js/round13-network.js','js/round26-arrival.js']){
 try{cp.execFileSync('node',['--check',path.join(root,name)],{stdio:'pipe'});allJs++;}catch{failures.push('JavaScript-szintaxis: '+name);}
}
const config=JSON.parse(read('json/config.json'));
const html=read('index.html'),arrival=read('megkozelites-es-tanulas.html');
const network=html.match(/round13-network\.js\?v=([^"']+)/)?.[1];
if(config.performance.cacheVersion!==network)failures.push('Eltérő verziójelző: '+config.performance.cacheVersion+' / '+network);
if(!read('js/round13-network.js').includes('dismissTimer'))failures.push('Hiányzó automatikus értesítés-elrejtés');
if(!html.includes('unified-actions-v1.css'))failures.push('A főoldalon hiányzik az egységes gombstílus');
for(const page of fs.readdirSync(root).filter(x=>x.endsWith('.html')))if(!read(page).includes('unified-actions-v1.css'))failures.push('A gombstílus hiányzik: '+page);
for(const page of fs.readdirSync(root).filter(x=>x.endsWith('.html')))if(!read(page).includes('quality-polish-v1.css'))failures.push('A teljes oldali finomhangolás hiányzik: '+page);
const ids=[...new Set([...read('js/round26-arrival.js').matchAll(/\$\('([^']+)'\)/g)].map(x=>x[1]))];
const missingIds=ids.filter(id=>!arrival.includes('id="'+id+'"'));
if(missingIds.length)failures.push('A térképes oldal hiányzó vezérlői: '+missingIds.join(','));
for(const id of ['terkep','felveteli','celok','merfoldko','diakmedia','fogadora','modszerek','akadalymentes','zoldut','valtozasok'])if(!arrival.includes('id="'+id+'"'))failures.push('Hiányzó tartalmi modul: '+id);
if(arrival.includes('r23-jump')||arrival.includes('Vissza a kezdőlapra')||arrival.includes('Vissza a térképhez'))failures.push('Korábban tiltott ugró-/visszalink az új oldalon');
if(!arrival.includes('id="r26-map-load"')||!arrival.includes('id="r26-map-consent"'))failures.push('Nincs beleegyezéses térképbetöltés');
if(/href=["']https?:\/\/(?:www\.)?csanadi-bp\.edu\.hu/i.test(arrival))failures.push('Régi domaines kattintható hivatkozás a térképes oldalon');
const struct=JSON.parse(read('json/structure.json'));
function visit(nodes){for(const n of nodes){const p=JSON.parse(read('json/'+n.path));pages.push(p);if(n.children)visit(n.children);}}
visit(struct.nodes);
const routes=new Set(pages.map(p=>p.schemaExtensions?.route));
for(const p of pages)for(const m of JSON.stringify(p).matchAll(/#\/[a-z0-9/-]+/gi))if(m[0]!=='#/'&&!routes.has(m[0]))failures.push('Hiányzó SPA-útvonal: '+m[0]);
const result={version:'1.3.0',checkedAt:new Date().toISOString(),jsonFiles:jsons,jsSyntaxChecks:allJs,spaPages:pages.length,arrivalControllers:ids.length,missingArrivalControllers:missingIds,failures,passed:failures.length===0,limitations:['A tényleges böngészős vizuális tesztet a futtatási környezetben nem sikerült elvégezni.','A dinamikus szolgáltatások és a valós térkép külső hálózati működése külön böngészős ellenőrzést igényel.']};
fs.writeFileSync(path.join(root,'dokumentacio','AUTOMATIKUS_TESZT_V1_3.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
