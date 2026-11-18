/* v1.40.9 – privát, csak közzétett, több tartalomtípusú ajánlások.
 * Nem használ böngészési előzményt, profilozást vagy külső szolgáltatást. */
const TYPES=new Set(['page','news','event','document']);
const tokens=value=>new Set(String(value||'').toLocaleLowerCase('hu-HU').split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>=4));
const tags=value=>Array.isArray(value)?value.filter(x=>typeof x==='string').slice(0,30):[];
const key=item=>`${String(item.type)}|${String(item.id||'')}|${String(item.href||'')}`;
const eligible=item=>item&&TYPES.has(item.type)&&!item.isSample&&item.verified!==false&&item.published!==false&&typeof item.title==='string'&&item.title.trim()&&typeof item.href==='string'&&item.href.trim();
export function validateEditorialRules(rules,entries){
 const problems=[],allowed=new Map((entries||[]).filter(eligible).map(item=>[String(item.type)+':'+String(item.id),item]));
 const seen=new Set(),valid=[];
 for(const [index,rule] of (Array.isArray(rules)?rules:[]).entries()){
  const source=String(rule?.sourceType)+':'+String(rule?.sourceId),target=String(rule?.targetType)+':'+String(rule?.targetId),name=`${index+1}. szabály`;
  if(rule?.approved!==true){problems.push(name+': hiányzó szerkesztői jóváhagyás');continue;}
  if(!['boost','suppress'].includes(rule?.action)){problems.push(name+': ismeretlen művelet');continue;}
  if(!allowed.has(source)||!allowed.has(target)||source===target){problems.push(name+': érvénytelen vagy nem közzétett forrás/cél');continue;}
  const identity=source+'→'+target;
  if(seen.has(identity)){problems.push(name+': duplikált vagy ellentmondó szerkesztői kapcsolat');continue;}seen.add(identity);
  if(rule.action==='boost'&&(!Number.isInteger(rule.priority)||rule.priority<1||rule.priority>20)){problems.push(name+': 1–20 prioritás szükséges');continue;}
  valid.push({...rule,source,target});
 }
 return {valid,problems,publicationPerformed:false};
}

export function recommendRelatedContent(seed,entries,{limit=6,perType=2,curationRules=[]}={}){
 if(!eligible(seed)||!Array.isArray(entries))return [];
 const max=Math.max(0,Math.min(12,Number.isInteger(limit)?limit:6));
 const typeLimit=Math.max(1,Math.min(6,Number.isInteger(perType)?perType:2));
 const sourceTags=new Set(tags(seed.tags).map(x=>x.toLocaleLowerCase('hu-HU')));
 const sourceWords=tokens([seed.title,seed.summary].filter(Boolean).join(' '));
 const sourceKey=String(seed.type)+':'+String(seed.id);
 const approvedRules=validateEditorialRules(curationRules,entries).valid.filter(x=>x.source===sourceKey);
 const suppressed=new Set(approvedRules.filter(x=>x.action==='suppress').map(x=>x.target));
 const promoted=new Map(approvedRules.filter(x=>x.action==='boost').map(x=>[x.target,x.priority]));
 const candidates=entries.filter(eligible).filter(x=>key(x)!==key(seed)&&x.id!==seed.id).map(item=>{
  const targetKey=String(item.type)+':'+String(item.id);
  if(suppressed.has(targetKey))return {item,score:0};
  let score=0;
  if(item.section&&item.section===seed.section)score+=6;
  for(const tag of tags(item.tags))if(sourceTags.has(tag.toLocaleLowerCase('hu-HU')))score+=8;
  for(const word of tokens([item.title,item.summary].filter(Boolean).join(' ')))if(sourceWords.has(word))score+=2;
  if(score>0&&item.type!==seed.type)score+=2; // többféle releváns forrás előnyt kap
  if(promoted.has(targetKey))score+=30+promoted.get(targetKey)*4;
  return {item,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||String(a.item.title).localeCompare(String(b.item.title),'hu-HU')||key(a.item).localeCompare(key(b.item)));
 const selected=[],counts=new Map(),seen=new Set();
 for(const {item} of candidates){
  if(selected.length===max)break;
  const count=counts.get(item.type)||0;
  if(count>=typeLimit||seen.has(key(item)))continue;
  selected.push(item);counts.set(item.type,count+1);seen.add(key(item));
 }
 return selected;
}
