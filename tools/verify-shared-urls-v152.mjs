/** Az összes generált CSS url() és JSON-oldalváz helyi URL feloldása. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const errors=[];
let references=0,cssFiles=0;
const exists=relative=>fs.existsSync(path.join(root,relative));
const resolve=(from,href)=>{
 if(!href||/^(?:data:|blob:|https?:|\/\/|#|mailto:|tel:)/i.test(href)||href.includes('{'))return;
 const link=href.replace(/\?.*$/,'').replace(/#.*$/,'');
 if(!link||/[()]/.test(link)||link.startsWith('var('))return;
 const target=path.posix.normalize(path.posix.join(path.posix.dirname(from),link));
 references++;
 if(target.startsWith('../')||!exists(target))errors.push(`${from} → ${href} (${target})`);
};
const walkFiles=(directory)=>fs.readdirSync(path.join(root,directory),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walkFiles(directory+'/'+e.name):e.isFile()?[directory+'/'+e.name]:[]);
for(const branch of ['mobile','desktop']){
 assert.equal(exists(branch+'/assets'),false);
 assert.deepEqual(fs.readdirSync(path.join(root,branch,'json')).sort(),['site-shell.json']);
 for(const file of walkFiles(branch).filter(x=>x.endsWith('.css'))){
  cssFiles++;
  const content=fs.readFileSync(path.join(root,file),'utf8');
  for(const match of content.matchAll(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi))resolve(file,match[2]);
 }
 const file=branch+'/json/site-shell.json',shell=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
 const link=href=>{
  if(/^(?:https?:|\/\/|#|mailto:|tel:)/i.test(href))return;
  // Az oldalváz relatív URL-jét a branch gyökere felől kell feloldani.
  resolve(branch+'/index.html',href);
 };
 for(const record of [...shell.document.links,...shell.assets.stylesheets,...shell.assets.scripts]){
  const href=record.href||record.src;if(href)link(href);
 }
 const traverse=node=>{
  if(Array.isArray(node)){node.forEach(traverse);return;}
  if(!node||typeof node!=='object')return;
  for(const [key,val] of Object.entries(node)){
   if(['href','src'].includes(key)&&typeof val==='string')link(val);
   else if(typeof val==='object')traverse(val);
  }
 };
 traverse(shell.body);
}
assert.deepEqual(errors,[],'Törött helyi URL hivatkozások: '+errors.slice(0,20).join('\n'));
console.log(`1.53 URL-gráf PASS: ${cssFiles} CSS, ${references} helyi URL, 0 hiányzó fájl, shared/ egyetlen futásidejű médiatárral.`);
