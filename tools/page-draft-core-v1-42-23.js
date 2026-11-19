const STORE_KEY='csanadi-c1-page-drafts-v1';
const SCHEMA=1;
const KEEP_MS=60*24*60*60*1000;
const BLOCK_TYPES=new Set(['section','markdown','accordion','cards','card','image','gallery','hero','sports-successes','live-dashboard','quick-links','home-editorial']);
const copy=value=>JSON.parse(JSON.stringify(value));
const identifier=/^block:[A-Za-z0-9][A-Za-z0-9:_-]{2,120}$/;
const pagePath=/^json\/pages\/[a-z0-9/_-]+\.json$/;

export function sourceSignature(page){
 return [page.id,page.schemaExtensions?.route,page.lifecycle?.revision,page.updatedAt].join('|');
}

export function validateEditablePage(original,edited){
 if(!original||!edited||Array.isArray(edited)||typeof edited!=='object')throw Error('Hiányzó oldaltervezet.');
 const stable=value=>{const result=copy(value);delete result.title;delete result.menuLabel;delete result.summary;delete result.blocks;delete result.updatedAt;if(result.lifecycle)delete result.lifecycle.revision;return result;};
 if(JSON.stringify(stable(original))!==JSON.stringify(stable(edited)))throw Error('Védett oldalazonosító, útvonal vagy metaadat módosult.');
 for(const [key,min,max] of [['title',3,200],['menuLabel',2,120],['summary',0,3000]]){
  const value=edited[key];if(typeof value!=='string'||value.trim().length<min||value.length>max)throw Error('Érvénytelen szövegmező: '+key);
 }
 if(!Array.isArray(edited.blocks)||edited.blocks.length>200)throw Error('A tartalmi blokkok száma nem lehet több 200-nál.');
 if(!Number.isInteger(edited.lifecycle?.revision)||edited.lifecycle.revision<original.lifecycle.revision||edited.lifecycle.revision>original.lifecycle.revision+1)throw Error('Érvénytelen tartalomverzió.');
 const ids=new Set();let count=0;
 const check=(blocks,depth)=>{
  if(depth>12)throw Error('A tartalmi blokkok túl mélyen vannak egymásba ágyazva.');
  for(const block of blocks){
   if(!block||Array.isArray(block)||typeof block!=='object'||!identifier.test(block.id||'')||!BLOCK_TYPES.has(block.type)||ids.has(block.id))throw Error('Hibás, ismeretlen vagy ismétlődő blokkazonosító / blokktípus.');
   if(++count>1000)throw Error('Túl sok tartalmi blokk.');
   ids.add(block.id);
   if(Object.hasOwn(block,'__proto__')||Object.hasOwn(block,'constructor')||Object.hasOwn(block,'prototype'))throw Error('Nem megengedett blokkmező.');
   if(block.children!==undefined){if(!Array.isArray(block.children))throw Error('A children mezőnek tömbnek kell lennie.');check(block.children,depth+1);}
   if(block.title!==undefined&&(typeof block.title!=='string'||block.title.length>250))throw Error('Érvénytelen blokkcím.');
   if(block.type==='markdown'&&typeof block.data?.text!=='string')throw Error('A szövegblokkhoz Markdown-szöveg szükséges.');
  }
 };
 check(edited.blocks,1);
 if(JSON.stringify(edited).length>650000)throw Error('Az oldaltervezet túl nagy a biztonságos helyi mentéshez.');
 return true;
}

export function sameContent(original,page){
 return original.title===page.title&&original.menuLabel===page.menuLabel&&original.summary===page.summary&&JSON.stringify(original.blocks)===JSON.stringify(page.blocks);
}

export function editedPage(original,fields,blocks,now=new Date()){
 const result=copy(original);
 result.title=String(fields.title??'').trim();
 result.menuLabel=String(fields.menuLabel??'').trim();
 result.summary=String(fields.summary??'').trim();
 result.blocks=copy(blocks);
 result.updatedAt=now.toISOString();
 result.lifecycle.revision=Number(original.lifecycle.revision)+1;
 validateEditablePage(original,result);
 return result;
}

