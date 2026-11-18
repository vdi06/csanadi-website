/* 95+ CSS-kérés → 1 helyi CSS-kérés, az eredeti sorrend és médiafeltételek megtartásával. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const htmlFile=path.join(root,'index.html'),index=fs.readFileSync(htmlFile,'utf8');
const metaFile=path.join(root,'dokumentacio/CSS_FORRASJEGYZEK_V1_40_8.json');
const bundle='css/site-bundle-v1-40-8.css';
const markerStart='<!-- v1.40.8 CSS-forrásreferenciák (a tényleges CSS a bundle-ben van)';
const markerEnd='CSS-forrásreferenciák vége -->';
const withNoOldComment=index.replace(/<!-- v1\.40\.8 CSS-forrásreferenciák[\s\S]*?CSS-forrásreferenciák vége -->\n?/,'');
const rex=/<link\b[^>]*rel="stylesheet"[^>]*>/gi;
const local=/^((?:css|mobile|desktop)\/[a-z0-9/_-]+\.css)(\?[^" ]+)?$/i;
let links;
if(fs.existsSync(metaFile)){
 links=JSON.parse(fs.readFileSync(metaFile,'utf8')).sources;
 if(!Array.isArray(links)||links.length<50)throw Error('Hiányzó CSS-forrásjegyzék');
}else{
 links=[...withNoOldComment.matchAll(rex)].map(match=>{
  const tag=match[0],href=/href="([^"]+)"/.exec(tag)?.[1]||'',media=/\bmedia="([^"]+)"/.exec(tag)?.[1]||'';
  const found=local.exec(href);return found?{path:found[1],url:href,media,tag}:null;
 }).filter(Boolean);
 if(links.length<90)throw Error('A kiinduló HTML nem tartalmazza az összes eredeti stíluslapot.');
}
const css=[];
for(const link of links){
 if(!local.test(link.url)||link.path!==local.exec(link.url)[1])throw Error('Nem biztonságos CSS-útvonal: '+link.url);
 const source=path.join(root,link.path);
 const original=fs.readFileSync(source,'utf8');
 if(/^\s*@(?:import|charset)\b/m.test(original))throw Error('Nem egyesíthető CSS direktíva: '+link.path);
 const rewritten=original.replace(/url\(\s*(["']?)([^)"']+)\1\s*\)/g,(match,quote,url)=>{
  if(/^(?:data:|https?:|\/|#)/i.test(url))return match;
  const cut=url.search(/[?#]/),target=cut<0?url:url.slice(0,cut),suffix=cut<0?'':url.slice(cut);
  const from=path.posix.dirname(link.path),dest=path.posix.normalize(path.posix.join(from,target));
  const next=path.posix.relative('css',dest)+suffix;
  if(dest.startsWith('..')||dest.startsWith('/'))throw Error('Érvénytelen CSS háttérfájl: '+link.path);
  return `url(${quote}${next}${quote})`;
 });
 css.push(`/* START ${link.path} */\n${link.media?`@media ${link.media}{\n`:''}${rewritten}\n${link.media?'}\n':''}/* END ${link.path} */`);
}
const output=css.join('\n\n')+'\n';
fs.writeFileSync(path.join(root,bundle),output);
const checksum=crypto.createHash('sha256').update(output).digest('hex');
if(!fs.existsSync(metaFile))fs.writeFileSync(metaFile,JSON.stringify({release:'1.40.8',requestCountBefore:links.length,requestCountAfter:1,generatedFile:bundle,sha256:checksum,sources:links},null,2)+'\n');
const sources=[...new Set(links.map(x=>x.tag))];
const comment=markerStart+'\n'+sources.join('\n')+'\n'+markerEnd+'\n';
const matches=[...withNoOldComment.matchAll(rex)].filter(x=>local.test(/href="([^"]+)"/.exec(x[0])?.[1]||''));
let result=withNoOldComment;
if(matches.length){
 let first=true;
 result=result.replace(rex,tag=>{
  const href=/href="([^"]+)"/.exec(tag)?.[1]||'';
  if(!local.test(href))return tag;
  if(first){first=false;return comment+'  <link rel="stylesheet" href="'+bundle+'?v=1.40.8">';}
  return '';
 });
}else if(!result.includes(bundle))throw Error('Nincs csomagolt CSS-hivatkozás.');
else result=result.replace(new RegExp('(<link rel="stylesheet" href="'+bundle.replaceAll('.','\\.')+'\\?v=1\\.40\\.8">)'),comment+'$1');
if(result!==index)fs.writeFileSync(htmlFile,result);
console.log(JSON.stringify({localStylesBefore:links.length,localStylesAfter:1,bytes:Buffer.byteLength(output),sha256:checksum}));
