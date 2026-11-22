/* v1.40.6 – keresési kiemelések, stabil rendezés és pontos duplikációszűrés.
   A döntések a json/config.json keresési szabályaiból származnak. */
const route=/^#\/[a-z0-9/-]*$/;
export function validFeaturedRoutes(definitions){
 const result=Object.create(null);
 for(const [query,path] of Object.entries(definitions||{})){
  if(typeof query!=='string'||!query.trim()||typeof path!=='string'||!route.test(path))continue;
  result[query.trim()]=path;
 }
 return result;
}
export function isFeaturedHit(entry,tokens,featured,norm){
 if(entry?.type!=='page'||!route.test(String(entry.href||'')))return false;
 return tokens.some(term=>Object.entries(featured).some(([query,href])=>norm(query)===term&&entry.href===href));
}
export function uniqueSearchEntries(entries){
 const seen=new Set(),result=[];
 for(const entry of entries){
  const key=[entry.type,String(entry.id||''),String(entry.href||''),String(entry.title||'')].join('\u001f');
  if(seen.has(key))continue;seen.add(key);result.push(entry);
 }
 return result;
}
export function sortSearchHits(hits,order='relevance'){
 const sorted=hits.slice();
 const title=(a,b)=>a.x.title.localeCompare(b.x.title,'hu');
 if(order==='title-asc')return sorted.sort(title);
 if(order==='title-desc')return sorted.sort((a,b)=>title(b,a));
 return sorted.sort((a,b)=>b.score-a.score||title(a,b));
}
