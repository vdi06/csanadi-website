/* Reprodukálható, olvasásalapú tartalom-/link-/média-/31-szabály audit. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const structure=JSON.parse(read('json/structure.json'));const records=[];
function visit(nodes){for(const n of nodes){const p=JSON.parse(read('json/'+n.path));records.push({entry:n,page:p,path:'json/'+n.path});if(n.children)visit(n.children);}}visit(structure.nodes);
const routes=new Set(records.map(({page})=>page.schemaExtensions?.route).filter(Boolean));
const problems=[];const media=[];let links=0,oldLinks=0,unverified=0;
function add(route,type,detail,severity='warning'){problems.push({route,type,detail,severity});}
for(const {entry,page,path:jsonPath} of records){
 const route=page.schemaExtensions?.route||entry.path,title=page.title||page.pageTitle||'';
 const source=JSON.stringify(page);const metadata=page.schemaExtensions||{};
 if(metadata.verifiedContent===false){unverified++;add(route,'content','Az intézményi tartalom nincs hitelesítettként jelölve.');}
 for(const match of source.matchAll(/https?:\/\/(?:www\.)?csanadi-bp\.edu\.hu[^\s"'<>]*/gi)){
  oldLinks++;add(route,'old-domain','Régi intézményi URL: '+match[0],'error');
 }
 for(const match of source.matchAll(/#\/[a-z0-9/-]+/gi)){
  links++;if(match[0]!=='#/'&&!routes.has(match[0]))add(route,'missing-route',match[0],'error');
 }
 if(!title)add(route,'missing-title',jsonPath);
}
for(const file of fs.readdirSync(root).filter(x=>x.endsWith('.html'))){
 const html=read(file);
 if(!html.includes('quality-polish-v1.css'))add(file,'missing-style','Hiányzó egységes megjelenési finomhangolás','error');
 for(const match of html.matchAll(/<a\b[^>]*href=["'](https?:\/\/(?:www\.)?csanadi-bp\.edu\.hu[^"']*)["']/gi)){
  oldLinks++;add(file,'old-domain',match[1],'error');
 }
 for(const match of html.matchAll(/<img\b[^>]*>/gi)){
  if(!/\balt\s*=/.test(match[0]))add(file,'missing-alt',match[0].slice(0,120));
 }
}
const csv=read('dokumentacio/ALOLDALAK_31_SZABALY_ELLENORZES.csv').replace(/^\uFEFF/,'').trim().split(/\r?\n/);
function fields(line){return [...line.matchAll(/"([^"]*)"(?:;|$)/g)].map(m=>m[1]);}
const columns=fields(csv[0]);const rows=csv.slice(1).map(fields),total={F:0,K:0,V:0,N:0,H:0};
const perPage=rows.map(row=>{const statuses=row.slice(5,36);const count={F:0,K:0,V:0,N:0,H:0};for(const value of statuses){if(value in count){count[value]++;total[value]++;}}return {route:row[0],title:row[1],verifiedContent:row[4],...count};});
const report={version:'1.3.0',checkedAt:new Date().toISOString(),pages:records.length,spaLinkReferences:links,oldDomainReferences:oldLinks,unverifiedContentPages:unverified,sourceBasedRuleStatuses:total,ruleColumns:columns.slice(5,36),perPage,problems,limitations:['A forráskód ellenőrzése nem helyettesíti a böngészős vizuális, működés- és akadálymentességi tesztet.','A 31 korábbi C döntés teljes szövegének hiányában a státuszok a korábban összeállított vizsgálati vázlatra vonatkoznak.','A szerkesztői tartalmak valódiságát, aktualitását és a médiajogokat emberi hitelesítés nélkül nem lehet igazolni.']};
fs.writeFileSync(path.join(root,'dokumentacio','TELJES_AUDIT_V1_3.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({pages:report.pages,spaLinkReferences:links,oldDomainReferences:oldLinks,unverifiedContentPages:unverified,ruleStatuses:total,problems:problems.length,errorCount:problems.filter(x=>x.severity==='error').length}));
if(problems.some(x=>x.severity==='error'))process.exitCode=1;
