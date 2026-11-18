/* Reprodukálható offline mérleg. Nem állítunk valódi LCP/INP/CLS mérés nélkül PageSpeed-eredményt. */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const cssMap=JSON.parse(fs.readFileSync(path.join(root,'dokumentacio/CSS_FORRASJEGYZEK_V1_40_8.json')));
const bundle=fs.readFileSync(path.join(root,cssMap.generatedFile));
const linked=[...index.replace(/<!--[\s\S]*?-->/g,'').matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)].map(x=>x[0]);
const local=linked.filter(x=>/href="(?:css|mobile|desktop)\//.test(x));
if(local.length!==1||!local[0].includes(cssMap.generatedFile))throw Error('Nem pontosan egy helyi stíluscsomag töltődik be.');
if(!linked.some(x=>x.includes('bootstrap@5.3.9')))throw Error('Hiányzik a verziózott Bootstrap CDN.');
const all=cssMap.sources.map(x=>fs.readFileSync(path.join(root,x.path)));
const total=all.reduce((sum,x)=>sum+x.byteLength,0);
const media=JSON.parse(fs.readFileSync(path.join(root,'json/mediatar.json'),'utf8'));
const images=media.items.filter(item=>item.kind==='image');
const largest=images.map(x=>({id:x.id,bytes:x.original?.sizeBytes||0,width:x.original?.width||0})).sort((a,b)=>b.bytes-a.bytes).slice(0,12);
const report={release:'1.40.8',type:'offline-artifact-audit',notMeasured:['LCP','INP','CLS','Lighthouse','physicalMobile'],
 css:{originalLocalRequests:cssMap.requestCountBefore,currentLocalRequests:local.length,requestsEliminated:cssMap.requestCountBefore-local.length,sourceBytes:total,bundleBytes:bundle.length,gzipEstimateBytes:zlib.gzipSync(bundle,{level:9}).length,mediaQueriesPreserved:cssMap.sources.filter(x=>x.media).length},
 bootstrap:'Pinned CDN bootstrap@5.3.9',imageVariants:{registryItems:media.items.length,imageItems:images.length,largestOriginals:largest},
 warnings:[
 'A CSS-kérések összevonása tényleges hálózati kéréscsökkenést eredményez; a megjelenés megőrzését automatizált forrás-/sorrendteszt és lehetőség szerint valós böngészős vizsgálat követi.',
 'A teljesítmény célértékeit valódi eszközön vagy elérhető staging oldalon kell mérni; az offline gzip-becslés nem hálózati átviteli mérés.',
 'A service worker online no-store viselkedése korábbi adatfrissességi döntés, emiatt itt nem változott meg.'
 ]};
fs.writeFileSync(path.join(root,'dokumentacio/TELJESITMENY_AUDIT_V1_40_8.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({oldCss:cssMap.requestCountBefore,newCss:local.length,compressedBytes:report.css.gzipEstimateBytes,realBrowserMetrics:false}));
