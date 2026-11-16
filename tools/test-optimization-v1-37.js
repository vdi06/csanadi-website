/* A karbantartási kör mérhető, működéstartó gyorsításainak célzott tesztje. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const app=read('js/app.js'),search=read('js/search-j-2026.js');
const checks=[];
function check(name,fn){try{fn();checks.push({name,ok:true});}catch(error){checks.push({name,ok:false,error:error.message});}}
check('Szakasz-előfordulások lineáris számlálóval',()=>{
 assert.ok(app.includes('const seen=new Map();let last=null;'));
 assert.ok(app.includes('occurrence=(seen.get(key)||0)+1'));
 assert.ok(!app.includes('occurrence:oldHeadings.slice'));
});
check('Nem szükséges DOM-szakaszlekérdezés navigációkor',()=>{
 assert.ok(app.includes("const oldHeadings=options.keepScroll&&!isNew?[...app.querySelectorAll('.content-tiles h2')]:[]"));
});
check('Kibontott elemek egyszeri bejárással indexelődnek',()=>{
 assert.ok(app.includes('const nextById=new Map(),nextBySummary=new Map()'));
 assert.ok(app.includes('const matchingIds=nextById.get(saved.id)||[]'));
 assert.ok(app.includes('(nextBySummary.get(saved.summary)||[])[saved.occurrence-1]'));
});
check('Szinonimák oda-vissza indexe előre felépül',()=>{
 assert.ok(search.includes('const synonyms=Object.create(null)'));
 assert.ok(search.includes('(synonyms[alternative]??=[]).push(key)'));
 assert.ok(search.includes('const alternatives=synonyms[term]||[]'));
});
check('Ismételt fuzzy szótördelés helyett keresőindex',()=>{
 assert.ok(search.includes('entry.fuzzyWords=(entry.normalTitle'));
 assert.ok(search.includes('entry.fuzzyWords.some('));
});
check('Találatok közvetlenül, egyetlen szűrő-ciklusból',()=>{
 assert.ok(search.includes('for(const x of all){'));
 assert.ok(search.includes('if(points>=0)matches.push({x,score:points})'));
});
check('Keresési javaslat határolt bejárással és egy normalizálással',()=>{
 assert.ok(search.includes('function firstMatchingTitles(predicate,limit)'));
 assert.ok(search.includes('if(titles.length>=limit)break'));
 assert.ok(search.includes('const normalizedQuery=query.trim()?norm(query)'));
});

// Az eredeti, szinonima-visszakereső algoritmushoz viszonyított tiszta számítás.
const distanceCode=search.slice(search.indexOf('export function boundedDistance('),search.indexOf('function score(')).replace('export function ','function ');
const scoreCode=search.slice(search.indexOf('function score('),search.indexOf('export function setupSmartSearch('));
const oldScoreCode=scoreCode.replace('function score(','function legacyScore(')
 .replace('const alternatives=synonyms[term]||[];',
  'const alternatives=[...(synonyms[term]||[]),...Object.entries(synonyms).filter(([,values])=>values.includes(term)).map(([key])=>key)];')
 .replace('entry.fuzzyWords.some(',"(entry.normalTitle+' '+entry.normalTags).split(/[^a-z0-9]+/).filter(Boolean).some(");
const ctx=vm.createContext({});vm.runInContext(distanceCode+scoreCode+oldScoreCode,ctx);
const optimized=vm.runInContext('score',ctx),legacy=vm.runInContext('legacyScore',ctx);
const raw={felveteli:['beiratkozas','jelentkezes'],diaksport:['kosarlabda'],iskola:['intezmeny']};
for(let i=0;i<95;i++)raw['szo'+i]=['alternativa'+i];
const lookup=Object.create(null);
for(const [key,alternatives] of Object.entries(raw)){
 (lookup[key]??=[]).push(...alternatives);
 for(const alternative of alternatives)(lookup[alternative]??=[]).push(key);
}
const entries=Array.from({length:300},(_,i)=>{
 const title=i%5===0?'beiratkozas':i%5===1?'felveteli':i%5===2?'kosarlabda':i%5===3?'intezmeny':'masik hir';
 const normalTags=i%3===0?'diaksport':'sport';
 return {type:'page',href:i?'#/oktatas':'#/',normalTitle:title,normalTags,normalSection:'oktatas',normalSummary:'tanulmany ismert',normalBody:'reszletes leiras',fuzzyWords:(title+' '+normalTags).split(/[^a-z0-9]+/).filter(Boolean)};
});
const queries=['felveteli','beiratkozas','diaksport','kosarlabda','iskola','tanulmany','felvetel','ertekes','ismeretlen',''];
check('A szinonimák és elgépelések pontozása nem változott',()=>{
 for(const entry of entries)for(const query of queries){
  const tokens=query?[query]:[];
  assert.equal(optimized(entry,query,tokens,lookup,1,5),legacy(entry,query,tokens,raw,1,5),query+' / '+entry.normalTitle);
 }
});
let previousMs=0,currentMs=0;
check('Reprodukálható pontozási mikromérés',()=>{
 const measure=(fn,dict)=>{
  const started=performance.now();let checksum=0;
  for(let round=0;round<7;round++)for(const entry of entries)for(const term of queries){checksum+=fn(entry,term,term?[term]:[],dict,1,5);}
  return {ms:performance.now()-started,checksum};
 };
 const old=measure(legacy,raw),fresh=measure(optimized,lookup);
 assert.equal(fresh.checksum,old.checksum);
 previousMs=Math.round(old.ms*100)/100;currentMs=Math.round(fresh.ms*100)/100;
});
const failed=checks.filter(c=>!c.ok);
console.log(JSON.stringify({version:'1.37.0',passed:checks.length-failed.length,total:checks.length,failed,microbenchmarkMs:{legacy:previousMs,optimized:currentMs,speedup:currentMs?Math.round(previousMs/currentMs*100)/100:null}},null,2));
if(failed.length)process.exitCode=1;
