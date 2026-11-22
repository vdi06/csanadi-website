/** Teljes forrásaudit: szintaxis, helyi importok, HTML/CSS és médiabinárisok. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const all=[];
function walk(dir){
 for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
  const relative=path.posix.join(dir,entry.name);
  if(entry.isDirectory())walk(relative);
  else if(entry.isFile())all.push(relative);
 }
}
for(const dir of ['assets','css','desktop','js','json','mobile','tools'])walk(dir);
const known=new Set([...all,'index.html','script.js','service-worker.js','offline.html']);
const existsResource=name=>known.has(name)||fs.existsSync(path.join(root,name));
const source=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const errors=[];
let checkedSyntax=0,checkedImports=0,checkedStyles=0,checkedMedia=0;
let checkedRoutes=0;

for(const file of all.filter(x=>/\.(?:js|mjs)$/.test(x)&&!x.includes('/vendor/'))){
 try{execFileSync(process.execPath,['--check',path.join(root,file)],{stdio:'pipe'});checkedSyntax++;}
 catch(error){errors.push(`${file}: hibás JavaScript szintaxis: ${error.stderr?.toString().slice(0,250)}`);}
 const js=source(file);
 const refs=[...js.matchAll(/\bfrom\s*['"](\.[^'"]+)['"]/g),
  ...js.matchAll(/\bimport\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g),
  ...js.matchAll(/\bimport\s*['"](\.[^'"]+)['"]/g),
  ...js.matchAll(/new\s+URL\(\s*['"](\.[^'"]+)['"]\s*,\s*import\.meta\.url\s*\)/g)];
 for(const match of refs){
  const name=match[1].split('?')[0].split('#')[0];
  const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),name));
  checkedImports++;
  if(!existsResource(resolved))errors.push(`${file}: nem létező helyi import: ${match[1]}`);
 }
}
for(const file of ['index.html','offline.html']){
 const html=source(file);
 const ids=[...html.matchAll(/\bid\s*=\s*["']([\w-]+)["']/g)].map(m=>m[1]);
 const repeated=ids.filter((id,index)=>ids.indexOf(id)!==index);
 if(repeated.length)errors.push(`${file}: ismétlődő statikus id: ${[...new Set(repeated)].join(', ')}`);
 for(const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)){
  const url=match[1].split('?')[0].split('#')[0];
  if(!url||url.startsWith('#')||/^(?:[a-z]+:|\/\/|data:)/i.test(url))continue;
  const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),url));
  if(!existsResource(resolved))errors.push(`${file}: nem létező HTML-erőforrás: ${match[1]}`);
 }
}
for(const file of all.filter(x=>x.endsWith('.css')&&!x.includes('/vendor/'))){
 const css=source(file);checkedStyles++;
 for(const match of css.matchAll(/url\(\s*['"]?(\.{1,2}\/[^)'"\s]+)['"]?\s*\)/g)){
  const url=match[1].split('?')[0].split('#')[0];
  const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),url));
  if(!existsResource(resolved))errors.push(`${file}: nem létező CSS-erőforrás: ${match[1]}`);
 }
}
for(const file of all.filter(x=>/\.(?:webp|png|jpe?g|pdf)$/i.test(x))){
 const header=fs.readFileSync(path.join(root,file)).subarray(0,12);checkedMedia++;
 if(file.endsWith('.webp')&&!(header.toString('ascii',0,4)==='RIFF'&&header.toString('ascii',8,12)==='WEBP'))errors.push(`${file}: hibás WebP fejléc`);
 if(file.endsWith('.png')&&header.toString('hex',0,8)!=='89504e470d0a1a0a')errors.push(`${file}: hibás PNG fejléc`);
 if(/\.jpe?g$/i.test(file)&&header.toString('hex',0,2)!=='ffd8')errors.push(`${file}: hibás JPEG fejléc`);
 if(file.endsWith('.pdf')&&header.toString('ascii',0,4)!=='%PDF')errors.push(`${file}: hibás PDF fejléc`);
}
const structure=JSON.parse(source('json/structure.json'));
const routeSet=new Set(['#/']);
const pages=[];
function scanPages(nodes){
 for(const node of nodes){
  const page=JSON.parse(source('json/'+node.path));pages.push({path:node.path,data:page});
  if(page.schemaExtensions?.route)routeSet.add(page.schemaExtensions.route);
  scanPages(node.children||[]);
 }
}
scanPages(structure.nodes||[]);
for(const {path:file,data} of pages){
 for(const route of JSON.stringify(data).match(/#\/[a-z0-9/\-]+/ig)||[]){
  checkedRoutes++;
  if(!routeSet.has(route)&&!route.endsWith('/')&&![...routeSet].some(known=>known.startsWith(route+'/')))
   errors.push(`json/${file}: nem létező oldalra mutató útvonal: ${route}`);
 }
}
assert.deepEqual(errors,[],`Forrásaudit hibái (${errors.length}):\n${errors.join('\n')}`);
console.log(`Teljes forrásaudit PASS: ${checkedSyntax} JavaScript szintaxis, ${checkedImports} helyi import, ${checkedStyles} CSS, ${checkedMedia} médiafejléc, ${pages.length} oldal és ${checkedRoutes} belső útvonalhivatkozás; két HTML egyedi ID és hivatkozás ellenőrizve`);
