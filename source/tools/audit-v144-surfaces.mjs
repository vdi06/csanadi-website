/** Csanádi 1.44: teljes helyi, nem destruktív audit – mobil + desktop. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const full=relative=>path.join(root,relative);
const exists=relative=>fs.existsSync(full(relative));
const readJson=relative=>JSON.parse(fs.readFileSync(full(relative),'utf8'));
const failures=[],warnings=[];
let jsonCount=0,sourceCount=0,mediaFiles=0,treeCount=0,mediaReferences=0;
function visit(relative,fn){
 for(const entry of fs.readdirSync(full(relative),{withFileTypes:true})){
  const name=path.posix.join(relative,entry.name);
  if(entry.isDirectory())visit(name,fn);
  else if(entry.isFile())fn(name);
 }
}
visit('json',name=>{
 if(!name.endsWith('.json'))return;
 try{readJson(name);jsonCount++;}
 catch(error){failures.push(`${name}: nem feldolgozható JSON – ${error.message}`);}
});

const structure=readJson('json/structure.json');
const indexed=readJson('json/page-index.json').pages;
const foundPaths=new Set();
function walk(nodes){for(const node of nodes){
 treeCount++;
 const filename='json/'+node.path;
 foundPaths.add(node.path);
 if(!exists(filename))failures.push('Hiányzó menüoldal: '+filename);
 if(!indexed[node.path])failures.push('Hiányzó indexbejegyzés: '+node.path);
 if(Array.isArray(node.children))walk(node.children);
}}
walk(structure.nodes);
for(const relative of Object.keys(indexed)){
 if(!exists('json/'+relative))failures.push('Hiányzó indexelt lap: json/'+relative);
 if(!foundPaths.has(relative))warnings.push('Indexelt, de a menüfában nem szereplő oldal: '+relative);
}
const media=readJson('json/media-library.json');
const mediaIds=new Set();
for(const item of media.items){
 if(mediaIds.has(item.id))failures.push('Ismétlődő médiaazonosító: '+item.id);
 mediaIds.add(item.id);
 for(const asset of [item.original,...(item.variants||[])]){
  if(!asset?.path)continue;
  mediaFiles++;
  if(!exists(asset.path)){failures.push('Hiányzó médiaállomány: '+asset.path);continue;}
  const bytes=fs.readFileSync(full(asset.path));
  if(asset.sizeBytes!==undefined&&asset.sizeBytes!==bytes.length)
   failures.push('Médiaméret-eltérés: '+asset.path);
  if(asset.sha256&&crypto.createHash('sha256').update(bytes).digest('hex')!==asset.sha256)
   failures.push('Média SHA-256 eltérés: '+asset.path);
 }
}
// A JSON-ban egész értékként tárolt médiaazonosítókat ellenőrizzük;
// az összefüggő szabad szöveget nem szabad téves riasztással kezelni.
function collectMedia(value,origin){
 if(typeof value==='string'){
  if(/^media:[\w/-]+$/i.test(value)){
   mediaReferences++;
   if(!mediaIds.has(value))failures.push('Ismeretlen médiaazonosító '+value+' itt: '+origin);
  }
 }else if(Array.isArray(value))for(const v of value)collectMedia(v,origin);
 else if(value&&typeof value==='object')for(const v of Object.values(value))collectMedia(v,origin);
}
visit('json/pages',name=>{if(name.endsWith('.json'))collectMedia(readJson(name),name)});
const html=fs.readFileSync(full('index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)){
 const source=match[1].split(/[?#]/)[0];
 if(!source||/^(?:https?:|data:|mailto:|tel:|\/|javascript:)/i.test(source))continue;
 if(!exists(source))failures.push('Hiányzó helyi HTML-hivatkozás: '+source);
}
for(const folder of ['js','mobile','desktop','tools'])visit(folder,name=>{
 if(!/\.(?:js|mjs)$/.test(name)||name.includes('js/vendor/'))return;
 sourceCount++;
 try{execFileSync(process.execPath,['--check',full(name)],{stdio:'pipe',timeout:20000});}
 catch(error){failures.push('JavaScript szintaktikai hiba: '+name);}
});
const findings={jsonCount,menuPages:treeCount,indexedPages:Object.keys(indexed).length,
 mediaAssetsChecked:mediaFiles,mediaReferences,sourceFilesSyntaxChecked:sourceCount,
 failures,warnings};
console.log(JSON.stringify(findings,null,2));
assert.equal(failures.length,0,`${failures.length} kötelező hivatkozás/integritás hiba`);
