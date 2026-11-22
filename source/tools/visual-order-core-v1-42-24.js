const copy=value=>JSON.parse(JSON.stringify(value));

export function findBlock(blocks,id){
 function seek(items,parentId=null){
  for(let index=0;index<items.length;index++){
   const block=items[index];
   if(block.id===id)return {block,items,index,parentId};
   if(Array.isArray(block.children)){
    const match=seek(block.children,block.id);
    if(match)return match;
   }
  }
  return null;
 }
 return seek(blocks);
}

export function reorderBlock(page,sourceId,targetId,placement='before'){
 if(!['before','after'].includes(placement))throw Error('Érvénytelen célpozíció.');
 if(sourceId===targetId)return null;
 const updated=copy(page),from=findBlock(updated.blocks,sourceId),to=findBlock(updated.blocks,targetId);
 if(!from||!to)throw Error('Az átrendezendő blokk nem található.');
 if(from.items!==to.items)throw Error('Csak azonos szülőhöz tartozó blokkok mozgathatók.');
 const oldIndex=from.index;
 const [item]=from.items.splice(oldIndex,1);
 const newTarget=from.items.findIndex(x=>x.id===targetId);
 from.items.splice(newTarget+(placement==='after'?1:0),0,item);
 const newIndex=from.items.findIndex(x=>x.id===sourceId);
 return newIndex===oldIndex?null:updated;
}

export function reorderItem(page,ownerId,sourceIndex,targetIndex,placement='before'){
 if(!['before','after'].includes(placement))throw Error('Érvénytelen célpozíció.');
 const updated=copy(page),owner=findBlock(updated.blocks,ownerId)?.block;
 if(!owner||!['cards','gallery','quick-links','home-editorial'].includes(owner.type)||!Array.isArray(owner.data?.items))throw Error('A kártyacsoport nem rendezhető.');
 const items=owner.data.items;
 if(!Number.isInteger(sourceIndex)||!Number.isInteger(targetIndex)||sourceIndex<0||targetIndex<0||sourceIndex>=items.length||targetIndex>=items.length)throw Error('Érvénytelen kártyapozíció.');
 if(sourceIndex===targetIndex)return null;
 const [item]=items.splice(sourceIndex,1);
 const adjusted=sourceIndex<targetIndex?targetIndex-1:targetIndex;
 items.splice(adjusted+(placement==='after'?1:0),0,item);
 return JSON.stringify(updated.blocks)===JSON.stringify(page.blocks)?null:updated;
}

export function siblingMove(page,blockId,direction){
 const found=findBlock(page.blocks,blockId);
 if(!found)return null;
 const target=found.items[found.index+(direction==='up'?-1:1)];
 if(!target)return null;
 return reorderBlock(page,blockId,target.id,direction==='up'?'before':'after');
}

export function itemMove(page,ownerId,index,direction){
 const owner=findBlock(page.blocks,ownerId)?.block;
 const length=owner?.data?.items?.length||0;
 const target=index+(direction==='up'?-1:1);
 if(target<0||target>=length)return null;
 return reorderItem(page,ownerId,index,target,direction==='up'?'before':'after');
}

export function restoreOriginalOrder(page,original){
 const updated=copy(page);
 const key=item=>item?.id||item?.mediaId||item?.href||item?.title||item?.label||JSON.stringify(item);
 const restoreItems=(current,baseline)=>{
  const rest=[...current],ordered=[];
  for(const expected of baseline){const found=rest.findIndex(item=>key(item)===key(expected));if(found>=0)ordered.push(...rest.splice(found,1));}
  return [...ordered,...rest];
 };
 const walk=(current,baseline)=>{
  const byId=new Map(baseline.map(block=>[block.id,block]));
  const rank=new Map(baseline.map((block,index)=>[block.id,index]));
  current.sort((a,b)=>(rank.get(a.id)??Number.MAX_SAFE_INTEGER)-(rank.get(b.id)??Number.MAX_SAFE_INTEGER));
  for(const block of current){
   const previous=byId.get(block.id);if(!previous)continue;
   if(Array.isArray(block.children)&&Array.isArray(previous.children))walk(block.children,previous.children);
   if(Array.isArray(block.data?.items)&&Array.isArray(previous.data?.items))block.data.items=restoreItems(block.data.items,previous.data.items);
  }
 };
 walk(updated.blocks,original.blocks);
 return JSON.stringify(updated.blocks)===JSON.stringify(page.blocks)?null:updated;
}
