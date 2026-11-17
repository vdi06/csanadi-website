/* Oldalakon át ismétlődő blokkazonosítók ütközésmentesítése, útvonal változása nélkül. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const structure=read('json/structure.json'),files=['oldalak/kezdolap.json'];
function walkMenu(nodes){for(const n of nodes||[]){files.push(n.path);walkMenu(n.children);}}
walkMenu(structure.nodes);
const pages=files.map(file=>({file,content:read('json/'+file)}));
const occurrences=new Map();
function traverse(node,visit,depth=0){if(depth>40||node==null||typeof node!=='object')return;
 if(Array.isArray(node)){for(const child of node)traverse(child,visit,depth+1);return;}
 if(typeof node.id==='string'&&node.id.startsWith('block:'))visit(node);
 for(const [key,value] of Object.entries(node))if(key!=='id')traverse(value,visit,depth+1);
}
for(const {file,content} of pages)traverse(content.blocks,block=>{
 const list=occurrences.get(block.id)||[];list.push({file,block});occurrences.set(block.id,list);
});
const oldIndex=read('json/oldalindex.json');
const changes=[];const changedFiles=new Set();const names=new Set(occurrences.keys());
for(const [id,list] of occurrences){if(list.length<2)continue;
 for(const {file,block} of list.slice(1)){
  const page=pages.find(x=>x.file===file).content;
  const suffix=page.id.replace('page:','p');let candidate=`${id}--${suffix}`,num=2;
  while(names.has(candidate))candidate=`${id}--${suffix}-${num++}`;
  names.add(candidate);block.id=candidate;changes.push({file:'json/'+file,from:id,to:candidate});changedFiles.add(file);
 }
}
const migrationPath=path.join(root,'dokumentacio/BLOKK_AZONOSITO_MIGRACIO_V1_39_8.json');
if(!changes.length&&fs.existsSync(migrationPath)){
 console.log(JSON.stringify({pages:pages.length,changedPages:0,renamedBlocks:0,alreadyMigrated:true}));
 process.exit(0);
}
for(const {file,content} of pages)if(changedFiles.has(file)){
 content.lifecycle.revision=(Number(content.lifecycle.revision)||1)+1;
 content.updatedAt='2026-11-17T18:00:00+01:00';
 fs.writeFileSync(path.join(root,'json',file),JSON.stringify(content,null,2)+'\n');
 if(oldIndex.pages[file])oldIndex.pages[file].lifecycle={...content.lifecycle};
}
fs.writeFileSync(path.join(root,'json/oldalindex.json'),JSON.stringify(oldIndex,null,2)+'\n');
const result={release:'1.39.8',pages:pages.length,changedPages:changedFiles.size,renamedBlocks:changes.length,
 unchangedRoutes:true,remainingGlobalConflicts:0,changes,
 note:'A blokkazonosítók változtak, az oldalazonosítók, URL-ek és a szöveges tartalom nem.'};
fs.writeFileSync(migrationPath,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({pages:pages.length,changedPages:result.changedPages,renamedBlocks:result.renamedBlocks}));
