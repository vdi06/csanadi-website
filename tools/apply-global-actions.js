/* Egyszeri stílusintegráció a külön megnyitható statikus segédoldalakhoz. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');let changed=[];
for(const name of fs.readdirSync(root).filter(x=>x.endsWith('.html')&&!['index.html','megkozelites-es-tanulas.html'].includes(x))){
 const file=path.join(root,name),before=fs.readFileSync(file,'utf8');
 if(before.includes('unified-actions-v1.css')||!before.includes('</head>'))continue;
 const after=before.replace('</head>','<link rel="stylesheet" href="css/unified-actions-v1.css?v=1.2.0">\n</head>');
 fs.writeFileSync(file,after);changed.push(name);
}
console.log(JSON.stringify(changed));
