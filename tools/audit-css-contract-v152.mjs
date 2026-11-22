/** CSS-szabályok teljes statikus leltára mindkét kiadási ágban.
 * A ténylegesen betöltött stíluslapok sorrendjét és az @media feltételeket
 * megőrzi. A Bootstrap CDN és a böngésző számított stílusa nincs emulálva.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'reports/css-cascade-audit-v152.json');

function splitTop(value,separator){
 const result=[];let current='',quoted='',paren=0,square=0;
 for(let i=0;i<value.length;i++){
  const c=value[i];
  if(quoted){current+=c;if(c==='\\')current+=value[++i]||'';else if(c===quoted)quoted='';continue;}
  if(c==='"'||c==="'"){quoted=c;current+=c;continue;}
  if(c==='(')paren++;else if(c===')')paren--;else if(c==='[')square++;else if(c===']')square--;
  if(c===separator&&paren===0&&square===0){result.push(current.trim());current='';}
  else current+=c;
 }
 if(current.trim())result.push(current.trim());
 return result;
}
function parseCss(text,file,platform,sourceOrder){
 const result=[];let buffer='',quote='',paren=0,square=0,line=1,startLine=1;
 const stack=[];const stats={rules:0,declarations:0,parseErrors:[]};
 const append=c=>{if(!buffer.trim())startLine=line;buffer+=c;};
 const context=()=>stack.filter(x=>x.kind==='atrule').map(x=>x.name).join(' && ')||'all';
 const declarations=()=>{
  const rule=[...stack].reverse().find(x=>x.kind==='selector');
  if(!rule){buffer='';return;}
  const pair=buffer.trim();buffer='';if(!pair)return;
  const colon=pair.indexOf(':');if(colon<1){stats.parseErrors.push(`${file}:${line}: hibás CSS-deklaráció`);return;}
  const property=pair.slice(0,colon).trim().toLowerCase();
  const raw=pair.slice(colon+1).trim();const important=/!\s*important\s*$/i.test(raw);
  const value=raw.replace(/!\s*important\s*$/i,'').trim();
  if(!/^--[a-z0-9-]+$|^-?[a-z][a-z0-9-]*$/.test(property)){
   stats.parseErrors.push(`${file}:${startLine}: ismeretlen tulajdonság: ${property}`);return;
  }
  for(const selector of splitTop(rule.name,','))result.push({platform,file,line:startLine,
   order:sourceOrder,selector,context:context(),property,value,important});
  stats.declarations++;
 };
 for(let i=0;i<text.length;i++){
  const c=text[i],next=text[i+1];
  if(c==='\n')line++;
  if(quote){append(c);if(c==='\\'&&i+1<text.length){i++;append(text[i]);if(text[i]==='\n')line++;}else if(c===quote)quote='';continue;}
  if(c==='/'&&next==='*'){
   i+=2;while(i<text.length&&!(text[i]==='*'&&text[i+1]==='/')){if(text[i]==='\n')line++;i++;}i++;continue;
  }
  if(c==='"'||c==="'"){quote=c;append(c);continue;}
  if(c==='('){paren++;append(c);continue;}if(c===')'){paren--;append(c);continue;}
  if(c==='['){square++;append(c);continue;}if(c===']'){square--;append(c);continue;}
  if(paren>0||square>0){append(c);continue;}
  if(c==='{'){
   const prelude=buffer.trim();buffer='';
   if(!prelude){stats.parseErrors.push(`${file}:${line}: névtelen blokk`);continue;}
   const kind=prelude.startsWith('@')?'atrule':'selector';
   stack.push({kind,name:prelude});if(kind==='selector')stats.rules++;continue;
  }
  if(c===';'){
   if(stack.at(-1)?.kind==='selector')declarations();else buffer='';
   continue;
  }
  if(c==='}'){
   if(stack.at(-1)?.kind==='selector')declarations();else buffer='';
   if(!stack.length)stats.parseErrors.push(`${file}:${line}: fölösleges zárójel`);
   else stack.pop();continue;
  }
  append(c);
 }
 if(stack.length)stats.parseErrors.push(`${file}:${line}: ${stack.length} lezáratlan blokk`);
 return {declarations:result,stats};
}

const suspicious=new Set(['display','visibility','opacity','height','min-height','max-height',
 'width','min-width','max-width','position','top','right','bottom','left','margin','padding',
 'gap','row-gap','column-gap','align-items','justify-content','justify-items',
 'grid-template-columns','flex-direction','flex-wrap','overflow','overflow-x','overflow-y',
 'pointer-events','z-index','border','border-radius','background','clip-path']);
const platforms={};
for(const platform of ['mobile','desktop']){
 const styles=JSON.parse(fs.readFileSync(path.join(root,platform,'json/site-shell.json'),'utf8')).assets.stylesheets;
 const list=styles.filter(item=>!/^https?:|^\/\//.test(item.href)&&
   (platform==='mobile'? !/(?:desktop-hero-fold|desktop-hero-controls)/.test(item.href):
    !item.href.startsWith('mobile/')));
 const all=[];const files=[];let serial=0;
 for(const item of list){
  const name=item.href.split('?')[0];const file=path.join(root,platform,name);
  assert.ok(fs.existsSync(file),`${platform}: hiányzó stíluslap ${name}`);
  const {declarations,stats}=parseCss(fs.readFileSync(file,'utf8'),name,platform,serial++);
  const media=item.media&&item.media!=='all'?item.media:'all';
  for(const entry of declarations)if(media!=='all')entry.context=media+(entry.context==='all'?'':' && '+entry.context);
  all.push(...declarations);
  files.push({file:name,media,ruleCount:stats.rules,declarationCount:stats.declarations,
   selectorDeclarations:declarations.length,parseErrors:stats.parseErrors});
 }
 const lastByKey=new Map(),overrides=[];
 for(const [sequence,entry] of all.entries()){
  const key=[entry.selector,entry.context,entry.property].join('\x1f');
  const previous=lastByKey.get(key);
  if(previous&&previous.value!==entry.value&&(!previous.important||entry.important)){
   overrides.push({selector:entry.selector,property:entry.property,context:entry.context,
    from:{file:previous.file,line:previous.line,value:previous.value,important:previous.important},
    to:{file:entry.file,line:entry.line,value:entry.value,important:entry.important},
    kind:suspicious.has(entry.property)?'layout-sensitive':'other'});
  }
  if(!previous||!previous.important||entry.important)lastByKey.set(key,{...entry,sequence});
 }
 const counts={files:files.length,rules:files.reduce((a,x)=>a+x.ruleCount,0),
  declarations:files.reduce((a,x)=>a+x.declarationCount,0),
  selectorDeclarations:all.length,overrides:overrides.length,
  layoutOverrides:overrides.filter(x=>x.kind==='layout-sensitive').length,
  parseErrors:files.flatMap(x=>x.parseErrors).length};
 // A teljes, találatonkénti audit megmarad a gépi JSON-ban, nem kell
 // egy több ezer soros felsorolást pontatlanná rövidíteni.
 platforms[platform]={counts,files,overrides};
 console.log(`${platform}: ${counts.files} CSS, ${counts.rules} szabály, ${counts.declarations} deklaráció, `+
  `${counts.layoutOverrides} layout-felülírás, ${counts.parseErrors} parse-jelzés`);
}
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify({method:'CSS-fájlok szintaktikus statikus leltára; '+
 'azonos szelektor/tulajdonság/egyező média esetén a későbbi felülírás listázva. '+
 'Nem computed-style vizsgálat; külső Bootstrap CDN nincs feldolgozva.',platforms},null,2)+'\n');
console.log(`Készült: reports/css-cascade-audit-v152.json`);
