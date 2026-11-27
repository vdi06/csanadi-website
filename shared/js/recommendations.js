/** Editorial relevance first, then centrally ranked institutional priorities. No random sampling. */
export function recommendationRoutes(config){
 return [...config.menu.items.flatMap(g=>g.children.map(p=>p.id)),...(config.pagePreview.localPages||[]).map(p=>p.id)];
}
export function recommendationTopics(config,id){
 return (config.pagePreview.catalog?.[id]||config.pagePreview.pages[id])?.contentMeta?.related ?? config.pagePreview.localPages?.find(p=>p.id===id)?.related;
}
export function validateRecommendations(config){
 const r=config.contentExpansion?.recommendations,ids=recommendationRoutes(config),all=new Set(ids);
 if(!r||r.schema!=='1.0'||r.topicCount!==3||r.priorityCount!==2||!Array.isArray(r.priorityOrder)||r.priorityOrder.length!==ids.length||new Set(r.priorityOrder).size!==ids.length||r.priorityOrder.some(id=>!all.has(id)))throw Error('Hibás oldalajánló fontossági sorrend.');
 for(const k of ['title','topic','priority','preview','topicDetail','priorityDetail'])if(typeof r.labels?.[k]!=='string'||!r.labels[k].trim())throw Error('Hiányzó oldalajánló felirat: '+k);
 for(const id of ids){const t=recommendationTopics(config,id);if(!Array.isArray(t)||t.length!==r.topicCount||new Set(t).size!==t.length||t.some(x=>x===id||!all.has(x)))throw Error('Hibás tematikus oldalajánló: '+id);}
 return r;
}
export function recommendPages(config,id){
 const r=config.contentExpansion.recommendations,topics=recommendationTopics(config,id);
 if(!topics)return {topic:[],priority:[]};
 const seen=new Set([id,...topics]);
 return {topic:[...topics],priority:r.priorityOrder.filter(x=>!seen.has(x)).slice(0,r.priorityCount)};
}
export function recommendationPreview(config,id){
 const local=config.pagePreview.localPages?.find(p=>p.id===id),raw=config.pagePreview.pages[local?.parentId||id]||config.pagePreview.catalog?.[local?.parentId||id];
 if(!raw)return null;
 const card=local?raw.items?.[local.cardIndex]:null;
 const title=local?.title||config.menu.items.flatMap(g=>g.children).find(p=>p.id===id)?.label;
 const activity=config.contentExpansion.activities?.[id];
 const highlights=[activity?.title,...(card?(card.groups||[]).map(g=>g.title):(local?.preview?.highlights||raw.highlights||(raw.items||[]).map(i=>i.title)))].filter(Boolean);
 return {title,intro:card?.summary||local?.preview?.summary||raw.intro,highlights:[...new Set(highlights)].slice(0,3)};
}
