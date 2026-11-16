/* Egyszeri tartalmi javítás: saját oldalra mutató Markdown-linkből sima szöveg lesz. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../json');
const structure=JSON.parse(fs.readFileSync(path.join(root,'structure.json'),'utf8'));
let files=0,links=0;
function visit(nodes){for(const node of nodes){
 const file=path.join(root,node.path),page=JSON.parse(fs.readFileSync(file,'utf8'));
 const route=page.schemaExtensions?.route;
 let count=0;
 function walk(value){
  if(typeof value==='string')return value.replace(/\[([^\]]+)\]\((#\/[a-z0-9/-]+)\)/gi,(full,label,url)=>{
   if(url!==route)return full;
   count++;return label;
  });
  if(Array.isArray(value))return value.map(walk);
  if(value&&typeof value==='object')for(const key of Object.keys(value)){
   if(key==='route')continue;
   value[key]=walk(value[key]);
  }
  return value;
 }
 walk(page);
 if(count){fs.writeFileSync(file,JSON.stringify(page,null,2)+'\n');files++;links+=count;}
 if(node.children)visit(node.children);
}}
visit(structure.nodes);
console.log(JSON.stringify({files,links}));