export class PageHistory{
 constructor(initial,limit=35){this.current=copy(initial);this.past=[];this.future=[];this.limit=limit;}
 commit(page){
  if(JSON.stringify(this.current)===JSON.stringify(page))return false;
  this.past.push(copy(this.current));if(this.past.length>this.limit)this.past.shift();
  this.current=copy(page);this.future=[];return true;
 }
 undo(){if(!this.past.length)return null;this.future.push(copy(this.current));this.current=this.past.pop();return copy(this.current);}
 redo(){if(!this.future.length)return null;this.past.push(copy(this.current));this.current=this.future.pop();return copy(this.current);}
}

function storageKey(release){
 if(!/^csanadi-website-v\d+\.\d+\.\d+$/.test(release))throw Error('Érvénytelen kiadásazonosító.');
 return STORE_KEY+'-'+release;
}

function readStore(storage,release){
 const raw=storage?.getItem(storageKey(release));
 if(!raw)return {schema:SCHEMA,release,records:{}};
 if(raw.length>8_000_000)throw Error('A helyi tervezettár mérete túl nagy.');
 const value=JSON.parse(raw);
 if(value?.schema!==SCHEMA||value.release!==release||!value.records||Array.isArray(value.records)||typeof value.records!=='object')throw Error('A helyi tervezettár szerkezete érvénytelen.');
 return value;
}

export function listSavedDrafts(storage,release,now=Date.now()){
 const data=readStore(storage,release);
 return Object.entries(data.records).filter(([path,entry])=>pagePath.test(path)&&entry&&Number.isFinite(entry.savedAt)&&entry.savedAt<=now&&entry.savedAt>now-KEEP_MS).slice(0,79).map(([path,entry])=>({path,...copy(entry)}));
}

export function savePageDraft(storage,release,path,original,page,now=Date.now()){
 if(!pagePath.test(path))throw Error('Nem támogatott oldalútvonal.');
 validateEditablePage(original,page);
 const current=readStore(storage,release);
 const records=current.records;
 for(const [oldPath,item] of Object.entries(records))if(!pagePath.test(oldPath)||!item||!Number.isFinite(item.savedAt)||item.savedAt<now-KEEP_MS)delete records[oldPath];
 records[path]={source:sourceSignature(original),savedAt:now,page:copy(page)};
 if(Object.keys(records).length>79)throw Error('Túl sok helyi tervezet.');
 storage.setItem(storageKey(release),JSON.stringify({schema:SCHEMA,release,records}));
}

export function deletePageDraft(storage,release,path){
 const current=readStore(storage,release);
 delete current.records[path];storage.removeItem(storageKey(release));
 if(Object.keys(current.records).length)storage.setItem(storageKey(release),JSON.stringify(current));
}

export function clearPageDrafts(storage,release){
 readStore(storage,release);storage.removeItem(storageKey(release));
}

export function restorePageDraft(original,record){
 if(!record||record.source!==sourceSignature(original))throw Error('A tervezet más forrásverzióhoz tartozik.');
 validateEditablePage(original,record.page);
 return copy(record.page);
}

export function newContentBlock(kind,title,text,existing=[]){
 if(!['section','markdown'].includes(kind))throw Error('Nem támogatott új blokktípus.');
 if(typeof text!=='string'||!text.trim()||text.length>30000)throw Error('Az új blokk szövege nem lehet üres vagy túl hosszú.');
 if(kind==='section'&&(!title?.trim()||title.length>250))throw Error('A szakasz címét add meg.');
 const used=new Set();const visit=items=>items.forEach(item=>{used.add(item.id);if(Array.isArray(item.children))visit(item.children);});visit(existing);
 const id=()=>{let candidate;do{candidate='block:cs23-'+(globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`);}while(used.has(candidate));used.add(candidate);return candidate;};
 if(kind==='markdown')return {id:id(),type:'markdown',data:{text:text.trim()}};
 return {id:id(),type:'section',title:title.trim(),children:[{id:id(),type:'markdown',data:{text:text.trim()}}]};
}
