import {formatBytes as size} from '../js/format-bytes.js?v=20261115r19';
const id=name=>document.getElementById(name);
let current=null,config=null,report=null;
const text=(tag,value)=>{const el=document.createElement(tag);el.textContent=String(value);return el;};
const output=(container,title,detail,severity='ok')=>{const node=document.createElement('article');node.dataset.severity=severity;node.append(text('strong',title),text('p',detail));container.append(node);};
const load=async path=>{const start=performance.now(),response=await fetch(path,{cache:'no-store'});if(!response.ok)throw Error(`${path}: HTTP ${response.status}`);return {data:await response.json(),ms:Math.round(performance.now()-start)};};
const isManifest=data=>data&&typeof data==='object'&&typeof data.release==='string'&&data.files&&typeof data.files==='object'&&Object.values(data.files).every(entry=>Number.isFinite(entry.sizeBytes)&&/^[a-f0-9]{64}$/.test(entry.sha256));
function compare(old){const previous=old.files,now=current.files;const names=new Set([...Object.keys(previous),...Object.keys(now)]),changed=[];let totalDelta=0;
 for(const name of names){const a=previous[name],b=now[name];if(a?.sha256===b?.sha256)continue;const state=!a?'új':!b?'törölt':'módosult';changed.push({name,state,oldBytes:a?.sizeBytes||0,newBytes:b?.sizeBytes||0});totalDelta+=(b?.sizeBytes||0)-(a?.sizeBytes||0);}
 const destination=id('diff');destination.replaceChildren();output(destination,`${old.release} → ${current.release}`,`${changed.length} eltérés · méretváltozás: ${totalDelta>0?'+':''}${size(Math.abs(totalDelta))}${totalDelta<0?' csökkenés':''}. Visszaállításhoz a régi ZIP összes fájlját külön meg kell őrizni.`);
 const cap=config.runtime.tools.releaseDiffMaximumRows;for(const entry of changed.slice(0,cap))output(destination,`${entry.state}: ${entry.name}`,`${size(entry.oldBytes)} → ${size(entry.newBytes)}`,'warning');
 if(changed.length>cap)output(destination,'Megjelenítési korlát',`${changed.length-cap} további eltérés a JSON-jelentésben.`,'warning');
 report.comparison={from:old.release,to:current.release,totalDeltaBytes:totalDelta,changed};id('save').disabled=false;
}
function luminance(value){const a=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
const ratio=(a,b)=>{if(!/^#[a-f0-9]{6}$/i.test(a)||!/^#[a-f0-9]{6}$/i.test(b))return null;const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
async function audit(){const results=[],container=id('audit');container.replaceChildren();
 for(const theme of ['light','dark']){const colors=config.theme[theme+'Colors'],target=config.runtime.tools.minimumTextContrast;for(const surface of ['page','card']){const value=ratio(colors.ink,colors[surface]);results.push({check:`${theme} / ${surface} kontraszt`,passed:value>=target,detail:`${value?.toFixed(2)||'nem mérhető'}:1 (minimum: ${target}:1)`});}}
 try{const response=await fetch('../index.html',{cache:'no-store'});if(!response.ok)throw Error('A kezdőoldal HTTP-hibát adott');const doc=new DOMParser().parseFromString(await response.text(),'text/html');
  results.push({check:'Magyar nyelv',passed:doc.documentElement.lang==='hu',detail:doc.documentElement.lang||'hiányzik'});
  results.push({check:'Tartalomátugró',passed:!!doc.querySelector('a[href="#app"].skip-link'),detail:'Billentyűzetes gyorshivatkozás'});
  const images=[...doc.querySelectorAll('img')],badImages=images.filter(image=>!image.hasAttribute('alt'));results.push({check:'Képek alt attribútuma',passed:badImages.length===0,detail:`${images.length} kép, ${badImages.length} hiány`});
  const buttons=[...doc.querySelectorAll('button')],badButtons=buttons.filter(btn=>!(btn.getAttribute('aria-label')||btn.getAttribute('title')||btn.textContent).trim());results.push({check:'Gombok hozzáférhető neve',passed:badButtons.length===0,detail:`${buttons.length} gomb, ${badButtons.length} hiány`});
  results.push({check:'Mobil navigáció ikonrendszere',passed:!!doc.querySelector('#mobile-navigation')&&!!doc.querySelector('#site-map-overlay')&&!!doc.querySelector('#search-panel'),detail:'A tényleges 3 elem és működés külön készülékes vizsgálatot igényel.'});
 }catch(error){results.push({check:'HTML letöltése',passed:false,detail:error.message});}
 for(const item of results)output(container,item.passed?'✓ '+item.check:'! '+item.check,item.detail,item.passed?'ok':'warning');report.accessibility=results;
}
async function run(){for(const name of ['stats','files','diff','audit'])id(name).replaceChildren();id('save').disabled=true;try{
 const [manifest,configuration]=await Promise.all([load('../release-manifest.json'),load('../json/config.json')]);current=manifest.data;config=configuration.data;if(!isManifest(current))throw Error('Hibás manifest-séma');
 const rows=Object.entries(current.files).map(([name,meta])=>({name,...meta})).sort((a,b)=>b.sizeBytes-a.sizeBytes),bytes=rows.reduce((total,row)=>total+row.sizeBytes,0),media=rows.filter(row=>/\.(?:webp|png|jpg|jpeg|svg|gif|mp4|webm|avif|pdf)$/i.test(row.name));
 const categories={};for(const item of rows){const extension=item.name.split('.').pop().toLowerCase();categories[extension]=(categories[extension]||0)+item.sizeBytes;}
 for(const [caption,value] of [['Kiadás',current.release],['Fájlok',rows.length],['Teljes méret',size(bytes)],['Média és PDF',size(media.reduce((sum,row)=>sum+row.sizeBytes,0))],['Manifest betöltése',manifest.ms+' ms'],['JSON betöltése',configuration.ms+' ms']]){const card=document.createElement('article');card.append(text('strong',value),text('span',caption));id('stats').append(card);}
 const warnings=rows.filter(row=>/\.(?:webp|png|jpg|jpeg|svg|gif|mp4|webm|avif)$/i.test(row.name)&&row.sizeBytes>config.runtime.tools.mediaWarningThresholdBytes);
 output(id('files'),'Méreteloszlás fájltípus szerint',Object.entries(categories).sort((a,b)=>b[1]-a[1]).map(([ext,count])=>`${ext.toUpperCase()}: ${size(count)}`).join(' · '));
 output(id('files'),'Nagy médiák optimalizálási jelöltjei',`${warnings.length} állomány nagyobb, mint a központi ${size(config.runtime.tools.mediaWarningThresholdBytes)} küszöb; a jelentés tartalmazza mindet.`,'warning');
 for(const row of rows.slice(0,config.runtime.tools.mediaReportTopEntries))output(id('files'),row.name,size(row.sizeBytes),row.sizeBytes>config.runtime.tools.mediaWarningThresholdBytes?'warning':'ok');
 report={createdAt:new Date().toISOString(),release:current.release,fileCount:rows.length,totalBytes:bytes,manifestLoadMs:manifest.ms,configLoadMs:configuration.ms,extensionBytes:categories,oversizeMedia:warnings};await audit();id('save').disabled=false;
 }catch(error){output(id('files'),'Az elemzés sikertelen',error.message,'error');}}
id('run').addEventListener('click',run);
id('old').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{if(!current)await run();if(!current)throw Error('Előbb töltsd be az aktuális manifestet');const old=JSON.parse(await file.text());if(!isManifest(old))throw Error('Nem érvényes korábbi kiadási manifest');compare(old);}catch(error){output(id('diff'),'Összehasonlítás sikertelen',error.message,'error');}event.target.value='';});
id('save').addEventListener('click',()=>{if(!report)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)+'\n'],{type:'application/json;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='kiadas_meres_forras.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);});
run();
