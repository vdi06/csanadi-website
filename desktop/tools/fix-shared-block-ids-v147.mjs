/** Egyszeri, idempotens migráció: a 15 eltérő tartalmú szerkesztői blokk azonosítója. */
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const indexPath=path.join(root,'json/page-index.json');
const index=JSON.parse(fs.readFileSync(indexPath,'utf8'));
const duplicateNames=new Set([
 'block:editorial-guide-20261119',
 'block:editorial-guide-text-20261119'
]);
let changedPages=0,changedBlocks=0;
for(const [relative,entry] of Object.entries(index.pages)){
 const sourcePath=path.join(root,'json',relative),page=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
 const suffix='-p'+page.id.replace(/^page:/,'');
 let count=0;
 function rewriteBlock(block){
  if(duplicateNames.has(block.id)){block.id+=suffix;count++}
  for(const child of block.children||[])rewriteBlock(child);
 }
 for(const block of page.blocks||[])rewriteBlock(block);
 if(!count)continue;
 const pageChanges=count;
 // Az oldal-JSON és a keresőindex blokkleírása ugyanazt az új ID-t kapja.
 for(const block of entry.blocks||[])rewriteBlock(block);
 fs.writeFileSync(sourcePath,JSON.stringify(page,null,2)+'\n');
 changedPages++;changedBlocks+=pageChanges;
}
if(changedPages)fs.writeFileSync(indexPath,JSON.stringify(index,null,2)+'\n');
console.log(`${changedPages} oldal, ${changedBlocks} blokkazonosító korrigálva`);
