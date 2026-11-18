/* V1.40.8: ügyféloldali, determinisztikus, személyes profil nélküli ajánlások. */
const words=value=>new Set(String(value||'').toLocaleLowerCase('hu-HU').split(/[^\p{L}\p{N}]+/u).filter(word=>word.length>=4));
const safeTags=value=>Array.isArray(value)?value.filter(x=>typeof x==='string').slice(0,30):[];
export function recommendRelatedEntries(seed,entries,{limit=4}={}){
 if(!seed||!Array.isArray(entries))return [];
 const count=Math.max(0,Math.min(8,Number.isInteger(limit)?limit:4));
 const sourceTags=new Set(safeTags(seed.tags).map(x=>x.toLocaleLowerCase('hu-HU'))),sourceWords=words(seed.title);
 return entries.filter(item=>item&&item.type==='page'&&!item.isSample&&item.href!==seed.href&&item.id!==seed.id)
  .map(item=>{
   let score=0;
   if(item.section&&item.section===seed.section)score+=7;
   for(const tag of safeTags(item.tags))if(sourceTags.has(tag.toLocaleLowerCase('hu-HU')))score+=5;
   for(const word of words(item.title))if(sourceWords.has(word))score+=2;
   if(score>0&&item.type===seed.type)score+=2;
   return {item,score};
  }).filter(candidate=>candidate.score>0)
  .sort((a,b)=>b.score-a.score||String(a.item.title).localeCompare(String(b.item.title),'hu-HU'))
  .slice(0,count).map(candidate=>candidate.item);
}
